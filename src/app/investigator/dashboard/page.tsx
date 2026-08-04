
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
  ShieldCheck,
  CalendarCheck,
  UserRoundCheck,
  Loader2,
  ListTodo,
  Hash
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function InvestigatorDashboard() {
  const { user } = useUser()
  const db = useFirestore()

  // 1. Fetch current investigator's profile metadata from the registry
  const userRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);
  const { data: userData } = useDoc(userRef);

  /**
   * 2. CASE STREAM PROTOCOL:
   * We query cases where the current investigator's email is present in the optimized
   * 'investigatorEmails' index. This ensures 100% adherence to Firestore security rules.
   */
  const casesQuery = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return query(
      collection(db, 'public_complaints'),
      where('investigatorEmails', 'array-contains', user.email.toLowerCase().trim()),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.email]);

  const { data: allAssignedRaw, loading } = useCollection(casesQuery);

  /**
   * TACTICAL FILTERING:
   * Perform status-based filtering client-side to maintain a simple, reliable indexing strategy.
   */
  const assignedCases = useMemo(() => {
    if (!allAssignedRaw) return [];
    return allAssignedRaw.filter((c: any) => !['Closed', 'Action Taken'].includes(c.status));
  }, [allAssignedRaw]);

  const stats = useMemo(() => {
    if (!assignedCases || !user?.email) return { active: 0, high: 0, tasks: 0 };
    
    const active = assignedCases.length;
    const high = assignedCases.filter((c: any) => c.priority === 'High').length;
    
    let pendingTasks = 0;
    assignedCases.forEach((c: any) => {
       const myMember = (c.investigationTeam || []).find((m: any) => (m.email || '').toLowerCase().trim() === user.email.toLowerCase().trim());
       if (myMember) {
          // Aggregate detailed tasks
          const taskCount = myMember.tasks?.filter((t: any) => t.status !== 'Completed').length || 0;
          pendingTasks += taskCount;
          
          // Fallback to responsibility matrix count if no tasks are defined
          if ((myMember.tasks?.length || 0) === 0) {
             pendingTasks += (myMember.responsibilities?.length || 0);
          }
       }
    });

    return { active, high, tasks: pendingTasks };
  }, [assignedCases, user?.email]);

  if (loading) return (
    <div className="py-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Synchronizing Assignments...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <section className="space-y-2">
        <h2 className="text-3xl font-headline font-bold text-primary">Field <span className="text-indigo-600">Command</span></h2>
        <p className="text-slate-500 font-medium">Identity Node: {userData?.name || 'Authorized Officer'}. Sector clearance verified.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Dockets', value: stats.active, icon: <Activity className="text-indigo-500" />, bg: 'bg-indigo-50' },
          { label: 'High Priority', value: stats.high, icon: <AlertCircle className="text-red-500" />, bg: 'bg-red-50' },
          { label: 'Pending Mandates', value: stats.tasks, icon: <ListTodo className="text-amber-500" />, bg: 'bg-amber-50' }
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
             <Target className="w-6 h-6 text-indigo-400" /> Tactical Assignments
           </CardTitle>
           <CardDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest">Live synchronization with National Oversight directives</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
           <div className="divide-y divide-slate-50">
             {assignedCases.length > 0 ? assignedCases.map((c: any) => {
               const myMember = (c.investigationTeam || []).find((m: any) => (m.email || '').toLowerCase().trim() === user?.email?.toLowerCase().trim());
               const taskCount = (myMember?.tasks?.length || 0) + (myMember?.responsibilities?.length || 0);
               const completedCount = myMember?.tasks?.filter((t:any) => t.status === 'Completed').length || 0;

               return (
               <div key={c.id} className="p-8 hover:bg-slate-50 transition-all flex flex-col xl:flex-row items-center justify-between gap-8 group">
                  <div className="flex items-start gap-6 flex-1 min-w-0">
                     <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex flex-col items-center justify-center text-indigo-600 shrink-0 font-black shadow-inner">
                        <span className="text-[7px] uppercase tracking-widest">REF</span>
                        <span className="text-xs whitespace-nowrap">{c.caseId?.split('-').pop() || c.token.slice(-4)}</span>
                     </div>
                     <div className="space-y-3 min-w-0">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                              <h4 className="text-xl font-bold text-primary group-hover:text-indigo-600 transition-colors leading-tight truncate">{c.subject}</h4>
                              <Badge className={cn(
                                "text-[7px] font-black uppercase border-none h-4",
                                c.priority === 'High' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                              )}>{c.priority}</Badge>
                           </div>
                           <p className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5"><MapPin className="w-3 h-3 text-accent" /> {c.districtName}, {c.stateName}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                           <div className="flex items-center gap-1.5">
                              <UserRoundCheck className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Assigned: {c.createdAt?.toDate?.()?.toLocaleDateString()}</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-[10px] font-black text-emerald-600 uppercase">Status: {c.status}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="flex-1 text-center sm:text-right px-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Progress</p>
                       <p className="text-lg font-black text-primary">{completedCount} / {taskCount} Mandates</p>
                    </div>
                    <Link href={`/investigator/cases/${c.id}`} className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto h-12 px-10 rounded-2xl bg-primary text-white font-bold uppercase text-[10px] tracking-widest shadow-xl hover:bg-secondary transition-all">
                        Open Docket <ChevronRight className="ml-1 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
               </div>
             )}) : (
               <div className="py-32 text-center opacity-30">
                  <ShieldCheck className="w-20 h-20 mx-auto mb-6" />
                  <p className="text-lg font-black uppercase tracking-[0.3em]">No Active Assignments</p>
               </div>
             )}
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
