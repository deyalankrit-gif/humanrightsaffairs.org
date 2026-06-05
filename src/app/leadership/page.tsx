
"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Shield, Award, Plus, Edit, Trash2, Loader2, Upload, Globe, MapPin, ChevronRight } from 'lucide-react'
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

function LeaderCard({ leader, variant = "default", isAdmin, onEdit, onDelete }: { leader: Leader, variant?: "large" | "default" | "small", isAdmin?: boolean, onEdit?: (l: Leader) => void, onDelete?: (id: string) => void }) {
  const fallback = leader.gender === 'female' ? '/dummy w.png' : '/dummy m.png'
  const img = leader.imageId?.startsWith('data:') ? leader.imageId : (PlaceHolderImages.find(i => i.id === leader.imageId)?.imageUrl || fallback)
  
  const sizeClasses = {
    large: "w-48 h-60 md:w-64 md:h-80",
    default: "w-36 h-48 md:w-48 md:h-60",
    small: "w-24 h-32 md:w-32 md:h-40"
  }

  const isChairman = leader.title.includes("Chairman")

  return (
    <div className="flex flex-col items-center group relative">
      <div className={`relative ${sizeClasses[variant]} rounded-2xl overflow-hidden shadow-xl border-2 md:border-4 border-white group-hover:border-accent transition-all duration-500 bg-slate-100 dark:bg-slate-800`}>
        <Image src={img} alt={leader.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          {isAdmin && (
            <div className="flex gap-2">
              <Button onClick={() => onEdit?.(leader)} size="icon" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full hover:bg-accent hover:text-primary transition-colors border border-white/20 shadow-xl">
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
        <h4 className={`font-headline font-bold text-primary dark:text-white ${variant === 'large' || isChairman ? 'text-lg md:text-xl lg:text-2xl' : 'text-sm md:text-base'}`}>{leader.name}</h4>
        <p className={`text-accent font-bold uppercase tracking-widest ${variant === 'large' || leader.title.includes("Founder") ? 'text-[10px] md:text-xs' : 'text-[8px] md:text-[10px]'}`}>{leader.title}</p>
        {leader.level === 'District' && leader.districtName && <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{leader.districtName}</p>}
      </div>
    </div>
  )
}

export default function LeadershipPage() {
  const [isActionLoading, setIsActionLoading] = useState(false)
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const isAdmin = user?.email === 'deydhritiman@gmail.com'

  const leadersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'leadership'), orderBy('createdAt', 'asc'));
  }, [db]);

  const { data: firestoreLeaders, loading: dataLoading } = useCollection(leadersQuery);

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

  const leaders = (firestoreLeaders || []) as Leader[]
  const centralTeam = leaders.filter(l => l.level === 'Central')
  
  const regionsWithLeadership = Array.from(new Set([
    ...leaders.filter(l => l.level === 'State').map(l => l.parentRegion),
    ...leaders.filter(l => l.level === 'District').map(l => l.parentRegion)
  ])).filter(Boolean) as string[]
  
  regionsWithLeadership.sort()

  const states = Object.keys(INDIA_DATA).sort()

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
              <DialogTrigger asChild><Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-8 flex gap-2 hover:bg-accent/90 shadow-xl shadow-accent/20 mx-auto"><Plus className="w-5 h-5" /> Commission Leadership Member</Button></DialogTrigger>
              <DialogContent className="bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>New Leader Profile</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                    <div className="relative w-32 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border">
                      <Image src={newLeader.imageId?.startsWith('data:') ? newLeader.imageId : (newLeader.gender === 'female' ? '/dummy w.png' : '/dummy m.png')} alt="Preview" fill className="object-cover" />
                    </div>
                    <Button variant="outline" className="w-full relative h-12 rounded-xl">
                      <Upload className="w-4 h-4 mr-2" /> Upload Photo
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false)} />
                    </Button>
                  </div>
                  <Input value={newLeader.name} onChange={e => setNewMember({...newLeader, name: e.target.value})} placeholder="Full Name" />
                  <Input value={newLeader.title} onChange={e => setNewMember({...newLeader, title: e.target.value})} placeholder="Designation" />
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newLeader.level} onValueChange={(val: any) => setNewMember({...newLeader, level: val, parentRegion: '', districtName: ''})}>
                      <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Central">Central</SelectItem>
                        <SelectItem value="State">State</SelectItem>
                        <SelectItem value="District">District</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newLeader.gender} onValueChange={(val: any) => setNewMember({...newLeader, gender: val})}>
                      <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                  {(newLeader.level === 'State' || newLeader.level === 'District') && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="flex items-center gap-2"><Globe className="w-3 h-3 text-accent" /> State / UT</Label>
                      <Select value={newLeader.parentRegion} onValueChange={(val) => setNewMember({...newLeader, parentRegion: val, districtName: ''})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose State" /></SelectTrigger>
                        <SelectContent className="max-h-60">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                  {newLeader.level === 'District' && newLeader.parentRegion && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="flex items-center gap-2"><MapPin className="w-3 h-3 text-accent" /> District</Label>
                      <Select value={newLeader.districtName} onValueChange={(val) => setNewMember({...newLeader, districtName: val})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose District" /></SelectTrigger>
                        <SelectContent className="max-h-60">{(INDIA_DATA[newLeader.parentRegion] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter><Button onClick={handleAdd} disabled={isActionLoading} className="w-full h-12 rounded-xl bg-accent text-primary font-bold">Publish Profile</Button></DialogFooter>
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
              {/* Central Governance Section */}
              <div className="flex flex-col items-center mb-32">
                <div className="flex items-center gap-2 text-primary dark:text-white font-bold uppercase tracking-[0.2em] mb-12">
                  <Award className="w-6 h-6 text-accent" />
                  <span>Central Governance</span>
                </div>
                <div className="flex flex-wrap justify-center gap-12">
                  {centralTeam.map((leader, i) => (
                    <LeaderCard 
                      key={leader.id} 
                      leader={leader} 
                      variant={i === 0 ? "large" : "default"} 
                      isAdmin={isAdmin} 
                      onEdit={setEditLeader} 
                      onDelete={handleDelete} 
                    />
                  ))}
                </div>
              </div>

              {/* Regional & District Chapters Section */}
              <div className="space-y-32">
                <div className="flex items-center justify-center gap-2 text-primary dark:text-white font-bold uppercase tracking-[0.2em] mb-12">
                  <Shield className="w-6 h-6 text-emerald-500" />
                  <span>Regional Chapters</span>
                </div>
                
                <div className="space-y-24">
                  {regionsWithLeadership.map((region) => {
                    const stateLeaders = leaders.filter(l => l.level === 'State' && l.parentRegion === region);
                    const districtLeaders = leaders.filter(l => l.level === 'District' && l.parentRegion === region);
                    const uniqueDistricts = Array.from(new Set(districtLeaders.map(l => l.districtName))).filter(Boolean) as string[];
                    uniqueDistricts.sort();

                    return (
                      <div key={region} className="bg-white dark:bg-slate-900 p-8 md:p-16 rounded-[4rem] shadow-sm border border-slate-100 dark:border-slate-800">
                        {/* State Title & State Leaders */}
                        <div className="flex flex-col items-center mb-16">
                          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-8 py-2 rounded-full font-bold text-lg mb-12 shadow-sm border border-emerald-100 dark:border-emerald-800">
                            {region} State Chapter
                          </div>
                          
                          <div className="flex flex-wrap justify-center gap-10">
                            {stateLeaders.map(leader => (
                              <LeaderCard 
                                key={leader.id} 
                                leader={leader} 
                                isAdmin={isAdmin} 
                                onEdit={setEditLeader} 
                                onDelete={handleDelete} 
                              />
                            ))}
                          </div>
                        </div>

                        {/* District Sub-Chapters */}
                        {uniqueDistricts.length > 0 && (
                          <div className="space-y-12 mt-16 pt-16 border-t border-slate-100 dark:border-slate-800">
                             <div className="text-center">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                                   District Level Committees <ChevronRight className="w-3 h-3 text-accent" />
                                </h5>
                             </div>
                             <div className="grid md:grid-cols-2 gap-12">
                                {uniqueDistricts.map(dist => (
                                  <div key={dist} className="bg-slate-50 dark:bg-slate-950/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center transition-all hover:shadow-lg hover:-translate-y-1">
                                     <div className="flex items-center gap-2 mb-8 text-primary dark:text-accent font-bold uppercase text-[10px] tracking-widest bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
                                        <MapPin className="w-3 h-3 text-accent" />
                                        {dist} District
                                     </div>
                                     <div className="flex flex-wrap justify-center gap-6">
                                        {districtLeaders.filter(dl => dl.districtName === dist).map(dl => (
                                          <LeaderCard 
                                            key={dl.id} 
                                            leader={dl} 
                                            variant="small" 
                                            isAdmin={isAdmin} 
                                            onEdit={setEditLeader} 
                                            onDelete={handleDelete} 
                                          />
                                        ))}
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={!!editLeader} onOpenChange={(open) => !open && setEditLeader(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Leader Profile</DialogTitle></DialogHeader>
          {editLeader && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                <div className="relative w-32 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border">
                  <Image src={editLeader.imageId?.startsWith('data:') ? editLeader.imageId : (editLeader.gender === 'female' ? '/dummy w.png' : '/dummy m.png')} alt="Preview" fill className="object-cover" />
                </div>
                <Button variant="outline" className="w-full relative h-12 rounded-xl"><Upload className="w-4 h-4 mr-2" /> Change Photo<input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true)} /></Button>
              </div>
              <Input value={editLeader.name} onChange={e => setEditLeader({...editLeader, name: e.target.value})} placeholder="Name" />
              <Input value={editLeader.title} onChange={e => setEditLeader({...editLeader, title: e.target.value})} placeholder="Title" />
              <div className="grid grid-cols-2 gap-4">
                <Select value={editLeader.level} onValueChange={(val: any) => setEditLeader({...editLeader, level: val, parentRegion: '', districtName: ''})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Central">Central</SelectItem><SelectItem value="State">State</SelectItem><SelectItem value="District">District</SelectItem></SelectContent>
                </Select>
                <Select value={editLeader.gender} onValueChange={(val: any) => setEditLeader({...editLeader, gender: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                </Select>
              </div>
              {(editLeader.level === 'State' || editLeader.level === 'District') && (
                <div className="space-y-2">
                  <Label>State / UT</Label>
                  <Select value={editLeader.parentRegion} onValueChange={(val) => setEditLeader({...editLeader, parentRegion: val, districtName: ''})}>
                    <SelectTrigger><SelectValue placeholder="Choose State" /></SelectTrigger>
                    <SelectContent className="max-h-60">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {editLeader.level === 'District' && editLeader.parentRegion && (
                <div className="space-y-2">
                  <Label>District</Label>
                  <Select value={editLeader.districtName} onValueChange={(val) => setEditLeader({...editLeader, districtName: val})}>
                    <SelectTrigger><SelectValue placeholder="Choose District" /></SelectTrigger>
                    <SelectContent className="max-h-60">{(INDIA_DATA[editLeader.parentRegion] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-12 rounded-xl mt-4">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
