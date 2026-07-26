'use server';
/**
 * @fileOverview High-fidelity translation engine for Human Rights news.
 * Optimized for natural, fluent Bengali Unicode generation using Gemini 2.0 Flash.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const TranslateNewsInputSchema = z.object({
  title: z.string().describe("The English headline of the news."),
  content: z.string().describe("The English summary or body of the news."),
  category: z.string().describe("The news category.")
});

const TranslateNewsOutputSchema = z.object({
  title: z.string().describe("The translated headline in Bengali."),
  content: z.string().describe("The translated summary in Bengali."),
  category: z.string().describe("The translated category in Bengali."),
});

export type TranslateNewsOutput = z.infer<typeof TranslateNewsOutputSchema>;

/**
 * translateNews - High-fidelity AI translation flow
 */
export async function translateNews(input: z.infer<typeof TranslateNewsInputSchema>): Promise<TranslateNewsOutput> {
  try {
    const { output } = await translateNewsPrompt(input);
    
    if (!output || !output.title || output.title === input.title) {
      throw new Error("Translation parity detected. AI returned original text.");
    }
    
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("[TRANSLATE-CRITICAL] AI Engine Error:", error);
    // Return original if AI fails to prevent UI crash
    return { title: input.title, content: input.content, category: input.category };
  }
}

const translateNewsPrompt = ai.definePrompt({
  name: 'translateNewsPrompt',
  model: googleAI.model('gemini-2.0-flash'),
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
  system: `You are a professional legal and human rights translator for Human Rights Affairs Trust.
  
  TRANSLATION PROTOCOL:
  1. Translate the complete Headline and Body into natural, fluent Bengali (বাংলা).
  2. Use proper Bengali Unicode characters only.
  3. DO NOT summarize, shorten, or omit any sentences. Translate the FULL content provided.
  4. PRESERVE proper nouns: Names of people, companies (e.g., 'HRAT'), countries, cities, product names, URLs, and quotations must remain in their original form or standard phonetic Bengali representation.
  5. KEEP paragraph breaks and formatting exactly the same as the source.
  6. DO NOT translate technical identifiers, source names, or HTML tags if any.
  7. Return ONLY the translated JSON object. No markdown, no explanations.`,
  prompt: `
  Translate the following news data from English to Bengali:
  - Headline: {{{title}}}
  - Summary/Body: {{{content}}}
  - Category: {{{category}}}
  `,
});
