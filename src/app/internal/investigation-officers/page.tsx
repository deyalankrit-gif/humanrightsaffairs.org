
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  UserRoundCheck,
  Building2,
  X,
  Check,
  User,
  Mail,
  Phone,
  Fingerprint,
  Briefcase,
  Sparkles,
  Lock,
  Eye,
  EyeOff
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
  AlertDialogDescription as AlertDialogDesc,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const OFFICER_DESIGNATIONS = [
  "Senior Investigation Officer",
  "Investigation Officer",
  "Assistant Investigation Officer",
  "Junior Investigation Officer",
  "Field Investigator"
]

export default function InvestigationOfficersRegistry() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editOfficer, setEditOfficer] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    password: '',
    designation: 'Investigation Officer',
    status: 'active' as const
  })

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com'

  useEffect(() => {
    if (!authLoading && !isRoot) {
      router.push('/internal/login')
    }
  }, [isRoot, authLoading, router])

  const officersQuery = useMemoFirebase(() => {
    if (!db || !isRoot) return null;
    return query(collection(db, 'investigation_officers'), orderBy('name', 'asc'));
  }, [db, isRoot]);

  const { data: officers, loading: dataLoading } = useCollection(officersQuery);

  const generateAlphanumeric = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const generateOfficerId = () => `HRAT-IO-${generateAlphanumeric(4)}`;

  /**
   * generateSmartPassword: First 3 letters of name + # + last 3 digits of phone
   */
  const generateSmartPassword = (name: string, phone: string) => {
    const prefix = (name || 'HRAT').trim().substring(0, 3);
    const cleanPhone = (phone || '000').replace(/\D/g, '');
    const suffix = cleanPhone.length >= 3 ? cleanPhone.slice(-3) : '000';
    return `${prefix}#${suffix}`;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !formData.name.trim() || !formData.email.trim()) return
    setIsActionLoading(true)

    try {
      await addDoc(collection(db, 'investigation_officers'), {
        ...formData,
        createdAt: serverTimestamp()
      })
      toast({ title: "Officer Registered", description: `${formData.name} added to master pool.` })
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        employeeId: '', 
        password: '',
        designation: 'Investigation Officer', 
        status: 'active' 
      })
      setIsAddOpen(false)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Registration Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!db || !editOfficer) return
    setIsActionLoading(true)
    try {
      const { id, ...data } = editOfficer
      await updateDoc(doc(db, 'investigation_officers', id), data)
      toast({ title: "Profile Updated" })
      setEditOfficer(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db) return
    try {
      await deleteDoc(doc(db, 'investigation_officers', id))
      toast({ title: "Officer Purged" })
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Denied" })
    }
  }

  if (authLoading || !isRoot) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (officers || []).filter((o: any) => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.designation?.toLowerCase().includes(search.toLowerCase()) ||
    o.employeeId?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/30">
               <ShieldCheck className="w-2.5 h-2.5" /> Force Registry Node
             </div>
             <h1 className="text-3xl md:text-4xl font-headline font-bold">Investigator <span className="text-accent italic">Pool</span></h1>
             <p className="text-slate-400 text-[11px] uppercase font-black">Official Registry of Investigative Personnel</p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all transform hover:scale-105 active:scale-95">
                <Plus className="w-4 h-4" /> Add Investigation Officer
              </Button>
            </DialogTrigger>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
               <div className="bg-slate-900 p-8 text-white relative">
                  <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 h-8 w-8"><X className="w-4 h-4" /></Button></DialogClose></div>
                  <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2">Personnel Node</Badge>
                  <DialogTitle className="text-2xl font-headline font-bold">Register Officer</DialogTitle>
                  <DialogDescription className="text-slate-400">Add an official to the investigative selection pool with full credentials.</DialogDescription>
               </div>
               <form onSubmit={handleAdd} className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Officer Name *</Label>
                       <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Adv. Sourav Chatterjee" className="h-11 rounded-xl" required />
                    </div>
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Employee ID *</Label>
                       <div className="flex gap-2">
                          <Input 
                            value={formData.employeeId} 
                            onChange={e => setFormData({...formData, employeeId: e.target.value.toUpperCase()})} 
                            placeholder="HRAT-IO-001" 
                            className="h-11 rounded-xl font-mono flex-1" 
                            required 
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            title="Generate ID"
                            className="h-11 w-11 shrink-0 rounded-xl border-dashed hover:bg-accent/10"
                            onClick={() => setFormData({...formData, employeeId: generateOfficerId()})}
                          >
                            <Sparkles className="w-4 h-4 text-accent" />
                          </Button>
                       </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Official Email *</Label>
                       <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="officer@hrat-india.org" className="h-11 rounded-xl" required />
                    </div>
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Login Password *</Label>
                       <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              value={formData.password} 
                              onChange={e => setFormData({...formData, password: e.target.value})} 
                              placeholder="Min 8 chars" 
                              className="h-11 rounded-xl pr-10" 
                              required 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-accent"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            title="Generate Protocol Password"
                            className="h-11 w-11 shrink-0 rounded-xl border-dashed hover:bg-accent/10"
                            onClick={() => setFormData({...formData, password: generateSmartPassword(formData.name, formData.phone)})}
                          >
                            <Lock className="w-4 h-4 text-accent" />
                          </Button>
                       </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 flex-1">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Designation / Rank *</Label>
                       <Select value={formData.designation} onValueChange={(val) => setFormData({...formData, designation: val})}>
                          <SelectTrigger className="h-11 rounded-xl">
                             <SelectValue placeholder="Select Rank" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-[1000000]">
                             {OFFICER_DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Contact Number</Label>
                       <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91" className="h-11 rounded-xl" />
                    </div>
                  </div>

                  <Button type="submit" disabled={isActionLoading} className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-secondary shadow-xl transition-all">
                     {isActionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Commit to Registry"}
                  </Button>
               </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-5xl">
         <div className="relative mb-12">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name, ID or designation..." 
              className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-900 shadow-sm border-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
         </div>

         {dataLoading ? (
           <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
         ) : (
           <div className="grid gap-6">
              {filtered.map((officer: any) => (
                <Card key={officer.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group transition-all hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                       <div className="p-8 md:w-56 text-center border-r bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center shrink-0">
                          <Badge variant="outline" className="text-[9px] font-mono font-bold border-accent text-accent mb-4 tracking-tighter">
                             {officer.employeeId || 'IO-TEMP'}
                          </Badge>
                          <div className="w-16 h-16 rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                             <UserRoundCheck className="w-8 h-8" />
                          </div>
                          <Badge className={cn("mt-4 text-[8px] font-black uppercase h-5", officer.status === 'active' ? "bg-emerald-500" : "bg-slate-400")}>
                             {officer.status}
                          </Badge>
                       </div>
                       
                       <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="space-y-4 text-center md:text-left flex-1">
                             <div className="space-y-1">
                                <h3 className="text-2xl font-headline font-bold text-primary dark:text-white leading-tight">{officer.name}</h3>
                                <p className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                                   <Briefcase className="w-3.5 h-3.5" /> {officer.designation}
                                </p>
                             </div>

                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-accent" /> {officer.email}</span>
                                <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-accent" /> {officer.phone || 'N/A'}</span>
                                {officer.password && (
                                  <span className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"><Lock className="w-3 h-3 text-slate-400" /> Credential Set</span>
                                )}
                             </div>
                          </div>

                          <div className="flex items-center gap-3">
                             <Button onClick={() => setEditOfficer(officer)} variant="outline" size="sm" className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 hover:bg-primary hover:text-white transition-all">Modify</Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                   <button className="h-10 w-10 text-slate-300 hover:text-red-500 transition-all rounded-xl flex items-center justify-center"><Trash2 className="w-5 h-5" /></button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900">
                                   <AlertDialogHeader>
                                      <AlertDialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Purge Record?</AlertDialogTitle>
                                      <AlertDialogDesc className="text-sm font-medium leading-relaxed">
                                        Permanently remove <strong>{officer.name}</strong> from the investigative selection pool? This will erase all credentials from the registry.
                                      </AlertDialogDesc>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter className="mt-6">
                                      <AlertDialogCancel className="rounded-xl h-11 font-bold">Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(officer.id)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11 font-bold text-white transition-all">Confirm Purge</AlertDialogAction>
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
                <div className="text-center py-40 opacity-30">
                   <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                   <p className="text-sm font-bold uppercase tracking-widest">Investigator Registry Empty</p>
                </div>
              )}
           </div>
         )}
      </section>

      {/* Edit Dialog */}
      <Dialog open={!!editOfficer} onOpenChange={(val) => !val && setEditOfficer(null)}>
        <DialogContent className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          {editOfficer && (
            <>
               <div className="bg-slate-900 p-8 text-white relative">
                  <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 h-8 w-8"><X className="w-4 h-4" /></Button></DialogClose></div>
                  <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2">Audit Editor</Badge>
                  <DialogTitle className="text-2xl font-headline font-bold">Update Profile Meta</DialogTitle>
               </div>
               <div className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Legal Name</Label><Input value={editOfficer.name} onChange={e => setEditOfficer({...editOfficer, name: e.target.value})} className="h-11 rounded-xl" /></div>
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Employee ID</Label>
                       <div className="flex gap-2">
                          <Input 
                            value={editOfficer.employeeId} 
                            onChange={e => setEditOfficer({...editOfficer, employeeId: e.target.value.toUpperCase()})} 
                            className="h-11 rounded-xl font-mono flex-1" 
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            title="Regenerate ID"
                            className="h-11 w-11 shrink-0 rounded-xl border-dashed"
                            onClick={() => setEditOfficer({...editOfficer, employeeId: generateOfficerId()})}
                          >
                            <Sparkles className="w-4 h-4 text-accent" />
                          </Button>
                       </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Official Email</Label><Input value={editOfficer.email} onChange={e => setEditOfficer({...editOfficer, email: e.target.value})} className="h-11 rounded-xl" /></div>
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Login Password</Label>
                       <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              value={editOfficer.password || ''} 
                              onChange={e => setEditOfficer({...editOfficer, password: e.target.value})} 
                              placeholder="Min 8 chars" 
                              className="h-11 rounded-xl pr-10" 
                              required 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-accent">
                               {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            title="Generate Protocol Password"
                            className="h-11 w-11 shrink-0 rounded-xl border-dashed hover:bg-accent/10"
                            onClick={() => setEditOfficer({...editOfficer, password: generateSmartPassword(editOfficer.name, editOfficer.phone)})}
                          >
                            <Lock className="w-4 h-4 text-accent" />
                          </Button>
                       </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 flex-1">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Assigned Rank</Label>
                       <Select value={editOfficer.designation} onValueChange={(val) => setEditOfficer({...editOfficer, designation: val})}>
                          <SelectTrigger className="h-11 rounded-xl">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-[1000001]">
                             {OFFICER_DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Phone</Label><Input value={editOfficer.phone} onChange={e => setEditOfficer({...editOfficer, phone: e.target.value})} className="h-11 rounded-xl" /></div>
                  </div>
                  <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl transition-all">
                     {isActionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Commit Profile Refresh"}
                  </Button>
               </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
