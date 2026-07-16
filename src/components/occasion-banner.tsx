'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Sparkles, PartyPopper, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * OccasionBanner: High-fidelity festive display area.
 * Features: Fully transparent background, #CFFF04 primary typography, and #FF00FF for "Welcome to HRAT".
 * Fixed for robust real-time synchronization with the admin terminal.
 */
export function OccasionBanner() {
  const db = useFirestore();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const DEFAULT_BANNER = {
    title: 'Welcome to HRAT',
    message: 'Human Rights Affairs Trust (Justice Shield) — Standing for your constitutional rights.',
    imageUrl: '/HRAT%20Logo.jpeg',
    isDefault: true
  };

  const occasionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'occasions');
  }, [db]);

  const { data: occasions, loading } = useCollection(occasionsQuery);

  const activeOccasion = useMemo(() => {
    // If loading or collection empty, fallback to default branding
    if (!occasions || (occasions as any[]).length === 0) return DEFAULT_BANNER;
    
    const now = new Date();
    
    const validOccasions = (occasions as any[])
      .filter((occ) => {
        if (!occ.isActive) return false;
        try {
          // Parse dates stored as strings YYYY-MM-DD from the admin terminal
          const start = startOfDay(parseISO(occ.startDate));
          const end = endOfDay(parseISO(occ.endDate));
          return isWithinInterval(now, { start, end });
        } catch (e) {
          return false;
        }
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return validOccasions[0] || DEFAULT_BANNER;
  }, [occasions]);

  // Only display on the landing experience
  if (!isHome) return null;

  const isDefault = activeOccasion.isDefault === true;

  return (
    <div className="absolute top-full right-0 mt-8 z-[110] animate-in fade-in slide-in-from-top-4 duration-700 pointer-events-auto w-[calc(100vw-2rem)] sm:w-[450px] lg:w-[500px]">
      <div className={cn(
        "bg-transparent p-5 md:p-6 flex items-center gap-5 md:gap-7 group transition-all duration-700",
        loading && "opacity-50"
      )}>
        
        {/* Visual Focus: Enlarged Image Container */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-2 border-white/20 shrink-0 group-hover:scale-105 transition-transform duration-700 bg-slate-900/50">
          <Image 
            src={activeOccasion.imageUrl || '/HRAT%20Logo.jpeg'} 
            alt={activeOccasion.title} 
            fill 
            className="object-cover" 
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 pointer-events-none"></div>
        </div>

        {/* Narrative Context: High-Visibility Chrome Typography */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 shrink-0">
             <div className={cn(
               "h-1.5 w-1.5 rounded-full animate-pulse",
               isDefault ? "bg-[#FF00FF]" : "bg-[#CFFF04]"
             )}></div>
             <span className={cn(
               "text-[10px] md:text-[12px] font-black uppercase tracking-[0.25em] truncate",
               isDefault ? "text-[#FF00FF]" : "text-[#CFFF04]"
             )}>
               {activeOccasion.title}
             </span>
             {!isDefault && (
               <Sparkles className="w-3.5 h-3.5 text-[#CFFF04] animate-float ml-auto shrink-0" />
             )}
          </div>
          
          <p className="text-[#CFFF04] font-headline font-bold text-[11px] md:text-sm lg:text-[14px] leading-tight md:leading-snug transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
            {activeOccasion.message}
          </p>
          
          <div className="flex items-center gap-2 mt-4 opacity-70">
             {isDefault ? (
               <ShieldCheck className="w-3 h-3 text-[#FF00FF]" />
             ) : (
               <PartyPopper className="w-3 h-3 text-[#CFFF04]" />
             )}
             <span className={cn(
               "text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em]",
               isDefault ? "text-[#FF00FF]" : "text-[#CFFF04]"
             )}>
               {isDefault ? 'Institutional Mission' : 'Active Occasion'}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}
