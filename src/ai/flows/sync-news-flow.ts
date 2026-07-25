'use server';
/**
 * @fileOverview Resilient AI-powered news aggregation flow with rule-based fallback.
 * 
 * - syncNews - Aggregates news from Google News, Reuters, The Hindu, and Indian Express.
 * - Features: gemini-1.5-flash model, rule-based fallback, timeout management.
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
  { name: 'Reuters India', url: 'https://news.google.com/rss/search?q=reuters+india&hl=en-IN&gl=IN&ceid=IN:en' },
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss' },
  { name: 'Indian Express', url: 'https://indianexpress.com/section/india/feed/' }
];

/**
 * Enhanced fetcher with browser-mimicry.
 */
async function fetchSource(url: string): Promise<Response> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    'Cache-Control': 'no-cache'
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); 
  
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

/**
 * syncNews - Robust Server Action wrapper.
 */
export async function syncNews(input: { context: string }): Promise<SyncNewsOutput> {
  try {
    const result = await syncNewsFlow(input);
    return JSON.parse(JSON.stringify(result));
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
  model: 'googleai/gemini-1.5-flash',
  input: { 
    schema: z.object({
      context: z.string(),
      rawItems: z.array(z.any())
    }) 
  },
  output: { schema: SyncNewsOutputSchema },
  system: `You are an elite news aggregator for Human Rights Affairs Trust.
Your task is to identify, summarize, and deduplicate high-impact news items.

PRIMARY OBJECTIVE:
Find Human Rights, Legal, or Constitutional news.

MANDATORY FALLBACK:
If no explicit human rights news is found, you MUST still aggregate the most important national or local news available. The feed must NEVER be empty.

PRIORITY HIERARCHY:
1. West Bengal (Top Priority)
2. India (Second Priority)
3. World (Third Priority)

CONSTRAINTS:
- CONTENT: Concise summary, maximum 10 lines.
- SCOPE: Accurate classification as West Bengal, India, or World.`,
  prompt: `Current Context: {{{context}}}. 
  
Raw Intelligence from Multi-Source RSS Harvest:
{{#each rawItems}}
- [{{{this.source}}}] {{{this.title}}}
  Link: {{{this.link}}}
  Summary: {{{this.content}}}
{{/each}}

Please aggregate the most relevant news. Return up to 10 items.`,
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
        const response = await fetchSource(source.url);
        const xml = await response.text();
        const data = await parser.parseString(xml);
        
        const sourceItems = data.items.map(i => ({
          title: cleanText(i.title || '', 200),
          link: i.link || '',
          pubDate: i.pubDate || '',
          author: i.creator || i.author || null,
          content: cleanText(i.contentSnippet || i.content || '', 1000),
          source: source.name,
          imageUrl: (i as any).media?.$?.url || null
        }));

        rawItems = rawItems.concat(sourceItems);
        successfulCount++;
      } catch (err: any) {
        errorLog += `Source [${source.name}] failed: ${err.message}; `;
      }
    }

    const initialDiagnostics = {
      sourcesAttempted: RSS_SOURCES.length,
      sourcesSuccessful: successfulCount,
      totalRawItems: rawItems.length,
      errorSummary: successfulCount < RSS_SOURCES.length ? `Partial success: ${errorLog}` : 'Full harvest complete.'
    };

    if (rawItems.length === 0) {
      return { news: [], diagnostics: initialDiagnostics };
    }

    try {
      const { output } = await syncNewsPrompt({
        context: input.context,
        rawItems: rawItems.slice(0, 20)
      });

      if (!output) throw new Error("AI returned null response.");
      
      return {
        ...output,
        diagnostics: { ...output.diagnostics, ...initialDiagnostics }
      };
    } catch (aiError: any) {
      console.warn("AI extraction failed, entering rule-based fallback:", aiError);
      
      // Rule-based Fallback Scoring System
      const fallbackNews = rawItems.slice(0, 10).map(item => {
        const text = (item.title + " " + item.content).toLowerCase();
        let scope: "West Bengal" | "India" | "World" = "India";
        let priority = 2;

        if (text.includes("bengal") || text.includes("kolkata") || text.includes("mamata") || text.includes("howrah")) {
          scope = "West Bengal";
          priority = 1;
        } else if (text.includes("world") || text.includes("global") || text.includes("un ") || text.includes("international")) {
          scope = "World";
          priority = 3;
        }

        return {
          title: item.title,
          content: item.content.substring(0, 300) + "...",
          source: item.source,
          url: item.link,
          publishedAt: item.pubDate,
          author: item.author,
          category: "General Intelligence",
          imageUrl: item.imageUrl,
          scope,
          scopePriority: priority
        };
      });

      return {
        news: fallbackNews,
        diagnostics: {
          ...initialDiagnostics,
          errorSummary: `AI Failure: ${aiError.message}. Triggered rule-based fallback.`
        }
      };
    }
  }
);
