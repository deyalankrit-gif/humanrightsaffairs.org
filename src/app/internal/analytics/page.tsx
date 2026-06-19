"use client"

import React, { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ManualDonationDialog } from '@/components/manual-donation-dialog'
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
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  FileText,
  Plus,
  Trash2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function DonationAnalyticsPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Wait for the registry doc to ensure permissions are synchronized before firing the list query
  const userRegistryRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);

  const { data: permissions, loading: permissionsLoading } = useDoc(userRegistryRef);

  const donationsQuery = useMemoFirebase(() => {
    // 🛡️ Guard: Only fire the query if the user is Root OR if we've confirmed they have the 'analytics' permission
    const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com';
    const hasPermission = isRoot || permissions?.permissions?.analytics === true;

    if (!db || !user || permissionsLoading || !hasPermission) return null;
    return query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
  }, [db, user, permissions, permissionsLoading]);

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

    const chartData = donations.slice(0, 10).reverse().map((d: any) => ({
      name: (d.donorName || d.name)?.split(' ')[0] || 'Donor',
      amount: Number(d.amount)
    }));

    return { total, count, chartData, methods };
  }, [donations]);

  const handleDelete = async (id: string) => {
    if (!db) return
    setIsDeleting(id)
    try {
      await deleteDoc(doc(db, 'donations', id))
      toast({ title: "Record Removed", description: "The transaction has been deleted from history." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsDeleting(null)
    }
  }

  if (authLoading || !user || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Institutional Clearance...</p>
        </div>
      </div>
    )
  }

  const COLORS = ['#D4AF37', '#138808', '#000080', '#FF9933'];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-primary text-primary-foreground border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Secure Governance
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Donation <span className="text-accent italic">Analytics</span></h1>
              <p className="opacity-70 text-[11px]">Financial oversight of the Human Rights Affairs Trust (JusticeShield).</p>
            </div>

            <ManualDonationDialog>
              <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2 hover:bg-secondary hover:text-white transition-all shadow-lg shadow-accent/20">
                <Plus className="w-4 h-4" /> Record Manual Donation
              </Button>
            </ManualDonationDialog>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Ledgers...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: `₹${stats.total.toLocaleString()}`, icon: <IndianRupee className="w-4 h-4 text-emerald-500" />, trend: "+12%" },
                  { label: "Transactions", value: stats.count, icon: <TrendingUp className="w-4 h-4 text-accent" />, trend: "Live" },
                  { label: "Avg Ticket", value: `₹${stats.count ? Math.round(stats.total / stats.count).toLocaleString() : 0}`, icon: <ArrowUpRight className="w-4 h-4 text-indigo-500" />, trend: "Steady" },
                  { label: "Reconciliation", value: "Live", icon: <Calendar className="w-4 h-4 text-pink-500" />, trend: "OK" }
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-2xl bg-card dark:bg-slate-900 overflow-hidden group">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-muted dark:bg-slate-800 rounded-xl group-hover:bg-accent/10 transition-colors">
                          {stat.icon}
                        </div>
                        <span className="text-[8px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full">{stat.trend}</span>
                      </div>
                      <p className="text-lg font-bold text-foreground leading-none mb-1">{stat.value}</p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl bg-card dark:bg-slate-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-headline font-bold">Revenue Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] pb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                        <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
                        <YAxis fontSize={9} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '0.75rem', border: 'none', fontSize: '10px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }}
                          cursor={{ fill: 'currentColor', opacity: 0.05 }}
                        />
                        <Bar dataKey="amount" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-card dark:bg-slate-900">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-headline font-bold">Channels</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.methods}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {stats.methods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                      {stats.methods.map((m, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">{m.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm rounded-3xl bg-card dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-muted dark:bg-slate-800/50 border-b p-4 px-6">
                  <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" /> Contribution Ledger
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-muted/30 dark:bg-slate-800/50 text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b dark:border-slate-700">
                        <tr>
                          <th className="px-6 py-3">Donor Name</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Method</th>
                          <th className="px-6 py-3">Ref/PAN</th>
                          <th className="px-6 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border dark:divide-slate-800">
                        {donations && donations.map((d: any) => (
                          <tr key={d.id} className="hover:bg-muted/20 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-3 font-bold text-xs">{d.donorName || d.name}</td>
                            <td className="px-6 py-3 text-emerald-600 dark:text-emerald-400 font-bold text-xs">₹{d.amount}</td>
                            <td className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase">{d.paymentMethod}</td>
                            <td className="px-6 py-3 font-mono text-[10px] text-slate-400">{d.pan || d.transactionId?.slice(-6)}</td>
                            <td className="px-6 py-3">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-red-500 rounded-full">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-3xl max-w-sm">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-lg">Delete Record?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-xs">Permanent deletion from the master ledger.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl h-9 text-xs">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(d.id)} className="bg-red-500 hover:bg-red-600 border-none rounded-xl h-9 text-xs">Confirm</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
