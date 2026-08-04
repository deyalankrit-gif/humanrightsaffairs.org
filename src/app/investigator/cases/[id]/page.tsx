
"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { doc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  Loader2 as GlobalLoader, 
  MapPin, 
  Clock, 
  FileText, 
  Upload, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  History,
  Info,
  Send,
  Save,
  Lock,
  User,
  MessageSquare,
  ClipboardCheck,
  Target,
  ListTodo,
  Check,
  ChevronRight,
  UserRoundCheck,
  Building2,
  AlertTriangle,
  Camera,
  Layers,
  Users
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { TASK_STATUSES } from '@/lib/complaint-constants'

export default function InvestigationCaseHub() {
  const { id } = useParams()
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('mandate')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [remark, setRemark] = useState('')
  const [activeStatus, setActiveStatus] = useState('')

  const docRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'public_complaints', id as string);
  }, [db, id]);

  const { data: c, loading } = useDoc(docRef);

  useEffect(() => {
    if (c) setActiveStatus(c.status);
  }, [c]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!docRef || !user) return;
    setIsActionLoading(true);
    try {
      const entry = {
        action: `Field Status: ${newStatus}`,
        user: user.email,
        timestamp: new Date().toISOString(),
        remark: `Officer updated field lifecycle to ${newStatus}.`,
        type: 'investigation_update'
      };
      
      await updateDoc(docRef, { 
        status: newStatus,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion(entry)
      });
      
      toast({ title: "Lifecycle Updated" });
      setActiveStatus(newStatus);
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateTask = async (taskId: string, field: string, value: any) => {
    if (!docRef || !c || isActionLoading) return;
    setIsActionLoading(true);
    try {
      const updatedTasks = (c.tasks || []).map((t: any) => {
        if (t.id === taskId) {
          return { 
            ...t, 
            [field]: value,
            lastModifiedAt: new Date().toISOString(),
            lastModifiedBy: user?.email
          };
        }
        return t;
      });

      const taskName = c.tasks.find((t:any) => t.id === taskId)?.name;

      await updateDoc(docRef, { 
        tasks: updatedTasks,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          action: `Task Update: ${taskName}`,
          user: user?.email,
          timestamp: new Date().toISOString(),
          remark: `Modified ${field} to ${value} for tactical objective.`,
          type: 'task_update'
        })
      });

      toast({ title: "Task Refreshed" });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePostNote = async (isOfficial: boolean) => {
    if (!remark.trim() || !docRef || !user) return;
    setIsActionLoading(true);
    try {
      const entry = {
        action: isOfficial ? "Official Investigative Note" : "Private Field Note",
        user: user.email,
        timestamp: new Date().toISOString(),
        remark: remark.trim(),
        type: isOfficial ? 'official_note' : 'private_note',
        visibility: isOfficial ? 'public' : 'investigator'
      };
      
      await updateDoc(docRef, { 
        timeline: arrayUnion(entry),
        updatedAt: serverTimestamp()
      });
      
      toast({ title: isOfficial ? "Note Published" : "Note Archived" });
      setRemark('');
    } catch (e) {
      toast({ variant: "destructive", title: "Save Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><GlobalLoader className="animate-spin text-indigo-600" /></div>
  if (!c) return <div className="p-20 text-center font-bold text-slate-400">FILE NOT IDENTIFIED</div>

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/investigator/dashboard')} className="h-10 w-10 p-0 rounded-full bg-white shadow-sm hover:text-indigo-600 transition-all">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
               <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary">{c.caseId || 'Tactical Case File'}</h1>
                  <Badge className={cn("text-[9px] font-black uppercase px-4", c.priority === 'High' ? "bg-red-500" : "bg-blue-500")}>
                    {c.priority} PRIORITY
                  </Badge>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                 National Registry Node • Filed: {c.createdAt?.toDate?.()?.toLocaleDateString()}
               </p>
            </div>
         </div>
         <Card className="border-none shadow-sm rounded-2xl bg-indigo-600 text-white p-4 flex items-center gap-6">
            <div className="space-y-1">
               <p className="text-[8px] font-black uppercase text-indigo-200 tracking-widest">Update Lifecycle</p>
               <Select value={activeStatus} onValueChange={handleUpdateStatus}>
                  <SelectTrigger className="bg-white/10 border-white/20 h-9 text-[10px] font-bold min-w-[200px]">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-[1000000]">
                    {['Investigation Started', 'Site Visit Scheduled', 'Site Visit Completed', 'Investigation in Progress', 'Final Report Ready'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
               </Select>
            </div>
         </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
         <TabsList className="bg-white p-1 rounded-2xl border shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar justify-start">
            <TabsTrigger value="mandate" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Responsibilities</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex gap-2">Tactical Tasks <Badge className="h-4 px-1 bg-accent text-primary text-[8px]">{c.tasks?.length || 0}</Badge></TabsTrigger>
            <TabsTrigger value="evidence" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Evidence Vault</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Audit Trail</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Field Notes</TabsTrigger>
         </TabsList>

         <TabsContent value="mandate" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-8">
                  <Card className="rounded-[2.5rem] border-none shadow-sm p-10 bg-white relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                     <CardHeader className="p-0 mb-8">
                        <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3"><Target className="w-7 h-7 text-accent" /> Primary Mission Objective</CardTitle>
                        <p className="text-lg text-primary font-bold italic mt-4 border-l-4 border-accent pl-6">"{c.mandate?.objective || "Objective pending administrative input."}"</p>
                     </CardHeader>
                     <div className="space-y-10">
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2 leading-none"><FileText className="w-3.5 h-3.5" /> Investigation Instructions</h4>
                           <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl shadow-inner italic">"{c.mandate?.instructions || "No specific instructions provided."}"</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Required Actions</h4>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium">{c.mandate?.requiredActions || "Standard field protocols apply."}</p>
                           </div>
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Evidence to Secure</h4>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium">{c.mandate?.evidenceToCollect || "Visual and documentary evidence required."}</p>
                           </div>
                        </div>
                     </div>
                  </Card>
               </div>

               <div className="space-y-6">
                  <Card className="rounded-[2rem] border-none shadow-sm p-8 bg-slate-900 text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                     <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-6 flex items-center gap-2"><Clock className="w-4 h-4" /> Mission Logistics</h3>
                     <div className="space-y-6">
                        <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                           <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shrink-0"><CalendarIcon className="w-5 h-5" /></div>
                           <div><p className="text-[8px] font-black text-slate-500 uppercase">Target Deadline</p><p className="text-sm font-bold text-white">{c.mandate?.deadline || 'PRIORITY'}</p></div>
                        </div>
                        <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                           <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shrink-0"><MapPin className="w-5 h-5" /></div>
                           <div><p className="text-[8px] font-black text-slate-500 uppercase">Field Location</p><p className="text-sm font-bold text-white">{c.incidentLocation}</p></div>
                        </div>
                        <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                           <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shrink-0"><Users className="w-5 h-5" /></div>
                           <div><p className="text-[8px] font-black text-slate-500 uppercase">Witnesses</p><p className="text-sm font-bold text-white line-clamp-1">{c.mandate?.witnessesToContact || 'Field Verification Req.'}</p></div>
                        </div>
                     </div>
                  </Card>
                  
                  <div className="p-8 rounded-[2.5rem] bg-amber-50 border-2 border-dashed border-amber-200 text-center space-y-4">
                     <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
                     <h4 className="text-xs font-black uppercase text-amber-700 tracking-widest">Procedural Mandate</h4>
                     <p className="text-[10px] text-amber-800 font-bold leading-relaxed uppercase">
                        "Failure to adhere to investigation instructions may result in case reassignment. All field notes must be logged daily."
                     </p>
                  </div>
               </div>
            </div>
         </TabsContent>

         <TabsContent value="tasks" className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="grid gap-6">
               {(c.tasks || []).map((task: any) => (
                 <Card key={task.id} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white group hover:shadow-xl transition-all">
                    <CardContent className="p-0">
                       <div className="flex flex-col xl:flex-row items-stretch">
                          <div className={cn("p-8 xl:w-56 text-center border-r flex flex-col items-center justify-center shrink-0", task.status === 'Completed' ? 'bg-emerald-50' : 'bg-slate-50')}>
                             <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-4", task.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400')}>
                                {task.status === 'Completed' ? <Check className="w-8 h-8" /> : <ListTodo className="w-6 h-6" />}
                             </div>
                             <p className="text-xl font-black text-primary leading-none">{task.progress}%</p>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Fulfillment</p>
                          </div>
                          <div className="flex-1 p-8 flex flex-col lg:flex-row items-center justify-between gap-10">
                             <div className="space-y-3 flex-1 min-w-0 text-center lg:text-left">
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                   <Badge variant="outline" className={cn("text-[7px] font-black uppercase tracking-widest h-5 border-none", task.priority === 'High' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600")}>{task.priority} Priority</Badge>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target: {task.deadline || 'ASAP'}</span>
                                </div>
                                <h4 className="text-xl font-bold text-primary group-hover:text-indigo-600 transition-colors leading-tight">{task.name}</h4>
                                <p className="text-sm text-slate-500 italic">"{task.description}"</p>
                             </div>

                             <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto shrink-0">
                                <div className="space-y-2 w-full sm:w-48">
                                   <Label className="text-[9px] font-black text-slate-400 uppercase ml-1">Current Progress</Label>
                                   <Select value={task.progress.toString()} onValueChange={v => handleUpdateTask(task.id, 'progress', parseInt(v))}>
                                      <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none shadow-sm"><SelectValue /></SelectTrigger>
                                      <SelectContent className="bg-white z-[1000000]">
                                         {[0, 25, 50, 75, 90, 100].map(v => <SelectItem key={v} value={v.toString()}>{v}% Completion</SelectItem>)}
                                      </SelectContent>
                                   </Select>
                                </div>
                                <div className="space-y-2 w-full sm:w-48">
                                   <Label className="text-[9px] font-black text-slate-400 uppercase ml-1">Status Code</Label>
                                   <Select value={task.status} onValueChange={v => handleUpdateTask(task.id, 'status', v)}>
                                      <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none shadow-sm"><SelectValue /></SelectTrigger>
                                      <SelectContent className="bg-white z-[1000000]">
                                         {TASK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                      </SelectContent>
                                   </Select>
                                </div>
                             </div>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
               ))}
               {(c.tasks || []).length === 0 && (
                  <div className="py-32 text-center opacity-30 bg-white rounded-[3rem] border-4 border-dashed">
                     <ListTodo className="w-16 h-16 mx-auto mb-4" />
                     <p className="text-base font-black uppercase tracking-[0.3em]">No sub-tasks provisioned</p>
                  </div>
               )}
            </div>
         </TabsContent>

         <TabsContent value="evidence" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <Card className="rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center space-y-4 hover:border-indigo-600 transition-all cursor-pointer bg-white group">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                     <Plus className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-primary uppercase text-xs">Append Document</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">Secure PDF or Identity Proof</p>
                  </div>
               </Card>
               <Card className="rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center space-y-4 hover:border-indigo-600 transition-all cursor-pointer bg-white group">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                     <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-primary uppercase text-xs">Capture Photo</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">Visual Site Verification</p>
                  </div>
               </Card>
            </div>
         </TabsContent>

         <TabsContent value="notes" className="space-y-8 animate-in fade-in duration-500">
            <Card className="rounded-[2.5rem] border-none shadow-sm p-10 bg-white">
               <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                     <MessageSquare className="w-6 h-6 text-indigo-500" /> Dispatch Center
                  </CardTitle>
                  <CardDescription>Field observations are automatically synchronized with the national case docket.</CardDescription>
               </CardHeader>
               <div className="space-y-6">
                  <Textarea 
                    value={remark} 
                    onChange={e => setRemark(e.target.value)} 
                    placeholder="Input field observation details here..." 
                    className="min-h-[150px] rounded-[1.5rem] p-6 bg-slate-50 border-none shadow-inner"
                  />
                  <div className="flex gap-4">
                     <Button onClick={() => handlePostNote(false)} variant="outline" className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest border-2">
                        <Lock className="w-3.5 h-3.5 mr-2" /> Archive Internal Note
                     </Button>
                     <Button onClick={() => handlePostNote(true)} className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-bold uppercase text-[10px] tracking-widest shadow-xl">
                        <Send className="w-3.5 h-3.5 mr-2" /> Commit Official Log
                     </Button>
                  </div>
               </div>
            </Card>
         </TabsContent>

         <TabsContent value="timeline" className="animate-in fade-in duration-500">
            <Card className="rounded-[2.5rem] border-none shadow-sm p-10 bg-white">
               <div className="space-y-10">
                  {(c.timeline || []).slice().reverse().map((entry: any, i: number) => (
                    <div key={i} className="flex gap-8 relative group">
                       <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative z-10 shadow-sm transition-all",
                          entry.type === 'task_update' ? "bg-accent text-primary" : 
                          entry.type === 'task_assignment' ? "bg-indigo-600 text-white" : "bg-slate-50 text-accent"
                       )}>
                          {entry.type === 'task_update' ? <ClipboardCheck className="w-6 h-6" /> : 
                           entry.type === 'task_assignment' ? <ListTodo className="w-6 h-6" /> : <History className="w-5 h-5" />}
                       </div>
                       <div className="flex-1 pt-1 pb-10 border-l-2 border-slate-100 pl-8 ml-[-40px] group-last:border-transparent">
                          <div className="flex justify-between items-center mb-3">
                             <h4 className="text-lg font-bold text-primary">{entry.action}</h4>
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl italic text-sm text-slate-500 leading-relaxed border">
                             "{entry.remark}"
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                             <Badge variant="outline" className="text-[7px] font-black uppercase opacity-60 border-slate-200">{entry.user}</Badge>
                             {entry.type === 'task_update' && <Badge className="bg-emerald-500 text-white text-[7px] uppercase px-1.5 h-4">Progress Log</Badge>}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
         </TabsContent>
      </Tabs>

      <div className="mt-12 flex flex-col items-center gap-4 opacity-20">
         <ShieldCheck className="w-10 h-10 text-slate-400" />
         <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Official Investigative Dashboard • HRAT India</p>
      </div>
    </div>
  )
}

function TacticalLoader({ className }: { className?: string }) {
  return <Clock className={cn("animate-spin", className)} />
}
