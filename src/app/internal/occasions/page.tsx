'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDocs, writeBatch, where } from 'firebase/firestore';
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
  History,
  Info,
  CalendarDays,
  ChevronRight,
  Circle,
  Database,
  Radio,
  Languages
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { format, addDays, startOfDay, isWithinInterval, endOfDay, getMonth, parse } from 'date-fns';
import { BUILT_IN_HOLIDAYS, BUILT_IN_OBSERVANCES } from '@/lib/activity-hub-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());
  
  // Language Switching State
  const [addNarrativeLang, setAddNarrativeLang] = useState<'en' | 'bn'>('en');
  const [editNarrativeLang, setEditNarrativeLang] = useState<'en' | 'bn'>('en');

  const [newOccasion, setNewOccasion] = useState({
    title: '',
    message: '',
    messageBn: '',
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

  const allSpecialDays = useMemo(() => {
    return [
      ...BUILT_IN_HOLIDAYS.map(h => ({ ...h, isHoliday: true, date: startOfDay(new Date(2026, h.month - 1, h.day)) })),
      ...BUILT_IN_OBSERVANCES.map(o => ({ ...o, isHoliday: false, date: startOfDay(new Date(2026, o.month - 1, o.day)) }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);

  const nextSpecialDay = useMemo(() => {
    const now = startOfDay(new Date());
    const upcomingMatch = allSpecialDays.find(d => d.date > now) || allSpecialDays[0];
    return upcomingMatch;
  }, [allSpecialDays]);

  const handleToggleProtocol = async (val: boolean) => {
    if (!protocolRef || !db) return;
    setIsActionLoading(true);
    try {
      const batch = writeBatch(db);
      
      batch.set(protocolRef, {
        mode: val ? 'auto' : 'manual',
        updatedAt: serverTimestamp(),
        updatedBy: user?.email
      }, { merge: true });

      if (val) {
        const activeManualsSnap = await getDocs(query(collection(db, 'occasions'), where('isActive', '==', true)));
        activeManualsSnap.docs.forEach(d => {
          batch.update(d.ref, { isActive: false });
        });
      }

      await batch.commit();
      toast({ 
        title: val ? "Autonomous Mode Active" : "Manual Curation Mode Active",
        description: val ? "All manual broadcasts suspended. Automatic calendar sync active." : "Governance returned to manual registry."
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

    const isAutoMode = protocol?.mode === 'auto';
    if (newOccasion.isActive && isAutoMode) {
      await handleToggleProtocol(false);
    }

    addDoc(collection(db, 'occasions'), { ...newOccasion, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Greeting Published" });
        setIsAddDialogOpen(false);
        setNewOccasion({ title: '', message: '', messageBn: '', imageUrl: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd'), isActive: true, priority: 1 });
      })
      .finally(() => setIsActionLoading(false));
  };

  const handleUpdateOccasion = async () => {
    if (!db || !editOccasion) return;
    setIsActionLoading(true);

    const isAutoMode = protocol?.mode === 'auto';
    if (editOccasion.isActive && isAutoMode) {
      await handleToggleProtocol(false);
    }

    const { id, ...data } = editOccasion;
    updateDoc(doc(db, 'occasions', id), data)
      .then(() => {
        toast({ title: "Registry Updated" });
        setIsEditDialogOpen(false);
        setEditOccasion(null);
      })
      .finally(() => setIsActionLoading(false));
  };

  const handleStatusUpdate = async (occ: any, val: boolean) => {
    if (!db) return;
    setIsActionLoading(true);

    const isAutoMode = protocol?.mode === 'auto';
    if (val && isAutoMode) {
      await handleToggleProtocol(false);
    }

    updateDoc(doc(db, 'occasions', occ.id), { isActive: val, updatedAt: serverTimestamp() })
      .then(() => toast({ title: val ? "Broadcast Active" : "Broadcast Suspended" }))
      .finally(() => setIsActionLoading(false));
  };

  const handleDeleteOccasion = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'occasions', id)).then(() => toast({ title: "Record Purged" }));
  };

  const parseTerminationDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      return parse(dateStr, 'yyyy-MM-dd', new Date());
    } catch (e) {
      return undefined;
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>;
  }

  const filtered = (occasions || []).filter((occ: any) => 
    occ.title.toLowerCase().includes(search.toLowerCase()) || 
    occ.message.toLowerCase().includes(search.toLowerCase())
  );

  const isAutoMode = protocol?.mode === 'auto';
  const specialDaysInMonth = allSpecialDays.filter(d => getMonth(d.date) === getMonth(selectedCalendarDate || new Date()));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
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
                  <Button className="bg-accent text-primary hover:bg-secondary hover:text-white font-bold rounded-xl h-11 px-8 flex gap-2 shadow-2xl shadow-accent/20 mx-auto transform hover:scale-105 active:scale-95 transition-all">
                    <Plus className="w-4 h-4" /> New Occasion Greeting
                  </Button>
                </DialogTrigger>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl [&>button]:hidden">
                  <DialogHeader className="relative">
                    <div className="absolute right-0 top-0">
                      <DialogClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-primary h-8 w-8">
                          <X className="w-5 h-5" />
                        </Button>
                      </DialogClose>
                    </div>
                    <DialogTitle>Greeting Setup Protocol</DialogTitle>
                    <DialogDescription>Banners are pushed to the homepage in real-time based on priority and dates.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-2 px-1">
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

                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Greeting Narrative</Label>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border">
                           <button 
                             type="button"
                             onClick={() => setAddNarrativeLang('en')}
                             className={cn(
                               "px-4 py-1 rounded-md text-[9px] font-black uppercase transition-all",
                               addNarrativeLang === 'en' ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                             )}
                           >EN</button>
                           <button 
                             type="button"
                             onClick={() => setAddNarrativeLang('bn')}
                             className={cn(
                               "px-4 py-1 rounded-md text-[9px] font-black uppercase transition-all",
                               addNarrativeLang === 'bn' ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                             )}
                           >BN</button>
                        </div>
                      </div>
                      {addNarrativeLang === 'en' ? (
                        <Textarea 
                          placeholder="Wishing every citizen a prosperous year ahead..." 
                          value={newOccasion.message} 
                          onChange={e => setNewOccasion({...newOccasion, message: e.target.value})} 
                          className="rounded-xl min-h-[120px] animate-in fade-in duration-300" 
                        />
                      ) : (
                        <Textarea 
                          placeholder="সকল নাগরিকের উজ্জ্বল ভবিষ্যৎ কামনা করছি..." 
                          value={newOccasion.messageBn} 
                          onChange={e => setNewOccasion({...newOccasion, messageBn: e.target.value})} 
                          className="rounded-xl min-h-[120px] font-medium animate-in fade-in duration-300" 
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <Label className="font-bold text-primary dark:text-emerald-400">Enable Live Broadcast</Label>
                      </div>
                      <Switch checked={newOccasion.isActive} onCheckedChange={val => setNewOccasion({...newOccasion, isActive: val})} className="data-[state=checked]:bg-emerald-500" />
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button onClick={handleAddOccasion} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white shadow-2xl shadow-accent/20 transition-all">Establish Official Entry</Button>
                  </DialogFooter>
                </DialogContent>
             </Dialog>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
           
           <div className="lg:col-span-8 space-y-8">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-slate-900 p-8 text-white relative flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                      <Badge className="bg-accent text-primary font-black uppercase text-[8px] mb-4 tracking-widest w-fit">Governance Node</Badge>
                      <h3 className="text-2xl font-headline font-bold">Broadcast <span className="text-accent italic">Protocol</span></h3>
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed">Toggle between manual curation and autonomous discovery.</p>
                    </div>
                    <div className="flex-1 p-8 flex flex-col gap-6">
                      <div className="flex items-center justify-between p-6 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
                              isAutoMode ? "bg-accent text-primary animate-pulse" : "bg-white dark:bg-slate-800 text-slate-300"
                            )}>
                                {isAutoMode ? <Zap className="w-6 h-6" /> : <Settings2 className="w-6 h-6" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-primary dark:text-white uppercase tracking-tight">Enable Automatic Activation</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Synchronizes with institutional calendar.</p>
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
                        <div className="flex items-center justify-between p-5 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900 animate-in slide-in-from-left-4 duration-700">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-indigo-900 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm"><Radio className="w-6 h-6 animate-pulse" /></div>
                              <div className="space-y-1">
                                 <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none">Next Discovery Sequence</p>
                                 <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 text-lg">
                                    {nextSpecialDay?.title} 
                                    <Badge className="bg-primary text-white text-[8px]">{nextSpecialDay?.category}</Badge>
                                 </div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase italic">
                                   Target Date: {format(nextSpecialDay.date, 'PPPP')}
                                 </p>
                              </div>
                           </div>
                           <Button 
                             onClick={() => {
                               const t = nextSpecialDay.title.toLowerCase();
                               const visual = PlaceHolderImages.find(i => i.id === 'ganesh-puja' && t.includes('ganesh')) 
                                 || PlaceHolderImages.find(i => i.id === 'durga-puja' && t.includes('durga'))
                                 || PlaceHolderImages.find(i => i.id === 'kali-puja' && (t.includes('kali') || t.includes('diwali')))
                                 || { imageUrl: '/HRAT Logo.jpeg' };

                               setNewOccasion({
                                 title: nextSpecialDay.title,
                                 message: `Human Rights Affairs Trust (Justice Shield) joins the nation in celebrating ${nextSpecialDay.title}.`,
                                 messageBn: `হিউম্যান রাইটস অ্যাফেয়ার্স ট্রাস্ট (জাস্টিস শিল্ড) ${nextSpecialDay.title} উদযাপনে দেশবাসীর সাথে যোগ দিচ্ছে।`,
                                 imageUrl: visual.imageUrl,
                                 startDate: format(new Date(), 'yyyy-MM-dd'),
                                 endDate: format(nextSpecialDay.date, 'yyyy-MM-dd'),
                                 isActive: true,
                                 priority: 5
                               });
                               setIsAddDialogOpen(true);
                             }}
                             variant="outline" 
                             className="h-9 px-4 rounded-xl border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 font-bold text-[10px] uppercase tracking-widest shadow-sm transition-all"
                           >
                              <Zap className="w-3 h-3 mr-1.5" /> Broadcast Now
                           </Button>
                        </div>
                      )}
                    </div>
                </div>
              </Card>

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-3">
                       <History className="w-5 h-5 text-accent" />
                       <h2 className="text-xl font-headline font-bold text-primary dark:text-white">Broadcast Registry</h2>
                    </div>
                    <div className="relative w-full max-md:max-w-full max-w-md">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <Input placeholder="Search greetings..." className="pl-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                <div className="grid gap-4">
                  {dataLoading ? (
                    <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
                  ) : filtered.map((occ: any) => (
                    <Card key={occ.id} className={cn(
                      "border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border transition-all hover:shadow-lg",
                      occ.isActive ? "border-l-8 border-l-emerald-500" : "border-l-8 border-l-slate-200 opacity-60 grayscale"
                    )}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row items-stretch">
                          <div className="relative w-full md:w-56 aspect-video md:aspect-auto overflow-hidden shrink-0 border-r border-slate-100 dark:border-slate-800">
                             <Image src={occ.imageUrl} alt="Banner" fill className="object-cover" />
                          </div>
                          <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-1 flex-1 min-w-0">
                               <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-primary dark:text-white truncate">{occ.title}</h3>
                                  <Switch 
                                    checked={occ.isActive} 
                                    onCheckedChange={(val) => handleStatusUpdate(occ, val)} 
                                    className="data-[state=checked]:bg-emerald-500 scale-75"
                                  />
                               </div>
                               <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <span>{occ.startDate} — {occ.endDate}</span>
                                  <Badge variant="outline" className="h-4 text-[7px] border-accent text-accent">PRIORITY {occ.priority}</Badge>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={() => { setEditOccasion(occ); setEditNarrativeLang('en'); setIsEditDialogOpen(true); }} className="h-9 px-4 rounded-xl text-[10px] font-bold border border-slate-200 hover:bg-accent hover:text-primary transition-all">Modify</button>
                               <AlertDialog>
                                 <AlertDialogTrigger asChild>
                                   <button className="h-9 w-9 text-slate-300 hover:text-red-500 flex items-center justify-center transition-colors"><Trash2 className="w-4.5 h-4.5" /></button>
                                 </AlertDialogTrigger>
                                 <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                                   <AlertDialogHeader>
                                     <AlertDialogTitle>Confirm Purge</AlertDialogTitle>
                                     <AlertDialogDescription>Remove this greeting record from the manual registry? This cannot be undone.</AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                     <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                     <AlertDialogAction onClick={() => handleDeleteOccasion(occ.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">Delete</AlertDialogAction>
                                   </AlertDialogFooter>
                                 </AlertDialogContent>
                               </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filtered.length === 0 && !dataLoading && (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 opacity-30">
                       <ImageIcon className="w-12 h-12 mx-auto mb-4" />
                       <p className="text-xs font-black uppercase tracking-widest">No manual records found</p>
                    </div>
                  )}
                </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6">
                 <div className="flex items-center gap-2 mb-6">
                    <CalendarDays className="w-5 h-5 text-accent" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary dark:text-white">Calendar Insight</h3>
                 </div>
                 <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <Calendar
                      mode="single"
                      selected={selectedCalendarDate}
                      onSelect={setSelectedCalendarDate}
                      className="rounded-md border-none p-0"
                      classNames={{
                        month: "space-y-4 w-full",
                        caption: "flex justify-center pt-1 relative items-center mb-2",
                        caption_label: "text-xs font-black uppercase tracking-widest text-accent",
                        nav: "space-x-1 flex items-center",
                        nav_button: cn(
                          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                        ),
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex justify-between",
                        head_cell: "text-slate-400 rounded-md w-8 font-bold text-[8px] uppercase tracking-tighter",
                        row: "flex w-full mt-2 justify-between",
                        cell: "text-center text-[10px] relative p-0 hover:bg-accent/10 rounded-lg transition-colors",
                        day: cn(
                          "h-8 w-8 p-0 font-bold aria-selected:opacity-100"
                        ),
                        day_selected: "bg-accent text-primary hover:bg-accent hover:text-primary focus:bg-accent focus:text-primary",
                        day_today: "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white",
                        day_outside: "text-slate-300 opacity-50",
                        day_disabled: "text-slate-300 opacity-50",
                        day_hidden: "invisible",
                      }}
                    />
                 </div>
                 <div className="mt-6 space-y-3">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Month Discovery Highlights</p>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                       {specialDaysInMonth.map((d, i) => (
                         <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-accent transition-all">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] font-black text-accent shrink-0 shadow-sm">{d.day}</div>
                            <div className="min-w-0">
                               <p className="text-[10px] font-bold text-primary dark:text-white truncate leading-none">{d.title}</p>
                               <p className="text-[7px] font-black text-slate-400 uppercase mt-1">{d.category}</p>
                            </div>
                         </div>
                       ))}
                       {specialDaysInMonth.length === 0 && (
                         <p className="text-[9px] text-slate-400 italic text-center py-4">No festive days registered this month.</p>
                       )}
                    </div>
                 </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-sm bg-slate-900 text-white p-8 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                 <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-8 flex items-center gap-2">
                   <Database className="w-4 h-4" /> Institutional Registry
                 </h3>
                 <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-8">
                       {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => {
                         const monthDays = allSpecialDays.filter(d => d.month === month);
                         if (monthDays.length === 0) return null;
                         const monthName = format(new Date(2026, month - 1, 1), 'MMMM');
                         return (
                           <div key={month} className="space-y-3">
                              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <span className="w-6 h-px bg-emerald-400/30"></span> {monthName}
                              </h4>
                              <div className="grid gap-2">
                                 {monthDays.map((d, i) => (
                                   <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                                      <div className="flex items-center gap-3">
                                         <span className="text-[10px] font-black text-accent w-5">{d.day}</span>
                                         <span className="text-[11px] font-bold opacity-80 group-hover:opacity-100">{d.title}</span>
                                      </div>
                                      <Badge variant="outline" className="text-[6px] h-4 border-white/20 opacity-50">{d.category}</Badge>
                                   </div>
                                 ))}
                              </div>
                           </div>
                         );
                       })}
                    </div>
                 </ScrollArea>
                 <div className="mt-8 pt-4 border-t border-white/10">
                    <div className="flex items-start gap-3">
                       <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                       <p className="text-[9px] font-black text-slate-400 leading-relaxed font-bold uppercase italic">
                         "These dates are strictly verified according to the Indian Multi-Faith Calendar. Sequential Guard logic is automatically applied to all entries."
                       </p>
                    </div>
                 </div>
              </Card>

           </div>
        </div>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={(val) => { if(!val) { setIsEditDialogOpen(false); setEditOccasion(null); } }}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col p-0 z-[1000001]">
            <div className="bg-slate-900 pt-14 pb-10 px-8 text-white relative border-b-4 border-accent/20 shrink-0">
               <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10 h-10 w-10 transition-all"><X className="w-6 h-6" /></Button></DialogClose></div>
               <DialogTitle className="text-2xl font-headline font-bold">Refine Greeting Record</DialogTitle>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Registry Update Protocol</p>
            </div>
            
            {editOccasion && (
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div className="flex flex-col items-center gap-4 p-5 border-2 border-dashed rounded-[2rem] bg-slate-50 dark:bg-slate-900 shadow-inner">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-200 border-4 border-white shadow-xl">
                    <Image src={editOccasion.imageUrl} alt="Banner" fill className="object-cover" />
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileChange(e, true)} />
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Click Image area to update</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">Occasion Title</Label><Input value={editOccasion.title} onChange={e => setEditOccasion({...editOccasion, title: e.target.value})} className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">Display Priority</Label><Input type="number" value={editOccasion.priority} onChange={e => setEditOccasion({...editOccasion, priority: Number(e.target.value)})} className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold" /></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold text-slate-500">Start Date</Label><Input type="date" value={editOccasion.startDate} onChange={e => setEditOccasion({...editOccasion, startDate: e.target.value})} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold text-slate-500">End Date</Label><Input type="date" value={editOccasion.endDate} onChange={e => setEditOccasion({...editOccasion, endDate: e.target.value})} className="h-11 rounded-xl" /></div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Greeting Narrative</Label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border">
                      <button 
                        type="button"
                        onClick={() => setEditNarrativeLang('en')}
                        className={cn(
                          "px-4 py-1 rounded-md text-[9px] font-black uppercase transition-all",
                          editNarrativeLang === 'en' ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >EN</button>
                      <button 
                        type="button"
                        onClick={() => setEditNarrativeLang('bn')}
                        className={cn(
                          "px-4 py-1 rounded-md text-[9px] font-black uppercase transition-all",
                          editNarrativeLang === 'bn' ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >BN</button>
                    </div>
                  </div>
                  {editNarrativeLang === 'en' ? (
                    <Textarea 
                      value={editOccasion.message} 
                      onChange={e => setEditOccasion({...editOccasion, message: e.target.value})} 
                      className="rounded-xl min-h-[120px] animate-in fade-in duration-300" 
                    />
                  ) : (
                    <Textarea 
                      value={editOccasion.messageBn || ''} 
                      onChange={e => setEditOccasion({...editOccasion, messageBn: e.target.value})} 
                      className="rounded-xl min-h-[120px] font-medium animate-in fade-in duration-300" 
                    />
                  )}
                </div>
                
                <div className="flex items-center justify-between p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900">
                  <Label className="font-bold text-primary dark:text-emerald-400">Active Broadcast Status</Label>
                  <Switch checked={editOccasion.isActive} onCheckedChange={val => setEditOccasion({...editOccasion, isActive: val})} className="data-[state=checked]:bg-emerald-500" />
                </div>

                <Button type="button" onClick={handleUpdateOccasion} disabled={isActionLoading} className="w-full h-16 rounded-2xl bg-primary text-white font-bold shadow-xl hover:bg-secondary transition-all text-base md:text-lg">
                  {isActionLoading ? <Loader2 className="animate-spin mr-2" /> : "Save Profile Changes"}
                </Button>
              </div>
            )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}

function ScrollArea({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("overflow-y-auto custom-scrollbar", className)}>
      {children}
    </div>
  );
}
