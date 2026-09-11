
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Printer, 
  ShieldAlert, 
  Gavel, 
  FileText, 
  Scale, 
  Clock,
  AlertTriangle,
  ChevronRight,
  Info,
  Lock,
  ShieldCheck,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/footer';
import { cn } from '@/lib/utils';
import { Noto_Serif_Bengali } from 'next/font/google';
import { useUser } from '@/firebase';

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '700'],
  display: 'swap',
});

/**
 * Termination Order Page: Secure institutional document portal.
 * Features: A4 Print optimization, high-fidelity Bengali Unicode, and OTP gate protection.
 */
export default function TerminationOrderPage() {
  const { user, loading: authLoading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Secure verification check: Firebase Auth OR valid session flag from OTP gate
    const otpPassed = sessionStorage.getItem('hrat_gate_authorized') === 'true';
    if (otpPassed || (user && user.email)) {
      setIsAuthorized(true);
    }
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  if (!mounted || authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary" /></div>;
  }

  // Security Gate Component
  if (!isAuthorized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white p-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto text-red-500 shadow-xl shadow-red-500/10">
              <Lock className="w-10 h-10" />
           </div>
           <div className="space-y-2">
             <h2 className="text-2xl font-headline font-bold text-primary leading-tight">Secure Access Required</h2>
             <p className="text-sm text-slate-500 font-medium leading-relaxed">
               This document is classified for **Office Use Only**. Please authenticate via the mission portal footer to unlock this terminal.
             </p>
           </div>
           <div className="pt-4">
             <Button asChild className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-secondary shadow-lg">
               <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" /> Return to Home</Link>
             </Button>
           </div>
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Official Oversight Cell • HRAT</p>
        </Card>
      </main>
    );
  }

  const sections = [
    {
      num: "১",
      title: "সংগঠনের প্রকৃতি ও পদাধিকারীদের স্বেচ্ছাসেবী ভূমিকা",
      content: "Human Rights Affairs Trust একটি অলাভজনক ও সম্পূর্ণ স্বেচ্ছাসেবী সংস্থা। এখানে সকল পদাধিকারী ও সদস্য সেবামূলক মনোভাব নিয়ে কাজ করেন। কোনো পদই লাভজনক বা বাণিজ্যিক কর্মসংস্থান হিসেবে গণ্য নয়।"
    },
    {
      num: "২",
      title: "আপনার নিয়োগের পরিধি",
      content: "আপনার নিয়োগ ছিল সম্পূর্ণ অস্থায়ী এবং সংগঠনের গঠনতন্ত্র ও নীতিমালার ওপর ভিত্তি করে। আপনি সংগঠনের একজন আইনি উপদেষ্টা (Legal Advisor) হিসেবে শুধুমাত্র অনুমোদিত আইনি পরামর্শ প্রদানের জন্য দায়বদ্ধ ছিলেন।"
    },
    {
      num: "৩",
      title: "অনুমোদনবিহীন কার্যক্রম ও সাংগঠনিক শৃঙ্খলা লঙ্ঘন",
      content: "সাম্প্রতিককালে লক্ষ্য করা গেছে যে আপনি সংগঠনের যথাযথ অনুমোদন ব্যতিরেকে বিভিন্ন দাপ্তরিক কার্যক্রম এবং সাংগঠনিক শৃঙ্খলা পরিপন্থী কাজ করেছেন, যা সংগঠনের মর্যাদাকে ক্ষুণ্ণ করেছে।"
    },
    {
      num: "৪",
      title: "অবিলম্বে নিয়োগের অবসান",
      content: (
        <span>
          উপরোক্ত কারণসমূহের প্রেক্ষিতে এবং সংগঠনের প্রশাসনিক সিদ্ধান্তের ভিত্তিতে আজ <strong className="text-red-600 underline">১২ সেপ্টেম্বর ২০২৬</strong> তারিখ থেকে আপনার <strong>Legal Advisor</strong> পদের নিয়োগ স্থায়ীভাবে বাতিল ও অবসান করা হলো। অত্র আদেশের মাধ্যমে আপনাকে আপনার সমস্ত দায়িত্ব থেকে অবিলম্বে অব্যাহতি দেওয়া হলো।
        </span>
      )
    },
    {
      num: "৫",
      title: "সকল ক্ষমতা ও অনুমোদন প্রত্যাহার",
      content: "অত্র আদেশের মাধ্যমে সংগঠনের হয়ে কাজ করার আপনার যাবতীয় ক্ষমতা, অনুমোদন এবং দাপ্তরিক কর্তৃত্ব অবিলম্বে প্রত্যাহার করা হলো।"
    },
    {
      num: "৬",
      title: "সংগঠনের নাম, পরিচয় ও সামগ্রী ব্যবহারে নিষেধাজ্ঞা",
      content: "আজ থেকে আপনি সংগঠনের নাম, লোগো, লেটারপ্যাড, পরিচয়পত্র বা সংগঠনের অন্য কোনো মেধা-সম্পদ ব্যবহার করতে পারবেন না।"
    },
    {
      num: "৭",
      title: "সংগঠনের প্রতিনিধি হিসেবে নিজেকে উপস্থাপনে নিষেধাজ্ঞা",
      content: "আপনি আর কোনো ব্যক্তি, প্রশাসন বা প্রতিষ্ঠানের কাছে Human Rights Affairs Trust-এর প্রতিনিধি হিসেবে নিজেকে পরিচয় দিতে পারবেন না।"
    },
    {
      num: "৮",
      title: "CEASE AND DESIST — অবিলম্বে বন্ধ করার নির্দেশ",
      isHighlight: true,
      content: "সংগঠনের পরিচয় ব্যবহার করে কোনোপ্রকার যোগাযোগ বা কার্যক্রম পরিচালনা করা থেকে আপনাকে কঠোরভাবে বিরত থাকার নির্দেশ দেওয়া হচ্ছে। এর অন্যথায় ঘটলে তা প্রতারণা ও জালিয়াতি হিসেবে গণ্য হবে এবং আইনত দণ্ডনীয় অপরাধ হিসেবে গণ্য হবে।"
    },
    {
      num: "৯",
      title: "পরবর্তী কোনো অনুমোদনবিহীন কার্যক্রমের দায় সংগঠনের নয়",
      content: "১২ সেপ্টেম্বর ২০২৬ তারিখের পর আপনার কোনো প্রকার ব্যক্তিগত বা অনুমোদনবিহীন কাজের জন্য Human Rights Affairs Trust কোনোভাবেই দায়ী থাকবে না।"
    },
    {
      num: "১০",
      title: "সংগঠনের সম্পত্তি ও নথিপত্র ফেরত",
      content: (
        <span>
          আপনার নিকট থাকা সংগঠনের পরিচয়পত্র (ID Card), নিয়োগপত্র এবং যাবতীয় দাপ্তরিক নথিপত্র আগামী <strong className="text-primary border-b-2 border-primary">১৬ সেপ্টেম্বর ২০২৬</strong> তারিখের মধ্যে (অর্থাৎ <strong className="text-red-600 font-bold underline">৩ (তিন) কার্যদিবসের</strong> মধ্যে) সংগঠনের রাজ্য দপ্তরে সশরীরে জমা দেওয়ার নির্দেশ দেওয়া হলো।
        </span>
      )
    },
    {
      num: "১১",
      title: "আইনগত ও প্রশাসনিক পরিণতি",
      content: "এই আদেশের কোনো অংশ লঙ্ঘন করলে বা সংগঠনের নামের অপব্যবহার করলে আপনার বিরুদ্ধে দেওয়ানি ও ফৌজদারি উভয় প্রকার আইনি ব্যবস্থা গ্রহণ করা হবে।"
    },
    {
      num: "১২",
      title: "আদেশ কার্যকর হওয়ার তারিখ",
      content: "এই আদেশ আজ ১২ সেপ্টেম্বর ২০২৬ তারিখ থেকে কার্যকর বলে গণ্য হবে। এই সিদ্ধান্ত চূড়ান্ত এবং এটি সংগঠনের প্রশাসনিক স্বার্থে গৃহীত হয়েছে।"
    }
  ];

  return (
    <main className={cn("min-h-screen bg-slate-100 dark:bg-slate-950 py-12 md:py-20 px-4 print:p-0 print:bg-white", notoSerifBengali.className)}>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
          }
          header, nav, footer, .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Navigation Header - Hidden on Print */}
      <div className="max-w-[210mm] mx-auto mb-8 flex justify-between items-center no-print">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-sans font-bold text-xs uppercase tracking-widest transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </Link>
        <div className="flex gap-4">
           <Button onClick={handlePrint} className="bg-primary text-white font-sans font-bold rounded-xl gap-2 shadow-lg hover:bg-secondary">
             <Printer className="w-4 h-4" /> Print Document (A4)
           </Button>
        </div>
      </div>

      {/* Document Sheet */}
      <div className="print-container max-w-[210mm] mx-auto bg-white shadow-2xl p-10 md:p-20 print:p-0 min-h-[297mm] flex flex-col relative text-slate-900 border border-slate-200 print:border-none">
        
        {/* Header (Repeated on top of logical pages) */}
        <div className="text-center space-y-2 mb-12 border-b-4 border-[#001f54] pb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image src="/HRAT%20Logo.jpeg" alt="HRAT" fill className="object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#001f54] tracking-tight uppercase font-sans">
            HUMAN RIGHTS AFFAIRS TRUST
          </h1>
          <h2 className="text-xl font-bold text-[#001f54] uppercase tracking-widest font-sans">
            WEST BENGAL STATE COMMITTEE
          </h2>
          <p className="text-sm font-bold text-slate-600 font-sans">
            রেজিস্ট্রেশন নং: WB/2025/0762605
          </p>
        </div>

        {/* Document Metadata */}
        <div className="flex justify-between items-start mb-10 text-sm font-bold">
          <div>
            <p>স্মারক নং: HRA/WB/LA/TERMINATION/____/2026</p>
          </div>
          <div className="text-right">
            <p>তারিখ: ১২ সেপ্টেম্বর ২০২৬</p>
          </div>
        </div>

        {/* Titles */}
        <div className="text-center space-y-2 mb-10">
          <h3 className="text-3xl font-bold text-primary underline underline-offset-8">অফিস আদেশ</h3>
          <p className="text-xl font-bold text-slate-700">LEGAL ADVISOR পদে নিয়োগ বাতিল/অবসান সংক্রান্ত আদেশ</p>
        </div>

        {/* Recipient & Subject Block */}
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl mb-12 space-y-6 print:bg-white print:border-slate-300">
          <div className="space-y-1">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">প্রাপক:</p>
            <p className="font-bold text-xl text-primary">অ্যাডভোকেট শ্রী ভাস্কর মণ্ডল</p>
            <p className="text-sm font-bold">Legal Advisor</p>
            <p className="text-sm font-medium text-slate-600 uppercase tracking-tight">Human Rights Affairs Trust, West Bengal State Committee</p>
          </div>
          <div className="pt-6 border-t border-slate-200 space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">বিষয়:</p>
            <p className="text-sm md:text-base font-bold leading-relaxed text-justify">
              Human Rights Affairs Trust-এর Legal Advisor পদে আপনার নিয়োগ অবিলম্বে বাতিল/সমাপ্তকরণ এবং সংগঠনের প্রতিনিধিত্ব করার সকল ক্ষমতা, অনুমোদন ও কর্তৃত্ব প্রত্যাহার সংক্রান্ত।
            </p>
          </div>
        </div>

        {/* COMPLETE DOCUMENT BODY */}
        <div className="space-y-10 text-sm md:text-base leading-relaxed text-justify text-slate-800">
           {sections.map((sec) => (
             <section key={sec.num} className={cn(
               "space-y-3 p-1 rounded-xl transition-colors",
               sec.isHighlight && "p-8 border-2 border-red-200 bg-red-50/50 rounded-3xl print:bg-white print:border-slate-400"
             )}>
                <h4 className={cn(
                  "font-bold text-primary flex items-baseline gap-2",
                  sec.isHighlight && "text-red-700 text-lg mb-2"
                )}>
                   <span className="shrink-0">{sec.num}.</span>
                   <span>{sec.title}</span>
                </h4>
                <p className={cn(
                  "font-medium",
                  sec.isHighlight && "text-red-900 leading-relaxed"
                )}>
                   {sec.content}
                </p>
             </section>
           ))}
        </div>

        {/* Signature Block - Forced to stay together in print */}
        <div className="mt-24 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-end print:break-inside-avoid">
          <div className="text-center md:text-left space-y-2">
            <div className="w-32 h-32 relative mx-auto md:mx-0 opacity-10 grayscale">
              <Image src="/HRAT%20Logo.jpeg" alt="Seal" fill className="object-contain" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">অফিসিয়াল সিল</p>
          </div>
          
          <div className="text-center md:text-right space-y-2">
            <p className="text-sm font-black uppercase tracking-widest text-slate-400 font-sans">স্বাক্ষর</p>
            <div className="h-20 w-64 md:ml-auto"></div>
            <div className="space-y-1">
              <p className="font-black text-primary uppercase leading-tight font-sans">Human Rights Affairs Trust-এর পক্ষে</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">West Bengal State Committee</p>
              <p className="text-xl font-bold text-primary mt-6 font-sans">Smt. Moumita Saha</p>
              <p className="text-sm font-black text-[#c91010] font-sans">Chairperson</p>
              <p className="text-[10px] font-bold text-slate-500 font-sans">Human Rights Affairs Trust, West Bengal State Committee</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 font-sans">তারিখ: ১২ সেপ্টেম্বর ২০২৬</p>
            </div>
          </div>
        </div>

        {/* CC Section */}
        <div className="mt-16 space-y-4 pt-10 border-t border-slate-100">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-sans">অনুলিপি প্রেরিত (Copy To):</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-xs font-bold text-slate-600">
            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-300"></div> ১. Officer-in-Charge, Matia Police Station।</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-300"></div> ২. Superintendent of Police, North 24 Parganas District Police।</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-300"></div> ৩. District Magistrate, North 24 Parganas।</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-300"></div> ৪. Competent / Higher Authority।</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-300"></div> ৫. Office File / Record।</li>
          </ul>
        </div>

        {/* Final Important Notice Box */}
        <div className="mt-16 p-10 bg-slate-900 text-white rounded-[3rem] border-none shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-2 print:border-black print:rounded-none print:shadow-none print:break-inside-avoid">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 print:hidden"></div>
          <div className="relative z-10 space-y-4">
             <h4 className="text-xs font-black uppercase tracking-[0.4em] text-accent text-center font-sans print:text-black">গুরুত্বপূর্ণ নোট</h4>
             <p className="text-sm md:text-base text-center leading-relaxed text-slate-300 italic font-medium print:text-black">
               "অ্যাডভোকেট শ্রী ভাস্কর মণ্ডল-এর আইনি উপদেষ্টার (Legal Advisor) নিয়োগ ১২ সেপ্টেম্বর ২০২৬ তারিখ থেকে বাতিল করা হয়েছে। সংগঠনের নাম বা লোগো ব্যবহার করে কোনো প্রকার আইনি কাজ বা প্রতিনিধিত্ব করার অধিকার উনার আর নেই। এই সংক্রান্ত কোনো অনৈতিক কাজ পরিলক্ষিত হলে আইনগত ব্যবস্থা গ্রহণ করা হবে।"
             </p>
          </div>
        </div>

        {/* Page Footer / Numbering */}
        <div className="mt-auto pt-10 text-center flex flex-col items-center gap-4">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em] font-sans">Official Governance Node • পৃষ্ঠা ১ / ১</p>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function Loader2({ className }: { className?: string }) {
  return <Clock className={cn("animate-spin", className)} />
}
