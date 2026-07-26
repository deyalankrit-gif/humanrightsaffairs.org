
'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc, writeBatch, serverTimestamp, getDocs } from 'firebase/firestore';
import { Radio, MapPin, Loader2, TrendingUp, ExternalLink, Clock, Zap, History, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncNews } from '@/ai/flows/sync-news-flow';
import { cn } from '@/lib/utils';

/**
 * CurrentNews: Automated Live News Display Module.
 * Features: Automated Background Translation, Prioritized Scopes.
 * Optimized for real-time synchronization with dual-language support.
 */
export function CurrentNews({ className }: { className?: string }) {
  const db = useFirestore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBangla, setIsBangla] = useState(false);

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
      const pA = a.scopePriority ?? 99;
      const pB = b.scopePriority ?? 99;
      if (pA !== pB) return pA - pB;
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    })[0];
  }, [newsItems]);

  // Ghost Sync: Trigger every 6 hours
  useEffect(() => {
    const triggerAutoSync = async () => {
      if (!db || isSyncing) return;
      const lastSync = (meta as any)?.lastSyncAt?.toDate?.() || new Date(0);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      if (hoursSinceSync >= 6 || (!loading && (!newsItems || newsItems.length === 0))) {
        setIsSyncing(true);
        try {
          const output = await syncNews({ context: `Autonomous translation-enabled sync at ${now.toISOString()}` });
          if (output?.news?.length > 0) {
            const batch = writeBatch(db);
            const currentActiveSnap = await getDocs(query(collection(db, 'current_news'), where('isActive', '==', true)));
            currentActiveSnap.docs.forEach(d => batch.update(d.ref, { isActive: false }));

            output.news.forEach(item => {
              const ref = doc(collection(db, 'current_news'));
              batch.set(ref, {
                ...item,
                isActive: true,
                priority: 1,
                createdAt: serverTimestamp()
              });
            });

            batch.set(doc(db, 'current_news_state', 'registry'), {
              lastSyncAt: serverTimestamp(),
              status: 'Success'
            }, { merge: true });

            await batch.commit();
          }
        } catch (e) {
          console.error("Autonomous Sync Error:", e);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    if (meta !== undefined && !loading) triggerAutoSync();
  }, [meta, db, newsItems, isSyncing, loading]);

  if (loading && !isSyncing) {
    return (
      <div className={cn("flex flex-col gap-2 p-6 bg-transparent animate-pulse", className)}>
        <Loader2 className="w-5 h-5 animate-spin text-[#CEFF00]" />
        <span className="text-[11px] font-black text-[#CEFF00] uppercase tracking-[0.2em] drop-shadow-lg">Connecting...</span>
      </div>
    );
  }

  if (!activeNews) return null;

  // Adaptive data selection based on language toggle
  const displayData = isBangla && activeNews.bengaliTranslation 
    ? activeNews.bengaliTranslation 
    : activeNews.originalEnglish || { title: activeNews.title, content: activeNews.content, category: activeNews.category };

  return (
    <div className={cn(
      "flex flex-col gap-5 animate-in fade-in slide-in-from-left-6 duration-1000 max-w-[320px] md:max-w-[420px] p-7 bg-transparent relative overflow-hidden group",
      className
    )}>
      <div className="flex items-center justify-between border-b border-white/20 pb-4">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-[#CEFF00] animate-pulse" />
          <span className="text-[12px] font-black uppercase tracking-[0.3em] text-[#CEFF00] drop-shadow-lg">
            {activeNews.scope || 'Update'}
          </span>
        </div>
        <button 
          onClick={() => setIsBangla(!isBangla)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#CEFF00] transition-all flex items-center gap-1.5 shadow-xl"
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase tracking-widest">{isBangla ? 'ENG' : 'BN'}</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
           <MapPin className="w-4 h-4 text-emerald-400 drop-shadow-md" />
           <span className="text-[10px] font-black text-white/90 uppercase tracking-widest drop-shadow-md">
             {activeNews.source}
           </span>
        </div>

        <h3 className="text-xs md:text-lg font-headline font-bold text-white leading-tight drop-shadow-lg group-hover:text-[#CEFF00] transition-colors duration-500">
          {displayData.title}
        </h3>
        
        <div className="relative pl-4 border-l-4 border-[#CEFF00]/40">
          <p className="text-[10px] md:text-xs text-white font-medium leading-relaxed italic drop-shadow-md">
            {displayData.content}
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-3">
           <div className="flex items-center gap-5 text-[10px] font-black text-[#CEFF00] uppercase tracking-wider">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {activeNews.publishedAt}</span>
           </div>
           
           <Button 
            asChild
            variant="outline"
            className="h-12 w-fit rounded-2xl border-[#CEFF00]/40 bg-[#CEFF00]/5 text-[#CEFF00] hover:bg-[#CEFF00] hover:text-primary text-[11px] font-black uppercase tracking-widest gap-2 shadow-2xl"
           >
             <a href={activeNews.url} target="_blank" rel="noopener noreferrer">
               Examine Article <ExternalLink className="w-4 h-4" />
             </a>
           </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/20 pr-20 opacity-60">
        <div className="flex items-center gap-2">
           <History className="w-3 h-3 text-white" />
           <span className="text-[8px] font-black uppercase tracking-widest text-white">HRAT-AUTO-SYNC</span>
        </div>
        <div className="flex items-center gap-2">
           <Zap className="w-3 h-3 text-[#CEFF00] animate-pulse" />
           <span className="text-[8px] font-black uppercase tracking-widest text-white">
             {activeNews.translationStatus === 'Success' ? 'Translated' : 'English Only'}
           </span>
        </div>
      </div>
    </div>
  );
}
