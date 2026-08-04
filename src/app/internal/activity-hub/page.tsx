
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Loader2,
  FileDown,
  Trash2,
  Edit,
  Clock,
  MapPin,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, doc, deleteDoc, where, getDocs } from 'firebase/firestore'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  parseISO
} from 'date-fns'
import { BUILT_IN_OBSERVANCES, BUILT_IN_HOLIDAYS } from '@/lib/activity-hub-data'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog'
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
import { ActivityForm } from '@/components/activity-hub/activity-form'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Footer } from '@/components/footer'

/**
 * INTERNAL ACTIVITY HUB MANAGEMENT
 * Secure terminal for administrators to manage organizational mission dates.
 */
export default function ActivityHubAdmin() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  
  const db = useFirestore()
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);

  const { data: userData, loading: userDataLoading } = useDoc(userDocRef);

  // Administrative verification
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const isAdmin = !authLoading && !userDataLoading && !!user && (
    userData?.role === 'admin' || 
    user?.email === 'deydhritiman@gmail.com' || 
    userData?.permissions?.activityHub === true
  );

  const eventsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'activity_events'), orderBy('date', 'asc'));
  }, [db]);
  const { data: events, loading: eventsLoading } = useCollection(eventsQuery);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate))
    const end = endOfWeek(endOfMonth(currentDate))
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const handleDelete = async (id: string) => {
    if (!db || !isAdmin) return
    
    const eventRef = doc(db, 'activity_events', id);

    // 1. Delete main event
    deleteDoc(eventRef).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: eventRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });

    // 2. Cascade delete orphaned reminders across all users
    const remindersRef = collection(db, 'activity_reminders');
    const q = query(remindersRef, where('eventId', '==', id));
    
    try {
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(reminderDoc => {
        deleteDoc(reminderDoc.ref).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: reminderDoc.ref.path,
            operation: 'delete',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
      });

      toast({ title: "Mission Purged", description: "Record and associated reminders removed." })
      setSelectedEvent(null)
    } catch (e: any) {
      console.error("Cleanup error:", e);
      toast({ variant: "destructive", title: "Partial Purge", description: "Event deleted, but reminders might remain." })
    }
  }

  const getDayContent = (day: Date) => {
    const dayHolidays = BUILT_IN_HOLIDAYS.filter(h => h.month === day.getMonth() + 1 && h.day === day.getDate())
    const dayObservances = BUILT_IN_OBSERVANCES.filter(o => o.month === day.getMonth() + 1 && o.day === day.getDate())
    const dayEvents = (events || []).filter((e: any) => isSameDay(parseISO(e.date), day))
    
    return { holidays: dayHolidays, observances: dayObservances, events: dayEvents }
  }

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'High': return "bg-red-500/10 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-600 hover:text-white"
      case 'Medium': return "bg-emerald-500/10 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-600 hover:text-white"
      case 'Low': return "bg-blue-500/10 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-600 hover:text-white"
      default: return "bg-accent/10 dark:bg-accent/20 text-accent border-accent/20 hover:bg-accent hover:text-primary"
    }
  }

  if (authLoading || (user && userDataLoading)) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-accent" /></div>
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="pt-16 pb-6 bg-slate-900 text-white border-b-8 border-accent/20 sticky top-0 z-40 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <LayoutDashboard className="w-8 h-8 text-accent" />
              <div>
                <h1 className="text-2xl font-headline font-bold">Activity <span className="text-accent italic">Terminal</span></h1>
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                   <ShieldCheck className="w-3.5 h-3.5" /> Root Planning Suite
                </p>
              </div>
           </div>

           <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
              <Button onClick={prevMonth} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm font-bold px-4">{format(currentDate, 'MMMM yyyy')}</span>
              <Button onClick={nextMonth} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10"><ChevronRight className="w-4 h-4" /></Button>
           </div>

           <div className="flex items-center gap-2">
              {isAdmin && (
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-accent text-primary font-bold h-10 rounded-xl px-6 hover:bg-secondary hover:text-white transition-all shadow-lg">
                      <Plus className="w-4 h-4 mr-2" /> Schedule Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader><DialogTitle>Mission Entry Documentation</DialogTitle></DialogHeader>
                    <ActivityForm onSuccess={() => setIsAddOpen(false)} />
                  </DialogContent>
                </Dialog>
              )}
           </div>
        </div>
      </header>

      <section className="p-4 md:p-8">
        <div className="container mx-auto">
          {eventsLoading ? (
            <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
          ) : (
            <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                 <div key={day} className="p-4 text-center border-r border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-[10px] uppercase tracking-widest text-slate-400">{day}</div>
               ))}
               
               {calendarDays.map((day, idx) => {
                 const { holidays, observances, events: dayEvents } = getDayContent(day);
                 const sameMonth = isSameMonth(day, currentDate);
                 const isTodayDay = isToday(day);
                 
                 return (
                   <div 
                    key={idx} 
                    className={cn(
                      "min-h-[140px] p-2 border-r border-b border-slate-100 dark:border-slate-800 transition-all group relative",
                      !sameMonth && "bg-slate-50/30 dark:bg-slate-900/30 opacity-40",
                      isTodayDay && "bg-accent/5"
                    )}
                   >
                     <div className="flex justify-between items-center mb-2">
                        <span className={cn(
                          "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all",
                          isTodayDay ? "bg-accent text-primary shadow-lg" : "text-slate-700 dark:text-slate-300"
                        )}>{day.getDate()}</span>
                     </div>

                     <div className="space-y-1 overflow-hidden">
                        {holidays.map((h, i) => (
                          <div key={i} className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[8px] font-black uppercase truncate border border-emerald-200">
                             {h.title}
                          </div>
                        ))}
                        {observances.map((o, i) => (
                          <div key={i} className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[8px] font-black uppercase truncate border border-blue-200">
                             {o.title}
                          </div>
                        ))}
                        {dayEvents.map((e: any, i) => (
                          <button 
                            key={i} 
                            onClick={() => setSelectedEvent(e)}
                            className={cn(
                              "w-full text-left px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase truncate border transition-all mb-0.5",
                              getPriorityClasses(e.priority)
                            )}
                          >
                             {e.title}
                          </button>
                        ))}
                     </div>
                   </div>
                 )
               })}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selectedEvent} onOpenChange={(val) => !val && setSelectedEvent(null)}>
        <DialogContent className="max-w-xl rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-2xl">
          {selectedEvent && (
            <div className="space-y-6">
               <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-accent text-primary font-black text-[8px] uppercase tracking-widest">{selectedEvent.category}</Badge>
                    <Badge className={cn(
                      "font-black text-[8px] uppercase tracking-widest border-none text-white",
                      selectedEvent.priority === 'High' ? "bg-red-600" :
                      selectedEvent.priority === 'Medium' ? "bg-emerald-600" :
                      "bg-blue-600"
                    )}>
                      {selectedEvent.priority} Priority
                    </Badge>
                    <Badge variant="outline" className="border-slate-100 text-[8px] uppercase font-bold">{selectedEvent.status}</Badge>
                  </div>
                  <DialogTitle className="text-3xl font-headline font-bold">{selectedEvent.title}</DialogTitle>
               </DialogHeader>

               <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100">
                    <CalendarIcon className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Date</p>
                      <p className="font-bold text-primary dark:text-white">{format(parseISO(selectedEvent.date), 'PPPP')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100">
                      <Clock className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Time</p>
                        <p className="font-bold text-primary dark:text-white">{selectedEvent.startTime || 'TBD'} — {selectedEvent.endTime || 'TBD'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100">
                      <MapPin className="w-5 h-5 text-accent" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Venue</p>
                        <p className="font-bold text-primary dark:text-white truncate">{selectedEvent.venue || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 italic text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  "{selectedEvent.description || 'No detailed narrative.'}"
               </div>

               <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <Button onClick={() => { setIsAddOpen(true); setSelectedEvent(null); }} variant="outline" className="flex-1 h-12 rounded-xl font-bold">
                    <Edit className="w-4 h-4 mr-2" /> Modify Entry
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex-1 h-12 rounded-xl font-bold">
                        <Trash2 className="w-4 h-4 mr-2" /> Purge Record
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this item? This action may be irreversible. Please confirm before continuing.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(selectedEvent.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
