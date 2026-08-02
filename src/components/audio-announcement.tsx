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
 * AudioAnnouncement: Global institutional broadcast player with sleek homepage controls.
 * Features: Autoplay detection, mute state persistence, and real-time registry sync.
 * Updated: Defensive rendering and error handling for "no supported sources" browser errors.
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

  // Initialize mounting and local preferences
  useEffect(() => {
    setMounted(true);
    const savedMute = localStorage.getItem('hrat_audio_muted');
    if (savedMute === 'true') setIsMuted(true);
  }, []);

  // Handle Audio Logic & Autoplay
  useEffect(() => {
    if (!mounted || loading || !settings?.enabled || !settings?.audioData || error) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = settings.volume || 0.5;
    audio.muted = isMuted;
    
    // Attempt Autoplay only if not explicitly muted by user and element is ready
    if (settings.autoplay && !isMuted && !isPlaying && audio.readyState >= 1) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked by browser policy
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
      // If unmuting, try to play if not already playing
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

  // Only render on Home and when essential data is present
  if (!mounted || loading || !settings?.enabled || !settings?.audioData || !isVisible || !isHome) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[120] animate-in fade-in slide-in-from-right-4 duration-700 print:hidden">
      <audio 
        ref={audioRef} 
        src={settings.audioData} 
        onEnded={() => setIsPlaying(false)}
        onError={handleAudioError}
        className="hidden"
      />
      
      <div className="flex flex-col items-end gap-3">
        {/* Autoplay/Manual Play Bubble Prompt */}
        {showAutoplayPrompt && !error && (
          <div className="bg-primary text-white p-4 rounded-2xl shadow-2xl border border-white/10 mb-2 max-w-[220px] animate-bounce">
            <div className="flex items-center gap-2 mb-2">
               <Radio className="w-3 h-3 text-accent animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Institutional Notice</p>
            </div>
            <Button 
              onClick={handleManualPlay}
              size="sm"
              className="w-full bg-accent text-primary font-black text-[10px] h-9 rounded-xl shadow-lg hover:bg-secondary hover:text-white transition-all"
            >
              <Play className="w-3 h-3 mr-2 fill-current" /> LISTEN TO BROADCAST
            </Button>
          </div>
        )}

        {/* Sleek Floating Control Pill */}
        <div className={cn(
          "bg-slate-900/90 backdrop-blur-xl border p-1.5 rounded-2xl shadow-2xl flex items-center gap-1 group transition-all duration-300 ring-1 ring-white/5",
          error ? "border-red-500/50" : "border-white/10 hover:bg-slate-900"
        )}>
          
          {/* Status Context (Revealed on Hover) */}
          <div className="px-3 py-1 flex flex-col overflow-hidden max-w-0 group-hover:max-w-[180px] transition-all duration-500 ease-in-out">
             <div className="flex items-center gap-1.5">
               <span className={cn(
                 "text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap",
                 error ? "text-red-400" : "text-emerald-400"
               )}>
                 {error ? "Broadcast Error" : "Live Broadcast"}
               </span>
               {!error && <div className="h-1 w-1 rounded-full bg-emerald-500 animate-ping"></div>}
             </div>
             <span className="text-[10px] font-bold text-white truncate max-w-[140px]">
               {error ? "No supported sources" : (settings.title || 'Official Announcement')}
             </span>
          </div>

          {/* Action Buttons Tray */}
          <div className="flex items-center gap-1">
            {!error && (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleReplay}
                      className="h-9 w-9 rounded-xl text-white/40 hover:text-accent hover:bg-white/5 transition-colors"
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
                        "h-9 w-9 rounded-xl transition-all duration-300",
                        isMuted ? "text-red-500 bg-red-500/10 shadow-inner" : "text-white/40 hover:text-emerald-400 hover:bg-white/5"
                      )}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-primary text-white border-none text-[10px] font-bold uppercase">
                    {isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {error && (
              <div className="p-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}

            <div className="w-px h-5 bg-white/10 mx-1" />

            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsVisible(false)}
                    className="h-9 w-9 rounded-xl text-white/10 hover:text-white hover:bg-red-500/20 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-primary text-white border-none text-[10px] font-bold uppercase">Dismiss</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Subtle Branding Tag */}
        <div className="pr-2 opacity-0 group-hover:opacity-40 transition-opacity duration-500">
           <p className="text-[7px] font-black text-white uppercase tracking-[0.4em]">National Audio Registry</p>
        </div>
      </div>
    </div>
  );
}
