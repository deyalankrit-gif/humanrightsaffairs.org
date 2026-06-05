"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  RefreshCw, 
  CalendarClock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  Hash,
  MapPin,
  Clock,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { parse, addYears, differenceInDays, isAfter, isBefore, addDays } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function MembershipRenewalsPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const [search, setSearch] = useState('')

  const profilesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
  }, [db, user]);

  const { data: profiles, loading: dataLoading } = useCollection(profilesQuery);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const renewalData = useMemo(() => {
    if (!profiles) return []

    return (profiles as any[]).map(member => {
      let expiryDate: Date | null = null
      let status: 'Safe' | 'Due' | 'Expired' = 'Safe'
      let daysRemaining = 0

      if (member.joiningDate) {
        try {
          const joinDate = parse(member.joiningDate, "PPP", new Date())
          const durationYears = parseInt(member.membershipDuration || '1') || 1
          expiryDate = addYears(joinDate, durationYears)
          daysRemaining = differenceInDays(expiryDate, new Date())
          
          if (daysRemaining < 0) status = 'Expired'
          else if (daysRemaining <= 30) status = 'Due'
          else status = 'Safe'
        } catch (e) {
          console.error("Date parsing error for member:", member.name)
        }
      }

      return {
        ...member,
        expiryDate,
        daysRemaining,
        renewalStatus: status
      }
    })
    .filter(m => {
       const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
                             (m.memberId || '').toLowerCase().includes(search.toLowerCase());
       // Show members due for renewal (starting 1 month in advance) or already expired
       return matchesSearch && (m.renewalStatus === 'Due' || m.renewalStatus === 'Expired');
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
  }, [profiles, search])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-20 pb-12 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <RefreshCw className="w-3 h-3" /> Term Governance
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Membership <span className="text-accent italic">Renewals</span></h1>
              <p className="text-slate-400">Monitoring personnel term expiration with pro-active 30-day alerts.</p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Alert Baseline</p>
               <p className="text-xl font-bold text-accent">1 Month Advance Notification</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 border-b bg-white dark:bg-slate-900 sticky top-[64px] md:top-[64px] z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search personnel due for renewal..." 
              className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Parsing Personnel Terms...</p>
            </div>
          ) : (
            <div className="grid gap-6 max-w-5xl mx-auto">
              {renewalData.length > 0 ? (
                renewalData.map((member) => (
                  <Card key={member.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className={cn(
                          "p-8 md:w-56 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0",
                          member.renewalStatus === 'Expired' ? 'bg-red-50 dark:bg-red-950/20' : 'bg-amber-50 dark:bg-amber-950/20'
                        )}>
                           <div className="mb-4">
                              {member.renewalStatus === 'Expired' ? (
                                <ShieldAlert className="w-10 h-10 text-red-500 mx-auto animate-pulse" />
                              ) : (
                                <Clock className="w-10 h-10 text-amber-500 mx-auto" />
                              )}
                           </div>
                           <Badge className={cn(
                             "font-bold uppercase tracking-widest text-[9px] px-4 py-1 mb-2",
                             member.renewalStatus === 'Expired' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                           )}>
                             {member.renewalStatus === 'Expired' ? 'Term Expired' : 'Renewal Due'}
                           </Badge>
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                             {member.renewalStatus === 'Expired' ? 'Action Required' : `${member.daysRemaining} Days Left`}
                           </p>
                        </div>
                        
                        <div className="flex-1 p-8 grid lg:grid-cols-4 gap-8 items-center">
                          <div className="lg:col-span-2 space-y-2">
                             <div className="flex items-center gap-2">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Hash className="w-3 h-3" /> {member.memberId}</p>
                               <Badge variant="outline" className="border-accent/30 text-accent text-[8px] font-bold uppercase py-0">{member.level}</Badge>
                             </div>
                             <h3 className="text-2xl font-headline font-bold text-primary dark:text-white leading-none">{member.name}</h3>
                             <p className="text-xs font-bold text-slate-500 italic">{member.designation}</p>
                             
                             <div className="flex flex-wrap gap-4 pt-4">
                                <div className="space-y-0.5">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase">Issued on</p>
                                   <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{member.joiningDate}</p>
                                </div>
                                <div className="space-y-0.5">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase">Valid Until</p>
                                   <p className="text-xs font-bold text-red-500">{member.expiryDate ? format(member.expiryDate, "PPP") : 'Unknown'}</p>
                                </div>
                                <div className="space-y-0.5">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase">Original Term</p>
                                   <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{member.membershipDuration || '1 Year'}</p>
                                </div>
                             </div>
                          </div>

                          <div className="flex flex-col items-center gap-3">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Follow-up Protocols</p>
                             <div className="flex gap-2">
                                <Button asChild variant="outline" size="icon" className="rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 h-10 w-10">
                                   <a href={`tel:${member.phone}`}><Phone className="w-4 h-4" /></a>
                                </Button>
                                <Button asChild variant="outline" size="icon" className="rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 h-10 w-10">
                                   <a href={`https://wa.me/91${member.phone?.replace(/\D/g, '')}`} target="_blank"><MessageCircle className="w-4 h-4" /></a>
                                </Button>
                                <Button asChild variant="outline" size="icon" className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 h-10 w-10">
                                   <a href={`mailto:${member.email}`}><Mail className="w-4 h-4" /></a>
                                </Button>
                             </div>
                          </div>

                          <div className="flex justify-end">
                             <Link href={`/internal/members/${member.id}`}>
                               <Button className="bg-primary text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold h-12 px-6 gap-2 group/btn">
                                 Manage Profile <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                               </Button>
                             </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                   <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                   </div>
                   <h3 className="text-2xl font-headline font-bold text-primary dark:text-white mb-2">Registry Integrity Verified</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No personnel records require immediate renewal attention within the next 30 days.</p>
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
