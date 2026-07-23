
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Footer } from '@/components/footer'
import { 
  HardDrive, 
  Plus, 
  ArrowLeft, 
  Loader2, 
  Search, 
  Trash2, 
  Edit, 
  ShieldCheck, 
  Calendar as CalendarIcon, 
  IndianRupee, 
  Box, 
  Truck, 
  Monitor, 
  Layers
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function AssetRegistry() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: 'IT Equipment',
    purchaseDate: '',
    purchaseValue: '',
    currentValue: '',
    depreciationRate: '',
    location: 'National HQ',
    status: 'In Use'
  })

  const assetsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'finance_assets'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: assets, loading: assetsLoading } = useCollection(assetsQuery);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setIsActionLoading(true);

    try {
      await addDoc(collection(db, 'finance_assets'), {
        ...formData,
        purchaseValue: Number(formData.purchaseValue),
        currentValue: Number(formData.currentValue),
        depreciationRate: Number(formData.depreciationRate),
        createdAt: serverTimestamp(),
        createdBy: user.email
      });
      toast({ title: "Asset Registered", description: "The item has been added to the institutional registry." });
      setIsAddOpen(false);
      setFormData({ name: '', category: 'IT Equipment', purchaseDate: '', purchaseValue: '', currentValue: '', depreciationRate: '', location: 'National HQ', status: 'In Use' });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Registration Failed" });
    } finally {
      setIsActionLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !user) return;
    try {
      await deleteDoc(doc(db, 'finance_assets', id));
      toast({ title: "Asset Purged" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>

  const filtered = (assets || []).filter((a: any) => a.name.toLowerCase().includes(search.toLowerCase()));

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Vehicles': return <Truck className="w-5 h-5" />;
      case 'IT Equipment': return <Monitor className="w-5 h-5" />;
      case 'Furniture': return <Box className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-emerald-500/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/internal/finance/dashboard')} className="text-white hover:bg-white/10">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-headline font-bold">Asset <span className="text-emerald-400 italic">Registry</span></h1>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <ShieldCheck className="w-3.5 h-3.5" /> Institutional Property Oversight
                </p>
              </div>
           </div>
           <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-8 rounded-xl shadow-xl">
             <Plus className="w-5 h-5 mr-2" /> Register New Asset
           </Button>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
           <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search assets by name..." 
                className="pl-9 h-11 rounded-xl bg-white dark:bg-slate-900"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        {assetsLoading ? (
          <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto" /></div>
        ) : (
          <div className="grid gap-4">
             {filtered.map((asset: any) => (
               <Card key={asset.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                       <div className="p-6 md:w-44 text-center border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/50">
                          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-emerald-500 mb-3 shadow-sm">
                            {getCategoryIcon(asset.category)}
                          </div>
                          <Badge variant="outline" className="text-[8px] font-black uppercase border-emerald-100 text-emerald-600">{asset.status}</Badge>
                       </div>
                       <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="space-y-1 flex-1">
                             <h3 className="text-lg font-bold text-primary dark:text-white leading-tight">{asset.name}</h3>
                             <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {asset.location}</span>
                                <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Acquired: {asset.purchaseDate}</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-8">
                             <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase leading-none">Current Value</p>
                                <p className="text-lg font-black text-emerald-600">₹{asset.currentValue?.toLocaleString()}</p>
                             </div>
                             <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-50"><Edit className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)} className="h-8 w-8 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                             </div>
                          </div>
                       </div>
                    </div>
                  </CardContent>
               </Card>
             ))}
             {filtered.length === 0 && (
               <div className="text-center py-32 opacity-20">
                  <HardDrive className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-xl font-headline font-bold">No registered assets found</p>
               </div>
             )}
          </div>
        )}
      </section>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent className="max-w-xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-slate-900 p-8 text-white">
               <DialogTitle className="text-2xl font-headline font-bold">Asset Registration</DialogTitle>
               <DialogDescription className="text-emerald-400 uppercase tracking-widest font-black text-[10px]">Property Registry Node</DialogDescription>
            </div>
            <form onSubmit={handleAddAsset} className="p-8 space-y-4">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Asset Name *</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Office Server / Staff Car" required />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Category</Label>
                     <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                           {['IT Equipment', 'Vehicles', 'Furniture', 'Office Space', 'Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Status</Label>
                     <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                           {['In Use', 'Maintenance', 'Retired', 'Damaged'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Purchase Date</Label>
                     <Input type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Purchase Value</Label>
                     <Input type="number" value={formData.purchaseValue} onChange={e => setFormData({...formData, purchaseValue: e.target.value})} placeholder="₹" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Current Value</Label>
                     <Input type="number" value={formData.currentValue} onChange={e => setFormData({...formData, currentValue: e.target.value})} placeholder="₹" />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Depreciation (%)</Label>
                     <Input type="number" value={formData.depreciationRate} onChange={e => setFormData({...formData, depreciationRate: e.target.value})} placeholder="%" />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Physical Location</Label>
                  <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Chapter or Office Address" />
               </div>
               <Button type="submit" disabled={isActionLoading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-4">
                 {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit to Registry"}
               </Button>
            </form>
         </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
