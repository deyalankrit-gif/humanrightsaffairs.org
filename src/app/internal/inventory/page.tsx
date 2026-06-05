
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
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
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History,
  ShieldCheck,
  Tag,
  Boxes
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

type InventoryItem = {
  id: string
  name: string
  category: string
  unit: string
  currentStock: number
  totalInflow: number
  totalOutflow: number
  lowStockThreshold: number
  lastUpdated: any
  createdAt: any
}

export default function InventoryManagementPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [adjustingItem, setAdjustingItem] = useState<{ item: InventoryItem, type: 'Inflow' | 'Outflow' } | null>(null)
  const [adjustmentAmount, setAdjustmentAmount] = useState('0')
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Stationery',
    unit: 'pcs',
    currentStock: 0,
    lowStockThreshold: 5,
    totalInflow: 0,
    totalOutflow: 0
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const inventoryQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'inventory'), orderBy('name', 'asc'));
  }, [db, user]);

  const { data: inventory, loading: dataLoading } = useCollection(inventoryQuery);

  const handleAddItem = async () => {
    if (!db) return;
    if (!newItem.name.trim()) {
      toast({ variant: "destructive", title: "Missing Name", description: "Please provide a name for the material." });
      return;
    }

    setIsActionLoading(true)
    const data = { 
      ...newItem, 
      totalInflow: Number(newItem.currentStock),
      lastUpdated: serverTimestamp(),
      createdAt: serverTimestamp() 
    }

    addDoc(collection(db, 'inventory'), data)
      .then(() => {
        toast({ title: "Item Added", description: `${newItem.name} has been added to inventory.` })
        setNewItem({ name: '', category: 'Stationery', unit: 'pcs', currentStock: 0, lowStockThreshold: 5, totalInflow: 0, totalOutflow: 0 })
        setIsAddDialogOpen(false)
      })
      .finally(() => setIsActionLoading(false))
  }

  const handleAdjustStock = async () => {
    if (!db || !adjustingItem) return;
    const amount = Number(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount" });
      return;
    }

    setIsActionLoading(true)
    const { item, type } = adjustingItem
    const newStock = type === 'Inflow' ? item.currentStock + amount : item.currentStock - amount
    
    if (newStock < 0) {
      toast({ variant: "destructive", title: "Insufficient Stock", description: "Cannot record outflow greater than current stock." });
      setIsActionLoading(false)
      return;
    }

    const updates = {
      currentStock: newStock,
      totalInflow: type === 'Inflow' ? item.totalInflow + amount : item.totalInflow,
      totalOutflow: type === 'Outflow' ? item.totalOutflow + amount : item.totalOutflow,
      lastUpdated: serverTimestamp()
    }

    updateDoc(doc(db, 'inventory', item.id), updates)
      .then(() => {
        toast({ title: "Stock Updated", description: `Recorded ${type} of ${amount} ${item.unit}.` })
        setAdjustingItem(null)
        setAdjustmentAmount('0')
      })
      .finally(() => setIsActionLoading(false))
  }

  const handleDeleteItem = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'inventory', id))
      .then(() => toast({ title: "Item Removed" }))
  }

  const handleUpdateItem = async () => {
    if (!db || !editItem) return;
    setIsActionLoading(true)
    const { id, ...data } = editItem
    updateDoc(doc(db, 'inventory', id), { ...data, lastUpdated: serverTimestamp() })
      .then(() => {
        toast({ title: "Record Modified" })
        setEditItem(null)
      })
      .finally(() => setIsActionLoading(false))
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (inventory as InventoryItem[] || []).filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.category.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    totalItems: (inventory || []).length,
    lowStock: (inventory || []).filter((i: any) => i.currentStock <= i.lowStockThreshold).length,
    categories: Array.from(new Set((inventory || []).map((i: any) => i.category))).length
  }

  const categories = ["Stationery", "Relief Kits", "Advocacy Manuals", "Electronics", "Furniture", "Medical Supplies", "Other"]

  // Safe numeric conversion for UI display
  const numericAdjustment = Number(adjustmentAmount) || 0;
  const projectedBalance = adjustingItem 
    ? (adjustingItem.type === 'Inflow' 
        ? (adjustingItem.item.currentStock + numericAdjustment) 
        : (adjustingItem.item.currentStock - numericAdjustment))
    : 0;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminNavbar />

      <section className="pt-32 pb-12 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-3 h-3" /> Supply Governance
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Material <span className="text-accent italic">Inventory</span></h1>
              <p className="text-slate-400">Logistics and supply chain management for the Human Rights Affairs Trust.</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-8 flex gap-2 hover:bg-accent/90 shadow-xl shadow-accent/20">
                  <Plus className="w-5 h-5" /> New Material Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl">
                <DialogHeader><DialogTitle className="text-2xl font-headline font-bold">Add Supply Item</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Material Name</Label>
                    <Input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Legal Aid Brochures" className="h-12 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newItem.category} onValueChange={v => setNewItem({...newItem, category: v})}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Unit of Measure</Label>
                      <Input value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} placeholder="e.g. pcs, kg" className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Opening Stock</Label>
                      <Input type="number" value={newItem.currentStock} onChange={e => setNewItem({...newItem, currentStock: Number(e.target.value)})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Low Stock Threshold</Label>
                      <Input type="number" value={newItem.lowStockThreshold} onChange={e => setNewItem({...newItem, lowStockThreshold: Number(e.target.value)})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddItem} disabled={isActionLoading} className="w-full h-12 rounded-xl bg-accent text-primary font-bold">
                    {isActionLoading ? <Loader2 className="animate-spin" /> : "Establish Record"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[72px] md:top-[84px] z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                 <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl"><Boxes className="w-5 h-5 text-accent" /></div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total SKUs</p>
                   <p className="text-xl font-bold">{stats.totalItems}</p>
                 </div>
               </div>
               <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>
               <div className="flex items-center gap-3">
                 <div className={cn("p-3 rounded-2xl", stats.lowStock > 0 ? "bg-red-50 dark:bg-red-950/30" : "bg-slate-50 dark:bg-slate-800")}>
                   <AlertCircle className={cn("w-5 h-5", stats.lowStock > 0 ? "text-red-500 animate-pulse" : "text-slate-400")} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Critical Alert</p>
                   <p className={cn("text-xl font-bold", stats.lowStock > 0 ? "text-red-500" : "")}>{stats.lowStock} Items</p>
                 </div>
               </div>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search materials or categories..." 
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
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((item) => {
                const isLowStock = item.currentStock <= (item.lowStockThreshold || 0)
                return (
                  <Card key={item.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className={cn(
                          "p-8 md:w-56 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0",
                          isLowStock ? "bg-red-50 dark:bg-red-950/20" : "bg-slate-50 dark:bg-slate-800"
                        )}>
                           <div className="relative mb-4">
                              <Package className={cn("w-10 h-10", isLowStock ? "text-red-500" : "text-accent")} />
                              {isLowStock && <AlertCircle className="absolute -top-1 -right-1 w-5 h-5 text-red-600 animate-bounce" />}
                           </div>
                           <Badge variant="outline" className={cn(
                             "font-bold uppercase tracking-widest text-[9px] px-3 py-1 mb-2",
                             isLowStock ? "border-red-500 text-red-500" : "border-accent text-accent"
                           )}>
                             {item.category}
                           </Badge>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Supply</p>
                           <p className={cn("text-3xl font-headline font-bold", isLowStock ? "text-red-600" : "text-primary dark:text-white")}>
                             {item.currentStock} <span className="text-xs font-sans text-slate-400 uppercase tracking-tighter">{item.unit}</span>
                           </p>
                        </div>
                        
                        <div className="flex-1 p-8 grid lg:grid-cols-4 gap-8 items-center">
                          <div className="lg:col-span-2 space-y-2">
                             <h3 className="text-2xl font-headline font-bold text-primary dark:text-white group-hover:text-accent transition-colors leading-none">{item.name}</h3>
                             <div className="flex flex-wrap gap-4 pt-4">
                                <div className="space-y-0.5">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1"><ArrowDownLeft className="w-2.5 h-2.5 text-emerald-500" /> Total Inflow</p>
                                   <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.totalInflow} {item.unit}</p>
                                </div>
                                <div className="space-y-0.5">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1"><ArrowUpRight className="w-2.5 h-2.5 text-red-500" /> Total Outflow</p>
                                   <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.totalOutflow} {item.unit}</p>
                                </div>
                                <div className="space-y-0.5">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1"><History className="w-2.5 h-2.5 text-accent" /> Last Movement</p>
                                   <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                     {item.lastUpdated?.toDate ? item.lastUpdated.toDate().toLocaleDateString() : 'N/A'}
                                   </p>
                                </div>
                             </div>
                          </div>

                          <div className="flex flex-col gap-2">
                             <Button 
                               onClick={() => setAdjustingItem({ item, type: 'Inflow' })}
                               className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 flex gap-2"
                             >
                               <ArrowDownLeft className="w-4 h-4" /> Record Inflow
                             </Button>
                             <Button 
                               onClick={() => setAdjustingItem({ item, type: 'Outflow' })}
                               variant="outline" 
                               className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 font-bold h-11 flex gap-2"
                             >
                               <ArrowUpRight className="w-4 h-4" /> Record Outflow
                             </Button>
                          </div>

                          <div className="flex items-center justify-end gap-3">
                             <Dialog>
                               <DialogTrigger asChild>
                                 <Button onClick={() => setEditItem(item)} variant="outline" size="icon" className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-accent hover:text-primary"><Edit className="w-4 h-4" /></Button>
                               </DialogTrigger>
                               <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl">
                                 <DialogHeader><DialogTitle>Edit Material Record</DialogTitle></DialogHeader>
                                 {editItem && (
                                   <div className="space-y-4 py-4">
                                     <div className="space-y-1"><Label>Material Name</Label><Input value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className="h-12 rounded-xl" /></div>
                                     <div className="grid grid-cols-2 gap-4">
                                       <div className="space-y-1">
                                          <Label>Category</Label>
                                          <Select value={editItem.category} onValueChange={v => setEditItem({...editItem, category: v})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                          </Select>
                                       </div>
                                       <div className="space-y-1"><Label>Unit</Label><Input value={editItem.unit} onChange={e => setEditItem({...editItem, unit: e.target.value})} className="h-12 rounded-xl" /></div>
                                     </div>
                                     <div className="space-y-1"><Label>Low Stock Alert Threshold</Label><Input type="number" value={editItem.lowStockThreshold} onChange={e => setEditItem({...editItem, lowStockThreshold: Number(e.target.value)})} className="h-12 rounded-xl" /></div>
                                     <Button onClick={handleUpdateItem} disabled={isActionLoading} className="w-full h-12 rounded-xl mt-4 bg-accent text-primary font-bold">Commit Changes</Button>
                                   </div>
                                 )}
                               </DialogContent>
                             </Dialog>

                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent className="rounded-[2rem]">
                                 <AlertDialogHeader><AlertDialogTitle>Delete Supply Entry?</AlertDialogTitle><AlertDialogDescription>This will remove all historical inflow/outflow data for this material. Action is irreversible.</AlertDialogDescription></AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => handleDeleteItem(item.id)} className="bg-red-500 hover:bg-red-600 rounded-xl border-none">Confirm Delete</AlertDialogAction>
                                 </AlertDialogFooter>
                               </AlertDialogContent>
                             </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {filtered.length === 0 && (
                <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                   <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                   </div>
                   <h3 className="text-2xl font-headline font-bold text-primary dark:text-white">No matching materials</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Adjust your search or define a new material entry.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!adjustingItem} onOpenChange={(open) => !open && setAdjustingItem(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl">
           <DialogHeader>
             <DialogTitle className={cn("text-2xl font-headline font-bold", adjustingItem?.type === 'Inflow' ? "text-emerald-600" : "text-red-600")}>
               Record {adjustingItem?.type}
             </DialogTitle>
             <DialogDescription>
               Updating stock for <strong>{adjustingItem?.item.name}</strong>.
             </DialogDescription>
           </DialogHeader>
           <div className="py-6 space-y-4">
             <div className="space-y-2 text-center">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Adjustment Quantity ({adjustingItem?.item.unit})</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={adjustmentAmount} 
                    onChange={e => setAdjustmentAmount(e.target.value)}
                    className="h-20 text-center text-4xl font-headline font-bold rounded-2xl border-none bg-slate-50 dark:bg-slate-800"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    {adjustingItem?.type === 'Inflow' ? <ArrowDownLeft className="w-8 h-8 text-emerald-500 opacity-20" /> : <ArrowUpRight className="w-8 h-8 text-red-500 opacity-20" />}
                  </div>
                </div>
             </div>
             
             <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Current Inventory</span>
                <span className="text-lg font-bold">{adjustingItem?.item.currentStock || 0}</span>
             </div>
             
             <div className={cn("p-4 rounded-2xl border flex justify-between items-center", adjustingItem?.type === 'Inflow' ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100")}>
                <span className={cn("text-xs font-bold uppercase", adjustingItem?.type === 'Inflow' ? "text-emerald-700" : "text-red-700")}>Projected Balance</span>
                <span className={cn("text-lg font-bold", adjustingItem?.type === 'Inflow' ? "text-emerald-700" : "text-red-700")}>
                  {projectedBalance}
                </span>
             </div>
           </div>
           <DialogFooter>
             <Button 
               onClick={handleAdjustStock} 
               disabled={isActionLoading || Number(adjustmentAmount) <= 0} 
               className={cn("w-full h-14 rounded-2xl font-bold text-lg", adjustingItem?.type === 'Inflow' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600")}
             >
               {isActionLoading ? <Loader2 className="animate-spin" /> : "Authorize Movement"}
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
