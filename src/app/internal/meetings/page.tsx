"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Clock,
  MapPin, 
  Edit, 
  Trash2, 
  Loader2, 
  ShieldCheck,
  Globe,
  Users,
  FileText
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parse } from "date-fns"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { INDIA_DATA } from '@/lib/india-data'

export default function InternalMeetingsManagement() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editMeeting, setEditMeeting] = useState<any>(null)

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    agenda: '',
    minutes: '',
    level: 'National' as 'National' | 'State' | 'District',
    stateName: '',
    districtName: '',
    status: 'Upcoming' as 'Upcoming' | 'Completed' | 'Postponed'
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const meetingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'meetings'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: meetings, loading: dataLoading } = useCollection(meetingsQuery);

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

  const convertTo24h = (timeStr: string) => {
    if (!timeStr) return '';
    if (!timeStr.includes('AM') && !timeStr.includes('PM')) return timeStr;
    const [time, ampm] = timeStr.split(' ');
    const parts = time.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  const handleAddMeeting = async () => {
    if (!db) return
    if (!newMeeting.title || !newMeeting.date || !newMeeting.location) {
      toast({ variant: "destructive", title: "Validation Error", description: "Title, date, and location are required." })
      return
    }

    setIsActionLoading(true)
    try {
      await addDoc(collection(db, 'meetings'), {
        ...newMeeting,
        time: formatTo12h(newMeeting.time), // Store as 12h
        createdAt: serverTimestamp()
      })
      toast({ title: "Assembly Scheduled", description: "The record has been published to the registry." })
      setNewMeeting({
        title: '', date: '', time: '', location: '', agenda: '', minutes: '',
        level: 'National', stateName: '', districtName: '', status: 'Upcoming'
      })
      setIsAddDialogOpen(false)
    } catch (e: any) {
      toast({ variant: "destructive", title: "System Error", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteMeeting = async (id: string) => {
    if (!db) return
    setIsActionLoading(true)
    try {
      await deleteDoc(doc(db, 'meetings', id))
      toast({ title: "Record Removed" })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdateMeeting = async () => {
    if (!db || !editMeeting) return
    setIsActionLoading(true)
    try {
      const { id, ...data } = editMeeting
      await updateDoc(doc(db, 'meetings', id), {
        ...data,
        time: formatTo12h(data.time) // Ensure 12h on update
      })
      toast({ title: "Record Updated" })
      setEditMeeting(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const parseMeetingDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      return parse(dateStr, "PPP", new Date());
    } catch {
      return undefined;
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (meetings || []).filter((m: any) => {
    const matchesSearch = (m.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
                          (m.location?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'All' || m.level === levelFilter;
    return matchesSearch && matchesLevel;
  })

  const states = Object.keys(INDIA_DATA).sort()

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Assembly Registry
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Meeting <span className="text-accent italic">Governance</span></h1>
              <p className="text-slate-400 text-[11px]">Official log of organizational assemblies and executive resolutions.</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 shadow-lg hover:bg-accent/90">
                  <Plus className="w-4 h-4 mr-2" /> Schedule Assembly
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl rounded-3xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                 <DialogHeader><DialogTitle>New Assembly</DialogTitle></DialogHeader>
                 <div className="space-y-4 py-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Title</Label>
                      <Input value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} placeholder="e.g. Annual General Body Meeting" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 rounded-lg", !newMeeting.date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newMeeting.date ? newMeeting.date : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={parseMeetingDate(newMeeting.date)}
                                onSelect={(date) => setNewMeeting({...newMeeting, date: date ? format(date, "PPP") : ''})}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                       </div>
                       <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Time (12h format)</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              type="time" 
                              className="pl-10 h-10 rounded-lg"
                              value={convertTo24h(newMeeting.time)} 
                              onChange={e => setNewMeeting({...newMeeting, time: formatTo12h(e.target.value)})} 
                            />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Level</Label>
                       <Select value={newMeeting.level} onValueChange={(val: any) => setNewMeeting({...newMeeting, level: val, stateName: '', districtName: ''})}>
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="National">National</SelectItem>
                           <SelectItem value="State">State</SelectItem>
                           <SelectItem value="District">District</SelectItem>
                         </SelectContent>
                       </Select>
                    </div>
                    {(newMeeting.level === 'State' || newMeeting.level === 'District') && (
                      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                        <div className="space-y-1">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">State</Label>
                           <Select value={newMeeting.stateName} onValueChange={(val) => setNewMeeting({...newMeeting, stateName: val, districtName: ''})}>
                             <SelectTrigger><SelectValue placeholder="Choose State" /></SelectTrigger>
                             <SelectContent className="max-h-60">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                           </Select>
                        </div>
                        {newMeeting.level === 'District' && (
                          <div className="space-y-1">
                             <Label className="text-[10px] font-bold uppercase text-slate-400">District</Label>
                             <Select value={newMeeting.districtName} onValueChange={(val) => setNewMeeting({...newMeeting, districtName: val})} disabled={!newMeeting.stateName}>
                               <SelectTrigger><SelectValue placeholder="Choose District" /></SelectTrigger>
                               <SelectContent className="max-h-60">{(INDIA_DATA[newMeeting.stateName] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                             </Select>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="space-y-1">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Location</Label>
                       <Input value={newMeeting.location} onChange={e => setNewMeeting({...newMeeting, location: e.target.value})} placeholder="Venue Details" />
                    </div>
                    <div className="space-y-1">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Agenda</Label>
                       <Textarea value={newMeeting.agenda} onChange={e => setNewMeeting({...newMeeting, agenda: e.target.value})} placeholder="Outline the discussion points..." />
                    </div>
                 </div>
                 <DialogFooter>
                   <Button onClick={handleAddMeeting} disabled={isActionLoading} className="w-full h-11 rounded-xl bg-accent text-primary font-bold hover:bg-accent/90">
                     {isActionLoading ? <Loader2 className="animate-spin mr-2" /> : "Publish Record"}
                   </Button>
                 </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {["All", "National", "State", "District"].map((lvl) => (
                <Button key={lvl} variant={levelFilter === lvl ? "default" : "ghost"} onClick={() => setLevelFilter(lvl)} className={cn("h-7 rounded-md px-4 text-[10px] font-bold uppercase", levelFilter === lvl ? "bg-accent text-primary" : "text-slate-500")}>{lvl}</Button>
              ))}
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input placeholder="Filter archives..." className="pl-8 h-9 rounded-lg border-slate-100 dark:border-slate-800 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((meeting: any) => (
                <Card key={meeting.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-5 bg-slate-50 dark:bg-slate-800 md:w-44 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                         <Badge variant="outline" className="border-accent text-accent text-[8px] font-bold uppercase px-2 py-0 mb-2">{meeting.level}</Badge>
                         <span className="text-xl font-headline font-bold leading-none mb-1 text-primary dark:text-white">{meeting.date?.split(' ')[0] || '--'}</span>
                         <span className="text-[8px] font-bold text-slate-400 uppercase">{meeting.date?.split(' ').slice(1).join(' ') || ''}</span>
                         <Badge className={cn("mt-2 text-[8px] px-2 py-0", meeting.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-accent text-primary')}>
                           {meeting.status}
                         </Badge>
                      </div>
                      <div className="flex-1 p-5 grid lg:grid-cols-4 gap-6 items-center">
                        <div className="lg:col-span-2 space-y-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{meeting.title}</h3>
                          <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-accent" /> {formatTo12h(meeting.time)}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5 text-accent" /> {meeting.location}</span>
                            {meeting.stateName && <span className="flex items-center gap-1"><Globe className="w-2.5 h-2.5 text-accent" /> {meeting.stateName}</span>}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                           <Dialog open={editMeeting?.id === meeting.id} onOpenChange={(open) => !open && setEditMeeting(null)}>
                             <DialogTrigger asChild>
                               <Button size="sm" variant="outline" onClick={() => setEditMeeting(meeting)} className="h-8 rounded-lg text-[10px] font-bold px-3">
                                 <FileText className="w-3 h-3 mr-1" /> Minutes
                               </Button>
                             </DialogTrigger>
                             <DialogContent className="max-w-xl rounded-3xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                                <DialogHeader><DialogTitle>Update Meeting Record</DialogTitle></DialogHeader>
                                {editMeeting && (
                                  <div className="space-y-4 py-2">
                                     <div className="space-y-1">
                                       <Label className="text-[10px] font-bold uppercase text-slate-400">Meeting Status</Label>
                                       <Select value={editMeeting.status} onValueChange={(val: any) => setEditMeeting({...editMeeting, status: val})}>
                                         <SelectTrigger><SelectValue /></SelectTrigger>
                                         <SelectContent>
                                           <SelectItem value="Upcoming">Upcoming</SelectItem>
                                           <SelectItem value="Completed">Completed</SelectItem>
                                           <SelectItem value="Postponed">Postponed</SelectItem>
                                         </SelectContent>
                                       </Select>
                                     </div>
                                     <div className="grid grid-cols-2 gap-4">
                                       <div className="space-y-1">
                                          <Label className="text-[10px] font-bold uppercase text-slate-400">Date</Label>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 rounded-lg", !editMeeting.date && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {editMeeting.date ? editMeeting.date : "Pick a date"}
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                              <Calendar
                                                mode="single"
                                                selected={parseMeetingDate(editMeeting.date)}
                                                onSelect={(date) => setEditMeeting({...editMeeting, date: date ? format(date, "PPP") : ''})}
                                                initialFocus
                                              />
                                            </PopoverContent>
                                          </Popover>
                                       </div>
                                       <div className="space-y-1">
                                          <Label className="text-[10px] font-bold uppercase text-slate-400">Time (12h format)</Label>
                                          <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input 
                                              type="time" 
                                              className="pl-10 h-10 rounded-lg"
                                              value={convertTo24h(editMeeting.time)} 
                                              onChange={e => setEditMeeting({...editMeeting, time: formatTo12h(e.target.value)})} 
                                            />
                                          </div>
                                       </div>
                                    </div>
                                     <div className="space-y-1">
                                       <Label className="text-[10px] font-bold uppercase text-slate-400">Official Minutes & Resolutions</Label>
                                       <Textarea 
                                         value={editMeeting.minutes} 
                                         onChange={e => setEditMeeting({...editMeeting, minutes: e.target.value})} 
                                         placeholder="Record the official outcomes..." 
                                         className="min-h-[150px]"
                                       />
                                     </div>
                                     <div className="space-y-1">
                                       <Label className="text-[10px] font-bold uppercase text-slate-400">Agenda (Review)</Label>
                                       <Textarea value={editMeeting.agenda} onChange={e => setEditMeeting({...editMeeting, agenda: e.target.value})} />
                                     </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button onClick={handleUpdateMeeting} disabled={isActionLoading} className="w-full h-11 rounded-xl bg-primary text-white font-bold hover:bg-primary/90">
                                    {isActionLoading ? <Loader2 className="animate-spin mr-2" /> : "Commit Changes"}
                                  </Button>
                                </DialogFooter>
                             </DialogContent>
                           </Dialog>

                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-3xl border-none shadow-2xl bg-white dark:bg-slate-900">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Assembly Record?</AlertDialogTitle>
                                  <AlertDialogDescription>This action will permanently remove the meeting and its associated minutes from the registry.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteMeeting(meeting.id)} className="bg-red-500 hover:bg-red-600 rounded-xl border-none text-white font-bold">Confirm Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                           </AlertDialog>
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
