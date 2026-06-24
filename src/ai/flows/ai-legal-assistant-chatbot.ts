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

export async function inquireLegalAssistant(
  input: InquireLegalAssistantInput
): Promise<InquireLegalAssistantOutput> {
  return aiLegalAssistantChatbotFlow(input);
}

const legalAssistantPrompt = ai.definePrompt({
  name: 'legalAssistantPrompt',
  // Explicitly set the model at the root level for Genkit 1.x compatibility
  model: 'googleai/gemini-1.5-flash',
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
  prompt: `You are an expert AI-powered legal assistant for the Human Rights Affairs Trust (JusticeShield) in India.
Your goal is to help citizens understand their constitutional rights and standard legal procedures (BNSS/BNS) in a clear, simple, and conversational manner.

Guidelines:
1. Always address the user's specific question directly. 
2. If the user asks a question, provide a detailed but accessible answer based on Indian law.
3. Do not simply provide a greeting.
4. If you cannot answer a specific question, suggest consulting a legal professional.
5. Avoid complex legal jargon where possible.

User Query: {{{query}}}`,
});

const aiLegalAssistantChatbotFlow = ai.defineFlow(
  {
    name: 'aiLegalAssistantChatbotFlow',
    inputSchema: InquireLegalAssistantInputSchema,
    outputSchema: InquireLegalAssistantOutputSchema,
  },
  async (input) => {
    // Generate response using the defined prompt
    const response = await legalAssistantPrompt(input);
    
    // Extract text and provide fallback for empty/blocked responses
    const finalOutput = response.text;
    
    if (!finalOutput || finalOutput.trim().length === 0) {
      return "I apologize, but I am currently having trouble processing your query. This might be due to safety filters or a connection issue. Please rephrase your question or contact our official helpline for urgent assistance.";
    }
    
    return finalOutput;
  }
);
