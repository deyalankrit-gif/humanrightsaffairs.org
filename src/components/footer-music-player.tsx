'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Repeat, 
  SkipBack, 
  SkipForward, 
  Radio,
  ListMusic,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

/**
 * HRAT Audio Station: Premium institutional audio component.
 * Features: Neon scrolling title, tactical playback order, session memory.
 */

const PLAYLIST = [
  { title: "Institutional Anthem", src: "/HRAT SONG.mp3" },
  { title: "Advocacy Theme", src: "/HRAT SONG.mp3" },
  { title: "Mission Broadcast", src: "/HRAT SONG.mp3" }
];

export function FooterMusicPlayer({ className }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const savedTrack = localStorage.getItem('hrat_audio_index');
    if (savedTrack) setCurrentTrackIndex(parseInt(savedTrack));

    const savedTime = localStorage.getItem('hrat_audio_pos');
    if (savedTime) {
      audio.currentTime = parseFloat(savedTime);
      setCurrentTime(parseFloat(savedTime));
    }

    const savedVolume = localStorage.getItem('hrat_audio_vol');
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      audio.volume = vol;
    }

    const savedLoop = localStorage.getItem('hrat_audio_loop');
    if (savedLoop === 'true') {
      setIsLooping(true);
      audio.loop = true;
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
      setError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (Math.floor(audio.currentTime) % 2 === 0) {
        localStorage.setItem('hrat_audio_pos', audio.currentTime.toString());
      }
    };

    const handleEnded = () => {
      if (!isLooping) handleNext();
    };

    const handlePlayState = () => setIsPlaying(true);
    const handlePauseState = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlayState);
    audio.addEventListener('pause', handlePauseState);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', () => setError(true));

    return () => {
      audio.removeEventListener('play', handlePlayState);
      audio.removeEventListener('pause', handlePauseState);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isLooping]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    localStorage.setItem('hrat_audio_index', currentTrackIndex.toString());
    if (isPlaying) {
      audio.load();
      audio.play().catch(() => setError(true));
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setError(true));
    }
  };

  const handleNext = () => selectTrack((currentTrackIndex + 1) % PLAYLIST.length);
  const handlePrevious = () => selectTrack((currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length);

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    localStorage.setItem('hrat_audio_pos', '0');
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const toggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    if (audioRef.current) audioRef.current.loop = next;
    localStorage.setItem('hrat_audio_loop', next.toString());
  };

  const handleSeek = (val: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = val[0];
      setCurrentTime(val[0]);
    }
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
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("w-full max-w-[380px] group/player mt-10", className)}>
      <audio ref={audioRef} src={PLAYLIST[currentTrackIndex].src} preload="metadata" />
      
      <div className="relative p-6 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl space-y-5 transition-all duration-500 hover:border-orange-500/40">
        
        {/* Track Info & Visualizer */}
        <div className="flex items-center justify-between gap-4 px-2 overflow-hidden">
          <div className="flex flex-col min-w-0 overflow-hidden flex-1">
            <div className="flex items-center gap-2 mb-1 shrink-0">
              <Radio className={cn("w-3 h-3 text-orange-500", isPlaying && "animate-pulse")} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500/70">Mission Broadcast</span>
            </div>
            {/* Scrolling Title Container */}
            <div className="overflow-hidden w-full whitespace-nowrap">
              <h4 className={cn(
                "text-[12px] font-black uppercase tracking-wider text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] inline-block animate-marquee",
                error && "animate-none"
              )}>
                {error ? "Broadcast Offline" : PLAYLIST[currentTrackIndex].title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-0.5 h-4 shrink-0 px-2 bg-black/30 rounded-full border border-white/5">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={cn("w-0.5 bg-orange-500 rounded-full transition-all duration-300", isPlaying ? "animate-bounce" : "h-1 opacity-30")} 
                style={{ animationDuration: `${0.4 + i * 0.1}s`, height: isPlaying ? '100%' : '20%' }}
              />
            ))}
          </div>
        </div>

        {/* PRIMARY CONTROLS (Above Timeline) */}
        <div className="flex items-center justify-center gap-6 py-1">
          <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-10 w-10 text-orange-500/40 hover:text-orange-500 transition-colors">
            <SkipBack className="w-5 h-5 fill-current" />
          </Button>

          <Button 
            onClick={togglePlay}
            disabled={error}
            className="h-14 w-14 rounded-full bg-orange-500 text-primary shadow-xl shadow-orange-500/20 hover:scale-105 hover:bg-orange-400 transition-all border-none relative overflow-hidden"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={handleNext} className="h-10 w-10 text-orange-500/40 hover:text-orange-500 transition-colors">
            <SkipForward className="w-5 h-5 fill-current" />
          </Button>
        </div>

        {/* Audio Timeline */}
        <div className="space-y-2 px-1">
          <Slider 
            value={[currentTime]} 
            max={duration || 100} 
            step={0.1}
            onValueChange={handleSeek}
            disabled={error || !isLoaded}
            className="cursor-pointer"
          />
          <div className="flex justify-between items-center text-[9px] font-bold font-mono text-orange-500/60 tracking-widest px-1 uppercase">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Utility Bar */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex-1 flex items-center gap-2 bg-black/40 p-2 rounded-full border border-white/5 transition-all hover:bg-black/60">
            <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="h-7 w-7 text-orange-500 shrink-0 p-0">
              {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </Button>
            <div className="flex-1 h-1.5">
              <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="cursor-pointer" />
            </div>
            <span className="text-[8px] font-black text-orange-500/80 w-6 text-center tabular-nums">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-orange-500/60 hover:text-orange-500">
                  <ListMusic className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10 text-white rounded-2xl shadow-2xl p-2">
                 <p className="px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 mb-1">Select Track</p>
                 {PLAYLIST.map((track, idx) => (
                   <DropdownMenuItem key={idx} onClick={() => selectTrack(idx)} className={cn("rounded-xl focus:bg-orange-500 focus:text-white cursor-pointer mb-0.5", currentTrackIndex === idx ? "bg-orange-500/20 text-orange-500" : "text-slate-300")}>
                     <span className="text-[10px] uppercase font-bold tracking-wide truncate">{track.title}</span>
                     {currentTrackIndex === idx && <Check className="ml-auto w-3 h-3" />}
                   </DropdownMenuItem>
                 ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleLoop}
              className={cn("h-8 w-8 rounded-full transition-all", isLooping ? "bg-orange-500/20 text-orange-500 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]" : "text-orange-500/60 hover:text-orange-500")}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-3 opacity-60">
        <div className="h-px w-6 bg-orange-500/30"></div>
        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">HRAT Audio Station</p>
        <div className="h-px w-6 bg-orange-500/30"></div>
      </div>
    </div>
  );
}
