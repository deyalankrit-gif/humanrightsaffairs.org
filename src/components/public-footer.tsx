'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Bell } from 'lucide-react';
import Link from 'next/link';
import { DonationDialog } from './donation-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { FooterMusicPlayer } from './footer-music-player';
import { cn } from '@/lib/utils';

/**
 * PublicFooter: Independent component for visitor-facing pages.
 * Optimized for responsive grid stacking and legible typography.
 */
export function PublicFooter() {
  const donationFooterImg = PlaceHolderImages.find(img => img.id === 'donation-footer-image');
  const { user } = useUser();
  const db = useFirestore();

  // Reminders Listener
  const remindersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'activity_reminders'), where('uid', '==', user.uid));
  }, [db, user]);
  const { data: reminders } = useCollection(remindersQuery);

  // Events Listener for cross-referencing
  const eventsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'activity_events'), orderBy('date', 'asc'));
  }, [db]);
  const { data: events } = useCollection(eventsQuery);

  // Determine if there are valid active reminders
  const hasReminders = useMemo(() => {
    if (!reminders || reminders.length === 0) return false;
    if (!events) return reminders.length > 0;
    const eventIds = new Set(events.map((e: any) => e.id));
    return reminders.some((r: any) => eventIds.has(r.eventId));
  }, [reminders, events]);

  return (
    <footer className="bg-primary text-primary-foreground pt-12 md:pt-20 pb-8 md:pb-10 print:hidden border-t border-white/5">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10">
                <Image 
                  src="/HRAT%20Logo.jpeg" 
                  alt="HRAT Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-xl leading-none">HRAT</span>
                <span className="text-[10px] font-bold tracking-widest text-accent uppercase">Justice Shield</span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-sm">
              Human Rights Affairs Trust (Justice Shield) is a Central Government Registered Human Rights Organization in India <a href="https://ngodarpan.gov.in/#/search-ngo" target="_blank" rel="noopener noreferrer" className="font-bold text-accent hover:underline decoration-accent/50 underline-offset-4">(Reg. No. WB/2025/0762605)</a>.
            </p>
            
            <div className="space-y-4">
              <DonationDialog initialStep="qr">
                <button className="block w-40 h-28 relative group cursor-pointer overflow-hidden rounded-xl bg-transparent border-none p-0 outline-none transition-all duration-500 hover:scale-105 active:scale-95">
                  <Image 
                    src={donationFooterImg?.imageUrl || "/HRAT%20Donate.jpeg"} 
                    alt="Donate to HRAT" 
                    fill 
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </DonationDialog>
            </div>

            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-headline font-bold mb-6 text-accent">Quick Links</h4>
            <ul className="space-y-4 text-primary-foreground/80 text-sm">
              <li><Link href="/#leadership" className="hover:text-accent transition-colors font-medium">Chairman's Message</Link></li>
              <li><Link href="/#knowledge" className="hover:text-accent transition-colors font-medium">Rights Center</Link></li>
              <li><Link href="/#membership" className="hover:text-accent transition-colors font-medium">Be A Member</Link></li>
              <li><Link href="/#helpline" className="hover:text-accent transition-colors font-medium">Emergency Contacts</Link></li>
              <li>
                <DonationDialog>
                  <button className="hover:text-accent transition-colors font-medium text-left">Donate Now</button>
                </DonationDialog>
              </li>
              <li><Link href="/donors" className="hover:text-accent transition-colors font-medium">Wall of Gratitude</Link></li>
              <li><Link href="/trust-credentials" className="hover:text-accent transition-colors font-medium">Credentials</Link></li>
              <li>
                <Link 
                  href="/activity-hub" 
                  className="text-emerald-400 font-bold hover:text-white transition-colors flex items-center gap-2"
                >
                  <Bell className={cn("w-4 h-4 text-red-500 fill-red-500", hasReminders && "animate-ring")} />
                  <span>Activity Calendar Hub</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-headline font-bold mb-6 text-accent">Legal Support</h4>
            <ul className="space-y-4 text-primary-foreground/80 text-sm">
              <li><Link href="/legal/pro-bono" className="hover:text-accent transition-colors font-medium">Pro-Bono Services</Link></li>
              <li><Link href="/legal/fir-format" className="hover:text-accent transition-colors font-medium">Filing an FIR</Link></li>
              <li><Link href="/legal/rti-assistant" className="hover:text-accent transition-colors font-medium">RTI Assistant</Link></li>
              <li><Link href="/legal/bail-procedure" className="hover:text-accent transition-colors font-medium">Bail Procedures</Link></li>
              <li><Link href="/legal/privacy-policy" className="hover:text-accent transition-colors font-medium">Privacy Policy</Link></li>
              <li>
                <Link href="/complaint-form" className="text-[#FF00FF] hover:text-primary-foreground transition-colors font-bold flex flex-col leading-tight">
                  <span>Complaint Submission Form</span>
                  <span className="text-[10px] opacity-80">(অভিযোগ জমা দেওয়ার ফরম)</span>
                </Link>
              </li>
            </ul>
            <FooterMusicPlayer className="hidden sm:block" />
          </div>

          <div className="space-y-10">
            <div>
              <h4 className="text-lg font-headline font-bold mb-4 text-accent">Head Office</h4>
              <ul className="space-y-3 text-primary-foreground/80 text-xs md:text-sm">
                <li className="flex gap-2.5">
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <span>9567, Tokri Walan Azad Market, Delhi. 110006</span>
                </li>
                <li className="flex gap-2.5">
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <span>+91 89811 52748</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-headline font-bold mb-4 text-accent">State Office (WB)</h4>
              <ul className="space-y-3 text-primary-foreground/80 text-xs md:text-sm">
                <li className="flex gap-2.5">
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <span>Deganga, North 24 Parganas, WB - 743423</span>
                </li>
                <li className="flex gap-2.5">
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <span>+91 70631 11471</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-primary-foreground/60 text-[10px] text-center md:text-left leading-relaxed">
            © 2024 Human Rights Affairs Trust (Justice Shield). Registered with Central Government of India. WB/2025/0762605.
          </p>
          <div className="flex items-center gap-4">
             <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
               <span className="text-[9px] font-bold uppercase tracking-widest text-primary-foreground/70">Secure Connection</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
