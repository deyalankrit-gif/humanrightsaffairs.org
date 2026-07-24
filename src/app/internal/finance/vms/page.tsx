
"use client"

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, limit, doc } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Footer } from '@/components/footer'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts'
import { 
  IndianRupee, TrendingUp, TrendingDown, Wallet, Building, 
  ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, 
  Loader2, FileSpreadsheet, Download, RefreshCw, Layers, Plus, Receipt
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

/**
 * VMS Dashboard: Tactical overview of the institutional Voucher Management System.
 */
export default function VMSDashboard() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()

  const summaryRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'finance_summary', 'state');
  }, [db, user]);
  const { data: summary, loading: summaryLoading } = useDoc(summaryRef);

  const vouchersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'finance_vms_vouchers'), orderBy('createdAt', 'desc'), limit(10));
  }, [db, user]);
  const { data: recentVouchers, loading: vLoading } = useCollection(vouchersQuery);

  const stats = useMemo(() => {
    const s = summary || {
      totalIncome: 0,
      totalExpense: 0,
      bankBalance: 0,
      cashInHand: 0,
      monthlyIncome: []
    }
    return {
      income: s.totalIncome || 0,
      expense: s.totalExpense || 0,
      net: (s.totalIncome || 0) - (s.totalExpense || 0),
      bank: s.bankBalance || 0,
      cash: s.cashInHand || 0,
      charts: s.monthlyIncome || [
        { name: 'Jan', income: 45000, expense: 32000 },
        { name: 'Feb', income: 52000, expense: 41000 },
        { name: 'Mar', income: 48000, expense: 38000 }
      ]
    }
  }, [summary])

  if (authLoading || summaryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-10 pb-8 bg-slate-900 text-white border-b-8 border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" /> Advanced Voucher Management
            </div>
            <h1 className="text-3xl md:text-5xl font-headline font-bold">VMS <span className="text-emerald-400 italic">Terminal</span></h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Digital Audit & Disbursement Node</p>
          </div>
          <div className="flex gap-2">
            <Link href="/internal/finance/vms/list">
              <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-emerald-600 transition-all font-bold text-xs h-11 px-6 rounded-xl">
                <Layers className="w-4 h-4 mr-2" /> Voucher Registry
              </Button>
            </Link>
            <Link href="/internal/finance/vms/new">
              <Button className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-900/20 font-bold text-xs h-11 px-6 rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> New Instrument
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Treasury Net', val: stats.net, icon: Wallet, color: 'text-blue-500' },
            { label: 'Total Inflow', val: stats.income, icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Total Outflow', val: stats.expense, icon: TrendingDown, color: 'text-rose-500' },
            { label: 'Liquid Assets', val: stats.bank + stats.cash, icon: Building, color: 'text-amber-500' }
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-3 rounded-2xl bg-slate-50 dark:bg-slate-800", stat.color)}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 text-[9px] border-none font-black uppercase">Live</Badge>
                 </div>
                 <p className="text-2xl font-headline font-bold text-primary dark:text-white mb-1">₹{stat.val.toLocaleString()}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-10">
          <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-8 pb-0">
               <CardTitle className="text-xl font-headline font-bold">Voucher Volume Analysis</CardTitle>
               <CardDescription>Transactional frequency across current financial cycle.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] p-8">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.charts}>
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} />
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={3} />
                  </AreaChart>
               </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-6">
             <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-8">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Workflow Status
                </h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-slate-400 uppercase font-bold">Pending Approval</span>
                     <Badge className="bg-amber-500">{recentVouchers?.filter((v:any) => v.status !== 'Approved').length || 0}</Badge>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-slate-400 uppercase font-bold">Total Processed</span>
                     <Badge className="bg-emerald-500">{recentVouchers?.length || 0}</Badge>
                   </div>
                </div>
             </Card>
          </div>
        </div>

        <Card className="mt-10 border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
           <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-headline font-bold">Recent Instruments</CardTitle>
                <CardDescription>Latest digital vouchers committed to the national force registry.</CardDescription>
              </div>
              <Link href="/internal/finance/vms/list">
                <Button variant="ghost" className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Full List <ArrowUpRight className="w-4 h-4 ml-1" /></Button>
              </Link>
           </CardHeader>
           <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase border-b">
                  <tr>
                    <th className="px-8 py-5">Voucher No</th>
                    <th className="px-8 py-5">Person / Entity</th>
                    <th className="px-8 py-5">Value</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {(recentVouchers || []).map((v: any) => (
                     <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                           <Badge variant="outline" className="font-mono text-[10px] border-emerald-100 text-emerald-600 uppercase">{v.voucherNo}</Badge>
                           <p className="text-[8px] text-slate-400 mt-1 font-bold">{v.date}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-bold">{v.person?.name}</p>
                           <p className="text-[9px] text-slate-400 uppercase">{v.type}</p>
                        </td>
                        <td className="px-8 py-6 font-black text-primary">₹{v.amount.toLocaleString()}</td>
                        <td className="px-8 py-6">
                           <Badge className={cn(
                             "text-[8px] font-black uppercase",
                             v.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'
                           )}>{v.status}</Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <Link href={`/internal/finance/vms/${v.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-bold border-slate-100">Details</Button>
                           </Link>
                        </td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </CardContent>
        </Card>
      </section>

      <Footer />
    </main>
  )
}
