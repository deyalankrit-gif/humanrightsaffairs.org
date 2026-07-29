
"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Shield, Award, Plus, Edit, Trash2, Loader2, Upload, Globe, MapPin, ChevronRight, Users } from 'lucide-react'
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast'
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
  const genderKey = (leader.gender || '').trim().toLowerCase();
  let fallback = '/dummy m.png';
  if (genderKey === 'female' || genderKey === 'f' || genderKey === 'woman') fallback = '/dummy w.png';
  
  const isCustomPhoto = leader.imageId && (leader.imageId.startsWith('data:') || leader.imageId.startsWith('http'));
  const placeholder = PlaceHolderImages.find(i => i.id === leader.imageId)?.imageUrl;
  
  const img = isCustomPhoto ? leader.imageId : (placeholder || fallback)
  
  const sizeClasses = {
    xl: "w-64 h-80 md:w-80 md:h-[420px]", // Central Chairman
    large: "w-48 h-64 md:w-64 md:h-80",   // State Chairman / Senior Chapter
    default: "w-36 h-48 md:w-48 md:h-60",
    small: "w-24 h-32 md:w-32 md:h-40"
  }

  const isChairman = leader.title.includes("Chairman")

  return (
    <div className="flex flex-col items-center group relative">
      <div className={`relative ${sizeClasses[variant]} rounded-2xl overflow-hidden shadow-xl border-2 md:border-4 border-white group-hover:border-secondary transition-all duration-500 bg-slate-100 dark:bg-slate-800`}>
        <Image src={img!} alt={leader.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          {isAdmin && (
            <div className="flex gap-2">
              <Button onClick={() => onEdit?.(leader)} size="icon" className="bg-white dark:bg-slate-800 text-primary dark:text-white rounded-full hover:bg-secondary hover:text-white transition-colors border border-white/20 shadow-xl">
                <Edit className="w-4 h-4" />
              </Button>
              <Button onClick={() => onDelete?.(leader.id)} size="icon" className="bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors border border-white/20 shadow-xl">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 text-center px-2">
        <h4 className={`font-headline font-bold text-primary dark:text-white ${variant === 'xl' || variant === 'large' || isChairman ? 'text-lg md:text-xl lg:text-2xl' : 'text-sm md:text-base'}`}>{leader.name}</h4>
        <p className={`text-accent font-bold uppercase tracking-widest ${variant === 'xl' || variant === 'large' || leader.title.includes("Founder") ? 'text-[10px] md:text-xs' : 'text-[8px] md:text-[10px]'}`}>{leader.title}</p>
        {leader.level === 'District' && leader.districtName && <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{leader.districtName}</p>}
      </div>
    </div>
  )
}

export default function LeadershipPage() {
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isMirror, setIsMirror] = useState(false)
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  // Administrative actions in the mirror are strictly Root-only
  const isAdmin = user?.email === 'deydhritiman@gmail.com' && isMirror

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMirror(window.self !== window.top)
    }
  }, [])

  const leadersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'leadership'), orderBy('createdAt', 'asc'));
  }, [db]);

  const { data: firestoreLeaders, loading: dataLoading } = useCollection(leadersQuery);

  const [activeState, setActiveState] = useState<string | null>("West Bengal")
  const [activeDistrict, setActiveDistrict] = useState<string | null>("Howrah")
  const [editLeader, setEditLeader] = useState<any>(null)
  const [newLeader, setNewMember] = useState({
    name: '',
    title: '',
    gender: 'male' as const,
    level: 'Central' as 'Central' | 'State' | 'District',
    parentRegion: '',
    districtName: '',
    imageId: ''
  })

  const leaders = React.useMemo(() => {
    const base = (firestoreLeaders || []) as Leader[];
    
    // Inject institutional officials if not present in Firestore
    const staticOfficials: Leader[] = [
      {
        id: 'sec-wb',
        name: 'Aniket Chattopadhyay',
        title: 'Secretary (West Bengal State Committee)',
        gender: 'male',
        level: 'State',
        parentRegion: 'West Bengal'
      },
      {
        id: 'treasurer-central',
        name: 'Rahul Sharma',
        title: 'Treasurer (Central Council)',
        gender: 'male',
        level: 'Central'
      },
      {
        id: 'treasurer-wb',
        name: 'Priyanka Das',
        title: 'Treasurer (West Bengal State Committee)',
        gender: 'female',
        level: 'State',
        parentRegion: 'West Bengal'
      }
    ];

    const result = [...base];
    staticOfficials.forEach(official => {
      if (!result.some(l => l.id === official.id)) {
        result.push(official);
      }
    });
    
    return result;
  }, [firestoreLeaders]);
  
  const allStates = Object.keys(INDIA_DATA).sort()
  const districtsInState = activeState ? INDIA_DATA[activeState] : []

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
        else setNewMember({ ...newLeader, imageId: dataUri })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdd = async () => {
    if (!newLeader.name || !newLeader.title) return
    setIsActionLoading(true)
    try {
      await addDoc(collection(db, 'leadership'), { ...newLeader, createdAt: serverTimestamp() })
      toast({ title: "Leader Commissioned" })
      setNewMember({ name: '', title: '', gender: 'male', level: 'Central', parentRegion: '', districtName: '', imageId: '' })
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
    try {
      const { id, ...data } = editLeader
      await updateDoc(doc(db, 'leadership', id), data)
      toast({ title: "Leader Profile Updated" })
      setEditLeader(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

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
            <Dialog>
              <DialogTrigger asChild><Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-8 flex gap-2 hover:bg-secondary hover:text-white shadow-xl shadow-accent/20 mx-auto"><Plus className="w-5 h-5" /> Commission Leadership Member</Button></DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>New Leader Profile</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                    <div className="relative w-32 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border">
                      <Image src={newLeader.imageId?.startsWith('data:') ? newLeader.imageId : (newLeader.gender.toLowerCase() === 'female' ? '/dummy w.png' : '/dummy m.png')} alt="Preview" fill className="object-cover" />
                    </div>
                    <Button variant="outline" className="w-full relative h-12 rounded-xl">
                      <Upload className="w-4 h-4 mr-2" /> Upload Photo
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false)} />
                    </Button>
                  </div>
                  <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={newLeader.name} onChange={e => setNewMember({...newLeader, name: e.target.value})} placeholder="Full Name" />
                  <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={newLeader.title} onChange={e => setNewMember({...newLeader, title: e.target.value})} placeholder="Designation" />
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newLeader.level} onValueChange={(val: any) => setNewMember({...newLeader, level: val, parentRegion: '', districtName: ''})}>
                      <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Central">Central Council</SelectItem>
                        <SelectItem value="State">State Level</SelectItem>
                        <SelectItem value="District">District Level</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newLeader.gender} onValueChange={(val: any) => setNewMember({...newLeader, gender: val})}>
                      <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                  {(newLeader.level === 'State' || newLeader.level === 'District') && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="flex items-center gap-2 text-primary dark:text-white"><Globe className="w-3 h-3 text-accent" /> State / UT</Label>
                      <Select value={newLeader.parentRegion} onValueChange={(val) => setNewMember({...newLeader, parentRegion: val, districtName: ''})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose State" /></SelectTrigger>
                        <SelectContent className="max-h-60">{allStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                  {newLeader.level === 'District' && newLeader.parentRegion && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="flex items-center gap-2 text-primary dark:text-white"><MapPin className="w-3 h-3 text-accent" /> District</Label>
                      <Select value={newLeader.districtName} onValueChange={(val) => setNewMember({...newLeader, districtName: val})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose District" /></SelectTrigger>
                        <SelectContent className="max-h-60">{(INDIA_DATA[newLeader.parentRegion] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter><Button onClick={handleAdd} disabled={isActionLoading} className="w-full h-12 rounded-xl bg-accent text-primary font-bold hover:bg-secondary hover:text-white">Publish Profile</Button></DialogFooter>
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
              {/* Central Council Section */}
              <div className="flex flex-col items-center mb-32">
                <div className="flex items-center gap-3 text-primary dark:text-white font-black uppercase tracking-[0.25em] mb-12 text-center">
                  <Award className="w-8 h-8 text-accent md:w-10 md:h-10" />
                  <span className="text-xl md:text-3xl lg:text-4xl">Central Council</span>
                </div>
                <div className="flex flex-wrap justify-center gap-12">
                  {centralTeam.map((leader, i) => (
                    <LeaderCard 
                      key={leader.id} 
                      leader={leader} 
                      variant={i === 0 ? "xl" : "default"} 
                      isAdmin={isAdmin} 
                      onEdit={setEditLeader} 
                      onDelete={handleDelete} 
                    />
                  ))}
                </div>
              </div>

              {/* Regional & District Chapters Section */}
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
                      <SelectContent className="max-h-80">
                        {allStates.map(r => <SelectItem key={r} value={r} className="font-bold text-xs">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-24 min-h-[400px]">
                  {activeState && (
                    <div className="bg-white dark:bg-slate-900 p-8 md:p-16 rounded-[4rem] shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-500">
                      <div className="flex flex-col items-center mb-16">
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-8 py-2 rounded-full font-bold text-lg mb-12 shadow-sm border border-emerald-100 dark:border-emerald-800 uppercase tracking-widest">
                          {activeState} Chapter
                        </div>
                        
                        {activeStateLeaders.length > 0 ? (
                          <div className="flex flex-wrap justify-center gap-10">
                            {activeStateLeaders.map(leader => {
                              const isLarge = leader.name.includes("Moumita Saha") || 
                                              leader.name.includes("Indraneel Adak") || 
                                              leader.name.includes("Indranil Adak");
                              const variant = isLarge ? "large" : "default";
                              
                              return (
                                <LeaderCard 
                                  key={leader.id} 
                                  leader={leader} 
                                  variant={variant}
                                  isAdmin={isAdmin} 
                                  onEdit={setEditLeader} 
                                  onDelete={handleDelete} 
                                />
                              );
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
                                <SelectContent className="max-h-80">
                                  {districtsInState.map(d => <SelectItem key={d} value={d} className="text-[10px] font-bold">{d}</SelectItem>)}
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
                                     // Refined hierarchy for specific district officials
                                     const isPriority = dl.name.includes("Indraneel Adak") || dl.name.includes("Indranil Adak");
                                     const variant = isPriority ? "default" : "small";
                                     return (
                                       <LeaderCard 
                                         key={dl.id} 
                                         leader={dl} 
                                         variant={variant} 
                                         isAdmin={isAdmin} 
                                         onEdit={setEditLeader} 
                                         onDelete={handleDelete} 
                                       />
                                     );
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

      {/* Edit Dialog */}
      <Dialog open={!!editLeader} onOpenChange={(open) => !open && setEditLeader(null)}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Leader Profile</DialogTitle></DialogHeader>
          {editLeader && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                <div className="relative w-32 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border">
                  <Image src={editLeader.imageId?.startsWith('data:') ? editLeader.imageId : (editLeader.gender?.trim().toLowerCase() === 'female' || editLeader.gender?.trim().toLowerCase() === 'f' ? '/dummy w.png' : '/dummy m.png')} alt="Preview" fill className="object-cover" />
                </div>
                <Button variant="outline" className="w-full relative h-12 rounded-xl"><Upload className="w-4 h-4 mr-2" /> Change Photo<input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true)} /></Button>
              </div>
              <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={editLeader.name} onChange={e => setEditLeader({...editLeader, name: e.target.value})} placeholder="Name" />
              <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={editLeader.title} onChange={e => setEditLeader({...editLeader, title: e.target.value})} placeholder="Title" />
              <div className="grid grid-cols-2 gap-4">
                <Select value={editLeader.level} onValueChange={(val: any) => setEditLeader({...editLeader, level: val, parentRegion: '', districtName: ''})}>
                  <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Central">Central Council</SelectItem>
                    <SelectItem value="State">State Level</SelectItem>
                    <SelectItem value="District">District Level</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={editLeader.gender} onValueChange={(val: any) => setEditLeader({...editLeader, gender: val})}>
                  <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                </Select>
              </div>
              {(editLeader.level === 'State' || editLeader.level === 'District') && (
                <div className="space-y-2">
                  <Label className="text-primary dark:text-white">State / UT</Label>
                  <Select value={editLeader.parentRegion} onValueChange={(val) => setEditLeader({...editLeader, parentRegion: val, districtName: ''})}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose State" /></SelectTrigger>
                    <SelectContent className="max-h-60">{allStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {editLeader.level === 'District' && editLeader.parentRegion && (
                <div className="space-y-2">
                  <Label className="text-primary dark:text-white">District</Label>
                  <Select value={editLeader.districtName} onValueChange={(val) => setEditLeader({...editLeader, districtName: val})}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose District" /></SelectTrigger>
                    <SelectContent className="max-h-60">{(INDIA_DATA[editLeader.parentRegion] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-12 rounded-xl mt-4 bg-accent text-white hover:bg-secondary hover:text-white font-bold transition-all">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
