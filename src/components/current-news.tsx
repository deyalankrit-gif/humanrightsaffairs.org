'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc, writeBatch, serverTimestamp, getDocs, updateDoc } from 'firebase/firestore';
import { Radio, MapPin, Loader2, TrendingUp, ExternalLink, Clock, Zap, Languages, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncNews } from '@/ai/flows/sync-news-flow';
import { translateNews } from '@/ai/flows/translate-news-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { JsonLd } from './json-ld';
import { getNewsSchema } from '@/lib/seo-utils';

/**
 * DigitalClock: Isolated timer node with hydration guard.
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
 * CurrentNews: Real-time institutional news broadcast node.
 * Features: 2-hour autonomous sync, persistent AI translation, and fixed layout.
 * Updated: Responsive width and mobile-optimized padding.
 */
export function CurrentNews({ className }: { className?: string }) {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isBangla, setIsBangla] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Registry metadata for sync monitoring
  const metaRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'current_news_state', 'registry');
  }, [db]);

  const { data: meta } = useDoc(metaRef);

  // Real-time news stream
  const newsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'current_news'), where('isActive', '==', true));
  }, [db]);

  const { data: newsItems, loading } = useCollection(newsQuery);

  const activeNews = useMemo(() => {
    if (!mounted || !newsItems || newsItems.length === 0) return null;
    // Prioritize Regional (West Bengal) first, then Recency
    return [...newsItems].sort((a: any, b: any) => {
      const pA = a.scopePriority ?? 99;
      const pB = b.scopePriority ?? 99;
      if (pA !== pB) return pA - pB;
      
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    })[0];
  }, [newsItems, mounted]);

  // Reset language view when news content changes
  useEffect(() => {
    setIsBangla(false);
  }, [activeNews?.id]);

  // Autonomous Sync Logic
  const lastSyncTime = (meta as any)?.lastSyncAt?.toDate?.()?.getTime() || 0;
  const activeCount = (newsItems || []).length;

  useEffect(() => {
    const triggerSync = async () => {
      if (!db || isSyncing || loading || !mounted) return;
      
      const now = new Date().getTime();
      const hoursSinceSync = (now - lastSyncTime) / (1000 * 60 * 60);

      if (hoursSinceSync >= 2 || activeCount === 0) {
        setIsSyncing(true);
        try {
          const output = await syncNews({ context: "Autonomous background sync" });
          if (output?.news?.length > 0) {
            const batch = writeBatch(db);
            const currentActiveSnap = await getDocs(query(collection(db, 'current_news'), where('isActive', '==', true)));
            currentActiveSnap.docs.forEach(d => batch.update(d.ref, { isActive: false }));

            output.news.forEach(item => {
              batch.set(doc(collection(db, 'current_news')), { 
                ...item, 
                isActive: true, 
                createdAt: serverTimestamp() 
              });
            });

            batch.set(doc(db, 'current_news_state', 'registry'), { 
              lastSyncAt: serverTimestamp(), 
              status: output.diagnostics.status 
            }, { merge: true });
            
            await batch.commit();
          }
        } catch (e) {
          console.error("[SYNC-ERROR]", e);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    triggerSync();
  }, [db, isSyncing, loading, lastSyncTime, activeCount, mounted]);

  const handleTranslateToggle = async () => {
    if (isTranslating || !activeNews || !db) return;

    const hasTranslation = !!(activeNews.bengaliTranslation?.title || activeNews.translatedTitle);

    if (!isBangla && !hasTranslation) {
      setIsTranslating(true);
      try {
        const input = {
          title: activeNews.originalEnglish?.title || activeNews.title || '',
          content: activeNews.originalEnglish?.content || activeNews.content || '',
          category: activeNews.originalEnglish?.category || activeNews.category || 'General'
        };

        const result = await translateNews(input);

        const newsRef = doc(db, 'current_news', activeNews.id);
        await updateDoc(newsRef, {
          bengaliTranslation: result,
          translationStatus: 'Success',
          translatedTitle: result.title,
          translatedContent: result.content,
          translatedLanguage: "bn",
          translatedAt: serverTimestamp()
        });

        setIsBangla(true);
        toast({ title: "Translation Established", description: "Bengali version cached in registry." });
      } catch (e: any) {
        toast({ 
          variant: "destructive", 
          title: "Translation Unavailable", 
          description: "AI service is temporarily busy. Please try again." 
        });
      } finally {
        setIsTranslating(false);
      }
    } else {
      setIsBangla(!isBangla);
    }
  };

  const displayData = useMemo(() => {
    if (!activeNews) return null;
    const hasTranslation = !!(activeNews.bengaliTranslation?.title || activeNews.translatedTitle);
    
    if (isBangla && hasTranslation) {
      return activeNews.bengaliTranslation || { 
        title: activeNews.translatedTitle, 
        content: activeNews.translatedContent 
      };
    }
    return activeNews.originalEnglish || activeNews;
  }, [activeNews, isBangla]);

  if (!mounted) return null;

  if (loading && !isSyncing) return (
    <div className={cn("flex flex-col gap-2 p-6 animate-pulse w-full max-w-[420px]", className)}>
      <Loader2 className="w-5 h-5 animate-spin text-[#CEFF00]" />
      <span className="text-[11px] font-black text-[#CEFF00] uppercase tracking-widest">Auditing Registry...</span>
    </div>
  );

  if (!activeNews || !displayData) return null;

  return (
    <>
      <JsonLd data={getNewsSchema(activeNews)} />
      <div className={cn("flex flex-col gap-4 md:gap-5 p-5 md:p-7 animate-in fade-in duration-1000 w-full max-w-[420px] bg-black/40 md:bg-transparent backdrop-blur-md md:backdrop-blur-none", className)}>
        <div className="flex items-center justify-between border-b border-white/20 pb-3 md:pb-4">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#CEFF00] animate-pulse" />
            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#CEFF00]">
              {activeNews.scope || 'India'}
            </span>
          </div>

          <DigitalClock />
        </div>

        <div className="space-y-3 md:space-y-4">
          <h3 className="text-xs md:text-lg font-headline font-bold text-white leading-tight">
            {displayData.title}
          </h3>
          <p className="text-[9px] md:text-xs text-white/80 font-medium leading-relaxed italic border-l-2 border-[#CEFF00]/40 pl-3 line-clamp-3">
            {displayData.content}
          </p>
          
          <div className="flex items-center gap-2 md:gap-2.5 pt-1 md:pt-2">
            <Button asChild variant="outline" className="h-7 md:h-8 w-fit rounded-lg md:rounded-xl border-[#CEFF00]/40 bg-[#CEFF00]/5 text-[#CEFF00] hover:bg-[#CEFF00] hover:text-primary text-[8px] md:text-[10px] font-black uppercase transition-all">
              <a href={activeNews.url} target="_blank" rel="noopener noreferrer">Examine Story <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3 ml-1.5" /></a>
            </Button>
            
            <button 
              onClick={handleTranslateToggle}
              disabled={isTranslating}
              className={cn(
                "h-7 md:h-8 px-3 md:px-4 rounded-lg md:rounded-xl border transition-all flex items-center gap-1.5 active:scale-95", 
                isBangla ? "bg-[#CEFF00] text-primary border-[#CEFF00]" : "bg-white/5 text-[#CEFF00] border-white/10 hover:bg-white/10"
              )}
            >
              {isTranslating ? <Loader2 className="w-3 md:w-3.5 h-3 md:h-3.5 animate-spin" /> : <Languages className="w-3 md:w-3.5 h-3 md:h-3.5" />}
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                {isTranslating ? '...' : isBangla ? 'ORIGINAL' : 'BN'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-white/10 opacity-60 pr-8 md:pr-32 overflow-hidden gap-4">
          <span className="text-[7px] md:text-[8px] font-black uppercase text-white truncate max-w-[100px] md:max-w-[120px] shrink-1">
            {activeNews.source}
          </span>
          
          <div className="flex items-center gap-1 shrink-0">
            <Zap className={cn("w-2 h-2 md:w-2.5 md:h-2.5", isSyncing && "animate-ping")} /> 
            <span className="text-[7px] md:text-[8px] font-black uppercase text-white whitespace-nowrap">
              {isBangla ? 'Translated' : 'Live Sync'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
