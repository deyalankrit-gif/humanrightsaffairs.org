'use server';
/**
 * @fileOverview News translation AI agent.
 *
 * - translateNews - A function that handles the translation process.
 * - Features: Multilingual support (Bengali), safety filter bypass for news integrity.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateNewsInputSchema = z.object({
  title: z.string().describe('The English title of the news.'),
  content: z.string().describe('The English content/summary of the news.'),
});
export type TranslateNewsInput = z.infer<typeof TranslateNewsInputSchema>;

const TranslateNewsOutputSchema = z.object({
  title: z.string().describe('The Bengali translation of the title.'),
  content: z.string().describe('The Bengali translation of the content.'),
});
export type TranslateNewsOutput = z.infer<typeof TranslateNewsOutputSchema>;

/**
 * translateNews - Robust Server Action for real-time translation.
 */
export async function translateNews(input: TranslateNewsInput): Promise<TranslateNewsOutput> {
  try {
    const result = await translateNewsFlow(input);
    if (!result || !result.title) throw new Error("AI failed to return translation keys.");
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Critical Translation System Failure:", error);
    return {
      title: "অনুবাদ প্রক্রিয়াটি বর্তমানে বাধাগ্রস্ত হয়েছে",
      content: "দুঃখিত, এই মুহূর্তে আমাদের অনুবাদ ইঞ্জিনটি প্রতিক্রিয়াহীন। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।"
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
  4. Output MUST be valid JSON matching the schema.`,
  prompt: `Translate the following news intelligence into Bengali:

Headline: {{{title}}}
Summary: {{{content}}}`,
});

const translateNewsFlow = ai.defineFlow(
  {
    name: 'translateNewsFlow',
    inputSchema: TranslateNewsInputSchema,
    outputSchema: TranslateNewsOutputSchema,
  },
  async input => {
    try {
      const {output} = await translateNewsPrompt(input);
      if (!output) {
        return {
          title: "অনুবাদ ব্যর্থ হয়েছে",
          content: "এই সংবাদটি অনুবাদ করার সময় সিস্টেম ত্রুটি দেখা দিয়েছে।"
        };
      }
      return output;
    } catch (e) {
      console.error("Flow Error:", e);
      throw e;
    }
  }
);
