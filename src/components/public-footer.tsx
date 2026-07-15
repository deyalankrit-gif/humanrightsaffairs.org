
'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Bell } from 'lucide-react';
import Link from 'next/link';
import { DonationDialog } from './donation-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

/**
 * PublicFooter: Independent component for visitor-facing pages.
 * Handles all public-level links and information.
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

  // Events Listener for cross-referencing (same logic as Activity Hub Dashboard)
  const eventsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'activity_events'), orderBy('date', 'asc'));
  }, [db]);
  const { data: events } = useCollection(eventsQuery);

  // Determine if there are valid active reminders
  const hasReminders = useMemo(() => {
    if (!reminders || reminders.length === 0) return false;
    if (!events) return reminders.length > 0; // Fallback during events load
    const eventIds = new Set(events.map((e: any) => e.id));
    return reminders.some((r: any) => eventIds.has(r.eventId));
  }, [reminders, events]);

  return (
    <footer className="bg-primary text-primary-foreground pt-20 pb-10 print:hidden border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
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
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Human Rights Affairs Trust (Justice Shield) is a Central Government Registered Human Rights Organization in India <a href="https://ngodarpan.gov.in/#/search-ngo" target="_blank" rel="noopener noreferrer" className="font-bold text-accent hover:underline decoration-accent/50 underline-offset-4">(Reg. No. WB/2025/0762605)</a>. Dedicated to constitutional literacy & legal aid & Social Justice.
            </p>
            
            <div className="space-y-4">
              <DonationDialog initialStep="qr">
                <button className="block w-40 h-28 relative group cursor-pointer overflow-hidden rounded-xl bg-transparent border-none p-0 outline-none transition-all duration-500 hover:scale-[2] hover:z-50 active:scale-95 origin-center">
                  <Image 
                    src={donationFooterImg?.imageUrl || "/HRAT%20Donate.jpeg"} 
                    alt="Donate to HRAT" 
                    fill 
                    className="object-contain"
                    data-ai-hint={donationFooterImg?.imageHint || "donation support"}
                  />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </DonationDialog>
            </div>

            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-headline font-bold mb-6 text-accent">Quick Links</h4>
            <ul className="space-y-4 text-primary-foreground/80">
              <li><Link href="/#leadership" className="hover:text-accent transition-colors font-medium">Chairman's Message</Link></li>
              <li><Link href="/#knowledge" className="hover:text-accent transition-colors font-medium">Rights Center</Link></li>
              <li><Link href="/#membership" className="hover:text-accent transition-colors font-medium">Be A Member</Link></li>
              <li><Link href="/#helpline" className="hover:text-accent transition-colors font-medium">Emergency Contacts</Link></li>
              <li>
                <Link 
                  href="/activity-hub" 
                  className="text-emerald-400 font-bold hover:text-white transition-colors flex items-center gap-2"
                >
                  <Bell className={cn("w-4 h-4 text-red-500 fill-red-500", hasReminders && "animate-ring")} />
                  <span className={cn(hasReminders && "animate-pulsate")}>Activity Calendar Hub</span>
                </Link>
              </li>
              <li>
                <DonationDialog>
                  <button className="hover:text-accent transition-colors font-medium text-left">Donate Now</button>
                </DonationDialog>
              </li>
              <li><Link href="/donors" className="hover:text-accent transition-colors font-medium">Thank You to Our Donors</Link></li>
              <li><Link href="/trust-credentials" className="hover:text-accent transition-colors font-medium">Credentials of the Trust</Link></li>
              <li>
                <Link href="/trust-responsibilities" className="text-emerald-400 hover:text-primary-foreground transition-colors font-medium leading-tight inline-block">
                  Duties and Responsibilities of Trust Staff, Volunteers, and Leaders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-headline font-bold mb-6 text-accent">Legal Support</h4>
            <ul className="space-y-4 text-primary-foreground/80">
              <li><Link href="/legal/pro-bono" className="hover:text-accent transition-colors font-medium">Pro-Bono Services</Link></li>
              <li><Link href="/legal/fir-format" className="hover:text-accent transition-colors font-medium">Filing an FIR</Link></li>
              <li><Link href="/legal/rti-assistant" className="hover:text-accent transition-colors font-medium">RTI Assistant</Link></li>
              <li><Link href="/legal/bail-procedure" className="hover:text-accent transition-colors font-medium">Bail Procedures</Link></li>
              <li><Link href="/legal/privacy-policy" className="hover:text-accent transition-colors font-medium">Privacy Policy</Link></li>
              <li>
                <Link href="/legal/official-representation" className="text-emerald-400 hover:text-primary-foreground transition-colors font-bold flex flex-col leading-tight">
                  <span>Official Representation</span>
                  <span className="text-[10px] opacity-80">(For Organizational Use Only)</span>
                </Link>
              </li>
              <li>
                <a href="/HRAT COMPL.jpeg" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-primary-foreground transition-colors font-bold flex flex-col leading-tight">
                  <span>Complaint Submission Form</span>
                  <span className="text-[10px] opacity-80">(অভিযোগ জমা দেওয়ার ফরম)</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-10">
              <h4 className="text-lg font-headline font-bold mb-6 text-accent">National Head Office</h4>
              <ul className="space-y-4 text-primary-foreground/80">
                <li className="flex gap-3">
                  <MapPin className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm">9567, Tokri Walan Azad Market, Delhi. Pin - 110006</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm">+91 89811 52748</span>
                </li>
                <li className="flex gap-3">
                  <Mail className="w-5 h-5 text-accent shrink-0" />
                  <a href="mailto:humanrightsaffairstrust@gmail.com" className="text-sm hover:text-accent transition-colors font-bold">humanrightsaffairstrust@gmail.com</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-headline font-bold mb-6 text-accent">West Bengal State Office</h4>
              <ul className="space-y-4 text-primary-foreground/80">
                <li className="flex gap-3">
                  <MapPin className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm">Vill. - Biswanathpur, P.O. - Ramnathpur, P.S. - Deganga, Dist. - North 24 Parganas, West Bengal - 743423</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm">+91 70631 11471</span>
                </li>
                <li className="flex gap-3">
                  <Mail className="w-5 h-5 text-accent shrink-0" />
                  <a href="mailto:hrat.wb.chairman@gmail.com" className="text-sm hover:text-accent transition-colors font-bold">hrat.wb.chairman@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-xs">© 2024 Human Rights Affairs Trust (Justice Shield). Registered with Central Government of India.</p>
          <div className="flex items-center gap-6">
             <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">System Secure</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
