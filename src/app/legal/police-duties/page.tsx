"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ShieldCheck, 
  Gavel, 
  UserCircle, 
  FileCheck, 
  Users, 
  Info, 
  Clock, 
  Stethoscope, 
  Scale, 
  Phone, 
  Database, 
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Lock,
  X,
  ShieldAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * PoliceDutiesPage: A high-fidelity interactive legal hub.
 * Optimized for all screen sizes with responsive typography and fluid layouts.
 * Features: A numbered list of captions that transition into detailed procedural guides.
 */
export default function PoliceDutiesPage() {
  const [activeView, setActiveView] = useState<'list' | 'arrest-duties'>('list')

  // --- CONTENT: ARREST DUTIES ---
  const arrestDutiesPoints = [
    { icon: <UserCircle className="w-5 h-5 md:w-6 md:h-6" />, text: "নিজের পরিচয় প্রকাশ করতে হবে – গ্রেপ্তারকারী পুলিশ কর্মকর্তাকে নাম, পদবী ও পরিচয় স্পষ্টভাবে প্রদর্শন করতে হবে।" },
    { icon: <FileCheck className="w-5 h-5 md:w-6 md:h-6" />, text: "গ্রেপ্তার মেমো (Arrest Memo) প্রস্তুত করতে হবে – গ্রেপ্তারের তারিখ, সময় ও স্থান উল্লেখ করে একটি গ্রেপ্তার মেমো তৈরি করতে হবে। এতে গ্রেপ্তারকৃত ব্যক্তি এবং অন্তত একজন সাক্ষীর (সম্ভব হলে পরিবারের সদস্য বা এলাকার সম্মানিত ব্যক্তি) স্বাক্ষর থাকতে হবে।" },
    { icon: <Users className="w-5 h-5 md:w-6 md:h-6" />, text: "পরিবার বা আত্মীয়কে অবহিত করতে হবে – গ্রেপ্তারকৃত ব্যক্তির মনোনীত কোনো আত্মীয়, বন্ধু বা পরিচিত ব্যক্তিকে দ্রুত গ্রেপ্তারের খবর এবং কোথায় রাখা হয়েছে তা জানাতে হবে।" },
    { icon: <Info className="w-5 h-5 md:w-6 md:h-6" />, text: "এই অধিকার সম্পর্কে গ্রেপ্তারকৃত ব্যক্তিকে জানাতে হবে – গ্রেপ্তারকৃত ব্যক্তিকে জানাতে হবে যে তিনি তাঁর পরিবারের সদস্য বা অন্য কাউকে গ্রেপ্তারের খবর দেওয়ার অধিকার রাখেন।" },
    { icon: <Database className="w-5 h-5 md:w-6 md:h-6" />, text: "থানার রেকর্ডে সব তথ্য নথিভুক্ত করতে হবে – গ্রেপ্তারের সময়, স্থান, গ্রেপ্তারকারী কর্মকর্তার নাম এবং কোথায় আটক রাখা হয়েছে—এসব তথ্য থানার সাধারণ ডায়েরি বা সরকারি রেকর্ডে লিখতে হবে।" },
    { icon: <Stethoscope className="w-5 h-5 md:w-6 md:h-6" />, text: "স্বাস্থ্য পরীক্ষা করাতে হবে – গ্রেপ্তারের সময় গ্রেপ্তারকৃত ব্যক্তির স্বাস্থ্য পরীক্ষা করতে হবে এবং হেফাজতে থাকাকালীন আইন অনুযায়ী নির্দিষ্ট সময় অন্তর ডাক্তারি পরীক্ষা করাতে হবে।" },
    { icon: <Clock className="w-5 h-5 md:w-6 md:h-6" />, text: "২৪ ঘণ্টার মধ্যে ম্যাজিস্ট্রেটের সামনে হাজির করতে হবে – যাতায়াতের জন্য প্রয়োজনীয় সময় বাদ দিয়ে গ্রেপ্তারের ২৪ ঘণ্টার মধ্যে নিকটস্থ বিচারিক ম্যাজিস্ট্রেটের সামনে হাজির করতে হবে।" },
    { icon: <Scale className="w-5 h-5 md:w-6 md:h-6" />, text: "আইনজীবীর সঙ্গে সাক্ষাতের সুযোগ দিতে হবে – জিজ্ঞাসাবাদের সময় গ্রেপ্তারকৃত ব্যক্তিকে তাঁর আইনজীবীর সঙ্গে সাক্ষাতের সুযোগ দিতে হবে, যদিও পুরো জিজ্ঞাসাবাদের সময় আইনজীবীর উপস্থিতি বাধ্যতামূলক নয়।" },
    { icon: <FileCheck className="w-5 h-5 md:w-6 md:h-6" />, text: "গ্রেপ্তার-সংক্রান্ত নথি ম্যাজিস্ট্রেটের কাছে পাঠাতে হবে – গ্রেপ্তার মেমোসহ প্রয়োজনীয় নথির অনুলিপি ম্যাজিস্ট্রেটের কাছে পাঠাতে হবে।" },
    { icon: <Phone className="w-5 h-5 md:w-6 md:h-6" />, text: "পুলিশ কন্ট্রোল রুমে তথ্য জানাতে হবে – গ্রেপ্তার এবং আটক রাখার স্থান সম্পর্কে নির্ধারিত সময়ের মধ্যে জেলা বা রাজ্য পুলিশ কন্ট্রোল রুমে তথ্য পাঠাতে হবে।" }
  ];

  if (activeView === 'arrest-duties') {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 pb-24 animate-in fade-in duration-500">
        {/* Detail Header */}
        <section className="pt-24 pb-12 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <Button 
              variant="ghost" 
              onClick={() => setActiveView('list')}
              className="mb-8 p-0 h-auto text-accent hover:text-white font-bold text-xs uppercase tracking-widest gap-2 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Guidelines
            </Button>
            <div className="space-y-4 max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> BNSS 2023 Protocol
              </div>
              <h1 className="text-3xl md:text-5xl font-headline font-bold leading-tight">
                গ্রেপ্তার করার সময় পুলিশের <br/><span className="text-accent italic">অবশ্য পালনীয় কর্তব্য</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-lg leading-relaxed max-w-3xl italic">
                ডি. কে. বসু বনাম পশ্চিমবঙ্গ রাজ্য (1997) মামলার রায় এবং ভারতের সংবিধান অনুযায়ী বাধ্যতামূলক গাইডলাইন।
              </p>
            </div>
          </div>
        </section>

        {/* Detail Content */}
        <div className="container mx-auto px-4 md:px-6 mt-12 space-y-16">
          <div className="grid lg:grid-cols-1 gap-8 max-w-4xl mx-auto">
            {/* The 10 Points */}
            <div className="space-y-4">
               <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 mb-8">
                 <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                   ডি. কে. বসু বনাম পশ্চিমবঙ্গ রাজ্য (D.K. Basu vs. State of West Bengal, 1997) মামলার রায়, ভারতের সংবিধান এবং প্রযোজ্য ফৌজদারি কার্যবিধি (বর্তমানে ভারতীয় নাগরিক সুরক্ষা সংহিতা, ২০২৩) অনুযায়ী, গ্রেপ্তারের সময় পুলিশের নিম্নলিখিত কর্তব্যগুলি পালন করা বাধ্যতামূলক:
                 </p>
               </div>

               <div className="grid gap-4">
                {arrestDutiesPoints.map((point, idx) => (
                  <Card key={idx} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-slate-800">
                      <CardContent className="p-5 md:p-6 flex items-start gap-5">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 dark:bg-slate-800 shadow-sm flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                            {point.icon}
                        </div>
                        <p className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-200 leading-relaxed pt-1">
                          {point.text}
                        </p>
                      </CardContent>
                  </Card>
                ))}
               </div>
            </div>

            {/* Consequences Section */}
            <section className="space-y-8 pt-12 border-t border-slate-100 dark:border-slate-800">
               <div className="text-center space-y-2">
                 <h2 className="text-2xl md:text-3xl font-headline font-bold text-red-600">এই নিয়ম না মানলে কী হতে পারে?</h2>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Legal Implications of Non-Compliance</p>
               </div>
               <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "গ্রেপ্তারের বৈধতা আদালতে প্রশ্নবিদ্ধ হতে পারে।",
                    "সংশ্লিষ্ট পুলিশ কর্মকর্তার বিরুদ্ধে বিভাগীয় ব্যবস্থা নেওয়া হতে পারে।",
                    "আদালত অবমাননার (Contempt of Court) অভিযোগ হতে পারে।",
                    "ভুক্তভোগী ক্ষতিপূরণসহ অন্যান্য আইনি প্রতিকার চাইতে পারেন।"
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-start gap-4">
                       <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                       <span className="text-sm md:text-base font-bold text-red-900 dark:text-red-400 leading-snug">{item}</span>
                    </div>
                  ))}
               </div>
            </section>

            {/* Constitutional Conclusion */}
            <Card className="rounded-[3rem] bg-slate-950 text-white p-10 md:p-16 relative overflow-hidden shadow-2xl border-none text-center">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
               <div className="relative z-10 space-y-6">
                  <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto animate-float" />
                  <p className="text-base md:text-2xl text-slate-300 leading-relaxed italic font-medium">
                    "এই নির্দেশিকাগুলির উদ্দেশ্য হলো ভারতের সংবিধানের অনুচ্ছেদ ২১ (জীবন ও ব্যক্তিস্বাধীনতার অধিকার) এবং অনুচ্ছেদ ২২ (গ্রেপ্তারকৃত ব্যক্তির অধিকার) সুরক্ষিত রাখা এবং বেআইনি গ্রেপ্তার ও পুলিশি হেফাজতে নির্যাতন প্রতিরোধ করা।"
                  </p>
                  <div className="pt-6">
                     <Badge variant="outline" className="text-accent border-accent/30 font-black text-[10px] tracking-[0.3em] px-8 h-9 rounded-full">OFFICIAL INSTITUTIONAL RECORD</Badge>
                  </div>
               </div>
            </Card>

            <div className="flex justify-center pt-8">
               <Button onClick={() => setActiveView('list')} size="lg" className="h-16 px-12 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary transition-all shadow-xl shadow-primary/20">
                 Close Detailed Briefing
               </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-2xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center space-y-4">
           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl inline-block shadow-inner border border-slate-100 dark:border-slate-800">
              <ShieldAlert className="w-10 h-10 text-accent animate-pulse" />
           </div>
           <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary dark:text-white">প্রয়োজনীয় কিছু তথ্য</h1>
           <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest">Public Information Hub • Justice Shield</p>
        </div>

        {/* Focused List Container */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12"></div>
          
          <ul className="space-y-10 list-none p-0 m-0">
            {/* Item 1 - Interactive */}
            <li 
              onClick={() => setActiveView('arrest-duties')}
              className="flex items-start gap-6 group cursor-pointer"
            >
              <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary font-black text-lg md:text-xl shadow-lg group-hover:bg-secondary group-hover:text-white transition-all duration-500 group-hover:scale-110">
                ১.
              </div>
              <div className="space-y-2 pt-1 flex-1">
                <p className="text-lg md:text-xl font-bold text-primary dark:text-white leading-snug group-hover:text-accent transition-colors">
                  গ্রেপ্তার করার সময় পুলিশের অবশ্য পালনীয় কর্তব্য
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 tracking-widest opacity-60 group-hover:opacity-100 transition-all">
                  Click to read full briefing <ChevronRight className="w-3.5 h-3.5 ml-1 animate-pulse" />
                </div>
              </div>
            </li>

            {/* Future Placeholder 2 */}
            <li className="flex items-start gap-6 opacity-20 select-none grayscale pointer-events-none">
              <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 font-black text-lg md:text-xl">
                ২.
              </div>
              <div className="space-y-2 pt-4 flex-1">
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
              </div>
            </li>

            {/* Future Placeholder 3 */}
            <li className="flex items-start gap-6 opacity-10 select-none grayscale pointer-events-none">
              <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 font-black text-lg md:text-xl">
                ৩.
              </div>
              <div className="space-y-2 pt-4 flex-1">
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
              </div>
            </li>
          </ul>
        </div>

        <div className="pt-12 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link href="/">
            <Button variant="ghost" className="gap-2 font-bold text-slate-400 hover:text-accent transition-all uppercase text-[10px] tracking-[0.2em] h-12 rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Return to Homepage
            </Button>
          </Link>
        </div>
        
        <p className="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] pt-8 text-center">
          Official Institutional Record • HRAT India
        </p>
      </div>
    </main>
  )
}
