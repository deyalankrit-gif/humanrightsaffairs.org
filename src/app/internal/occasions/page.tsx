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
  List
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
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * Occasions Governance Terminal: Real-time mission control for institutional greetings.
 * Expanded with full-width calendar, detailed registry CRUD, and master Live toggles.
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

  // Language Switching States for Forms
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
    return [
      ...BUILT_IN_HOLIDAYS.map(h => ({ ...h, isHoliday: true, date: startOfDay(new Date(2026, h.month - 1, h.day)) })),
      ...BUILT_IN_OBSERVANCES.map(o => ({ ...o, isHoliday: false, date: startOfDay(new Date(2026, o.month - 1, o.day)) }))
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
      .then(() => toast({ title: val ? "ON LIVE" : "OFF LIVE" }))
      .finally(() => setIsActionLoading(false));
  };

  const handleDeleteOccasion = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'occasions', id)).then(() => toast({ title: "Record Purged" }));
  };

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentCalendarMonth);
    const end = endOfMonth(currentCalendarMonth);
    return eachDayOfInterval({ start, end });
  }, [currentCalendarMonth]);

  const filtered = (occasions || []).filter((occ: any) => {
    const matchesSearch = occ.title.toLowerCase().includes(search.toLowerCase()) || 
                          occ.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : 
                         statusFilter === 'Active' ? occ.isActive === true : occ.isActive === false;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-accent" /></div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/30">
              <Wifi className="w-2.5 h-2.5 animate-pulse" /> Live Broadcast Management
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Occasions <span className="text-accent italic">Governance</span></h1>
            <p className="text-slate-400 text-[11px] uppercase font-black">Official Hub for National Greetings & Broadcasts</p>
          </div>
          
          <div className="flex gap-3">
             <Button onClick={() => setIsAddDialogOpen(true)} className="bg-accent text-primary-foreground hover:bg-secondary hover:text-white font-bold rounded-xl h-11 px-8 shadow-xl shadow-accent/20 transition-all">
                <Plus className="w-4 h-4 mr-2" /> New Broadcast
             </Button>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-7xl space-y-12">
        
        {/* Registry & Protocol Controls */}
        <div className="grid lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="p-8 border-b bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                   <div className="space-y-1">
                      <CardTitle className="text-xl font-headline font-bold flex items-center gap-2">
                        <History className="w-5 h-5 text-accent" /> Broadcast Registry
                      </CardTitle>
                      <CardDescription className="text-xs uppercase font-bold text-slate-400">All historical and active broadcasts</CardDescription>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-950 rounded-xl border">
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
                        <Input placeholder="Filter registry..." className="pl-9 h-9 rounded-xl text-xs w-48" value={search} onChange={e => setSearch(e.target.value)} />
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   <ScrollArea className="h-[450px]">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                         {filtered.map((occ: any) => (
                           <div key={occ.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                              <div className="flex items-center gap-5 flex-1 min-w-0">
                                 <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-slate-100">
                                    <Image src={occ.imageUrl} alt="Banner" fill className="object-cover" />
                                 </div>
                                 <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                       <h4 className="text-base font-bold text-primary dark:text-white truncate">{occ.title}</h4>
                                       <Badge variant="outline" className="text-[7px] font-black border-slate-200">{occ.category}</Badge>
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-1 italic">"{occ.message}"</p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{occ.startDate} — {occ.endDate}</p>
                                 </div>
                              </div>
                              
                              <div className="flex items-center gap-8 shrink-0">
                                 <div className="flex flex-col items-center gap-1.5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Live Status</span>
                                    <div className="flex items-center gap-2">
                                       <Switch 
                                          checked={occ.isActive} 
                                          onCheckedChange={(val) => handleStatusUpdate(occ, val)} 
                                          className="data-[state=checked]:bg-emerald-500"
                                       />
                                       <Badge className={cn("text-[8px] font-black uppercase px-2 h-5", occ.isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500")}>
                                          {occ.isActive ? 'ON LIVE' : 'OFF LIVE'}
                                       </Badge>
                                    </div>
                                 </div>
                                 <div className="flex gap-1.5">
                                    <button onClick={() => { setEditOccasion(occ); setIsEditDialogOpen(true); }} className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-accent transition-all"><Edit className="w-4 h-4" /></button>
                                    <AlertDialog>
                                       <AlertDialogTrigger asChild><button className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button></AlertDialogTrigger>
                                       <AlertDialogContent className="rounded-[2.5rem]"><AlertDialogHeader><AlertDialogTitle>Purge Record?</AlertDialogTitle><AlertDialogDescription>Permanently remove this greeting from the manual registry?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteOccasion(occ.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">Purge</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                    </AlertDialog>
                                 </div>
                              </div>
                           </div>
                         ))}
                         {filtered.length === 0 && (
                           <div className="py-24 text-center opacity-30">
                              <Database className="w-12 h-12 mx-auto mb-4" />
                              <p className="text-sm font-black uppercase tracking-[0.3em]">Registry Query Empty</p>
                           </div>
                         )}
                      </div>
                   </ScrollArea>
                </CardContent>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <Card className="rounded-[2.5rem] bg-slate-900 border-none shadow-xl text-white p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                 <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                       <Zap className="w-6 h-6 text-accent" />
                       <h3 className="text-sm font-black uppercase tracking-widest">Autonomous Protocol</h3>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5">
                       <div className="space-y-0.5">
                          <h4 className="font-bold text-xs">Calendar Sync Mode</h4>
                          <p className="text-[9px] text-slate-500 uppercase font-black">AI Discovery Control</p>
                       </div>
                       <Switch checked={isAutoMode} onCheckedChange={handleToggleProtocol} className="data-[state=checked]:bg-accent" />
                    </div>
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                       <div className="flex items-center gap-3">
                          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Protocol Intelligence</span>
                       </div>
                       <p className="text-[11px] leading-relaxed text-slate-400 italic">
                          "Enabling Auto-Mode suspends manual broadcasts to prevent visual conflicts on the public portal. The system will autonomously scan the institutional calendar for the next relevant occasion."
                       </p>
                    </div>
                 </div>
              </Card>

              <div className="p-8 rounded-[3rem] bg-indigo-50 dark:bg-indigo-950/20 border-2 border-dashed border-indigo-200 dark:border-indigo-900 text-center space-y-4 shadow-sm">
                 <ShieldCheck className="w-10 h-10 text-indigo-500 mx-auto" />
                 <h4 className="text-sm font-black uppercase tracking-widest text-indigo-700">Governance Notice</h4>
                 <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
                    Occasions represent the public face of the Trust. Ensure all narratives follow the established institutional etiquette.
                 </p>
              </div>
           </div>
        </div>

        {/* Full-Width Detailed Calendar Section */}
        <div className="pt-8 space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 flex items-center justify-center text-accent shadow-sm">
                    <CalendarDays className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary dark:text-white">Institutional <span className="text-accent italic">Timeline</span></h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical oversight of special days & scheduled broadcasts</p>
                 </div>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border shadow-inner">
                 <Button onClick={() => setCurrentCalendarMonth(subMonths(currentCalendarMonth, 1))} variant="ghost" size="icon" className="h-9 w-9 rounded-xl"><ChevronLeft className="w-4 h-4" /></Button>
                 <span className="px-6 text-sm font-black uppercase tracking-widest text-primary dark:text-white">{format(currentCalendarMonth, 'MMMM yyyy')}</span>
                 <Button onClick={() => setCurrentCalendarMonth(addMonths(currentCalendarMonth, 1))} variant="ghost" size="icon" className="h-9 w-9 rounded-xl"><ChevronRight className="w-4 h-4" /></Button>
              </div>
           </div>

           <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Detailed Month Grid */}
              <div className="lg:col-span-8">
                 <div className="grid grid-cols-7 gap-3">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                       <div key={d} className="text-center py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] mb-2">{d}</div>
                    ))}
                    {calendarDays.map((day, idx) => {
                       const dayStr = format(day, 'yyyy-MM-dd');
                       const dayOccasions = (occasions || []).filter((o: any) => 
                         isWithinInterval(day, { start: startOfDay(parseISO(o.startDate)), end: endOfDay(parseISO(o.endDate)) })
                       );
                       const holiday = allSpecialDays.find(sd => isSameDay(sd.date, day));
                       const isTodayDay = isToday(day);

                       return (
                        <Card key={idx} className={cn(
                          "min-h-[120px] rounded-2xl border-none shadow-sm transition-all group p-3 relative",
                          isTodayDay ? "bg-accent/5 ring-2 ring-accent/20" : "bg-white dark:bg-slate-900",
                          !isSameMonth(day, currentCalendarMonth) && "opacity-20"
                        )}>
                           <div className="flex justify-between items-start mb-3">
                              <span className={cn(
                                "text-sm font-black w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                isTodayDay ? "bg-accent text-primary" : "text-slate-400 group-hover:text-primary"
                              )}>{format(day, 'd')}</span>
                              {holiday?.isHoliday && <Badge className="bg-red-500 text-white text-[7px] border-none px-1.5 h-4">OFFICIAL</Badge>}
                           </div>
                           
                           <div className="space-y-1.5 overflow-hidden">
                              {holiday && (
                                <div className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase truncate border border-emerald-100">
                                   {holiday.title}
                                </div>
                              )}
                              {dayOccasions.map((occ: any, i: number) => (
                                <div key={i} className={cn(
                                  "px-2 py-0.5 rounded-md text-[8px] font-black uppercase truncate border flex items-center gap-1.5",
                                  occ.isActive ? "bg-accent/10 border-accent/20 text-accent" : "bg-slate-100 text-slate-400 border-slate-200"
                                )}>
                                   {occ.isActive && <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />}
                                   {occ.title}
                                </div>
                              ))}
                           </div>
                        </Card>
                       );
                    })}
                 </div>
              </div>

              {/* Sidebar: Strategic Agenda */}
              <div className="lg:col-span-4 space-y-6">
                 <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8">
                    <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-6 flex items-center gap-2">
                       <Clock className="w-4 h-4" /> Next 30 Days Agenda
                    </h3>
                    <ScrollArea className="h-[600px] pr-4">
                       <div className="space-y-8">
                          {specialDaysInMonth.map((d, i) => {
                             const daysRemaining = differenceInDays(d.date, startOfDay(new Date()));
                             return (
                              <div key={i} className="flex gap-4 group">
                                 <div className="flex flex-col items-center shrink-0">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-black group-hover:bg-accent group-hover:text-primary transition-all shadow-lg">{format(d.date, 'd')}</div>
                                    <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 mt-2"></div>
                                 </div>
                                 <div className="space-y-1.5 pb-8 flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                       <p className="text-[8px] font-black uppercase text-slate-400 leading-none">{format(d.date, 'MMMM yyyy')}</p>
                                       {daysRemaining > 0 && <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">In {daysRemaining} Days</span>}
                                       {daysRemaining === 0 && <Badge className="bg-red-600 text-[6px] h-4">TODAY</Badge>}
                                    </div>
                                    <h5 className="text-sm font-black text-primary dark:text-white uppercase truncate">{d.title}</h5>
                                    <div className="flex items-center gap-3">
                                       <Badge variant="outline" className="text-[7px] font-bold border-slate-200">{d.category}</Badge>
                                       <span className="text-[8px] font-black text-slate-300 uppercase">{d.isHoliday ? 'Statutory Holiday' : 'Observance'}</span>
                                    </div>
                                 </div>
                              </div>
                             );
                          })}
                       </div>
                    </ScrollArea>
                 </Card>
              </div>
           </div>
        </div>

      </section>

      {/* Global Edit Dialog */}
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

                <div className="space-y-2">
                   <div className="flex items-center justify-between mb-1">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Occasion Title *</Label>
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border">
                         <button type="button" onClick={() => setEditTitleLang('en')} className={cn("px-3 py-0.5 rounded-md text-[8px] font-black uppercase transition-all", editTitleLang === 'en' ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400")}>EN</button>
                         <button type="button" onClick={() => setEditTitleLang('bn')} className={cn("px-3 py-0.5 rounded-md text-[8px] font-black uppercase transition-all", editTitleLang === 'bn' ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400")}>BN</button>
                      </div>
                   </div>
                   {editTitleLang === 'en' ? (
                     <Input value={editOccasion.title} onChange={e => setEditOccasion({...editOccasion, title: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold animate-in fade-in duration-300" />
                   ) : (
                     <Input value={editOccasion.titleBn || ''} lang="bn" onChange={e => setEditOccasion({...editOccasion, titleBn: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-medium leading-relaxed animate-in fade-in duration-300" />
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold text-slate-500">Start Date</Label><Input type="date" value={editOccasion.startDate} onChange={e => setEditOccasion({...editOccasion, startDate: e.target.value})} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold text-slate-500">End Date</Label><Input type="date" value={editOccasion.endDate} onChange={e => setEditOccasion({...editOccasion, endDate: e.target.value})} className="h-11 rounded-xl" /></div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Greeting Narrative</Label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border">
                      <button type="button" onClick={() => setEditMsgLang('en')} className={cn("px-3 py-0.5 rounded-md text-[8px] font-black uppercase transition-all", editMsgLang === 'en' ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400")}>EN</button>
                      <button type="button" onClick={() => setEditMsgLang('bn')} className={cn("px-3 py-0.5 rounded-md text-[8px] font-black uppercase transition-all", editMsgLang === 'bn' ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400")}>BN</button>
                    </div>
                  </div>
                  {editMsgLang === 'en' ? (
                    <Textarea value={editOccasion.message} onChange={e => setEditOccasion({...editOccasion, message: e.target.value})} className="rounded-xl min-h-[120px] animate-in fade-in duration-300" />
                  ) : (
                    <Textarea value={editOccasion.messageBn || ''} lang="bn" onChange={e => setEditOccasion({...editOccasion, messageBn: e.target.value})} className="rounded-xl min-h-[120px] font-medium leading-relaxed animate-in fade-in duration-300" />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 items-center">
                   <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">Display Priority</Label><Input type="number" value={editOccasion.priority} onChange={e => setEditOccasion({...editOccasion, priority: Number(e.target.value)})} className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold" /></div>
                   <div className="flex items-center justify-between p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900 h-11 self-end">
                      <Label className="text-[10px] font-bold text-primary dark:text-emerald-400 uppercase">ON LIVE Status</Label>
                      <Switch checked={editOccasion.isActive} onCheckedChange={val => setEditOccasion({...editOccasion, isActive: val})} className="data-[state=checked]:bg-emerald-500 ml-4" />
                   </div>
                </div>

                <Button type="button" onClick={handleUpdateOccasion} disabled={isActionLoading} className="w-full h-16 rounded-2xl bg-primary text-white font-bold shadow-xl hover:bg-secondary transition-all text-base md:text-lg">Save Profile Changes</Button>
              </div>
            )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}

// Minimal helpers
function differenceInDays(date1: Date, date2: Date) {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h > 0 ? h + 'h ' : ''}${m}m`;
}
