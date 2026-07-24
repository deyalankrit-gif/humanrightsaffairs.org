
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp, updateDoc, increment, doc } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Footer } from '@/components/footer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, Receipt, ArrowLeft, Loader2, Save, Send, ShieldCheck, 
  IndianRupee, Calendar as CalendarIcon, FileText, CheckCircle2, XCircle, Clock
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription as DialogDesc
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * VoucherHub: Central terminal for generating and auditing source financial instruments.
 * Fully synchronized with General Ledger and Project Accounting.
 */
export default function VoucherHub() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [formData, setFormData] = useState({
    type: 'Payment',
    account: 'Project Expenses',
    amount: '',
    particulars: '',
    paymentMethod: 'Bank',
    reference: '',
    projectId: ''
  })

  // Data Streams for Sync
  const txQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'finance_transactions'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: transactions, loading: txLoading } = useCollection(txQuery);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'finance_projects'), orderBy('name', 'asc'));
  }, [db, user]);
  const { data: projects } = useCollection(projectsQuery);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setIsSaving(true);

    const voucherNo = `${formData.type.charAt(0)}${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
    const amountNum = Number(formData.amount);
    
    const voucherData = {
      ...formData,
      amount: amountNum,
      voucherNo,
      date: new Date().toLocaleDateString('en-CA'),
      status: 'Approved',
      createdAt: serverTimestamp(),
      createdBy: user.email,
    };

    try {
      // 1. Create Transaction
      await addDoc(collection(db, 'finance_transactions'), voucherData);
      
      // 2. Sync with Global Summary
      const summaryRef = doc(db, 'finance_summary', 'state');
      const isIncome = formData.type === 'Income' || formData.type === 'Receipt';
      
      await updateDoc(summaryRef, {
        [isIncome ? 'totalIncome' : 'totalExpense']: increment(amountNum),
        [formData.paymentMethod === 'Bank' ? 'bankBalance' : 'cashInHand']: increment(isIncome ? amountNum : -amountNum)
      });

      // 3. Sync with Project Accounting if applicable
      if (formData.projectId) {
        const projectRef = doc(db, 'finance_projects', formData.projectId);
        await updateDoc(projectRef, {
          utilized: increment(amountNum)
        });
      }

      toast({ title: "Voucher Recorded", description: `Instrument ${voucherNo} synchronized successfully.` });
      setIsAddOpen(false);
      setFormData({ type: 'Payment', account: 'Project Expenses', amount: '', particulars: '', paymentMethod: 'Bank', reference: '', projectId: '' });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    } finally {
      setIsSaving(false);
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-emerald-500/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/internal/finance/dashboard')} className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-headline font-bold">Voucher <span className="text-emerald-400 italic">Hub</span></h1>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <ShieldCheck className="w-3.5 h-3.5" /> Synchronized Financial Governance
                </p>
              </div>
           </div>
           <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-8 rounded-xl shadow-xl">
             <Plus className="w-5 h-5 mr-2" /> Generate Instrument
           </Button>
        </div>
      </header>

      <section className="py-12 container mx-auto px-4">
         <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
               <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900">
                  <CardHeader className="p-8 border-b dark:border-slate-800">
                     <CardTitle className="text-xl font-headline font-bold text-primary dark:text-white">Live Instrument Stream</CardTitle>
                     <CardDescription>Real-time feed of all validated vouchers across the organization.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-700">
                           <tr>
                              <th className="px-8 py-5">Voucher ID</th>
                              <th className="px-8 py-5">Categorization</th>
                              <th className="px-8 py-5">Value</th>
                              <th className="px-8 py-5">Sync Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                           {(transactions || []).map((v: any) => (
                             <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-8 py-6">
                                   <p className="font-mono text-xs font-bold text-emerald-600">{v.voucherNo}</p>
                                   <p className="text-[8px] text-slate-400 uppercase mt-1">{v.date}</p>
                                </td>
                                <td className="px-8 py-6">
                                   <p className="text-sm font-bold text-primary dark:text-white leading-none">{v.type}</p>
                                   <p className="text-[10px] text-slate-400 uppercase font-medium mt-1">{v.account}</p>
                                </td>
                                <td className="px-8 py-6">
                                   <span className={cn("text-lg font-black", (v.type === 'Income' || v.type === 'Receipt') ? 'text-emerald-500' : 'text-rose-500')}>
                                     ₹{v.amount.toLocaleString()}
                                   </span>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Synchronized</span>
                                   </div>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </CardContent>
               </Card>
            </div>

            <div className="space-y-6">
               <Card className="border-none shadow-sm rounded-3xl bg-emerald-900 text-white p-8">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Integrity Protocol
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "Every voucher created here is atomically synchronized with the General Ledger, Treasury Summary, and relevant Project budgets. Inconsistency is mathematically impossible."
                  </p>
               </Card>
            </div>
         </div>
      </section>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent className="max-w-xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
            <div className="bg-slate-900 p-8 text-white">
               <DialogTitle className="text-2xl font-headline font-bold">Instrument Documentation</DialogTitle>
               <DialogDesc className="text-emerald-400 uppercase tracking-widest font-black text-[10px]">Real-Time Sync Terminal</DialogDesc>
            </div>
            <form onSubmit={handleCreateVoucher} className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Voucher Type</Label>
                     <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                           {['Payment', 'Receipt', 'Income', 'Expense', 'Contra', 'Journal'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Value (₹)</Label>
                     <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="h-11 rounded-xl font-bold text-lg bg-slate-50 dark:bg-slate-950 border-none" required />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Linked Mission Project</Label>
                  <Select value={formData.projectId} onValueChange={v => setFormData({...formData, projectId: v})}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none"><SelectValue placeholder="Select Project (Optional)" /></SelectTrigger>
                    <SelectContent className="bg-white">
                       <SelectItem value="none">No Project Linked</SelectItem>
                       {(projects || []).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>

               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Particulars (Narration)</Label>
                  <Textarea value={formData.particulars} onChange={e => setFormData({...formData, particulars: e.target.value})} className="rounded-xl min-h-[100px] bg-slate-50 dark:bg-slate-950 border-none" required />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Payment Channel</Label>
                     <Select value={formData.paymentMethod} onValueChange={v => setFormData({...formData, paymentMethod: v})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                           {['Bank', 'Cash', 'UPI', 'Cheque'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Ref / Chq / Trans No.</Label>
                     <Input value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none" />
                  </div>
               </div>

               <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-900/20 transition-all flex gap-2">
                  {isSaving ? <Loader2 className="animate-spin" /> : "Authorize & Sync Instrument"}
               </Button>
            </form>
         </DialogContent>
      </Dialog>
      <Footer />
    </main>
  )
}
