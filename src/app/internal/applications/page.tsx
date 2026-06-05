
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { AdminNavbar } from '@/components/admin-navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Search, 
  ShieldCheck, 
  Loader2, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
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
      <AdminNavbar />

      <section className="pt-32 pb-12 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-3 h-3" /> Personnel Vetting
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">New <span className="text-accent italic">Applications</span></h1>
              <p className="text-slate-400">Review and commission prospective members, volunteers, and executives.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'Pending', count: stats.pending, color: 'text-amber-400' },
                 { label: 'Approved', count: stats.approved, color: 'text-emerald-400' },
                 { label: 'Rejected', count: stats.rejected, color: 'text-red-400' },
                 { label: 'Archived', count: stats.archived, color: 'text-slate-400' }
               ].map((s) => (
                 <div key={s.label} className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center min-w-[100px]">
                   <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">{s.label}</p>
                   <p className={cn("text-xl font-bold", s.color)}>{s.count}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 border-b bg-white dark:bg-slate-900 sticky top-[72px] md:top-[84px] z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
               {(['All', 'Pending', 'Approved', 'Rejected', 'Archived'] as AppStatus[]).map((st) => (
                 <Button
                   key={st}
                   onClick={() => setActiveFilter(st)}
                   variant={activeFilter === st ? "default" : "ghost"}
                   className={cn(
                     "rounded-xl px-6 font-bold h-10 transition-all",
                     activeFilter === st 
                       ? "bg-accent text-primary shadow-lg" 
                       : "text-slate-500 hover:text-primary dark:hover:text-white"
                   )}
                 >
                   {st === 'All' ? 'Active Requests' : st}
                 </Button>
               ))}
            </div>

            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by name, ID or credentials..." 
                className="pl-12 h-12 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-accent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Applications Database...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((a: any) => (
                <Card key={a.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-8 bg-slate-50 dark:bg-slate-800 md:w-64 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                         <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl mb-4 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            {a.photoDataUri ? (
                              <Image src={a.photoDataUri} alt={a.name} fill className="object-cover" />
                            ) : (
                              <Camera className="w-8 h-8 text-slate-400" />
                            )}
                         </div>
                         <div className="mb-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Hash className="w-3 h-3" /> Reference ID</p>
                            <p className="font-bold text-lg tracking-tighter text-primary dark:text-white leading-none">{a.referenceId || 'N/A'}</p>
                         </div>
                         <Badge className={cn(
                           "font-bold uppercase tracking-widest text-[9px] px-4 py-1",
                           a.status === 'Pending' ? 'bg-amber-500 text-white' : 
                           a.status === 'Approved' ? 'bg-emerald-500 text-white' : 
                           a.status === 'Archived' ? 'bg-slate-400 text-white' : 'bg-red-500 text-white'
                         )}>
                           {a.status}
                         </Badge>
                         
                         <div className="mt-4 flex flex-col gap-2 w-full">
                           {a.hasNoCriminalRecord && (
                             <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                               <Gavel className="w-3 h-3 shrink-0" />
                               <span className="text-[8px] font-bold uppercase tracking-tighter">Affidavit Signed</span>
                             </div>
                           )}
                           {a.hasAcceptedDeclaration && (
                             <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
                               <ClipboardCheck className="w-3 h-3 shrink-0" />
                               <span className="text-[8px] font-bold uppercase tracking-tighter">Policy Declared</span>
                             </div>
                           )}
                           <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20">
                              <CalendarClock className="w-3 h-3 shrink-0" />
                              <span className="text-[8px] font-bold uppercase tracking-tighter">Term: {a.membershipDuration || '1 Year'}</span>
                           </div>
                         </div>
                      </div>
                      
                      <div className="flex-1 p-8 grid lg:grid-cols-4 gap-8 items-start">
                        <div className="lg:col-span-3 space-y-6">
                          <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-primary dark:text-white">{a.name}</h3>
                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                               <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-accent" /> {a.gender || 'N/A'}</span>
                               <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-accent" /> {a.email}</span>
                               <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-accent" /> {a.phone}</span>
                               <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-accent" /> Role: {a.memberType}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 mt-2">
                               <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Profession: {a.profession || 'Not Specified'}</span>
                               <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {a.districtName ? `${a.districtName}, ` : ''}{a.stateName || 'National'}</span>
                               <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Applied: {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString() : 'Recently'}</span>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                             <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-2"><GraduationCap className="w-3 h-3 text-accent" /> Educational Qualifications</p>
                                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{a.education || 'Not Provided'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-2"><Briefcase className="w-3 h-3 text-accent" /> Work Experience</p>
                                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{a.experience || 'Not Provided'}</p>
                                </div>
                             </div>

                             <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Residential Address</p>
                                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 italic">"{a.address}"</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                                   <div>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">PAN Card</p>
                                     <p className="font-mono text-xs font-bold">{a.pan || 'N/A'}</p>
                                   </div>
                                   <div>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Aadhaar</p>
                                     <p className="font-mono text-xs font-bold">**** {a.aadhaar?.slice(-4) || 'N/A'}</p>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {a.statusUpdateReason && (
                            <div className={cn(
                              "p-4 rounded-2xl border flex gap-3 items-start",
                              a.status === 'Approved' ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" : 
                              a.status === 'Archived' ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-red-50/50 border-red-100 text-red-800"
                            )}>
                              <Info className="w-4 h-4 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Official decision note</p>
                                <p className="text-sm font-medium">"{a.statusUpdateReason}"</p>
                                <p className="text-[8px] uppercase font-bold mt-2 opacity-60 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" /> Logged on {a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          )}

                          {a.status === 'Approved' && (
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-500">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                 <ShieldCheck className="w-3 h-3 text-emerald-500" /> Establish Communication
                               </p>
                               <div className="flex flex-wrap gap-3">
                                  <Button asChild variant="outline" className="rounded-xl gap-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-900/10 h-10 px-4 font-bold text-xs">
                                    <a href={`tel:${a.phone}`}><Phone className="w-3.5 h-3.5" /> Call Now</a>
                                  </Button>
                                  <Button asChild variant="outline" className="rounded-xl gap-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-900/10 h-10 px-4 font-bold text-xs">
                                    <a href={`https://wa.me/91${a.phone.replace(/\D/g, '')}`} target="_blank"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
                                  </Button>
                                  <Button asChild variant="outline" className="rounded-xl gap-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900/30 dark:hover:bg-indigo-900/10 h-10 px-4 font-bold text-xs">
                                    <a href={`mailto:${a.email}`}><Mail className="w-3.5 h-3.5" /> Send Email</a>
                                  </Button>
                               </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3 h-full">
                          {a.status === 'Pending' && (
                            <div className="w-full space-y-3">
                              <div className="space-y-1">
                                <Button onClick={() => setActionDialog({ open: true, type: 'Approve', applicationId: a.id, reason: '' })} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 rounded-xl gap-2 shadow-lg shadow-emerald-500/10 transition-all active:scale-95">
                                  <Check className="w-4 h-4" /> Approve Applicant
                                </Button>
                              </div>
                              
                              <div className="space-y-1.5">
                                <Button onClick={() => setActionDialog({ open: true, type: 'Reject', applicationId: a.id, reason: '' })} variant="outline" className="w-full text-red-500 border-red-100 hover:bg-red-50 font-bold h-12 rounded-xl gap-2 transition-all active:scale-95">
                                  <X className="w-4 h-4" /> Reject Application
                                </Button>
                                <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-tighter">Rejecting will log the decision and archive the record as unsuccessful.</p>
                              </div>
                            </div>
                          )}

                          {a.status !== 'Archived' && (
                            <div className="w-full space-y-1.5 mt-auto">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" className="rounded-xl w-full text-slate-400 hover:text-red-500 font-bold gap-2">
                                    <Archive className="w-4 h-4" /> Delete Entry
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                                  <AlertDialogHeader>
                                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-2">
                                      <Archive className="w-6 h-6 text-red-600" />
                                    </div>
                                    <AlertDialogTitle className="text-2xl font-headline font-bold">Archive Application Record?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove the personnel request from the active registry. A brief archival record will be preserved for organizational integrity and future audit.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="py-4">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Reason for Archival / Deletion</Label>
                                    <Textarea 
                                      placeholder="e.g. Duplicate submission, spam, or request for removal."
                                      className="rounded-xl min-h-[100px]"
                                      onChange={(e) => setActionDialog(prev => ({ ...prev, type: 'Archive', applicationId: a.id, reason: e.target.value }))}
                                    />
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={handleUpdateStatus} 
                                      className="bg-red-500 hover:bg-red-600 rounded-xl border-none text-white font-bold"
                                      disabled={!actionDialog.reason.trim()}
                                    >
                                      Confirm Archival
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-tighter">Deleting will remove the record from the active list, but a brief archival record remains.</p>
                            </div>
                          )}

                          {a.status === 'Archived' && (
                            <div className="w-full mt-auto">
                               <Button 
                                variant="outline" 
                                className="w-full rounded-xl gap-2 font-bold text-xs"
                                onClick={() => setActionDialog({ open: true, type: 'Approve', applicationId: a.id, reason: 'Restored from archives.' })}
                               >
                                 <History className="w-3.5 h-3.5" /> Restore Record
                               </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filtered.length === 0 && (
                <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                   <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                   </div>
                   <h3 className="text-xl font-headline font-bold text-primary dark:text-white mb-2">No matching records found</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Adjust your search or filter to view other categories.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog open={actionDialog.open && actionDialog.type !== 'Archive'} onOpenChange={(open) => !open && setActionDialog({ ...actionDialog, open })}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl max-w-md">
           <DialogHeader>
             <DialogTitle className={cn("text-2xl font-headline font-bold", actionDialog.type === 'Approve' ? "text-emerald-600" : "text-red-600")}>
               Confirm {actionDialog.type}
             </DialogTitle>
             <DialogDescription>
               Please specify the reason for this decision. This note will be recorded in the organizational audit trail.
             </DialogDescription>
           </DialogHeader>
           <div className="py-4 space-y-4">
             <div className="space-y-2">
               <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Official Decision Note</Label>
               <Textarea 
                placeholder={actionDialog.type === 'Approve' ? "e.g. Credentials verified, designation granted." : "e.g. Incomplete documentation, failed background check."}
                value={actionDialog.reason}
                onChange={(e) => setActionDialog({ ...actionDialog, reason: e.target.value })}
                className="rounded-2xl min-h-[120px]"
               />
             </div>
           </div>
           <DialogFooter>
             <Button onClick={handleUpdateStatus} disabled={isActionLoading || !actionDialog.reason.trim()} className={cn("w-full h-14 rounded-2xl font-bold text-lg shadow-xl", actionDialog.type === 'Approve' ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-red-500 hover:bg-red-600 text-white")}>
               {isActionLoading ? <Loader2 className="animate-spin" /> : `Finalize ${actionDialog.type}`}
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
