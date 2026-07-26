'use server';
/**
 * @fileOverview Hardened News Sync Pipeline with AI-failure resilience.
 * - Extracts top 3 stories.
 * - If AI Analysis fails, it serves a raw English feed to prevent UI blackout.
 * - Logs detailed diagnostics for infrastructure audit.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import Parser from 'rss-parser';
import { translateNews } from './translate-news-flow';
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
  model: googleAI.model('gemini-1.5-flash'),
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
  system: `Analyze the intelligence feed. Select the TOP 3 human rights or legal stories for India Chapter. Return a structured JSON list.`,
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
    
    // 1. Fetch raw news (Always works regardless of AI status)
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
      return { news: [], diagnostics: { status: "Network Failure", yield: 0, errorSummary: "No RSS items could be fetched." } };
    }

    // 2. AI Extraction (With fallback to raw items if AI fails)
    let processedStories = [];
    let aiStatus = "Success";
    let errorMsg = "";

    try {
      const { output } = await syncNewsPrompt({ rawItems: rawItems.slice(0, 20) });
      processedStories = output?.news || [];
      if (processedStories.length === 0) throw new Error("AI returned zero-length yield.");
    } catch (e: any) {
      console.warn("[NEWS-SYNC-AI] Model failed. Engaging Raw Fallback Mode.", e.message);
      aiStatus = "AI Offline (Fallback Active)";
      errorMsg = e.message;
      // Fallback: Pick first 3 raw items
      processedStories = rawItems.slice(0, 3).map(r => ({
        title: r.title,
        content: r.content,
        source: r.source,
        url: r.link,
        scope: "India",
        category: "General"
      }));
    }

    // 3. Sequential Translation (Resilient)
    const finalizedNews = [];
    for (const item of processedStories) {
      const translation = await translateNews({
        title: item.title,
        content: item.content,
        category: item.category || 'Human Rights'
      });

      finalizedNews.push({
        ...item,
        originalEnglish: { title: item.title, content: item.content, category: item.category || 'General' },
        bengaliTranslation: translation,
        translationStatus: translation.title !== item.title ? "Success" : "Fallback (EN)",
        scope: item.scope || "India",
        scopePriority: (item.scope || '').includes('Bengal') ? 1 : 2
      });
    }

    return {
      news: finalizedNews,
      diagnostics: {
        status: aiStatus,
        model: "gemini-1.5-flash",
        yield: finalizedNews.length,
        errorSummary: errorMsg
      }
    };
  }
);
