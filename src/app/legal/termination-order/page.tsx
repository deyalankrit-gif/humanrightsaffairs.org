
'use client';

import React from 'react';
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
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/footer';
import { cn } from '@/lib/utils';
import { Noto_Serif_Bengali } from 'next/font/google';

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '700'],
  display: 'swap',
});

export default function TerminationOrderPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <main className={cn("min-h-screen bg-slate-100 dark:bg-slate-950 py-12 md:py-20 px-4 print:p-0 print:bg-white", notoSerifBengali.className)}>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
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
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-xs uppercase tracking-widest transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </Link>
        <Button onClick={handlePrint} className="bg-primary text-white font-bold rounded-xl gap-2 shadow-lg hover:bg-secondary">
          <Printer className="w-4 h-4" /> Print Order (A4)
        </Button>
      </div>

      {/* Document Sheet */}
      <div className="print-container max-w-[210mm] mx-auto bg-white shadow-2xl p-12 md:p-20 print:p-0 min-h-[297mm] flex flex-col relative text-slate-900 border border-slate-200 print:border-none">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-12 border-b-4 border-[#001f54] pb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image src="/HRAT Logo.jpeg" alt="HRAT" fill className="object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#001f54] tracking-tight uppercase">
            HUMAN RIGHTS AFFAIRS TRUST
          </h1>
          <h2 className="text-xl font-bold text-[#001f54] uppercase tracking-widest">
            WEST BENGAL STATE COMMITTEE
          </h2>
          <p className="text-sm font-bold text-slate-600">
            রেজিস্ট্রেশন নং: WB/2025/0762605
          </p>
        </div>

        {/* Meta Info */}
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
          <h3 className="text-2xl font-bold text-primary underline underline-offset-8">অফিস আদেশ</h3>
          <p className="text-lg font-bold text-slate-700">LEGAL ADVISOR পদে নিয়োগ বাতিল/অবসান সংক্রান্ত আদেশ</p>
        </div>

        {/* Recipient & Subject */}
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl mb-10 space-y-4 print:bg-white print:border-slate-300">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">প্রাপক:</p>
            <p className="font-bold text-lg text-primary">অ্যাডভোকেট শ্রী ভাস্কর মণ্ডল</p>
            <p className="text-sm font-medium">Legal Advisor</p>
            <p className="text-sm text-slate-600">Human Rights Affairs Trust, West Bengal State Committee</p>
          </div>
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">বিষয়:</p>
            <p className="text-sm font-bold leading-relaxed text-justify">
              Human Rights Affairs Trust-এর Legal Advisor পদে আপনার নিয়োগ অবিলম্বে বাতিল/সমাপ্তকরণ এবং সংগঠনের প্রতিনিধিত্ব করার সকল ক্ষমতা, অনুমোদন ও কর্তৃত্ব প্রত্যাহার সংক্রান্ত।
            </p>
          </div>
        </div>

        {/* Main Body */}
        <div className="space-y-8 text-sm md:text-base leading-relaxed text-justify text-slate-800">
          <section className="space-y-3">
            <p className="font-bold text-primary">১. সংগঠনের মর্যাদা ও ভাবমূর্তি রক্ষা:</p>
            <p>Human Rights Affairs Trust (HRAT) একটি জাতীয় স্তরের মানবাধিকার সংগঠন, যা দেশের সংবিধান এবং আইনি কাঠামোর মধ্যে থেকে নাগরিকদের অধিকার রক্ষায় কাজ করে। সংগঠনের মর্যাদা, ভাবমূর্তি এবং আদর্শ রক্ষা করা প্রতিটি কর্মকর্তা ও সদস্যের পরম দায়িত্ব।</p>
          </section>

          <section className="space-y-3">
            <p className="font-bold text-primary">২. আচরণবিধি ও শৃঙ্খলা:</p>
            <p>সংগঠনের শৃঙ্খলা রক্ষা এবং পেশাদারিত্ব বজায় রাখার জন্য নির্দিষ্ট আচরণবিধি (Code of Conduct) অনুসরণ করা বাধ্যতামূলক। সংগঠনের নীতিমালার পরিপন্থী কোনো কার্যকলাপ বা শৃঙ্খলাভঙ্গ কোনোভাবেই বরদাস্ত করা হয় না।</p>
          </section>

          <section className="space-y-3">
            <p className="font-bold text-primary">৩. কার্যকলাপে অসঙ্গতি:</p>
            <p>সাম্প্রতিককালে আপনার কার্যকলাপে গুরুতর অসঙ্গতি এবং সংগঠনের নীতির সাথে সাংঘর্ষিক কিছু বিষয় পরিলক্ষিত হয়েছে। সংগঠনের অভ্যন্তরীণ মূল্যায়ন এবং প্রশাসনিক সিদ্ধান্তের ভিত্তিতে এই ব্যবস্থা গ্রহণ করা হচ্ছে।</p>
          </section>

          <section className="space-y-3">
            <p className="font-bold text-primary">৪. নিয়োগ বাতিল ও অব্যাহতি:</p>
            <p>উপযুক্ত কারণ ও প্রশাসনিক সিদ্ধান্তের প্রেক্ষিতে আপনাকে জানানো যাচ্ছে যে, Human Rights Affairs Trust-এর West Bengal State Committee-র **Legal Advisor** পদ থেকে আপনার নিয়োগ আজ <strong className="text-red-600">১২ সেপ্টেম্বর ২০২৬</strong> তারিখ থেকে কার্যকরভাবে বাতিল ও অবসান করা হলো। অত্র আদেশের মাধ্যমে আপনাকে আপনার সমস্ত দায়িত্ব থেকে অবিলম্বে অব্যাহতি দেওয়া হলো।</p>
          </section>

          <section className="space-y-3">
            <p className="font-bold text-primary">৫. প্রতিনিধিত্ব করার ক্ষমতা প্রত্যাহার:</p>
            <p>এই আদেশের পর থেকে Human Rights Affairs Trust-এর হয়ে বা সংগঠনের নামে কোনো প্রকার আইনি পরামর্শ প্রদান, পত্রালাপ, প্রতিনিধিত্ব বা কোনো প্রশাসনিক কাজ করার আপনার আর কোনো ক্ষমতা বা কর্তৃত্ব থাকবে না।</p>
          </section>

          <section className="space-y-3">
            <p className="font-bold text-primary">৬. পরিচয়পত্র ও নথিপত্র ফেরত:</p>
            <p>সংগঠন কর্তৃক আপনাকে প্রদত্ত পরিচয়পত্র (ID Card), অ্যাপয়েন্টমেন্ট লেটার এবং সংগঠনের কোনো গোপন নথিপত্র বা সম্পদ যদি আপনার নিকট থাকে, তবে তা দ্রুত সংগঠনের দপ্তরে ফেরত দিতে হবে।</p>
          </section>

          <section className="space-y-3">
            <p className="font-bold text-primary">৭. লোগো ও নাম ব্যবহার নিষিদ্ধ:</p>
            <p>আজ থেকে আপনি আপনার ভিজিটিং কার্ড, লেটারপ্যাড, সোশ্যাল মিডিয়া প্রোফাইল বা অন্য কোনো স্থানে Human Rights Affairs Trust-এর নাম, লোগো বা আপনার পূর্বতন পদবী ব্যবহার করতে পারবেন না।</p>
          </section>

          {/* CEASE AND DESIST BOX */}
          <section className="p-8 border-2 border-red-200 bg-red-50/50 rounded-3xl space-y-4 print:bg-white print:border-slate-400">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h4 className="text-lg font-bold text-red-700">৮. CEASE AND DESIST — অবিলম্বে বন্ধ করার নির্দেশ</h4>
            </div>
            <p className="font-medium text-red-900 leading-relaxed">
              সংগঠনের পদবী বা লোগো ব্যবহার করে কোনো ব্যক্তি বা প্রতিষ্ঠানের সাথে যোগাযোগ করা অথবা সংগঠনের স্বার্থ ক্ষুণ্ণ হয় এমন কোনো কাজ করা থেকে আপনাকে কঠোরভাবে বিরত থাকার নির্দেশ দেওয়া হচ্ছে। এর অন্যথায় ঘটলে তা প্রতারণা ও জালিয়াতি হিসেবে গণ্য হবে।
            </p>
          </section>

          <section className="space-y-3">
            <p className="font-bold text-primary">৯. আইনি পদক্ষেপের হুঁশিয়ারি:</p>
            <p>যদি এই আদেশের পর আপনি সংগঠনের নাম বা লোগো ব্যবহার করে কোনো অনৈতিক বা আইনি কার্যকলাপের সাথে যুক্ত হন, তবে সংগঠন আপনার বিরুদ্ধে কঠোর আইনি ব্যবস্থা (দেওয়ানি ও ফৌজদারি উভয়ই) গ্রহণ করতে বাধ্য হবে।</p>
          </section>

          <section className="space-y-3">
            <p className="font-bold text-primary">১০. সময়সীমা ও ফেরত প্রদানের নির্দেশ:</p>
            <p>আপনার নিকট থাকা সংগঠনের সমস্ত স্থাবর-অস্থাবর সম্পত্তি এবং পরিচয়পত্র আগামী <strong className="text-primary border-b-2 border-primary">৩ (তিন) কার্যদিবসের</strong> মধ্যে, অর্থাৎ <strong className="text-red-600 font-bold">১৬ সেপ্টেম্বর ২০২৬</strong> তারিখের মধ্যে সংগঠনের রাজ্য দপ্তরে সশরীরে জমা দেওয়ার নির্দেশ দেওয়া হলো।</p>
          </section>

          <section className="space-y-3">
            <p className="font-bold text-primary">১১. গোপনীয়তা রক্ষা:</p>
            <p>সংগঠনে থাকাকালীন আপনি যদি কোনো গোপন তথ্য বা দাপ্তরিক নথি সম্পর্কে অবহিত হয়ে থাকেন, তবে তা সংগঠনের বাইরে প্রকাশ করা আইনত দণ্ডনীয় অপরাধ হিসেবে গণ্য হবে।</p>
          </section>

          <section className="space-y-3">
            <p className="font-bold text-primary">১২. চূড়ান্ত সিদ্ধান্ত:</p>
            <p>এই সিদ্ধান্ত চূড়ান্ত এবং এটি সংগঠনের প্রশাসনিক স্বার্থে গৃহীত হয়েছে। এই সংক্রান্ত কোনো আপিল বা পত্রালাপ বিবেচনা করা হবে না।</p>
          </section>
        </div>

        {/* Signature Block */}
        <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-end print:mt-10">
          <div className="text-center md:text-left space-y-2">
            <div className="w-32 h-32 relative mx-auto md:mx-0 opacity-10 grayscale">
              <Image src="/HRAT Logo.jpeg" alt="Seal" fill className="object-contain" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">অফিসিয়াল সিল</p>
          </div>
          
          <div className="text-center md:text-right space-y-2">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">স্বাক্ষর</p>
            <div className="h-16 w-64 md:ml-auto"></div>
            <div className="space-y-1">
              <p className="font-black text-primary uppercase leading-tight">Human Rights Affairs Trust-এর পক্ষে</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">West Bengal State Committee</p>
              <p className="text-lg font-bold text-primary mt-4">Smt. Moumita Saha</p>
              <p className="text-sm font-bold text-[#c91010]">Chairperson</p>
              <p className="text-[10px] font-bold text-slate-500">Human Rights Affairs Trust, West Bengal State Committee</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2">তারিখ: ১২ সেপ্টেম্বর ২০২৬</p>
            </div>
          </div>
        </div>

        {/* CC Section */}
        <div className="mt-16 space-y-4 pt-10 border-t border-slate-100">
          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">অনুলিপি প্রেরিত (Copy To):</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-xs font-bold text-slate-600">
            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-300"></div> ১. Officer-in-Charge, Matia Police Station।</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-300"></div> ২. Superintendent of Police, North 24 Parganas District Police।</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-300"></div> ৩. District Magistrate, North 24 Parganas।</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-300"></div> ৪. Competent / Higher Authority।</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-300"></div> ৫. Office File / Record।</li>
          </ul>
        </div>

        {/* Important Note Box */}
        <div className="mt-16 p-8 bg-slate-900 text-white rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-2 print:border-black print:rounded-none print:shadow-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 print:hidden"></div>
          <div className="relative z-10 space-y-4">
             <h4 className="text-xs font-black uppercase tracking-[0.4em] text-accent text-center print:text-black">গুরুত্বপূর্ণ নোট</h4>
             <p className="text-sm text-center leading-relaxed text-slate-300 italic print:text-black">
               "অ্যাডভোকেট শ্রী ভাস্কর মণ্ডল-এর আইনি উপদেষ্টার (Legal Advisor) নিয়োগ ১২ সেপ্টেম্বর ২০২৬ তারিখ থেকে বাতিল করা হয়েছে। সংগঠনের নাম বা লোগো ব্যবহার করে কোনো প্রকার আইনি কাজ বা প্রতিনিধিত্ব করার অধিকার উনার আর নেই। এই সংক্রান্ত কোনো অনৈতিক কাজ পরিলক্ষিত হলে আইনগত ব্যবস্থা গ্রহণ করা হবে।"
             </p>
          </div>
        </div>

        {/* Page Footer */}
        <div className="mt-auto pt-10 text-center">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Official Governance Node • Page 1 of 1</p>
        </div>
      </div>

      <Footer />
    </main>
  );
}

