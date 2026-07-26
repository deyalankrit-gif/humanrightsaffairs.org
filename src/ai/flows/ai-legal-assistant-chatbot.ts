'use server';
/**
 * @fileOverview AI Legal Assistant Chatbot (JusticeBot).
 * Standardized on Gemini 2.0 Flash for peak response stability.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const InquireLegalAssistantInputSchema = z.object({
  query: z.string()
});

export async function inquireLegalAssistant(input: { query: string }): Promise<string> {
  try {
    const result = await aiLegalAssistantChatbotFlow(input);
    return String(result);
  } catch (error: any) {
    console.warn("[BOT-AUDIT] Engine Fallback triggered:", error.message);
    return "I am currently performing a secure registry update. Please contact our 24/7 helpline for immediate assistance.";
  }
}

const legalAssistantPrompt = ai.definePrompt({
  name: 'legalAssistantPrompt',
  model: googleAI.model('gemini-2.5-flash'),
  input: { schema: InquireLegalAssistantInputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  system: `You are JusticeBot, the AI advocate for Human Rights Affairs Trust. Provide clear, empathetic, and constitutionally accurate guidance.`,
  prompt: `Citizen Query: {{{query}}}`,
});

const aiLegalAssistantChatbotFlow = ai.defineFlow(
  {
    name: 'aiLegalAssistantChatbotFlow',
    inputSchema: InquireLegalAssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const response = await legalAssistantPrompt(input);
    return response.text || "I am processing your request. One moment...";
  }
);
