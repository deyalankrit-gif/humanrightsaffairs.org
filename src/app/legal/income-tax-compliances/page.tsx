
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

  const permanentDocuments = [
    "Trust Deed", "Trust PAN", "Trust Registration Certificate", "12AB Registration/Order", 
    "80G Approval/Order", "TAN (if applicable)", "FCRA Approval (if applicable)", 
    "Bank Account details", "Trustee/Managing Trustee details", "Previous year's ITR-7 Ack", 
    "Previous year's Audit Report", "Previous year's Balance Sheet", "Previous year's I&E Account"
  ];

  const monthlyClosingChecklist = [
    "Cash Book updated", "Bank Book updated", "Bank reconciliation", "Donation register updated", 
    "Expense register updated", "Bills/vouchers filed", "Salary recorded", "TDS checked", 
    "Bank interest checked", "Monthly income/expense summary तैयार"
  ];

  const yearEndChecklist = [
    "Cash closing balance", "All bank balances", "FD balances", "Outstanding expenses", 
    "Outstanding income", "Fixed assets", "Depreciation", "Donation total", "Expense total"
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
                 ভারতে একটি Charitable Trust-এর প্রতি বছর Income Tax-এর বেশ কিছু compliance থাকে। বিশেষ করে যদি Trust-এর 12AB registration এবং/অথবা 80G approval থাকে, তাহলে এগুলো ঠিকভাবে করা গুরুত্বপূর্ণ। Income Tax Department অনুযায়ী, আমাদের মতো সংস্থার জন্য সাধারণত <strong>ITR-7</strong> প্রযোজ্য।
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

          {/* Yearly Calendar Section */}
          <div className="space-y-12 pt-12 border-t-2 border-slate-100 dark:border-slate-800">
             <div className="text-center space-y-4 max-w-3xl mx-auto">
                <Badge variant="outline" className="text-accent border-accent/30 font-black px-6 py-1 tracking-widest text-[10px]">PRACTICAL WORKFLOW</Badge>
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary dark:text-white">Charitable Trust <br/> <span className="text-accent italic">Yearly Compliance Calendar</span></h2>
                <p className="text-slate-50 dark:text-slate-400 text-sm md:text-lg italic">"A month-by-month roadmap for maintaining the 12AB and 80G status of your Trust."</p>
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
          </div>

          {/* PAGE THREE: ANNUAL ACCOUNTS & TAX COMPLIANCE CHECKLIST */}
          <div className="space-y-16 pt-12 border-t-2 border-slate-100 dark:border-slate-800">
             <div className="text-center space-y-4 max-w-3xl mx-auto">
                <div className="inline-flex p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-[2rem] text-emerald-600 mb-2">
                   <ListChecks className="w-10 h-10" />
                </div>
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary dark:text-white">Annual Accounts & <br/> <span className="text-accent italic">Tax Compliance Checklist</span></h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg italic">"একটি Charitable Trust-এর সারা বছরের accounts + Income Tax compliance গুছিয়ে রাখার গাইড।"</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Permanent Documents */}
                <Card className="rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-xl transition-all">
                   <CardHeader className="bg-slate-900 p-8">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white/10 rounded-2xl text-accent"><FolderOpen className="w-6 h-6" /></div>
                         <CardTitle className="text-lg font-headline font-bold text-white">Permanent Documents — সবসময় সংরক্ষণ করবেন</CardTitle>
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

                {/* 2. Registers to Maintain */}
                <Card className="rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-xl transition-all">
                   <CardHeader className="bg-indigo-900 p-8">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white/10 rounded-2xl text-white"><BookOpen className="w-6 h-6" /></div>
                         <CardTitle className="text-lg font-headline font-bold text-white">সারা বছর যে Registers রাখবেন</CardTitle>
                      </div>
                   </CardHeader>
                   <CardContent className="p-8 space-y-6">
                      <div className="space-y-4">
                         <h5 className="text-xs font-black uppercase text-accent tracking-widest border-b pb-2">A. Donation Register ⭐</h5>
                         <p className="text-[10px] font-bold text-slate-400">Excel Fields: Date, Donor Name, Address, PAN, Amount, Mode, UTR/Chq, 80G Status, Receipt No.</p>
                      </div>
                      <div className="space-y-4">
                         <h5 className="text-xs font-black uppercase text-indigo-500 tracking-widest border-b pb-2">B. Expense Register</h5>
                         <div className="flex flex-wrap gap-2">
                            {["Food distribution", "Medical assistance", "Salary", "Printing", "Charity Events"].map((head, i) => (
                               <Badge key={i} variant="outline" className="text-[8px]">{head}</Badge>
                            ))}
                         </div>
                      </div>
                   </CardContent>
                </Card>

                {/* 3 & 4. Cash & Receipts */}
                <Card className="rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-slate-900 p-8 space-y-6">
                   <div className="flex items-center gap-4 border-b pb-6">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl text-emerald-600"><Receipt className="w-6 h-6" /></div>
                      <div>
                         <h4 className="font-headline font-bold text-xl">Cash & Receipt System</h4>
                         <p className="text-xs text-slate-400 uppercase font-black">Financial Protocol</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-l-4 border-emerald-500">
                         <p className="text-sm font-bold text-primary dark:text-white">Cash balance negative হওয়া যাবে না।</p>
                         <p className="text-xs text-slate-500 mt-1">Cash payment-এর ক্ষেত্রে bill/voucher অবশ্যই রাখুন।</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-l-4 border-accent">
                         <p className="text-sm font-bold text-primary dark:text-white">Sequential Receipt Numbering</p>
                         <p className="text-[10px] font-mono mt-1 text-accent">Example: DON-2026-0001</p>
                      </div>
                   </div>
                </Card>

                {/* 9. 85% Application Calculator */}
                <Card className="rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                   <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-indigo-600"><Calculator className="w-6 h-6" /></div>
                         <CardTitle className="text-lg font-headline font-bold">85% Application Working Sheet ⭐⭐⭐</CardTitle>
                      </div>
                   </CardHeader>
                   <CardContent className="p-0">
                      <table className="w-full text-left text-xs">
                         <tbody className="divide-y">
                            <tr className="bg-slate-50/50"><td className="px-8 py-3 font-bold">Total relevant income</td><td className="px-8 py-3 text-right">₹ ________</td></tr>
                            <tr><td className="px-8 py-3 font-bold">Income considered (A)</td><td className="px-8 py-3 text-right">₹ ________</td></tr>
                            <tr className="bg-emerald-50/50"><td className="px-8 py-3 font-bold text-emerald-700">85% mandatory requirement</td><td className="px-8 py-3 text-right text-emerald-700">₹ ________</td></tr>
                            <tr><td className="px-8 py-3 font-bold">Actual application</td><td className="px-8 py-3 text-right">₹ ________</td></tr>
                            <tr className="bg-red-50/50"><td className="px-8 py-3 font-bold text-red-700">Shortfall / Deficit</td><td className="px-8 py-3 text-right text-red-700">₹ ________</td></tr>
                         </tbody>
                      </table>
                   </CardContent>
                </Card>
             </div>

             {/* Closing Cycles Section */}
             <div className="grid md:grid-cols-2 gap-8">
                {/* Monthly Closing */}
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8 border-t-8 border-t-emerald-400">
                   <h4 className="text-xl font-headline font-bold mb-6 flex items-center gap-2"><Clock className="w-6 h-6 text-emerald-500" /> Monthly Closing — প্রতি মাসে</h4>
                   <div className="space-y-3">
                      {monthlyClosingChecklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-medium">
                           <div className="w-2 h-2 rounded-full bg-emerald-500"></div> {item}
                        </div>
                      ))}
                   </div>
                </Card>

                {/* Year-End Closing */}
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8 border-t-8 border-t-red-400">
                   <h4 className="text-xl font-headline font-bold mb-6 flex items-center gap-2"><AlertCircle className="w-6 h-6 text-red-500" /> Year-End Closing — 31 March</h4>
                   <div className="space-y-3">
                      {yearEndChecklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-medium">
                           <div className="w-2 h-2 rounded-full bg-red-500"></div> {item}
                        </div>
                      ))}
                   </div>
                </Card>
             </div>

             {/* Final Tax Pack Section */}
             <Card className="rounded-[3rem] bg-slate-900 text-white p-10 md:p-16 relative overflow-hidden shadow-2xl border-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="relative z-10 space-y-10">
                   <div className="flex items-center gap-6 border-b border-white/10 pb-8">
                      <div className="p-4 bg-white/10 rounded-[2rem] border border-white/20"><FolderOpen className="w-10 h-10 text-accent" /></div>
                      <div>
                         <h3 className="text-2xl md:text-4xl font-headline font-bold">CA-কে দেওয়ার <span className="text-accent italic">Final File</span></h3>
                         <p className="text-indigo-200 text-sm md:text-base mt-1">Year-End Tax Pack (Folder Structure Guide)</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { id: "01", label: "Legal Docs", items: ["Trust Deed", "12AB/80G", "PAN"] },
                        { id: "02", label: "Bank Vault", items: ["All Statements", "FD Certificates"] },
                        { id: "03", label: "Income", items: ["Donation Reg", "Other Income"] },
                        { id: "04", label: "Expenses", items: ["Bills", "Vouchers", "Salary"] },
                        { id: "05", label: "TDS", items: ["Challans", "Returns", "Form 16/16A"] },
                        { id: "06", label: "80G Final", items: ["10BD Working", "10BE Proof"] },
                        { id: "07", label: "Accounts", items: ["TB", "Ledgers", "Cash Book"] },
                        { id: "08", label: "Tax Forms", items: ["10B/10BB", "9A/10", "ITR-7"] }
                      ].map((folder) => (
                        <div key={folder.id} className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                           <span className="text-accent font-black text-lg">{folder.id}</span>
                           <h5 className="font-bold text-white mb-2 uppercase text-xs tracking-widest">{folder.label}</h5>
                           <ul className="text-[10px] text-slate-400 space-y-1">
                              {folder.items.map((it, idx) => <li key={idx}>• {it}</li>)}
                           </ul>
                        </div>
                      ))}
                   </div>
                </div>
             </Card>

             {/* Master Workbook Recommendation */}
             <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8 md:p-12 text-center space-y-8">
                <div className="max-w-2xl mx-auto space-y-4">
                   <h3 className="text-2xl font-headline font-bold text-primary dark:text-white flex items-center justify-center gap-3">
                      <FileSpreadsheet className="w-8 h-8 text-emerald-600" /> Master Workbook Recommendation
                   </h3>
                   <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
                      "সংগঠনের স্বচ্ছতার জন্য একটি একক Excel Workbook (FY 2025-26) মেইনটেইন করার পরামর্শ দেওয়া হচ্ছে। এটি বছর শেষে এক নজরে কমপ্লায়েন্স রিপোর্ট পেতে সাহায্য করবে।"
                   </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                   {["Donation", "Expense", "Bank & Cash", "TDS Tracker", "85% Calc", "Compliance"].map((sheet, i) => (
                      <div key={i} className="py-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 flex flex-col items-center gap-2 group hover:border-emerald-500 transition-all">
                         <TableIcon className="w-5 h-5 text-slate-300 group-hover:text-emerald-500" />
                         <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500 group-hover:text-emerald-600">Sheet {i+1}</span>
                         <span className="text-[10px] font-bold text-primary dark:text-slate-300">{sheet}</span>
                      </div>
                   ))}
                </div>
             </Card>
          </div>

          {/* Crucial Note */}
          <div className="p-8 rounded-[2.5rem] bg-amber-50 dark:bg-amber-950/20 border-2 border-dashed border-amber-200 dark:border-amber-900/50 flex flex-col md:flex-row items-center gap-8 shadow-sm print:hidden">
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
          <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800 print:hidden">
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
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] text-center mt-16">
               National Audit Registry • Human Rights Affairs Trust
             </p>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  )
}
