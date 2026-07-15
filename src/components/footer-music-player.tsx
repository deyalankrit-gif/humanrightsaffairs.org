'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Repeat, Activity, SkipBack, SkipForward, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * FooterMusicPlayer: A high-fidelity, feature-rich audio component for the institutional footer.
 * Features: Playlist support, Persistent session memory, Visual equalizer, and Precise volume/seek controls.
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

  // Initialize and load saved position/loop/track preference from session memory
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Load saved states
    const savedTrack = localStorage.getItem('hrat_footer_music_index');
    if (savedTrack) {
      setCurrentTrackIndex(parseInt(savedTrack));
    }

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
      // Persist state periodically
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

  // Handle track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    localStorage.setItem('hrat_footer_music_index', currentTrackIndex.toString());
    
    // If it was playing, play the new track automatically
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
      audioRef.current.play().catch(() => {
        setError(true);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    setCurrentTrackIndex(nextIndex);
    localStorage.setItem('hrat_footer_music_pos', '0');
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
    }
  };

  const handlePrevious = () => {
    const prevIndex = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIndex(prevIndex);
    localStorage.setItem('hrat_footer_music_pos', '0');
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
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
      if (nextMuted) {
        setVolume(0);
      } else {
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
    <div className={cn("mt-8 w-full max-w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-1000", className)}>
      <audio 
        ref={audioRef} 
        src={PLAYLIST[currentTrackIndex].src} 
        preload="metadata" 
      />
      
      <div className="relative p-5 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] space-y-4 group transition-all hover:border-accent/30 hover:bg-white/10">
        
        {/* Playback Control Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePrevious}
              disabled={error}
              className="h-8 w-8 rounded-full text-slate-400 hover:text-accent transition-colors"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={togglePlay}
              disabled={error}
              className={cn(
                "h-12 w-12 rounded-full shrink-0 shadow-2xl transition-all border border-white/10 relative overflow-hidden group/play",
                isPlaying ? "bg-accent text-primary scale-110 shadow-accent/20" : "bg-white/5 text-white hover:bg-accent hover:text-primary"
              )}
            >
              {isPlaying && (
                <span className="absolute inset-0 bg-white/20 animate-ping rounded-full pointer-events-none"></span>
              )}
              {isPlaying ? <Pause className="w-6 h-6 fill-current relative z-10" /> : <Play className="w-6 h-6 fill-current ml-1 relative z-10" />}
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNext}
              disabled={error}
              className="h-8 w-8 rounded-full text-slate-400 hover:text-accent transition-colors"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </Button>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2 overflow-hidden">
                 <div className="flex gap-0.5 items-end h-3 w-4 shrink-0">
                    {[1, 2, 3, 4].map(i => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-0.5 bg-accent rounded-full transition-all duration-300", 
                          isPlaying ? "animate-bounce" : "h-1"
                        )} 
                        style={{ 
                          animationDuration: `${0.5 + i * 0.1}s`,
                          height: isPlaying ? '100%' : '20%' 
                        }}
                      />
                    ))}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 truncate transition-colors">
                   {error ? "File Unavailable" : PLAYLIST[currentTrackIndex].title}
                 </span>
               </div>
               <span className="text-[9px] font-mono text-orange-500 bg-black/20 px-2 py-0.5 rounded-md border border-white/5">
                 {formatTime(currentTime)}
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

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-6 pt-1 border-t border-white/5">
           <div className="flex items-center gap-3 flex-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMute}
                className="h-8 w-8 text-orange-500 hover:text-white transition-colors shrink-0"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider 
                value={[volume]} 
                max={1} 
                step={0.01} 
                onValueChange={handleVolumeChange}
                className="w-full max-w-[80px] cursor-pointer"
              />
           </div>
           
           <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={toggleLoop}
                      className={cn(
                        "h-8 w-8 rounded-lg transition-all",
                        isLooping ? "bg-accent/20 text-accent" : "text-orange-500 hover:text-white"
                      )}
                    >
                      <Repeat className={cn("w-4 h-4", isLooping && "animate-spin-slow")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-primary text-white border-none text-[10px] font-bold uppercase">
                    {isLooping ? "Disable Loop" : "Enable Loop"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="h-4 w-px bg-white/10 mx-1"></div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                 {error ? (
                   <>
                     <AlertCircle className="w-3 h-3 text-red-500" />
                     <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Error</span>
                   </>
                 ) : (
                   <>
                     <Activity className={cn("w-3 h-3 transition-colors", isPlaying ? "text-emerald-500" : "text-orange-500")} />
                     <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">
                       {isPlaying ? "Live" : "Idle"}
                     </span>
                   </>
                 )}
              </div>
           </div>
        </div>
      </div>
      <p className="mt-3 text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] text-center opacity-80 group-hover:opacity-100 transition-opacity">
        HRAT Audio Station
      </p>
    </div>
  );
}
