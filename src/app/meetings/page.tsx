
"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Footer } from '@/components/footer'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Handshake, 
  FileText, 
  Users, 
  Loader2,
  Info,
  ExternalLink,
  Globe,
  Plus,
  Calendar as CalendarIcon,
  Sparkles,
  ShieldCheck,
  Award,
  Edit,
  Trash2,
  CircleCheck,
  X,
  BadgeCheck,
  User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, parse } from "date-fns"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { INDIA_DATA } from '@/lib/india-data'
import { PlaceHolderImages } from '@/lib/placeholder-images'

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
  districtName?: string
  status: "Upcoming" | "Completed" | "Postponed"
  attendees?: string[]
}

type Leader = {
  id: string
  name: string
  title: string
  imageId?: string
  gender: 'male' | 'female'
  level: "Central" | "State" | "District"
  parentRegion?: string 
  districtName?: string
}

export default function MeetingsPage() {
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [isMirror, setIsMirror] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])
  const [selectedLeaderProfile, setSelectedLeaderProfile] = useState<Leader | null>(null)
  const [editMeeting, setEditMeeting] = useState<any>(null)
  
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const isAdmin = user?.email === 'deydhritiman@gmail.com' && isMirror

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '09:00 AM',
    location: '',
    agenda: '',
    level: 'National' as 'National' | 'State' | 'District',
    stateName: '',
    districtName: '',
    status: 'Upcoming' as const
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMirror(window.self !== window.top)
    }
  }, [])

  const meetingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'meetings'), orderBy('createdAt', 'desc'));
  }, [db]);

  const leadersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'leadership'), orderBy('name', 'asc'));
  }, [db]);

  const { data: meetings, loading: dataLoading } = useCollection(meetingsQuery);
  const { data: leadersData } = useCollection(leadersQuery);

  const leaders = (leadersData || []) as Leader[]

  const sortedLeaders = React.useMemo(() => {
    if (!leaders) return [];
    return [...leaders].sort((a: any, b: any) => {
      const levelRank: Record<string, number> = { 'Central': 3, 'State': 2, 'District': 1 };
      const rankA = levelRank[a.level] || 0;
      const rankB = levelRank[b.level] || 0;
      
      if (rankA !== rankB) return rankB - rankA;
      
      const isHighA = (a.title || '').includes('Chairman') || (a.title || '').includes('Founder');
      const isHighB = (b.title || '').includes('Chairman') || (b.title || '').includes('Founder');
      if (isHighA && !isHighB) return -1;
      if (!isHighA && isHighB) return 1;
      
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [leaders]);

  const formatTo12h = (timeStr: string) => {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      let h = parseInt(match[1]);
      const m = match[2];
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
    }
    return timeStr;
  }

  const handleAddMeeting = async () => {
    if (!db) return
    if (!newMeeting.title || !newMeeting.date || !newMeeting.location) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Title, date, and location are required." })
      return
    }

    setIsActionLoading(true)
    try {
      await addDoc(collection(db, 'meetings'), {
        ...newMeeting,
        attendees: selectedAttendees,
        createdAt: serverTimestamp()
      })
      toast({ title: "Assembly Scheduled", description: "The meeting record has been established." })
      setNewMeeting({
        title: '', date: '', time: '09:00 AM', location: '', agenda: '',
        level: 'National', stateName: '', districtName: '', status: 'Upcoming'
      })
      setSelectedAttendees([])
      setIsAddDialogOpen(false)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdateMeeting = async () => {
    if (!db || !editMeeting) return
    setIsActionLoading(true)
    const { id, ...data } = editMeeting
    const docRef = doc(db, 'meetings', id)

    updateDoc(docRef, data)
      .then(() => {
        toast({ title: "Meeting Record Updated" })
        setEditMeeting(null)
        setIsActionLoading(false)
      })
      .catch(() => setIsActionLoading(false))
  }

  const handleDeleteMeeting = (id: string) => {
    if (!db) return
    deleteDoc(doc(db, 'meetings', id))
      .then(() => toast({ title: "Meeting Deleted" }))
  }

  const toggleAttendee = (name: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditMeeting((prev: any) => {
        const attendees = prev.attendees || [];
        const newAttendees = attendees.includes(name) 
          ? attendees.filter((a: string) => a !== name) 
          : [...attendees, name];
        return { ...prev, attendees: newAttendees };
      });
    } else {
      setSelectedAttendees(prev => 
        prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
      )
    }
  }

  const splitTime = (timeStr: string) => {
    const parts = timeStr.split(' ');
    const timeParts = parts[0]?.split(':') || ['09', '00'];
    return {
      hour: timeParts[0],
      minute: timeParts[1],
      period: parts[1] || 'AM'
    }
  }

  const TimeSelector = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const { hour, minute, period } = splitTime(value)
    const hoursArr = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
    const minutesArr = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
    
    return (
      <div className="flex items-center gap-2">
        <Select value={hour} onValueChange={(h) => onChange(`${h}:${minute} ${period}`)}>
          <SelectTrigger className="w-full h-10 rounded-lg"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-60">
            {hoursArr.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="font-bold text-slate-400">:</span>
        <Select value={minute} onValueChange={(m) => onChange(`${hour}:${m} ${period}`)}>
          <SelectTrigger className="w-full h-10 rounded-lg"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-60">
            {minutesArr.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={(p) => onChange(`${hour}:${minute} ${p}`)}>
          <SelectTrigger className="w-full h-10 rounded-lg"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  const parseMeetingDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      return parse(dateStr, "PPP", new Date());
    } catch {
      return undefined;
    }
  }

  const filteredMeetings = (meetings as Meeting[] || []).filter(m => 
    (filter === "All" || (filter === "National" ? m.level === "National" : m.level === filter)) &&
    ((m.title || '').toLowerCase().includes(search.toLowerCase()) || 
     (m.location || '').toLowerCase().includes(search.toLowerCase()) ||
     (m.stateName || '').toLowerCase().includes(search.toLowerCase()) ||
     (m.districtName || '').toLowerCase().includes(search.toLowerCase()))
  )

  const levels = [
    { label: "All Chapters", value: "All" },
    { label: "Central Council", value: "National" },
    { label: "State Level", value: "State" },
    { label: "District Level", value: "District" }
  ]

  const states = Object.keys(INDIA_DATA).sort()

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-40 pb-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-[100px]"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge className="bg-accent text-white font-bold px-4 py-1.5 uppercase tracking-widest text-xs border-none">Assembly Archives</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">General <span className="text-accent italic">Meetings</span></h1>
            <p className="text-xl opacity-80 leading-relaxed max-w-2xl mx-auto text-lg mb-8">
              Official records of our democratic decision-making processes, strategic planning, and induction assemblies.
            </p>

            {isAdmin && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-white font-bold rounded-2xl h-14 px-10 flex gap-2 hover:bg-secondary hover:text-white shadow-2xl shadow-accent/20 mx-auto transform hover:scale-105 transition-all">
                    <Plus className="w-6 h-6" /> Schedule New Assembly
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Schedule New Assembly</DialogTitle>
                    <DialogDescription>Record a new meeting or event in the public archive.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Meeting Title</Label>
                      <Input value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} placeholder="e.g. Central Council Strategic Review" className="rounded-xl h-11" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Assembly Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 rounded-xl", !newMeeting.date && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newMeeting.date ? newMeeting.date : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={parseMeetingDate(newMeeting.date)}
                              onSelect={(date) => setNewMeeting({...newMeeting, date: date ? format(date, "PPP") : ''})}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Start Time</Label>
                        <TimeSelector value={newMeeting.time} onChange={(val) => setNewMeeting({...newMeeting, time: val})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Operational Level</Label>
                        <Select value={newMeeting.level} onValueChange={(val: any) => setNewMeeting({...newMeeting, level: val, stateName: '', districtName: ''})}>
                          <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="National">Central Council</SelectItem>
                            <SelectItem value="State">State Level</SelectItem>
                            <SelectItem value="District">District Level</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Current Status</Label>
                        <Select value={newMeeting.status} onValueChange={(val: any) => setNewMeeting({...newMeeting, status: val})}>
                          <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Upcoming">Upcoming</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Postponed">Postponed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {(newMeeting.level === 'State' || newMeeting.level === 'District') && (
                      <div className="grid grid-cols-1 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-1">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-accent">Select State *</Label>
                          <Select value={newMeeting.stateName} onValueChange={(val) => setNewMeeting({...newMeeting, stateName: val, districtName: ''})}>
                            <SelectTrigger className="rounded-xl h-11 border-accent/20 bg-white dark:bg-slate-900"><SelectValue placeholder="Choose State" /></SelectTrigger>
                            <SelectContent className="max-h-60">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        {newMeeting.stateName && (newMeeting.level === 'District') && (
                          <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                            <Label className="text-[10px] uppercase font-bold text-accent">Select District *</Label>
                            <Select value={newMeeting.districtName} onValueChange={(val) => setNewMeeting({...newMeeting, districtName: val})}>
                              <SelectTrigger className="rounded-xl h-11 border-accent/20 bg-white dark:bg-slate-900"><SelectValue placeholder="Choose District" /></SelectTrigger>
                              <SelectContent className="max-h-60">{(INDIA_DATA[newMeeting.stateName] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Assembly Venue</Label>
                      <Input value={newMeeting.location} onChange={e => setNewMeeting({...newMeeting, location: e.target.value})} placeholder="Full address or Venue name" className="rounded-xl h-11" />
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-2">
                         <Users className="w-3 h-3 text-accent" /> Select Attendees (Rank Sorted)
                       </Label>
                       <div className="border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 p-4">
                          <ScrollArea className="h-40">
                             <div className="grid grid-cols-1 gap-2 pr-4">
                                {sortedLeaders.map((leader: any) => (
                                  <div key={leader.id} className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-secondary transition-colors">
                                    <Checkbox 
                                      id={`leader-${leader.id}`} 
                                      checked={selectedAttendees.includes(leader.name)}
                                      onCheckedChange={() => toggleAttendee(leader.name)}
                                      className="border-accent"
                                    />
                                    <label htmlFor={`leader-${leader.id}`} className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
                                      {leader.name} <span className="text-[8px] text-slate-400 uppercase ml-2">— {leader.title} ({leader.level})</span>
                                    </label>
                                  </div>
                                ))}
                             </div>
                          </ScrollArea>
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                             <p className="text-[9px] font-bold text-accent uppercase tracking-widest">Tagged: {selectedAttendees.length} Officials</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Primary Agenda</Label>
                      <Textarea value={newMeeting.agenda} onChange={e => setNewMeeting({...newMeeting, agenda: e.target.value})} placeholder="Key points of discussion..." className="rounded-xl min-h-[100px]" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddMeeting} disabled={isActionLoading} className="w-full bg-accent text-white font-bold h-12 rounded-xl text-lg shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all">
                      {isActionLoading ? <Loader2 className="animate-spin" /> : "Publish Official Record"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[48px] md:top-[56px] z-30 shadow-sm transition-colors">
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
                      ? "bg-accent text-white shadow-lg border-accent hover:bg-secondary hover:text-white" 
                      : "text-primary dark:text-slate-300 hover:bg-secondary hover:text-white hover:border-secondary transition-colors"
                  )}
                >
                  {lvl.label}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Input 
                placeholder="Search by title, state or venue..." 
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
                    
                    {isAdmin && (
                      <div className="absolute top-6 left-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        <Dialog open={editMeeting?.id === meeting.id} onOpenChange={(open) => !open && setEditMeeting(null)}>
                          <DialogTrigger asChild>
                            <Button onClick={() => setEditMeeting(meeting)} size="icon" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:bg-secondary hover:text-white transition-colors">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Modify Meeting Record</DialogTitle>
                            </DialogHeader>
                            {editMeeting && (
                              <div className="space-y-4 py-2">
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-bold uppercase text-slate-400">Record Title</Label>
                                  <Input value={editMeeting.title} onChange={e => setEditMeeting({...editMeeting, title: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400">Assembly Date</Label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 rounded-xl", !editMeeting.date && "text-muted-foreground")}>
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {editMeeting.date ? editMeeting.date : "Pick a date"}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                          mode="single"
                                          selected={parseMeetingDate(editMeeting.date)}
                                          onSelect={(date) => setEditMeeting({...editMeeting, date: date ? format(date, "PPP") : ''})}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400">Start Time</Label>
                                    <TimeSelector value={editMeeting.time} onChange={(val) => setEditMeeting({...editMeeting, time: val})} />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400">Chapter Level</Label>
                                    <Select value={editMeeting.level} onValueChange={(val: any) => setEditMeeting({...editMeeting, level: val})}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="National">Central Council</SelectItem>
                                        <SelectItem value="State">State Level</SelectItem>
                                        <SelectItem value="District">District Level</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400">Status</Label>
                                    <Select value={editMeeting.status} onValueChange={(val: any) => setEditMeeting({...editMeeting, status: val})}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Postponed">Postponed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                {(editMeeting.level === 'State' || editMeeting.level === 'District') && (
                                  <div className="grid grid-cols-1 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="space-y-1">
                                      <Label className="text-[10px] uppercase font-bold text-accent">Chapter State *</Label>
                                      <Select value={editMeeting.stateName} onValueChange={(val) => setEditMeeting({...editMeeting, stateName: val, districtName: ''})}>
                                        <SelectTrigger className="rounded-xl h-11 border-accent/20 bg-white dark:bg-slate-900"><SelectValue placeholder="Select State" /></SelectTrigger>
                                        <SelectContent className="max-h-60">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                      </Select>
                                    </div>
                                    {editMeeting.stateName && (editMeeting.level === 'District') && (
                                      <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-bold text-accent">Chapter District *</Label>
                                        <Select value={editMeeting.districtName} onValueChange={(val) => setEditMeeting({...editMeeting, districtName: val})}>
                                          <SelectTrigger className="rounded-xl h-11 border-accent/20 bg-white dark:bg-slate-900"><SelectValue placeholder="Select District" /></SelectTrigger>
                                          <SelectContent className="max-h-60">{(INDIA_DATA[editMeeting.stateName] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label className="text-[10px] uppercase font-bold text-slate-400">Modify Attendance</Label>
                                  <div className="border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 p-4">
                                    <ScrollArea className="h-40">
                                      <div className="grid grid-cols-1 gap-2 pr-4">
                                        {sortedLeaders.map((leader: any) => (
                                          <div key={leader.id} className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-secondary transition-colors">
                                            <Checkbox 
                                              id={`edit-leader-${leader.id}`} 
                                              checked={(editMeeting.attendees || []).includes(leader.name)}
                                              onCheckedChange={() => toggleAttendee(leader.name, true)}
                                              className="border-accent"
                                            />
                                            <label htmlFor={`edit-leader-${leader.id}`} className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
                                              {leader.name} <span className="text-[8px] text-slate-400 uppercase ml-2">— {leader.title} ({leader.level})</span>
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-[10px] font-bold uppercase text-slate-400">Revised Agenda</Label>
                                  <Textarea value={editMeeting.agenda} onChange={e => setEditMeeting({...editMeeting, agenda: e.target.value})} className="rounded-xl min-h-[100px]" />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-bold uppercase text-slate-400">Final Minutes & Resolutions</Label>
                                  <Textarea value={editMeeting.minutes} onChange={e => setEditMeeting({...editMeeting, minutes: e.target.value})} placeholder="Induct resolutions here..." className="rounded-xl min-h-[120px]" />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button onClick={handleUpdateMeeting} disabled={isActionLoading} className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold hover:bg-secondary hover:text-white transition-all">Save Official Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" className="bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 border border-white/20 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-2xl">
                            <AlertDialogHeader><AlertDialogTitle className="text-2xl font-headline font-bold">Purge Record?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogDescription className="text-base">Permanently remove this assembly record from the public archives? This action is irreversible.</AlertDialogDescription>
                            <AlertDialogFooter className="mt-6">
                              <AlertDialogCancel className="rounded-xl h-11 font-bold">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMeeting(meeting.id)} className="bg-red-500 hover:bg-red-600 rounded-xl h-11 font-bold border-none text-white transition-all">Confirm Purge</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}

                    <CardHeader className="p-8 pb-0">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="border-accent text-accent font-bold uppercase text-[10px] px-3">
                          {meeting.level === 'National' ? 'Central Council' : `${meeting.level} Council`}
                        </Badge>
                        <Badge className={cn(
                          "font-bold text-[10px] px-3",
                          meeting.status === 'Upcoming' ? 'bg-emerald-500 text-white' : 
                          meeting.status === 'Completed' ? 'bg-primary text-primary-foreground dark:text-slate-900 dark:bg-white' : 'bg-red-500 text-white'
                        )}>
                          {meeting.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-headline font-bold text-primary dark:text-white group-hover:text-secondary transition-colors leading-tight">
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
                          <span>{formatTo12h(meeting.time)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"><MapPin className="w-4 h-4 text-accent" /></div>
                          <span className="truncate">{meeting.location}</span>
                        </div>
                        
                        {(meeting.stateName || meeting.districtName) && (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-500">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                               <Globe className="w-3 h-3 text-accent" /> Jurisdictional Scope
                             </p>
                             <p className="text-lg font-headline font-bold text-accent drop-shadow-sm uppercase leading-tight">
                                {meeting.districtName ? `${meeting.districtName}, ` : ''}{meeting.stateName}
                             </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Info className="w-3 h-3" /> Agenda Summary
                         </p>
                         <p className="text-sm text-muted-foreground line-clamp-3 italic leading-relaxed">
                           "{meeting.agenda}"
                         </p>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-8 pt-0 mt-auto">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold h-12 rounded-xl group/btn hover:bg-secondary hover:text-white transition-all shadow-lg">
                            Examine Minutes <ExternalLink className="ml-2 w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl rounded-[2.5rem] bg-white dark:bg-slate-950 max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                          <div className="flex flex-col">
                            <div className="absolute right-6 top-6 z-50">
                              <DialogClose asChild>
                                <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-primary h-10 w-10 border border-slate-200 dark:border-slate-700 shadow-lg transition-all">
                                  <X className="w-6 h-6" />
                                </Button>
                              </DialogClose>
                            </div>

                            <DialogHeader className="mb-6">
                              <DialogTitle className="text-3xl font-headline font-bold text-primary dark:text-white">{meeting.title}</DialogTitle>
                              <DialogDescription className="font-bold text-accent uppercase tracking-widest text-xs">
                                {meeting.level === 'National' ? 'Central Council' : meeting.level} Assembly Breakdown
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="py-2 space-y-8">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</p>
                                    <p className="font-bold text-sm text-foreground">{meeting.date}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Time</p>
                                    <p className="font-bold text-sm text-foreground">{formatTo12h(meeting.time)}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 col-span-2 md:col-span-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Scope</p>
                                    <p className="font-bold text-sm text-foreground uppercase">{meeting.districtName ? `${meeting.districtName}, ` : ''}{meeting.stateName || 'Central Council'}</p>
                                </div>
                              </div>

                              {meeting.attendees && meeting.attendees.length > 0 && (
                                <div className="space-y-4">
                                  <h4 className="font-headline font-bold text-xl flex items-center gap-2 text-foreground">
                                    <CircleCheck className="w-5 h-5 text-accent" /> Leadership Presence
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {meeting.attendees.map((attendee, idx) => {
                                      const leaderData = leaders.find(l => l.name === attendee);
                                      return (
                                        <Badge 
                                          key={idx} 
                                          variant="secondary" 
                                          onClick={() => leaderData && setSelectedLeaderProfile(leaderData)}
                                          className={cn(
                                            "bg-accent/10 text-accent border-accent/20 px-4 py-1.5 rounded-full font-bold transition-all flex items-center gap-2",
                                            leaderData ? "cursor-pointer hover:bg-secondary hover:text-white hover:scale-105 shadow-sm" : "opacity-70"
                                          )}
                                        >
                                          <CircleCheck className={cn("w-3 h-3", leaderData ? "text-accent" : "text-slate-300")} />
                                          {attendee}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase italic tracking-tighter">Click on an official to view their verified credentials.</p>
                                </div>
                              )}

                              <div className="space-y-4">
                                <h4 className="font-headline font-bold text-xl flex items-center gap-2 text-foreground">
                                  <FileText className="w-5 h-5 text-accent" /> Meeting Agenda
                                </h4>
                                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line font-medium">
                                    {meeting.agenda}
                                  </p>
                                </div>
                              </div>

                              {meeting.minutes && (
                                <div className="space-y-4">
                                  <h4 className="font-headline font-bold text-xl flex items-center gap-2 text-foreground">
                                    <Users className="w-5 h-5 text-secondary" /> Official Minutes & Resolutions
                                  </h4>
                                  <div className="p-6 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30">
                                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-bold italic">
                                      {meeting.minutes}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
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
                  <h3 className="text-2xl font-headline font-bold text-primary dark:text-white">No assembly records identified</h3>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Verified Leader Profile Modal */}
      <Dialog open={!!selectedLeaderProfile} onOpenChange={(open) => !open && setSelectedLeaderProfile(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-950 p-0 overflow-hidden [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedLeaderProfile?.name || 'Leader Profile'}</DialogTitle>
            <DialogDescription>Verified credentials and jurisdictional details of the official.</DialogDescription>
          </DialogHeader>
          
          {selectedLeaderProfile && (
            <div className="flex flex-col">
              <div className="relative aspect-video w-full">
                 <Image 
                   src={selectedLeaderProfile.imageId?.startsWith('data:') ? selectedLeaderProfile.imageId : (PlaceHolderImages.find(i => i.id === selectedLeaderProfile.imageId)?.imageUrl || (selectedLeaderProfile.gender === 'female' ? '/dummy w.png' : '/dummy m.png'))} 
                   alt={selectedLeaderProfile.name} 
                   fill 
                   className="object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent"></div>
                 
                 <div className="absolute top-4 right-4 z-20">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSelectedLeaderProfile(null)}
                      className="rounded-full bg-blue-600 hover:bg-blue-500 text-white h-10 w-10 shadow-xl border-2 border-white/20 transition-all hover:scale-110 duration-300"
                    >
                      <X className="w-6 h-6" />
                    </Button>
                 </div>

                 <div className="absolute bottom-4 left-6 right-6 z-10 space-y-1">
                    <div className="flex items-center gap-2 bg-accent/20 backdrop-blur-md px-3 py-1 rounded-full border border-accent/30 w-fit">
                      <BadgeCheck className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent">{selectedLeaderProfile.level} Council Official</span>
                    </div>
                    <h2 className="text-2xl font-headline font-bold text-white drop-shadow-lg leading-tight">
                      {selectedLeaderProfile.name}
                    </h2>
                    <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-[10px] border-l-2 border-accent pl-3">
                      {selectedLeaderProfile.title}
                    </p>
                 </div>
              </div>
              
              <div className="p-6 space-y-4">
                 <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <MapPin className="w-4 h-4 text-accent shrink-0" />
                       <div className="flex flex-col">
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Active Jurisdiction</span>
                          <span className="text-xs font-bold text-primary dark:text-white uppercase truncate">
                             {selectedLeaderProfile.districtName ? `${selectedLeaderProfile.districtName}, ` : ''}{selectedLeaderProfile.parentRegion || 'National Center'}
                          </span>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                       <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                       <div className="flex flex-col">
                          <span className="text-[7px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Commission Status</span>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Verified HRAT Representative</span>
                       </div>
                    </div>
                 </div>

                 <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic font-medium line-clamp-2">
                      "Official representative authorized to lead strategic assemblies and coordinate community outreach programs under the direct oversight of the Central Council."
                    </p>
                 </div>

                 <Button 
                   onClick={() => setSelectedLeaderProfile(null)}
                   className="w-full bg-primary text-white font-bold h-10 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-xl shadow-primary/10 text-xs"
                 >
                   Close Record
                 </Button>

                 <p className="text-center text-[7px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                   Central Personnel Registry • Human Rights Affairs Trust
                 </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
