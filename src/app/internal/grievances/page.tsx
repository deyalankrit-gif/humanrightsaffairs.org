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
      <section className="pt-32 pb-12 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-3 h-3" /> Grievance Oversight
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Member <span className="text-accent italic">Complaints</span></h1>
              <p className="text-slate-400">Review and resolve institutional grievances submitted by HRAT personnel.</p>
            </div>
            
            <div className="flex gap-4">
               <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                 <div className="text-right">
                   <p className="text-[10px] text-slate-500 font-bold uppercase">Pending</p>
                   <p className="text-xl font-bold text-accent">{(grievances || []).filter((g: any) => g.status === 'Pending').length}</p>
                 </div>
                 <div className="w-px h-8 bg-white/10"></div>
                 <div className="text-right">
                   <p className="text-[10px] text-slate-500 font-bold uppercase">Resolved</p>
                   <p className="text-xl font-bold text-emerald-400">{(grievances || []).filter((g: any) => g.status === 'Resolved').length}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-b bg-white dark:bg-slate-900 sticky top-12 z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search by token, name, or subject..." 
              className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Secure Vault...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((g: any) => (
                <Card key={g.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-8 bg-slate-50 dark:bg-slate-800 md:w-64 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                         <Hash className="w-6 h-6 text-accent mb-2" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Token ID</span>
                         <span className="text-2xl font-headline font-bold text-primary dark:text-white tracking-tighter mb-4">{g.token}</span>
                         <Badge className={cn(
                           "font-bold uppercase tracking-widest text-[9px] px-4 py-1",
                           g.status === 'Pending' ? 'bg-amber-500' : 
                           g.status === 'Resolved' ? 'bg-emerald-500' : 'bg-primary'
                         )}>
                           {g.status}
                         </Badge>
                      </div>
                      
                      <div className="flex-1 p-8 grid lg:grid-cols-4 gap-8 items-start">
                        <div className="lg:col-span-3 space-y-6">
                          <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-primary dark:text-white">{g.subject}</h3>
                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                               <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-accent" /> {g.name}</span>
                               <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-accent" /> {g.email}</span>
                               <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-accent" /> {g.phone}</span>
                               {g.memberId && <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-accent" /> ID: {g.memberId}</span>}
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 italic">
                              "{g.description}"
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                             <Clock className="w-3 h-3" /> Submitted: {g.createdAt?.toDate ? g.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="rounded-xl w-full font-bold gap-2">
                                Update Status <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                              <DropdownMenuItem onClick={() => handleUpdateStatus(g.id, 'Pending')} className="font-bold">Mark as Pending</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(g.id, 'Reviewed')} className="font-bold">Mark as Reviewed</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(g.id, 'Resolved')} className="font-bold text-emerald-600">Mark as Resolved</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" className="rounded-xl w-full text-slate-400 hover:text-red-500 font-bold gap-2">
                                <Trash2 className="w-4 h-4" /> Delete Record
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Permanently Delete Grievance?</AlertDialogTitle>
                                <AlertDialogDescription>This will remove the formal complaint from the archive. This action is irreversible.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(g.id)} className="bg-red-500 hover:bg-red-600 rounded-xl border-none">Delete Forever</AlertDialogAction>
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
                <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                   <MessageSquareWarning className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest">No matching grievances in the secure vault.</p>
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
