"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ShieldCheck, 
  Printer, 
  Calendar, 
  BadgeCheck,
  CheckCircle2,
  Clock,
  Building2,
  Building,
  ArrowRight,
  Calculator,
  Globe,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'

export default function IncomeTaxCompliancesPage2() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = () => {
    window.print()
  }

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
                <Calendar className="w-8 h-8 text-accent" />
              </div>
              <Badge className="bg-accent text-primary font-bold px-3 py-1 uppercase text-[10px] tracking-widest border-none">Compliance Page 2</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Compliance <span className="text-accent italic">Calendar</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl font-medium leading-relaxed">
              Charitable Trust Yearly Compliance Roadmap. (Part 2: Practical Calendar).
            </p>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex justify-between items-center max-w-5xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Monthly Workflow Guide</span>
          </div>
          <Button onClick={handlePrint} className="bg-primary text-white font-bold rounded-xl gap-2 shadow-lg hover:bg-secondary transition-all">
            <Printer className="w-4 h-4" /> Print Calendar
          </Button>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl space-y-12">
             <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
                <Badge variant="outline" className="text-accent border-accent/30 font-black px-6 py-1 tracking-widest text-[10px]">PRACTICAL WORKFLOW</Badge>
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary dark:text-white">Yearly <span className="text-accent italic">Compliance Calendar</span></h2>
                <p className="text-slate-500 text-sm md:text-lg italic">"A month-by-month roadmap for maintaining the 12AB and 80G status."</p>
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

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <Card className="rounded-[2.5rem] p-8 bg-slate-900 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12"></div>
                   <h4 className="text-xl font-bold mb-4">April–May: Accounts Close</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">
                     31 March-এ Financial Year শেষ হওয়ার পর Books, Ledger, এবং Bank reconciliation সম্পন্ন করে accounts finalise শুরু করতে হবে।
                   </p>
                </Card>
                <Card className="rounded-[2.5rem] p-8 bg-emerald-900 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
                   <h4 className="text-xl font-bold mb-4">31 May: Donation Deadline</h4>
                   <p className="text-sm text-emerald-100/70 leading-relaxed">
                     80G-approved Trust-এর জন্য Form 10BD এবং 10BE-এর annual compliance 31 May-এর মধ্যে করতে হয়।
                   </p>
                </Card>
             </div>

             {/* Pagination Navigation */}
             <div className="grid grid-cols-2 gap-4 pt-12 border-t border-slate-100 dark:border-slate-800 print:hidden">
                <Link href="/legal/income-tax-compliances/page-1">
                   <Button variant="outline" className="w-full h-20 rounded-2xl flex flex-col items-start gap-1 p-6 hover:border-accent group transition-all text-left">
                     <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                       <ChevronLeft className="w-3 h-3" /> Previous Section
                     </span>
                     <span className="text-sm font-bold text-primary dark:text-white truncate">General Rules & Basics</span>
                   </Button>
                </Link>
                <Link href="/legal/income-tax-compliances/page-3">
                   <Button variant="outline" className="w-full h-20 rounded-2xl flex flex-col items-end gap-1 p-6 hover:border-accent group transition-all text-right">
                     <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                       Next Section <ChevronRight className="w-3 h-3" />
                     </span>
                     <span className="text-sm font-bold text-primary dark:text-white truncate">Master Audit Checklist</span>
                   </Button>
                </Link>
             </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
