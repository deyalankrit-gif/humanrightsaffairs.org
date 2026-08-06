
"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { 
  Shield, 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Upload, 
  Globe, 
  MapPin, 
  ChevronRight, 
  Users,
  Search,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  X,
  User,
  Star,
  ShieldCheck,
  Building2,
  Info,
  BadgeCheck as BadgeCheckIcon,
  Settings2
} from 'lucide-react'
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, where } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, parse } from "date-fns"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { INDIA_DATA } from '@/lib/india-data'

type Leader = {
  id: string
  name: string
  title: string
  imageId?: string
  gender: 'male' | 'female'
  level: "Central" | "State" | "District"
  parentRegion?: string 
  districtName?: string
}

function LeaderCard({ leader, variant = "default", isAdmin, onEdit, onDelete }: { leader: Leader, variant?: "xl" | "large" | "default" | "small", isAdmin?: boolean, onEdit?: (l: Leader) => void, onDelete?: (id: string) => void }) {
  const nameLower = (leader.name || '').toLowerCase();
  const genderKey = (leader.gender || '').trim().toLowerCase();
  
  // Intelligent Gender Inference for Fallback
  const isMs = nameLower.startsWith('ms.') || nameLower.startsWith('mrs.') || nameLower.startsWith('miss');
  const femaleNames = ["moumita", "raisa", "rumpa", "anjali", "sujata", "fatema", "mousumi", "savita", "rajeshwari", "meenakshi", "pallavi", "suchitra", "amita", "debjani", "deepali", "tapasya", "priyanka", "anita", "sneha", "mitali"];
  const firstName = (leader.name || '').split(' ')[0].toLowerCase();
  const isKnownFemale = femaleNames.includes(firstName);

  let fallback = '/dummy m.png';
  if (genderKey === 'female' || genderKey === 'f' || genderKey === 'woman' || isMs || isKnownFemale) {
    fallback = '/dummy w.png';
  } else if (genderKey === 'male' || genderKey === 'm' || genderKey === 'man') {
    fallback = '/dummy m.png';
  }
  
  const isCustomPhoto = leader.imageId && (leader.imageId.startsWith('data:') || leader.imageId.startsWith('http'));
  const placeholder = PlaceHolderImages.find(i => i.id === leader.imageId)?.imageUrl;
  
  const img = isCustomPhoto ? leader.imageId : (placeholder || fallback)
  
  const sizeClasses = {
    xl: "w-64 h-80 md:w-80 md:h-[420px]", // Central Chairman/Founder
    large: "w-48 h-64 md:w-64 md:h-80",   // State Chairman / Senior Chapter
    default: "w-36 h-48 md:w-48 md:h-60", // District Chairman / State Support
    small: "w-24 h-32 md:w-32 md:h-40"    // District Support
  }

  const isChairman = leader.title.toLowerCase().includes("chairman")
  const isPresident = leader.title.toLowerCase().includes("president")

  return (
    <div className="flex flex-col items-center group relative">
      <div className={`relative ${sizeClasses[variant]} rounded-2xl overflow-hidden shadow-xl border-2 md:border-4 border-white group-hover:border-secondary transition-all duration-500 bg-slate-100 dark:bg-slate-800`}>
        <Image src={img!} alt={leader.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8 z-10">
          {isAdmin && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Button onClick={(e) => { e.stopPropagation(); onEdit?.(leader); }} size="icon" className="bg-white dark:bg-slate-800 text-primary dark:text-white rounded-full hover:bg-secondary hover:text-white transition-colors border border-white/20 shadow-2xl h-11 w-11">
                <Edit className="w-5 h-5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="icon" className="bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors border border-white/20 shadow-2xl h-11 w-11" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-headline font-bold text-primary dark:text-white">Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      Are you sure you want to delete this item? This action may be irreversible. Please confirm before continuing.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel className="rounded-xl h-11 font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete?.(leader.id)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11 font-bold">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 text-center px-2">
        <h4 className={cn(
          "font-headline font-bold text-primary dark:text-white leading-tight mb-1",
          (variant === 'xl' || variant === 'large' || isChairman || isPresident) ? 'text-lg md:text-xl lg:text-2xl' : 'text-sm md:text-base'
        )}>
          {leader.name}
        </h4>
        
        <div className="flex flex-col items-center">
          <p className={cn(
            "text-accent font-black uppercase tracking-widest leading-none",
            (variant === 'xl' || variant === 'large' || leader.title.includes("Founder")) ? 'text-[10px] md:text-xs' : 'text-[8px] md:text-[9px]'
          )}>
            {leader.title}
          </p>
          
          <p className="text-[7px] md:text-[8px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.1em] mt-1.5 flex items-center justify-center gap-1">
             <ShieldCheck className="w-2.5 h-2.5 text-slate-300 dark:text-slate-700" />
             {leader.level === 'Central' && "National Committee"}
             {leader.level === 'State' && `${leader.parentRegion} State Committee`}
             {leader.level === 'District' && `${leader.districtName} District Committee`}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LeadershipPage() {
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isMirror, setIsMirror] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editStep, setEditStep] = useState<'confirm' | 'form'>('confirm')
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [memberSearch, setMemberSearch] = useState("")

  // Administrative actions in the mirror are strictly Root-only
  const isAdmin = user?.email?.toLowerCase() === 'deydhritiman@gmail.com' && isMirror

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMirror(window.self !== window.top)
    }
  }, [])

  const firestoreLeadersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'leadership'), orderBy('createdAt', 'asc'));
  }, [db]);

  const membersQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return query(collection(db, 'memberProfiles'), where('isDemi', '==', false), orderBy('name', 'asc'));
  }, [db, isAdmin]);

  const { data: firestoreLeaders, loading: dataLoading } = useCollection(firestoreLeadersQuery);
  const { data: membersList } = useCollection(membersQuery);

  const leaders = React.useMemo(() => {
    const raw = (firestoreLeaders || []) as Leader[];
    
    const getTitleWeight = (title: string) => {
      const t = (title || '').toLowerCase();
      if (t.includes('founder') || (t.includes('chairman') && !t.includes('vice')) || (t.includes('president') && !t.includes('vice'))) return 1;
      if (t.includes('vice chairman') || t.includes('vice president')) return 2;
      if (t.includes('general secretary') && !t.includes('assistant')) return 3;
      if (t.includes('assistant general secretary')) return 4;
      if (t.includes('treasurer') && !t.includes('assistant')) return 5;
      if (t.includes('assistant treasurer')) return 6;
      if (t.includes('legal advisor')) return 7;
      return 10;
    };

    return [...raw].sort((a, b) => {
      const weightA = getTitleWeight(a.title);
      const weightB = getTitleWeight(b.title);
      if (weightA !== weightB) return weightA - weightB;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [firestoreLeaders]);

  const filteredMembers = React.useMemo(() => {
    if (!membersList || !memberSearch.trim()) return [];
    return (membersList as any[]).filter(m => 
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.memberId?.toLowerCase().includes(memberSearch.toLowerCase())
    ).slice(0, 5);
  }, [membersList, memberSearch]);
  
  const allStates = Object.keys(INDIA_DATA).sort()

  const [activeState, setActiveState] = useState<string | null>("West Bengal")
  const [activeDistrict, setActiveDistrict] = useState<string | null>("Howrah")
  const [editLeader, setEditLeader] = useState<any>(null)
  const [newLeader, setNewLeader] = useState({
    name: '',
    title: '',
    gender: 'male' as const,
    level: 'Central' as 'Central' | 'State' | 'District',
    parentRegion: '',
    districtName: '',
    imageId: ''
  })

  const centralTeam = leaders.filter(l => l.level === 'Central')
  const activeStateLeaders = leaders.filter(l => l.level === 'State' && l.parentRegion === activeState)
  const activeDistrictLeaders = leaders.filter(l => l.level === 'District' && l.parentRegion === activeState && l.districtName === activeDistrict)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUri = reader.result as string
        if (isEdit) setEditLeader({ ...editLeader, imageId: dataUri })
        else setNewLeader({ ...newLeader, imageId: dataUri })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFetchFromMember = (member: any) => {
    setNewLeader({
      name: member.name || '',
      title: member.designation || '',
      gender: (member.gender?.toLowerCase() === 'female' ? 'female' : 'male'),
      level: member.level || 'Central',
      parentRegion: member.stateName || '',
      districtName: member.districtName || '',
      imageId: member.imageId || ''
    });
    setMemberSearch("");
    toast({ title: "Profile Synced", description: `${member.name}'s data has been buffered.` });
  }

  const handleAdd = async () => {
    const missingFields: string[] = [];
    if (!newLeader.name.trim()) missingFields.push("Official Name");
    if (!newLeader.title.trim()) missingFields.push("Official Designation");
    if (newLeader.level === 'State' || newLeader.level === 'District') {
      if (!newLeader.parentRegion) missingFields.push("State / UT");
    }
    if (newLeader.level === 'District') {
      if (!newLeader.districtName) missingFields.push("District");
    }

    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Mandatory Fields Required",
        description: `The following credentials must be established: ${missingFields.join(", ")}.`,
      });
      return;
    }

    setIsActionLoading(true)
    
    let finalImage = newLeader.imageId;
    if (!finalImage) {
      finalImage = newLeader.gender === 'female' ? '/dummy w.png' : '/dummy m.png';
    }

    try {
      await addDoc(collection(db, 'leadership'), { 
        ...newLeader, 
        imageId: finalImage,
        createdAt: serverTimestamp() 
      })
      toast({ title: "Leader Commissioned" })
      setNewLeader({ name: '', title: '', gender: 'male', level: 'Central', parentRegion: '', districtName: '', imageId: '' })
      setIsAddDialogOpen(false)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'leadership', id))
      toast({ title: "Leader Removed" })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    }
  }

  const handleUpdate = async () => {
    if (!editLeader) return
    setIsActionLoading(true)
    
    let finalImage = editLeader.imageId;
    if (!finalImage) {
      finalImage = editLeader.gender === 'female' ? '/dummy w.png' : '/dummy m.png';
    }

    try {
      const { id, ...data } = editLeader
      await updateDoc(doc(db, 'leadership', id), { ...data, imageId: finalImage })
      toast({ title: "Leader Profile Updated" })
      setEditLeader(null)
      setIsEditDialogOpen(false)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleStartEdit = (leader: Leader) => {
    setEditLeader(leader);
    setEditStep('confirm');
    setIsEditDialogOpen(true);
  }

  const SectionHeading = ({ title, icon: Icon, color, subtitle }: { title: string, icon: any, color: string, subtitle?: string }) => (
    <div className="flex items-center gap-5 mb-10 pb-5 border-b border-slate-100 dark:border-slate-800">
      <div className={cn("p-4 rounded-[1.5rem] bg-white dark:bg-slate-900 shadow-sm border", color)}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h2 className={cn(
          "font-headline font-bold leading-tight",
          title === "Central Committee" ? "text-5xl md:text-7xl bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent animate-gradient-x py-2" : "text-3xl md:text-5xl text-primary dark:text-white"
        )}>{title}</h2>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mt-1">{subtitle || "Authorized Governance Tier"}</p>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-32 md:pt-40 pb-16 md:pb-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-xs md:text-sm font-bold border border-accent/30 mb-6">
            <span>Organizational Hierarchy</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-headline font-bold mb-6">Our <span className="text-accent italic">Leadership</span> Tree</h1>
          
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-10 flex gap-2 hover:bg-secondary hover:text-white shadow-xl shadow-accent/20 mx-auto transform hover:scale-105 transition-all">
                  <Plus className="w-6 h-6" /> Commission Leadership Member
                </Button>
              </DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col p-0">
                <div className="bg-slate-900 pt-14 pb-10 px-8 text-white relative border-b-4 border-accent/20 shrink-0">
                   <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10 h-10 w-10"><X className="w-6 h-6" /></Button></DialogClose></div>
                   <DialogTitle className="text-2xl font-headline font-bold">Commission Official</DialogTitle>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Establishing Leadership Identity</p>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-4">
                     <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-accent" />
                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Fetch from Member Registry</h4>
                     </div>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          placeholder="Search members by name or ID to auto-fill..." 
                          className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 shadow-inner border-none"
                          value={memberSearch}
                          onChange={e => setMemberSearch(e.target.value)}
                        />
                     </div>
                     {filteredMembers.length > 0 && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                           {filteredMembers.map((m: any) => (
                              <button 
                                key={m.id}
                                onClick={() => handleFetchFromMember(m)}
                                className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-accent transition-all group"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden relative">
                                       {m.imageId ? <Image src={m.imageId} alt="m" fill className="object-cover" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <div className="text-left">
                                       <p className="text-xs font-bold text-primary dark:text-white leading-none">{m.name}</p>
                                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1">{m.memberId}</p>
                                    </div>
                                 </div>
                                 <RefreshCw className="w-3.5 h-3.5 text-slate-200 group-hover:text-accent group-hover:rotate-180 transition-all duration-500" />
                              </button>
                           ))}
                        </div>
                     )}
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-32 h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                        <Image src={newLeader.imageId?.startsWith('data:') ? newLeader.imageId : (newLeader.gender.toLowerCase() === 'female' ? '/dummy w.png' : '/dummy m.png')} alt="Preview" fill className="object-cover" />
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileChange(e, false)} />
                      </div>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Click Image area to upload</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Official Name *</Label>
                        <Input value={newLeader.name} onChange={e => setNewLeader({...newLeader, name: e.target.value})} placeholder="Full Legal Identity" className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Official Designation *</Label>
                        <Input value={newLeader.title} onChange={e => setNewLeader({...newLeader, title: e.target.value})} placeholder="e.g. State Chairman" className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Chapter Level *</Label>
                        <Select value={newLeader.level} onValueChange={(val: any) => setNewLeader({...newLeader, level: val, parentRegion: '', districtName: ''})}>
                          <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold"><SelectValue placeholder="Level" /></SelectTrigger>
                          <SelectContent className="bg-white z-[1000000]">
                            <SelectItem value="Central">Central Council</SelectItem>
                            <SelectItem value="State">State Level</SelectItem>
                            <SelectItem value="District">District Level</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Gender *</Label>
                        <Select value={newLeader.gender} onValueChange={(val: any) => setNewLeader({...newLeader, gender: val})}>
                          <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold"><SelectValue placeholder="Gender" /></SelectTrigger>
                          <SelectContent className="bg-white z-[1000000]"><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>

                    {(newLeader.level === 'State' || newLeader.level === 'District') && (
                      <div className="grid md:grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> State / UT *</Label>
                          <Select value={newLeader.parentRegion} onValueChange={(val) => setNewLeader({...newLeader, parentRegion: val, districtName: ''})}>
                            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-800 border-accent/20 font-bold"><SelectValue placeholder="Choose State" /></SelectTrigger>
                            <SelectContent className="bg-white z-[1000000] max-h-60">{allStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        {newLeader.level === 'District' && (
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> District *</Label>
                            <Select value={newLeader.districtName} onValueChange={(val) => setNewLeader({...newLeader, districtName: val})}>
                              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-800 border-accent/20 font-bold"><SelectValue placeholder="Choose District" /></SelectTrigger>
                              <SelectContent className="bg-white z-[1000000] max-h-60">{newLeader.parentRegion && (INDIA_DATA[newLeader.parentRegion] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pb-16 pt-10 px-8 bg-slate-50 dark:bg-slate-900 border-t shrink-0">
                  <Button onClick={handleAdd} disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl hover:bg-secondary transition-all text-base md:text-lg">Commission to Leadership</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" /></div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-32">
                <SectionHeading title="Central Committee" icon={ShieldCheck} color="text-red-600 border-red-100" subtitle={`${centralTeam.length} Officials`} />
                <div className="flex flex-wrap justify-center gap-12">
                  {centralTeam.map((leader) => {
                    const titleLower = (leader.title || '').toLowerCase();
                    const isChairman = titleLower.includes("chairman") && !titleLower.includes("vice");
                    const isPresident = titleLower.includes("president") && !titleLower.includes("vice");
                    const isFounder = titleLower.includes("founder");
                    const isTopTier = isChairman || isPresident || isFounder;
                    
                    return (
                      <LeaderCard 
                        key={leader.id} 
                        leader={leader} 
                        variant={isTopTier ? "xl" : "large"} 
                        isAdmin={isAdmin} 
                        onEdit={handleStartEdit} 
                        onDelete={handleDelete} 
                      />
                    )
                  })}
                </div>
              </div>

              <div className="space-y-32">
                <div className="flex flex-col items-center gap-8 mb-12">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-primary dark:text-white font-bold uppercase tracking-[0.2em]">
                      <Shield className="w-6 h-6 text-emerald-500" />
                      <span>Regional Chapters</span>
                    </div>
                    <Select value={activeState || ''} onValueChange={(val) => { 
                      setActiveState(val); 
                      if (val === 'West Bengal') {
                        setActiveDistrict('Howrah')
                      } else {
                        const stateDistricts = INDIA_DATA[val] || []
                        setActiveDistrict(stateDistricts.length > 0 ? stateDistricts[0] : null)
                      }
                    }}>
                      <SelectTrigger className="w-[180px] md:w-[220px] h-10 rounded-full bg-white dark:bg-slate-900 border-emerald-100 shadow-sm font-bold text-xs">
                        <SelectValue placeholder="Select State/UT" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80 bg-white">
                        {allStates.map(r => <SelectItem key={r} value={r} className="font-bold text-xs">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-24 min-h-[400px]">
                  {activeState && (
                    <div className="bg-white dark:bg-slate-900 p-8 md:p-16 rounded-[4rem] shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-500">
                      <div className="flex flex-col items-center mb-16">
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-8 py-2 rounded-full font-bold text-lg mb-12 shadow-sm border border-emerald-100 dark:border-800 uppercase tracking-widest">
                          {activeState} Chapter
                        </div>
                        
                        {activeStateLeaders.length > 0 ? (
                          <div className="flex flex-wrap justify-center gap-10">
                            {activeStateLeaders.map(leader => {
                              const titleLower = (leader.title || '').toLowerCase();
                              const isChairman = titleLower.includes("chairman") && !titleLower.includes("vice");
                              const isPresident = titleLower.includes("president") && !titleLower.includes("vice");
                              const isTopTier = isChairman || isPresident;
                              
                              return (
                                <LeaderCard 
                                  key={leader.id} 
                                  leader={leader} 
                                  variant={isTopTier ? "large" : "default"}
                                  isAdmin={isAdmin} 
                                  onEdit={handleStartEdit} 
                                  onDelete={handleDelete} 
                                />
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">No commissioned chapter leaders recorded for this region.</p>
                        )}
                      </div>

                      <div className="space-y-12 mt-20 pt-20 border-t border-slate-100 dark:border-slate-800">
                         <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-4">
                              <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                                 <Users className="w-4 h-4" />
                                 District Level Committee
                              </div>
                              <Select value={activeDistrict || ''} onValueChange={setActiveDistrict}>
                                <SelectTrigger className="w-[180px] h-8 rounded-full bg-slate-50 dark:bg-slate-950 border-indigo-100 text-[10px] font-bold shadow-inner">
                                  <SelectValue placeholder="Select District" />
                                </SelectTrigger>
                                <SelectContent className="max-h-80 bg-white">
                                  {activeState && (INDIA_DATA[activeState] || []).map(d => <SelectItem key={d} value={d} className="text-[10px] font-bold">{d}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                         </div>

                         {activeDistrict ? (
                           <div className="bg-slate-50 dark:bg-slate-950/50 p-8 md:p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center transition-all hover:shadow-2xl hover:bg-white dark:hover:bg-slate-900 group/district animate-in slide-in-from-bottom-4 duration-500">
                              <div className="flex items-center gap-2 mb-10 text-primary dark:text-accent font-bold uppercase text-[11px] tracking-[0.2em] bg-white dark:bg-slate-900 px-6 py-2 rounded-full shadow-md border border-slate-100 dark:border-slate-800 group-hover/district:scale-110 transition-transform">
                                 <MapPin className="w-3.5 h-3.5 text-accent" />
                                 {activeDistrict} Cell
                              </div>
                              {activeDistrictLeaders.length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-8">
                                   {activeDistrictLeaders.map(dl => {
                                     const titleLower = (dl.title || '').toLowerCase();
                                     const isChairman = titleLower.includes("chairman") && !titleLower.includes("vice");
                                     const isPresident = titleLower.includes("president") && !titleLower.includes("vice");
                                     const isTopTier = isChairman || isPresident;
                                     
                                     return (
                                       <LeaderCard 
                                         key={dl.id} 
                                         leader={dl} 
                                         variant={isTopTier ? "default" : "small"} 
                                         isAdmin={isAdmin} 
                                         onEdit={handleStartEdit} 
                                         onDelete={handleDelete} 
                                       />
                                     )
                                   })}
                                </div>
                              ) : (
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] animate-pulse">No commissioned district officials recorded for {activeDistrict}.</p>
                              )}
                           </div>
                         ) : (
                           <div className="text-center py-10 opacity-50">
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Select a district to view committee officials.</p>
                           </div>
                         )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={(val) => { if(!val) { setIsEditDialogOpen(false); setEditLeader(null); } }}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col p-0 z-[1000001]">
          {editStep === 'confirm' ? (
            <div className="p-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
               <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-500/10">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <DialogTitle className="text-3xl font-headline font-bold text-primary dark:text-white uppercase">Refine Leader Profile</DialogTitle>
                    <DialogDescription className="text-base font-bold text-accent uppercase tracking-widest">
                      Registry Update Protocol
                    </DialogDescription>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto pt-4">
                      Do you wish to authorize access to the high-fidelity profile editor for this leadership record?
                    </p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1 h-14 rounded-2xl font-bold border-2 text-xs uppercase tracking-widest">No</Button>
                  <Button onClick={() => setEditStep('form')} className="flex-1 h-14 rounded-2xl font-bold bg-primary text-white shadow-xl text-xs uppercase tracking-widest border-none">Yes</Button>
               </div>
            </div>
          ) : (
            <>
              <div className="bg-slate-900 pt-14 pb-10 px-8 text-white relative border-b-4 border-accent/20 shrink-0">
                 <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10 h-10 w-10 transition-all"><X className="w-6 h-6" /></Button></DialogClose></div>
                 <DialogTitle className="text-2xl font-headline font-bold">Refine Leader Profile</DialogTitle>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Registry Update Protocol</p>
              </div>
              
              {editLeader && (
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border-4 border-white shadow-xl">
                      <Image src={editLeader.imageId?.startsWith('data:') ? editLeader.imageId : (PlaceHolderImages.find(i => i.id === editLeader.imageId)?.imageUrl || (editLeader.gender?.trim().toLowerCase() === 'female' || editLeader.gender?.trim().toLowerCase() === 'f' ? '/dummy w.png' : '/dummy m.png'))} alt="Preview" fill className="object-cover" />
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileChange(e, true)} />
                    </div>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Click Image area to update</Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Legal Name</Label>
                      <Input value={editLeader.name} onChange={e => setEditLeader({...editLeader, name: e.target.value})} className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Official Designation</Label>
                      <Input value={editLeader.title} onChange={e => setEditLeader({...editLeader, title: e.target.value})} className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Chapter Level</Label>
                      <Select value={editLeader.level} onValueChange={(val: any) => setEditLeader({...editLeader, level: val, parentRegion: '', districtName: ''})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold"><SelectValue placeholder="Level" /></SelectTrigger>
                        <SelectContent className="bg-white z-[2000000]">
                          <SelectItem value="Central">Central Council</SelectItem>
                          <SelectItem value="State">State Level</SelectItem>
                          <SelectItem value="District">District Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Gender</Label>
                      <Select value={editLeader.gender} onValueChange={(val: any) => setEditLeader({...editLeader, gender: val})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold"><SelectValue placeholder="Gender" /></SelectTrigger>
                        <SelectContent className="bg-white z-[2000000]"><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(editLeader.level === 'State' || editLeader.level === 'District') && (
                    <div className="grid md:grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> State / UT *</Label>
                        <Select value={editLeader.parentRegion} onValueChange={(val) => setEditLeader({...editLeader, parentRegion: val, districtName: ''})}>
                          <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-800 border-accent/20 font-bold"><SelectValue placeholder="Choose State" /></SelectTrigger>
                          <SelectContent className="bg-white z-[2000000] max-h-60">{allStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      {editLeader.level === 'District' && (
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> District *</Label>
                          <Select value={editLeader.districtName} onValueChange={(val) => setEditLeader({...editLeader, districtName: val})}>
                            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-800 border-accent/20 font-bold"><SelectValue placeholder="Choose District" /></SelectTrigger>
                            <SelectContent className="bg-white z-[2000000] max-h-60">{editLeader.parentRegion && (INDIA_DATA[editLeader.parentRegion] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button type="button" onClick={handleUpdate} disabled={isActionLoading} className="w-full h-16 rounded-2xl bg-primary text-white font-bold shadow-xl hover:bg-secondary transition-all text-base md:text-lg">
                    {isActionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Profile Changes"}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
