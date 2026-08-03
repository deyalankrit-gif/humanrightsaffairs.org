"use client"

import React, { useMemo } from 'react'
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, where, orderBy, doc } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Clock, 
  MapPin, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  Target,
  FileText,
  User,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function InvestigatorDashboard() {
  const { user } = useUser()
  const db = useFirestore()

  const userRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);
  const { data: userData } = useDoc(userRef);

  const casesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    // Query cases where this investigator is assigned
    return query(
      collection(db, 'public_complaints'), 
      where('status', 'not-in', ['Closed', 'Action Taken']),
      orderBy('status'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: allCases, loading } = useCollection(casesQuery);

  // Filter in memory for investigators (Firestore index requirements simplified)
  const assignedCases = useMemo(() => {
    if (!allCases || !user) return [];
    const name = userData?.name || '';
    return allCases.filter((c: any) => 
      c.assignedTo === name || 
      c.assignedOfficers?.some((o: any) => o.name === name) ||
      c.email === user.email // Support for legacy email assignment
    );
  }, [allCases, user, userData]);

  const stats = useMemo(() => {
    const active = assignedCases.length;
    const high = assignedCases.filter((c: any) => c.priority === 'High').length;
    const review = assignedCases.filter((c: any) => c.status === 'Under Preliminary Review').length;
    return { active, high, review };
  }, [assignedCases]);

  if (loading) return <div className="py-20 text-center"><Loader2 className="animate-spin text-indigo-600 mx-auto" /></div>

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <section className="space-y-2">
        <h2 className="text-3xl font-headline font-bold text-primary">Welcome, <span className="text-indigo-600">{userData?.name || 'Investigator'}</span></h2>
        <p className="text-slate-500 font-medium">You have {assignedCases.length} active investigations in your docket.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Cases', value: stats.active, icon: <Activity className="text-indigo-500" />, bg: 'bg-indigo-50' },
          { label: 'High Priority', value: stats.high, icon: <AlertCircle className="text-red-500" />, bg: 'bg-red-50' },
          { label: 'Pending Review', value: stats.review, icon: <Clock className="text-amber-500" />, bg: 'bg-amber-50' }
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={cn("p-4 rounded-2xl", s.bg)}>{s.icon}</div>
              <div>
                <p className="text-3xl font-headline font-bold leading-none">{s.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-slate-900 text-white p-8">
           <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
             <Target className="w-6 h-6 text-indigo-400" /> Assigned Docket
           </CardTitle>
           <CardDescription className="text-slate-400">Current mission-critical investigations assigned to your node.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
           <div className="divide-y divide-slate-50">
             {assignedCases.length > 0 ? assignedCases.map((c: any) => (
               <div key={c.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-center justify-between gap-6 group">
                  <div className="flex items-start gap-6 flex-1">
                     <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex flex-col items-center justify-center text-indigo-600 shrink-0 font-bold shadow-sm">
                        <span className="text-[8px] uppercase font-black">ID</span>
                        <span className="text-sm tracking-tighter">{c.caseId?.split('-').pop()}</span>
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <h4 className="text-lg font-bold text-primary group-hover:text-indigo-600 transition-colors leading-tight">{c.subject}</h4>
                           <Badge variant="outline" className={cn(
                             "text-[7px] font-black uppercase border-none",
                             c.priority === 'High' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                           )}>{c.priority} PRIORITY</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase">
                           <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-accent" /> {c.districtName}, {c.stateName}</span>
                           <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-accent" /> Filed: {c.createdAt?.toDate?.()?.toLocaleDateString()}</span>
                           <span className="flex items-center gap-1.5 text-indigo-600"><CheckCircle2 className="w-3 h-3" /> {c.status}</span>
                        </div>
                     </div>
                  </div>
                  <Link href={`/investigator/cases/${c.id}`} className="w-full md:w-auto">
                    <Button variant="outline" className="w-full md:w-auto h-11 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                      Access File <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
               </div>
             )) : (
               <div className="py-24 text-center opacity-30">
                  <ShieldCheck className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm font-black uppercase tracking-[0.2em]">Docket Empty</p>
               </div>
             )}
           </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return <Clock className={cn("animate-spin", className)} />
}
