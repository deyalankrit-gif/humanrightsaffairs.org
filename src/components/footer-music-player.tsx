'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

/**
 * FooterMusicPlayer: A premium, minimalist audio component designed for the institutional footer.
 * Features: Persists through navigation, remembers playback position via localStorage, 
 * and utilizes custom Radix-based controls for a seamless aesthetic fit.
 */
interface FooterMusicPlayerProps {
  src?: string;
  className?: string;
}

export function FooterMusicPlayer({ 
  src = "/HRAT SONG.mp3", 
  className 
}: FooterMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize and load saved position from session memory
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const savedTime = localStorage.getItem('hrat_footer_music_pos');
    if (savedTime) {
      audio.currentTime = parseFloat(savedTime);
      setCurrentTime(parseFloat(savedTime));
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Persist state to prevent loss on refresh
      if (Math.floor(audio.currentTime) % 2 === 0) {
        localStorage.setItem('hrat_footer_music_pos', audio.currentTime.toString());
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      localStorage.setItem('hrat_footer_music_pos', '0');
    };

    const handleError = () => {
      setError(true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        setError(true);
      });
    }
    setIsPlaying(!isPlaying);
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
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      audioRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (nextMuted) {
        setVolume(0);
      } else {
        setVolume(0.5);
        audioRef.current.volume = 0.5;
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("mt-6 w-full max-w-[280px] animate-in fade-in slide-in-from-bottom-2 duration-700", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="p-4 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl space-y-4 transition-all hover:bg-white/10 group">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={togglePlay}
            disabled={error}
            className={cn(
              "h-10 w-10 rounded-full shrink-0 shadow-lg transition-all border border-white/10",
              isPlaying ? "bg-accent text-primary" : "bg-white/10 text-white hover:bg-accent hover:text-primary"
            )}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </Button>

          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
               <span className="flex items-center gap-2">
                 <Music className="w-3 h-3 text-accent" />
                 {error ? "File Missing" : "Trust Melody"}
               </span>
               <span className="text-slate-400 font-mono">
                 {formatTime(currentTime)} / {formatTime(duration)}
               </span>
            </div>
            <Slider 
              value={[currentTime]} 
              max={duration || 100} 
              step={0.1}
              onValueChange={handleSeek}
              disabled={error || !isLoaded}
              className="cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
           <div className="flex items-center gap-3 flex-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMute}
                className="h-6 w-6 p-0 text-slate-500 hover:text-accent transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider 
                value={[volume]} 
                max={1} 
                step={0.01} 
                onValueChange={handleVolumeChange}
                className="w-full max-w-[100px] cursor-pointer"
              />
           </div>
           
           {isPlaying && (
             <div className="flex gap-1 items-end h-4 pr-1">
                {[1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1 bg-accent rounded-full animate-pulse", 
                      i === 1 ? "h-2" : i === 2 ? "h-4" : "h-3"
                    )} 
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
             </div>
           )}
        </div>
      </div>
      <p className="mt-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center opacity-50 group-hover:opacity-100 transition-opacity">
        Institutional Audio Stream
      </p>
    </div>
  );
}
