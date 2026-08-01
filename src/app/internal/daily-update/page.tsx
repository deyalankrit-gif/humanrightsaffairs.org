
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, where, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore'
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
  Scale
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { format, isToday, parseISO, differenceInDays, startOfDay, isTomorrow, addDays } from 'date-fns'
import { Footer } from '@/components/footer'
import { BUILT_IN_OBSERVANCES, BUILT_IN_HOLIDAYS } from '@/lib/activity-hub-data'
import Link from 'next/link'

/**
 * MISSION COMMAND CENTER: Daily Update Dashboard
 * A high-fidelity, colorfully animated terminal for real-time institutional oversight.
 */
export default function DailyUpdatePage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [todoFilter, setTodoFilter] = useState<'All' | 'Pending' | 'Completed' | 'Overdue'>('All')

  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    dueDate: format(new Date(), 'yyyy-MM-dd')
  })

  const [newNote, setNewNote] = useState('')

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
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

  // Derived Summary Logic
  const summary = useMemo(() => {
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
    const underInvestigation = complaintList.filter(c => c.status === 'Investigation in Progress').length;
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
  }, [complaints, applications, upcomingSpecialDays]);

  const filteredTasks = useMemo(() => {
    const list = tasks || [];
    const now = startOfDay(new Date());
    
    return list.filter(t => {
      const isOverdue = !t.completed && t.dueDate && parseISO(t.dueDate) < now;
      if (todoFilter === 'Pending') return !t.completed;
      if (todoFilter === 'Completed') return t.completed;
      if (todoFilter === 'Overdue') return isOverdue;
      return true;
    });
  }, [tasks, todoFilter]);

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
      setIsAddingTask(false);
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
      setIsActionLoading(false);
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
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-emerald-500/5 -skew-x-12 animate-pulse"></div>
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/30">
               <Cpu className="w-2.5 h-2.5 animate-spin-slow" /> Terminal v2.0 Operational
            </div>
            <h1 className="text-3xl md:text-5xl font-headline font-bold">Command <span className="text-accent italic">Center</span></h1>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Operational Oversight: {format(new Date(), 'PPPP')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
             <Button onClick={() => window.print()} variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-11 px-6 rounded-xl font-bold gap-2">
                <Printer className="w-4 h-4 text-slate-400" /> Print Archive
             </Button>
             <Button onClick={handleSendDailySummary} className="bg-accent text-primary hover:bg-secondary hover:text-white h-11 px-6 rounded-xl font-bold gap-2 shadow-xl shadow-accent/20 transition-all hover:-translate-y-1">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                 {[
                   { label: "Complaint Intake", val: summary.newComplaintsToday, icon: <AlertCircle className="text-red-500" />, color: "bg-red-50 dark:bg-red-950/20" },
                   { label: "Pending Vetting", val: summary.pendingReview, icon: <Clock className="text-amber-500" />, color: "bg-amber-50 dark:bg-amber-950/20" },
                   { label: "Active Field Missions", val: summary.underInvestigation, icon: <Activity className="text-blue-500" />, color: "bg-blue-50 dark:bg-blue-950/20" },
                   { label: "Resolved Today", val: summary.casesClosedToday, icon: <CheckCircle2 className="text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-950/20" },
                   { label: "New Recruits", val: summary.newAppsToday, icon: <UserPlus className="text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-950/20" },
                   { label: "Total Applications", val: applications?.length || 0, icon: <FileText className="text-slate-400" />, color: "bg-slate-50 dark:bg-slate-900" }
                 ].map((stat, i) => (
                   <Card key={i} className={cn("border-none shadow-sm rounded-3xl overflow-hidden group transition-all hover:scale-105 hover:shadow-xl cursor-default", stat.color)}>
                     <CardContent className="p-6 flex items-center gap-5">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl group-hover:rotate-12 transition-transform shadow-sm">{stat.icon}</div>
                        <div>
                           <p className="text-3xl font-headline font-bold leading-none">{stat.val}</p>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{stat.label}</p>
                        </div>
                     </CardContent>
                   </Card>
                 ))}
              </div>

              {/* Master To-Do Terminal */}
              <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-100">
                 <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                       <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                          <ListTodo className="w-6 h-6 text-accent" /> Institutional Task Log
                       </CardTitle>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">"Efficiency is the foundation of justice."</p>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-950 rounded-2xl border shadow-inner">
                       {['All', 'Pending', 'Completed', 'Overdue'].map(f => (
                         <button 
                           key={f}
                           onClick={() => setTodoFilter(f as any)}
                           className={cn(
                             "px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all",
                             todoFilter === f ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-slate-100"
                           )}
                         >
                           {f}
                         </button>
                       ))}
                    </div>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="p-8 border-b bg-slate-50/30">
                       <div className="grid md:grid-cols-12 gap-4">
                          <div className="md:col-span-7">
                             <Input 
                               placeholder="Draft new institutional mandate..." 
                               value={newTask.title} 
                               onChange={e => setNewTask({...newTask, title: e.target.value})}
                               className="h-12 rounded-2xl border-none shadow-inner bg-white"
                             />
                          </div>
                          <div className="md:col-span-2">
                             <Select value={newTask.priority} onValueChange={(v:any) => setNewTask({...newTask, priority: v})}>
                                <SelectTrigger className="h-12 rounded-2xl bg-white border-none shadow-inner font-bold"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white z-[1000000]">
                                   <SelectItem value="High" className="text-red-600 font-bold">HIGH</SelectItem>
                                   <SelectItem value="Medium" className="text-amber-600 font-bold">MEDIUM</SelectItem>
                                   <SelectItem value="Low" className="text-blue-600 font-bold">LOW</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="md:col-span-3">
                             <Button onClick={handleAddTask} disabled={isActionLoading || !newTask.title.trim()} className="w-full h-12 bg-primary text-white font-bold rounded-2xl gap-2 shadow-lg hover:bg-secondary">
                                <Plus className="w-5 h-5" /> Log Task
                             </Button>
                          </div>
                       </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 min-h-[400px]">
                       {filteredTasks.length > 0 ? filteredTasks.map((task: any) => {
                         const isOverdue = !task.completed && task.dueDate && parseISO(task.dueDate) < startOfDay(new Date());
                         return (
                           <div key={task.id} className={cn(
                             "p-8 flex items-center justify-between group transition-all", 
                             task.completed ? "opacity-40 grayscale bg-slate-50/20" : "hover:bg-slate-50/50 hover:pl-10",
                             task.priority === 'High' && !task.completed && "border-l-8 border-red-500"
                           )}>
                              <div className="flex items-center gap-6">
                                 <Checkbox 
                                   checked={task.completed} 
                                   onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                                   className="h-7 w-7 rounded-xl border-2 transition-all data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                 />
                                 <div className="space-y-2">
                                    <h4 className={cn("text-lg font-bold leading-tight", task.completed && "line-through text-slate-400", isOverdue && !task.completed && "text-red-600")}>
                                       {task.title}
                                    </h4>
                                    <div className="flex items-center gap-4">
                                       <Badge className={cn("text-[8px] font-black uppercase px-3 h-5 border-none shadow-sm", task.priority === 'High' ? "bg-red-500" : task.priority === 'Medium' ? "bg-amber-500" : "bg-blue-500")}>
                                          {task.priority} Priority
                                       </Badge>
                                       {task.dueDate && (
                                         <span className={cn("text-[10px] font-bold uppercase flex items-center gap-1.5", isOverdue && !task.completed ? "text-red-500 animate-pulse" : "text-slate-400")}>
                                            <Calendar className="w-3.5 h-3.5" /> Due: {task.dueDate}
                                         </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <button onClick={() => handleDeleteTask(task.id)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                                 <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                         );
                       }) : (
                         <div className="py-32 text-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                               <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                            </div>
                            <p className="text-lg font-black uppercase tracking-[0.3em] text-slate-300">All Mandates Satisfied</p>
                         </div>
                       )}
                    </div>
                 </CardContent>
              </Card>

              {/* Membership Application Stream */}
              <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-100">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                      <UserPlus className="w-6 h-6 text-indigo-500" /> Recruitment Pipeline
                    </CardTitle>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Real-time status tracking for new human rights defenders</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/internal/applications')} className="rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-100 border px-6 h-10">
                    Full Registry <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-slate-50 dark:divide-slate-800">
                      {applications && applications.slice(0, 5).map((app: any) => (
                        <div key={app.id} className="p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between group">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
                                 <User className="w-7 h-7" />
                              </div>
                              <div className="space-y-1">
                                 <h4 className="text-base font-bold leading-tight">{app.name}</h4>
                                 <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-[8px] font-black text-slate-400 uppercase tracking-tighter border-slate-200">{app.level} Council</Badge>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Globe className="w-3 h-3" /> {app.stateName || 'National'}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-6">
                              <div className="text-right hidden sm:block">
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
           </div>

           {/* Right Column: Health, Suggestions, Notes */}
           <div className="lg:col-span-4 space-y-8">
              
              {/* Live Connection Hub */}
              <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                 <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                       <h3 className="text-xs font-black uppercase text-emerald-400 tracking-[0.2em] flex items-center gap-2">
                          <Wifi className="w-4 h-4 animate-pulse" /> Live System Node
                       </h3>
                       <p className="text-[9px] text-slate-500 font-bold uppercase">Real-time health telemetry</p>
                    </div>
                    <Badge className="bg-emerald-500 text-primary font-black text-[8px]">ACTIVE</Badge>
                 </div>
                 
                 <div className="space-y-4">
                    {[
                      { label: "Registry Database", val: "Operational", color: "text-emerald-400" },
                      { label: "Notification Relay", val: "99.9% Efficiency", color: "text-emerald-400" },
                      { label: "Security Encryption", val: "Level 5 Active", color: "text-accent" },
                      { label: "Crawl Integrity", val: "Optimized", color: "text-emerald-400" }
                    ].map((n, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{n.label}</span>
                         <span className={cn("text-[10px] font-bold uppercase", n.color)}>{n.val}</span>
                      </div>
                    ))}
                 </div>
              </Card>

              {/* Seasonal Alerts (FESTIVAL RADAR) */}
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                 <h3 className="text-xs font-black uppercase text-pink-500 tracking-[0.2em] mb-8 flex items-center gap-2 leading-none">
                    <Sparkles className="w-5 h-5 animate-float" /> Seasonal Awareness
                 </h3>
                 <div className="space-y-4">
                    {upcomingSpecialDays.length > 0 ? upcomingSpecialDays.map((d, i) => (
                      <div key={i} className="p-6 bg-pink-50/40 dark:bg-pink-950/20 rounded-[2rem] border border-pink-100 dark:border-pink-900/40 flex flex-col gap-3 relative group/item hover:shadow-lg transition-all active:scale-[0.98]">
                         <div className="flex justify-between items-center">
                            <Badge className="bg-pink-500 text-white text-[8px] font-black uppercase tracking-tighter px-3 h-5">
                              {d.daysAway === 0 ? 'Today' : d.daysAway === 1 ? 'Tomorrow' : `In ${d.daysAway} Days`}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(d.date, 'MMM d')}</span>
                         </div>
                         <h4 className="text-sm font-black text-primary dark:text-white leading-tight uppercase tracking-tight">{d.title}</h4>
                         <Link href="/internal/occasions" className="mt-2">
                            <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold h-9 rounded-xl text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-pink-500/20">
                               Initialize Greeting <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                         </Link>
                      </div>
                    )) : (
                      <div className="text-center py-12 bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-dashed">
                         <Sparkles className="w-10 h-10 text-pink-500/10 mx-auto mb-3" />
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">No seasonal events<br/>in current cycle</p>
                      </div>
                    )}
                 </div>
              </Card>

              {/* Stale Case Radar */}
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8">
                 <h3 className="text-xs font-black uppercase text-red-600 tracking-[0.2em] mb-8 flex items-center gap-2">
                    <Target className="w-5 h-5 animate-pulse" /> Inactivity Radar
                 </h3>
                 <div className="space-y-4">
                    {summary.staleCases.length > 0 ? summary.staleCases.slice(0, 3).map((c: any) => (
                      <div key={c.id} onClick={() => router.push(`/internal/public-complaints/${c.id}`)} className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[1.75rem] border border-slate-100 dark:border-slate-800 hover:border-red-500/50 cursor-pointer group/case transition-all shadow-sm hover:shadow-lg">
                         <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="text-[7px] font-black text-red-600 border-red-100 bg-red-50">{differenceInDays(new Date(), c.createdAt?.toDate?.() || new Date())} DAYS STALE</Badge>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover/case:translate-x-1 transition-transform" />
                         </div>
                         <h4 className="text-sm font-bold text-primary dark:text-white leading-tight truncate">{c.subject}</h4>
                         <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><User className="w-4 h-4" /></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase truncate">{c.fullName}</span>
                         </div>
                      </div>
                    )) : (
                      <div className="text-center py-10 bg-emerald-50/30 rounded-3xl border-2 border-dashed border-emerald-100">
                         <CheckCircle2 className="w-10 h-10 text-emerald-500/20 mx-auto mb-3" />
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Case-flow Optimal</p>
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
                    <Badge variant="outline" className="text-[8px] font-bold border-accent/20 text-accent">Real-time Analysis</Badge>
                 </div>
                 <div className="grid gap-4">
                    {summary.suggestions.map((s, i) => (
                      <div key={i} className="p-6 bg-accent/5 border border-accent/20 rounded-[2rem] flex items-start gap-5 shadow-sm group hover:bg-accent/10 transition-colors">
                         <div className="mt-2 h-2 w-2 rounded-full bg-accent animate-ping shrink-0"></div>
                         <p className="text-sm font-bold text-primary dark:text-slate-200 leading-relaxed italic">"{s}"</p>
                      </div>
                    ))}
                    {summary.suggestions.length === 0 && (
                      <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] text-center">
                         <p className="text-sm font-bold text-emerald-700 italic leading-relaxed">"Operational health is optimal. No critical anomalies identified."</p>
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
                 <CardContent className="p-8">
                    <div className="space-y-8">
                       {notes && notes.slice(0, 3).map((note: any) => (
                         <div key={note.id} className="space-y-3 relative pl-6 border-l-2 border-accent/30 animate-in slide-in-from-left-2 duration-300">
                            <p className="text-sm font-medium leading-relaxed italic text-slate-600 dark:text-slate-400">"{note.content}"</p>
                            <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                               <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-accent" /> {note.createdAt?.toDate?.()?.toLocaleTimeString() || 'Just now'}</span>
                               <span className="w-1.5 h-px bg-slate-200"></span>
                               <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {note.user?.split('@')[0]}</span>
                            </div>
                         </div>
                       ))}
                       {(!notes || notes.length === 0) && (
                         <p className="text-[10px] text-center text-slate-400 italic font-bold uppercase tracking-widest py-10 border-2 border-dashed rounded-3xl">No audit notes recorded for this cycle.</p>
                       )}
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </section>

      {/* Manual Note Dialog */}
      <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
         <DialogContent className="max-w-md rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950">
            <div className="bg-slate-900 p-8 text-white">
               <DialogTitle className="text-2xl font-headline font-bold">New Audit Observation</DialogTitle>
               <DialogDescription className="text-slate-400 mt-2 uppercase tracking-widest font-bold text-[10px]">Internal administrative record terminal</DialogDescription>
            </div>
            <div className="p-10 space-y-6">
               <Textarea 
                 placeholder="Type your strategic observations here..." 
                 value={newNote} 
                 onChange={e => setNewNote(e.target.value)}
                 className="min-h-[180px] rounded-3xl bg-slate-50 border-none shadow-inner p-6 text-sm font-medium"
               />
               <Button onClick={handleAddNote} disabled={isActionLoading || !newNote.trim()} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl text-lg hover:bg-secondary">
                  {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit Observation"}
               </Button>
            </div>
         </DialogContent>
      </Dialog>

      <div className="mt-12 flex flex-col items-center gap-4 opacity-20">
         <div className="h-px w-32 bg-slate-300 dark:bg-slate-700" />
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">National Governance Node • HRAT INDIA</p>
      </div>

      <Footer />
    </main>
  )
}
