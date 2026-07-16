'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Sparkles, PartyPopper, ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * OccasionBanner: High-fidelity festive display area.
 * Positions itself relative to its parent (the 'Helpline' link in Navbar).
 * Updated with mt-8 to provide a gap from the header bar as requested.
 */
export function OccasionBanner() {
  const db = useFirestore();
  const pathname = usePathname();
  const isHome = pathname === '/';

  // Default institutional banner if no occasion is active in the database
  const DEFAULT_BANNER = {
    title: 'Welcome to HRAT',
    message: 'Human Rights Affairs Trust (Justice Shield) — Standing for your constitutional rights.',
    imageUrl: '/HRAT Logo.jpeg',
    isDefault: true
  };

  const occasionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'occasions');
  }, [db]);

  const { data: occasions, loading } = useCollection(occasionsQuery);

  const activeOccasion = useMemo(() => {
    if (loading || !occasions || occasions.length === 0) return DEFAULT_BANNER;
    
    const now = new Date();
    
    const validOccasions = (occasions as any[])
      .filter((occ) => {
        if (!occ.isActive) return false;
        try {
          const start = startOfDay(parseISO(occ.startDate));
          const end = endOfDay(parseISO(occ.endDate));
          return isWithinInterval(now, { start, end });
        } catch (e) {
          return false;
        }
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return validOccasions[0] || DEFAULT_BANNER;
  }, [occasions, loading]);

  // Only visible on Home Page
  if (!isHome) return null;

  return (
    <div className="absolute top-full right-0 mt-8 z-[110] animate-in fade-in slide-in-from-top-2 duration-700 pointer-events-auto w-[calc(100vw-2rem)] sm:w-80 md:w-96 lg:w-[420px]">
      <div className={cn(
        "bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-4 md:p-5 rounded-[2rem] border-2 border-white/20 dark:border-white/5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] flex items-center gap-4 group hover:border-accent/40 transition-all duration-700",
        loading && "animate-pulse opacity-80"
      )}>
        
        {/* Visual Focus */}
        <div className="relative w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-xl border-2 border-white dark:border-slate-800 shrink-0 group-hover:scale-105 transition-transform duration-700 bg-slate-100">
          <Image 
            src={activeOccasion.imageUrl || '/HRAT Logo.jpeg'} 
            alt={activeOccasion.title} 
            fill 
            className="object-cover" 
            priority
          />
        </div>

        {/* Narrative Context */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 shrink-0">
             <div className="h-1 w-1 rounded-full bg-accent animate-pulse"></div>
             <span className="text-[7px] md:text-[9px] font-black text-accent uppercase tracking-[0.2em] truncate">
               {activeOccasion.title}
             </span>
             {activeOccasion.isDefault ? (
               <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 ml-auto opacity-50" />
             ) : (
               <Sparkles className="w-2.5 h-2.5 text-accent animate-float ml-auto" />
             )}
          </div>
          
          <p className="text-primary dark:text-white font-headline font-bold text-[10px] md:text-[13px] leading-tight group-hover:text-accent transition-colors">
            {activeOccasion.message}
          </p>
          
          <div className="flex items-center gap-1.5 mt-1.5 opacity-50">
             {activeOccasion.isDefault ? (
               <Info className="w-2 h-2 text-slate-400" />
             ) : (
               <PartyPopper className="w-2 h-2 text-emerald-500" />
             )}
             <span className="text-[6px] md:text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
               {activeOccasion.isDefault ? 'Mission Update' : 'Seasonal Greeting'}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}
