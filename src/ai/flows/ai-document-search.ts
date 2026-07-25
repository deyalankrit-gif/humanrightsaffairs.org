'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI-enhanced document search.
 *
 * - aiDocumentSearch - A function that allows users to search an extensive human rights library
 *   using natural language, identifying and highlighting specific clauses or documents.
 * - AiDocumentSearchInput - The input type for the aiDocumentSearch function.
 * - AiDocumentSearchOutput - The return type for the aiDocumentSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

/**
 * aiDocumentSearch - Robust Server Action wrapper.
 */
export async function aiDocumentSearch(input: AiDocumentSearchInput): Promise<AiDocumentSearchOutput> {
  try {
    const result = await aiDocumentSearchFlow(input);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Server Action Crash (aiDocumentSearch):", error);
    return {
      summary: "An error occurred during legal analysis. Access to the knowledge hub is temporarily limited.",
      relevantDocuments: []
    };
  }
}

const aiDocumentSearchPrompt = ai.definePrompt({
  name: 'aiDocumentSearchPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: AiDocumentSearchInputSchema},
  output: {schema: AiDocumentSearchOutputSchema},
  system: `You are an expert human rights legal analyst. Your task is to analyze a given set of human rights documents and a user's query to identify and extract the most relevant clauses or sections. Provide a concise summary of your findings and specific excerpts from the documents.`,
  prompt: `User Query: {{{query}}}

Documents to search through:

{{#each documents}}
--- Document Title: {{{this.title}}} ---
{{{this.content}}}

{{/each}}

Please provide a summary of your findings and list the most relevant document excerpts. Each excerpt should clearly state which document it came from.`,
});

const aiDocumentSearchFlow = ai.defineFlow(
  {
    name: 'aiDocumentSearchFlow',
    inputSchema: AiDocumentSearchInputSchema,
    outputSchema: AiDocumentSearchOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await aiDocumentSearchPrompt(input);
      if (!output) {
        return {
          summary: "I am currently unable to analyze the legal database. Please try again or contact our legal cell for direct assistance.",
          relevantDocuments: []
        };
      }
      return output;
    } catch (error) {
      console.error("AI Document Search Flow Error:", error);
      return {
        summary: "An error occurred during high-fidelity legal analysis. Access to the knowledge hub is temporarily limited.",
        relevantDocuments: []
      };
    }
  }
);
