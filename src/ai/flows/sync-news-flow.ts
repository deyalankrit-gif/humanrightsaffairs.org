'use server';
/**
 * @fileOverview Resilient AI-powered news aggregation flow with automated translation.
 * 
 * - syncNews - Aggregates and automatically translates news from Indian RSS sources.
 * - Model: Gemini 1.5 Flash (Industrial Stable)
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

async function fetchSource(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); 
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function cleanText(text: string, limit = 1000): string {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().substring(0, limit);
}

const SyncNewsInputSchema = z.object({
  context: z.string()
});

const SyncNewsOutputSchema = z.object({
  news: z.array(z.any()),
  diagnostics: z.object({
    sourcesAttempted: z.number(),
    sourcesSuccessful: z.number(),
    totalRawItems: z.number(),
    translationCount: z.number(),
    errorSummary: z.string().optional()
  })
});

export type SyncNewsOutput = z.infer<typeof SyncNewsOutputSchema>;

export async function syncNews(input: { context: string }): Promise<SyncNewsOutput> {
  try {
    const result = await syncNewsFlow(input);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("[NEWS-SYNC] Engine Failure:", error);
    return { 
      news: [], 
      diagnostics: { sourcesAttempted: RSS_SOURCES.length, sourcesSuccessful: 0, totalRawItems: 0, translationCount: 0, errorSummary: String(error) } 
    };
  }
}

const syncNewsPrompt = ai.definePrompt({
  name: 'syncNewsPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: z.object({ context: z.string(), rawItems: z.array(z.any()) }) },
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
  system: `You are an elite news aggregator for Human Rights Affairs Trust. Identify top 3 Human Rights or Legal news items in English.`,
  prompt: `Intelligence Feed:
{{#each rawItems}}
- [{{{this.source}}}] {{{this.title}}} ({{{this.link}}})
{{/each}}`,
});

const syncNewsFlow = ai.defineFlow(
  {
    name: 'syncNewsFlow',
    inputSchema: SyncNewsInputSchema,
    outputSchema: SyncNewsOutputSchema,
  },
  async (input) => {
    let rawItems: any[] = [];
    let successfulCount = 0;

    for (const source of RSS_SOURCES) {
      try {
        const response = await fetchSource(source.url);
        const xml = await response.text();
        const data = await parser.parseString(xml);
        rawItems = rawItems.concat(data.items.map(i => ({
          title: cleanText(i.title || '', 200),
          link: i.link || '',
          source: source.name,
          content: cleanText(i.contentSnippet || i.content || '', 800)
        })));
        successfulCount++;
      } catch (err) {
        console.warn(`[NEWS-SYNC] Source ${source.name} failed`);
      }
    }

    if (rawItems.length === 0) {
      return { news: [], diagnostics: { sourcesAttempted: RSS_SOURCES.length, sourcesSuccessful: 0, totalRawItems: 0, translationCount: 0 } };
    }

    const { output } = await syncNewsPrompt({ context: input.context, rawItems: rawItems.slice(0, 20) });
    const englishNews = output?.news || [];

    const translatedNews = [];
    for (const item of englishNews) {
      try {
        const translation = await translateNews({
          title: item.title,
          content: item.content,
          category: item.category || 'General'
        });

        translatedNews.push({
          ...item,
          originalEnglish: { title: item.title, content: item.content, category: item.category || 'General' },
          bengaliTranslation: translation,
          translationStatus: translation.title !== item.title ? "Success" : "Failed",
          scope: item.scope.includes('Bengal') ? "West Bengal" : item.scope.includes('India') ? "India" : "World",
          scopePriority: item.scope.includes('Bengal') ? 1 : item.scope.includes('India') ? 2 : 3
        });
      } catch (e) {
        translatedNews.push({
          ...item,
          originalEnglish: { title: item.title, content: item.content, category: item.category || 'General' },
          bengaliTranslation: { title: item.title, content: item.content, category: item.category || 'General' },
          translationStatus: "Failed",
          scope: "India",
          scopePriority: 2
        });
      }
    }

    return {
      news: translatedNews,
      diagnostics: {
        sourcesAttempted: RSS_SOURCES.length,
        sourcesSuccessful: successfulCount,
        totalRawItems: rawItems.length,
        translationCount: translatedNews.filter(n => n.translationStatus === "Success").length
      }
    };
  }
);
