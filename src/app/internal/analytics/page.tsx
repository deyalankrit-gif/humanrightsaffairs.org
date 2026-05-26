
"use client"

import React, { useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase, useAuth } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  IndianRupee, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  FileText,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DonationAnalyticsPage() {
  const { user, loading: authLoading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const db = useFirestore()

  const donationsQuery = useMemoFirebase(() => {
    // Only initiate query if user is authenticated to prevent permission errors on signout
    if (!db || !user) return null;
    return query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: donations, loading: dataLoading } = useCollection(donationsQuery);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const stats = useMemo(() => {
    if (!donations) return { total: 0, count: 0, chartData: [], methods: [] };

    const total = donations.reduce((acc, curr: any) => acc + Number(curr.amount || 0), 0);
    const count = donations.length;

    const methodMap: Record<string, number> = {};
    donations.forEach((d: any) => {
      const method = d.paymentMethod || 'Unknown'
      methodMap[method] = (methodMap[method] || 0) + 1;
    });

    const methods = Object.keys(methodMap).map(name => ({ name, value: methodMap[name] }));

    // Group by date for chart (last 10 entries)
    const chartData = donations.slice(0, 10).reverse().map((d: any) => ({
      name: d.donorName?.split(' ')[0] || 'Donor',
      amount: Number(d.amount)
    }));

    return { total, count, chartData, methods };
  }, [donations]);

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/internal/login')
    } catch (e) {
      // Error handled by central listener if relevant
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Validating Administrative Session...</p>
        </div>
      </div>
    )
  }

  const COLORS = ['#D4AF37', '#138808', '#000080', '#FF9933'];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="pt-32 pb-12 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-3 h-3" /> Secure Governance
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Donation <span className="text-accent italic">Analytics</span></h1>
              <p className="text-slate-400">Financial oversight of the Human Rights Affairs Trust (JusticeShield).</p>
            </div>
            <div className="flex gap-4">
              <Link href="/internal/members">
                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
                  <Users className="w-4 h-4 mr-2" /> Member Directory
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Ledgers...</p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Contributions", value: `₹${stats.total.toLocaleString()}`, icon: <IndianRupee className="w-5 h-5 text-emerald-500" />, trend: "+12.5%" },
                  { label: "Successful Transactions", value: stats.count, icon: <TrendingUp className="w-5 h-5 text-accent" />, trend: "Active" },
                  { label: "Avg. Donation", value: `₹${stats.count ? Math.round(stats.total / stats.count).toLocaleString() : 0}`, icon: <ArrowUpRight className="w-5 h-5 text-indigo-500" />, trend: "Steady" },
                  { label: "Last Reconciliation", value: "Today", icon: <Calendar className="w-5 h-5 text-pink-500" />, trend: "Live" }
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden group hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-accent/10 transition-colors">
                          {stat.icon}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-headline font-bold text-primary">Revenue Timeline (Latest)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar dataKey="amount" fill="#D4AF37" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-headline font-bold text-primary">Payment Channels</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.methods}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.methods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
                      {stats.methods.map((m, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{m.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                  <CardTitle className="text-2xl font-headline font-bold text-primary flex items-center gap-3">
                    <FileText className="w-6 h-6 text-accent" /> Recent Contribution Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-4">Donor Name</th>
                          <th className="px-8 py-4">Amount</th>
                          <th className="px-8 py-4">Method</th>
                          <th className="px-8 py-4">PAN Ref</th>
                          <th className="px-8 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {donations && donations.slice(0, 10).map((d: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-4 font-bold text-primary">{d.donorName}</td>
                            <td className="px-8 py-4 text-emerald-600 font-bold">₹{d.amount}</td>
                            <td className="px-8 py-4 text-slate-500 text-xs">{d.paymentMethod}</td>
                            <td className="px-8 py-4 font-mono text-xs text-slate-400">{d.pan}</td>
                            <td className="px-8 py-4">
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-widest">
                                {d.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
