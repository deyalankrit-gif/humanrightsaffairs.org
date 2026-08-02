'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  Share2, 
  Download,
  Speaker,
  Info,
  Activity,
  Mic2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

/**
 * DigitalClock: Isolated timer node to prevent news card re-renders.
 */
function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  return (
    <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/10 shadow-lg animate-in fade-in duration-1000">
      <div className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
      </div>
      <span className="text-[10px] font-black font-mono bg-gradient-to-r from-accent via-emerald-400 to-sky-400 bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(212,175,55,0.3)] tabular-nums">
        {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
      </span>
    </div>
  );
}

/**
 * AiAudioPlayer: Optimized compact broadcast terminal.
 * Features advanced seek control, volume management, and real-time registry sync in a slim footprint.
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
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const announcementsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'ai_announcements'), 
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [db]);

  const { data: list, loading } = useCollection(announcementsQuery);
  
  const activeAnn = useMemo(() => {
    if (!list || list.length === 0) return null;
    return list.find((a: any) => a.status === 'Published');
  }, [list]);

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
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) audioRef.current.muted = !isMuted;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!mounted || loading || !activeAnn) return null;

  return (
    <div className={cn("w-full py-6 md:py-8 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800", className)}>
      <div className="container mx-auto px-4">
        <audio ref={audioRef} src={activeAnn.audioData} />
        
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-6 md:gap-10">
          
          {/* Compact Metadata */}
          <div className="w-full lg:w-64 shrink-0 space-y-2 text-center lg:text-left">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-accent/20">
                <Mic2 className="w-3 h-3 animate-pulse" /> Official Notice
             </div>
             <h2 className="text-lg md:text-xl font-headline font-bold text-primary dark:text-white leading-tight truncate">
               {activeAnn.title}
             </h2>
             <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Badge variant="outline" className="h-4 px-1.5 border-slate-200 text-[7px]">{activeAnn.category}</Badge></span>
                <span className="flex items-center gap-1"><Activity className="w-2.5 h-2.5 text-accent" /> {formatTime(duration)}</span>
             </div>
          </div>

          {/* Slim Player Terminal */}
          <Card className="flex-1 w-full rounded-[1.75rem] border-none shadow-xl bg-primary dark:bg-slate-900 p-4 md:p-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
             
             <div className="relative z-10 space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                   <Button 
                    onClick={togglePlay}
                    className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-accent hover:bg-secondary text-primary hover:text-white shadow-lg transition-all hover:scale-105 active:scale-95 border-none p-0 flex items-center justify-center shrink-0"
                   >
                     {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                   </Button>

                   <div className="flex-1 w-full space-y-2">
                      <div className="flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-widest">
                         <span>{formatTime(currentTime)}</span>
                         <span>- {formatTime(duration - currentTime)}</span>
                      </div>
                      <Slider 
                        value={[currentTime]} 
                        max={duration || 100} 
                        step={0.1} 
                        onValueChange={handleSeek}
                        className="h-1.5 cursor-pointer"
                      />
                   </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
                   <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={handleStop} className="h-8 w-8 rounded-lg text-white/40 hover:text-red-500 hover:bg-red-500/10"><Square className="w-4 h-4 fill-current" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if(audioRef.current) audioRef.current.currentTime = 0 }} className="h-8 w-8 rounded-lg text-white/40 hover:text-accent hover:bg-white/5"><RefreshCw className="w-4 h-4" /></Button>
                      <div className="w-px h-4 bg-white/10 mx-1"></div>
                      <Select value={playbackSpeed.toString()} onValueChange={v => { setPlaybackSpeed(parseFloat(v)); if(audioRef.current) audioRef.current.playbackRate = parseFloat(v); }}>
                         <SelectTrigger className="h-7 w-20 rounded-lg bg-white/5 border-white/10 text-white font-bold text-[8px] uppercase"><SelectValue /></SelectTrigger>
                         <SelectContent className="bg-slate-900 border-white/10 text-white min-w-[80px] z-[1000]">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => <SelectItem key={s} value={s.toString()}>{s}x</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="flex flex-1 md:flex-none items-center gap-3 bg-white/5 p-1.5 rounded-lg border border-white/10 min-w-[140px]">
                      <Button variant="ghost" size="icon" onClick={toggleMute} className="h-6 w-6 rounded-md text-white/60 hover:text-accent p-0">
                         {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </Button>
                      <Slider 
                        value={[isMuted ? 0 : volume]} 
                        max={1} 
                        step={0.01} 
                        onValueChange={handleVolumeChange}
                        className="w-20 md:w-24"
                      />
                      <span className="text-[7px] font-black text-white/80 w-5 text-center tabular-nums">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                   </div>

                   <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/40 hover:text-white hover:bg-white/10"><Download className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/40 hover:text-white hover:bg-white/10"><Share2 className="w-4 h-4" /></Button>
                   </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
