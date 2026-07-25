'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Newspaper, Radio, MapPin, Globe, Loader2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * CurrentNews: High-fidelity real-time news display area for the homepage.
 * Positions exactly below the logo, maximum 10 lines, transparent background.
 * Logic: Prioritizes Trending India > WB > World.
 */
export function CurrentNews({ className }: { className?: string }) {
  const db = useFirestore();

  const newsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'current_news'),
      where('isActive', '==', true),
      limit(10) 
    );
  }, [db]);

  const { data: newsItems, loading } = useCollection(newsQuery);

  const activeNews = useMemo(() => {
    if (!newsItems || newsItems.length === 0) return null;
    
    // Sort logic: Scope Priority (1: India Trending, 2: WB, 3: World) ASC, then latest first
    return [...newsItems].sort((a: any, b: any) => {
      if (a.scopePriority !== b.scopePriority) {
        return (a.scopePriority || 99) - (b.scopePriority || 99);
      }
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    })[0];
  }, [newsItems]);

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 opacity-50", className)}>
        <Loader2 className="w-3 h-3 animate-spin text-accent" />
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Scanning Trends...</span>
      </div>
    );
  }

  if (!activeNews) return null;

  const isIndiaTrending = activeNews.scope === 'India' && activeNews.scopePriority === 1;

  return (
    <div className={cn(
      "flex flex-col gap-3 animate-in fade-in slide-in-from-left-4 duration-1000 delay-300 max-w-[280px] md:max-w-[350px]",
      className
    )}>
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        {isIndiaTrending ? (
          <TrendingUp className="w-3.5 h-3.5 text-accent animate-pulse" />
        ) : (
          <Radio className="w-3.5 h-3.5 text-accent animate-pulse" />
        )}
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
          {isIndiaTrending ? "Trending in India" : "Current Intelligence"}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1.5 opacity-70">
           {activeNews.scope === 'World' ? (
             <Globe className="w-3 h-3 text-sky-400" />
           ) : (
             <MapPin className="w-3 h-3 text-emerald-400" />
           )}
           <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
             {activeNews.scope === 'India' ? 'National Update' : `${activeNews.scope} Chapter`}
           </span>
        </div>

        <h3 className="text-sm md:text-lg font-headline font-bold text-white leading-tight drop-shadow-md">
          {activeNews.title}
        </h3>
        
        {/* News Content Area - Strictly limited to 10 lines as per mandate */}
        <div className="relative">
          <p className="text-[10px] md:text-xs text-slate-100/90 leading-relaxed italic line-clamp-[10] drop-shadow-sm font-medium">
            {activeNews.content}
          </p>
          <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-accent/30 rounded-full" />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 opacity-40">
        <span className="text-[7px] font-black uppercase tracking-widest text-slate-300">
          Sync Time: {activeNews.createdAt?.toDate ? activeNews.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
        </span>
      </div>
    </div>
  );
}
