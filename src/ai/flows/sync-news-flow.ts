'use server';
/**
 * @fileOverview Resilient AI-powered news aggregation flow with tactical diagnostics.
 * 
 * - syncNews - Aggregates high-impact news with multi-source failover and retry logic.
 * - Features: Exponential backoff, Source-level logging, AI Rejection Intelligence.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [['media:content', 'media'], ['content:encoded', 'contentEncoded']],
  }
});

const RSS_SOURCES = [
  { name: 'Google News India', url: 'https://news.google.com/rss/headlines/section/topic/NATION?hl=en-IN&gl=IN&ceid=IN:en' },
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss' },
  { name: 'Indian Express', url: 'https://indianexpress.com/section/india/feed/' },
  { name: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms' }
];

/**
 * Enhanced fetcher with browser-mimicry and retry logic.
 */
async function fetchWithRetry(url: string, retries = 2, backoff = 1000): Promise<Response> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const response = await fetch(url, { headers, signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);
      if (response.ok) return response;
      if (response.status === 403 || response.status === 429) {
         console.warn(`Source throttled/forbidden (HTTP ${response.status}). Retrying...`);
      }
    } catch (err: any) {
      if (i === retries) throw err;
    }
    await new Promise(r => setTimeout(r, backoff * Math.pow(2, i)));
  }
  throw new Error("Maximum retries reached");
}

function cleanText(text: string, limit = 400): string {
  if (!text) return '';
  const cleaned = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  return cleaned.length > limit ? cleaned.substring(0, limit) + '...' : cleaned;
}

const SyncNewsInputSchema = z.object({
  context: z.string().describe("Context for the news sync.")
});

const SyncNewsOutputSchema = z.object({
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
  })),
  diagnostics: z.object({
    sourcesAttempted: z.number(),
    sourcesSuccessful: z.number(),
    totalRawItems: z.number(),
    rejectionLog: z.array(z.string()).optional().describe("AI's reasoning for discarded articles."),
    errorSummary: z.string().optional()
  })
});

export type SyncNewsOutput = z.infer<typeof SyncNewsOutputSchema>;

export async function syncNews(input: { context: string }): Promise<SyncNewsOutput> {
  try {
    return await syncNewsFlow(input);
  } catch (error) {
    console.error("Critical System Crash (syncNews):", error);
    return { 
      news: [], 
      diagnostics: { 
        sourcesAttempted: RSS_SOURCES.length, 
        sourcesSuccessful: 0, 
        totalRawItems: 0, 
        errorSummary: String(error) 
      } 
    };
  }
}

const syncNewsPrompt = ai.definePrompt({
  name: 'syncNewsPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { 
    schema: z.object({
      context: z.string(),
      rawItems: z.array(z.any())
    }) 
  },
  output: { schema: SyncNewsOutputSchema },
  system: `You are an elite news aggregator for Human Rights Affairs Trust.
Your task is to identify and summarize high-impact human rights, legal, or significant social news items from the provided raw data.

PRIORITY HIERARCHY:
1. West Bengal (Top Priority)
2. India (Second Priority)
3. World (Third Priority)

CONSTRAINTS:
- CONTENT: Concise summary, maximum 10 lines.
- SCOPE: Accurate classification as West Bengal, India, or World.
- IMAGERY: Preserve absolute imageUrl if present.
- REJECTION LOG: If you discard items that are relevant to the general topic but fail quality checks (duplicates, low impact, or commercial), list them in diagnostics.rejectionLog with a specific reason.`,
  prompt: `Current Context: {{{context}}}. 
  
Raw Intelligence from Multi-Source RSS Harvest:
{{#each rawItems}}
- [{{{this.source}}}] {{{this.title}}}
  Link: {{{this.link}}}
  Summary: {{{this.content}}}
{{/each}}

Please aggregate the most relevant news. If no news is suitable, return an empty news array and explain why in diagnostics.errorSummary.`,
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
    let errorLog = "";

    for (const source of RSS_SOURCES) {
      try {
        const response = await fetchWithRetry(source.url);
        const xml = await response.text();
        const data = await parser.parseString(xml);
        
        const sourceItems = data.items.map(i => ({
          title: cleanText(i.title || '', 200),
          link: i.link || '',
          pubDate: i.pubDate || '',
          author: i.creator || i.author || null,
          content: cleanText(i.contentSnippet || i.content || '', 400),
          source: source.name,
          imageUrl: (i as any).media?.$?.url || null
        }));

        rawItems = rawItems.concat(sourceItems);
        successfulCount++;
        console.log(`Source [${source.name}]: Fetched ${sourceItems.length} articles successfully.`);
      } catch (err: any) {
        const msg = `Source [${source.name}] failed: ${err.message}`;
        console.warn(msg);
        errorLog += msg + "; ";
      }
    }

    if (rawItems.length === 0) {
      return { 
        news: [], 
        diagnostics: { 
          sourcesAttempted: RSS_SOURCES.length, 
          sourcesSuccessful: successfulCount, 
          totalRawItems: 0, 
          errorSummary: `Harvester returned 0 items. Possible network block or dead feeds. Logs: ${errorLog}` 
        } 
      };
    }

    const { output } = await syncNewsPrompt({
      context: input.context,
      rawItems: rawItems.slice(0, 40)
    });

    if (!output) {
       throw new Error("AI extraction yielded null response.");
    }

    // Ensure diagnostics are populated correctly if AI missed them
    output.diagnostics = {
      ...output.diagnostics,
      sourcesAttempted: RSS_SOURCES.length,
      sourcesSuccessful: successfulCount,
      totalRawItems: rawItems.length,
      errorSummary: output.diagnostics.errorSummary || (successfulCount < RSS_SOURCES.length ? `Partial success: ${errorLog}` : 'Full harvest complete.')
    };

    return output;
  }
);
