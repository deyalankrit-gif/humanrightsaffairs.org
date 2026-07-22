
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
  X
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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

export default function InternalVendorsPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  
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

  // Persistence for Custom Categories
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
      toast({ variant: "destructive", title: "Duplicate Category", description: "This category already exists in the registry." });
      return;
    }

    const updatedCustom = [...((settingsData as any)?.customCategories || []), label];
    
    try {
      await setDoc(settingsRef, {
        customCategories: updatedCustom,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email
      }, { merge: true });
      
      setNewCategoryLabel('');
      toast({ title: "Category Established", description: `${label} added to institutional categories.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save Failed" });
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
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30 tracking-[0.2em]">
                <ShieldCheck className="w-2.5 h-2.5" /> External Governance
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Vendor <span className="text-accent italic">Registry</span></h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Management of organizational service providers</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                  <Plus className="w-4 h-4" /> Register New Provider
                </Button>
              </DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl rounded-[2rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Register Institutional Vendor</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Company Name *</Label>
                        <Input value={newVendor.companyName} onChange={e => setNewVendor({...newVendor, companyName: e.target.value})} placeholder="Official Entity Name" className="h-11 rounded-xl" />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vendor Category *</Label>
                          <div className="flex gap-2">
                             <Select value={newVendor.vendorType} onValueChange={(v: any) => setNewVendor({...newVendor, vendorType: v})}>
                                <SelectTrigger className="h-11 rounded-xl flex-1"><SelectValue /></SelectTrigger>
                                <SelectContent position="popper" className="z-[1000001] bg-white max-h-60">
                                  {vendorTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                           <Label className="text-[9px] font-black uppercase text-accent tracking-tighter">Create New Category</Label>
                           <div className="flex gap-2">
                              <Input 
                                placeholder="Category Name" 
                                value={newCategoryLabel} 
                                onChange={e => setNewCategoryLabel(e.target.value)}
                                className="h-8 text-xs rounded-lg bg-white dark:bg-slate-950" 
                                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                              />
                              <Button 
                                onClick={handleAddCategory} 
                                size="sm" 
                                variant="secondary" 
                                className="h-8 px-3 rounded-lg"
                                disabled={!newCategoryLabel.trim()}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </Button>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Official Contact Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <Input value={newVendor.phone} onChange={e => setNewVendor({...newVendor, phone: e.target.value})} placeholder="+91" className="h-11 pl-9 rounded-xl" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Official Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <Input value={newVendor.email} onChange={e => setNewVendor({...newVendor, email: e.target.value})} placeholder="office@vendor.com" className="h-11 pl-9 rounded-xl" />
                        </div>
                      </div>
                   </div>

                   <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Company Office Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                        <Textarea value={newVendor.address} onChange={e => setNewVendor({...newVendor, address: e.target.value})} placeholder="Registered Head Office Location" className="min-h-[80px] pl-9 rounded-xl" />
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">GSTIN / Tax ID</Label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <Input value={newVendor.gstin} onChange={e => setNewVendor({...newVendor, gstin: e.target.value.toUpperCase()})} placeholder="19AAAAA0000A1Z5" className="h-11 pl-9 rounded-xl font-mono" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Point of Contact (Person)</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <Input value={newVendor.contactPerson} onChange={e => setNewVendor({...newVendor, contactPerson: e.target.value})} placeholder="Name of Manager/Proprietor" className="h-11 pl-9 rounded-xl" />
                        </div>
                      </div>
                   </div>

                   <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Particular Service Function</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input value={newVendor.particularFunction} onChange={e => setNewVendor({...newVendor, particularFunction: e.target.value})} placeholder="e.g. Bulk Printing of ID Cards" className="h-11 pl-9 rounded-xl" />
                      </div>
                   </div>
                </div>
                <Button onClick={handleAddVendor} disabled={isActionLoading} className="w-full h-14 rounded-2xl mt-4 bg-primary text-white hover:bg-secondary transition-all font-bold text-lg shadow-xl shadow-primary/10">Commit to National Registry</Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              {["All", "Legal", "Logistics", "Printing", "IT Services"].map((t) => (
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
            <div className="relative w-full max-w-md">
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
                         <Badge variant="outline" className="text-[8px] font-black px-3 py-1 mb-2 uppercase border-accent text-accent">{vendor.vendorType}</Badge>
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
                           <Button size="sm" variant="outline" className="flex-1 lg:flex-none h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest border-slate-200 hover:bg-primary hover:text-white transition-all">Modify</Button>
                           <Button size="sm" variant="ghost" className="h-11 w-11 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-5 h-5" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 opacity-30">
                   <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                   <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Registry Empty</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
