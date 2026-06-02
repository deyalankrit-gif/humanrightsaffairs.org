
"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Calendar, MapPin, Search, Filter, ArrowRight, Camera, Plus, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

type Event = {
  id: string
  title: string
  date: string
  location: string
  category: "Campaign" | "Workshop" | "Convention" | "Relief"
  imageId?: string
  description: string
}

export default function EventsPage() {
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [isActionLoading, setIsActionLoading] = useState(false)
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const isAdmin = user?.email === 'deydhritiman@gmail.com'

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
    category: 'Campaign',
    description: '',
    imageId: 'event-legal-aid'
  })

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) return
    setIsActionLoading(true)
    try {
      await addDoc(collection(db, 'events'), {
        ...newEvent,
        createdAt: serverTimestamp()
      })
      toast({ title: "Event Created", description: "The new event has been added to the gallery." })
      setNewEvent({ title: '', date: '', location: '', category: 'Campaign', description: '', imageId: 'event-legal-aid' })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id))
      toast({ title: "Event Deleted" })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    }
  }

  const handleUpdateEvent = async () => {
    if (!editEvent) return
    setIsActionLoading(true)
    try {
      const { id, ...data } = editEvent
      await updateDoc(doc(db, 'events', id), data)
      toast({ title: "Event Updated" })
      setEditEvent(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const events = (firestoreEvents || []) as Event[]
  const filteredEvents = events.filter(e => 
    (filter === "All" || e.category === filter) &&
    (e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase()))
  )

  const categories = ["All", "Campaign", "Workshop", "Convention", "Relief"]

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="pt-40 pb-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="bg-accent text-primary font-bold mb-6 px-4 py-1">Mission Impact</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">Our <span className="text-accent italic">Event</span> Gallery</h1>
            <p className="text-xl text-indigo-100 leading-relaxed mb-8">
              Witness the journey of JusticeShield as we traverse the length and breadth of India to protect, educate, and empower.
            </p>

            {isAdmin && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-10 flex gap-2 hover:bg-accent/90 shadow-2xl shadow-accent/20 mx-auto">
                    <Plus className="w-6 h-6" /> Create New Event Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle>New Event Entry</DialogTitle>
                    <DialogDescription>Add a new highlight to the mission gallery.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Event Title</Label>
                      <Input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g. Legal Aid Camp" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} placeholder="March 15, 2024" />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={newEvent.category} onValueChange={(val: any) => setNewEvent({...newEvent, category: val})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} placeholder="Kolkata, WB" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Brief details about the event impact..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddEvent} disabled={isActionLoading} className="w-full h-12 rounded-xl">
                      {isActionLoading ? <Loader2 className="animate-spin" /> : "Publish Event"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-slate-200 sticky top-[72px] md:top-[84px] z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={filter === cat ? "default" : "outline"}
                  onClick={() => setFilter(cat)}
                  className={`rounded-full px-6 ${filter === cat ? 'bg-primary text-white' : 'hover:border-accent hover:text-accent'}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search events or locations..." 
                className="pl-10 h-12 rounded-full border-slate-200"
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
                  const img = PlaceHolderImages.find(i => i.id === event.imageId)
                  return (
                    <Card key={event.id} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white relative">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image 
                          src={img?.imageUrl || 'https://picsum.photos/seed/event/800/600'} 
                          alt={event.title} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/90 backdrop-blur-md text-primary font-bold shadow-lg">
                            {event.category}
                          </Badge>
                        </div>

                        {isAdmin && (
                          <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button onClick={() => setEditEvent(event)} size="icon" className="bg-white/90 hover:bg-white text-primary rounded-full shadow-lg">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md bg-white rounded-[2rem]">
                                <DialogHeader>
                                  <DialogTitle>Modify Event</DialogTitle>
                                </DialogHeader>
                                {editEvent && (
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Event Title</Label>
                                      <Input value={editEvent.title} onChange={e => setEditEvent({...editEvent, title: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input value={editEvent.date} onChange={e => setEditEvent({...editEvent, date: e.target.value})} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={editEvent.category} onValueChange={(val: any) => setEditEvent({...editEvent, category: val})}>
                                          <SelectTrigger><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                            {categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Location</Label>
                                      <Input value={editEvent.location} onChange={e => setEditEvent({...editEvent, location: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Description</Label>
                                      <Textarea value={editEvent.description} onChange={e => setEditEvent({...editEvent, description: e.target.value})} />
                                    </div>
                                    <Button onClick={handleUpdateEvent} className="w-full mt-4 h-12 rounded-xl">Save Changes</Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" className="bg-red-500/90 hover:bg-red-500 text-white rounded-full shadow-lg">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2rem]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently remove this event from the public gallery.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                      <CardHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4 text-xs font-bold text-accent uppercase tracking-widest mb-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                        </div>
                        <CardTitle className="text-2xl font-headline font-bold text-primary group-hover:text-accent transition-colors">
                          {event.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 pt-4">
                        <p className="text-slate-500 text-sm leading-relaxed">
                          {event.description}
                        </p>
                      </CardContent>
                      <CardFooter className="p-8 pt-0 border-t border-slate-50 mt-auto">
                        <Button variant="ghost" className="p-0 h-auto font-bold text-primary hover:text-accent flex items-center gap-2 group/btn">
                          View Event Details <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })
              ) : (
                <div className="col-span-full py-32 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Camera className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-primary">No events found</h3>
                  <p className="text-slate-500">Try adjusting your filters or search terms.</p>
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
