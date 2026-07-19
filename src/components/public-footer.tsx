'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Bell, Crown, ShieldCheck, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DonationDialog } from './donation-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { FooterMusicPlayer } from './footer-music-player';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

/**
 * PublicFooter: Optimized for all screen sizes with responsive grids and fluid spacing.
 * Includes a secure email OTP gate for the Required Documents section.
 */
export function PublicFooter() {
  const donationFooterImg = PlaceHolderImages.find(img => img.id === 'donation-footer-image');
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  // OTP Gate States
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpStep, setOtpStep] = useState<'send' | 'verify'>('send');

  const TARGET_EMAIL = "humanrightsaffairstrust@gmail.com";
  const DEMO_OTP = "123456";

  // Email Masking Logic: hu[exact count of X]st@gmail.com
  const maskedEmail = useMemo(() => {
    const [userPart, domain] = TARGET_EMAIL.split('@');
    if (userPart.length <= 4) return TARGET_EMAIL;
    const middleCount = userPart.length - 4;
    const xMask = 'X'.repeat(middleCount);
    return `${userPart.slice(0, 2)}${xMask}${userPart.slice(-2)}@${domain}`;
  }, [TARGET_EMAIL]);

  const handleOpenGate = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOtpOpen(true);
    setOtpStep('send');
    setOtpValue('');
  };

  const handleSendOtp = () => {
    setIsVerifying(true);
    // Simulate API delay
    setTimeout(() => {
      setOtpStep('verify');
      setIsVerifying(false);
      toast({
        title: "Security Code Dispatched",
        description: `A code has been sent to ${maskedEmail}. For prototype testing, use: 123456`,
      });
    }, 1500);
  };

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      if (otpValue === DEMO_OTP) {
        setIsOtpOpen(false);
        router.push('/legal/required-documents');
        toast({
          title: "Access Granted",
          description: "Institutional clearance verified.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "The security code you entered is invalid.",
        });
      }
      setIsVerifying(false);
    }, 1000);
  };

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
              <li>
                <Link href="/trust-credentials" className="hover:text-accent transition-colors font-medium flex items-center gap-2">
                  Trust Credentials <Crown className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]/20" />
                </Link>
              </li>
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
                <button 
                  onClick={handleOpenGate}
                  className="text-[#CEFF00] hover:text-white transition-colors font-medium leading-tight text-left"
                >
                  Required Documents
                </button>
              </li>
              <li>
                <Link href="/meetings" className="text-[#CEFF00] hover:text-white transition-colors font-medium leading-tight">
                  Organizations Meeting
                </Link>
              </li>
              <li>
                <Link href="/#grievances" className="text-[#CEFF00] hover:text-white transition-colors font-medium leading-tight">
                  Organizations Grievances
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
                <div className="flex gap-3"><MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>Biswanathpur, Deganga, 24 Parganas (N), WB</span></div>
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

      {/* EMAIL OTP GATE DIALOG */}
      <Dialog open={isOtpOpen} onOpenChange={setIsOtpOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-900 p-8">
           <DialogHeader className="items-center text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                 <Lock className="w-8 h-8" />
              </div>
              <DialogTitle className="text-2xl font-headline font-bold">Secure Document Access</DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
                 Authorized Personnel Email Verification
              </DialogDescription>
           </DialogHeader>

           <div className="py-6 space-y-6">
              {otpStep === 'send' ? (
                <div className="space-y-6 text-center">
                   <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Registered Official Email</p>
                      <p className="text-sm font-bold text-primary dark:text-white break-all">{maskedEmail}</p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-xs text-slate-500 leading-relaxed italic">
                        "An encrypted authentication code will be sent to the registered email address of the authorized official to permit entry."
                      </p>
                      <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900">
                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                          Prototype Mode: Click below to simulate sending.
                        </p>
                      </div>
                   </div>
                   <Button 
                    onClick={handleSendOtp} 
                    disabled={isVerifying}
                    className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-secondary transition-all shadow-xl shadow-primary/20"
                   >
                     {isVerifying ? <Loader2 className="animate-spin w-5 h-5" /> : <>Request Email OTP <ArrowRight className="ml-2 w-4 h-4" /></>}
                   </Button>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enter Security Code</Label>
                      <Input 
                        placeholder="••••••" 
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        className="h-14 text-center text-3xl font-bold tracking-[0.5em] rounded-xl border-2 focus:ring-accent"
                      />
                      <p className="text-[10px] text-center text-accent font-black uppercase tracking-widest mt-2">
                        Testing Code: 123456
                      </p>
                   </div>
                   <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900 flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">OTP Sent to Email</p>
                   </div>
                   <Button 
                    onClick={handleVerifyOtp} 
                    disabled={isVerifying || otpValue.length < 6}
                    className="w-full h-12 bg-accent text-primary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20"
                   >
                     {isVerifying ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify Identity"}
                   </Button>
                </div>
              )}
           </div>

           <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                 National Security Cell • Human Rights Affairs Trust
              </p>
           </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}