
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download,
  Mic2,
  AlertCircle,
  X
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
 * AiAudioPlayer: High-efficiency Tactical Micro-Node.
 * Optimized for global layout placement with robust automatic playback logic.
 * Handles browser autoplay restrictions gracefully with a non-intrusive prompt.
 * Ensures the announcement plays only once per page load/refresh.
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
  const [isVisible, setIsVisible] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoPlayAttempted = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const announcementsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'ai_announcements'), 
      orderBy('updatedAt', 'desc'),
      limit(10)
    );
  }, [db]);

  const { data: list, loading } = useCollection(announcementsQuery);
  
  const activeAnn = useMemo(() => {
    if (!list || list.length === 0) return null;
    return list.find((a: any) => a.status === 'Published');
  }, [list]);

  /**
   * Autoplay Strategy:
   * 1. Only run once per full page load (tracked via autoPlayAttempted ref).
   * 2. Wait for component mount and Firestore data resolution.
   * 3. Use 'oncanplaythrough' to ensure media buffer is ready.
   * 4. Catch and handle browser policy blocks silently.
   */
  useEffect(() => {
    if (!mounted || loading || !activeAnn || autoPlayAttempted.current || !audioRef.current) return;

    const audio = audioRef.current;
    
    const triggerPlayback = () => {
      if (autoPlayAttempted.current) return;
      autoPlayAttempted.current = true;
      
      // Slight delay ensures DOM is settled and browser media engine is ready
      setTimeout(() => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setAutoplayBlocked(false);
            })
            .catch(() => {
              // Gracefully handle browser autoplay block
              setAutoplayBlocked(true);
              setIsPlaying(false);
            });
        }
      }, 150);
    };

    // If audio is already sufficiently buffered, attempt play immediately
    if (audio.readyState >= 3) {
      triggerPlayback();
    } else {
      audio.oncanplaythrough = () => {
        triggerPlayback();
        // Clean up listener to prevent duplicate triggers
        audio.oncanplaythrough = null;
      };
    }
  }, [mounted, loading, activeAnn]);

  // Unified State Management for the Audio Element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeAnn]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().then(() => {
        setAutoplayBlocked(false);
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
    setVolume(val[0]);
    if (audioRef.current) {
      audioRef.current.volume = val[0];
      audioRef.current.muted = val[0] === 0;
    }
    setIsMuted(val[0] === 0);
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
        <audio ref={audioRef} src={activeAnn.audioData} playsInline preload="auto" />
        
        <div className="flex items-center gap-3 md:gap-4">
          {/* Play/Pause Trigger Node */}
          <div className="flex items-center gap-3 shrink-0">
            <Button 
              onClick={togglePlay}
              size="icon"
              className="h-9 w-9 rounded-full bg-accent hover:bg-secondary text-primary hover:text-white shadow-sm shrink-0 border-none transition-all active:scale-90"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </Button>

            {autoplayBlocked && !isPlaying && (
              <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20 animate-in zoom-in-95 duration-500 shrink-0">
                <AlertCircle className="w-3 h-3 text-accent animate-pulse" />
                <span className="text-[9px] font-black text-accent uppercase tracking-tighter">Tap Play to hear announcement</span>
              </div>
            )}
          </div>

          {/* Unified Progress Stream */}
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
                className="h-1 w-full"
              />
              <span className="text-[9px] font-mono text-slate-500 tabular-nums shrink-0 font-bold">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Utility Stack */}
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
              <div className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {isMuted || volume === 0 ? <VolumeX className="w-3 h-3 text-slate-400" /> : <Volume2 className="w-3 h-3 text-accent" />}
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
