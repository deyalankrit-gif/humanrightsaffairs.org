
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
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  MapPin, 
  Edit, 
  Trash2, 
  Loader2, 
  ShieldCheck,
  Upload,
  Camera,
  Film,
  Type
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parse } from "date-fns"
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<any>(null)
  const [videoProgress, setVideoProgress] = useState<number>(0)
  const [isVideoProcessing, setIsVideoProcessing] = useState(false)
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    category: 'Campaign' as const,
    description: '',
    imageId: 'event-legal-aid',
    galleryImages: ['', '', ''],
    galleryCaptions: ['', '', ''],
    videoUrl: '',
    videoCaption: ''
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean, field: 'imageId' | 'videoUrl' | 'galleryImages', index?: number) => {
    const file = e.target.files?.[0]
    if (file) {
      if (field === 'videoUrl') {
        setIsVideoProcessing(true)
        setVideoProgress(0)
      }

      const reader = new FileReader()
      
      reader.onprogress = (event) => {
        if (event.lengthComputable && field === 'videoUrl') {
          const progress = Math.round((event.loaded / event.total) * 100)
          setVideoProgress(progress)
        }
      }

      reader.onloadend = () => {
        const dataUri = reader.result as string
        if (isEdit) {
          if (field === 'galleryImages' && index !== undefined) {
            const newGallery = [...(editEvent.galleryImages || ['', '', ''])]
            newGallery[index] = dataUri
            setEditEvent({ ...editEvent, galleryImages: newGallery })
          } else {
            setEditEvent({ ...editEvent, [field]: dataUri })
          }
        } else {
          if (field === 'galleryImages' && index !== undefined) {
            const newGallery = [...newEvent.galleryImages]
            newGallery[index] = dataUri
            setNewEvent({ ...newEvent, galleryImages: newGallery })
          } else {
            setNewEvent({ ...newEvent, [field]: dataUri })
          }
        }

        if (field === 'videoUrl') {
          setIsVideoProcessing(false)
          setVideoProgress(0)
          toast({ title: "Verification Success", description: "Highlight video optimized for project profile." })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddEvent = () => {
    if (!db) return;
    if (!newEvent.title.trim() || !newEvent.date.trim() || !newEvent.location.trim()) {
      toast({ variant: "destructive", title: "Required Info", description: "Title, date, and location are mandatory." });
      return;
    }

    setIsActionLoading(true)
    addDoc(collection(db, 'events'), { ...newEvent, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Event Published" })
        setNewEvent({ title: '', date: '', location: '', category: 'Campaign', description: '', imageId: 'event-legal-aid', galleryImages: ['', '', ''], galleryCaptions: ['', '', ''], videoUrl: '', videoCaption: '' })
        setIsAddDialogOpen(false)
        setIsActionLoading(false)
      })
      .catch(() => setIsActionLoading(false))
  }

  const handleDeleteEvent = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'events', id)).then(() => toast({ title: "Event Removed" }))
  }

  const handleUpdateEvent = () => {
    if (!db || !editEvent) return
    setIsActionLoading(true)
    const { id, ...data } = editEvent
    updateDoc(doc(db, 'events', id), data)
      .then(() => {
        toast({ title: "Event Updated" })
        setEditEvent(null)
        setIsEditDialogOpen(false)
        setIsActionLoading(false)
      })
      .catch(() => setIsActionLoading(false))
  }

  const parseEventDate = (dateStr: string) => {
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
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Event Governance
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Mission <span className="text-accent italic">Logistics</span></h1>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild><Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg"><Plus className="w-4 h-4" /> Publish New Event</Button></DialogTrigger>
              <DialogContent className="max-w-2xl rounded-3xl overflow-y-auto max-h-[90vh] border-none shadow-2xl">
                <DialogHeader><DialogTitle>New Full Project Profile</DialogTitle></DialogHeader>
                <div className="space-y-6 py-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Main Event Image</Label>
                    <div className="flex flex-col items-center gap-3 p-3 border-2 border-dashed rounded-xl">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100">
                        <Image src={newEvent.imageId.startsWith('data:') ? newEvent.imageId : (PlaceHolderImages.find(i => i.id === newEvent.imageId)?.imageUrl || '')} alt="Preview" fill className="object-cover" />
                      </div>
                      <Button variant="outline" size="sm" className="w-full relative h-9 rounded-lg"><Upload className="w-3.5 h-3.5 mr-2" /> Select Image<input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false, 'imageId')} /></Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                     <Label className="text-[10px] uppercase font-bold text-accent">Additional Still Photos & Captions</Label>
                     <div className="grid grid-cols-1 gap-4">
                        {[0, 1, 2].map((idx) => (
                          <div key={idx} className="flex flex-col md:flex-row gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed bg-white flex items-center justify-center shrink-0">
                                {newEvent.galleryImages[idx] ? (
                                  <Image src={newEvent.galleryImages[idx]} alt="Gallery" fill className="object-cover" />
                                ) : (
                                  <Camera className="w-5 h-5 text-slate-300" />
                                )}
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false, 'galleryImages', idx)} />
                             </div>
                             <div className="flex-1 w-full space-y-1">
                                <Label className="text-[9px] font-bold text-slate-400 uppercase">Caption {idx + 1}</Label>
                                <Input 
                                  placeholder="Describe this moment..." 
                                  value={newEvent.galleryCaptions[idx]} 
                                  onChange={e => {
                                    const newCaps = [...newEvent.galleryCaptions]
                                    newCaps[idx] = e.target.value
                                    setNewEvent({...newEvent, galleryCaptions: newCaps})
                                  }}
                                  className="h-9 text-xs rounded-lg"
                                />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                     <Label className="text-[10px] uppercase font-bold text-indigo-500">Mission Highlight Video & Caption</Label>
                     <div className="flex flex-col gap-3">
                        <div className="space-y-4">
                          <Button variant="outline" className="w-full relative h-10 rounded-xl border-indigo-200 text-indigo-600 border-dashed bg-white" disabled={isVideoProcessing}>
                             <Film className="w-4 h-4 mr-2" /> {isVideoProcessing ? "Transferring Data..." : newEvent.videoUrl ? "Highlight Video Loaded" : "Upload Official Footage"}
                             <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false, 'videoUrl')} disabled={isVideoProcessing} />
                          </Button>

                          {isVideoProcessing && (
                            <div className="space-y-2 animate-in fade-in duration-300">
                              <div className="flex justify-between items-center text-[9px] font-bold text-indigo-500 uppercase">
                                <span>Verifying Buffer...</span>
                                <span>{videoProgress}%</span>
                              </div>
                              <Progress value={videoProgress} className="h-1 bg-indigo-100" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                           <Label className="text-[9px] font-bold text-indigo-400 uppercase">Video Description</Label>
                           <Input 
                             placeholder="Documentary label..." 
                             value={newEvent.videoCaption}
                             onChange={e => setNewEvent({...newEvent, videoCaption: e.target.value})}
                             className="h-9 text-xs rounded-lg border-indigo-100"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Title</Label><Input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="h-10 rounded-lg text-sm" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <Label className="text-[10px] uppercase font-bold">Date</Label>
                       <Popover>
                        <PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 rounded-lg text-sm", !newEvent.date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{newEvent.date ? newEvent.date : "Pick a date"}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[1000001]" align="start"><Calendar mode="single" selected={parseEventDate(newEvent.date)} onSelect={(date) => setNewEvent({...newEvent, date: date ? format(date, "PPP") : ''})} initialFocus /></PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold">Category</Label>
                      <Select value={newEvent.category} onValueChange={(val: any) => setNewEvent({...newEvent, category: val})}>
                        <SelectTrigger className="h-10 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent position="popper" className="z-[1000001] bg-white">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                     <Label className="text-[10px] uppercase font-bold">Venue Location</Label>
                     <Input value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="h-10 rounded-lg" />
                  </div>
                  <div className="space-y-1">
                     <Label className="text-[10px] uppercase font-bold">Mission Description</Label>
                     <Textarea value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="rounded-xl" />
                  </div>
                </div>
                <DialogFooter><Button onClick={handleAddEvent} disabled={isActionLoading || isVideoProcessing} className="w-full h-11 rounded-xl">Establish Official Record</Button></DialogFooter>
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
                      <div className="flex-1 p-5 flex items-center justify-between">
                        <div className="space-y-1">
                          <Badge variant="outline" className="border-accent text-accent text-[8px] font-bold uppercase px-1.5 py-0">{event.category}</Badge>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{event.title}</h3>
                          <div className="text-[10px] font-bold text-slate-500">{event.date}</div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button onClick={() => { setEditEvent(event); setIsEditDialogOpen(true); }} variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200"><Edit className="w-3.5 h-3.5" /></Button>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-3xl overflow-y-auto max-h-[90vh] border-none shadow-2xl">
          <DialogHeader><DialogTitle>Edit Event Record</DialogTitle></DialogHeader>
          {editEvent && (
            <div className="space-y-6 py-2">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400">Cover Image</Label>
                <div className="flex flex-col items-center gap-3 p-3 border-2 border-dashed rounded-xl">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100">
                    <Image src={editEvent.imageId?.startsWith('data:') ? editEvent.imageId : (PlaceHolderImages.find(i => i.id === editEvent.imageId)?.imageUrl || '')} alt="Preview" fill className="object-cover" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full relative h-9 rounded-lg"><Upload className="w-3.5 h-3.5 mr-2" /> Change Image<input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true, 'imageId')} /></Button>
                </div>
              </div>

              <div className="space-y-3">
                 <Label className="text-[10px] uppercase font-bold text-accent">Additional Still Photos & Captions</Label>
                 <div className="grid grid-cols-1 gap-4">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed bg-white flex items-center justify-center shrink-0">
                            {(editEvent.galleryImages?.[idx]) ? (
                              <Image src={editEvent.galleryImages[idx]} alt="Gallery" fill className="object-cover" />
                            ) : (
                              <Camera className="w-5 h-5 text-slate-300" />
                            )}
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true, 'galleryImages', idx)} />
                         </div>
                         <div className="flex-1 w-full space-y-1">
                            <Label className="text-[9px] font-bold text-slate-400 uppercase">Caption {idx + 1}</Label>
                            <Input 
                              placeholder="Moment description..." 
                              value={editEvent.galleryCaptions?.[idx] || ''} 
                              onChange={e => {
                                const newCaps = [...(editEvent.galleryCaptions || ['', '', ''])]
                                newCaps[idx] = e.target.value
                                setEditEvent({...editEvent, galleryCaptions: newCaps})
                              }}
                              className="h-9 text-xs rounded-lg"
                            />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                 <Label className="text-[10px] uppercase font-bold text-indigo-500">Mission Highlight Video & Caption</Label>
                 <div className="flex flex-col gap-3">
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full relative h-10 rounded-xl border-indigo-100 text-indigo-600 border-dashed bg-white" disabled={isVideoProcessing}>
                         <Film className="w-4 h-4 mr-2" /> {isVideoProcessing ? "Analyzing Footage..." : editEvent.videoUrl ? "Change Project Video" : "Upload Project Video"}
                         <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true, 'videoUrl')} disabled={isVideoProcessing} />
                      </Button>

                      {isVideoProcessing && (
                        <div className="space-y-2 animate-in fade-in duration-300">
                          <div className="flex justify-between items-center text-[9px] font-bold text-indigo-500 uppercase">
                            <span>Indexing Frames...</span>
                            <span>{videoProgress}%</span>
                          </div>
                          <Progress value={videoProgress} className="h-1 bg-indigo-100" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                       <Label className="text-[9px] font-bold text-indigo-400 uppercase">Video Description</Label>
                       <Input 
                         placeholder="Documentary caption..." 
                         value={editEvent.videoCaption || ''}
                         onChange={e => setEditEvent({...editEvent, videoCaption: e.target.value})}
                         className="h-9 text-xs rounded-lg border-indigo-100"
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Title</Label><Input value={editEvent.title} onChange={e => setEditEvent({...editEvent, title: e.target.value})} className="h-10 rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-bold">Date</Label>
                   <Popover>
                    <PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 rounded-lg text-sm", !editEvent.date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{editEvent.date || "Pick a date"}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[1000001]" align="start"><Calendar mode="single" selected={parseEventDate(editEvent.date)} onSelect={(date) => setEditEvent({...editEvent, date: date ? format(date, "PPP") : ''})} initialFocus /></PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold">Category</Label>
                  <Select value={editEvent.category} onValueChange={(val: any) => setEditEvent({...editEvent, category: val})}>
                    <SelectTrigger className="h-10 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent position="popper" className="z-[1000001] bg-white">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Venue</Label><Input value={editEvent.location} onChange={e => setEditEvent({...editEvent, location: e.target.value})} className="h-10 rounded-lg" /></div>
              <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Description</Label><Textarea value={editEvent.description} onChange={e => setEditEvent({...editEvent, description: e.target.value})} className="rounded-xl" /></div>
              <Button onClick={handleUpdateEvent} disabled={isActionLoading || isVideoProcessing} className="w-full h-11 rounded-xl">Save Official Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  )
}
