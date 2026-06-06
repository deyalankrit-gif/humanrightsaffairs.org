
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
  Home
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
  joiningDate?: string
  expiryDate?: string
  membershipDuration?: string
  bloodGroup?: string
  address?: string
  postOffice?: string
  policeStation?: string
  pinCode?: string
}

export default function MembersPage() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("All")
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isMirror, setIsMirror] = useState(false)
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
    imageId: '',
    joiningDate: '',
    expiryDate: '',
    membershipDuration: '1 Year',
    bloodGroup: '',
    address: '',
    postOffice: '',
    policeStation: '',
    pinCode: ''
  })

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setIsMirror(window.self !== window.top)
    }
  }, [])

  // Auto-calculate expiry date based on issue date and duration
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

  const membersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
  }, [db]);

  const { data: firestoreMembers, loading: membersLoading } = useCollection(membersQuery);

  const isAdmin = !!user && isMirror

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

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.memberId || !newMember.joiningDate) {
      toast({ 
        variant: "destructive", 
        title: "Validation Error", 
        description: "Name, Email, Member ID, and Membership Issue Date are required." 
      })
      return
    }

    setIsAdding(true)
    try {
      await addDoc(collection(db, 'memberProfiles'), {
        ...newMember,
        createdAt: serverTimestamp(),
      })
      toast({ title: "Success", description: "New member record established." })
      setIsAdding(false)
      setNewMember({ 
        name: '', 
        designation: '', 
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
        membershipDuration: '1 Year',
        bloodGroup: '',
        address: '',
        postOffice: '',
        policeStation: '',
        pinCode: ''
      })
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
    
    if (selectedState) {
      matchesLevel = m.stateName === selectedState;
      if (selectedDistrict) {
        matchesLevel = matchesLevel && m.districtName === selectedDistrict;
      }
    }
    
    return matchesSearch && matchesLevel;
  })

  const parseMemberDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      return parse(dateStr, "PPP", new Date());
    } catch {
      return undefined;
    }
  }

  if (!mounted) return null

  const states = Object.keys(INDIA_DATA).sort();
  const districts = selectedState ? INDIA_DATA[selectedState] : [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-28 md:pt-40 pb-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-bold border border-accent/30 mb-6">
            <Users className="w-4 h-4" />
            <span>Official Member Records</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 text-primary-foreground">Verified <span className="text-accent italic">Active Members</span></h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto text-lg mb-8 text-primary-foreground">
            A dynamic ledger of our dedicated human rights defenders, updated in real-time by the central administration.
          </p>

          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-10 flex gap-2 hover:bg-accent/90 shadow-2xl shadow-accent/20 mx-auto transform hover:scale-105 transition-all">
                  <Plus className="w-6 h-6" /> Live Editor: Commission New Membership
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">New Member Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Photo & Basic Info */}
                  <div className="grid md:grid-cols-3 gap-6 items-start">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-dashed border-slate-300">
                        {newMember.imageId ? (
                          <Image src={newMember.imageId} alt="Preview" fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full"><User className="w-10 h-10 text-slate-300" /></div>
                        )}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                      </div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Profile Photo</Label>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input placeholder="Member Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Gender</Label>
                          <Select value={newMember.gender} onValueChange={(val: any) => setNewMember({...newMember, gender: val})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Blood Group</Label>
                          <Select value={newMember.bloodGroup} onValueChange={val => setNewMember({...newMember, bloodGroup: val})}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ID & Term Block */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Member ID *</Label>
                        <Input placeholder="M-XXXX" value={newMember.memberId} onChange={e => setNewMember({...newMember, memberId: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Designation</Label>
                        <Input placeholder="e.g. Secretary" value={newMember.designation} onChange={e => setNewMember({...newMember, designation: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Select value={newMember.membershipDuration} onValueChange={val => setNewMember({...newMember, membershipDuration: val})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1 Year">1 Year</SelectItem>
                            <SelectItem value="2 Years">2 Years</SelectItem>
                            <SelectItem value="3 Years">3 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Issue Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 rounded-xl", !newMember.joiningDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newMember.joiningDate ? newMember.joiningDate : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={parseMemberDate(newMember.joiningDate)} onSelect={(date) => setNewMember({...newMember, joiningDate: date ? format(date, "PPP") : ''})} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input disabled value={newMember.expiryDate} className="bg-slate-100/50 dark:bg-slate-900/50" />
                      </div>
                    </div>
                  </div>

                  {/* Contact & Location Block */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2"><Label>Email</Label><Input type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} /></div>
                       <div className="space-y-2"><Label>Phone</Label><Input value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} /></div>
                    </div>

                    <div className="space-y-2">
                      <Label>Full Address</Label>
                      <Input placeholder="House No, Village, Lane" value={newMember.address} onChange={e => setNewMember({...newMember, address: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2"><Label>Post Office</Label><Input value={newMember.postOffice} onChange={e => setNewMember({...newMember, postOffice: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Police Station</Label><Input value={newMember.policeStation} onChange={e => setNewMember({...newMember, policeStation: e.target.value})} /></div>
                      <div className="space-y-2"><Label>PIN Code</Label><Input value={newMember.pinCode} onChange={e => setNewMember({...newMember, pinCode: e.target.value})} /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Operational Level</Label>
                        <Select value={newMember.level} onValueChange={(val: any) => setNewMember({...newMember, level: val, stateName: '', districtName: ''})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="National">National</SelectItem><SelectItem value="State">State</SelectItem><SelectItem value="District">District</SelectItem></SelectContent>
                        </Select>
                      </div>
                      {(newMember.level === 'State' || newMember.level === 'District') && (
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Select value={newMember.stateName} onValueChange={val => setNewMember({...newMember, stateName: val, districtName: ''})}>
                            <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                            <SelectContent className="max-h-60">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {newMember.level === 'District' && newMember.stateName && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Label>District</Label>
                        <Select value={newMember.districtName} onValueChange={val => setNewMember({...newMember, districtName: val})}>
                          <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
                          <SelectContent className="max-h-60">{(INDIA_DATA[newMember.stateName] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMember} disabled={isAdding} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold">
                    {isAdding ? <Loader2 className="animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Confirm Commissioning
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[48px] md:top-[56px] z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap justify-center gap-1.5">
                {["All", "National", "State", "District"].map((level) => (
                  <Button 
                    key={level} 
                    variant={levelFilter === level && !selectedState ? "default" : "outline"} 
                    onClick={() => handleLevelClick(level)} 
                    className={cn(
                      "rounded-full px-4 h-8 text-[10px] font-bold transition-all border-slate-200 dark:border-slate-700",
                      levelFilter === level && !selectedState
                        ? "bg-accent text-slate-900 shadow-sm border-accent" 
                        : "text-primary dark:text-slate-300 hover:bg-accent hover:text-slate-900 hover:border-accent"
                    )}
                  >
                    {level === 'All' ? 'All Levels' : `${level} Level`}
                  </Button>
                ))}
              </div>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden lg:block"></div>

              <div className="flex flex-wrap gap-1.5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={selectedState ? "default" : "outline"} className={cn(
                      "rounded-full px-4 h-8 text-[10px] font-bold flex items-center gap-2 transition-all",
                      selectedState ? "bg-accent text-slate-900" : "text-primary dark:text-white border-slate-200 dark:border-slate-700 hover:border-accent hover:text-accent"
                    )}>
                      {selectedState || "Filter by State"} <ChevronDown className="w-3 h-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-80 overflow-y-auto w-56">
                    {states.map((state) => (
                      <DropdownMenuItem key={state} onClick={() => handleStateSelect(state)} className="font-bold">{state}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {selectedState && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={selectedDistrict ? "default" : "outline"} className={cn(
                        "rounded-full px-4 h-8 text-[10px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all",
                        selectedDistrict ? "bg-accent text-slate-900" : "text-primary dark:text-white border-slate-200 dark:border-slate-700 hover:border-accent hover:text-accent"
                      )}>
                        {selectedDistrict || "Select District"} <ChevronDown className="w-3 h-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-80 overflow-y-auto w-56">
                      {districts.map((district) => (
                        <DropdownMenuItem key={district} onClick={() => handleDistrictSelect(district)} className="font-bold">{district}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search records..." 
                className="pl-9 h-8 rounded-full border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-[10px]" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {membersLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Live Directory...</p></div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const fallback = member.gender === 'female' ? '/dummy w.png' : '/dummy m.png'
                  const displayImg = member.imageId?.startsWith('data:') ? member.imageId : (PlaceHolderImages.find(i => i.id === member.imageId)?.imageUrl || fallback)
                  return (
                    <Card 
                      key={member.id} 
                      className="group border-none shadow-sm hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-visible bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative hover:scale-125 hover:z-50 cursor-pointer"
                    >
                      <CardHeader className="p-0">
                        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-t-2xl">
                          <Image src={displayImg} alt={member.name} fill className="object-cover transition-transform duration-500" />
                          <div className="absolute top-1 right-1">
                            <Badge className="bg-primary/80 backdrop-blur-md text-white font-bold border-none text-[6px] px-1 py-0 leading-none h-auto">
                              {member.level}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-2 space-y-1">
                        <div className="flex items-start gap-1">
                           <BadgeCheck className="w-2.5 h-2.5 text-accent shrink-0 mt-0.5" />
                           <div className="min-w-0">
                             <h3 className="font-headline font-bold text-[10px] text-primary dark:text-white leading-tight truncate">{member.name}</h3>
                             <p className="text-[8px] font-bold text-accent uppercase tracking-widest truncate">{member.designation}</p>
                           </div>
                        </div>
                        <div className="space-y-0.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                            <MapPin className="w-2 h-2 text-slate-400 shrink-0" />
                            <span className="truncate">{member.districtName ? `${member.districtName}, ` : ''}{member.stateName || 'National'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                            <Briefcase className="w-2 h-2 text-slate-400 shrink-0" />
                            <span className="truncate">ID: {member.memberId || 'N/A'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <div className="col-span-full py-32 text-center">
                  <User className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                  <h3 className="text-xl font-headline font-bold text-primary dark:text-white">No records found</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2">Adjust your filters to broaden your search.</p>
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
