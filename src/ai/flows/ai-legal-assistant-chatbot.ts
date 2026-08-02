'use server';
/**
 * @fileOverview AI Legal Assistant Chatbot for HRAT.
 * Uses Gemini 2.5 Flash to provide information about human rights and constitutional law.
 * 
 * - inquireLegalAssistant - Handles the user interaction with the legal AI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const AiLegalAssistantInputSchema = z.object({
  query: z.string().describe("The user's query about legal or human rights issues."),
});

/**
 * inquireLegalAssistant - Main entry point for the AI Chat interface.
 */
export async function inquireLegalAssistant(input: z.infer<typeof AiLegalAssistantInputSchema>): Promise<string> {
  try {
    const result = await aiLegalAssistantFlow(input);
    return result;
  } catch (error) {
    console.error("[AI-CHAT-AUDIT] Model Error:", error);
    return "I am currently undergoing technical maintenance to ensure high-fidelity accuracy. Please contact our institutional helpline for immediate human assistance.";
  }
}

const aiLegalAssistantPrompt = ai.definePrompt({
  name: 'aiLegalAssistantPrompt',
  model: googleAI.model('gemini-2.5-flash'),
  input: {schema: AiLegalAssistantInputSchema},
  output: {schema: z.string()},
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  system: `You are JusticeBot, a high-fidelity AI legal assistant for the Human Rights Affairs Trust (HRAT) in India.
  
  Your primary objective is to provide citizens with clear, accurate, and empathetic information about their constitutional rights, human rights, and legal procedures in India.
  
  CORE PROTOCOLS:
  1. ADHERENCE TO INDIAN LAW: Focus on the Constitution of India, BNS (Bharatiya Nyaya Sanhita), BNSS (Bharatiya Nagarik Suraksha Sanhita), and specific acts like RTI, POCSO, and Domestic Violence Act.
  2. DISCLAIMER: Always remind users that you provide INFORMATION, not legal advice. For specific court proceedings, they must consult an authorized advocate.
  3. TONE: Professional, authoritative yet empathetic. Use 'Justice Shield' branding.
  4. LANGUAGE: Respond in the language used by the user (primarily English or Bengali).
  5. CONCISION: Provide actionable steps where possible (e.g., how to file an RTI, what to do if arrested).
  
  Do not provide political opinions, promote specific political parties, or speculate on non-legal matters.`,
  prompt: `User Query: {{{query}}}`,
});

const aiLegalAssistantFlow = ai.defineFlow(
  {
    name: 'aiLegalAssistantFlow',
    inputSchema: AiLegalAssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const {text} = await aiLegalAssistantPrompt(input);
    return text || "I was unable to synthesize an accurate response at this time. Please rephrase your query for the National Registry.";
  }
);
