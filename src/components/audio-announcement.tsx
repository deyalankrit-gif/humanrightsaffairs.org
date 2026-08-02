'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RefreshCw, 
  X,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * AudioAnnouncement: Refined institutional broadcast player.
 * Optimized for automatic playback on refresh while respecting browser policies.
 * Background set to fully transparent.
 * Icons updated to specific blue color #2563EB as per user request.
 */
export function AudioAnnouncement() {
  const db = useFirestore();
  const pathname = usePathname();
  const isHome = pathname === '/';
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const announcementRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'audio_announcement');
  }, [db]);

  const { data: settings, loading } = useDoc(announcementRef);

  useEffect(() => {
    setMounted(true);
    const savedMute = localStorage.getItem('hrat_audio_muted');
    if (savedMute === 'true') setIsMuted(true);
  }, []);

  const attemptPlay = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !settings?.enabled || isMuted || error) return;

    audio.volume = settings.volume ?? 0.5;
    audio.muted = isMuted;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setShowAutoplayPrompt(false);
          setError(false);
        })
        .catch((err) => {
          console.warn("[AUDIO-AUTOPLAY] Playback blocked:", err.name);
          setShowAutoplayPrompt(true);
          setIsPlaying(false);
        });
    }
  }, [settings, isMuted, error]);

  useEffect(() => {
    if (!mounted || loading || !settings?.enabled || !settings?.audioData || error) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = isMuted;

    if (settings.autoplay && !isMuted) {
      if (audio.readyState >= 2) {
        attemptPlay();
      }
    }
  }, [mounted, loading, settings, isMuted, error, attemptPlay]);

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    localStorage.setItem('hrat_audio_muted', nextMute.toString());
    
    if (audioRef.current) {
      audioRef.current.muted = nextMute;
      if (!nextMute && audioRef.current.paused && !error) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setShowAutoplayPrompt(false);
        }).catch(() => {});
      } else if (nextMute) {
        setIsPlaying(false);
        audioRef.current.pause();
      }
    }
  };

  const handleManualPlay = () => {
    if (!audioRef.current || error) return;
    audioRef.current.muted = false;
    setIsMuted(false);
    localStorage.setItem('hrat_audio_muted', 'false');
    
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      setShowAutoplayPrompt(false);
    }).catch(() => setError(true));
  };

  const handleReplay = () => {
    if (!audioRef.current || error) return;
    audioRef.current.currentTime = 0;
    audioRef.current.muted = false;
    setIsMuted(false);
    localStorage.setItem('hrat_audio_muted', 'false');
    
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      setShowAutoplayPrompt(false);
    }).catch(() => setError(true));
  };

  const handleAudioError = () => {
    if (settings?.audioData) {
      setError(true);
      setIsPlaying(false);
    }
  };

  if (!mounted || loading || !settings?.enabled || !settings?.audioData || !isVisible || !isHome) return null;

  return (
    <div className="fixed bottom-40 right-6 z-[120] animate-in fade-in-up duration-1000 print:hidden">
      <audio 
        ref={audioRef} 
        src={settings.audioData} 
        onCanPlay={attemptPlay}
        onEnded={() => setIsPlaying(false)}
        onError={handleAudioError}
        preload="auto"
      />
      
      <div className="flex flex-col items-end gap-4">
        {showAutoplayPrompt && !error && (
          <button 
            onClick={handleManualPlay}
            className="relative w-20 h-20 md:w-24 md:h-24 rounded-full shadow-2xl border-4 border-[#2563EB] animate-bounce hover:scale-110 transition-transform overflow-hidden group bg-transparent"
          >
             <Image 
               src="/handmic.jpeg" 
               alt="Play" 
               fill 
               className="object-cover group-hover:scale-110 transition-transform duration-500"
             />
             <div className="absolute inset-0 bg-transparent flex items-center justify-center">
                <Play className="w-8 h-8 text-[#2563EB] fill-[#2563EB] drop-shadow-lg" />
             </div>
             <div className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#2563EB]"></span>
             </div>
          </button>
        )}

        <div className={cn(
          "bg-transparent p-2 rounded-[1.75rem] flex items-center gap-1.5 group transition-all duration-500",
          "hover:ring-1 hover:ring-[#2563EB]/20",
          error ? "border-red-500/30" : "border-white/10"
        )}>
          
          <div className="flex items-center gap-3 pl-3 pr-2 overflow-hidden max-w-0 group-hover:max-w-[220px] transition-all duration-700 ease-in-out">
             <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                   <div className={cn("w-1.5 h-1.5 rounded-full", error ? "bg-red-500" : "bg-emerald-500 animate-pulse")} />
                   <span className={cn(
                     "text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap drop-shadow-sm",
                     error ? "text-red-400" : "text-emerald-400"
                   )}>
                     {error ? "SYSTEM ERROR" : "LIVE BROADCAST"}
                   </span>
                </div>
                <span className="text-[11px] font-bold text-white truncate max-w-[160px] opacity-90 drop-shadow-md">
                  {error ? "Asset unavailable" : (settings.title || 'Official Update')}
                </span>
             </div>
             <div className="w-px h-6 bg-white/10 shrink-0" />
          </div>

          <div className="flex items-center gap-1">
            {!error && (
              <TooltipProvider>
                <div className="flex items-center gap-1">
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleReplay}
                        className="h-9 w-9 rounded-full text-[#2563EB] hover:text-[#2563EB] hover:bg-white/5 transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-primary text-white border-none text-[10px] font-bold uppercase">Replay</TooltipContent>
                  </Tooltip>

                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleMute}
                        className={cn(
                          "h-10 w-10 rounded-full transition-all duration-500",
                          isMuted ? "text-red-500 bg-red-500/10" : "text-[#2563EB] hover:text-[#2563EB] hover:bg-emerald-500/10"
                        )}
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-primary text-white border-none text-[10px] font-bold uppercase">
                      {isMuted ? 'Unmute' : 'Mute'}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            )}

            {error && (
              <div className="p-2 text-red-500 animate-pulse">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}

            <div className="w-px h-6 bg-white/10 mx-1" />

            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsVisible(false)}
                    className="h-9 w-9 rounded-full text-[#2563EB]/40 hover:text-[#2563EB] hover:bg-red-500/20 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-primary text-white border-none text-[10px] font-bold uppercase">Dismiss</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="pr-3 opacity-0 group-hover:opacity-40 transition-all duration-700 delay-100">
           <p className="text-[8px] font-black text-white uppercase tracking-[0.4em] drop-shadow-sm">National Registry Audio Station</p>
        </div>
      </div>
    </div>
  );
}
