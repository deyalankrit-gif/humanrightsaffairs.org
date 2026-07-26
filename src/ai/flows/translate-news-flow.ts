'use server';
/**
 * @fileOverview High-fidelity news translation agent.
 * 
 * - translateNews - High-fidelity Bengali translation with automated retry.
 * - Optimized for human rights and legal terminology.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const TranslateNewsInputSchema = z.object({
  title: z.string().describe('The English title of the news.'),
  content: z.string().describe('The English content/summary of the news.'),
  category: z.string().describe('The English category of the news.')
});
export type TranslateNewsInput = z.infer<typeof TranslateNewsInputSchema>;

const TranslateNewsOutputSchema = z.object({
  title: z.string().describe('The Bengali translation of the title.'),
  content: z.string().describe('The Bengali translation of the content.'),
  category: z.string().describe('The Bengali translation of the category.'),
});
export type TranslateNewsOutput = z.infer<typeof TranslateNewsOutputSchema>;

/**
 * translateNews - Robust Server Action for real-time translation with recursive retry logic.
 */
export async function translateNews(input: TranslateNewsInput, attempt = 1): Promise<TranslateNewsOutput> {
  const startTime = Date.now();
  console.log(`[TRANSLATE-AGENT] Processing: "${input.title.substring(0, 40)}..." | Attempt: ${attempt}`);

  try {
    const result = await translateNewsFlow(input);
    if (!result || !result.title || result.title === input.title) {
      throw new Error("AI returned English content or null output.");
    }
    
    const duration = Date.now() - startTime;
    console.log(`[TRANSLATE-AGENT] SUCCESS in ${duration}ms`);
    
    return JSON.parse(JSON.stringify(result));
  } catch (error: any) {
    console.warn(`[TRANSLATE-AGENT] FAILED (Attempt ${attempt}): ${error.message}`);
    
    if (attempt < 3) {
      // Linear backoff with jitter
      const backoff = attempt * 1000 + Math.random() * 500;
      await new Promise(r => setTimeout(r, backoff));
      return translateNews(input, attempt + 1);
    }

    // Return original English as ultimate fallback
    return {
      title: input.title,
      content: input.content,
      category: input.category
    };
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
  system: `You are an expert human rights news translator specializing in English to standard Bengali (Indian West Bengal context).
  
  MANDATORY GUIDELINES:
  1. Translate the Headline, Category, and Summary accurately into Bengali script (UTF-8).
  2. Maintain a formal, journalistic, and institutional tone suitable for HRAT.
  3. Ensure legal terms (e.g., 'Constitution', 'Detention', 'High Court') are translated into their formal Bengali equivalents.
  4. Your response MUST be in Bengali script. DO NOT return English text.
  5. If a name or place is not translatable, transliterate it into Bengali script.`,
  prompt: `Translate the following institutional intelligence into Bengali:

Headline: {{{title}}}
Category: {{{category}}}
Summary: {{{content}}}`,
});

const translateNewsFlow = ai.defineFlow(
  {
    name: 'translateNewsFlow',
    inputSchema: TranslateNewsInputSchema,
    outputSchema: TranslateNewsOutputSchema,
  },
  async input => {
    const {output} = await translateNewsPrompt(input);
    if (!output) throw new Error("Gemini returned null output.");
    return output;
  }
);
