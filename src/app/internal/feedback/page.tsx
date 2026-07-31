
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  ShieldCheck, 
  Loader2, 
  Trash2, 
  Edit, 
  Star, 
  MessageSquareQuote, 
  User, 
  MapPin, 
  X, 
  Check,
  FilterX,
  History,
  Globe
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function FeedbackManagementPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const userRegistryRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);

  const { data: registry, loading: registryLoading } = useDoc(userRegistryRef);

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com'
  const hasAccess = isRoot || (registry?.permissions?.feedback === true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
      return;
    }
    if (user && !registryLoading && registry && !hasAccess) {
      router.push('/internal/public-view');
    }
  }, [user, authLoading, registry, registryLoading, hasAccess, router])

  const feedbackQuery = useMemoFirebase(() => {
    if (!db || !user || !hasAccess) return null;
    return query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
  }, [db, user, hasAccess]);

  const { data: testimonials, loading: dataLoading } = useCollection(feedbackQuery);

  const handleUpdate = async () => {
    if (!db || !editItem) return
    setIsActionLoading(true)
    try {
      const { id, ...data } = editItem
      await updateDoc(doc(db, 'feedback', id), {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email
      })
      toast({ title: "Testimonial Updated", description: "Changes synced with public marquee." })
      setIsEditDialogOpen(false)
      setEditItem(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db) return
    try {
      await deleteDoc(doc(db, 'feedback', id))
      toast({ title: "Feedback Purged", description: "Record removed from registry." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Purge Denied" })
    }
  }

  if (authLoading || registryLoading || !user || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  const filtered = (testimonials || []).filter((t: any) => 
    (t.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (t.comment || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.address || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase border border-accent/30 tracking-[0.2em]">
                <MessageSquareQuote className="w-2.5 h-2.5" /> Public Sentiment
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Community <span className="text-accent italic">Testimonials</span></h1>
              <p className="text-slate-400 text-[11px] uppercase font-black">Audit Hub for Website Feedback Marquee</p>
            </div>
            
            <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-center">
              <p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Total Reviews</p>
              <p className="text-xl font-bold text-accent">{(testimonials || []).length}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-lg:max-w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search testimonials by name, region or content..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="ghost" onClick={() => setSearch('')} className="h-11 rounded-xl gap-2 text-slate-400 hover:text-accent">
            <FilterX className="w-4 h-4" /> Clear Filter
          </Button>
        </div>
      </section>

      <section className="py-8 pb-24">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4 max-w-5xl mx-auto">
              {filtered.map((t: any) => (
                <Card key={t.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 md:w-48 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                         <div className="flex gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={cn("w-3 h-3", i < (t.rating || 5) ? "fill-accent text-accent" : "text-slate-200 dark:text-slate-700")} />
                            ))}
                         </div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Rating</p>
                         <p className="text-lg font-black text-primary dark:text-white leading-none mt-1">{t.rating || 5}/5</p>
                         <Badge variant="outline" className="mt-3 text-[7px] font-bold border-slate-200 uppercase tracking-tighter h-5">{t.source || 'HRAT Website'}</Badge>
                      </div>
                      <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 flex-1">
                           <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-primary dark:text-white leading-tight">{t.name}</h3>
                              <Badge variant="outline" className="text-[8px] border-slate-100 dark:border-slate-800 font-black flex gap-1 items-center">
                                <MapPin className="w-2.5 h-2.5 text-accent" /> {t.address}
                              </Badge>
                           </div>
                           <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed line-clamp-2">"{t.comment}"</p>
                           <div className="pt-2 flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                             <span className="flex items-center gap-1.5"><History className="w-3 h-3" /> {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : 'Real-time'}</span>
                             <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Source: {t.source || 'Web'}</span>
                           </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                           <Button 
                             size="sm" 
                             variant="outline" 
                             onClick={() => { setEditItem(t); setIsEditDialogOpen(true); }}
                             className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 hover:bg-accent hover:text-primary transition-all"
                           >
                             <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                           </Button>
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Purge Testimonial?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently remove the feedback from "{t.name}" from the institutional registry and the public marquee.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl h-11">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11">Purge Record</AlertDialogAction>
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
                <div className="text-center py-32 opacity-30">
                  <MessageSquareQuote className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-headline font-bold">No testimonials matching criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(val) => { if(!val) { setIsEditDialogOpen(false); setEditItem(null); } }}>
        <DialogContent className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
           {editItem && (
             <>
               <div className="bg-slate-900 p-8 text-white relative">
                  <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 h-8 w-8"><X className="w-4 h-4" /></Button></DialogClose></div>
                  <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2">Audit Editor</Badge>
                  <DialogTitle className="text-2xl font-headline font-bold">Modify Public Feedback</DialogTitle>
                  <DialogDescription className="text-slate-400">Updating verified record for {editItem.name}.</DialogDescription>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Contributor Name</Label>
                        <Input value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className="h-11 rounded-xl" />
                     </div>
                     <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Location / Address</Label>
                        <Input value={editItem.address} onChange={e => setEditItem({...editItem, address: e.target.value})} className="h-11 rounded-xl" />
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Rating Scale</Label>
                      <div className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 w-fit">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button 
                              key={star} 
                              onClick={() => setEditItem({...editItem, rating: star})}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                                <Star className={cn("w-6 h-6", star <= editItem.rating ? "fill-accent text-accent" : "text-slate-200 dark:text-slate-800")} />
                            </button>
                          ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Source Registry</Label>
                      <Select value={editItem.source || 'HRAT Website'} onValueChange={v => setEditItem({...editItem, source: v})}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent position="popper" className="z-[1000001] bg-white">
                          <SelectItem value="HRAT Website">HRAT Website</SelectItem>
                          <SelectItem value="Google Business">Google Business</SelectItem>
                          <SelectItem value="Offline Audit">Offline Audit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase text-slate-400">Testimonial Narrative</Label>
                     <Textarea value={editItem.comment} onChange={e => setEditItem({...editItem, comment: e.target.value})} className="min-h-[120px] rounded-2xl" />
                  </div>

                  <Button 
                    onClick={handleUpdate} 
                    disabled={isActionLoading}
                    className="w-full h-14 bg-primary text-white font-bold rounded-2xl hover:bg-secondary shadow-xl shadow-primary/10 transition-all flex gap-2"
                  >
                    {isActionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Check className="w-5 h-5" /> Commit Audit Changes</>}
                  </Button>
               </div>
             </>
           )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
