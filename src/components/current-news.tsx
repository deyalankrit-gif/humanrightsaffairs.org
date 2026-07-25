
'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Radio, MapPin, Globe, Loader2, TrendingUp, ExternalLink, Clock, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncNews } from '@/ai/flows/sync-news-flow';
import { cn } from '@/lib/utils';

/**
 * CurrentNews: Automated Live News Display Module.
 * Enhanced for high visibility with bright colors and deep shadows.
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
      <div className={cn("flex flex-col gap-2 p-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 animate-pulse", className)}>
        <Loader2 className="w-4 h-4 animate-spin text-[#CEFF00]" />
        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Scanning Global Feed...</span>
      </div>
    );
  }

  if (!activeNews) {
    return (
      <div className={cn("flex flex-col gap-3 p-6 bg-black/30 backdrop-blur-md rounded-3xl border border-white/5 opacity-60", className)}>
         <div className="flex items-center gap-2 border-b border-white/10 pb-2">
           <Radio className="w-3.5 h-3.5 text-white" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Intelligence Node</span>
         </div>
         <p className="text-[10px] text-white/70 italic leading-snug">
           {isSyncing ? "Initializing Synchronizer..." : "Waiting for national feed synchronization..."}
         </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-1000 max-w-[320px] md:max-w-[400px] p-6 rounded-[2.5rem] bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-[#CEFF00]/40 transition-all",
      className
    )}>
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#CEFF00]/5 rounded-full blur-3xl group-hover:bg-[#CEFF00]/10 transition-colors"></div>

      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#CEFF00] animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#CEFF00] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {activeNews.scope === 'West Bengal' ? 'WB Priority' : activeNews.scope === 'India' ? 'National Trend' : 'Global Context'}
          </span>
        </div>
        {isSyncing && <Loader2 className="w-3 h-3 animate-spin text-[#CEFF00]/50" />}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <MapPin className="w-3.5 h-3.5 text-emerald-400" />
           <span className="text-[9px] font-black text-white uppercase tracking-widest drop-shadow-md">
             {activeNews.source}
           </span>
        </div>

        <h3 className="text-sm md:text-xl font-headline font-bold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] group-hover:text-[#CEFF00] transition-colors">
          {activeNews.title}
        </h3>
        
        <div className="relative">
          <p className="text-[11px] md:text-xs text-white leading-relaxed italic line-clamp-[10] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-bold">
            {activeNews.content}
          </p>
          <div className="absolute -left-3 top-0 bottom-0 w-1 bg-[#CEFF00]/40 rounded-full" />
        </div>

        <div className="flex flex-col gap-3 pt-2">
           <div className="flex items-center gap-4 text-[9px] font-black text-white/80 uppercase tracking-wider drop-shadow-md">
              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#CEFF00]" /> {activeNews.publishedAt}</span>
           </div>
           
           <Button 
            asChild
            variant="outline"
            className="h-10 rounded-xl border-white/20 bg-white/5 hover:bg-[#CEFF00] hover:text-primary hover:border-[#CEFF00] text-[10px] font-black uppercase tracking-widest gap-2 transition-all shadow-xl"
           >
             <a href={activeNews.url} target="_blank" rel="noopener noreferrer">
               Verify & Read More <ExternalLink className="w-3 h-3" />
             </a>
           </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-[7px] font-black uppercase tracking-widest text-white/30">
          Node: HRAT-INTELL-B1
        </span>
        <div className="flex items-center gap-1.5">
           <Zap className="w-2.5 h-2.5 text-[#CEFF00] opacity-50" />
           <span className="text-[7px] font-black uppercase tracking-widest text-white/30">
             Next Refresh in ~6h
           </span>
        </div>
      </div>
    </div>
  );
}
