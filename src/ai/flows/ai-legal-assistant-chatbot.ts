'use server';
/**
 * @fileOverview An AI-powered legal assistant chatbot.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const InquireLegalAssistantInputSchema = z.object({
  query: z.string()
});
export type InquireLegalAssistantInput = z.infer<typeof InquireLegalAssistantInputSchema>;

export async function inquireLegalAssistant(input: InquireLegalAssistantInput): Promise<string> {
  try {
    const result = await aiLegalAssistantChatbotFlow(input);
    return String(result);
  } catch (error) {
    console.error("[CHATBOT] Engine Failure:", error);
    return "I am currently offline due to a technical synchronization issue. Please contact our helpline.";
  }
}

const legalAssistantPrompt = ai.definePrompt({
  name: 'legalAssistantPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: InquireLegalAssistantInputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  system: `You are an expert AI-powered legal assistant for the Human Rights Affairs Trust in India. Help citizens understand their rights clearly.`,
  prompt: `User Query: {{{query}}}`,
});

const aiLegalAssistantChatbotFlow = ai.defineFlow(
  {
    name: 'aiLegalAssistantChatbotFlow',
    inputSchema: InquireLegalAssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const response = await legalAssistantPrompt(input);
    return response.text || "I am currently having trouble processing your query.";
  }
);
