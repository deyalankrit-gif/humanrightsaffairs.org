"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
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
  Edit, 
  Trash2, 
  AlertTriangle,
  Upload,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, orderBy, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore'
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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { INDIA_DATA } from '@/lib/india-data'
import { cn } from '@/lib/utils'

type Member = {
  id: string
  memberId?: string
  name: string
  designation: string
  level: "National" | "State" | "District"
  stateName?: string
  districtName?: string
  imageId?: string
  gender?: 'male' | 'female'
  email?: string
  phone?: string
  status?: string
}

export default function MembersPage() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("All")
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [newMember, setNewMember] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    level: 'National' as const,
    status: 'Active',
    memberId: '',
    stateName: '',
    districtName: '',
    gender: 'male' as 'male' | 'female',
    imageId: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const membersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
  }, [db]);

  const { data: firestoreMembers, loading: membersLoading } = useCollection(membersQuery);

  const isAdmin = user?.email === 'deydhritiman@gmail.com'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewMember({ ...newMember, imageId: reader.result as string })
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

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'memberProfiles', id))
      toast({ title: "Record Deleted", description: "The personnel profile has been removed." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message })
    }
  }

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.memberId) {
      toast({ variant: "destructive", title: "Validation Error", description: "Name, Email, and Member ID are required." })
      return
    }

    setIsAdding(true)
    try {
      await addDoc(collection(db, 'memberProfiles'), {
        ...newMember,
        createdAt: serverTimestamp(),
      })
      toast({ title: "Success", description: "New personnel record established." })
      setIsAdding(false)
      setNewMember({ name: '', designation: '', email: '', phone: '', level: 'National', status: 'Active', memberId: '', stateName: '', districtName: '', gender: 'male', imageId: '' })
    } catch (error: any) {
      toast({ variant: "destructive", title: "System Error", description: error.message })
      setIsAdding(false)
    }
  }

  const members = (firestoreMembers || []) as Member[]

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.designation?.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId?.toLowerCase().includes(search.toLowerCase());
    
    let matchesLevel = levelFilter === "All" || m.level === levelFilter;
    if (levelFilter === "State" && selectedState) {
      matchesLevel = m.level === "State" && m.stateName === selectedState;
      if (selectedDistrict) {
        matchesLevel = matchesLevel && m.districtName === selectedDistrict;
      }
    }
    return matchesSearch && matchesLevel;
  })

  if (!mounted) return null

  const states = Object.keys(INDIA_DATA).sort();
  const districts = selectedState ? INDIA_DATA[selectedState] : [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <section className="pt-40 pb-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-bold border border-accent/30 mb-6">
            <Users className="w-4 h-4" />
            <span>Official Membership Records</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">Verified <span className="text-accent italic">Personnel</span></h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto text-lg mb-8">
            A dynamic ledger of our dedicated human rights defenders, updated in real-time by the central administration.
          </p>

          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-10 flex gap-2 hover:bg-accent/90 shadow-2xl shadow-accent/20 mx-auto transform hover:scale-105 transition-all">
                  <Plus className="w-6 h-6" /> Commission New Membership
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">New Personnel Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                      <div className="relative w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border">
                        <Image 
                          src={newMember.imageId?.startsWith('data:') ? newMember.imageId : (newMember.gender === 'female' ? '/dummy w.png' : '/dummy m.png')} 
                          alt="Preview" 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <Button variant="outline" className="w-full relative h-12 rounded-xl">
                        <Upload className="w-4 h-4 mr-2" /> Upload Photo
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="e.g. Sanchita Banerjee" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Member ID</Label>
                      <Input placeholder="e.g. M1024" value={newMember.memberId} onChange={(e) => setNewMember({...newMember, memberId: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Operational Level</Label>
                      <Select value={newMember.level} onValueChange={(val) => setNewMember({...newMember, level: val as any, stateName: '', districtName: ''})}>
                        <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="National">National</SelectItem>
                          <SelectItem value="State">State</SelectItem>
                          <SelectItem value="District">District</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(newMember.level === 'State' || newMember.level === 'District') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>State Chapter</Label>
                        <Select value={newMember.stateName} onValueChange={(val) => setNewMember({...newMember, stateName: val, districtName: ''})}>
                          <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>District</Label>
                        <Select value={newMember.districtName} onValueChange={(val) => setNewMember({...newMember, districtName: val})} disabled={!newMember.stateName}>
                          <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {(newMember.stateName ? INDIA_DATA[newMember.stateName] : []).map(d => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input placeholder="e.g. State Secretary" value={newMember.designation} onChange={(e) => setNewMember({...newMember, designation: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={newMember.gender} onValueChange={(val: any) => setNewMember({...newMember, gender: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={newMember.status} onValueChange={(val) => setNewMember({...newMember, status: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Official Email</Label>
                    <Input type="email" placeholder="name@hrat-india.org" value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input placeholder="+91 XXXXX XXXXX" value={newMember.phone} onChange={(e) => setNewMember({...newMember, phone: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMember} disabled={isAdding} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold">
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Confirm Commissioning
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[72px] md:top-[84px] z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap justify-center gap-2">
              {["All", "National", "State", "District"].map((level) => (
                <Button 
                  key={level} 
                  variant={levelFilter === level ? "default" : "outline"} 
                  onClick={() => handleLevelClick(level)} 
                  className={cn(
                    "rounded-full px-6 font-bold transition-all",
                    levelFilter === level 
                      ? "bg-accent text-primary dark:bg-accent dark:text-primary shadow-lg" 
                      : "text-primary dark:text-white border-slate-200 dark:border-white/20 hover:border-accent hover:text-accent"
                  )}
                >
                  {level === 'All' ? 'All Levels' : `${level} Level`}
                </Button>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={selectedState ? "default" : "outline"} className={cn(
                    "rounded-full px-6 font-bold flex items-center gap-2",
                    selectedState ? "bg-accent text-primary" : "text-primary dark:text-white dark:border-white/20"
                  )}>{selectedState || "Filter by State"} <ChevronDown className="w-4 h-4 opacity-50" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-80 overflow-y-auto w-56">
                  {states.map((state) => (
                    <DropdownMenuItem key={state} onClick={() => handleStateSelect(state)}>{state}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedState && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={selectedDistrict ? "default" : "outline"} className={cn(
                      "rounded-full px-6 font-bold flex items-center gap-2",
                      selectedDistrict ? "bg-accent text-primary" : "text-primary dark:text-white dark:border-white/20"
                    )}>{selectedDistrict || "Filter by District"} <ChevronDown className="w-4 h-4 opacity-50" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-80 overflow-y-auto w-56">
                    {districts.map((district) => (
                      <DropdownMenuItem key={district} onClick={() => handleDistrictSelect(district)}>{district}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input placeholder="Search by name, ID or role..." className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {membersLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Live Directory...</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const fallback = member.gender === 'female' ? '/dummy w.png' : '/dummy m.png'
                  const displayImg = member.imageId?.startsWith('data:') ? member.imageId : (PlaceHolderImages.find(i => i.id === member.imageId)?.imageUrl || fallback)
                  return (
                    <Card key={member.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative">
                      <CardHeader className="p-0">
                        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <Image src={displayImg} alt={member.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-4 right-4"><Badge className="bg-primary/80 backdrop-blur-md text-white font-bold border-none">{member.level}</Badge></div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start gap-2">
                           <BadgeCheck className="w-5 h-5 text-accent shrink-0 mt-1" />
                           <div>
                             <h3 className="font-headline font-bold text-xl text-primary dark:text-white leading-tight">{member.name}</h3>
                             <p className="text-xs font-bold text-accent uppercase tracking-widest mt-1">{member.designation}</p>
                           </div>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{member.districtName ? `${member.districtName}, ` : ''}{member.stateName || 'All India'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Briefcase className="w-3 h-3 text-slate-400" /><span>ID: {member.memberId || member.id.slice(-6).toUpperCase()}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <div className="col-span-full py-32 text-center">
                  <User className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                  <h3 className="text-2xl font-headline font-bold text-primary dark:text-white">No members found</h3>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
