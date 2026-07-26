
'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc, writeBatch, serverTimestamp, getDocs } from 'firebase/firestore';
import { Radio, MapPin, Loader2, TrendingUp, ExternalLink, Clock, Zap, Languages, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncNews } from '@/ai/flows/sync-news-flow';
import { cn } from '@/lib/utils';

export function CurrentNews({ className }: { className?: string }) {
  const db = useFirestore();
  const [isSyncing, setIsSyncing] = useState(false);
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
    return [...newsItems].sort((a: any, b: any) => {
      // 1. Sort by Scope Priority (1: WB, 2: India, 3: World)
      const pA = a.scopePriority ?? 99;
      const pB = b.scopePriority ?? 99;
      if (pA !== pB) return pA - pB;
      
      // 2. Sort by Recency (Handle pending server timestamps with Date.now() fallback)
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : Date.now();
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : Date.now();
      return dateB - dateA;
    })[0];
  }, [newsItems]);

  // Reset language preference when a new article is loaded
  useEffect(() => {
    setIsBangla(false);
  }, [activeNews?.id]);

  useEffect(() => {
    const triggerSync = async () => {
      if (!db || isSyncing || loading) return;
      
      const lastSync = (meta as any)?.lastSyncAt?.toDate?.() || new Date(0);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      // Trigger if stale (6hrs) or empty registry
      if (hoursSinceSync >= 6 || (!newsItems || newsItems.length === 0)) {
        setIsSyncing(true);
        setErrorType(null);
        try {
          const output = await syncNews({ context: "Autonomous background sync" });
          if (output?.news?.length > 0) {
            const batch = writeBatch(db);
            
            // Deactivate existing news items
            const currentActiveSnap = await getDocs(query(collection(db, 'current_news'), where('isActive', '==', true)));
            currentActiveSnap.docs.forEach(d => batch.update(d.ref, { isActive: false }));

            // Add new processed news items
            output.news.forEach(item => {
              batch.set(doc(collection(db, 'current_news')), { ...item, isActive: true, createdAt: serverTimestamp() });
            });

            // Update sync metadata
            batch.set(doc(db, 'current_news_state', 'registry'), { 
              lastSyncAt: serverTimestamp(), 
              status: output.diagnostics.status 
            }, { merge: true });
            
            await batch.commit();
          } else if (output?.diagnostics?.errorSummary) {
             setErrorType(output.diagnostics.status);
          }
        } catch (e) {
          setErrorType('Network Error');
        } finally {
          setIsSyncing(false);
        }
      }
    };

    if (meta !== undefined) triggerSync();
  }, [db, isSyncing, loading, meta === null ? 'init' : 'stable']);

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

  const hasBangla = !!(activeNews.bengaliTranslation?.title || activeNews.bengaliTranslation?.content);
  const displayData = isBangla && hasBangla ? activeNews.bengaliTranslation : (activeNews.originalEnglish || activeNews);

  return (
    <div className={cn("flex flex-col gap-5 p-7 animate-in fade-in duration-1000 max-w-[420px]", className)}>
      <div className="flex items-center justify-between border-b border-white/20 pb-4">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-[#CEFF00] animate-pulse" />
          <span className="text-[12px] font-black uppercase tracking-[0.3em] text-[#CEFF00]">
            {activeNews.scope || 'India'}
          </span>
        </div>
        {hasBangla && (
          <button 
            onClick={() => setIsBangla(!isBangla)}
            className={cn(
              "p-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-lg", 
              isBangla ? "bg-[#CEFF00] text-primary border-[#CEFF00]" : "bg-white/5 text-[#CEFF00] border-white/10 hover:bg-white/10"
            )}
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black">{isBangla ? 'ENG' : 'BN'}</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm md:text-lg font-headline font-bold text-white leading-tight">
          {displayData.title}
        </h3>
        <p className="text-[10px] md:text-xs text-white/80 font-medium leading-relaxed italic border-l-2 border-[#CEFF00]/40 pl-3">
          {displayData.content}
        </p>
        <Button asChild variant="outline" className="h-10 w-fit rounded-xl border-[#CEFF00]/40 bg-[#CEFF00]/5 text-[#CEFF00] hover:bg-[#CEFF00] hover:text-primary text-[10px] font-black uppercase">
          <a href={activeNews.url} target="_blank">Examine Story <ExternalLink className="w-3 h-3 ml-2" /></a>
        </Button>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/10 opacity-60">
        <span className="text-[8px] font-black uppercase text-white">{activeNews.source}</span>
        <div className="flex items-center pr-32">
          <span className="text-[8px] font-black uppercase text-white flex items-center gap-1">
            <Zap className={cn("w-2.5 h-2.5", isSyncing && "animate-ping")} /> 
            {activeNews.translationStatus === 'Success' ? 'Translated' : 'Live Sync'}
          </span>
        </div>
      </div>
    </div>
  );
}
