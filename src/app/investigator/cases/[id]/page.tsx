
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
  Users,
  BookOpen,
  FileSearch,
  ExternalLink,
  MessageSquareWarning,
  Hash,
  Paperclip,
  Settings
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

  const { data: c, loading, error: fetchError } = useDoc(docRef);

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

  const handleUpdateAssignment = async (index: number, progress: number, status: string) => {
    if (!docRef || !c || isActionLoading) return;
    setIsActionLoading(true);
    try {
      const updatedTeam = [...(c.investigationTeam || [])];
      const member = updatedTeam[index];
      
      updatedTeam[index] = {
        ...member,
        progressPercentage: progress,
        status: status,
        updatedDate: new Date().toISOString()
      };

      await updateDoc(docRef, { 
        investigationTeam: updatedTeam,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          action: "Assignment Progress Update",
          user: user?.email,
          timestamp: new Date().toISOString(),
          remark: `${member.investigatorName} updated progress to ${progress}% (${status}).`,
          type: 'assignment_progress'
        })
      });

      toast({ title: "Progress Synchronized" });
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
                 National Registry Node • Assigned: {c.assignedAt?.toDate?.()?.toLocaleDateString()}
               </p>
            </div>
         </div>
         <Card className="border-none shadow-sm rounded-2xl bg-indigo-600 text-white p-4 flex items-center gap-6">
            <div className="space-y-1">
               <p className="text-[8px] font-black uppercase text-indigo-200 tracking-widest leading-none mb-1">Global Status Sync</p>
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
            <TabsTrigger value="responsibilities" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex gap-2">My Responsibilities {myAssignment && <Badge className="h-4 px-1 bg-accent text-primary text-[8px]">{myAssignment.responsibilities?.length || 0}</Badge>}</TabsTrigger>
            <TabsTrigger value="team" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Unit Members</TabsTrigger>
            <TabsTrigger value="evidence" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Evidence Vault</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Audit Trail</TabsTrigger>
         </TabsList>

         <TabsContent value="mandate" className="animate-in fade-in duration-500">
            {!hasMandate ? (
              <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                 <h3 className="text-xl font-headline font-bold text-slate-400">Mission mandate pending issuance from Central Council.</h3>
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
                                 <Activity className="w-4 h-4" /> Required Field Actions
                              </h4>
                              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap pl-7 border-l-2 border-indigo-100">
                                 {mandate.requiredActions || "No specific field actions listed."}
                              </div>
                           </div>
                           <div className="space-y-4">
                              <h4 className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.2em] flex items-center gap-3">
                                 <CheckCircle2 className="w-4 h-4" /> Evidence Requirements
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
                     <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-8 flex items-center gap-2"><Clock className="w-4 h-4" /> Mission Timeline</h3>
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

                  {mandate.attachments && mandate.attachments.length > 0 && (
                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white overflow-hidden">
                       <h3 className="text-xs font-black uppercase text-primary tracking-[0.2em] mb-6 flex items-center gap-2"><Paperclip className="w-4 h-4 text-accent" /> Institutional Assets</h3>
                       <div className="space-y-3">
                          {mandate.attachments.map((att: any, i: number) => (
                            <a 
                              key={i} 
                              href={att.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all group"
                            >
                               <div className="flex items-center gap-3">
                                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                                  <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{att.name}</span>
                               </div>
                               <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                            </a>
                          ))}
                       </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
         </TabsContent>

         <TabsContent value="responsibilities" className="animate-in slide-in-from-right-4 duration-500">
            {!myAssignment ? (
               <div className="py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed">
                  <p className="text-slate-400 font-bold uppercase tracking-widest">No individual responsibilities assigned to your identity node.</p>
               </div>
            ) : (
               <div className="grid lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-8 space-y-6">
                     <Card className="rounded-[2.5rem] border-none shadow-sm p-8 md:p-12 bg-white">
                        <CardHeader className="p-0 mb-8">
                           <div className="flex items-center justify-between">
                              <div>
                                 <CardTitle className="text-2xl font-headline font-bold">My Tactical Responsibilities</CardTitle>
                                 <CardDescription>Individual objectives assigned to you by the Central Council.</CardDescription>
                              </div>
                              <Badge className="bg-indigo-600 text-white font-black px-4">{myAssignment.status}</Badge>
                           </div>
                        </CardHeader>
                        
                        <div className="space-y-4">
                           {myAssignment.responsibilities?.map((resp: string, i: number) => (
                              <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border group hover:border-indigo-600 transition-all">
                                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm"><CheckCircle2 className="w-5 h-5" /></div>
                                 <span className="text-sm font-bold text-primary uppercase tracking-tight">{resp}</span>
                              </div>
                           ))}
                           {(!myAssignment.responsibilities || myAssignment.responsibilities.length === 0) && (
                              <p className="text-slate-400 italic text-center py-10">No granular duties assigned yet.</p>
                           )}
                        </div>
                     </Card>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                     <Card className="rounded-[2rem] border-none shadow-xl bg-indigo-600 text-white p-8">
                        <h4 className="text-xs font-black uppercase text-indigo-200 tracking-widest mb-6 flex items-center gap-2"><Settings className="w-4 h-4" /> Progress Sync</h4>
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-indigo-200">Current Completion (%)</Label>
                              <Select 
                                 value={myAssignment.progressPercentage.toString()} 
                                 onValueChange={v => handleUpdateAssignment(myAssignmentIndex, parseInt(v), myAssignment.status)}
                              >
                                 <SelectTrigger className="bg-white/10 border-white/20 h-12 text-white font-black"><SelectValue /></SelectTrigger>
                                 <SelectContent className="bg-white z-[1000000]">
                                    {[0, 25, 50, 75, 90, 100].map(v => <SelectItem key={v} value={v.toString()}>{v}% Completed</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-indigo-200">Assignment Status</Label>
                              <Select 
                                 value={myAssignment.status} 
                                 onValueChange={v => handleUpdateAssignment(myAssignmentIndex, myAssignment.progressPercentage, v)}
                              >
                                 <SelectTrigger className="bg-white/10 border-white/20 h-12 text-white font-black"><SelectValue /></SelectTrigger>
                                 <SelectContent className="bg-white z-[1000000]">
                                    {['Assigned', 'Active', 'Completed', 'On Hold'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>
                     </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <div className="p-4 bg-slate-50 rounded-2xl italic text-sm text-slate-500 leading-relaxed border">"{entry.remark}"</div>
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
