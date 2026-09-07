
"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Calendar, 
  Calculator, 
  FileSearch,
  Building,
  ArrowRight,
  Info,
  ClipboardCheck,
  FileDigit,
  FileSpreadsheet,
  Layers,
  FolderOpen,
  Clock,
  Zap,
  TrendingUp,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'

export default function IncomeTaxCompliancesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = () => {
    window.print()
  }

  const complianceSchedule = [
    { task: "হিসাবপত্র তৈরি (Accounts Preparation)", doc: "I&E, Balance Sheet, R&P", deadline: "Financial Year শেষের পর" },
    { task: "Tax Audit (প্রযোজ্য হলে)", doc: "Form 10B / 10BB", deadline: "ITR due date-এর অন্তত ১ মাস আগে" },
    { task: "Donation Reporting (80G থাকলে)", doc: "Form 10BD", deadline: "পরের FY-এর 31 May" },
    { task: "Donation Certificate", doc: "Form 10BE", deadline: "Form 10BD-এর পরে" },
    { task: "85% Income Application হিসাব", doc: "Schedule A / ITR-7", deadline: "ITR-এর সঙ্গে" },
    { task: "Deemed Application (প্রয়োজন হলে)", doc: "Form 9A", deadline: "ITR due date-এর মধ্যে" },
    { task: "Income Accumulate করলে", doc: "Form 10", deadline: "ITR due date-এর মধ্যে" },
    { task: "Income Tax Return", doc: "ITR-7", deadline: "প্রযোজ্য due date-এর মধ্যে" },
    { task: "TDS Compliance", doc: "TDS Return", deadline: "Quarterly" }
  ];

  const yearlyCalendar = [
    { period: "April–May", task: "আগের FY-এর accounts finalise শুরু", form: "Books, Ledger, Bank reconciliation" },
    { period: "31 May", task: "80G-এর donation details জমা", form: "Form 10BD" },
    { period: "31 May", task: "Donor-দের donation certificate", form: "Form 10BE" },
    { period: "June–July", task: "Accounts finalise", form: "Income & Expenditure, Balance Sheet" },
    { period: "July–August", task: "12AB compliance ও application of income হিসাব", form: "85% application calculation" },
    { period: "August–September", task: "Tax audit, যদি applicable", form: "Form 10B / 10BB" },
    { period: "Before ITR due date", task: "85% না হলে প্রয়োজনীয় ব্যবস্থা", form: "Form 9A / Form 10" },
    { period: "ITR due date", task: "Income Tax Return", form: "ITR-7" },
    { period: "Throughout year", task: "TDS compliance, যদি applicable", form: "TDS payment + quarterly returns" },
    { period: "Throughout year", task: "Donation records maintain", form: "Donor PAN, address, amount, mode" },
    { period: "Throughout year", task: "Trust expenditure/application records", form: "Bills, vouchers, payment proofs" }
  ];

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <ShieldCheck className="w-8 h-8 text-accent" />
              </div>
              <Badge className="bg-accent text-primary font-bold px-3 py-1 uppercase text-[10px] tracking-widest border-none">Statutory Audit Node</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Income Tax <span className="text-accent italic">Compliances</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl font-medium leading-relaxed">
              ভারতে একটি Charitable Trust-এর জন্য প্রযোজ্য আয়কর নির্দেশিকা এবং বিধিবদ্ধ ফাইলিং প্রোটোকল। (BNSS & 12AB/80G Standards).
            </p>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex justify-between items-center max-w-5xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Compliance Tool</span>
          </div>
          <Button onClick={handlePrint} className="bg-primary text-white font-bold rounded-xl gap-2 shadow-lg hover:bg-secondary transition-all">
            <Printer className="w-4 h-4" /> Print Compliance Guide
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl space-y-24">
          
          {/* Introduction Card */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-6">
               <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary dark:text-white flex items-center gap-3">
                 <FileText className="w-6 h-6 text-accent" /> বার্ষিক কর বিধিমালা
               </h2>
               <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed text-justify">
                 ভারতে একটি Charitable Trust-এর প্রতি বছর Income Tax-এর বেশ কিছু compliance থাকে। বিশেষ করে যদি Trust-এর <strong>12AB registration</strong> এবং/অথবা <strong>80G approval</strong> থাকে, তাহলে এগুলো ঠিকভাবে করা গুরুত্বপূর্ণ। Income Tax Department অনুযায়ী, আমাদের মতো সংস্থার জন্য সাধারণত <strong>ITR-7</strong> প্রযোজ্য।
               </p>
            </CardContent>
          </Card>

          {/* Compliance Schedule Table */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
               <Calendar className="w-6 h-6 text-accent" />
               <h3 className="text-xl font-bold text-primary dark:text-white uppercase tracking-widest">বার্ষিক কার্যক্রমের সময়সীমা</h3>
            </div>
            <div className="overflow-x-auto rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <tr>
                        <th className="px-8 py-5">কাজ (Task)</th>
                        <th className="px-8 py-5">নথি / ফর্ম (Form)</th>
                        <th className="px-8 py-5 text-right">সময়সীমা (Deadline)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                     {complianceSchedule.map((row, i) => (
                       <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-8 py-5 font-bold text-primary dark:text-slate-200">{row.task}</td>
                          <td className="px-8 py-5"><Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-500 font-mono text-[10px]">{row.doc}</Badge></td>
                          <td className="px-8 py-5 text-right font-medium text-emerald-600 dark:text-emerald-400">{row.deadline}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>

          {/* Deep Dive Grid */}
          <div className="grid md:grid-cols-2 gap-8">
             {/* 85% Rule */}
             <Card className="rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-slate-900 p-8 space-y-6 border-t-8 border-t-indigo-500">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl w-fit text-indigo-600">
                   <Calculator className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-headline font-bold">বিশেষভাবে ৮৫% নিয়ম (The 85% Rule)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  12AB-এর অধীনে exemption নিতে চাইলে Trust-এর income-এর সাধারণভাবে <strong>৮৫%</strong> charitable/religious purpose-এ apply করার বিষয়টি প্রতি বছর হিসাব করতে হয়। ৮৫% পুরোপুরি apply না হলে পরিস্থিতি অনুযায়ী <strong>Form 9A</strong> বা <strong>Form 10</strong> লাগতে পারে।
                </p>
             </Card>

             {/* 10B vs 10BB */}
             <Card className="rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-slate-900 p-8 space-y-6 border-t-8 border-t-emerald-500">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl w-fit text-emerald-600">
                   <FileSearch className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-headline font-bold">Form 10B না Form 10BB?</h4>
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                   <p className="font-bold text-primary dark:text-slate-200">Form 10B প্রযোজ্য হয় যদি:</p>
                   <ul className="list-disc pl-5 space-y-1">
                      <li>Income ₹৫ কোটির বেশি হয়।</li>
                      <li>Foreign contribution পাওয়া যায়।</li>
                      <li>ভারতের বাইরে অর্থ ব্যয় করা হয়।</li>
                   </ul>
                   <p className="pt-2 italic">অন্যথায়, নির্দিষ্ট শর্তে ₹২.৫ লাখ থেকে ₹৫ কোটি পর্যন্ত আয়ের ক্ষেত্রে <strong>Form 10BB</strong> প্রযোজ্য হয়।</p>
                </div>
             </Card>
          </div>

          {/* 80G Requirement Section */}
          <Card className="rounded-[3rem] bg-slate-900 text-white p-10 md:p-16 relative overflow-hidden shadow-2xl border-none">
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
             <div className="relative z-10 grid lg:grid-cols-3 gap-12 items-center">
                <div className="lg:col-span-1 space-y-4">
                   <Badge className="bg-accent text-primary font-black px-4 py-1">80G PROTOCOL</Badge>
                   <h2 className="text-3xl font-headline font-bold leading-tight">Donation <span className="text-accent italic">Reporting</span></h2>
                   <p className="text-slate-400 text-sm leading-relaxed">
                     ডোনরদের জন্য গুরুত্বপূর্ণ ফাইলিং প্রোটোকল যা সংস্থার স্বচ্ছতা নিশ্চিত করে।
                   </p>
                </div>
                <div className="lg:col-span-2 space-y-6">
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors flex gap-6 items-start">
                      <div className="p-3 bg-accent/20 rounded-xl text-accent shrink-0"><CheckCircle2 className="w-6 h-6" /></div>
                      <div>
                         <h5 className="font-bold text-lg mb-1">Form 10BD Filing</h5>
                         <p className="text-sm text-slate-300 leading-relaxed">ডেশনের বিশদ বিবরণ সহ Form 10BD ফাইল করতে হয়। এর বিধিবদ্ধ সময়সীমা পরের আর্থিক বছরের ৩১শে মে।</p>
                      </div>
                   </div>
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors flex gap-6 items-start">
                      <div className="p-3 bg-accent/20 rounded-xl text-accent shrink-0"><CheckCircle2 className="w-6 h-6" /></div>
                      <div>
                         <h5 className="font-bold text-lg mb-1">Form 10BE Certificate</h5>
                         <p className="text-sm text-slate-300 leading-relaxed">Form 10BD ফাইলিংয়ের পর ডোনারদের জন্য এই সার্টিফিকেট ইস্যু করা বাধ্যতামূলক।</p>
                      </div>
                   </div>
                </div>
             </div>
          </Card>

          {/* SECONDARY COMPREHENSIVE SECTION: YEARLY CALENDAR */}
          <div className="space-y-12 pt-12 border-t-2 border-slate-100 dark:border-slate-800">
             <div className="text-center space-y-4 max-w-3xl mx-auto">
                <Badge variant="outline" className="text-accent border-accent/30 font-black px-6 py-1 tracking-widest text-[10px]">PRACTICAL WORKFLOW</Badge>
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary dark:text-white">Charitable Trust <br/> <span className="text-accent italic">Yearly Compliance Calendar</span></h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg italic">"A month-by-month roadmap for maintaining the 12AB and 80G status of your Trust."</p>
             </div>

             <div className="overflow-x-auto rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                <table className="w-full text-left min-w-[600px]">
                   <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                      <tr>
                         <th className="px-8 py-6">সময়কাল (Period)</th>
                         <th className="px-8 py-6">করনীয় (Action)</th>
                         <th className="px-8 py-6">ফর্ম / বিবরণ (Form / Details)</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {yearlyCalendar.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                           <td className="px-8 py-6 font-black text-xs text-accent uppercase tracking-tighter">{row.period}</td>
                           <td className="px-8 py-6 font-bold text-primary dark:text-slate-200 text-sm">{row.task}</td>
                           <td className="px-8 py-6 text-sm text-slate-500 dark:text-slate-400">{row.form}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* Detailed Practical Guide (8 Sections) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. April-May */}
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-xl transition-all">
                   <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-indigo-600"><ClipboardCheck className="w-6 h-6" /></div>
                         <CardTitle className="text-lg font-headline font-bold">এপ্রিল–মে: হিসাব বন্ধ করা</CardTitle>
                      </div>
                   </CardHeader>
                   <CardContent className="p-8">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Mandatory Records:</p>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                         {["Cash Book", "Bank Book", "General Ledger", "Donation Register", "Expense Register", "Balance Sheet"].map((item, idx) => (
                           <div key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {item}
                           </div>
                         ))}
                      </div>
                   </CardContent>
                </Card>

                {/* 2. 80G 10BD/10BE */}
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-xl transition-all">
                   <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-pink-600"><FileDigit className="w-6 h-6" /></div>
                         <CardTitle className="text-lg font-headline font-bold">80G — Form 10BD ও 10BE</CardTitle>
                      </div>
                   </CardHeader>
                   <CardContent className="p-8 space-y-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        "FY 2025-26-এর ডোনর তথ্য অবশ্যই ৩১শে মে ২০২৬-এর মধ্যে Form 10BD-তে জমা দিয়ে 10BE সার্টিফিকেট ইস্যু করতে হবে।"
                      </p>
                      <div className="flex gap-2">
                         <Badge className="bg-primary">Due: 31 May</Badge>
                         <Badge className="bg-emerald-600">Critical</Badge>
                      </div>
                   </CardContent>
                </Card>

                {/* 3. 85% Application */}
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-xl transition-all">
                   <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-amber-600"><TrendingUp className="w-6 h-6" /></div>
                         <CardTitle className="text-lg font-headline font-bold">৮৫% আয়ের প্রয়োগ (85% Rule)</CardTitle>
                      </div>
                   </CardHeader>
                   <CardContent className="p-8">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">আয়ের কমপক্ষে ৮৫% অনুমোদনযোগ্য দাতব্য কাজে ব্যয় হতে হবে। যেমন:</p>
                      <div className="flex flex-wrap gap-2">
                         {["শিক্ষা", "চিকিৎসা সহায়তা", "খাদ্য বিতরণ", "দরিদ্র কল্যাণ"].map((tag, i) => (
                           <Badge key={i} variant="outline" className="bg-slate-50 dark:bg-slate-800 border-slate-100">{tag}</Badge>
                         ))}
                      </div>
                   </CardContent>
                </Card>

                {/* 4. Form 9A / 10 */}
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-xl transition-all">
                   <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-red-600"><AlertTriangle className="w-6 h-6" /></div>
                         <CardTitle className="text-lg font-headline font-bold">৮৫% প্রয়োগ না হলে করনীয়</CardTitle>
                      </div>
                   </CardHeader>
                   <CardContent className="p-8 space-y-4">
                      <div className="flex gap-4 items-start">
                         <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">9A</div>
                         <p className="text-xs text-slate-500">Deemed Application অপশন নিতে Form 9A।</p>
                      </div>
                      <div className="flex gap-4 items-start">
                         <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">10</div>
                         <p className="text-xs text-slate-500">আয় সঞ্চিত রাখতে ITR-এর ২ মাস আগে Form 10।</p>
                      </div>
                   </CardContent>
                </Card>

                {/* 7. TDS */}
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-xl transition-all">
                   <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-sky-600"><Zap className="w-6 h-6" /></div>
                         <CardTitle className="text-lg font-headline font-bold">TDS — সারা বছর</CardTitle>
                      </div>
                   </CardHeader>
                   <CardContent className="p-8">
                      <p className="text-xs text-slate-400 uppercase font-black mb-4">Applicable Payments:</p>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                        বেতন (Salary), প্রফেশনাল ফি, কন্টাক্টর পেমেন্ট এবং ভাড়ার ক্ষেত্রে TDS বিধিমালা মেনে চলতে হবে এবং ত্রৈমাসিক রিটার্ন জমা দিতে হবে।
                      </p>
                   </CardContent>
                </Card>

                {/* 8. Investment Records */}
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-xl transition-all">
                   <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-indigo-500"><Building className="w-6 h-6" /></div>
                         <CardTitle className="text-lg font-headline font-bold">বিনিয়োগের রেকর্ড (Investments)</CardTitle>
                      </div>
                   </CardHeader>
                   <CardContent className="p-8">
                      <p className="text-sm text-slate-500 italic">"Trust-এর টাকা কোথায় রাখা হয়েছে (FD, Savings, Permitted Assets) তার সঠিক রেকর্ড ITR-7-এ প্রদর্শন করতে হবে।"</p>
                   </CardContent>
                </Card>
             </div>

             {/* Annual Tax File Checklist */}
             <Card className="rounded-[3rem] bg-indigo-900 text-white p-10 md:p-16 relative overflow-hidden shadow-2xl border-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="relative z-10 space-y-10">
                   <div className="flex items-center gap-6 border-b border-white/10 pb-8">
                      <div className="p-4 bg-white/10 rounded-[2rem] border border-white/20"><FolderOpen className="w-10 h-10 text-accent" /></div>
                      <div>
                         <h3 className="text-2xl md:text-4xl font-headline font-bold">Annual Tax File <span className="text-accent italic">Structure</span></h3>
                         <p className="text-indigo-200 text-sm md:text-base mt-1">প্রতি বছরের জন্য আলাদা ফোল্ডার তৈরি করুন (Audit-Ready Checklist)</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                      {[
                        "Trust Reg/12AB/80G Copy", "PAN Card", "Bank Statements", "Donation Register", "Form 10BD & 10BE",
                        "Bills & Vouchers", "Income & Expenditure", "Balance Sheet", "Form 10B/10BB", "Form 9A / Form 10",
                        "ITR-7 & Ack", "TDS Returns", "TDS Certificates", "CA Audit Report"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs md:text-sm font-bold text-indigo-50">
                           <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0"><span className="text-[10px] text-accent">{i+1}</span></div>
                           {item}
                        </div>
                      ))}
                   </div>

                   <div className="pt-8 flex justify-center">
                      <Badge className="bg-accent text-primary px-8 py-2 text-xs font-black uppercase tracking-widest shadow-xl">Audit Readiness Guaranteed</Badge>
                   </div>
                </div>
             </Card>
          </div>

          {/* Crucial Note */}
          <div className="p-8 rounded-[2.5rem] bg-amber-50 dark:bg-amber-950/20 border-2 border-dashed border-amber-200 dark:border-amber-900/50 flex flex-col md:flex-row items-center gap-8 shadow-sm">
             <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-amber-600 shadow-lg shrink-0 border border-amber-100">
                <AlertCircle className="w-10 h-10" />
             </div>
             <div className="space-y-2">
                <h4 className="text-lg font-bold text-amber-900 dark:text-amber-400">গুরুত্বপূর্ণ তথ্য (Critical Consistency)</h4>
                <p className="text-sm md:text-base text-amber-800 dark:text-amber-500/80 leading-relaxed italic font-medium">
                  "Trust-এর Income Tax return file করলেই annual compliance শেষ নয়। Form 10B/10BB এবং ITR-7-এর তথ্যের মধ্যে পূর্ণ সামঞ্জস্য থাকা অত্যন্ত জরুরি। ইনকাম ট্যাক্স ডিপার্টমেন্ট এই তথ্যগুলো নিবিড়ভাবে পর্যবেক্ষণ করে থাকে।"
                </p>
             </div>
          </div>

          {/* Footer Navigation */}
          <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
             <h3 className="text-xl font-headline font-bold text-primary dark:text-white mb-8">Official Governance Node</h3>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Link href="/legal/required-documents">
                  <Button variant="outline" className="rounded-xl px-10 h-14 font-bold border-primary text-primary hover:bg-secondary hover:text-white transition-all">
                    View Master Document List
                  </Button>
               </Link>
               <Link href="/">
                  <Button variant="ghost" className="gap-2 font-bold text-slate-400 hover:text-primary transition-all">
                    <ArrowLeft className="w-4 h-4" /> Return to Homepage
                  </Button>
               </Link>
             </div>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mt-16">
               National Audit Registry • Human Rights Affairs Trust
             </p>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  )
}
