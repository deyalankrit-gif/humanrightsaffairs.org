'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
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
 * AiAudioPlayer: Robust Institutional Audio Node.
 * Features a Professional Broadcast Audio Pipeline (Web Audio API).
 * Optimized for singleton execution across public pages via LayoutWrapper.
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
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoPlayAttempted = useRef(false);
  
  // Web Audio Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  /**
   * setupAudioGraph: Initializes the professional broadcast processing pipeline.
   * Chain: Source -> HighPass -> EQ Presence -> EQ Air -> Compressor -> Reverb(Wet/Dry) -> Limiter -> Destination.
   */
  const setupAudioGraph = useCallback(() => {
    if (!audioRef.current || audioCtxRef.current) return;

    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;
      
      // 1. High-Pass Filter (100Hz) - Removes rumble
      const hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = 100;

      // 2. EQ - Presence (3kHz +2dB) - Clarity
      const eqPresence = ctx.createBiquadFilter();
      eqPresence.type = 'peaking';
      eqPresence.frequency.value = 3000;
      eqPresence.gain.value = 2;
      eqPresence.Q.value = 1;

      // 3. EQ - Air (10kHz +2dB) - Brightness
      const eqAir = ctx.createBiquadFilter();
      eqAir.type = 'highshelf';
      eqAir.frequency.value = 10000;
      eqAir.gain.value = 2;

      // 4. Compressor (3:1 Ratio) - Normalization
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 3;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      // 5. Subtle Reverb (Synthesis of Impulse Response)
      const reverb = ctx.createConvolver();
      const reverbDuration = 0.6;
      const length = ctx.sampleRate * reverbDuration;
      const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let i = 0; i < 2; i++) {
        const data = impulse.getChannelData(i);
        for (let j = 0; j < length; j++) {
          data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 2);
        }
      }
      reverb.buffer = impulse;

      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.07; // 7% wet mix

      const dryGain = ctx.createGain();
      dryGain.gain.value = 0.93;

      // 6. Limiter (-1dB) - Prevent clipping
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -1;
      limiter.knee.value = 0;
      limiter.ratio.value = 20;
      limiter.attack.value = 0;
      limiter.release.value = 0.1;

      // Establish Chain
      source.connect(hpf);
      hpf.connect(eqPresence);
      eqPresence.connect(eqAir);
      eqAir.connect(compressor);
      
      // Parallel Reverb Path
      compressor.connect(dryGain);
      compressor.connect(reverb);
      reverb.connect(reverbGain);
      
      // Summing to Limiter
      dryGain.connect(limiter);
      reverbGain.connect(limiter);
      
      limiter.connect(ctx.destination);
    } catch (e) {
      console.warn("[AUDIO-PIPELINE] Web Audio initialization failed. Falling back to native.", e);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const savedVol = localStorage.getItem('hrat_audio_vol');
    if (savedVol) setVolume(parseFloat(savedVol));
  }, []);

  const announcementsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'ai_announcements'), 
      orderBy('updatedAt', 'desc'),
      limit(20)
    );
  }, [db]);

  const { data: list, loading } = useCollection(announcementsQuery);
  
  const activeAnn = useMemo(() => {
    if (!list || list.length === 0) return null;
    return list.find((a: any) => a.status === 'Published');
  }, [list]);

  const triggerPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || autoPlayAttempted.current || loadError) return;

    autoPlayAttempted.current = true;
    setupAudioGraph();
    
    audio.volume = volume;
    audio.muted = isMuted;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
            setAutoplayBlocked(true);
          }
          setIsPlaying(false);
        });
    }
  }, [volume, isMuted, loadError, setupAudioGraph]);

  useEffect(() => {
    if (!mounted || loading || !activeAnn || autoPlayAttempted.current || !audioRef.current) return;

    const audio = audioRef.current;
    const handleCanPlay = () => {
      triggerPlayback();
      audio.removeEventListener('canplaythrough', handleCanPlay);
    };

    if (audio.readyState >= 3) {
      triggerPlayback();
    } else {
      audio.addEventListener('canplaythrough', handleCanPlay);
    }

    return () => audio.removeEventListener('canplaythrough', handleCanPlay);
  }, [mounted, loading, activeAnn, triggerPlayback]);

  useEffect(() => {
    if (!autoplayBlocked || isPlaying || loadError || !audioRef.current) return;

    const handleFirstInteraction = () => {
      if (!audioRef.current || isPlaying) return;
      
      setupAudioGraph();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
          cleanup();
        })
        .catch(() => {});
    };

    const cleanup = () => {
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('mousedown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return cleanup;
  }, [autoplayBlocked, isPlaying, loadError, setupAudioGraph]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoadError(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handleAudioError = () => {
      if (activeAnn?.audioData) setLoadError(true);
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
  }, [activeAnn]);

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

  if (!mounted || loading || !activeAnn || !isVisible) return null;

  return (
    <div className={cn("w-full py-2 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-all duration-500", className)}>
      <div className="container mx-auto px-4 max-w-7xl">
        <audio 
          ref={audioRef} 
          src={activeAnn.audioData} 
          playsInline 
          preload="auto" 
        />
        
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Button 
              onClick={togglePlay}
              disabled={loadError}
              size="icon"
              className="h-9 w-9 rounded-full bg-accent hover:bg-secondary text-primary hover:text-white shadow-sm shrink-0 border-none transition-all active:scale-90"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </Button>

            {autoplayBlocked && !isPlaying && !loadError && (
              <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20 animate-in zoom-in-95 duration-500 shrink-0">
                <AlertCircle className="w-3 h-3 text-accent animate-pulse" />
                <span className="text-[9px] font-black text-accent uppercase tracking-tighter">Interact to Play Broadcast</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-6">
            <div className="flex items-center gap-2 min-w-0 shrink-0">
               <Mic2 className="w-3.5 h-3.5 text-accent animate-pulse shrink-0" />
               <div className="min-w-0 flex flex-col">
                  <h2 className="text-[10px] md:text-xs font-black text-primary dark:text-white uppercase tracking-tight truncate max-w-[150px] md:max-w-xs">
                    {activeAnn.title}
                  </h2>
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{activeAnn.category}</span>
               </div>
            </div>

            <div className="flex-1 flex items-center gap-3 min-w-0">
              <Slider 
                value={[currentTime]} 
                max={duration || 100} 
                step={0.1} 
                onValueChange={handleSeek}
                disabled={loadError || !duration}
                className="h-1 w-full"
              />
              <span className="text-[9px] font-mono text-slate-500 tabular-nums shrink-0 font-bold">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center border-x border-slate-100 dark:border-slate-800 px-3 h-7">
              <Select value={playbackSpeed.toString()} onValueChange={v => { setPlaybackSpeed(parseFloat(v)); if(audioRef.current) audioRef.current.playbackRate = parseFloat(v); }}>
                <SelectTrigger className="h-7 w-[65px] rounded-lg bg-slate-50 dark:bg-slate-900 border-none text-[8px] font-black uppercase"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 z-[1000] min-w-[70px]">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => <SelectItem key={s} value={s.toString()} className="text-[9px] font-bold">{s}x</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-accent" />}
                <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-14" />
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsVisible(false)}
                className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 transition-all"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}