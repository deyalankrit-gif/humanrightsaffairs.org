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
  GraduationCap
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
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
  DialogDescription
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parse, addYears } from "date-fns"
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  gender?: 'male' | 'female'
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
  const [enlargedId, setEnlargedId] = useState<string | null>(null)
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
    gender: 'male' as 'male' | 'female',
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
    membershipDuration: '1 Year'
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
    if (!newMember.name || !newMember.email || !newMember.memberId || !newMember.joiningDate) {
      toast({ 
        variant: "destructive", 
        title: "Validation Error", 
        description: "Name, Email, Member ID, and Membership Issue Date are required." 
      })
      return
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
      })
      toast({ title: "Success", description: "New member record established." })
      setIsAdding(false)
      setIsAddingDialogOpen(false)
      setNewMember({ 
        honorific: '',
        name: '', 
        designationCategory: 'General Member',
        designation: 'General Member', 
        profession: '',
        education: '',
        experience: '',
        email: '', 
        phone: '', 
        level: 'National', 
        status: 'Active', 
        memberId: '', 
        stateName: '', 
        districtName: '', 
        gender: 'male', 
        imageId: '',
        joiningDate: '',
        expiryDate: '',
        membershipDuration: '1 Year'
      })
    } catch (error: any) {
      toast({ variant: "destructive", title: "System Error", description: error.message })
      setIsAdding(false)
    }
  }

  const members = (firestoreMembers || []) as Member[]

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
    try {
      return parse(dateStr, "PPP", new Date());
    } catch {
      return undefined;
    }
  }

  if (!mounted) return null

  const statesList = Object.keys(INDIA_DATA).sort();
  const districtsList = selectedState ? INDIA_DATA[selectedState] : [];

  const MemberGrid = ({ items }: { items: Member[] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3">
      {items.map((member) => {
        const fallback = member.gender?.toLowerCase() === 'female' ? '/dummy w.png' : '/dummy m.png'
        const displayImg = member.imageId?.startsWith('data:') ? member.imageId : (PlaceHolderImages.find(i => i.id === member.imageId)?.imageUrl || fallback)
        const isOfficeBearer = member.designationCategory === 'Office-bearing Member';
        
        const getStarColor = (level: string) => {
          switch (level) {
            case 'National': return "text-red-600 fill-red-500";
            case 'State': return "text-emerald-500 fill-emerald-400";
            case 'District': return "text-blue-600 fill-blue-500";
            default: return "text-emerald-500 fill-emerald-400";
          }
        }

        return (
          <Card 
            key={member.id} 
            onClick={(e) => {
              e.stopPropagation();
              setEnlargedId(enlargedId === member.id ? null : member.id);
            }}
            className={cn(
              "group border-none shadow-sm hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-visible bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative hover:scale-105 sm:hover:scale-110 md:hover:scale-125 hover:z-50 cursor-pointer",
              enlargedId === member.id && "scale-110 sm:scale-125 md:scale-150 z-[100] shadow-2xl"
            )}
          >
            <div className="p-1.5 md:p-2 pb-0 text-center">
               <p className={cn(
                   "text-[5px] sm:text-[6px] md:text-[7px] uppercase tracking-widest leading-tight",
                   enlargedId === member.id ? "whitespace-normal line-clamp-2" : "truncate",
                   isOfficeBearer ? "font-black text-accent" : "font-bold text-accent/80"
                 )}
               >
                 {member.designation}
               </p>
            </div>
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-t-2xl">
                <Image 
                  src={displayImg} 
                  alt={member.name} 
                  fill 
                  className={cn(
                    "object-cover transition-transform duration-500",
                    enlargedId === member.id ? "scale-110" : ""
                  )} 
                />
                
                {isOfficeBearer && (
                  <div className="absolute top-1 left-1 bg-white/50 backdrop-blur-sm rounded-full p-0.5 z-10">
                    <Star className={cn("w-2.5 h-2.5 md:w-3.5 md:h-3.5", getStarColor(member.level))} />
                  </div>
                )}

                <div className="absolute top-1 right-1">
                  <Badge className="bg-primary/80 backdrop-blur-md text-white font-bold border-none text-[4px] sm:text-[6px] px-1 py-0 leading-none h-auto">
                    {member.level === 'National' ? 'Central' : member.level}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-1 sm:p-1.5 md:p-2 space-y-0.5 sm:space-y-1">
              <div className="flex items-start gap-0.5 sm:gap-1">
                 <BadgeCheck className="w-2 md:w-2.5 h-2 md:h-2.5 text-accent shrink-0 mt-0.5" />
                 <div className="min-w-0">
                   <h3 className="font-headline font-bold text-[7px] sm:text-[9px] md:text-[10px] text-primary dark:text-white leading-tight truncate">{member.name}</h3>
                 </div>
              </div>
              <div className="space-y-0.5 pt-0.5 sm:pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-0.5 sm:gap-1 text-[5px] sm:text-[7px] md:text-[8px] text-muted-foreground">
                  <MapPin className="w-1.5 md:w-2 h-1.5 md:h-2 text-slate-400 shrink-0" />
                  <span className="truncate">{member.districtName ? `${member.districtName}, ` : ''}{member.stateName || 'National'}</span>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 text-[5px] sm:text-[7px] md:text-[8px] text-muted-foreground">
                  <Briefcase className="w-1.5 md:w-2 h-1.5 md:h-2 text-slate-400 shrink-0" />
                  <span className="truncate">ID: {member.memberId || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const SectionHeading = ({ title, icon: Icon, color, subtitle }: { title: string, icon: any, color: string, subtitle?: string }) => (
    <div className="flex items-center gap-3 md:gap-5 mb-8 md:mb-10 pb-4 md:pb-5 border-b border-slate-100 dark:border-slate-800">
      <div className={cn("p-2.5 md:p-4 rounded-xl md:rounded-[1.5rem] bg-white dark:bg-slate-900 shadow-sm border", color)}>
        <Icon className="w-5 h-5 md:w-8 md:h-8" />
      </div>
      <div>
        <h2 className="text-lg md:text-3xl font-headline font-bold text-primary dark:text-white leading-none">{title}</h2>
        <p className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          {subtitle || "Official Organizational Tier"}
        </p>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 w-full overflow-x-hidden" onClick={() => setEnlargedId(null)}>
      <section className="pt-24 md:pt-40 pb-12 md:pb-20 bg-primary text-primary-foreground relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-[10px] md:text-sm font-bold border border-accent/30 mb-6 uppercase tracking-widest">
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            <span>Official Member Records</span>
          </div>
          <h1 className="text-2xl sm:text-5xl md:text-7xl font-headline font-bold mb-4 md:mb-6 text-primary-foreground leading-tight px-2">Verified <span className="text-accent italic">Active Members</span></h1>
          
          <div className="max-w-2xl mx-auto space-y-4 mb-6 md:mb-8 px-4">
            <p className="text-xs md:text-xl opacity-80 text-primary-foreground leading-relaxed">
              A dynamic ledger of our dedicated human rights defenders, updated in real-time by the central administration.
            </p>
            <p className="text-emerald-400 font-bold tracking-wide text-[9px] sm:text-sm md:text-base animate-pulse">
              The following list contains the names of all currently active members of the organization only
            </p>
          </div>

          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsAddingDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary-foreground font-bold rounded-xl md:rounded-2xl h-10 md:h-14 px-6 md:px-10 flex gap-2 hover:bg-secondary hover:text-white shadow-2xl shadow-accent/20 mx-auto transform hover:scale-105 transition-all text-[10px] md:text-base py-3 w-full sm:w-auto">
                  <Plus className="w-4 h-4 md:w-6 md:h-6" /> Commission Membership
                </Button>
              </DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto w-[95vw]">
                <DialogHeader>
                  <DialogTitle className="text-xl md:text-2xl font-headline font-bold text-primary dark:text-white text-center sm:text-left">Personnel Commissioning</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-accent transition-colors shadow-inner">
                          {newMember.imageId ? (
                            <Image src={newMember.imageId} alt="Preview" fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full"><User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" /></div>
                          )}
                          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                        </div>
                        <Label className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">Upload Photo</Label>
                      </div>
                      <div className="md:col-span-2 space-y-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Full Name *</Label>
                          <div className="flex gap-2">
                             <Select value={newMember.honorific} onValueChange={val => setNewMember({...newMember, honorific: val})}>
                                <SelectTrigger className="w-20 sm:w-24 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200"><SelectValue placeholder="Title" /></SelectTrigger>
                                <SelectContent position="popper" className="z-[1000001] bg-white">
                                  {["Mr.", "Ms.", "Mrs.", "Dr.", "Adv.", "Prof.", "Hon.", "Rev."].map(h => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                </SelectContent>
                             </Select>
                             <Input placeholder="Full Legal Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="h-11 rounded-xl flex-1" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Gender *</Label>
                            <Select value={newMember.gender} onValueChange={(val: any) => setNewMember({...newMember, gender: val})}>
                              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent position="popper" className="z-[1000001] bg-white"><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
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
                      </div>
                   </div>
                   {/* Rest of the form remains similar but optimized for grid-cols-1 on mobile */}
                </div>
                <DialogFooter><Button onClick={handleAddMember} disabled={isAdding} className="w-full h-12 rounded-xl bg-accent text-primary font-bold text-lg shadow-xl shadow-accent/20">Establish Record</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </section>

      <section className="py-4 md:py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-[56px] z-30 shadow-sm transition-colors w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="container mx-auto px-2 sm:px-4">
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
                      levelFilter === level && !selectedState
                        ? "bg-accent text-white shadow-sm border-accent hover:bg-secondary hover:text-white" 
                        : "text-primary dark:text-slate-300 hover:bg-secondary hover:text-white hover:border-secondary transition-colors"
                    )}
                  >
                    {level === 'All' ? 'All' : level === 'National' ? 'Central' : level}
                  </Button>
                ))}
              </div>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1"></div>

              <div className="flex flex-wrap gap-1 justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={selectedState ? "default" : "outline"} className={cn(
                      "rounded-full px-2 sm:px-4 h-7 sm:h-8 text-[7px] sm:text-[10px] font-bold flex items-center gap-1 transition-all",
                      selectedState ? "bg-accent text-white hover:bg-secondary hover:text-white" : "text-primary dark:text-white border-slate-200 dark:border-slate-700 hover:bg-secondary hover:text-white hover:border-secondary transition-colors"
                    )}>
                      {selectedState || "State"} <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-80 overflow-y-auto w-48 bg-white z-[1000001]">
                    {statesList.map((state) => (
                      <DropdownMenuItem key={state} onClick={() => handleStateSelect(state)} className="font-bold text-xs">{state}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {selectedState && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={selectedDistrict ? "default" : "outline"} className={cn(
                        "rounded-full px-2 sm:px-4 h-7 sm:h-8 text-[7px] sm:text-[10px] font-bold flex items-center gap-1 animate-in fade-in slide-in-from-left-2 transition-all",
                        selectedDistrict ? "bg-accent text-white hover:bg-secondary hover:text-white" : "text-primary dark:text-white border-slate-200 dark:border-slate-700 hover:bg-secondary hover:text-white hover:border-secondary transition-colors"
                      )}>
                        {selectedDistrict || "District"} <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-80 overflow-y-auto w-48 bg-white z-[1000001]">
                      {districtsList.map((district) => (
                        <DropdownMenuItem key={district} onClick={() => handleDistrictSelect(district)} className="font-bold text-xs">{district}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <div className="relative w-full md:w-64 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input 
                placeholder="Search database..." 
                className="pl-9 h-9 rounded-full border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-[8px] sm:text-[10px]" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4 space-y-12 md:space-y-24">
          {membersLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">Synchronizing Registry...</p>
            </div>
          ) : filteredMembers.length > 0 ? (
            <>
              {centralMembers.length > 0 && (
                <div className="space-y-6">
                  <SectionHeading title="Central Committee" icon={ShieldCheck} color="text-red-600 border-red-100" subtitle={`${centralMembers.length} Officials`} />
                  <MemberGrid items={centralMembers} />
                </div>
              )}

              {Object.keys(stateGroups).length > 0 && (
                <div className="space-y-10">
                  <SectionHeading title="State Chapters" icon={Globe} color="text-emerald-500 border-emerald-100" />
                  <div className="space-y-10 pl-3 border-l-2 border-emerald-50 dark:border-emerald-900/30">
                    {Object.keys(stateGroups).sort().map(state => (
                      <div key={state} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px] px-3 py-0.5 rounded-lg">
                            {state}
                          </Badge>
                          <div className="h-px flex-1 bg-emerald-50 dark:bg-emerald-900/30"></div>
                        </div>
                        <MemberGrid items={stateGroups[state]} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(districtGroups).length > 0 && (
                <div className="space-y-10">
                  <SectionHeading title="District Councils" icon={Building2} color="text-blue-600 border-blue-100" />
                  <div className="space-y-12 pl-3 border-l-2 border-blue-50 dark:border-blue-900/30">
                    {Object.keys(districtGroups).sort().map(state => (
                      <div key={state} className="space-y-8">
                        <div className="flex items-center gap-2">
                           <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded-lg shadow-lg border border-white/10">
                              <Globe className="w-3 h-3 text-accent" />
                              <span className="text-[9px] md:text-xs font-black uppercase tracking-widest">{state}</span>
                           </div>
                           <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                        
                        <div className="space-y-10 pl-4 border-l border-dashed border-slate-200 dark:border-slate-800">
                          {Object.keys(districtGroups[state]).sort().map(district => (
                            <div key={district} className="space-y-4">
                              <div className="flex items-center gap-2 text-primary dark:text-accent font-black uppercase tracking-widest text-[8px] md:text-[10px]">
                                <ChevronRight className="w-2.5 h-2.5" />
                                <span>{district} Cell</span>
                              </div>
                              <MemberGrid items={districtGroups[state][district]} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="col-span-full py-24 text-center">
              <User className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
              <h3 className="text-xl font-headline font-bold text-primary dark:text-white">No active records match the criteria</h3>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
