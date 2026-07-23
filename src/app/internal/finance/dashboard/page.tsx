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
  Loader2, FileSpreadsheet, Download, RefreshCw, Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FinanceDashboard() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()

  const summaryRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'finance_summary', 'state');
  }, [db]);
  const { data: summary, loading: summaryLoading } = useDoc(summaryRef);

  const txQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'finance_transactions'), orderBy('createdAt', 'desc'), limit(10));
  }, [db]);
  const { data: recentTransactions, loading: txLoading } = useCollection(txQuery);

  const stats = useMemo(() => {
    const s = summary || {
      totalIncome: 0,
      totalExpense: 0,
      bankBalance: 0,
      cashInHand: 0,
      monthlyIncome: [],
      expenseCategories: []
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
        { name: 'Mar', income: 48000, expense: 38000 },
        { name: 'Apr', income: 61000, expense: 45000 }
      ],
      pie: s.expenseCategories || [
        { name: 'Projects', value: 400, color: '#10b981' },
        { name: 'Salaries', value: 300, color: '#0ea5e9' },
        { name: 'Office', value: 200, color: '#f59e0b' },
        { name: 'Travel', value: 100, color: '#ef4444' }
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
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" /> Treasury Governance
            </div>
            <h1 className="text-3xl md:text-5xl font-headline font-bold">Financial <span className="text-emerald-400 italic">Intelligence</span></h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Enterprise Fund Oversight Node</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-emerald-600 transition-all font-bold text-xs h-11 px-6 rounded-xl">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Annual Report
            </Button>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-900/20 font-bold text-xs h-11 px-6 rounded-xl">
              <Download className="w-4 h-4 mr-2" /> Export Ledgers
            </Button>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Net Treasury Balance', val: stats.net, icon: Wallet, color: 'text-blue-500', trend: '+5.2%', up: true },
            { label: 'Total Mission Income', val: stats.income, icon: TrendingUp, color: 'text-emerald-500', trend: '+12.4%', up: true },
            { label: 'Cumulative Expenditure', val: stats.expense, icon: TrendingDown, color: 'text-rose-500', trend: '-2.1%', up: false },
            { label: 'Verified Bank Assets', val: stats.bank, icon: Building, color: 'text-amber-500', trend: 'Stable', up: true }
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-3 rounded-2xl bg-slate-50 dark:bg-slate-800", stat.color)}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-tighter px-2 h-5 border-none", stat.up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                      {stat.up ? <ArrowUpRight className="w-2.5 h-2.5 mr-1" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-1" />}
                      {stat.trend}
                    </Badge>
                 </div>
                 <p className="text-3xl font-headline font-bold text-primary dark:text-white mb-1">₹{stat.val.toLocaleString()}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-10">
          <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-8 pb-0">
               <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                 <RefreshCw className="w-5 h-5 text-emerald-500" /> Operational Cash Flow
               </CardTitle>
               <CardDescription>Monthly Income vs. Expenditure Analysis</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] p-8">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.charts}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
               </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-8 pb-0">
               <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                 <Layers className="w-5 h-5 text-emerald-500" /> Fund Utilization
               </CardTitle>
               <CardDescription>Expenditure Distribution by Category</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] p-8">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.pie}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.pie.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="grid grid-cols-2 gap-2 mt-4">
                  {stats.pie.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                       <span>{entry.name}</span>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-10 border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
           <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-headline font-bold">Recent Institutional Ledger</CardTitle>
                  <CardDescription>The latest validated financial financial movements across all councils.</CardDescription>
                </div>
                <Button variant="ghost" onClick={() => router.push('/internal/finance/ledger')} className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                  View Full Ledger <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
           </CardHeader>
           <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-800">
                  <tr>
                    <th className="px-8 py-5">Voucher</th>
                    <th className="px-8 py-5">Transaction Details</th>
                    <th className="px-8 py-5">Amount</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                   {(recentTransactions || []).map((tx: any) => (
                     <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-8 py-6">
                           <Badge variant="outline" className="font-mono text-[11px] border-emerald-100 text-emerald-600">{tx.voucherNo}</Badge>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-bold text-primary dark:text-white leading-none">{tx.particulars}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{tx.account} • {tx.paymentMethod}</p>
                        </td>
                        <td className="px-8 py-6">
                           <span className={cn("text-lg font-black", tx.type === 'Income' ? 'text-emerald-500' : 'text-rose-500')}>
                             {tx.type === 'Income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <Badge className={cn(
                             "text-[9px] font-black uppercase tracking-tighter px-2.5 h-5 border-none text-white",
                             tx.status === 'Approved' ? 'bg-emerald-500' : tx.status === 'Draft' ? 'bg-slate-400' : 'bg-amber-500'
                           )}>
                             {tx.status}
                           </Badge>
                        </td>
                        <td className="px-8 py-6 text-right text-[11px] font-bold text-slate-500">
                           {tx.date}
                        </td>
                     </tr>
                   ))}
                   {(!recentTransactions || recentTransactions.length === 0) && !txLoading && (
                     <tr>
                       <td colSpan={5} className="py-20 text-center opacity-30">
                          <IndianRupee className="w-12 h-12 mx-auto mb-4" />
                          <p className="text-sm font-bold uppercase tracking-widest">No active transactions in the current cycle.</p>
                       </td>
                     </tr>
                   )}
                </tbody>
              </table>
           </CardContent>
        </Card>
      </section>

      <Footer />
    </main>
  )
}
