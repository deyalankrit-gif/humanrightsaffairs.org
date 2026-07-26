'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc, setDoc, writeBatch, serverTimestamp, getDocs } from 'firebase/firestore';
import { Radio, MapPin, Loader2, TrendingUp, ExternalLink, Clock, Zap, History, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncNews } from '@/ai/flows/sync-news-flow';
import { translateNews } from '@/ai/flows/translate-news-flow';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * CurrentNews: Automated Live News Display Module.
 * Features: 6-hour autonomous ghost-sync, prioritized scopes (WB > India > World).
 * UI: Fully transparent background with high-contrast bright colors (#CEFF00).
 */
export function CurrentNews({ className }: { className?: string }) {
  const db = useFirestore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBangla, setIsBangla] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [banglaData, setBanglaData] = useState<{title: string, content: string} | null>(null);

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

  // Autonomous Background Sync Trigger (Ghost Sync)
  useEffect(() => {
    const triggerAutoSync = async () => {
      if (!db || isSyncing) return;
      
      const lastSync = (meta as any)?.lastSyncAt?.toDate?.() || new Date(0);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      // Trigger if no news or sync is older than 6 hours
      if (hoursSinceSync >= 6 || (!loading && (!newsItems || newsItems.length === 0))) {
        setIsSyncing(true);
        try {
          const output = await syncNews({ context: `Autonomous 6-hour sync at ${now.toISOString()}` });
          
          if (output && output.news && output.news.length > 0) {
            const batch = writeBatch(db);
            
            // Terminate old broadcast
            const currentActiveSnap = await getDocs(query(collection(db, 'current_news'), where('isActive', '==', true)));
            currentActiveSnap.docs.forEach(d => batch.update(d.ref, { isActive: false }));

            // Establish new broadcast
            output.news.forEach(item => {
              const ref = doc(collection(db, 'current_news'));
              batch.set(ref, {
                ...item,
                isActive: true,
                priority: 1,
                createdAt: serverTimestamp()
              });
            });

            // Update Registry Meta
            batch.set(doc(db, 'current_news_state', 'registry'), {
              lastSyncAt: serverTimestamp(),
              status: 'Success'
            }, { merge: true });

            await batch.commit();
            // Clear old translations when news refreshes
            setBanglaData(null);
            setIsBangla(false);
          }
        } catch (e) {
          console.error("Autonomous Sync Error:", e);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    if (meta !== undefined && !loading) {
      triggerAutoSync();
    }
  }, [meta, db, newsItems, isSyncing, loading]);

  const activeNews = useMemo(() => {
    if (!newsItems || newsItems.length === 0) return null;
    return [...newsItems].sort((a: any, b: any) => {
      const pA = a.scopePriority ?? 99;
      const pB = b.scopePriority ?? 99;
      if (pA !== pB) return pA - pB;
      
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    })[0];
  }, [newsItems]);

  const handleTranslate = async () => {
    if (isBangla) {
      setIsBangla(false);
      return;
    }

    if (banglaData) {
      setIsBangla(true);
      return;
    }

    if (!activeNews) return;

    setIsTranslating(true);
    try {
      const result = await translateNews({
        title: activeNews.title,
        content: activeNews.content
      });
      setBanglaData(result);
      setIsBangla(true);
    } catch (e) {
      console.error("Translation Failed", e);
    } finally {
      setIsTranslating(false);
    }
  };

  if (loading && !isSyncing) {
    return (
      <div className={cn("flex flex-col gap-2 p-6 bg-transparent animate-pulse", className)}>
        <Loader2 className="w-5 h-5 animate-spin text-[#CEFF00]" />
        <span className="text-[11px] font-black text-[#CEFF00] uppercase tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Connecting to Feed...</span>
      </div>
    );
  }

  if (!activeNews) {
    return (
      <div className={cn("flex flex-col gap-3 p-6 bg-transparent", className)}>
         <div className="flex items-center gap-2 pb-3">
           <Radio className="w-4 h-4 text-[#CEFF00] animate-pulse" />
           <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#CEFF00] drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Intelligence Node</span>
         </div>
         <p className="text-[11px] text-white font-bold italic leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
           {isSyncing ? "Establishing connection to national news servers..." : "Registry standby. Waiting for feed synchronization."}
         </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col gap-5 animate-in fade-in slide-in-from-left-6 duration-1000 max-w-[320px] md:max-w-[420px] p-7 bg-transparent relative overflow-hidden group transition-all",
      className
    )}>
      {/* Visualizer Header */}
      <div className="flex items-center justify-between border-b border-white/20 pb-4">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-[#CEFF00] animate-pulse" />
          <span className="text-[12px] font-black uppercase tracking-[0.3em] text-[#CEFF00] drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
            {activeNews.scope === 'West Bengal' ? 'WB Chapter' : activeNews.scope === 'India' ? 'National Update' : 'Global Feed'}
          </span>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={handleTranslate}
             disabled={isTranslating}
             className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#CEFF00] transition-all flex items-center gap-1.5"
             title="Translate to Bangla"
           >
             {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
             <span className="text-[9px] font-black uppercase tracking-widest">{isBangla ? 'ENG' : 'BN'}</span>
           </button>
           {isSyncing && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#CEFF00]/80" />}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
           <MapPin className="w-4 h-4 text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" />
           <span className="text-[10px] font-black text-white/90 uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
             Source: {activeNews.source}
           </span>
        </div>

        <h3 className="text-xs md:text-lg font-headline font-bold text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)] group-hover:text-[#CEFF00] transition-colors duration-500">
          {isBangla && banglaData ? banglaData.title : activeNews.title}
        </h3>
        
        <div className="relative pl-4 border-l-4 border-[#CEFF00]/40">
          <p className="text-[10px] md:text-xs text-white font-medium leading-relaxed italic drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
            {isBangla && banglaData ? banglaData.content : activeNews.content}
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-3">
           <div className="flex items-center gap-5 text-[10px] font-black text-[#CEFF00] uppercase tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {activeNews.publishedAt}</span>
           </div>
           
           <Button 
            asChild
            variant="outline"
            className="h-12 w-fit rounded-2xl border-[#CEFF00]/40 bg-[#CEFF00]/5 text-[#CEFF00] hover:bg-[#CEFF00] hover:text-primary hover:border-[#CEFF00] text-[11px] font-black uppercase tracking-[0.2em] gap-2 transition-all shadow-2xl group-hover:scale-105"
           >
             <a href={activeNews.url} target="_blank" rel="noopener noreferrer">
               Examine Article <ExternalLink className="w-4 h-4" />
             </a>
           </Button>
        </div>
      </div>

      {/* Footer Tags */}
      <div className="flex items-center justify-between pt-3 border-t border-white/20 pr-12">
        <div className="flex items-center gap-2">
           <History className="w-3 h-3 text-white/60" />
           <span className="text-[8px] font-black uppercase tracking-widest text-white/60 drop-shadow-[0_1px_4px_rgba(0,0,0,1)]">
             Node: HRAT-SYNC-L1
           </span>
        </div>
        <div className="flex items-center gap-2">
           <Zap className="w-3 h-3 text-[#CEFF00] animate-pulse opacity-80" />
           <span className="text-[8px] font-black uppercase tracking-widest text-white/60 drop-shadow-[0_1px_4px_rgba(0,0,0,1)]">
             Verified Feed
           </span>
        </div>
      </div>
    </div>
  );
}
