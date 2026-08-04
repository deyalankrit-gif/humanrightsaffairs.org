'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Bell, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { DonationDialog } from './donation-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { FooterMusicPlayer } from './footer-music-player';
import { cn } from '@/lib/utils';

/**
 * AdminFooter: Independent component for protected dashboard pages.
 * Responsive design with compact grid for mobile admin view.
 */
export function AdminFooter() {
  const { user } = useUser();
  const db = useFirestore();

  const remindersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'activity_reminders'), where('uid', '==', user.uid));
  }, [db, user]);
  const { data: reminders } = useCollection(remindersQuery);

  const eventsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'activity_events'), orderBy('date', 'asc'));
  }, [db]);
  const { data: events } = useCollection(eventsQuery);

  const hasReminders = useMemo(() => {
    if (!reminders || reminders.length === 0) return false;
    const eventIds = new Set((events || []).map((e: any) => e.id));
    return reminders.some((r: any) => eventIds.has(r.eventId));
  }, [reminders, events]);

  return (
    <footer className="bg-primary text-primary-foreground pt-12 pb-10 print:hidden border-t border-white/5 mt-auto w-full">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 shrink-0">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-lg leading-none">HRAT</span>
                <span className="text-[8px] font-bold tracking-widest text-accent uppercase">Governance Node</span>
              </div>
            </div>
            <p className="text-primary-foreground/60 text-xs leading-relaxed max-w-xs">
              Official Personnel Terminal for HRAT. Unauthorized access is recorded and logged in the national security registry.
            </p>
            <div className="flex gap-4 items-center">
              <ShieldCheck className="w-8 h-8 text-emerald-500 opacity-40 shrink-0" />
              <div className="scale-75 origin-left opacity-80 shrink-0">
                <FooterMusicPlayer />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-accent">Strategic Hub</h4>
            <ul className="space-y-3 text-primary-foreground/60 text-[11px] md:text-xs">
              <li><Link href="/internal/analytics" className="hover:text-accent">Financial Insights</Link></li>
              <li><Link href="/internal/members" className="hover:text-accent">Personnel Registry</Link></li>
              <li><Link href="/internal/applications" className="hover:text-accent">Recruitment Cell</Link></li>
              <li><Link href="/internal/activity-hub" className="hover:text-accent flex items-center gap-2">Mission Calendar {hasReminders && <Bell className="w-3 h-3 text-red-500 animate-ring" />}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-accent">Integrity Status</h4>
            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
               <div className="flex justify-between items-center text-[10px]">
                 <span className="text-slate-500 uppercase font-bold">Registry Sync</span>
                 <span className="text-emerald-400 font-bold">Stable</span>
               </div>
               <div className="flex justify-between items-center text-[10px]">
                 <span className="text-slate-500 uppercase font-bold">DMS Encryption</span>
                 <span className="text-emerald-400 font-bold">Enabled</span>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-accent">Tech Cell</h4>
            <div className="space-y-3 text-primary-foreground/60 text-[11px] md:text-xs">
               <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-accent" /> <a href="tel:+918981152748" className="text-white font-bold">+91 89811 52748</a></p>
               <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-accent" /> <span>Sector Node: Delhi HQ</span></p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] md:text-[10px] text-primary-foreground/30 font-bold uppercase tracking-widest">
          <p>© 2024 HRAT Institutional Governance System</p>
          <p className="truncate max-w-[200px]">Node: {user?.email || 'N/A'}</p>
        </div>
      </div>
    </footer>
  );
}