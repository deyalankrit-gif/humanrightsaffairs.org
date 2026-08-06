
"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, writeBatch, getDocs, where, setDoc } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  Search, 
  Users, 
  User,
  MapPin, 
  Star,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Building2,
  X,
  Eye,
  EyeOff
} from 'lucide-react'
import { Input } from '@/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Footer } from '@/components/footer'
import { INDIA_DATA } from '@/lib/india-data'

const MALE_FIRST_NAMES = ["Sourav", "Abhishek", "Sahil", "Bikash", "Krishna", "Subhankar", "Anthony", "Zakir", "David", "Buddhadeb", "Arpan", "Tanmoy", "Mayank", "Piyush", "Vikram", "Indranil", "Ritam", "Amarendra", "Alok", "Krishnamurthy", "Sanjeev", "Pankaj", "Atanu", "Nirmal", "Jishnu", "Tarun"]
const FEMALE_FIRST_NAMES = ["Rumpa", "Anjali", "Sujata", "Fatema", "Mousumi", "Savita", "Rajeshwari", "Meenakshi", "Pallavi", "Suchitra", "Amita", "Debjani", "Deepali", "Tapasya"]
const UNISEX_FIRST_NAMES = ["Gurpreet", "Harpreet"]

const LAST_NAMES = ["Chatterjee", "Bhattacharya", "Naskar", "Sheikh", "Kaur", "Halder", "Biswas", "Roy", "Gomes", "Mukhopadhyay", "Molla", "Mondal", "D'Souza", "Khatun", "Sardar", "Dhillon", "Sengupta", "Das", "Biswas", "Kumari", "Tiwari", "Mahanta", "Khanna", "Singh", "Iyer", "Mohanty", "Sharma", "Bhardwaj", "Patil", "Patra", "V", "Yadav", "Joshi", "Sarkar", "Rawat", "Kumar", "Reddy", "Dutta", "Jena"]
const DESIGNATIONS = ["District Observer", "General Member", "Volunteer", "Executive Member", "Publicity Secretary", "District Secretary", "Treasurer", "Board Member", "Chapter Advisor"]

export default function DemiMembersTerminal() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isSeedOpen, setIsSeedOpen] = useState(false)

  const [seedOptions, setSeedOptions] = useState({
    level: 'District' as 'National' | 'State' | 'District',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    gender: 'all' as 'all' | 'male' | 'female'
  })

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com'

  // Global Visibility Node
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'demi_visibility');
  }, [db]);
  const { data: visibilitySettings, loading: settingsLoading } = useDoc(settingsRef);
  const isVisible = visibilitySettings?.enabled !== false;

  useEffect(() => {
    if (!authLoading && !isRoot) {
      router.push('/internal/login')
    }
  }, [isRoot, authLoading, router])

  const demiQuery = useMemoFirebase(() => {
    if (!db || !isRoot) return null;
    return query(collection(db, 'memberProfiles'), where('isDemi', '==', true));
  }, [db, isRoot]);

  const { data: demiMembers, loading: dataLoading } = useCollection(demiQuery);

  const officers = useMemo(() => {
    return (demiMembers || []).filter(o => o && typeof o === 'object' && o.id);
  }, [demiMembers]);

  const stats = useMemo(() => {
    if (!officers) return { total: 0, active: 0, load: 0 };
    const total = officers.length;
    const active = officers.filter((o: any) => o.status === 'active').length;
    const load = officers.reduce((acc, curr: any) => acc + (curr.assignedCount || 0), 0);
    return { total, active, load };
  }, [officers]);

  const handleToggleVisibility = async () => {
    if (!db || !isRoot || !settingsRef) return;
    setIsActionLoading(true);
    try {
      await setDoc(settingsRef, { 
        enabled: !isVisible, 
        updatedAt: serverTimestamp(),
        updatedBy: user?.email 
      }, { merge: true });
      
      toast({ 
        title: isVisible ? "Registry Hidden Globally" : "Registry Visible Publicly",
        description: isVisible ? "Demi members are now hidden from the public portal." : "Demi members are now visible on the public portal."
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!db || !isRoot) return
    setIsActionLoading(true)
    
    try {
      const batch = writeBatch(db)
      const count = seedOptions.level === 'National' ? 5 : 10;
      
      let availableFirstNames = [...MALE_FIRST_NAMES, ...FEMALE_FIRST_NAMES, ...UNISEX_FIRST_NAMES];
      if (seedOptions.gender === 'male') {
        availableFirstNames = [...MALE_FIRST_NAMES, ...UNISEX_FIRST_NAMES];
      } else if (seedOptions.gender === 'female') {
        availableFirstNames = [...FEMALE_FIRST_NAMES, ...UNISEX_FIRST_NAMES];
      }

      for (let i = 0; i < count; i++) {
        const firstName = availableFirstNames[Math.floor(Math.random() * availableFirstNames.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const name = `${firstName} ${lastName}`;
        const designation = DESIGNATIONS[Math.floor(Math.random() * DESIGNATIONS.length)];
        
        let gender: 'male' | 'female' = 'male';
        if (FEMALE_FIRST_NAMES.includes(firstName)) {
          gender = 'female';
        } else if (UNISEX_FIRST_NAMES.includes(firstName)) {
          gender = Math.random() > 0.5 ? 'male' : 'female';
        }

        const memberId = `${seedOptions.level === 'National' ? 'NAT' : seedOptions.state.substring(0,3).toUpperCase()}DEM${Math.floor(1000 + Math.random() * 9000)}`;
        
        const docRef = doc(collection(db, 'memberProfiles'))
        batch.set(docRef, {
          name,
          designation,
          level: seedOptions.level === 'National' ? 'National' : seedOptions.level,
          stateName: seedOptions.level === 'National' ? 'Central Council' : seedOptions.state,
          districtName: seedOptions.level === 'District' ? seedOptions.district : '',
          designationCategory: designation === 'Volunteer' ? 'Volunteer' : 'General Member',
          gender,
          memberId,
          isDemi: true,
          status: 'Active',
          joiningDate: 'Jan 2025',
          expiryDate: 'Jan 2026',
          membershipDuration: '1 Year',
          createdAt: serverTimestamp()
        })
      }

      await batch.commit()
      toast({ title: "Seed Successful", description: `Simulated members established for ${seedOptions.level} level.` })
      setIsSeedOpen(false)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Seed Failed", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!db || !isRoot || !demiMembers) return
    setIsActionLoading(true)
    try {
      const batch = writeBatch(db)
      demiMembers.forEach((m: any) => {
        batch.delete(doc(db, 'memberProfiles', m.id))
      })
      await batch.commit()
      toast({ title: "Registry Purged", description: "All demi member records have been removed." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Purge Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteGroup = async (membersToDelete: any[], groupName: string) => {
    if (!db || !isRoot || !membersToDelete.length) return
    setIsActionLoading(true)
    try {
      const batch = writeBatch(db)
      membersToDelete.forEach((m: any) => {
        batch.delete(doc(db, 'memberProfiles', m.id))
      })
      await batch.commit()
      toast({ title: "Group Purged", description: `Simulated members for ${groupName} removed.` })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Purge Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const filtered = (demiMembers || []).filter((m: any) => 
    (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (m.districtName || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.stateName || '').toLowerCase().includes(search.toLowerCase())
  )

  const groupings = React.useMemo(() => {
    const central = filtered.filter(m => m.level === 'National' || m.level === 'Central');
    
    const stateGroups = filtered
      .filter(m => m.level === 'State')
      .reduce((acc, m) => {
        const state = (m.stateName || 'Unspecified State').toUpperCase();
        if (!acc[state]) acc[state] = [];
        acc[state].push(m);
        return acc;
      }, {} as Record<string, any[]>);

    const districtGroups = filtered
      .filter(m => m.level === 'District')
      .reduce((acc, m) => {
        const state = (m.stateName || 'Unspecified State').toUpperCase();
        const district = (m.districtName || 'Unspecified District').toUpperCase();
        if (!acc[state]) acc[state] = {};
        if (!acc[state][district]) acc[state][district] = [];
        acc[state][district].push(m);
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

    return { central, stateGroups, districtGroups };
  }, [filtered]);

  const renderMemberCard = (m: any) => (
    <Card key={m.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 group transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-stretch">
           <div className="p-6 md:w-48 text-center border-r bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center shrink-0">
              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-accent text-accent mb-2">
                 {m.memberId}
              </Badge>
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-300">
                 <User className="w-6 h-6" />
              </div>
           </div>
           <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left flex-1">
                 <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{m.name}</h3>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                    <span className="flex items-center gap-1.5"><Star className="w-3 h-3 text-accent fill-accent" /> {m.designation}</span>
                    <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-accent" /> {m.stateName}</span>
                    {m.districtName && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-accent" /> {m.districtName}</span>}
                    <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-3 h-3" /> Simulated Profile</span>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <button className="h-10 w-10 text-slate-300 hover:text-red-500 transition-all rounded-xl flex items-center justify-center"><Trash2 className="w-5 h-5" /></button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl bg-white dark:bg-slate-900 border-none shadow-2xl">
                       <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete this item? This action may be irreversible. Please confirm before continuing.</AlertDialogDescription>
                       </AlertDialogHeader>
                       <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteDoc(doc(db, 'memberProfiles', m.id))} className="bg-red-600 hover:bg-red-700 rounded-xl">Delete</AlertDialogAction>
                       </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  )

  const PurgeButton = ({ members, label }: { members: any[], label: string }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 font-bold text-[9px] uppercase tracking-widest gap-2 transition-all">
          <Trash2 className="w-3.5 h-3.5" /> Purge {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium leading-relaxed">
            Are you sure you want to delete this item? This action may be irreversible. Please confirm before continuing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel className="rounded-xl h-11 font-bold">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteGroup(members, label)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11 font-bold">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  const allStates = Object.keys(INDIA_DATA).sort()
  const districtsInState = INDIA_DATA[seedOptions.state] || []

  if (authLoading || settingsLoading || !isRoot) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-red-600" /></div>
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/30">
               <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Simulated Personnel Registry
             </div>
             <h1 className="text-3xl md:text-4xl font-headline font-bold">Demi <span className="text-accent italic">Members</span></h1>
             <p className="text-slate-400 text-[11px] uppercase font-black">Visual Population Management Terminal</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
             <Button 
                variant="outline" 
                onClick={handleToggleVisibility} 
                disabled={isActionLoading}
                className={cn(
                  "h-11 px-6 rounded-xl font-bold bg-white/5 border-white/20 text-white hover:bg-white/10 gap-2",
                  !isVisible && "text-amber-500 border-amber-500/30"
                )}
             >
                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isVisible ? "Hide Registry Globally" : "Show Registry Globally"}
             </Button>

             <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="destructive" disabled={isActionLoading || !demiMembers?.length} className="h-11 px-6 rounded-xl font-bold gap-2">
                      <Trash2 className="w-4 h-4" /> Purge All Demi Records
                   </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-900">
                   <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm font-medium">
                        Are you sure you want to delete this item? This action may be irreversible. Please confirm before continuing.
                      </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAll} className="bg-red-600 hover:bg-red-700 rounded-xl">Delete</AlertDialogAction>
                   </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>

             <Dialog open={isSeedOpen} onOpenChange={setIsSeedOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all">
                    <Plus className="w-4 h-4" /> Seed Chapter Data
                  </Button>
                </DialogTrigger>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                   <div className="bg-slate-900 p-8 text-white">
                      <DialogTitle className="text-2xl font-headline font-bold">Seed Protocol</DialogTitle>
                      <DialogDescription className="text-slate-400 mt-1">Select the target chapter and population parameters.</DialogDescription>
                   </div>
                   <div className="p-8 space-y-6">
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chapter Level</Label>
                            <Select value={seedOptions.level} onValueChange={(val: any) => setSeedOptions({...seedOptions, level: val})}>
                               <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                               <SelectContent position="popper" className="bg-white z-[1000001]">
                                  <SelectItem value="National">Central Council</SelectItem>
                                  <SelectItem value="State">State Chapter</SelectItem>
                                  <SelectItem value="District">District Cell</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>

                         {seedOptions.level !== 'National' && (
                           <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target State</Label>
                              <Select value={seedOptions.state} onValueChange={(val) => setSeedOptions({...seedOptions, state: val})}>
                                 <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                 <SelectContent position="popper" className="bg-white max-h-60 z-[1000001]">{allStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                              </Select>
                           </div>
                         )}

                         {seedOptions.level === 'District' && (
                           <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target District</Label>
                              <Select value={seedOptions.district} onValueChange={(val) => setSeedOptions({...seedOptions, district: val})}>
                                 <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                 <SelectContent position="popper" className="bg-white max-h-60 z-[1000001]">{districtsInState.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                              </Select>
                           </div>
                         )}

                         <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gender Protocol</Label>
                            <Select value={seedOptions.gender} onValueChange={(val: any) => setSeedOptions({...seedOptions, gender: val})}>
                               <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                               <SelectContent position="popper" className="bg-white z-[1000001]">
                                  <SelectItem value="all">Mixed Population</SelectItem>
                                  <SelectItem value="male">Male Only</SelectItem>
                                  <SelectItem value="female">Female Only</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                      </div>
                      <Button onClick={handleSeedData} disabled={isActionLoading} className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg">
                         {isActionLoading ? <Loader2 className="animate-spin" /> : "Authorize Seeding"}
                      </Button>
                   </div>
                </DialogContent>
             </Dialog>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-5xl">
         {isVisible ? (
           <>
             <div className="relative mb-12">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search demi members by name, state or district..." 
                  className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-900 shadow-sm border-none"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>

             {dataLoading ? (
               <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto" /></div>
             ) : (
               <div className="space-y-16">
                  {/* National Group */}
                  {groupings.central.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-red-600" />
                          <h4 className="text-sm font-black uppercase tracking-[0.25em] text-primary dark:text-white">Central Committee</h4>
                        </div>
                        <PurgeButton members={groupings.central} label="Central Council" />
                      </div>
                      <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-6"></div>
                      <div className="grid gap-4">
                        {groupings.central.map(renderMemberCard)}
                      </div>
                    </div>
                  )}

                  {/* State Groups */}
                  {Object.keys(groupings.stateGroups).length > 0 && (
                    <div className="space-y-12">
                      {Object.keys(groupings.stateGroups).sort().map(state => (
                        <div key={state} className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                              <Globe className="w-6 h-6 text-emerald-600" />
                              <h4 className="text-base font-black uppercase tracking-[0.2em] text-primary dark:text-white">
                                {state} <span className="text-emerald-500 font-bold ml-2">State Chapter</span>
                              </h4>
                            </div>
                            <PurgeButton members={groupings.stateGroups[state]} label={state} />
                          </div>
                          <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-6"></div>
                          <div className="grid gap-4">
                            {groupings.stateGroups[state].map(renderMemberCard)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* District Groups */}
                  {Object.keys(groupings.districtGroups).length > 0 && (
                    <div className="space-y-20">
                      {Object.keys(groupings.districtGroups).sort().map(state => (
                        <div key={state} className="space-y-12">
                          {Object.keys(groupings.districtGroups[state]).sort().map(district => (
                            <div key={district} className="space-y-4">
                              <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                  <Building2 className="w-6 h-6 text-blue-600" />
                                  <h4 className="text-base font-black uppercase tracking-[0.2em] text-primary dark:text-white">
                                    {district} <span className="text-blue-500 font-bold ml-2">District Cell</span>
                                    <span className="text-[10px] text-slate-400 font-medium ml-2">({state})</span>
                                  </h4>
                                </div>
                                <PurgeButton members={groupings.districtGroups[state][district]} label={`${district} (${state})`} />
                              </div>
                              <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-6"></div>
                              <div className="grid gap-4">
                                {groupings.districtGroups[state][district].map(renderMemberCard)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {filtered.length === 0 && (
                    <div className="text-center py-32 opacity-30">
                       <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                       <p className="text-sm font-bold uppercase tracking-widest">Simulated registry empty</p>
                    </div>
                  )}
               </div>
             )}
           </>
         ) : (
           <div className="text-center py-48 bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800 opacity-40 animate-in fade-in zoom-in-95 duration-500">
              <EyeOff className="w-24 h-24 mx-auto mb-6 text-slate-200" />
              <h3 className="text-3xl font-headline font-bold text-slate-400">Registry Visibility Suspended</h3>
              <p className="text-sm font-bold uppercase tracking-widest mt-2">Click "Show Registry" to restore population view</p>
           </div>
         )}
      </section>

      <Footer />
    </main>
  )
}
