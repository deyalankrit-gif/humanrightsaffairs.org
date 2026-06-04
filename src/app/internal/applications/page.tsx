
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
  ExternalLink
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

export default function InternalApplicationsPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  
  const [actionDialog, setActionDialog] = useState<{ open: boolean, type: 'Approve' | 'Reject', applicationId: string, reason: string }>({
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

  const handleDelete = (id: string) => {
    if (!db) return
    deleteDoc(doc(db, 'memberApplications', id))
      .then(() => toast({ title: "Application Record Purged" }))
  }

  const handleUpdateStatus = () => {
    if (!db || !actionDialog.applicationId) return
    setIsActionLoading(true)
    
    const newStatus = actionDialog.type === 'Approve' ? 'Approved' : 'Rejected'
    
    updateDoc(doc(db, 'memberApplications', actionDialog.applicationId), { 
      status: newStatus,
      statusUpdateReason: actionDialog.reason,
      updatedAt: new Date().toISOString()
    })
      .then(() => {
        toast({ title: `Application ${newStatus}`, description: `Decision logged: ${actionDialog.reason}` })
        setActionDialog({ open: false, type: 'Approve', applicationId: '', reason: '' })
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

  const filtered = (applications || []).filter((a: any) => 
    a.name?.toLowerCase().includes(search.toLowerCase()) || 
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.phone?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminNavbar />

      <section className="pt-32 pb-12 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-3 h-3" /> Personnel Vetting
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">New <span className="text-accent italic">Applications</span></h1>
              <p className="text-slate-400">Review and commission prospective members, volunteers, and executives.</p>
            </div>
            
            <div className="flex gap-4">
               <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                 <div className="text-right">
                   <p className="text-[10px] text-slate-500 font-bold uppercase">Pending Review</p>
                   <p className="text-xl font-bold text-accent">{(applications || []).filter((a: any) => a.status === 'Pending').length}</p>
                 </div>
                 <div className="w-px h-8 bg-white/10"></div>
                 <div className="text-right">
                   <p className="text-[10px] text-slate-500 font-bold uppercase">Processed</p>
                   <p className="text-xl font-bold text-emerald-400">{(applications || []).filter((a: any) => a.status !== 'Pending').length}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-b bg-white dark:bg-slate-900 sticky top-[72px] md:top-[84px] z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Filter by applicant name, email or phone..." 
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
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Applications Database...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((a: any) => (
                <Card key={a.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-8 bg-slate-50 dark:bg-slate-800 md:w-64 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                         <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 mb-4 text-primary dark:text-white font-bold text-xl">
                            {a.name?.charAt(0)}
                         </div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</span>
                         <Badge className={cn(
                           "font-bold uppercase tracking-widest text-[9px] px-4 py-1",
                           a.status === 'Pending' ? 'bg-amber-500' : 
                           a.status === 'Approved' ? 'bg-emerald-500' : 'bg-red-500'
                         )}>
                           {a.status}
                         </Badge>
                      </div>
                      
                      <div className="flex-1 p-8 grid lg:grid-cols-4 gap-8 items-start">
                        <div className="lg:col-span-3 space-y-6">
                          <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-primary dark:text-white">{a.name}</h3>
                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                               <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-accent" /> {a.email}</span>
                               <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-accent" /> {a.phone}</span>
                               <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-accent" /> Role: {a.memberType}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 mt-2">
                               <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {a.districtName ? `${a.districtName}, ` : ''}{a.stateName || 'National'}</span>
                               <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Applied: {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString() : 'Recently'}</span>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                             <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-2"><GraduationCap className="w-3 h-3" /> Educational Qualifications</p>
                                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{a.education || 'Not Provided'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-2"><Briefcase className="w-3 h-3" /> Work Experience</p>
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
                              a.status === 'Approved' ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" : "bg-red-50/50 border-red-100 text-red-800"
                            )}>
                              <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Decision Note</p>
                                <p className="text-sm font-medium">"{a.statusUpdateReason}"</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          {a.status === 'Pending' && (
                            <>
                              <Button onClick={() => setActionDialog({ open: true, type: 'Approve', applicationId: a.id, reason: '' })} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 rounded-xl gap-2 shadow-lg shadow-emerald-500/10">
                                <Check className="w-4 h-4" /> Approve
                              </Button>
                              <Button onClick={() => setActionDialog({ open: true, type: 'Reject', applicationId: a.id, reason: '' })} variant="outline" className="w-full text-red-500 border-red-100 hover:bg-red-50 font-bold h-12 rounded-xl gap-2">
                                <X className="w-4 h-4" /> Reject
                              </Button>
                            </>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" className="rounded-xl w-full text-slate-400 hover:text-red-500 font-bold gap-2">
                                <Trash2 className="w-4 h-4" /> Delete Entry
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Purge Application Record?</AlertDialogTitle>
                                <AlertDialogDescription>This will remove the personnel request from the secure archive. This action is recorded.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(a.id)} className="bg-red-500 hover:bg-red-600 rounded-xl border-none text-white font-bold">Delete Forever</AlertDialogAction>
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
                   <FileText className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest">No matching applications in the database.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Approve/Reject Reason Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ ...actionDialog, open })}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl max-w-md">
           <DialogHeader>
             <DialogTitle className={cn("text-2xl font-headline font-bold", actionDialog.type === 'Approve' ? "text-emerald-600" : "text-red-600")}>
               Confirm {actionDialog.type}
             </DialogTitle>
             <DialogDescription>
               Please specify the reason for this decision. This note will be recorded in the audit trail.
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
             <Button onClick={handleUpdateStatus} disabled={isActionLoading || !actionDialog.reason.trim()} className={cn("w-full h-14 rounded-2xl font-bold text-lg", actionDialog.type === 'Approve' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600")}>
               {isActionLoading ? <Loader2 className="animate-spin" /> : `Finalize ${actionDialog.type}`}
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
