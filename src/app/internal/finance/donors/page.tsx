
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Footer } from '@/components/footer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  HeartHandshake, 
  Plus, 
  ArrowLeft, 
  Loader2, 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  TrendingUp, 
  ShieldCheck, 
  Calendar as CalendarIcon, 
  IndianRupee,
  Briefcase,
  ExternalLink,
  Trash2
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

export default function InstitutionalDonors() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [search, setSearch] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    donorType: 'Individual',
    totalContribution: '',
    lastDonationDate: '',
    pan: '',
    status: 'Active'
  })

  const donorsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'finance_donors'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: donors, loading: donorsLoading } = useCollection(donorsQuery);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const handleAddDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setIsActionLoading(true);

    try {
      await addDoc(collection(db, 'finance_donors'), {
        ...formData,
        totalContribution: Number(formData.totalContribution),
        createdAt: serverTimestamp(),
        createdBy: user.email
      });
      toast({ title: "Donor Profile Established", description: "The entry has been logged in the national donor registry." });
      setIsAddOpen(false);
      setFormData({ name: '', email: '', phone: '', donorType: 'Individual', totalContribution: '', lastDonationDate: '', pan: '', status: 'Active' });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Registration Error" });
    } finally {
      setIsActionLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !user) return;
    try {
      await deleteDoc(doc(db, 'finance_donors', id));
      toast({ title: "Profile Purged" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>

  const filtered = (donors || []).filter((d: any) => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-emerald-500/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/internal/finance/dashboard')} className="text-white hover:bg-white/10">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-headline font-bold">Institutional <span className="text-emerald-400 italic">Donors</span></h1>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <ShieldCheck className="w-3.5 h-3.5" /> High-Impact Benefactor Registry
                </p>
              </div>
           </div>
           <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-8 rounded-xl shadow-xl">
             <Plus className="w-4 h-4 mr-2" /> Register Benefactor
           </Button>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
           <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search donors by name..." 
                className="pl-9 h-11 rounded-xl bg-white dark:bg-slate-950 shadow-sm border-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        {donorsLoading ? (
          <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto" /></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
             {filtered.map((donor: any) => (
               <Card key={donor.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 group hover:shadow-xl transition-all duration-500">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                             <User className="w-7 h-7" />
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{donor.name}</h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{donor.donorType} • {donor.status}</p>
                          </div>
                       </div>
                       <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-emerald-500"><Edit className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(donor.id)} className="h-8 w-8 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                       <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                             <Mail className="w-3 h-3 text-accent" /> {donor.email || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                             <Phone className="w-3 h-3 text-accent" /> {donor.phone || 'N/A'}
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Lifetime Impact</p>
                          <p className="text-xl font-black text-emerald-600">₹{donor.totalContribution?.toLocaleString()}</p>
                       </div>
                    </div>
                  </CardContent>
               </Card>
             ))}
             {filtered.length === 0 && (
               <div className="col-span-full text-center py-32 opacity-20">
                  <HeartHandshake className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-xl font-headline font-bold">No institutional donors identified</p>
               </div>
             )}
          </div>
        )}
      </section>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent className="max-w-xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
            <div className="bg-slate-900 p-8 text-white">
               <DialogTitle className="text-2xl font-headline font-bold">Donor Registration</DialogTitle>
               <DialogDescription className="text-emerald-400 uppercase tracking-widest font-black text-[10px]">Benefactor Registry Terminal</DialogDescription>
            </div>
            <form onSubmit={handleAddDonor} className="p-8 space-y-4">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Full Name / Entity Name *</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Donor Name" required />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Email</Label>
                     <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@donor.com" />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Phone</Label>
                     <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Donor Type</Label>
                     <Select value={formData.donorType} onValueChange={v => setFormData({...formData, donorType: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                           {['Individual', 'Corporate', 'Government', 'International'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Initial Contribution</Label>
                     <Input type="number" value={formData.totalContribution} onChange={e => setFormData({...formData, totalContribution: e.target.value})} placeholder="₹" />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">PAN (For 80G Receipts)</Label>
                  <Input value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value.toUpperCase()})} placeholder="ABCDE1234F" className="font-mono" />
               </div>
               <Button type="submit" disabled={isActionLoading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-4 shadow-xl">
                 {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit Profile to Registry"}
               </Button>
            </form>
         </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
