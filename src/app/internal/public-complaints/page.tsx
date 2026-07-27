
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
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
  Baby,
  UserRoundX,
  ImageIcon,
  ShieldAlert
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function PublicComplaintsTerminal() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!db) return
    setIsActionLoading(true)
    try {
      await updateDoc(doc(db, 'public_complaints', id), { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      toast({ title: "Status Transitioned", description: `Complaint marked as ${newStatus}.` })
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Transition Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !isRoot) return
    try {
      await deleteDoc(doc(db, 'public_complaints', id))
      toast({ title: "Record Purged" })
      setSelectedComplaint(null)
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Denied" })
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
    (c.subject || '').toLowerCase().includes(search.toLowerCase())
  ).filter((c: any) => statusFilter === 'All' || c.status === statusFilter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-500 text-white'
      case 'In Progress': return 'bg-blue-500 text-white'
      default: return 'bg-amber-500 text-white'
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Rights Enforcement
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Public <span className="text-accent italic">Complaints</span></h1>
              <p className="text-slate-400 text-[11px]">National oversight for citizen-reported human rights violations.</p>
            </div>
            
            <div className="flex gap-2">
               {[
                 { label: 'PND', count: (complaints || []).filter((c:any) => c.status === 'Pending').length, color: 'text-amber-400' },
                 { label: 'PRG', count: (complaints || []).filter((c:any) => c.status === 'In Progress').length, color: 'text-blue-400' },
                 { label: 'RES', count: (complaints || []).filter((c:any) => c.status === 'Resolved').length, color: 'text-emerald-400' },
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

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
             {['All', 'Pending', 'In Progress', 'Resolved'].map(st => (
               <button 
                 key={st} 
                 onClick={() => setStatusFilter(st)}
                 className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", statusFilter === st ? "bg-accent text-primary shadow-md" : "text-slate-500 hover:bg-slate-200")}
               >
                 {st}
               </button>
             ))}
          </div>
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search tokens, names or subjects..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((c: any) => (
                <Card key={c.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 relative group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-5 bg-slate-50 dark:bg-slate-800 md:w-48 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">TOKEN</span>
                         <span className="text-lg font-headline font-bold text-primary dark:text-white tracking-tighter mb-2">{c.token}</span>
                         <Badge className={cn("text-[8px] font-bold px-3 py-1 rounded-full uppercase border-none", getStatusColor(c.status))}>
                           {c.status}
                         </Badge>
                      </div>
                      <div className="flex-1 p-6 grid lg:grid-cols-4 gap-6 items-center">
                        <div className="lg:col-span-3 space-y-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-primary dark:text-white leading-tight group-hover:text-accent transition-colors">{c.subject}</h3>
                            {c.victimIsMinor && <Badge className="bg-red-500 text-white text-[7px] animate-pulse">MINOR</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                               <span className="flex items-center gap-1"><User className="w-3 h-3 text-accent" /> {c.fullName}</span>
                               <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-accent" /> {c.incidentLocation}</span>
                               <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-accent" /> {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-9 rounded-xl text-[10px] px-4 font-black uppercase tracking-widest gap-2" onClick={() => setSelectedComplaint(c)}>
                            <Eye className="w-3.5 h-3.5" /> Review Details
                          </Button>
                          {isRoot && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Purge permanent record?</AlertDialogTitle>
                                  <AlertDialogDescription>This will completely erase complaint "{c.token}" and all associated evidence from the national registry. This action is irreversible.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">Purge Record</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-32 opacity-30">
                  <FileText className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-headline font-bold">No public complaints identified.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Complaint Detailed Review Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(val) => !val && setSelectedComplaint(null)}>
        <DialogContent className="max-w-5xl p-0 border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 flex flex-col [&>button]:hidden max-h-[90vh]">
          <DialogHeader className="sr-only">
             <DialogTitle>Complaint: {selectedComplaint?.token}</DialogTitle>
             <DialogDescription>Full record details for investigation.</DialogDescription>
          </DialogHeader>
          <div className="absolute right-6 top-6 z-50">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-500 text-white h-10 w-10 shadow-xl transition-all hover:scale-110 active:scale-95 duration-300">
                <X className="w-6 h-6 text-white" />
              </Button>
            </DialogClose>
          </div>
          
          {selectedComplaint && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <div className="flex flex-col">
                  {/* Header Branding */}
                  <div className="relative bg-slate-900 p-12 md:p-16 text-white overflow-hidden border-b-8 border-accent/20">
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-[-20px]"><ShieldAlert className="w-64 h-64 md:w-96 md:h-96" /></div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-3">
                         <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 backdrop-blur-md", getStatusColor(selectedComplaint.status))}>
                            Status: {selectedComplaint.status}
                         </div>
                         {selectedComplaint.victimIsMinor && (
                           <Badge className="bg-red-600 text-white text-[10px] font-black h-7 px-4 animate-pulse">CRITICAL: MINOR VICTIM</Badge>
                         )}
                      </div>
                      <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight drop-shadow-xl">{selectedComplaint.subject}</h2>
                      <div className="flex flex-wrap items-center gap-6 pt-2 font-bold uppercase tracking-widest text-[10px] md:text-xs text-white/60">
                         <span className="flex items-center gap-2"><Hash className="w-4 h-4 text-accent" /> Token: {selectedComplaint.token}</span>
                         <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-accent" /> Filed: {selectedComplaint.createdAt?.toDate ? selectedComplaint.createdAt.toDate().toLocaleDateString() : 'N/A'}</span>
                         <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> Venue: {selectedComplaint.incidentLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 md:p-16 space-y-12 pb-24">
                     {/* Complainant Grid */}
                     <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2"><User className="w-4 h-4" /> Complainant Information</h4>
                           <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6 shadow-inner">
                              <div className="grid grid-cols-2 gap-6">
                                 <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Full Legal Name</p><p className="text-sm font-bold text-primary dark:text-white">{selectedComplaint.fullName}</p></div>
                                 <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Relation Name</p><p className="text-sm font-bold text-primary dark:text-white">{selectedComplaint.relationName}</p></div>
                                 <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Phone</p><p className="text-sm font-bold text-primary dark:text-white">{selectedComplaint.phone}</p></div>
                                 <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Aadhaar</p><p className="text-sm font-bold text-primary dark:text-white font-mono">{selectedComplaint.aadhaar}</p></div>
                              </div>
                              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                 <p className="text-[8px] font-bold text-slate-400 uppercase mb-2">Residential Address</p>
                                 <p className="text-xs font-medium leading-relaxed italic">"{selectedComplaint.address}, P.O: {selectedComplaint.postOffice}, P.S: {selectedComplaint.policeStation}, PIN: {selectedComplaint.pinCode}"</p>
                              </div>
                           </div>
                        </div>

                        {selectedComplaint.isThirdParty && (
                           <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2"><UserRoundX className="w-4 h-4" /> Victim Details (Third Party)</h4>
                              <div className="bg-indigo-50/30 dark:bg-indigo-950/20 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/50 space-y-6">
                                 <div className="grid grid-cols-2 gap-6">
                                    <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Victim Name</p><p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{selectedComplaint.victimName}</p></div>
                                    <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Victim Contact</p><p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{selectedComplaint.victimPhone || 'N/A'}</p></div>
                                 </div>
                                 {selectedComplaint.victimIsMinor && (
                                   <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-red-100 flex items-center gap-4">
                                      <Baby className="w-6 h-6 text-red-500" />
                                      <div><p className="text-[8px] font-bold text-slate-400 uppercase">Minor Status</p><p className="text-xs font-bold text-red-600">Age: {selectedComplaint.victimAge} • Gender: {selectedComplaint.victimGender}</p></div>
                                   </div>
                                 )}
                                 <div className="pt-4 border-t border-indigo-100">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-2">Victim Location</p>
                                    <p className="text-xs italic text-indigo-700/80 leading-relaxed">"{selectedComplaint.victimAddress || 'Same as complainant'}"</p>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Narrative Section */}
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-white flex items-center gap-2"><Scale className="w-4 h-4 text-emerald-500" /> Violation Narrative</h4>
                        <div className="bg-slate-50 dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1.5 h-full bg-accent"></div>
                           <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-body italic">
                              "{selectedComplaint.description}"
                           </p>
                           <div className="grid md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                              <div><h5 className="text-[10px] font-black uppercase text-slate-400 mb-3">Accused Identifiers</h5><p className="text-sm font-medium text-red-600 leading-relaxed">"{selectedComplaint.accusedDetails || 'Not specified.'}"</p></div>
                              <div><h5 className="text-[10px] font-black uppercase text-slate-400 mb-3">Witness Testimony</h5><p className="text-sm font-medium text-emerald-600 leading-relaxed">"{selectedComplaint.witnesses || 'No witnesses recorded.'}"</p></div>
                           </div>
                        </div>
                     </div>

                     {/* Evidence Gallery */}
                     {selectedComplaint.incidentPhotos && selectedComplaint.incidentPhotos.length > 0 && (
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-white flex items-center gap-2"><ImageIcon className="w-4 h-4 text-indigo-500" /> Attached Incident Photos</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              {selectedComplaint.incidentPhotos.map((photo: string, idx: number) => (
                                 <div 
                                    key={idx} 
                                    onClick={() => setZoomedImage(photo)}
                                    className="relative aspect-square rounded-[2rem] overflow-hidden shadow-xl border-4 border-white dark:border-slate-800 cursor-zoom-in hover:scale-[1.02] transition-transform"
                                 >
                                    <Image src={photo} alt={`Evidence ${idx + 1}`} fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors"></div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Procedural Logs */}
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-white flex items-center gap-2"><Gavel className="w-4 h-4 text-amber-500" /> Prior Reporting & Procedural Metadata</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Lodged with other authorities?</p>
                              <p className="text-sm font-medium italic">"{selectedComplaint.otherAuthorities || 'Initial institutional filing.'}"</p>
                           </div>
                           <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Sub Judice / Pending Case Status</p>
                              <p className="text-sm font-medium italic">"{selectedComplaint.isSubJudice || 'No pending court cases reported.'}"</p>
                           </div>
                        </div>
                     </div>

                     {/* Governance Actions */}
                     <div className="pt-12 border-t border-slate-100 space-y-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Administrative Status Governance</span>
                              <div className="flex gap-2 mt-2">
                                 {['Pending', 'In Progress', 'Resolved'].map(st => (
                                   <Button 
                                      key={st} 
                                      size="sm" 
                                      onClick={() => handleUpdateStatus(selectedComplaint.id, st)}
                                      disabled={isActionLoading}
                                      variant={selectedComplaint.status === st ? 'default' : 'outline'}
                                      className={cn("h-8 px-5 rounded-lg text-[10px] font-black uppercase", selectedComplaint.status === st && getStatusColor(st))}
                                   >
                                      {st}
                                   </Button>
                                 ))}
                              </div>
                           </div>
                           <div className="flex gap-3">
                              {isRoot && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="h-12 rounded-xl font-bold gap-2 px-8">
                                       <Trash2 className="w-4 h-4" /> Purge Permanent Record
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>This will completely erase complaint "{selectedComplaint.token}" and all associated evidence from the national registry. This action is irreversible.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(selectedComplaint.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">Purge Record</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              <Button onClick={() => setSelectedComplaint(null)} className="h-12 rounded-xl bg-slate-900 text-white font-bold px-8">
                                 End Review Session
                              </Button>
                           </div>
                        </div>
                        <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Official National Rights Registry • HRAT INDIA</p>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Expanded Photo View */}
      <Dialog open={!!zoomedImage} onOpenChange={(open) => !open && setZoomedImage(null)}>
        <DialogContent className="max-w-[90vw] md:max-w-4xl p-0 border-none bg-transparent shadow-none [&>button]:hidden z-[10000002]">
           <DialogHeader className="sr-only">
             <DialogTitle>Expanded View</DialogTitle>
             <DialogDescription>Full-sized incident photograph.</DialogDescription>
           </DialogHeader>
           <div className="relative aspect-[3/2] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-900 bg-black">
              {zoomedImage && <Image src={zoomedImage} alt="Zoomed Evidence" fill className="object-contain" />}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white h-10 w-10 shadow-xl transition-all hover:scale-110"
              >
                <X className="w-6 h-6 text-white" />
              </Button>
           </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
