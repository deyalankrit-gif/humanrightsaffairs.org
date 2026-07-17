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
 * PublicFooter: Optimized for all screen sizes with responsive grids and fluid spacing.
 */
export function PublicFooter() {
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
    const eventIds = new Set((events || []).map((e: any) => e.id));
    return reminders.some((r: any) => eventIds.has(r.eventId));
  }, [reminders, events]);

  return (
    <footer className="bg-primary text-primary-foreground pt-12 md:pt-20 pb-8 md:pb-10 print:hidden border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 md:w-10 md:h-10">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-lg md:text-xl leading-none">HRAT</span>
                <span className="text-[8px] md:text-[10px] font-bold tracking-widest text-accent uppercase">Justice Shield</span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-xs md:text-sm leading-relaxed">
              Human Rights Affairs Trust (Justice Shield) is a Central Government Registered Human Rights Organization in India <a href="https://ngodarpan.gov.in/#/search-ngo" target="_blank" rel="noopener noreferrer" className="font-bold text-accent hover:underline decoration-accent/50 underline-offset-4">(Reg. No. WB/2025/0762605)</a>. Dedicated to constitutional literacy & legal aid & Social Justice.
            </p>
            
            <div className="space-y-4">
              <DonationDialog initialStep="qr">
                <button className="block w-32 md:w-40 h-24 md:h-28 relative group cursor-pointer overflow-hidden rounded-xl bg-transparent border-none p-0 outline-none transition-all duration-500 hover:scale-[2] active:scale-95 origin-center hover:z-50">
                  <Image src={donationFooterImg?.imageUrl || "/HRAT%20Donate.jpeg"} alt="Donate" fill className="object-contain" />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </DonationDialog>
            </div>

            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                <a key={idx} href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-base md:text-lg font-headline font-bold mb-4 md:mb-6 text-accent">Quick Links</h4>
            <ul className="space-y-3 md:space-y-4 text-primary-foreground/80 text-xs md:text-sm">
              <li><Link href="/#leadership" className="hover:text-accent transition-colors font-medium">Chairman's Message</Link></li>
              <li><Link href="/#knowledge" className="hover:text-accent transition-colors font-medium">Rights Center</Link></li>
              <li><Link href="/#membership" className="hover:text-accent transition-colors font-medium">Be A Member</Link></li>
              <li><Link href="/#helpline" className="hover:text-accent transition-colors font-medium">Emergency Contacts</Link></li>
              <li><Link href="/donors" className="hover:text-accent transition-colors font-medium">Wall of Donors</Link></li>
              <li><Link href="/trust-credentials" className="hover:text-accent transition-colors font-medium">Trust Credentials</Link></li>
              <li>
                <Link href="/activity-hub" className="text-emerald-400 font-bold hover:text-white transition-colors flex items-center gap-2">
                  <Bell className={cn("w-3 h-3 md:w-4 md:h-4 text-red-500", hasReminders && "animate-ring")} />
                  <span>Activity Hub</span>
                </Link>
              </li>
              <li className="pt-2"><span className="text-[#CEFF00] font-black text-sm md:text-lg uppercase tracking-tighter">Office Use Only</span></li>
              <li>
                <Link href="/legal/official-representation" className="text-[#CEFF00] hover:text-white transition-colors font-bold flex flex-col leading-tight">
                  <span>Official Representation</span>
                </Link>
              </li>
              <li>
                <Link href="/trust-responsibilities" className="text-[#CEFF00] hover:text-white transition-colors font-medium leading-tight">
                  Duties & Responsibilities
                </Link>
              </li>
              <li>
                <Link href="/legal/required-documents" className="text-[#CEFF00] hover:text-white transition-colors font-medium leading-tight">
                  Required Documents
                </Link>
              </li>
              <li>
                <Link href="/meetings" className="text-[#CEFF00] hover:text-white transition-colors font-medium leading-tight">
                  Meetings
                </Link>
              </li>
              <li>
                <Link href="/#grievances" className="text-[#CEFF00] hover:text-white transition-colors font-medium leading-tight">
                  Grievances
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base md:text-lg font-headline font-bold mb-4 md:mb-6 text-accent">Legal Support</h4>
            <ul className="space-y-3 md:space-y-4 text-primary-foreground/80 text-xs md:text-sm">
              <li><Link href="/legal/pro-bono" className="hover:text-accent transition-colors font-medium">Pro-Bono Services</Link></li>
              <li><Link href="/legal/fir-format" className="hover:text-accent transition-colors font-medium">Filing an FIR</Link></li>
              <li><Link href="/legal/rti-assistant" className="hover:text-accent transition-colors font-medium">RTI Assistant</Link></li>
              <li><Link href="/legal/bail-procedure" className="hover:text-accent transition-colors font-medium">Bail Procedures</Link></li>
              <li><Link href="/legal/privacy-policy" className="hover:text-accent transition-colors font-medium">Privacy Policy</Link></li>
              <li>
                <Link href="/complaint-form" className="text-[#FF00FF] hover:text-white transition-colors font-bold">
                  Complaint Submission Form
                </Link>
              </li>
            </ul>
            <div className="scale-90 md:scale-100 origin-left mt-4">
              <FooterMusicPlayer />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h4 className="text-base md:text-lg font-headline font-bold mb-4 text-accent">National Head Office</h4>
              <div className="space-y-3 text-primary-foreground/80 text-xs md:text-sm">
                <div className="flex gap-3"><MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>Azad Market, Delhi - 110006</span></div>
                <div className="flex gap-3"><Phone className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>+91 89811 52748</span></div>
                <div className="flex gap-3"><Mail className="w-4 h-4 text-accent shrink-0 mt-0.5" /><a href="mailto:humanrightsaffairstrust@gmail.com" className="hover:text-accent font-bold truncate">humanrightsaffairstrust@gmail.com</a></div>
              </div>
            </div>
            <div>
              <h4 className="text-base md:text-lg font-headline font-bold mb-4 text-accent">State Office (WB)</h4>
              <div className="space-y-3 text-primary-foreground/80 text-xs md:text-sm">
                <div className="flex gap-3"><MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>Deganga, North 24 Parganas, WB</span></div>
                <div className="flex gap-3"><Phone className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>+91 70631 11471</span></div>
                <div className="flex gap-3"><Mail className="w-4 h-4 text-accent shrink-0 mt-0.5" /><a href="mailto:hrat.wb.chairman@gmail.com" className="hover:text-accent font-bold truncate">hrat.wb.chairman@gmail.com</a></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-primary-foreground/60 text-[10px] md:text-xs">© 2024 Human Rights Affairs Trust (Justice Shield). Registered with Central Government of India.</p>
          <div className="bg-white/5 px-4 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary-foreground/70">System Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
