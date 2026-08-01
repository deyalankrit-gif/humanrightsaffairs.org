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
  User
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function InvestigationOfficersRegistry() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editOfficer, setEditOfficer] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    title: 'Investigative Officer',
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !formData.name.trim()) return
    setIsActionLoading(true)

    try {
      await addDoc(collection(db, 'investigation_officers'), {
        ...formData,
        createdAt: serverTimestamp()
      })
      toast({ title: "Officer Registered", description: `${formData.name} added to master pool.` })
      setFormData({ name: '', title: 'Investigative Officer', status: 'active' })
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
    o.title.toLowerCase().includes(search.toLowerCase())
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
            <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
               <div className="bg-slate-900 p-8 text-white relative">
                  <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 h-8 w-8"><X className="w-4 h-4" /></Button></DialogClose></div>
                  <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2">Personnel Node</Badge>
                  <DialogTitle className="text-2xl font-headline font-bold">Register Officer</DialogTitle>
                  <DialogDescription className="text-slate-400">Add an official to the investigative selection pool.</DialogDescription>
               </div>
               <form onSubmit={handleAdd} className="p-8 space-y-6">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Officer Name *</Label>
                     <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Adv. Sourav Chatterjee" className="h-11 rounded-xl" required />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Designation / Title</Label>
                     <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Senior Investigative Officer" className="h-11 rounded-xl" />
                  </div>
                  <Button type="submit" disabled={isActionLoading} className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-secondary shadow-xl transition-all">
                     {isActionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Commit to Registry"}
                  </Button>
               </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-4xl">
         <div className="relative mb-12">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search registry by name or title..." 
              className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-900 shadow-sm border-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
         </div>

         {dataLoading ? (
           <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
         ) : (
           <div className="grid gap-4">
              {filtered.map((officer: any) => (
                <Card key={officer.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 group transition-all hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="flex items-center p-6 gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                          <UserRoundCheck className="w-7 h-7" />
                       </div>
                       <div className="flex-1">
                          <h3 className="text-lg font-bold text-primary dark:text-white leading-tight">{officer.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{officer.title}</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <Badge className={cn("text-[8px] font-black uppercase h-5", officer.status === 'active' ? "bg-emerald-500" : "bg-slate-400")}>{officer.status}</Badge>
                          <AlertDialog>
                             <AlertDialogTrigger asChild>
                                <button className="h-9 w-9 text-slate-300 hover:text-red-500 transition-all rounded-lg flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                             </AlertDialogTrigger>
                             <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                                <AlertDialogHeader>
                                   <AlertDialogTitle>Purge Record?</AlertDialogTitle>
                                   <AlertDialogDesc>Remove {officer.name} from the investigative pool?</AlertDialogDesc>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                   <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => handleDelete(officer.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">Confirm Purge</AlertDialogAction>
                                </AlertDialogFooter>
                             </AlertDialogContent>
                          </AlertDialog>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filtered.length === 0 && (
                <div className="text-center py-32 opacity-20">
                   <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                   <p className="text-sm font-bold uppercase tracking-widest">Investigator Registry Empty</p>
                </div>
              )}
           </div>
         )}
      </section>

      <Footer />
    </main>
  )
}
