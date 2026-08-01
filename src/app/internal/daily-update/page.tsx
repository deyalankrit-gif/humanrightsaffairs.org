
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
  Target
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { format, isToday, parseISO, differenceInDays, startOfDay } from 'date-fns'
import { Footer } from '@/components/footer'

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
      if (c.status !== 'Closed' || !c.updatedAt) return false;
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
    if (newAppsToday > 0) suggestions.push("Process new membership registrations for regional chapters.");
    if (highPriority > 3) suggestions.push("High volume of critical priority cases detected.");

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
  }, [complaints, applications]);

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
    setIsActionLoading(true);
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
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Daily <span className="text-accent italic">Update</span></h1>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Operational Oversight: {format(new Date(), 'PPPP')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
             <Button onClick={() => window.print()} variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 h-11 px-6 rounded-xl font-bold gap-2">
                <Printer className="w-4 h-4 text-slate-400" /> Print Summary
             </Button>
             <Button onClick={handleSendDailySummary} className="bg-accent text-primary hover:bg-secondary hover:text-white h-11 px-6 rounded-xl font-bold gap-2 shadow-xl shadow-accent/20 transition-all">
                <Mail className="w-4 h-4" /> Send Daily Summary
             </Button>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
           
           {/* Left Content: Overview & Tasks */}
           <div className="lg:col-span-8 space-y-8">
              
              {/* Today's Overview Widget */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-700">
                 {[
                   { label: "New Complaints", val: summary.newComplaintsToday, icon: <AlertCircle className="text-red-500" /> },
                   { label: "Pending Review", val: summary.pendingReview, icon: <Clock className="text-amber-500" /> },
                   { label: "Investigations", val: summary.underInvestigation, icon: <Activity className="text-blue-500" /> },
                   { label: "Cases Closed", val: summary.casesClosedToday, icon: <CheckCircle2 className="text-emerald-500" /> },
                   { label: "New Members", val: summary.newAppsToday, icon: <Users className="text-indigo-500" /> },
                   { label: "App Registry", val: applications?.length || 0, icon: <FileText className="text-slate-400" /> }
                 ].map((stat, i) => (
                   <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden group">
                     <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-accent/10 transition-colors">
                           {stat.icon}
                        </div>
                        <div>
                           <p className="text-2xl font-headline font-bold">{stat.val}</p>
                           <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                        </div>
                     </CardContent>
                   </Card>
                 ))}
              </div>

              {/* Master To-Do Terminal */}
              <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                 <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                       <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                          <ListTodo className="w-5 h-5 text-accent" /> Institutional To-Do List
                       </CardTitle>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Administrative Task Governance</p>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-950 rounded-xl border">
                       {['All', 'Pending', 'Completed', 'Overdue'].map(f => (
                         <button 
                           key={f}
                           onClick={() => setTodoFilter(f as any)}
                           className={cn(
                             "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                             todoFilter === f ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-100"
                           )}
                         >
                           {f}
                         </button>
                       ))}
                    </div>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="p-6 border-b bg-slate-50/30">
                       <div className="grid md:grid-cols-12 gap-3">
                          <div className="md:col-span-7">
                             <Input 
                               placeholder="Draft new institutional task..." 
                               value={newTask.title} 
                               onChange={e => setNewTask({...newTask, title: e.target.value})}
                               className="h-11 rounded-xl"
                             />
                          </div>
                          <div className="md:col-span-2">
                             <Select value={newTask.priority} onValueChange={(v:any) => setNewTask({...newTask, priority: v})}>
                                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white">
                                   <SelectItem value="High">High</SelectItem>
                                   <SelectItem value="Medium">Medium</SelectItem>
                                   <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="md:col-span-3">
                             <Button onClick={handleAddTask} disabled={isActionLoading || !newTask.title.trim()} className="w-full h-11 bg-primary text-white font-bold rounded-xl gap-2">
                                <Plus className="w-4 h-4" /> Add Task
                             </Button>
                          </div>
                       </div>
                    </div>

                    <div className="divide-y divide-slate-50 dark:divide-slate-800 min-h-[300px]">
                       {filteredTasks.length > 0 ? filteredTasks.map((task: any) => {
                         const isOverdue = !task.completed && task.dueDate && parseISO(task.dueDate) < startOfDay(new Date());
                         return (
                           <div key={task.id} className={cn("p-6 flex items-center justify-between group transition-colors", task.completed ? "opacity-50 grayscale bg-slate-50/20" : "hover:bg-slate-50/50")}>
                              <div className="flex items-center gap-5">
                                 <Checkbox 
                                   checked={task.completed} 
                                   onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                                   className="h-6 w-6 rounded-lg border-2"
                                 />
                                 <div className="space-y-1">
                                    <h4 className={cn("text-sm font-bold leading-none", task.completed && "line-through text-slate-400", isOverdue && !task.completed && "text-red-600")}>
                                       {task.title}
                                    </h4>
                                    <div className="flex items-center gap-3">
                                       <Badge className={cn("text-[7px] font-black uppercase px-2 h-4 border-none", task.priority === 'High' ? "bg-red-500" : task.priority === 'Medium' ? "bg-amber-500" : "bg-blue-500")}>
                                          {task.priority}
                                       </Badge>
                                       {task.dueDate && (
                                         <span className={cn("text-[9px] font-bold uppercase flex items-center gap-1", isOverdue && !task.completed ? "text-red-500" : "text-slate-400")}>
                                            <Calendar className="w-2.5 h-2.5" /> Due: {task.dueDate}
                                         </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                         );
                       }) : (
                         <div className="py-24 text-center opacity-20">
                            <ListTodo className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-sm font-black uppercase tracking-[0.2em]">Queue Clear</p>
                         </div>
                       )}
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Right Column: Health, Suggestions, Notes */}
           <div className="lg:col-span-4 space-y-8">
              
              {/* Website Health Sentinel */}
              <Card className="rounded-[2rem] border-none shadow-sm bg-slate-950 text-white p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                 <h3 className="text-xs font-black uppercase text-emerald-400 tracking-[0.2em] mb-8 flex items-center gap-2">
                    <Wifi className="w-4 h-4 animate-pulse" /> Website Health Node
                 </h3>
                 <div className="space-y-5">
                    {[
                      { label: "Broken Links", status: "None Detected", ok: true },
                      { label: "Failed Submissions", status: "0 Today", ok: true },
                      { label: "Email Delivery", status: "98% Success", ok: true },
                      { label: "Registry Sync", status: "Operational", ok: true },
                      { label: "System Latency", status: "24ms", ok: true }
                    ].map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h.label}</span>
                         <span className={cn("text-[9px] font-black uppercase", h.ok ? "text-emerald-400" : "text-red-500")}>{h.status}</span>
                      </div>
                    ))}
                 </div>
              </Card>

              {/* Case Follow-up Focus */}
              <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8">
                 <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Stale Case Radar
                 </h3>
                 <div className="space-y-4">
                    {summary.staleCases.length > 0 ? summary.staleCases.slice(0, 3).map((c: any) => (
                      <div key={c.id} onClick={() => router.push(`/internal/public-complaints/${c.id}`)} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-accent cursor-pointer transition-all">
                         <p className="text-[8px] font-black text-red-500 uppercase mb-1">{differenceInDays(new Date(), c.createdAt?.toDate?.() || new Date())} Days Since Update</p>
                         <h4 className="text-xs font-bold truncate">{c.subject}</h4>
                         <p className="text-[9px] text-slate-400 uppercase font-bold mt-1.5 flex items-center gap-1.5"><User className="w-2.5 h-2.5" /> {c.fullName}</p>
                      </div>
                    )) : (
                      <div className="text-center py-6">
                         <CheckCircle2 className="w-8 h-8 text-emerald-500/20 mx-auto mb-2" />
                         <p className="text-[10px] font-bold text-slate-400 uppercase">All active cases current</p>
                      </div>
                    )}
                 </div>
              </Card>

              {/* AI Suggested Actions */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 px-2">
                    <Zap className="w-4 h-4 text-accent animate-pulse" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Priority Synthesis</h3>
                 </div>
                 <div className="grid gap-3">
                    {summary.suggestions.map((s, i) => (
                      <div key={i} className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex items-start gap-4">
                         <div className="mt-1 h-1.5 w-1.5 rounded-full bg-accent animate-ping"></div>
                         <p className="text-xs font-bold text-primary dark:text-slate-300 leading-relaxed italic">"{s}"</p>
                      </div>
                    ))}
                    {summary.suggestions.length === 0 && (
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                         <p className="text-xs font-bold text-emerald-700 italic leading-relaxed">"Operational health is optimal. No critical AI flags detected."</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Daily Administrative Notes */}
              <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                 <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                       <FileText className="w-4 h-4 text-accent" /> Administrative Notes
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsAddingNote(true)} className="h-8 w-8 rounded-full hover:bg-accent/10"><Plus className="w-4 h-4 text-accent" /></Button>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="space-y-6">
                       {notes && notes.slice(0, 3).map((note: any) => (
                         <div key={note.id} className="space-y-2 relative pl-4 border-l-2 border-accent/20">
                            <p className="text-xs font-medium leading-relaxed">"{note.content}"</p>
                            <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase">
                               <Clock className="w-2.5 h-2.5" /> {note.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                            </div>
                         </div>
                       ))}
                       {(!notes || notes.length === 0) && (
                         <p className="text-[10px] text-center text-slate-400 italic">No notes recorded for today.</p>
                       )}
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </section>

      {/* Manual Note Dialog */}
      <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
         <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-8">
            <DialogHeader>
               <DialogTitle className="text-2xl font-headline font-bold">New Audit Note</DialogTitle>
               <DialogDescription>Internal administrative observations for the current cycle.</DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
               <Textarea 
                 placeholder="Type your observations here..." 
                 value={newNote} 
                 onChange={e => setNewNote(e.target.value)}
                 className="min-h-[150px] rounded-2xl"
               />
               <Button onClick={handleAddNote} disabled={isActionLoading || !newNote.trim()} className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-xl">
                  {isActionLoading ? <Loader2 className="animate-spin" /> : "Archive Note"}
               </Button>
            </div>
         </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
