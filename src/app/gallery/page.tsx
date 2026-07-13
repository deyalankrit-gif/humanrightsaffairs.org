
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Footer } from '@/components/footer'
import { 
  Camera, 
  X, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  Calendar as CalendarIcon,
  MapPin,
  BadgeCheck,
  Play,
  Film,
  Images,
  Plus,
  Upload,
  Video,
  Link as LinkIcon,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, parse } from "date-fns"
import { useToast } from '@/hooks/use-toast'

type GalleryItem = {
  id: string
  url: string
  caption: string
  category: string
  date: string
  location: string
  eventName: string
  type: 'still' | 'video'
  videoUrl?: string
}

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [filterType, setFilterType] = useState<'All' | 'still' | 'video'>('All')
  const [isMirror, setIsMirror] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [videoProgress, setVideoProgress] = useState<number>(0)
  const [isVideoProcessing, setIsVideoProcessing] = useState(false)
  
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  // Detection for Public Site View (Mirror)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMirror(window.self !== window.top)
    }
  }, [])

  // Administrative check for Live Editor
  const isAdmin = user?.email === 'deydhritiman@gmail.com' && isMirror

  const [newItem, setNewItem] = useState({
    url: '',
    type: 'still' as 'still' | 'video',
    videoUrl: '',
    caption: '',
    category: 'Campaign',
    date: format(new Date(), "PPP"),
    location: ''
  })

  const eventsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'events'), orderBy('createdAt', 'desc'));
  }, [db]);

  const galleryRepoQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: events, loading: eventsLoading } = useCollection(eventsQuery);
  const { data: galleryItemsRepo, loading: galleryLoading } = useCollection(galleryRepoQuery);

  const galleryItems = useMemo(() => {
    const items: GalleryItem[] = [];
    
    // Add items from dedicated gallery collection
    if (galleryItemsRepo) {
      galleryItemsRepo.forEach((item: any) => {
        items.push({
          id: item.id,
          url: item.url,
          caption: item.caption,
          category: item.category,
          date: item.date,
          location: item.location,
          eventName: "Mission Highlight",
          type: item.type || 'still',
          videoUrl: item.videoUrl
        });
      });
    }

    // Add items from events collection
    if (events) {
      events.forEach((event: any) => {
        // Add primary image
        if (event.imageId) {
          items.push({
            id: `${event.id}-primary`,
            url: event.imageId.startsWith('data:') ? event.imageId : 'https://picsum.photos/seed/event/800/600',
            caption: event.title,
            category: event.category,
            date: event.date,
            location: event.location,
            eventName: event.title,
            type: 'still'
          });
        }
        
        // Add gallery images
        if (event.galleryImages && Array.isArray(event.galleryImages)) {
          event.galleryImages.forEach((img: string, idx: number) => {
            if (img) {
              items.push({
                id: `${event.id}-gallery-${idx}`,
                url: img,
                caption: event.galleryCaptions?.[idx] || event.title,
                category: event.category,
                date: event.date,
                location: event.location,
                eventName: event.title,
                type: 'still'
              });
            }
          });
        }

        // Add videos as gallery items
        if (event.videoUrl) {
          items.push({
            id: `${event.id}-video`,
            url: event.imageId?.startsWith('data:') ? event.imageId : 'https://picsum.photos/seed/vid-thumb/800/600',
            caption: event.videoCaption || `Cinematic: ${event.title}`,
            category: event.category,
            date: event.date,
            location: event.location,
            eventName: event.title,
            type: 'video',
            videoUrl: event.videoUrl
          });
        }
      });
    }
    
    return items;
  }, [events, galleryItemsRepo]);

  const filteredItems = useMemo(() => {
    if (filterType === 'All') return galleryItems;
    return galleryItems.filter(item => item.type === filterType);
  }, [galleryItems, filterType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'url' | 'videoUrl') => {
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
        setNewItem(prev => ({ ...prev, [field]: dataUri }))

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
      toast({ variant: "destructive", title: "Incomplete Data", description: "Media and Caption are mandatory." });
      return;
    }

    setIsActionLoading(true)
    try {
      await addDoc(collection(db, 'gallery'), {
        ...newItem,
        createdAt: serverTimestamp()
      })
      toast({ title: "Asset Archived", description: "Moment added to visual registry." })
      setNewItem({ url: '', type: 'still', videoUrl: '', caption: '', category: 'Campaign', date: format(new Date(), "PPP"), location: '' })
      setIsAddDialogOpen(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Archive Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const parseItemDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try { return parse(dateStr, "PPP", new Date()); } catch { return undefined; }
  }

  const handleNext = () => {
    if (!selectedImage) return;
    const currentIndex = filteredItems.findIndex(i => i.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedImage(filteredItems[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedImage) return;
    const currentIndex = filteredItems.findIndex(i => i.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedImage(filteredItems[prevIndex]);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };

  const loading = eventsLoading || galleryLoading;

  const categories = ["Campaign", "Workshop", "Convention", "Relief", "Social Projects", "Public Welfare", "Glimpse"]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-40 pb-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge className="bg-accent text-white font-bold px-4 py-1.5 uppercase tracking-widest text-[10px] border-none">Mission Archive</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">Mission <span className="text-accent italic">Gallery</span></h1>
            <p className="text-xl opacity-80 leading-relaxed max-w-2xl mx-auto text-primary-foreground">
              A visual registry of organizational activities across all regional chapters.
            </p>

            {isAdmin && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-10 flex gap-2 hover:bg-secondary hover:text-white shadow-2xl shadow-accent/20 mx-auto transform hover:scale-105 transition-all mt-8">
                    <Plus className="w-6 h-6" /> Live Editor: Add New Moment
                  </Button>
                </DialogTrigger>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle>New Archive Entry</DialogTitle>
                    <DialogDescription>Firestore limit is 1MB. Use External Links for high-res video.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
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
                         Images MUST be under **150KB**. For videos, please use **Direct URL Links** (YouTube/Drive) to save database space.
                       </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                      <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border">
                        {newItem.url ? <Image src={newItem.url} alt="Preview" fill className="object-cover" /> : (
                          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-300">
                            <Plus className="w-10 h-10" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{newItem.type === 'still' ? 'Add Photo' : 'Add Video Thumbnail'}</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'url')} />
                      </div>
                      <Button variant="outline" size="sm" className="w-full relative h-9 rounded-lg">
                        <Upload className="w-3.5 h-3.5 mr-2" /> {newItem.type === 'still' ? 'Select Photograph' : 'Select Video Cover'}
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
                                <Film className="w-3.5 h-3.5 mr-2" /> {isVideoProcessing ? "Archiving..." : "Upload Mini Clip (<300KB)"}
                                <input 
                                  type="file" 
                                  accept="video/mp4,video/webm" 
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => handleFileChange(e, 'videoUrl')}
                                  disabled={isVideoProcessing}
                                />
                              </Button>
                              <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                <Input 
                                  placeholder="Preferred: YouTube/Drive URL" 
                                  className="pl-8 h-10 rounded-xl border-indigo-50 bg-white text-xs"
                                  value={newItem.videoUrl?.startsWith('data:') ? '' : newItem.videoUrl}
                                  onChange={e => setNewItem(prev => ({...prev, videoUrl: e.target.value}))}
                                />
                              </div>
                            </div>
                            
                            {isVideoProcessing && (
                              <div className="space-y-2 animate-in fade-in duration-500">
                                <div className="flex justify-between items-center text-[9px] font-bold text-indigo-500 uppercase">
                                  <span>Buffering Stream...</span>
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
                      <Input value={newItem.caption} onChange={e => setNewItem({...newItem, caption: e.target.value})} className="h-11 rounded-xl" placeholder="Detailed moment description..." />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Category</Label>
                        <Select value={newItem.category} onValueChange={(v: any) => setNewItem({...newItem, category: v})}><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent position="popper" className="z-[1000001] bg-white">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Date</Label>
                        <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full h-11 rounded-xl text-left font-normal">{newItem.date}</Button></PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[1000001]"><CalendarComponent mode="single" selected={parseItemDate(newItem.date)} onSelect={d => setNewItem({...newItem, date: d ? format(d, "PPP") : ''})} initialFocus /></PopoverContent></Popover></div>
                    </div>

                    <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Location</Label><Input value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} className="h-11 rounded-xl" placeholder="Venue or Chapter Name" /></div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddItem} disabled={isActionLoading || isVideoProcessing} className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-secondary">
                      {isActionLoading ? <Loader2 className="animate-spin" /> : "Establish Registry Entry"}
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
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
             <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-inner">
                <Button 
                  variant={filterType === 'All' ? 'default' : 'ghost'} 
                  onClick={() => setFilterType('All')}
                  className={cn(
                    "rounded-xl h-10 px-6 font-bold text-xs uppercase tracking-widest transition-all",
                    filterType === 'All' ? "bg-accent text-white shadow-lg" : "text-slate-500 hover:text-accent"
                  )}
                >
                  All Moments
                </Button>
                <Button 
                  variant={filterType === 'still' ? 'default' : 'ghost'} 
                  onClick={() => setFilterType('still')}
                  className={cn(
                    "rounded-xl h-10 px-6 font-bold text-xs uppercase tracking-widest transition-all flex gap-2",
                    filterType === 'still' ? "bg-accent text-white shadow-lg" : "text-slate-500 hover:text-accent"
                  )}
                >
                  <Camera className="w-4 h-4" /> Still Photography
                </Button>
                <Button 
                  variant={filterType === 'video' ? 'default' : 'ghost'} 
                  onClick={() => setFilterType('video')}
                  className={cn(
                    "rounded-xl h-10 px-6 font-bold text-xs uppercase tracking-widest transition-all flex gap-2",
                    filterType === 'video' ? "bg-accent text-white shadow-lg" : "text-slate-500 hover:text-accent"
                  )}
                >
                  <Film className="w-4 h-4" /> Video Highlight
                </Button>
             </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Visual Registry...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="columns-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="mb-6 break-inside-avoid group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-zoom-in relative"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image 
                      src={item.url} 
                      alt={item.caption} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors">
                         <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                         </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                      <div className="flex gap-2 mb-2">
                        <Badge className="w-fit bg-accent text-white border-none text-[8px] font-black uppercase">{item.category}</Badge>
                        <Badge variant="outline" className="border-white/40 text-white text-[8px] font-bold uppercase flex gap-1">
                          {item.type === 'video' ? <Film className="w-2.5 h-2.5" /> : <Camera className="w-2.5 h-2.5" />}
                          {item.type === 'video' ? 'Video' : 'Still'}
                        </Badge>
                      </div>
                      <h3 className="text-white font-headline font-bold text-lg leading-tight line-clamp-2">{item.caption}</h3>
                      <div className="flex items-center gap-4 mt-3 text-white/60 text-[8px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><CalendarIcon className="w-2.5 h-2.5" /> {item.date}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {item.location}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 opacity-20">
              <Images className="w-20 h-20 mx-auto mb-4" />
              <h3 className="text-2xl font-headline font-bold">No assets identified in this category.</h3>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl p-0 border-none bg-black/95 shadow-none [&>button]:hidden flex flex-col max-h-[95vh] overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Lightbox</DialogTitle>
            <DialogDescription>Full-sized mission photograph viewer.</DialogDescription>
          </DialogHeader>

          {selectedImage && (
            <div className="flex-1 flex flex-col h-full relative overflow-y-auto custom-scrollbar">
              <div className="absolute top-6 right-6 z-50 flex gap-2">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => setSelectedImage(null)}
                   className="rounded-full bg-white/10 hover:bg-red-500 text-white transition-all h-10 w-10 border border-white/20"
                 >
                   <X className="w-5 h-5" />
                 </Button>
              </div>

              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50">
                 <Button variant="ghost" size="icon" onClick={handlePrev} className="rounded-full bg-black/40 text-white hover:bg-accent border border-white/10 h-12 w-12">
                   <ChevronLeft className="w-6 h-6" />
                 </Button>
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50">
                 <Button variant="ghost" size="icon" onClick={handleNext} className="rounded-full bg-black/40 text-white hover:bg-accent border border-white/10 h-12 w-12">
                   <ChevronRight className="w-6 h-6" />
                 </Button>
              </div>

              <div className="flex-none min-h-0 relative flex items-center justify-center p-4 md:p-8">
                 {selectedImage.type === 'video' && selectedImage.videoUrl ? (
                   <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl bg-black max-h-[55vh]">
                      {getYouTubeEmbedUrl(selectedImage.videoUrl) ? (
                        <iframe
                          src={getYouTubeEmbedUrl(selectedImage.videoUrl)!}
                          className="w-full h-full border-none"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video 
                          src={selectedImage.videoUrl} 
                          controls 
                          autoPlay 
                          className="w-full h-full object-contain"
                        />
                      )}
                   </div>
                 ) : (
                   <div className="relative w-full h-[60vh] max-w-5xl">
                      <Image 
                        src={selectedImage.url} 
                        alt={selectedImage.caption} 
                        fill 
                        className="object-contain" 
                        priority
                      />
                   </div>
                 )}
              </div>

              <div className="flex-1 bg-white/5 backdrop-blur-xl p-6 md:p-10 border-t border-white/10 animate-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-12">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="bg-accent text-primary font-black uppercase tracking-widest text-[10px]">{selectedImage.category}</Badge>
                      <Badge variant="outline" className="border-white/20 text-white/60 font-bold uppercase tracking-widest text-[8px]">
                        {selectedImage.type === 'video' ? 'Cinematic Entry' : 'Still Registry'}
                      </Badge>
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">{selectedImage.eventName}</span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-headline font-bold text-white leading-tight">
                      {selectedImage.caption}
                    </h2>
                    <div className="flex flex-wrap items-center gap-6 text-white/60 font-bold uppercase tracking-widest text-[10px]">
                      <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-accent" /> {selectedImage.date}</span>
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> {selectedImage.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-emerald-500/20 text-emerald-400 px-6 py-2.5 rounded-full border border-emerald-500/30 text-[10px] font-bold uppercase tracking-widest shrink-0">
                    <BadgeCheck className="w-4 h-4" />
                    Verified Mission Moment
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
