'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Search, Trash2, Loader2, Newspaper,
  Zap, Globe, BrainCircuit, X, Languages, RefreshCw
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription as DialogDesc, DialogClose
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { syncNews, type SyncNewsOutput } from '@/ai/flows/sync-news-flow';
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
      const result = await syncNews({ context: "Manual harvest request" });
      if (!result || result.news.length === 0) {
        let errorMsg = "Zero results.";
        if (result?.diagnostics?.errorSummary?.includes('404')) errorMsg = "AI Model currently unavailable.";
        else if (result?.diagnostics?.errorSummary?.includes('429')) errorMsg = "Rate limit exceeded.";
        throw new Error(errorMsg);
      }
      setHarvestResult(result);
      setIsViewingSuggestions(true);
      toast({ title: "Harvest Complete", description: `Found ${result.news.length} items.` });
    } catch (e: any) {
      console.error("[HARVEST-UI] Error:", e);
      toast({ 
        variant: "destructive", 
        title: "Harvest Failed", 
        description: e.message 
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
      toast({ title: "Authorized", description: "Article is now live." });
    } finally { 
      setIsActionLoading(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'current_news', id)).then(() => toast({ title: "Purged" }));
  };

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-headline font-bold">News <span className="text-accent italic">Governance</span></h1>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Model: Gemini 1.5 Flash (Industrial)</p>
          </div>
          <div className="flex gap-3">
             <Button onClick={handleFetchAiSuggestions} disabled={isSyncing} className="bg-primary hover:bg-secondary h-11 px-6 rounded-xl font-bold gap-2">
                {isSyncing ? <Loader2 className="animate-spin w-4 h-4" /> : <BrainCircuit className="w-4 h-4 text-accent" />} Trigger Harvest
             </Button>
             <Button onClick={() => setIsAddDialogOpen(true)} className="bg-accent text-primary font-bold rounded-xl h-11 px-8 hover:bg-secondary">Manual Entry</Button>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-5xl">
         <div className="relative w-full max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Filter broadcast..." className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900" value={search} onChange={e => setSearch(e.target.value)} />
         </div>

         {dataLoading ? (
           <div className="text-center py-20"><Loader2 className="animate-spin w-10 h-10 text-accent mx-auto" /></div>
         ) : (
           <div className="grid gap-6">
             {newsItems?.filter(n => (n.originalEnglish?.title || n.title || '').toLowerCase().includes(search.toLowerCase())).map((n: any) => (
               <Card key={n.id} className="rounded-3xl overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900 group">
                  <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-stretch">
                       <div className="md:w-40 text-center flex flex-col items-center justify-center shrink-0">
                          <Badge className="mb-2 bg-primary text-white">{n.scope}</Badge>
                          <span className="text-[8px] font-black uppercase text-slate-400">{n.translationStatus}</span>
                       </div>
                       <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                             <h3 className="text-xl font-bold">{n.originalEnglish?.title || n.title}</h3>
                             <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-3 italic">"{n.originalEnglish?.content || n.content}"</p>
                          <div className="pt-4 border-t flex justify-between items-center text-[9px] font-black text-slate-400 uppercase">
                             <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {n.source}</span>
                             <Badge variant="outline" className="text-[7px]">{n.originalEnglish?.category || n.category}</Badge>
                          </div>
                       </div>
                  </CardContent>
               </Card>
             ))}
           </div>
         )}
      </section>

      <Dialog open={isViewingSuggestions} onOpenChange={setIsViewingSuggestions}>
         <DialogContent className="max-w-4xl rounded-[3rem] p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 h-[85vh] flex flex-col border-none shadow-2xl">
            <div className="p-8 bg-slate-900 text-white border-b-4 border-accent/20">
               <DialogTitle className="text-2xl font-headline font-bold">Harvest Review Feed</DialogTitle>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
               {harvestResult?.news.map((item, idx) => (
                 <Card key={idx} className="rounded-3xl p-8 bg-white dark:bg-slate-900">
                    <div className="grid md:grid-cols-2 gap-12">
                       <div className="space-y-4">
                          <Badge variant="outline">English</Badge>
                          <h4 className="font-bold">{item.originalEnglish.title}</h4>
                          <p className="text-xs text-slate-500 italic">"{item.originalEnglish.content}"</p>
                       </div>
                       <div className="space-y-4 border-l pl-12">
                          <Badge className="bg-emerald-500">Bengali</Badge>
                          <h4 className="font-bold text-emerald-700">{item.bengaliTranslation.title}</h4>
                          <p className="text-xs text-slate-600 italic">"{item.bengaliTranslation.content}"</p>
                       </div>
                    </div>
                    <div className="mt-8 pt-6 border-t flex justify-between items-center">
                       <span className="text-[9px] font-bold text-slate-400 uppercase">{item.source} • {item.scope}</span>
                       <Button onClick={() => publishSuggestion(item)} size="sm" className="bg-primary rounded-xl h-10 px-6">Publish Article</Button>
                    </div>
                 </Card>
               ))}
            </div>
         </DialogContent>
      </Dialog>
    </main>
  );
}
