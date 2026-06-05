"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
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
  Briefcase
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

type VendorType = "Legal" | "Logistics" | "Printing" | "IT Services" | "Media" | "Travel" | "Stationery" | "Other"

type Vendor = {
  id: string
  companyName: string
  vendorType: VendorType
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
  const [editVendor, setEditVendor] = useState<Vendor | null>(null)

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

  const vendorsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'vendors'), orderBy('companyName', 'asc'));
  }, [db, user]);

  const { data: vendors, loading: dataLoading } = useCollection(vendorsQuery);

  const handleAddVendor = async () => {
    if (!db) return;
    if (!newVendor.companyName?.trim() || !newVendor.contactPerson?.trim() || !newVendor.email?.trim()) {
      toast({ variant: "destructive", title: "Required Fields", description: "Company, Contact Person, and Email are mandatory." });
      return;
    }

    setIsActionLoading(true)
    const data = { 
      ...newVendor, 
      createdAt: serverTimestamp() 
    }

    addDoc(collection(db, 'vendors'), data)
      .then(() => {
        toast({ title: "Vendor Registered", description: `${newVendor.companyName} has been added to the registry.` })
        setNewVendor({ companyName: '', vendorType: 'Printing', particularFunction: '', contactPerson: '', email: '', phone: '', address: '', gstin: '', status: 'Active' })
        setIsAddDialogOpen(false)
      })
      .finally(() => setIsActionLoading(false))
  }

  const handleDeleteVendor = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'vendors', id))
      .then(() => toast({ title: "Vendor Removed" }))
  }

  const handleUpdateVendor = async () => {
    if (!db || !editVendor) return;
    setIsActionLoading(true)
    const { id, ...data } = editVendor
    updateDoc(doc(db, 'vendors', id), data)
      .then(() => {
        toast({ title: "Registry Updated" })
        setEditVendor(null)
      })
      .finally(() => setIsActionLoading(false))
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (vendors as Vendor[] || []).filter(v => {
    const matchesSearch = v.companyName?.toLowerCase().includes(search.toLowerCase()) || 
                          v.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
                          (v.particularFunction || '').toLowerCase().includes(search.toLowerCase()) ||
                          v.gstin?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || v.vendorType === typeFilter;
    return matchesSearch && matchesType;
  })

  const vendorTypes = ["Legal", "Logistics", "Printing", "IT Services", "Media", "Travel", "Stationery", "Other"]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-32 pb-12 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-3 h-3" /> External Governance
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Vendor <span className="text-accent italic">Registry</span></h1>
              <p className="text-slate-400">Manage organizational service providers, consultants, and logistics partners.</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-8 flex gap-2 hover:bg-accent/90 shadow-xl shadow-accent/20">
                  <Plus className="w-5 h-5" /> Register New Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="text-2xl font-headline font-bold">Add External Provider</DialogTitle></DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input value={newVendor.companyName} onChange={e => setNewVendor({...newVendor, companyName: e.target.value})} placeholder="e.g. Shield Printing Solutions" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Vendor Type</Label>
                      <Select value={newVendor.vendorType} onValueChange={v => setNewVendor({...newVendor, vendorType: v as VendorType})}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>{vendorTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Particular Function / Specialization</Label>
                    <Input value={newVendor.particularFunction} onChange={e => setNewVendor({...newVendor, particularFunction: e.target.value})} placeholder="e.g. Bulk ID Card Printing, National Courier Service..." className="h-12 rounded-xl" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Person</Label>
                      <Input value={newVendor.contactPerson} onChange={e => setNewVendor({...newVendor, contactPerson: e.target.value})} placeholder="Full Name" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>GSTIN (Optional)</Label>
                      <Input value={newVendor.gstin} onChange={e => setNewVendor({...newVendor, gstin: e.target.value})} placeholder="15-digit GST Number" className="h-12 rounded-xl uppercase font-mono" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Official Email</Label>
                      <Input value={newVendor.email} onChange={e => setNewVendor({...newVendor, email: e.target.value})} type="email" placeholder="vendor@example.com" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Official Phone</Label>
                      <Input value={newVendor.phone} onChange={e => setNewVendor({...newVendor, phone: e.target.value})} placeholder="+91 XXXX XXXXXX" className="h-12 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Business Address</Label>
                    <Textarea value={newVendor.address} onChange={e => setNewVendor({...newVendor, address: e.target.value})} placeholder="Full correspondence address..." className="rounded-xl min-h-[100px]" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddVendor} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-accent text-primary font-bold text-lg">
                    {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit to Registry"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-12 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-wrap items-center gap-2">
              {["All", ...vendorTypes].map((t) => (
                <Button
                  key={t}
                  variant={typeFilter === t ? "default" : "outline"}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "rounded-full px-5 font-bold h-10 transition-all",
                    typeFilter === t ? "bg-accent text-primary shadow-lg" : "text-slate-500 hover:border-accent hover:text-accent"
                  )}
                >
                  {t}
                </Button>
              ))}
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by company, function or GST..." 
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
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Querying External Ledger...</p></div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((vendor) => (
                <Card key={vendor.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-8 bg-slate-50 dark:bg-slate-800 md:w-64 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                         <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-inner mb-4">
                            <Building2 className="w-8 h-8 text-accent" />
                         </div>
                         <Badge variant="outline" className="border-accent text-accent font-bold uppercase text-[9px] px-3 py-1 mb-2">
                           {vendor.vendorType}
                         </Badge>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                         <div className="flex items-center gap-2 mt-1">
                            {vendor.status === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                            <span className={cn("font-bold text-sm", vendor.status === 'Active' ? "text-emerald-600" : "text-red-600")}>{vendor.status}</span>
                         </div>
                      </div>
                      
                      <div className="flex-1 p-8 grid lg:grid-cols-4 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-6">
                          <div className="space-y-1">
                             <h3 className="text-2xl font-headline font-bold text-primary dark:text-white group-hover:text-accent transition-colors">{vendor.companyName}</h3>
                             <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                               <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-accent" /> {vendor.contactPerson}</span>
                               <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-accent" /> {vendor.email}</span>
                               <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-accent" /> {vendor.phone}</span>
                             </div>
                             {vendor.particularFunction && (
                               <div className="flex items-center gap-2 mt-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 w-fit">
                                 <Briefcase className="w-4 h-4 text-accent" />
                                 <span className="text-xs font-bold text-primary dark:text-slate-300 uppercase tracking-tight">{vendor.particularFunction}</span>
                               </div>
                             )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                             <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><MapPin className="w-3 h-3" /> Address</p>
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{vendor.address}</p>
                             </div>
                             {vendor.gstin && (
                               <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">GST Identification</p>
                                  <p className="text-sm font-mono font-bold text-primary dark:text-white tracking-tighter">{vendor.gstin}</p>
                               </div>
                             )}
                          </div>
                        </div>

                        <div className="lg:col-span-2 flex flex-col justify-between items-end h-full">
                           <div className="text-right">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Added on</p>
                              <p className="text-xs font-bold text-slate-500">
                                {vendor.createdAt?.toDate ? vendor.createdAt.toDate().toLocaleDateString() : 'N/A'}
                              </p>
                           </div>

                           <div className="flex gap-3">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button onClick={() => setEditVendor(vendor)} variant="outline" className="rounded-xl font-bold h-11 px-6 border-slate-200 dark:border-slate-700 hover:bg-accent hover:text-primary transition-all flex gap-2">
                                    <Edit className="w-4 h-4" /> Edit Record
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader><DialogTitle>Modify Vendor Details</DialogTitle></DialogHeader>
                                  {editVendor && (
                                    <div className="space-y-6 py-4">
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Company Name</Label><Input value={editVendor.companyName} onChange={e => setEditVendor({...editVendor, companyName: e.target.value})} className="h-12 rounded-xl" /></div>
                                        <div className="space-y-2">
                                          <Label>Vendor Type</Label>
                                          <Select value={editVendor.vendorType} onValueChange={v => setEditVendor({...editVendor, vendorType: v as VendorType})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{vendorTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Particular Function</Label>
                                        <Input value={editVendor.particularFunction} onChange={e => setEditVendor({...editVendor, particularFunction: e.target.value})} className="h-12 rounded-xl" />
                                      </div>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Contact Person</Label><Input value={editVendor.contactPerson} onChange={e => setEditVendor({...editVendor, contactPerson: e.target.value})} className="h-12 rounded-xl" /></div>
                                        <div className="space-y-2"><Label>GSTIN</Label><Input value={editVendor.gstin} onChange={e => setEditVendor({...editVendor, gstin: e.target.value})} className="h-12 rounded-xl uppercase font-mono" /></div>
                                      </div>
                                      <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-2 md:col-span-1"><Label>Email</Label><Input value={editVendor.email} onChange={e => setEditVendor({...editVendor, email: e.target.value})} className="h-12 rounded-xl" /></div>
                                        <div className="space-y-2 md:col-span-1"><Label>Phone</Label><Input value={editVendor.phone} onChange={e => setEditVendor({...editVendor, phone: e.target.value})} className="h-12 rounded-xl" /></div>
                                        <div className="space-y-2 md:col-span-1">
                                          <Label>Status</Label>
                                          <Select value={editVendor.status} onValueChange={v => setEditVendor({...editVendor, status: v as any})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="space-y-2"><Label>Address</Label><Textarea value={editVendor.address} onChange={e => setEditVendor({...editVendor, address: e.target.value})} className="rounded-xl min-h-[100px]" /></div>
                                      <Button onClick={handleUpdateVendor} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-accent text-primary font-bold text-lg mt-4">Save Changes</Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[2rem]">
                                  <AlertDialogHeader>
                                    <div className="text-left">
                                      <AlertDialogTitle>Deregister Vendor?</AlertDialogTitle>
                                      <AlertDialogDescription>This will permanently remove <strong>{vendor.companyName}</strong> from the organizational registry. Action is irreversible.</AlertDialogDescription>
                                    </div>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteVendor(vendor.id)} className="bg-red-500 hover:bg-red-600 rounded-xl border-none text-white font-bold">Confirm Delete</AlertDialogAction>
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
                <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                   <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Truck className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                   </div>
                   <h3 className="text-2xl font-headline font-bold text-primary dark:text-white">No matching vendors</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Adjust your search or register a new external provider.</p>
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
