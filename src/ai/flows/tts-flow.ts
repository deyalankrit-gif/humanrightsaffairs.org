'use server';
/**
 * @fileOverview AI Text-to-Speech Flow for Institutional Announcements.
 *
 * - generateAiSpeech - High-fidelity human voice generation using Gemini 2.5 Flash.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import wav from 'wav';

const TtsInputSchema = z.object({
  text: z.string().describe('The content to convert to speech.'),
  language: z.enum(['English', 'Bengali', 'Hindi']).default('English'),
  voice: z.enum(['Male', 'Female']).default('Male'),
  emotion: z.enum([
    'Professional', 
    'Calm', 
    'Friendly', 
    'Emergency', 
    'Official', 
    'Authoritative', 
    'Inspirational', 
    'Empathetic', 
    'Urgent'
  ]).default('Professional'),
  speed: z.number().min(0.5).max(2).default(1),
  pitch: z.number().min(-20).max(20).default(0),
});

export type TtsInput = z.infer<typeof TtsInputSchema>;

/**
 * Converts PCM data returned by Gemini into a browser-ready WAV Data URI.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

/**
 * generateAiSpeech - Main entry point for AI voice generation.
 */
export async function generateAiSpeech(input: TtsInput) {
  try {
    const voiceName = input.voice === 'Male' ? 'Algenib' : 'Achernar';
    
    // Construct descriptive prompt to guide emotion/tonality
    const enhancedPrompt = `${input.emotion} tone: ${input.text}`;

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
      prompt: enhancedPrompt,
    });

    if (!media || !media.url) {
      throw new Error('AI Generation Failure: No media returned from engine.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const base64Wav = await toWav(audioBuffer);
    
    return {
      success: true,
      audioData: `data:audio/wav;base64,${base64Wav}`,
      duration: 0, // Placeholder, browser will calculate
      size: audioBuffer.length
    };
  } catch (error: any) {
    console.error("[TTS-FLOW-CRITICAL] Protocol Error:", error);
    return {
      success: false,
      error: error.message || "Institutional voice engine unreachable."
    };
  }
}
