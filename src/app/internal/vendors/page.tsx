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
    if (!newVendor.companyName?.trim()) return;
    setIsActionLoading(true)
    addDoc(collection(db, 'vendors'), { ...newVendor, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Vendor Registered" })
        setNewVendor({ companyName: '', vendorType: 'Printing', particularFunction: '', contactPerson: '', email: '', phone: '', address: '', gstin: '', status: 'Active' })
        setIsAddDialogOpen(false)
      })
      .finally(() => setIsActionLoading(false))
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (vendors as Vendor[] || []).filter(v => {
    const matchesSearch = v.companyName?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || v.vendorType === typeFilter;
    return matchesSearch && matchesType;
  })

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> External Governance
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Vendor <span className="text-accent italic">Registry</span></h1>
              <p className="text-slate-400 text-[11px]">Manage organizational service providers and consultants.</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2 hover:bg-secondary hover:text-white transition-all shadow-lg">
                  <Plus className="w-4 h-4" /> Register Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-3xl">
                <DialogHeader><DialogTitle>Register Provider</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                   <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Company Name</Label><Input value={newVendor.companyName} onChange={e => setNewVendor({...newVendor, companyName: e.target.value})} /></div>
                      <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Vendor Type</Label>
                        <Select value={newVendor.vendorType} onValueChange={(v: any) => setNewVendor({...newVendor, vendorType: v})}>
                           <SelectTrigger><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-white"><SelectItem value="Legal">Legal</SelectItem><SelectItem value="Logistics">Logistics</SelectItem><SelectItem value="Printing">Printing</SelectItem><SelectItem value="IT Services">IT Services</SelectItem></SelectContent>
                        </Select>
                      </div>
                   </div>
                </div>
                <Button onClick={handleAddVendor} disabled={isActionLoading} className="w-full h-11 rounded-xl mt-4 bg-primary text-white hover:bg-secondary transition-all font-bold">Commit to Registry</Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 rounded-lg">
              {["All", "Legal", "Logistics", "Printing"].map((t) => (
                <Button 
                  key={t} 
                  variant={typeFilter === t ? "default" : "ghost"} 
                  onClick={() => setTypeFilter(t)} 
                  className={cn(
                    "h-7 rounded-md px-4 text-[10px] font-bold uppercase transition-all", 
                    typeFilter === t ? "bg-accent text-primary shadow-sm hover:bg-secondary hover:text-white" : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {t}
                </Button>
              ))}
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input placeholder="Search vendors..." className="pl-8 h-9 rounded-lg border-slate-100 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((vendor) => (
                <Card key={vendor.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-5 bg-slate-50 dark:bg-slate-800 md:w-44 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                         <Building2 className="w-8 h-8 text-accent mb-2" />
                         <Badge variant="outline" className="text-[7px] font-bold px-1.5 py-0 mb-1 uppercase">{vendor.vendorType}</Badge>
                         <p className={cn("text-[9px] font-bold", vendor.status === 'Active' ? "text-emerald-600" : "text-red-600")}>{vendor.status}</p>
                      </div>
                      <div className="flex-1 p-5 grid lg:grid-cols-4 gap-6 items-center">
                        <div className="lg:col-span-2 space-y-1">
                             <h3 className="text-lg font-headline font-bold leading-tight">{vendor.companyName}</h3>
                             <div className="flex gap-3 text-[10px] font-bold text-slate-500">
                               <span className="flex items-center gap-1"><User className="w-2.5 h-2.5 text-accent" /> {vendor.contactPerson}</span>
                               <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5 text-accent" /> {vendor.email}</span>
                             </div>
                        </div>
                        <div className="flex justify-end gap-2">
                           <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold border-slate-200 hover:bg-secondary hover:text-white transition-colors">Edit</Button>
                           <Button size="sm" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></Button>
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
