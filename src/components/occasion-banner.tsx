'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Sparkles, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * OccasionBanner displays festive greetings in the hero section.
 * Positioned in the top-right, aligned with the institutional logo.
 * Fully responsive: adapted for mobile, tablet, and desktop screens.
 */
export function OccasionBanner() {
  const db = useFirestore();

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
    if (!occasions || occasions.length === 0) return null;
    
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
  }, [occasions]);

  if (loading || !activeOccasion) return null;

  return (
    <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20 flex items-center animate-in fade-in slide-in-from-right-4 duration-1000">
      <div className="flex items-center gap-3 md:gap-6 bg-white/5 backdrop-blur-xl p-2.5 md:p-4 rounded-2xl md:rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group hover:border-accent/40 transition-all duration-500">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-accent/20 rounded-full blur-2xl -mr-6 -mt-6 md:-mr-8 md:-mt-8 animate-pulse"></div>
        
        <div className="flex flex-col text-right">
          <div className="flex items-center justify-end gap-1.5 md:gap-2 mb-0.5 md:mb-1">
             <span className="text-[7px] md:text-[10px] font-black text-accent uppercase tracking-wider md:tracking-[0.2em]">{activeOccasion.title}</span>
             <Sparkles className="w-2.5 h-2.5 md:w-3 h-3 text-accent animate-pulse" />
          </div>
          <p className="text-white font-headline font-bold text-[10px] sm:text-xs md:text-xl leading-tight max-w-[80px] sm:max-w-[120px] md:max-w-[200px]">
            {activeOccasion.message}
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-1 md:mt-2 opacity-60">
             <Calendar className="w-2 h-2 md:w-2.5 md:h-2.5 text-white" />
             <span className="text-[6px] md:text-[8px] font-bold text-white uppercase tracking-widest">Greeting</span>
          </div>
        </div>

        <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-lg md:rounded-2xl overflow-hidden shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-500 bg-slate-800">
          <Image 
            src={activeOccasion.imageUrl} 
            alt={activeOccasion.title} 
            fill 
            className="object-cover" 
          />
        </div>
      </div>
    </div>
  );
}
