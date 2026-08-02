'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RefreshCw, 
  X,
  Speaker,
  Radio,
  ShieldCheck,
  AlertCircle,
  Zap,
  Activity
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
 * Features: Professional glass-dark aesthetic, subtle animations, and thematic consistency.
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

  useEffect(() => {
    if (!mounted || loading || !settings?.enabled || !settings?.audioData || error) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = settings.volume || 0.5;
    audio.muted = isMuted;
    
    if (settings.autoplay && !isMuted && !isPlaying && audio.readyState >= 1) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setShowAutoplayPrompt(true);
          });
      }
    }
  }, [mounted, loading, settings, isMuted, isPlaying, error]);

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
    setError(true);
    setIsPlaying(false);
  };

  if (!mounted || loading || !settings?.enabled || !settings?.audioData || !isVisible || !isHome) return null;

  return (
    <div className="fixed bottom-40 right-6 z-[120] animate-in fade-in-up duration-1000 print:hidden">
      <audio 
        ref={audioRef} 
        src={settings.audioData} 
        onEnded={() => setIsPlaying(false)}
        onError={handleAudioError}
        className="hidden"
      />
      
      <div className="flex flex-col items-end gap-4">
        {showAutoplayPrompt && !error && (
          <div className="bg-white dark:bg-slate-900 text-primary dark:text-white p-5 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/5 mb-2 max-w-[240px] animate-bounce ring-4 ring-accent/10">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mission Notice</p>
            </div>
            <Button 
              onClick={handleManualPlay}
              size="sm"
              className="w-full bg-primary text-white font-bold text-[10px] h-10 rounded-xl shadow-lg hover:bg-secondary transition-all"
            >
              <Play className="w-3.5 h-3.5 mr-2 fill-current" /> START ANNOUNCEMENT
            </Button>
          </div>
        )}

        <div className={cn(
          "glass-dark p-2 rounded-[1.75rem] shadow-2xl flex items-center gap-1.5 group transition-all duration-500",
          "hover:shadow-accent/10 hover:ring-1 hover:ring-accent/20",
          error ? "border-red-500/30" : "border-white/10"
        )}>
          
          <div className="flex items-center gap-3 pl-3 pr-2 overflow-hidden max-w-0 group-hover:max-w-[220px] transition-all duration-700 ease-in-out">
             <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                   <div className={cn("w-1.5 h-1.5 rounded-full", error ? "bg-red-500" : "bg-emerald-500 animate-pulse")} />
                   <span className={cn(
                     "text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap",
                     error ? "text-red-400" : "text-emerald-400"
                   )}>
                     {error ? "SYSTEM ERROR" : "LIVE BROADCAST"}
                   </span>
                </div>
                <span className="text-[11px] font-bold text-white truncate max-w-[160px] opacity-90">
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
                        className="h-9 w-9 rounded-full text-white/40 hover:text-accent hover:bg-white/5 transition-all"
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
                          isMuted ? "text-red-500 bg-red-500/10" : "text-white/60 hover:text-emerald-400 hover:bg-emerald-500/10"
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
                    className="h-9 w-9 rounded-full text-white/20 hover:text-white hover:bg-red-500/20 transition-all"
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
           <p className="text-[8px] font-black text-white uppercase tracking-[0.4em]">National Registry Audio Station</p>
        </div>
      </div>
    </div>
  );
}
