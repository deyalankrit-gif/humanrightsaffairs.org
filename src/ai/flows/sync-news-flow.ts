'use server';
/**
 * @fileOverview AI-powered news aggregation flow.
 * 
 * - syncNews - Aggregates the most important news with priority: West Bengal > India > World.
 * - Monitored Sources: Google News India, Reuters India, The Hindu, The Indian Express.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    scope: z.enum(["West Bengal", "India", "World"]),
    scopePriority: z.number().describe("1: West Bengal, 2: India, 3: World"),
  }))
});
export type SyncNewsOutput = z.infer<typeof SyncNewsOutputSchema>;

export async function syncNews(input: SyncNewsInput): Promise<SyncNewsOutput> {
  return syncNewsFlow(input);
}

const syncNewsPrompt = ai.definePrompt({
  name: 'syncNewsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SyncNewsInputSchema },
  output: { schema: SyncNewsOutputSchema },
  system: `You are an elite news aggregator for a Human Rights Organization.
Your task is to identify exactly 3 distinct, high-impact news items (one per scope where possible).

PRIORITY HIERARCHY:
1. West Bengal (Top Priority)
2. India
3. World

SOURCES (Strictly use only these):
1. Google News India
2. Reuters India
3. The Hindu
4. The Indian Express

CONSTRAINTS:
- Content MUST be within 10 lines.
- Summaries must be factual and objective.
- Remove duplicate stories across sources.
- Each item must have a valid source name and URL.
- PublishedAt should be in a friendly readable format (e.g., Feb 24, 2025, 10:30 AM).

Sorting: Sort by scopePriority (1, 2, 3).`,
  prompt: `Current Context: {{{context}}}. Please aggregate the latest intelligence from the approved sources.`,
});

const syncNewsFlow = ai.defineFlow(
  {
    name: 'syncNewsFlow',
    inputSchema: SyncNewsInputSchema,
    outputSchema: SyncNewsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await syncNewsPrompt(input);
      if (!output) {
        return { news: [] };
      }
      return output;
    } catch (error) {
      console.error("AI News Sync Error:", error);
      return { news: [] };
    }
  }
);
