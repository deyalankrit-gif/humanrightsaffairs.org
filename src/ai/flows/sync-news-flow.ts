'use server';
/**
 * @fileOverview AI-powered news synchronization flow focused on national trends.
 *
 * - syncNews - A function that fetches and categorizes human rights news, prioritizing India's trends.
 * - SyncNewsInput - The input type for the syncNews function.
 * - SyncNewsOutput - The return type for the syncNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SyncNewsInputSchema = z.object({
  context: z.string().describe("Context for the news sync, e.g. current date/time or specific focus area.")
});
export type SyncNewsInput = z.infer<typeof SyncNewsInputSchema>;

const SyncNewsOutputSchema = z.object({
  news: z.array(z.object({
    title: z.string().describe("Headline for the news."),
    content: z.string().describe("Narrative limited to 10 lines."),
    scope: z.enum(["West Bengal", "India", "World"]),
    scopePriority: z.number().describe("1: India (Trending), 2: West Bengal, 3: World"),
  }))
});
export type SyncNewsOutput = z.infer<typeof SyncNewsOutputSchema>;

export async function syncNews(input: SyncNewsInput): Promise<SyncNewsOutput> {
  return syncNewsFlow(input);
}

const syncNewsPrompt = ai.definePrompt({
  name: 'syncNewsPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: SyncNewsInputSchema },
  output: { schema: SyncNewsOutputSchema },
  system: `You are an expert news aggregator for the Human Rights Affairs Trust.
Your task is to identify 3 distinct news items relevant to human rights, social justice, and constitutional literacy.

STRICT FOCUS:
Identify the #1 MOST TRENDING human rights news item in India. This is the absolute priority for our national audience.

Priority Order:
1. The most trending human rights or social justice news from broader India (Top Priority).
2. Significant news from West Bengal.
3. Important Global/World human rights context.

Constraint:
Each news content MUST be exactly within 10 lines for front-end clarity.
Return news sorted by scope priority (India Trending: 1, WB: 2, World: 3).`,
  prompt: `Current Sync Context: {{{context}}}. Please aggregate the latest national trends and regional intelligence.`,
});

const syncNewsFlow = ai.defineFlow(
  {
    name: 'syncNewsFlow',
    inputSchema: SyncNewsInputSchema,
    outputSchema: SyncNewsOutputSchema,
  },
  async (input) => {
    const { output } = await syncNewsPrompt(input);
    return output!;
  }
);
