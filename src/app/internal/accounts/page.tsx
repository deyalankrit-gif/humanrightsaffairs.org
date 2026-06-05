"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Wallet, 
  Building2, 
  HandCoins, 
  History, 
  ShieldCheck, 
  Loader2, 
  Save, 
  RefreshCcw,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PieChart
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'
import { cn } from '@/lib/utils'

export default function AccountManagementPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    cashInHand: 0,
    cashAtBank: 0,
    reconciliationNote: ''
  })

  const accountRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'accounts', 'official-state');
  }, [db, user]);

  const { data: accountState, loading: dataLoading } = useDoc(accountRef);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (accountState) {
      setFormData({
        cashInHand: accountState.cashInHand || 0,
        cashAtBank: accountState.cashAtBank || 0,
        reconciliationNote: ''
      })
    }
  }, [accountState])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountRef || !user) return

    setIsSaving(true)
    const updateData = {
      ...formData,
      totalBalance: Number(formData.cashInHand) + Number(formData.cashAtBank),
      lastUpdated: serverTimestamp(),
      updatedBy: user.email,
      reconciliationNote: formData.reconciliationNote || "Manual periodic reconciliation."
    }

    setDoc(accountRef, updateData, { merge: true })
      .then(() => {
        toast({ title: "Account State Updated", description: "Treasury records have been securely committed." })
        setIsSaving(false)
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: accountRef.path,
          operation: 'update',
          requestResourceData: updateData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setIsSaving(false)
      })
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const total = Number(formData.cashInHand) + Number(formData.cashAtBank)
  const bankPercent = total > 0 ? Math.round((formData.cashAtBank / total) * 100) : 0
  const cashPercent = total > 0 ? Math.round((formData.cashInHand / total) * 100) : 0

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-primary text-primary-foreground border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-accent/30">
              <ShieldCheck className="w-2.5 h-2.5" /> Treasury Governance
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Account <span className="text-accent italic">Management</span></h1>
            <p className="opacity-70 text-[11px] max-w-xl">Official portal for recording liquid assets and bank reconciliation for HRAT.</p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              
              <div className="lg:col-span-2 space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-none shadow-sm rounded-2xl bg-slate-900 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
                    <CardHeader className="pb-1 pt-4">
                      <CardTitle className="text-[9px] uppercase tracking-widest text-slate-400">Total Liquid Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-2xl font-headline font-bold text-accent">₹{total.toLocaleString()}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden relative group">
                    <CardHeader className="pb-1 pt-4">
                      <CardTitle className="text-[9px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
                         <Building2 className="w-2.5 h-2.5 text-emerald-500" /> Cash at Bank
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-xl font-bold text-primary dark:text-white">₹{Number(formData.cashAtBank).toLocaleString()}</p>
                      <div className="mt-1.5 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${bankPercent}%` }}></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden relative group">
                    <CardHeader className="pb-1 pt-4">
                      <CardTitle className="text-[9px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
                         <HandCoins className="w-2.5 h-2.5 text-amber-500" /> Cash in Hand
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-xl font-bold text-primary dark:text-white">₹{Number(formData.cashInHand).toLocaleString()}</p>
                      <div className="mt-1.5 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${cashPercent}%` }}></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 p-6 md:p-8">
                   <CardHeader className="p-0 mb-6">
                     <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                       <RefreshCcw className="w-5 h-5 text-accent" /> Asset Reconciliation
                     </CardTitle>
                   </CardHeader>
                   <form onSubmit={handleUpdate} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Cash-at-Bank (SBI A/c)</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input 
                              type="number" 
                              value={formData.cashAtBank} 
                              onChange={e => setFormData({...formData, cashAtBank: Number(e.target.value)})}
                              className="h-11 pl-8 text-lg font-bold rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Cash-in-Hand (Petty Cash)</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input 
                              type="number" 
                              value={formData.cashInHand} 
                              onChange={e => setFormData({...formData, cashInHand: Number(e.target.value)})}
                              className="h-11 pl-8 text-lg font-bold rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Internal Audit Note</Label>
                        <Textarea 
                          placeholder="e.g. Monthly closing for March 2025." 
                          value={formData.reconciliationNote}
                          onChange={e => setFormData({...formData, reconciliationNote: e.target.value})}
                          className="rounded-xl min-h-[80px] bg-slate-50 dark:bg-slate-950 text-sm"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full h-12 rounded-xl bg-accent text-primary font-bold shadow-lg transition-all hover:-translate-y-0.5"
                      >
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : <><Save className="w-4 h-4 mr-2" /> Commit Official State</>}
                      </Button>
                   </form>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-base font-headline font-bold flex items-center gap-2">
                      <History className="w-4 h-4 text-accent" /> Governance Log
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Last Sync</p>
                      <p className="font-bold text-xs text-slate-700 dark:text-slate-300">
                        {accountState?.lastUpdated?.toDate ? accountState.lastUpdated.toDate().toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Authorized Official</p>
                      <p className="font-bold text-xs text-slate-700 dark:text-slate-300 break-all">{accountState?.updatedBy || 'N/A'}</p>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Status</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Verified</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="bg-accent/5 p-6 rounded-2xl border border-accent/20 border-dashed text-center space-y-3">
                  <PieChart className="w-8 h-8 text-accent mx-auto" />
                  <p className="text-[9px] font-bold text-primary dark:text-accent uppercase tracking-widest">Composition</p>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400">Bank</span>
                    <span className="text-emerald-600">{bankPercent}%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400">Cash</span>
                    <span className="text-amber-600">{cashPercent}%</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
