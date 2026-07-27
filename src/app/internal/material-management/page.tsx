"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  ShieldCheck, 
  Boxes,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Tag,
  Archive,
  ArrowRight,
  RefreshCw,
  X,
  PlusCircle,
  MinusCircle,
  Save,
  CheckCircle2
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
import { format } from 'date-fns'

type Material = {
  id: string
  name: string
  sku: string
  category: string
  unit: string
  currentStock: number
  lowStockThreshold: number
  status: "Available" | "Low Stock" | "Out of Stock"
  location: string
  lastProcured?: string
  notes?: string
  createdAt: any
}

const CATEGORIES = ["Stationery", "Relief Kits", "Advocacy Manuals", "Electronics", "Uniforms", "Medical Supplies", "Other"];
const UNITS = ["pcs", "kg", "liters", "packs", "boxes", "meters"];

export default function MaterialManagementPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [adjustmentMode, setAdjustmentMode] = useState<'Inflow' | 'Outflow' | null>(null)
  const [adjustmentAmount, setAdjustmentAmount] = useState('0')

  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: 'Relief Kits',
    unit: 'pcs',
    currentStock: 0,
    lowStockThreshold: 10,
    location: 'National HQ',
    notes: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const materialsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: materials, loading: dataLoading } = useCollection(materialsQuery);

  const handleAddItem = async () => {
    if (!db) return;
    if (!newItem.name.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Material name is mandatory." });
      return;
    }

    setIsActionLoading(true)
    const sku = newItem.sku || `MAT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    const data = { 
      ...newItem, 
      sku,
      status: newItem.currentStock <= 0 ? "Out of Stock" : newItem.currentStock <= newItem.lowStockThreshold ? "Low Stock" : "Available",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    try {
      await addDoc(collection(db, 'materials'), data)
      toast({ title: "Material Established", description: "Record committed to national registry." })
      setNewItem({ name: '', sku: '', category: 'Relief Kits', unit: 'pcs', currentStock: 0, lowStockThreshold: 10, location: 'National HQ', notes: '' })
      setIsAddDialogOpen(false)
    } catch (e) {
      toast({ variant: "destructive", title: "Archival Error" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleStockAdjustment = async () => {
    if (!db || !selectedMaterial || !adjustmentMode) return;
    const amount = parseInt(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsActionLoading(true)
    const delta = adjustmentMode === 'Inflow' ? amount : -amount;
    const newStock = Math.max(0, selectedMaterial.currentStock + delta);
    const newStatus = newStock <= 0 ? "Out of Stock" : newStock <= selectedMaterial.lowStockThreshold ? "Low Stock" : "Available";

    try {
      await updateDoc(doc(db, 'materials', selectedMaterial.id), {
        currentStock: newStock,
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastProcured: adjustmentMode === 'Inflow' ? format(new Date(), 'yyyy-MM-dd') : selectedMaterial.lastProcured
      });
      toast({ title: "Inventory Reconciled", description: `Updated ${selectedMaterial.name} stock level.` })
      setAdjustmentMode(null)
      setAdjustmentAmount('0')
    } catch (e) {
      toast({ variant: "destructive", title: "Reconciliation Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'materials', id)).then(() => toast({ title: "Record Purged" }));
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (materials as Material[] || []).filter(m => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) || (m.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  })

  const stats = {
    totalItems: (materials || []).length,
    lowStock: (materials || []).filter((m: any) => m.status === 'Low Stock' || m.status === 'Out of Stock').length,
    totalUnits: (materials || []).reduce((acc: number, curr: any) => acc + Number(curr.currentStock || 0), 0)
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Logistical Governance
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Material <span className="text-accent italic">Management</span></h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Enterprise Supply Chain & Inventory Terminal</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all transform hover:scale-105">
                  <Plus className="w-4 h-4" /> Add Institutional Material
                </Button>
              </DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl [&>button]:hidden">
                <DialogHeader className="relative">
                   <div className="absolute right-0 top-0">
                      <DialogClose asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </Button>
                      </DialogClose>
                   </div>
                   <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Registry Entry Protocol</DialogTitle>
                   <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Establish New Logistical SKU</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Material Designation *</Label>
                    <Input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Constitutional Awareness Manual (Bengali)" className="h-11 rounded-xl" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</Label>
                      <Select value={newItem.category} onValueChange={(val: any) => setNewItem({...newItem, category: val})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent position="popper" className="z-[1000001] bg-white">
                          {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock SKU / ID</Label>
                      <Input value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value.toUpperCase()})} placeholder="Leave blank for Auto" className="h-11 rounded-xl font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unit of Measure</Label>
                      <Select value={newItem.unit} onValueChange={(val: any) => setNewItem({...newItem, unit: val})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent position="popper" className="z-[1000001] bg-white">
                          {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Safety Threshold</Label>
                      <Input type="number" value={newItem.lowStockThreshold} onChange={e => setNewItem({...newItem, lowStockThreshold: Number(e.target.value)})} className="h-11 rounded-xl" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Initial Physical Stock</Label>
                      <Input type="number" value={newItem.currentStock} onChange={e => setNewItem({...newItem, currentStock: Number(e.target.value)})} className="h-11 rounded-xl font-black text-emerald-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nodal Location</Label>
                      <Input value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} placeholder="e.g. State Office (WB)" className="h-11 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Internal Audit Notes</Label>
                    <Textarea value={newItem.notes} onChange={e => setNewItem({...newItem, notes: e.target.value})} placeholder="Condition or specific deployment details..." className="rounded-xl min-h-[80px]" />
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={handleAddItem} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary transition-all shadow-xl shadow-primary/20">
                    {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit Record to Memory"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <section className="py-8 bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-none shadow-sm rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 flex items-center gap-4 group hover:bg-slate-100 transition-colors">
                 <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                    <Archive className="w-6 h-6" />
                 </div>
                 <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total SKUs</p>
                    <p className="text-2xl font-headline font-bold text-primary dark:text-white leading-none">{stats.totalItems}</p>
                 </div>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 p-5 flex items-center gap-4 group hover:bg-emerald-50 transition-colors">
                 <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <Boxes className="w-6 h-6" />
                 </div>
                 <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Units Available</p>
                    <p className="text-2xl font-headline font-bold text-emerald-700 dark:text-emerald-400 leading-none">{stats.totalUnits}</p>
                 </div>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl bg-red-50 dark:bg-red-950/20 p-5 flex items-center gap-4 group hover:bg-red-50 transition-colors">
                 <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 shrink-0">
                    <AlertCircle className="w-6 h-6" />
                 </div>
                 <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-red-600 tracking-widest">Low Stock</p>
                    <p className="text-2xl font-headline font-bold text-red-700 dark:text-red-400 leading-none">{stats.lowStock}</p>
                 </div>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl bg-slate-900 text-white p-5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <RefreshCw className="w-6 h-6 animate-spin-slow" />
                 </div>
                 <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Sync Status</p>
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-tighter">Live Database</p>
                 </div>
              </Card>
           </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button onClick={() => setCategoryFilter('All')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", categoryFilter === 'All' ? "bg-accent text-primary shadow-md" : "text-slate-500 hover:bg-slate-200")}>All</button>
              {CATEGORIES.slice(0, 3).map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", categoryFilter === cat ? "bg-accent text-primary shadow-md" : "text-slate-500 hover:bg-slate-200")}>{cat}</button>
              ))}
           </div>
           <div className="relative w-full max-w-lg">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <Input placeholder="Filter by material name or SKU..." className="pl-9 h-11 rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-950 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
           </div>
        </div>
      </section>

      <section className="py-8 container mx-auto px-4 pb-32">
         {dataLoading ? (
           <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
         ) : (
           <div className="grid gap-4">
              {filtered.map((item) => (
                <Card key={item.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                       <div className={cn(
                         "p-6 md:w-56 text-center border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center shrink-0",
                         item.status === 'Out of Stock' ? "bg-red-50 dark:bg-red-950/20" : 
                         item.status === 'Low Stock' ? "bg-amber-50 dark:bg-amber-950/20" : "bg-emerald-50 dark:bg-emerald-950/20"
                       )}>
                          <Badge variant="outline" className={cn(
                            "text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase border-none mb-3",
                            item.status === 'Out of Stock' ? "bg-red-500 text-white" : 
                            item.status === 'Low Stock' ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                          )}>
                            {item.status}
                          </Badge>
                          <p className="text-4xl font-headline font-bold text-primary dark:text-white leading-none">{item.currentStock}</p>
                          <p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">{item.unit}</p>
                       </div>

                       <div className="flex-1 p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
                          <div className="space-y-2 flex-1 min-w-0">
                             <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-bold text-primary dark:text-white leading-tight truncate">{item.name}</h3>
                                <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-[8px] font-mono h-4">{item.sku}</Badge>
                             </div>
                             <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-accent" /> {item.category}</span>
                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" /> {item.location}</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent" /> Last Procurement: {item.lastProcured || 'Initial'}</span>
                             </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                             <Button onClick={() => { setSelectedMaterial(item); setAdjustmentMode('Inflow'); }} variant="outline" className="h-11 rounded-xl border-emerald-100 text-emerald-600 font-bold hover:bg-emerald-50 gap-2">
                                <TrendingUp className="w-4 h-4" /> Inflow
                             </Button>
                             <Button onClick={() => { setSelectedMaterial(item); setAdjustmentMode('Outflow'); }} variant="outline" className="h-11 rounded-xl border-rose-100 text-rose-600 font-bold hover:bg-rose-50 gap-2">
                                <TrendingDown className="w-4 h-4" /> Outflow
                             </Button>
                             <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-11 w-11 text-slate-300 hover:text-red-500 rounded-xl"><Trash2 className="w-4.5 h-4.5" /></Button>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 opacity-40">
                   <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                   <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">Registry Search Yielded Zero Results</p>
                </div>
              )}
           </div>
         )}
      </section>

      {/* Adjustment Dialog */}
      <Dialog open={!!adjustmentMode} onOpenChange={val => !val && setAdjustmentMode(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-8">
           <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                 {adjustmentMode === 'Inflow' ? <PlusCircle className="w-6 h-6 text-emerald-500" /> : <MinusCircle className="w-6 h-6 text-rose-500" />}
                 Stock {adjustmentMode} Update
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                 Adjusting current logistical volume for <strong className="text-primary">{selectedMaterial?.name}</strong>.
              </DialogDescription>
           </DialogHeader>

           <div className="py-8 space-y-6">
              <div className="space-y-2">
                 <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Adjustment Quantity ({selectedMaterial?.unit})</Label>
                 <Input 
                   type="number" 
                   value={adjustmentAmount} 
                   onChange={e => setAdjustmentAmount(e.target.value)}
                   className="h-14 text-center text-4xl font-headline font-bold rounded-2xl border-2 border-slate-100"
                 />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 text-center">
                 <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Projected Outcome</p>
                 <div className="flex items-center justify-center gap-3">
                    <span className="text-sm font-bold text-slate-500">{selectedMaterial?.currentStock}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                    <span className={cn(
                      "text-2xl font-black",
                      adjustmentMode === 'Inflow' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {selectedMaterial && (adjustmentMode === 'Inflow' ? selectedMaterial.currentStock + Number(adjustmentAmount) : Math.max(0, selectedMaterial.currentStock - Number(adjustmentAmount)))}
                    </span>
                 </div>
              </div>
           </div>

           <DialogFooter>
              <Button 
                onClick={handleStockAdjustment} 
                disabled={isActionLoading || Number(adjustmentAmount) <= 0}
                className={cn(
                  "w-full h-14 rounded-2xl font-bold text-lg shadow-xl transition-all",
                  adjustmentMode === 'Inflow' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                )}
              >
                 {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit Stock Change"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
