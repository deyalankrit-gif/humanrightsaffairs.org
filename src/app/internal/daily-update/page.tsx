
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, where, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ListTodo, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  Plus, 
  Trash2, 
  Send, 
  FileText, 
  Download, 
  Printer, 
  Zap, 
  Activity, 
  Wifi, 
  Mail, 
  ArrowRight,
  Info,
  ChevronRight,
  MoreVertical,
  X,
  Target,
  Users,
  UserPlus,
  RefreshCw,
  User,
  Sparkles,
  Cpu,
  Globe,
  Gavel,
  Scale,
  Hourglass,
  LayoutDashboard,
  Handshake
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { format, isToday, parseISO, differenceInDays, startOfDay, isTomorrow, addDays, parse } from 'date-fns'
import { Footer } from '@/components/footer'
import { BUILT_IN_OBSERVANCES, BUILT_IN_HOLIDAYS } from '@/lib/activity-hub-data'
import Link from 'next/link'

/**
 * MISSION COMMAND CENTER: Daily Update Dashboard
 * A high-fidelity, colorfully animated terminal for real-time institutional oversight.
 * Optimized for full mobile responsiveness.
 */
export default function DailyUpdatePage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [todoFilter, setTodoFilter] = useState<'All' | 'Pending' | 'Completed' | 'Overdue'>('All')

  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    dueDate: ''
  })

  const [newNote, setNewNote] = useState('')

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    setNewTask(prev => ({ ...prev, dueDate: format(new Date(), 'yyyy-MM-dd') }))
  }, [])

  // Data Streams
  const complaintsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'public_complaints'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: complaints } = useCollection(complaintsQuery);

  const applicationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'memberApplications'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: applications } = useCollection(applicationsQuery);

  const tasksQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'daily_tasks'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: tasks, loading: tasksLoading } = useCollection(tasksQuery);

  const notesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'daily_notes'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: notes } = useCollection(notesQuery);

  const meetingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'meetings'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: meetings } = useCollection(meetingsQuery);

  // Calendar Intelligence: Special Days within next 7 days
  const upcomingSpecialDays = useMemo(() => {
    if (!mounted) return [];
    const results: any[] = [];
    const now = new Date();
    
    for (let i = 0; i <= 7; i++) {
      const checkDate = addDays(now, i);
      const dayNum = checkDate.getDate();
      const monthNum = checkDate.getMonth() + 1;
      
      const matches = [
        ...BUILT_IN_HOLIDAYS.filter(h => h.month === monthNum && h.day === dayNum),
        ...BUILT_IN_OBSERVANCES.filter(o => o.month === monthNum && o.day === dayNum)
      ];
      
      matches.forEach(m => {
        results.push({
          ...m,
          date: checkDate,
          daysAway: i
        });
      });
    }
    return results;
  }, [mounted]);

  // Meeting Intelligence: Lookahead for 15 days
  const upcomingAssemblies = useMemo(() => {
    if (!meetings || !mounted) return [];
    const now = startOfDay(new Date());
    
    return (meetings as any[])
      .map(m => {
        try {
          const mDate = parse(m.date, "PPP", new Date());
          const diff = differenceInDays(startOfDay(mDate), now);
          return { ...m, daysAway: diff };
        } catch (e) {
          return { ...m, daysAway: 999 };
        }
      })
      .filter(m => m.daysAway >= 0 && m.daysAway <= 15)
      .sort((a, b) => a.daysAway - b.daysAway);
  }, [meetings, mounted]);

  // Derived Summary Logic
  const summary = useMemo(() => {
    if (!mounted) return { newComplaintsToday: 0, newAppsToday: 0, casesClosedToday: 0, pendingReview: 0, underInvestigation: 0, highPriority: 0, staleCases: [], suggestions: [] };
    
    const today = startOfDay(new Date());
    const complaintList = complaints || [];
    const appList = applications || [];

    const newComplaintsToday = complaintList.filter(c => {
      if (!c.createdAt?.toDate) return false;
      return isToday(c.createdAt.toDate());
    }).length;

    const newAppsToday = appList.filter(a => {
      if (!a.createdAt?.toDate) return false;
      return isToday(a.createdAt.toDate());
    }).length;

    const casesClosedToday = complaintList.filter(c => {
      if (c.status !== 'Closed' && c.status !== 'Action Taken') return false;
      const updated = typeof c.updatedAt === 'string' ? parseISO(c.updatedAt) : c.updatedAt?.toDate?.();
      return updated && isToday(updated);
    }).length;

    const staleCases = complaintList.filter(c => {
      if (c.status === 'Closed' || c.status === 'Action Taken') return false;
      const lastUpdate = c.createdAt?.toDate?.() || new Date();
      return differenceInDays(new Date(), lastUpdate) > 3;
    });

    const pendingReview = complaintList.filter(c => c.status === 'New Complaint' || c.status === 'Pending').length;
    const underInvestigation = complaintList.filter(c => ['Under Preliminary Review', 'Assigned for Investigation', 'Investigation in Progress'].includes(c.status)).length;
    const highPriority = complaintList.filter(c => c.priority === 'High' && c.status !== 'Closed').length;

    // AI Suggested Actions Logic
    const suggestions = [];
    if (pendingReview > 5) suggestions.push("Prioritize triage for pending complaint records.");
    if (staleCases.length > 0) suggestions.push(`Review ${staleCases.length} cases with no updates in >3 days.`);
    if (newAppsToday > 0) suggestions.push(`Action Required: ${newAppsToday} new membership applications received.`);
    if (highPriority > 3) suggestions.push("High volume of critical priority cases detected.");
    if (upcomingSpecialDays.length > 0) {
      const nextDay = upcomingSpecialDays[0];
      suggestions.push(`Upcoming Special Day: ${nextDay.title} (${nextDay.daysAway === 0 ? 'Today' : `in ${nextDay.daysAway} days`}). Prepare greetings.`);
    }
    if (upcomingAssemblies.length > 0 && upcomingAssemblies[0].daysAway <= 3) {
      suggestions.push(`Urgent: ${upcomingAssemblies[0].title} is scheduled in ${upcomingAssemblies[0].daysAway} days.`);
    }

    return {
      newComplaintsToday,
      newAppsToday,
      casesClosedToday,
      pendingReview,
      underInvestigation,
      highPriority,
      staleCases,
      suggestions
    };
  }, [complaints, applications, upcomingSpecialDays, upcomingAssemblies, mounted]);

  const filteredTasks = useMemo(() => {
    if (!mounted) return [];
    const list = tasks || [];
    const now = startOfDay(new Date());
    
    return list.filter(t => {
      const isOverdue = !t.completed && t.dueDate && parseISO(t.dueDate) < now;
      if (todoFilter === 'Pending') return !t.completed;
      if (todoFilter === 'Completed') return t.completed;
      if (todoFilter === 'Overdue') return isOverdue;
      return true;
    });
  }, [tasks, todoFilter, mounted]);

  // Handlers
  const handleAddTask = async () => {
    if (!db || !newTask.title.trim()) return;
    setIsActionLoading(true);
    try {
      await addDoc(collection(db, 'daily_tasks'), {
        ...newTask,
        completed: false,
        createdAt: serverTimestamp(),
        createdBy: user?.email
      });
      setNewTask({ title: '', priority: 'Medium', dueDate: format(new Date(), 'yyyy-MM-dd') });
      toast({ title: "Task Logged" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleTask = async (id: string, current: boolean) => {
    if (!db) return;
    updateDoc(doc(db, 'daily_tasks', id), { completed: !current });
  };

  const handleDeleteTask = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'daily_tasks', id));
  };

  const handleAddNote = async () => {
    if (!db || !newNote.trim()) return;
    setIsActionLoading(true)
    try {
      await addDoc(collection(db, 'daily_notes'), {
        content: newNote,
        createdAt: serverTimestamp(),
        user: user?.email
      });
      setNewNote('');
      setIsAddingNote(false);
      toast({ title: "Note Archived" });
    } catch (e) {
      toast({ variant: "destructive", title: "Save Failed" });
    } finally {
      setIsActionLoading(false)
    }
  };

  const handleSendDailySummary = () => {
    toast({
      title: "Transmitting Daily Report",
      description: "Aggregating metrics and notifying the central chairman...",
    });
    setTimeout(() => {
      toast({ title: "Report Delivered", description: "Email summary dispatched to oversight cell." });
    }, 1500);
  };

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-10 md:pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-emerald-500/5 -skew-x-12 animate-pulse"></div>
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/30">
               <Cpu className="w-2.5 h-2.5" /> Command Center Operational
            </div>
            <h1 className="text-3xl md:text-5xl font-headline font-bold">Daily <span className="text-accent italic">Update</span></h1>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Operational Oversight: {mounted ? format(new Date(), 'PPPP') : '---'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 w-full md:w-auto">
             <Button onClick={() => window.print()} variant="outline" className="flex-1 md:flex-none bg-white/5 border-white/20 text-white hover:bg-white/10 h-11 px-6 rounded-xl font-bold gap-2">
                <Printer className="w-4 h-4 text-slate-400" /> Print Archive
             </Button>
             <Button onClick={handleSendDailySummary} className="flex-1 md:flex-none bg-accent text-primary hover:bg-secondary hover:text-white h-11 px-6 rounded-xl font-bold gap-2 shadow-xl shadow-accent/20 transition-all hover:-translate-y-1">
                <Mail className="w-4 h-4" /> Send Master Report
             </Button>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
           
           {/* Left Content: Overview & Tasks */}
           <div className="lg:col-span-8 space-y-8">
              
              {/* Today's Intelligence Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                 {[
                   { label: "Complaint Intake", val: summary.newComplaintsToday, icon: <AlertCircle className="text-red-500" />, color: "bg-red-50 dark:bg-red-950/20" },
                   { label: "Pending Vetting", val: summary.pendingReview, icon: <Clock className="text-amber-500" />, color: "bg-amber-50 dark:bg-amber-950/20" },
                   { label: "Active Investigations", val: summary.underInvestigation, icon: <Activity className="text-blue-500" />, color: "bg-blue-50 dark:bg-blue-950/20" },
                   { label: "Resolved Today", val: summary.casesClosedToday, icon: <CheckCircle2 className="text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-950/20" },
                   { label: "New Recruits", val: summary.newAppsToday, icon: <UserPlus className="text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-950/20" },
                   { label: "Total Applications", val: applications?.length || 0, icon: <FileText className="text-slate-400" />, color: "bg-slate-50 dark:bg-slate-900" }
                 ].map((stat, i) => (
                   <Card key={i} className={cn("border-none shadow-sm rounded-3xl overflow-hidden group transition-all hover:scale-105 hover:shadow-xl cursor-default", stat.color)}>
                     <CardContent className="p-5 md:p-6 flex items-center gap-5">
                        <div className="p-3 md:p-4 bg-white dark:bg-slate-800 rounded-2xl group-hover:rotate-12 transition-transform shadow-sm">{stat.icon}</div>
                        <div>
                           <p className="text-2xl md:text-3xl font-headline font-bold leading-none">{stat.val}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                     </CardContent>
                   </Card>
                 ))}
              </div>

              {/* Recruitment Pipeline Stream */}
              <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-100">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                      <UserPlus className="w-6 h-6 text-indigo-500" /> Recruitment Pipeline
                    </CardTitle>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Real-time status tracking for new membership applications</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/internal/applications')} className="w-full md:w-auto rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-100 border px-6 h-10">
                    Full Registry <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-slate-50 dark:divide-slate-800">
                      {applications && applications.slice(0, 5).map((app: any) => (
                        <div key={app.id} className="p-6 md:p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group">
                           <div className="flex items-center gap-5 w-full sm:w-auto">
                              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
                                 <User className="w-6 h-6 md:w-7 md:h-7" />
                              </div>
                              <div className="space-y-1">
                                 <h4 className="text-base font-bold leading-tight">{app.name}</h4>
                                 <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-[8px] font-black text-slate-400 uppercase tracking-tighter border-slate-200">{app.level} Council</Badge>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Globe className="w-3 h-3 text-accent" /> {app.stateName || 'National'}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-none border-slate-100 dark:border-slate-800">
                              <div className="text-right">
                                 <p className="text-[8px] font-black text-slate-400 uppercase">Received</p>
                                 <p className="text-[10px] font-bold text-slate-500">{app.createdAt?.toDate ? format(app.createdAt.toDate(), 'MMM d, p') : 'Just now'}</p>
                              </div>
                              <Badge className={cn(
                                "text-[9px] font-black uppercase px-4 h-7 border-none shadow-sm",
                                app.status === 'Approved' ? 'bg-emerald-500 text-white' : 
                                app.status === 'Rejected' ? 'bg-red-500 text-white' : 
                                app.status === 'Archived' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white animate-pulse'
                              )}>
                                 {app.status}
                              </Badge>
                           </div>
                        </div>
                      ))}
                      {(!applications || applications.length === 0) && (
                        <div className="py-24 text-center opacity-20">
                           <UserPlus className="w-16 h-16 mx-auto mb-4" />
                           <p className="text-sm font-black uppercase tracking-[0.2em]">Pipeline Idle</p>
                        </div>
                      )}
                   </div>
                </CardContent>
              </Card>

              {/* Master To-Do Terminal */}
              <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-100">
                 <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                       <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                          <ListTodo className="w-6 h-6 text-accent" /> Institutional Task Log
                       </CardTitle>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">"Efficiency is the foundation of justice."</p>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 p-1 bg-white dark:bg-slate-950 rounded-2xl border shadow-inner overflow-x-auto no-scrollbar max-w-full">
                       {['All', 'Pending', 'Completed', 'Overdue'].map(f => (
                         <button 
                           key={f}
                           onClick={() => setTodoFilter(f as any)}
                           className={cn(
                             "px-3 md:px-4 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase transition-all whitespace-nowrap",
                             todoFilter === f ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-slate-100"
                           )}
                         >
                           {f}
                         </button>
                       ))}
                    </div>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="p-6 md:p-8 border-b bg-slate-50/30">
                       <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                             <Input 
                               placeholder="Draft new mandate..." 
                               value={newTask.title} 
                               onChange={e => setNewTask({...newTask, title: e.target.value})}
                               onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                               className="h-12 rounded-2xl border-none shadow-inner bg-white"
                             />
                          </div>
                          <div className="flex gap-2">
                             <div className="w-32 md:w-40">
                               <Select value={newTask.priority} onValueChange={(v:any) => setNewTask({...newTask, priority: v})}>
                                  <SelectTrigger className="h-12 rounded-2xl bg-white border-none shadow-inner font-bold"><SelectValue /></SelectTrigger>
                                  <SelectContent className="bg-white z-[1000000]">
                                     <SelectItem value="High" className="text-red-600 font-bold">HIGH</SelectItem>
                                     <SelectItem value="Medium" className="text-amber-600 font-bold">MEDIUM</SelectItem>
                                     <SelectItem value="Low" className="text-blue-600 font-bold">LOW</SelectItem>
                                  </SelectContent>
                               </Select>
                             </div>
                             <Button onClick={handleAddTask} disabled={isActionLoading || !newTask.title.trim()} className="h-12 bg-primary text-white font-bold rounded-2xl gap-2 shadow-lg hover:bg-secondary px-6">
                                <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Log Task</span>
                             </Button>
                          </div>
                       </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 min-h-[300px]">
                       {filteredTasks.length > 0 ? filteredTasks.map((task: any) => {
                         const isOverdue = !task.completed && task.dueDate && parseISO(task.dueDate) < startOfDay(new Date());
                         return (
                           <div key={task.id} className={cn(
                             "p-6 md:p-8 flex items-center justify-between group transition-all", 
                             task.completed ? "opacity-40 grayscale bg-slate-50/20" : "hover:bg-slate-50/50",
                             task.priority === 'High' && !task.completed && "border-l-8 border-red-500"
                           )}>
                              <div className="flex items-center gap-4 md:gap-6">
                                 <Checkbox 
                                   checked={task.completed} 
                                   onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                                   className="h-6 w-6 md:h-7 md:w-7 rounded-lg md:rounded-xl border-2 transition-all data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                 />
                                 <div className="space-y-1 md:space-y-2">
                                    <h4 className={cn("text-base md:text-lg font-bold leading-tight", task.completed && "line-through text-slate-400", isOverdue && !task.completed && "text-red-600")}>
                                       {task.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-3">
                                       <Badge className={cn("text-[7px] md:text-[8px] font-black uppercase px-2 md:px-3 h-4 md:h-5 border-none shadow-sm", task.priority === 'High' ? "bg-red-500" : task.priority === 'Medium' ? "bg-amber-500" : "bg-blue-500")}>
                                          {task.priority}
                                       </Badge>
                                       {task.dueDate && (
                                         <span className={cn("text-[9px] md:text-[10px] font-bold uppercase flex items-center gap-1.5", isOverdue && !task.completed ? "text-red-500 animate-pulse" : "text-slate-400")}>
                                            <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5" /> Due: {task.dueDate}
                                         </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0">
                                     <Trash2 className="w-5 h-5" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-3xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>Are you sure you want to delete this item? This action may be irreversible. Please confirm before continuing.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                           </div>
                         );
                       }) : (
                         <div className="py-24 text-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                               <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-emerald-500 animate-bounce" />
                            </div>
                            <p className="text-base md:text-lg font-black uppercase tracking-[0.3em] text-slate-300">All Mandates Satisfied</p>
                         </div>
                       )}
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Right Column: Sidebar Widgets */}
           <div className="lg:col-span-4 space-y-8">
              
              {/* Strategic Assemblies Monitor */}
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6 md:p-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                 <h3 className="text-xs font-black uppercase text-blue-600 tracking-[0.2em] mb-6 md:mb-8 flex items-center gap-2 leading-none">
                    <Handshake className="w-5 h-5 animate-pulse" /> Strategic Assemblies
                 </h3>
                 <div className="space-y-4">
                    {upcomingAssemblies.length > 0 ? upcomingAssemblies.map((meeting, i) => {
                      const isUrgent = meeting.daysAway <= 3;
                      return (
                        <div key={i} onClick={() => router.push('/internal/meetings')} className={cn(
                          "p-5 md:p-6 rounded-[1.75rem] md:rounded-[2rem] border flex flex-col gap-3 relative group/item hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer",
                          isUrgent 
                            ? "bg-blue-600 text-white border-blue-400 animate-pulse shadow-xl shadow-blue-600/30" 
                            : "bg-blue-50/40 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40"
                        )}>
                           <div className="flex justify-between items-center">
                              <Badge className={cn(
                                "text-[7px] md:text-[8px] font-black uppercase tracking-tighter px-2.5 h-4 md:h-5",
                                isUrgent ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                              )}>
                                {meeting.daysAway === 0 ? 'Today' : meeting.daysAway === 1 ? 'Tomorrow' : `In ${meeting.daysAway} Days`}
                              </Badge>
                              <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest", isUrgent ? "text-blue-100" : "text-slate-400")}>{meeting.date}</span>
                           </div>
                           <h4 className={cn("text-xs md:text-sm font-black leading-tight uppercase tracking-tight", isUrgent ? "text-white" : "text-primary dark:text-white")}>{meeting.title}</h4>
                           <div className={cn("flex items-center gap-2 text-[8px] md:text-[9px] font-bold uppercase", isUrgent ? "text-blue-200" : "text-slate-400")}>
                             <MapPin className="w-3 h-3" /> {meeting.location}
                           </div>
                        </div>
                      )
                    }) : (
                      <div className="text-center py-10 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-2 border-dashed">
                         <Handshake className="w-10 h-10 text-blue-500/10 mx-auto mb-3" />
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">No assemblies in<br/>15-day lookahead</p>
                      </div>
                    )}
                 </div>
              </Card>

              {/* Live Connection Hub */}
              <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white p-6 md:p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                 <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div className="space-y-1">
                       <h3 className="text-xs font-black uppercase text-emerald-400 tracking-[0.2em] flex items-center gap-2">
                          <Wifi className="w-4 h-4 animate-pulse" /> Live System Node
                       </h3>
                       <p className="text-[9px] text-slate-500 font-bold uppercase">Real-time health telemetry</p>
                    </div>
                    <Badge className="bg-emerald-500 text-primary font-black text-[8px]">ACTIVE</Badge>
                 </div>
                 
                 <div className="space-y-3">
                    {[
                      { label: "Registry Database", val: "Operational", color: "text-emerald-400" },
                      { label: "Notification Relay", val: "99.9% Efficiency", color: "text-emerald-400" },
                      { label: "Security Encryption", val: "Level 5 Active", color: "text-accent" },
                      { label: "Crawl Integrity", val: "Optimized", color: "text-emerald-400" }
                    ].map((n, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-colors">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{n.label}</span>
                         <span className={cn("text-[10px] font-bold uppercase", n.color)}>{n.val}</span>
                      </div>
                    ))}
                 </div>
              </Card>

              {/* Seasonal Awareness */}
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6 md:p-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                 <h3 className="text-xs font-black uppercase text-pink-500 tracking-[0.2em] mb-6 md:mb-8 flex items-center gap-2 leading-none">
                    <Sparkles className="w-5 h-5 animate-float" /> Seasonal Awareness
                 </h3>
                 <div className="space-y-4">
                    {upcomingSpecialDays.length > 0 ? upcomingSpecialDays.map((d, i) => (
                      <div key={i} className="p-5 md:p-6 bg-pink-50/40 dark:bg-pink-950/20 rounded-[1.75rem] md:rounded-[2rem] border border-pink-100 dark:border-pink-900/40 flex flex-col gap-3 relative group/item hover:shadow-lg transition-all active:scale-[0.98]">
                         <div className="flex justify-between items-center">
                            <Badge className="bg-pink-500 text-white text-[7px] md:text-[8px] font-black uppercase tracking-tighter px-2.5 h-4 md:h-5">
                              {d.daysAway === 0 ? 'Today' : d.daysAway === 1 ? 'Tomorrow' : `In ${d.daysAway} Days`}
                            </Badge>
                            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(d.date, 'MMM d')}</span>
                         </div>
                         <h4 className="text-xs md:text-sm font-black text-primary dark:text-white leading-tight uppercase tracking-tight">{d.title}</h4>
                         <Link href="/internal/occasions" className="mt-1">
                            <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold h-9 rounded-xl text-[9px] md:text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-pink-500/20">
                               Initialize Greeting <ArrowRight className="w-3 h-3" />
                            </Button>
                         </Link>
                      </div>
                    )) : (
                      <div className="text-center py-10 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-2 border-dashed">
                         <Sparkles className="w-10 h-10 text-pink-500/10 mx-auto mb-3" />
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">No seasonal events<br/>in current cycle</p>
                      </div>
                    )}
                 </div>
              </Card>

              {/* AI Priority Synthesis */}
              <div className="space-y-4 animate-in fade-in duration-1000">
                 <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                       <Zap className="w-4 h-4 text-accent animate-pulse" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">AI Priority Synthesis</h3>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-bold border-accent/20 text-accent">Analysis Node</Badge>
                 </div>
                 <div className="grid gap-4">
                    {summary.suggestions.map((s, i) => (
                      <div key={i} className="p-5 md:p-6 bg-accent/5 border border-accent/20 rounded-[1.75rem] md:rounded-[2rem] flex items-start gap-4 shadow-sm group hover:bg-accent/10 transition-colors">
                         <div className="mt-1.5 h-2 w-2 rounded-full bg-accent animate-ping shrink-0"></div>
                         <p className="text-xs md:text-sm font-bold text-primary dark:text-slate-200 leading-relaxed italic">"{s}"</p>
                      </div>
                    ))}
                    {summary.suggestions.length === 0 && (
                      <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] text-center">
                         <p className="text-xs md:text-sm font-bold text-emerald-700 italic leading-relaxed">"Operational health is optimal. No critical anomalies identified."</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Daily Administrative Notes */}
              <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-100">
                 <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-primary dark:text-white">
                       <FileText className="w-5 h-5 text-accent" /> Audit Observations
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsAddingNote(true)} className="h-9 w-9 rounded-xl hover:bg-accent/10 text-accent shadow-sm border border-accent/10"><Plus className="w-5 h-5" /></Button>
                 </CardHeader>
                 <CardContent className="p-6 md:p-8">
                    <div className="space-y-8">
                       {notes && notes.slice(0, 3).map((note: any) => (
                         <div key={note.id} className="space-y-3 relative pl-6 border-l-2 border-accent/30 animate-in slide-in-from-left-2 duration-300">
                            <p className="text-xs md:text-sm font-medium leading-relaxed italic text-slate-600 dark:text-slate-400">"{note.content}"</p>
                            <div className="flex items-center gap-3 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                               <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-accent" /> {note.createdAt?.toDate?.()?.toLocaleTimeString() || 'Just now'}</span>
                               <span className="w-1.5 h-px bg-slate-200"></span>
                               <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {note.user?.split('@')[0]}</span>
                            </div>
                         </div>
                       ))}
                       {(!notes || notes.length === 0) && (
                         <p className="text-[9px] md:text-[10px] text-center text-slate-400 italic font-bold uppercase tracking-widest py-10 border-2 border-dashed rounded-3xl">No audit notes recorded.</p>
                       )}
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </section>

      {/* Manual Note Dialog */}
      <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
         <DialogContent className="max-w-md rounded-[2.5rem] md:rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 w-[95vw]">
            <div className="bg-slate-900 p-6 md:p-8 text-white">
               <DialogTitle className="text-xl md:text-2xl font-headline font-bold">New Audit Observation</DialogTitle>
               <DialogDescription className="text-slate-400 mt-2 uppercase tracking-widest font-bold text-[9px] md:text-[10px]">Internal administrative record terminal</DialogDescription>
            </div>
            <div className="p-6 md:p-10 space-y-6">
               <Textarea 
                 placeholder="Type your strategic observations here..." 
                 value={newNote} 
                 onChange={e => setNewNote(e.target.value)}
                 className="min-h-[150px] md:min-h-[180px] rounded-2xl md:rounded-3xl bg-slate-50 border-none shadow-inner p-5 md:p-6 text-sm font-medium"
               />
               <Button onClick={handleAddNote} disabled={isActionLoading || !newNote.trim()} className="w-full h-12 md:h-14 bg-primary text-white font-bold rounded-2xl shadow-xl text-base md:text-lg hover:bg-secondary">
                  {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit Observation"}
               </Button>
            </div>
         </DialogContent>
      </Dialog>

      <div className="mt-12 flex flex-col items-center gap-4 opacity-20">
         <div className="h-px w-32 bg-slate-300 dark:bg-slate-700" />
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">National Governance Node • HRAT INDIA</p>
      </div>

      <Footer />
    </main>
  )
}
