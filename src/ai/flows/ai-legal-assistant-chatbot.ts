'use server';
/**
 * @fileOverview An AI-powered legal assistant chatbot that helps users understand their constitutional rights and legal procedures.
 *
 * - inquireLegalAssistant - A function that handles user queries and returns conversational legal assistance.
 * - InquireLegalAssistantInput - The input type for the inquireLegalAssistant function.
 * - InquireLegalAssistantOutput - The return type for the inquireLegalAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InquireLegalAssistantInputSchema = z
  .string()
  .describe(
    'A user query about constitutional rights or basic legal procedures.'
  );
export type InquireLegalAssistantInput = z.infer<
  typeof InquireLegalAssistantInputSchema
>;

const InquireLegalAssistantOutputSchema = z
  .string()
  .describe('The AI legal assistant\'s conversational response.');
export type InquireLegalAssistantOutput = z.infer<
  typeof InquireLegalAssistantOutputSchema
>;

export async function inquireLegalAssistant(
  input: InquireLegalAssistantInput
): Promise<InquireLegalAssistantOutput> {
  return aiLegalAssistantChatbotFlow(input);
}

const legalAssistantPrompt = ai.definePrompt({
  name: 'legalAssistantPrompt',
  input: {schema: InquireLegalAssistantInputSchema},
  // Removing output schema here to prevent validation failures on raw text
  // and adding safety settings to prevent blocks on sensitive human rights topics.
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an AI-powered legal assistant for the Human Rights Affairs Trust (JusticeShield).
Your goal is to help users understand their constitutional rights and basic legal procedures in India.
Respond to the user's query in a clear, concise, conversational, and easy-to-understand manner.
Avoid complex legal jargon where simpler language can be used.
If you cannot answer a question, politely state that you are unable to provide specific legal advice and recommend consulting a legal professional.

User Query: {{{input}}}`,
});

const aiLegalAssistantChatbotFlow = ai.defineFlow(
  {
    name: 'aiLegalAssistantChatbotFlow',
    inputSchema: InquireLegalAssistantInputSchema,
    outputSchema: InquireLegalAssistantOutputSchema,
  },
  async (input) => {
    // Firing the prompt without awaiting an output schema validation
    const response = await legalAssistantPrompt(input);
    
    // Extract raw text instead of structured output
    const finalOutput = response.text;
    
    if (!finalOutput || finalOutput.trim().length === 0) {
      return "I apologize, but I am currently having trouble processing your query. Please try again shortly or contact our official helpline for urgent assistance.";
    }
    
    return finalOutput;
  }
);
