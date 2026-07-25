
'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Newspaper, Radio, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * CurrentNews: High-fidelity real-time news display area for the homepage.
 * Positions exactly below the logo, maximum 10 lines, transparent background.
 */
export function CurrentNews({ className }: { className?: string }) {
  const db = useFirestore();

  const newsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'current_news'),
      where('isActive', '==', true),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db]);

  const { data: newsItems, loading } = useCollection(newsQuery);
  const activeNews = newsItems?.[0] as any;

  if (loading) return null;
  if (!activeNews) return null;

  return (
    <div className={cn(
      "flex flex-col gap-3 animate-in fade-in slide-in-from-left-4 duration-1000 delay-300 max-w-[280px] md:max-w-[350px]",
      className
    )}>
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <Radio className="w-3.5 h-3.5 text-accent animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Current Intelligence</span>
      </div>

      <div className="space-y-3">
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
          Last Broadcast: {activeNews.createdAt?.toDate ? activeNews.createdAt.toDate().toLocaleDateString() : 'Just now'}
        </span>
      </div>
    </div>
  );
}
