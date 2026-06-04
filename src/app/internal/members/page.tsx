"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
import { AdminNavbar } from '@/components/admin-navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Lock, 
  ShieldCheck,
  Hash,
  Mail,
  Phone,
  ArrowRight,
  Loader2,
  UserPlus,
  Plus,
  MapPin,
  Globe
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
  
  const [newMember, setNewMember] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    level: 'National' as 'National' | 'State' | 'District',
    status: 'Active',
    memberId: '',
    stateName: '',
    districtName: ''
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

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.memberId) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name, Email, and Member ID are required."
      })
      return
    }

    if (newMember.level !== 'National' && !newMember.stateName) {
      toast({ variant: "destructive", title: "State Required", description: "Please select a state chapter." })
      return
    }

    setIsAdding(true)
    try {
      await addDoc(collection(db, 'memberProfiles'), {
        ...newMember,
        createdAt: serverTimestamp(),
        gender: 'male'
      })
      toast({ title: "Success", description: "New personnel record established." })
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
        districtName: ''
      })
    } catch (error: any) {
      toast({ variant: "destructive", title: "System Error", description: error.message })
      setIsAdding(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  const filtered = (firestoreProfiles || []).filter((m: any) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.id?.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId?.toLowerCase().includes(search.toLowerCase());
    
    const matchesLevel = levelFilter === 'All' || m.level === levelFilter;
    return matchesSearch && matchesLevel;
  })

  const states = Object.keys(INDIA_DATA).sort()
  const levels = ["All", "National", "State", "District"]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminNavbar />

      <section className="pt-32 pb-16 bg-slate-900 text-white relative">
        <div className="container mx-auto px-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-[10px] font-bold border border-red-500/30 uppercase tracking-[0.2em]">
                <Lock className="w-3 h-3" />
                <span>Personnel Directory</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Secure <span className="text-accent italic">Membership</span> Data</h1>
              <p className="text-slate-400 max-w-xl text-sm">
                Internal dashboard for verified HRAT personnel to access and manage operational contact protocols.
              </p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-8 flex gap-2 hover:bg-accent/90 shadow-xl shadow-accent/20">
                  <UserPlus className="w-5 h-5" /> Commission New Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">New Personnel Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      placeholder="e.g. Sanchita Banerjee" 
                      value={newMember.name} 
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Member ID</Label>
                      <Input 
                        placeholder="e.g. M1024" 
                        value={newMember.memberId} 
                        onChange={(e) => setNewMember({...newMember, memberId: e.target.value})}
                        className="bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Operational Level</Label>
                      <Select value={newMember.level} onValueChange={(val: any) => setNewMember({...newMember, level: val, stateName: '', districtName: ''})}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-800">
                          <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="National">National</SelectItem>
                          <SelectItem value="State">State</SelectItem>
                          <SelectItem value="District">District</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(newMember.level === 'State' || newMember.level === 'District') && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="flex items-center gap-2"><Globe className="w-3 h-3 text-accent" /> Select State / UT</Label>
                      <Select value={newMember.stateName} onValueChange={(val) => setNewMember({...newMember, stateName: val, districtName: ''})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800">
                          <SelectValue placeholder="Choose State" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newMember.level === 'District' && newMember.stateName && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="flex items-center gap-2"><MapPin className="w-3 h-3 text-accent" /> Select District</Label>
                      <Select value={newMember.districtName} onValueChange={(val) => setNewMember({...newMember, districtName: val})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800">
                          <SelectValue placeholder="Choose District" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {(INDIA_DATA[newMember.stateName] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input 
                      placeholder="e.g. State Secretary" 
                      value={newMember.designation} 
                      onChange={(e) => setNewMember({...newMember, designation: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Official Email</Label>
                    <Input 
                      type="email" 
                      placeholder="name@hrat-india.org" 
                      value={newMember.email} 
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input 
                      placeholder="+91 XXXXX XXXXX" 
                      value={newMember.phone} 
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMember} disabled={isAdding} className="w-full h-12 rounded-xl bg-primary text-white dark:bg-accent dark:text-primary font-bold">
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Confirm Commissioning
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-12 border-b bg-white dark:bg-slate-900 transition-colors sticky top-[72px] md:top-[84px] z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {levels.map((lvl) => (
                <Button
                  key={lvl}
                  variant={levelFilter === lvl ? "default" : "outline"}
                  onClick={() => setLevelFilter(lvl)}
                  className={cn(
                    "rounded-full px-6 font-bold transition-all",
                    levelFilter === lvl 
                      ? "bg-accent text-slate-900 shadow-lg border-accent" 
                      : "text-primary dark:text-white border-slate-200 dark:border-slate-700 hover:bg-accent hover:text-slate-900 hover:border-accent"
                  )}
                >
                  {lvl === 'All' ? 'All Levels' : `${lvl} Level`}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search Secure Database..." 
                className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-accent font-medium bg-slate-50 dark:bg-slate-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {profilesLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Querying Encrypted Records...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((member: any) => (
                <Card key={member.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-8 bg-slate-50 dark:bg-slate-800 md:w-56 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                         <Hash className="w-5 h-5 text-accent mb-2" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">RECORD ID</span>
                         <span className="text-2xl font-headline font-bold text-primary dark:text-white tracking-tighter">{member.memberId || member.id.slice(-6).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 p-8 grid lg:grid-cols-3 gap-8 items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-1">
                             <Badge variant="outline" className="border-accent text-accent text-[9px] font-bold uppercase px-2 py-0">
                                {member.level || 'Operational'}
                             </Badge>
                             <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                               <MapPin className="w-3 h-3" />
                               {member.districtName ? `${member.districtName}, ` : ''}{member.stateName || 'National'}
                             </div>
                          </div>
                          <h3 className="text-2xl font-bold text-primary dark:text-white">
                            {member.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold italic">{member.designation}</p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Lines</p>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                              <Mail className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-slate-600 dark:text-slate-300 font-bold truncate max-w-[150px]">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                              <Phone className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-slate-600 dark:text-slate-300 font-bold">{member.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-4">
                          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-none px-6 py-2 font-bold uppercase tracking-widest text-[10px] rounded-full">
                            {member.status || 'Active'}
                          </Badge>
                          <Link href={`/internal/members/${member.id}`}>
                            <Button className="bg-primary dark:bg-white dark:text-slate-900 text-white hover:bg-accent rounded-2xl h-12 px-6 group/btn transition-all flex gap-2">
                              Full Profile <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
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
