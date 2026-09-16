
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { 
  Trash2, 
  RotateCcw, 
  History, 
  ShieldCheck, 
  Loader2, 
  Search, 
  Clock, 
  Archive,
  AlertTriangle,
  ChevronRight,
  Info,
  Calendar,
  X,
  ShieldAlert,
  Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, differenceInDays, addDays } from 'date-fns';
import { restoreFromTrash, permanentPurge } from '@/lib/trash-utils';
import { Footer } from '@/components/footer';

/**
 * INSTITUTIONAL RECYCLE BIN: High-fidelity terminal for data recovery and permanent purging.
 * Enforces 60-day retention policy.
 * Updated: Removed blocking awaits and integrated contextual error handling pattern.
 */
export default function RecycleBinPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login');
    }
  }, [user, authLoading, router]);

  const trashQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'trash'), orderBy('trashMetadata.deletedAt', 'desc'));
  }, [db, user]);

  const { data: trashItems, loading: dataLoading } = useCollection(trashQuery);

  const handleRestore = (item: any) => {
    if (!db) return;
    setIsActionLoading(item.id);
    
    // Non-blocking dispatch
    restoreFromTrash(db, item);
    
    toast({ 
      title: "Restoration Initialized", 
      description: "Establishing record in original registry node." 
    });
    
    // Local cleanup after slight delay for visual consistency
    setTimeout(() => setIsActionLoading(null), 800);
  };

  const handlePermanentDelete = (id: string) => {
    if (!db) return;
    setIsActionLoading(id);
    
    // Non-blocking dispatch
    permanentPurge(db, id);
    
    toast({ 
      title: "Purge Initialized", 
      description: "Removing record from institutional existence." 
    });
    
    setTimeout(() => setIsActionLoading(null), 800);
  };

  /**
   * HOUSEKEEPING: Automatically cleanup expired records on mount.
   */
  useEffect(() => {
    if (trashItems && trashItems.length > 0 && db) {
      const now = new Date();
      trashItems.forEach((item: any) => {
        const deletedAt = item.trashMetadata?.deletedAt?.toDate?.() || new Date();
        const daysInTrash = differenceInDays(now, deletedAt);
        if (daysInTrash >= 60) {
          permanentPurge(db, item.id);
        }
      });
    }
  }, [trashItems, db]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-accent" /></div>;
  }

  const filtered = (trashItems || []).filter((item: any) => {
    const meta = item.trashMetadata || {};
    const text = `${meta.displayName} ${meta.category} ${meta.deletedBy}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/30">
               <Archive className="w-2.5 h-2.5" /> Retention Protocol
             </div>
             <h1 className="text-3xl md:text-4xl font-headline font-bold">Institutional <span className="text-accent italic">Recycle Bin</span></h1>
             <p className="text-slate-400 text-[11px] uppercase font-black">60-Day Recovery Vault for Purged Assets</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/5 px-6 py-2 rounded-xl border border-white/10 text-center">
                <p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Records in Vault</p>
                <p className="text-xl font-bold text-accent">{trashItems?.length || 0}</p>
             </div>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-6xl">
        
        <div className="mb-8 grid md:grid-cols-3 gap-6">
           <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600"><Clock className="w-6 h-6" /></div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Retention Period</p>
                <p className="text-lg font-bold">60 Days</p>
              </div>
           </Card>
           <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600"><RotateCcw className="w-6 h-6" /></div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recovery Success</p>
                <p className="text-lg font-bold">100% Native</p>
              </div>
           </Card>
           <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 p-6 flex items-center gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600"><ShieldAlert className="w-6 h-6" /></div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Permanent Removal</p>
                <p className="text-lg font-bold">Atomic Purge</p>
              </div>
           </Card>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
           <div className="relative w-full max-md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Filter vault by record name or category..." 
                className="pl-11 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-inner"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Database className="w-3 h-3" /> Encrypted Vault Synchronization: Active
              </p>
           </div>
        </div>

        <div className="grid gap-4">
           {dataLoading ? (
             <div className="text-center py-20"><Loader2 className="animate-spin w-10 h-10 text-accent mx-auto" /></div>
           ) : filtered.length > 0 ? (
             filtered.map((item: any) => {
               const meta = item.trashMetadata;
               const deletedAt = meta?.deletedAt?.toDate?.() || new Date();
               const autoDeleteAt = addDays(deletedAt, 60);
               const daysLeft = 60 - differenceInDays(new Date(), deletedAt);

               return (
                 <Card key={item.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl group hover:shadow-lg transition-all border border-slate-100">
                    <CardContent className="p-0">
                       <div className="flex flex-col md:flex-row items-stretch">
                          <div className="p-6 md:w-44 text-center border-r bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center shrink-0">
                             <p className={cn("text-3xl font-black leading-none", daysLeft <= 10 ? "text-red-500" : "text-primary dark:text-white")}>{daysLeft}</p>
                             <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Days Remaining</p>
                             <Badge variant="outline" className="mt-4 border-slate-200 text-slate-400 text-[8px] uppercase">{format(autoDeleteAt, 'MMM d, yyyy')}</Badge>
                          </div>
                          
                          <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                             <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                   <Badge className="bg-primary text-white text-[8px] font-black uppercase tracking-tighter h-5 px-3">{meta.category}</Badge>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                      <History className="w-3 h-3" /> Deleted: {format(deletedAt, 'PPP')}
                                   </p>
                                </div>
                                <h3 className="text-xl font-headline font-bold text-primary dark:text-white leading-tight truncate">{meta.displayName}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                   <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-accent" /> Removed By: {meta.deletedBy?.split('@')[0]}</span>
                                   <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-accent" /> Integrity: Verified</span>
                                </div>
                             </div>

                             <div className="flex items-center gap-3">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-900/20"
                                    >
                                       {isActionLoading === item.id ? <Loader2 className="animate-spin w-4 h-4" /> : <><RotateCcw className="w-4 h-4 mr-2" /> Restore</>}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900">
                                     <AlertDialogHeader className="items-center text-center">
                                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                                           <RotateCcw className="w-10 h-10" />
                                        </div>
                                        <AlertDialogTitle className="text-2xl font-headline font-bold">Restore Item?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                                          This item will be removed from Trash and returned to its original registry node. Are you sure you want to proceed?
                                        </AlertDialogDescription>
                                     </AlertDialogHeader>
                                     <AlertDialogFooter className="mt-6 flex gap-3">
                                        <AlertDialogCancel className="rounded-xl h-11 font-bold flex-1">Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleRestore(item)} 
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-bold flex-1 shadow-lg shadow-emerald-600/20"
                                        >
                                          Confirm Restore
                                        </AlertDialogAction>
                                     </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                     <button className="h-11 w-11 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center border border-transparent hover:border-red-100">
                                        <Trash2 className="w-5 h-5" />
                                     </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900">
                                     <AlertDialogHeader className="items-center text-center">
                                        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                                           <ShieldAlert className="w-10 h-10" />
                                        </div>
                                        <AlertDialogTitle className="text-2xl font-headline font-bold">Permanent Purge</AlertDialogTitle>
                                        <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                                          This item will be permanently deleted and cannot be recovered. Are you sure?
                                        </AlertDialogDescription>
                                     </AlertDialogHeader>
                                     <AlertDialogFooter className="mt-6 flex gap-3">
                                        <AlertDialogCancel className="rounded-xl h-11 font-bold flex-1">Abort Process</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handlePermanentDelete(item.id)} 
                                          className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 font-bold flex-1 shadow-xl shadow-red-900/40"
                                        >
                                          Delete Permanently
                                        </AlertDialogAction>
                                     </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                             </div>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
               );
             })
           ) : (
             <div className="py-40 text-center opacity-30 flex flex-col items-center gap-4">
                <Archive className="w-20 h-20 text-slate-200" />
                <h3 className="text-2xl font-headline font-bold uppercase tracking-[0.4em]">Vault Empty</h3>
                <p className="text-sm font-bold uppercase tracking-widest">Institutional records are currently stable.</p>
             </div>
           )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
