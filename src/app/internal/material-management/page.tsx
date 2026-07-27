"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
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
  Settings2,
  Check
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

const DEFAULT_CATEGORIES = ["Stationery", "Relief Kits", "Advocacy Manuals", "Electronics", "Uniforms", "Medical Supplies", "Other"];
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [adjustmentMode, setAdjustmentMode] = useState<'Inflow' | 'Outflow' | null>(null)
  const [adjustmentAmount, setAdjustmentAmount] = useState('0')

  // Taxonomy Management States
  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null)
  const [editingCategoryValue, setEditingCategoryValue] = useState('')

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

  const [editForm, setEditForm] = useState<Partial<Material>>({})

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  // Taxonomy Source
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'materials', 'settings');
  }, [db]);

  const { data: settingsData } = useDoc(settingsRef);

  const materialCategories = useMemo(() => {
    const custom = (settingsData as any)?.customCategories || [];
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...custom]));
  }, [settingsData]);

  const materialsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: materials, loading: dataLoading } = useCollection(materialsQuery);

  const handleAddCategory = async () => {
    if (!newCategoryLabel.trim() || !settingsRef) return;
    const label = newCategoryLabel.trim();
    if (materialCategories.includes(label)) {
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

  const handleStartEdit = (material: Material) => {
    setEditForm(material)
    setIsEditDialogOpen(true)
  }

  const handleUpdateMaterial = async () => {
    if (!db || !editForm.id) return;
    if (!editForm.name?.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Material name is mandatory." });
      return;
    }

    setIsActionLoading(true)
    const stock = Number(editForm.currentStock || 0)
    const threshold = Number(editForm.lowStockThreshold || 0)
    const status = stock <= 0 ? "Out of Stock" : stock <= threshold ? "Low Stock" : "Available";

    const updateData = {
      ...editForm,
      currentStock: stock,
      lowStockThreshold: threshold,
      status,
      updatedAt: serverTimestamp()
    }

    try {
      await updateDoc(doc(db, 'materials', editForm.id), updateData)
      toast({ title: "Material Updated", description: "Registry record refreshed successfully." })
      setIsEditDialogOpen(false)
      setEditForm({})
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" })
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-primary">
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
                        <SelectContent position="popper" className="z-[1000001] bg-white max-h-60 overflow-y-auto">
                          {materialCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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

                  <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-5 shadow-inner mt-4">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase text-accent tracking-[0.15em] flex items-center gap-2">
                        <Settings2 className="w-3 h-3" /> Taxonomy Management Hub
                      </Label>
                      <p className="text-[8px] text-slate-400 font-bold uppercase leading-tight">Define, modify or purge institutional logistical categories.</p>
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
                           <button onClick={handleUpdateCategory} className="h-10 w-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center shadow-sm"><Check className="w-4 h-4"/></button>
                           <button onClick={() => { setEditingCategoryIndex(null); setEditingCategoryValue(''); }} className="h-10 w-10 rounded-xl bg-slate-200 text-slate-500 hover:bg-slate-300 flex items-center justify-center"><X className="w-4 h-4"/></button>
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
                              >
                                <Edit className="w-3 h-3"/>
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="hover:text-red-600 transition-colors">
                                    <Trash2 className="w-3 h-3"/>
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-3xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Purge category "{cat}"?</AlertDialogTitle>
                                    <AlertDialogDescription>This will remove the category from the global registry. Current items under this category will remain, but the category choice will be unavailable for new entries.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCategory(idx)} className="bg-red-600 hover:bg-red-700 rounded-xl">Remove Category</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                           </div>
                         </Badge>
                       ))}
                       {(!settingsData || !((settingsData as any)?.customCategories?.length)) && (
                         <div className="w-full text-center py-4 bg-white/40 dark:bg-slate-950/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                           <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest italic">No custom logistical categories defined.</p>
                         </div>
                       )}
                    </div>
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
        <div className="container mx-auto px-4 space-y-6">
           <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setCategoryFilter('All')} 
                className={cn(
                  "px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap min-w-[100px]", 
                  categoryFilter === 'All' ? "bg-accent text-primary shadow-md" : "text-slate-500 hover:bg-slate-200"
                )}
              >
                All Materials
              </button>
              {materialCategories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setCategoryFilter(cat)} 
                  className={cn(
                    "px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap min-w-[100px]", 
                    categoryFilter === cat ? "bg-accent text-primary shadow-md" : "text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {cat}
                </button>
              ))}
           </div>

           <div className="relative w-full max-w-2xl mx-auto">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
             <Input 
                placeholder="Filter by material name or SKU..." 
                className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-base shadow-inner focus:ring-accent" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
             />
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
                                <h3 className="text-xl font-bold text-primary dark:text-white leading-tight truncate">{item.name}</h3>
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
                             
                             <Button onClick={() => handleStartEdit(item)} variant="outline" size="icon" className="h-11 w-11 rounded-xl text-slate-400 hover:text-blue-600 border-slate-200">
                                <Edit className="w-4.5 h-4.5" />
                             </Button>

                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-11 w-11 text-slate-300 hover:text-red-500 rounded-xl"><Trash2 className="w-4.5 h-4.5" /></Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                                 <AlertDialogHeader>
                                   <AlertDialogTitle>Purge material record?</AlertDialogTitle>
                                   <AlertDialogDescription>This will permanently remove "{item.name}" from the logistical management system. This action cannot be undone.</AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">Purge Material</AlertDialogAction>
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
                   <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                   <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">Registry Search Yielded Zero Results</p>
                </div>
              )}
           </div>
         )}
      </section>

      {/* Edit Material Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl [&>button]:hidden">
          <DialogHeader className="relative">
             <div className="absolute right-0 top-0">
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-primary">
                    <X className="w-4 h-4" />
                  </Button>
                </DialogClose>
             </div>
             <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Modify Material Record</DialogTitle>
             <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Logistical Profile Update</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Material Designation *</Label>
              <Input value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="h-11 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</Label>
                <Select value={editForm.category} onValueChange={(val: any) => setEditForm({...editForm, category: val})}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper" className="z-[1000001] bg-white max-h-60 overflow-y-auto">
                    {materialCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock SKU / ID</Label>
                <Input value={editForm.sku || ''} onChange={e => setEditForm({...editForm, sku: e.target.value.toUpperCase()})} className="h-11 rounded-xl font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unit of Measure</Label>
                <Select value={editForm.unit} onValueChange={(val: any) => setEditForm({...editForm, unit: val})}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper" className="z-[1000001] bg-white">
                    {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Safety Threshold</Label>
                <Input type="number" value={editForm.lowStockThreshold || 0} onChange={e => setEditForm({...editForm, lowStockThreshold: Number(e.target.value)})} className="h-11 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Stock</Label>
                <Input type="number" value={editForm.currentStock || 0} onChange={e => setEditForm({...editForm, currentStock: Number(e.target.value)})} className="h-11 rounded-xl font-black text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nodal Location</Label>
                <Input value={editForm.location || ''} onChange={e => setEditForm({...editForm, location: e.target.value})} className="h-11 rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Internal Audit Notes</Label>
              <Textarea value={editForm.notes || ''} onChange={e => setEditForm({...editForm, notes: e.target.value})} className="rounded-xl min-h-[80px]" />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleUpdateMaterial} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary transition-all shadow-xl shadow-primary/20">
              {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit Profile Refresh"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
