"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Search, 
  ArrowRight, 
  Camera, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Upload,
  X,
  Play,
  Film,
  Info,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type Event = {
  id: string
  title: string
  date: string
  location: string
  category: "Campaign" | "Workshop" | "Convention" | "Relief" | "Social Projects"
  imageId?: string
  description: string
}

export default function EventsPage() {
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedEventDetails, setSelectedEventDetails] = useState<Event | null>(null)
  const [isMirror, setIsMirror] = useState(false)
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const isAdmin = user?.email === 'deydhritiman@gmail.com' && isMirror

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMirror(window.self !== window.top)
    }
  }, [])

  const eventsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'events'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: firestoreEvents, loading: dataLoading } = useCollection(eventsQuery);

  const [editEvent, setEditEvent] = useState<any>(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    category: 'Campaign' as const,
    description: '',
    imageId: 'event-legal-aid'
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUri = reader.result as string
        if (isEdit) {
          setEditEvent({ ...editEvent, imageId: dataUri })
        } else {
          setNewEvent({ ...newEvent, imageId: dataUri })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddEvent = () => {
    if (!db) return;
    
    if (!newEvent.title.trim() || !newEvent.date.trim() || !newEvent.location.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in the title, date, and location before publishing."
      });
      return;
    }

    setIsActionLoading(true)
    
    const eventData = {
      ...newEvent,
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, 'events'), eventData)
      .then(() => {
        toast({ title: "Event Created", description: "The new event has been added to the gallery." })
        setNewEvent({ title: '', date: '', location: '', category: 'Campaign', description: '', imageId: 'event-legal-aid' })
        setIsAddDialogOpen(false)
        setIsActionLoading(false)
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'events',
          operation: 'create',
          requestResourceData: eventData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setIsActionLoading(false)
      })
  }

  const handleDeleteEvent = (id: string) => {
    if (!db) return;
    const docRef = doc(db, 'events', id)
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "Event Deleted" })
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
  }

  const handleUpdateEvent = () => {
    if (!db || !editEvent) return
    setIsActionLoading(true)
    const { id, ...data } = editEvent
    const docRef = doc(db, 'events', id)

    updateDoc(docRef, data)
      .then(() => {
        toast({ title: "Event Updated" })
        setEditEvent(null)
        setIsActionLoading(false)
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setIsActionLoading(false)
      })
  }

  const events = (firestoreEvents || []) as Event[]
  const filteredEvents = events.filter(e => {
    const matchesCategory = filter === "All" || e.category === filter;
    const matchesSearch = (e.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (e.location || '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  })

  const categories = ["All", "Campaign", "Workshop", "Convention", "Relief", "Social Projects"]

  const parseEventDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      return parse(dateStr, "PPP", new Date());
    } catch {
      return undefined;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-40 pb-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="bg-accent text-white font-bold mb-6 px-4 py-1 border-none">Mission Impact</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">Our <span className="text-accent italic">Event</span> Gallery</h1>
            <p className="text-xl opacity-80 leading-relaxed mb-8 text-primary-foreground">
              Witness the journey of JusticeShield as we traverse the length and breadth of India to protect, educate, and empower.
            </p>

            {isAdmin && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-white font-bold rounded-2xl h-14 px-10 flex gap-2 hover:bg-secondary hover:text-white shadow-2xl shadow-accent/20 mx-auto transform hover:scale-105 transition-all">
                    <Plus className="w-6 h-6" /> Create New Event Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-[2rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle>New Event Entry</DialogTitle>
                    <DialogDescription>Add a new highlight to the mission gallery.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Event Picture</Label>
                      <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                        {newEvent.imageId && (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                            <Image 
                              src={newEvent.imageId.startsWith('data:') ? newEvent.imageId : (PlaceHolderImages.find(i => i.id === newEvent.imageId)?.imageUrl || 'https://picsum.photos/seed/event/800/600')} 
                              alt="Preview" 
                              fill 
                              className="object-cover"
                            />
                          </div>
                        )}
                        <Button variant="outline" className="w-full relative h-12 rounded-xl">
                          <Upload className="w-4 h-4 mr-2" /> Upload Photo
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleFileChange(e, false)}
                          />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Event Title</Label>
                      <Input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g. Legal Aid Camp" className="h-12 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12 rounded-xl", !newEvent.date && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newEvent.date ? newEvent.date : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={parseEventDate(newEvent.date)}
                              onSelect={(date) => setNewEvent({...newEvent, date: date ? format(date, "PPP") : ''})}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={newEvent.category} onValueChange={(val: any) => setNewEvent({...newEvent, category: val})}>
                          <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} placeholder="Kolkata, WB" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Brief details about the event impact..." className="rounded-xl" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddEvent} disabled={isActionLoading} className="w-full h-12 rounded-xl bg-accent text-white font-bold hover:bg-secondary hover:text-white transition-all">
                      {isActionLoading ? <Loader2 className="animate-spin" /> : "Publish Event"}
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
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={filter === cat ? "default" : "outline"}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "rounded-full px-6 font-bold transition-all border-slate-200 dark:border-slate-700",
                    filter === cat 
                      ? "bg-accent text-white shadow-lg border-accent hover:bg-secondary hover:text-white" 
                      : "text-primary dark:text-slate-300 hover:bg-secondary hover:text-white hover:border-secondary transition-colors"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search events or locations..." 
                className="pl-10 h-12 rounded-full border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
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
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Gallery...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const isCustomImg = event.imageId?.startsWith('data:')
                  const img = isCustomImg ? event.imageId : PlaceHolderImages.find(i => i.id === event.imageId)?.imageUrl
                  return (
                    <Card key={event.id} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative flex flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image 
                          src={img || 'https://picsum.photos/seed/event/800/600'} 
                          alt={event.title} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/90 backdrop-blur-md text-primary font-bold shadow-lg border-none">
                            {event.category}
                          </Badge>
                        </div>

                        {isAdmin && (
                          <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button onClick={() => setEditEvent(event)} size="icon" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-secondary hover:text-white rounded-full shadow-lg border border-white/20 transition-all">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-[2rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                                <DialogHeader>
                                  <DialogTitle>Modify Event</DialogTitle>
                                </DialogHeader>
                                {editEvent && (
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Event Picture</Label>
                                      <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                                          <Image 
                                            src={editEvent.imageId?.startsWith('data:') ? editEvent.imageId : (PlaceHolderImages.find(i => i.id === editEvent.imageId)?.imageUrl || 'https://picsum.photos/seed/event/800/600')} 
                                            alt="Preview" 
                                            fill 
                                            className="object-cover"
                                          />
                                        </div>
                                        <Button variant="outline" className="w-full relative h-12 rounded-xl">
                                          <Upload className="w-4 h-4 mr-2" /> Change Photo
                                          <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => handleFileChange(e, true)}
                                          />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Event Title</Label>
                                      <Input value={editEvent.title} onChange={e => setEditEvent({...editEvent, title: e.target.value})} className="h-12 rounded-xl" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12 rounded-xl", !editEvent.date && "text-muted-foreground")}>
                                              <CalendarIcon className="mr-2 h-4 w-4" />
                                              {editEvent.date ? editEvent.date : "Pick a date"}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                              mode="single"
                                              selected={parseEventDate(editEvent.date)}
                                              onSelect={(date) => setEditEvent({...editEvent, date: date ? format(date, "PPP") : ''})}
                                              initialFocus
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={editEvent.category} onValueChange={(val: any) => setEditEvent({...editEvent, category: val})}>
                                          <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                            {categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Location</Label>
                                      <Input value={editEvent.location} onChange={e => setEditEvent({...editEvent, location: e.target.value})} className="h-12 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Description</Label>
                                      <Textarea value={editEvent.description} onChange={e => setEditEvent({...editEvent, description: e.target.value})} className="rounded-xl" />
                                    </div>
                                    <Button onClick={handleUpdateEvent} disabled={isActionLoading} className="w-full mt-4 h-12 rounded-xl bg-accent text-white font-bold hover:bg-secondary hover:text-white transition-all">
                                      {isActionLoading ? <Loader2 className="animate-spin mr-2" /> : "Save Changes"}
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" className="bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg border border-white/20 transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2rem] bg-white dark:bg-slate-900 border-none shadow-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently remove this event from the public gallery.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex justify-end gap-3 mt-4">
                                  <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-red-500 hover:bg-red-600 rounded-xl border-none text-white font-bold transition-all">Delete</AlertDialogAction>
                                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                      <CardHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4 text-xs font-bold text-accent uppercase tracking-widest mb-3">
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {event.date}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                        </div>
                        <CardTitle className="text-2xl font-headline font-bold text-primary dark:text-white group-hover:text-secondary transition-colors leading-tight">
                          {event.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 pt-4">
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                          {event.description}
                        </p>
                      </CardContent>
                      <CardFooter className="p-8 pt-0 border-t border-slate-50 dark:border-slate-800 mt-auto">
                        <Button 
                          variant="ghost" 
                          onClick={() => setSelectedEventDetails(event)}
                          className="p-0 h-auto font-bold text-primary dark:text-white hover:text-secondary flex items-center gap-2 group/btn transition-colors hover:bg-transparent"
                        >
                          View Event Details <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })
              ) : (
                <div className="col-span-full py-32 text-center">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
                    <Camera className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-primary dark:text-white">No events found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Detailed Event Modal */}
      <Dialog open={!!selectedEventDetails} onOpenChange={(open) => !open && setSelectedEventDetails(null)}>
        <DialogContent className="max-w-5xl p-0 border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 flex flex-col [&>button]:hidden max-h-[90vh]">
          <div className="absolute right-6 top-6 z-50">
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-blue-600 hover:bg-blue-500 text-white h-10 w-10 shadow-xl border-2 border-white/20 transition-all hover:scale-110 hover:rotate-90 duration-300 active:scale-95"
              >
                <X className="w-6 h-6 text-white" />
              </Button>
            </DialogClose>
          </div>

          {selectedEventDetails && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col">
                <div className="relative bg-gradient-to-br from-secondary via-primary to-accent p-12 md:p-20 text-white overflow-hidden border-b-8 border-accent/20">
                  <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-[-20px]">
                    <ShieldCheck className="w-64 h-64 md:w-96 md:h-96" />
                  </div>
                  <div className="relative z-10 space-y-4 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                      <Camera className="w-4 h-4 text-accent" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{selectedEventDetails.category} Profile</span>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-headline font-bold leading-tight drop-shadow-xl">
                      {selectedEventDetails.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-6 pt-4 text-white/80 font-bold uppercase tracking-widest text-xs md:text-sm">
                      <span className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-accent" /> {selectedEventDetails.date}</span>
                      <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-accent" /> {selectedEventDetails.location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-16 space-y-16 pb-24">
                  {/* Narrative Section */}
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                       <span className="w-8 h-px bg-accent"></span> Mission Narrative
                    </h3>
                    <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-body font-medium italic border-l-4 border-accent pl-6">
                      "{selectedEventDetails.description}"
                    </p>
                  </div>

                  {/* High-Fidelity Gallery (3 Images) */}
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary dark:text-white flex items-center gap-2">
                       <Camera className="w-4 h-4 text-emerald-500" /> Captured Moments
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((idx) => (
                        <div key={idx} className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white dark:border-slate-800 transition-all hover:scale-[1.02] hover:shadow-2xl">
                          <Image 
                            src={`https://picsum.photos/seed/event-${selectedEventDetails.id}-${idx}/600/800`} 
                            alt={`Gallery ${idx}`} 
                            fill 
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                            <p className="text-white text-xs font-bold uppercase tracking-widest leading-tight">
                               {idx === 1 && "On-ground Engagement"}
                               {idx === 2 && "Legal Literacy Workshop"}
                               {idx === 3 && "Community Outreach Session"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Feature Section */}
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary dark:text-white flex items-center gap-2">
                       <Film className="w-4 h-4 text-red-500" /> Mission Highlights (Video)
                    </h3>
                    <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group">
                      <Image 
                        src={`https://picsum.photos/seed/event-vid-${selectedEventDetails.id}/1200/675`} 
                        alt="Video Thumbnail" 
                        fill 
                        className="object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                         <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border-4 border-white/40 group-hover:scale-110 transition-transform cursor-pointer shadow-2xl">
                           <Play className="w-10 h-10 text-white fill-white ml-1" />
                         </div>
                         <p className="text-white font-black uppercase tracking-[0.3em] text-sm drop-shadow-lg">Watch Official Footage</p>
                      </div>
                      <div className="absolute bottom-6 left-6 right-6 p-6 bg-primary/40 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Documentary: {selectedEventDetails.title} (2025)</p>
                         </div>
                         <ExternalLink className="w-4 h-4 text-white/60" />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer Controls */}
                  <div className="pt-12 flex flex-col gap-4 items-center">
                    <Button 
                      size="lg" 
                      onClick={() => setSelectedEventDetails(null)}
                      className="w-full bg-primary text-primary-foreground font-bold h-16 rounded-2xl text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-primary/20 group"
                    >
                      Close Page
                    </Button>
                    
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-4">
                      Official Mission Record • Human Rights Affairs Trust
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
