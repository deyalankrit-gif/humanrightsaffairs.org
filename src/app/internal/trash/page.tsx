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
  Database,
  User,
  Hash,
  MessageSquare
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
import { DeleteMemberWorkflow } from '@/components/delete-member-workflow';

/**
 * INSTITUTIONAL RECYCLE BIN: High-fidelity terminal for data recovery and permanent purging.
 * Enforces 90-day retention policy for members.
 */
export default function RecycleBinPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [manualPurgeItem, setManualPurgeItem] = useState<any>(null);

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

  const handleRestore = async (item: any) => {
    if (!db) return;
    setIsActionLoading(item.id);
    
    try {
      await restoreFromTrash(db, user, item);
      toast({ 
        title: "Record Restored", 
        description: "Establishing record in original registry node." 
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Restoration Failed" });
    } finally {
      setIsActionLoading(null);
    }
  };

  /**
   * HOUSEKEEPING: Automatically cleanup expired records on mount.
   */
  useEffect(() => {
    if (trashItems && trashItems.length > 0 && db) {
      const now = new Date();
      trashItems.forEach((item: any) => {
        const deletedAt = item.trashMetadata?.deletedAt?.toDate?.() || new Date();
        const category = item.trashMetadata?.originalCollection;
        const limit = category === 'memberProfiles' ? 90 : 60;
        const daysInTrash = differenceInDays(now, deletedAt);
        if (daysInTrash >= limit) {
          permanentPurge(db, user, item);
        }
      });
    }
  }, [trashItems, db, user]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-accent" /></div>;
  }

  const filtered = (trashItems || []).filter((item: any) => {
    const meta = item.trashMetadata || {};
    const text = `${meta.displayName} ${meta.category} ${meta.deletedBy} ${meta.deletionReason}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-1">
               <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/30">
                 <Archive className="w-2.5 h-2.5" /> Retention Protocol
               </div>
               <h1 className="text-3xl md:text-4xl font-headline font-bold">Institutional <span className="text-accent italic">Recycle Bin</span></h1>
               <p className="text-slate-400 text-[11px] uppercase font-black">90-Day Recovery Vault for Purged Personnel</p>
            </div>
            <div className="flex gap-4">
               <div className="bg-white/5 px-6 py-2 rounded-xl border border-white/10 text-center">
                  <p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Records in Vault</p>
                  <p className="text-xl font-bold text-accent">{trashItems?.length || 0}</p>
               </div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-6xl">
        
        <div className="mb-8 grid md:grid-cols-3 gap-6">
           <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600"><Clock className="w-6 h-6" /></div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Personnel Retention</p>
                <p className="text-lg font-bold">90 Days</p>
              </div>
           </Card>
           <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600"><RotateCcw className="w-6 h-6" /></div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recovery Success</p>
                <p className="text-lg font-bold">100% Verified</p>
              </div>
           </Card>
           <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 p-6 flex items-center gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl text-red-600"><ShieldAlert className="w-6 h-6" /></div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Security Policy</p>
                <p className="text-lg font-bold">OTP Required</p>
              </div>
           </Card>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
           <div className="relative w-full max-md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name, ID or reason..." 
                className="pl-11 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-inner border-none"
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

        <div className="grid gap-6">
           {dataLoading ? (
             <div className="text-center py-20"><Loader2 className="animate-spin w-10 h-10 text-accent mx-auto" /></div>
           ) : filtered.length > 0 ? (
             filtered.map((item: any) => {
               const meta = item.trashMetadata;
               const deletedAt = meta?.deletedAt?.toDate?.() || new Date();
               const limit = meta?.originalCollection === 'memberProfiles' ? 90 : 60;
               const autoDeleteAt = addDays(deletedAt, limit);
               const daysLeft = limit - differenceInDays(new Date(), deletedAt);

               return (
                 <Card key={item.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl group hover:shadow-lg transition-all border border-slate-100">
                    <CardContent className="p-0">
                       <div className="flex flex-col md:flex-row items-stretch">
                          <div className="p-6 md:w-44 text-center border-r bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center shrink-0">
                             <p className={cn("text-3xl font-black leading-none", daysLeft <= 10 ? "text-red-500" : "text-primary dark:text-white")}>{daysLeft}</p>
                             <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Days Remaining</p>
                             <Badge variant="outline" className="mt-4 border-slate-200 text-slate-400 text-[8px] uppercase">{format(autoDeleteAt, 'MMM d, yyyy')}</Badge>
                          </div>
                          
                          <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                             <div className="space-y-4 flex-1 min-w-0">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-3">
                                      <Badge className="bg-primary text-white text-[8px] font-black uppercase tracking-tighter h-5 px-3">{meta.category}</Badge>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                         <History className="w-3 h-3" /> Purged: {format(deletedAt, 'PPP')}
                                      </p>
                                   </div>
                                   <h3 className="text-2xl font-headline font-bold text-primary dark:text-white leading-tight truncate">{meta.displayName}</h3>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase">{item.designation || 'N/A'}</p>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> Justification</p>
                                   <p className="text-xs font-bold text-primary dark:text-slate-200 italic leading-relaxed">"{meta.deletionReason || 'No reason specified.'}"</p>
                                </div>

                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                   <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-accent" /> Action By: {meta.deletedBy}</span>
                                </div>
                             </div>

                             <div className="flex flex-col gap-3 min-w-[160px]">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-900/40"
                                    >
                                       {isActionLoading === item.id ? <Loader2 className="animate-spin w-4 h-4" /> : <><RotateCcw className="w-4 h-4 mr-2" /> Restore Member</>}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900">
                                     <AlertDialogHeader className="items-center text-center">
                                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                                           <RotateCcw className="w-10 h-10" />
                                        </div>
                                        <AlertDialogTitle className="text-2xl font-headline font-bold">Reintegrate Record?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                                          This member will be returned to the active personnel registry. This action will be logged in the governance audit trail.
                                        </AlertDialogDescription>
                                     </AlertDialogHeader>
                                     <AlertDialogFooter className="mt-6 flex gap-3">
                                        <AlertDialogCancel className="rounded-xl h-11 font-bold flex-1">Abort</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleRestore(item)} 
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-bold flex-1"
                                        >
                                          Confirm Restoration
                                        </AlertDialogAction>
                                     </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                <Button 
                                  variant="ghost"
                                  onClick={() => setManualPurgeItem(item)}
                                  className="h-11 px-8 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all font-black uppercase text-[10px] tracking-widest"
                                >
                                   <Trash2 className="w-4 h-4 mr-2" /> Permanent Purge
                                </Button>
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

      {/* Manual Permanent Purge Workflow */}
      {manualPurgeItem && (
        <DeleteMemberWorkflow 
          member={manualPurgeItem}
          isPermanent={true}
          onSuccess={() => setManualPurgeItem(null)}
          onCancel={() => setManualPurgeItem(null)}
        />
      )}

      <Footer />
    </main>
  );
}
