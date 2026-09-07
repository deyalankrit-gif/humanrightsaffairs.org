"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileSpreadsheet, 
  Printer, 
  CheckSquare, 
  FolderOpen,
  CheckCircle2,
  Table as TableIcon,
  Calculator,
  Receipt,
  BookOpen,
  ListChecks,
  ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'

export default function IncomeTaxCompliancesPage3() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = () => {
    window.print()
  }

  const permanentDocuments = [
    "Trust Deed", "Trust PAN", "Trust Registration Certificate", "12AB Registration/Order", 
    "80G Approval/Order", "TAN (if applicable)", "Bank Account details", "Trustee details",
    "Previous year's ITR-7 Ack", "Previous year's Audit Report"
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
                <ListChecks className="w-8 h-8 text-accent" />
              </div>
              <Badge className="bg-accent text-primary font-bold px-3 py-1 uppercase text-[10px] tracking-widest border-none">Compliance Page 3</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Master <span className="text-accent italic">Checklist</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl font-medium leading-relaxed">
              Annual Accounts & Tax Compliance Audit Guide. (Part 3: Master Checklist).
            </p>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex justify-between items-center max-w-5xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Audit Readiness Protocol</span>
          </div>
          <Button onClick={handlePrint} className="bg-primary text-white font-bold rounded-xl gap-2 shadow-lg hover:bg-secondary transition-all">
            <Printer className="w-4 h-4" /> Print Checklist
          </Button>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl space-y-16">
             <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
                <div className="inline-flex p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-[2rem] text-emerald-600 mb-2">
                   <ListChecks className="w-10 h-10" />
                </div>
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary dark:text-white">Tax Compliance <span className="text-accent italic">Checklist</span></h2>
                <p className="text-slate-500 text-sm md:text-lg italic">"একটি Charitable Trust-এর সারা বছরের accounts গুছিয়ে রাখার গাইড।"</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-xl transition-all">
                   <CardHeader className="bg-slate-900 p-8">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white/10 rounded-2xl text-accent"><FolderOpen className="w-6 h-6" /></div>
                         <CardTitle className="text-lg font-headline font-bold text-white">Permanent Documents</CardTitle>
                      </div>
                   </CardHeader>
                   <CardContent className="p-8">
                      <div className="grid grid-cols-1 gap-3">
                         {permanentDocuments.map((doc, idx) => (
                           <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                              <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" /> {doc}
                           </div>
                         ))}
                      </div>
                   </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                   <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-indigo-600"><Calculator className="w-6 h-6" /></div>
                         <CardTitle className="text-lg font-headline font-bold">85% Working Sheet</CardTitle>
                      </div>
                   </CardHeader>
                   <CardContent className="p-0">
                      <table className="w-full text-left text-xs">
                         <tbody className="divide-y">
                            <tr className="bg-slate-50/50"><td className="px-8 py-4 font-bold">Total relevant income</td><td className="px-8 py-4 text-right">₹ ________</td></tr>
                            <tr className="bg-emerald-50/50"><td className="px-8 py-4 font-bold text-emerald-700">85% mandatory req.</td><td className="px-8 py-4 text-right text-emerald-700">₹ ________</td></tr>
                            <tr><td className="px-8 py-4 font-bold">Actual application</td><td className="px-8 py-4 text-right">₹ ________</td></tr>
                            <tr className="bg-red-50/50"><td className="px-8 py-4 font-bold text-red-700">Shortfall</td><td className="px-8 py-4 text-right text-red-700">₹ ________</td></tr>
                         </tbody>
                      </table>
                   </CardContent>
                </Card>
             </div>

             <Card className="rounded-[3rem] bg-slate-900 text-white p-10 md:p-16 relative overflow-hidden shadow-2xl border-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="relative z-10 space-y-10">
                   <div className="flex items-center gap-6 border-b border-white/10 pb-8">
                      <div className="p-4 bg-white/10 rounded-[2rem] border border-white/20"><FolderOpen className="w-10 h-10 text-accent" /></div>
                      <h3 className="text-2xl md:text-4xl font-headline font-bold">Year-End <span className="text-accent italic">Tax Pack</span></h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { id: "01", label: "Legal Docs" }, { id: "02", label: "Bank Vault" },
                        { id: "03", label: "Income" }, { id: "04", label: "Expenses" },
                        { id: "05", label: "TDS" }, { id: "06", label: "80G Final" },
                        { id: "07", label: "Accounts" }, { id: "08", label: "Tax Forms" }
                      ].map((folder) => (
                        <div key={folder.id} className="p-5 bg-white/5 rounded-2xl border border-white/10">
                           <span className="text-accent font-black text-lg">{folder.id}</span>
                           <h5 className="font-bold text-white uppercase text-[10px] tracking-widest">{folder.label}</h5>
                        </div>
                      ))}
                   </div>
                </div>
             </Card>

             {/* Pagination Navigation */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-12 border-t border-slate-100 dark:border-slate-800 print:hidden">
                <Link href="/legal/income-tax-compliances/page-2">
                   <Button variant="outline" className="w-full h-20 rounded-2xl flex flex-col items-start gap-1 p-6 hover:border-accent group transition-all text-left">
                     <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                       <ChevronLeft className="w-3 h-3" /> Previous Section
                     </span>
                     <span className="text-sm font-bold text-primary dark:text-white truncate">Yearly Compliance Calendar</span>
                   </Button>
                </Link>
                <div></div>
             </div>

             <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800 print:hidden">
               <Button onClick={handlePrint} className="bg-primary text-white h-14 px-10 rounded-xl font-bold">
                 <Printer className="w-4 h-4 mr-2" /> Download Full Checklist
               </Button>
             </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
