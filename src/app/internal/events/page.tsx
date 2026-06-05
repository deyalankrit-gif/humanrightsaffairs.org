"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
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

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Event Governance
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Mission <span className="text-accent italic">Logistics</span></h1>
              <p className="text-slate-400 text-[11px]">Manage organizational highlights and public campaign galleries.</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg">
                  <Plus className="w-4 h-4" /> Publish New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-3xl overflow-y-auto max-h-[90vh]">
                <DialogHeader><DialogTitle>New Event Record</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold">Cover Image</Label>
                    <div className="flex flex-col items-center gap-3 p-3 border-2 border-dashed rounded-xl">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100">
                        <Image src={newEvent.imageId.startsWith('data:') ? newEvent.imageId : (PlaceHolderImages.find(i => i.id === newEvent.imageId)?.imageUrl || '')} alt="Preview" fill className="object-cover" />
                      </div>
                      <Button variant="outline" size="sm" className="w-full relative h-9 rounded-lg">
                        <Upload className="w-3.5 h-3.5 mr-2" /> Select Image
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false)} />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Title</Label><Input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="h-10 rounded-lg text-sm" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <Label className="text-[10px] uppercase font-bold">Date</Label>
                       <Input type="text" placeholder="Jan 1, 2025" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="h-10 rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold">Category</Label>
                      <Select value={newEvent.category} onValueChange={(val: any) => setNewEvent({...newEvent, category: val})}>
                        <SelectTrigger className="h-10 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter><Button onClick={handleAddEvent} className="w-full h-11 rounded-xl">Publish Event</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Filter by title or location..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {eventsLoading ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((event: any) => (
                <Card key={event.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="relative w-full md:w-48 aspect-video md:aspect-auto overflow-hidden shrink-0">
                        <Image src={event.imageId?.startsWith('data:') ? event.imageId : (PlaceHolderImages.find(i => i.id === event.imageId)?.imageUrl || 'https://picsum.photos/seed/event/800/600')} alt={event.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 p-5 grid lg:grid-cols-3 gap-6 items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-0.5">
                             <Badge variant="outline" className="border-accent text-accent text-[8px] font-bold uppercase px-1.5 py-0">{event.category}</Badge>
                             <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold uppercase"><MapPin className="w-2.5 h-2.5" /> {event.location}</div>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{event.title}</h3>
                          <div className="text-[10px] font-bold text-slate-500">{event.date}</div>
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-2 italic">"{event.description}"</div>
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild><Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200"><Edit className="w-3.5 h-3.5" /></Button></DialogTrigger>
                            <DialogContent className="max-w-md rounded-3xl"><DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
                              <Button onClick={handleUpdateEvent} className="w-full h-11 rounded-xl">Save Changes</Button>
                            </DialogContent>
                          </Dialog>
                          <Button variant="destructive" size="icon" onClick={() => handleDeleteEvent(event.id)} className="h-8 w-8 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></Button>
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
