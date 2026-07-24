"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Footer } from '@/components/footer'
import { 
  Scale, 
  Plus, 
  ArrowLeft, 
  Loader2, 
  FileCheck, 
  ShieldCheck, 
  Download, 
  History, 
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  Trash2,
  X
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function ComplianceHub() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [formData, setFormData] = useState({
    documentTitle: '',
    category: 'Income Tax (80G/12A)',
    filingDate: '',
    expiryDate: '',
    referenceNo: '',
    notes: ''
  })

  const complianceQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'finance_compliance'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: records, loading: recordsLoading } = useCollection(complianceQuery);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setIsActionLoading(true);

    try {
      await addDoc(collection(db, 'finance_compliance'), {
        ...formData,
        createdAt: serverTimestamp(),
        createdBy: user.email
      });
      toast({ title: "Compliance Document Logged", description: "The record has been committed to the legal vault." });
      setIsAddOpen(false);
      setFormData({ documentTitle: '', category: 'Income Tax (80G/12A)', filingDate: '', expiryDate: '', referenceNo: '', notes: '' });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsActionLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !user) return;
    try {
      await deleteDoc(doc(db, 'finance_compliance', id));
      toast({ title: "Record Removed" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
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
                <h1 className="text-2xl md:text-3xl font-headline font-bold">Tax & <span className="text-emerald-400 italic">Compliance</span></h1>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <ShieldCheck className="w-3.5 h-3.5" /> Legal & Statutory Vault
                </p>
              </div>
           </div>
           <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-8 rounded-xl shadow-xl">
             <Plus className="w-4 h-4 mr-2" /> Upload Compliance Log
           </Button>
        </div>
      </header>

      <section className="py-12 container mx-auto px-4">
         <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900">
                  <CardHeader className="p-8 border-b dark:border-slate-800">
                     <CardTitle className="text-xl font-headline font-bold">Statutory Records</CardTitle>
                     <CardDescription>Verified log of all government filings and registrations.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-700">
                           <tr>
                              <th className="px-8 py-5">Document Title</th>
                              <th className="px-8 py-5">Category</th>
                              <th className="px-8 py-5">Validity</th>
                              <th className="px-8 py-5 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                           {(records || []).map((r: any) => (
                             <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-8 py-6">
                                   <p className="font-bold text-sm text-primary dark:text-white leading-none">{r.documentTitle}</p>
                                   <p className="text-[9px] text-slate-400 font-mono mt-1">REF: {r.referenceNo}</p>
                                </td>
                                <td className="px-8 py-6">
                                   <Badge variant="outline" className="text-[8px] border-emerald-100 text-emerald-600">{r.category}</Badge>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Clock className="w-3 h-3" /> Filed: {r.filingDate}</span>
                                      <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Due: {r.expiryDate}</span>
                                   </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                   <div className="flex items-center justify-end gap-2">
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-emerald-500"><Download className="w-4 h-4" /></Button>
                                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="h-8 w-8 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                   </div>
                                </td>
                             </tr>
                           ))}
                           {(!records || records.length === 0) && !recordsLoading && (
                             <tr>
                               <td colSpan={4} className="py-20 text-center opacity-30">
                                  <FileText className="w-12 h-12 mx-auto mb-4" />
                                  <p className="text-sm font-bold uppercase tracking-widest">No compliance records identified.</p>
                               </td>
                             </tr>
                           )}
                        </tbody>
                     </table>
                  </CardContent>
               </Card>
            </div>

            <div className="space-y-6">
               <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <CardHeader className="p-0 mb-6">
                     <CardTitle className="text-base font-headline font-bold flex items-center gap-2">
                        <Scale className="w-5 h-5 text-emerald-400" /> Compliance Status
                     </CardTitle>
                  </CardHeader>
                  <div className="space-y-4">
                     {[
                       { label: '80G Registration', ok: true },
                       { label: '12A Registration', ok: true },
                       { label: 'CSR-1 Filing', ok: true },
                       { label: 'Annual Audit 24-25', ok: false }
                     ].map((s, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
                          {s.ok ? <FileCheck className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
                       </div>
                     ))}
                  </div>
               </Card>

               <div className="p-8 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-950/20 border-2 border-dashed border-emerald-200 dark:border-emerald-900 text-center space-y-4">
                  <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-emerald-700">Audit Disclaimer</h4>
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-400 leading-relaxed font-bold italic">
                     "All legal documents uploaded here are encrypted and audited monthly to maintain institutional veracity and government standards."
                  </p>
               </div>
            </div>
         </div>
      </section>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent className="max-w-xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden [&>button]:hidden">
            <div className="bg-slate-900 p-8 text-white relative">
               <div className="absolute right-6 top-6">
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white hover:bg-white/10 h-8 w-8">
                      <X className="w-5 h-5" />
                    </Button>
                  </DialogClose>
               </div>
               <DialogTitle className="text-2xl font-headline font-bold">Compliance Documentation</DialogTitle>
               <DialogDescription className="text-emerald-400 uppercase tracking-widest font-black text-[10px]">Legal Vault Entry Terminal</DialogDescription>
            </div>
            <form onSubmit={handleAddRecord} className="p-8 space-y-4">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Document Title *</Label>
                  <Input value={formData.documentTitle} onChange={e => setFormData({...formData, documentTitle: e.target.value})} placeholder="e.g. Audit Report FY 2024-25" required />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                     <SelectTrigger><SelectValue /></SelectTrigger>
                     <SelectContent className="bg-white">
                        {['Income Tax (80G/12A)', 'CSR-1 Filing', 'Audit Report', 'Board Resolution', 'NITI Aayog Documents'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Filing Date</Label>
                     <Input type="date" value={formData.filingDate} onChange={e => setFormData({...formData, filingDate: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Renewal/Expiry Due</Label>
                     <Input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Reference / Acknowledgement No.</Label>
                  <Input value={formData.referenceNo} onChange={e => setFormData({...formData, referenceNo: e.target.value})} placeholder="Official Receipt No." />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Vault Notes</Label>
                  <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Additional details..." />
               </div>
               <Button type="submit" disabled={isActionLoading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-4">
                 {isActionLoading ? <Loader2 className="animate-spin" /> : "Authorize & Lock in Vault"}
               </Button>
            </form>
         </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
