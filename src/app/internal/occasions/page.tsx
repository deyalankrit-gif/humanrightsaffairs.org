
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  getDocs, 
  writeBatch, 
  where, 
  setDoc 
} from 'firebase/firestore';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
  Calendar as CalendarIcon, 
  ImageIcon,
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
  ChevronLeft,
  Circle,
  Database,
  Radio,
  Languages,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  List,
  Check,
  RotateCcw
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  format, 
  addDays, 
  startOfDay, 
  isWithinInterval, 
  endOfDay, 
  getMonth, 
  parse, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  isSameMonth,
  isToday,
  parseISO
} from 'date-fns';
import { BUILT_IN_HOLIDAYS, BUILT_IN_OBSERVANCES } from '@/lib/activity-hub-data';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Occasions Governance Terminal: Real-time mission control for institutional greetings.
 * Features: Full CRUD with explicit actions, Live/Off-Live toggle, and expanded tactical calendar.
 */
export default function InternalOccasionsManagement() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Draft'>('All');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editOccasion, setEditOccasion] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  // Language Switching States
  const [addTitleLang, setAddTitleLang] = useState<'en' | 'bn'>('en');
  const [addMsgLang, setAddMsgLang] = useState<'en' | 'bn'>('en');
  const [editTitleLang, setEditTitleLang] = useState<'en' | 'bn'>('en');
  const [editMsgLang, setEditMsgLang] = useState<'en' | 'bn'>('en');

  const [newOccasion, setNewOccasion] = useState({
    title: '',
    titleBn: '',
    message: '',
    messageBn: '',
    imageUrl: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    isActive: true,
    priority: 1,
    category: 'General'
  });

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com';

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

  const isAutoMode = protocol?.mode === 'auto';

  const allSpecialDays = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      ...BUILT_IN_HOLIDAYS.map(h => ({ ...h, isHoliday: true, date: startOfDay(new Date(currentYear, h.month - 1, h.day)) })),
      ...BUILT_IN_OBSERVANCES.map(o => ({ ...o, isHoliday: false, date: startOfDay(new Date(currentYear, o.month - 1, o.day)) }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);

  const specialDaysInMonth = useMemo(() => {
    const now = startOfDay(new Date());
    const end = addDays(now, 30);
    return allSpecialDays.filter(d => d.date >= now && d.date <= end);
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
        title: val ? "Autonomous Mode Active" : "Manual Mode Active",
        description: val ? "Manual broadcasts suspended. Auto-calendar active." : "Governance returned to manual registry."
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
        toast({ variant: "destructive", title: "Asset Size Alert", description: "Banners must be under 200KB." });
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
      toast({ variant: "destructive", title: "Validation Error", description: "Title and Image are required." });
      return;
    }
    setIsActionLoading(true);
    if (newOccasion.isActive && isAutoMode) await handleToggleProtocol(false);

    addDoc(collection(db, 'occasions'), { ...newOccasion, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Greeting Published" });
        setIsAddDialogOpen(false);
        setNewOccasion({ title: '', titleBn: '', message: '', messageBn: '', imageUrl: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd'), isActive: true, priority: 1, category: 'General' });
      })
      .finally(() => setIsActionLoading(false));
  };

  const handleUpdateOccasion = async () => {
    if (!db || !editOccasion) return;
    setIsActionLoading(true);
    if (editOccasion.isActive && isAutoMode) await handleToggleProtocol(false);

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
    if (val && isAutoMode) await handleToggleProtocol(false);

    updateDoc(doc(db, 'occasions', occ.id), { isActive: val, updatedAt: serverTimestamp() })
      .then(() => toast({ title: val ? "BROADCAST LIVE" : "BROADCAST SUSPENDED" }))
      .finally(() => setIsActionLoading(false));
  };

  const handleDeleteOccasion = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'occasions', id)).then(() => toast({ title: "Record Purged" }));
  };

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentCalendarMonth));
    const end = endOfWeek(endOfMonth(currentCalendarMonth));
    return eachDayOfInterval({ start, end });
  }, [currentCalendarMonth]);

  const filtered = (occasions || []).filter((occ: any) => {
    const matchesSearch = occ.title.toLowerCase().includes(search.toLowerCase()) || 
                          occ.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : 
                         statusFilter === 'Active' ? occ.isActive === true : occ.isActive === false;
    return matchesSearch && matchesStatus;
  });

  const parseFormattedDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try { return parse(dateStr, 'yyyy-MM-dd', new Date()); } catch { return undefined; }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-accent" /></div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* 1. Header Section */}
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4 sticky top-0 z-50 shadow-2xl">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/30">
              <Wifi className="w-2.5 h-2.5 animate-pulse" /> Live Broadcast Management
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">Occasions <span className="text-accent italic">Governance</span></h1>
            <p className="text-slate-400 text-[11px] uppercase font-black">Institutional Greeting Registry Terminal</p>
          </div>
          
          <div className="flex gap-3">
             <Button onClick={() => setIsAddDialogOpen(true)} className="bg-accent text-primary-foreground hover:bg-secondary hover:text-white font-bold rounded-xl h-11 px-8 shadow-xl shadow-accent/20 transition-all">
                <Plus className="w-4 h-4 mr-2" /> New Broadcast
             </Button>
          </div>
        </div>
      </header>

      {/* 2. Main Terminal Grid */}
      <section className="py-10 container mx-auto px-4 max-w-7xl space-y-12">
        
        <div className="grid lg:grid-cols-12 gap-8 items-start">
           
           {/* LEFT: BROADCAST REGISTRY */}
           <div className="lg:col-span-8 space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="p-8 border-b bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                   <div className="space-y-1">
                      <CardTitle className="text-xl font-headline font-bold flex items-center gap-2 text-primary dark:text-white">
                        <History className="w-5 h-5 text-accent" /> Broadcast Registry
                      </CardTitle>
                      <CardDescription className="text-xs uppercase font-bold text-slate-400">Manage institutional greetings lifecycle</CardDescription>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200">
                        {['All', 'Active', 'Draft'].map((f: any) => (
                          <button 
                            key={f} 
                            onClick={() => setStatusFilter(f)} 
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                              statusFilter === f ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-100"
                            )}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input placeholder="Filter registry..." className="pl-9 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm text-xs w-full sm:w-48" value={search} onChange={e => setSearch(e.target.value)} />
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   <ScrollArea className="h-[550px]">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                         {filtered.map((occ: any) => (
                           <div key={occ.id} className="p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex flex-col md:flex-row items-center justify-between gap-8 group">
                              <div className="flex items-start gap-6 flex-1 min-w-0">
                                 <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-lg shrink-0 border-2 border-slate-100 group-hover:scale-105 transition-transform duration-500">
                                    <Image src={occ.imageUrl} alt="Banner" fill className="object-cover" />
                                 </div>
                                 <div className="min-w-0 space-y-2">
                                    <div className="flex items-center gap-2">
                                       <h4 className="text-lg font-headline font-bold text-primary dark:text-white truncate uppercase tracking-tight">{occ.title}</h4>
                                       <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[7px] uppercase h-4 px-2">{occ.category}</Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed italic">"{occ.message}"</p>
                                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                       <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent" /> {occ.startDate}</span>
                                       <ArrowRight className="w-3 h-3" />
                                       <span className="text-primary dark:text-slate-200">{occ.endDate}</span>
                                    </div>
                                 </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-center gap-8 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-none">
                                 {/* EXPLICIT LIVE TOGGLE */}
                                 <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Live Status Control</span>
                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner w-full justify-between">
                                       <Switch 
                                          checked={occ.isActive} 
                                          onCheckedChange={(val) => handleStatusUpdate(occ, val)} 
                                          className="data-[state=checked]:bg-emerald-500"
                                       />
                                       <Badge className={cn(
                                         "text-[9px] font-black uppercase px-3 h-6 border-none shadow-sm transition-all",
                                         occ.isActive ? "bg-emerald-500 text-white animate-pulse" : "bg-slate-300 text-slate-500"
                                       )}>
                                          {occ.isActive ? 'ON LIVE' : 'OFF LIVE'}
                                       </Badge>
                                    </div>
                                 </div>

                                 {/* EXPLICIT CRUD ACTIONS */}
                                 <div className="flex gap-2 shrink-0">
                                    <Button 
                                      onClick={() => { setEditOccasion(occ); setIsEditDialogOpen(true); }}
                                      variant="outline"
                                      className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 hover:border-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                      <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                                    </Button>
                                    
                                    <AlertDialog>
                                       <AlertDialogTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                          >
                                            <Trash2 className="w-4.5 h-4.5" />
                                          </Button>
                                       </AlertDialogTrigger>
                                       <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900 p-10 text-center">
                                          <AlertDialogHeader className="items-center">
                                             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 animate-pulse"><Trash2 className="w-8 h-8" /></div>
                                             <AlertDialogTitle className="text-2xl font-headline font-bold">Purge Record?</AlertDialogTitle>
                                             <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                                                This will permanently remove the greeting record from the institutional registry. This action cannot be undone.
                                             </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter className="mt-8 flex gap-3">
                                             <AlertDialogCancel className="rounded-xl h-12 font-bold flex-1">Cancel</AlertDialogCancel>
                                             <AlertDialogAction onClick={() => handleDeleteOccasion(occ.id)} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 font-bold flex-1">Permanently Delete</AlertDialogAction>
                                          </AlertDialogFooter>
                                       </AlertDialogContent>
                                    </AlertDialog>
                                 </div>
                              </div>
                           </div>
                         ))}
                         {filtered.length === 0 && (
                           <div className="py-32 text-center flex flex-col items-center gap-4">
                              <Database className="w-16 h-16 text-slate-100 mx-auto" />
                              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching records identified in registry</p>
                           </div>
                         )}
                      </div>
                   </ScrollArea>
                </CardContent>
              </Card>
           </div>

           {/* RIGHT: PROTOCOLS & INTELLIGENCE */}
           <div className="lg:col-span-4 space-y-6">
              <Card className="rounded-[2.5rem] bg-slate-900 border-none shadow-xl text-white p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                 <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                       <Zap className="w-6 h-6 text-accent" />
                       <h3 className="text-sm font-black uppercase tracking-widest">Autonomous Protocol</h3>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 shadow-inner">
                       <div className="space-y-0.5">
                          <h4 className="font-bold text-xs">Calendar Sync Mode</h4>
                          <p className="text-[9px] text-slate-500 uppercase font-black">Auto-Discovery Control</p>
                       </div>
                       <Switch checked={isAutoMode} onCheckedChange={handleToggleProtocol} className="data-[state=checked]:bg-accent" />
                    </div>
                    <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-4 shadow-inner">
                       <div className="flex items-center gap-3">
                          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">System Intelligence</span>
                       </div>
                       <p className="text-[11px] leading-relaxed text-slate-400 font-medium italic">
                          "Autonomous Mode suspends manual broadcasts to prioritize institutional milestones discovered in the national cycle. Ensure manual records do not overlap with national holidays."
                       </p>
                    </div>
                 </div>
              </Card>

              <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center space-y-4 shadow-xl">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 mx-auto shadow-sm"><ShieldCheck className="w-6 h-6" /></div>
                 <h4 className="text-sm font-headline font-bold text-primary dark:text-white uppercase tracking-tight">Audit Mandate</h4>
                 <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
                    All broadcasts are logged with administrative timestamps for future accountability and statutory reporting.
                 </p>
              </div>
           </div>
        </div>

        {/* 3. TACTICAL TIMELINE (Bottom Detailed Calendar) */}
        <div className="pt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-slate-100 dark:border-slate-800 pb-8">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-accent shadow-lg">
                    <CalendarDays className="w-7 h-7" />
                 </div>
                 <div>
                    <h2 className="text-2xl md:text-4xl font-headline font-bold text-primary dark:text-white">Tactical <span className="text-accent italic">Timeline</span></h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Full-Spectrum Institutional Calendar oversight</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border shadow-xl">
                 <Button onClick={() => setCurrentCalendarMonth(subMonths(currentCalendarMonth, 1))} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50"><ChevronLeft className="w-5 h-5" /></Button>
                 <span className="px-8 text-sm font-black uppercase tracking-widest text-primary dark:text-white min-w-[180px] text-center">{format(currentCalendarMonth, 'MMMM yyyy')}</span>
                 <Button onClick={() => setCurrentCalendarMonth(addMonths(currentCalendarMonth, 1))} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50"><ChevronRight className="w-5 h-5" /></Button>
              </div>
           </div>

           <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* MONTHLY GRID VIEW */}
              <div className="lg:col-span-8">
                 <div className="grid grid-cols-7 gap-3">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                       <div key={d} className="text-center py-4 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] mb-2">{d}</div>
                    ))}
                    {calendarDays.map((day, idx) => {
                       const dayStr = format(day, 'yyyy-MM-dd');
                       const dayOccasions = (occasions || []).filter((o: any) => 
                         isWithinInterval(day, { start: startOfDay(parseISO(o.startDate)), end: endOfDay(parseISO(o.endDate)) })
                       );
                       const holiday = allSpecialDays.find(sd => isSameDay(sd.date, day));
                       const isTodayDay = isToday(day);
                       const isSameMonthDay = isSameMonth(day, currentCalendarMonth);

                       return (
                        <Card key={idx} className={cn(
                          "min-h-[140px] rounded-3xl border-none shadow-sm transition-all group p-4 relative overflow-hidden",
                          isTodayDay ? "bg-accent/10 ring-2 ring-accent/30 scale-[1.02] shadow-xl" : "bg-white dark:bg-slate-900",
                          !isSameMonthDay && "opacity-20 grayscale",
                          isSameMonthDay && "hover:shadow-xl hover:ring-1 hover:ring-accent/20"
                        )}>
                           {isTodayDay && <div className="absolute top-0 left-0 w-full h-1 bg-accent animate-pulse" />}
                           <div className="flex justify-between items-start mb-4">
                              <span className={cn(
                                "text-base font-black w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                                isTodayDay ? "bg-accent text-primary shadow-lg" : "text-slate-400 group-hover:text-primary dark:text-slate-600 dark:group-hover:text-white"
                              )}>{format(day, 'd')}</span>
                              {holiday?.isHoliday && <Badge className="bg-red-600 text-white text-[7px] font-black border-none px-2 h-4 uppercase shadow-sm">NATIONAL</Badge>}
                           </div>
                           
                           <div className="space-y-2 overflow-hidden">
                              {holiday && (
                                <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[9px] font-black uppercase truncate border border-emerald-100 dark:border-emerald-900">
                                   {holiday.title}
                                </div>
                              )}
                              {dayOccasions.map((occ: any, i: number) => (
                                <div key={i} className={cn(
                                  "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase truncate border flex items-center gap-1.5 transition-all",
                                  occ.isActive ? "bg-accent/10 border-accent/30 text-accent" : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                )}>
                                   {occ.isActive && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]" />}
                                   {occ.title}
                                </div>
                              ))}
                           </div>
                        </Card>
                       );
                    })}
                 </div>
              </div>

              {/* SIDEBAR: NEXT 30 DAYS AGENDA */}
              <div className="lg:col-span-4 space-y-6">
                 <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 p-8">
                    <CardHeader className="p-0 mb-8 border-b pb-6">
                       <CardTitle className="text-xl font-headline font-bold flex items-center gap-3 text-primary dark:text-white">
                          <Clock className="w-6 h-6 text-accent" /> Institutional Agenda
                       </CardTitle>
                       <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next 30 days projection</CardDescription>
                    </CardHeader>
                    <ScrollArea className="h-[650px] pr-4">
                       <div className="space-y-10">
                          {specialDaysInMonth.map((d, i) => {
                             const daysRemaining = differenceInDays(d.date, startOfDay(new Date()));
                             return (
                              <div key={i} className="flex gap-6 group relative">
                                 <div className="flex flex-col items-center shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shadow-xl group-hover:bg-accent group-hover:text-primary transition-all duration-500">
                                       <span className="text-[8px] font-black uppercase tracking-tighter opacity-60 leading-none">{format(d.date, 'MMM')}</span>
                                       <span className="text-lg font-black leading-none">{format(d.date, 'd')}</span>
                                    </div>
                                    <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 mt-4"></div>
                                 </div>
                                 <div className="space-y-2 pb-10 flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                       {daysRemaining === 0 ? (
                                         <Badge className="bg-red-600 text-white text-[8px] font-black uppercase animate-pulse">ACTIVE TODAY</Badge>
                                       ) : (
                                         <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">IN {daysRemaining} DAYS</span>
                                       )}
                                       <span className="text-[8px] font-bold text-slate-400 uppercase">{d.category}</span>
                                    </div>
                                    <h5 className="text-base font-bold text-primary dark:text-white leading-tight uppercase truncate">{d.title}</h5>
                                    <p className="text-[10px] font-medium text-slate-500 italic">Institutional observance mandate</p>
                                 </div>
                              </div>
                             );
                          })}
                          {specialDaysInMonth.length === 0 && (
                            <div className="py-20 text-center text-slate-300 font-bold uppercase text-xs">No upcoming milestones</div>
                          )}
                       </div>
                    </ScrollArea>
                 </Card>
              </div>
           </div>
        </div>

      </section>

      {/* 4. MODALS & DIALOGS */}

      {/* CREATE MODAL */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col p-0 z-[1000001]">
            <div className="bg-slate-900 p-10 text-white relative shrink-0 border-b-4 border-accent/20">
               <div className="absolute right-8 top-8"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10 transition-all h-10 w-10"><X className="w-6 h-6" /></Button></DialogClose></div>
               <DialogTitle className="text-3xl font-headline font-bold">Launch New Broadcast</DialogTitle>
               <DialogDescription className="text-slate-400 uppercase tracking-widest text-[10px] font-black mt-2 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-400" /> Administrative Deployment Node
               </DialogDescription>
            </div>
            
            <div className="flex-1 p-10 space-y-10">
                {/* Visual Banner Area */}
                <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-3xl bg-slate-50 dark:bg-slate-950 border-slate-200 shadow-inner group">
                   <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white shadow-2xl border-4 border-white transition-all group-hover:shadow-accent/10">
                     {newOccasion.imageUrl ? (
                       <Image src={newOccasion.imageUrl} alt="Preview" fill className="object-cover" />
                     ) : (
                       <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300">
                          <ImageIcon className="w-16 h-16 opacity-20" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Visual Payload</span>
                       </div>
                     )}
                     <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileChange(e, false)} />
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
                      <Upload className="w-4 h-4" /> Click center area to select banner (< 200KB)
                   </div>
                </div>

                {/* Form Logic */}
                <div className="space-y-8">
                   {/* Bilingual Title Block */}
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <div className="flex items-center justify-between mb-1">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">English Headline *</Label>
                            <button type="button" onClick={() => setAddTitleLang('en')} className={cn("px-3 py-0.5 rounded-md text-[8px] font-black uppercase transition-all", addTitleLang === 'en' ? "bg-accent text-primary shadow-sm" : "text-slate-400")}>EN</button>
                         </div>
                         <Input value={newOccasion.title} onChange={e => setNewOccasion({...newOccasion, title: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold" placeholder="e.g. Independence Day 2026" />
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center justify-between mb-1">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Bengali Headline</Label>
                            <button type="button" onClick={() => setAddTitleLang('bn')} className={cn("px-3 py-0.5 rounded-md text-[8px] font-black uppercase transition-all", addTitleLang === 'bn' ? "bg-accent text-primary shadow-sm" : "text-slate-400")}>BN</button>
                         </div>
                         <Input value={newOccasion.titleBn} onChange={e => setNewOccasion({...newOccasion, titleBn: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold" placeholder="যেমন: স্বাধীনতা দিবস ২০২৬" />
                      </div>
                   </div>

                   {/* Scheduling Block */}
                   <div className="grid grid-cols-2 gap-8 p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] shadow-inner border border-slate-100">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Deployment (Start Date)</Label>
                         <Input type="date" value={newOccasion.startDate} onChange={e => setNewOccasion({...newOccasion, startDate: e.target.value})} className="h-11 rounded-xl bg-white border-none shadow-sm font-bold" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Termination (End Date)</Label>
                         <Input type="date" value={newOccasion.endDate} onChange={e => setNewOccasion({...newOccasion, endDate: e.target.value})} className="h-11 rounded-xl bg-white border-none shadow-sm font-bold" />
                      </div>
                   </div>

                   {/* Narrative Content */}
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Bilingual Narrative (English & Bengali)</Label>
                         <Textarea value={newOccasion.message} onChange={e => setNewOccasion({...newOccasion, message: e.target.value})} placeholder="English message content..." className="min-h-[100px] rounded-2xl bg-slate-50 border-none shadow-inner p-5 text-sm" />
                         <Textarea value={newOccasion.messageBn} onChange={e => setNewOccasion({...newOccasion, messageBn: e.target.value})} placeholder="বাংলায় বার্তা লিখুন..." className="min-h-[100px] rounded-2xl bg-slate-50 border-none shadow-inner p-5 text-sm mt-4" />
                      </div>
                   </div>

                   {/* Execution Parameters */}
                   <div className="grid md:grid-cols-2 gap-8 items-end">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Broadcast Priority</Label>
                         <Input type="number" value={newOccasion.priority} onChange={e => setNewOccasion({...newOccasion, priority: Number(e.target.value)})} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-black text-xl text-center" />
                      </div>
                      <div className="flex items-center justify-between p-6 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 h-12 shadow-sm">
                         <Label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Auto-Enable (Go Live)</Label>
                         <Switch checked={newOccasion.isActive} onCheckedChange={val => setNewOccasion({...newOccasion, isActive: val})} className="data-[state=checked]:bg-emerald-500" />
                      </div>
                   </div>
                </div>

                <div className="pt-10">
                   <Button onClick={handleAddOccasion} disabled={isActionLoading} className="w-full h-16 rounded-3xl bg-primary text-white font-black uppercase tracking-widest text-sm md:text-base hover:bg-secondary transition-all shadow-2xl shadow-primary/20 flex gap-3">
                      {isActionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> Verify & Publish Broadcast</>}
                   </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditDialogOpen} onOpenChange={(val) => { if(!val) { setIsEditDialogOpen(false); setEditOccasion(null); } }}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col p-0 z-[1000001]">
            <div className="bg-slate-900 p-10 text-white relative shrink-0 border-b-4 border-accent/20">
               <div className="absolute right-8 top-8"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10 transition-all h-10 w-10"><X className="w-6 h-6" /></Button></DialogClose></div>
               <DialogTitle className="text-3xl font-headline font-bold">Update Broadcast Metadata</DialogTitle>
               <DialogDescription className="text-slate-400 uppercase tracking-widest text-[10px] font-black mt-2">Registry Refresh Protocol</DialogDescription>
            </div>
            
            {editOccasion && (
              <div className="flex-1 p-10 space-y-8">
                <div className="flex flex-col items-center gap-4 p-5 border-2 border-dashed rounded-3xl bg-slate-50 dark:bg-slate-900 shadow-inner">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white shadow-xl border-4 border-white">
                    <Image src={editOccasion.imageUrl} alt="Banner" fill className="object-cover" />
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileChange(e, true)} />
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-slate-400">Click Image to Replace Banner</Badge>
                </div>

                <div className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Headline (EN) *</Label><Input value={editOccasion.title} onChange={e => setEditOccasion({...editOccasion, title: e.target.value})} className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold" /></div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Headline (BN)</Label><Input value={editOccasion.titleBn || ''} onChange={e => setEditOccasion({...editOccasion, titleBn: e.target.value})} className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold" /></div>
                   </div>

                   <div className="grid grid-cols-2 gap-8 p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 shadow-inner">
                      <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Start Date</Label><Input type="date" value={editOccasion.startDate} onChange={e => setEditOccasion({...editOccasion, startDate: e.target.value})} className="h-11 rounded-xl bg-white border-none shadow-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">End Date</Label><Input type="date" value={editOccasion.endDate} onChange={e => setEditOccasion({...editOccasion, endDate: e.target.value})} className="h-11 rounded-xl bg-white border-none shadow-sm" /></div>
                   </div>

                   <div className="space-y-4">
                      <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Narrative (EN)</Label><Textarea value={editOccasion.message} onChange={e => setEditOccasion({...editOccasion, message: e.target.value})} className="rounded-2xl min-h-[100px] bg-slate-50 border-none shadow-inner p-4 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Narrative (BN)</Label><Textarea value={editOccasion.messageBn || ''} onChange={e => setEditOccasion({...editOccasion, messageBn: e.target.value})} className="rounded-2xl min-h-[100px] bg-slate-50 border-none shadow-inner p-4 text-sm" /></div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-8 items-center">
                      <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Priority</Label><Input type="number" value={editOccasion.priority} onChange={e => setEditOccasion({...editOccasion, priority: Number(e.target.value)})} className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold text-center" /></div>
                      <div className="flex items-center justify-between p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 h-11 self-end shadow-sm">
                         <Label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Status</Label>
                         <Switch checked={editOccasion.isActive} onCheckedChange={val => setEditOccasion({...editOccasion, isActive: val})} className="data-[state=checked]:bg-emerald-500" />
                      </div>
                   </div>
                </div>

                <div className="pt-6">
                   <Button onClick={handleUpdateOccasion} disabled={isActionLoading} className="w-full h-16 rounded-3xl bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-secondary transition-all shadow-xl">
                      {isActionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Commit Registry Refresh"}
                   </Button>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}

/**
 * Procedural Helpers
 */
function differenceInDays(date1: Date, date2: Date) {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h > 0 ? h + 'h ' : ''}${m}m`;
}
