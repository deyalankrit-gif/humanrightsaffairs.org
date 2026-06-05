"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  ShieldCheck, 
  Loader2, 
  Trash2, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Hash, 
  MoreVertical,
  MessageSquareWarning
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export default function InternalGrievancesPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const grievancesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'grievances'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: grievances, loading: dataLoading } = useCollection(grievancesQuery);

  const handleDelete = (id: string) => {
    if (!db) return
    deleteDoc(doc(db, 'grievances', id))
      .then(() => toast({ title: "Record Deleted" }))
  }

  const handleUpdateStatus = (id: string, status: string) => {
    if (!db) return
    setIsActionLoading(true)
    updateDoc(doc(db, 'grievances', id), { status })
      .then(() => {
        toast({ title: "Status Updated", description: `Grievance is now ${status}.` })
        setIsActionLoading(false)
      })
      .catch(() => setIsActionLoading(false))
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  const filtered = (grievances || []).filter((g: any) => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.token?.toLowerCase().includes(search.toLowerCase()) ||
    g.subject?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Grievance Oversight
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Member <span className="text-accent italic">Complaints</span></h1>
              <p className="text-slate-400 text-[11px]">Review institutional grievances submitted by HRAT personnel.</p>
            </div>
            
            <div className="flex gap-2">
               <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                 <div className="text-center">
                   <p className="text-[8px] text-slate-500 font-bold uppercase">Pending</p>
                   <p className="text-lg font-bold text-accent">{(grievances || []).filter((g: any) => g.status === 'Pending').length}</p>
                 </div>
                 <div className="w-px h-6 bg-white/10"></div>
                 <div className="text-center">
                   <p className="text-[8px] text-slate-500 font-bold uppercase">Done</p>
                   <p className="text-lg font-bold text-emerald-400">{(grievances || []).filter((g: any) => g.status === 'Resolved').length}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search tokens or subjects..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((g: any) => (
                <Card key={g.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-5 bg-slate-50 dark:bg-slate-800 md:w-44 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">TOKEN</span>
                         <span className="text-xl font-headline font-bold text-primary dark:text-white tracking-tighter mb-2">{g.token}</span>
                         <Badge className={cn("text-[8px] font-bold px-2 py-0.5 rounded-full uppercase", g.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500')}>
                           {g.status}
                         </Badge>
                      </div>
                      <div className="flex-1 p-5 grid lg:grid-cols-4 gap-6 items-center">
                        <div className="lg:col-span-3 space-y-1">
                          <h3 className="text-lg font-bold text-primary leading-tight">{g.subject}</h3>
                          <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500">
                               <span className="flex items-center gap-1"><User className="w-2.5 h-2.5 text-accent" /> {g.name}</span>
                               <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5 text-accent" /> {g.email}</span>
                               <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-accent" /> {g.createdAt?.toDate ? g.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] px-3 font-bold" onClick={() => handleUpdateStatus(g.id, 'Resolved')}>Resolve</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(g.id)} className="h-8 w-8 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
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
