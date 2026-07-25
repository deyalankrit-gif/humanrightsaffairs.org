
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Calendar,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription as DialogDesc,
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
  
  // AI Selection States
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isViewingSuggestions, setIsViewingSuggestions] = useState(false);

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

  const handleFetchAiSuggestions = async () => {
    setIsSyncing(true);
    try {
      const output = await syncNews({ context: `Manual selection request at ${new Date().toISOString()}` });
      if (output && output.news) {
        setAiSuggestions(output.news);
        setIsViewingSuggestions(true);
        toast({ title: "Intelligence Fetched", description: `${output.news.length} AI suggestions are ready for review.` });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Could not reach national news servers." });
    } finally {
      setIsSyncing(false);
    }
  };

  const publishSuggestion = async (suggestion: any) => {
    if (!db) return;
    setIsActionLoading(true);
    try {
      const newsData = {
        ...suggestion,
        isActive: true,
        priority: 1,
        createdAt: serverTimestamp(),
        publishedBy: user?.email,
        isAiGenerated: true
      };

      await addDoc(collection(db, 'current_news'), newsData);
      
      // Update Registry Meta
      await updateDoc(doc(db, 'current_news_state', 'registry'), {
        lastSyncAt: serverTimestamp(),
        updatedBy: user?.email
      });

      setAiSuggestions(prev => prev.filter(s => s.url !== suggestion.url));
      toast({ title: "Broadcast Published", description: "AI intelligence has been committed to the live feed." });
      
      if (aiSuggestions.length <= 1) {
        setIsViewingSuggestions(false);
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Publication Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!db) return;
    if (!newNews.title || !newNews.content) {
      toast({ variant: "destructive", title: "Validation Error", description: "Title and Content are required." });
      return;
    }
    
    setIsActionLoading(true);
    addDoc(collection(db, 'current_news'), { ...newNews, createdAt: serverTimestamp(), publishedBy: user?.email })
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

  const getScopeBadge = (scope: string) => {
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
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-emerald-500/30 tracking-[0.2em]">
              <TrendingUp className="w-2.5 h-2.5 animate-pulse" /> Global Intelligence Terminal
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">News <span className="text-accent italic">Governance</span></h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-black text-slate-400 uppercase">
               <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-accent" /> Last Sync: {meta?.lastSyncAt?.toDate ? format(meta.lastSyncAt.toDate(), 'hh:mm a') : 'Never'}</span>
               <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Automatic refresh active (6h)</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
             <Button 
              onClick={handleFetchAiSuggestions} 
              disabled={isSyncing}
              className="bg-primary text-white hover:bg-secondary h-11 px-6 rounded-xl font-bold gap-2 shadow-xl shadow-primary/20 border border-white/10"
             >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4 text-accent" />}
                Fetch AI Suggestions
             </Button>
             
             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all">
                    <Plus className="w-4 h-4" /> Create Manual Entry
                  </Button>
                </DialogTrigger>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl [&>button]:hidden">
                  <DialogHeader className="relative">
                    <div className="absolute right-0 top-0">
                      <DialogClose asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><X className="w-4 h-4" /></Button></DialogClose>
                    </div>
                    <DialogTitle className="text-2xl font-headline font-bold">Institutional Broadcast Entry</DialogTitle>
                    <DialogDesc>Manual news entries will override AI-synced content if priority is higher.</DialogDesc>
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

      {/* AI Suggestions View (Active Options for Selection) */}
      <Dialog open={isViewingSuggestions} onOpenChange={setIsViewingSuggestions}>
         <DialogContent className="max-w-4xl rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col h-[85vh]">
            <DialogHeader className="bg-primary p-8 text-white border-b-4 border-accent/20 shrink-0 text-left sm:text-left">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                   <BrainCircuit className="w-6 h-6 text-accent animate-pulse" />
                   <Badge className="bg-accent text-primary font-black uppercase text-[10px] tracking-widest">AI Intelligence Queue</Badge>
                 </div>
                 <button onClick={() => setIsViewingSuggestions(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
               </div>
               <DialogTitle className="text-3xl font-headline font-bold">AI News <span className="text-accent italic">Selection</span></DialogTitle>
               <DialogDesc className="text-white/60 font-medium">Review and selectively publish identified human rights intelligence from across the internet.</DialogDesc>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               <div className="grid gap-6">
                  {aiSuggestions.map((suggestion, idx) => (
                    <Card key={idx} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 group">
                       <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row items-stretch">
                             <div className="p-6 md:w-40 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/50">
                                <Badge className={cn("text-[8px] font-black uppercase px-2 py-1 mb-2", getScopeBadge(suggestion.scope))}>
                                  {suggestion.scope}
                                </Badge>
                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">Rank: {suggestion.scopePriority}</span>
                             </div>
                             <div className="flex-1 p-6 space-y-4">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-accent" /> {suggestion.publishedAt}</span>
                                      <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-accent" /> {suggestion.source}</span>
                                   </div>
                                   <h4 className="text-xl font-bold text-primary dark:text-white leading-tight">{suggestion.title}</h4>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 italic text-xs text-slate-600 leading-relaxed">
                                   "{suggestion.content}"
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                   <a href={suggestion.url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1 hover:underline">
                                      <LinkIcon className="w-3 h-3" /> Examine Source
                                   </a>
                                   <div className="flex gap-2">
                                      <Button variant="ghost" onClick={() => setAiSuggestions(prev => prev.filter((_, i) => i !== idx))} className="h-9 px-4 rounded-xl text-slate-400 hover:text-red-500 font-bold text-[10px] uppercase">Discard</Button>
                                      <Button onClick={() => publishSuggestion(suggestion)} disabled={isActionLoading} className="h-9 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-widest gap-2">
                                         {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                         Publish Now
                                      </Button>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                  ))}
               </div>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 border-t flex justify-between items-center shrink-0">
               <p className="text-[10px] font-black uppercase text-slate-400">{aiSuggestions.length} Suggestions Pending</p>
               <Button variant="outline" onClick={() => setIsViewingSuggestions(false)} className="rounded-xl h-9 px-8 font-bold text-[10px] uppercase">Review Later</Button>
            </div>
         </DialogContent>
      </Dialog>

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
                         <Badge className={cn("text-[9px] font-black px-3 py-1 uppercase border-none mb-3", getScopeBadge(n.scope))}>
                           {n.scope}
                         </Badge>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                           <Clock className="w-2.5 h-2.5" /> Priority: {n.scopePriority}
                         </p>
                         {n.isAiGenerated && (
                           <div className="mt-3 flex items-center gap-1 text-[8px] font-black text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded-full">
                              <Sparkles className="w-2.5 h-2.5" /> AI Sourced
                           </div>
                         )}
                         {!n.isActive && <Badge variant="destructive" className="mt-2 text-[8px] font-black">TERMINATED</Badge>}
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
                              <div className="flex items-center justify-between">
                                 {n.url && (
                                   <a href={n.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-500 hover:underline">
                                      <LinkIcon className="w-3 h-3" /> Original Article Source
                                   </a>
                                 )}
                                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Author: {n.publishedBy || 'System'}</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 shrink-0">
                              <Button variant="outline" size="sm" onClick={() => { setEditNews(n); setIsEditDialogOpen(true); }} className="h-10 px-5 rounded-xl text-[10px] font-bold border-slate-200 hover:bg-accent hover:text-primary hover:border-accent transition-all">Modify</Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)} className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5" /></Button>
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
                <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-2xl mt-4 hover:bg-secondary transition-all">Commit Profile Refresh</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}
