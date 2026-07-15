'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music, 
  Repeat, 
  Activity, 
  SkipBack, 
  SkipForward, 
  AlertCircle,
  ListMusic,
  Check,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

/**
 * HRAT Audio Station: A premium, highly-organized audio component for the institutional footer.
 * Features structured control zones and refined visual hierarchy.
 */

const PLAYLIST = [
  { title: "Institutional Anthem", src: "/HRAT SONG.mp3" },
  { title: "Mission Theme (Alt)", src: "/HRAT SONG.mp3" }, 
  { title: "Advocacy Call", src: "/HRAT SONG.mp3" }
];

interface FooterMusicPlayerProps {
  className?: string;
}

export function FooterMusicPlayer({ 
  className 
}: FooterMusicPlayerProps) {
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

    const savedTrack = localStorage.getItem('hrat_footer_music_index');
    if (savedTrack) setCurrentTrackIndex(parseInt(savedTrack));

    const savedTime = localStorage.getItem('hrat_footer_music_pos');
    if (savedTime) {
      audio.currentTime = parseFloat(savedTime);
      setCurrentTime(parseFloat(savedTime));
    }

    const savedLoop = localStorage.getItem('hrat_footer_music_loop');
    if (savedLoop === 'true') {
      setIsLooping(true);
      audio.loop = true;
    }

    const savedVolume = localStorage.getItem('hrat_footer_music_vol');
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      audio.volume = vol;
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
      setError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (Math.floor(audio.currentTime) % 2 === 0) {
        localStorage.setItem('hrat_footer_music_pos', audio.currentTime.toString());
      }
    };

    const handleEnded = () => {
      if (isLooping) return;
      handleNext();
    };

    const handleAudioError = () => {
      setError(true);
      setIsPlaying(false);
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
  }, [isLooping]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    localStorage.setItem('hrat_footer_music_index', currentTrackIndex.toString());
    if (isPlaying) {
      audio.load();
      audio.play().catch(() => setError(true));
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => setError(true));
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => selectTrack((currentTrackIndex + 1) % PLAYLIST.length);
  const handlePrevious = () => selectTrack((currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length);

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    localStorage.setItem('hrat_footer_music_pos', '0');
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
    }
  };

  const toggleLoop = () => {
    if (audioRef.current) {
      const nextLoop = !isLooping;
      audioRef.current.loop = nextLoop;
      setIsLooping(nextLoop);
      localStorage.setItem('hrat_footer_music_loop', nextLoop.toString());
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVol = value[0];
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      audioRef.current.muted = newVol === 0;
    }
    setIsMuted(newVol === 0);
    localStorage.setItem('hrat_footer_music_vol', newVol.toString());
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      audioRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (nextMuted) setVolume(0);
      else {
        const savedVol = localStorage.getItem('hrat_footer_music_vol');
        const restoredVol = savedVol ? parseFloat(savedVol) : 0.5;
        setVolume(restoredVol);
        audioRef.current.volume = restoredVol;
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("mt-10 w-full max-w-[380px] group/player", className)}>
      <audio ref={audioRef} src={PLAYLIST[currentTrackIndex].src} preload="metadata" />
      
      <div className="relative p-5 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)] space-y-4 transition-all duration-500 hover:border-orange-500/40 hover:shadow-orange-500/10">
        
        {/* Upper Zone: Information & Visualizer */}
        <div className="flex items-center justify-between gap-4 px-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Radio className={cn("w-3 h-3 text-orange-500", isPlaying && "animate-pulse")} />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500/70">Mission Broadcast</span>
            </div>
            <h4 className="text-[12px] font-black uppercase tracking-wider text-orange-500 truncate">
              {error ? "Broadcast Offline" : PLAYLIST[currentTrackIndex].title}
            </h4>
          </div>

          <div className="flex items-end gap-0.5 h-6 shrink-0 bg-black/30 px-3 rounded-full border border-white/5 items-center">
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className={cn(
                  "w-0.5 bg-orange-500 rounded-full transition-all duration-300", 
                  isPlaying ? "animate-bounce" : "h-1 opacity-30"
                )} 
                style={{ 
                  animationDuration: `${0.4 + i * 0.1}s`,
                  height: isPlaying ? '70%' : '20%' 
                }}
              />
            ))}
          </div>
        </div>

        {/* Middle Zone: Progress & Time */}
        <div className="space-y-2 px-1">
          <Slider 
            value={[currentTime]} 
            max={duration || 100} 
            step={0.1}
            onValueChange={handleSeek}
            disabled={error || !isLoaded}
            className="cursor-pointer"
          />
          <div className="flex justify-between items-center text-[9px] font-bold font-mono text-orange-500/60 tracking-widest px-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Lower Zone: Primary Command Bar */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Main Controls Group */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={error} className="h-8 w-8 rounded-full text-slate-400 hover:text-orange-500 transition-colors">
              <SkipBack className="w-4 h-4 fill-current" />
            </Button>

            <Button 
              onClick={togglePlay}
              disabled={error}
              className={cn(
                "h-12 w-12 rounded-full shrink-0 shadow-2xl transition-all border border-white/10 relative overflow-hidden group/play",
                isPlaying ? "bg-orange-500 text-primary scale-105 shadow-orange-500/30" : "bg-white/10 text-white hover:bg-orange-500 hover:text-primary"
              )}
            >
              {isPlaying && <span className="absolute inset-0 bg-white/20 animate-ping rounded-full"></span>}
              {isPlaying ? <Pause className="w-6 h-6 fill-current relative z-10" /> : <Play className="w-6 h-6 fill-current ml-1 relative z-10" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={handleNext} disabled={error} className="h-8 w-8 rounded-full text-slate-400 hover:text-orange-500 transition-colors">
              <SkipForward className="w-4 h-4 fill-current" />
            </Button>
          </div>

          {/* Volume Command Pod */}
          <div className="flex-1 flex items-center gap-2 bg-black/40 p-1.5 rounded-full border border-white/5 transition-all hover:bg-black/60 group/vol">
            <Button variant="ghost" size="icon" onClick={toggleMute} className="h-7 w-7 text-orange-500 hover:text-white transition-colors shrink-0">
              {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </Button>
            <div className="flex-1 h-1.5">
              <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="cursor-pointer" />
            </div>
            <span className="text-[8px] font-black text-orange-500/80 w-7 text-center tabular-nums mr-1">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Utility Toggles */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-orange-500 hover:text-white hover:bg-white/10">
                  <ListMusic className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900/98 backdrop-blur-3xl border-white/10 text-white rounded-[1.5rem] shadow-2xl p-2 z-[999999]">
                 <p className="px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 mb-1">Select Track</p>
                 {PLAYLIST.map((track, idx) => (
                   <DropdownMenuItem key={idx} onClick={() => selectTrack(idx)} className={cn("rounded-xl focus:bg-orange-500 focus:text-white cursor-pointer transition-all flex items-center justify-between", currentTrackIndex === idx ? "bg-orange-500/20 text-orange-500 font-bold" : "text-slate-300")}>
                     <span className="text-[10px] uppercase tracking-wide truncate">{track.title}</span>
                     {currentTrackIndex === idx && <Check className="w-3 h-3" />}
                   </DropdownMenuItem>
                 ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleLoop} className={cn("h-8 w-8 rounded-full transition-all", isLooping ? "bg-orange-500/20 text-orange-500 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]" : "text-orange-500 hover:text-white")}>
                    <Repeat className={cn("w-4 h-4", isLooping && "animate-spin-slow")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-primary text-white border-none text-[9px] font-black uppercase tracking-widest">
                  {isLooping ? "Loop Active" : "No Loop"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {/* Station ID Tag */}
      <div className="mt-4 flex items-center justify-center gap-3 opacity-60 group-hover/player:opacity-100 transition-opacity">
        <div className="h-px w-6 bg-orange-500/30"></div>
        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] text-center">
          HRAT Audio Station
        </p>
        <div className="h-px w-6 bg-orange-500/30"></div>
      </div>
    </div>
  );
}
