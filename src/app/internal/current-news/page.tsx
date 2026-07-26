
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDocs, writeBatch, where } from 'firebase/firestore';
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
  Clock, X, Zap, Globe, AlertTriangle, TrendingUp, BrainCircuit, Bug, CheckCircle2
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
    title: '', content: '', source: 'The Hindu', url: '', 
    author: '', category: 'Human Rights', scope: 'India' as any,
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/internal/login');
  }, [user, authLoading, router]);

  const newsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'current_news'));
  }, [db, user]);

  const { data: newsItems, loading: dataLoading } = useCollection(newsQuery);

  const handleFetchAiSuggestions = async () => {
    setIsSyncing(true);
    setHarvestResult(null);
    try {
      const result = await syncNews({ context: "Manual harvest request" });
      setHarvestResult(result);
      setIsViewingSuggestions(true);
      toast({ title: "Harvest Complete", description: `${result.news.length} items with automated translation.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Harvest Failed" });
    } finally { setIsSyncing(false); }
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
      toast({ title: "Broadcast Live" });
    } catch (e) { toast({ variant: "destructive", title: "Publication Failed" }); }
    finally { setIsActionLoading(false); }
  };

  const handleAddManual = async () => {
    if (!db) return;
    setIsActionLoading(true);
    const data = {
      originalEnglish: { title: newNews.title, content: newNews.content, category: newNews.category },
      bengaliTranslation: { title: newNews.title, content: newNews.content, category: newNews.category },
      translationStatus: "Pending" as const,
      source: newNews.source,
      url: newNews.url,
      publishedAt: format(new Date(), 'MMM dd, yyyy'),
      author: newNews.author,
      scope: newNews.scope,
      scopePriority: newNews.scope === 'West Bengal' ? 1 : 2,
      isActive: true,
      priority: 1,
      createdAt: serverTimestamp()
    };
    addDoc(collection(db, 'current_news'), data).then(() => {
      setIsAddDialogOpen(false);
      toast({ title: "Manual Entry Logged" });
    }).finally(() => setIsActionLoading(false));
  };

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-headline font-bold">News <span className="text-accent italic">Governance</span></h1>
            <p className="text-slate-400 text-xs uppercase font-black">Translation-Integrated Intelligence Hub</p>
          </div>
          <div className="flex gap-3">
             <Button onClick={handleFetchAiSuggestions} disabled={isSyncing} className="bg-primary hover:bg-secondary h-11 px-6 rounded-xl font-bold gap-2">
                {isSyncing ? <Loader2 className="animate-spin" /> : <BrainCircuit className="text-accent" />} Trigger Global Harvest
             </Button>
             <Button onClick={() => setIsAddDialogOpen(true)} className="bg-accent text-primary font-bold rounded-xl h-11 px-8">Manual Entry</Button>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
         {dataLoading ? <Loader2 className="animate-spin mx-auto" /> : (
           <div className="grid gap-6 max-w-5xl mx-auto">
             {(newsItems || []).map((n: any) => (
               <Card key={n.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900">
                  <div className="flex flex-col md:flex-row items-stretch">
                     <div className="p-8 md:w-56 bg-slate-50 dark:bg-slate-800 text-center flex flex-col items-center justify-center shrink-0">
                        <Badge className="mb-2">{n.scope}</Badge>
                        <span className="text-[8px] font-black uppercase text-slate-400">Translation: {n.translationStatus}</span>
                     </div>
                     <div className="flex-1 p-8 space-y-4">
                        <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{n.originalEnglish?.title || n.title}</h3>
                        <p className="text-sm text-slate-500 italic">"{n.originalEnglish?.content || n.content}"</p>
                        <div className="flex justify-end gap-2">
                           <Button variant="ghost" size="icon" onClick={() => deleteDoc(doc(db, 'current_news', n.id))} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4.5 h-4.5" /></Button>
                        </div>
                     </div>
                  </div>
               </Card>
             ))}
           </div>
         )}
      </section>

      {/* AI Suggestions View */}
      <Dialog open={isViewingSuggestions} onOpenChange={setIsViewingSuggestions}>
         <DialogContent className="max-w-4xl rounded-[3rem] p-0 overflow-hidden bg-slate-50 h-[85vh] flex flex-col border-none shadow-2xl">
            <div className="p-8 bg-slate-900 text-white border-b-4 border-accent/20 shrink-0">
               <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                 <BrainCircuit className="text-accent" /> AI Translation Feed
               </DialogTitle>
               <DialogDesc className="text-slate-400">Review harvested articles with pre-generated Bengali translations.</DialogDesc>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
               {harvestResult?.news.map((item, idx) => (
                 <Card key={idx} className="rounded-3xl p-6 border-none shadow-md bg-white">
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <Badge variant="outline" className="text-[8px] uppercase">Original English</Badge>
                          <h4 className="font-bold text-primary">{item.originalEnglish.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-3">{item.originalEnglish.content}</p>
                       </div>
                       <div className="space-y-2 border-l pl-8">
                          <Badge className="bg-emerald-500 text-white text-[8px] uppercase">Bengali (Verified)</Badge>
                          <h4 className="font-bold text-emerald-700">{item.bengaliTranslation.title}</h4>
                          <p className="text-xs text-slate-600 line-clamp-3 italic">{item.bengaliTranslation.content}</p>
                       </div>
                    </div>
                    <div className="mt-6 pt-4 border-t flex justify-between items-center">
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.source}</span>
                       <Button onClick={() => publishSuggestion(item)} size="sm" className="bg-primary text-white font-bold rounded-xl px-6 h-9">Authorize Broadcast</Button>
                    </div>
                 </Card>
               ))}
            </div>
         </DialogContent>
      </Dialog>

      {/* Manual Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-8">
           <DialogHeader><DialogTitle>Manual Broadcast Entry</DialogTitle></DialogHeader>
           <div className="space-y-4 py-4">
              <div className="space-y-1"><Label>Headline</Label><Input value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} /></div>
              <div className="space-y-1"><Label>Category</Label><Input value={newNews.category} onChange={e => setNewNews({...newNews, category: e.target.value})} /></div>
              <div className="space-y-1"><Label>Content</Label><Textarea value={newNews.content} onChange={e => setNewNews({...newNews, content: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1"><Label>Source</Label><Input value={newNews.source} onChange={e => setNewNews({...newNews, source: e.target.value})} /></div>
                 <div className="space-y-1"><Label>Scope</Label>
                    <Select value={newNews.scope} onValueChange={v => setNewNews({...newNews, scope: v as any})}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white"><SelectItem value="West Bengal">West Bengal</SelectItem><SelectItem value="India">India</SelectItem><SelectItem value="World">World</SelectItem></SelectContent></Select>
                 </div>
              </div>
              <Button onClick={handleAddManual} disabled={isActionLoading} className="w-full h-12 rounded-xl bg-primary text-white font-bold">Publish Manual Entry</Button>
           </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
