'use server';
/**
 * @fileOverview AI-powered news aggregation flow with RSS harvester.
 * 
 * - syncNews - Aggregates the most important news with priority: West Bengal > India > World.
 * - Features: RSS fallback, Deduplication, Multi-Source Resilience.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [['media:content', 'media'], ['content:encoded', 'contentEncoded']],
  }
});

const RSS_FEEDS = [
  { name: 'Google News India', url: 'https://news.google.com/rss/search?q=human+rights+india+west+bengal&hl=en-IN&gl=IN&ceid=IN:en' },
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss' },
  { name: 'Indian Express', url: 'https://indianexpress.com/section/india/feed/' },
  { name: 'Reuters India', url: 'https://news.google.com/rss/search?q=source:Reuters+India+human+rights&hl=en-IN&gl=IN&ceid=IN:en' }
];

async function getRawNewsData() {
  let items: any[] = [];
  for (const feed of RSS_FEEDS) {
    try {
      // Use standard fetch with a 10s timeout to prevent server action hang
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(feed.url, { 
        next: { revalidate: 3600 },
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const xml = await response.text();
      const data = await parser.parseString(xml);
      
      items = items.concat(data.items.map(i => ({
        title: i.title,
        link: i.link,
        pubDate: i.pubDate,
        author: i.creator || i.author || null,
        content: i.contentSnippet || i.content || '',
        source: feed.name,
        imageUrl: (i as any).media?.$?.url || null
      })));
    } catch (err) {
      console.warn(`RSS Harvest failed for ${feed.name}:`, err);
    }
  }
  return items;
}

const SyncNewsInputSchema = z.object({
  context: z.string().describe("Context for the news sync, e.g. current date/time.")
});
export type SyncNewsInput = z.infer<typeof SyncNewsInputSchema>;

const SyncNewsOutputSchema = z.object({
  news: z.array(z.object({
    title: z.string().describe("Impactful headline."),
    content: z.string().describe("Concise summary, maximum 10 lines."),
    source: z.string().describe("Name of the news publisher."),
    url: z.string().describe("Direct URL to the original article."),
    publishedAt: z.string().describe("Publication date and time."),
    author: z.string().optional().nullable().describe("Author name if identified."),
    category: z.string().describe("Category: Legal, Human Rights, Social, etc."),
    imageUrl: z.string().optional().nullable().describe("Relevant image URL."),
    scope: z.enum(["West Bengal", "India", "World"]),
    scopePriority: z.number().describe("1: West Bengal, 2: India, 3: World"),
  }))
});
export type SyncNewsOutput = z.infer<typeof SyncNewsOutputSchema>;

/**
 * syncNews - Robust Server Action wrapper for news aggregation.
 * Prevents "Unexpected Response" by catching all top-level errors.
 */
export async function syncNews(input: SyncNewsInput): Promise<SyncNewsOutput> {
  try {
    return await syncNewsFlow(input);
  } catch (error) {
    console.error("Server Action Crash (syncNews):", error);
    return { news: [] };
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
Your task is to identify and summarize exactly 3 distinct, high-impact news items from the provided raw data.

PRIORITY HIERARCHY:
1. West Bengal (Top Priority)
2. India (Second Priority)
3. World (Third Priority)

CONSTRAINTS:
- CONTENT: Must be a Concise summary, maximum 10 lines.
- SORT: Sort exactly by scopePriority (1, 2, 3).
- IMAGERY: Preserve imageUrl if present, else null.
- FORMAT: publishedAt should be readable like 'Feb 24, 2025, 10:30 AM'.`,
  prompt: `Current Context: {{{context}}}. 
  
Raw Intelligence from RSS Harvest:
{{#each rawItems}}
- [{{{this.source}}}] {{{this.title}}}
  Link: {{{this.link}}}
  Summary: {{{this.content}}}
{{/each}}

Please aggregate and summarize according to the hierarchy.`,
});

const syncNewsFlow = ai.defineFlow(
  {
    name: 'syncNewsFlow',
    inputSchema: SyncNewsInputSchema,
    outputSchema: SyncNewsOutputSchema,
  },
  async (input) => {
    try {
      const rawItems = await getRawNewsData();
      
      // AI processing of harvested intelligence (sliced for token efficiency)
      const { output } = await syncNewsPrompt({
        context: input.context,
        rawItems: rawItems.slice(0, 20)
      });

      if (!output) {
        return { news: [] };
      }
      return output;
    } catch (error) {
      console.error("AI Flow Execution Error (syncNewsFlow):", error);
      return { news: [] };
    }
  }
);