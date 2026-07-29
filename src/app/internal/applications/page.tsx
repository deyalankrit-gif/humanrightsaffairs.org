
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

    const idPattern = /^[A-Z]{6}[0-9]{4}$/;
    if (!idPattern.test(newMember.memberId)) {
      toast({ 
        variant: "destructive", 
        title: "Invalid Member ID", 
        description: "ID must be 10 characters: 6 uppercase letters followed by 4 digits." 
      })
      return
    }

    setIsAddingMember(true)
    try {
      const { honorific, ...data } = newMember;
      const finalName = honorific ? `${honorific} ${data.name}` : data.name;
      
      await addDoc(collection(db, 'memberProfiles'), { 
        ...data, 
        name: finalName,
        createdAt: serverTimestamp() 
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
        toast({ variant: "destructive", title: "Update Failed", description: "Could not sync status with national database." })
        setIsActionLoading(false)
      })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white'
      case 'Rejected': return 'bg-red-500 text-white hover:bg-red-600 hover:text-white'
      case 'Archived': return 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white'
      default: return 'bg-amber-500 text-white hover:bg-amber-600 hover:text-white'
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

  const parseMemberDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try { return parse(dateStr, "PPP", new Date()); } catch { return undefined; }
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

  const statesList = Object.keys(INDIA_DATA).sort()

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
                 { label: 'APR', count: stats.approved, count_color: 'text-emerald-400' },
                 { label: 'REJ', count: stats.rejected, count_color: 'text-red-400' },
                 { label: 'ARC', count: stats.archived, count_color: 'text-blue-400' },
               ].map((s) => (
                 <div key={s.label} className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-center min-w-[70px]">
                   <p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">{s.label}</p>
                   <p className={cn("text-lg font-bold leading-none", s.color || s.count_color)}>{s.count}</p>
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
                       ? "bg-accent text-primary shadow-sm hover:text-primary" 
                       : "text-slate-500 hover:bg-slate-200"
                   )}
                 >
                   {st}
                 </button>
               ))}
            </div>

            <div className="relative w-full max-md:max-w-full max-w-md">
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
              {filtered.map((a: any) => {
                const gender = (a.gender || '').trim().toLowerCase();
                let fallback = '/dummy m.png';
                if (gender === 'female' || gender === 'f' || gender === 'woman') fallback = '/dummy w.png';
                
                return (
                  <Card key={a.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 relative group">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 md:w-56 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                           <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg mb-3 bg-slate-200">
                              <Image src={a.photoDataUri || fallback} alt={a.name} fill className="object-cover" />
                           </div>
                           <div className="mb-2">
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">REF ID</p>
                              <p className="font-bold text-sm tracking-tighter text-primary dark:text-white leading-none">{a.referenceId || 'N/A'}</p>
                           </div>
                           <Badge className={cn("text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase border-none hover:text-white transition-colors", getStatusColor(a.status))}>
                             {a.status}
                           </Badge>
                        </div>
                        
                        <div className="flex-1 p-6 grid lg:grid-cols-4 gap-6 items-start">
                          <div className="lg:col-span-3 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{a.name}</h3>
                                {a.isRenewal && (
                                  <Badge className="bg-emerald-500 text-white text-[7px] font-black uppercase tracking-tighter h-4">Renewal</Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setSelectedAppForDetails(a)}
                                  className="h-7 px-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-slate-100 transition-all rounded-full"
                                >
                                  <Eye className="w-3 h-3 mr-1.5" /> View Details
                                </Button>
                                {a.status === 'Approved' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleStartCommissioning(a)}
                                    className="h-7 px-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 transition-all rounded-full"
                                  >
                                    <UserPlus className="w-3 h-3 mr-1.5" /> Convert to New Member
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500 mt-1">
                                 <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5 text-accent" /> {a.email}</span>
                                 <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5 text-accent" /> {a.phone}</span>
                                 <span className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5 text-accent" /> {a.memberType}</span>
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
                                  className="bg-emerald-500 text-white font-bold h-8 rounded-lg text-[9px] hover:bg-emerald-600 hover:text-white px-1"
                                >
                                  <Check className="w-2.5 h-2.5 mr-1" /> Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => setActionDialog({ open: true, status: 'Rejected', applicationId: a.id, reason: '' })} 
                                  className="bg-red-500 text-white font-bold h-8 rounded-lg text-[9px] hover:bg-red-600 hover:text-white px-1"
                                >
                                  <X className="w-2.5 h-2.5 mr-1" /> Reject
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => setActionDialog({ open: true, status: 'Archived', applicationId: a.id, reason: '' })} 
                                  className="bg-blue-500 text-white font-bold h-8 rounded-lg text-[9px] hover:bg-blue-600 hover:text-white px-1"
                                >
                                  <Archive className="w-2.5 h-2.5 mr-1" /> Archive
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => setActionDialog({ open: true, status: 'Pending', applicationId: a.id, reason: '' })} 
                                  className="bg-amber-500 text-white font-bold h-8 rounded-lg text-[9px] hover:bg-amber-600 hover:text-white px-1"
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
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* View Details Dialog */}
      <Dialog open={!!selectedAppForDetails} onOpenChange={(open) => !open && setSelectedAppForDetails(null)}>
        <DialogContent className="max-w-4xl p-0 border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 flex flex-col [&>button]:hidden max-h-[90vh]">
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
                <div className="relative bg-slate-900 p-12 md:p-16 text-white overflow-hidden border-b-8 border-accent/20">
                  <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-[-20px]"><ShieldCheck className="w-64 h-64 md:w-96 md:h-96" /></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-800">
                      <Image 
                        src={selectedAppForDetails.photoDataUri || (selectedAppForDetails.gender?.trim().toLowerCase() === 'female' || selectedAppForDetails.gender?.trim().toLowerCase() === 'f' ? '/dummy w.png' : '/dummy m.png')} 
                        alt={selectedAppForDetails.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                        <BadgeCheck className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{selectedAppForDetails.memberType} Candidate</span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-xl">{selectedAppForDetails.name}</h2>
                      <div className="flex items-center gap-4">
                        <p className="text-white/60 font-bold uppercase tracking-widest text-xs flex items-center justify-center md:justify-start gap-2">
                          <Hash className="w-3.5 h-3.5" /> {selectedAppForDetails.referenceId}
                        </p>
                        {selectedAppForDetails.isRenewal && (
                          <Badge className="bg-emerald-500 text-white text-[8px] font-black h-5 px-3">TERM RENEWAL</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-16 space-y-12 pb-24">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2"><Phone className="w-3 h-3" /> Contact Protocol</h4>
                        <div className="space-y-3">
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Official Mobile</p>
                              <p className="text-sm font-bold text-primary dark:text-white">{selectedAppForDetails.phone}</p>
                           </div>
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Email ID</p>
                              <p className="text-sm font-bold text-primary dark:text-white truncate">{selectedAppForDetails.email || 'Not Provided'}</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2"><MapPin className="w-3 h-3" /> Jurisdictional Scope</h4>
                        <div className="space-y-3">
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Operational Level</p>
                              <p className="text-sm font-bold text-primary dark:text-white">{selectedAppForDetails.level} Council</p>
                           </div>
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Assigned Region</p>
                              <p className="text-sm font-bold text-primary dark:text-white">
                                 {selectedAppForDetails.districtName ? `${selectedAppForDetails.districtName}, ` : ''}{selectedAppForDetails.stateName || 'National Center'}
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2"><Briefcase className="w-3 h-3" /> Credentials</h4>
                        <div className="space-y-3">
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Primary Aadhaar</p>
                              <p className="text-sm font-bold text-primary dark:text-white font-mono tracking-tighter">{selectedAppForDetails.aadhaar || 'Pending Verification'}</p>
                           </div>
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Permanent PAN</p>
                              <p className="text-sm font-bold text-primary dark:text-white font-mono uppercase">{selectedAppForDetails.pan || 'N/A'}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-white flex items-center gap-2"><GraduationCap className="w-4 h-4 text-emerald-500" /> Education & Background</h4>
                        <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6">
                           <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Academic Qualifications</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">"{selectedAppForDetails.education || 'Data missing from application profile.'}"</p>
                           </div>
                           <div className="h-px bg-slate-200 dark:bg-slate-800"></div>
                           <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Professional Experience</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">"{selectedAppForDetails.experience || 'No experience recorded.'}"</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-white flex items-center gap-2"><Home className="w-4 h-4 text-indigo-500" /> Verified Residence</h4>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                           <div className="flex gap-4">
                              <MapPin className="w-5 h-5 text-accent shrink-0 mt-1" />
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{selectedAppForDetails.address}"</p>
                           </div>
                           <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                              <div><p className="text-[8px] font-bold text-slate-400 uppercase">Post Office</p><p className="text-xs font-bold">{selectedAppForDetails.postOffice}</p></div>
                              <div><p className="text-[8px] font-bold text-slate-400 uppercase">Police Station</p><p className="text-xs font-bold">{selectedAppForDetails.policeStation}</p></div>
                              <div><p className="text-[8px] font-bold text-slate-400 uppercase">PIN Code</p><p className="text-xs font-mono font-bold">{selectedAppForDetails.pinCode}</p></div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-950 p-10 rounded-[3rem] text-white space-y-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2"><Gavel className="w-4 h-4" /> Legal Affirmations & Metadata</h4>
                     <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <div className="flex items-start gap-4">
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                              <div className="space-y-1">
                                 <p className="text-xs font-bold">Affidavit: No Criminal Record</p>
                                 <p className="text-[10px] text-slate-400 leading-relaxed">The applicant has formally declared that they possess no prior criminal background or human rights violations.</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-4">
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                              <div className="space-y-1">
                                 <p className="text-xs font-bold">Institutional Declaration</p>
                                 <p className="text-[10px] text-slate-400 leading-relaxed">The applicant has agreed to abide by organizational rules and accepts the Trust's suspension policy.</p>
                              </div>
                           </div>
                        </div>
                        <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                           <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-500 uppercase">Application Date</span>
                              <span>{selectedAppForDetails.createdAt?.toDate ? selectedAppForDetails.createdAt.toDate().toLocaleDateString() : 'Real-time Entry'}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-500 uppercase">Membership Term</span>
                              <span className="text-accent">{selectedAppForDetails.membershipDuration}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-500 uppercase">Gender</span>
                              <span>{selectedAppForDetails.gender}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-500 uppercase">Blood Group</span>
                              <span className="text-red-400">{selectedAppForDetails.bloodGroup || 'N/A'}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-8 flex flex-col gap-4 items-center">
                    <Button 
                      size="lg" 
                      onClick={() => setSelectedAppForDetails(null)}
                      className="w-full bg-primary text-primary-foreground font-bold h-16 rounded-2xl text-lg hover:bg-secondary transition-all shadow-xl shadow-primary/20"
                    >
                      Close Profile
                    </Button>
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-4">
                      Official Personnel Application • Human Rights Affairs Trust
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
