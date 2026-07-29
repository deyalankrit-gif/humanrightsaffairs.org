
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, writeBatch, getDocs, where } from 'firebase/firestore'
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
  CheckCircle2
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const DEMI_SEED_DATA = [
  // North 24 Parganas
  { name: "Sourav Chatterjee", designation: "District Observer", level: "District", stateName: "West Bengal", districtName: "North 24 Parganas", category: "Office-bearing Member", gender: "male" },
  { name: "Fatema Khatun", designation: "General Member", level: "District", stateName: "West Bengal", districtName: "North 24 Parganas", category: "General Member", gender: "female" },
  { name: "Buddhadeb Sardar", designation: "Volunteer", level: "District", stateName: "West Bengal", districtName: "North 24 Parganas", category: "Volunteer", gender: "male" },
  { name: "Harpreet Singh Dhillon", designation: "Executive Member", level: "District", stateName: "West Bengal", districtName: "North 24 Parganas", category: "General Member", gender: "male" },
  { name: "Anjali Mukhopadhyay", designation: "Publicity Secretary", level: "District", stateName: "West Bengal", districtName: "North 24 Parganas", category: "Office-bearing Member", gender: "female" },
  { name: "Zakir Hossain Molla", designation: "Volunteer", level: "District", stateName: "West Bengal", districtName: "North 24 Parganas", category: "Volunteer", gender: "male" },
  { name: "Sujata Mondal", designation: "General Member", level: "District", stateName: "West Bengal", districtName: "North 24 Parganas", category: "General Member", gender: "female" },
  { name: "David D'Souza", designation: "District Advisor", level: "District", stateName: "West Bengal", districtName: "North 24 Parganas", category: "Board Member", gender: "male" },
  
  // South 24 Parganas
  { name: "Abhishek Bhattacharya", designation: "District Secretary", level: "District", stateName: "West Bengal", districtName: "South 24 Parganas", category: "Office-bearing Member", gender: "male" },
  { name: "Rumpa Naskar", designation: "General Member", level: "District", stateName: "West Bengal", districtName: "South 24 Parganas", category: "General Member", gender: "female" },
  { name: "Sahil Sheikh", designation: "Volunteer", level: "District", stateName: "West Bengal", districtName: "South 24 Parganas", category: "Volunteer", gender: "male" },
  { name: "Gurpreet Kaur", designation: "Executive Member", level: "District", stateName: "West Bengal", districtName: "South 24 Parganas", category: "General Member", gender: "female" },
  { name: "Bikash Halder", designation: "Treasurer", level: "District", stateName: "West Bengal", districtName: "South 24 Parganas", category: "Office-bearing Member", gender: "male" },
  { name: "Krishna Biswas", designation: "Volunteer", level: "District", stateName: "West Bengal", districtName: "South 24 Parganas", category: "Volunteer", gender: "female" },
  { name: "Subhankar Roy", designation: "General Member", level: "District", stateName: "West Bengal", districtName: "South 24 Parganas", category: "General Member", gender: "male" },
  { name: "Anthony Gomes", designation: "Board Member", level: "District", stateName: "West Bengal", districtName: "South 24 Parganas", category: "Board Member", gender: "male" },
];

export default function DemiMembersTerminal() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com'

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

  const handleSeedData = async () => {
    if (!db || !isRoot) return
    setIsActionLoading(true)
    
    try {
      const batch = writeBatch(db)
      
      DEMI_SEED_DATA.forEach((member, i) => {
        const id = `DEMI-${member.districtName.replace(/\s+/g, '')}-${i}`
        const docRef = doc(db, 'memberProfiles', id)
        batch.set(docRef, {
          ...member,
          memberId: `${member.districtName.substring(0,3).toUpperCase()}DEM${i.toString().padStart(3, '0')}`,
          isDemi: true,
          status: 'Active',
          joiningDate: 'Jan 2025',
          expiryDate: 'Jan 2026',
          membershipDuration: '1 Year',
          createdAt: serverTimestamp()
        }, { merge: true })
      })

      await batch.commit()
      toast({ title: "Seed Successful", description: "16 unique demi members have been added to the registry." })
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

  if (authLoading || !isRoot) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (demiMembers || []).filter((m: any) => 
    (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (m.districtName || '').toLowerCase().includes(search.toLowerCase())
  )

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
          
          <div className="flex gap-3">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="destructive" disabled={isActionLoading || !demiMembers?.length} className="h-11 px-6 rounded-xl font-bold gap-2">
                      <Trash2 className="w-4 h-4" /> Purge All Demi Records
                   </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-900">
                   <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="w-6 h-6" /> Revoke All Demi Access?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm font-medium">
                        This action will permanently delete every simulated personnel record from North and South 24 Parganas cells.
                      </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAll} className="bg-red-600 hover:bg-red-700 rounded-xl">Purge Registry</AlertDialogAction>
                   </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>

             <Button onClick={handleSeedData} disabled={isActionLoading} className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all">
                {isActionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />} Seed Chapter Data
             </Button>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-5xl">
         <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search demi members by name or district..." 
              className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-900 shadow-sm border-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
         </div>

         {dataLoading ? (
           <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
         ) : (
           <div className="grid gap-4">
              {filtered.map((m: any) => (
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
                                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-accent" /> {m.districtName}</span>
                                <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-3 h-3" /> Simulated Profile</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                   <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500 transition-all rounded-xl"><Trash2 className="w-5 h-5" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-3xl">
                                   <AlertDialogHeader>
                                      <AlertDialogTitle>Purge Record?</AlertDialogTitle>
                                      <AlertDialogDescription>Remove "{m.name}" from the simulated registry?</AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteDoc(doc(db, 'memberProfiles', m.id))} className="bg-red-600 hover:bg-red-700 rounded-xl">Confirm Delete</AlertDialogAction>
                                   </AlertDialogFooter>
                                </AlertDialogContent>
                             </AlertDialog>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-32 opacity-30">
                   <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                   <p className="text-sm font-bold uppercase tracking-widest">Simulated registry empty</p>
                </div>
              )}
           </div>
         )}
      </section>

      <Footer />
    </main>
  )
}
