'use server';
/**
 * @fileOverview Hardened News Sync Pipeline with sequential translation.
 * Optimized for industrial reliability using Gemini 2.5 Flash.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import Parser from 'rss-parser';
import { translateNews, hasBengali } from './translate-news-flow';
import { googleAI } from '@genkit-ai/google-genai';

const parser = new Parser();
const RSS_SOURCES = [
  { name: 'Google News India', url: 'https://news.google.com/rss/headlines/section/topic/NATION?hl=en-IN&gl=IN&ceid=IN:en' },
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss' },
  { name: 'NDTV India', url: 'https://feeds.feedburner.com/ndtvnews-india-news' }
];

const SyncNewsOutputSchema = z.object({
  news: z.array(z.any()),
  diagnostics: z.object({
    status: z.string(),
    model: z.string().optional(),
    yield: z.number(),
    errorSummary: z.string().optional()
  })
});

export type SyncNewsOutput = z.infer<typeof SyncNewsOutputSchema>;

export async function syncNews(input: { context: string }): Promise<SyncNewsOutput> {
  try {
    const result = await syncNewsFlow(input);
    return JSON.parse(JSON.stringify(result));
  } catch (error: any) {
    console.error("[NEWS-SYNC-CRITICAL] Global flow failure:", error);
    return { 
      news: [], 
      diagnostics: { 
        status: "Critical Failure", 
        yield: 0, 
        errorSummary: error.message 
      } 
    };
  }
}

const syncNewsPrompt = ai.definePrompt({
  name: 'syncNewsPrompt',
  model: googleAI.model('gemini-2.5-flash'),
  input: { schema: z.object({ rawItems: z.array(z.any()) }) },
  output: { 
    schema: z.object({
      news: z.array(z.object({
        title: z.string(),
        content: z.string(),
        source: z.string(),
        url: z.string(),
        scope: z.string(),
        category: z.string().optional()
      }))
    }) 
  },
  system: `Analyze the news feed. Select exactly 3 stories focusing on human rights, legal changes (BNS/BNSS), or public welfare in India.`,
  prompt: `Feed:\n{{#each rawItems}}\n- [{{{this.source}}}] {{{this.title}}} ({{{this.link}}})\n{{/each}}`,
});

const syncNewsFlow = ai.defineFlow(
  {
    name: 'syncNewsFlow',
    inputSchema: z.object({ context: z.string() }),
    outputSchema: SyncNewsOutputSchema,
  },
  async (input) => {
    let rawItems: any[] = [];
    
    // 1. Fetch raw news from high-fidelity sources
    for (const source of RSS_SOURCES) {
      try {
        const response = await fetch(source.url, { next: { revalidate: 0 } });
        const xml = await response.text();
        const data = await parser.parseString(xml);
        rawItems = rawItems.concat(data.items.map(i => ({
          title: (i.title || '').substring(0, 300),
          link: i.link || '',
          source: source.name,
          content: (i.contentSnippet || i.content || '').substring(0, 800)
        })));
      } catch (err) {
        console.warn(`[NEWS-SYNC] Source ${source.name} unreachable.`);
      }
    }

    if (rawItems.length === 0) {
      return { 
        news: [], 
        diagnostics: { 
          status: "Network Failure", 
          yield: 0, 
          errorSummary: "No RSS items could be fetched from primary sources." 
        } 
      };
    }

    // 2. AI Story Extraction & Filtering
    let processedStories = [];
    let aiStatus = "Success";
    let errorMsg = "";

    try {
      const { output } = await syncNewsPrompt({ rawItems: rawItems.slice(0, 15) });
      processedStories = output?.news || [];
    } catch (e: any) {
      console.warn("[NEWS-SYNC-AI] Extraction failed. Using fallback.", e.message);
      aiStatus = "AI Fallback";
      errorMsg = e.message;
      processedStories = rawItems.slice(0, 3).map(r => ({
        title: r.title,
        content: r.content,
        source: r.source,
        url: r.link,
        scope: "India",
        category: "General"
      }));
    }

    // 3. Sequential Translation (Prevents Rate-Limit Crashes)
    const finalizedNews = [];
    for (const item of processedStories) {
      const translation = await translateNews({
        title: item.title,
        content: item.content,
        category: item.category || 'Human Rights'
      });

      // Await the hasBengali check as it is now an async Server Action
      const isSuccess = (await hasBengali(translation.title)) || (await hasBengali(translation.content));

      finalizedNews.push({
        ...item,
        originalEnglish: { 
          title: item.title, 
          content: item.content, 
          category: item.category || 'General' 
        },
        bengaliTranslation: translation,
        translationStatus: isSuccess ? "Success" : "Failed",
        scope: item.scope || "India",
        scopePriority: (item.scope || '').includes('Bengal') ? 1 : 2
      });
    }

    return {
      news: finalizedNews,
      diagnostics: {
        status: aiStatus,
        model: "gemini-2.5-flash",
        yield: finalizedNews.length,
        errorSummary: errorMsg
      }
    };
  }
);
