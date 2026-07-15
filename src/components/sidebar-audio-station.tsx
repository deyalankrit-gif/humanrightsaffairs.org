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
  Check,
  Disc
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

const PLAYLIST = [
  { title: "Institutional Anthem", src: "/HRAT SONG.mp3" },
  { title: "Advocacy Theme", src: "/HRAT SONG.mp3" },
  { title: "Mission Broadcast", src: "/HRAT SONG.mp3" }
];

export function SidebarAudioStation() {
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

    const handlePlayState = () => setIsPlaying(true);
    const handlePauseState = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlayState);
    audio.addEventListener('pause', handlePauseState);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleNext);
    audio.addEventListener('error', () => setError(true));

    return () => {
      audio.removeEventListener('play', handlePlayState);
      audio.removeEventListener('pause', handlePauseState);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleNext);
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

  return (
    <div className="px-3 py-4 space-y-4">
      <audio ref={audioRef} src={PLAYLIST[currentTrackIndex].src} preload="metadata" />
      
      <div className="bg-black/60 rounded-2xl p-4 border border-white/10 space-y-4 shadow-xl">
        {/* Marquee & Title */}
        <div className="space-y-1.5 overflow-hidden">
          <div className="flex items-center gap-1.5">
            <Radio className={cn("w-2.5 h-2.5 text-orange-500", isPlaying && "animate-pulse")} />
            <span className="text-[8px] font-black text-orange-500/60 uppercase tracking-[0.2em]">Live Registry</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap">
            <p className={cn(
              "text-[10px] font-black uppercase text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.6)] inline-block animate-marquee",
              !isPlaying && "animate-none"
            )}>
              {error ? "SYSTEM OFFLINE" : PLAYLIST[currentTrackIndex].title}
            </p>
          </div>
        </div>

        {/* Compact Waveform */}
        <div className="flex items-end gap-0.5 h-3 px-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div 
              key={i} 
              className={cn("flex-1 bg-orange-500 rounded-full transition-all duration-300", isPlaying ? "animate-bounce" : "h-[20%] opacity-20")} 
              style={{ animationDuration: `${0.3 + i * 0.1}s`, height: isPlaying ? `${40 + Math.random() * 60}%` : '20%' }}
            />
          ))}
        </div>

        {/* Main Commands */}
        <div className="flex items-center justify-between gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-7 w-7 text-orange-500/40 hover:text-orange-500">
            <SkipBack className="w-3.5 h-3.5 fill-current" />
          </Button>

          <Button 
            onClick={togglePlay}
            className="h-9 w-9 rounded-full bg-orange-500 text-primary shadow-lg hover:scale-105 transition-all border-none"
          >
            {isPlaying ? <Play className="w-5 h-5 fill-current ml-0.5" /> : <Pause className="w-5 h-5 fill-current" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={handleNext} className="h-7 w-7 text-orange-500/40 hover:text-orange-500">
            <SkipForward className="w-3.5 h-3.5 fill-current" />
          </Button>
        </div>

        {/* Mini Timeline */}
        <div className="space-y-1.5">
          <Slider 
            value={[currentTime]} 
            max={duration || 100} 
            step={0.1}
            onValueChange={handleSeek}
            className="h-1 cursor-pointer"
          />
          <div className="flex justify-between text-[7px] font-bold font-mono text-orange-500/40">
            <span>{Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2,'0')}</span>
            <span>{Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2,'0')}</span>
          </div>
        </div>

        {/* Utility Row */}
        <div className="flex items-center justify-center gap-4 pt-1 border-t border-white/5">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-orange-500/40 hover:text-orange-500 transition-colors">
                  <ListMusic className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" className="bg-slate-900 border-white/10 text-white rounded-xl shadow-2xl p-1.5 w-48">
                 {PLAYLIST.map((t, i) => (
                   <DropdownMenuItem key={i} onClick={() => selectTrack(i)} className={cn("rounded-lg text-[9px] font-bold uppercase py-2", currentTrackIndex === i ? "bg-orange-500/20 text-orange-500" : "text-slate-400")}>
                     {t.title} {currentTrackIndex === i && <Check className="ml-auto w-2.5 h-2.5" />}
                   </DropdownMenuItem>
                 ))}
              </DropdownMenuContent>
           </DropdownMenu>

           <button 
             onClick={toggleLoop}
             className={cn("transition-all", isLooping ? "text-orange-500" : "text-orange-500/40 hover:text-orange-500")}
           >
             <Repeat className="w-3.5 h-3.5" />
           </button>

           <button 
             onClick={() => {
                const audio = audioRef.current;
                if (!audio) return;
                const nextMute = !isMuted;
                setIsMuted(nextMute);
                audio.muted = nextMute;
             }}
             className={cn("transition-all", isMuted ? "text-red-500" : "text-orange-500/40 hover:text-orange-500")}
           >
             {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
           </button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em]">Institutional Audio Node</p>
      </div>
    </div>
  );
}
