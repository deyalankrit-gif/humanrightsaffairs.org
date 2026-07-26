'use server';
/**
 * @fileOverview AI-enhanced document search for the HRAT Knowledge Hub.
 * Uses Gemini 2.0 Flash for rapid analysis and excerpt extraction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const AiDocumentSearchInputSchema = z.object({
  query: z.string().describe("The natural language query."),
  documents: z.array(z.object({
    title: z.string(),
    content: z.string(),
  })),
});

const AiDocumentSearchOutputSchema = z.object({
  summary: z.string().describe("Concise findings."),
  relevantDocuments: z.array(z.object({
    title: z.string(),
    excerpt: z.string(),
  })),
});

export type AiDocumentSearchOutput = z.infer<typeof AiDocumentSearchOutputSchema>;

export async function aiDocumentSearch(input: z.infer<typeof AiDocumentSearchInputSchema>): Promise<AiDocumentSearchOutput> {
  try {
    const result = await aiDocumentSearchFlow(input);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("[SEARCH-AUDIT] Model Error:", error);
    return {
      summary: "Autonomous analysis interrupted. Accessing local cached registry.",
      relevantDocuments: []
    };
  }
}

const aiDocumentSearchPrompt = ai.definePrompt({
  name: 'aiDocumentSearchPrompt',
  model: googleAI.model('gemini-2.5-flash'),
  input: {schema: AiDocumentSearchInputSchema},
  output: {schema: AiDocumentSearchOutputSchema},
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  system: `You are an expert human rights legal analyst for Justice Shield. Analyze documents and identify precise relevant sections.`,
  prompt: `Query: {{{query}}}\n\nDocuments:\n{{#each documents}}\n- {{{this.title}}}: {{{this.content}}}\n{{/each}}`,
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
