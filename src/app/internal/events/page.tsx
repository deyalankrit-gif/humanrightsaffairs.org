"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { AdminNavbar } from '@/components/admin-navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  MapPin, 
  Edit, 
  Trash2, 
  Loader2, 
  Camera, 
  ExternalLink,
  ShieldCheck,
  Upload
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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
import { format } from "date-fns"
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { cn } from '@/lib/utils'

export default function InternalEventsManagement() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<any>(null)
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    category: 'Campaign' as const,
    description: '',
    imageId: 'event-legal-aid'
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const eventsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'events'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: events, loading: eventsLoading } = useCollection(eventsQuery);

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
        title: "Required Information",
        description: "Event title, date, and location are mandatory."
      });
      return;
    }

    setIsActionLoading(true)
    const data = { ...newEvent, createdAt: serverTimestamp() }

    addDoc(collection(db, 'events'), data)
      .then(() => {
        toast({ title: "Event Published", description: "The event is now live on the public gallery." })
        setNewEvent({ title: '', date: '', location: '', category: 'Campaign', description: '', imageId: 'event-legal-aid' })
        setIsAddDialogOpen(false)
        setIsActionLoading(false)
      })
      .catch(() => setIsActionLoading(false))
  }

  const handleDeleteEvent = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'events', id))
      .then(() => toast({ title: "Event Removed" }))
  }

  const handleUpdateEvent = () => {
    if (!db || !editEvent) return
    setIsActionLoading(true)
    const { id, ...data } = editEvent
    updateDoc(doc(db, 'events', id), data)
      .then(() => {
        toast({ title: "Event Updated" })
        setEditEvent(null)
        setIsActionLoading(false)
      })
      .catch(() => setIsActionLoading(false))
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  const filtered = (events || []).filter((e: any) => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.location.toLowerCase().includes(search.toLowerCase())
  )

  const categories = ["Campaign", "Workshop", "Convention", "Relief", "Social Projects"]

  const parseDateString = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? undefined : d;
    } catch {
      return undefined;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminNavbar />

      <section className="pt-32 pb-12 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-3 h-3" /> Event Governance
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Mission <span className="text-accent italic">Logistics</span></h1>
              <p className="text-slate-400">Manage organizational highlights and public campaign galleries.</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-8 flex gap-2 hover:bg-accent/90 shadow-xl shadow-accent/20">
                  <Plus className="w-5 h-5" /> Publish New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-[2rem] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Event Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <Image 
                          src={newEvent.imageId.startsWith('data:') ? newEvent.imageId : (PlaceHolderImages.find(i => i.id === newEvent.imageId)?.imageUrl || '')} 
                          alt="Preview" 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <Button variant="outline" className="w-full relative h-12 rounded-xl">
                        <Upload className="w-4 h-4 mr-2" /> Select Image
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false)} />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Event Title</Label>
                    <Input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="Event Title" className="h-12 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Event Date</Label>
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
                            selected={parseDateString(newEvent.date)}
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
                          {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} placeholder="Location" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Description..." className="rounded-xl" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddEvent} disabled={isActionLoading} className="w-full h-12 rounded-xl">
                    {isActionLoading ? <Loader2 className="animate-spin" /> : "Publish Event"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-12 border-b bg-white dark:bg-slate-900 sticky top-[72px] md:top-[84px] z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Filter by event title or location..." 
              className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {eventsLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Database...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((event: any) => (
                <Card key={event.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="relative w-full md:w-64 aspect-video md:aspect-auto overflow-hidden">
                        <Image 
                          src={event.imageId?.startsWith('data:') ? event.imageId : (PlaceHolderImages.find(i => i.id === event.imageId)?.imageUrl || 'https://picsum.photos/seed/event/800/600')} 
                          alt={event.title} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 p-8 grid lg:grid-cols-3 gap-8 items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-1">
                             <Badge variant="outline" className="border-accent text-accent text-[9px] font-bold uppercase px-2 py-0">
                                {event.category}
                             </Badge>
                             <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                               <MapPin className="w-3 h-3" /> {event.location}
                             </div>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{event.title}</h3>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <CalendarIcon className="w-3.5 h-3.5" /> {event.date}
                          </div>
                        </div>
                        
                        <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                          {event.description}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                          <Link href="/events" target="_blank">
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent/10 hover:text-accent"><ExternalLink className="w-4 h-4" /></Button>
                          </Link>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => setEditEvent(event)} variant="outline" size="icon" className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-accent/10 hover:text-accent"><Edit className="w-4 h-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-[2rem] max-h-[90vh] overflow-y-auto">
                              <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
                              {editEvent && (
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Title</Label>
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
                                            selected={parseDateString(editEvent.date)}
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
                                          {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                                  <Button onClick={handleUpdateEvent} disabled={isActionLoading} className="w-full h-12 rounded-xl">Save Changes</Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" className="rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem] bg-white dark:bg-slate-900 border-none shadow-2xl">
                              <AlertDialogHeader><AlertDialogTitle>Confirm Deletion</AlertDialogTitle></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-red-500 hover:bg-red-600 rounded-xl border-none text-white font-bold">Delete</AlertDialogAction>
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
