
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
 * Updated: Complete Real-Time Reactive Listeners for all data streams.
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

  // Real-Time Data Listeners (Snapshots)
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

  // Stats re-evaluate automatically when data updates
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

    const suggestions = [];
    if (pendingReview > 5) suggestions.push("Prioritize triage for pending complaint records.");
    if (staleCases.length > 0) suggestions.push(`Review ${staleCases.length} cases with no updates in >3 days.`);
    if (newAppsToday > 0) suggestions.push(`Action Required: ${newAppsToday} new membership applications received.`);
    if (highPriority > 3) suggestions.push("High volume of critical priority cases detected.");
    if (upcomingSpecialDays.length > 0) {
      const nextDay = upcomingSpecialDays[0];
      suggestions.push(`Upcoming Special Day: ${nextDay.title} (${nextDay.daysAway === 0 ? 'Today' : `in ${nextDay.daysAway} days`}). Prepare greetings.`);
    }

    return { newComplaintsToday, newAppsToday, casesClosedToday, pendingReview, underInvestigation, highPriority, staleCases, suggestions };
  }, [complaints, applications, upcomingSpecialDays, mounted]);

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

  // Handlers (Non-Blocking Writes)
  const handleAddTask = async () => {
    if (!db || !newTask.title.trim()) return;
    setIsActionLoading(true);
    addDoc(collection(db, 'daily_tasks'), {
      ...newTask,
      completed: false,
      createdAt: serverTimestamp(),
      createdBy: user?.email
    }).finally(() => {
      setNewTask({ title: '', priority: 'Medium', dueDate: format(new Date(), 'yyyy-MM-dd') });
      setIsActionLoading(false);
    });
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
    addDoc(collection(db, 'daily_notes'), {
      content: newNote,
      createdAt: serverTimestamp(),
      user: user?.email
    }).finally(() => {
      setNewNote('');
      setIsAddingNote(false);
      setIsActionLoading(false)
    });
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
             <Button className="flex-1 md:flex-none bg-accent text-primary hover:bg-secondary hover:text-white h-11 px-6 rounded-xl font-bold gap-2 shadow-xl shadow-accent/20 transition-all hover:-translate-y-1">
                <Mail className="w-4 h-4" /> Send Master Report
             </Button>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
           
           <div className="lg:col-span-8 space-y-8">
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

              {/* Recruitment Pipeline Stream (Real-Time Reactive) */}
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
                   </div>
                </CardContent>
              </Card>

              {/* Master To-Do Terminal (Real-Time Reactive) */}
              <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-100">
                 <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                       <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                          <ListTodo className="w-6 h-6 text-accent" /> Institutional Task Log
                       </CardTitle>
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
                               className="h-12 rounded-2xl border-none shadow-inner bg-white"
                             />
                          </div>
                          <div className="flex gap-2">
                             <Select value={newTask.priority} onValueChange={(v:any) => setNewTask({...newTask, priority: v})}>
                                <SelectTrigger className="h-12 w-32 rounded-2xl bg-white border-none shadow-inner font-bold"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white z-[1000000]">
                                   <SelectItem value="High" className="text-red-600 font-bold">HIGH</SelectItem>
                                   <SelectItem value="Medium" className="text-amber-600 font-bold">MEDIUM</SelectItem>
                                   <SelectItem value="Low" className="text-blue-600 font-bold">LOW</SelectItem>
                                </SelectContent>
                             </Select>
                             <Button onClick={handleAddTask} disabled={isActionLoading || !newTask.title.trim()} className="h-12 bg-primary text-white font-bold rounded-2xl gap-2 shadow-lg hover:bg-secondary px-6">
                                <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Log Task</span>
                             </Button>
                          </div>
                       </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 min-h-[200px]">
                       {filteredTasks.map((task: any) => (
                         <div key={task.id} className={cn(
                           "p-6 md:p-8 flex items-center justify-between group transition-all", 
                           task.completed ? "opacity-40 grayscale bg-slate-50/20" : "hover:bg-slate-50/50"
                         )}>
                            <div className="flex items-center gap-6">
                               <Checkbox 
                                 checked={task.completed} 
                                 onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                                 className="h-6 w-6 rounded-lg border-2 data-[state=checked]:bg-emerald-500"
                               />
                               <h4 className={cn("text-base md:text-lg font-bold", task.completed && "line-through text-slate-400")}>
                                  {task.title}
                               </h4>
                            </div>
                            <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                               <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8">
                 <h3 className="text-xs font-black uppercase text-blue-600 tracking-[0.2em] mb-8 flex items-center gap-2">
                    <Handshake className="w-5 h-5 animate-pulse" /> Strategic Assemblies
                 </h3>
                 <div className="space-y-4">
                    {upcomingAssemblies.map((meeting, i) => (
                      <div key={i} className="p-5 rounded-[2rem] border bg-blue-50/40 dark:bg-blue-950/20 border-blue-100">
                         <div className="flex justify-between items-center mb-2">
                            <Badge className="bg-blue-600 text-white text-[7px] uppercase">{meeting.daysAway === 0 ? 'Today' : `In ${meeting.daysAway} Days`}</Badge>
                            <span className="text-[10px] font-black text-slate-400 uppercase">{meeting.date}</span>
                         </div>
                         <h4 className="text-xs font-black uppercase text-primary dark:text-white">{meeting.title}</h4>
                      </div>
                    ))}
                 </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white p-8">
                 <h3 className="text-xs font-black uppercase text-emerald-400 tracking-[0.2em] mb-8 flex items-center gap-2">
                    <Wifi className="w-4 h-4 animate-pulse" /> Live System Node
                 </h3>
                 <div className="space-y-3">
                    {[
                      { label: "Registry Database", val: "Operational", color: "text-emerald-400" },
                      { label: "Security Encryption", val: "AES-256 Active", color: "text-accent" }
                    ].map((n, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                         <span className="text-[9px] font-black text-slate-400 uppercase">{n.label}</span>
                         <span className={cn("text-[10px] font-bold uppercase", n.color)}>{n.val}</span>
                      </div>
                    ))}
                 </div>
              </Card>
           </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
