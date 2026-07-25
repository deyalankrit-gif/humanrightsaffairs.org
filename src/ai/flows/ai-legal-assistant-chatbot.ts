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

const InquireLegalAssistantInputSchema = z.object({
  query: z.string().describe('A user query about constitutional rights or basic legal procedures.')
});
export type InquireLegalAssistantInput = z.infer<
  typeof InquireLegalAssistantInputSchema
>;

const InquireLegalAssistantOutputSchema = z
  .string()
  .describe('The AI legal assistant\'s conversational response.');
export type InquireLegalAssistantOutput = z.infer<
  typeof InquireLegalAssistantOutputSchema
>;

/**
 * inquireLegalAssistant - Robust Server Action wrapper.
 */
export async function inquireLegalAssistant(
  input: InquireLegalAssistantInput
): Promise<InquireLegalAssistantOutput> {
  try {
    const result = await aiLegalAssistantChatbotFlow(input);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Server Action Crash (inquireLegalAssistant):", error);
    return "I am currently offline due to a technical synchronization issue with the national legal database. Please contact our helpline for assistance.";
  }
}

const legalAssistantPrompt = ai.definePrompt({
  name: 'legalAssistantPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {
    schema: z.object({
      query: z.string()
    })
  },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  system: `You are an expert AI-powered legal assistant for the Human Rights Affairs Trust (JusticeShield) in India.
Your goal is to help citizens understand their constitutional rights and standard legal procedures (BNSS/BNS) in a clear, simple, and conversational manner.

Guidelines:
1. Always address the user's specific question directly. 
2. If the user asks a question, provide a detailed but accessible answer based on Indian law.
3. Do not simply provide a greeting.
4. If you cannot answer a specific question, suggest consulting a legal professional.
5. Avoid complex legal jargon where possible.`,
  prompt: `User Query: {{{query}}}`,
});

const aiLegalAssistantChatbotFlow = ai.defineFlow(
  {
    name: 'aiLegalAssistantChatbotFlow',
    inputSchema: InquireLegalAssistantInputSchema,
    outputSchema: InquireLegalAssistantOutputSchema,
  },
  async (input) => {
    try {
      const response = await legalAssistantPrompt(input);
      const finalOutput = response.text;
      
      if (!finalOutput || finalOutput.trim().length === 0) {
        return "I apologize, but I am currently having trouble processing your query. Please rephrase your question or contact our official helpline for urgent assistance.";
      }
      
      return finalOutput;
    } catch (error) {
      console.error("AI Chatbot Flow Error:", error);
      return "I am currently offline due to a technical synchronization issue with the national legal database. Please contact our helpline for assistance.";
    }
  }
);
