
'use server';
/**
 * @fileOverview News translation AI agent.
 * 
 * - translateNews - Handled with high-fidelity Gemini 1.5 Flash.
 * - Supports Title, Content, and Category translation.
 * - Includes robust retry logic and technical logging.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
 * translateNews - Robust Server Action for real-time translation with retry logic.
 */
export async function translateNews(input: TranslateNewsInput, attempt = 1): Promise<TranslateNewsOutput> {
  const startTime = Date.now();
  console.log(`[TRANSLATE-FLOW] Received Article: "${input.title.substring(0, 50)}..." | Attempt: ${attempt}`);

  try {
    const result = await translateNewsFlow(input);
    if (!result || !result.title) throw new Error("AI returned an empty translation object.");
    
    const duration = Date.now() - startTime;
    console.log(`[TRANSLATE-FLOW] SUCCESS | Time: ${duration}ms | Article: "${input.title.substring(0, 30)}..."`);
    
    return JSON.parse(JSON.stringify(result));
  } catch (error: any) {
    console.error(`[TRANSLATE-FLOW] FAILURE (Attempt ${attempt}) | Error: ${error.message}`);
    
    if (attempt < 3) {
      const backoff = attempt * 1000;
      await new Promise(r => setTimeout(r, backoff));
      return translateNews(input, attempt + 1);
    }

    return {
      title: input.title,
      content: input.content,
      category: input.category
    };
  }
}

const translateNewsPrompt = ai.definePrompt({
  name: 'translateNewsPrompt',
  model: 'googleai/gemini-1.5-flash',
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
  
  GUIDELINES:
  1. Maintain a formal, journalistic, and institutional tone.
  2. Transliterate proper names (people/places) if they are standard in Bengali media.
  3. Ensure legal terms (e.g., 'Arrest', 'Magistrate', 'Constitutional') are translated into their formal Bengali equivalents.
  4. Ensure Category (e.g., 'Legal', 'Human Rights', 'Politics') is translated accurately.
  5. Output MUST be valid JSON matching the schema.`,
  prompt: `Translate the following news intelligence into Bengali:

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
