
"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase'
import { doc, updateDoc, serverTimestamp, arrayUnion, collection, query, orderBy, where, getDocs, addDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, ShieldCheck, Loader2, User, Mail, Phone, MapPin, Hash, 
  Clock, FileText, Gavel, Scale, CheckCircle2, MoreVertical, 
  Activity, ClipboardList, Briefcase, Trash2, Edit3, MessageSquare, 
  History, Eye, Download, Share2, Upload, Camera, FileWarning, Search,
  GraduationCap, AlertCircle, Info, Landmark, Layers, UserCheck, ShieldAlert,
  Plus, X, Send, Network, Target, BookOpenCheck, FileAudio, FileIcon, Video,
  RefreshCw, MailCheck, MailWarning, MailQuestion,
  UserRoundCheck,
  UserPlus,
  Users,
  ListTodo,
  Link as LinkIcon
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
  DialogFooter as UiDialogFooter
} from "@/components/ui/dialog"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { CASE_STATUSES, CASE_PRIORITIES, REPORT_TEMPLATES, REPORT_GUIDANCE, TASK_STATUSES } from '@/lib/complaint-constants'
import { getStatusColor } from '@/lib/complaint-utils'
import { sendTimelineEmailUpdate, sendReportEmail } from '@/lib/notification-service'
import { InvestigationJourney } from '@/components/investigation-journey'
import Link from 'next/link'

export default function CaseHubPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [remark, setRemark] = useState('')
  const [selectedReportType, setSelectedReportType] = useState<string>('preliminary_assessment')
  
  // Assignment & Mandate State
  const [officers, setOfficers] = useState<any[]>([])
  const [mandate, setMandate] = useState({
    title: '',
    description: '',
    objective: '',
    instructions: '',
    requiredActions: '',
    evidenceToCollect: '',
    witnessesToContact: '',
    locationsToVisit: '',
    reportingInstructions: '',
    internalNotes: '',
    deadline: '',
    attachments: [] as { name: string, url: string }[]
  })
  
  // Attachments temp state
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' })

  // Tasks State
  const [tasks, setTasks] = useState<any[]>([])
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    priority: 'Medium',
    deadline: ''
  })

  // Multi-Level Review State
  const [selectedReviewLevel, setSelectedLevel] = useState('District')
  const [levelReviewNote, setLevelNote] = useState('')

  // Stage Log State
  const [selectedLogStage, setSelectedStage] = useState('New Complaint')
  const [stageLogNote, setStageNote] = useState('')
  
  // Commission Findings State
  const [isCommissionOpen, setIsCommissionOpen] = useState(false)
  const [commissionData, setCommissionData] = useState({
    findings: '',
    directives: ''
  })

  // Data Fetching: Target Case
  const docRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'public_complaints', id as string);
  }, [db, id]);

  const { data: caseData, loading: dataLoading } = useDoc(docRef);

  // Data Fetching: Registered Investigators
  const officersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'investigation_officers'), where('status', '==', 'active'));
  }, [db]);

  const { data: registryOfficers } = useCollection(officersQuery);

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com';

  useEffect(() => {
    if (caseData) {
      if (caseData.assignedOfficers) setOfficers(caseData.assignedOfficers);
      if (caseData.mandate) setMandate(prev => ({ ...prev, ...caseData.mandate }));
      if (caseData.tasks) setTasks(caseData.tasks);
    }
  }, [caseData]);

  const dispatchEmailUpdate = async (action: string, remark: string) => {
    if (!caseData?.email || !caseData?.fullName || !docRef || !user) return null;
    
    const subject = `Official Update: ${action}`;
    const timestamp = new Date().toLocaleString('en-IN');

    try {
      const result = await sendTimelineEmailUpdate({
        recipientEmail: caseData.email,
        recipientName: caseData.fullName,
        caseId: caseData.caseId || caseData.token,
        action,
        remark,
        timestamp
      });

      const emailLogEntry = {
        timestamp,
        subject,
        recipient: caseData.email,
        status: result.success ? 'Success' : 'Failed',
        sender: user.email,
        traceId: result.traceId,
        type: 'Automated',
        error: result.error || null
      };

      await updateDoc(docRef, {
        emailLogs: arrayUnion(emailLogEntry)
      });

      return emailLogEntry;
    } catch (e) {
      console.warn("[NOTIFICATION-CRITICAL] Dispatch or Logging failure.");
      return null;
    }
  };

  const handleSaveMandate = async () => {
    if (!docRef || !user) return;
    setIsActionLoading(true);
    try {
      await updateDoc(docRef, { 
        mandate,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          action: "Mission Mandate Established",
          user: user.email,
          timestamp: new Date().toISOString(),
          remark: `Updated mission directives: ${mandate.title || 'Untitled Mission'}`,
          type: 'mandate_update'
        })
      });
      toast({ title: "Mandate Synchronized", description: "All instructions and objectives pushed to investigator terminal." });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const addAttachment = () => {
    if (!newAttachment.name || !newAttachment.url) return;
    setMandate({
      ...mandate,
      attachments: [...(mandate.attachments || []), newAttachment]
    });
    setNewAttachment({ name: '', url: '' });
  };

  const removeAttachment = (idx: number) => {
    const updated = [...(mandate.attachments || [])];
    updated.splice(idx, 1);
    setMandate({ ...mandate, attachments: updated });
  };

  const handleAddTask = async () => {
    if (!newTask.name.trim() || !docRef || !user) return;
    setIsActionLoading(true);
    try {
      const taskEntry = {
        id: Math.random().toString(36).substr(2, 9),
        ...newTask,
        status: 'Pending',
        progress: 0,
        createdAt: new Date().toISOString()
      };
      
      await updateDoc(docRef, { 
        tasks: arrayUnion(taskEntry),
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          action: "Tactical Task Assigned",
          user: user.email,
          timestamp: new Date().toISOString(),
          remark: `New task: ${newTask.name}`,
          type: 'task_assignment'
        })
      });
      
      toast({ title: "Task Logged" });
      setNewTask({ name: '', description: '', priority: 'Medium', deadline: '' });
      setIsAddingTask(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Task Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const removeTask = async (taskId: string) => {
    if (!docRef || !caseData) return;
    const updatedTasks = (caseData.tasks || []).filter((t: any) => t.id !== taskId);
    await updateDoc(docRef, { tasks: updatedTasks, updatedAt: serverTimestamp() });
    toast({ title: "Task Purged" });
  };

  const handleOfficerChange = (index: number, field: string, value: string) => {
    const updated = [...officers];
    updated[index] = { ...updated[index], [field]: value };
    setOfficers(updated);
  };

  const addOfficerRow = () => {
    if (officers.length >= 6) {
      toast({ variant: "destructive", title: "Team Limit Reached", description: "Maximum 6 investigators can be assigned." });
      return;
    }
    setOfficers([...officers, { name: '', phone: '', designation: '', responsibility: '' }]);
  };

  const removeOfficerRow = (index: number) => {
    setOfficers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectFromRegistry = (index: number, officer: any) => {
    const updated = [...officers];
    updated[index] = {
      ...updated[index],
      name: officer.name,
      designation: officer.title || 'Investigator'
    };
    setOfficers(updated);
  };

  const handleSaveAssignments = async () => {
    if (!docRef || !user) return;
    setIsActionLoading(true);
    try {
      const activeOfficers = officers.filter(o => o.name.trim());
      const mailLog = await dispatchEmailUpdate(`Investigative Team Updated`, `The investigative team for your case has been updated.`);

      const entry = {
        action: "Team Deployment Update",
        user: user.email,
        timestamp: new Date().toISOString(),
        remark: `Assigned ${activeOfficers.length} officials for field investigation.`,
        type: 'assignment',
        meta: { officers: activeOfficers },
        mailStatus: mailLog?.status,
        mailFrom: mailLog?.sender,
        mailTo: mailLog?.recipient
      };

      await updateDoc(docRef, { 
        assignedOfficers: activeOfficers,
        assignedTo: activeOfficers.length > 0 ? activeOfficers[0].name : '',
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        timeline: arrayUnion(entry)
      });
      
      toast({ title: "Team Registry Updated" });
    } catch (e) {
      toast({ variant: "destructive", title: "Assignment Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const updateCaseStatus = async (newStatus: string) => {
    if (!docRef || !user) return;
    setIsActionLoading(true);
    try {
      const mailLog = await dispatchEmailUpdate(`Status: ${newStatus}`, `Your complaint has moved to: ${newStatus}.`);

      const entry = {
        action: `Status Transition: ${newStatus}`,
        user: user.email,
        timestamp: new Date().toISOString(),
        remark: `Authorized lifecycle update to ${newStatus}.`,
        type: 'status_change',
        mailStatus: mailLog?.status,
        mailFrom: mailLog?.sender,
        mailTo: mailLog?.recipient
      };
      
      await updateDoc(docRef, { 
        status: newStatus,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion(entry)
      });
      
      toast({ title: "Lifecycle Updated" });
    } catch (e) {
      toast({ variant: "destructive", title: "Transition Denied" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddRemark = async () => {
    if (!remark.trim() || !docRef || !user) return;
    setIsActionLoading(true)
    try {
      const mailLog = await dispatchEmailUpdate(`Investigative Remark Posted`, remark.trim());

      const entry = {
        action: "Investigative Remark",
        user: user.email,
        timestamp: new Date().toISOString(),
        remark: remark.trim(),
        type: 'remark',
        mailStatus: mailLog?.status,
        mailFrom: mailLog?.sender,
        mailTo: mailLog?.recipient
      };
      await updateDoc(docRef, { 
        timeline: arrayUnion(entry),
        updatedAt: serverTimestamp()
      });
      
      toast({ title: "Remark Authenticated" });
      setRemark('');
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLevelReview = async () => {
    if (!levelReviewNote.trim() || !docRef || !user) return;
    setIsActionLoading(true);
    try {
      const mailLog = await dispatchEmailUpdate(`Council Review: ${selectedReviewLevel}`, levelReviewNote.trim());

      const entry = {
        action: `${selectedReviewLevel} Council Consideration`,
        user: user.email,
        timestamp: new Date().toISOString(),
        remark: levelReviewNote.trim(),
        type: 'level_review',
        meta: { level: selectedReviewLevel },
        mailStatus: mailLog?.status,
        mailFrom: mailLog?.sender,
        mailTo: mailLog?.recipient
      };
      await updateDoc(docRef, { 
        timeline: arrayUnion(entry),
        updatedAt: serverTimestamp()
      });
      
      toast({ title: "Review Recorded" });
      setLevelNote('');
    } catch (e) {
      toast({ variant: "destructive", title: "Review Rejected" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCommissionFindings = async () => {
    if (!commissionData.findings.trim() || !docRef || !user) return;
    setIsActionLoading(true);
    try {
      const mailLog = await dispatchEmailUpdate(`Final Findings Published`, `Investigation complete.`);

      const entry = {
        action: "Commission Findings Registered",
        user: user.email,
        timestamp: new Date().toISOString(),
        remark: `Findings: ${commissionData.findings}`,
        type: 'commission',
        mailStatus: mailLog?.status,
        mailFrom: mailLog?.sender,
        mailTo: mailLog?.recipient
      };
      
      await updateDoc(docRef, {
        status: "Action Taken",
        finalFindings: commissionData.findings,
        finalDirectives: commissionData.directives,
        commissionedAt: serverTimestamp(),
        commissionedBy: user.email,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion(entry)
      });

      toast({ title: "Findings Commissioned" });
      setIsCommissionOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Commission Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleManualEmailReport = async () => {
    if (!caseData?.email || !docRef || !user) return;
    setIsActionLoading(true);
    try {
      const result = await sendReportEmail({
        recipientEmail: caseData.email,
        recipientName: caseData.fullName,
        caseId: caseData.caseId || caseData.token,
        reportType: selectedReportType,
        senderEmail: user.email!
      });

      if (result.success) {
        toast({ title: "Report Dispatched", description: "Complainant has been notified." });
        await updateDoc(docRef, {
          emailLogs: arrayUnion({
            timestamp: new Date().toLocaleString('en-IN'),
            subject: `Investigative Report: ${selectedReportType}`,
            recipient: caseData.email,
            status: 'Success',
            sender: user.email,
            traceId: result.traceId,
            type: 'Manual Report'
          })
        });
      } else {
        throw new Error(result.error);
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Email Failed", description: e.message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePurgeCase = async () => {
    if (!db || !isRoot || !id) return;
    setIsActionLoading(true);
    try {
      await deleteDoc(doc(db, 'public_complaints', id as string));
      toast({ title: "Case Purged" });
      router.push('/internal/public-complaints');
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (authLoading || dataLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-accent" /></div>
  if (!caseData) return <div className="p-20 text-center text-slate-400 font-bold uppercase">Record not identified.</div>

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 sticky top-0 z-40 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6 w-full md:w-auto order-2 md:order-1">
              <div className="flex flex-col items-center shrink-0">
                 <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest animate-pulse mb-1">Go to Next Process</span>
                 <Select onValueChange={updateCaseStatus} defaultValue={caseData.status}>
                    <SelectTrigger className="w-full md:w-56 h-11 bg-white/5 border-white/10 text-white font-bold text-[10px] uppercase">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[1000000] bg-white">
                       {CASE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>
              <Link href="/internal/public-complaints" className="flex flex-col items-center group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-all">
                  <ArrowLeft className="w-6 h-6" />
                </div>
              </Link>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <h1 className="text-xl md:text-3xl font-headline font-bold">{caseData.caseId || 'PROVISIONING...'}</h1>
                   <Badge className={cn("text-[9px] font-black uppercase h-5", getStatusColor(caseData.status))}>{caseData.status}</Badge>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                   <Hash className="w-3.5 h-3.5 text-accent" /> Token: {caseData.token}
                </p>
              </div>
           </div>
           <div className="flex items-center gap-3 w-full md:w-auto order-1 md:order-2">
              <Dialog open={isCommissionOpen} onOpenChange={setIsCommissionOpen}>
                <DialogTrigger asChild><Button className="bg-accent text-primary font-bold h-11 px-8 rounded-xl shadow-xl"><Edit3 className="w-4 h-4 mr-2" /> Commission Findings</Button></DialogTrigger>
                <DialogContent className="max-w-xl rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle>Commission Investigative Findings</DialogTitle>
                  </DialogHeader>
                  <div className="p-4 space-y-6">
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Final Executive Findings</Label><Textarea value={commissionData.findings} onChange={e => setCommissionData({...commissionData, findings: e.target.value})} className="min-h-[120px] rounded-2xl" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Directives</Label><Textarea value={commissionData.directives} onChange={e => setCommissionData({...commissionData, directives: e.target.value})} className="min-h-[80px] rounded-2xl" /></div>
                    <Button onClick={handleCommissionFindings} disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl">{isActionLoading ? <Loader2 className="animate-spin" /> : "Commit & Close"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
           </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
           <TabsList className="bg-white p-1 rounded-2xl border shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar justify-start">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'investigation', label: 'Team & Review', icon: Briefcase },
                { id: 'mandate', label: 'Mission Mandate', icon: Target },
                { id: 'tasks', label: 'Tactical Tasks', icon: ListTodo },
                { id: 'reports', label: 'Reports', icon: FileText },
                { id: 'timeline', label: 'Timeline', icon: History },
                { id: 'evidence', label: 'Evidence', icon: ShieldCheck }
              ].map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-accent data-[state=active]:text-primary rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all">
                  <tab.icon className="w-3.5 h-3.5 mr-2" /> {tab.label}
                </TabsTrigger>
              ))}
           </TabsList>

           <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
              <div className="grid lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
                       <h3 className="text-xl font-headline font-bold text-primary mb-6 flex items-center gap-3"><FileText className="w-6 h-6 text-accent" /> Violation Summary</h3>
                       <div className="p-8 bg-slate-50 rounded-[2rem] border italic text-slate-600 leading-relaxed">
                          "{caseData.description}"
                       </div>
                    </Card>
                 </div>
                 <div className="space-y-8">
                    <Card className="rounded-3xl bg-slate-900 text-white p-8 relative overflow-hidden">
                       <CardTitle className="text-base text-accent mb-6 flex items-center gap-2"><UserCheck className="w-4 h-4" /> Complainant</CardTitle>
                       <div className="space-y-4">
                          <p className="font-bold">{caseData.fullName}</p>
                          <p className="text-xs text-slate-400">{caseData.address}</p>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="mandate" className="animate-in slide-in-from-right-4 duration-500">
              <Card className="rounded-[2.5rem] border-none shadow-sm p-8 md:p-12 bg-white">
                 <CardHeader className="p-0 mb-8">
                    <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3"><Target className="w-7 h-7 text-accent" /> Investigation Mandate Hub</CardTitle>
                    <CardDescription>Comprehensive tactical directives for authorized field personnel.</CardDescription>
                 </CardHeader>
                 <div className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mission Title *</Label>
                          <Input value={mandate.title} onChange={e => setMandate({...mandate, title: e.target.value})} placeholder="e.g. Ground Verification Operation" className="h-12 rounded-xl" />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Investigation Deadline</Label>
                          <Input type="date" value={mandate.deadline} onChange={e => setMandate({...mandate, deadline: e.target.value})} className="h-12 rounded-xl" />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mission Context / Brief Description</Label>
                       <Textarea value={mandate.description} onChange={e => setMandate({...mandate, description: e.target.value})} placeholder="Brief background of the mission..." className="min-h-[80px] rounded-xl" />
                    </div>

                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-black uppercase text-accent tracking-widest">Primary Operational Objective *</Label>
                       <Input value={mandate.objective} onChange={e => setMandate({...mandate, objective: e.target.value})} placeholder="What is the singular goal of this probe?" className="h-12 rounded-xl border-accent/20 font-bold" />
                    </div>

                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Official Instructions (Step-by-Step)</Label>
                       <Textarea value={mandate.instructions} onChange={e => setMandate({...mandate, instructions: e.target.value})} placeholder="Detailed procedural steps for the officer..." className="min-h-[150px] rounded-2xl p-6 bg-slate-50" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mandatory Field Actions</Label>
                          <Textarea value={mandate.requiredActions} onChange={e => setMandate({...mandate, requiredActions: e.target.value})} placeholder="Specific tasks (e.g. Visit local PS)..." className="min-h-[100px] rounded-xl" />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Critical Evidence Requirements</Label>
                          <Textarea value={mandate.evidenceToCollect} onChange={e => setMandate({...mandate, evidenceToCollect: e.target.value})} placeholder="What must be retrieved (e.g. Video, Affidavits)..." className="min-h-[100px] rounded-xl" />
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Witnesses / Persons to Contact</Label>
                          <Textarea value={mandate.witnessesToContact} onChange={e => setMandate({...mandate, witnessesToContact: e.target.value})} placeholder="List of individuals for interview..." className="min-h-[100px] rounded-xl" />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Operational Locations</Label>
                          <Textarea value={mandate.locationsToVisit} onChange={e => setMandate({...mandate, locationsToVisit: e.target.value})} placeholder="Places to be inspected..." className="min-h-[100px] rounded-xl" />
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reporting Instructions</Label>
                          <Textarea value={mandate.reportingInstructions} onChange={e => setMandate({...mandate, reportingInstructions: e.target.value})} placeholder="How and when should updates be sent?" className="min-h-[100px] rounded-xl" />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-red-500 tracking-widest">Internal / Confidential Notes</Label>
                          <Textarea value={mandate.internalNotes} onChange={e => setMandate({...mandate, internalNotes: e.target.value})} placeholder="Sensitive administrative guidance (Hidden from complainant)..." className="min-h-[100px] rounded-xl border-red-100" />
                       </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-6">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" /> Official Document & Reference Links
                       </h4>
                       <div className="flex gap-3">
                          <Input value={newAttachment.name} onChange={e => setNewAttachment({...newAttachment, name: e.target.value})} placeholder="Label (e.g. Case Guideline PDF)" className="flex-1 rounded-xl" />
                          <Input value={newAttachment.url} onChange={e => setNewAttachment({...newAttachment, url: e.target.value})} placeholder="https://..." className="flex-1 rounded-xl" />
                          <Button onClick={addAttachment} variant="outline" className="rounded-xl h-10 px-6"><Plus className="w-4 h-4 mr-1.5" /> Append</Button>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {(mandate.attachments || []).map((att, idx) => (
                             <Badge key={idx} variant="secondary" className="pl-4 pr-1 py-1 h-9 rounded-xl gap-3 bg-white dark:bg-slate-800 border-slate-200">
                                <span className="text-[10px] font-bold">{att.name}</span>
                                <button onClick={() => removeAttachment(idx)} className="p-1 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                             </Badge>
                          ))}
                       </div>
                    </div>

                    <Button onClick={handleSaveMandate} disabled={isActionLoading} className="w-full h-16 bg-accent text-primary font-black uppercase tracking-widest text-lg rounded-[1.5rem] shadow-xl shadow-accent/20 hover:scale-[1.02] transition-all">
                       {isActionLoading ? <Loader2 className="animate-spin mr-2" /> : <><ShieldCheck className="w-6 h-6 mr-3" /> Authorize & Synchronize Mandate</>}
                    </Button>
                 </div>
              </Card>
           </TabsContent>

           <TabsContent value="tasks" className="animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-headline font-bold text-primary">Tactical Task Board</h3>
                    <Button onClick={() => setIsAddingTask(true)} className="bg-primary text-white rounded-xl h-10 px-6 gap-2"><Plus className="w-4 h-4" /> Add Task</Button>
                 </div>
                 
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task) => (
                       <Card key={task.id} className="rounded-3xl border-none shadow-sm bg-white overflow-hidden relative">
                          <div className={cn("absolute top-0 left-0 w-1 h-full", task.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500')}></div>
                          <CardHeader className="pb-2">
                             <div className="flex justify-between items-start">
                                <Badge variant="outline" className="text-[8px] font-black uppercase">{task.priority} Priority</Badge>
                                <button onClick={() => removeTask(task.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                             </div>
                             <CardTitle className="text-base font-bold mt-2">{task.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                             <p className="text-xs text-slate-500 line-clamp-2 italic">"{task.description}"</p>
                             <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-bold uppercase text-slate-400"><span>Progress</span><span>{task.progress}%</span></div>
                                <Progress value={task.progress} className="h-1.5" />
                             </div>
                             <div className="flex justify-between items-center pt-2">
                                <Badge className={cn("text-[9px] uppercase", task.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500')}>{task.status}</Badge>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Due: {task.deadline || 'TBD'}</span>
                             </div>
                          </CardContent>
                       </Card>
                    ))}
                 </div>
              </div>

              <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
                 <DialogContent className="max-w-md rounded-[2.5rem]">
                    <DialogHeader><DialogTitle>Establish New Task</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                       <div className="space-y-1"><Label className="text-[10px] font-bold">Task Name</Label><Input value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} /></div>
                       <div className="space-y-1"><Label className="text-[10px] font-bold">Priority</Label><Select value={newTask.priority} onValueChange={v => setNewTask({...newTask, priority: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="bg-white">{['High', 'Medium', 'Low'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                       <div className="space-y-1"><Label className="text-[10px] font-bold">Deadline</Label><Input type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} /></div>
                       <div className="space-y-1"><Label className="text-[10px] font-bold">Context / Description</Label><Textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} /></div>
                       <Button onClick={handleAddTask} disabled={isActionLoading} className="w-full h-12 bg-primary text-white font-bold rounded-xl">Commit Task</Button>
                    </div>
                 </DialogContent>
              </Dialog>
           </TabsContent>

           <TabsContent value="investigation" className="animate-in slide-in-from-right-4 duration-500">
              <div className="grid lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
                       <CardHeader className="p-0 mb-8"><CardTitle className="text-xl font-headline font-bold flex items-center gap-3"><Users className="w-5 h-5 text-accent" /> Team Deployment</CardTitle></CardHeader>
                       <div className="space-y-6">
                          {officers.map((officer, idx) => (
                            <div key={idx} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4 relative group">
                              <button onClick={() => removeOfficerRow(idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                              <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-slate-400">Name</Label><Input value={officer.name} onChange={e => handleOfficerChange(idx, 'name', e.target.value)} className="h-10 rounded-xl" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-slate-400">Phone</Label><Input value={officer.phone} onChange={e => handleOfficerChange(idx, 'phone', e.target.value)} className="h-10 rounded-xl" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-slate-400">Designation</Label><Input value={officer.designation} onChange={e => handleOfficerChange(idx, 'designation', e.target.value)} className="h-10 rounded-xl" /></div>
                              </div>
                            </div>
                          ))}
                          <Button onClick={addOfficerRow} variant="outline" className="w-full border-dashed">Add Official</Button>
                          <Button onClick={handleSaveAssignments} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl">Authorize Team</Button>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="reports" className="animate-in zoom-in-95 duration-500">
              <div id="reports" className="grid lg:grid-cols-12 gap-8 items-start">
                 <div className="lg:col-span-4">
                    <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
                       <CardHeader className="bg-slate-50 p-6 border-b">
                          <CardTitle className="text-sm font-black uppercase tracking-widest">Template Selection</CardTitle>
                       </CardHeader>
                       <CardContent className="p-2">
                          <TooltipProvider>
                            <ScrollArea className="h-[500px] pr-4">
                               <div className="space-y-1">
                                  {REPORT_TEMPLATES.map(temp => {
                                    const guidance = REPORT_GUIDANCE[temp.id as keyof typeof REPORT_GUIDANCE];
                                    return (
                                      <Tooltip key={temp.id}>
                                        <TooltipTrigger asChild>
                                          <button 
                                            onClick={() => setSelectedReportType(temp.id)} 
                                            className={cn(
                                              "w-full text-left p-4 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-between group", 
                                              selectedReportType === temp.id ? "bg-accent/10 text-accent shadow-sm" : "hover:bg-slate-50 text-slate-500"
                                            )}
                                          >
                                            <span className="truncate">{temp.label}</span>
                                            <Info className={cn("w-3.5 h-3.5 opacity-40 group-hover:opacity-100", selectedReportType === temp.id && "text-accent opacity-100")} />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-[280px] p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border-none">
                                          <div className="space-y-3">
                                            <p className="font-bold text-accent text-[10px] uppercase border-b border-white/10 pb-1 mb-2">{temp.label}</p>
                                            <div className="space-y-2 text-[9px] uppercase tracking-wide leading-relaxed">
                                              <p><span className="text-slate-500 font-black">Purpose:</span> {guidance.purpose}</p>
                                              <p><span className="text-slate-500 font-black">Use When:</span> {guidance.useWhen}</p>
                                              <p><span className="text-slate-500 font-black">Includes:</span> {guidance.includes}</p>
                                              <p><span className="text-slate-500 font-black">Outcome:</span> {guidance.outcome}</p>
                                            </div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    )
                                  })}
                               </div>
                            </ScrollArea>
                          </TooltipProvider>
                       </CardContent>
                    </Card>
                 </div>
                 <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white p-12 min-h-[600px] flex flex-col">
                       <div className="flex-1 space-y-10">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-primary pb-8"><div className="flex items-center gap-4"><div className="relative w-14 h-14 shrink-0"><img src="/HRAT%20Logo.jpeg" alt="HRAT" className="object-contain" /></div><div className="space-y-0.5"><h3 className="text-xl font-headline font-bold text-primary uppercase leading-none">Human Rights Affairs Trust</h3><p className="text-[8px] font-black text-accent uppercase tracking-[0.3em]">National Justice Registry Node</p></div></div><div className="text-right space-y-1"><Badge className="bg-primary text-white font-black text-[10px] uppercase px-4">{REPORT_TEMPLATES.find(t => t.id === selectedReportType)?.label.split('. ')[1]}</Badge><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Case Ref: {caseData.caseId}</p></div></div>
                          <div className="space-y-6"><h4 className="text-center font-bold uppercase tracking-widest text-slate-400 border-y py-2">Findings & Executive Narrative</h4><Textarea placeholder="Auto-populated narrative..." className="min-h-[300px] border-none bg-slate-50 p-6 leading-relaxed text-sm italic font-serif" /></div>
                       </div>
                       <CardFooter className="p-0 pt-10 mt-10 border-t border-slate-100 flex flex-wrap gap-3">
                          <Button onClick={handleManualEmailReport} disabled={isActionLoading} className="flex-1 bg-emerald-600 text-white font-bold h-12 rounded-xl text-[10px] uppercase shadow-lg"><Send className="w-4 h-4 mr-2" /> Send via Email</Button>
                          <Button variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase border-2"><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
                       </CardFooter>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="timeline" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="rounded-[3rem] border-none shadow-sm bg-white p-8 md:p-16">
                 <div className="max-w-3xl mx-auto space-y-12">
                    {(caseData.timeline || []).length > 0 ? [...caseData.timeline].reverse().map((entry: any, idx: number) => (<div key={idx} className="flex gap-8 relative group"><div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 text-accent shadow-sm shrink-0 relative z-10"><Clock className="w-6 h-6" /></div><div className="space-y-2 flex-1 pt-1 pb-10 border-l pl-8 border-slate-100 ml-[-38px] group-last:border-transparent"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"><h4 className="text-lg font-bold">{entry.action}</h4><div className="flex items-center gap-4"><span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(entry.timestamp).toLocaleString('en-IN')}</span></div></div><div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 italic text-sm text-slate-500">"{entry.remark}"</div><div className="flex items-center gap-2 pt-1"><Badge className="bg-slate-900 text-white text-[8px] font-bold">{entry.user}</Badge></div></div></div>)) : (<div className="text-center py-20 opacity-20"><History className="w-16 h-16 mx-auto mb-4" /><p className="text-sm font-black uppercase">Timeline Initializing...</p></div>)}
                 </div>
              </Card>
           </TabsContent>

           <TabsContent value="evidence" className="animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{(caseData.incidentPhotos || []).map((img: string, i: number) => (<Card key={i} className="rounded-3xl overflow-hidden border-none shadow-xl group cursor-zoom-in"><div className="relative aspect-square"><Image src={img} alt="Evidence" fill className="object-cover group-hover:scale-110 transition-transform duration-700" /></div></Card>))}
                 <Card className="rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center space-y-4 bg-white group relative overflow-hidden"><div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-accent group-hover:text-white transition-all"><Plus className="w-8 h-8" /></div><div><p className="font-bold text-primary uppercase text-xs">Append Evidence</p></div></Card></div>
           </TabsContent>
        </Tabs>
        <div className="mt-20 pt-20 border-t border-slate-200">
           <InvestigationJourney complaint={caseData} />
        </div>
      </section>
      <Footer />
    </main>
  )
}
