
"use client"

import React, { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  const userRegistryRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);

  const { data: permissions, loading: permissionsLoading } = useDoc(userRegistryRef);

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com';
  const hasAccess = isRoot || (permissions?.permissions?.analytics === true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
      return;
    }

    if (!authLoading && user && !permissionsLoading && permissions) {
      if (!isRoot && permissions.permissions?.analytics !== true) {
        router.push('/internal/public-view');
      }
    }
  }, [user, authLoading, permissions, permissionsLoading, router, isRoot])

  const donationsQuery = useMemoFirebase(() => {
    if (!db || !user || permissionsLoading || !hasAccess) return null;
    return query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
  }, [db, user, permissions, permissionsLoading, hasAccess]);

  const { data: donations, loading: dataLoading } = useCollection(donationsQuery);

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
      toast({ title: "Record Removed" })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsDeleting(null)
    }
  }

  if (authLoading || !user || permissionsLoading || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  const COLORS = ['#D4AF37', '#138808', '#000080', '#FF9933'];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-10 md:pt-16 pb-8 bg-primary text-primary-foreground border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Secure Governance
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold leading-tight">Donation <span className="text-accent italic">Analytics</span></h1>
              <p className="opacity-70 text-[11px]">Financial oversight of the Human Rights Affairs Trust.</p>
            </div>

            <ManualDonationDialog>
              <Button className="w-full md:w-auto bg-accent text-primary font-bold rounded-xl h-12 md:h-11 px-8 flex gap-2 hover:bg-secondary hover:text-white transition-all shadow-lg shadow-accent/20">
                <Plus className="w-4 h-4" /> Record Manual Donation
              </Button>
            </ManualDonationDialog>
          </div>
        </div>
      </section>

      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-32 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Ledgers...</p>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: `₹${stats.total.toLocaleString()}`, icon: <IndianRupee className="w-5 h-5 text-emerald-500" />, trend: "+12%" },
                  { label: "Transactions", value: stats.count, icon: <TrendingUp className="w-5 h-5 text-accent" />, trend: "Live" },
                  { label: "Avg Ticket", value: `₹${stats.count ? Math.round(stats.total / stats.count).toLocaleString() : 0}`, icon: <ArrowUpRight className="w-5 h-5 text-indigo-500" />, trend: "Steady" },
                  { label: "Reconciliation", value: "Live", icon: <Calendar className="w-5 h-5 text-pink-500" />, trend: "OK" }
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-muted dark:bg-slate-800 rounded-xl group-hover:bg-accent/10 transition-colors">
                          {stat.icon}
                        </div>
                        <Badge variant="outline" className="text-[9px] font-bold text-emerald-500 border-emerald-500/20 bg-emerald-50/50">{stat.trend}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-foreground leading-none mb-1">{stat.value}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-card dark:bg-slate-900 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-headline font-bold">Revenue Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] md:h-[350px] pb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '1rem', border: 'none', fontSize: '11px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: 'currentColor', opacity: 0.05 }}
                        />
                        <Bar dataKey="amount" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[2.5rem] bg-card dark:bg-slate-900 overflow-hidden">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-headline font-bold">Channel Mix</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] md:h-[300px]">
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
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{m.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm rounded-[2.5rem] bg-card dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-muted/50 dark:bg-slate-800/50 border-b p-6">
                  <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                    <FileText className="w-5 h-5 text-accent" /> Master Contribution Ledger
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left min-w-[700px]">
                      <thead className="bg-muted/30 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-700">
                        <tr>
                          <th className="px-8 py-5">Donor Name</th>
                          <th className="px-8 py-5">Amount</th>
                          <th className="px-8 py-5">Method</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border dark:divide-slate-800">
                        {donations && donations.map((d: any) => (
                          <tr key={d.id} className="hover:bg-muted/20 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-8 py-6 font-bold text-sm">{d.donorName || d.name}</td>
                            <td className="px-8 py-6 text-emerald-600 dark:text-emerald-400 font-bold text-sm">₹{d.amount.toLocaleString() || 0}</td>
                            <td className="px-8 py-6 text-[10px] font-bold text-muted-foreground uppercase">{d.paymentMethod}</td>
                            <td className="px-8 py-6 text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="h-9 w-9 text-slate-300 hover:text-red-500 rounded-xl flex items-center justify-center transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl w-[95vw] md:w-full">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>Are you sure you want to delete this item? This action may be irreversible. Please confirm before continuing.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mt-4">
                                    <AlertDialogCancel className="rounded-xl h-12">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(d.id)} className="bg-red-500 hover:bg-red-600 rounded-xl h-12">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          </tr>
                        ))}
                        {(!donations || donations.length === 0) && (
                          <tr>
                            <td colSpan={4} className="py-20 text-center opacity-30">
                               <FileText className="w-12 h-12 mx-auto mb-4" />
                               <p className="text-sm font-bold uppercase tracking-widest">No transaction records found</p>
                            </td>
                          </tr>
                        )}
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
