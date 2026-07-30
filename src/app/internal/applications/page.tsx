
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
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
  MessageSquare,
  UserPlus,
  Sparkles,
  Heart,
  Calendar as CalendarIcon,
  Briefcase,
  Eye,
  BadgeCheck,
  FileText,
  Gavel,
  GraduationCap,
  Scale,
  Hash,
  CheckCircle2,
  Home
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parse, addYears } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { INDIA_DATA } from '@/lib/india-data'

type AppStatus = 'All' | 'Pending' | 'Approved' | 'Rejected' | 'Archived'

export default function InternalApplicationsPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<AppStatus>('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [selectedAppForDetails, setSelectedAppForDetails] = useState<any>(null)
  
  // Commissioning State
  const [isCommissioningOpen, setIsCommissioningOpen] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState({
    honorific: '',
    name: '',
    designationCategory: 'General Member',
    designation: 'General Member',
    profession: '',
    gender: 'male',
    bloodGroup: '',
    email: '',
    phone: '',
    address: '',
    postOffice: '',
    policeStation: '',
    pinCode: '',
    level: 'National' as 'National' | 'State' | 'District',
    status: 'Active',
    memberId: '',
    stateName: '',
    districtName: '',
    joiningDate: '',
    expiryDate: '',
    membershipDuration: '1 Year',
    imageId: '',
    isRenewed: false,
    renewalCount: 0
  })

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

  // Auto-calculate expiry date
  useEffect(() => {
    if (newMember.joiningDate && newMember.membershipDuration) {
      try {
        const joinDate = parse(newMember.joiningDate, "PPP", new Date());
        const years = parseInt(newMember.membershipDuration);
        if (!isNaN(years)) {
          const expiry = addYears(joinDate, years);
          setNewMember(prev => ({ ...prev, expiryDate: format(expiry, "PPP") }));
        }
      } catch (e) {}
    }
  }, [newMember.joiningDate, newMember.membershipDuration]);

  const generateMemberId = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 4; i++) {
      result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return result;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewMember(prev => ({ ...prev, imageId: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStartCommissioning = (app: any) => {
    setNewMember({
      honorific: '',
      name: app.name || '',
      designationCategory: 'General Member',
      designation: 'General Member',
      profession: app.profession || '',
      gender: (app.gender?.toLowerCase() === 'female' ? 'female' : 'male'),
      bloodGroup: app.bloodGroup || '',
      email: app.email || '',
      phone: app.phone || '',
      address: app.address || '',
      postOffice: app.postOffice || '',
      policeStation: app.policeStation || '',
      pinCode: app.pinCode || '',
      level: app.level || 'National',
      status: 'Active',
      memberId: generateMemberId(),
      stateName: app.stateName || '',
      districtName: app.districtName || '',
      joiningDate: format(new Date(), "PPP"),
      expiryDate: format(addYears(new Date(), 1), "PPP"),
      membershipDuration: app.membershipDuration || '1 Year',
      imageId: app.photoDataUri || '',
      isRenewed: app.isRenewal || false,
      renewalCount: app.isRenewal ? 1 : 0
    })
    setIsCommissioningOpen(true)
  }

  const handleAddMember = async () => {
    const mandatoryFields = [
      { val: newMember.name, label: "Full Name" },
      { val: newMember.gender, label: "Gender" },
      { val: newMember.designationCategory, label: "Designation Category" },
      { val: newMember.memberId, label: "Member ID" },
      { val: newMember.membershipDuration, label: "Duration" },
      { val: newMember.joiningDate, label: "Issue Date" },
      { val: newMember.phone, label: "Phone Number" },
      { val: newMember.address, label: "Verified Residential Address" },
      { val: newMember.postOffice, label: "Post Office" },
      { val: newMember.policeStation, label: "Police Station" },
      { val: newMember.pinCode, label: "PIN Code" },
      { val: newMember.level, label: "Operational Level" }
    ];

    const missing = mandatoryFields.find(f => !f.val);
    if (missing) {
      toast({ 
        variant: "destructive", 
        title: "Missing Information", 
        description: `${missing.label} is mandatory for personnel commissioning.` 
      });
      return;
    }

    setIsAddingMember(true)
    try {
      const { honorific, ...data } = newMember;
      const finalName = honorific ? `${honorific} ${data.name}` : data.name;
      
      await addDoc(collection(db, 'memberProfiles'), { 
        ...data, 
        name: finalName,
        createdAt: serverTimestamp(),
        isDemi: false 
      })
      toast({ title: "Personnel Commissioned", description: "Record established in national registry." })
      setIsAddingMember(false)
      setIsCommissioningOpen(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "System Error" })
      setIsAddingMember(false)
    }
  }

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
        toast({ variant: "destructive", title: "Update Failed" })
        setIsActionLoading(false)
      })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-500 text-white'
      case 'Rejected': return 'bg-red-500 text-white'
      case 'Archived': return 'bg-blue-500 text-white'
      default: return 'bg-amber-500 text-white'
    }
  }

  const parseMemberDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try { return parse(dateStr, "PPP", new Date()); } catch { return undefined; }
  }

  if (authLoading || (user && dataLoading)) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (applications || []).filter((a: any) => {
    const matchesSearch = (a.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (a.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.phone || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.referenceId || '').toLowerCase().includes(search.toLowerCase());
    
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Member Vetting
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">New <span className="text-accent italic">Applications</span></h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Review and commission prospective members and volunteers.</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
               {[
                 { label: 'PND', count: stats.pending, color: 'text-amber-400' },
                 { label: 'APR', count: stats.approved, color: 'text-emerald-400' },
                 { label: 'REJ', count: stats.rejected, color: 'text-red-400' },
                 { label: 'ARC', count: stats.archived, color: 'text-blue-400' },
               ].map((s) => (
                 <div key={s.label} className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-center min-w-[70px] flex-1 md:flex-none">
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
            <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border">
               {(['All', 'Pending', 'Approved', 'Rejected', 'Archived'] as AppStatus[]).map((st) => (
                 <button
                   key={st}
                   onClick={() => setActiveFilter(st)}
                   className={cn(
                     "whitespace-nowrap rounded-lg px-4 font-bold h-8 text-[10px] uppercase transition-all",
                     activeFilter === st ? "bg-accent text-primary shadow-sm" : "text-slate-500 hover:bg-slate-200"
                   )}
                 >
                   {st}
                 </button>
               ))}
            </div>

            <div className="relative w-full max-lg:max-w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search candidates, emails or IDs..." 
                className="pl-10 h-12 md:h-11 rounded-2xl border-slate-200 text-sm shadow-inner bg-slate-50 dark:bg-slate-950"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 max-w-5xl mx-auto">
            {filtered.map((a: any) => {
              const gender = (a.gender || '').trim().toLowerCase();
              let fallback = '/dummy m.png';
              if (gender === 'female' || gender === 'f' || gender === 'woman') fallback = '/dummy w.png';
              
              return (
                <Card key={a.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 relative group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800 md:w-56 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                         <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg mb-3 bg-slate-200">
                            <Image src={a.photoDataUri || fallback} alt={a.name} fill className="object-cover" />
                         </div>
                         <div className="mb-2">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">REF ID</p>
                            <p className="font-bold text-sm tracking-tighter text-primary dark:text-white leading-none">{a.referenceId || 'N/A'}</p>
                         </div>
                         <Badge className={cn("text-[9px] font-black uppercase px-3 py-0.5 rounded-full border-none", getStatusColor(a.status))}>
                           {a.status}
                         </Badge>
                      </div>
                      
                      <div className="flex-1 p-6 flex flex-col justify-between gap-6">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{a.name}</h3>
                              {a.isRenewal && <Badge className="bg-emerald-500 text-white text-[7px] font-black uppercase h-4 px-2">Renewal</Badge>}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedAppForDetails(a)}
                                className="h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 hover:bg-slate-50"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1.5" /> Details
                              </Button>
                              {a.status === 'Approved' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleStartCommissioning(a)}
                                  className="h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl border-emerald-100 bg-emerald-50/30 text-emerald-600 hover:bg-emerald-100"
                                >
                                  <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Commission
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                               <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-accent" /> {a.email || 'No Email'}</span>
                               <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-accent" /> {a.phone}</span>
                               <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-accent" /> {a.memberType}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100">
                                <div className="space-y-2">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">Education</p>
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{a.education || 'N/A'}</p>
                                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">Experience</p>
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{a.experience || 'N/A'}</p>
                                </div>
                             </div>
                             <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 flex items-center justify-center text-center">
                                <p className="text-[11px] leading-relaxed text-slate-500 italic font-medium">"{a.address}"</p>
                             </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Decision Console:</p>
                          <div className="grid grid-cols-2 sm:flex gap-2">
                            <Button size="sm" onClick={() => setActionDialog({ open: true, status: 'Approved', applicationId: a.id, reason: '' })} className="bg-emerald-500 text-white font-bold h-9 rounded-xl text-[9px] uppercase tracking-widest flex-1">Approve</Button>
                            <Button size="sm" onClick={() => setActionDialog({ open: true, status: 'Rejected', applicationId: a.id, reason: '' })} className="bg-red-500 text-white font-bold h-9 rounded-xl text-[9px] uppercase tracking-widest flex-1">Reject</Button>
                            <Button size="sm" onClick={() => setActionDialog({ open: true, status: 'Archived', applicationId: a.id, reason: '' })} className="bg-blue-500 text-white font-bold h-9 rounded-xl text-[9px] uppercase tracking-widest flex-1">Archive</Button>
                            <Button size="sm" onClick={() => setActionDialog({ open: true, status: 'Pending', applicationId: a.id, reason: '' })} className="bg-amber-500 text-white font-bold h-9 rounded-xl text-[9px] uppercase tracking-widest flex-1">Pending</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {filtered.length === 0 && (
              <div className="text-center py-32 opacity-30"><Users className="w-20 h-20 mx-auto mb-6" /><p className="text-xl font-headline font-bold uppercase tracking-widest">Registry Empty</p></div>
            )}
          </div>
        </div>
      </section>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(val) => setActionDialog(prev => ({...prev, open: val}))}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl w-[95vw]">
           <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold">Action: {actionDialog.status}</DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Decision Audit Documentation</DialogDescription>
           </DialogHeader>
           <div className="py-6 space-y-4">
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-bold uppercase text-slate-500">Official Justification</Label>
                 <Textarea value={actionDialog.reason} onChange={e => setActionDialog({...actionDialog, reason: e.target.value})} placeholder="Provide administrative reasoning for this decision..." className="min-h-[120px] rounded-2xl" />
              </div>
           </div>
           <DialogFooter>
              <Button onClick={handleUpdateStatus} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary">
                {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit Decision"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!selectedAppForDetails} onOpenChange={(open) => !open && setSelectedAppForDetails(null)}>
        <DialogContent className="max-w-4xl p-0 border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 flex flex-col [&>button]:hidden w-[95vw] max-h-[90vh]">
          <DialogHeader className="sr-only">
            <DialogTitle>Applicant Profile: {selectedAppForDetails?.name}</DialogTitle>
            <DialogDescription>Full application data for vetting.</DialogDescription>
          </DialogHeader>
          <div className="absolute right-6 top-6 z-50">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-500 text-white h-10 w-10 shadow-xl transition-all hover:scale-110 active:scale-95 duration-300">
                <X className="w-6 h-6 text-white" />
              </Button>
            </DialogClose>
          </div>
          {selectedAppForDetails && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col">
                <div className="relative bg-slate-900 p-8 md:p-16 text-white overflow-hidden border-b-8 border-accent/20">
                  <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-[-20px]"><ShieldCheck className="w-64 h-64 md:w-96 md:h-96" /></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-800">
                      <Image src={selectedAppForDetails.photoDataUri || '/dummy m.png'} alt={selectedAppForDetails.name} fill className="object-cover" />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                        <BadgeCheck className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{selectedAppForDetails.memberType} Candidate</span>
                      </div>
                      <h2 className="text-3xl md:text-6xl font-headline font-bold drop-shadow-xl">{selectedAppForDetails.name}</h2>
                      <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] md:text-xs">Ref: {selectedAppForDetails.referenceId}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-16 space-y-12 pb-24">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2"><Phone className="w-3 h-3" /> Contact Info</h4>
                        <div className="space-y-3">
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Mobile</p>
                              <p className="text-sm font-bold">{selectedAppForDetails.phone}</p>
                           </div>
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Email</p>
                              <p className="text-sm font-bold truncate">{selectedAppForDetails.email || 'N/A'}</p>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2"><MapPin className="w-3 h-3" /> Jurisdiction</h4>
                        <div className="space-y-3">
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Level</p>
                              <p className="text-sm font-bold">{selectedAppForDetails.level} Council</p>
                           </div>
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Region</p>
                              <p className="text-sm font-bold">{selectedAppForDetails.districtName ? `${selectedAppForDetails.districtName}, ` : ''}{selectedAppForDetails.stateName || 'National'}</p>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2"><Briefcase className="w-3 h-3" /> Documents</h4>
                        <div className="space-y-3">
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Aadhaar</p>
                              <p className="text-sm font-bold font-mono">{selectedAppForDetails.aadhaar}</p>
                           </div>
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">PAN</p>
                              <p className="text-sm font-bold font-mono uppercase">{selectedAppForDetails.pan || 'N/A'}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-white flex items-center gap-2"><Scale className="w-4 h-4 text-emerald-500" /> Background Context</h4>
                     <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
                        <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-2">Academic Qualifications</p><p className="text-sm font-medium leading-relaxed">"{selectedAppForDetails.education || 'N/A'}"</p></div>
                        <div className="h-px bg-slate-200 dark:bg-slate-800"></div>
                        <div><p className="text-[8px] font-bold text-slate-400 uppercase mb-2">Professional Summary</p><p className="text-sm font-medium leading-relaxed">"{selectedAppForDetails.experience || 'N/A'}"</p></div>
                     </div>
                  </div>

                  <div className="pt-8 flex flex-col gap-4">
                    <Button size="lg" onClick={() => setSelectedAppForDetails(null)} className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary transition-all shadow-xl">Close Profile</Button>
                    <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Official National Vetting Node • HRAT INDIA</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Commissioning Dialog */}
      <Dialog open={isCommissioningOpen} onOpenChange={setIsCommissioningOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Final Commissioning</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase text-slate-400">Personnel Registry Data Entry</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase text-slate-400">Commissioned Name</Label>
                   <div className="flex gap-2">
                      <Select value={newMember.honorific} onValueChange={val => setNewMember({...newMember, honorific: val})}>
                        <SelectTrigger className="w-20 rounded-xl h-11"><SelectValue placeholder="Ti" /></SelectTrigger>
                        <SelectContent position="popper" className="z-[1000001] bg-white">{["Mr.", "Ms.", "Mrs.", "Dr.", "Adv.", "Prof.", "Hon."].map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="h-11 rounded-xl flex-1" />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase text-slate-400">Member ID *</Label>
                   <Input value={newMember.memberId} onChange={e => setNewMember({...newMember, memberId: e.target.value.toUpperCase()})} className="h-11 rounded-xl font-mono" />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Term</Label><Select value={newMember.membershipDuration} onValueChange={v => setNewMember({...newMember, membershipDuration: v})}><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent position="popper" className="z-[1000001] bg-white">{(["1 Year", "2 Years", "3 Years"]).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Expiry Date</Label><Input disabled value={newMember.expiryDate} className="h-11 rounded-xl bg-slate-50" /></div>
             </div>

             <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Designation Category</Label>
                      <Select value={newMember.designationCategory} onValueChange={(val: any) => setNewMember({...newMember, designationCategory: val, designation: val === 'Office-bearing Member' ? '' : val})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent position="popper" className="z-[1000001] bg-white">{["General Member", "Board Member", "Office-bearing Member", "Volunteer"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                   </div>
                   {newMember.designationCategory === 'Office-bearing Member' && (
                     <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Specific Designation</Label><Input value={newMember.designation} onChange={e => setNewMember({...newMember, designation: e.target.value})} className="h-11 rounded-xl" /></div>
                   )}
                </div>
             </div>

             <Button onClick={handleAddMember} disabled={isAddingMember} className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700">
               {isAddingMember ? <Loader2 className="animate-spin" /> : "Verify & Commission Personnel"}
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
