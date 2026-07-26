'use server';
/**
 * @fileOverview Resilient translation engine with exponential backoff retries.
 * Optimized for formal Bengali script generation and zero-failure output.
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
 * translateNews with Exponential Backoff and Parity Check
 */
export async function translateNews(input: z.infer<typeof TranslateNewsInputSchema>, attempt = 1): Promise<TranslateNewsOutput> {
  try {
    const { output } = await translateNewsPrompt(input);
    
    // Validate output integrity and check for language parity (AI parroting English)
    if (!output || !output.title || output.title === input.title) {
      throw new Error("Translation parity detected - likely safety block or yield error.");
    }
    
    // Explicitly parse to ensure clean object transfer
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    const delay = Math.pow(2, attempt) * 500;
    console.warn(`[TRANSLATE-ENGINE] Attempt ${attempt} Failed. Retrying... Error: ${error.message}`);
    
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, delay));
      return translateNews(input, attempt + 1);
    }
    
    // Hard fallback to original English if all retries fail
    console.error("[TRANSLATE-ENGINE] Final failure. Returning English fallback.");
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
  system: `You are a professional Bengali translator for an institutional human rights network. 
  Your mandate is to translate the following news data into formal, high-fidelity Bengali script (Bangla). 
  Maintain accuracy and a professional tone. 
  DO NOT include any English characters in the title, content, or category fields.
  Return only the translated Bengali content in the requested JSON schema.`,
  prompt: `
  Target Language: Bengali (Bangla)
  Source Data:
  - Headline: {{{title}}}
  - Summary: {{{content}}}
  - Category: {{{category}}}
  `,
});
