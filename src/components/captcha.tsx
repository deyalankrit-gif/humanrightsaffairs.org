
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, ShieldCheck, Volume2, VolumeX, Square, Loader2, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { generateAiSpeech } from '@/ai/flows/tts-flow';
import { useToast } from '@/hooks/use-toast';

type CaptchaChar = {
  char: string;
  rotation: number;
  offsetY: number;
  scale: number;
  blur: number;
  skewX: number;
  opacity: number;
};

/**
 * Captcha Component: Generates a distorted alphanumeric code for human verification.
 * Features individualized character transformations for crookedness and blurriness.
 * Now includes an accessible Audio CAPTCHA system using high-fidelity TTS.
 */
export function Captcha({ onVerify }: { onVerify: (isValid: boolean) => void }) {
  const [code, setCode] = useState<CaptchaChar[]>([]);
  const [rawCode, setRawCode] = useState('');
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // Audio States
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const generateCode = useCallback(() => {
    // Unambiguous character set
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result: CaptchaChar[] = [];
    let raw = '';
    
    for (let i = 0; i < 6; i++) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      raw += char;
      result.push({
        char,
        rotation: Math.floor(Math.random() * 40) - 20,
        offsetY: Math.floor(Math.random() * 12) - 6,
        scale: 0.85 + Math.random() * 0.3,
        blur: 0.4 + Math.random() * 0.5,
        skewX: Math.floor(Math.random() * 15) - 7.5,
        opacity: 0.7 + Math.random() * 0.3
      });
    }
    
    setCode(result);
    setRawCode(raw);
    setInput('');
    onVerify(false);
    
    // Reset Audio State for the new code
    setAudioUrl(null);
    setAudioError(false);
    
    // Stop and clear current audio source
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsAudioPlaying(false);
  }, [onVerify]);

  useEffect(() => {
    setMounted(true);
    generateCode();
  }, [generateCode]);

  useEffect(() => {
    onVerify(input === rawCode && rawCode !== '');
  }, [input, rawCode, onVerify]);

  /**
   * handlePlayAudio: Manages the generation and playback of the audio CAPTCHA.
   * Pronounces characters individually with randomized speed/pitch for security.
   */
  const handlePlayAudio = async () => {
    if (!audioRef.current) return;

    // If currently playing, stop it
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
      return;
    }

    // If we already have the generated audio for THIS code, just play it
    if (audioUrl) {
      playExistingAudio();
      return;
    }

    setIsGeneratingAudio(true);
    setAudioError(false);

    try {
      // Format text with commas to force clear pauses between characters
      // We add a preamble and repetition for better accessibility
      const speechText = `The security code is: ${rawCode.split('').join(', ')}. I repeat, ${rawCode.split('').join(', ')}.`;
      
      const randomizedSpeed = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
      const randomizedPitch = Math.floor(Math.random() * 6) - 3; // -3 to 3

      const result = await generateAiSpeech({
        text: speechText,
        language: 'English',
        voice: 'Male',
        emotion: 'Professional',
        speed: randomizedSpeed,
        pitch: randomizedPitch
      });

      if (result.success && result.audioData) {
        setAudioUrl(result.audioData);
        
        const audio = audioRef.current;
        audio.src = result.audioData;
        audio.load(); // Force browser to prepare the new source
        
        // Play the audio after ensuring it's loaded
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsAudioPlaying(true))
            .catch((err) => {
              console.warn("[CAPTCHA-AUDIO] Playback blocked:", err);
              setAudioError(true);
              setIsAudioPlaying(false);
            });
        }
      } else {
        throw new Error(result.error || "Generation error");
      }
    } catch (e: any) {
      setAudioError(true);
      toast({
        variant: "destructive",
        title: "Audio Service Busy",
        description: "Failed to generate vocal code. Please use visual verification or try again."
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const playExistingAudio = () => {
    if (audioRef.current && audioUrl) {
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.play()
        .then(() => setIsAudioPlaying(true))
        .catch(() => setAudioError(true));
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      {/* Hidden Audio Element used for all CAPTCHA playback */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsAudioPlaying(false)}
        onPause={() => setIsAudioPlaying(false)}
        onPlay={() => setIsAudioPlaying(true)}
        onError={() => setAudioError(true)}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-3">
        {/* Visual CAPTCHA Display */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-3 flex items-center justify-center select-none border-2 border-dashed border-slate-200 dark:border-slate-700 relative overflow-hidden h-20">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="flex items-center justify-center gap-1.5 md:gap-3 relative z-10">
            {code.map((c, i) => (
              <span 
                key={i} 
                className="text-2xl md:text-4xl font-black italic text-primary dark:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] inline-block"
                style={{
                  transform: `rotate(${c.rotation}deg) translateY(${c.offsetY}px) scale(${c.scale}) skewX(${c.skewX}deg)`,
                  filter: `blur(${c.blur}px)`,
                  opacity: c.opacity,
                  letterSpacing: '0.05em'
                }}
              >
                {c.char}
              </span>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2 shrink-0">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={generateCode}
            className="h-9 w-10 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/10"
            title="Refresh Visual CAPTCHA"
            aria-label="Refresh Visual CAPTCHA"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={handlePlayAudio}
            disabled={isGeneratingAudio}
            className={cn(
              "h-9 w-10 rounded-lg transition-all",
              isAudioPlaying ? "bg-accent/20 text-accent" : "text-slate-400 hover:text-accent hover:bg-accent/10"
            )}
            title={isAudioPlaying ? "Stop Audio" : audioUrl ? "Replay Audio" : "Play Audio CAPTCHA"}
            aria-label={isAudioPlaying ? "Stop Audio" : audioUrl ? "Replay Audio" : "Play Audio CAPTCHA"}
          >
            {isGeneratingAudio ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isAudioPlaying ? (
              <Square className="w-4 h-4 fill-current" />
            ) : audioError ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Input 
          placeholder="Enter Verification Code" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={6}
          className="text-center font-bold tracking-[0.2em] h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300">
          {input === rawCode && rawCode !== '' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-500 animate-in zoom-in-50" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-slate-200 dark:text-slate-800" />
          )}
        </div>
      </div>

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite">
        {isGeneratingAudio && "Generating audio version of the security code."}
        {isAudioPlaying && "Playing security code audio."}
        {audioError && "Audio generation failed. Please use visual code or refresh."}
      </div>
    </div>
  );
}
