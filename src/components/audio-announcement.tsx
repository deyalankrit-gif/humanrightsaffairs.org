'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RefreshCw, 
  X,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * AudioAnnouncement: High-fidelity institutional broadcast node.
 * Listens to the global settings document for real-time synchronization of
 * audio data, playback state, and DSP effects (Gain, Reverb, Echo).
 */
export function AudioAnnouncement() {
  const db = useFirestore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Web Audio API Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const reverbWetGainRef = useRef<GainNode | null>(null);
  const reverbDryGainRef = useRef<GainNode | null>(null);
  const echoDelayNodeRef = useRef<DelayNode | null>(null);
  const echoWetGainRef = useRef<GainNode | null>(null);
  const echoFeedbackGainRef = useRef<GainNode | null>(null);
  const limiterNodeRef = useRef<DynamicsCompressorNode | null>(null);

  const announcementRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'audio_announcement');
  }, [db]);

  const { data: settings, loading } = useDoc(announcementRef);

  /**
   * syncAudioNodes: Maps global Firestore parameters to local audio nodes.
   */
  const syncAudioNodes = useCallback(() => {
    if (!audioCtxRef.current || !settings) return;
    const ctx = audioCtxRef.current;
    const time = ctx.currentTime;

    const volume = isMuted ? 0 : (settings.volume ?? 0.8);
    if (gainNodeRef.current) gainNodeRef.current.gain.setTargetAtTime(volume, time, 0.1);
    
    if (reverbWetGainRef.current && reverbDryGainRef.current) {
      const mix = (settings.reverbMix ?? 8) / 100;
      reverbWetGainRef.current.gain.setTargetAtTime(mix, time, 0.1);
      reverbDryGainRef.current.gain.setTargetAtTime(1 - mix, time, 0.1);
    }

    if (echoWetGainRef.current) {
      echoWetGainRef.current.gain.setTargetAtTime((settings.echoMix ?? 0) / 100, time, 0.1);
    }

    if (audioRef.current) {
       audioRef.current.playbackRate = settings.speed || 1;
    }
  }, [settings, isMuted]);

  /**
   * setupAudioGraph: Initializes the professional signal chain.
   */
  const setupAudioGraph = useCallback(() => {
    // Proactively resume suspended context on user interaction
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (!audioRef.current || audioCtxRef.current) {
      if (audioCtxRef.current) syncAudioNodes();
      return;
    }

    try {
      console.log('[AUDIO-SYSTEM] Establishing Public Signal Chain...');
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      // REVERB
      const reverb = ctx.createConvolver();
      const length = ctx.sampleRate * 2;
      const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const data = impulse.getChannelData(c);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }
      reverb.buffer = impulse;
      reverbNodeRef.current = reverb;

      const reverbWet = ctx.createGain();
      const reverbDry = ctx.createGain();
      reverbWetGainRef.current = reverbWet;
      reverbDryGainRef.current = reverbDry;

      // ECHO
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.35;
      echoDelayNodeRef.current = delay;

      const feedback = ctx.createGain();
      feedback.gain.value = 0.4;
      echoFeedbackGainRef.current = feedback;

      const echoWet = ctx.createGain();
      echoWetGainRef.current = echoWet;

      // LIMITER
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -1;
      limiter.ratio.value = 20; 
      limiterNodeRef.current = limiter;

      // MASTER GAIN
      const mainGain = ctx.createGain();
      gainNodeRef.current = mainGain;

      source.connect(reverbDry);
      source.connect(reverb);
      reverb.connect(reverbWet);

      source.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(echoWet);

      reverbDry.connect(mainGain);
      reverbWet.connect(mainGain);
      echoWet.connect(mainGain);

      mainGain.connect(limiter);
      limiter.connect(ctx.destination);

      // IMMEDIATE SYNC
      syncAudioNodes();
    } catch (e) {
      console.warn("[AUDIO-SYSTEM] Web Audio failed. Falling back to native.", e);
    }
  }, [syncAudioNodes]);

  useEffect(() => {
    setMounted(true);
    const savedMute = localStorage.getItem('hrat_audio_muted');
    if (savedMute === 'true') setIsMuted(true);
  }, []);

  // Handle Playback State Sync from Master Terminal
  useEffect(() => {
    if (!settings || !audioRef.current || loading) return;
    
    // Ensure graph is established if playing
    if (settings.enabled && settings.audioData && settings.isPlaying) {
       setupAudioGraph();
    }
    
    // Always sync nodes to document parameters
    syncAudioNodes();

    if (settings.enabled && settings.audioData && !error) {
       if (settings.isPlaying) {
          audioRef.current.play().then(() => {
             setIsPlaying(true);
             setShowAutoplayPrompt(false);
             syncAudioNodes(); // Second sync to ensure nodes are at correct state during run
          }).catch((err) => {
             if (err.name === 'NotAllowedError') setShowAutoplayPrompt(true);
             setIsPlaying(false);
          });
       } else {
          audioRef.current.pause();
          setIsPlaying(false);
       }
    } else {
       audioRef.current.pause();
       setIsPlaying(false);
    }
  }, [settings, loading, error, setupAudioGraph, syncAudioNodes]);

  // AUTO-PLAY FALLBACK: Immediate play on first user interaction if blocked
  useEffect(() => {
    if (!showAutoplayPrompt || isPlaying || !mounted) return;

    const handleInteraction = () => {
      if (!audioRef.current || isPlaying || !settings?.isPlaying) return;
      
      setupAudioGraph();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setShowAutoplayPrompt(false);
          setIsMuted(false);
          localStorage.setItem('hrat_audio_muted', 'false');
          syncAudioNodes();
          cleanup();
        })
        .catch(() => {});
    };

    const cleanup = () => {
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return cleanup;
  }, [showAutoplayPrompt, isPlaying, mounted, settings?.isPlaying, setupAudioGraph, syncAudioNodes]);

  const handleManualPlay = () => {
    if (!audioRef.current) return;
    setupAudioGraph();
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setShowAutoplayPrompt(false);
        setIsMuted(false);
        localStorage.setItem('hrat_audio_muted', 'false');
        syncAudioNodes();
      })
      .catch(() => setError(true));
  };

  const handleAudioError = () => {
    if (settings?.audioData) {
      console.error('[AUDIO-SYSTEM] Failed to load broadcast asset.');
      setError(true);
      setIsPlaying(false);
    }
  };

  if (!mounted || loading || !settings?.enabled || !settings?.audioData || !isVisible) return null;

  return (
    <div className="fixed bottom-40 right-6 z-[120] animate-in fade-in-up duration-1000 print:hidden">
      <audio 
        ref={audioRef} 
        src={settings.audioData} 
        onEnded={() => setIsPlaying(false)}
        onError={handleAudioError}
        preload="auto"
      />
      
      <div className="flex flex-col items-end gap-4">
        {showAutoplayPrompt && !error && (
          <button 
            onClick={handleManualPlay}
            className="relative w-20 h-20 md:w-24 md:h-24 rounded-full shadow-2xl border-4 border-accent animate-bounce hover:scale-110 transition-transform overflow-hidden group bg-slate-900"
          >
             <Image src="/handmic.jpeg" alt="Play" fill className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
             <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-8 h-8 text-accent fill-accent drop-shadow-lg" />
             </div>
             <div className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-accent"></span>
             </div>
          </button>
        )}

        <div className="bg-slate-900/90 backdrop-blur-xl p-2.5 rounded-full flex items-center gap-2 transition-all duration-500 hover:ring-2 hover:ring-accent/40 shadow-2xl border border-white/10">
          <div className="flex items-center gap-3 pl-4 pr-2 overflow-hidden max-w-0 group-hover:max-w-[250px] transition-all duration-700 ease-in-out">
             <div className="flex flex-col min-0">
                <div className="flex items-center gap-2 mb-0.5">
                   <div className={cn("w-1.5 h-1.5 rounded-full", error ? "bg-red-500" : "bg-emerald-500 animate-pulse")} />
                   <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap", error ? "text-red-400" : "text-emerald-400")}>
                     {error ? "SYSTEM ERROR" : "MASTER SYNC ACTIVE"}
                   </span>
                </div>
                <span className="text-[11px] font-bold text-white truncate max-w-[150px] opacity-90">
                  {settings.title}
                </span>
             </div>
             <div className="w-px h-6 bg-white/10 shrink-0" />
          </div>

          <div className="flex items-center gap-1">
            {!error && (
               <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setIsMuted(!isMuted); localStorage.setItem('hrat_audio_muted', (!isMuted).toString()); }}
                className={cn("h-10 w-10 rounded-full transition-all", isMuted ? "text-red-500 bg-red-500/10" : "text-accent hover:bg-accent/10")}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsVisible(false)}
              className="h-9 w-9 rounded-full text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
