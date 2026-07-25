"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Footer } from '@/components/footer'
import { 
  FileSpreadsheet, 
  ArrowLeft, 
  Loader2, 
  Download, 
  FileText, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  PieChart, 
  Activity, 
  ClipboardList, 
  BookOpen, 
  Building,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Reports Center: High-fidelity terminal for extracting institutional data.
 * Features: Timeframe selection (MTD/QTD/YTD) and specialized audit exports.
 */
export default function ReportsCenter() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [activeTimeframe, setActiveTimeframe] = useState('YTD')

  const reportTypes = [
    { id: 'ledger', title: 'General Ledger Audit', desc: 'Consolidated transaction history with voucher mapping.', icon: ClipboardList, color: 'text-blue-500' },
    { id: 'p&l', title: 'Income & Expenditure', desc: 'Summarized fiscal performance for statutory review.', icon: PieChart, color: 'text-emerald-500' },
    { id: 'projects', title: 'Project Utilization', desc: 'Mission-based fund allocation and deployment logs.', icon: Activity, color: 'text-indigo-500' },
    { id: 'donors', title: 'Institutional Benefactors', desc: 'Detailed tracking of high-impact organizational support.', icon: BookOpen, color: 'text-amber-500' },
    { id: 'compliance', title: 'Statutory Compliance', desc: 'Legal filing records, 80G validity, and audit status.', icon: ShieldCheck, color: 'text-red-500' },
    { id: 'payroll', title: 'Personnel Disbursement', desc: 'Monthly salary and allowance reconciliation report.', icon: Building, color: 'text-sky-500' }
  ]

  const handleGenerate = (id: string) => {
    setIsGenerating(id)
    // In a production environment, this would trigger a server-side PDF generation process
    setTimeout(() => {
      setIsGenerating(null)
      alert(`Report "${id.toUpperCase()}" for period ${activeTimeframe} generated successfully. Check your secure downloads folder.`)
    }, 2000)
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-emerald-500/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/internal/finance/dashboard')} className="text-white hover:bg-white/10">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-headline font-bold">Reports <span className="text-emerald-400 italic">Center</span></h1>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <ShieldCheck className="w-3.5 h-3.5" /> High-Fidelity Data Extraction
                </p>
              </div>
           </div>
           
           <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              {['MTD', 'QTD', 'YTD'].map((tf) => (
                <Button 
                  key={tf}
                  variant="ghost" 
                  onClick={() => setActiveTimeframe(tf)}
                  className={cn(
                    "h-8 px-6 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTimeframe === tf 
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg" 
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {tf}
                </Button>
              ))}
           </div>
        </div>
      </header>

      <section className="py-12 container mx-auto px-4">
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reportTypes.map((report) => (
              <Card key={report.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden group">
                 <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                       <div className={cn("p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-emerald-50 transition-colors", report.color)}>
                          <report.icon className="w-8 h-8" />
                       </div>
                       <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-100">Enterprise</Badge>
                    </div>
                    <h3 className="text-xl font-headline font-bold text-primary dark:text-white mb-2 leading-tight">{report.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed italic">"{report.desc}"</p>
                    
                    <div className="flex gap-2">
                       <Button 
                         onClick={() => handleGenerate(report.id)}
                         disabled={!!isGenerating}
                         className="flex-1 bg-primary text-white font-bold h-12 rounded-xl text-xs uppercase tracking-widest transition-all hover:bg-secondary shadow-lg shadow-primary/20"
                       >
                          {isGenerating === report.id ? <Loader2 className="animate-spin" /> : <><FileText className="w-4 h-4 mr-2" /> Generate {activeTimeframe}</>}
                       </Button>
                       <Button variant="outline" className="w-12 h-12 rounded-xl border-slate-100 dark:border-slate-800 p-0">
                          <Download className="w-4 h-4 text-slate-400" />
                       </Button>
                    </div>
                 </CardContent>
              </Card>
            ))}
         </div>

         <div className="mt-16 p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden text-center shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
               <FileSpreadsheet className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
               <h2 className="text-3xl font-headline font-bold leading-tight">Master <span className="text-emerald-400 italic">Audit Export</span></h2>
               <p className="text-slate-400 leading-relaxed italic">
                 "Generate a comprehensive, time-stamped master audit log containing all financial movements, vouchers, and compliance records for the {activeTimeframe} cycle."
               </p>
               <Button className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-base shadow-xl shadow-emerald-900/40">
                  Execute Master {activeTimeframe} Export (XLSX)
               </Button>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  )
}
