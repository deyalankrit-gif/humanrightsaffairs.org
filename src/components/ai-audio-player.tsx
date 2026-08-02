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
 * AiAudioPlayer: High-fidelity public broadcast terminal.
 * Features advanced seek control, volume management, and real-time registry sync.
 * Resilient query: Fetches recent items and filters 'Published' status in memory to avoid index requirements.
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
    // Resilient query: Fetch most recent first, then filter status in memory to bypass index requirements
    return query(
      collection(db, 'ai_announcements'), 
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [db]);

  const { data: list, loading } = useCollection(announcementsQuery);
  
  // Pick the most recent published announcement in memory
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
    <div className={cn("w-full py-12 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800", className)}>
      <div className="container mx-auto px-4">
        <audio ref={audioRef} src={activeAnn.audioData} />
        
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8 md:gap-16">
          
          {/* Metadata Sidebar */}
          <div className="w-full lg:w-72 shrink-0 space-y-4 text-center lg:text-left">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/20">
                <Mic2 className="w-3.5 h-3.5 animate-pulse" /> Official Announcement
             </div>
             <h2 className="text-2xl md:text-4xl font-headline font-bold text-primary dark:text-white leading-tight">
               {activeAnn.title}
             </h2>
             <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Badge variant="outline" className="h-5 px-2 border-slate-200">{activeAnn.category}</Badge></span>
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-accent" /> {activeAnn.publishedTime?.toDate?.()?.toLocaleDateString() || 'Today'}</span>
                <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-accent" /> {formatTime(duration)}</span>
             </div>
          </div>

          {/* Player Terminal */}
          <Card className="flex-1 w-full rounded-[2.5rem] md:rounded-[3.5rem] border-none shadow-2xl bg-primary dark:bg-slate-900 p-6 md:p-10 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
             
             <div className="relative z-10 space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                   <Button 
                    onClick={togglePlay}
                    className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-accent hover:bg-secondary text-primary hover:text-white shadow-2xl transition-all hover:scale-105 active:scale-95 border-none p-0 flex items-center justify-center shrink-0"
                   >
                     {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                   </Button>

                   <div className="flex-1 w-full space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                         <span>Time Elapsed: {formatTime(currentTime)}</span>
                         <span>Remaining: {formatTime(duration - currentTime)}</span>
                      </div>
                      <Slider 
                        value={[currentTime]} 
                        max={duration || 100} 
                        step={0.1} 
                        onValueChange={handleSeek}
                        className="h-2 cursor-pointer"
                      />
                   </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/5">
                   <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" onClick={handleStop} className="h-10 w-10 rounded-full text-white/40 hover:text-red-500 hover:bg-red-500/10"><Square className="w-5 h-5 fill-current" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if(audioRef.current) audioRef.current.currentTime = 0 }} className="h-10 w-10 rounded-full text-white/40 hover:text-accent hover:bg-white/5"><RefreshCw className="w-5 h-5" /></Button>
                      <div className="w-px h-6 bg-white/10 mx-2"></div>
                      <Select value={playbackSpeed.toString()} onValueChange={v => { setPlaybackSpeed(parseFloat(v)); if(audioRef.current) audioRef.current.playbackRate = parseFloat(v); }}>
                         <SelectTrigger className="h-8 w-24 rounded-full bg-white/5 border-white/10 text-white font-bold text-[10px] uppercase"><SelectValue /></SelectTrigger>
                         <SelectContent className="bg-slate-900 border-white/10 text-white min-w-[100px] z-[1000]">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => <SelectItem key={s} value={s.toString()}>{s}x Speed</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="flex flex-1 md:flex-none items-center gap-4 bg-white/5 p-2 rounded-full border border-white/10 min-w-[180px]">
                      <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8 rounded-full text-white/60 hover:text-accent">
                         {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      <Slider 
                        value={[isMuted ? 0 : volume]} 
                        max={1} 
                        step={0.01} 
                        onValueChange={handleVolumeChange}
                        className="w-24 md:w-32"
                      />
                      <span className="text-[8px] font-black text-white/80 w-6 text-center tabular-nums">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                   </div>

                   <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/40 hover:text-white hover:bg-white/10"><Download className="w-5 h-5" /></Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/40 hover:text-white hover:bg-white/10"><Share2 className="w-5 h-5" /></Button>
                   </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}