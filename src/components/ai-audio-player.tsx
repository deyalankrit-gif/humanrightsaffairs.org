'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Mic2,
  AlertCircle,
  X,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * AiAudioPlayer: High-fidelity Institutional Announcement Bar.
 * Redesigned for a sleek, minimal vertical footprint.
 * Features: Auto-dismissal upon completion of playback and robust autoplay recovery.
 */
export function AiAudioPlayer({ className }: { className?: string }) {
  const db = useFirestore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasAttemptedAutoplay = useRef(false);
  
  // Web Audio Nodes for Effects
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const reverbWetGainRef = useRef<GainNode | null>(null);
  const reverbDryGainRef = useRef<GainNode | null>(null);
  const echoWetGainRef = useRef<GainNode | null>(null);

  // Listen to Global Command Node
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'audio_announcement');
  }, [db]);

  const { data: settings, loading } = useDoc(settingsRef);

  const setupAudioGraph = useCallback(() => {
    // Proactively resume suspended context on user interaction
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (!audioRef.current || audioCtxRef.current) return;

    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;
      
      const hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = 100;

      const eqPresence = ctx.createBiquadFilter();
      eqPresence.type = 'peaking';
      eqPresence.frequency.value = 3000;
      eqPresence.gain.value = 2;

      const eqAir = ctx.createBiquadFilter();
      eqAir.type = 'highshelf';
      eqAir.frequency.value = 10000;
      eqAir.gain.value = 2;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.ratio.value = 3;

      const reverb = ctx.createConvolver();
      const reverbDuration = 0.6;
      const length = ctx.sampleRate * reverbDuration;
      const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let i = 0; i < 2; i++) {
        const data = impulse.getChannelData(i);
        for (let j = 0; j < length; j++) {
          data[j] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }
      reverb.buffer = impulse;

      const reverbWet = ctx.createGain();
      const reverbDry = ctx.createGain();
      reverbWetGainRef.current = reverbWet;
      reverbDryGainRef.current = reverbDry;

      const echoDelay = ctx.createDelay(1.0);
      echoDelay.delayTime.value = 0.35;
      const echoFeedback = ctx.createGain();
      echoFeedback.gain.value = 0.4;
      const echoWet = ctx.createGain();
      echoWetGainRef.current = echoWet;

      const mainGain = ctx.createGain();
      gainNodeRef.current = mainGain;

      source.connect(hpf);
      hpf.connect(eqPresence);
      eqPresence.connect(eqAir);
      eqAir.connect(compressor);
      
      compressor.connect(reverbDry);
      compressor.connect(reverb);
      reverb.connect(reverbWet);

      compressor.connect(echoDelay);
      echoDelay.connect(echoFeedback);
      echoFeedback.connect(echoDelay);
      echoDelay.connect(echoWet);
      
      reverbDry.connect(mainGain);
      reverbWet.connect(mainGain);
      echoWet.connect(mainGain);
      
      mainGain.connect(ctx.destination);
    } catch (e) {
      console.warn("[AUDIO-PIPELINE] Web Audio initialization failed.", e);
    }
  }, []);

  const syncAudioNodes = useCallback(() => {
    if (!audioCtxRef.current || !settings) return;
    const ctx = audioCtxRef.current;
    const time = ctx.currentTime;

    const vol = isMuted ? 0 : (settings.volume ?? 0.8);
    if (gainNodeRef.current) gainNodeRef.current.gain.setTargetAtTime(vol, time, 0.1);
    
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

  useEffect(() => {
    setMounted(true);
    const savedVol = localStorage.getItem('hrat_audio_vol');
    if (savedVol) setVolume(parseFloat(savedVol));
  }, []);

  useEffect(() => {
    if (!mounted || loading || !settings?.enabled || !settings?.audioData || !audioRef.current || hasCompleted) return;

    const audio = audioRef.current;
    setupAudioGraph();
    syncAudioNodes();

    if (settings.isPlaying && !hasAttemptedAutoplay.current) {
       const playPromise = audio.play();
       if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setAutoplayBlocked(false);
              hasAttemptedAutoplay.current = true;
            })
            .catch((err) => {
              if (err.name === 'NotAllowedError') {
                setAutoplayBlocked(true);
              }
              setIsPlaying(false);
            });
       }
    } else if (!settings.isPlaying) {
       audio.pause();
       setIsPlaying(false);
    }
  }, [settings, loading, mounted, setupAudioGraph, syncAudioNodes, hasCompleted]);

  // AUTO-PLAY FALLBACK: Immediate play on first user interaction if blocked
  useEffect(() => {
    if (!autoplayBlocked || isPlaying || !mounted || hasCompleted) return;

    const handleInteraction = () => {
      if (!audioRef.current || isPlaying || !settings?.isPlaying) return;
      
      setupAudioGraph();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
          hasAttemptedAutoplay.current = true;
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
  }, [autoplayBlocked, isPlaying, mounted, settings?.isPlaying, setupAudioGraph, hasCompleted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoadError(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setHasCompleted(true);
    };
    const handleAudioError = () => {
      if (settings?.audioData) setLoadError(true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [settings?.audioData]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    setupAudioGraph();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().then(() => {
        setAutoplayBlocked(false);
        setLoadError(false);
      }).catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (val: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = val[0];
    setCurrentTime(val[0]);
  };

  const handleVolumeChange = (val: number[]) => {
    const v = val[0];
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = v === 0;
    }
    setIsMuted(v === 0);
    localStorage.setItem('hrat_audio_vol', v.toString());
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!mounted || loading || !settings?.enabled || !settings?.audioData || !isVisible || hasCompleted) return null;

  return (
    <div className={cn("w-full py-1.5 md:py-2 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-all duration-500", className)}>
      <div className="container mx-auto px-4 max-w-7xl">
        <audio 
          ref={audioRef} 
          src={settings.audioData} 
          playsInline 
          autoPlay={settings.isPlaying && !hasAttemptedAutoplay.current}
          preload="auto" 
        />
        
        <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Button 
                onClick={togglePlay}
                disabled={loadError}
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-accent hover:bg-secondary text-primary hover:text-white shadow-sm shrink-0 border-none transition-all active:scale-90"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" /> : <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current ml-0.5" />}
              </Button>

              {autoplayBlocked && !isPlaying && !loadError && (
                <div 
                  className="flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 bg-accent/10 rounded-full border border-accent/20 animate-in zoom-in-95 duration-500 shrink-0 cursor-pointer"
                  onClick={togglePlay}
                >
                  <AlertCircle className="w-2.5 h-2.5 md:w-3 md:h-3 text-accent animate-pulse" />
                  <span className="text-[7px] md:text-[9px] font-black text-accent uppercase tracking-tighter">Interact to Play</span>
                </div>
              )}
            </div>

            <div className="flex md:hidden items-center gap-2">
               <span className="text-[7px] md:text-[8px] font-mono text-slate-500 tabular-nums font-bold">
                 {formatTime(currentTime)} / {formatTime(duration)}
               </span>
               <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsVisible(false)}
                className="h-7 w-7 rounded-lg text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-6 w-full">
            <div className="flex items-center gap-2 min-w-0 shrink-0">
               <Mic2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-accent animate-pulse shrink-0" />
               <div className="min-w-0 flex flex-col">
                  <h2 className="text-[8px] md:text-[11px] font-black text-primary dark:text-white uppercase tracking-tight truncate max-w-[150px] md:max-w-xs leading-none">
                    {settings.title}
                  </h2>
                  <span className="text-[6px] md:text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{settings.category}</span>
               </div>
            </div>

            <div className="flex-1 flex items-center gap-2 md:gap-3 min-w-0 w-full">
              <Slider 
                value={[currentTime]} 
                max={duration || 100} 
                step={0.1} 
                onValueChange={handleSeek}
                disabled={loadError || !duration}
                className="h-1 w-full"
              />
              <span className="hidden md:inline-block text-[8px] font-mono text-slate-500 tabular-nums shrink-0 font-bold">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 shrink-0 pt-1 md:pt-0">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 md:p-1.5 rounded-lg md:rounded-xl border border-slate-100 dark:border-slate-800">
              {isMuted || volume === 0 ? <VolumeX className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-400" /> : <Volume2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-accent" />}
              <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-12 md:w-20" />
            </div>
            
            <div className="flex items-center border-x border-slate-100 dark:border-slate-800 px-1.5 md:px-3 h-6 md:h-7">
              <Select value={playbackSpeed.toString()} onValueChange={v => { setPlaybackSpeed(parseFloat(v)); if(audioRef.current) audioRef.current.playbackRate = parseFloat(v); }}>
                <SelectTrigger className="h-6 md:h-7 w-[50px] md:w-[65px] rounded-md md:rounded-lg bg-slate-50 dark:bg-slate-900 border-none text-[7px] md:text-[8px] font-black uppercase"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 z-[1000] min-w-[60px]">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => <SelectItem key={s} value={s.toString()} className="text-[8px] font-bold">{s}x</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsVisible(false)}
              className="hidden md:flex h-7 w-7 rounded-lg text-slate-300 hover:text-red-500 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
