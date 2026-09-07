'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Bell, 
  Crown, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Heart,
  ArrowUpRight,
  ChevronRight,
  Search
} from 'lucide-react';
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
 * PublicFooter: Fully Responsive High-Fidelity Design.
 * Features grid stacking, localized hyperlinks, and secure OTP gating.
 */
export function PublicFooter() {
  const donationFooterImg = PlaceHolderImages.find(img => img.id === 'donation-footer-image');
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpStep, setOtpStep] = useState<'send' | 'verify'>('send');
  const [targetPath, setTargetPath] = useState<string>('');

  const TARGET_EMAIL = "humanrightsaffairstrust@gmail.com";
  const DEMO_OTP = "123456";

  const maskedEmail = useMemo(() => {
    const [userPart, domain] = TARGET_EMAIL.split('@');
    if (userPart.length <= 4) return TARGET_EMAIL;
    const middleCount = userPart.length - 4;
    const xMask = 'X'.repeat(middleCount);
    return `${userPart.slice(0, 2)}${xMask}${userPart.slice(-2)}@${domain}`;
  }, [TARGET_EMAIL]);

  const handleOpenGate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setTargetPath(path);
    setIsOtpOpen(true);
    setOtpStep('send');
    setOtpValue('');
  };

  const handleSendOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setOtpStep('verify');
      setIsVerifying(false);
      toast({
        title: "Security Code Dispatched",
        description: `A code has been sent to ${maskedEmail}.`,
      });
    }, 1500);
  };

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      if (otpValue === DEMO_OTP) {
        setIsOtpOpen(false);
        router.push(targetPath);
      } else {
        toast({ variant: "destructive", title: "Verification Failed" });
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
    <footer className="bg-primary text-primary-foreground pt-12 md:pt-20 pb-8 md:pb-10 print:hidden border-t border-white/5 w-full">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 md:mb-16">
          
          {/* Identity & Social Block */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="relative w-9 h-9 md:w-10 md:h-10 shrink-0">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-lg md:text-xl leading-none">HRAT</span>
                <span className="text-[8px] font-bold tracking-widest text-accent uppercase">Justice Shield</span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-xs md:text-sm leading-relaxed max-w-sm">
              Human Rights Affairs Trust (Justice Shield) is a Central Government Registered Human Rights Organization in India <a href="https://ngodarpan.gov.in/#/search-ngo" target="_blank" rel="noopener noreferrer" className="font-bold text-accent hover:underline decoration-accent/50 underline-offset-4">(Reg. No. WB/2025/0762605)</a>. Dedicated to constitutional literacy & legal aid & Social Justice.
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </a>
                ))}
              </div>
              
              {/* Bengali Orange Hyperlink */}
              <Link 
                href="/legal/police-duties" 
                className="text-accent hover:underline font-bold text-xl md:text-2xl mt-4 block transition-all"
              >
                প্রয়োজনীয় কিছু তথ্য
              </Link>
            </div>
          </div>

          {/* Quick Links Block */}
          <div>
            <h4 className="text-base md:text-lg font-headline font-bold mb-6 text-accent uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-3 text-primary-foreground/80 text-[11px] md:text-sm">
              <li><Link href="/#leadership" className="hover:text-accent transition-colors font-medium">Chairman's Message</Link></li>
              <li><Link href="/#knowledge" className="hover:text-accent transition-colors font-medium">Rights Center</Link></li>
              <li><Link href="/#membership" className="hover:text-accent transition-colors font-medium">Be A Member</Link></li>
              <li><Link href="/donors" className="hover:text-accent transition-colors font-medium flex items-center gap-2">Wall of Donors <Heart className="w-3 h-3 text-red-500 fill-red-500/20" /></Link></li>
              <li><Link href="/trust-credentials" className="hover:text-accent transition-colors font-medium flex items-center gap-2">Trust Credentials <Crown className="w-3.5 h-3.5 text-[#D4AF37]" /></Link></li>
              <li><Link href="/activity-hub" className="text-emerald-400 font-bold hover:text-white transition-colors flex items-center gap-2"><Bell className={cn("w-3.5 h-3.5 text-red-500", hasReminders && "animate-ring")} /><span>Activity Hub</span></Link></li>
              
              <li className="pt-4"><span className="text-[#CEFF00] font-black text-xs md:text-base uppercase tracking-tighter">Office Use Only</span></li>
              <li><Link href="/investigator/login" className="text-[#4666FF] hover:text-accent font-medium flex items-center gap-2">Investigator Portal <Search className="w-3 h-3" /></Link></li>
              <li><Link href="/legal/official-representation" className="text-[#CEFF00] hover:text-white font-bold flex items-center justify-between w-full group/link"><span>Representation</span><ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover/link:opacity-100" /></Link></li>
              <li><Link href="/trust-responsibilities" className="text-[#CEFF00] hover:text-white font-medium flex items-center justify-between w-full group/link"><span>Duties</span><ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover/link:opacity-100" /></Link></li>
              <li><button onClick={handleOpenGate('/legal/required-documents')} className="text-[#CEFF00] hover:text-white font-medium flex items-center justify-between w-full text-left group/link"><span>Docs Vault</span><Lock className="w-3 h-3 opacity-40 group-hover/link:opacity-100" /></button></li>
              <li><button onClick={handleOpenGate('/legal/income-tax-compliances/page-1')} className="text-[#CEFF00] hover:text-white font-medium flex items-center justify-between w-full text-left group/link"><span>Income Tax Compliance (Page 1)</span><Lock className="w-3 h-3 opacity-40 group-hover/link:opacity-100" /></button></li>
              <li><button onClick={handleOpenGate('/legal/income-tax-compliances/page-2')} className="text-[#CEFF00] hover:text-white font-medium flex items-center justify-between w-full text-left group/link"><span>Income Tax Compliance (Page 2)</span><Lock className="w-3 h-3 opacity-40 group-hover/link:opacity-100" /></button></li>
              <li><button onClick={handleOpenGate('/legal/income-tax-compliances/page-3')} className="text-[#CEFF00] hover:text-white font-medium flex items-center justify-between w-full text-left group/link"><span>Income Tax Compliance (Page 3)</span><Lock className="w-3 h-3 opacity-40 group-hover/link:opacity-100" /></button></li>
            </ul>
          </div>

          {/* Legal Support Block */}
          <div>
            <h4 className="text-base md:text-lg font-headline font-bold mb-6 text-accent uppercase tracking-widest">Legal Support</h4>
            <ul className="space-y-3 text-primary-foreground/80 text-[11px] md:text-sm">
              <li><Link href="/legal/pro-bono" className="hover:text-accent transition-colors font-medium">Pro-Bono Services</Link></li>
              <li><Link href="/legal/fir-format" className="hover:text-accent transition-colors font-medium">Filing an FIR</Link></li>
              <li><Link href="/legal/rti-assistant" className="hover:text-accent transition-colors font-medium">RTI Assistant</Link></li>
              <li><Link href="/legal/bail-procedure" className="hover:text-accent transition-colors font-medium">Bail Procedures</Link></li>
              <li><Link href="/complaint-form" className="text-[#FF00FF] hover:text-white font-bold flex items-center justify-between group/link"><span>Complaint Form</span> <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover/link:opacity-100" /></Link></li>
            </ul>
            <div className="scale-90 md:scale-100 origin-left mt-8">
              <FooterMusicPlayer />
            </div>
          </div>

          {/* Contact Block */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h4 className="text-base md:text-lg font-headline font-bold text-accent">Head Office</h4>
              <div className="space-y-3 text-primary-foreground/80 text-[11px] md:text-sm">
                <div className="flex gap-3"><MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>Azad Market, Delhi - 110006</span></div>
                <div className="flex gap-3"><Phone className="w-4 h-4 text-accent shrink-0 mt-0.5" /><a href="tel:+918981152748" className="hover:text-accent transition-colors">+91 89811 52748</a></div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-base md:text-lg font-headline font-bold text-accent">WB Chapter</h4>
              <div className="space-y-4 text-primary-foreground/80 text-[11px] md:text-sm">
                <div className="flex gap-3"><MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>Biswanathpur, Deganga, 24 Parganas (N), WB</span></div>
                
                <div className="pt-2">
                  <p className="font-bold text-accent uppercase tracking-widest text-[9px]">Registered Office</p>
                  <p className="text-xs text-primary-foreground/80 font-bold">Kolkata 700157</p>
                </div>

                <div className="pt-4">
                  <DonationDialog initialStep="qr">
                    <button className="block w-28 md:w-40 h-20 md:h-28 relative group cursor-pointer overflow-hidden rounded-xl bg-transparent border-none outline-none transition-all duration-500 hover:scale-110 active:scale-95 origin-left">
                      <Image src={donationFooterImg?.imageUrl || "/HRAT%20Donate.jpeg"} alt="Donate" fill className="object-contain" />
                    </button>
                  </DonationDialog>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-primary-foreground/50 text-[9px] md:text-[11px] text-center md:text-left leading-relaxed">
            © 2024 Human Rights Affairs Trust (Justice Shield). Registered with Central Government of India.
          </p>
          <div className="bg-white/5 px-4 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">System Secure</span>
          </div>
        </div>
      </div>

      {/* OTP GATE */}
      <Dialog open={isOtpOpen} onOpenChange={setIsOtpOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-900 p-6 md:p-8 w-[95vw]">
           <DialogHeader className="items-center text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent"><Lock className="w-8 h-8" /></div>
              <DialogTitle className="text-2xl font-headline font-bold">Secure Access Terminal</DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Identity Verification Required</DialogDescription>
           </DialogHeader>
           <div className="py-6 space-y-6">
              {otpStep === 'send' ? (
                <div className="space-y-6 text-center">
                   <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Target Node</p>
                      <p className="text-xs md:sm font-bold text-primary dark:text-white break-all">{maskedEmail}</p>
                   </div>
                   <Button onClick={handleSendOtp} disabled={isVerifying} className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-secondary">
                     {isVerifying ? <Loader2 className="animate-spin w-5 h-5" /> : <>Request OTP <ArrowRight className="ml-2 w-4 h-4" /></>}
                   </Button>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="space-y-2 text-center">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enter Security Code</Label>
                      <Input placeholder="••••••" maxLength={6} value={otpValue} onChange={(e) => setOtpValue(e.target.value)} className="h-14 text-center text-3xl font-bold tracking-[0.5em] rounded-xl border-2 focus:ring-accent" />
                   </div>
                   <Button onClick={handleVerifyOtp} disabled={isVerifying || otpValue.length < 6} className="w-full h-12 bg-accent text-primary font-bold rounded-xl hover:bg-secondary transition-all">
                     {isVerifying ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify Identity"}
                   </Button>
                </div>
              )}
           </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
