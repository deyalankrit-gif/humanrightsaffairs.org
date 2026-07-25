
'use server';
/**
 * @fileOverview AI-powered news synchronization flow.
 *
 * - syncNews - A function that fetches and categorizes human rights news.
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
    scopePriority: z.number().describe("1: WB, 2: India, 3: World"),
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

Strict Prioritization:
1. One item MUST be from West Bengal (Top Priority).
2. One item MUST be from broader India.
3. One item MUST be from Global/World context.

Constraint:
Each news content MUST be exactly within 10 lines for front-end clarity.
Return news sorted by scope priority (WB: 1, India: 2, World: 3).`,
  prompt: `Current Sync Context: {{{context}}}. Please aggregate the latest intelligence.`,
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
