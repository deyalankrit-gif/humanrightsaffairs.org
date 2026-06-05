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
                          e.payee?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  })

  const totalSpent = filtered.reduce((acc, curr: any) => acc + Number(curr.amount || 0), 0)

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-red-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-red-500/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-red-500/30">
                <TrendingDown className="w-2.5 h-2.5" /> Outflow Ledger
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Organizational <span className="text-red-500 italic">Expenses</span></h1>
              <p className="text-slate-400 text-[11px]">Track all organizational expenditure and operational costs.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-right">
                <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">Total</p>
                <p className="text-xl font-bold text-red-500 leading-none">₹{totalSpent.toLocaleString()}</p>
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-red-500 text-white font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg">
                    <Plus className="w-4 h-4" /> Log Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl rounded-3xl max-h-[90vh] overflow-y-auto">
                   <DialogHeader><DialogTitle>Record Expense</DialogTitle></DialogHeader>
                   <Button onClick={handleAddExpense} disabled={isActionLoading} className="w-full h-11 rounded-xl bg-red-500 mt-4">Commit to Ledger</Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-10 z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36 h-9 rounded-lg text-[11px] font-bold bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="All">All Categories</SelectItem>{expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28 h-9 rounded-lg text-[11px] font-bold bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="All">All Status</SelectItem><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Pending">Pending</SelectItem></SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400" onClick={() => { setSearch(''); setStatusFilter('All'); setCategoryFilter('All'); }}><FilterX className="w-4 h-4" /></Button>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input placeholder="Search records..." className="pl-8 h-9 rounded-lg border-slate-100 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
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
                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Amount</p>
                         <p className="text-2xl font-headline font-bold text-primary dark:text-white leading-none mb-2">₹{expense.amount?.toLocaleString()}</p>
                         <Badge className={cn("text-[8px] font-bold px-2 py-0.5 uppercase rounded-full", expense.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500')}>
                           {expense.status}
                         </Badge>
                      </div>
                      <div className="flex-1 p-5 grid lg:grid-cols-4 gap-6 items-center">
                        <div className="lg:col-span-2 space-y-1">
                             <Badge variant="outline" className="border-red-200 text-red-500 text-[8px] font-bold uppercase px-1.5 py-0">{expense.category}</Badge>
                             <h3 className="text-lg font-headline font-bold text-primary dark:text-white leading-tight">{expense.title}</h3>
                             <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500 mt-1">
                               <span className="flex items-center gap-1"><User className="w-2.5 h-2.5 text-red-500" /> {expense.payee}</span>
                               <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5 text-red-500" /> {expense.date}</span>
                             </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold border-slate-200"><Edit className="w-3 h-3 mr-1" /> Edit</Button>
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

      <Footer />
    </main>
  )
}
