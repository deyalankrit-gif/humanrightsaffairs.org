
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
  ImageIcon, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileWarning,
  Video,
  Link as LinkIcon,
  Film
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
import { format, parse } from "date-fns"
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type GalleryItem = {
  id: string
  url: string
  type: 'still' | 'video'
  videoUrl?: string
  caption: string
  category: string
  date: string
  location: string
  createdAt: any
}

export default function InternalGalleryManagement() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<GalleryItem | null>(null)
  const [videoProgress, setVideoProgress] = useState<number>(0)
  const [isVideoProcessing, setIsVideoProcessing] = useState(false)
  
  const [newItem, setNewItem] = useState({
    url: '',
    type: 'still' as 'still' | 'video',
    videoUrl: '',
    caption: '',
    category: 'Campaign',
    date: format(new Date(), "PPP"),
    location: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const galleryQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: galleryItems, loading: dataLoading } = useCollection(galleryQuery);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean, field: 'url' | 'videoUrl') => {
    const file = e.target.files?.[0]
    if (file) {
      // Conservative caps to avoid Firestore 1MB rejection
      let limit = 204800; // 200KB for photo
      if (field === 'videoUrl') limit = 307200; // 300KB for small clip
      
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
        if (isEdit && editItem) {
          setEditItem({ ...editItem, [field]: dataUri })
        } else {
          setNewItem(prev => ({ ...prev, [field]: dataUri }))
        }

        if (field === 'videoUrl') {
          setIsVideoProcessing(false)
          toast({ title: "Registry Verification", description: "Media buffered for archival storage." })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddItem = async () => {
    if (!db) return;
    if (!newItem.url || !newItem.caption) {
      toast({ variant: "destructive", title: "Incomplete Data", description: "Media (Photo/Thumbnail) and Caption are mandatory." });
      return;
    }
    if (newItem.type === 'video' && !newItem.videoUrl) {
      toast({ variant: "destructive", title: "Missing Stream", description: "Video URL or Clip is required for video entries." });
      return;
    }

    setIsActionLoading(true)
    try {
      await addDoc(collection(db, 'gallery'), {
        ...newItem,
        createdAt: serverTimestamp()
      })
      toast({ title: "Asset Archived", description: "Moment added to public gallery." })
      setNewItem({ url: '', type: 'still', videoUrl: '', caption: '', category: 'Campaign', date: format(new Date(), "PPP"), location: '' })
      setIsAddDialogOpen(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Archive Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdateItem = async () => {
    if (!db || !editItem) return
    setIsActionLoading(true)
    const { id, ...data } = editItem
    try {
      await updateDoc(doc(db, 'gallery', id), data)
      toast({ title: "Archive Updated" })
      setEditItem(null)
      setIsEditDialogOpen(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!db) return
    try {
      await deleteDoc(doc(db, 'gallery', id))
      toast({ title: "Asset Purged" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Purge Denied" })
    }
  }

  const parseItemDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try { return parse(dateStr, "PPP", new Date()); } catch { return undefined; }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (galleryItems || []).filter((item: any) => 
    item.caption?.toLowerCase().includes(search.toLowerCase()) || 
    item.location?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  )

  const categories = ["Campaign", "Workshop", "Convention", "Relief", "Social Projects", "Public Welfare", "Glimpse", "New Office Inauguration"]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30 tracking-[0.2em]">
              <ShieldCheck className="w-2.5 h-2.5" /> Visual Vault
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Gallery <span className="text-accent italic">Management</span></h1>
            <p className="text-slate-400 text-[11px]">Curate the official photographic and cinematic record of Trust activities.</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg hover:bg-secondary hover:text-white transition-all">
                <Plus className="w-4 h-4" /> Add New Moment
              </Button>
            </DialogTrigger>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle>New Archive Entry</DialogTitle>
                <DialogDescription>Firestore limit is 1MB. Use External Links for long videos.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-2">
                <div className="flex flex-col items-center gap-4">
                   <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-inner">
                      <Button 
                        type="button"
                        variant={newItem.type === 'still' ? 'default' : 'ghost'} 
                        onClick={() => setNewItem(prev => ({ ...prev, type: 'still' }))}
                        className={cn(
                          "rounded-xl h-9 px-6 font-bold text-[10px] uppercase tracking-widest transition-all",
                          newItem.type === 'still' ? "bg-accent text-white shadow-lg" : "text-slate-500 hover:text-accent"
                        )}
                      >
                        <Camera className="w-3.5 h-3.5 mr-2" /> Still Photo
                      </Button>
                      <Button 
                        type="button"
                        variant={newItem.type === 'video' ? 'default' : 'ghost'} 
                        onClick={() => setNewItem(prev => ({ ...prev, type: 'video' }))}
                        className={cn(
                          "rounded-xl h-9 px-6 font-bold text-[10px] uppercase tracking-widest transition-all",
                          newItem.type === 'video' ? "bg-accent text-white shadow-lg" : "text-slate-500 hover:text-accent"
                        )}
                      >
                        <Film className="w-3.5 h-3.5 mr-2" /> Video Highlight
                      </Button>
                   </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 flex gap-3">
                   <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                   <p className="text-[10px] text-amber-800 dark:text-amber-400 font-bold uppercase leading-relaxed">
                     Base64 bloat is significant. Documents/Thumbnails MUST stay under **150KB**. For videos, use **Direct URL Links** (YouTube/Drive).
                   </p>
                </div>

                <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                  <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border">
                    {newItem.url ? <Image src={newItem.url} alt="Preview" fill className="object-cover" /> : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-300">
                        <ImageIcon className="w-10 h-10" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{newItem.type === 'still' ? 'Main Photo' : 'Video Thumbnail'}</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false, 'url')} />
                  </div>
                  <Button variant="outline" size="sm" className="w-full relative h-9 rounded-lg hover:bg-slate-100">
                    <Upload className="w-3.5 h-3.5 mr-2" /> {newItem.type === 'still' ? 'Select Photo' : 'Select Thumbnail'}
                  </Button>
                </div>

                {newItem.type === 'video' && (
                  <div className="space-y-4 p-4 border-2 border-dashed rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-1">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="w-full md:w-32 aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-indigo-50">
                        {newItem.videoUrl?.startsWith('data:') ? <Video className="w-8 h-8 text-indigo-400 animate-pulse" /> : <Film className="w-6 h-6 text-indigo-200" />}
                      </div>
                      <div className="flex-1 w-full space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                          <Button variant="outline" className="w-full relative h-10 rounded-xl border-indigo-200 text-indigo-600 text-[10px] font-bold uppercase" disabled={isVideoProcessing}>
                            <Film className="w-3.5 h-3.5 mr-2" /> {isVideoProcessing ? "Transferring..." : "Upload Mini Clip (<300KB)"}
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
                              value={newItem.videoUrl?.startsWith('data:') ? '' : newItem.videoUrl}
                              onChange={e => setNewItem(prev => ({...prev, videoUrl: e.target.value}))}
                            />
                          </div>
                        </div>
                        
                        {isVideoProcessing && (
                          <div className="space-y-2 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center text-[9px] font-bold text-indigo-500 uppercase">
                              <span>Syncing Stream...</span>
                              <span>{videoProgress}%</span>
                            </div>
                            <Progress value={videoProgress} className="h-1 bg-indigo-100" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Caption *</Label>
                  <Input value={newItem.caption} onChange={e => setNewItem({...newItem, caption: e.target.value})} className="h-11 rounded-xl" placeholder="Describe the moment..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Category</Label>
                    <Select value={newItem.category} onValueChange={(v: any) => setNewItem({...newItem, category: v})}><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent position="popper" className="z-[1000001] bg-white">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Date</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full h-11 rounded-xl text-left font-normal">{newItem.date}</Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[1000001]"><Calendar mode="single" selected={parseItemDate(newItem.date)} onSelect={d => setNewItem({...newItem, date: d ? format(d, "PPP") : ''})} initialFocus /></PopoverContent></Popover></div>
                </div>

                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Location</Label><Input value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} className="h-11 rounded-xl" placeholder="Venue or Region" /></div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddItem} disabled={isActionLoading || isVideoProcessing} className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-secondary">
                  {isActionLoading ? <Loader2 className="animate-spin" /> : "Verify & Archive Moment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Filter visual archive..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4 max-w-4xl mx-auto">
              {filtered.map((item: any) => (
                <Card key={item.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="relative w-full md:w-48 aspect-video overflow-hidden shrink-0 border-r border-slate-100 dark:border-slate-800">
                         <Image src={item.url} alt="Thumb" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                         {item.type === 'video' && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                             <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center"><Film className="w-4 h-4 text-white" /></div>
                           </div>
                         )}
                      </div>
                      <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1 text-center md:text-left">
                           <div className="flex gap-2 mb-1">
                             <Badge variant="outline" className="text-[7px] font-bold px-1.5 py-0 uppercase border-accent text-accent">{item.category}</Badge>
                             <Badge variant="outline" className="text-[7px] font-bold px-1.5 py-0 uppercase border-slate-200 text-slate-400">{item.type}</Badge>
                           </div>
                           <h3 className="text-lg font-bold text-primary dark:text-white leading-tight">{item.caption}</h3>
                           <div className="flex items-center gap-4 mt-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                             <span className="flex items-center gap-1"><CalendarIcon className="w-2.5 h-2.5" /> {item.date}</span>
                             <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {item.location || 'Mission Ground'}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button onClick={() => { setEditItem(item); setIsEditDialogOpen(true); }} variant="outline" size="sm" className="h-8 rounded-xl text-[10px] font-bold px-4 border-slate-200">Modify</Button>
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="sm" className="h-8 w-8 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                               <AlertDialogHeader>
                                 <AlertDialogTitle>Purge moment from archive?</AlertDialogTitle>
                                 <AlertDialogDescription>This will permanently remove the record and its media from the visual registry. This action cannot be undone.</AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                 <AlertDialogAction onClick={() => handleDeleteItem(item.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">Purge Moment</AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed">
                   <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No assets identified.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle>Update Visual Record</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-6 py-2">
                <div className="flex flex-col items-center gap-4">
                   <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-inner">
                      <Button 
                        type="button"
                        variant={editItem.type === 'still' ? 'default' : 'ghost'} 
                        onClick={() => setEditItem({ ...editItem, type: 'still', videoUrl: '' })}
                        className={cn(
                          "rounded-xl h-9 px-6 font-bold text-[10px] uppercase tracking-widest transition-all",
                          editItem.type === 'still' ? "bg-accent text-white shadow-lg" : "text-slate-500 hover:text-accent"
                        )}
                      >
                        <Camera className="w-3.5 h-3.5 mr-2" /> Still Photo
                      </Button>
                      <Button 
                        type="button"
                        variant={editItem.type === 'video' ? 'default' : 'ghost'} 
                        onClick={() => setEditItem({ ...editItem, type: 'video' })}
                        className={cn(
                          "rounded-xl h-9 px-6 font-bold text-[10px] uppercase tracking-widest transition-all",
                          editItem.type === 'video' ? "bg-accent text-white shadow-lg" : "text-slate-500 hover:text-accent"
                        )}
                      >
                        <Film className="w-3.5 h-3.5 mr-2" /> Video Highlight
                      </Button>
                   </div>
                </div>

                <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                  <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border">
                    <Image src={editItem.url} alt="Preview" fill className="object-cover" />
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true, 'url')} />
                  </div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Change {editItem.type === 'still' ? 'Photo' : 'Thumbnail'}</Label>
                </div>

                {editItem.type === 'video' && (
                  <div className="space-y-4 p-4 border-2 border-dashed rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="w-full md:w-32 aspect-video bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        {editItem.videoUrl?.startsWith('data:') ? <Video className="w-8 h-8 text-indigo-400 animate-pulse" /> : <Film className="w-6 h-6 text-indigo-200" />}
                      </div>
                      <div className="flex-1 w-full space-y-4">
                        <Button variant="outline" className="w-full relative h-10 rounded-xl border-indigo-200 text-indigo-600 text-[10px] font-bold uppercase" disabled={isVideoProcessing}>
                          <Film className="w-3.5 h-3.5 mr-2" /> {isVideoProcessing ? "Transferring..." : "Change Clip (<300KB)"}
                          <input type="file" accept="video/mp4,video/webm" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true, 'videoUrl')} />
                        </Button>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                          <Input 
                            placeholder="Video Link (YouTube/Drive)" 
                            className="pl-8 h-10 rounded-xl border-indigo-50" 
                            value={editItem.videoUrl?.startsWith('data:') ? '' : editItem.videoUrl || ''} 
                            onChange={e => setEditItem({...editItem, videoUrl: e.target.value})} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Caption</Label><Input value={editItem.caption} onChange={e => setEditItem({...editItem, caption: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Category</Label>
                    <Select value={editItem.category} onValueChange={(v: any) => setEditItem({...editItem, category: v})}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent position="popper" className="z-[1000001] bg-white">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Date</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full rounded-xl text-left font-normal">{editItem.date}</Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[1000001]"><Calendar mode="single" selected={parseItemDate(editItem.date)} onSelect={d => setEditItem({...editItem, date: d ? format(d, "PPP") : ''})} initialFocus /></PopoverContent></Popover></div>
                </div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Location</Label><Input value={editItem.location} onChange={e => setEditItem({...editItem, location: e.target.value})} /></div>
                <Button onClick={handleUpdateItem} disabled={isActionLoading || isVideoProcessing} className="w-full h-12 bg-primary text-white font-bold rounded-xl mt-4">Commit Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
