
"use client"

import React, { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, orderBy, deleteDoc, doc, updateDoc, addDoc, setDoc, serverTimestamp, increment } from 'firebase/firestore'
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
  X,
  Check,
  Settings2
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
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null)
  const [editingCategoryValue, setEditingCategoryValue] = useState('')

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

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'expenses', 'settings');
  }, [db]);

  const { data: settingsData } = useDoc(settingsRef);

  const expenseCategories = useMemo(() => {
    const defaultCats = ["Salaries", "Rent", "Utility", "Legal Fees", "Logistics", "Printing", "Travel", "Relief Aid", "Other"];
    const custom = (settingsData as any)?.customCategories || [];
    return Array.from(new Set([...defaultCats, ...custom]));
  }, [settingsData]);

  const expensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: expenses, loading: dataLoading } = useCollection(expensesQuery);

  const handleAddCategory = async () => {
    if (!newCategoryLabel.trim() || !settingsRef) return;
    const label = newCategoryLabel.trim();
    if (expenseCategories.includes(label)) {
      toast({ variant: "destructive", title: "Duplicate Category", description: "This category already exists in the registry." });
      return;
    }
    const updatedCustom = [...((settingsData as any)?.customCategories || []), label];
    try {
      await setDoc(settingsRef, { customCategories: updatedCustom, updatedAt: serverTimestamp() }, { merge: true });
      setNewCategoryLabel('');
      toast({ title: "Category Established" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  }

  const handleUpdateCategory = async () => {
    if (editingCategoryIndex === null || !editingCategoryValue.trim() || !settingsRef) return;
    const updatedCustom = [...((settingsData as any)?.customCategories || [])];
    updatedCustom[editingCategoryIndex] = editingCategoryValue.trim();
    try {
      await setDoc(settingsRef, { customCategories: updatedCustom, updatedAt: serverTimestamp() }, { merge: true });
      setEditingCategoryIndex(null);
      setEditingCategoryValue('');
      toast({ title: "Category Updated" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  }

  const handleDeleteCategory = async (idx: number) => {
    if (!settingsRef) return;
    const updatedCustom = [...((settingsData as any)?.customCategories || [])];
    updatedCustom.splice(idx, 1);
    try {
      await setDoc(settingsRef, { customCategories: updatedCustom, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "Category Purged" });
    } catch (e) {
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  }

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
      await addDoc(collection(db, 'expenses'), { 
        ...newExpense, 
        amount: amountNum, 
        createdAt: serverTimestamp() 
      });

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
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-xl rounded-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden border-none shadow-2xl">
               <DialogHeader className="relative">
                  <div className="absolute right-0 top-0">
                     <DialogClose asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-red-500">
                         <X className="w-4 h-4" />
                       </Button>
                     </DialogClose>
                  </div>
                  <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Record Real-Time Expense</DialogTitle>
               </DialogHeader>
               
               <div className="space-y-6 py-4">
                 <div className="grid md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Expense Title *</Label>
                     <Input value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} placeholder="e.g. Office Supplies" className="h-11 rounded-xl" />
                   </div>
                   <div className="space-y-1">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Payee / Vendor *</Label>
                     <Input value={newExpense.payee} onChange={e => setNewExpense({...newExpense, payee: e.target.value})} placeholder="Entity Name" className="h-11 rounded-xl" />
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Category *</Label>
                      <Select value={newExpense.category} onValueChange={(val: any) => setNewExpense({...newExpense, category: val})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent position="popper" className="z-[1000001] bg-white max-h-60">
                          {expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Amount (₹) *</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} placeholder="0.00" className="h-11 pl-8 rounded-xl font-bold" />
                      </div>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Payment Channel</Label>
                    <Select value={newExpense.paymentMethod} onValueChange={(val: any) => setNewExpense({...newExpense, paymentMethod: val})}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent position="popper" className="z-[1000001] bg-white">
                        {paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                 </div>

                 {/* Taxonomy Management Section */}
                 <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-5 shadow-inner">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase text-accent tracking-[0.15em] flex items-center gap-2">
                        <Settings2 className="w-3 h-3" /> Category Management Hub
                      </Label>
                      <p className="text-[8px] text-slate-400 font-bold uppercase leading-tight">Define, modify or purge institutional expenditure categories.</p>
                    </div>
                    
                    <div className="flex gap-2">
                       <div className="relative flex-1">
                          <Input 
                            placeholder={editingCategoryIndex !== null ? "Updating label..." : "New category name..."} 
                            value={editingCategoryIndex !== null ? editingCategoryValue : newCategoryLabel} 
                            onChange={e => editingCategoryIndex !== null ? setEditingCategoryValue(e.target.value) : setNewCategoryLabel(e.target.value)}
                            className={cn(
                              "h-10 text-xs rounded-xl bg-white dark:bg-slate-950",
                              editingCategoryIndex !== null ? "border-emerald-500 ring-1 ring-emerald-500/20" : "border-slate-200"
                            )}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                editingCategoryIndex !== null ? handleUpdateCategory() : handleAddCategory();
                              }
                            }}
                          />
                          {editingCategoryIndex !== null && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                               <Badge className="bg-emerald-500 text-[6px] font-black h-4 uppercase">Edit Mode</Badge>
                            </div>
                          )}
                       </div>
                       
                       {editingCategoryIndex !== null ? (
                         <div className="flex gap-1 shrink-0">
                           <Button onClick={handleUpdateCategory} size="sm" className="h-10 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"><Check className="w-4 h-4"/></Button>
                           <Button onClick={() => { setEditingCategoryIndex(null); setEditingCategoryValue(''); }} size="sm" variant="outline" className="h-10 px-3 rounded-xl border-slate-200"><X className="w-4 h-4 text-slate-400"/></Button>
                         </div>
                       ) : (
                         <Button onClick={handleAddCategory} size="sm" className="h-10 px-4 rounded-xl bg-accent text-primary font-bold shadow-sm" disabled={!newCategoryLabel.trim()}>
                           <Plus className="w-4 h-4" />
                         </Button>
                       )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                       {((settingsData as any)?.customCategories || []).map((cat: string, idx: number) => (
                         <Badge key={idx} variant="outline" className={cn(
                           "text-[9px] font-bold px-3 py-1 flex items-center gap-2 h-8 rounded-xl shadow-sm transition-all group",
                           editingCategoryIndex === idx ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white dark:bg-slate-800 hover:border-accent"
                         )}>
                           <span>{cat}</span>
                           <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingCategoryIndex(idx); setEditingCategoryValue(cat); }} 
                                className="hover:text-blue-600 transition-colors"
                                title="Edit Label"
                              >
                                <Edit className="w-3 h-3"/>
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button 
                                    className="hover:text-red-600 transition-colors"
                                    title="Purge Category"
                                  >
                                    <Trash2 className="w-3 h-3"/>
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-3xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>You are about to permanently delete this record. This action may permanently remove related data. This action cannot be undone. Please confirm that you want to continue.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCategory(idx)} className="bg-red-600 hover:bg-red-700 rounded-xl">Delete Permanently</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                           </div>
                         </Badge>
                       ))}
                       {(!settingsData || !((settingsData as any)?.customCategories?.length)) && (
                         <div className="w-full text-center py-4 bg-white/40 dark:bg-slate-950/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                           <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">No custom categories established.</p>
                         </div>
                       )}
                    </div>
                 </div>
               </div>

               <DialogFooter>
                 <Button onClick={handleAddExpense} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-red-600 text-white hover:bg-red-700 font-bold text-lg shadow-xl shadow-red-600/20 transition-all">
                   {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit to Global Ledger"}
                 </Button>
               </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none shadow-sm"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent position="popper" className="z-[1000001] bg-white max-h-60">
                <SelectItem value="All">All Categories</SelectItem>
                {expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => { setSearch(''); setCategoryFilter('All'); }} className="h-11 w-11 rounded-xl hover:bg-slate-100"><FilterX className="w-5 h-5 text-slate-400" /></Button>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search records, payees or titles..." className="pl-10 h-11 rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-950 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 max-w-5xl mx-auto">
            {filtered.map((expense: any) => (
              <Card key={expense.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch">
                    <div className={cn("p-6 md:w-48 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/50")}>
                       <p className="text-2xl font-headline font-bold text-primary dark:text-white leading-none mb-2">₹{expense.amount?.toLocaleString()}</p>
                       <Badge className="text-[8px] font-black px-2.5 py-0.5 uppercase bg-emerald-500 text-white tracking-widest border-none">Live Sync</Badge>
                       <p className="text-[8px] font-bold text-slate-400 uppercase mt-3 tracking-widest">{expense.date}</p>
                    </div>
                    <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-1 text-center md:text-left flex-1">
                           <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{expense.title}</h3>
                           <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                             <span className="flex items-center gap-1.5"><TrendingDown className="w-3 h-3 text-red-500" /> {expense.payee}</span>
                             <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-accent" /> {expense.category}</span>
                             <span className="flex items-center gap-1.5"><Settings2 className="w-3 h-3 text-blue-500" /> {expense.paymentMethod}</span>
                           </div>
                      </div>
                      <div className="flex gap-2">
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <button className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl flex items-center justify-center"><Trash2 className="w-4.5 h-4.5" /></button>
                           </AlertDialogTrigger>
                           <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                             <AlertDialogHeader>
                               <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                               <AlertDialogDescription>You are about to permanently delete this record. This action may permanently remove related data. This action cannot be undone. Please confirm that you want to continue.</AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                               <AlertDialogAction onClick={() => handleDelete(expense.id)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11">Delete Permanently</AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 opacity-40">
                 <TrendingDown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                 <p className="text-sm font-bold uppercase tracking-widest text-slate-400">No matching expense records identified</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
