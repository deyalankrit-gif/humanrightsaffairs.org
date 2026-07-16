'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Sparkles, PartyPopper, ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * OccasionBanner: High-fidelity festive display area.
 * Features real-time synchronization with the admin 'Occasion Greetings' terminal.
 * Positioned to hang directly below the header actions.
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
    return query(
      collection(db, 'occasions'),
      where('isActive', '==', true),
      orderBy('priority', 'desc')
    );
  }, [db]);

  const { data: occasions, loading } = useCollection(occasionsQuery);

  const activeOccasion = useMemo(() => {
    // Show default banner during load or if collection is empty
    if (loading || !occasions || occasions.length === 0) return DEFAULT_BANNER;
    
    const now = new Date();
    
    // Find the highest priority occasion valid for the current date
    const found = occasions.find((occ: any) => {
      try {
        const start = startOfDay(parseISO(occ.startDate));
        const end = endOfDay(parseISO(occ.endDate));
        return isWithinInterval(now, { start, end });
      } catch (e) {
        return false;
      }
    });

    return found || DEFAULT_BANNER;
  }, [occasions, loading]);

  // The banner is visible on the Home Page header only
  if (!isHome) return null;

  return (
    <div className="absolute top-full right-0 mt-3 z-[110] animate-in fade-in slide-in-from-top-4 duration-1000 pointer-events-auto min-w-[300px] md:min-w-[400px]">
      <div className={cn(
        "bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-4 md:p-5 rounded-[2rem] border-2 border-white/20 dark:border-white/5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] flex items-center gap-5 group hover:border-accent/40 transition-all duration-700",
        loading && "animate-pulse opacity-80"
      )}>
        
        {/* Visual Focus: Thumbnail with Tactical Accent */}
        <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-2xl border-2 border-white dark:border-slate-800 shrink-0 group-hover:scale-110 transition-transform duration-700 bg-slate-100">
          <Image 
            src={activeOccasion.imageUrl || '/HRAT Logo.jpeg'} 
            alt={activeOccasion.title} 
            fill 
            className="object-cover" 
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Narrative Context */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 shrink-0">
             <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(249,115,22,1)]"></div>
             <span className="text-[8px] md:text-[10px] font-black text-accent uppercase tracking-[0.25em] truncate">
               {activeOccasion.title}
             </span>
             {activeOccasion.isDefault ? (
               <ShieldCheck className="w-3 h-3 text-emerald-500 ml-auto opacity-50" />
             ) : (
               <Sparkles className="w-3 h-3 text-accent animate-float ml-auto" />
             )}
          </div>
          
          <p className="text-primary dark:text-white font-headline font-bold text-xs md:text-base leading-tight group-hover:text-accent transition-colors">
            {activeOccasion.message}
          </p>
          
          <div className="flex items-center gap-1.5 mt-2 opacity-50">
             {activeOccasion.isDefault ? (
               <Info className="w-2.5 h-2.5 text-slate-400" />
             ) : (
               <PartyPopper className="w-2.5 h-2.5 text-emerald-500" />
             )}
             <span className="text-[7px] md:text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
               {activeOccasion.isDefault ? 'Mission Registry' : 'Festive Greeting'}
             </span>
          </div>
        </div>
      </div>
      
      {/* Visual Connector Line */}
      <div className="absolute -top-3 right-10 w-px h-3 bg-white/20 hidden md:block"></div>
    </div>
  );
}
