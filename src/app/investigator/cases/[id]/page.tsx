
"use client"

import React, { useState, useEffect, useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  Loader2, 
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
  Users,
  BookOpen,
  FileSearch,
  ExternalLink,
  MessageSquareWarning,
  Hash,
  Paperclip,
  Settings,
  ChevronDown,
  X,
  Clock as GlobalLoader
} from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function InvestigationCaseHub() {
  const { id } = useParams()
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('mandate')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [activeStatus, setActiveStatus] = useState('')
  
  // Reporting State
  const [isReportingTask, setIsReportingTask] = useState<string | null>(null)
  const [reportForm, setReportForm] = useState({
    title: '',
    workPerformed: '',
    findings: '',
    evidence: '',
    actions: '',
    recommendations: '',
    progress: 100,
    status: 'Completed'
  })

  // Real-Time Document Listener
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

  const handleSubmitTaskReport = async (memberIndex: number, taskIndex: number) => {
    if (!docRef || !c || !user) return;
    setIsActionLoading(true);
    
    try {
      const updatedTeam = [...(c.investigationTeam || [])];
      const member = updatedTeam[memberIndex];
      const task = member.tasks[taskIndex];
      
      const reportEntry = {
        ...reportForm,
        investigatorId: member.investigatorId,
        investigatorName: member.investigatorName,
        timestamp: new Date().toISOString(),
        taskId: task.id
      };

      // Update task status and progress
      member.tasks[taskIndex] = {
        ...task,
        status: reportForm.status,
        progress: reportForm.progress,
        reports: [...(task.reports || []), reportEntry]
      };

      await updateDoc(docRef, { 
        investigationTeam: updatedTeam,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          action: "Task Report Submitted",
          user: user.email,
          timestamp: new Date().toISOString(),
          remark: `Submitted completion report for task: ${task.title}`,
          type: 'task_report'
        })
      });

      toast({ title: "Report Published" });
      setIsReportingTask(null);
      setReportForm({ title: '', workPerformed: '', findings: '', evidence: '', actions: '', recommendations: '', progress: 100, status: 'Completed' });
    } catch (e) {
      toast({ variant: "destructive", title: "Submission Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><GlobalLoader className="animate-spin text-indigo-600" /></div>
  if (!c) return <div className="p-20 text-center font-bold text-slate-400">FILE NOT IDENTIFIED</div>

  const mandate = c.mandate || {};
  const hasMandate = Object.keys(mandate).length > 0;
  const myAssignmentIndex = (c.investigationTeam || []).findIndex((m: any) => m.email === user?.email);
  const myAssignment = myAssignmentIndex !== -1 ? c.investigationTeam[myAssignmentIndex] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/investigator/dashboard')} className="h-10 w-10 p-0 rounded-full bg-white shadow-sm hover:text-indigo-600 transition-all">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
               <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary whitespace-nowrap">{c.caseId || 'Tactical Case File'}</h1>
                  <Badge className={cn("text-[9px] font-black uppercase px-4", c.priority === 'High' ? "bg-red-500" : "bg-blue-500")}>
                    {c.priority} PRIORITY
                  </Badge>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                 National Registry Node • Assigned: {c.createdAt?.toDate?.()?.toLocaleDateString()}
               </p>
            </div>
         </div>
         <Card className="border-none shadow-sm rounded-2xl bg-indigo-600 text-white p-4 flex items-center gap-6">
            <div className="space-y-1">
               <p className="text-[8px] font-black uppercase text-indigo-200 tracking-widest leading-none mb-1">Field Lifecycle Sync</p>
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
            <TabsTrigger value="mandate" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Mission Mandate</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex gap-2">Assigned Tasks {myAssignment && <Badge className="h-4 px-1 bg-accent text-primary text-[8px]">{ (myAssignment.tasks?.length || 0) + (myAssignment.responsibilities?.length || 0) }</Badge>}</TabsTrigger>
            <TabsTrigger value="team" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Unit Members</TabsTrigger>
            <TabsTrigger value="evidence" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Evidence Vault</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Audit Trail</TabsTrigger>
         </TabsList>

         <TabsContent value="mandate" className="animate-in fade-in duration-500">
            {!hasMandate ? (
              <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                 <h3 className="text-xl font-headline font-bold text-slate-400">Mission mandate pending issuance.</h3>
              </div>
            ) : (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                  <Card className="rounded-[2.5rem] border-none shadow-sm p-8 md:p-12 bg-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-24 -mt-24"></div>
                     <CardHeader className="p-0 mb-10">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-6">
                           <Target className="w-3.5 h-3.5" /> Order of Command
                        </div>
                        <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary leading-tight">{mandate.title || 'Official Investigation Mandate'}</h2>
                        <div className="mt-8 p-8 bg-slate-900 rounded-[2rem] border-l-[12px] border-accent shadow-2xl">
                           <p className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-4">Primary Objective</p>
                           <p className="text-xl md:text-2xl text-white font-bold leading-relaxed italic">"{mandate.objective || "Vetting and resolution of reported human rights infringements."}"</p>
                        </div>
                     </CardHeader>

                     <div className="space-y-12">
                        <div className="space-y-4">
                           <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-3">
                              <FileSearch className="w-4 h-4 text-indigo-500" /> Official Instructions
                           </h4>
                           <div className="text-sm md:text-base text-slate-700 leading-relaxed font-medium whitespace-pre-wrap bg-slate-50 p-6 rounded-2xl">
                              {mandate.instructions || "Standard operational guidelines of the Human Rights Affairs Trust apply."}
                           </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                           <div className="space-y-4">
                              <h4 className="text-[11px] font-black uppercase text-indigo-600 tracking-[0.2em] flex items-center gap-3">
                                 <Activity className="w-4 h-4" /> Field Actions
                              </h4>
                              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap pl-7 border-l-2 border-indigo-100">
                                 {mandate.requiredActions || "No specific field actions listed."}
                              </div>
                           </div>
                           <div className="space-y-4">
                              <h4 className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.2em] flex items-center gap-3">
                                 <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Evidence Req
                              </h4>
                              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap pl-7 border-l-2 border-emerald-100">
                                 {mandate.evidenceToCollect || "Visual site verification and authenticated testimonials."}
                              </div>
                           </div>
                        </div>
                     </div>
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-slate-900 text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                     <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-8 flex items-center gap-2"><Clock className="w-4 h-4" /> Timeline</h3>
                     <div className="space-y-6">
                        <div className="flex gap-4 p-5 bg-white/5 rounded-[1.5rem] border border-white/5">
                           <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent shrink-0"><CalendarIcon className="w-6 h-6" /></div>
                           <div className="min-w-0">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Mandate Deadline</p>
                              <p className="text-lg font-headline font-bold text-white truncate">{mandate.deadline || 'ASAP'}</p>
                           </div>
                        </div>
                     </div>
                  </Card>
                </div>
              </div>
            )}
         </TabsContent>

         <TabsContent value="tasks" className="animate-in slide-in-from-right-4 duration-500">
            {!myAssignment ? (
               <div className="py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed">
                  <p className="text-slate-400 font-bold uppercase tracking-widest">No individual assignments identified for your identity node.</p>
               </div>
            ) : (
               <div className="space-y-8">
                  {/* Detailed Tasks Section (Real-Time Reactive) */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <ListTodo className="w-6 h-6 text-indigo-600" />
                       <h3 className="text-xl font-headline font-bold">Tactical Task Queue</h3>
                    </div>
                    
                    <div className="grid gap-6">
                       {myAssignment.tasks?.length > 0 ? myAssignment.tasks.map((task: any, taskIdx: number) => (
                          <Card key={task.id} className="rounded-3xl border-none shadow-sm bg-white overflow-hidden group border-2 border-transparent hover:border-indigo-100 transition-all">
                             <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row justify-between gap-8">
                                   <div className="flex-1 space-y-4">
                                      <div className="flex flex-wrap items-center gap-3">
                                         <Badge className={cn(
                                            "text-[8px] font-black uppercase px-3 h-5",
                                            task.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'
                                         )}>{task.priority} Priority</Badge>
                                         <Badge variant="outline" className="text-[8px] font-bold uppercase border-indigo-100 text-indigo-600 h-5">{task.status}</Badge>
                                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">Due: {task.deadline || 'ASAP'}</span>
                                      </div>
                                      <h4 className="text-2xl font-headline font-bold text-primary">{task.title}</h4>
                                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap italic">"{task.description}"</p>
                                      
                                      {task.reports?.length > 0 && (
                                         <div className="pt-4 space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Previous Reports</p>
                                            <div className="space-y-2">
                                               {task.reports.map((r: any, rIdx: number) => (
                                                  <div key={rIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex items-center justify-between">
                                                     <div className="flex items-center gap-3">
                                                        <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                                                        <span className="font-bold text-slate-700">{r.title}</span>
                                                     </div>
                                                     <span className="text-[10px] text-slate-400">{new Date(r.timestamp).toLocaleDateString()}</span>
                                                  </div>
                                               ))}
                                            </div>
                                         </div>
                                      )}
                                   </div>

                                   <div className="md:w-64 space-y-6 shrink-0 pt-4 border-t md:border-t-0 md:border-l md:pl-8 border-slate-100">
                                      <div className="space-y-2">
                                         <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                                            <span>Task Progress</span>
                                            <span className="text-indigo-600">{task.progress}%</span>
                                         </div>
                                         <Progress value={task.progress} className="h-1.5" />
                                      </div>
                                      
                                      <Dialog open={isReportingTask === task.id} onOpenChange={val => setIsReportingTask(val ? task.id : null)}>
                                         <DialogTrigger asChild>
                                            <Button className="w-full h-12 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700">Submit Report</Button>
                                         </DialogTrigger>
                                         <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
                                            <div className="bg-indigo-600 p-8 text-white shrink-0">
                                               <DialogTitle className="text-2xl font-headline font-bold">Field Report Documentation</DialogTitle>
                                               <p className="text-xs text-indigo-100 mt-1 uppercase tracking-widest">Task: {task.title}</p>
                                            </div>
                                            <ScrollArea className="flex-1 p-8 space-y-8 custom-scrollbar">
                                               <div className="space-y-6">
                                                  <div className="space-y-1.5">
                                                     <Label className="text-[10px] font-black uppercase text-slate-400">Report Headline *</Label>
                                                     <Input value={reportForm.title} onChange={e => setReportForm({...reportForm, title: e.target.value})} placeholder="e.g. Findings from Site Inspection" className="h-11 rounded-xl" />
                                                  </div>
                                                  <div className="space-y-1.5">
                                                     <Label className="text-[10px] font-black uppercase text-slate-400">Work Performed / কার্যক্রমের বিবরণ</Label>
                                                     <Textarea value={reportForm.workPerformed} onChange={e => setReportForm({...reportForm, workPerformed: e.target.value})} className="min-h-[100px] rounded-xl" placeholder="Detailed log of field activities..." />
                                                  </div>
                                                  <div className="grid md:grid-cols-2 gap-6">
                                                     <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black uppercase text-slate-400">Key Findings / প্রাপ্ত ফলাফল</Label>
                                                        <Textarea value={reportForm.findings} onChange={e => setReportForm({...reportForm, findings: e.target.value})} className="min-h-[100px] rounded-xl" />
                                                     </div>
                                                     <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black uppercase text-slate-400">Recommendations / সুপারিশ</Label>
                                                        <Textarea value={reportForm.recommendations} onChange={e => setReportForm({...reportForm, recommendations: e.target.value})} className="min-h-[100px] rounded-xl" />
                                                     </div>
                                                  </div>
                                                  <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border">
                                                     <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black uppercase text-indigo-600">Completion (%)</Label>
                                                        <Select value={reportForm.progress.toString()} onValueChange={v => setReportForm({...reportForm, progress: parseInt(v)})}>
                                                           <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                                                           <SelectContent className="bg-white">
                                                              {[0, 25, 50, 75, 90, 100].map(v => <SelectItem key={v} value={v.toString()}>{v}%</SelectItem>)}
                                                           </SelectContent>
                                                        </Select>
                                                     </div>
                                                     <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black uppercase text-indigo-600">Updated Status</Label>
                                                        <Select value={reportForm.status} onValueChange={v => setReportForm({...reportForm, status: v})}>
                                                           <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                                                           <SelectContent className="bg-white">
                                                              {['Pending', 'In Progress', 'Completed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                           </SelectContent>
                                                        </Select>
                                                     </div>
                                                  </div>
                                               </div>
                                            </ScrollArea>
                                            <div className="p-8 border-t bg-slate-50 shrink-0 flex gap-4">
                                               <DialogClose asChild><Button variant="ghost" className="flex-1 rounded-xl">Cancel</Button></DialogClose>
                                               <Button onClick={() => handleSubmitTaskReport(myAssignmentIndex, taskIdx)} disabled={isActionLoading || !reportForm.title} className="flex-1 bg-indigo-600 text-white font-bold h-12 rounded-xl">
                                                  {isActionLoading ? <Loader2 className="animate-spin mr-2" /> : "Authorize & Submit Report"}
                                               </Button>
                                            </div>
                                         </DialogContent>
                                      </Dialog>
                                   </div>
                                </div>
                             </CardContent>
                          </Card>
                       )) : (
                          <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
                             <Users className="w-12 h-12 text-slate-100" />
                             <h3 className="text-xl font-headline font-bold text-slate-300 uppercase">No task assigned.</h3>
                          </div>
                       )}
                    </div>
                  </div>

                  {/* General Responsibilities Section */}
                  <div className="space-y-6 pt-10 border-t">
                    <div className="flex items-center gap-3">
                       <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                       <h3 className="text-xl font-headline font-bold">General Responsibilities</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                       {myAssignment.responsibilities?.map((resp: string, i: number) => (
                          <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border shadow-sm">
                             <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
                             <span className="text-sm font-bold text-primary uppercase tracking-tight">{resp}</span>
                          </div>
                       ))}
                    </div>
                  </div>
               </div>
            )}
         </TabsContent>

         <TabsContent value="team" className="animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {(c.investigationTeam || []).map((member: any, i: number) => (
                  <Card key={i} className="rounded-3xl border-none shadow-sm bg-white overflow-hidden group">
                     <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform"><User className="w-6 h-6" /></div>
                           <div className="min-w-0">
                              <h4 className="text-sm font-bold text-primary truncate">{member.investigatorName}</h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.designation}</p>
                           </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-slate-50">
                           <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                              <span>Load progress</span>
                              <span className="text-indigo-600">{member.progressPercentage}%</span>
                           </div>
                           <Progress value={member.progressPercentage} className="h-1.5" />
                           <Badge variant="outline" className="w-full justify-center h-6 text-[8px] uppercase border-indigo-100 text-indigo-600">{member.status}</Badge>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         </TabsContent>

         <TabsContent value="evidence" className="animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <Card className="rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center space-y-4 hover:border-indigo-600 transition-all cursor-pointer bg-white group">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Plus className="w-8 h-8" /></div>
                  <p className="font-bold text-primary uppercase text-xs">Append Document</p>
               </Card>
            </div>
         </TabsContent>

         <TabsContent value="timeline" className="animate-in fade-in duration-500">
            <Card className="rounded-[2.5rem] border-none shadow-sm p-10 bg-white">
               <div className="space-y-10">
                  {(c.timeline || []).slice().reverse().map((entry: any, i: number) => (
                    <div key={i} className="flex gap-8 relative group">
                       <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative z-10 shadow-sm transition-all bg-slate-50 text-accent"><History className="w-5 h-5" /></div>
                       <div className="flex-1 pt-1 pb-10 border-l-2 border-slate-100 pl-8 ml-[-40px] group-last:border-transparent">
                          <div className="flex justify-between items-center mb-3">
                             <h4 className="text-lg font-bold text-primary">{entry.action}</h4>
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl italic text-sm text-slate-500 leading-relaxed border whitespace-pre-wrap">"{entry.remark}"</div>
                          <div className="mt-3 flex items-center gap-2"><Badge variant="outline" className="text-[7px] font-black uppercase opacity-60 border-slate-200">{entry.user}</Badge></div>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
         </TabsContent>
      </Tabs>
    </div>
  )
}
