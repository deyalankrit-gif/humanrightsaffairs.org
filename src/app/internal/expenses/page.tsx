"use client"

import React, { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
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
  Calendar as CalendarIcon, 
  TrendingDown,
  FilterX
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { format, parse } from 'date-fns'

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<any>(null)

  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'Logistics',
    amount: 0,
    date: format(new Date(), 'PPP'),
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
    return query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: expenses, loading: dataLoading } = useCollection(expensesQuery);

  const handleAddExpense = async () => {
    if (!db) return;
    if (!newExpense.title || !newExpense.amount || !newExpense.payee) {
      toast({ variant: "destructive", title: "Required Fields", description: "Title, Amount, and Payee are mandatory." });
      return;
    }
    setIsActionLoading(true)
    addDoc(collection(db, 'expenses'), { ...newExpense, amount: Number(newExpense.amount), createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Expense Logged" })
        setIsAddDialogOpen(false)
        setIsActionLoading(false)
      })
      .catch(() => setIsActionLoading(false))
  }

  const handleDelete = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'expenses', id)).then(() => toast({ title: "Record Deleted" }))
  }

  const handleUpdate = () => {
    if (!db || !editExpense) return;
    setIsActionLoading(true)
    const { id, ...data } = editExpense
    updateDoc(doc(db, 'expenses', id), { ...data, amount: Number(data.amount), updatedAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Ledger Updated" })
        setEditExpense(null)
        setIsEditDialogOpen(false)
        setIsActionLoading(false)
      })
      .catch(() => setIsActionLoading(false))
  }

  const parseExpenseDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      return parse(dateStr, "PPP", new Date());
    } catch {
      return undefined;
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const expenseCategories = ["Salaries", "Rent", "Utility", "Legal Fees", "Logistics", "Printing", "Travel", "Relief Aid", "Other"]
  const paymentMethods = ["Cash", "Bank Transfer", "UPI", "Cheque", "Credit/Debit Card"]

  const filtered = (expenses || []).filter((e: any) => {
    const matchesSearch = e.title?.toLowerCase().includes(search.toLowerCase()) || e.payee?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  })

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-red-500/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1"><TrendingDown className="text-red-400 w-8 h-8" /><h1 className="text-3xl font-headline font-bold">Organizational <span className="text-red-500 italic">Expenses</span></h1></div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild><Button size="sm" className="bg-red-500 text-white font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg"><Plus className="w-4 h-4" /> Log Expense</Button></DialogTrigger>
            <DialogContent className="max-w-xl rounded-3xl max-h-[90vh] overflow-y-auto">
               <DialogHeader><DialogTitle>Record Expense</DialogTitle></DialogHeader>
               <div className="space-y-4 py-4">
                 <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Expense Title</Label><Input value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} /></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Category</Label>
                      <Select value={newExpense.category} onValueChange={(val: any) => setNewExpense({...newExpense, category: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent position="popper" className="z-[1000001]">{expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Date</Label>
                       <Popover>
                        <PopoverTrigger asChild><Button variant="outline" className="w-full h-10 rounded-lg">{newExpense.date}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[1000002]" align="start"><Calendar mode="single" selected={parseExpenseDate(newExpense.date)} onSelect={(date) => setNewExpense({...newExpense, date: date ? format(date, "PPP") : ''})} initialFocus /></PopoverContent>
                      </Popover>
                    </div>
                 </div>
                 <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Payment Channel</Label>
                    <Select value={newExpense.paymentMethod} onValueChange={(val: any) => setNewExpense({...newExpense, paymentMethod: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent position="popper" className="z-[1000001]">{paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>
               </div>
               <DialogFooter><Button onClick={handleAddExpense} disabled={isActionLoading} className="w-full h-11 rounded-xl bg-red-500 mt-4 text-white">Commit to Ledger</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-10 z-30 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent position="popper" className="z-[1000001]"><SelectItem value="All">All Categories</SelectItem>{expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => { setSearch(''); setCategoryFilter('All'); }}><FilterX className="w-4 h-4" /></Button>
          </div>
          <Input placeholder="Search records..." className="max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((expense: any) => (
                <Card key={expense.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-5 bg-slate-50 dark:bg-slate-800 md:w-44 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                         <p className="text-2xl font-headline font-bold text-primary dark:text-white leading-none mb-2">₹{expense.amount?.toLocaleString()}</p>
                         <Badge className={cn("text-[8px] font-bold px-2 py-0.5 uppercase", expense.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500')}>{expense.status}</Badge>
                      </div>
                      <div className="flex-1 p-5 flex items-center justify-between">
                        <div>
                             <h3 className="text-lg font-bold text-primary dark:text-white leading-tight">{expense.title}</h3>
                             <p className="text-xs text-slate-500">{expense.payee} • {expense.date}</p>
                        </div>
                        <div className="flex gap-2">
                           <Button onClick={() => { setEditExpense(expense); setIsEditDialogOpen(true); }} variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold"><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                           <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)} className="h-8 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></Button>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modify Expense Record</DialogTitle></DialogHeader>
          {editExpense && (
            <div className="space-y-4 py-4">
              <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Expense Title</Label><Input value={editExpense.title} onChange={e => setEditExpense({...editExpense, title: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Category</Label>
                  <Select value={editExpense.category} onValueChange={(val: any) => setEditExpense({...editExpense, category: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent position="popper" className="z-[1000001]">{expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Status</Label>
                  <Select value={editExpense.status} onValueChange={(val: any) => setEditExpense({...editExpense, status: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent position="popper" className="z-[1000001]"><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Pending">Pending</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-11 rounded-xl bg-primary text-primary-foreground">Commit Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  )
}
