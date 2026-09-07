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
  AlertTriangle,
  Scale, 
  Calendar, 
  Calculator, 
  FileSearch,
  Building,
  ArrowRight,
  Info,
  ChevronRight,
  ClipboardCheck,
  FileDigit,
  FileSpreadsheet,
  Layers,
  FolderOpen,
  Clock,
  Zap,
  TrendingUp,
  BookOpen,
  CheckSquare,
  ListChecks,
  Receipt,
  UserCheck,
  Building2,
  Table as TableIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'

export default function IncomeTaxCompliancesPage1() {
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

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link href="/legal/income-tax-compliances" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Hub
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <ShieldCheck className="w-8 h-8 text-accent" />
              </div>
              <Badge className="bg-accent text-primary font-bold px-3 py-1 uppercase text-[10px] tracking-widest border-none">Compliance Page 1</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              General Rules <span className="text-accent italic">& Basics</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl font-medium leading-relaxed">
              ভারতে একটি Charitable Trust-এর প্রতি বছর Income Tax-এর বেশ কিছু compliance থাকে। (General Rules).
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
            <Printer className="w-4 h-4" /> Print Guide
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl space-y-16">
          
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-6">
               <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary dark:text-white flex items-center gap-3">
                 <FileText className="w-6 h-6 text-accent" /> বার্ষিক কর বিধিমালা
               </h2>
               <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed text-justify">
                 Charitable/religious trust-এর জন্য সাধারণত <strong>ITR-7</strong> প্রযোজ্য। 12AB registration এবং/অথবা 80G approval থাকলে নিচের কাজগুলো বাধ্যতামূলক।
               </p>
            </CardContent>
          </Card>

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

          <div className="grid md:grid-cols-2 gap-8">
             <Card className="rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-slate-900 p-8 space-y-6 border-t-8 border-t-indigo-500">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl w-fit text-indigo-600">
                   <Calculator className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-headline font-bold">৮৫% নিয়ম (The 85% Rule)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  12AB-এর অধীনে exemption নিতে চাইলে Trust-এর income-এর সাধারণভাবে <strong>৮৫%</strong> charitable/religious purpose-এ apply করতে হয়। ৮৫% পুরোপুরি apply না হলে পরিস্থিতি অনুযায়ী <strong>Form 9A</strong> বা <strong>Form 10</strong> লাগতে পারে।
                </p>
             </Card>

             <Card className="rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-slate-900 p-8 space-y-6 border-t-8 border-t-emerald-500">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl w-fit text-emerald-600">
                   <FileSearch className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-headline font-bold">Form 10B না Form 10BB?</h4>
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                   <p className="font-bold text-primary dark:text-slate-200">Form 10B প্রযোজ্য হয় যদি:</p>
                   <ul className="list-disc pl-5 space-y-1">
                      <li>Income ₹৫ কোটির বেশি হয়।</li>
                      <li>Foreign contribution পাওয়া যায়।</li>
                   </ul>
                   <p className="pt-2 italic">অন্যথায় <strong>Form 10BB</strong> প্রযোজ্য হতে পারে।</p>
                </div>
             </Card>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-amber-50 dark:bg-amber-950/20 border-2 border-dashed border-amber-200 dark:border-amber-900/50 flex flex-col md:flex-row items-center gap-8 shadow-sm print:hidden">
             <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-amber-600 shadow-lg shrink-0 border border-amber-100">
                <AlertCircle className="w-8 h-8" />
             </div>
             <div className="space-y-1">
                <h4 className="text-lg font-bold text-amber-900 dark:text-amber-400">গুরুত্বপূর্ণ সতর্কতা</h4>
                <p className="text-sm text-amber-800 dark:text-amber-500/80 leading-relaxed italic font-medium">
                  "Trust-এর Income Tax return file করলেই annual compliance শেষ নয়। Form 10B/10BB এবং ITR-7-এর তথ্যের মধ্যে পূর্ণ সামঞ্জস্য থাকা অত্যন্ত জরুরি।"
                </p>
             </div>
          </div>

          {/* Pagination Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-12 border-t border-slate-100 dark:border-slate-800 print:hidden">
             <div></div>
             <Link href="/legal/income-tax-compliances/page-2">
                <Button variant="outline" className="w-full h-20 rounded-2xl flex flex-col items-end gap-1 p-6 hover:border-accent group transition-all">
                  <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Next Section <ChevronRight className="w-3 h-3" />
                  </span>
                  <span className="text-sm font-bold text-primary dark:text-white truncate">Yearly Compliance Calendar</span>
                </Button>
             </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
