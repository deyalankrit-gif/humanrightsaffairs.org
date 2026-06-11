"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
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
  Calendar as CalendarIcon
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, parse, addYears } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { INDIA_DATA } from '@/lib/india-data'
import { cn } from '@/lib/utils'

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
    name: '',
    designationCategory: 'General Member',
    designation: 'General Member',
    profession: '',
    gender: 'Male',
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
    membershipDuration: '1 Year'
  })

  const profilesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
  }, [db, user]);

  const { data: firestoreProfiles, loading: profilesLoading } = useCollection(profilesQuery);

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

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.memberId || !newMember.joiningDate) {
      toast({ variant: "destructive", title: "Validation Error", description: "Name, Email, Member ID, and Issue Date are required." })
      return
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

    setIsAdding(true)
    try {
      await addDoc(collection(db, 'memberProfiles'), { ...newMember, createdAt: serverTimestamp() })
      toast({ title: "Success", description: "Member record established." })
      setIsAdding(false)
      setIsAddingDialogOpen(false)
      setNewMember({
        name: '', designationCategory: 'General Member', designation: 'General Member', profession: '', gender: 'Male', bloodGroup: '',
        email: '', phone: '', address: '', postOffice: '', policeStation: '', pinCode: '',
        level: 'National', status: 'Active',
        memberId: '', stateName: '', districtName: '', joiningDate: '', expiryDate: '',
        membershipDuration: '1 Year'
      })
    } catch (error: any) {
      toast({ variant: "destructive", title: "System Error" })
      setIsAdding(false)
    }
  }

  const parseMemberDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      return parse(dateStr, "PPP", new Date());
    } catch {
      return undefined;
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (firestoreProfiles || []).filter((m: any) => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (m.memberId || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (levelFilter === 'All' || m.level === levelFilter);
  })

  const states = Object.keys(INDIA_DATA).sort()

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-12 pb-8 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[9px] font-bold border border-red-500/30 uppercase tracking-[0.2em]">
                <Lock className="w-2.5 h-2.5" /> Members Directory
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Secure <span className="text-accent italic">Members</span></h1>
              <p className="text-slate-400 text-[11px] max-w-xl">Internal dashboard for managing operational contact protocols.</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsAddingDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg">
                  <UserPlus className="w-4 h-4" /> Commission Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Personnel Commissioning</DialogTitle></DialogHeader>
                <div className="space-y-6 py-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Full Name *</Label>
                        <Input placeholder="Full Legal Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Member ID *</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="ABCDEF1234" 
                            value={newMember.memberId} 
                            onChange={e => setNewMember({...newMember, memberId: e.target.value.toUpperCase()})} 
                            className="h-11 rounded-xl font-mono"
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

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-accent">Designation Category</Label>
                        <Select value={newMember.designationCategory} onValueChange={(val: any) => {
                          const isGeneral = val === 'General Member';
                          setNewMember({
                            ...newMember, 
                            designationCategory: val, 
                            designation: isGeneral ? 'General Member' : ''
                          });
                        }}>
                          <SelectTrigger className="rounded-xl border-accent/20 bg-white dark:bg-slate-800"><SelectValue /></SelectTrigger>
                          <SelectContent position="popper" className="z-[1000001]"><SelectItem value="General Member">General Member</SelectItem><SelectItem value="Office-bearing Member">Office-bearing Member</SelectItem></SelectContent>
                        </Select>
                      </div>
                      {newMember.designationCategory === 'Office-bearing Member' && (
                        <div className="space-y-1 animate-in fade-in slide-in-from-left-2">
                          <Label className="text-[10px] uppercase font-bold text-accent">Manual Designation</Label>
                          <Input placeholder="e.g. Treasurer" value={newMember.designation} onChange={e => setNewMember({...newMember, designation: e.target.value})} className="rounded-xl border-accent/20" />
                        </div>
                      )}
                   </div>

                   <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Gender</Label>
                        <Select value={newMember.gender} onValueChange={(val: any) => setNewMember({...newMember, gender: val})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent position="popper" className="z-[1000001]"><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Blood Group</Label>
                        <Select value={newMember.bloodGroup} onValueChange={val => setNewMember({...newMember, bloodGroup: val})}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent position="popper" className="z-[1000001]">
                              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                            </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Profession</Label>
                        <Input value={newMember.profession} onChange={e => setNewMember({...newMember, profession: e.target.value})} />
                      </div>
                   </div>

                   <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-accent">Membership Duration</Label>
                        <Select value={newMember.membershipDuration} onValueChange={(val) => setNewMember({...newMember, membershipDuration: val})}>
                          <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-800 border-accent/20"><SelectValue /></SelectTrigger>
                          <SelectContent position="popper" className="z-[1000001]"><SelectItem value="1 Year">1 Year Term</SelectItem><SelectItem value="2 Years">2 Years Term</SelectItem><SelectItem value="3 Years">3 Years Term</SelectItem></SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Issue Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 rounded-lg bg-white dark:bg-slate-800", !newMember.joiningDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newMember.joiningDate ? newMember.joiningDate : "Pick induction date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-[1000002]" align="start">
                              <Calendar mode="single" selected={parseMemberDate(newMember.joiningDate)} onSelect={(date) => setNewMember({...newMember, joiningDate: date ? format(date, "PPP") : ''})} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Expiry Date</Label>
                          <Input disabled value={newMember.expiryDate} className="bg-slate-100/50 dark:bg-slate-900/50" />
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Operational Level</Label>
                        <Select value={newMember.level} onValueChange={(val: any) => setNewMember({...newMember, level: val, stateName: '', districtName: ''})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent position="popper" className="z-[1000001]"><SelectItem value="National">National</SelectItem><SelectItem value="State">State</SelectItem><SelectItem value="District">District</SelectItem></SelectContent>
                        </Select>
                      </div>
                      {(newMember.level === 'State' || newMember.level === 'District') && (
                        <div className="space-y-1">
                           <Label className="text-[10px] uppercase font-bold text-slate-400">State</Label>
                           <Select value={newMember.stateName} onValueChange={val => setNewMember({...newMember, stateName: val, districtName: ''})}>
                             <SelectTrigger><SelectValue placeholder="Choose State" /></SelectTrigger>
                             <SelectContent className="max-h-60 z-[1000001]">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                           </Select>
                        </div>
                      )}
                   </div>
                </div>
                <DialogFooter><Button onClick={handleAddMember} disabled={isAdding} className="w-full h-11 rounded-xl bg-accent text-primary font-bold">Establish Official Record</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-50 rounded-lg">
              {["All", "National", "State", "District"].map((lvl) => (
                <Button key={lvl} variant={levelFilter === lvl ? "default" : "ghost"} onClick={() => setLevelFilter(lvl)} className={cn("h-7 rounded-md px-4 text-[10px] font-bold uppercase", levelFilter === lvl ? "bg-accent text-primary" : "text-slate-500")}>{lvl}</Button>
              ))}
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input placeholder="Search database..." className="pl-8 h-9 rounded-lg text-xs border-slate-100" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {profilesLoading ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((member: any) => (
                <Card key={member.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-5 bg-slate-50 dark:bg-slate-800 md:w-44 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">ID</span>
                         <span className="text-xl font-headline font-bold text-primary tracking-tighter">{member.memberId || 'PENDING'}</span>
                      </div>
                      <div className="flex-1 p-5 grid lg:grid-cols-3 gap-6 items-center">
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-primary leading-tight">{member.name}</h3>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                             <span className="text-accent">{member.designation}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                             <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {member.stateName || 'National'}</span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Link href={`/internal/members/${member.id}`}><Button size="sm" className="h-8 rounded-lg text-[10px] px-3 font-bold">Profile</Button></Link>
                          <Link href={`/internal/members/${member.id}/id-card`}><Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] px-3 font-bold border-accent text-accent">ID Card</Button></Link>
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
      <Footer />
    </main>
  )
}
