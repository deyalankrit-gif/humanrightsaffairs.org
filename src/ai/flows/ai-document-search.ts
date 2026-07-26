'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI-enhanced document search.
 *
 * - aiDocumentSearch - A function that allows users to search an extensive human rights library
 *   using natural language, identifying and highlighting specific clauses or documents.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const AiDocumentSearchInputSchema = z.object({
  query: z.string().describe("The natural language query describing the legal information the user is looking for."),
  documents: z.array(z.object({
    title: z.string().describe("The title of the document."),
    content: z.string().describe("The full content of the document."),
  })).describe("An array of human rights documents to search through."),
});
export type AiDocumentSearchInput = z.infer<typeof AiDocumentSearchInputSchema>;

const AiDocumentSearchOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the findings based on the query and relevant documents."),
  relevantDocuments: z.array(z.object({
    title: z.string().describe("The title of the document where the excerpt was found."),
    excerpt: z.string().describe("The specific clause or section from the document that is most relevant to the query."),
  })).describe("An array of objects, each containing the title of a relevant document and an extracted excerpt."),
});
export type AiDocumentSearchOutput = z.infer<typeof AiDocumentSearchOutputSchema>;

export async function aiDocumentSearch(input: AiDocumentSearchInput): Promise<AiDocumentSearchOutput> {
  try {
    const result = await aiDocumentSearchFlow(input);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("[SEARCH-ENGINE] Critical Error:", error);
    return {
      summary: "An error occurred during legal analysis. Access to the knowledge hub is temporarily limited.",
      relevantDocuments: []
    };
  }
}

const aiDocumentSearchPrompt = ai.definePrompt({
  name: 'aiDocumentSearchPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: AiDocumentSearchInputSchema},
  output: {schema: AiDocumentSearchOutputSchema},
  system: `You are an expert human rights legal analyst. Your task is to analyze human rights documents and identify relevant sections based on user queries.`,
  prompt: `User Query: {{{query}}}
Documents:
{{#each documents}}
--- {{{this.title}}} ---
{{{this.content}}}
{{/each}}`,
});

const aiDocumentSearchFlow = ai.defineFlow(
  {
    name: 'aiDocumentSearchFlow',
    inputSchema: AiDocumentSearchInputSchema,
    outputSchema: AiDocumentSearchOutputSchema,
  },
  async (input) => {
    const {output} = await aiDocumentSearchPrompt(input);
    return output || { summary: "Analysis unavailable.", relevantDocuments: [] };
  }
);
