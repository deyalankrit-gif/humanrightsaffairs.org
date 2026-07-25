
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  X,
  RefreshCw,
  Zap,
  Globe,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Link as LinkIcon,
  Calendar
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
import { syncNews } from '@/ai/flows/sync-news-flow';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function InternalNewsManagement() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editNews, setEditNews] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    source: 'The Hindu',
    url: '',
    publishedAt: format(new Date(), 'MMM dd, yyyy, hh:mm a'),
    scope: 'India' as 'West Bengal' | 'India' | 'World',
    scopePriority: 2,
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
    return query(collection(db, 'current_news'));
  }, [db, user]);

  const metaRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'current_news_state', 'registry');
  }, [db]);

  const { data: newsItems, loading: dataLoading } = useCollection(newsQuery);
  const { data: meta } = useDoc(metaRef);

  const sortedNews = useMemo(() => {
    if (!newsItems) return [];
    return [...newsItems]
      .filter((n: any) => 
        n.title?.toLowerCase().includes(search.toLowerCase()) || 
        n.content?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a: any, b: any) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        if (a.scopePriority !== b.scopePriority) {
          return (a.scopePriority || 99) - (b.scopePriority || 99);
        }
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
      });
  }, [newsItems, search]);

  const handleSync = async () => {
    if (!db) return;
    setIsSyncing(true);
    try {
      const output = await syncNews({ context: `Manual priority sync at ${new Date().toISOString()}` });
      const batch = writeBatch(db);
      
      // Deactivate old news
      if (newsItems) {
        newsItems.forEach(item => {
          if (item.isActive) {
            batch.update(doc(db, 'current_news', item.id), { isActive: false });
          }
        });
      }

      output.news.forEach(item => {
        const ref = doc(collection(db, 'current_news'));
        batch.set(ref, {
          ...item,
          isActive: true,
          priority: 1,
          createdAt: serverTimestamp()
        });
      });

      batch.set(doc(db, 'current_news_state', 'registry'), {
        lastSyncAt: serverTimestamp(),
        status: 'Success',
        updatedBy: user?.email
      }, { merge: true });

      await batch.commit();
      toast({ title: "Intelligence Sync Success", description: "Priority feed has been updated across the network." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAdd = async () => {
    if (!db) return;
    if (!newNews.title || !newNews.content) {
      toast({ variant: "destructive", title: "Validation Error", description: "Title and Content are required." });
      return;
    }
    
    setIsActionLoading(true);
    addDoc(collection(db, 'current_news'), { ...newNews, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "News Broadcasted", description: "Manual entry committed to registry." });
        setIsAddDialogOpen(false);
        setNewNews({ 
          title: '', content: '', source: 'The Hindu', url: '', 
          publishedAt: format(new Date(), 'MMM dd, yyyy, hh:mm a'),
          scope: 'India', scopePriority: 2, isActive: true, priority: 1 
        });
      })
      .finally(() => setIsActionLoading(false));
  };

  const handleUpdate = async () => {
    if (!db || !editNews) return;
    setIsActionLoading(true);
    const { id, ...data } = editNews;
    updateDoc(doc(db, 'current_news', id), { ...data, updatedAt: serverTimestamp() })
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

  const getScopeBadge = (scope: string, priority: number) => {
    switch (scope) {
      case 'West Bengal': return "bg-emerald-500 text-white";
      case 'India': return "bg-blue-600 text-white";
      case 'World': return "bg-slate-700 text-white";
      default: return "bg-slate-500 text-white";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-emerald-500/30 tracking-[0.2em]">
              <TrendingUp className="w-2.5 h-2.5 animate-pulse" /> Global Intelligence Terminal
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">News <span className="text-accent italic">Governance</span></h1>
            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase">
               <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-accent" /> Last Sync: {meta?.lastSyncAt?.toDate ? format(meta.lastSyncAt.toDate(), 'hh:mm a') : 'Never'}</span>
               <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Automatic refresh active (6h)</span>
            </div>
          </div>
          
          <div className="flex gap-3">
             <Button 
              onClick={handleSync} 
              disabled={isSyncing}
              variant="outline"
              className="bg-white/5 border-white/10 text-white font-bold h-11 px-6 rounded-xl hover:bg-white/10"
             >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Force Priority Sync
             </Button>
             
             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all">
                    <Plus className="w-4 h-4" /> Create Broadcast
                  </Button>
                </DialogTrigger>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl [&>button]:hidden">
                  <DialogHeader className="relative">
                    <div className="absolute right-0 top-0">
                      <DialogClose asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><X className="w-4 h-4" /></Button></DialogClose>
                    </div>
                    <DialogTitle className="text-2xl font-headline font-bold">Institutional Broadcast Entry</DialogTitle>
                    <DialogDescription>Manual news entries will override AI-synced content if priority is higher.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Headline *</Label>
                          <Input placeholder="Breaking news title" value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} className="h-11 rounded-xl" />
                       </div>
                       <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">News Scope</Label>
                          <Select value={newNews.scope} onValueChange={(val: any) => setNewNews({...newNews, scope: val, scopePriority: val === 'West Bengal' ? 1 : val === 'India' ? 2 : 3})}>
                             <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                             <SelectContent className="bg-white">
                                <SelectItem value="West Bengal">West Bengal (High Priority)</SelectItem>
                                <SelectItem value="India">National India</SelectItem>
                                <SelectItem value="World">International</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Source Publisher</Label>
                          <Input value={newNews.source} onChange={e => setNewNews({...newNews, source: e.target.value})} className="h-11 rounded-xl" />
                       </div>
                       <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Original URL</Label>
                          <Input value={newNews.url} onChange={e => setNewNews({...newNews, url: e.target.value})} placeholder="https://..." className="h-11 rounded-xl" />
                       </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Narrative (Max 10 Lines) *</Label>
                      <Textarea placeholder="Concise factual summary..." value={newNews.content} onChange={e => setNewNews({...newNews, content: e.target.value})} className="rounded-xl min-h-[150px]" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Publication Timestamp</Label>
                        <Input value={newNews.publishedAt} onChange={e => setNewNews({...newNews, publishedAt: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 mt-5">
                        <Label className="text-[10px] font-bold uppercase">Activate</Label>
                        <Switch checked={newNews.isActive} onCheckedChange={val => setNewNews({...newNews, isActive: val})} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter><Button onClick={handleAdd} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold">Authorize & Broadcast</Button></DialogFooter>
                </DialogContent>
             </Dialog>
          </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm transition-colors">
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
            <div className="grid gap-6 max-w-5xl mx-auto">
              {sortedNews.map((n: any) => (
                <Card key={n.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group hover:shadow-xl transition-all duration-500">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className={cn("p-6 md:w-48 text-center border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/50")}>
                         <Badge className={cn("text-[9px] font-black px-3 py-1 uppercase border-none mb-3", getScopeBadge(n.scope, n.scopePriority))}>
                           {n.scope}
                         </Badge>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                           <Clock className="w-2.5 h-2.5" /> Priority: {n.scopePriority}
                         </p>
                         {!n.isActive && <Badge variant="destructive" className="mt-2 text-[8px] font-black">INACTIVE</Badge>}
                      </div>
                      <div className="flex-1 p-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                           <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-accent" /> {n.source}</span>
                                 <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-accent" /> {n.publishedAt}</span>
                              </div>
                              <h3 className="text-xl font-headline font-bold text-primary dark:text-white leading-tight group-hover:text-accent transition-colors">{n.title}</h3>
                              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-sm line-clamp-[10] whitespace-pre-line text-slate-600 dark:text-slate-400">
                                "{n.content}"
                              </div>
                              {n.url && (
                                <a href={n.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-500 hover:underline">
                                   <LinkIcon className="w-3 h-3" /> Original Article Source
                                </a>
                              )}
                           </div>
                           <div className="flex items-center gap-2 shrink-0">
                              <Button variant="outline" size="sm" onClick={() => { setEditNews(n); setIsEditDialogOpen(true); }} className="h-10 px-5 rounded-xl text-[10px] font-bold border-slate-200">Modify</Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)} className="h-10 w-10 text-slate-300 hover:text-red-500 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5" /></Button>
                           </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {sortedNews.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 opacity-40">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Intelligence Registry Empty</p>
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
               <DialogClose asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><X className="w-4 h-4" /></Button></DialogClose>
            </div>
            <DialogTitle>Refine Broadcast Metadata</DialogTitle>
          </DialogHeader>
          {editNews && (
            <div className="space-y-6 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] font-bold uppercase text-slate-400">Headline</Label><Input value={editNews.title} onChange={e => setEditNews({...editNews, title: e.target.value})} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Scope</Label>
                    <Select value={editNews.scope} onValueChange={(val: any) => setEditNews({...editNews, scope: val, scopePriority: val === 'West Bengal' ? 1 : val === 'India' ? 2 : 3})}>
                       <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                       <SelectContent className="bg-white">
                          <SelectItem value="West Bengal">West Bengal</SelectItem>
                          <SelectItem value="India">National India</SelectItem>
                          <SelectItem value="World">World</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1"><Label className="text-[10px] font-bold uppercase text-slate-400">Source</Label><Input value={editNews.source} onChange={e => setEditNews({...editNews, source: e.target.value})} className="h-11 rounded-xl" /></div>
                   <div className="space-y-1"><Label className="text-[10px] font-bold uppercase text-slate-400">URL</Label><Input value={editNews.url} onChange={e => setEditNews({...editNews, url: e.target.value})} className="h-11 rounded-xl" /></div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Narrative</Label>
                  <Textarea value={editNews.content} onChange={e => setEditNews({...editNews, content: e.target.value})} className="rounded-xl min-h-[150px]" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Label className="font-bold uppercase text-[10px] tracking-widest">Active Broadcast</Label>
                    <Switch checked={editNews.isActive} onCheckedChange={val => setEditNews({...editNews, isActive: val})} />
                </div>
                <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-2xl mt-4">Commit Profile Refresh</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}
