
"use client"

import React, { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  IndianRupee, 
  User, 
  Calendar, 
  Hash,
  FilterX,
  TrendingDown,
  Receipt,
  Info,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { format } from 'date-fns'

export default function ExpensesManagementPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<any>(null)

  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'Logistics',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    payee: '',
    description: '',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    referenceNumber: '',
    voucherNumber: '',
    bankTransferDetails: '',
    upiTransactionId: '',
    chequeNumber: '',
    bankName: '',
    branchName: '',
    cardReference: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const expensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'expenses'), orderBy('date', 'desc'));
  }, [db, user]);

  const { data: expenses, loading: dataLoading } = useCollection(expensesQuery);

  const handleAddExpense = async () => {
    if (!db) return;
    if (!newExpense.title || !newExpense.amount || !newExpense.payee) {
      toast({ variant: "destructive", title: "Required Fields", description: "Title, Amount, and Payee are mandatory." });
      return;
    }

    setIsActionLoading(true)
    const data = { ...newExpense, amount: Number(newExpense.amount), createdAt: serverTimestamp() }
    try {
      await addDoc(collection(db, 'expenses'), data)
      toast({ title: "Expense Logged", description: "Record has been successfully added to the ledger." })
      setNewExpense({
        title: '', category: 'Logistics', amount: 0, 
        date: format(new Date(), 'yyyy-MM-dd'), payee: '', 
        description: '', paymentMethod: 'Bank Transfer', status: 'Paid', referenceNumber: '',
        voucherNumber: '', bankTransferDetails: '', upiTransactionId: '',
        chequeNumber: '', bankName: '', branchName: '', cardReference: ''
      })
      setIsAddDialogOpen(false)
    } catch (e: any) {
      toast({ variant: "destructive", title: "System Error", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db) return;
    setIsActionLoading(true)
    try {
      await deleteDoc(doc(db, 'expenses', id))
      toast({ title: "Record Deleted" })
    } catch (e: any) {
      toast({ variant: "destructive", title: "System Error", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!db || !editExpense) return;
    setIsActionLoading(true)
    const { id, ...data } = editExpense
    try {
      await updateDoc(doc(db, 'expenses', id), { ...data, amount: Number(data.amount), updatedAt: serverTimestamp() })
      toast({ title: "Ledger Updated" })
      setEditExpense(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const expenseCategories = ["Salaries", "Rent", "Utility", "Legal Fees", "Logistics", "Printing", "Travel", "Relief Aid", "Other"]
  const paymentMethods = ["Cash", "Bank Transfer", "UPI", "Cheque", "Credit/Debit Card"]

  const filtered = (expenses || []).filter((e: any) => {
    const matchesSearch = e.title?.toLowerCase().includes(search.toLowerCase()) || 
                          e.payee?.toLowerCase().includes(search.toLowerCase()) ||
                          e.referenceNumber?.toLowerCase().includes(search.toLowerCase()) ||
                          e.voucherNumber?.toLowerCase().includes(search.toLowerCase()) ||
                          e.upiTransactionId?.toLowerCase().includes(search.toLowerCase()) ||
                          e.chequeNumber?.toLowerCase().includes(search.toLowerCase()) ||
                          e.cardReference?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  })

  const totalSpent = filtered.reduce((acc, curr: any) => acc + Number(curr.amount || 0), 0)

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-32 pb-12 bg-slate-900 text-white border-b-8 border-red-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-red-500/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-red-500/30">
                <TrendingDown className="w-3 h-3" /> Outflow Ledger
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Organizational <span className="text-red-500 italic">Expenses</span></h1>
              <p className="text-slate-400">Track and manage all organizational expenditure and operational costs.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Filtered Total</p>
                <p className="text-2xl font-bold text-red-500">₹{totalSpent.toLocaleString()}</p>
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-500 text-white font-bold rounded-2xl h-14 px-8 flex gap-2 hover:bg-red-600 shadow-xl shadow-red-500/20">
                    <Plus className="w-5 h-5" /> Log New Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl rounded-[2rem] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-2">
                      <Receipt className="w-6 h-6 text-red-500" /> Expense Recording
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Expense Title</Label><Input value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} placeholder="e.g. Office Rent Feb 2025" className="h-11 rounded-xl" /></div>
                      <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} className="h-11 rounded-xl" /></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={newExpense.category} onValueChange={v => setNewExpense({...newExpense, category: v})}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>{expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label>Transaction Date</Label><Input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="h-11 rounded-xl" /></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Payee / Vendor</Label><Input value={newExpense.payee} onChange={e => setNewExpense({...newExpense, payee: e.target.value})} placeholder="Entity receiving payment" className="h-11 rounded-xl" /></div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={newExpense.status} onValueChange={v => setNewExpense({...newExpense, status: v})}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Pending">Pending</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-red-500" /> Payment Method</Label>
                        <Select value={newExpense.paymentMethod} onValueChange={v => setNewExpense({...newExpense, paymentMethod: v, voucherNumber: '', bankTransferDetails: '', upiTransactionId: '', chequeNumber: '', bankName: '', branchName: '', cardReference: ''})}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>{paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>

                      {newExpense.paymentMethod === 'Cash' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Label>Voucher Number</Label>
                          <Input value={newExpense.voucherNumber} onChange={e => setNewExpense({...newExpense, voucherNumber: e.target.value})} placeholder="e.g. V-1024" className="h-11 rounded-xl" />
                        </div>
                      )}

                      {newExpense.paymentMethod === 'Bank Transfer' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Label>Transfer Details</Label>
                          <Input value={newExpense.bankTransferDetails} onChange={e => setNewExpense({...newExpense, bankTransferDetails: e.target.value})} placeholder="e.g. A/c No, IFSC, or Reference" className="h-11 rounded-xl" />
                        </div>
                      )}

                      {newExpense.paymentMethod === 'UPI' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Label>UPI Transaction ID</Label>
                          <Input value={newExpense.upiTransactionId} onChange={e => setNewExpense({...newExpense, upiTransactionId: e.target.value})} placeholder="e.g. 4056XXXXXXXX" className="h-11 rounded-xl" />
                        </div>
                      )}

                      {newExpense.paymentMethod === 'Cheque' && (
                        <div className="grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-2"><Label>Cheque No.</Label><Input value={newExpense.chequeNumber} onChange={e => setNewExpense({...newExpense, chequeNumber: e.target.value})} placeholder="000123" className="h-11 rounded-xl" /></div>
                          <div className="space-y-2"><Label>Bank Name</Label><Input value={newExpense.bankName} onChange={e => setNewExpense({...newExpense, bankName: e.target.value})} placeholder="SBI" className="h-11 rounded-xl" /></div>
                          <div className="space-y-2"><Label>Branch</Label><Input value={newExpense.branchName} onChange={e => setNewExpense({...newExpense, branchName: e.target.value})} placeholder="Kolkata" className="h-11 rounded-xl" /></div>
                        </div>
                      )}

                      {newExpense.paymentMethod === 'Credit/Debit Card' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Label>Card Transaction Ref</Label>
                          <Input value={newExpense.cardReference} onChange={e => setNewExpense({...newExpense, cardReference: e.target.value})} placeholder="e.g. Auth Code or Trans ID" className="h-11 rounded-xl" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2"><Label>Purpose / Description</Label><Textarea value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} placeholder="Detailed purpose of expenditure..." className="rounded-xl min-h-[80px]" /></div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddExpense} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-red-500 text-white font-bold text-lg hover:bg-red-600">
                      {isActionLoading ? <Loader2 className="animate-spin mr-2" /> : "Commit Expense to Ledger"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-all">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 text-slate-400" onClick={() => { setSearch(''); setStatusFilter('All'); setCategoryFilter('All'); }}><FilterX className="w-5 h-5" /></Button>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input placeholder="Search records..." className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" /></div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((expense: any) => (
                <Card key={expense.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-8 bg-slate-50 dark:bg-slate-800 md:w-56 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                         <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-inner mb-4">
                            <IndianRupee className="w-6 h-6 text-red-500" />
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                         <p className="text-3xl font-headline font-bold text-primary dark:text-white leading-none mb-4">₹{expense.amount?.toLocaleString()}</p>
                         <Badge className={cn(
                           "font-bold uppercase tracking-widest text-[9px] px-3 py-1",
                           expense.status === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                         )}>
                           {expense.status}
                         </Badge>
                      </div>
                      
                      <div className="flex-1 p-8 grid lg:grid-cols-4 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-4">
                          <div className="space-y-1">
                             <Badge variant="outline" className="border-red-200 text-red-500 text-[9px] font-bold uppercase mb-1">{expense.category}</Badge>
                             <h3 className="text-2xl font-headline font-bold text-primary dark:text-white group-hover:text-red-500 transition-colors">{expense.title}</h3>
                             <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                               <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-red-500" /> {expense.payee}</span>
                               <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-red-500" /> {expense.date}</span>
                             </div>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic">"{expense.description || 'No description provided.'}"</p>
                        </div>

                        <div className="flex flex-col justify-between h-full lg:items-end gap-4">
                           <div className="text-right">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                                {expense.paymentMethod === 'Cash' && <Banknote className="w-3 h-3 text-red-500" />}
                                {expense.paymentMethod === 'UPI' && <Smartphone className="w-3 h-3 text-red-500" />}
                                {expense.paymentMethod === 'Cheque' && <CreditCard className="w-3 h-3 text-red-500" />}
                                {expense.paymentMethod === 'Bank Transfer' && <Hash className="w-3 h-3 text-red-500" />}
                                {expense.paymentMethod === 'Credit/Debit Card' && <CreditCard className="w-3 h-3 text-red-500" />}
                                {expense.paymentMethod} Reference
                              </p>
                              <p className="font-mono text-xs font-bold text-primary dark:text-white uppercase">
                                {expense.paymentMethod === 'Cash' && (expense.voucherNumber || 'N/A')}
                                {expense.paymentMethod === 'UPI' && (expense.upiTransactionId || 'N/A')}
                                {expense.paymentMethod === 'Cheque' && `${expense.chequeNumber || 'N/A'} @ ${expense.bankName || 'N/A'}`}
                                {expense.paymentMethod === 'Bank Transfer' && (expense.bankTransferDetails || 'N/A')}
                                {expense.paymentMethod === 'Credit/Debit Card' && (expense.cardReference || 'N/A')}
                              </p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase mt-2">Audit Hash: {expense.id.slice(-8).toUpperCase()}</p>
                           </div>

                           <div className="flex gap-2 w-full md:w-auto">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button onClick={() => setEditExpense(expense)} variant="outline" className="rounded-xl font-bold h-11 flex-1 md:flex-none border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-500 transition-all flex gap-2">
                                    <Edit className="w-4 h-4" /> Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader><DialogTitle className="text-2xl font-headline font-bold">Modify Expense Record</DialogTitle></DialogHeader>
                                  {editExpense && (
                                    <div className="space-y-6 py-4">
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Title</Label><Input value={editExpense.title} onChange={e => setEditExpense({...editExpense, title: e.target.value})} className="h-11 rounded-xl" /></div>
                                        <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" value={editExpense.amount} onChange={e => setEditExpense({...editExpense, amount: Number(e.target.value)})} className="h-11 rounded-xl" /></div>
                                      </div>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Category</Label>
                                          <Select value={editExpense.category} onValueChange={v => setEditExpense({...editExpense, category: v})}>
                                            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>{expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2"><Label>Date</Label><Input type="date" value={editExpense.date} onChange={e => setEditExpense({...editExpense, date: e.target.value})} className="h-11 rounded-xl" /></div>
                                      </div>
                                      
                                      <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="space-y-2">
                                          <Label>Payment Method</Label>
                                          <Select value={editExpense.paymentMethod} onValueChange={v => setEditExpense({...editExpense, paymentMethod: v, voucherNumber: '', bankTransferDetails: '', upiTransactionId: '', chequeNumber: '', bankName: '', branchName: '', cardReference: ''})}>
                                            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>{paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                          </Select>
                                        </div>

                                        {editExpense.paymentMethod === 'Cash' && (
                                          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label>Voucher Number</Label>
                                            <Input value={editExpense.voucherNumber || ''} onChange={e => setEditExpense({...editExpense, voucherNumber: e.target.value})} className="h-11 rounded-xl" />
                                          </div>
                                        )}

                                        {editExpense.paymentMethod === 'Bank Transfer' && (
                                          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label>Transfer Details</Label>
                                            <Input value={editExpense.bankTransferDetails || ''} onChange={e => setEditExpense({...editExpense, bankTransferDetails: e.target.value})} className="h-11 rounded-xl" />
                                          </div>
                                        )}

                                        {editExpense.paymentMethod === 'UPI' && (
                                          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label>UPI Transaction ID</Label>
                                            <Input value={editExpense.upiTransactionId || ''} onChange={e => setEditExpense({...editExpense, upiTransactionId: e.target.value})} className="h-11 rounded-xl" />
                                          </div>
                                        )}

                                        {editExpense.paymentMethod === 'Cheque' && (
                                          <div className="grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-2"><Label>Cheque No.</Label><Input value={editExpense.chequeNumber || ''} onChange={e => setEditExpense({...editExpense, chequeNumber: e.target.value})} className="h-11 rounded-xl" /></div>
                                            <div className="space-y-2"><Label>Bank</Label><Input value={editExpense.bankName || ''} onChange={e => setEditExpense({...editExpense, bankName: e.target.value})} className="h-11 rounded-xl" /></div>
                                            <div className="space-y-2"><Label>Branch</Label><Input value={editExpense.branchName || ''} onChange={e => setEditExpense({...editExpense, branchName: e.target.value})} className="h-11 rounded-xl" /></div>
                                          </div>
                                        )}

                                        {editExpense.paymentMethod === 'Credit/Debit Card' && (
                                          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label>Card Transaction Ref</Label>
                                            <Input value={editExpense.cardReference || ''} onChange={e => setEditExpense({...editExpense, cardReference: e.target.value})} placeholder="e.g. Auth Code or Trans ID" className="h-11 rounded-xl" />
                                          </div>
                                        )}
                                      </div>

                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Payee</Label><Input value={editExpense.payee} onChange={e => setEditExpense({...editExpense, payee: e.target.value})} className="h-11 rounded-xl" /></div>
                                        <div className="space-y-2">
                                          <Label>Status</Label>
                                          <Select value={editExpense.status} onValueChange={v => setEditExpense({...editExpense, status: v})}>
                                            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Pending">Pending</SelectItem></SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-red-500 text-white font-bold text-lg">Save Ledger Changes</Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[2rem]">
                                  <AlertDialogHeader><AlertDialogTitle>Purge Expense Record?</AlertDialogTitle><AlertDialogDescription>This will permanently remove this expenditure from the audit log.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(expense.id)} className="bg-red-600 hover:bg-red-700 rounded-xl border-none">Delete Forever</AlertDialogAction>
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
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
