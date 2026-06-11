
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
  Type,
  Link as LinkIcon,
  AlertTriangle,
  FileWarning
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

  const validateDocumentSize = (data: any) => {
    const size = new Blob([JSON.stringify(data)]).size;
    if (size > 800000) {
      toast({
        variant: "destructive",
        title: "Registry Limit Alert",
        description: `Profile size (${(size / 1024).toFixed(0)}KB) is near Firestore 1MB limit. Use External Links for Video to ensure successful archival.`
      });
      return false;
    }
    return true;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean, field: 'imageId' | 'videoUrl' | 'galleryImages', index?: number) => {
    const file = e.target.files?.[0]
    if (file) {
      // Conservative caps to avoid Firestore 1MB rejection
      let limit = 153600; // 150KB for cover
      if (field === 'videoUrl') limit = 204800; // 200KB for small clip
      if (field === 'galleryImages') limit = 102400; // 100KB for stills

      if (file.size > limit) {
        toast({
          variant: "destructive",
          title: "File Capacity Exceeded",
          description: `Direct database upload capped at ${limit/1024}KB. Use a URL link for high-res media.`
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
        const updateFunc = (prev: any) => {
          if (field === 'galleryImages' && index !== undefined) {
            const newGallery = [...(prev.galleryImages || ['', '', ''])]
            newGallery[index] = dataUri
            return { ...prev, galleryImages: newGallery }
          }
          return { ...prev, [field]: dataUri }
        }
        
        if (isEdit) setEditEvent(updateFunc);
        else setNewEvent(updateFunc);

        if (field === 'videoUrl') {
          setIsVideoProcessing(false)
          toast({ title: "Registry Verification", description: "Media buffered for archival storage." })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddEvent = () => {
    if (!db) return;
    if (!newEvent.title || !newEvent.date) {
      toast({ variant: "destructive", title: "Incomplete Log", description: "Mandatory registry fields are empty." });
      return;
    }

    if (!validateDocumentSize(newEvent)) return;

    setIsActionLoading(true)
    addDoc(collection(db, 'events'), { ...newEvent, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Event Archived" })
        setNewEvent({ title: '', date: '', location: '', category: 'Campaign', description: '', imageId: 'event-legal-aid', galleryImages: ['', '', ''], galleryCaptions: ['', '', ''], videoUrl: '', videoCaption: '' })
        setIsAddDialogOpen(false)
        setIsActionLoading(false)
      })
      .catch(() => {
        toast({ variant: "destructive", title: "Registry Error", description: "Payload size rejected by database. Use external Video links." })
        setIsActionLoading(false)
      })
  }

  const handleUpdateEvent = () => {
    if (!db || !editEvent) return
    if (!validateDocumentSize(editEvent)) return;

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
        toast({ variant: "destructive", title: "Update Rejected", description: "Record size exceeds capacity." })
        setIsActionLoading(false)
      })
  }

  const parseEventDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try { return parse(dateStr, "PPP", new Date()); } catch { return undefined; }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (events || []).filter((e: any) => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.location.toLowerCase().includes(search.toLowerCase())
  )

  const categories = ["Campaign", "Workshop", "Convention", "Relief", "Social Projects"]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1"><div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30"><ShieldCheck className="w-2.5 h-2.5" /> Registry Control</div><h1 className="text-3xl md:text-4xl font-headline font-bold">Mission <span className="text-accent italic">Archives</span></h1></div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}><DialogTrigger asChild><Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2"><Plus className="w-4 h-4" /> Publish Record</Button></DialogTrigger>
            <DialogContent className="max-w-2xl rounded-3xl overflow-y-auto max-h-[90vh] border-none shadow-2xl">
              <DialogHeader><DialogTitle>Registry Documentation</DialogTitle></DialogHeader>
              <div className="space-y-6 py-2">
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-200 flex gap-3"><FileWarning className="w-5 h-5 text-red-600 shrink-0 mt-1" /><div className="space-y-1"><p className="text-[10px] font-black uppercase text-red-600">Payload Enforcement (Firestore 1MB Limit)</p><p className="text-[9px] text-red-700 dark:text-red-400 font-bold">Base64 bloat is significant. Images MUST stay under **150KB**. For long videos, only use **Direct URL Links**.</p></div></div>
                
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Cover Image (Max 150KB)</Label><div className="flex flex-col items-center gap-3 p-3 border-2 border-dashed rounded-xl"><div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100"><Image src={newEvent.imageId.startsWith('data:') ? newEvent.imageId : (PlaceHolderImages.find(i => i.id === newEvent.imageId)?.imageUrl || '')} alt="Cover" fill className="object-cover" /></div><Button variant="outline" size="sm" className="w-full relative h-9 rounded-lg"><Upload className="w-3.5 h-3.5 mr-2" /> Select Image<input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false, 'imageId')} /></Button></div></div>

                <div className="space-y-3"><Label className="text-[10px] uppercase font-bold text-accent">Gallery Photos (Max 100KB Each)</Label><div className="grid grid-cols-1 gap-4">{[0, 1, 2].map((idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100">
                         <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed bg-white flex items-center justify-center shrink-0">{newEvent.galleryImages[idx] ? (<Image src={newEvent.galleryImages[idx]} alt="Gallery" fill className="object-cover" />) : (<Camera className="w-5 h-5 text-slate-300" />)}<input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false, 'galleryImages', idx)} /></div>
                         <div className="flex-1 w-full space-y-1"><Label className="text-[9px] font-bold text-slate-400 uppercase">Caption {idx + 1}</Label><Input placeholder="Moment context..." value={newEvent.galleryCaptions[idx]} onChange={e => { const n = [...newEvent.galleryCaptions]; n[idx] = e.target.value; setNewEvent(p => ({...p, galleryCaptions: n})) }} className="h-9 text-xs rounded-lg" /></div>
                      </div>
                    ))}</div></div>

                <div className="space-y-3 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100"><Label className="text-[10px] uppercase font-bold text-indigo-500">Mission Highlight Video (Primary Method: External Link)</Label>
                  <div className="flex flex-col gap-3"><div className="space-y-4"><div className="grid grid-cols-1 gap-2"><Button variant="outline" className="w-full relative h-10 rounded-xl border-indigo-200 text-indigo-600 border-dashed bg-white text-[10px]" disabled={isVideoProcessing}><Film className="w-3.5 h-3.5 mr-2" /> {isVideoProcessing ? "Archiving..." : "Upload Mini Clip (<200KB)"}<input type="file" accept="video/mp4,video/webm" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false, 'videoUrl')} disabled={isVideoProcessing} /></Button><div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" /><Input placeholder="Recommended: YouTube/Drive URL" className="pl-8 h-9 text-[10px] rounded-xl border-indigo-100 bg-white" value={newEvent.videoUrl?.startsWith('data:') ? '' : newEvent.videoUrl} onChange={e => setNewEvent(p => ({...p, videoUrl: e.target.value}))} /></div></div>
                      {isVideoProcessing && (<div className="space-y-2"><div className="flex justify-between items-center text-[9px] font-bold text-indigo-500 uppercase"><span>Streaming to Memory...</span><span>{videoProgress}%</span></div><Progress value={videoProgress} className="h-1 bg-indigo-100" /></div>)}</div>
                    <div className="space-y-1"><Label className="text-[9px] font-bold text-indigo-400 uppercase">Video Description</Label><Input placeholder="Video label..." value={newEvent.videoCaption} onChange={e => setNewEvent(p => ({...p, videoCaption: e.target.value}))} className="h-9 text-xs rounded-lg border-indigo-100" /></div>
                  </div></div>

                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Title</Label><Input value={newEvent.title} onChange={e => setNewEvent(p => ({...p, title: e.target.value}))} className="h-10 rounded-lg text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 rounded-lg text-sm", !newEvent.date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{newEvent.date || "Pick Date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 z-[1000001]" align="start"><Calendar mode="single" selected={parseEventDate(newEvent.date)} onSelect={(d) => setNewEvent(p => ({...p, date: d ? format(d, "PPP") : ''}))} initialFocus /></PopoverContent></Popover></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Category</Label><Select value={newEvent.category} onValueChange={(v: any) => setNewEvent(p => ({...p, category: v}))}><SelectTrigger className="h-10 rounded-lg text-xs"><SelectValue /></SelectTrigger><SelectContent position="popper" className="z-[1000001] bg-white">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Logistics Venue</Label><Input value={newEvent.location} onChange={e => setNewEvent(p => ({...p, location: e.target.value}))} className="h-10 rounded-lg" /></div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Registry Narrative</Label><Textarea value={newEvent.description} onChange={e => setNewEvent(p => ({...p, description: e.target.value}))} className="rounded-xl min-h-[100px]" /></div>
              </div>
              <DialogFooter><Button onClick={handleAddEvent} disabled={isActionLoading || isVideoProcessing} className="w-full h-11 rounded-xl bg-accent text-primary font-bold">Establish Official Entry</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm"><div className="container mx-auto px-4"><div className="relative max-w-lg"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Filter registry..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div></section>

      <section className="py-8"><div className="container mx-auto px-4">{eventsLoading ? (<div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" /></div>) : (<div className="grid gap-4">{filtered.map((e: any) => (<Card key={e.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100"><CardContent className="p-0"><div className="flex flex-col md:flex-row items-stretch"><div className="relative w-full md:w-48 aspect-video md:aspect-auto overflow-hidden shrink-0"><Image src={e.imageId?.startsWith('data:') ? e.imageId : (PlaceHolderImages.find(i => i.id === e.imageId)?.imageUrl || 'https://picsum.photos/seed/event/800/600')} alt="Thumb" fill className="object-cover" /></div><div className="flex-1 p-5 flex items-center justify-between"><div><Badge variant="outline" className="border-accent text-accent text-[8px] font-bold uppercase px-1.5 py-0">{e.category}</Badge><h3 className="text-lg font-bold leading-tight">{e.title}</h3><div className="text-[10px] font-bold text-slate-500 uppercase">{e.date}</div></div><div className="flex items-center gap-2"><Button onClick={() => { setEditEvent(e); setIsEditDialogOpen(true); }} variant="outline" size="icon" className="h-8 w-8 rounded-lg"><Edit className="w-3.5 h-3.5" /></Button><Button variant="destructive" size="icon" onClick={() => deleteDoc(doc(db, 'events', e.id))} className="h-8 w-8 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></Button></div></div></div></CardContent></Card>))}</div>)}</div></section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-3xl overflow-y-auto max-h-[90vh] border-none shadow-2xl">
          <DialogHeader><DialogTitle>Update Mission Record</DialogTitle></DialogHeader>
          {editEvent && (<div className="space-y-6 py-2">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200"><p className="text-[10px] font-bold text-amber-700 uppercase">Warning: Ensure document stays under 1MB. Use External URLs for new high-res media.</p></div>
              <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Cover Image</Label><div className="flex flex-col items-center gap-3 p-3 border-2 border-dashed rounded-xl"><div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100"><Image src={editEvent.imageId?.startsWith('data:') ? editEvent.imageId : (PlaceHolderImages.find(i => i.id === editEvent.imageId)?.imageUrl || '')} alt="Preview" fill className="object-cover" /></div><Button variant="outline" size="sm" className="w-full relative h-9 rounded-lg"><Upload className="w-3.5 h-3.5 mr-2" /> Change Image<input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true, 'imageId')} /></Button></div></div>
              <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Record Title</Label><Input value={editEvent.title} onChange={e => setEditEvent(p => ({...p, title: e.target.value}))} className="h-10 rounded-lg text-sm" /></div>
              <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Log Narrative</Label><Textarea value={editEvent.description} onChange={e => setEditEvent(p => ({...p, description: e.target.value}))} className="rounded-xl min-h-[120px]" /></div>
              <Button onClick={handleUpdateEvent} disabled={isActionLoading || isVideoProcessing} className="w-full h-11 rounded-xl bg-primary text-white font-bold transition-all">{isActionLoading ? <Loader2 className="animate-spin" /> : "Commit Changes to Registry"}</Button>
            </div>)}
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  )
}
