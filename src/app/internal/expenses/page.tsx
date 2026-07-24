"use client"

import React, { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, deleteDoc, doc, updateDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore'
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
  Calendar as CalendarIcon, 
  TrendingDown,
  FilterX,
  ShieldCheck,
  X
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
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<any>(null)

  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'Logistics',
    amount: '',
    date: format(new Date(), 'PPP'),
    payee: '',
    description: '',
    paymentMethod: 'Bank Transfer',
    status: 'Paid'
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
    if (!db || !user) return;
    if (!newExpense.title || !newExpense.amount || !newExpense.payee) {
      toast({ variant: "destructive", title: "Validation Error" });
      return;
    }
    
    setIsActionLoading(true)
    const amountNum = Number(newExpense.amount);
    const voucherNo = `E${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Log to Dedicated Expenses Collection
      await addDoc(collection(db, 'expenses'), { 
        ...newExpense, 
        amount: amountNum, 
        createdAt: serverTimestamp() 
      });

      // 2. Log to General Ledger (finance_transactions)
      await addDoc(collection(db, 'finance_transactions'), {
        voucherNo,
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'Expense',
        account: newExpense.category,
        amount: amountNum,
        paymentMethod: newExpense.paymentMethod.replace(' Transfer', ''),
        particulars: `${newExpense.title} - ${newExpense.payee}`,
        status: 'Approved',
        createdAt: serverTimestamp(),
        createdBy: user.email
      });

      // 3. Sync with Global Summary
      const summaryRef = doc(db, 'finance_summary', 'state');
      await updateDoc(summaryRef, {
        totalExpense: increment(amountNum),
        [newExpense.paymentMethod === 'Bank Transfer' ? 'bankBalance' : 'cashInHand']: increment(-amountNum)
      });

      toast({ title: "Expense Synchronized", description: "Record committed to ledger and treasury state." })
      setNewExpense({ title: '', category: 'Logistics', amount: '', date: format(new Date(), 'PPP'), payee: '', description: '', paymentMethod: 'Bank Transfer', status: 'Paid' })
      setIsAddDialogOpen(false)
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Error" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'expenses', id)).then(() => toast({ title: "Record Deleted" }))
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>

  const expenseCategories = ["Salaries", "Rent", "Utility", "Legal Fees", "Logistics", "Printing", "Travel", "Relief Aid", "Other"]
  const paymentMethods = ["Cash", "Bank Transfer", "UPI", "Cheque"]

  const filtered = (expenses || []).filter((e: any) => {
    const matchesSearch = e.title?.toLowerCase().includes(search.toLowerCase()) || e.payee?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  })

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-red-500/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-red-500/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Ledger Synchronized
             </div>
             <h1 className="text-3xl font-headline font-bold">Organizational <span className="text-red-500 italic">Expenses</span></h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild><Button size="sm" className="bg-red-500 text-white font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg hover:bg-red-600 transition-colors"><Plus className="w-4 h-4" /> Log & Sync Expense</Button></DialogTrigger>
            <DialogContent className="max-w-xl rounded-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
               <DialogHeader className="relative">
                  <div className="absolute right-0 top-0">
                     <DialogClose asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                         <X className="w-4 h-4" />
                       </Button>
                     </DialogClose>
                  </div>
                  <DialogTitle>Record Real-Time Expense</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 py-4">
                 <div className="grid md:grid-cols-2 gap-4">
                   <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Expense Title</Label><Input value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} placeholder="e.g. Office Supplies" /></div>
                   <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Payee / Vendor</Label><Input value={newExpense.payee} onChange={e => setNewExpense({...newExpense, payee: e.target.value})} placeholder="Entity Name" /></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Category</Label>
                      <Select value={newExpense.category} onValueChange={(val: any) => setNewExpense({...newExpense, category: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent position="popper" className="z-[1000001] bg-white">{expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Amount (₹)</Label><Input type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} placeholder="0.00" /></div>
                 </div>
                 <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Payment Channel</Label>
                    <Select value={newExpense.paymentMethod} onValueChange={(val: any) => setNewExpense({...newExpense, paymentMethod: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent position="popper" className="z-[1000001] bg-white">{paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>
               </div>
               <DialogFooter><Button onClick={handleAddExpense} disabled={isActionLoading} className="w-full h-11 rounded-xl bg-red-600 mt-4 text-white hover:bg-red-700 font-bold transition-all">{isActionLoading ? <Loader2 className="animate-spin" /> : "Commit to Global Ledger"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-10 z-30 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent position="popper" className="z-[1000001] bg-white"><SelectItem value="All">All Categories</SelectItem>{expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => { setSearch(''); setCategoryFilter('All'); }} className="hover:bg-slate-100"><FilterX className="w-4 h-4" /></Button>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search records..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-4">
            {filtered.map((expense: any) => (
              <Card key={expense.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch">
                    <div className="p-5 bg-slate-50 dark:bg-slate-800 md:w-44 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                       <p className="text-2xl font-headline font-bold text-primary dark:text-white leading-none mb-2">₹{expense.amount?.toLocaleString()}</p>
                       <Badge className="text-[8px] font-bold px-2 py-0.5 uppercase bg-emerald-500 text-white">Live Sync</Badge>
                    </div>
                    <div className="flex-1 p-5 flex items-center justify-between">
                      <div>
                           <h3 className="text-lg font-bold text-primary dark:text-white leading-tight">{expense.title}</h3>
                           <p className="text-[10px] font-bold text-slate-500 uppercase">{expense.payee} • {expense.category}</p>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)} className="h-8 w-8 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
