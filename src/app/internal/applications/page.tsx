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
  Archive,
  Camera,
  Filter,
  RefreshCw,
  MessageSquare
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
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
  
  const [actionDialog, setActionDialog] = useState<{ 
    open: boolean, 
    status: 'Pending' | 'Approved' | 'Rejected' | 'Archived', 
    applicationId: string, 
    reason: string 
  }>({
    open: false,
    status: 'Pending',
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
    
    updateDoc(doc(db, 'memberApplications', actionDialog.applicationId), { 
      status: actionDialog.status,
      statusUpdateReason: actionDialog.reason,
      updatedAt: new Date().toISOString()
    })
      .then(() => {
        toast({ 
          title: `Status: ${actionDialog.status}`, 
          description: `Application record updated and decision logged.` 
        })
        setActionDialog({ open: false, status: 'Pending', applicationId: '', reason: '' })
        setIsActionLoading(false)
      })
      .catch(() => {
        toast({ variant: "destructive", title: "Update Failed", description: "Could not sync status with national database." })
        setIsActionLoading(false)
      })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-500 text-white hover:bg-emerald-600'
      case 'Rejected': return 'bg-red-500 text-white hover:bg-red-600'
      case 'Archived': return 'bg-blue-500 text-white hover:bg-blue-600'
      default: return 'bg-amber-500 text-white hover:bg-amber-600'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-emerald-400'
      case 'Rejected': return 'text-red-400'
      case 'Archived': return 'text-blue-400'
      default: return 'text-amber-400'
    }
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
                 { label: 'ARC', count: stats.archived, color: 'text-blue-400' },
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
                 <button
                   key={st}
                   onClick={() => setActiveFilter(st)}
                   className={cn(
                     "rounded-lg px-4 font-bold h-8 text-[11px] transition-all",
                     activeFilter === st 
                       ? "bg-accent text-primary shadow-sm" 
                       : "text-slate-500 hover:bg-slate-200"
                   )}
                 >
                   {st}
                 </button>
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
                <Card key={a.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 relative group">
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
                         <Badge className={cn("text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase border-none", getStatusColor(a.status))}>
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
                                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{a.education || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Experience</p>
                                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{a.experience || 'N/A'}</p>
                                </div>
                             </div>
                             <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 flex items-center justify-center">
                                <p className="text-[10px] leading-relaxed text-slate-500 italic text-center">"{a.address}"</p>
                             </div>
                          </div>
                          
                          {a.statusUpdateReason && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 flex items-start gap-2">
                              <MessageSquare className="w-3 h-3 text-slate-400 mt-0.5" />
                              <p className="text-[10px] text-slate-500 font-medium">Log: {a.statusUpdateReason}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 h-full justify-center">
                          <div className="w-full space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Update Status</p>
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => setActionDialog({ open: true, status: 'Approved', applicationId: a.id, reason: '' })} 
                                className="bg-emerald-500 text-white font-bold h-8 rounded-lg text-[9px] hover:bg-emerald-600 px-1"
                              >
                                <Check className="w-2.5 h-2.5 mr-1" /> Approve
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => setActionDialog({ open: true, status: 'Rejected', applicationId: a.id, reason: '' })} 
                                className="bg-red-500 text-white font-bold h-8 rounded-lg text-[9px] hover:bg-red-600 px-1"
                              >
                                <X className="w-2.5 h-2.5 mr-1" /> Reject
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => setActionDialog({ open: true, status: 'Archived', applicationId: a.id, reason: '' })} 
                                className="bg-blue-500 text-white font-bold h-8 rounded-lg text-[9px] hover:bg-blue-600 px-1"
                              >
                                <Archive className="w-2.5 h-2.5 mr-1" /> Archive
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => setActionDialog({ open: true, status: 'Pending', applicationId: a.id, reason: '' })} 
                                className="bg-amber-500 text-white font-bold h-8 rounded-lg text-[9px] hover:bg-amber-600 px-1"
                              >
                                <Clock className="w-2.5 h-2.5 mr-1" /> Pending
                              </Button>
                            </div>
                          </div>
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

      <Dialog open={actionDialog.open} onOpenChange={(val) => setActionDialog(prev => ({ ...prev, open: val }))}>
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <RefreshCw className="w-5 h-5 text-accent" /> Change Record Status
            </DialogTitle>
            <DialogDescription>
              Transitioning application to <span className={cn("font-bold", getStatusTextColor(actionDialog.status))}>{actionDialog.status}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status Change Justification *</Label>
               <Textarea 
                placeholder="Record the reasoning for this personnel decision..." 
                className="rounded-xl min-h-[100px]"
                value={actionDialog.reason}
                onChange={(e) => setActionDialog(prev => ({ ...prev, reason: e.target.value }))}
               />
             </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={isActionLoading || !actionDialog.reason.trim()}
              className={cn("w-full h-12 rounded-xl font-bold transition-all", getStatusColor(actionDialog.status))}
            >
              {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit Decision to Registry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
