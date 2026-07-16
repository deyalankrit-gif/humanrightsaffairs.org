'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Sparkles, Calendar, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * OccasionBanner: High-fidelity festive display area.
 * Positioned to hang directly below the 'Helpline' link in the header.
 * Only visible on the Home Page to maintain institutional focus.
 */
export function OccasionBanner() {
  const db = useFirestore();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const occasionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'occasions'),
      where('isActive', '==', true),
      orderBy('priority', 'desc')
    );
  }, [db]);

  const { data: occasions, loading } = useCollection(occasionsQuery);

  const activeOccasion = useMemo(() => {
    if (!isHome || !occasions || occasions.length === 0) return null;
    
    const now = new Date();
    
    // Find the highest priority occasion valid for the current date
    return occasions.find((occ: any) => {
      try {
        const start = startOfDay(parseISO(occ.startDate));
        const end = endOfDay(parseISO(occ.endDate));
        return isWithinInterval(now, { start, end });
      } catch (e) {
        return false;
      }
    });
  }, [occasions, isHome]);

  if (!isHome || loading || !activeOccasion) return null;

  return (
    <div className="absolute top-full right-4 md:right-8 mt-1 z-[110] animate-in fade-in slide-in-from-top-2 duration-700 pointer-events-auto">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center gap-4 group hover:border-accent/40 transition-all duration-500 max-w-[280px] md:max-w-md">
        
        {/* Visual Focus: Thumbnail */}
        <div className="relative w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform duration-500 bg-slate-100">
          <Image 
            src={activeOccasion.imageUrl} 
            alt={activeOccasion.title} 
            fill 
            className="object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-transparent"></div>
        </div>

        {/* Narrative Context */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
             <span className="text-[7px] md:text-[9px] font-black text-accent uppercase tracking-[0.2em] truncate">{activeOccasion.title}</span>
             <Sparkles className="w-2 h-2 md:w-3 md:h-3 text-accent animate-pulse shrink-0" />
          </div>
          <p className="text-primary dark:text-white font-headline font-bold text-[10px] md:text-base leading-tight line-clamp-2 md:line-clamp-3">
            {activeOccasion.message}
          </p>
          <div className="flex items-center gap-1 mt-1 opacity-60">
             <PartyPopper className="w-2 h-2 text-emerald-500" />
             <span className="text-[6px] md:text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Greetings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
