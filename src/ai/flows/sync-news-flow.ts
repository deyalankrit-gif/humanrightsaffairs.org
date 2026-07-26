
'use server';
/**
 * @fileOverview Resilient AI-powered news aggregation flow with automated translation.
 * 
 * - syncNews - Aggregates and automatically translates news from Indian RSS sources.
 * - Features: Sequential translation processing to avoid rate limits, automated fallback.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import Parser from 'rss-parser';
import { translateNews } from './translate-news-flow';

const parser = new Parser({
  customFields: {
    item: [['media:content', 'media'], ['content:encoded', 'contentEncoded']],
  }
});

const RSS_SOURCES = [
  { name: 'Google News India', url: 'https://news.google.com/rss/headlines/section/topic/NATION?hl=en-IN&gl=IN&ceid=IN:en' },
  { name: 'Reuters India', url: 'https://news.google.com/rss/search?q=reuters+india&hl=en-IN&gl=IN&ceid=IN:en' },
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss' },
  { name: 'Indian Express', url: 'https://indianexpress.com/section/india/feed/' }
];

async function fetchSource(url: string): Promise<Response> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); 
  try {
    const response = await fetch(url, { headers, signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function cleanText(text: string, limit = 1000): string {
  if (!text) return '';
  const cleaned = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  return cleaned.length > limit ? cleaned.substring(0, limit) + '...' : cleaned;
}

const SyncNewsInputSchema = z.object({
  context: z.string().describe("Context for the news sync.")
});

const SyncNewsOutputSchema = z.object({
  news: z.array(z.object({
    originalEnglish: z.object({
      title: z.string(),
      content: z.string(),
      category: z.string(),
    }),
    bengaliTranslation: z.object({
      title: z.string(),
      content: z.string(),
      category: z.string(),
    }),
    translationStatus: z.enum(["Success", "Failed", "Pending"]),
    source: z.string(),
    url: z.string(),
    publishedAt: z.string().optional().nullable(),
    author: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    scope: z.enum(["West Bengal", "India", "World"]),
    scopePriority: z.number(),
  })),
  diagnostics: z.object({
    sourcesAttempted: z.number(),
    sourcesSuccessful: z.number(),
    totalRawItems: z.number(),
    translationCount: z.number(),
    errorSummary: z.string().optional()
  })
});

export type SyncNewsOutput = z.infer<typeof SyncNewsOutputSchema>;

/**
 * syncNews - Robust Server Action wrapper with integrated translation.
 */
export async function syncNews(input: { context: string }): Promise<SyncNewsOutput> {
  try {
    const result = await syncNewsFlow(input);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Critical News Sync Engine Failure:", error);
    return { 
      news: [], 
      diagnostics: { 
        sourcesAttempted: RSS_SOURCES.length, 
        sourcesSuccessful: 0, 
        totalRawItems: 0, 
        translationCount: 0,
        errorSummary: String(error) 
      } 
    };
  }
}

const syncNewsPrompt = ai.definePrompt({
  name: 'syncNewsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { 
    schema: z.object({
      context: z.string(),
      rawItems: z.array(z.any())
    }) 
  },
  output: { 
    schema: z.object({
      news: z.array(z.object({
        title: z.string(),
        content: z.string(),
        source: z.string(),
        url: z.string(),
        publishedAt: z.string().optional().nullable(),
        author: z.string().optional().nullable(),
        category: z.string().optional().nullable(),
        imageUrl: z.string().optional().nullable(),
        scope: z.enum(["West Bengal", "India", "World"]),
        scopePriority: z.number(),
      }))
    }) 
  },
  system: `You are an elite news aggregator for Human Rights Affairs Trust.
Your task is to identify, summarize, and deduplicate high-impact news items in English.

PRIMARY OBJECTIVE:
Find Human Rights, Legal, or Constitutional news.

PRIORITY HIERARCHY:
1. West Bengal (Top Priority)
2. India (Second Priority)
3. World (Third Priority)

CONSTRAINTS:
- CONTENT: Concise summary, maximum 8 lines.
- SCOPE: Accurate classification.`,
  prompt: `Current Context: {{{context}}}. 
  
Intelligence Feed from Multi-Source RSS Harvest:
{{#each rawItems}}
- [{{{this.source}}}] {{{this.title}}}
  Link: {{{this.link}}}
  Summary: {{{this.content}}}
{{/each}}

Please aggregate the top 8 most relevant news items in English.`,
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
          pubDate: i.pubDate || '',
          author: i.creator || i.author || null,
          content: cleanText(i.contentSnippet || i.content || '', 1000),
          source: source.name,
          imageUrl: (i as any).media?.$?.url || null
        })));
        successfulCount++;
      } catch (err) {}
    }

    if (rawItems.length === 0) {
      return { news: [], diagnostics: { sourcesAttempted: RSS_SOURCES.length, sourcesSuccessful: 0, totalRawItems: 0, translationCount: 0 } };
    }

    // Step 1: AI Selection in English
    const { output } = await syncNewsPrompt({ context: input.context, rawItems: rawItems.slice(0, 30) });
    const englishNews = output?.news || [];

    // Step 2: Sequential Translation to prevent rate limiting
    console.log(`[SYNC-FLOW] Selection complete. Starting sequential translation for ${englishNews.length} articles.`);
    const translatedNews = [];
    
    for (const item of englishNews) {
      try {
        // Call the translation wrapper with its built-in retry logic
        const translation = await translateNews({
          title: item.title,
          content: item.content,
          category: item.category || 'General'
        });

        translatedNews.push({
          ...item,
          originalEnglish: {
            title: item.title,
            content: item.content,
            category: item.category || 'General'
          },
          bengaliTranslation: translation,
          translationStatus: (translation.title !== item.title) ? "Success" as const : "Failed" as const
        });
      } catch (e) {
        console.error(`[SYNC-FLOW] Translation error for item: ${item.title.substring(0, 30)}`, e);
        translatedNews.push({
          ...item,
          originalEnglish: { title: item.title, content: item.content, category: item.category || 'General' },
          bengaliTranslation: { title: item.title, content: item.content, category: item.category || 'General' },
          translationStatus: "Failed" as const
        });
      }
      
      // Small pause to help with rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return {
      news: translatedNews as any,
      diagnostics: {
        sourcesAttempted: RSS_SOURCES.length,
        sourcesSuccessful: successfulCount,
        totalRawItems: rawItems.length,
        translationCount: translatedNews.length
      }
    };
  }
);
