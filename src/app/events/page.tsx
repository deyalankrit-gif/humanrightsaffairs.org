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
  ShieldCheck,
  Video,
  Type,
  Link as LinkIcon,
  AlertTriangle,
  ShieldAlert,
  FileWarning,
  Languages
} from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'
import { Progress } from '@/components/ui/progress'
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
  category: "Campaign" | "Workshop" | "Convention" | "Relief" | "Social Projects" | "Public Welfare" | "Glimpse" | "New Office Inauguration"
  imageId?: string
  galleryImages?: string[]
  galleryCaptions?: string[]
  videoUrl?: string
  videoCaption?: string
  description: string
  descriptionBn?: string
}

export default function EventsPage() {
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedEventDetails, setSelectedEventDetails] = useState<Event | null>(null)
  const [isMirror, setIsMirror] = useState(false)
  const [videoProgress, setVideoProgress] = useState<number>(0)
  const [isVideoProcessing, setIsVideoProcessing] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [narrativeLang, setNarrativeLang] = useState<'en' | 'bn'>('en')

  // Deletion States
  const [deleteDialogStep, setDeleteDialogStep] = useState<'warning' | 'verify' | null>(null)
  const [eventToDelete, setEventToDelete] = useState<any>(null)
  const [deleteInputText, setDeleteInputText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  // Administrative actions in the mirror are strictly Root-only
  const isAdmin = user?.email === 'deydhritiman@gmail.com' && isMirror

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMirror(window.self !== window.top)
    }
  }, [])

  // Reset language preference when a new event detail is opened
  useEffect(() => {
    if (selectedEventDetails) {
      setNarrativeLang('en')
    }
  }, [selectedEventDetails])

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
    descriptionBn: '',
    imageId: 'event-legal-aid',
    galleryImages: ['', '', ''],
    galleryCaptions: ['', '', ''],
    videoUrl: '',
    videoCaption: ''
  })

  const validateProjectSize = (data: any) => {
    const size = new Blob([JSON.stringify(data)]).size;
    if (size > 800000) {
      toast({
        variant: "destructive",
        title: "Payload Capacity Exceeded",
        description: `Total size (${(size / 1024).toFixed(0)}KB) is too large. Please use YouTube/Drive links for video and smaller image files.`
      });
      return false;
    }
    return true;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean, field: 'imageId' | 'videoUrl' | 'galleryImages', index?: number) => {
    const file = e.target.files?.[0]
    if (file) {
      let cap = 153600; 
      if (field === 'videoUrl') cap = 204800; 
      if (field === 'galleryImages') cap = 102400; 
      
      if (file.size > cap) {
        toast({
          variant: "destructive",
          title: "Asset Too Heavy",
          description: `Direct storage limit is ${cap / 1024}KB. Use an external URL for larger files.`
        });
        return;
      }

      if (field === 'videoUrl') {
        setIsVideoProcessing(true)
        setVideoProgress(0)
      }

      const reader = new FileReader()
      reader.onprogress = (event) => {
        if (event.lengthComputable && field === 'videoUrl') {
          setVideoProgress(Math.round((event.loaded / event.total) * 100))
        }
      }

      reader.onloadend = () => {
        const dataUri = reader.result as string
        const update = (prev: any) => {
          if (field === 'galleryImages' && index !== undefined) {
            const newGallery = [...(prev.galleryImages || ['', '', ''])]
            newGallery[index] = dataUri
            return { ...prev, galleryImages: newGallery }
          }
          return { ...prev, [field]: dataUri }
        }

        if (isEdit) setEditEvent(update);
        else setNewEvent(update);
        
        if (field === 'videoUrl') {
          setIsVideoProcessing(false)
          setVideoProgress(0)
          toast({ title: "Asset Verified", description: "Media processed for database entry." })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddEvent = () => {
    if (!db) return;
    if (!newEvent.title.trim() || !newEvent.date.trim()) {
      toast({ variant: "destructive", title: "Incomplete Data", description: "Basic logistics are required." });
      return;
    }

    if (!validateProjectSize(newEvent)) return;

    setIsActionLoading(true)
    const eventData = { ...newEvent, createdAt: serverTimestamp() }

    addDoc(collection(db, 'events'), eventData)
      .then(() => {
        toast({ title: "Project Published", description: "Record committed to registry." })
        setNewEvent({ title: '', date: '', location: '', category: 'Campaign', description: '', descriptionBn: '', imageId: 'event-legal-aid', galleryImages: ['', '', ''], galleryCaptions: ['', '', ''], videoUrl: '', videoCaption: '' })
        setIsAddDialogOpen(false)
        setIsActionLoading(false)
      })
      .catch((err) => {
        toast({ variant: "destructive", title: "Publication Failed", description: "Database rejected the payload size. Reduce image quality." })
        setIsActionLoading(false)
      })
  }

  const handleUpdateEvent = () => {
    if (!db || !editEvent) return
    if (!validateProjectSize(editEvent)) return;

    setIsActionLoading(true)
    const { id, ...data } = editEvent
    updateDoc(doc(db, 'events', id), data)
      .then(() => {
        toast({ title: "Registry Updated" })
        setEditEvent(null)
        setIsEditDialogOpen(false)
        setIsActionLoading(false)
      })
      .catch(() => {
        toast({ variant: "destructive", title: "Sync Failed", description: "Check connection and file sizes." })
        setIsActionLoading(false)
      })
  }

  const handleDeleteEvent = async () => {
    if (!db || !eventToDelete) return
    setIsDeleting(true)
    try {
      await deleteDoc(doc(db, 'events', eventToDelete.id))
      toast({ title: "Record Purged", description: "Event has been removed from the archives." })
      setDeleteDialogStep(null)
      setEventToDelete(null)
      setDeleteInputText('')
    } catch (error: any) {
      toast({ variant: "destructive", title: "System Error" })
    } finally {
      setIsDeleting(false)
    }
  }

  const parseEventDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try { return parse(dateStr, "PPP", new Date()); } catch { return undefined; }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };

  const filteredEvents = (firestoreEvents || []).filter(e => {
    const matchesCategory = filter === "All" || e.category === filter;
    const matchesSearch = (e.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (e.location || '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  })

  const categories = ["All", "Campaign", "Workshop", "Convention", "Relief", "Social Projects", "Public Welfare", "Glimpse", "New Office Inauguration"]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-40 pb-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="bg-accent text-white font-bold mb-6 px-4 py-1 border-none uppercase tracking-widest text-[10px]">Mission Impact</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">Our <span className="text-accent italic">Event</span> Gallery</h1>
            <p className="text-xl opacity-80 leading-relaxed mb-8 text-primary-foreground">
              Official Project Profiles documenting JusticeShield activities across the nation.
            </p>

            {isAdmin && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-10 flex gap-2 hover:bg-secondary hover:text-white shadow-2xl shadow-accent/20 mx-auto transform hover:scale-105 transition-all">
                    <Plus className="w-6 h-6" /> Create New Event Entry
                  </Button>
                </DialogTrigger>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle>Project Profile Entry</DialogTitle>
                    <DialogDescription>Firestore limit is 1MB. Use External Links for high-res video.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-900 flex gap-3">
                       <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                       <div className="space-y-1">
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wider">Database Payload Warning</p>
                          <p className="text-[10px] text-amber-800 dark:text-amber-500 leading-relaxed font-bold">
                            Storing files as Base64 consumes massive database space. Please prioritize **YouTube/Drive URLs** for videos. Documents MUST be under **150KB** each.
                          </p>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-red-600">Record Title</Label>
                      <Input 
                        value={newEvent.title} 
                        onChange={e => setNewEvent(prev => ({...prev, title: e.target.value}))} 
                        placeholder="e.g. Constitutional Awareness Convention" 
                        className="h-12 rounded-xl text-lg font-black text-red-600 border-red-100 focus:ring-red-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Primary Event Picture (Max 150KB)</Label>
                      <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                        {newEvent.imageId && (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                            <Image 
                              src={newEvent.imageId?.startsWith('data:') ? newEvent.imageId : (PlaceHolderImages.find(i => i.id === newEvent.imageId)?.imageUrl || 'https://picsum.photos/seed/event/800/600')} 
                              alt="Preview" 
                              fill 
                              className="object-cover"
                            />
                          </div>
                        )}
                        <Button variant="outline" className="w-full relative h-12 rounded-xl">
                          <Upload className="w-4 h-4 mr-2" /> Upload Main Photo
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleFileChange(e, false, 'imageId')}
                          />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                       <Label className="text-xs font-bold uppercase tracking-widest text-accent">Additional Still Photos (Max 100KB Each)</Label>
                       <div className="grid grid-cols-1 gap-6">
                          {[0, 1, 2].map((idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                               <div className="relative w-full md:w-32 aspect-[3/2] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 shrink-0">
                                  {newEvent.galleryImages[idx] ? (
                                    <Image src={newEvent.galleryImages[idx]} alt={`Gallery ${idx}`} fill className="object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full"><Camera className="w-6 h-6 text-slate-300" /></div>
                                  )}
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => handleFileChange(e, false, 'galleryImages', idx)}
                                  />
                               </div>
                               <div className="flex-1 w-full space-y-2">
                                  <Label className="text-[10px] font-black uppercase text-slate-400">Photo {idx + 1} Caption</Label>
                                  <Input 
                                    placeholder="Context for this moment..." 
                                    value={newEvent.galleryCaptions[idx]} 
                                    onChange={e => {
                                      const newCaps = [...newEvent.galleryCaptions]
                                      newCaps[idx] = e.target.value
                                      setNewEvent(prev => ({...prev, galleryCaptions: newCaps}))
                                    }}
                                    className="h-10 rounded-xl"
                                  />
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <Label className="text-xs font-bold uppercase tracking-widest text-indigo-500">Mission Highlight Video</Label>
                       <div className="p-4 border-2 border-dashed rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 flex flex-col gap-4">
                          <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-full md:w-32 aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-indigo-50">
                               {newEvent.videoUrl?.startsWith('data:') ? <Video className="w-8 h-8 text-indigo-400 animate-pulse" /> : <Film className="w-6 h-6 text-indigo-200" />}
                            </div>
                            <div className="flex-1 w-full space-y-4">
                              <div className="grid grid-cols-1 gap-2">
                                <Button variant="outline" className="w-full relative h-10 rounded-xl border-indigo-200 text-indigo-600 text-xs" disabled={isVideoProcessing}>
                                  <Film className="w-3.5 h-3.5 mr-2" /> {isVideoProcessing ? "Transferring..." : "Upload Small Clip (<200KB)"}
                                  <input 
                                    type="file" 
                                    accept="video/mp4,video/webm" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => handleFileChange(e, false, 'videoUrl')}
                                    disabled={isVideoProcessing}
                                  />
                                </Button>
                                <div className="relative">
                                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                  <Input 
                                    placeholder="Preferred: High-Res Link (YouTube/Drive)" 
                                    className="pl-8 h-10 rounded-xl border-indigo-50 bg-white text-xs"
                                    value={newEvent.videoUrl?.startsWith('data:') ? '' : newEvent.videoUrl}
                                    onChange={e => setNewEvent(prev => ({...prev, videoUrl: e.target.value}))}
                                  />
                                </div>
                              </div>
                              
                              {isVideoProcessing && (
                                <div className="space-y-2 animate-in fade-in duration-500">
                                  <div className="flex justify-between items-center text-[10px] font-bold text-indigo-500 uppercase">
                                    <span>Syncing Data Stream...</span>
                                    <span>{videoProgress}%</span>
                                  </div>
                                  <Progress value={videoProgress} className="h-1.5 bg-indigo-100" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-indigo-400">Video Documentary Label</Label>
                            <Input 
                              placeholder="e.g. Ground Zero Advocacy: Chapter 1" 
                              value={newEvent.videoCaption}
                              onChange={e => setNewEvent(prev => ({...prev, videoCaption: e.target.value}))}
                              className="h-10 rounded-xl border-indigo-100"
                            />
                          </div>
                       </div>
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
                          <PopoverContent className="w-auto p-0 z-[1000001]" align="start">
                            <Calendar
                              mode="single"
                              selected={parseEventDate(newEvent.date)}
                              onSelect={(date) => setNewEvent(prev => ({...prev, date: date ? format(date, "PPP") : ''}))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={newEvent.category} onValueChange={(val: any) => setNewEvent(prev => ({...prev, category: val}))}>
                          <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent className="z-[1000001]">
                            {categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Impact Narrative (English)</Label>
                      <Textarea value={newEvent.description} onChange={e => setNewEvent(prev => ({...prev, description: e.target.value}))} placeholder="Summarize the organizational footprint..." className="rounded-xl min-h-[100px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-emerald-600 font-bold">Impact Narrative (Bengali)</Label>
                      <Textarea value={newEvent.descriptionBn} onChange={e => setNewEvent(prev => ({...prev, descriptionBn: e.target.value}))} placeholder="কার্যক্রমের বিবরণ বাংলা ভাষায় লিখুন..." className="rounded-xl min-h-[100px] border-emerald-100" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddEvent} disabled={isActionLoading || isVideoProcessing} className="w-full h-12 rounded-xl bg-accent text-primary font-bold hover:bg-secondary transition-all">
                      {isActionLoading ? <Loader2 className="animate-spin" /> : "Verify & Publish Record"}
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
                placeholder="Filter by title or venue..." 
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
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const isCustomImg = event.imageId?.startsWith('data:')
                  const img = isCustomImg ? event.imageId : PlaceHolderImages.find(i => i.id === event.imageId)?.imageUrl
                  return (
                    <Card key={event.id} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative flex flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image src={img || 'https://picsum.photos/seed/event/800/600'} alt={event.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 right-4"><Badge className="bg-white/90 backdrop-blur-md text-primary font-bold shadow-lg border-none hover:bg-white hover:text-primary transition-colors">{event.category}</Badge></div>

                        {isAdmin && (
                          <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <Dialog open={isEditDialogOpen && editEvent?.id === event.id} onOpenChange={(open) => { if(!open) { setEditEvent(null); setIsEditDialogOpen(false); } }}>
                              <DialogTrigger asChild><Button onClick={() => { setEditEvent(event); setIsEditDialogOpen(true); }} size="icon" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-secondary hover:text-white rounded-full shadow-lg border border-white/20 transition-all"><Edit className="w-4 h-4" /></Button></DialogTrigger>
                              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                                <DialogHeader><DialogTitle>Comprehensive Event Update</DialogTitle></DialogHeader>
                                {editEvent && (
                                  <div className="space-y-6 py-4">
                                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex gap-3"><AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /><p className="text-[10px] text-amber-800 font-bold uppercase">Record size capped at 1MB. Use External Links for new videos.</p></div>
                                    
                                    <div className="space-y-2">
                                      <Label className="text-xs font-black uppercase tracking-widest text-red-600">Record Title</Label>
                                      <Input 
                                        value={editEvent.title} 
                                        onChange={e => setEditEvent({...editEvent, title: e.target.value})} 
                                        className="h-12 rounded-xl text-lg font-black text-red-600 border-red-100 focus:ring-red-500" 
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Primary Picture (Max 150KB)</Label>
                                      <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                                          <Image src={editEvent.imageId?.startsWith('data:') ? editEvent.imageId : (PlaceHolderImages.find(i => i.id === editEvent.imageId)?.imageUrl || 'https://picsum.photos/seed/event/800/600')} alt="Preview" fill className="object-cover" />
                                        </div>
                                        <Button variant="outline" className="w-full relative h-12 rounded-xl"><Upload className="w-4 h-4 mr-2" /> Change Photo<input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true, 'imageId')} /></Button>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                       <Label className="text-xs font-bold uppercase tracking-widest text-accent">Additional Still Photos (Max 100KB Each)</Label>
                                       <div className="grid grid-cols-1 gap-6">
                                          {[0, 1, 2].map((idx) => (
                                            <div key={idx} className="flex flex-col md:flex-row gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100">
                                               <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 shrink-0">
                                                  {(editEvent.galleryImages || ['', '', ''])[idx] ? (
                                                    <Image src={(editEvent.galleryImages || ['', '', ''])[idx]} alt={`Gallery ${idx}`} fill className="object-cover" />
                                                  ) : (
                                                    <div className="flex items-center justify-center h-full"><Camera className="w-6 h-6 text-slate-300" /></div>
                                                  )}
                                                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true, 'galleryImages', idx)} />
                                               </div>
                                               <div className="flex-1 w-full space-y-2">
                                                  <Label className="text-[10px] font-black uppercase text-slate-400">Photo {idx + 1} Caption</Label>
                                                  <Input placeholder="Caption..." value={(editEvent.galleryCaptions || ['', '', '']) [idx]} onChange={e => { const n = [...(editEvent.galleryCaptions || ['', '', ''])]; n[idx] = e.target.value; setEditEvent({...editEvent, galleryCaptions: n}) }} className="h-10 rounded-xl" />
                                               </div>
                                            </div>
                                          ))}
                                       </div>
                                    </div>

                                    <div className="space-y-4">
                                       <Label className="text-xs font-bold uppercase tracking-widest text-indigo-500">Mission Highlight Video</Label>
                                       <div className="p-4 border-2 border-dashed rounded-2xl bg-indigo-50/30 border-indigo-100 flex flex-col gap-4">
                                          <div className="flex flex-col md:flex-row gap-4 items-center">
                                            <div className="w-full md:w-32 aspect-video bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                               {editEvent.videoUrl?.startsWith('data:') ? <Video className="w-8 h-8 text-indigo-400 animate-pulse" /> : <Film className="w-6 h-6 text-indigo-200" />}
                                            </div>
                                            <div className="flex-1 w-full space-y-2">
                                              <Button variant="outline" className="w-full relative h-10 rounded-xl border-indigo-200 text-indigo-600 text-xs" disabled={isVideoProcessing}>
                                                <Film className="w-3.5 h-3.5 mr-2" /> {isVideoProcessing ? "Processing..." : "Change Mini Clip (<200KB)"}
                                                <input type="file" accept="video/mp4,video/webm" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true, 'videoUrl')} />
                                              </Button>
                                              <div className="relative">
                                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                                <Input placeholder="YouTube/Drive URL" className="pl-8 h-10 rounded-xl border-indigo-50" value={editEvent.videoUrl?.startsWith('data:') ? '' : editEvent.videoUrl || ''} onChange={e => setEditEvent({...editEvent, videoUrl: e.target.value})} />
                                              </div>
                                            </div>
                                          </div>
                                          <Input placeholder="Video label..." value={editEvent.videoCaption || ''} onChange={e => setEditEvent({...editEvent, videoCaption: e.target.value})} className="h-10 rounded-xl border-indigo-100" />
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal h-12 rounded-xl">{editEvent.date}</Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0 z-[1000001]"><Calendar mode="single" selected={parseEventDate(editEvent.date)} onSelect={(d) => setEditEvent({...editEvent, date: d ? format(d, "PPP") : ''})} initialFocus /></PopoverContent>
                                        </Popover>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={editEvent.category} onValueChange={(v: any) => setEditEvent({...editEvent, category: v})}><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent className="z-[1000001]">{categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                                      </div>
                                    </div>
                                    <div className="space-y-2"><Label>Venue</Label><Input value={editEvent.location || ''} onChange={e => setEditEvent({...editEvent, location: e.target.value})} className="h-12 rounded-xl" /></div>
                                    <div className="space-y-2"><Label>Impact Narrative (English)</Label><Textarea value={editEvent.description} onChange={e => setEditEvent({...editEvent, description: e.target.value})} className="rounded-xl min-h-[100px]" /></div>
                                    <div className="space-y-2"><Label className="text-emerald-600 font-bold">Impact Narrative (Bengali)</Label><Textarea value={editEvent.descriptionBn} onChange={e => setEditEvent({...editEvent, descriptionBn: e.target.value})} className="rounded-xl min-h-[100px] border-emerald-100" /></div>
                                    
                                    <Button onClick={handleUpdateEvent} disabled={isActionLoading || isVideoProcessing} className="w-full mt-4 h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-secondary transition-all">{isActionLoading ? <Loader2 className="animate-spin" /> : "Save Profile Changes"}</Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              size="icon" 
                              className="bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg border border-white/20 transition-all"
                              onClick={() => { setEventToDelete(event); setDeleteDialogStep('warning'); }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <CardHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4 text-xs font-bold text-accent uppercase tracking-widest mb-3">
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {event.date}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                        </div>
                        <CardTitle className="text-2xl font-headline font-bold text-primary dark:text-white group-hover:text-secondary transition-colors leading-tight">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 pt-4"><p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{event.description}</p></CardContent>
                      <CardFooter className="p-8 pt-0 border-t border-slate-50 dark:border-slate-800 mt-auto"><Button variant="ghost" onClick={() => setSelectedEventDetails(event)} className="p-0 h-auto font-bold text-primary dark:text-white hover:text-secondary flex items-center gap-2 group/btn transition-colors hover:bg-transparent">View Event Details <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" /></Button></CardFooter>
                    </Card>
                  )
                })
              ) : (
                <div className="col-span-full py-32 text-center text-slate-300"><Camera className="w-16 h-16 mx-auto mb-4" /><h3 className="text-xl font-headline font-bold">No events recorded.</h3></div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Project Profile Modal */}
      <Dialog open={!!selectedEventDetails} onOpenChange={(open) => !open && setSelectedEventDetails(null)}>
        <DialogContent className="max-w-5xl p-0 border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 flex flex-col [&>button]:hidden max-h-[90vh]">
          <DialogHeader className="sr-only"><DialogTitle>{selectedEventDetails?.title || 'Event'}</DialogTitle><DialogDescription>Project Profile Detail</DialogDescription></DialogHeader>
          <div className="absolute right-6 top-6 z-50"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-500 text-white h-10 w-10 shadow-xl transition-all hover:scale-110 active:scale-95 duration-300"><X className="w-6 h-6 text-white" /></Button></DialogClose></div>
          {selectedEventDetails && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col">
                <div className="relative bg-gradient-to-br from-secondary via-primary to-accent p-12 md:p-20 text-white overflow-hidden border-b-8 border-accent/20">
                  <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-[-20px]"><ShieldCheck className="w-64 h-64 md:w-96 md:h-96" /></div>
                  <div className="relative z-10 space-y-4 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20"><Camera className="w-4 h-4 text-accent" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">{selectedEventDetails.category} Profile</span></div>
                    <h2 className="text-4xl md:text-7xl font-headline font-bold leading-tight drop-shadow-xl">{selectedEventDetails.title}</h2>
                    <div className="flex flex-wrap items-center gap-6 pt-4 text-white/80 font-bold uppercase tracking-widest text-xs md:text-sm"><span className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-accent" /> {selectedEventDetails.date}</span><span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-accent" /> {selectedEventDetails.location}</span></div>
                  </div>
                </div>
                <div className="p-8 md:p-16 space-y-16 pb-24">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                        <span className="w-8 h-px bg-accent"></span> Mission Narrative
                      </h3>
                      
                      {selectedEventDetails.descriptionBn && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setNarrativeLang(narrativeLang === 'en' ? 'bn' : 'en')}
                          className="h-8 rounded-lg text-[10px] font-bold uppercase gap-2 border-slate-200 hover:border-accent hover:bg-accent/5 transition-all"
                        >
                          <Languages className="w-3.5 h-3.5 text-accent" />
                          {narrativeLang === 'en' ? "বাংলায় পড়ুন" : "Switch to English"}
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-body italic border-l-4 border-accent pl-6 animate-in fade-in duration-500">
                      "{narrativeLang === 'en' ? selectedEventDetails.description : (selectedEventDetails.descriptionBn || selectedEventDetails.description)}"
                    </p>
                  </div>

                  <div className="space-y-8"><h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary dark:text-white flex items-center gap-2"><Camera className="w-4 h-4 text-emerald-500" /> Captured Moments</h3>
                    <div className="grid md:grid-cols-3 gap-6">{[0, 1, 2].map((idx) => {
                        const img = selectedEventDetails.galleryImages?.[idx] || `https://picsum.photos/seed/event-${selectedEventDetails.id}-${idx}/600/800`
                        const caption = selectedEventDetails.galleryCaptions?.[idx] || (idx === 0 ? "On-ground Engagement" : idx === 1 ? "Legal Literacy Workshop" : "Community Outreach Session")
                        return (
                          <div 
                            key={idx} 
                            onClick={() => setZoomedImage(img)}
                            className="group relative aspect-[3/2] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white dark:border-slate-800 transition-all hover:scale-[1.02] cursor-zoom-in"
                          >
                            <Image src={img} alt="Gallery" fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                              <p className="text-white text-xs font-bold uppercase tracking-widest leading-tight">{caption}</p>
                            </div>
                          </div>
                        )
                      })}</div>
                  </div>
                  <div className="space-y-8"><h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary dark:text-white flex items-center gap-2"><Film className="w-4 h-4 text-red-500" /> Mission Highlights</h3>
                    <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-100 dark:border-slate-800 bg-black group">
                      {selectedEventDetails.videoUrl ? (
                         getYouTubeEmbedUrl(selectedEventDetails.videoUrl) ? (
                           <iframe
                             src={getYouTubeEmbedUrl(selectedEventDetails.videoUrl)!}
                             className="w-full h-full border-none"
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                             allowFullScreen
                           />
                         ) : (
                           <video controls className="w-full h-full object-cover"><source src={selectedEventDetails.videoUrl} />Your browser does not support the video tag.</video>
                         )
                      ) : (<><Image src={`https://picsum.photos/seed/event-vid-${selectedEventDetails.id}/1200/675`} alt="Video" fill className="object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" /><div className="absolute inset-0 flex flex-col items-center justify-center gap-6"><div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border-4 border-white/40 group-hover:scale-110 transition-transform cursor-pointer shadow-2xl"><Play className="w-10 h-10 text-white fill-white ml-1" /></div><p className="text-white font-black uppercase tracking-[0.3em] text-sm drop-shadow-lg">Watch Official Footage</p></div></>)}
                      <div className="absolute bottom-6 left-6 right-6 p-6 bg-primary/40 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between"><div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /><p className="text-xs font-bold text-white uppercase tracking-wider">{selectedEventDetails.videoCaption || `Documentary: ${selectedEventDetails.title}`}</p></div><ExternalLink className="w-4 h-4 text-white/60" /></div>
                    </div>
                  </div>
                  <div className="pt-12 flex flex-col gap-4 items-center"><Button size="lg" onClick={() => setSelectedEventDetails(null)} className="w-full bg-primary text-primary-foreground font-bold h-16 rounded-2xl text-lg hover:bg-secondary transition-all shadow-xl shadow-primary/20">Close Profile</Button><p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-4">Official Mission Record • Human Rights Affairs Trust</p></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Expanded Photo View */}
      <Dialog open={!!zoomedImage} onOpenChange={(open) => !open && setZoomedImage(null)}>
        <DialogContent className="max-w-[90vw] md:max-w-4xl p-0 border-none bg-transparent shadow-none [&>button]:hidden z-[10000002]">
           <DialogHeader className="sr-only">
             <DialogTitle>Expanded View</DialogTitle>
             <DialogDescription>Full-sized event photograph.</DialogDescription>
           </DialogHeader>
           <div className="relative aspect-[3/2] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-900 bg-black">
              {zoomedImage && <Image src={zoomedImage} alt="Zoomed" fill className="object-contain" />}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white h-10 w-10 shadow-xl transition-all hover:scale-110"
              >
                <X className="w-6 h-6 text-white" />
              </Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Two-Stage Deletion Dialog */}
      <Dialog open={!!deleteDialogStep} onOpenChange={(open) => { if(!open) { setDeleteDialogStep(null); setEventToDelete(null); setDeleteInputText(''); } }}>
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
          {deleteDialogStep === 'warning' && (
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Registry Warning</DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 leading-relaxed font-medium">
                    You are attempting to permanently purge the mission record for <strong className="text-primary dark:text-white">{eventToDelete?.title}</strong>. This action will erase all documentation, gallery photos, and highlight videos from the archives.
                  </DialogDescription>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setDeleteDialogStep(null); setEventToDelete(null); }} className="flex-1 h-12 rounded-xl font-bold">No, Cancel</Button>
                <Button variant="destructive" onClick={() => setDeleteDialogStep('verify')} className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700">Yes, Proceed</Button>
              </div>
            </div>
          )}

          {deleteDialogStep === 'verify' && (
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                  <AlertTriangle className="w-3 h-3" /> Verification Protocol
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-xl font-headline font-bold">Confirm Deletion</DialogTitle>
                  <p className="text-sm text-slate-500">To prevent accidental data loss, please type the word <strong className="text-red-600 uppercase">delete</strong> in the field below to authorize this purge.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorization Text</Label>
                <Input 
                  placeholder="Type 'delete' here..." 
                  value={deleteInputText} 
                  onChange={(e) => setDeleteInputText(e.target.value)} 
                  className="h-12 rounded-xl border-2 focus:ring-red-500 font-bold"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => { setDeleteDialogStep(null); setEventToDelete(null); setDeleteInputText(''); }} className="flex-1 h-12 rounded-xl text-slate-400 font-bold">Abort</Button>
                <Button 
                  variant="destructive" 
                  disabled={deleteInputText.toLowerCase() !== 'delete' || isDeleting} 
                  onClick={handleDeleteEvent}
                  className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20"
                >
                  {isDeleting ? <Loader2 className="animate-spin" /> : "Purge Record"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  )
}
