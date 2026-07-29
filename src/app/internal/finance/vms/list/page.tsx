
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, where } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Footer } from '@/components/footer'
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  IndianRupee, 
  ArrowLeft, 
  Loader2, 
  ChevronRight, 
  ShieldCheck,
  Plus,
  ArrowDown,
  ArrowUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

/**
 * VoucherRegistry: Master list of all generated institutional financial instruments.
 * Updated: Included flow-based arrows (↓ for inflow, ↑ for outflow) for registry items.
 */
export default function VoucherRegistry() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const vQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    let q = query(collection(db, 'finance_vms_vouchers'), orderBy('createdAt', 'desc'));
    if (statusFilter !== 'All') {
      q = query(collection(db, 'finance_vms_vouchers'), where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
    }
    return q;
  }, [db, user, statusFilter]);

  const { data: vouchers, loading: vLoading } = useCollection(vQuery);

  const filtered = (vouchers || []).filter((v: any) => 
    v.voucherNo?.toLowerCase().includes(search.toLowerCase()) ||
    v.person?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-emerald-500" /></div>

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-emerald-500/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/internal/finance/vms')} className="text-white"><ArrowLeft className="w-6 h-6" /></Button>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-headline font-bold">Voucher <span className="text-emerald-400 italic">Registry</span></h1>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> High-Fidelity Instrument Ledger</p>
              </div>
           </div>
           <Link href="/internal/finance/vms/new">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-8 rounded-xl shadow-xl"><Plus className="w-5 h-5 mr-2" /> Generate Instrument</Button>
           </Link>
        </div>
      </header>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-[64px] z-30 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {['All', 'Draft', 'Pending Verification', 'Approved'].map(st => (
                <button key={st} onClick={() => setStatusFilter(st)} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", statusFilter === st ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-200")}>{st}</button>
              ))}
           </div>
           <div className="relative w-full max-w-lg">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <Input placeholder="Filter by voucher ID or recipient name..." className="pl-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none" value={search} onChange={e => setSearch(e.target.value)} />
           </div>
        </div>
      </section>

      <section className="py-12 container mx-auto px-4">
         {vLoading ? (
           <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto" /></div>
         ) : (
           <div className="grid gap-4">
              {filtered.map((v: any) => {
                const type = (v.type || '').toLowerCase();
                const isIncome = type.includes('income') || type.includes('receipt') || type.includes('donation') || type.includes('membership');
                const isExpense = type.includes('payment') || type.includes('expense') || type.includes('refund') || type.includes('advance');

                return (
                  <Card key={v.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl group transition-all hover:shadow-lg">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                         <div className="p-6 md:w-56 text-center border-r bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center shrink-0">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "font-mono text-[10px] uppercase flex items-center gap-1.5",
                                isIncome ? "border-emerald-100 text-emerald-600 dark:border-emerald-900/30 dark:text-emerald-400" :
                                isExpense ? "border-red-100 text-red-600 dark:border-red-900/30 dark:text-red-400" :
                                "border-slate-200 text-slate-500"
                              )}
                            >
                               {isIncome && <ArrowDown className="w-3 h-3" />}
                               {isExpense && <ArrowUp className="w-3 h-3" />}
                               {v.voucherNo}
                            </Badge>
                            <p className="text-xl font-headline font-bold text-primary dark:text-white">₹{v.amount.toLocaleString()}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{v.date}</p>
                         </div>
                         <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-1.5 flex-1 text-center md:text-left">
                               <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{v.person?.name}</h3>
                               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                  <span>{v.type}</span>
                                  <span>{v.paymentMethod}</span>
                                  <Badge className={cn("text-[8px] h-5", v.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500')}>{v.status}</Badge>
                               </div>
                            </div>
                            <Link href={`/internal/finance/vms/${v.id}`}>
                               <Button variant="outline" className="h-10 px-8 rounded-xl font-bold border-2 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-all">Examine</Button>
                            </Link>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
           </div>
         )}
      </section>

      <Footer />
    </main>
  )
}
