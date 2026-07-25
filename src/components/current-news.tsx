
'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Radio, MapPin, Globe, Loader2, TrendingUp, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncNews } from '@/ai/flows/sync-news-flow';
import { cn } from '@/lib/utils';

/**
 * CurrentNews: Automated Live News Display Module.
 * Features: 6-hour auto-sync, prioritized scope (WB > IN > WORLD), 10-line limit.
 */
export function CurrentNews({ className }: { className?: string }) {
  const db = useFirestore();
  const [isSyncing, setIsSyncing] = useState(false);

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

  // Auto-Sync Logic: Triggers if last sync was > 6 hours ago
  useEffect(() => {
    const triggerAutoSync = async () => {
      if (!db || isSyncing) return;
      
      const lastSync = (meta as any)?.lastSyncAt?.toDate?.() || new Date(0);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      if (hoursSinceSync >= 6) {
        setIsSyncing(true);
        try {
          const output = await syncNews({ context: `Automatic 6-hour sync at ${now.toISOString()}` });
          
          const batch = writeBatch(db);
          
          // Archive old news
          if (newsItems) {
            newsItems.forEach(item => {
              batch.update(doc(db, 'current_news', item.id), { isActive: false });
            });
          }

          // Insert new news
          output.news.forEach(item => {
            const ref = doc(collection(db, 'current_news'));
            batch.set(ref, {
              ...item,
              isActive: true,
              priority: 1,
              createdAt: serverTimestamp()
            });
          });

          // Update meta
          batch.set(doc(db, 'current_news_state', 'registry'), {
            lastSyncAt: serverTimestamp(),
            status: 'Success'
          }, { merge: true });

          await batch.commit();
        } catch (e) {
          console.error("Auto-sync failed:", e);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    if (meta !== undefined) {
      triggerAutoSync();
    }
  }, [meta, db, newsItems, isSyncing]);

  const activeNews = useMemo(() => {
    if (!newsItems || newsItems.length === 0) return null;
    
    // Strict Priority Sorting: WB(1) > India(2) > World(3)
    return [...newsItems].sort((a: any, b: any) => {
      const pA = a.scopePriority ?? 99;
      const pB = b.scopePriority ?? 99;
      if (pA !== pB) return pA - pB;
      
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    })[0];
  }, [newsItems]);

  if (loading) {
    return (
      <div className={cn("flex flex-col gap-2 p-6 glass-dark rounded-2xl border-white/10 animate-pulse", className)}>
        <Loader2 className="w-4 h-4 animate-spin text-accent" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Global Feed...</span>
      </div>
    );
  }

  if (!activeNews) {
    return (
      <div className={cn("flex flex-col gap-3 p-6 glass-dark rounded-3xl border border-white/5 opacity-40", className)}>
         <div className="flex items-center gap-2 border-b border-white/5 pb-2">
           <Radio className="w-3.5 h-3.5 text-slate-500" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Intelligence Node</span>
         </div>
         <p className="text-[10px] text-slate-400 italic leading-snug">
           {isSyncing ? "Initializing Synchronizer..." : "Waiting for national feed synchronization..."}
         </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-1000 max-w-[320px] md:max-w-[400px] p-6 rounded-[2.5rem] bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden group hover:border-accent/40 transition-all",
      className
    )}>
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors"></div>

      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-accent">
            {activeNews.scope === 'West Bengal' ? 'WB Priority' : activeNews.scope === 'India' ? 'National Trend' : 'Global Context'}
          </span>
        </div>
        {isSyncing && <Loader2 className="w-3 h-3 animate-spin text-accent/50" />}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 opacity-70">
           <MapPin className="w-3.5 h-3.5 text-emerald-400" />
           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
             {activeNews.source}
           </span>
        </div>

        <h3 className="text-sm md:text-xl font-headline font-bold text-white leading-tight drop-shadow-md group-hover:text-accent transition-colors">
          {activeNews.title}
        </h3>
        
        <div className="relative">
          <p className="text-[11px] md:text-xs text-slate-100/90 leading-relaxed italic line-clamp-[10] drop-shadow-sm font-medium">
            {activeNews.content}
          </p>
          <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-accent/30 rounded-full" />
        </div>

        <div className="flex flex-col gap-3 pt-2">
           <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-accent" /> {activeNews.publishedAt}</span>
           </div>
           
           <Button 
            asChild
            variant="outline"
            className="h-9 rounded-xl border-white/10 bg-white/5 hover:bg-accent hover:text-primary hover:border-accent text-[10px] font-black uppercase tracking-widest gap-2 transition-all"
           >
             <a href={activeNews.url} target="_blank" rel="noopener noreferrer">
               Read More <ExternalLink className="w-3 h-3" />
             </a>
           </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 opacity-30">
        <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">
          Node: HRAT-INTELL-B1
        </span>
        <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">
          Next Refresh in ~6h
        </span>
      </div>
    </div>
  );
}
