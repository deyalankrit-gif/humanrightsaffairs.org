
"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  Box, 
  Tag, 
  Database, 
  AlertTriangle,
  History,
  Archive,
  ArrowRight,
  FilterX,
  RefreshCw,
  Building,
  Truck,
  X,
  Settings2,
  Check,
  Hash,
  MapPin
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

/**
 * MATERIAL MANAGEMENT TERMINAL
 * Master registry for institutional assets and logistical supplies.
 * Synchronized with Kit Management and Stock Inventory modules.
 */
export default function MaterialManagementPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null)
  const [editingCategoryValue, setEditingCategoryValue] = useState('')

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Logistics',
    sku: '',
    unit: 'Unit',
    currentStock: 0,
    lowStockThreshold: 10,
    status: 'Available' as const,
    location: 'Central HQ',
    notes: '',
    vendorId: '',
    isKitItem: false
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'materials', 'settings');
  }, [db]);

  const { data: settingsData } = useDoc(settingsRef);

  const categories = useMemo(() => {
    const defaults = ["ID & Access", "Legal Forms", "Office Supplies", "Relief Aid", "Logistics", "Marketing", "Other"];
    const custom = (settingsData as any)?.categories || [];
    return Array.from(new Set([...defaults, ...custom]));
  }, [settingsData]);

  const materialsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: materials, loading: dataLoading } = useCollection(materialsQuery);

  const vendorsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'vendors'), orderBy('companyName', 'asc'));
  }, [db, user]);
  const { data: vendors } = useCollection(vendorsQuery);

  const handleAddCategory = async () => {
    if (!newCategoryLabel.trim() || !settingsRef) return;
    const label = newCategoryLabel.trim();
    if (categories.includes(label)) {
      toast({ variant: "destructive", title: "Duplicate Category", description: "This category already exists." });
      return;
    }
    const updatedCustom = [...((settingsData as any)?.categories || []), label];
    try {
      await setDoc(settingsRef, { categories: updatedCustom, updatedAt: serverTimestamp() }, { merge: true });
      setNewCategoryLabel('');
      toast({ title: "Category Created" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  }

  const handleUpdateCategory = async () => {
    if (editingCategoryIndex === null || !editingCategoryValue.trim() || !settingsRef) return;
    const updatedCustom = [...((settingsData as any)?.categories || [])];
    updatedCustom[editingCategoryIndex] = editingCategoryValue.trim();
    try {
      await setDoc(settingsRef, { categories: updatedCustom, updatedAt: serverTimestamp() }, { merge: true });
      setEditingCategoryIndex(null);
      setEditingCategoryValue('');
      toast({ title: "Category Updated" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  }

  const handleDeleteCategory = async (idx: number) => {
    if (!settingsRef) return;
    const updatedCustom = [...((settingsData as any)?.categories || [])];
    updatedCustom.splice(idx, 1);
    try {
      await setDoc(settingsRef, { categories: updatedCustom, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "Category Purged" });
    } catch (e) {
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  }

  const handleAddMaterial = async () => {
    if (!db) return;
    if (!newItem.name.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Item Name is mandatory." });
      return;
    }
    
    setIsActionLoading(true)
    const payload = {
      ...newItem,
      currentStock: Number(newItem.currentStock),
      lowStockThreshold: Number(newItem.lowStockThreshold),
      status: Number(newItem.currentStock) <= 0 ? 'Out of Stock' : 
              Number(newItem.currentStock) <= Number(newItem.lowStockThreshold) ? 'Low Stock' : 'Available',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: user?.email
    }

    addDoc(collection(db, 'materials'), payload)
      .then(() => {
        toast({ title: "Record Established", description: `${newItem.name} added to master registry.` })
        setNewItem({ name: '', category: 'Logistics', sku: '', unit: 'Unit', currentStock: 0, lowStockThreshold: 10, status: 'Available', location: 'Central HQ', notes: '', vendorId: '', isKitItem: false })
        setIsAddDialogOpen(false)
      })
      .finally(() => setIsActionLoading(false))
  }

  const handleUpdateMaterial = async () => {
    if (!db || !editItem) return;
    setIsActionLoading(true)
    const { id, ...data } = editItem;
    const status = Number(data.currentStock) <= 0 ? 'Out of Stock' : 
                   Number(data.currentStock) <= Number(data.lowStockThreshold) ? 'Low Stock' : 'Available';
    
    updateDoc(doc(db, 'materials', id), { 
      ...data, 
      status,
      updatedAt: serverTimestamp() 
    })
      .then(() => {
        toast({ title: "Registry Updated" })
        setIsEditDialogOpen(false)
        setEditItem(null)
      })
      .finally(() => setIsActionLoading(false))
  }

  const handleDeleteMaterial = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'materials', id)).then(() => toast({ title: "Record Purged" }));
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (materials || []).filter((m: any) => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) || (m.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  })

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30 tracking-widest">
               <ShieldCheck className="w-2.5 h-2.5" /> Registry Protocol
             </div>
             <h1 className="text-3xl md:text-4xl font-headline font-bold">Material <span className="text-accent italic">Management</span></h1>
             <p className="text-slate-400 text-[11px] uppercase font-black tracking-widest">Master Institutional Asset Registry</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-2xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all transform hover:scale-105">
                <Plus className="w-4 h-4" /> Register New Item
              </Button>
            </DialogTrigger>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl rounded-[2rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl [&>button]:hidden">
              <DialogHeader className="relative">
                <div className="absolute right-0 top-0">
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <X className="w-4 h-4" />
                    </Button>
                  </DialogClose>
                </div>
                <DialogTitle className="text-2xl font-headline font-bold">New Registry Entry</DialogTitle>
                <DialogDescription>Define a new institutional asset in the master logistics database.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Material Designation (Name) *</Label>
                    <Input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Identity Card Plate" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Category</Label>
                    <Select value={newItem.category} onValueChange={v => setNewItem({...newItem, category: v})}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Reference SKU</Label>
                    <Input value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} placeholder="HRAT-MAT-001" className="h-11 rounded-xl font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Unit of Measure</Label>
                    <Select value={newItem.unit} onValueChange={v => setNewItem({...newItem, unit: v})}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        {['Unit', 'Pack', 'Box', 'Kg', 'Liter', 'Meter'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 self-end h-11">
                    <Checkbox 
                      id="isKitItem" 
                      checked={newItem.isKitItem} 
                      onCheckedChange={(val) => setNewItem({...newItem, isKitItem: !!val})} 
                      className="border-accent"
                    />
                    <Label htmlFor="isKitItem" className="text-[10px] font-black uppercase text-accent cursor-pointer">Kit Component</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Current Balance</Label>
                    <Input type="number" value={newItem.currentStock} onChange={e => setNewItem({...newItem, currentStock: Number(e.target.value)})} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Low Stock Alert Trigger</Label>
                    <Input type="number" value={newItem.lowStockThreshold} onChange={e => setNewItem({...newItem, lowStockThreshold: Number(e.target.value)})} className="h-11 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Authorized Vendor</Label>
                  <Select value={newItem.vendorId} onValueChange={v => setNewItem({...newItem, vendorId: v})}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Assign Vendor" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      {(vendors || []).map((v: any) => <SelectItem key={v.id} value={v.id}>{v.companyName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Storage / Operational Node</Label>
                  <Input value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} placeholder="Location Name" className="h-11 rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Audit Notes</Label>
                  <Textarea value={newItem.notes} onChange={e => setNewItem({...newItem, notes: e.target.value})} placeholder="Log details, specifications or conditions..." className="min-h-[80px] rounded-xl" />
                </div>

                {/* Category Management in Dialog */}
                <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-inner">
                   <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase text-accent tracking-widest flex items-center gap-2">
                        <Settings2 className="w-3 h-3" /> Taxonomy Hub
                      </Label>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Define institutional material categories.</p>
                   </div>
                   <div className="flex gap-2">
                      <Input 
                        placeholder={editingCategoryIndex !== null ? "Updating..." : "New category..."} 
                        value={editingCategoryIndex !== null ? editingCategoryValue : newCategoryLabel} 
                        onChange={e => editingCategoryIndex !== null ? setEditingCategoryValue(e.target.value) : setNewCategoryLabel(e.target.value)}
                        className="h-10 text-xs rounded-xl"
                      />
                      {editingCategoryIndex !== null ? (
                        <Button onClick={handleUpdateCategory} size="sm" className="bg-emerald-600 text-white px-3 rounded-xl"><Check className="w-4 h-4"/></Button>
                      ) : (
                        <Button onClick={handleAddCategory} size="sm" className="bg-accent text-primary px-3 rounded-xl" disabled={!newCategoryLabel.trim()}><Plus className="w-4 h-4"/></Button>
                      )}
                   </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddMaterial} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary transition-all">Establish Registry Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-10 z-30 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border">
             <Button 
               variant={categoryFilter === 'All' ? 'default' : 'ghost'} 
               onClick={() => setCategoryFilter('All')}
               className={cn("h-8 px-4 rounded-lg text-[10px] font-black uppercase transition-all", categoryFilter === 'All' ? "bg-accent text-primary shadow-sm" : "text-slate-500")}
             >All</Button>
             {categories.slice(0, 4).map(c => (
               <Button 
                key={c}
                variant={categoryFilter === c ? 'default' : 'ghost'} 
                onClick={() => setCategoryFilter(c)}
                className={cn("h-8 px-4 rounded-lg text-[10px] font-black uppercase transition-all", categoryFilter === c ? "bg-accent text-primary shadow-sm" : "text-slate-500")}
               >{c}</Button>
             ))}
          </div>
          <div className="relative w-full max-md:max-w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search materials, SKUs or locations..." className="pl-10 h-11 rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-950 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
           {dataLoading ? (
             <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
           ) : (
             <div className="grid gap-6">
                {filtered.map((item: any) => (
                  <Card key={item.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-0">
                       <div className="flex flex-col md:flex-row items-stretch">
                          <div className="p-8 md:w-56 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/50">
                             <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm mb-4">
                                <Package className="w-8 h-8 text-accent" />
                             </div>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                             <Badge className={cn(
                               "text-[10px] font-black px-4 py-0.5 uppercase border-none text-white",
                               item.status === 'Available' ? 'bg-emerald-500' : 
                               item.status === 'Low Stock' ? 'bg-amber-500' : 'bg-red-500'
                             )}>
                               {item.status}
                             </Badge>
                          </div>
                          <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                             <div className="space-y-3 text-center md:text-left flex-1">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                   <Badge variant="outline" className="text-[8px] font-bold border-accent/20 text-accent uppercase tracking-widest px-3">{item.category}</Badge>
                                   {item.isKitItem && <Badge className="bg-primary text-white text-[8px] font-black uppercase tracking-tighter">Kit Component</Badge>}
                                </div>
                                <h3 className="text-xl md:text-xl font-headline font-bold text-primary dark:text-white leading-tight group-hover:text-accent transition-colors">
                                   {item.name}
                                </h3>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                   <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-accent" /> SKU: {item.sku || 'N/A'}</span>
                                   <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" /> {item.location}</span>
                                   <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-accent" /> {vendors?.find(v => v.id === item.vendorId)?.companyName || 'No Vendor'}</span>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-12">
                                <div className="text-center">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Stock Level</p>
                                   <p className="text-2xl font-black text-primary dark:text-white">{item.currentStock} <span className="text-[10px] text-slate-400 font-bold">{item.unit}</span></p>
                                </div>
                                <div className="flex items-center gap-2">
                                   <Button onClick={() => { setEditItem(item); setIsEditDialogOpen(true); }} variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-100 hover:bg-slate-50 transition-all"><Edit className="w-4.5 h-4.5 text-slate-400" /></Button>
                                   <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-4.5 h-4.5" /></Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                                         <AlertDialogHeader>
                                            <AlertDialogTitle>Purge Registry Record?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently remove "{item.name}" from the institutional logistics registry. This action cannot be undone.</AlertDialogDescription>
                                         </AlertDialogHeader>
                                         <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-xl h-11 font-bold">Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteMaterial(item.id)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11 font-bold">Purge Record</AlertDialogAction>
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
                  <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 opacity-40">
                     <Box className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                     <p className="text-lg font-headline font-bold text-slate-400">No active materials identified in the current filter.</p>
                  </div>
                )}
             </div>
           )}
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl rounded-[2rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl [&>button]:hidden">
          <DialogHeader className="relative">
             <div className="absolute right-0 top-0"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-slate-400 h-8 w-8"><X className="w-4 h-4" /></Button></DialogClose></div>
             <DialogTitle className="text-2xl font-headline font-bold">Modify Registry Meta</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Material Name *</Label><Input value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Category</Label>
                    <Select value={editItem.category} onValueChange={v => setEditItem({...editItem, category: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="bg-white">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">SKU</Label><Input value={editItem.sku} onChange={e => setEditItem({...editItem, sku: e.target.value})} className="h-11 rounded-xl font-mono" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Stock Balance</Label><Input type="number" value={editItem.currentStock} onChange={e => setEditItem({...editItem, currentStock: Number(e.target.value)})} className="h-11 rounded-xl" /></div>
                  <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 self-end h-11">
                    <Checkbox id="edit-isKitItem" checked={editItem.isKitItem} onCheckedChange={(val) => setEditItem({...editItem, isKitItem: !!val})} className="border-accent" />
                    <Label htmlFor="edit-isKitItem" className="text-[10px] font-black uppercase text-accent cursor-pointer">Kit Component</Label>
                  </div>
                </div>
                <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Assigned Vendor</Label>
                   <Select value={editItem.vendorId} onValueChange={v => setEditItem({...editItem, vendorId: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="bg-white">{(vendors || []).map((v: any) => <SelectItem key={v.id} value={v.id}>{v.companyName}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Location</Label><Input value={editItem.location} onChange={e => setEditItem({...editItem, location: e.target.value})} className="h-11 rounded-xl" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Notes</Label><Textarea value={editItem.notes} onChange={e => setEditItem({...editItem, notes: e.target.value})} className="rounded-xl" /></div>
                <Button onClick={handleUpdateMaterial} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary">Commit Registry Refresh</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </main>
  )
}
