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
 * Features: Transparent background with high-visibility #CFFF04 typography.
 * The default 'Welcome to HRAT' title is specifically set to #FF00FF.
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
    // If we're loading or have no data yet, show the default welcome banner
    if (loading || !occasions || occasions.length === 0) return DEFAULT_BANNER;
    
    const now = new Date();
    
    const validOccasions = (occasions as any[])
      .filter((occ) => {
        if (!occ.isActive) return false;
        try {
          // Normalize dates to ensure the banner shows for the full duration of the dates specified
          const start = startOfDay(parseISO(occ.startDate));
          const end = endOfDay(parseISO(occ.endDate));
          return isWithinInterval(now, { start, end });
        } catch (e) {
          return false;
        }
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Return the highest priority valid occasion, or fallback to default
    return validOccasions[0] || DEFAULT_BANNER;
  }, [occasions, loading]);

  // The occasional display area is restricted to the Home Page landing experience
  if (!isHome) return null;

  return (
    <div className="absolute top-full right-0 mt-10 z-[110] animate-in fade-in slide-in-from-top-4 duration-700 pointer-events-auto w-[calc(100vw-2rem)] sm:w-96 md:w-[450px] lg:w-[500px]">
      <div className={cn(
        "bg-transparent p-5 md:p-6 rounded-[2.5rem] border-2 border-white/10 dark:border-white/5 flex items-center gap-5 md:gap-6 group hover:border-[#CFFF04]/40 transition-all duration-700",
        loading && "animate-pulse opacity-80"
      )}>
        
        {/* Visual Focus - Enlarged per institutional request */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-2xl border-2 border-white dark:border-slate-800 shrink-0 group-hover:scale-105 transition-transform duration-700 bg-slate-100 dark:bg-slate-800">
          <Image 
            src={activeOccasion.imageUrl || '/HRAT Logo.jpeg'} 
            alt={activeOccasion.title} 
            fill 
            className="object-cover" 
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none"></div>
        </div>

        {/* Narrative Context - Updated with user-requested colors and sizing */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 shrink-0">
             <div className={cn(
               "h-1.5 w-1.5 rounded-full animate-pulse",
               activeOccasion.isDefault ? "bg-[#FF00FF]" : "bg-[#CFFF04]"
             )}></div>
             <span className={cn(
               "text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] truncate",
               activeOccasion.isDefault ? "text-[#FF00FF]" : "text-[#CFFF04]"
             )}>
               {activeOccasion.title}
             </span>
             {activeOccasion.isDefault ? (
               <ShieldCheck className="w-3 h-3 text-emerald-500 ml-auto opacity-50" />
             ) : (
               <Sparkles className="w-3 h-3 text-[#CFFF04] animate-float ml-auto" />
             )}
          </div>
          
          <p className="text-[#CFFF04] font-headline font-bold text-[10px] md:text-sm lg:text-base leading-tight md:leading-snug transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {activeOccasion.message}
          </p>
          
          <div className="flex items-center gap-2 mt-3 opacity-80">
             {activeOccasion.isDefault ? (
               <Info className="w-2.5 h-2.5 text-[#CFFF04]" />
             ) : (
               <PartyPopper className="w-2.5 h-2.5 text-emerald-500" />
             )}
             <span className="text-[7px] md:text-[8px] font-bold text-[#CFFF04] uppercase tracking-widest">
               {activeOccasion.isDefault ? 'Mission Update' : 'Special Greeting'}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}
