"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Footer } from '@/components/footer'
import { 
  ImageIcon, 
  Camera, 
  Filter, 
  Maximize2, 
  X, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  MapPin,
  BadgeCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

type GalleryItem = {
  id: string
  url: string
  caption: string
  category: string
  date: string
  location: string
  eventName: string
}

export default function GalleryPage() {
  const [filter, setFilter] = useState("All")
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const db = useFirestore()

  const eventsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'events'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: events, loading } = useCollection(eventsQuery);

  const galleryItems = useMemo(() => {
    if (!events) return [];
    
    const items: GalleryItem[] = [];
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
          eventName: event.title
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
              eventName: event.title
            });
          }
        });
      }
    });
    
    return items;
  }, [events]);

  const filteredItems = galleryItems.filter(item => 
    filter === "All" || item.category === filter
  );

  const categories = ["All", ...Array.from(new Set(galleryItems.map(i => i.category)))];

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

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-40 pb-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge className="bg-accent text-white font-bold px-4 py-1.5 uppercase tracking-widest text-[10px] border-none">Mission Archive</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">Mission <span className="text-accent italic">Gallery</span></h1>
            <p className="text-xl opacity-80 leading-relaxed max-w-2xl mx-auto text-primary-foreground">
              A visual record of Human Rights Affairs Trust activities, documenting our on-ground impact across regional chapters.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[48px] md:top-[56px] z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex items-center overflow-x-auto no-scrollbar gap-2 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                onClick={() => setFilter(cat)}
                className={cn(
                  "rounded-full px-6 font-bold transition-all border-slate-200 dark:border-slate-700 whitespace-nowrap",
                  filter === cat 
                    ? "bg-accent text-white shadow-lg border-accent hover:bg-secondary" 
                    : "text-primary dark:text-slate-300 hover:bg-secondary hover:text-white"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Digital Vault...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="columns-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="mb-6 break-inside-avoid group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-zoom-in"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image 
                      src={item.url} 
                      alt={item.caption} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                      <Badge className="w-fit bg-accent text-white border-none mb-2 text-[8px] font-black uppercase">{item.category}</Badge>
                      <h3 className="text-white font-headline font-bold text-lg leading-tight line-clamp-2">{item.caption}</h3>
                      <div className="flex items-center gap-4 mt-3 text-white/60 text-[8px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {item.date}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {item.location}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 opacity-20">
              <Camera className="w-20 h-20 mx-auto mb-4" />
              <h3 className="text-2xl font-headline font-bold">No images found for this category</h3>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl p-0 border-none bg-black/95 shadow-none [&>button]:hidden flex flex-col h-[90vh]">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Lightbox</DialogTitle>
            <DialogDescription>Full-sized mission photograph viewer.</DialogDescription>
          </DialogHeader>

          {selectedImage && (
            <div className="flex-1 flex flex-col h-full relative">
              {/* Navigation Controls */}
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

              {/* Main Image Display */}
              <div className="flex-1 relative flex items-center justify-center p-8">
                 <div className="relative w-full h-full max-h-[70vh]">
                    <Image 
                      src={selectedImage.url} 
                      alt={selectedImage.caption} 
                      fill 
                      className="object-contain" 
                      priority
                    />
                 </div>
              </div>

              {/* Info Panel */}
              <div className="bg-white/5 backdrop-blur-xl p-8 md:p-12 border-t border-white/10 animate-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-accent text-primary font-black uppercase tracking-widest text-[10px]">{selectedImage.category}</Badge>
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">{selectedImage.eventName}</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-headline font-bold text-white leading-tight">
                      {selectedImage.caption}
                    </h2>
                    <div className="flex flex-wrap items-center gap-6 text-white/60 font-bold uppercase tracking-widest text-[10px]">
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" /> {selectedImage.date}</span>
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> {selectedImage.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-emerald-500/20 text-emerald-400 px-6 py-2.5 rounded-full border border-emerald-500/30 text-xs font-bold uppercase tracking-widest shrink-0">
                    <BadgeCheck className="w-5 h-5" />
                    Verified Mission Record
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
