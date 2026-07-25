
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, where } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Footer } from '@/components/footer'
import { 
  Search, 
  ClipboardList, 
  Filter, 
  Download, 
  FileText, 
  IndianRupee, 
  Calendar as CalendarIcon, 
  ArrowLeft, 
  Loader2, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Tag, 
  ShieldCheck,
  Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function FinanceLedger() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')

  const txQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    let q = query(collection(db, 'finance_transactions'), orderBy('date', 'desc'));
    if (filterType !== 'All') {
      q = query(collection(db, 'finance_transactions'), where('type', '==', filterType), orderBy('date', 'desc'));
    }
    return q;
  }, [db, user, filterType]);

  const { data: transactions, loading: txLoading } = useCollection(txQuery);

  const filtered = (transactions || []).filter((tx: any) => 
    tx.particulars?.toLowerCase().includes(search.toLowerCase()) ||
    tx.voucherNo?.toLowerCase().includes(search.toLowerCase()) ||
    tx.account?.toLowerCase().includes(search.toLowerCase())
  )

  const handleExportPDF = () => {
    if (!filtered || filtered.length === 0) {
      toast({
        variant: "destructive",
        title: "Export Denied",
        description: "No transaction records found for the current filter criteria.",
      })
      return
    }

    toast({
      title: "Generating Audit PDF",
      description: "Preparing general ledger layout. Please select 'Save as PDF' from the destination dropdown.",
    })
    
    // Slight delay to allow toast to settle before opening print dialog
    setTimeout(() => {
      window.print()
    }, 500)
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-emerald-900 text-white border-b-8 border-emerald-500/20 sticky top-0 z-40 print:relative print:bg-white print:text-black print:pt-4 print:pb-4 print:border-b-2 print:border-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/internal/finance/dashboard')} className="rounded-full text-white hover:bg-white/10 p-2 print:hidden">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-headline font-bold">General <span className="text-emerald-400 italic print:text-black">Ledger</span></h1>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 print:text-slate-500">
                   <ShieldCheck className="w-3.5 h-3.5" /> Official Transaction Registry
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 print:hidden">
               <Button 
                variant="outline" 
                onClick={handleExportPDF}
                className="bg-white/5 border-white/10 text-white rounded-xl h-10 font-bold text-xs uppercase tracking-widest px-6"
               >
                 <Download className="w-4 h-4 mr-2" /> PDF Ledger
               </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-[104px] z-30 shadow-sm transition-colors print:hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {['All', 'Income', 'Expense', 'Contra'].map(type => (
                <button 
                  key={type} 
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                    filterType === type ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {type}
                </button>
              ))}
           </div>
           <div className="relative w-full max-w-lg">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <Input 
                placeholder="Filter by voucher, particulars or account head..." 
                className="pl-9 h-11 rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-950 text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
             />
           </div>
        </div>
      </section>

      <section className="py-12 container mx-auto px-4 print:py-4">
         {txLoading ? (
           <div className="text-center py-20 print:hidden"><Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto" /></div>
         ) : (
           <div className="grid gap-4">
              {filtered.map((tx: any) => (
                <Card key={tx.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 group transition-all hover:shadow-lg print:rounded-none print:shadow-none print:border-b">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                       <div className={cn("p-6 md:w-44 text-center border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 print:w-32", tx.type === 'Income' ? 'bg-emerald-50/50' : 'bg-rose-50/50')}>
                          <Badge variant="outline" className={cn("text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border-none mb-3 print:bg-white print:text-black print:border", tx.type === 'Income' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white')}>
                            {tx.type}
                          </Badge>
                          <p className="text-xl font-headline font-bold text-primary dark:text-white leading-tight print:text-sm">₹{tx.amount.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{tx.date}</p>
                       </div>
                       <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6 print:p-4">
                          <div className="space-y-2 text-center md:text-left flex-1">
                             <div className="flex items-center justify-center md:justify-start gap-3">
                                <h3 className="text-lg font-bold text-primary dark:text-white leading-tight print:text-sm">{tx.particulars}</h3>
                                {tx.projectId && <Badge variant="outline" className="text-[8px] border-blue-200 text-blue-500 font-bold uppercase">PROJ: {tx.projectId}</Badge>}
                             </div>
                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                <span className="flex items-center gap-1.5"><Tag className="w-3 h-3 text-emerald-500" /> {tx.account}</span>
                                <span className="flex items-center gap-1.5"><Wallet className="w-3 h-3 text-emerald-500" /> {tx.paymentMethod}</span>
                                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> VOUCHER: {tx.voucherNo}</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-2 print:hidden">
                             <Button variant="outline" size="sm" className="h-9 rounded-xl text-[10px] font-bold px-5 border-slate-200 hover:bg-emerald-50">
                               <FileText className="w-3.5 h-3.5 mr-2" /> Examine
                             </Button>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 opacity-40">
                   <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                   <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Ledger registry empty for current filter</p>
                </div>
              )}
           </div>
         )}
      </section>

      <Footer />
    </main>
  )
}
