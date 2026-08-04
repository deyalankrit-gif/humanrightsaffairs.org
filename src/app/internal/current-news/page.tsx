'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, deleteDoc, doc, serverTimestamp, orderBy, writeBatch, getDocs, where, setDoc } from 'firebase/firestore';
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
  Zap, Globe, BrainCircuit, X, Languages, AlertTriangle, ShieldCheck,
  Clock, Database, ListChecks, Info
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
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
import { useToast } from '@/hooks/use-toast';
import { syncNews, type SyncNewsOutput } from '@/ai/flows/sync-news-flow';
import { CurrentNews } from '@/components/current-news';
import { cn } from '@/lib/utils';

/**
 * Internal News Management: Mission Control for Homepage Broadcast.
 * Updated: Gemini 2.0 Flash integration and root intelligence overlay.
 */
export default function InternalNewsManagement() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [harvestResult, setHarvestResult] = useState<SyncNewsOutput | null>(null);
  const [isViewingSuggestions, setIsViewingSuggestions] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com';

  const [manualNews, setManualNews] = useState({
    titleEn: '',
    contentEn: '',
    categoryEn: 'Human Rights',
    titleBn: '',
    contentBn: '',
    categoryBn: 'মানবাধিকার',
    source: 'HRAT Official',
    url: '',
    scope: 'India',
    scopePriority: 2
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
    setIsActionLoading(true);
    try {
      const batch = writeBatch(db);
      
      const activeSnap = await getDocs(query(collection(db, 'current_news'), where('isActive', '==', true)));
      activeSnap.docs.forEach(d => batch.update(d.ref, { isActive: false }));

      const newDocRef = doc(collection(db, 'current_news'));
      batch.set(newDocRef, {
        ...suggestion,
        isActive: true,
        priority: 1,
        createdAt: serverTimestamp(),
        publishedBy: user?.email
      });

      batch.set(doc(db, 'current_news_state', 'registry'), {
        lastSyncAt: serverTimestamp(),
        status: "Manual Authorization"
      }, { merge: true });

      await batch.commit();

      if (harvestResult) {
        setHarvestResult({ ...harvestResult, news: harvestResult.news.filter(s => s.url !== suggestion.url) });
      }
      toast({ title: "Authorized", description: "Article is now live." });
      setIsViewingSuggestions(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Publication Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleManualPublish = async () => {
    if (!db || !manualNews.titleEn || !manualNews.contentEn) {
      toast({ variant: "destructive", title: "Validation Error", description: "English Title and Content are required." });
      return;
    }

    setIsActionLoading(true);
    try {
      const batch = writeBatch(db);

      const activeSnap = await getDocs(query(collection(db, 'current_news'), where('isActive', '==', true)));
      activeSnap.docs.forEach(d => batch.update(d.ref, { isActive: false }));

      const newDocRef = doc(collection(db, 'current_news'));
      batch.set(newDocRef, {
        originalEnglish: {
          title: manualNews.titleEn,
          content: manualNews.contentEn,
          category: manualNews.categoryEn
        },
        bengaliTranslation: {
          title: manualNews.titleBn || manualNews.titleEn,
          content: manualNews.contentBn || manualNews.contentEn,
          category: manualNews.categoryBn || 'সাধারণ'
        },
        translationStatus: manualNews.titleBn ? "Success" : "Pending",
        source: manualNews.source,
        url: manualNews.url || 'https://www.hrat-india.org',
        scope: manualNews.scope,
        scopePriority: manualNews.scopePriority,
        isActive: true,
        priority: 1,
        createdAt: serverTimestamp(),
        publishedBy: user?.email
      });

      batch.set(doc(db, 'current_news_state', 'registry'), {
        lastSyncAt: serverTimestamp(),
        status: "Manual Entry"
      }, { merge: true });

      await batch.commit();

      toast({ title: "Authorized", description: "Manual article is now live." });
      setIsManualEntryOpen(false);
      setManualNews({
        titleEn: '', contentEn: '', categoryEn: 'Human Rights',
        titleBn: '', contentBn: '', categoryBn: 'মানবাধিকার',
        source: 'HRAT Official', url: '', scope: 'India', scopePriority: 2
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
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
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Infrastructure Stability: Operational
            </p>
          </div>
          <div className="flex gap-3">
             <Button onClick={() => setIsManualEntryOpen(true)} variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 h-11 px-6 rounded-xl font-bold gap-2">
                <Plus className="w-4 h-4 text-accent" /> Add Manual Article
             </Button>
             <Button onClick={handleFetchAiSuggestions} disabled={isSyncing} className="bg-primary hover:bg-secondary h-11 px-6 rounded-xl font-bold gap-2 shadow-xl">
                {isSyncing ? <Loader2 className="animate-spin w-4 h-4" /> : <BrainCircuit className="w-4 h-4 text-accent" />} Trigger Harvest Audit
             </Button>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-5xl">
         
         <div className="mb-12 animate-in fade-in duration-700">
            <Card className="rounded-[2.5rem] bg-slate-950 border-none shadow-2xl overflow-hidden p-6 md:p-10 relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                     <h3 className="text-sm font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" /> Live Homepage Preview
                     </h3>
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Real-time synchronization active</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 font-black uppercase text-[8px] animate-pulse">Sync Terminal</Badge>
               </div>
               
               <div className="bg-primary/20 rounded-[2rem] p-4 border border-white/5 flex items-center justify-center min-h-[300px]">
                  <CurrentNews />
               </div>

               {isRoot && (
                 <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-1000 slide-in-from-bottom-2">
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-accent">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Sync Frequency</span>
                       </div>
                       <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                         Autonomous background harvest executes every <span className="text-white">2 Hours</span> to ensure legislative recency.
                       </p>
                    </div>
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-accent">
                          <Database className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Audited Sources</span>
                       </div>
                       <ul className="text-[11px] text-slate-400 font-bold space-y-1">
                          <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-700" /> Google News India (Nation)</li>
                          <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-700" /> The Hindu (Legal/Policy)</li>
                          <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-700" /> NDTV (Regional/WB)</li>
                       </ul>
                    </div>
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-accent">
                          <ListChecks className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Priority Logic</span>
                       </div>
                       <div className="space-y-2">
                          <div className="flex items-center gap-2">
                             <Badge className="bg-emerald-600 text-[7px] h-4">P1</Badge>
                             <span className="text-[10px] text-white font-bold">Regional Scope (West Bengal)</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Badge className="bg-primary text-[7px] h-4">P2</Badge>
                             <span className="text-[10px] text-slate-400 font-bold">Chronological Recency (India/World)</span>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </Card>
         </div>

         <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <h2 className="text-xl font-headline font-bold text-primary dark:text-white flex items-center gap-3">
               <Newspaper className="w-5 h-5 text-accent" /> Broadcast Registry
            </h2>
            <div className="relative w-full max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <Input placeholder="Filter registry..." className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 shadow-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
         </div>

         {dataLoading ? (
           <div className="text-center py-20"><Loader2 className="animate-spin w-10 h-10 text-accent mx-auto" /></div>
         ) : (
           <div className="grid gap-6">
             {(newsItems || []).filter(n => (n.originalEnglish?.title || n.title || '').toLowerCase().includes(search.toLowerCase())).map((n: any) => (
               <Card key={n.id} className={cn(
                 "rounded-3xl overflow-hidden border transition-all group",
                 n.isActive ? "bg-white dark:bg-slate-900 border-emerald-500/20 shadow-lg shadow-emerald-500/5" : "bg-white/60 dark:bg-slate-950/60 border-slate-100 dark:border-slate-800 grayscale opacity-60"
               )}>
                  <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-stretch">
                       <div className="md:w-40 text-center flex flex-col items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                          <Badge className={cn("mb-2", n.isActive ? "bg-emerald-600" : "bg-primary")}>{n.scope || 'India'}</Badge>
                          <span className={cn("text-[8px] font-black uppercase tracking-widest", n.isActive ? 'text-emerald-500' : 'text-slate-400')}>
                            {n.isActive ? 'Active Now' : 'Archive'}
                          </span>
                       </div>
                       <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                             <h3 className="text-xl font-bold">{n.originalEnglish?.title || n.title}</h3>
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                                 <AlertDialogHeader>
                                   <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                   <AlertDialogDescription>Are you sure you want to delete this item? This action may be irreversible. Please confirm before continuing.</AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => handleDelete(n.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">Delete</AlertDialogAction>
                                 </AlertDialogFooter>
                               </AlertDialogContent>
                             </AlertDialog>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-3 italic leading-relaxed">"{n.originalEnglish?.content || n.content}"</p>
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
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

      <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 flex flex-col max-h-[90vh]">
          <DialogHeader className="p-8 bg-slate-900 text-white shrink-0 border-b-4 border-accent/20">
            <DialogTitle className="text-2xl font-headline font-bold">Direct Broadcast Entry</DialogTitle>
            <DialogDescription className="text-slate-400 uppercase tracking-widest text-[10px] font-black">Institutional News Registry Terminal</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                <span className="w-6 h-px bg-accent" /> English Broadcast Metadata
              </h3>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Headline (EN)</Label>
                  <Input value={manualNews.titleEn} onChange={e => setManualNews({...manualNews, titleEn: e.target.value})} placeholder="Title in English..." className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Content / Summary (EN)</Label>
                  <Textarea value={manualNews.contentEn} onChange={e => setManualNews({...manualNews, contentEn: e.target.value})} placeholder="Detailed news in English..." className="min-h-[100px] rounded-xl" />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                <span className="w-6 h-px bg-emerald-500" /> Bengali Translation (Manual Override)
              </h3>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Headline (BN)</Label>
                  <Input value={manualNews.titleBn} onChange={e => setManualNews({...manualNews, titleBn: e.target.value})} placeholder="শিরোনাম বাংলায়..." className="h-11 rounded-xl border-emerald-100" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Content / Summary (BN)</Label>
                  <Textarea value={manualNews.contentBn} onChange={e => setManualNews({...manualNews, contentBn: e.target.value})} placeholder="সংবাদ বিবরণ বাংলায়..." className="min-h-[100px] rounded-xl border-emerald-100" />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                <span className="w-6 h-px bg-indigo-500" /> Scope & Logistics
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Geographic Scope</Label>
                  <Select value={manualNews.scope} onValueChange={v => setManualNews({...manualNews, scope: v, scopePriority: v === 'West Bengal' ? 1 : v === 'India' ? 2 : 3})}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="West Bengal">West Bengal</SelectItem>
                      <SelectItem value="India">National (India)</SelectItem>
                      <SelectItem value="World">International (World)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Official Source</Label>
                  <Input value={manualNews.source} onChange={e => setManualNews({...manualNews, source: e.target.value})} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Reference URL (Optional)</Label>
                  <Input value={manualNews.url} onChange={e => setManualNews({...manualNews, url: e.target.value})} placeholder="https://..." className="h-11 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-900 border-t shrink-0">
            <DialogClose asChild><Button variant="ghost" className="h-12 px-6 rounded-xl font-bold text-slate-500">Abort</Button></DialogClose>
            <Button onClick={handleManualPublish} disabled={isActionLoading} className="h-12 px-10 rounded-xl bg-accent text-primary font-bold shadow-xl shadow-accent/20">
              {isActionLoading ? <Loader2 className="animate-spin" /> : "Authorize Broadcast"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewingSuggestions} onOpenChange={setIsViewingSuggestions}>
         <DialogContent className="max-w-4xl rounded-[3rem] p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 h-[85vh] flex flex-col border-none shadow-2xl">
            <div className="p-8 bg-slate-900 text-white border-b-4 border-accent/20">
               <DialogTitle className="text-2xl font-headline font-bold">Registry Audit Review</DialogTitle>
               <div className="flex items-center gap-4 mt-2">
                 <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">Model: gemini-2.0-flash</Badge>
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
                       <Button 
                         onClick={() => publishSuggestion(item)} 
                         disabled={isActionLoading}
                         size="sm" 
                         className="bg-primary text-white rounded-xl h-10 px-8 hover:bg-secondary transition-all font-bold uppercase text-[10px] tracking-widest"
                       >
                         {isActionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Authorize & Go Live"}
                       </Button>
                    </div>
                 </Card>
               ))}
            </div>
         </DialogContent>
      </Dialog>
      <Footer />
    </main>
  );
}
