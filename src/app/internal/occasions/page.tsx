
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Sparkles, 
  Calendar as CalendarIcon, 
  Image as ImageIcon,
  Upload,
  ArrowRight,
  Wifi,
  Zap,
  Settings2,
  RefreshCw,
  Clock,
  X,
  History
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
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { format, addDays, startOfDay, isWithinInterval, endOfDay, isToday } from 'date-fns';
import { BUILT_IN_HOLIDAYS, BUILT_IN_OBSERVANCES } from '@/lib/activity-hub-data';

/**
 * Internal Occasions Governance: Real-time management terminal.
 * Updated: Sequential conflict resolution logic for autonomous discovery mode.
 */
export default function InternalOccasionsManagement() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editOccasion, setEditOccasion] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newOccasion, setNewOccasion] = useState({
    title: '',
    message: '',
    imageUrl: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    isActive: true,
    priority: 1
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login');
    }
  }, [user, authLoading, router]);

  // Protocol Settings Stream
  const protocolRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'occasions_protocol');
  }, [db]);
  const { data: protocol } = useDoc(protocolRef);

  const occasionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'occasions'), orderBy('priority', 'desc'));
  }, [db, user]);

  const { data: occasions, loading: dataLoading } = useCollection(occasionsQuery);

  const nextSpecialDay = useMemo(() => {
    const allDays = [
      ...BUILT_IN_HOLIDAYS.map(h => ({ ...h, isHoliday: true, date: startOfDay(new Date(new Date().getFullYear(), h.month - 1, h.day)) })),
      ...BUILT_IN_OBSERVANCES.map(o => ({ ...o, isHoliday: false, date: startOfDay(new Date(new Date().getFullYear(), o.month - 1, o.day)) }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const now = startOfDay(new Date());

    // 1. CHECK FOR TODAY
    const todayMatch = allDays.find(d => d.date.getTime() === now.getTime());
    if (todayMatch) return { ...todayMatch, currentStatus: 'Today' };

    // 2. CHECK FOR YESTERDAY
    const yesterday = addDays(now, -1);
    const yesterdayMatch = allDays.find(d => d.date.getTime() === yesterday.getTime());
    if (yesterdayMatch) return { ...yesterdayMatch, currentStatus: 'Recent (T+1)' };

    // 3. CHECK FOR UPCOMING
    const upcomingMatch = allDays.find(d => {
      if (d.date <= now) return false;
      if (d.date > addDays(now, 3)) return false;
      
      const dayBefore = addDays(d.date, -1);
      const isConsecutive = allDays.some(prev => prev.date.getTime() === dayBefore.getTime());
      return !isConsecutive; // Only trigger early if not consecutive
    });

    if (upcomingMatch) return { ...upcomingMatch, currentStatus: 'Upcoming (T-3)' };

    // Fallback: Next chronological event
    return allDays.find(d => d.date > now) || allDays[0];
  }, []);

  const handleToggleProtocol = async (val: boolean) => {
    if (!protocolRef) return;
    setIsActionLoading(true);
    try {
      await setDoc(protocolRef, {
        mode: val ? 'auto' : 'manual',
        updatedAt: serverTimestamp(),
        updatedBy: user?.email
      }, { merge: true });
      toast({ 
        title: val ? "Autonomous Mode Active" : "Manual Curation Mode Active",
        description: val ? "Lead-time lead suppression enabled for consecutive events." : "Govenance returned to manual registry."
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Protocol Sync Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 204800) {
        toast({ variant: "destructive", title: "Asset Size Alert", description: "Institutional banners must be under 200KB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        if (isEdit) setEditOccasion({ ...editOccasion, imageUrl: dataUri });
        else setNewOccasion({ ...newOccasion, imageUrl: dataUri });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOccasion = async () => {
    if (!db) return;
    if (!newOccasion.title || !newOccasion.imageUrl) {
      toast({ variant: "destructive", title: "Validation Error", description: "Greeting Title and Banner Image are mandatory." });
      return;
    }
    setIsActionLoading(true);
    addDoc(collection(db, 'occasions'), { ...newOccasion, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Greeting Published" });
        setIsAddDialogOpen(false);
        setNewOccasion({ title: '', message: '', imageUrl: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd'), isActive: true, priority: 1 });
      })
      .finally(() => setIsActionLoading(false));
  };

  const handleUpdateOccasion = async () => {
    if (!db || !editOccasion) return;
    setIsActionLoading(true);
    const { id, ...data } = editOccasion;
    updateDoc(doc(db, 'occasions', id), data)
      .then(() => {
        toast({ title: "Registry Updated" });
        setIsEditDialogOpen(false);
        setEditOccasion(null);
      })
      .finally(() => setIsActionLoading(false));
  };

  const handleDeleteOccasion = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'occasions', id)).then(() => toast({ title: "Record Purged" }));
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>;
  }

  const filtered = (occasions || []).filter((occ: any) => 
    occ.title.toLowerCase().includes(search.toLowerCase()) || 
    occ.message.toLowerCase().includes(search.toLowerCase())
  );

  const isAutoMode = protocol?.mode === 'auto';

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-emerald-500/30 tracking-[0.2em]">
              <Wifi className="w-2.5 h-2.5 animate-pulse" /> Live Broadcast Control
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Institutional <span className="text-accent italic">Occasions</span></h1>
            <p className="text-slate-400 text-[11px] uppercase font-black">Central Greetings & Indian Multi-Faith Calendar</p>
          </div>
          
          <div className="flex gap-3">
             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-2xl shadow-accent/20 mx-auto transform hover:scale-105 active:scale-95">
                    <Plus className="w-4 h-4" /> New Occasion Greeting
                  </Button>
                </DialogTrigger>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle>Greeting Setup Protocol</DialogTitle>
                    <DialogDescription>Banners are pushed to the homepage in real-time based on priority and dates.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-2">
                    <div className="flex flex-col items-center gap-4 p-5 border-2 border-dashed rounded-[2rem] bg-slate-50 dark:bg-slate-900 border-slate-200 shadow-inner">
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-200 border-4 border-white shadow-xl">
                        {newOccasion.imageUrl ? <Image src={newOccasion.imageUrl} alt="Preview" fill className="object-cover" /> : <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400"><ImageIcon className="w-10 h-10" /><span className="text-[10px] font-black uppercase">Banner Area</span></div>}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false)} />
                      </div>
                      <Label className="text-[10px] font-black uppercase text-slate-400">Click to upload seasonal banner (Max 200KB)</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Occasion Title</Label>
                        <Input placeholder="e.g. Independence Day 2025" value={newOccasion.title} onChange={e => setNewOccasion({...newOccasion, title: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Display Priority (Rank)</Label>
                        <Input type="number" value={newOccasion.priority} onChange={e => setNewOccasion({...newOccasion, priority: Number(e.target.value)})} className="h-11 rounded-xl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Activation Date</Label>
                        <Input type="date" value={newOccasion.startDate} onChange={e => setNewOccasion({...newOccasion, startDate: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Deactivation Date</Label>
                        <Input type="date" value={newOccasion.endDate} onChange={e => setNewOccasion({...newOccasion, endDate: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Greeting Narrative</Label>
                      <Textarea placeholder="Wishing every citizen a prosperous year ahead..." value={newOccasion.message} onChange={e => setNewOccasion({...newOccasion, message: e.target.value})} className="rounded-xl min-h-[100px]" />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <Label className="font-bold text-primary dark:text-emerald-400">Enable Live Broadcast</Label>
                      </div>
                      <Switch checked={newOccasion.isActive} onCheckedChange={val => setNewOccasion({...newOccasion, isActive: val})} className="data-[state=checked]:bg-emerald-500" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddOccasion} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white shadow-2xl shadow-accent/20 transition-all">Establish Official Entry</Button>
                  </DialogFooter>
                </DialogContent>
             </Dialog>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-6xl">
        
        {/* Governance Protocol Control */}
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden mb-12">
           <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-slate-900 p-10 text-white relative flex flex-col justify-center">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                 <Badge className="bg-accent text-primary font-black uppercase text-[8px] mb-4 tracking-widest w-fit">Registry Node</Badge>
                 <h3 className="text-2xl font-headline font-bold">Governance <span className="text-accent italic">Protocol</span></h3>
                 <p className="text-slate-400 text-xs mt-2 leading-relaxed">Toggle between manual curator control and autonomous multi-faith discovery.</p>
              </div>
              <div className="flex-1 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="space-y-6 flex-1">
                    <div className="flex items-center justify-between p-6 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
                            isAutoMode ? "bg-accent text-primary animate-pulse" : "bg-white text-slate-300"
                          )}>
                             {isAutoMode ? <Zap className="w-6 h-6" /> : <Settings2 className="w-6 h-6" />}
                          </div>
                          <div>
                             <h4 className="font-bold text-primary dark:text-white uppercase tracking-tight">Autonomous Discovery Mode</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Lead-time suppression for consecutive events.</p>
                          </div>
                       </div>
                       <Switch 
                         checked={isAutoMode} 
                         onCheckedChange={handleToggleProtocol} 
                         disabled={isActionLoading}
                         className="data-[state=checked]:bg-accent"
                       />
                    </div>
                    
                    {isAutoMode && (
                      <div className="flex items-start gap-4 p-5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900 animate-in slide-in-from-left-4 duration-700">
                         <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 shrink-0"><Clock className="w-4 h-4" /></div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                              Broadcast Identity: {nextSpecialDay?.currentStatus || 'Next Event'}
                            </p>
                            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                               {nextSpecialDay.title} 
                               <Badge className="bg-primary text-white text-[8px]">{nextSpecialDay.category}</Badge>
                            </div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase italic">
                               Target Date: {format(nextSpecialDay.date, 'PPPP')}
                            </p>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </Card>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
               <History className="w-5 h-5 text-accent" />
               <h2 className="text-xl font-headline font-bold text-primary dark:text-white">Manual Broadcast Registry</h2>
            </div>
            <div className="relative w-full max-sm:max-w-full max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <Input placeholder="Search active greetings..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm shadow-inner" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
        </div>

        <div className="grid gap-6">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : filtered.map((occ: any) => (
            <Card key={occ.id} className={cn(
              "border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-500 hover:shadow-xl",
              occ.isActive ? "border-l-8 border-l-emerald-500" : "border-l-8 border-l-slate-200 opacity-60 grayscale"
            )}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className="relative w-full md:w-72 aspect-video md:aspect-auto overflow-hidden shrink-0 border-r border-slate-100 dark:border-slate-800">
                     <Image src={occ.imageUrl} alt="Banner" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                     <div className="absolute top-4 left-4">
                       <Badge className={cn("text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full", occ.isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-white")}>
                         {occ.isActive ? "BROADCAST LIVE" : "OFFLINE"}
                       </Badge>
                     </div>
                  </div>
                  <div className="flex-1 p-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div className="space-y-1.5">
                          <h3 className="text-2xl font-headline font-bold text-primary dark:text-white leading-tight group-hover:text-accent transition-colors">{occ.title}</h3>
                          <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
                             <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg"><CalendarIcon className="w-3 h-3 text-accent" /> {occ.startDate} <ArrowRight className="w-2.5 h-2.5 mx-1" /> {occ.endDate}</span>
                             <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg"><Sparkles className="w-3 h-3 text-accent" /> Priority: {occ.priority}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 shrink-0">
                          <Button variant="outline" size="sm" onClick={() => { setEditOccasion(occ); setIsEditDialogOpen(true); }} className="h-10 px-5 rounded-xl text-[10px] font-bold border-slate-200 hover:bg-accent hover:text-primary transition-all">Modify</Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center"><Trash2 className="w-4.5 h-4.5" /></button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>Are you sure you want to delete this item? This action may be irreversible. Please confirm before continuing.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteOccasion(occ.id)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11 font-bold">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner italic text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      "{occ.message}"
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 opacity-40">
               <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
               <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Registry Node Empty</p>
            </div>
          )}
        </div>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader><DialogTitle>Refine Greeting Metadata</DialogTitle></DialogHeader>
          {editOccasion && (
            <div className="space-y-6 py-2">
                <div className="flex flex-col items-center gap-4 p-5 border-2 border-dashed rounded-[2rem] bg-slate-50 dark:bg-slate-900 shadow-inner">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-200 border-4 border-white shadow-xl">
                    <Image src={editOccasion.imageUrl} alt="Banner" fill className="object-cover" />
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true)} />
                  </div>
                  <Label className="text-[10px] font-black uppercase text-slate-400">Replace current banner</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Title</Label><Input value={editOccasion.title} onChange={e => setEditOccasion({...editOccasion, title: e.target.value})} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Priority</Label><Input type="number" value={editOccasion.priority} onChange={e => setEditOccasion({...editOccasion, priority: Number(e.target.value)})} className="h-11 rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Start Date</Label><Input type="date" value={editOccasion.startDate} onChange={e => setEditOccasion({...editOccasion, startDate: e.target.value})} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">End Date</Label><Input type="date" value={editOccasion.endDate} onChange={e => setEditOccasion({...editOccasion, endDate: e.target.value})} className="h-11 rounded-xl" /></div>
                </div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Message</Label><Textarea value={editOccasion.message} onChange={e => setEditOccasion({...editOccasion, message: e.target.value})} className="rounded-xl min-h-[100px]" /></div>
                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100">
                  <Label className="font-bold">Active Broadcast</Label>
                  <Switch checked={editOccasion.isActive} onCheckedChange={val => setEditOccasion({...editOccasion, isActive: val})} className="data-[state=checked]:bg-emerald-500" />
                </div>
                <Button onClick={handleUpdateOccasion} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold rounded-2xl shadow-2xl mt-4 hover:bg-secondary transition-all">Commit Profile Refresh</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  );
}
