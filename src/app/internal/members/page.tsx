
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp, doc } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Lock, 
  Loader2,
  UserPlus,
  MapPin,
  Sparkles,
  Heart,
  Calendar as CalendarIcon,
  Camera,
  User,
  Mail,
  Phone,
  Briefcase,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Hash,
  Globe,
  Building2,
  ShieldCheck,
  X,
  Archive,
  GraduationCap,
  Scale,
  CheckCircle2,
  Clock,
  History
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, parse, addYears } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
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
import { moveToTrash } from '@/lib/trash-utils'
import Link from 'next/link'
import { INDIA_DATA } from '@/lib/india-data'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export default function InternalMembersDirectory() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('All')
  const [isAdding, setIsAdding] = useState(false)
  const [isDialogOpen, setIsAddingDialogOpen] = useState(false)

  const [newMember, setNewMember] = useState({
    honorific: '',
    name: '',
    designationCategory: 'General Member',
    designation: 'General Member',
    profession: '',
    education: '',
    experience: '',
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
    aadhaar: '',
    pan: ''
  })

  const profilesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
  }, [db, user]);

  const { data: firestoreProfiles, loading: profilesLoading } = useCollection(profilesQuery);

  const profiles = React.useMemo(() => {
    return ((firestoreProfiles || []) as any[]).filter(m => m.isDemi !== true);
  }, [firestoreProfiles]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  // Auto-calculate expiry date
  useEffect(() => {
    if (newMember.joiningDate && newMember.membershipDuration) {
      try {
        const joinDate = parse(newMember.joiningDate, "PPP", new Date());
        const years = parseInt(newMember.membershipDuration);
        if (!isNaN(years)) {
          const expiry = addYears(joinDate, years);
          const formattedExpiry = format(expiry, "PPP");
          if (newMember.expiryDate !== formattedExpiry) {
            setNewMember(prev => ({ ...prev, expiryDate: formattedExpiry }));
          }
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
      if (file.size > 153600) { // 150KB limit
        toast({
          variant: "destructive",
          title: "File Too Heavy",
          description: "Profile photo must be under 150KB for optimized registry sync."
        });
        return;
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewMember(prev => ({ ...prev, imageId: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
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
      { val: newMember.level, label: "Operational Level" },
      { val: newMember.aadhaar, label: "Aadhaar Card" }
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
        description: "ID must be 10 characters: 6 uppercase letters followed by 4 digits (e.g. ABCDEF1234)." 
      })
      return
    }

    setIsAdding(true)
    try {
      const { honorific, ...data } = newMember;
      const finalName = honorific ? `${honorific} ${data.name}` : data.name;
      
      await addDoc(collection(db, 'memberProfiles'), { 
        ...data, 
        name: finalName,
        createdAt: serverTimestamp(),
        isDemi: false 
      })
      toast({ title: "Success", description: "Member record established." })
      setIsAdding(false)
      setIsAddingDialogOpen(false)
      setNewMember({
        honorific: '',
        name: '', designationCategory: 'General Member', designation: 'General Member', profession: '', education: '', experience: '', gender: 'male', bloodGroup: '',
        email: '', phone: '', address: '', postOffice: '', policeStation: '', pinCode: '',
        level: 'National', status: 'Active',
        memberId: '', stateName: '', districtName: '', joiningDate: '', expiryDate: '',
        membershipDuration: '1 Year', imageId: '', aadhaar: '', pan: ''
      })
    } catch (error: any) {
      toast({ variant: "destructive", title: "System Error", description: error.message })
      setIsAdding(false)
    }
  }

  const handleMoveToTrash = async (member: any) => {
    if (!db) return
    moveToTrash(db, user, member, 'memberProfiles');
    toast({ title: "Moving to Trash", description: "This record will be stored in the Recycle Bin for 60 days." });
  }

  const parseMemberDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      return parse(dateStr, "PPP", new Date());
    } catch {
      return undefined;
    }
  }

  const filtered = profiles.filter((m: any) => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (m.memberId || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (levelFilter === 'All' || m.level === levelFilter);
  })

  const groupings = React.useMemo(() => {
    const central = filtered.filter(m => m.level === 'National');
    const stateGroups = filtered
      .filter(m => m.level === 'State')
      .reduce((acc, m) => {
        const state = (m.stateName || 'Unspecified State').toUpperCase();
        if (!acc[state]) acc[state] = [];
        acc[state].push(m);
        return acc;
      }, {} as Record<string, any[]>);
    const districtGroups = filtered
      .filter(m => m.level === 'District')
      .reduce((acc, m) => {
        const state = (m.stateName || 'Unspecified State').toUpperCase();
        const district = (m.districtName || 'Unspecified District').toUpperCase();
        if (!acc[state]) acc[state] = {};
        if (!acc[state][district]) acc[state][district] = [];
        acc[state][district].push(m);
        return acc;
      }, {} as Record<string, Record<string, any[]>>);
    return { central, stateGroups, districtGroups };
  }, [filtered]);

  const { central, stateGroups, districtGroups } = groupings;

  const renderMemberCard = (member: any) => (
    <Card key={member.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="p-5 bg-slate-50 dark:bg-slate-800 md:w-44 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">ID</span>
             <span className="text-xl font-headline font-bold text-primary dark:text-white tracking-tighter whitespace-nowrap">{member.memberId || 'PENDING'}</span>
          </div>
          <div className="flex-1 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-2 text-center sm:text-left w-full sm:w-auto">
              <h3 className="text-lg font-bold text-primary dark:text-white leading-tight">{member.name}</h3>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-[10px] text-slate-500 font-bold uppercase">
                 <span className="text-accent">{member.designation}</span>
                 <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {member.stateName || 'National'}</span>
                 <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5 text-accent" /> {member.phone || 'N/A'}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 shrink-0">
              <Link href={`/internal/members/${member.id}`} className="flex-1 sm:flex-none">
                <Button size="sm" className="w-full sm:w-auto h-9 rounded-xl text-[10px] px-5 font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all">
                  Profile
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full sm:w-auto h-9 rounded-xl text-[10px] px-4 font-black uppercase tracking-widest flex gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900">
                   <AlertDialogHeader className="items-center text-center">
                      <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                         <Archive className="w-8 h-8" />
                      </div>
                      <AlertDialogTitle className="text-2xl font-headline font-bold">Move to Trash?</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                        Are you sure you want to delete this record? This item will be moved to **Trash** and will remain there for **60 days** before being permanently deleted.
                      </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter className="mt-6 flex gap-3">
                      <AlertDialogCancel className="rounded-xl h-11 font-bold flex-1">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleMoveToTrash(member)} 
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 font-bold flex-1"
                      >
                        Move to Trash
                      </AlertDialogAction>
                   </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const statesList = Object.keys(INDIA_DATA).sort()

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="pt-16 pb-8 bg-slate-900 text-white relative overflow-hidden border-b-8 border-accent/20">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[9px] font-bold border border-red-500/30 uppercase tracking-[0.2em]">
                <Lock className="w-2.5 h-2.5" /> Members Directory
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">Secure <span className="text-accent italic">Registry</span></h1>
              <p className="text-slate-400 text-[11px] max-w-xl font-bold uppercase tracking-widest">Internal dashboard for managing operational force contact protocols.</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsAddingDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-accent text-primary font-bold rounded-xl h-14 md:h-12 px-8 flex gap-2 shadow-lg hover:bg-secondary hover:text-white transition-all transform hover:scale-105 active:scale-95">
                  <UserPlus className="w-5 h-5" /> Commission Member
                </Button>
              </DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-5xl rounded-[2.5rem] max-h-[95vh] overflow-hidden border-none shadow-2xl w-[95vw] p-0 flex flex-col">
                <div className="bg-slate-900 p-8 text-white relative shrink-0 border-b-4 border-accent/20">
                   <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white"><X className="w-5 h-5" /></Button></DialogClose></div>
                   <Badge className="bg-accent text-primary font-black uppercase text-[10px] tracking-widest px-4 h-6 mb-2">Registry Terminal</Badge>
                   <DialogTitle className="text-3xl font-headline font-bold">Personnel Commissioning</DialogTitle>
                   <DialogDescription className="text-slate-400 uppercase tracking-widest text-[9px] font-black mt-1">High-Fidelity Official Record Induction</DialogDescription>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
                   {/* Part 1: Personal Identity */}
                   <div className="space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                        <span className="w-8 h-px bg-accent"></span> Personal Identity Particulars
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
                         <div className="flex flex-col items-center gap-4">
                            <div className="relative w-40 h-40 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-accent transition-colors shadow-inner">
                              {newMember.imageId ? (
                                <Image src={newMember.imageId} alt="Preview" fill className="object-cover" />
                              ) : (
                                <div className="flex flex-col items-center gap-2"><Camera className="w-10 h-10 text-slate-300" /><span className="text-[9px] font-bold text-slate-400 uppercase">OFFICIAL PHOTO</span></div>
                              )}
                              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                            </div>
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Commissioning Image</Label>
                         </div>
                         <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 col-span-2">
                               <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Full Legal Name *</Label>
                               <div className="flex gap-2">
                                  <Select value={newMember.honorific} onValueChange={val => setNewMember({...newMember, honorific: val})}>
                                     <SelectTrigger className="w-24 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner"><SelectValue placeholder="Title" /></SelectTrigger>
                                     <SelectContent position="popper" className="z-[1000001] bg-white">{["Mr.", "Ms.", "Mrs.", "Dr.", "Adv.", "Prof.", "Hon."].map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                  </Select>
                                  <Input placeholder="Legal Identity Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="h-12 rounded-xl flex-1 bg-slate-50 dark:bg-slate-800 border-none shadow-inner font-bold" />
                               </div>
                            </div>
                            <div className="space-y-1.5">
                               <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Gender *</Label>
                               <Select value={newMember.gender} onValueChange={(val: any) => setNewMember({...newMember, gender: val})}>
                                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner"><SelectValue placeholder="Select" /></SelectTrigger>
                                  <SelectContent position="popper" className="z-[1000001] bg-white"><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                               </Select>
                            </div>
                            <div className="space-y-1.5">
                               <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Blood Group</Label>
                               <Select value={newMember.bloodGroup} onValueChange={val => setNewMember({...newMember, bloodGroup: val})}>
                                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner"><SelectValue placeholder="Select" /></SelectTrigger>
                                  <SelectContent position="popper" className="z-[1000001] bg-white">{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                               </Select>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Part 2: Academic & Professional Credentials */}
                   <div className="space-y-8 pt-10 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" /> Academic & Career Background
                      </h3>
                      <div className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Education Qualification *</Label>
                            <Input value={newMember.education} onChange={e => setNewMember({...newMember, education: e.target.value})} placeholder="Highest academic degree or specialization..." className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner" />
                         </div>
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Current Profession *</Label>
                            <Input value={newMember.profession} onChange={e => setNewMember({...newMember, profession: e.target.value})} placeholder="e.g. Legal Consultant / Social Worker" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner" />
                         </div>
                         <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Professional Experience Summary</Label>
                            <Textarea value={newMember.experience} onChange={e => setNewMember({...newMember, experience: e.target.value})} placeholder="Detail previous missions, case history or years of service..." className="min-h-[100px] rounded-2xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner" />
                         </div>
                      </div>
                   </div>

                   {/* Part 3: Organisational Placement */}
                   <div className="space-y-8 pt-10 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Organisational Role Allocation
                      </h3>
                      <div className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-6">
                            <div className="space-y-1.5">
                               <Label className="text-[10px] font-bold uppercase text-slate-400">Operational Level *</Label>
                               <Select value={newMember.level} onValueChange={(val: any) => setNewMember({...newMember, level: val, stateName: '', districtName: ''})}>
                                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                  <SelectContent position="popper" className="z-[1000001] bg-white"><SelectItem value="National">National Level</SelectItem><SelectItem value="State">State Level</SelectItem><SelectItem value="District">District Level</SelectItem></SelectContent>
                               </Select>
                            </div>
                            {(newMember.level === 'State' || newMember.level === 'District') && (
                               <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                  <div className="space-y-1.5">
                                     <Label className="text-[10px] font-bold uppercase text-emerald-600">Chapter State *</Label>
                                     <Select value={newMember.stateName} onValueChange={val => setNewMember({...newMember, stateName: val, districtName: ''})}>
                                        <SelectTrigger className="h-11 rounded-xl border-emerald-100"><SelectValue placeholder="Choose State" /></SelectTrigger>
                                        <SelectContent position="popper" className="max-h-60 z-[1000001] bg-white">{statesList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                     </Select>
                                  </div>
                                  {newMember.level === 'District' && newMember.stateName && (
                                     <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                                        <Label className="text-[10px] font-bold uppercase text-emerald-600">Chapter District *</Label>
                                        <Select value={newMember.districtName} onValueChange={val => setNewMember({...newMember, districtName: val})}>
                                           <SelectTrigger className="h-11 rounded-xl border-emerald-100"><SelectValue placeholder="Choose District" /></SelectTrigger>
                                           <SelectContent position="popper" className="max-h-60 z-[1000001] bg-white">{(INDIA_DATA[newMember.stateName] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                        </Select>
                                     </div>
                                  )}
                               </div>
                            )}
                         </div>
                         <div className="space-y-6">
                            <div className="space-y-1.5">
                               <Label className="text-[10px] font-bold uppercase text-slate-400">Designation Category *</Label>
                               <Select value={newMember.designationCategory} onValueChange={(val: any) => {
                                 const isFixed = val === 'General Member' || val === 'Board Member' || val === 'Volunteer';
                                 setNewMember({ ...newMember, designationCategory: val, designation: isFixed ? val : '' });
                               }}>
                                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                  <SelectContent position="popper" className="z-[1000001] bg-white">
                                    <SelectItem value="General Member">General Member</SelectItem>
                                    <SelectItem value="Board Member">Board Member</SelectItem>
                                    <SelectItem value="Office-bearing Member">Office-bearing Member</SelectItem>
                                    <SelectItem value="Volunteer">Volunteer</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                            {newMember.designationCategory === 'Office-bearing Member' && (
                              <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2">
                                <Label className="text-[10px] font-bold uppercase text-accent">Specific Designation *</Label>
                                <Input placeholder="e.g. Secretary, Treasurer" value={newMember.designation} onChange={e => setNewMember({...newMember, designation: e.target.value})} className="rounded-xl border-accent/20 h-11" />
                              </div>
                            )}
                         </div>
                      </div>
                   </div>

                   {/* Part 4: Temporal & Contact Protocols */}
                   <div className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 flex items-center gap-2">
                         <Clock className="w-4 h-4" /> Temporal & Contact Protocols
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Registry ID *</Label>
                           <div className="flex gap-2">
                              <Input placeholder="ABCDEF1234" value={newMember.memberId} onChange={e => setNewMember({...newMember, memberId: e.target.value.toUpperCase()})} className="h-11 rounded-xl font-mono bg-slate-50 dark:bg-slate-800" maxLength={10} />
                              <Button type="button" variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl border-dashed" onClick={() => setNewMember({...newMember, memberId: generateMemberId()})}><Sparkles className="w-4 h-4 text-accent" /></Button>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Term Duration *</Label>
                           <Select value={newMember.membershipDuration} onValueChange={val => setNewMember({...newMember, membershipDuration: val})}>
                              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent position="popper" className="z-[1000001] bg-white"><SelectItem value="1 Year">1 Year</SelectItem><SelectItem value="2 Years">2 Years</SelectItem><SelectItem value="3 Years">3 Years</SelectItem></SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Issue Date *</Label>
                           <Popover>
                              <PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 rounded-xl bg-white dark:bg-slate-900", !newMember.joiningDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{newMember.joiningDate ? newMember.joiningDate : "Pick date"}</Button></PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-[1000002]" align="start"><Calendar mode="single" selected={parseMemberDate(newMember.joiningDate)} onSelect={(date) => setNewMember({...newMember, joiningDate: date ? format(date, "PPP") : ''})} initialFocus /></PopoverContent>
                           </Popover>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Expiry Date</Label>
                           <Input disabled value={newMember.expiryDate} className="h-11 rounded-xl bg-slate-100/50 dark:bg-slate-950/50" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Official Mobile *</Label><Input value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner" /></div>
                         <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Official Email</Label><Input type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner" /></div>
                      </div>
                   </div>

                   {/* Part 5: Statutory Records & Residence */}
                   <div className="space-y-8 pt-10 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-2">
                        <Scale className="w-4 h-4" /> Statutory Records & Residence
                      </h3>
                      <div className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-6">
                            <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Aadhaar UID *</Label><Input value={newMember.aadhaar} onChange={e => setNewMember({...newMember, aadhaar: e.target.value})} maxLength={12} className="h-11 rounded-xl font-mono shadow-inner border-none bg-slate-50 dark:bg-slate-800" /></div>
                            <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Permanent Account Number (PAN)</Label><Input value={newMember.pan} onChange={e => setNewMember({...newMember, pan: e.target.value.toUpperCase()})} maxLength={10} className="h-11 rounded-xl font-mono shadow-inner border-none bg-slate-50 dark:bg-slate-800" /></div>
                         </div>
                         <div className="space-y-4">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Residential Protocol (Full Address) *</Label>
                            <Textarea value={newMember.address} onChange={e => setNewMember({...newMember, address: e.target.value})} className="min-h-[100px] rounded-2xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner" />
                            <div className="grid grid-cols-3 gap-3">
                               <Input placeholder="P.O." value={newMember.postOffice} onChange={e => setNewMember({...newMember, postOffice: e.target.value})} className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none" />
                               <Input placeholder="P.S." value={newMember.policeStation} onChange={e => setNewMember({...newMember, policeStation: e.target.value})} className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none" />
                               <Input placeholder="PIN" maxLength={6} value={newMember.pinCode} onChange={e => setNewMember({...newMember, pinCode: e.target.value})} className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none" />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <DialogFooter className="p-8 md:p-12 bg-slate-50 dark:bg-slate-900 border-t shrink-0">
                  <Button onClick={handleAddMember} disabled={isAdding} className="w-full h-16 rounded-[2rem] bg-primary text-white font-black uppercase tracking-widest text-lg md:text-xl shadow-2xl shadow-primary/20 transition-all hover:bg-secondary">
                    {isAdding ? <Loader2 className="animate-spin" /> : "Establish Force Record"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <section className="py-4 md:py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-[56px] z-30 shadow-sm transition-colors w-full overflow-hidden">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 justify-center w-full md:w-auto">
              <div className="flex flex-wrap justify-center gap-1">
                {["All", "National", "State", "District"].map((level) => (
                  <button key={level} onClick={() => setLevelFilter(level)} className={cn("whitespace-nowrap h-8 rounded-lg px-4 text-[10px] font-black uppercase transition-all", levelFilter === level ? "bg-accent text-primary shadow-sm hover:text-primary" : "text-slate-500 hover:bg-slate-200")}>{level}</button>
                ))}
              </div>
            </div>
            <div className="relative w-full max-md:max-w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Filter by name, ID or location..." className="pl-10 h-12 md:h-11 rounded-2xl border-slate-200 text-sm shadow-inner bg-slate-50 dark:bg-slate-950 font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 space-y-12 pb-24">
          {profilesLoading ? (
            <div className="text-center py-24"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Live Feed...</p></div>
          ) : filtered.length > 0 ? (
            <>
              {central.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <ShieldCheck className="w-5 h-5 text-red-600" />
                    <h4 className="text-sm font-black uppercase tracking-[0.25em] text-primary dark:text-white">National Registry</h4>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                  </div>
                  <div className="grid gap-4">{central.map(renderMemberCard)}</div>
                </div>
              )}

              {Object.keys(stateGroups).length > 0 && (
                <div className="space-y-12">
                  {Object.keys(stateGroups).sort().map(state => (
                    <div key={state} className="space-y-4">
                      <div className="flex items-center gap-3 px-2">
                        <Globe className="w-6 h-6 text-emerald-600" />
                        <h4 className="text-base font-black uppercase tracking-[0.2em] text-primary dark:text-white">{state} <span className="text-emerald-500 font-bold ml-2">Chapter</span></h4>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                      </div>
                      <div className="grid gap-4">{stateGroups[state].map(renderMemberCard)}</div>
                    </div>
                  ))}
                </div>
              )}

              {Object.keys(districtGroups).length > 0 && (
                <div className="space-y-16">
                  {Object.keys(districtGroups).sort().map(state => (
                    <div key={state} className="space-y-12">
                      {Object.keys(districtGroups[state]).sort().map(district => (
                        <div key={district} className="space-y-4">
                          <div className="flex items-center gap-3 px-2">
                            <Building2 className="w-6 h-6 text-blue-600" />
                            <h4 className="text-base font-black uppercase tracking-[0.2em] text-primary dark:text-white">{district} <span className="text-blue-500 font-bold ml-2">Cell</span> <span className="text-[10px] text-slate-400 font-medium ml-2">({state})</span></h4>
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                          </div>
                          <div className="grid gap-4">{districtGroups[state][district].map(renderMemberCard)}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-40 opacity-30"><User className="w-20 h-20 mx-auto mb-6" /><p className="text-xl font-headline font-bold uppercase tracking-widest">No matching records</p></div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
