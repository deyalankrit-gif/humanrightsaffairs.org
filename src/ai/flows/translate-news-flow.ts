'use server';
/**
 * @fileOverview High-fidelity translation engine for Human Rights news.
 * Optimized for natural, fluent Bengali Unicode generation.
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
 * translateNews - High-fidelity AI translation flow
 */
export async function translateNews(input: TranslateNewsOutput): Promise<TranslateNewsOutput> {
  try {
    const { output } = await translateNewsPrompt(input);
    
    if (!output || !output.title || output.title === input.title) {
      throw new Error("Translation parity detected.");
    }
    
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("[TRANSLATE-CRITICAL] Error:", error);
    // Return original if AI fails
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
  system: `You are a professional translator specializing in legal and human rights journalism.
  
  TRANSLATION PROTOCOL:
  1. Translate the complete Headline and Body into natural, fluent Bengali (বাংলা).
  2. Use proper Bengali Unicode characters only.
  3. DO NOT summarize, shorten, or omit any information. Translate the full content provided.
  4. PRESERVE the original meaning, names, numbers, dates, and quotations.
  5. KEEP paragraph breaks and formatting identical to the source.
  6. DO NOT translate URLs, source names, or technical identifiers like 'HRAT'.
  7. Return ONLY the translated JSON. No markdown, no explanations.`,
  prompt: `
  Translate the following news data:
  - Headline: {{{title}}}
  - Summary: {{{content}}}
  - Category: {{{category}}}
  `,
});
