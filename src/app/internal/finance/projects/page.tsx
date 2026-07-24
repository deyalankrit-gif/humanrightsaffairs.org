"use client"

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Footer } from '@/components/footer'
import { 
  Building, 
  Plus, 
  ArrowLeft, 
  Loader2, 
  Search, 
  Briefcase, 
  TrendingUp, 
  Target, 
  ShieldCheck, 
  Calendar as CalendarIcon, 
  IndianRupee,
  Activity,
  Trash2,
  X
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function ProjectAccounting() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [search, setSearch] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    budget: '',
    utilized: '0',
    startDate: '',
    status: 'Active',
    description: ''
  })

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'finance_projects'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: projects, loading: projectsLoading } = useCollection(projectsQuery);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setIsActionLoading(true);

    try {
      await addDoc(collection(db, 'finance_projects'), {
        ...formData,
        budget: Number(formData.budget),
        utilized: Number(formData.utilized),
        createdAt: serverTimestamp(),
        createdBy: user.email
      });
      toast({ title: "Mission Project Registered", description: "Strategic accounting node established." });
      setIsAddOpen(false);
      setFormData({ name: '', code: '', budget: '', utilized: '0', startDate: '', status: 'Active', description: '' });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Strategic Error" });
    } finally {
      setIsActionLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !user) return;
    try {
      await deleteDoc(doc(db, 'finance_projects', id));
      toast({ title: "Project Archived" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>

  const filtered = (projects || []).filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-emerald-500/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/internal/finance/dashboard')} className="text-white hover:bg-white/10">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-headline font-bold">Project <span className="text-emerald-400 italic">Accounting</span></h1>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <ShieldCheck className="w-3.5 h-3.5" /> Mission-Based Fiscal Node
                </p>
              </div>
           </div>
           <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-8 rounded-xl shadow-xl">
             <Plus className="w-4 h-4 mr-2" /> Initialize Mission Project
           </Button>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
           <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search active missions..." 
                className="pl-9 h-11 rounded-xl bg-white dark:bg-slate-900 shadow-sm border-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        {projectsLoading ? (
          <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto" /></div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
             {filtered.map((proj: any) => {
               const percentage = Math.min(100, Math.round((proj.utilized / (proj.budget || 1)) * 100));
               return (
               <Card key={proj.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] group hover:shadow-2xl transition-all duration-500">
                  <CardHeader className="p-8 pb-0 flex flex-row items-start justify-between">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <Badge className="bg-emerald-500 text-white font-black text-[8px] uppercase tracking-widest border-none h-5">{proj.code}</Badge>
                           <Badge variant="outline" className="text-[8px] border-slate-100 dark:border-slate-800 uppercase font-bold">{proj.status}</Badge>
                        </div>
                        <CardTitle className="text-2xl font-headline font-bold text-primary dark:text-white pt-2">{proj.name}</CardTitle>
                     </div>
                     <Button variant="ghost" size="icon" onClick={() => handleDelete(proj.id)} className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500"><Trash2 className="w-4.5 h-4.5" /></Button>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic">"{proj.description || 'No strategic overview recorded.'}"</p>
                    
                    <div className="space-y-3">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fund Utilization</span>
                          <span className="text-sm font-black text-emerald-600">{percentage}%</span>
                       </div>
                       <Progress value={percentage} className="h-2 bg-slate-50 dark:bg-slate-800" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                       <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Budget</p>
                          <p className="text-lg font-black text-primary dark:text-white leading-none">₹{proj.budget?.toLocaleString()}</p>
                       </div>
                       <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Utilized</p>
                          <p className="text-lg font-black text-rose-500 leading-none">₹{proj.utilized?.toLocaleString()}</p>
                       </div>
                    </div>
                  </CardContent>
               </Card>
             )})}
             {filtered.length === 0 && (
               <div className="col-span-full text-center py-32 opacity-20">
                  <Target className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-xl font-headline font-bold">No mission projects established</p>
               </div>
             )}
          </div>
        )}
      </section>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent className="max-w-xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden [&>button]:hidden">
            <div className="bg-slate-900 p-8 text-white relative">
               <div className="absolute right-6 top-6">
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white hover:bg-white/10 h-8 w-8">
                      <X className="w-5 h-5" />
                    </Button>
                  </DialogClose>
               </div>
               <DialogTitle className="text-2xl font-headline font-bold">Mission Initialization</DialogTitle>
               <DialogDescription className="text-emerald-400 uppercase tracking-widest font-black text-[10px]">Strategic Project Entry Terminal</DialogDescription>
            </div>
            <form onSubmit={handleAddProject} className="p-8 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Project Name *</Label>
                     <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Mission Title" required />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Project Code *</Label>
                     <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="PROJ-2025" required />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Allocated Budget</Label>
                     <Input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} placeholder="₹" required />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Commencement Date</Label>
                     <Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Strategic Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Mission goals and scope..." className="min-h-[100px]" />
               </div>
               <Button type="submit" disabled={isActionLoading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-4 shadow-xl">
                 {isActionLoading ? <Loader2 className="animate-spin" /> : "Establish Strategic Node"}
               </Button>
            </form>
         </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
