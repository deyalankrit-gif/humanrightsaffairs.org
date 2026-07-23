
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
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
  DialogFooter
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * VoucherHub: Central terminal for generating and auditing source financial instruments.
 * Supports Payment, Receipt, Income, Expense, Contra, and Journal vouchers.
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

  // Data Stream: Fetch transactions only after user is authenticated
  const txQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'finance_transactions'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: transactions, loading: txLoading } = useCollection(txQuery);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setIsSaving(true);

    // Dynamic Voucher Number Generation
    const voucherNo = `${formData.type.charAt(0)}${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
    
    const voucherData = {
      ...formData,
      amount: Number(formData.amount),
      voucherNo,
      date: new Date().toLocaleDateString('en-CA'),
      status: 'Submitted',
      createdAt: serverTimestamp(),
      createdBy: user.email,
    };

    try {
      // 1. Create the Transaction Record
      await addDoc(collection(db, 'finance_transactions'), voucherData);
      
      // 2. Update Global Summary (Optimistic update on server)
      const summaryRef = doc(db, 'finance_summary', 'state');
      const isIncome = formData.type === 'Income';
      await updateDoc(summaryRef, {
        [isIncome ? 'totalIncome' : 'totalExpense']: increment(Number(formData.amount)),
        [formData.paymentMethod === 'Bank' ? 'bankBalance' : 'cashInHand']: increment(isIncome ? Number(formData.amount) : -Number(formData.amount))
      });

      toast({ title: "Voucher Recorded", description: `Reference ${voucherNo} established.` });
      setIsAddOpen(false);
      setFormData({ type: 'Payment', account: 'Project Expenses', amount: '', particulars: '', paymentMethod: 'Bank', reference: '', projectId: '' });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: e.message });
    } finally {
      setIsSaving(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-emerald-500/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/internal/finance/dashboard')} className="text-white hover:bg-white/10">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-headline font-bold">Voucher <span className="text-emerald-400 italic">Hub</span></h1>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <ShieldCheck className="w-3.5 h-3.5" /> Source Document Governance
                </p>
              </div>
           </div>
           <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-8 rounded-xl shadow-xl shadow-emerald-900/20 transition-all">
             <Plus className="w-5 h-5 mr-2" /> New Voucher Entry
           </Button>
        </div>
      </header>

      <section className="py-12 container mx-auto px-4">
         <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
               <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900">
                  <CardHeader className="p-8 border-b dark:border-slate-800">
                     <CardTitle className="text-xl font-headline font-bold text-primary dark:text-white">Voucher Audit Feed</CardTitle>
                     <CardDescription>Real-time stream of newly established financial instruments.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-700">
                           <tr>
                              <th className="px-8 py-5">Instrument No.</th>
                              <th className="px-8 py-5">Categorization</th>
                              <th className="px-8 py-5">Monetary Value</th>
                              <th className="px-8 py-5">Oversight Status</th>
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
                                   <span className="text-lg font-black text-primary dark:text-white">₹{v.amount.toLocaleString()}</span>
                                </td>
                                <td className="px-8 py-6">
                                   <Badge className={cn(
                                     "text-[8px] font-black uppercase tracking-widest px-3 h-5 border-none text-white",
                                     v.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'
                                   )}>
                                     {v.status}
                                   </Badge>
                                </td>
                             </tr>
                           ))}
                           {(!transactions || transactions.length === 0) && !txLoading && (
                             <tr>
                               <td colSpan={4} className="py-20 text-center opacity-30">
                                  <Receipt className="w-12 h-12 mx-auto mb-4" />
                                  <p className="text-sm font-bold uppercase tracking-widest">No vouchers identified in the current cycle.</p>
                               </td>
                             </tr>
                           )}
                        </tbody>
                     </table>
                  </CardContent>
               </Card>
            </div>

            <div className="space-y-6">
               <Card className="border-none shadow-sm rounded-3xl bg-emerald-900 text-white p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <CardHeader className="p-0 mb-6">
                     <CardTitle className="text-base font-headline font-bold flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-emerald-400" /> Voucher Lifecycle
                     </CardTitle>
                  </CardHeader>
                  <div className="space-y-6 relative">
                     {[
                       { step: 'Initialization', desc: 'Draft entry by clerk', ok: true },
                       { step: 'Internal Review', desc: 'Finance Officer vetting', ok: true },
                       { step: 'Central Approval', desc: 'National Finance head authorization', ok: false },
                       { step: 'Registry Commit', desc: 'Irreversible ledger entry', ok: false }
                     ].map((s, i) => (
                       <div key={i} className="flex gap-4 group">
                          <div className={cn("w-1 h-full absolute left-3 top-0 opacity-20", s.ok ? "bg-emerald-400" : "bg-white")}></div>
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 relative z-10", s.ok ? "bg-emerald-500" : "bg-white/10")}>
                             {s.ok ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4 opacity-40" />}
                          </div>
                          <div>
                             <p className="text-xs font-bold leading-none">{s.step}</p>
                             <p className="text-[10px] text-white/50 mt-1">{s.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </Card>

               <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-4">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary dark:text-white">Governance Protocol</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold uppercase italic">
                     "Every financial instrument generated requires a multi-stage digital signature before commitment to the national registry."
                  </p>
               </div>
            </div>
         </div>
      </section>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent className="max-w-xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
            <div className="bg-slate-900 p-8 text-white">
               <DialogTitle className="text-2xl font-headline font-bold">Voucher Documentation</DialogTitle>
               <DialogDescription className="text-emerald-400 uppercase tracking-widest font-black text-[10px]">Financial Instrument Entry Terminal</DialogDescription>
            </div>
            <form onSubmit={handleCreateVoucher} className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Voucher Type</Label>
                     <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900">
                           {['Payment', 'Receipt', 'Income', 'Expense', 'Contra', 'Journal'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Monetary Value</Label>
                     <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="pl-9 h-11 rounded-xl font-bold text-lg bg-slate-50 dark:bg-slate-950 border-none" placeholder="0.00" required />
                     </div>
                  </div>
               </div>

               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Account Head (Chart of Accounts)</Label>
                  <Select value={formData.account} onValueChange={v => setFormData({...formData, account: v})}>
                     <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none"><SelectValue /></SelectTrigger>
                     <SelectContent className="bg-white dark:bg-slate-900">
                        {['Project Expenses', 'Donations', 'Membership Fees', 'Office Rent', 'Salaries', 'Legal Fees', 'Utilities'].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Voucher Particulars (Narration)</Label>
                  <Textarea value={formData.particulars} onChange={e => setFormData({...formData, particulars: e.target.value})} className="rounded-xl min-h-[100px] bg-slate-50 dark:bg-slate-950 border-none" placeholder="Detailed description of the transaction..." required />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Payment Channel</Label>
                     <Select value={formData.paymentMethod} onValueChange={v => setFormData({...formData, paymentMethod: v})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900">
                           {['Bank', 'Cash', 'UPI', 'Cheque'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Ref / Chq / Trans No.</Label>
                     <Input value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none" placeholder="Reference Info" />
                  </div>
               </div>

               <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-900/20 transition-all flex gap-2 border-none">
                  {isSaving ? <Loader2 className="animate-spin" /> : <><Send className="w-5 h-5" /> Submit for Approval</>}
               </Button>
            </form>
         </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
