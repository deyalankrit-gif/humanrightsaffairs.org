
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RefreshCw, 
  X,
  Speaker
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * AudioAnnouncement: Global institutional broadcast player.
 * Features: Autoplay detection, mute state persistence, and real-time registry sync.
 */
export function AudioAnnouncement() {
  const db = useFirestore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  
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
    if (!mounted || loading || !settings?.enabled || !settings?.audioData) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = settings.volume || 0.5;
    
    if (settings.autoplay && !isMuted) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked by browser
            setShowAutoplayPrompt(true);
          });
      }
    }
  }, [mounted, loading, settings, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      setShowAutoplayPrompt(false);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    localStorage.setItem('hrat_audio_muted', nextMute.toString());
    if (audioRef.current) {
      audioRef.current.muted = nextMute;
    }
  };

  const handleReplay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
    setShowAutoplayPrompt(false);
  };

  if (!mounted || loading || !settings?.enabled || !settings?.audioData || !isVisible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[120] animate-in fade-in slide-in-from-bottom-4 duration-700 print:hidden">
      <audio 
        ref={audioRef} 
        src={settings.audioData} 
        muted={isMuted}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex flex-col items-end gap-3">
        {/* Autoplay/Play Prompt Bubble */}
        {showAutoplayPrompt && (
          <div className="bg-primary text-white p-4 rounded-2xl shadow-2xl border border-white/10 mb-2 max-w-[200px] animate-bounce">
            <p className="text-[10px] font-bold uppercase tracking-widest leading-tight mb-2">Institutional Announcement</p>
            <Button 
              onClick={togglePlay}
              size="sm"
              className="w-full bg-accent text-primary font-black text-[10px] h-8 rounded-lg"
            >
              <Play className="w-3 h-3 mr-2 fill-current" /> LISTEN NOW
            </Button>
          </div>
        )}

        {/* Compact Controller */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl flex items-center gap-2 group hover:bg-slate-900 transition-all duration-300">
          <div className="px-3 py-1 flex flex-col overflow-hidden max-w-0 group-hover:max-w-[150px] transition-all duration-500">
             <span className="text-[8px] font-black text-accent uppercase tracking-[0.2em] whitespace-nowrap">Broadcast</span>
             <span className="text-[10px] font-bold text-white truncate max-w-[120px]">{settings.title || 'Announcement'}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleReplay}
              className="h-8 w-8 rounded-xl text-white/40 hover:text-accent hover:bg-white/5"
              title="Replay"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMute}
              className={cn(
                "h-8 w-8 rounded-xl transition-all",
                isMuted ? "text-red-400 bg-red-500/10" : "text-white/40 hover:text-emerald-400 hover:bg-white/5"
              )}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 rounded-xl text-white/20 hover:text-white hover:bg-red-500/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
