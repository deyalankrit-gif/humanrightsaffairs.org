'use server';
/**
 * @fileOverview Resilient translation engine with exponential backoff retries.
 * Model: Gemini 1.5 Flash (Stability Standard)
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const TranslateNewsInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.string()
});

const TranslateNewsOutputSchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.string(),
});

export type TranslateNewsOutput = z.infer<typeof TranslateNewsOutputSchema>;

/**
 * translateNews with Exponential Backoff
 */
export async function translateNews(input: z.infer<typeof TranslateNewsInputSchema>, attempt = 1): Promise<TranslateNewsOutput> {
  try {
    const result = await translateNewsFlow(input);
    if (!result || !result.title || result.title === input.title) {
      throw new Error("Translation parity detected - likely safety block or yield error.");
    }
    return JSON.parse(JSON.stringify(result));
  } catch (error: any) {
    const delay = Math.pow(2, attempt) * 500; // 2s, 4s...
    console.warn(`[TRANSLATE-ENGINE] Attempt ${attempt} Failed. Retrying in ${delay}ms... Error: ${error.message}`);
    
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, delay));
      return translateNews(input, attempt + 1);
    }
    
    // Hard fallback to original English if all retries fail
    console.error("[TRANSLATE-ENGINE] Final failure for item. Falling back to EN.");
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
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  system: `Translate the news headline and summary into formal, professional Bengali script. Return ONLY a valid JSON object. DO NOT include English text in the output.`,
  prompt: `Headline: {{{title}}}\nContent: {{{content}}}\nCategory: {{{category}}}`,
});

const translateNewsFlow = ai.defineFlow(
  {
    name: 'translateNewsFlow',
    inputSchema: TranslateNewsInputSchema,
    outputSchema: TranslateNewsOutputSchema,
  },
  async input => {
    const {output} = await translateNewsPrompt(input);
    if (!output) throw new Error("Null AI output from translateNewsPrompt");
    return output;
  }
);
