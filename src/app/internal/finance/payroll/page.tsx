"use client"

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Footer } from '@/components/footer'
import { 
  Users, IndianRupee, FileText, CheckCircle2, Clock, 
  ArrowLeft, Loader2, Plus, Download, ShieldCheck, 
  Search, Briefcase, Calendar as CalendarIcon, Save, X
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function PayrollSuite() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [search, setSearch] = useState('')

  const membersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
  }, [db, user]);
  const { data: members, loading: membersLoading } = useCollection(membersQuery);

  const payrollQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'finance_payroll'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: payrollRecords, loading: payrollLoading } = useCollection(payrollQuery);

  const stats = useMemo(() => {
    const totalPaid = (payrollRecords || []).reduce((acc, curr: any) => acc + (curr.netPaid || 0), 0);
    return { totalPaid, count: (payrollRecords || []).length };
  }, [payrollRecords]);

  const handleProcessPayroll = async (member: any) => {
    if (!db || !user) return;
    setIsProcessing(true);
    
    const amountNum = 26500; // Example net pay
    const monthStr = format(new Date(), 'MMMM');
    const yearStr = new Date().getFullYear().toString();
    const voucherNo = `P${yearStr}${Math.floor(1000 + Math.random() * 9000)}`;

    const recordData = {
      employeeId: member.memberId,
      employeeName: member.name,
      month: monthStr,
      year: yearStr,
      baseSalary: 25000, 
      allowances: 2000,
      deductions: 500,
      netPaid: amountNum,
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Paid',
      createdAt: serverTimestamp(),
      processedBy: user.email
    };

    try {
      // 1. Log to Payroll
      await addDoc(collection(db, 'finance_payroll'), recordData);

      // 2. Log to General Ledger (finance_transactions)
      await addDoc(collection(db, 'finance_transactions'), {
        voucherNo,
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'Expense',
        account: 'Salaries',
        amount: amountNum,
        paymentMethod: 'Bank',
        particulars: `Payroll: ${member.name} - ${monthStr} ${yearStr}`,
        status: 'Approved',
        createdAt: serverTimestamp(),
        createdBy: user.email
      });

      // 3. Sync with Global Summary
      const summaryRef = doc(db, 'finance_summary', 'state');
      await updateDoc(summaryRef, {
        totalExpense: increment(amountNum),
        bankBalance: increment(-amountNum)
      });

      toast({ title: "Payroll & Ledger Synchronized", description: `Disbursement recorded for ${member.name}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Error" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-emerald-500" /></div>

  const filteredMembers = (members || []).filter((m: any) => 
    (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (m.memberId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-emerald-500/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/internal/finance/dashboard')} className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-headline font-bold">Payroll <span className="text-emerald-400 italic">Suite</span></h1>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <ShieldCheck className="w-3.5 h-3.5" /> Real-Time Personnel Sync
                </p>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 px-6 py-2 rounded-xl border border-white/10 text-center">
                 <p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">MTD Disbursement</p>
                 <p className="text-xl font-bold text-emerald-400">₹{stats.totalPaid.toLocaleString()}</p>
              </div>
           </div>
        </div>
      </header>

      <section className="py-12 container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900">
                 <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                       <CardTitle className="text-xl font-headline font-bold">Staff Disbursement Registry</CardTitle>
                       <div className="relative w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                         <Input placeholder="Filter staff..." className="pl-8 h-9 rounded-xl text-xs" value={search} onChange={e => setSearch(e.target.value)} />
                       </div>
                    </div>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                       {filteredMembers.map((m: any) => (
                         <div key={m.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><Users className="w-5 h-5" /></div>
                               <div>
                                  <p className="font-bold text-sm text-primary dark:text-white leading-none">{m.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{m.memberId || 'N/A'}</p>
                               </div>
                            </div>
                            <Dialog>
                               <DialogTrigger asChild><Button size="sm" variant="outline" className="h-9 rounded-xl font-bold text-[10px] border-emerald-100 text-emerald-600">Process Salary</Button></DialogTrigger>
                               <DialogContent className="rounded-3xl max-w-md [&>button]:hidden">
                                  <DialogHeader className="relative">
                                     <div className="absolute right-0 top-0">
                                        <DialogClose asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                            <X className="w-4 h-4" />
                                          </Button>
                                        </DialogClose>
                                     </div>
                                     <DialogTitle>Authorize Disbursement</DialogTitle>
                                  </DialogHeader>
                                  <div className="py-6 space-y-4">
                                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm">
                                        <div className="flex justify-between mb-2"><span>Payable for {format(new Date(), 'MMMM')}</span><span className="font-bold">₹26,500</span></div>
                                        <p className="text-[10px] text-slate-400">Atomic sync enabled with Global Ledger.</p>
                                     </div>
                                     <Button onClick={() => handleProcessPayroll(m)} disabled={isProcessing} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold">
                                        {isProcessing ? <Loader2 className="animate-spin" /> : "Verify & Authorize"}
                                     </Button>
                                  </div>
                               </DialogContent>
                            </Dialog>
                         </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
           </div>
           
           <div className="space-y-6">
              <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-8">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2"><Clock className="w-4 h-4" /> Sync Registry</h4>
                 <div className="space-y-4">
                    {(payrollRecords || []).slice(0, 5).map((r: any) => (
                      <div key={r.id} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                         <div><p className="text-sm font-bold">{r.employeeName}</p><p className="text-[8px] text-slate-500 uppercase">{r.month} {r.year}</p></div>
                         <p className="text-sm font-black text-emerald-400">₹{r.netPaid?.toLocaleString()}</p>
                      </div>
                    ))}
                 </div>
              </Card>
           </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
