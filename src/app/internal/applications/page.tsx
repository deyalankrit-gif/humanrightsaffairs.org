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
  Briefcase
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
  
  // Commissioning State
  const [isCommissioningOpen, setIsCommissioningOpen] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState({
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
    imageId: ''
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
      membershipDuration: '1 Year',
      imageId: app.photoDataUri || ''
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
      await addDoc(collection(db, 'memberProfiles'), { ...newMember, createdAt: serverTimestamp() })
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
                          <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{a.name}</h3>
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

      {/* Commissioning Dialog */}
      <Dialog open={isCommissioningOpen} onOpenChange={setIsCommissioningOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Personnel Commissioning</DialogTitle>
            <DialogDescription>Convert approved application to official member record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-32 h-32 rounded-full bg-slate-50 dark:bg-slate-800 overflow-hidden border-2 border-dashed border-slate-300">
                    {newMember.imageId ? (
                      <Image src={newMember.imageId} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full"><User className="w-10 h-10 text-slate-300" /></div>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                  </div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Commissioning Photo</Label>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Full Legal Name <span className="text-red-500">*</span></Label>
                    <Input placeholder="Full Legal Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Gender <span className="text-red-500">*</span></Label>
                      <Select value={newMember.gender} onValueChange={(val: any) => setNewMember({...newMember, gender: val})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent position="popper" className="z-[1000001] bg-white"><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Blood Group</Label>
                      <Select value={newMember.bloodGroup} onValueChange={val => setNewMember({...newMember, bloodGroup: val})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent position="popper" className="z-[1000001] bg-white">
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Current Profession</Label>
                    <Input placeholder="e.g. Advocate, Teacher" value={newMember.profession} onChange={e => setNewMember({...newMember, profession: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-accent">Designation Category <span className="text-red-500">*</span></Label>
                  <Select value={newMember.designationCategory} onValueChange={(val: any) => {
                    const isFixed = val === 'General Member' || val === 'Volunteer';
                    setNewMember({
                      ...newMember, 
                      designationCategory: val, 
                      designation: isFixed ? val : ''
                    });
                  }}>
                    <SelectTrigger className="rounded-xl border-accent/20 bg-white dark:bg-slate-800"><SelectValue /></SelectTrigger>
                    <SelectContent position="popper" className="z-[1000001] bg-white">
                      <SelectItem value="General Member">General Member</SelectItem>
                      <SelectItem value="Office-bearing Member">Office-bearing Member</SelectItem>
                      <SelectItem value="Volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newMember.designationCategory === 'Office-bearing Member' && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-left-2">
                    <Label className="text-[10px] uppercase font-bold text-accent">Manual Designation <span className="text-red-500">*</span></Label>
                    <Input placeholder="e.g. Secretary, Treasurer" value={newMember.designation} onChange={e => setNewMember({...newMember, designation: e.target.value})} className="rounded-xl border-accent/20 h-11" />
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-800 shadow-inner">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Commissioned Member ID <span className="text-red-500">*</span></Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="ABCDEF1234" 
                        value={newMember.memberId} 
                        onChange={e => setNewMember({...newMember, memberId: e.target.value.toUpperCase()})} 
                        className="h-11 rounded-xl font-mono bg-white dark:bg-slate-900"
                        maxLength={10}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="h-11 w-11 shrink-0 rounded-xl border-dashed hover:bg-accent/10"
                        onClick={() => setNewMember({...newMember, memberId: generateMemberId()})}
                      >
                        <Sparkles className="w-4 h-4 text-accent" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Duration <span className="text-red-500">*</span></Label>
                    <Select value={newMember.membershipDuration} onValueChange={val => setNewMember({...newMember, membershipDuration: val as any})}>
                      <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-900"><SelectValue /></SelectTrigger>
                      <SelectContent position="popper" className="z-[1000001] bg-white">
                        <SelectItem value="1 Year">1 Year Term</SelectItem>
                        <SelectItem value="2 Years">2 Years Term</SelectItem>
                        <SelectItem value="3 Years">3 Years Term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Issue Date <span className="text-red-500">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 rounded-xl bg-white dark:bg-slate-900", !newMember.joiningDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newMember.joiningDate ? newMember.joiningDate : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[1000002]" align="start">
                        <Calendar mode="single" selected={parseMemberDate(newMember.joiningDate)} onSelect={(date) => setNewMember({...newMember, joiningDate: date ? format(date, "PPP") : ''})} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Expiry Date</Label>
                    <Input disabled value={newMember.expiryDate} className="h-11 rounded-xl bg-slate-100/50 dark:bg-slate-950/50" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Official Email</Label><Input type="email" placeholder="name@hrat.org" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="h-11 rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Phone Number <span className="text-red-500">*</span></Label><Input placeholder="+91" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} className="h-11 rounded-xl" /></div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Verified Residential Address <span className="text-red-500">*</span></Label>
                  <Input placeholder="House No, Village, Lane" value={newMember.address} onChange={e => setNewMember({...newMember, address: e.target.value})} className="h-11 rounded-xl" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Post Office <span className="text-red-500">*</span></Label><Input placeholder="PO Name" value={newMember.postOffice} onChange={e => setNewMember({...newMember, postOffice: e.target.value})} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Police Station <span className="text-red-500">*</span></Label><Input placeholder="PS Name" value={newMember.policeStation} onChange={e => setNewMember({...newMember, policeStation: e.target.value})} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">PIN Code <span className="text-red-500">*</span></Label><Input placeholder="6 digits" maxLength={6} value={newMember.pinCode} onChange={e => setNewMember({...newMember, pinCode: e.target.value})} className="h-11 rounded-xl font-mono" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Operational Level <span className="text-red-500">*</span></Label>
                    <Select value={newMember.level} onValueChange={(val: any) => setNewMember({...newMember, level: val, stateName: '', districtName: ''})}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent position="popper" className="z-[1000001] bg-white"><SelectItem value="National">Central Council</SelectItem><SelectItem value="State">State Level</SelectItem><SelectItem value="District">District Level</SelectItem></SelectContent>
                    </Select>
                  </div>
                  {(newMember.level === 'State' || newMember.level === 'District') && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Regional Chapter (State)</Label>
                      <Select value={newMember.stateName} onValueChange={val => setNewMember({...newMember, stateName: val, districtName: ''})}>
                        <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-900"><SelectValue placeholder="Choose State" /></SelectTrigger>
                        <SelectContent position="popper" className="max-h-60 z-[1000001] bg-white">{statesList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                {newMember.level === 'District' && newMember.stateName && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">District Committee</Label>
                    <Select value={newMember.districtName} onValueChange={val => setNewMember({...newMember, districtName: val})}>
                      <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-900"><SelectValue placeholder="Choose District" /></SelectTrigger>
                      <SelectContent position="popper" className="max-h-60 z-[1000001] bg-white">{(INDIA_DATA[newMember.stateName] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
              </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAddMember} 
              disabled={isAddingMember} 
              className="w-full h-12 rounded-xl bg-accent text-primary font-bold text-lg shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all"
            >
              {isAddingMember ? <Loader2 className="animate-spin" /> : "Establish Official Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
