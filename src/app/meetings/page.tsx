"use client"

import React, { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronDown, 
  Handshake, 
  FileText, 
  Users, 
  Loader2,
  Info,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type Meeting = {
  id: string
  title: string
  date: string
  time: string
  location: string
  agenda: string
  minutes?: string
  level: "National" | "State" | "District"
  stateName?: string
  status: "Upcoming" | "Completed" | "Postponed"
}

export default function MeetingsPage() {
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const db = useFirestore()

  const meetingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'meetings'), orderBy('date', 'desc'));
  }, [db]);

  const { data: meetings, loading: dataLoading } = useCollection(meetingsQuery);

  const formatTo12Hour = (time24: string) => {
    if (!time24) return '';
    if (time24.includes('AM') || time24.includes('PM')) return time24;
    try {
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch {
      return time24;
    }
  };

  const filteredMeetings = (meetings as Meeting[] || []).filter(m => 
    (filter === "All" || m.level === filter) &&
    ((m.title || '').toLowerCase().includes(search.toLowerCase()) || (m.location || '').toLowerCase().includes(search.toLowerCase()))
  )

  const levels = [
    { label: "All Levels", value: "All" },
    { label: "National Level", value: "National" },
    { label: "State Level", value: "State" },
    { label: "District Level", value: "District" }
  ]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <section className="pt-40 pb-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-[100px]"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge className="bg-accent text-primary font-bold px-4 py-1.5 uppercase tracking-widest text-xs border-none">Organizational Assemblies</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 text-primary-foreground">General <span className="text-accent italic">Meetings</span></h1>
            <p className="text-xl opacity-80 leading-relaxed max-w-2xl mx-auto text-primary-foreground">
              A transparent record of our democratic decision-making processes, assemblies, and strategic planning sessions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[72px] md:top-[84px] z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {levels.map((lvl) => (
                <Button
                  key={lvl.value}
                  variant={filter === lvl.value ? "default" : "outline"}
                  onClick={() => setFilter(lvl.value)}
                  className={cn(
                    "rounded-full px-6 font-bold transition-all border-slate-200 dark:border-slate-700",
                    filter === lvl.value 
                      ? "bg-accent text-slate-900 shadow-lg border-accent" 
                      : "text-primary dark:text-white hover:bg-accent hover:text-slate-900 hover:border-accent"
                  )}
                >
                  {lvl.label}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Input 
                placeholder="Search by title or venue..." 
                className="pl-4 h-12 rounded-full border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Archives...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((meeting) => (
                  <Card key={meeting.id} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative flex flex-col">
                    <CardHeader className="p-8 pb-0">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="border-accent text-accent font-bold uppercase text-[10px] px-3">
                          {meeting.level} Chapter
                        </Badge>
                        <Badge className={cn(
                          "font-bold text-[10px] px-3",
                          meeting.status === 'Upcoming' ? 'bg-emerald-500 text-white' : 
                          meeting.status === 'Completed' ? 'bg-primary text-primary-foreground dark:text-slate-900 dark:bg-white' : 'bg-red-500 text-white'
                        )}>
                          {meeting.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-headline font-bold text-primary dark:text-white group-hover:text-accent transition-colors leading-tight">
                        {meeting.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-8 pt-6 space-y-4 flex-1">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"><Calendar className="w-4 h-4 text-accent" /></div>
                          <span>{meeting.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"><Clock className="w-4 h-4 text-accent" /></div>
                          <span>{formatTo12Hour(meeting.time)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"><MapPin className="w-4 h-4 text-accent" /></div>
                          <span className="truncate">{meeting.location}</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Info className="w-3 h-3" /> Agenda Preview
                         </p>
                         <p className="text-sm text-muted-foreground line-clamp-3 italic">
                           "{meeting.agenda}"
                         </p>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-8 pt-0 mt-auto">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold h-12 rounded-xl group/btn hover:bg-accent hover:text-slate-900 dark:hover:bg-accent dark:hover:text-slate-900 transition-colors">
                            View Details & Minutes <ExternalLink className="ml-2 w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl rounded-[2.5rem] bg-white dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-3xl font-headline font-bold text-primary dark:text-white">{meeting.title}</DialogTitle>
                            <DialogDescription className="font-bold text-accent uppercase tracking-widest text-xs">{meeting.level} Meeting Details</DialogDescription>
                          </DialogHeader>
                          
                          <div className="py-6 space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                               <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</p>
                                  <p className="font-bold text-sm text-foreground">{meeting.date}</p>
                               </div>
                               <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Time</p>
                                  <p className="font-bold text-sm text-foreground">{formatTo12Hour(meeting.time)}</p>
                               </div>
                               <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 col-span-2 md:col-span-1">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Venue</p>
                                  <p className="font-bold text-sm text-foreground">{meeting.location}</p>
                               </div>
                            </div>

                            <div className="space-y-4">
                               <h4 className="font-headline font-bold text-xl flex items-center gap-2 text-foreground">
                                 <FileText className="w-5 h-5 text-accent" /> Meeting Agenda
                               </h4>
                               <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                                 <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                                   {meeting.agenda}
                                 </p>
                               </div>
                            </div>

                            {meeting.minutes && (
                              <div className="space-y-4">
                                <h4 className="font-headline font-bold text-xl flex items-center gap-2 text-foreground">
                                  <Users className="w-5 h-5 text-secondary" /> Minutes & Resolutions
                                </h4>
                                <div className="p-6 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-medium italic">
                                    {meeting.minutes}
                                  </p>
                                </div>
                              </div>
                            )}

                            {!meeting.minutes && meeting.status === 'Upcoming' && (
                              <div className="bg-accent/5 p-6 rounded-3xl border border-accent/20 text-center space-y-2">
                                <p className="text-sm font-bold text-accent">Minutes pending meeting completion</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Post-meeting resolutions will be archived here.</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-32 text-center">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
                    <Handshake className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-primary dark:text-white">No meetings found</h3>
                  <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or check back later for updates.</p>
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
