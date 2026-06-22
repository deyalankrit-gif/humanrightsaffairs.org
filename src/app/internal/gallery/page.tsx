
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
  FileWarning
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
  
  const [newItem, setNewItem] = useState({
    url: '',
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0]
    if (file) {
      // Limit to 200KB for Base64 efficiency in Firestore
      if (file.size > 204800) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please optimize your image to be under 200KB for institutional archival."
        });
        return;
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUri = reader.result as string
        if (isEdit && editItem) setEditItem({ ...editItem, url: dataUri })
        else setNewItem({ ...newItem, url: dataUri })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddItem = async () => {
    if (!db) return;
    if (!newItem.url || !newItem.caption) {
      toast({ variant: "destructive", title: "Incomplete Data", description: "Image and Caption are mandatory." });
      return;
    }

    setIsActionLoading(true)
    try {
      await addDoc(collection(db, 'gallery'), {
        ...newItem,
        createdAt: serverTimestamp()
      })
      toast({ title: "Asset Archived", description: "Photo added to public gallery." })
      setNewItem({ url: '', caption: '', category: 'Campaign', date: format(new Date(), "PPP"), location: '' })
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

  const categories = ["Campaign", "Workshop", "Convention", "Relief", "Social Projects", "Public Welfare"]

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
            <p className="text-slate-400 text-[11px]">Curate the official photographic record of Trust activities.</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg hover:bg-secondary hover:text-white transition-all">
                <Plus className="w-4 h-4" /> Archive New Moment
              </Button>
            </DialogTrigger>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-md rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
              <DialogHeader><DialogTitle>New Gallery Entry</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex gap-3">
                   <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                   <p className="text-[10px] text-amber-800 font-bold uppercase">Image limit is 200KB. Use high-res links for larger files.</p>
                </div>

                <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                  <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border">
                    {newItem.url ? <Image src={newItem.url} alt="Preview" fill className="object-cover" /> : <ImageIcon className="w-10 h-10 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false)} />
                  </div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Moment Photograph</Label>
                </div>

                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Caption *</Label><Input value={newItem.caption} onChange={e => setNewItem({...newItem, caption: e.target.value})} className="h-11 rounded-xl" placeholder="Describe the scene..." /></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Category</Label>
                    <Select value={newItem.category} onValueChange={(v: any) => setNewItem({...newItem, category: v})}><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent position="popper" className="z-[1000001] bg-white">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Date</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full h-11 rounded-xl text-left font-normal">{newItem.date}</Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[1000001]"><Calendar mode="single" selected={parseItemDate(newItem.date)} onSelect={d => setNewItem({...newItem, date: d ? format(d, "PPP") : ''})} initialFocus /></PopoverContent></Popover></div>
                </div>

                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Location</Label><Input value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} className="h-11 rounded-xl" placeholder="District, State" /></div>
              </div>
              <DialogFooter><Button onClick={handleAddItem} disabled={isActionLoading} className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-secondary">Commit to Archive</Button></DialogFooter>
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
                      </div>
                      <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1 text-center md:text-left">
                           <Badge variant="outline" className="text-[7px] font-bold px-1.5 py-0 mb-1 uppercase border-accent text-accent">{item.category}</Badge>
                           <h3 className="text-lg font-bold text-primary dark:text-white leading-tight">{item.caption}</h3>
                           <div className="flex items-center gap-4 mt-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                             <span className="flex items-center gap-1"><CalendarIcon className="w-2.5 h-2.5" /> {item.date}</span>
                             <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {item.location || 'Mission Ground'}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button onClick={() => { setEditItem(item); setIsEditDialogOpen(true); }} variant="outline" size="sm" className="h-8 rounded-xl text-[10px] font-bold px-4 border-slate-200">Modify</Button>
                           <Button onClick={() => handleDeleteItem(item.id)} variant="ghost" size="sm" className="h-8 w-8 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
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
        <DialogContent className="max-w-md rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader><DialogTitle>Update Visual Record</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4 py-2">
               <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                  <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden">
                    <Image src={editItem.url} alt="Preview" fill className="object-cover" />
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true)} />
                  </div>
                </div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Caption</Label><Input value={editItem.caption} onChange={e => setEditItem({...editItem, caption: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Category</Label>
                    <Select value={editItem.category} onValueChange={(v: any) => setEditItem({...editItem, category: v})}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent position="popper" className="z-[1000001] bg-white">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Date</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full rounded-xl text-left font-normal">{editItem.date}</Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[1000001]"><Calendar mode="single" selected={parseItemDate(editItem.date)} onSelect={d => setEditItem({...editItem, date: d ? format(d, "PPP") : ''})} initialFocus /></PopoverContent></Popover></div>
                </div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Location</Label><Input value={editItem.location} onChange={e => setEditItem({...editItem, location: e.target.value})} /></div>
                <Button onClick={handleUpdateItem} disabled={isActionLoading} className="w-full h-12 bg-primary text-white font-bold rounded-xl mt-4">Commit Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
