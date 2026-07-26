'use server';
/**
 * @fileOverview High-fidelity news translation agent.
 * Model: Gemini 1.5 Flash (Industrial Stable)
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const TranslateNewsInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.string()
});
export type TranslateNewsInput = z.infer<typeof TranslateNewsInputSchema>;

const TranslateNewsOutputSchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.string(),
});
export type TranslateNewsOutput = z.infer<typeof TranslateNewsOutputSchema>;

export async function translateNews(input: TranslateNewsInput, attempt = 1): Promise<TranslateNewsOutput> {
  try {
    const result = await translateNewsFlow(input);
    if (!result || !result.title || result.title === input.title) {
      throw new Error("Translation match found - fallback to EN.");
    }
    return JSON.parse(JSON.stringify(result));
  } catch (error: any) {
    console.warn(`[TRANSLATE-AGENT] Attempt ${attempt} Failed: ${error.message}`);
    if (attempt < 2) return translateNews(input, attempt + 1);
    return { title: input.title, content: input.content, category: input.category };
  }
}

const translateNewsPrompt = ai.definePrompt({
  name: 'translateNewsPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: TranslateNewsInputSchema},
  output: {schema: TranslateNewsOutputSchema},
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  system: `Translate the headline and content into formal Bengali. Return ONLY the JSON object.`,
  prompt: `Headline: {{{title}}}\nContent: {{{content}}}`,
});

const translateNewsFlow = ai.defineFlow(
  {
    name: 'translateNewsFlow',
    inputSchema: TranslateNewsInputSchema,
    outputSchema: TranslateNewsOutputSchema,
  },
  async input => {
    const {output} = await translateNewsPrompt(input);
    if (!output) throw new Error("Null AI output");
    return output;
  }
);
