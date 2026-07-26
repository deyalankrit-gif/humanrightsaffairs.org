'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDocs, writeBatch, where, orderBy } from 'firebase/firestore';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Search, Edit, Trash2, Loader2, ShieldCheck, Newspaper,
  Clock, X, Zap, Globe, AlertTriangle, TrendingUp, BrainCircuit, Bug, CheckCircle2,
  Languages,
  RefreshCw
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogDescription as DialogDesc, DialogClose
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { syncNews, type SyncNewsOutput } from '@/ai/flows/sync-news-flow';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';

/**
 * Internal News Management: Central terminal for managing the automated news broadcast.
 * Features: Global Harvest (AI-powered ingestion), Translation Management, and Manual Overrides.
 */
export default function InternalNewsManagement() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [harvestResult, setHarvestResult] = useState<SyncNewsOutput | null>(null);
  const [isViewingSuggestions, setIsViewingSuggestions] = useState(false);

  const [newNews, setNewNews] = useState({
    title: '', content: '', source: 'Manual Entry', url: '', 
    author: '', category: 'Human Rights', scope: 'India' as any,
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/internal/login');
  }, [user, authLoading, router]);

  const newsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'current_news'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: newsItems, loading: dataLoading } = useCollection(newsQuery);

  const handleFetchAiSuggestions = async () => {
    setIsSyncing(true);
    setHarvestResult(null);
    try {
      const result = await syncNews({ context: "Manual harvest request via Root Terminal" });
      if (!result || result.news.length === 0) {
        throw new Error(result?.diagnostics?.errorSummary || "Harvest yielded zero intelligence results.");
      }
      setHarvestResult(result);
      setIsViewingSuggestions(true);
      toast({ title: "Harvest Complete", description: `Captured ${result.news.length} items with automated translation.` });
    } catch (e: any) {
      console.error("Global Harvest Error:", e);
      toast({ 
        variant: "destructive", 
        title: "Harvest Failed", 
        description: e.message || "The intelligence engine timed out. Please try again in 30 seconds." 
      });
    } finally { 
      setIsSyncing(false); 
    }
  };

  const publishSuggestion = async (suggestion: any) => {
    if (!db) return;
    setIsActionLoading(true);
    try {
      await addDoc(collection(db, 'current_news'), {
        ...suggestion,
        isActive: true,
        priority: 1,
        createdAt: serverTimestamp(),
        publishedBy: user?.email
      });
      if (harvestResult) {
        setHarvestResult({ ...harvestResult, news: harvestResult.news.filter(s => s.url !== suggestion.url) });
      }
      toast({ title: "Broadcast Authorized", description: "Article is now live on the public mission portal." });
    } catch (e) { 
      toast({ variant: "destructive", title: "Publication Error" }); 
    } finally { 
      setIsActionLoading(false); 
    }
  };

  const handleAddManual = async () => {
    if (!db) return;
    if (!newNews.title || !newNews.content) {
      toast({ variant: "destructive", title: "Incomplete Data", description: "Headline and Content are mandatory." });
      return;
    }
    setIsActionLoading(true);
    const data = {
      originalEnglish: { title: newNews.title, content: newNews.content, category: newNews.category },
      bengaliTranslation: { title: newNews.title, content: newNews.content, category: newNews.category },
      translationStatus: "Pending" as const,
      source: newNews.source,
      url: newNews.url || "https://hrat-india.org",
      publishedAt: format(new Date(), 'MMM dd, yyyy'),
      author: newNews.author || user?.email,
      scope: newNews.scope,
      scopePriority: newNews.scope === 'West Bengal' ? 1 : newNews.scope === 'India' ? 2 : 3,
      isActive: true,
      priority: 1,
      createdAt: serverTimestamp()
    };
    addDoc(collection(db, 'current_news'), data)
      .then(() => {
        setIsAddDialogOpen(false);
        setNewNews({ title: '', content: '', source: 'Manual Entry', url: '', author: '', category: 'Human Rights', scope: 'India' });
        toast({ title: "Manual Entry Logged" });
      })
      .finally(() => setIsActionLoading(false));
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'current_news', id)).then(() => toast({ title: "Article Purged" }));
  };

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-headline font-bold">News <span className="text-accent italic">Governance</span></h1>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 text-accent" /> Autonomous Intelligence Hub
            </p>
          </div>
          <div className="flex gap-3">
             <Button onClick={handleFetchAiSuggestions} disabled={isSyncing} className="bg-primary hover:bg-secondary h-11 px-6 rounded-xl font-bold gap-2 shadow-xl">
                {isSyncing ? <Loader2 className="animate-spin w-4 h-4" /> : <BrainCircuit className="w-4 h-4 text-accent" />} Trigger Global Harvest
             </Button>
             <Button onClick={() => setIsAddDialogOpen(true)} className="bg-accent text-primary font-bold rounded-xl h-11 px-8 hover:bg-secondary hover:text-white transition-all">Manual Entry</Button>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
         <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
            <div className="relative w-full max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <Input placeholder="Filter active broadcast..." className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
         </div>

         {dataLoading ? (
           <div className="text-center py-20"><Loader2 className="animate-spin w-10 h-10 text-accent mx-auto" /></div>
         ) : (
           <div className="grid gap-6 max-w-5xl mx-auto">
             {(newsItems || []).filter(n => (n.originalEnglish?.title || n.title || '').toLowerCase().includes(search.toLowerCase())).map((n: any) => (
               <Card key={n.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900 group hover:shadow-xl transition-all duration-500">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                       <div className="p-8 md:w-56 bg-slate-50 dark:bg-slate-800 text-center flex flex-col items-center justify-center shrink-0 border-r border-slate-100 dark:border-slate-800">
                          <Badge className="mb-2 bg-primary text-white font-black text-[8px] uppercase tracking-widest px-3">{n.scope}</Badge>
                          <div className="flex items-center gap-1.5 mt-2">
                             <Languages className="w-3 h-3 text-emerald-500" />
                             <span className="text-[8px] font-black uppercase text-slate-400">Status: {n.translationStatus}</span>
                          </div>
                          <p className="text-[8px] font-bold text-slate-400 mt-4 uppercase tracking-tighter">{n.publishedAt || 'Real-time'}</p>
                       </div>
                       <div className="flex-1 p-8 space-y-4">
                          <div className="flex justify-between items-start gap-4">
                             <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{n.originalEnglish?.title || n.title}</h3>
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)} className="text-slate-300 hover:text-red-500 rounded-xl"><Trash2 className="w-4.5 h-4.5" /></Button>
                             </div>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-3">
                            "{n.originalEnglish?.content || n.content}"
                          </p>
                          <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Globe className="w-3 h-3" /> {n.source}</span>
                             <Badge variant="outline" className="text-[7px] border-slate-100 uppercase">{n.originalEnglish?.category || n.category}</Badge>
                          </div>
                       </div>
                    </div>
                  </CardContent>
               </Card>
             ))}
             {(!newsItems || newsItems.length === 0) && (
               <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 opacity-30">
                  <Newspaper className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-sm font-bold uppercase tracking-widest">Broadcast Registry Offline</p>
               </div>
             )}
           </div>
         )}
      </section>

      {/* AI Suggestions Review View */}
      <Dialog open={isViewingSuggestions} onOpenChange={setIsViewingSuggestions}>
         <DialogContent className="max-w-4xl rounded-[3rem] p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 h-[85vh] flex flex-col border-none shadow-2xl">
            <div className="p-8 bg-slate-900 text-white border-b-4 border-accent/20 shrink-0">
               <div className="flex justify-between items-center mb-2">
                 <Badge className="bg-accent text-primary font-black text-[9px] tracking-widest">PENDING VERIFICATION</Badge>
                 <DialogClose asChild><button className="text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button></DialogClose>
               </div>
               <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                 <BrainCircuit className="text-accent" /> AI Translation Feed
               </DialogTitle>
               <DialogDesc className="text-slate-400 text-xs mt-1">Review harvested intelligence and Bengali translations before public broadcast.</DialogDesc>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
               {harvestResult?.news.map((item, idx) => (
                 <Card key={idx} className="rounded-3xl p-8 border-none shadow-md bg-white dark:bg-slate-900">
                    <div className="grid md:grid-cols-2 gap-12">
                       <div className="space-y-4">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">EN</div>
                             <Badge variant="outline" className="text-[8px] uppercase tracking-widest text-slate-400">Source Feed</Badge>
                          </div>
                          <h4 className="font-bold text-primary dark:text-white leading-tight">{item.originalEnglish.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-4 italic">"{item.originalEnglish.content}"</p>
                       </div>
                       <div className="space-y-4 border-l border-slate-100 dark:border-slate-800 pl-12">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">BN</div>
                             <Badge className="bg-emerald-500 text-white text-[8px] uppercase tracking-widest border-none">AI Translation</Badge>
                          </div>
                          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 leading-tight">{item.bengaliTranslation.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4 font-medium italic">"{item.bengaliTranslation.content}"</p>
                       </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                       <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {item.source}</span>
                          <span className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> {item.scope}</span>
                       </div>
                       <Button onClick={() => publishSuggestion(item)} size="sm" className="w-full md:w-auto bg-primary text-white font-bold rounded-xl px-10 h-10 hover:bg-secondary transition-all shadow-lg">Authorize Broadcast</Button>
                    </div>
                 </Card>
               ))}
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-center shrink-0">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">National News Curation Terminal</p>
            </div>
         </DialogContent>
      </Dialog>

      {/* Manual Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
           <div className="bg-slate-900 p-8 text-white">
              <DialogTitle className="text-2xl font-headline font-bold">Manual Broadcast Entry</DialogTitle>
              <DialogDesc className="text-slate-400 text-xs uppercase font-bold tracking-widest mt-1">Bypassing AI Ingestion</DialogDesc>
           </div>
           <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-bold uppercase text-slate-400">Headline / শিরোনাম</Label>
                 <Input value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Category</Label><Input value={newNews.category} onChange={e => setNewNews({...newNews, category: e.target.value})} className="h-11 rounded-xl" /></div>
                 <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Source Name</Label><Input value={newNews.source} onChange={e => setNewNews({...newNews, source: e.target.value})} className="h-11 rounded-xl" /></div>
              </div>
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-bold uppercase text-slate-400">Content / বিষয়বস্তু</Label>
                 <Textarea value={newNews.content} onChange={e => setNewNews({...newNews, content: e.target.value})} className="rounded-xl min-h-[120px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Source URL</Label><Input placeholder="https://..." value={newNews.url} onChange={e => setNewNews({...newNews, url: e.target.value})} className="h-11 rounded-xl" /></div>
                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Broadcast Scope</Label>
                    <Select value={newNews.scope} onValueChange={v => setNewNews({...newNews, scope: v as any})}>
                       <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                       <SelectContent className="bg-white">
                          <SelectItem value="West Bengal">West Bengal</SelectItem>
                          <SelectItem value="India">India (National)</SelectItem>
                          <SelectItem value="World">World (International)</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>
              <Button onClick={handleAddManual} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white shadow-xl shadow-accent/20 transition-all">Publish Manual Entry</Button>
           </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
