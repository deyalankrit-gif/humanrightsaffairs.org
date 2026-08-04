
"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Truck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  Briefcase,
  Hash,
  Globe,
  Sparkles,
  Settings2,
  X,
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

const DEFAULT_VENDOR_TYPES = ["Legal", "Logistics", "Printing", "IT Services", "Media", "Travel", "Stationery", "Other"]

type Vendor = {
  id: string
  companyName: string
  vendorType: string
  particularFunction: string
  contactPerson: string
  email: string
  phone: string
  address: string
  gstin?: string
  status: "Active" | "Inactive"
  createdAt: any
}

/**
 * CategoryManagement: Standalone component for taxonomy management.
 */
function CategoryManagement({ 
  newCategoryLabel, 
  setNewCategoryLabel, 
  editingCategoryIndex, 
  setEditingCategoryIndex, 
  editingCategoryValue, 
  setEditingCategoryValue, 
  customCategories,
  onAdd,
  onUpdate,
  onDelete
}: any) {
  return (
    <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-5 shadow-inner mt-6">
      <div className="space-y-1">
        <Label className="text-[9px] font-black uppercase text-accent tracking-widest flex items-center gap-2">
          <Settings2 className="w-3 h-3" /> Taxonomy Hub
        </Label>
        <p className="text-[8px] text-slate-400 font-bold uppercase leading-tight">Define or modify institutional vendor categories.</p>
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
            />
         </div>
         {editingCategoryIndex !== null ? (
           <div className="flex gap-1 shrink-0">
             <Button onClick={onUpdate} size="sm" className="h-10 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"><Check className="w-4 h-4"/></Button>
             <Button onClick={() => { setEditingCategoryIndex(null); setEditingCategoryValue(''); }} size="sm" variant="outline" className="h-10 px-3 rounded-xl border-slate-200"><X className="w-4 h-4 text-slate-400"/></Button>
           </div>
         ) : (
           <Button onClick={onAdd} size="sm" className="h-10 px-4 rounded-xl bg-accent text-primary font-bold shadow-sm" disabled={!newCategoryLabel.trim()}>
             <Plus className="w-4 h-4" />
           </Button>
         )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
         {customCategories.map((cat: string, idx: number) => (
           <Badge key={idx} variant="outline" className={cn(
             "text-[9px] font-bold px-3 py-1 flex items-center gap-2 h-8 rounded-xl shadow-sm transition-all group",
             editingCategoryIndex === idx ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white dark:bg-slate-800 hover:border-accent"
           )}>
             <span>{cat}</span>
             <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingCategoryIndex(idx); setEditingCategoryValue(cat); }} className="hover:text-blue-600 transition-colors"><Edit className="w-3 h-3"/></button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="hover:text-red-600 transition-colors"><Trash2 className="w-3 h-3"/></button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>Are you sure you want to delete this item? This action may be irreversible. Please confirm before continuing.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(idx)} className="bg-red-600 hover:bg-red-700 rounded-xl">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
             </div>
           </Badge>
         ))}
         {customCategories.length === 0 && (
           <p className="text-[8px] text-slate-400 font-bold uppercase italic px-2">No custom categories established.</p>
         )}
      </div>
    </div>
  )
}

/**
 * VendorFormFields: Standalone component for vendor profile inputs.
 */
function VendorFormFields({ data, setData, vendorTypes }: { data: any, setData: (d: any) => void, vendorTypes: string[] }) {
  return (
    <div className="space-y-6 py-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Company Name *</Label>
          <Input value={data.companyName || ''} onChange={e => setData({...data, companyName: e.target.value})} placeholder="Official Entity Name" className="h-11 rounded-xl" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vendor Category *</Label>
          <Select value={data.vendorType} onValueChange={(v: any) => setData({...data, vendorType: v})}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[1000001] bg-white max-h-60">
              {vendorTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Official Contact Number *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input value={data.phone || ''} onChange={e => setData({...data, phone: e.target.value})} placeholder="+91" className="h-11 pl-9 rounded-xl" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Official Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input value={data.email || ''} onChange={e => setData({...data, email: e.target.value})} placeholder="office@vendor.com" className="h-11 pl-9 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Company Office Address *</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
          <Textarea value={data.address || ''} onChange={e => setData({...data, address: e.target.value})} placeholder="Registered Head Office Location" className="min-h-[80px] pl-9 rounded-xl" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">GSTIN / Tax ID</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input value={data.gstin || ''} onChange={e => setData({...data, gstin: e.target.value.toUpperCase()})} placeholder="19AAAAA0000A1Z5" className="h-11 pl-9 rounded-xl font-mono" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Point of Contact (Person)</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input value={data.contactPerson || ''} onChange={e => setData({...data, contactPerson: e.target.value})} placeholder="Name of Manager/Proprietor" className="h-11 pl-9 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Particular Service Function</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input value={data.particularFunction || ''} onChange={e => setData({...data, particularFunction: e.target.value})} placeholder="e.g. Bulk Printing of ID Cards" className="h-11 pl-9 rounded-xl" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Relationship Status</Label>
          <Select value={data.status} onValueChange={(v: any) => setData({...data, status: v})}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent position="popper" className="z-[1000001] bg-white">
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default function InternalVendorsPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editVendor, setEditVendor] = useState<Vendor | null>(null)
  
  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null)
  const [editingCategoryValue, setEditingCategoryValue] = useState('')
  
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({
    companyName: '',
    vendorType: 'Printing',
    particularFunction: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    status: 'Active'
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'vendors', 'settings');
  }, [db]);

  const { data: settingsData } = useDoc(settingsRef);

  const vendorTypes = useMemo(() => {
    const custom = (settingsData as any)?.customCategories || [];
    return Array.from(new Set([...DEFAULT_VENDOR_TYPES, ...custom]));
  }, [settingsData]);

  const vendorsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'vendors'), orderBy('companyName', 'asc'));
  }, [db, user]);

  const { data: vendors, loading: dataLoading } = useCollection(vendorsQuery);

  const handleAddCategory = async () => {
    if (!newCategoryLabel.trim() || !settingsRef) return;
    const label = newCategoryLabel.trim();
    if (vendorTypes.includes(label)) {
      toast({ variant: "destructive", title: "Duplicate Category" });
      return;
    }
    const updatedCustom = [...((settingsData as any)?.customCategories || []), label];
    try {
      await setDoc(settingsRef, { customCategories: updatedCustom, updatedAt: serverTimestamp(), updatedBy: user?.email }, { merge: true });
      setNewCategoryLabel('');
      toast({ title: "Category Established" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save Failed" });
    }
  }

  const handleUpdateCategory = async () => {
    if (editingCategoryIndex === null || !editingCategoryValue.trim() || !settingsRef) return;
    const updatedCustom = [...((settingsData as any)?.customCategories || [])];
    updatedCustom[editingCategoryIndex] = editingCategoryValue.trim();
    try {
      await setDoc(settingsRef, { customCategories: updatedCustom, updatedAt: serverTimestamp(), updatedBy: user?.email }, { merge: true });
      setEditingCategoryIndex(null);
      setEditingCategoryValue('');
      toast({ title: "Category Updated" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  }

  const handleDeleteCategory = async (idx: number) => {
    if (!settingsRef) return;
    const updatedCustom = [...((settingsData as any)?.customCategories || [])];
    updatedCustom.splice(idx, 1);
    try {
      await setDoc(settingsRef, { customCategories: updatedCustom, updatedAt: serverTimestamp(), updatedBy: user?.email }, { merge: true });
      toast({ title: "Category Purged" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  }

  const handleAddVendor = async () => {
    if (!db) return;
    if (!newVendor.companyName?.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Company Name is mandatory." });
      return;
    }
    setIsActionLoading(true)
    addDoc(collection(db, 'vendors'), { ...newVendor, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Vendor Registered", description: "Official entry committed to organizational registry." })
        setNewVendor({ companyName: '', vendorType: 'Printing', particularFunction: '', contactPerson: '', email: '', phone: '', address: '', gstin: '', status: 'Active' })
        setIsAddDialogOpen(false)
      })
      .finally(() => setIsActionLoading(false))
  }

  const handleUpdateVendor = async () => {
    if (!db || !editVendor) return;
    setIsActionLoading(true)
    const { id, ...data } = editVendor;
    updateDoc(doc(db, 'vendors', id), { ...data, updatedAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Registry Updated" })
        setIsEditDialogOpen(false)
        setEditVendor(null)
      })
      .finally(() => setIsActionLoading(false))
  }

  const handleDeleteVendor = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'vendors', id)).then(() => toast({ title: "Vendor Purged" }));
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (vendors as Vendor[] || []).filter(v => {
    const matchesSearch = v.companyName?.toLowerCase().includes(search.toLowerCase()) || 
                          v.contactPerson?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || v.vendorType === typeFilter;
    return matchesSearch && matchesType;
  })

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30 tracking-[0.2em]">
               <ShieldCheck className="w-2.5 h-2.5" /> External Governance
             </div>
             <h1 className="text-3xl md:text-4xl font-headline font-bold">Vendor <span className="text-accent italic">Registry</span></h1>
             <p className="text-slate-400 text-[11px] uppercase font-black tracking-widest">Management of organizational service providers</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                <Plus className="w-4 h-4" /> Register New Provider
              </Button>
            </DialogTrigger>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl rounded-[2rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl [&>button]:hidden">
              <DialogHeader className="relative">
                <div className="absolute right-0 top-0">
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-primary h-8 w-8">
                      <X className="w-5 h-5" />
                    </Button>
                  </DialogClose>
                </div>
                <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Register Institutional Vendor</DialogTitle>
                <DialogDescription>Establish a new service provider entry in the national registry.</DialogDescription>
              </DialogHeader>
              
              <VendorFormFields data={newVendor} setData={setNewVendor} vendorTypes={vendorTypes} />
              
              <CategoryManagement 
                newCategoryLabel={newCategoryLabel}
                setNewCategoryLabel={setNewCategoryLabel}
                editingCategoryIndex={editingCategoryIndex}
                setEditingCategoryIndex={setEditingCategoryIndex}
                editingCategoryValue={editingCategoryValue}
                setEditingCategoryValue={setEditingCategoryValue}
                customCategories={(settingsData as any)?.customCategories || []}
                onAdd={handleAddCategory}
                onUpdate={handleUpdateCategory}
                onDelete={handleDeleteCategory}
              />

              <DialogFooter className="mt-8">
                <Button onClick={handleAddVendor} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-primary text-white hover:bg-secondary transition-all font-bold text-lg shadow-xl shadow-primary/10">
                  {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit to National Registry"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <Button 
                variant={typeFilter === 'All' ? "default" : "ghost"} 
                onClick={() => setTypeFilter('All')} 
                className={cn(
                  "h-8 rounded-lg px-6 text-[10px] font-bold uppercase tracking-widest transition-all", 
                  typeFilter === 'All' ? "bg-accent text-primary shadow-sm hover:bg-secondary hover:text-white" : "text-slate-500 hover:bg-slate-100"
                )}
              >All</Button>
              {DEFAULT_VENDOR_TYPES.slice(0, 4).map((t) => (
                <Button 
                  key={t} 
                  variant={typeFilter === t ? "default" : "ghost"} 
                  onClick={() => setTypeFilter(t)} 
                  className={cn(
                    "h-8 rounded-lg px-6 text-[10px] font-bold uppercase tracking-widest transition-all", 
                    typeFilter === t ? "bg-accent text-primary shadow-sm hover:bg-secondary hover:text-white" : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {t}
                </Button>
              ))}
            </div>
            <div className="relative w-full max-md:max-w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search vendor name or contact person..." className="pl-10 h-11 rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-950 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 pb-24">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4 max-w-5xl mx-auto">
              {filtered.map((vendor) => (
                <Card key={vendor.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-500">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className={cn("p-8 md:w-56 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0", vendor.status === 'Active' ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-red-50 dark:bg-red-950/20")}>
                         <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-4">
                           <Building2 className="w-8 h-8 text-accent" />
                         </div>
                         <Badge variant="outline" className="text-[8px] font-black uppercase px-3 py-1 mb-2 border-accent text-accent">{vendor.vendorType}</Badge>
                         <div className="flex items-center gap-1.5">
                           <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", vendor.status === 'Active' ? "bg-emerald-500" : "bg-red-500")} />
                           <span className={cn("text-[10px] font-black uppercase tracking-widest", vendor.status === 'Active' ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>{vendor.status}</span>
                         </div>
                      </div>
                      <div className="flex-1 p-8 grid lg:grid-cols-4 gap-8 items-center">
                        <div className="lg:col-span-3 space-y-4">
                           <div className="space-y-1">
                             <h3 className="text-2xl font-headline font-bold text-primary dark:text-white leading-tight group-hover:text-accent transition-colors">{vendor.companyName}</h3>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{vendor.particularFunction || "General Service Provider"}</p>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                             <div className="space-y-3">
                                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 uppercase">
                                  <User className="w-4 h-4 text-accent" /> {vendor.contactPerson || "Authorized Signatory"}
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 uppercase">
                                  <Phone className="w-4 h-4 text-accent" /> {vendor.phone || "N/A"}
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 lowercase">
                                  <Mail className="w-4 h-4 text-accent" /> {vendor.email || "N/A"}
                                </div>
                             </div>
                             <div className="space-y-3">
                                <div className="flex items-start gap-3 text-[11px] font-bold text-slate-500 uppercase">
                                  <MapPin className="w-4 h-4 text-accent shrink-0" /> <span className="leading-relaxed italic">"{vendor.address || "No address recorded."}"</span>
                                </div>
                                {vendor.gstin && (
                                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                                    <Hash className="w-4 h-4 text-accent" /> GST: <span className="font-mono text-primary dark:text-slate-300">{vendor.gstin}</span>
                                  </div>
                                )}
                             </div>
                           </div>
                        </div>
                        <div className="flex flex-row lg:flex-col justify-end gap-3 h-full">
                           <Button size="sm" variant="outline" onClick={() => { setEditVendor(vendor); setIsEditDialogOpen(true); }} className="flex-1 lg:flex-none h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest border-slate-200 hover:bg-primary hover:text-white transition-all">Modify</Button>
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button size="sm" variant="ghost" className="h-11 w-11 rounded-xl text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                               <AlertDialogHeader>
                                 <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                 <AlertDialogDescription>Are you sure you want to delete this item? This action may be irreversible. Please confirm before continuing.</AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                 <AlertDialogAction onClick={() => handleDeleteVendor(vendor.id)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11">Delete</AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl rounded-[2rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl [&>button]:hidden">
          <DialogHeader className="relative">
            <div className="absolute right-0 top-0">
               <DialogClose asChild>
                 <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-primary h-8 w-8">
                   <X className="w-5 h-5" />
                 </Button>
               </DialogClose>
            </div>
            <DialogTitle className="text-2xl font-headline font-bold">Update Vendor Meta</DialogTitle>
          </DialogHeader>
          {editVendor && (
            <>
              <VendorFormFields data={editVendor} setData={setEditVendor} vendorTypes={vendorTypes} />
              
              <CategoryManagement 
                newCategoryLabel={newCategoryLabel}
                setNewCategoryLabel={setNewCategoryLabel}
                editingCategoryIndex={editingCategoryIndex}
                setEditingCategoryIndex={setEditingCategoryIndex}
                editingCategoryValue={editingCategoryValue}
                setEditingCategoryValue={setEditingCategoryValue}
                customCategories={(settingsData as any)?.customCategories || []}
                onAdd={handleAddCategory}
                onUpdate={handleUpdateCategory}
                onDelete={handleDeleteCategory}
              />

              <DialogFooter className="mt-8">
                <Button onClick={handleUpdateVendor} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-primary text-white hover:bg-secondary transition-all font-bold text-lg">
                  {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit Profile Refresh"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
