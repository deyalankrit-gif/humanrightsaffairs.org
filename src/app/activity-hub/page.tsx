
"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronRight, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertCircle,
  Bell,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, where, doc } from 'firebase/firestore'
import { format, isToday, isAfter, isBefore, addDays, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { BUILT_IN_OBSERVANCES, BUILT_IN_HOLIDAYS } from '@/lib/activity-hub-data'
import { cn } from '@/lib/utils'
import { PublicFooter } from '@/components/public-footer'

export default function ActivityHubDashboard() {
  const db = useFirestore()
  const { user } = useUser()
  
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);
  const { data: userData } = useDoc(userDocRef);
  const isAdmin = userData?.role === 'admin' || user?.email === 'deydhritiman@gmail.com' || userData?.permissions?.activityHub === true;

  const eventsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'activity_events'), orderBy('date', 'asc'));
  }, [db]);
  const { data: events } = useCollection(eventsQuery);

  const remindersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'activity_reminders'), where('uid', '==', user.uid));
  }, [db, user]);
  const { data: reminders } = useCollection(remindersQuery);

  const stats = useMemo(() => {
    if (!events) return { today: [], upcoming: [], month: [] };
    const now = new Date();
    const next30 = addDays(now, 30);
    const mStart = startOfMonth(now);
    const mEnd = endOfMonth(now);

    return {
      today: events.filter((e: any) => isToday(parseISO(e.date))),
      upcoming: events.filter((e: any) => {
        const d = parseISO(e.date);
        return isAfter(d, now) && isBefore(d, next30);
      }),
      month: events.filter((e: any) => {
        const d = parseISO(e.date);
        return isAfter(d, mStart) && isBefore(d, mEnd);
      })
    };
  }, [events]);

  const currentMonthObservances = useMemo(() => {
    const month = new Date().getMonth() + 1;
    return [
      ...BUILT_IN_HOLIDAYS.filter(h => h.month === month),
      ...BUILT_IN_OBSERVANCES.filter(o => o.month === month)
    ].sort((a, b) => a.day - b.day);
  }, []);

  // Defensive Filter: Ensure reminders correspond to existing events
  const validReminders = useMemo(() => {
    if (!reminders) return [];
    if (!events) return reminders; // Still loading events
    const eventIds = new Set(events.map((e: any) => e.id));
    return reminders.filter((r: any) => eventIds.has(r.eventId));
  }, [reminders, events]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-32 pb-12 bg-primary text-primary-foreground border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <LayoutDashboard className="w-2.5 h-2.5" /> Institutional Hub
              </div>
              <h1 className="text-3xl md:text-5xl font-headline font-bold">Activity <span className="text-accent italic">Calendar Hub</span></h1>
              <p className="opacity-70 text-sm max-w-xl">Unified planning dashboard for national observances and organizational missions.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/activity-hub/calendar">
                <Button className="bg-accent text-primary font-bold h-12 rounded-xl px-6 hover:bg-secondary hover:text-white transition-all shadow-lg shadow-accent/20">
                  <CalendarIcon className="w-4 h-4 mr-2" /> Full Calendar View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Quick Stats */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {[
                   { label: "Today's Agenda", value: stats.today.length, icon: <Clock className="text-accent" />, detail: "Active missions" },
                   { label: "Next 30 Days", value: stats.upcoming.length, icon: <TrendingUp className="text-emerald-500" />, detail: "Scheduled events" },
                   { label: "Monthly Program", value: stats.month.length, icon: <CalendarIcon className="text-indigo-500" />, detail: "Institutional planning" }
                 ].map((s, i) => (
                   <Card key={i} className="border-none shadow-sm rounded-2xl group overflow-hidden">
                     <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                           <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-accent/10 transition-colors">{s.icon}</div>
                           <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-100">Live</Badge>
                        </div>
                        <p className="text-3xl font-headline font-bold mb-1">{s.value}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                     </CardContent>
                   </Card>
                 ))}
              </div>

              <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                 <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b p-8">
                    <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-accent" /> Upcoming Program Flow
                    </CardTitle>
                    <CardDescription>Consolidated timeline of upcoming Trust activities.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                      {stats.upcoming.length > 0 ? stats.upcoming.map((e: any) => (
                        <div key={e.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex flex-col md:flex-row items-center justify-between gap-4">
                           <div className="flex items-start gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex flex-col items-center justify-center shrink-0 shadow-lg mt-1">
                                 <span className="text-[10px] font-black uppercase">{format(parseISO(e.date), 'MMM')}</span>
                                 <span className="text-xl font-headline font-bold leading-none">{format(parseISO(e.date), 'dd')}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex flex-wrap gap-2 mb-1.5">
                                   <Badge variant="outline" className="border-accent text-accent text-[8px] font-black uppercase h-4">{e.category}</Badge>
                                   <Badge className={cn(
                                     "text-white text-[8px] font-black uppercase border-none h-4",
                                     e.priority === 'High' ? "bg-red-600" :
                                     e.priority === 'Medium' ? "bg-emerald-600" :
                                     "bg-blue-600"
                                   )}>
                                     {e.priority} Priority
                                   </Badge>
                                   <Badge variant="outline" className="text-[8px] font-bold uppercase h-4 border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                     {e.status}
                                   </Badge>
                                 </div>
                                 <h4 className="font-bold text-lg leading-tight mb-1">{e.title}</h4>
                                 
                                 <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400 uppercase mb-3">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-accent" /> {e.startTime || 'All Day'}</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-accent" /> {e.venue || 'TBD'}</span>
                                 </div>

                                 {e.description && (
                                   <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 max-w-xl">
                                      <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-2">
                                        "{e.description}"
                                      </p>
                                   </div>
                                 )}
                              </div>
                           </div>
                           <Link href="/activity-hub/calendar" className="shrink-0">
                             <Button variant="ghost" size="sm" className="rounded-full hover:bg-accent hover:text-white group/btn h-10 px-4">
                               Details <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                             </Button>
                           </Link>
                        </div>
                      )) : (
                        <div className="py-20 text-center text-slate-300">
                           <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                           <p className="font-bold uppercase tracking-widest text-xs">No programs scheduled for the next 30 days.</p>
                        </div>
                      )}
                    </div>
                 </CardContent>
              </Card>
            </div>

            {/* Sidebar Alerts */}
            <div className="space-y-8">
               <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12"></div>
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" /> Current Month Observances
                    </CardTitle>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(), 'MMMM yyyy')}</p>
                  </CardHeader>
                  <div className="space-y-4">
                     {currentMonthObservances.map((o, idx) => (
                       <div key={idx} className="flex gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-accent transition-colors">
                             <span className="font-bold text-sm text-primary dark:text-white">{o.day}</span>
                          </div>
                          <div>
                             <p className="text-[8px] font-black uppercase text-accent leading-none mb-1">{o.type}</p>
                             <p className="font-bold text-sm leading-tight text-slate-700 dark:text-slate-300">{o.title}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </Card>

               <Card className="rounded-[2rem] border-none shadow-sm bg-primary text-white p-6 relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-16 -mr-16"></div>
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                      <Bell className="w-5 h-5 text-accent" /> Active Reminders
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-4">
                     {validReminders.length > 0 ? validReminders.slice(0, 3).map((r: any) => (
                       <div key={r.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                          <p className="text-[8px] font-black uppercase text-slate-400">Trigger: {r.daysBefore} Days Prior</p>
                          <p className="font-bold text-sm mt-1">{r.title}</p>
                       </div>
                     )) : (
                       <div className="text-center py-6">
                          <p className="text-xs text-slate-400 italic">No personal reminders set.</p>
                       </div>
                     )}
                     <Link href="/activity-hub/calendar" className="block w-full">
                        <Button variant="ghost" className="w-full text-[10px] uppercase font-black text-accent hover:text-white hover:bg-white/5 tracking-widest">
                          Manage Reminders
                        </Button>
                     </Link>
                  </div>
               </Card>

               <div className="p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-950/20 border-2 border-dashed border-indigo-200 dark:border-indigo-900 text-center space-y-4">
                  <AlertCircle className="w-10 h-10 text-indigo-500 mx-auto" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-indigo-500">Planning Mandate</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase">
                    Institutional activities must be logged at least 15 days in advance for regional coordination.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
