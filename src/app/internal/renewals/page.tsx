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
import { parse, addYears, differenceInDays } from 'date-fns'
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
          expiryDate = addYears(joinDate, parseInt(member.membershipDuration || '1') || 1)
          daysRemaining = differenceInDays(expiryDate, new Date())
          status = daysRemaining < 0 ? 'Expired' : daysRemaining <= 30 ? 'Due' : 'Safe'
        } catch (e) {}
      }
      return { ...member, expiryDate, daysRemaining, renewalStatus: status }
    })
    .filter(m => {
       const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase());
       return matchesSearch && (m.renewalStatus === 'Due' || m.renewalStatus === 'Expired');
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
  }, [profiles, search])

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-12 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30">
                <RefreshCw className="w-2.5 h-2.5" /> Term Governance
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Membership <span className="text-accent italic">Renewals</span></h1>
              <p className="text-slate-400 text-[11px]">Monitoring personnel term expiration with 30-day alerts.</p>
            </div>
            <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-center"><p className="text-[10px] font-bold text-accent uppercase">30-Day Pro-Active Alert Baseline</p></div>
          </div>
        </div>
      </section>

      <section className="py-4 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search personnel..." className="pl-9 h-10 rounded-xl border-slate-200 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4 max-w-4xl mx-auto">
              {renewalData.map((member) => (
                <Card key={member.id} className="border-none shadow-sm overflow-hidden bg-white rounded-[2rem] border border-slate-100">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className={cn("p-5 md:w-44 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0", member.renewalStatus === 'Expired' ? 'bg-red-50' : 'bg-amber-50')}>
                           <Badge className={cn("text-[8px] font-bold px-2 py-0.5 uppercase mb-1", member.renewalStatus === 'Expired' ? 'bg-red-500' : 'bg-amber-500')}>{member.renewalStatus}</Badge>
                           <p className="text-sm font-bold text-slate-500">{member.renewalStatus === 'Expired' ? 'Alert' : `${member.daysRemaining} Days`}</p>
                      </div>
                      <div className="flex-1 p-5 grid lg:grid-cols-3 gap-6 items-center">
                        <div className="lg:col-span-2 space-y-0.5">
                           <h3 className="text-lg font-headline font-bold leading-tight">{member.name}</h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase">{member.designation}</p>
                        </div>
                        <div className="flex justify-end">
                           <Link href={`/internal/members/${member.id}`}><Button size="sm" className="h-9 rounded-xl text-[11px] font-bold px-6">Manage</Button></Link>
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
