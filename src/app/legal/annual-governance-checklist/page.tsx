"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  BadgeCheck, 
  Calendar,
  FileText,
  ShieldCheck,
  Building2,
  Users,
  BookOpen,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Footer } from '@/components/footer'

export default function AnnualGovernanceChecklistPage() {
  const handlePrint = () => {
    window.print()
  }

  const checklistItems = [
    { label: "AGM Notice (বার্ষিক সাধারণ সভার নোটিশ)", icon: <Calendar className="w-4 h-4" /> },
    { label: "Annual Report (বার্ষিক প্রতিবেদন)", icon: <FileText className="w-4 h-4" /> },
    { label: "Auditor's Report (অডিট রিপোর্ট)", icon: <ShieldCheck className="w-4 h-4" /> },
    { label: "AGM Minutes Book (বার্ষিক সাধারণ সভার কার্যবিবরণী)", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Voting Paper (ভোটপত্র)", icon: <FileText className="w-4 h-4" /> },
    { label: "Election Proceedings (নির্বাচন কার্যবিবরণী)", icon: <Users className="w-4 h-4" /> },
    { label: "Attendance Register (উপস্থিতি নিবন্ধন)", icon: <Users className="w-4 h-4" /> },
    { label: "Agenda (আলোচ্যসূচি)", icon: <FileText className="w-4 h-4" /> },
    { label: "Resolution Register (সিদ্ধান্ত নিবন্ধন)", icon: <FileText className="w-4 h-4" /> },
    { label: "Action Taken Report – ATR (গৃহীত সিদ্ধান্ত বাস্তবায়ন প্রতিবেদন)", icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: "Budget & Finance Report (বাজেট ও আর্থিক প্রতিবেদন)", icon: <Building2 className="w-4 h-4" /> },
    { label: "Income & Expenditure Statement (আয়–ব্যয়ের বিবরণী)", icon: <Building2 className="w-4 h-4" /> },
    { label: "Membership Report (সদস্যপদ প্রতিবেদন)", icon: <Users className="w-4 h-4" /> },
    { label: "Project Progress Report (প্রকল্পের অগ্রগতি প্রতিবেদন)", icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: "Development Plan (উন্নয়ন পরিকল্পনা)", icon: <Globe className="w-4 h-4" /> },
    { label: "Future Action Plan (ভবিষ্যৎ কর্মপরিকল্পনা)", icon: <Globe className="w-4 h-4" /> },
    { label: "Election Result Sheet (নির্বাচনের ফলাফল)", icon: <Users className="w-4 h-4" /> },
    { label: "Vote Counting Sheet (ভোট গণনার শিট)", icon: <FileText className="w-4 h-4" /> },
    { label: "Chairman's Address (চেয়ারম্যানের বক্তব্য)", icon: <Users className="w-4 h-4" /> },
    { label: "General Secretary's Report (সাধারণ সম্পাদকের প্রতিবেদন)", icon: <Users className="w-4 h-4" /> },
    { label: "Treasurer's Report (কোষাধ্যক্ষের প্রতিবেদন)", icon: <Users className="w-4 h-4" /> },
    { label: "Auditor's Observation & Recommendation (অডিটরের পর্যবেক্ষণ ও সুপারিশ)", icon: <ShieldCheck className="w-4 h-4" /> },
    { label: "Closing Remarks & Vote of Thanks (সমাপনী বক্তব্য ও ধন্যবাদ জ্ঞাপন)", icon: <Users className="w-4 h-4" /> },
    { label: "Official Signatures & Seal (স্বাক্ষর ও অফিসিয়াল সিল)", icon: <BadgeCheck className="w-4 h-4" /> }
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 print:bg-white print:p-0">
      {/* Header - Hidden on Print */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link href="/trust-responsibilities" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Guidelines
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Calendar className="w-8 h-8 text-accent" />
              </div>
              <BadgeCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Annual <span className="text-accent italic">Governance</span> Checklist
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium">
              Checklist of 24 mandatory institutional records and procedures for yearly compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Editor Toolbar - Hidden on Print */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Audit Tool</span>
          </div>
          <Button onClick={handlePrint} className="bg-primary text-white hover:bg-secondary font-bold rounded-xl gap-2 shadow-xl shadow-primary/20">
            <Printer className="w-4 h-4" /> Print Checklist
          </Button>
        </div>
      </section>

      {/* Main Document Body */}
      <section className="py-16 md:py-24 px-4 print:py-0 print:px-0">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            
            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900 relative print:shadow-none print:rounded-none print:bg-white print:text-black">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 print:hidden"></div>
               <div className="absolute top-0 left-0 w-1.5 h-full bg-accent print:hidden"></div>
               
               <CardContent className="p-8 md:p-16 space-y-8 text-slate-800 dark:text-slate-200 font-sans leading-relaxed text-sm md:text-base print:text-black print:p-12">
                  {/* Letterhead */}
                  <div className="text-center space-y-3 pb-8 border-b-2 border-slate-100 print:border-black">
                    <div className="relative w-20 h-20 mx-auto">
                      <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-headline font-bold text-primary dark:text-white uppercase tracking-tight print:text-black">
                      HUMAN RIGHTS AFFAIRS TRUST
                    </h2>
                    <h3 className="text-lg md:text-xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest print:text-black mt-2">
                      বছরে একবার বাধ্যতামূলক করনীয় (Checklist)
                    </h3>
                  </div>

                  {/* Checklist Grid */}
                  <div className="pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {checklistItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:border-accent transition-all print:bg-transparent print:border-b print:border-slate-100 print:rounded-none">
                           <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 group-hover:border-accent print:border-black">
                              <span className="text-[10px] font-bold text-slate-300 group-hover:text-accent print:text-transparent">☐</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Item {index + 1}</span>
                              <span className="font-bold text-primary dark:text-slate-200 text-sm leading-tight print:text-black">{item.label}</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Implementation Note */}
                  <div className="mt-12 p-8 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900 shadow-inner">
                    <div className="flex items-start gap-4">
                      <ShieldCheck className="w-6 h-6 text-emerald-600 mt-1 shrink-0" />
                      <div className="space-y-2">
                        <h4 className="font-black uppercase tracking-widest text-[10px] text-emerald-700">Implementation Mandate</h4>
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 italic leading-relaxed">
                          "This checklist represents the core documentation required for the legal and administrative maintenance of a Human Rights Affairs Trust chapter. Every District and State chapter must ensure these records are prepared, audited, and presented during the Annual General Meeting (AGM)."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Seal Area */}
                  <div className="pt-16 flex flex-col items-center gap-4">
                     <div className="w-32 h-32 border-4 border-dotted border-slate-200 rounded-full flex items-center justify-center relative opacity-20 print:opacity-40">
                        <Image src="/HRAT%20Logo.jpeg" alt="seal" width={60} height={60} className="object-contain grayscale" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 print:text-black">Authorized Audit Document</p>
                  </div>
               </CardContent>
            </Card>

            <div className="mt-16 flex flex-col items-center gap-6 print:hidden">
               <Button onClick={handlePrint} size="lg" className="h-16 px-12 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                 <Printer className="w-5 h-5 mr-2" /> Download & Print Checklist
               </Button>
               <Link href="/trust-responsibilities" className="text-slate-400 hover:text-primary transition-colors font-bold text-sm flex items-center gap-2">
                 <ArrowLeft className="w-4 h-4" /> Return to Guidelines
               </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
