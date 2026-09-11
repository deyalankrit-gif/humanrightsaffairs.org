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
  AlertCircle,
  ChevronRight,
  Info,
  Lock,
  ShieldCheck,
  X,
  Hash,
  Activity,
  UserCheck,
  Trash2,
  LockKeyhole,
  CheckCircle2,
  FileSearch,
  Users,
  Building2,
  Handshake,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Noto_Serif_Bengali } from 'next/font/google';
import { useUser } from '@/firebase';

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '700'],
  display: 'swap',
});

type Section = {
  num: string;
  title: string;
  content: React.ReactNode;
  isHighlight?: boolean;
};

/**
 * Termination Order Page: Unabridged official document.
 * Features: A4 Print optimization, high-fidelity Bengali Unicode, and secure session gate.
 */
export default function TerminationOrderPage() {
  const { user, loading: authLoading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const sections: Section[] = [
    {
      num: "১",
      title: "সংগঠনের প্রকৃতি ও পদাধিকারীদের স্বেচ্ছাসেবী ভূমিকা",
      content: (
        <div className="space-y-4">
          <p>Human Rights Affairs Trust একটি Charitable, Public-Welfare এবং Humanitarian Organization। সংগঠনের বিভিন্ন Office Bearer, Advisor, Representative এবং অন্যান্য পদাধিকারীগণ তাঁদের উপর অর্পিত নির্ধারিত দায়িত্ব স্বেচ্ছাসেবক (Volunteer) হিসেবে পালন করে থাকেন।</p>
          <p>তাঁদের এই দায়িত্ব পালনের জন্য সংগঠনের পক্ষ থেকে কোনো প্রকার বেতন, পারিশ্রমিক, সম্মানী বা ভাতা প্রদান করা হয় না। বরং সংগঠনের বিভিন্ন প্রয়োজন এবং জনকল্যাণমূলক কর্মকাণ্ড পরিচালনার ক্ষেত্রে তাঁরা তাঁদের সামর্থ্য অনুযায়ী স্বেচ্ছায় সংগঠনকে আর্থিক ও অন্যান্য প্রয়োজনীয় সহায়তা প্রদান করে থাকেন।</p>
          <p>Human Rights Affairs Trust মূলত সাধারণ মানুষের শুভানুধ্যায়িতা, সদস্যদের সহযোগিতা এবং স্বেচ্ছাসেবী অবদানের উপর নির্ভর করে পরিচালিত হয় এবং এই সহায়তার মাধ্যমে বিভিন্ন সমাজসেবামূলক, জনকল্যাণমূলক ও মানবিক কর্মকাণ্ড পরিচালনা করে থাকে।</p>
          <p>অতএব, সংগঠনের কোনো পদে অধিষ্ঠিত হওয়া কোনো ব্যক্তির জন্য বেতন, ভাতা, আর্থিক সুবিধা অথবা সংগঠনের সম্পদ বা অর্থের উপর ব্যক্তিগত মালিকানা/অধিকার সৃষ্টি করে না। একইভাবে, কোনো পদে নিয়োগ বা কোনো দায়িত্ব অর্পণ করা মানেই সংশ্লিষ্ট ব্যক্তিকে সংগঠনের উপর স্বাধীন, সীমাহীন বা অবাধ কর্তৃত্ব প্রদান করা নয়।</p>
          <p>প্রত্যেক Office Bearer, Advisor, Representative and অন্যান্য পদাধিকারীকে সংগঠনের গঠনতন্ত্র, সাংগঠনিক কাঠামো, নির্ধারিত দায়িত্বের সীমা এবং ক্ষমতাপ্রাপ্ত উচ্চতর কর্তৃপক্ষের নির্দেশনা অনুযায়ী কাজ করতে হয়।</p>
        </div>
      )
    },
    {
      num: "২",
      title: "আপনার নিয়োগের পরিধি",
      content: (
        <div className="space-y-4">
          <p>আপনাকে Human Rights Affairs Trust, West Bengal State Committee-এর Legal Advisor হিসেবে নিয়োগ করা হয়েছিল মূলত সংগঠনের পক্ষ থেকে নির্দিষ্টভাবে অনুরোধ, দায়িত্ব প্রদান অথবা নির্দেশ দেওয়া হলে আইনি পরামর্শ, Legal Opinion, আইনগত সহায়তা এবং প্রয়োজনীয় দিকনির্দেশনা প্রদানের জন্য।</p>
          <p>আপনার এই নিয়োগের মাধ্যমে সংগঠনের পক্ষ থেকে আপনাকে কোনো স্বাধীনভাবে—</p>
          <ul className="list-disc pl-8 space-y-1">
            <li>নীতিগত সিদ্ধান্ত গ্রহণ,</li>
            <li>নির্দেশ জারি,</li>
            <li>সংগঠনের নামে কোনো উদ্যোগ গ্রহণ,</li>
            <li>কোনো কার্যক্রম পরিচালনা,</li>
            <li>কোনো ব্যক্তি বা প্রতিষ্ঠানের কাছে সংগঠনের প্রতিনিধিত্ব,</li>
            <li>কোনো প্রতিশ্রুতি প্রদান,</li>
            <li>কোনো চিঠিপত্র বা যোগাযোগ করা,</li>
            <li>অথবা অন্য কোনো কার্যক্রম পরিচালনার সীমাহীন ক্ষমতা প্রদান করা হয়নি।</li>
          </ul>
          <p>সংগঠনের নামে কোনো কার্যক্রম গ্রহণ বা প্রতিনিধিত্ব করার পূর্বে ক্ষমতাপ্রাপ্ত কর্তৃপক্ষের পূর্বানুমতি ও লিখিত অনুমোদন গ্রহণ করা আবশ্যক ছিল।</p>
        </div>
      )
    },
    {
      num: "৩",
      title: "অনুমোদনবিহীন কার্যক্রম ও সাংগঠনিক শৃঙ্খলা লঙ্ঘন",
      content: (
        <div className="space-y-4">
          <p>ক্ষমতাপ্রাপ্ত কর্তৃপক্ষের নজরে এসেছে যে, আপনি Human Rights Affairs Trust-এর নামে বিভিন্ন উদ্যোগ, কার্যক্রম ও পদক্ষেপ গ্রহণ করেছেন এবং/অথবা গ্রহণ করার জন্য নিজেকে প্রতিনিধিত্ব করেছেন, অথচ এসব কার্যক্রমের জন্য ক্ষমতাপ্রাপ্ত উচ্চতর কর্তৃপক্ষের পূর্বানুমতি, অনুমোদন বা জ্ঞান ছিল না।</p>
          <p>আপনাকে একাধিকবার মৌখিকভাবে সতর্ক করা হয়েছিল এবং স্পষ্টভাবে জানানো হয়েছিল যে, আপনার কার্যক্রম আপনার নির্ধারিত দায়িত্বের সীমার মধ্যে রাখতে হবে এবং সংগঠনের নামে কোনো কার্যক্রম গ্রহণ বা প্রতিনিধিত্ব করার পূর্বে যথাযথ অনুমোদন নিতে হবে।</p>
          <p>তা সত্ত্বেও, ক্ষমতাপ্রাপ্ত কর্তৃপক্ষের বিবেচনায় প্রয়োজনীয় সাংগঠনিক শৃঙ্খলা এবং অনুমোদন প্রক্রিয়া যথাযথভাবে অনুসরণ করা হয়নি।</p>
        </div>
      )
    },
    {
      num: "৪",
      title: " অবিলম্বে নিয়োগের অবসান",
      content: (
        <div className="space-y-4">
          <p>উপরোক্ত কারণসমূহের পরিপ্রেক্ষিতে, Human Rights Affairs Trust, West Bengal State Committee-এর Legal Advisor পদে অ্যাডভোকেট শ্রী ভাস্কর মণ্ডলের নিয়োগ <strong className="text-red-600 underline">১২ সেপ্টেম্বর ২০২৬</strong> তারিখ থেকে অবিলম্বে বাতিল/সমাপ্ত করা হলো।</p>
          <p>এই আদেশ জারির তারিখ ও সময় থেকে আপনি আর সংগঠনের Legal Advisor হিসেবে কোনো পদ, designation, কর্তৃত্ব বা ক্ষমতা ধারণ, প্রয়োগ অথবা দাবি করতে পারবেন না।</p>
        </div>
      )
    },
    {
      num: "৫",
      title: "সকল ক্ষমতা ও অনুমোদন প্রত্যাহার",
      content: (
        <div className="space-y-4">
          <p>Legal Advisor হিসেবে আপনার পদমর্যাদার ভিত্তিতে পূর্বে আপনাকে প্রদান করা হয়ে থাকলে এমন সমস্ত ক্ষমতা, অনুমোদন, authorization, representation rights and অন্যান্য কর্তৃত্ব এই আদেশের মাধ্যমে অবিলম্বে প্রত্যাহার করা হলো।</p>
          <p>অতএব, আপনি আর সংগঠনের পক্ষ থেকে—</p>
          <ul className="list-disc pl-8 space-y-1">
            <li>কোনো যোগাযোগ,</li>
            <li>আলোচনা বা negotiation,</li>
            <li>প্রতিশ্রুতি,</li>
            <li>আশ্বাস,</li>
            <li>আবেদন,</li>
            <li>বক্তব্য,</li>
            <li>কার্যক্রম,</li>
            <li>আইনি বা প্রশাসনিক পদক্ষেপ,</li>
          </ul>
          <p>গ্রহণ করতে পারবেন না এবং কোনো ব্যক্তি, প্রতিষ্ঠান বা কর্তৃপক্ষের কাছে Human Rights Affairs Trust-এর প্রতিনিধি হিসেবে নিজেকে উপস্থাপন করতে পারবেন না। তবে ভবিষ্যতে যদি ক্ষমতাপ্রাপ্ত কর্তৃপক্ষের পক্ষ থেকে পৃথকভাবে লিখিত অনুমোদন প্রদান করা হয়, সেই অনুমোদনের নির্দিষ্ট সীমার মধ্যে কার্যক্রম পরিচালনা করা যেতে পারে।</p>
        </div>
      )
    },
    {
      num: "৬",
      title: "সংগঠনের নাম, পরিচয় ও সামগ্রী ব্যবহারে নিষেধাজ্ঞা",
      content: (
        <div className="space-y-4">
          <p>এই আদেশ জারির সঙ্গে সঙ্গে আপনাকে Human Rights Affairs Trust-এর সঙ্গে সম্পর্কিত নিম্নলিখিত কোনো নাম, পরিচয়, designation বা সামগ্রী ব্যবহার, প্রদর্শন, পুনরুৎপাদন, প্রচার বা উপস্থাপন করা থেকে কঠোরভাবে নিষেধ করা হলো:</p>
          <ul className="list-disc pl-8 space-y-1">
            <li>“Human Rights Affairs Trust” অথবা West Bengal State Committee-এর নাম;</li>
            <li>সংগঠনের Logo, Emblem, Banner, Insignia বা অন্যান্য পরিচয়চিহ্ন;</li>
            <li>“Legal Advisor” অথবা এমন কোনো designation যা আপনার সংগঠনের সঙ্গে বর্তমান সম্পর্ক বা কর্তৃত্বের ধারণা সৃষ্টি করে;</li>
            <li>সংগঠনের Identity Card, Authorization Card, Appointment Letter বা Authorization Letter;</li>
            <li>সংগঠনের Letterhead, Seal, Stamp, Official Form বা Official Document;</li>
            <li>সংগঠনের পরিচয় নির্দেশ করে এমন কোনো Vehicle Plate, Sticker, Signboard বা অন্য কোনো physical representation;</li>
            <li>সংগঠনের নামে কোনো Website, Social Media Profile, Digital Account, Email Signature, Electronic Document অথবা অন্য কোনো digital representation।</li>
          </ul>
        </div>
      )
    },
    {
      num: "৭",
      title: "সংগঠনের প্রতিনিধি হিসেবে নিজেকে উপস্থাপনে নিষেধাজ্ঞা",
      content: (
        <div className="space-y-4">
          <p>আপনি নিজেকে কোনোভাবেই—</p>
          <ul className="list-disc pl-8 space-y-1">
            <li>Legal Advisor,</li>
            <li>Authorized Representative,</li>
            <li>Office Bearer,</li>
            <li>Functionary,</li>
            <li>Agent,</li>
            <li>Spokesperson,</li>
            <li>Authorized Person</li>
          </ul>
          <p>অথবা Human Rights Affairs Trust-এর অন্য কোনো অনুমোদিত ব্যক্তি হিসেবে প্রত্যক্ষ বা পরোক্ষভাবে উপস্থাপন করতে পারবেন না। আপনার পক্ষ থেকে এমন কোনো বক্তব্য, পরিচয় বা কার্যক্রম গ্রহণ করা যাবে না যার মাধ্যমে বোঝা যায় যে আপনি এখনও Human Rights Affairs Trust-এর সঙ্গে যুক্ত বা সংগঠনের পক্ষে কোনো ক্ষমতা রাখেন।</p>
        </div>
      )
    },
    {
      num: "৮",
      title: "CEASE AND DESIST — অবিলম্বে বন্ধ করার নির্দেশ",
      isHighlight: true,
      content: (
        <div className="space-y-4">
          <p>আপনাকে অবিলম্বে CEASE AND DESIST করার নির্দেশ দেওয়া হলো।</p>
          <p>অর্থাৎ, ক্ষমতাপ্রাপ্ত কর্তৃপক্ষের লিখিত অনুমোদন ছাড়া Human Rights Affairs Trust-এর নামে বা সংগঠনের পক্ষে—</p>
          <ul className="list-disc pl-8 space-y-1">
            <li>কোনো কার্যক্রম পরিচালনা,</li>
            <li>উদ্যোগ গ্রহণ,</li>
            <li>যোগাযোগ,</li>
            <li>চিঠিপত্র,</li>
            <li>আইনগত বা প্রশাসনিক পদক্ষেপ,</li>
            <li>জনসমক্ষে বক্তব্য,</li>
            <li>কোনো প্রতিশ্রুতি,</li>
            <li>কোনো প্রতিনিধিত্ব</li>
          </ul>
          <p>করা বা চালিয়ে যাওয়া অবিলম্বে সম্পূর্ণরূপে বন্ধ করতে হবে।</p>
        </div>
      )
    },
    {
      num: "৯",
      title: "পরবর্তী কোনো অনুমোদনবিহীন কার্যক্রমের দায় সংগঠনের নয়",
      content: (
        <div className="space-y-4">
          <p>এই আদেশ কার্যকর হওয়ার পর আপনার দ্বারা ক্ষমতাপ্রাপ্ত কর্তৃপক্ষের নির্দিষ্ট লিখিত অনুমোদন ছাড়া সম্পাদিত কোনো—</p>
          <ul className="list-disc pl-8 space-y-1">
            <li>কার্যক্রম,</li>
            <li>বক্তব্য,</li>
            <li>যোগাযোগ,</li>
            <li>প্রতিশ্রুতি,</li>
            <li>undertaking,</li>
            <li>document,</li>
            <li>application,</li>
            <li>representation</li>
          </ul>
          <p>Human Rights Affairs Trust-এর কোনো কার্যক্রম, সিদ্ধান্ত, প্রতিশ্রুতি বা প্রতিনিধিত্ব হিসেবে স্বীকৃত বা গ্রহণ করা হবে না। এই ধরনের কোনো অনুমোদনবিহীন কার্যক্রম থেকে উদ্ভূত কোনো দায়, দাবি, ক্ষতি, আর্থিক দায়বদ্ধতা বা অন্যান্য পরিণতির জন্য সংগঠন দায়ী থাকবে না।</p>
        </div>
      )
    },
    {
      num: "১০",
      title: "সংগঠনের সম্পত্তি ও নথিপত্র ফেরত",
      content: (
        <div className="space-y-4">
          <p>আপনার কাছে বা আপনার নিয়ন্ত্রণে থাকা সংগঠনের সমস্ত সম্পত্তি, নথিপত্র এবং সামগ্রী ক্ষমতাপ্রাপ্ত প্রতিনিধির কাছে ফেরত দেওয়ার জন্য আপনাকে নির্দেশ দেওয়া হলো। এর মধ্যে অন্তর্ভুক্ত, তবে এতেই সীমাবদ্ধ নয়—</p>
          <ul className="list-disc pl-8 space-y-1">
            <li>Identity/Authorization Card;</li>
            <li>Appointment/Authorization Letter;</li>
            <li>সংগঠনের Files;</li>
            <li>Official Documents;</li>
            <li>Seal/Stamp;</li>
            <li>Letterhead;</li>
            <li>Printed Materials;</li>
            <li>Digital Credentials/Access Details;</li>
            <li>Banner;</li>
            <li>Organizational Insignia;</li>
            <li>এবং সংগঠনের মালিকানাধীন বা সংগঠনের পরিচয় বহনকারী অন্যান্য সামগ্রী।</li>
          </ul>
          <p>এসব সামগ্রী এই আদেশ প্রাপ্তির <strong className="text-red-600 underline">৩ (তিন) কার্যদিবসের</strong> মধ্যে এবং সর্বোচ্চ <strong className="text-primary underline">১৬ সেপ্টেম্বর ২০২৬</strong> তারিখের মধ্যে ফেরত দিতে হবে। সামগ্রী হস্তান্তরের পর সংগঠনের ক্ষমতাপ্রাপ্ত প্রতিনিধির কাছ থেকে লিখিত প্রাপ্তিস্বীকার/রসিদ গ্রহণ করে সংরক্ষণ করার জন্য আপনাকে নির্দেশ দেওয়া হলো।</p>
        </div>
      )
    },
    {
      num: "১১",
      title: "আইনগত ও প্রশাসনিক পরিণতি",
      content: (
        <div className="space-y-4">
          <p>নিয়োগ সমাপ্ত হওয়ার পরেও সংগঠনের নাম, পরিচয়, designation, নথিপত্র, seal, credentials বা অন্যান্য সাংগঠনিক পরিচয় ব্যবহার করা অথবা সংগঠনের পক্ষে অনুমোদনবিহীনভাবে প্রতিনিধিত্ব করার চেষ্টা করা হলে, প্রযোজ্য আইন অনুযায়ী যথাযথ আইনগত এবং/অথবা প্রশাসনিক ব্যবস্থা গ্রহণ করা হতে পারে।</p>
          <p>এই বিষয়ে Human Rights Affairs Trust-এর কাছে আইনে প্রাপ্য সমস্ত অধিকার ও প্রতিকার সংরক্ষিত থাকল। এই আদেশের কোনো অংশকে এমনভাবে ব্যাখ্যা করা যাবে না যে, সংগঠন এই আদেশ জারির পূর্বে বা পরে সংঘটিত কোনো অনুমোদনবিহীন কার্যক্রম, বক্তব্য, document, communication বা representation-এর বিরুদ্ধে ভবিষ্যতে ব্যবস্থা নেওয়ার অধিকার পরিত্যাগ করেছে।</p>
        </div>
      )
    },
    {
      num: "১২",
      title: "আদেশ কার্যকর হওয়ার তারিখ",
      content: (
        <div className="space-y-4">
          <p>এই Termination Order ১২ সেপ্টেম্বর ২০২৬ তারিখে জারির সঙ্গে সঙ্গে অবিলম্বে কার্যকর হবে। ক্ষমতাপ্রাপ্ত কর্তৃপক্ষের পক্ষ থেকে পরবর্তীতে কোনো পৃথক লিখিত আদেশ দ্বারা পরিবর্তন বা প্রতিস্থাপন না করা পর্যন্ত এই আদেশ কার্যকর থাকবে।</p>
          <p>আপনাকে এই আদেশকে আপনার নিয়োগের অবসান সংক্রান্ত চূড়ান্ত সাংগঠনিক সিদ্ধান্ত হিসেবে গ্রহণ করে এর মধ্যে উল্লেখিত সমস্ত নির্দেশ যথাযথভাবে পালন করার জন্য বলা হলো।</p>
          <p>আপনার নিয়োগকালীন পেশাগত পরিষেবার জন্য সংগঠন কৃতজ্ঞ এবং আপনার ভবিষ্যৎ পেশাগত জীবনের সাফল্য কামনা করে।</p>
        </div>
      )
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
          .print-sheet {
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

      {/* Document Sheet (A4 Proportion) */}
      <div className="print-sheet max-w-[210mm] mx-auto bg-white shadow-2xl p-10 md:p-16 print:p-0 min-h-[297mm] flex flex-col relative text-slate-900 border border-slate-200 print:border-none">
        
        {/* Header Block */}
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

        {/* Document Meta */}
        <div className="flex justify-between items-start mb-10 text-sm font-bold">
          <div className="flex gap-2">
            <span>স্মারক নং:</span>
            <span className="font-mono">HRA/WB/LA/TERMINATION/__/2026</span>
          </div>
          <div className="text-right">
            <p>তারিখ: ১২ সেপ্টেম্বর ২০২৬</p>
          </div>
        </div>

        {/* Title Block */}
        <div className="text-center space-y-2 mb-10">
          <h3 className="text-3xl font-bold text-primary underline underline-offset-8">অফিস আদেশ</h3>
          <p className="text-xl font-bold text-slate-700">LEGAL ADVISOR পদে নিয়োগ বাতিল/অবসান সংক্রান্ত আদেশ</p>
        </div>

        {/* Recipient Block */}
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

        {/* UNABRIDGED DOCUMENT BODY */}
        <div className="space-y-12 text-sm md:text-base leading-relaxed text-justify text-slate-800">
           {sections.map((sec) => (
             <section key={sec.num} className={cn(
               "space-y-3 p-1 rounded-xl transition-colors",
               sec.isHighlight && "p-8 border-2 border-red-200 bg-red-50/50 rounded-3xl print:bg-white print:border-slate-400"
             )}>
                <h4 className={cn(
                  "font-bold text-primary flex items-baseline gap-3",
                  sec.isHighlight && "text-red-700 text-lg mb-2"
                )}>
                   <span className="shrink-0 bg-slate-100 dark:bg-slate-950 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black">{sec.num}</span>
                   <span>{sec.title}</span>
                </h4>
                <div className={cn(
                  "font-medium pl-11",
                  sec.isHighlight && "text-red-900 leading-relaxed"
                )}>
                   {sec.content}
                </div>
             </section>
           ))}
        </div>

        {/* Signature Block */}
        <div className="mt-24 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-end print:break-inside-avoid">
          <div className="text-center md:text-left space-y-2">
            <div className="w-32 h-32 relative mx-auto md:mx-0 opacity-10 grayscale">
              <Image src="/HRAT%20Logo.jpeg" alt="Seal" fill className="object-contain" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">অফিসিয়াল সিল</p>
          </div>
          
          <div className="text-center md:text-right space-y-2">
            <p className="text-sm font-black uppercase tracking-widest text-slate-400 font-sans">স্বাক্ষর</p>
            <div className="h-24 w-64 md:ml-auto"></div>
            <div className="space-y-1">
              <p className="font-black text-primary uppercase leading-tight font-sans">Human Rights Affairs Trust-এর পক্ষে</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">West Bengal State Committee</p>
              <p className="text-xl font-bold text-primary mt-6 font-sans">Smt. Moumita Saha</p>
              <p className="text-sm font-black text-red-600 font-sans">Chairperson</p>
              <p className="text-[10px] font-bold text-slate-500 font-sans">Human Rights Affairs Trust, West Bengal State Committee</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 font-sans">তারিখ: ১২ সেপ্টেম্বর ২০২৬</p>
            </div>
          </div>
        </div>

        {/* CC Section */}
        <div className="mt-16 space-y-4 pt-10 border-t border-slate-100 print:break-inside-avoid">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-sans">অনুলিপি প্রেরিত (Copy To):</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-xs font-bold text-slate-600">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> ১. Officer-in-Charge, Matia Police Station।</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> ২. Superintendent of Police, North 24 Parganas District Police।</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> ৩. District Magistrate, North 24 Parganas।</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> ৪. Competent / Higher Authority।</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> ৫. Office File / Record।</li>
          </ul>
        </div>

        {/* Final Important Notice Box */}
        <div className="mt-16 p-10 bg-slate-900 text-white rounded-[3rem] border-none shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-2 print:border-black print:rounded-none print:shadow-none print:break-inside-avoid">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 print:hidden"></div>
          <div className="relative z-10 space-y-4 text-center">
             <div className="flex items-center justify-center gap-3 mb-2">
                <AlertCircle className="w-6 h-6 text-accent" />
                <h4 className="text-sm font-black uppercase tracking-[0.4em] text-accent font-sans print:text-black">গুরুত্বপূর্ণ নোট</h4>
             </div>
             <p className="text-sm md:text-base leading-relaxed text-slate-300 italic font-medium print:text-black">
               "এই আদেশটি সংগঠনের কর্তৃত্ব ও প্রতিনিধিত্ব সংক্রান্ত। ক্ষমতাপ্রাপ্ত কর্তৃপক্ষের নির্দিষ্ট লিখিত অনুমোদন ছাড়া ভবিষ্যতে সংগঠনের নামে কোনো প্রতিনিধিত্ব করা হলে তা অনুমোদনবিহীন হিসেবে গণ্য হবে এবং তা সংগঠনকে কোনোভাবে আবদ্ধ করবে না।"
             </p>
          </div>
        </div>

        {/* Page Footer / Numbering */}
        <div className="mt-auto pt-10 text-center flex flex-col items-center gap-4 border-t border-slate-50">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em] font-sans">Official Registry Record • পৃষ্ঠা ১ / ১</p>
        </div>
      </div>

      {/* Floating Bottom Home Button */}
      <div className="mt-12 max-w-[210mm] mx-auto no-print">
         <Button asChild className="w-full h-16 rounded-[1.5rem] bg-slate-900 text-white hover:bg-slate-800 shadow-2xl font-bold flex gap-3">
            <Link href="/"><Home className="w-6 h-6" /> Close Archive Session</Link>
         </Button>
      </div>
    </main>
  );
}

function Home({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
