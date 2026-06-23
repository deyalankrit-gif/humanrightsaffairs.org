import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Checks for multiple common environment variable names used for Gemini API keys
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
  // Using the specific model identifier for the Google AI plugin
  model: 'googleai/gemini-1.5-flash',
});
