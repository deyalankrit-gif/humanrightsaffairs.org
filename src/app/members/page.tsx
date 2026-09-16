
"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { 
  Search, 
  MapPin, 
  BadgeCheck, 
  User, 
  Users, 
  Briefcase, 
  ChevronDown, 
  Loader2, 
  Plus, 
  Upload,
  Globe,
  Calendar as CalendarIcon,
  Heart,
  Home,
  Sparkles,
  Camera,
  Mail,
  Phone,
  X,
  Star,
  ShieldCheck,
  Building2,
  ChevronRight,
  GraduationCap,
  BadgeCheck as BadgeCheckIcon,
  Scale,
  Hash,
  Clock,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp, doc } from 'firebase/firestore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, parse, addYears } from "date-fns"
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { INDIA_DATA } from '@/lib/india-data'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Member = {
  id: string
  memberId?: string
  name: string
  designationCategory?: string
  designation: string
  level: "National" | "State" | "District"
  stateName?: string
  districtName?: string
  imageId?: string
  gender?: string
  email?: string
  phone?: string
  status?: string
  joiningDate?: string
  expiryDate?: string
  membershipDuration?: string
  bloodGroup?: string
  address?: string
  postOffice?: string
  policeStation?: string
  pinCode?: string
  profession?: string
  education?: string
  experience?: string
  isDemi?: boolean
  aadhaar?: string
  pan?: string
}

export default function MembersPage() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("All")
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isMirror, setIsMirror] = useState(false)
  const [isDialogOpen, setIsAddingDialogOpen] = useState(false)
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<Member | null>(null)
  
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

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
    level: 'National' as const,
    status: 'Active',
    memberId: '',
    stateName: '',
    districtName: '',
    imageId: '',
    joiningDate: '',
    expiryDate: '',
    membershipDuration: '1 Year',
    aadhaar: '',
    pan: ''
  })

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setIsMirror(window.self !== window.top)
    }
  }, [])

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

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'demi_visibility');
  }, [db]);
  const { data: visibilitySettings } = useDoc(settingsRef);
  const isDemiVisible = visibilitySettings?.enabled !== false;

  const membersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
  }, [db]);

  const { data: firestoreMembers, loading: membersLoading } = useCollection(membersQuery);

  const isAdmin = user?.email === 'deydhritiman@gmail.com' && isMirror

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

  const handleLevelClick = (level: string) => {
    setLevelFilter(level)
    setSelectedState(null)
    setSelectedDistrict(null)
  }

  const handleStateSelect = (state: string) => {
    setLevelFilter("State")
    setSelectedState(state)
    setSelectedDistrict(null)
  }

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district)
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
      toast({ variant: "destructive", title: "Missing Information", description: `${missing.label} is required.` });
      return;
    }

    const idPattern = /^[A-Z]{6}[0-9]{4}$/;
    if (!idPattern.test(newMember.memberId)) {
      toast({ variant: "destructive", title: "Invalid Member ID", description: "ID must be 10 characters (6 letters + 4 digits)." });
      return;
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
      toast({ title: "Success", description: "New member record established." })
      setIsAdding(false)
      setIsAddingDialogOpen(false)
      setNewMember({ 
        honorific: '', name: '', designationCategory: 'General Member', designation: 'General Member', 
        profession: '', education: '', experience: '', email: '', phone: '', level: 'National', 
        status: 'Active', memberId: '', stateName: '', districtName: '', gender: 'male', 
        imageId: '', joiningDate: '', expiryDate: '', membershipDuration: '1 Year',
        aadhaar: '', pan: ''
      })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
      setIsAdding(false)
    }
  }

  const members = React.useMemo(() => {
    let list = (firestoreMembers || []) as Member[];
    if (!isDemiVisible) {
      list = list.filter(m => m.isDemi !== true);
    }
    return list;
  }, [firestoreMembers, isDemiVisible]);

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (m.designation || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.memberId || '').toLowerCase().includes(search.toLowerCase());
    
    let matchesLevel = levelFilter === "All" || m.level === levelFilter;
    if (selectedState) {
      matchesLevel = m.stateName === selectedState;
      if (selectedDistrict) {
        matchesLevel = matchesLevel && m.districtName === selectedDistrict;
      }
    }
    return matchesSearch && matchesLevel;
  })

  const centralMembers = filteredMembers.filter(m => m.level === 'National')
  
  const stateGroups = filteredMembers
    .filter(m => m.level === 'State')
    .reduce((acc, m) => {
      const state = m.stateName || 'Other';
      if (!acc[state]) acc[state] = [];
      acc[state].push(m);
      return acc;
    }, {} as Record<string, Member[]>);

  const districtGroups = filteredMembers
    .filter(m => m.level === 'District')
    .reduce((acc, m) => {
      const state = m.stateName || 'Other';
      const district = m.districtName || 'Other';
      if (!acc[state]) acc[state] = {};
      if (!acc[state][district]) acc[state][district] = [];
      acc[state][district].push(m);
      return acc;
    }, {} as Record<string, Record<string, Member[]>>);

  const parseMemberDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try { return parse(dateStr, "PPP", new Date()); } catch { return undefined; }
  }

  const MemberGrid = ({ items }: { items: Member[] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3">
      {items.map((member) => {
        const nameLower = (member.name || '').toLowerCase();
        const genderKey = (member.gender || '').trim().toLowerCase();
        const isMs = nameLower.startsWith('ms.') || nameLower.startsWith('mrs.') || nameLower.startsWith('miss');
        const femaleNames = ["moumita", "raisa", "rumpa", "anjali", "sujata", "fatema", "mousumi", "savita", "rajeshwari", "meenakshi", "pallavi", "suchitra", "amita", "debjani", "deepali", "tapasya", "priyanka", "anita", "sneha", "mitali"];
        const isKnownFemale = femaleNames.includes(nameLower.split(' ')[0]);

        let fallback = '/dummy m.png';
        if (genderKey === 'female' || genderKey === 'f' || genderKey === 'woman' || isMs || isKnownFemale) fallback = '/dummy w.png';
        
        const isCustomPhoto = member.imageId && (member.imageId.startsWith('data:') || member.imageId.startsWith('http'));
        const displayImg = isCustomPhoto ? member.imageId : (PlaceHolderImages.find(i => i.id === member.imageId)?.imageUrl || fallback)
        const isOfficeBearer = member.designationCategory === 'Office-bearing Member';

        return (
          <Card 
            key={member.id} 
            onClick={() => setSelectedMemberDetails(member)}
            className={cn(
              "group border-none shadow-sm hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative cursor-pointer"
            )}
          >
            <div className="p-1.5 md:p-2 pb-0 text-center">
               <p className={cn("text-[5px] sm:text-[6px] md:text-[7px] uppercase tracking-widest truncate", isOfficeBearer ? "font-black text-accent" : "font-bold text-accent/80")}>{member.designation}</p>
            </div>
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-t-2xl">
                <Image src={displayImg!} alt={member.name} fill className="object-cover transition-transform group-hover:scale-110" />
                {isOfficeBearer && <div className="absolute top-1 left-1 bg-white/50 backdrop-blur-sm rounded-full p-0.5"><Star className="w-3 h-3 text-accent fill-accent" /></div>}
              </div>
            </CardHeader>
            <CardContent className="p-1.5 space-y-1">
              <h3 className="font-headline font-bold text-[8px] sm:text-[10px] text-primary dark:text-white leading-tight truncate">{member.name}</h3>
              <div className="flex items-center gap-1 text-[6px] sm:text-[8px] text-muted-foreground truncate uppercase"><MapPin className="w-2 h-2 text-accent" /> {member.stateName || 'National'}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const SectionHeading = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
    <div className="flex items-center gap-3 md:gap-5 mb-8 md:mb-10 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div className={cn("p-2 md:p-4 rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 border", color)}><Icon className="w-5 h-5 md:w-8 md:h-8" /></div>
      <h2 className={cn("font-headline font-bold", title === "Central Committee" ? "text-3xl md:text-5xl" : "text-xl md:text-3xl")}>{title}</h2>
    </div>
  )

  const statesList = Object.keys(INDIA_DATA).sort();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 w-full overflow-x-hidden">
      <section className="pt-32 pb-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="bg-accent text-primary font-black px-4 py-1.5 uppercase tracking-widest text-[10px] mb-6">Verified Registry</Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-bold mb-6">Our <span className="text-accent italic">Members</span></h1>
          
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsAddingDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary-foreground font-bold rounded-2xl h-14 px-10 flex gap-2 hover:bg-secondary hover:text-white shadow-2xl transition-all">
                  <Plus className="w-6 h-6" /> Commission Member
                </Button>
              </DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-5xl rounded-[2.5rem] max-h-[95vh] overflow-hidden border-none shadow-2xl w-[95vw] p-0 flex flex-col">
                <div className="bg-slate-900 p-8 text-white relative shrink-0 border-b-4 border-accent/20">
                   <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white"><X className="w-5 h-5" /></Button></DialogClose></div>
                   <Badge className="bg-accent text-primary font-black uppercase text-[10px] tracking-widest px-4 h-6 mb-2">Commission Terminal</Badge>
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
                            <Input value={newMember.education} onChange={e => setNewMember({...newMember, education: e.target.value})} placeholder="Highest academic degree..." className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner" />
                         </div>
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Current Profession *</Label>
                            <Input value={newMember.profession} onChange={e => setNewMember({...newMember, profession: e.target.value})} placeholder="e.g. Advocate / Social Worker" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner" />
                         </div>
                         <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Professional Experience Summary</Label>
                            <Textarea value={newMember.experience} onChange={e => setNewMember({...newMember, experience: e.target.value})} placeholder="Detail previous missions or years of service..." className="min-h-[100px] rounded-2xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner" />
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
                               <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-1">
                                  <div className="space-y-1.5">
                                     <Label className="text-[10px] font-bold uppercase text-emerald-600">Chapter State *</Label>
                                     <Select value={newMember.stateName} onValueChange={val => setNewMember({...newMember, stateName: val, districtName: ''})}>
                                        <SelectTrigger className="h-11 rounded-xl border-emerald-100"><SelectValue placeholder="Choose State" /></SelectTrigger>
                                        <SelectContent position="popper" className="max-h-60 z-[1000001] bg-white">{statesList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                     </Select>
                                  </div>
                                  {newMember.level === 'District' && newMember.stateName && (
                                     <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
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
                                <Label className="text-[10px] font-bold uppercase text-accent">Manual Designation *</Label>
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
                              <PopoverContent className="w-auto p-0 z-[1000002]" align="start"><CalendarComponent mode="single" selected={parseMemberDate(newMember.joiningDate)} onSelect={(date) => setNewMember({...newMember, joiningDate: date ? format(date, "PPP") : ''})} initialFocus /></PopoverContent>
                           </Popover>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Expiry Date</Label>
                           <Input disabled value={newMember.expiryDate} className="h-11 rounded-xl bg-slate-100/50 dark:bg-slate-950/50" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Mobile Phone *</Label><Input value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner" /></div>
                         <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Email Address</Label><Input type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner" /></div>
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
                            <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">PAN Number</Label><Input value={newMember.pan} onChange={e => setNewMember({...newMember, pan: e.target.value.toUpperCase()})} maxLength={10} className="h-11 rounded-xl font-mono shadow-inner border-none bg-slate-50 dark:bg-slate-800" /></div>
                         </div>
                         <div className="space-y-4">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Full Residence Protocol *</Label>
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
          )}
        </div>
      </section>

      <section className="py-4 md:py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-[56px] z-30 shadow-sm transition-colors w-full overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 justify-center w-full md:w-auto">
              <div className="flex flex-wrap justify-center gap-1">
                {["All", "National", "State", "District"].map((level) => (
                  <Button 
                    key={level} 
                    variant={levelFilter === level && !selectedState ? "default" : "outline"} 
                    onClick={() => handleLevelClick(level)} 
                    className={cn(
                      "rounded-full px-2 sm:px-4 h-7 sm:h-8 text-[7px] sm:text-[10px] font-bold transition-all border-slate-200 dark:border-slate-700",
                      levelFilter === level && !selectedState ? "bg-accent text-primary" : "text-primary dark:text-slate-300"
                    )}
                  >
                    {level === 'National' ? 'Central' : level}
                  </Button>
                ))}
              </div>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
              <div className="flex gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={selectedState ? "default" : "outline"} className="rounded-full px-4 h-8 text-[10px] font-bold">
                      {selectedState || "State"} <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-80 overflow-y-auto w-48 bg-white z-[1000]">
                    {statesList.map(s => <DropdownMenuItem key={s} onClick={() => handleStateSelect(s)}>{s}</DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>
                {selectedState && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={selectedDistrict ? "default" : "outline"} className="rounded-full px-4 h-8 text-[10px] font-bold animate-in fade-in slide-in-from-left-2">
                        {selectedDistrict || "District"} <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-80 overflow-y-auto w-48 bg-white z-[1000]">
                      {districtsList.map(d => <DropdownMenuItem key={d} onClick={() => handleDistrictSelect(d)}>{d}</DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <div className="relative w-full md:w-64 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input placeholder="Search..." className="pl-9 h-9 rounded-full border-slate-200 bg-slate-50 dark:bg-slate-800 text-[10px]" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 space-y-24">
          {membersLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <>
              {centralMembers.length > 0 && (
                <div>
                  <SectionHeading title="Central Committee" icon={ShieldCheck} color="text-red-600 border-red-100" />
                  <MemberGrid items={centralMembers} />
                </div>
              )}
              {Object.keys(stateGroups).map(state => (
                <div key={state}>
                  <SectionHeading title={`${state} Chapter`} icon={Globe} color="text-emerald-500 border-emerald-100" />
                  <MemberGrid items={stateGroups[state]} />
                </div>
              ))}
              {Object.keys(districtGroups).map(state => (
                <div key={state} className="space-y-12">
                   {Object.keys(districtGroups[state]).map(district => (
                     <div key={district}>
                        <SectionHeading title={`${district} District Cell`} icon={Building2} color="text-blue-600 border-blue-100" />
                        <MemberGrid items={districtGroups[state][district]} />
                     </div>
                   ))}
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <Footer />

      {/* Member Details Dialog */}
      <Dialog open={!!selectedMemberDetails} onOpenChange={val => !val && setSelectedMemberDetails(null)}>
        <DialogContent className="max-w-4xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 flex flex-col max-h-[90vh]">
          {selectedMemberDetails && (
            <>
              <div className="bg-slate-900 p-8 text-white relative border-b-8 border-accent/20 shrink-0">
                <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white"><X className="w-5 h-5" /></Button></DialogClose></div>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-800">
                    <Image 
                      src={selectedMemberDetails.imageId || (selectedMemberDetails.gender === 'female' ? '/dummy w.png' : '/dummy m.png')} 
                      alt={selectedMemberDetails.name} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                     <Badge className="bg-accent text-primary font-black uppercase text-[8px] tracking-widest">{selectedMemberDetails.level} Level Official</Badge>
                     <DialogTitle className="text-3xl font-headline font-bold">{selectedMemberDetails.name}</DialogTitle>
                     <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <BadgeCheckIcon className="w-4 h-4" /> {selectedMemberDetails.designation}
                     </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
                <div className="grid md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-accent flex items-center gap-2 border-b pb-2"><GraduationCap className="w-4 h-4" /> Academic & Career</h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                           <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Education Qualification</p>
                           <p className="text-sm font-bold">{selectedMemberDetails.education || 'Not Provided'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                           <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Current Profession</p>
                           <p className="text-sm font-bold">{selectedMemberDetails.profession || 'Not Provided'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                           <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Service Experience</p>
                           <p className="text-xs italic leading-relaxed text-slate-600 dark:text-slate-400">"{selectedMemberDetails.experience || 'No detailed history available.'}"</p>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-accent flex items-center gap-2 border-b pb-2"><ShieldCheck className="w-4 h-4" /> Registry Metadata</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Official ID</p>
                           <p className="text-xs font-mono font-bold">{selectedMemberDetails.memberId}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Blood Group</p>
                           <p className="text-xs font-bold text-red-600">{selectedMemberDetails.bloodGroup || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Issue Date</p>
                           <p className="text-xs font-bold">{selectedMemberDetails.joiningDate}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Expiry Date</p>
                           <p className="text-xs font-bold text-red-500">{selectedMemberDetails.expiryDate}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                         <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Jurisdiction</p>
                         <p className="text-sm font-bold uppercase">{selectedMemberDetails.districtName ? `${selectedMemberDetails.districtName}, ` : ''}{selectedMemberDetails.stateName || 'National Council'}</p>
                      </div>
                   </div>
                </div>
                
                <div className="space-y-6 pt-6 border-t">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Institutional Mandate</h4>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed italic">
                    "This official is authorized by the Human Rights Affairs Trust to represent the mission of social justice and constitutional literacy within their assigned jurisdiction. Any institutional communication issued by this node is verified by the central registry."
                  </p>
                </div>
              </div>

              <div className="p-8 border-t bg-slate-50 dark:bg-slate-900 shrink-0">
                 <Button onClick={() => setSelectedMemberDetails(null)} className="w-full h-12 rounded-xl bg-primary text-white font-bold">Dismiss Profile View</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
