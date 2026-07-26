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
import { 
  Plus, Search, Trash2, Loader2, Newspaper,
  Zap, Globe, BrainCircuit, X, Languages, AlertTriangle, ShieldCheck
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { syncNews, type SyncNewsOutput } from '@/ai/flows/sync-news-flow';
import { cn } from '@/lib/utils';

export default function InternalNewsManagement() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [harvestResult, setHarvestResult] = useState<SyncNewsOutput | null>(null);
  const [isViewingSuggestions, setIsViewingSuggestions] = useState(false);

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
      const result = await syncNews({ context: "Manual audit harvest" });
      if (!result || result.news.length === 0) {
        throw new Error(result?.diagnostics?.errorSummary || "Harvest yielded zero intelligence results.");
      }
      setHarvestResult(result);
      setIsViewingSuggestions(true);
      toast({ title: "Harvest Complete", description: `Found ${result.news.length} items via ${result.diagnostics.model}.` });
    } catch (e: any) {
      console.error("[HARVEST-UI] Diagnostic Error:", e);
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
    } catch (e) {
      toast({ variant: "destructive", title: "Publication Failed" });
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
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Infrastructure Stability: Stable
            </p>
          </div>
          <div className="flex gap-3">
             <Button onClick={handleFetchAiSuggestions} disabled={isSyncing} className="bg-primary hover:bg-secondary h-11 px-6 rounded-xl font-bold gap-2 shadow-xl">
                {isSyncing ? <Loader2 className="animate-spin w-4 h-4" /> : <BrainCircuit className="w-4 h-4 text-accent" />} Trigger Harvest Audit
             </Button>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-5xl">
         <div className="relative w-full max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Filter registry..." className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 shadow-sm" value={search} onChange={e => setSearch(e.target.value)} />
         </div>

         {dataLoading ? (
           <div className="text-center py-20"><Loader2 className="animate-spin w-10 h-10 text-accent mx-auto" /></div>
         ) : (
           <div className="grid gap-6">
             {newsItems?.filter(n => (n.originalEnglish?.title || n.title || '').toLowerCase().includes(search.toLowerCase())).map((n: any) => (
               <Card key={n.id} className="rounded-3xl overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900 group">
                  <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-stretch">
                       <div className="md:w-40 text-center flex flex-col items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                          <Badge className="mb-2 bg-primary text-white">{n.scope || 'India'}</Badge>
                          <span className={cn("text-[8px] font-black uppercase tracking-tighter", n.translationStatus === 'Success' ? 'text-emerald-500' : 'text-slate-400')}>
                            {n.translationStatus || 'Verified'}
                          </span>
                       </div>
                       <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                             <h3 className="text-xl font-bold">{n.originalEnglish?.title || n.title}</h3>
                             <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-3 italic">"{n.originalEnglish?.content || n.content}"</p>
                          <div className="pt-4 border-t flex justify-between items-center text-[9px] font-black text-slate-400 uppercase">
                             <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-accent" /> {n.source}</span>
                             <Badge variant="outline" className="text-[7px] border-slate-100">{n.originalEnglish?.category || n.category}</Badge>
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
               <DialogTitle className="text-2xl font-headline font-bold">Registry Audit review</DialogTitle>
               <div className="flex items-center gap-4 mt-2">
                 <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">Model: {harvestResult?.diagnostics.model}</Badge>
                 <Badge variant="outline" className="text-accent border-accent/30">Yield: {harvestResult?.diagnostics.yield} Articles</Badge>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
               {harvestResult?.news.map((item, idx) => (
                 <Card key={idx} className="rounded-3xl p-8 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="grid md:grid-cols-2 gap-12">
                       <div className="space-y-4">
                          <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-blue-500">EN</Badge>
                             <span className="text-[8px] font-bold text-slate-400 uppercase">Original Broadcast</span>
                          </div>
                          <h4 className="font-bold text-lg leading-tight">{item.originalEnglish.title}</h4>
                          <p className="text-xs text-slate-500 italic leading-relaxed">"{item.originalEnglish.content}"</p>
                       </div>
                       <div className="space-y-4 border-l pl-12">
                          <div className="flex items-center gap-2">
                             <Badge className="bg-emerald-500">BN</Badge>
                             <span className="text-[8px] font-bold text-emerald-500 uppercase">Translation Result</span>
                          </div>
                          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-lg leading-tight">{item.bengaliTranslation.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">"{item.bengaliTranslation.content}"</p>
                       </div>
                    </div>
                    <div className="mt-8 pt-6 border-t flex justify-between items-center">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.source} • {item.scope}</span>
                       <Button onClick={() => publishSuggestion(item)} size="sm" className="bg-primary text-white rounded-xl h-10 px-8 hover:bg-secondary transition-all font-bold uppercase text-[10px] tracking-widest">Authorize & Go Live</Button>
                    </div>
                 </Card>
               ))}
            </div>
         </DialogContent>
      </Dialog>
    </main>
  );
}
