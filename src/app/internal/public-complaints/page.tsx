"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, orderBy, deleteDoc, doc, updateDoc, writeBatch, where } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Eye,
  FileText,
  MapPin,
  Calendar as CalendarIcon,
  X,
  AlertCircle,
  Briefcase,
  Gavel,
  Scale,
  CheckCircle2,
  MoreVertical,
  Activity,
  Filter,
  BarChart3,
  TrendingUp,
  LayoutDashboard,
  Users,
  Edit3
} from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { generateCaseId, getStatusColor } from '@/lib/complaint-utils'
import { CASE_STATUSES } from '@/lib/complaint-constants'
import Link from 'next/link'

export default function PublicComplaintsTerminal() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [investigatorFilter, setInvestigatorFilter] = useState('All')
  const [isActionLoading, setIsActionLoading] = useState(false)

  const userRegistryRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);

  const { data: permissions, loading: permsLoading } = useDoc(userRegistryRef);

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com'
  const hasAccess = isRoot || (permissions?.permissions?.publicComplaints === true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
      return
    }
    if (user && !permsLoading && permissions && !hasAccess) {
      router.push('/internal/public-view')
    }
  }, [user, authLoading, permissions, permsLoading, hasAccess, router])

  const complaintsQuery = useMemoFirebase(() => {
    if (!db || !user || !hasAccess) return null;
    return query(collection(db, 'public_complaints'), orderBy('createdAt', 'desc'));
  }, [db, user, hasAccess]);

  const { data: complaints, loading: dataLoading } = useCollection(complaintsQuery);

  const officersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'investigation_officers'), where('status', '==', 'active'));
  }, [db]);

  const { data: registryOfficers } = useCollection(officersQuery);

  const investigators = useMemo(() => {
    if (!registryOfficers) return [];
    return Array.from(new Set(registryOfficers.map((o: any) => o.name).filter(Boolean)));
  }, [registryOfficers]);

  // Stats Logic
  const stats = useMemo(() => {
    const list = complaints || [];
    const total = list.length;
    const pending = list.filter((c:any) => c.status === 'Pending' || c.status === 'New Complaint').length;
    const inProgress = list.filter((c:any) => ['Under Preliminary Review', 'Assigned for Investigation', 'Investigation in Progress'].includes(c.status)).length;
    const actionTaken = list.filter((c:any) => c.status === 'Action Taken' || c.status === 'Resolved').length;
    const closed = list.filter((c:any) => c.status === 'Closed').length;

    return { total, pending, inProgress, actionTaken, closed };
  }, [complaints]);

  const handleDelete = async (id: string) => {
    if (!db || !isRoot) return
    setIsActionLoading(true)
    try {
      await deleteDoc(doc(db, 'public_complaints', id))
      toast({ title: "Record Purged" })
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Denied" })
    } finally {
      setIsActionLoading(false)
    }
  }

  if (authLoading || permsLoading || !user || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  const filtered = (complaints || []).filter((c: any) => 
    (c.fullName || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.token || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.caseId || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.subject || '').toLowerCase().includes(search.toLowerCase())
  ).filter((c: any) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesInvestigator = investigatorFilter === 'All' || 
      (c.assignedOfficers || []).some((o: any) => o.name === investigatorFilter) ||
      (c.assignedTo === investigatorFilter);
    return matchesStatus && matchesInvestigator;
  })

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 w-full overflow-x-hidden">
      <section className="pt-16 pb-12 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Rights Oversight Console
              </div>
              <h1 className="text-3xl md:text-5xl font-headline font-bold leading-tight">Case <span className="text-accent italic">Management</span></h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">National Investigative & Reporting Terminal</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full md:w-auto">
               {[
                 { label: 'Total', val: stats.total, color: 'text-white' },
                 { label: 'New', val: stats.pending, color: 'text-red-500' },
                 { label: 'Active', val: stats.inProgress, color: 'text-blue-400' },
                 { label: 'Done', val: stats.closed, color: 'text-emerald-400' },
               ].map((s) => (
                 <div key={s.label} className="bg-white/5 px-4 py-3 rounded-2xl border border-white/10 text-center shadow-xl">
                   <p className="text-[8px] text-slate-500 font-black uppercase mb-1 tracking-widest">{s.label}</p>
                   <p className={cn("text-xl md:text-2xl font-black leading-none", s.color)}>{s.val}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-12 md:top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex w-full overflow-x-auto no-scrollbar gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border">
               {['All', ...CASE_STATUSES.slice(0, 3), 'Action Taken', 'Closed'].map(st => (
                 <button 
                  key={st} 
                  onClick={() => setStatusFilter(st)} 
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-tight transition-all shrink-0", 
                    statusFilter === st ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:bg-white"
                  )}
                 >
                   {st}
                 </button>
               ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
              <Button 
                onClick={() => router.push('/internal/public-complaints/analytics')}
                variant="outline" 
                className="w-full sm:w-auto h-11 rounded-xl bg-accent/5 border-accent/20 text-accent font-black text-[9px] uppercase tracking-widest px-6"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-2" /> Analytics
              </Button>

              <Select value={investigatorFilter} onValueChange={setInvestigatorFilter}>
                <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl border-slate-200 bg-white font-bold text-[9px] uppercase tracking-widest"><SelectValue placeholder="Officer" /></SelectTrigger>
                <SelectContent className="bg-white z-[1000000]"><SelectItem value="All">All Officers</SelectItem>{investigators.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
              </Select>

              <div className="relative w-full sm:w-64"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Search Docket, Name..." className="pl-10 h-11 rounded-xl border-slate-200 text-xs shadow-inner bg-slate-50 dark:bg-slate-950" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 pb-32">
        <div className="container mx-auto px-4 max-w-6xl">
          {dataLoading ? (
            <div className="text-center py-32"><Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing...</p></div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6">
              {filtered.map((c: any) => (
                <Card key={c.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 group hover:shadow-xl transition-all duration-500">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800 md:w-56 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0 space-y-3">
                         <div className="space-y-1"><span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">DOCKET</span><div className="text-xs md:text-sm font-black text-primary dark:text-white tracking-tighter bg-white dark:bg-slate-950 px-3 py-1 rounded-lg shadow-sm whitespace-nowrap">{c.caseId || 'NEW'}</div></div>
                         <div className="space-y-1"><span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">TOKEN</span><div className="text-[10px] font-mono font-bold text-accent whitespace-nowrap">{c.token}</div></div>
                         <Badge className={cn("text-[8px] font-black uppercase px-4 py-1 rounded-full border-none shadow-sm", getStatusColor(c.status))}>{c.status}</Badge>
                      </div>
                      <div className="flex-1 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-center">
                        <div className="lg:col-span-3 space-y-4">
                          <div className="space-y-1">
                             <div className="flex flex-wrap items-center gap-3">
                               <h3 className="text-xl md:text-2xl font-headline font-bold text-primary dark:text-white leading-tight group-hover:text-accent transition-colors">{c.subject}</h3>
                               {c.victimIsMinor && <Badge className="bg-red-600 text-white text-[7px] font-black animate-pulse">MINOR</Badge>}
                             </div>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3 h-3 text-accent" /> {c.incidentLocation}</p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                             <div className="space-y-1"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Name</p><p className="text-xs font-bold truncate">{c.fullName}</p></div>
                             <div className="space-y-1"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date</p><p className="text-xs font-bold">{c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : 'Now'}</p></div>
                             <div className="space-y-1 col-span-2 sm:col-span-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Team</p>
                                <p className="text-xs font-black text-emerald-600 uppercase truncate">
                                   {(c.investigationTeam || []).length > 0 ? `${(c.investigationTeam || []).length} Officers` : 'Unassigned'}
                                </p>
                             </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2.5 h-full justify-center">
                          <Button size="lg" className="w-full bg-primary text-white font-bold h-11 rounded-xl text-[10px] uppercase tracking-widest gap-2 shadow-lg hover:bg-secondary transition-all" onClick={() => router.push(`/internal/public-complaints/${c.id}`)}>
                            <LayoutDashboard className="w-4 h-4" /> Manage
                          </Button>
                          
                          {isRoot && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-10 text-red-500/60 hover:text-red-500 transition-colors uppercase font-black text-[9px] tracking-widest">
                                  <Trash2 className="w-4 h-4 mr-2" /> Purge
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2.5rem] w-[95vw] md:w-full">
                                <AlertDialogHeader><AlertDialogTitle>Purge Record?</AlertDialogTitle><AlertDialogDescription>This action is irreversible.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">Confirm</AlertDialogAction></AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 opacity-30"><Activity className="w-20 h-20 mx-auto mb-6" /><p className="text-xl font-headline font-bold uppercase tracking-widest">Registry Empty</p></div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}