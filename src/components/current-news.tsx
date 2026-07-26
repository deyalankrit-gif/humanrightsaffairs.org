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

/**
 * CurrentNews: Real-time institutional news broadcast node.
 * Features: 2-hour autonomous sync, on-demand AI translation, and tactical layout.
 */
export function CurrentNews({ className }: { className?: string }) {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isBangla, setIsBangla] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null);

  const metaRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'current_news_state', 'registry');
  }, [db]);

  const { data: meta } = useDoc(metaRef);

  const newsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'current_news'), where('isActive', '==', true));
  }, [db]);

  const { data: newsItems, loading } = useCollection(newsQuery);

  const activeNews = useMemo(() => {
    if (!newsItems || newsItems.length === 0) return null;
    // Sort logic: Prioritize Regional (West Bengal) first, then Recency
    return [...newsItems].sort((a: any, b: any) => {
      const pA = a.scopePriority ?? 99;
      const pB = b.scopePriority ?? 99;
      if (pA !== pB) return pA - pB;
      
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : Date.now();
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : Date.now();
      return dateB - dateA;
    })[0];
  }, [newsItems]);

  // Reset language preference when a new article is cycled
  useEffect(() => {
    setIsBangla(false);
  }, [activeNews?.id]);

  // STABLE DEPENDENCIES: Using primitive values
  const lastSyncTime = (meta as any)?.lastSyncAt?.toDate?.()?.getTime() || 0;
  const activeCount = newsItems?.length || 0;
  const registryStatus = (meta as any)?.status || 'Idle';

  useEffect(() => {
    const triggerSync = async () => {
      if (!db || isSyncing || loading) return;
      
      const lastSyncDate = new Date(lastSyncTime);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceSync >= 2 || activeCount === 0) {
        setIsSyncing(true);
        setErrorType(null);
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
          } else if (output?.diagnostics?.errorSummary) {
             setErrorType(output.diagnostics.status);
          }
        } catch (e) {
          setErrorType('Sync Interrupted');
        } finally {
          setIsSyncing(false);
        }
      }
    };

    if (db) triggerSync();
  }, [db, isSyncing, loading, lastSyncTime, activeCount, registryStatus]);

  const handleTranslateToggle = async () => {
    if (isTranslating || !activeNews) return;

    const hasTranslation = !!(activeNews.bengaliTranslation?.title || activeNews.bengaliTranslation?.content);

    // If we are trying to view Bangla but it's not translated yet
    if (!isBangla && !hasTranslation) {
      setIsTranslating(true);
      try {
        const input = {
          title: activeNews.originalEnglish?.title || activeNews.title || '',
          content: activeNews.originalEnglish?.content || activeNews.content || '',
          category: activeNews.originalEnglish?.category || activeNews.category || 'General'
        };

        const result = await translateNews(input);

        // Persistent update to Firestore registry
        const newsRef = doc(db, 'current_news', activeNews.id);
        await updateDoc(newsRef, {
          bengaliTranslation: result,
          translationStatus: 'Success'
        });

        setIsBangla(true);
        toast({ title: "Translation Established", description: "Article successfully converted to Bengali script." });
      } catch (e: any) {
        console.error("[TRANSLATE-UI] Request Failure:", e);
        toast({ 
          variant: "destructive", 
          title: "Translation Unavailable", 
          description: "AI translation engine is under load. Please retry in a moment." 
        });
      } finally {
        setIsTranslating(false);
      }
    } else {
      // Toggle logic for existing translations
      setIsBangla(!isBangla);
    }
  };

  if (loading && !isSyncing) return (
    <div className={cn("flex flex-col gap-2 p-6 animate-pulse", className)}>
      <Loader2 className="w-5 h-5 animate-spin text-[#CEFF00]" />
      <span className="text-[11px] font-black text-[#CEFF00] uppercase tracking-widest">Auditing Registry...</span>
    </div>
  );

  if (!activeNews) {
    return errorType ? (
      <div className={cn("p-6 text-red-400 flex items-center gap-2", className)}>
        <AlertTriangle className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase">{errorType}</span>
      </div>
    ) : null;
  }

  const hasTranslation = !!(activeNews.bengaliTranslation?.title || activeNews.bengaliTranslation?.content);
  const displayData = isBangla && hasTranslation ? activeNews.bengaliTranslation : (activeNews.originalEnglish || activeNews);

  return (
    <div className={cn("flex flex-col gap-5 p-7 animate-in fade-in duration-1000 max-w-[420px]", className)}>
      <div className="flex items-center justify-between border-b border-white/20 pb-4">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-[#CEFF00] animate-pulse" />
          <span className="text-[12px] font-black uppercase tracking-[0.3em] text-[#CEFF00]">
            {activeNews.scope || 'India'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm md:text-lg font-headline font-bold text-white leading-tight">
          {displayData.title}
        </h3>
        <p className="text-[10px] md:text-xs text-white/80 font-medium leading-relaxed italic border-l-2 border-[#CEFF00]/40 pl-3">
          {displayData.content}
        </p>
        
        <div className="flex items-center gap-2.5 pt-2">
          <Button asChild variant="outline" className="h-8 w-fit rounded-xl border-[#CEFF00]/40 bg-[#CEFF00]/5 text-[#CEFF00] hover:bg-[#CEFF00] hover:text-primary text-[10px] font-black uppercase transition-all shadow-sm">
            <a href={activeNews.url} target="_blank">Examine Story <ExternalLink className="w-3 h-3 ml-1.5" /></a>
          </Button>
          
          <button 
            onClick={handleTranslateToggle}
            disabled={isTranslating}
            title={isTranslating ? "Translating..." : isBangla ? "Switch to English" : "বাংলায় অনুবাদ করুন"}
            className={cn(
              "h-8 px-3 rounded-xl border transition-all flex items-center gap-1.5 shadow-md active:scale-95", 
              isBangla 
                ? "bg-[#CEFF00] text-primary border-[#CEFF00]" 
                : "bg-white/5 text-[#CEFF00] border-white/10 hover:bg-white/10",
              isTranslating && "opacity-70 cursor-wait"
            )}
          >
            {isTranslating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Languages className="w-3.5 h-3.5" />
            )}
            <span className="text-[9px] font-black uppercase tracking-widest">
              {isTranslating ? '...' : isBangla ? 'ENG' : 'BN'}
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/10 opacity-60">
        <span className="text-[8px] font-black uppercase text-white truncate max-w-[120px]">{activeNews.source}</span>
        <div className="flex items-center pr-72">
          <span className="text-[8px] font-black uppercase text-white flex items-center gap-1">
            <Zap className={cn("w-2.5 h-2.5", isSyncing && "animate-ping")} /> 
            {hasTranslation ? 'Translated' : 'Live Sync'}
          </span>
        </div>
      </div>
    </div>
  );
}
