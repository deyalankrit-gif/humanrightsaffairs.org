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
  const donationFooterImg = PlaceHolderImages.find(img => img.id === 'donation-footer-image');
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
    if (!events) return reminders.length > 0;
    const eventIds = new Set(events.map((e: any) => e.id));
    return reminders.some((r: any) => eventIds.has(r.eventId));
  }, [reminders, events]);

  return (
    <footer className="bg-primary text-primary-foreground pt-12 md:pt-20 pb-6 md:pb-10 print:hidden border-t border-white/5 mt-auto w-full">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image src="/HRAT%20Logo.jpeg" alt="Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-lg leading-none">HRAT</span>
                <span className="text-[8px] font-bold tracking-widest text-accent uppercase">Personnel Terminal</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-xs leading-relaxed">
              Official Governance Portal for the Human Rights Affairs Trust. Access restricted to authorized officials and commissioned members only.
            </p>
            <div className="flex gap-4">
              <ShieldCheck className="w-8 h-8 text-emerald-500 opacity-50" />
              <div className="scale-75 origin-left opacity-80">
                <FooterMusicPlayer />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-accent">Active Modules</h4>
            <ul className="space-y-2 text-primary-foreground/60 text-xs">
              <li><Link href="/internal/analytics" className="hover:text-accent">Financial Analytics</Link></li>
              <li><Link href="/internal/members" className="hover:text-accent">Member Registry</Link></li>
              <li><Link href="/internal/applications" className="hover:text-accent">Applications Cell</Link></li>
              <li><Link href="/internal/activity-hub" className="hover:text-accent flex items-center gap-2">Activity Calendar {hasReminders && <Bell className="w-3 h-3 text-red-500 animate-ring" />}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-accent">System Status</h4>
            <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
               <div className="flex justify-between items-center text-[10px]">
                 <span className="text-slate-500 uppercase">Database</span>
                 <span className="text-emerald-400 font-bold">Synchronized</span>
               </div>
               <div className="flex justify-between items-center text-[10px]">
                 <span className="text-slate-500 uppercase">Encryption</span>
                 <span className="text-emerald-400 font-bold">AES-256 Active</span>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-accent">Support Hub</h4>
            <div className="space-y-3 text-primary-foreground/60 text-xs">
               <p>National Tech Cell: <a href="tel:+918981152748" className="text-white font-bold hover:text-accent transition-colors">+91 89811 52748</a></p>
               <p>Official HQ: <span className="text-white">New Delhi, India</span></p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] md:text-[10px] text-primary-foreground/40 font-bold uppercase tracking-widest">
          <p>© 2024 HRAT Institutional Governance System</p>
          <p>Personnel Session: {user?.email || 'N/A'}</p>
        </div>
      </div>
    </footer>
  );
}
