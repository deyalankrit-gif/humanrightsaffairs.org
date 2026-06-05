"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp, where } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Lock, 
  Hash,
  Mail,
  Phone,
  ArrowRight,
  Loader2,
  UserPlus,
  MapPin,
  Globe,
  User,
  Briefcase,
  RefreshCw,
  CheckCircle2,
  Calendar as CalendarIcon,
  Sparkles,
  IdCard,
  FileText,
  Award,
  ChevronDown
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
import { format, parse } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  
  const [newMember, setNewMember] = useState({
    name: '',
    designation: '',
    profession: '',
    gender: 'Male',
    email: '',
    phone: '',
    level: 'National' as 'National' | 'State' | 'District',
    status: 'Active',
    memberId: '',
    stateName: '',
    districtName: '',
    joiningDate: '',
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

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.memberId || !newMember.joiningDate) {
      toast({ variant: "destructive", title: "Validation Error" })
      return
    }

    setIsAdding(true)
    try {
      await addDoc(collection(db, 'memberProfiles'), { ...newMember, createdAt: serverTimestamp() })
      toast({ title: "Success" })
      setIsAdding(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "System Error" })
      setIsAdding(true)
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

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-12 pb-8 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[9px] font-bold border border-red-500/30 uppercase tracking-[0.2em]">
                <Lock className="w-2.5 h-2.5" /> Personnel Directory
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Secure <span className="text-accent italic">Membership</span></h1>
              <p className="text-slate-400 text-[11px] max-w-xl">Internal dashboard for managing operational contact protocols.</p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg">
                  <UserPlus className="w-4 h-4" /> Commission Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-3xl"><DialogHeader><DialogTitle>New Record</DialogTitle></DialogHeader>
                <Button onClick={handleAddMember} disabled={isAdding} className="w-full h-11 rounded-xl mt-4">Confirm Commissioning</Button>
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
                          <Link href={`/internal/members/${member.id}`}>
                            <Button size="sm" className="h-8 rounded-lg text-[10px] px-3 font-bold">Profile</Button>
                          </Link>
                          <Link href={`/internal/members/${member.id}/id-card`}>
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] px-3 font-bold border-accent text-accent">ID Card</Button>
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
