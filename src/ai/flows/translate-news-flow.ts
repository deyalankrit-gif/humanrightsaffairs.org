'use server';
/**
 * @fileOverview News translation AI agent.
 *
 * - translateNews - A function that handles the translation process.
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

export async function translateNews(input: TranslateNewsInput): Promise<TranslateNewsOutput> {
  try {
    const result = await translateNewsFlow(input);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Translation Error:", error);
    return {
      title: "অনুবাদ ব্যর্থ হয়েছে",
      content: "দুঃখিত, এই সংবাদটি বর্তমানে অনুবাদ করা যাচ্ছে না।"
    };
  }
}

const translateNewsPrompt = ai.definePrompt({
  name: 'translateNewsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: TranslateNewsInputSchema},
  output: {schema: TranslateNewsOutputSchema},
  system: `You are an expert translator specializing in translating English news into standard Bengali (West Bengal/Bangladesh context).
  Maintain the formal and informative tone of news reporting. 
  Ensure technical terms are translated accurately or transliterated if they are standard in Bengali media.`,
  prompt: `Translate the following news item into Bengali.

Title: {{{title}}}
Content: {{{content}}}`,
});

const translateNewsFlow = ai.defineFlow(
  {
    name: 'translateNewsFlow',
    inputSchema: TranslateNewsInputSchema,
    outputSchema: TranslateNewsOutputSchema,
  },
  async input => {
    const {output} = await translateNewsPrompt(input);
    return output!;
  }
);
