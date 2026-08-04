
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

/**
 * Financial Intelligence Dashboard: Complete Real-Time Sync.
 */
export default function FinanceDashboard() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()

  // Real-Time Global Financial State
  const summaryRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'finance_summary', 'state');
  }, [db, user]);
  const { data: summary, loading: summaryLoading } = useDoc(summaryRef);

  // Real-Time Transaction Stream
  const txQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'finance_transactions'), orderBy('createdAt', 'desc'), limit(10));
  }, [db, user]);
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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-emerald-500" /></div>
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-10 md:pt-16 pb-8 bg-slate-900 text-white border-b-8 border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-accent/30 tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Treasury Governance
            </div>
            <h1 className="text-3xl md:text-5xl font-headline font-bold leading-tight">Financial <span className="text-emerald-400 italic">Intelligence</span></h1>
          </div>
          <Button className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl font-bold text-[10px] uppercase h-11 px-8 rounded-xl">
            <Download className="w-4 h-4 mr-2" /> Export Ledgers
          </Button>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Net Treasury Balance', val: stats.net, icon: Wallet, color: 'text-blue-500', up: true },
            { label: 'Total Inflow', val: stats.income, icon: TrendingUp, color: 'text-emerald-500', up: true },
            { label: 'Total Outflow', val: stats.expense, icon: TrendingDown, color: 'text-rose-500', up: false },
            { label: 'Liquid Assets', val: stats.bank + stats.cash, icon: Building, color: 'text-amber-500', up: true }
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-3 rounded-2xl bg-slate-50 dark:bg-slate-800", stat.color)}><stat.icon className="w-6 h-6" /></div>
                    <Badge variant="outline" className="text-[9px] border-emerald-100 text-emerald-600 font-black uppercase">Real-Time</Badge>
                 </div>
                 <p className="text-2xl md:text-3xl font-headline font-bold text-primary dark:text-white leading-none">₹{stat.val.toLocaleString()}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8">
            <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-xl font-headline font-bold">Operational Cash Flow</CardTitle>
                  <CardDescription>Live Income vs. Expenditure Analytics</CardDescription>
               </div>
               <RefreshCw className={cn("w-5 h-5 text-emerald-500", txLoading && "animate-spin")} />
            </CardHeader>
            <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.charts}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8">
             <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xl font-headline font-bold">Fund Utilization</CardTitle>
             </CardHeader>
             <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie data={stats.pie} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                         {stats.pie.map((entry: any, index: number) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                   </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="grid grid-cols-2 gap-3 mt-6">
                {stats.pie.map((entry: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500">
                     <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                     <span className="truncate">{entry.name}</span>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
