
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  Radio, 
  Newspaper,
  ArrowRight,
  Wifi,
  Clock,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * Internal Current News Management: Governance terminal for daily updates.
 * Directly controls the homepage news area.
 */
export default function InternalNewsManagement() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editNews, setEditNews] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    isActive: true,
    priority: 1
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login');
    }
  }, [user, authLoading, router]);

  const newsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'current_news'), orderBy('priority', 'desc'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: newsItems, loading: dataLoading } = useCollection(newsQuery);

  const handleAdd = async () => {
    if (!db) return;
    if (!newNews.title || !newNews.content) {
      toast({ variant: "destructive", title: "Validation Error", description: "Title and Content are required." });
      return;
    }
    
    // Line limit validation (max 10 lines for homepage aesthetic)
    const lineCount = newNews.content.split('\n').length;
    if (lineCount > 10) {
      toast({ variant: "destructive", title: "Format Error", description: "News content must be within 10 lines for front-end clarity." });
      return;
    }

    setIsActionLoading(true);
    addDoc(collection(db, 'current_news'), { ...newNews, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "News Broadcasted", description: "Synchronized with public homepage display." });
        setIsAddDialogOpen(false);
        setNewNews({ title: '', content: '', isActive: true, priority: 1 });
      })
      .finally(() => setIsActionLoading(false));
  };

  const handleUpdate = async () => {
    if (!db || !editNews) return;
    setIsActionLoading(true);
    const { id, ...data } = editNews;
    updateDoc(doc(db, 'current_news', id), data)
      .then(() => {
        toast({ title: "Registry Updated" });
        setIsEditDialogOpen(false);
        setEditNews(null);
      })
      .finally(() => setIsActionLoading(false));
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'current_news', id)).then(() => toast({ title: "News Entry Purged" }));
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>;
  }

  const filtered = (newsItems || []).filter((n: any) => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-emerald-500/30 tracking-[0.2em]">
              <Radio className="w-2.5 h-2.5 animate-pulse" /> Live News Terminal
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Current <span className="text-accent italic">Intelligence</span></h1>
            <p className="text-slate-400 text-[11px] uppercase font-black">Management of Front-Page Daily Broadcast</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-2xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all transform hover:scale-105 active:scale-95">
                <Plus className="w-4 h-4" /> Create Daily News
              </Button>
            </DialogTrigger>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl [&>button]:hidden">
              <DialogHeader className="relative">
                <div className="absolute right-0 top-0">
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <X className="w-4 h-4" />
                    </Button>
                  </DialogClose>
                </div>
                <DialogTitle className="text-2xl font-headline font-bold">Publish Daily News</DialogTitle>
                <DialogDescription>Entires will appear in the high-fidelity news area on the left side of the homepage.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Headline *</Label>
                  <Input placeholder="e.g. Major Success in Rural Legal Awareness Camp" value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} className="h-11 rounded-xl" />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">News Narrative (Max 10 Lines) *</Label>
                  <Textarea placeholder="Type the news details here..." value={newNews.content} onChange={e => setNewNews({...newNews, content: e.target.value})} className="rounded-xl min-h-[150px] leading-relaxed" />
                  <p className="text-[8px] font-bold text-slate-400 text-right uppercase">Line Count: {newNews.content.split('\n').length} / 10</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Display Priority (Rank)</Label>
                    <Input type="number" value={newNews.priority} onChange={e => setNewNews({...newNews, priority: Number(e.target.value)})} className="h-11 rounded-xl" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900 mt-5">
                    <Label className="text-[10px] font-bold uppercase">Activate on Home</Label>
                    <Switch checked={newNews.isActive} onCheckedChange={val => setNewNews({...newNews, isActive: val})} className="data-[state=checked]:bg-emerald-500" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary">Authorize & Broadcast</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search intelligence archive..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-6 max-w-4xl mx-auto">
              {filtered.map((n: any) => (
                <Card key={n.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-500">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className={cn("p-6 md:w-44 text-center border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/50")}>
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-accent mb-3 shadow-sm">
                            <Newspaper className="w-6 h-6" />
                         </div>
                         <Badge className={cn("text-[9px] font-black px-3 py-1 uppercase border-none", n.isActive ? "bg-emerald-500" : "bg-slate-400")}>
                           {n.isActive ? "LIVE" : "ARCHIVED"}
                         </Badge>
                         <p className="text-[8px] font-black text-slate-400 uppercase mt-4 tracking-widest flex items-center gap-1">
                           <Clock className="w-2.5 h-2.5" /> Rank: {n.priority}
                         </p>
                      </div>
                      <div className="flex-1 p-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                           <div className="space-y-1.5 flex-1">
                              <h3 className="text-xl font-headline font-bold text-primary dark:text-white leading-tight">{n.title}</h3>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : 'N/A'}</p>
                              <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                                "{n.content}"
                              </div>
                           </div>
                           <div className="flex items-center gap-2 shrink-0">
                              <Button variant="outline" size="sm" onClick={() => { setEditNews(n); setIsEditDialogOpen(true); }} className="h-10 px-5 rounded-xl text-[10px] font-bold border-slate-200 hover:bg-accent hover:text-primary transition-all">Modify</Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)} className="h-10 w-10 text-slate-300 hover:text-red-500 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5" /></Button>
                           </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 opacity-40">
                   <Newspaper className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                   <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Intelligence Registry Empty</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl [&>button]:hidden">
          <DialogHeader className="relative">
            <div className="absolute right-0 top-0">
               <DialogClose asChild>
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                   <X className="w-4 h-4" />
                 </Button>
               </DialogClose>
            </div>
            <DialogTitle>Update Broadcast Meta</DialogTitle>
          </DialogHeader>
          {editNews && (
            <div className="space-y-6 py-2">
                <div className="space-y-1"><Label className="text-[10px] font-bold uppercase text-slate-400">Headline</Label><Input value={editNews.title} onChange={e => setEditNews({...editNews, title: e.target.value})} className="h-11 rounded-xl" /></div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Narrative</Label>
                  <Textarea value={editNews.content} onChange={e => setEditNews({...editNews, content: e.target.value})} className="rounded-xl min-h-[150px]" />
                  <p className="text-[8px] font-bold text-slate-400 text-right uppercase">Line Count: {editNews.content.split('\n').length} / 10</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] font-bold uppercase text-slate-400">Priority</Label><Input type="number" value={editNews.priority} onChange={e => setEditNews({...editNews, priority: Number(e.target.value)})} className="h-11 rounded-xl" /></div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 mt-5">
                    <Label className="text-[10px] font-bold uppercase">Live Broadcast</Label>
                    <Switch checked={editNews.isActive} onCheckedChange={val => setEditNews({...editNews, isActive: val})} />
                  </div>
                </div>
                <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-2xl mt-4 hover:bg-secondary transition-all">Commit Profile Refresh</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}
