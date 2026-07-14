
"use client"

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  Calendar as CalendarIcon,
  Loader2,
  FileDown,
  Bell,
  Clock,
  MapPin,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, doc } from 'firebase/firestore'
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
import { ReminderForm } from '@/components/activity-hub/reminder-form'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * PUBLIC ACTIVITY CALENDAR VIEW
 * A high-fidelity, read-only schedule for organizational activities.
 * Administrative controls are moved to the Internal Portal.
 */
export default function ActivityCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

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

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8,Title,Date,Category,Venue,Organizer\n" + 
      (events || []).map((e: any) => `${e.title},${e.date},${e.category},${e.venue},${e.organizer}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Activity_Calendar_${format(currentDate, 'MMM_yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
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

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <header className="pt-24 pb-6 bg-slate-900 text-white border-b-8 border-accent/20 sticky top-0 z-40 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Link href="/activity-hub">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-headline font-bold">{format(currentDate, 'MMMM yyyy')}</h1>
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Institutional Mission Schedule</p>
              </div>
           </div>

           <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
              <Button onClick={prevMonth} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10"><ChevronLeft className="w-4 h-4" /></Button>
              <Button onClick={goToToday} variant="outline" className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/10 bg-white/5 text-white hover:bg-accent hover:text-primary">Today</Button>
              <Button onClick={nextMonth} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10"><ChevronRight className="w-4 h-4" /></Button>
           </div>

           <div className="flex items-center gap-2">
              <Button onClick={exportData} variant="outline" className="h-10 rounded-xl bg-white/5 border-white/10 text-[10px] font-bold uppercase tracking-widest gap-2 hover:bg-white/10">
                <FileDown className="w-4 h-4" /> Export CSV
              </Button>
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Scheduled Date</p>
                      <p className="font-bold text-primary dark:text-white">{format(parseISO(selectedEvent.date), 'PPPP')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100">
                      <Clock className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Duration</p>
                        <p className="font-bold text-primary dark:text-white">{selectedEvent.startTime || 'TBD'} — {selectedEvent.endTime || 'TBD'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100">
                      <MapPin className="w-5 h-5 text-accent" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Venue</p>
                        <p className="font-bold text-primary dark:text-white truncate">{selectedEvent.venue || 'To Be Finalized'}</p>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 italic text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  "{selectedEvent.description || 'No detailed narrative provided for this activity entry.'}"
               </div>

               <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                  {user ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full h-12 rounded-xl font-bold gap-2">
                          <Bell className="w-4 h-4 text-purple-500" /> Set Personal Reminder
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm rounded-3xl bg-white">
                        <DialogHeader><DialogTitle>Reminder Protocol</DialogTitle></DialogHeader>
                        <ReminderForm event={selectedEvent} onSuccess={() => {}} />
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900 flex items-center gap-3">
                       <Info className="w-4 h-4 text-blue-500" />
                       <p className="text-[10px] font-bold text-blue-600 uppercase">Log in to set personal reminders for this event.</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}

