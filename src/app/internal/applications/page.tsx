"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  ShieldCheck, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Check,
  X,
  GraduationCap,
  Briefcase,
  Info,
  Gavel,
  CalendarClock,
  ClipboardCheck,
  Hash,
  Camera,
  Archive,
  History,
  Filter,
  MessageCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import Image from 'next/image'

type AppStatus = 'All' | 'Pending' | 'Approved' | 'Rejected' | 'Archived'

export default function InternalApplicationsPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<AppStatus>('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  
  const [actionDialog, setActionDialog] = useState<{ open: boolean, type: 'Approve' | 'Reject' | 'Archive', applicationId: string, reason: string }>({
    open: false,
    type: 'Approve',
    applicationId: '',
    reason: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const applicationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'memberApplications'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: applications, loading: dataLoading } = useCollection(applicationsQuery);

  const handleUpdateStatus = () => {
    if (!db || !actionDialog.applicationId) return
    setIsActionLoading(true)
    
    let newStatus = 'Pending'
    if (actionDialog.type === 'Approve') newStatus = 'Approved'
    else if (actionDialog.type === 'Reject') newStatus = 'Rejected'
    else if (actionDialog.type === 'Archive') newStatus = 'Archived'
    
    updateDoc(doc(db, 'memberApplications', actionDialog.applicationId), { 
      status: newStatus,
      statusUpdateReason: actionDialog.reason,
      updatedAt: new Date().toISOString()
    })
      .then(() => {
        toast({ 
          title: `Application ${newStatus}`, 
          description: actionDialog.type === 'Archive' 
            ? "Record moved to secure archival storage." 
            : `Decision logged: ${actionDialog.reason}` 
        })
        setActionDialog({ open: false, type: 'Approve', applicationId: '', reason: '' })
        setIsActionLoading(false)
      })
      .catch(() => setIsActionLoading(false))
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Personnel Credentials...</p>
        </div>
      </div>
    )
  }

  const filtered = (applications || []).filter((a: any) => {
    const matchesSearch = a.name?.toLowerCase().includes(search.toLowerCase()) || 
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.phone?.toLowerCase().includes(search.toLowerCase()) ||
      a.referenceId?.toLowerCase().includes(search.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    return matchesSearch && a.status === activeFilter;
  })

  const stats = {
    pending: (applications || []).filter((a: any) => a.status === 'Pending').length,
    approved: (applications || []).filter((a: any) => a.status === 'Approved').length,
    rejected: (applications || []).filter((a: any) => a.status === 'Rejected').length,
    archived: (applications || []).filter((a: any) => a.status === 'Archived').length,
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Member Vetting
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">New <span className="text-accent italic">Applications</span></h1>
              <p className="text-slate-400 text-[11px]">Review and commission prospective members and volunteers.</p>
            </div>
            
            <div className="flex gap-2">
               {[
                 { label: 'PND', count: stats.pending, color: 'text-amber-400' },
                 { label: 'APR', count: stats.approved, color: 'text-emerald-400' },
                 { label: 'REJ', count: stats.rejected, color: 'text-red-400' },
               ].map((s) => (
                 <div key={s.label} className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-center min-w-[70px]">
                   <p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">{s.label}</p>
                   <p className={cn("text-lg font-bold leading-none", s.color)}>{s.count}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
               {(['All', 'Pending', 'Approved', 'Rejected', 'Archived'] as AppStatus[]).map((st) => (
                 <Button
                   key={st}
                   onClick={() => setActiveFilter(st)}
                   variant={activeFilter === st ? "default" : "ghost"}
                   className={cn(
                     "rounded-lg px-4 font-bold h-8 text-[11px] transition-all",
                     activeFilter === st 
                       ? "bg-accent text-primary shadow-sm" 
                       : "text-slate-500"
                   )}
                 >
                   {st}
                 </Button>
               ))}
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search candidates..." 
                className="pl-9 h-10 rounded-xl border-slate-200 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
              {filtered.map((a: any) => (
                <Card key={a.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 relative">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800 md:w-56 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                         <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg mb-3 bg-slate-200">
                            {a.photoDataUri ? <Image src={a.photoDataUri} alt={a.name} fill className="object-cover" /> : <Camera className="w-6 h-6 text-slate-400" />}
                         </div>
                         <div className="mb-2">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">REF ID</p>
                            <p className="font-bold text-sm tracking-tighter text-primary dark:text-white leading-none">{a.referenceId || 'N/A'}</p>
                         </div>
                         <Badge className={cn("text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase", a.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500')}>
                           {a.status}
                         </Badge>
                      </div>
                      
                      <div className="flex-1 p-6 grid lg:grid-cols-4 gap-6 items-start">
                        <div className="lg:col-span-3 space-y-4">
                          <div>
                            <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{a.name}</h3>
                            <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500 mt-1">
                               <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5 text-accent" /> {a.email}</span>
                               <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5 text-accent" /> {a.phone}</span>
                               <span className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5 text-accent" /> {a.memberType}</span>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                             <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 space-y-2">
                                <div>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Education</p>
                                  <p className="text-[11px] font-bold text-slate-700">{a.education || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Experience</p>
                                  <p className="text-[11px] font-bold text-slate-700">{a.experience || 'N/A'}</p>
                                </div>
                             </div>
                             <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 flex items-center justify-center">
                                <p className="text-[10px] leading-relaxed text-slate-500 italic text-center">"{a.address}"</p>
                             </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 h-full justify-center">
                          {a.status === 'Pending' ? (
                            <div className="w-full space-y-2">
                              <Button size="sm" onClick={() => setActionDialog({ open: true, type: 'Approve', applicationId: a.id, reason: '' })} className="w-full bg-emerald-500 text-white font-bold h-9 rounded-xl text-[11px]">
                                <Check className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setActionDialog({ open: true, type: 'Reject', applicationId: a.id, reason: '' })} className="w-full text-red-500 border-red-100 h-9 rounded-xl text-[11px]">
                                <X className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setActionDialog({ open: true, type: 'Archive', applicationId: a.id, reason: '' })} className="w-full text-slate-400 h-9 rounded-xl text-[11px]">
                              <Archive className="w-3 h-3 mr-1" /> Archive
                            </Button>
                          )}
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
