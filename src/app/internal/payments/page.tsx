
"use client"

import React, { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { AdminNavbar } from '@/components/admin-navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CreditCard, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  IndianRupee, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Hash,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  FilterX
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { ManualDonationDialog } from '@/components/manual-donation-dialog'

export default function PaymentsManagementPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [editPayment, setEditPayment] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const paymentsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: payments, loading: dataLoading } = useCollection(paymentsQuery);

  const handleDelete = async (id: string) => {
    if (!db) return;
    setIsActionLoading(true)
    try {
      await deleteDoc(doc(db, 'donations', id))
      toast({ title: "Record Deleted", description: "Transaction has been permanently removed from the ledger." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "System Error", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!db || !editPayment) return;
    setIsActionLoading(true)
    const { id, ...data } = editPayment
    try {
      await updateDoc(doc(db, 'donations', id), { ...data, updatedAt: serverTimestamp() })
      toast({ title: "Ledger Updated", description: `Record for ${data.donorName || data.name} has been modified.` })
      setEditPayment(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (payments || []).filter((p: any) => {
    const name = (p.donorName || p.name || '').toLowerCase()
    const email = (p.donorEmail || p.email || '').toLowerCase()
    const txnId = (p.transactionId || '').toLowerCase()
    
    const matchesSearch = name.includes(search.toLowerCase()) || 
                          email.includes(search.toLowerCase()) ||
                          txnId.includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || p.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  })

  const stats = {
    total: (payments || []).reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0),
    count: (payments || []).length,
    pending: (payments || []).filter((p: any) => p.status?.toLowerCase() === 'pending').length
  }

  const paymentMethods = ["UPI QR Code", "Cash", "Cheque", "Bank Transfer", "Draft", "International Card", "UPI/NetBanking"]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminNavbar />

      <section className="pt-32 pb-12 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-3 h-3" /> Financial Governance
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Payments <span className="text-accent italic">Ledger</span></h1>
              <p className="text-slate-400">Manage organizational revenue, donor profiling, and tax-receipt compliance.</p>
            </div>
            
            <ManualDonationDialog>
              <Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-8 flex gap-2 hover:bg-accent/90 shadow-xl shadow-accent/20">
                <Plus className="w-5 h-5" /> Record New Payment
              </Button>
            </ManualDonationDialog>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[72px] md:top-[84px] z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Method</Label>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-40 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Methods</SelectItem>
                    {paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl h-11 w-11 text-slate-400 hover:text-accent"
                onClick={() => { setSearch(''); setStatusFilter('All'); setMethodFilter('All'); }}
              >
                <FilterX className="w-5 h-5" />
              </Button>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by name, email or transaction ID..." 
                className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing Financial Records...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((payment: any) => (
                <Card key={payment.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-8 bg-slate-50 dark:bg-slate-800 md:w-56 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                         <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-inner mb-4">
                            <IndianRupee className="w-6 h-6 text-accent" />
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Contribution</p>
                         <p className="text-3xl font-headline font-bold text-primary dark:text-white leading-none mb-4">₹{payment.amount}</p>
                         <Badge className={cn(
                           "font-bold uppercase tracking-widest text-[9px] px-3 py-1",
                           payment.status?.toLowerCase() === 'completed' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                         )}>
                           {payment.status || 'Completed'}
                         </Badge>
                      </div>
                      
                      <div className="flex-1 p-8 grid lg:grid-cols-4 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-6">
                          <div className="space-y-1">
                             <h3 className="text-2xl font-headline font-bold text-primary dark:text-white group-hover:text-accent transition-colors">{payment.donorName || payment.name}</h3>
                             <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                               <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-accent" /> {payment.donorEmail || payment.email}</span>
                               <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-accent" /> {payment.donorPhone || payment.phone || 'N/A'}</span>
                             </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                             <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Government IDs</p>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-slate-500">PAN: <span className="text-primary dark:text-white font-mono">{payment.pan || 'N/A'}</span></p>
                                  <p className="text-[10px] font-bold text-slate-500">AADHAAR: <span className="text-primary dark:text-white font-mono">**** {payment.aadhaar?.slice(-4) || 'N/A'}</span></p>
                                </div>
                             </div>
                             <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Transaction Info</p>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-slate-500">METHOD: <span className="text-accent uppercase">{payment.paymentMethod}</span></p>
                                  <p className="text-[10px] font-bold text-slate-500">REF: <span className="text-primary dark:text-white font-mono">{payment.transactionId?.slice(-12)}</span></p>
                                </div>
                             </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center lg:items-end justify-between h-full gap-4">
                           <div className="text-right">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-end gap-1"><Clock className="w-3 h-3" /> Timestamp</p>
                              <p className="text-xs font-bold text-slate-500">
                                {payment.createdAt?.toDate ? payment.createdAt.toDate().toLocaleString() : payment.timestamp || 'N/A'}
                              </p>
                           </div>

                           <div className="flex gap-2 w-full md:w-auto">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button onClick={() => setEditPayment(payment)} variant="outline" className="rounded-xl font-bold h-11 flex-1 md:flex-none border-slate-200 dark:border-slate-700 hover:bg-accent hover:text-primary transition-all flex gap-2">
                                    <Edit className="w-4 h-4" /> Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader><DialogTitle className="text-2xl font-headline font-bold">Edit Payment Record</DialogTitle></DialogHeader>
                                  {editPayment && (
                                    <div className="space-y-6 py-4">
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Donor Name</Label><Input value={editPayment.donorName || editPayment.name} onChange={e => setEditPayment({...editPayment, donorName: e.target.value})} className="h-11 rounded-xl" /></div>
                                        <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" value={editPayment.amount} onChange={e => setEditPayment({...editPayment, amount: Number(e.target.value)})} className="h-11 rounded-xl" /></div>
                                      </div>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Email</Label><Input value={editPayment.donorEmail || editPayment.email} onChange={e => setEditPayment({...editPayment, donorEmail: e.target.value})} className="h-11 rounded-xl" /></div>
                                        <div className="space-y-2"><Label>Phone</Label><Input value={editPayment.donorPhone || editPayment.phone} onChange={e => setEditPayment({...editPayment, donorPhone: e.target.value})} className="h-11 rounded-xl" /></div>
                                      </div>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Payment Method</Label>
                                          <Select value={editPayment.paymentMethod} onValueChange={v => setEditPayment({...editPayment, paymentMethod: v})}>
                                            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>{paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Status</Label>
                                          <Select value={editPayment.status} onValueChange={v => setEditPayment({...editPayment, status: v})}>
                                            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Pending">Pending</SelectItem></SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>PAN Number</Label><Input value={editPayment.pan} onChange={e => setEditPayment({...editPayment, pan: e.target.value})} className="h-11 rounded-xl uppercase font-mono" /></div>
                                        <div className="space-y-2"><Label>Aadhaar</Label><Input value={editPayment.aadhaar} onChange={e => setEditPayment({...editPayment, aadhaar: e.target.value})} className="h-11 rounded-xl font-mono" /></div>
                                      </div>
                                      <div className="space-y-2"><Label>Address</Label><Textarea value={editPayment.donorAddress || editPayment.address} onChange={e => setEditPayment({...editPayment, donorAddress: e.target.value})} className="rounded-xl min-h-[80px]" /></div>
                                      <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-accent text-primary font-bold text-lg">
                                        {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit Ledger Updates"}
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[2rem]">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                                    <AlertDialogDescription>Transaction <strong>{payment.transactionId}</strong> will be permanently removed. This is for error correction only.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(payment.id)} className="bg-red-500 hover:bg-red-600 rounded-xl border-none text-white font-bold">
                                      {isActionLoading ? <Loader2 className="animate-spin" /> : "Delete Permanently"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                           </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                   <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IndianRupee className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                   </div>
                   <h3 className="text-2xl font-headline font-bold text-primary dark:text-white">No matching payments</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Try adjusting your filters or record a new transaction.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
