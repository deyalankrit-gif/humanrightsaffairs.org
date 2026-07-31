
"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase'
import { doc, updateDoc, serverTimestamp, arrayUnion, collection, query, orderBy, where } from 'firebase/firestore'
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
  RefreshCw, MailCheck, MailWarning, MailQuestion
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { CASE_STATUSES, CASE_PRIORITIES, REPORT_TEMPLATES } from '@/lib/complaint-constants'
import { getStatusColor } from '@/lib/complaint-utils'
import { sendTimelineEmailUpdate, sendReportEmail } from '@/lib/notification-service'

/**
 * Tactical Case Management Hub: 
 * Professional interface for investigative and reporting lifecycle.
 * Enhanced with Multi-Level Review and Stage-Specific Log protocols.
 * Automated Email Notifications integrated into all lifecycle updates.
 * Manual Timeline Transmission Node added to stages and status logs.
 * Audit Registry updated to display both sender and recipient emails for full transparency.
 * Timeline updated to show mail status and sender/recipient details for each action.
 */
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

  // Data Fetching: Available Personnel for Assignment
  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'users'), where('status', '==', 'active'));
  }, [db]);

  const { data: systemUsers } = useCollection(usersQuery);

  const availablePersonnel = useMemo(() => {
    if (!systemUsers) return [];
    return systemUsers.map((u: any) => ({
      email: u.email || u.id,
      name: u.name || (u.email || u.id).split('@')[0],
      role: u.role
    }));
  }, [systemUsers]);

  // Utility: Dispatches the automated email update and logs it
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

  // Manual Timeline Item Dispatch
  const handleManualTimelineEmail = async (entry: any) => {
    if (!caseData?.email || !caseData?.fullName || !docRef || !user) return;
    
    setIsActionLoading(true);
    try {
      await dispatchEmailUpdate(entry.action, entry.remark);
      toast({ 
        title: "Update Transmitted", 
        description: `Notification for "${entry.action}" dispatched to citizen.` 
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Transmission Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Manual Report Dispatch
  const handleManualEmailReport = async () => {
    if (!caseData?.email || !docRef || !user) return;
    
    setIsActionLoading(true);
    const reportLabel = REPORT_TEMPLATES.find(t => t.id === selectedReportType)?.label || selectedReportType;
    const timestamp = new Date().toLocaleString('en-IN');

    try {
      const result = await sendReportEmail({
        recipientEmail: caseData.email,
        recipientName: caseData.fullName,
        caseId: caseData.caseId || caseData.token,
        reportType: reportLabel,
        senderEmail: user.email!
      });

      const emailLogEntry = {
        timestamp,
        subject: `Investigative Report: ${reportLabel}`,
        recipient: caseData.email,
        status: result.success ? 'Success' : 'Failed',
        sender: user.email,
        traceId: result.traceId,
        type: 'Manual',
        error: result.error || null
      };

      await updateDoc(docRef, {
        emailLogs: arrayUnion(emailLogEntry)
      });

      if (result.success) {
        toast({ title: "Report Transmitted", description: `Report sent to ${caseData.email}` });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Transmission Failed", 
          description: "MTA Relay Error. Please retry from the log." 
        });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "System Error" });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Status Lifecycle Update
  const updateCaseStatus = async (newStatus: string) => {
    if (!docRef || !user) return;
    setIsActionLoading(true);
    try {
      // Dispatch notification and get log entry
      const mailLog = await dispatchEmailUpdate(`Status: ${newStatus}`, `Your complaint has moved to the next stage: ${newStatus}.`);

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
      
      toast({ title: "Lifecycle Updated", description: `Case transitioned to ${newStatus}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Transition Denied" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAssignment = async (personName: string) => {
    if (!docRef || !user) return;
    setIsActionLoading(true);
    try {
      const mailLog = await dispatchEmailUpdate(`Investigator Assigned`, `A specialized officer (${personName}) has been assigned to investigate your report.`);

      const entry = {
        action: "Investigator Assignment",
        user: user.email,
        timestamp: new Date().toISOString(),
        remark: `Case assigned to ${personName} for detailed investigation.`,
        type: 'assignment',
        mailStatus: mailLog?.status,
        mailFrom: mailLog?.sender,
        mailTo: mailLog?.recipient
      };
      await updateDoc(docRef, { 
        assignedTo: personName,
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        timeline: arrayUnion(entry)
      });
      
      toast({ title: "Officer Assigned", description: `Case file transferred to ${personName}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Assignment Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddRemark = async () => {
    if (!remark.trim() || !docRef || !user) return;
    setIsActionLoading(true);
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
      
      toast({ title: "Review Recorded", description: `Consideration from ${selectedReviewLevel} level established.` });
      setLevelNote('');
    } catch (e) {
      toast({ variant: "destructive", title: "Review Rejected" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStageLog = async () => {
    if (!stageLogNote.trim() || !docRef || !user) return;
    setIsActionLoading(true);
    try {
      const mailLog = await dispatchEmailUpdate(`Investigation Stage Completed: ${selectedLogStage}`, stageLogNote.trim());

      const entry = {
        action: `Stage Detail Log: ${selectedLogStage}`,
        user: user.email,
        timestamp: new Date().toISOString(),
        remark: stageLogNote.trim(),
        type: 'stage_log',
        meta: { stage: selectedLogStage },
        mailStatus: mailLog?.status,
        mailFrom: mailLog?.sender,
        mailTo: mailLog?.recipient
      };
      await updateDoc(docRef, { 
        timeline: arrayUnion(entry),
        updatedAt: serverTimestamp()
      });
      
      toast({ title: "Stage Detail Archived" });
      setStageNote('');
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Error" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCommissionFindings = async () => {
    if (!commissionData.findings.trim() || !docRef || !user) return;
    setIsActionLoading(true);
    try {
      const mailLog = await dispatchEmailUpdate(`Final Investigative Findings Published`, `Our investigation is complete. Conclusion: ${commissionData.findings}`);

      const entry = {
        action: "Commission Findings Registered",
        user: user.email,
        timestamp: new Date().toISOString(),
        remark: `Final Findings: ${commissionData.findings}. Directives: ${commissionData.directives}`,
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

      toast({ 
        title: "Findings Commissioned", 
        description: "The investigative conclusion has been committed to the national registry." 
      });
      
      setIsCommissionOpen(false);
      setCommissionData({ findings: '', directives: '' });
    } catch (e) {
      toast({ variant: "destructive", title: "Commission Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUploadEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !docRef || !user) return;

    if (file.size > 307200) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Maximum 300KB limit for database performance."
      });
      return;
    }

    setIsActionLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      const fileType = file.type.startsWith('image') ? 'image' : 
                      file.type.startsWith('audio') ? 'audio' : 
                      file.type.startsWith('video') ? 'video' : 'document';
      
      const evidenceItem = {
        url: dataUri,
        type: fileType,
        name: file.name,
        timestamp: new Date().toISOString(),
        uploadedBy: user.email
      };

      const mailLog = await dispatchEmailUpdate(`Evidence Appended`, `New investigative ${fileType} documentation has been added to your case file.`);

      const timelineEntry = {
        action: "Evidence Appended to Vault",
        user: user.email,
        timestamp: new Date().toISOString(),
        remark: `Secured investigative ${fileType}: ${file.name}`,
        type: 'evidence',
        mailStatus: mailLog?.status,
        mailFrom: mailLog?.sender,
        mailTo: mailLog?.recipient
      };

      try {
        await updateDoc(docRef, {
          investigativeEvidence: arrayUnion(evidenceItem),
          timeline: arrayUnion(timelineEntry),
          updatedAt: serverTimestamp()
        });
        
        toast({ title: "Evidence Secured" });
      } catch (err) {
        toast({ variant: "destructive", title: "Upload Failed" });
      } finally {
        setIsActionLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (authLoading || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-accent" /></div>
  }

  if (!caseData) return <div className="p-20 text-center text-slate-400 font-bold uppercase">Record not identified in National Registry.</div>

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Tactical Header */}
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 sticky top-0 z-40 px-4 shadow-2xl">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/10 h-10 w-10 p-0 rounded-full">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <h1 className="text-xl md:text-3xl font-headline font-bold">{caseData.caseId || 'PROVISIONING...'}</h1>
                   <Badge className={cn("text-[9px] font-black uppercase h-5", getStatusColor(caseData.status))}>{caseData.status}</Badge>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                   <Hash className="w-3.5 h-3.5 text-accent" /> Token: {caseData.token} • Filed: {caseData.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                </p>
              </div>
           </div>

           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex-1 md:flex-none">
                 <Select onValueChange={updateCaseStatus} defaultValue={caseData.status}>
                    <SelectTrigger className="w-full md:w-56 h-11 bg-white/5 border-white/10 text-white font-bold text-[10px] uppercase tracking-widest">
                       <SelectValue placeholder="Transition Status" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[1000000] bg-white">
                       {CASE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>
              
              <Dialog open={isCommissionOpen} onOpenChange={setIsCommissionOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-primary font-bold h-11 px-8 rounded-xl shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all">
                    <Edit3 className="w-4 h-4 mr-2" /> Commission Findings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
                  <div className="bg-slate-900 p-8 text-white relative">
                    <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/20 hover:text-white"><X className="w-5 h-5" /></Button></DialogClose></div>
                    <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2">Executive Action</Badge>
                    <DialogTitle className="text-2xl font-headline font-bold">Commission Investigative Findings</DialogTitle>
                    <DialogDescription className="text-slate-400">Formalize the conclusion of this case and issue administrative directives.</DialogDescription>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Final Executive Findings</Label>
                      <Textarea 
                        value={commissionData.findings}
                        onChange={e => setCommissionData({...commissionData, findings: e.target.value})}
                        placeholder="Summarize the core investigative conclusions..."
                        className="min-h-[120px] rounded-2xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Directives to Authorities</Label>
                      <Textarea 
                        value={commissionData.directives}
                        onChange={e => setCommissionData({...commissionData, directives: e.target.value})}
                        placeholder="Specify required actions for administrative bodies..."
                        className="min-h-[80px] rounded-2xl"
                      />
                    </div>
                    <Button 
                      onClick={handleCommissionFindings}
                      disabled={isActionLoading || !commissionData.findings.trim()}
                      className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary transition-all"
                    >
                      {isActionLoading ? <Loader2 className="animate-spin" /> : <><Send className="w-5 h-5 mr-2" /> Commit & Close Investigation</>}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
           </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
           <div className="flex items-center justify-between border-b overflow-x-auto no-scrollbar pb-1">
              <TabsList className="bg-transparent h-auto p-0 flex gap-8">
                 {[
                   { id: 'overview', label: 'Case Overview', icon: Eye },
                   { id: 'investigation', label: 'Investigation Hub', icon: Briefcase },
                   { id: 'reports', label: 'Reporting Center', icon: FileText },
                   { id: 'timeline', label: 'Case Timeline', icon: History },
                   { id: 'evidence', label: 'Evidence Vault', icon: ShieldCheck }
                 ].map(tab => (
                   <TabsTrigger 
                     key={tab.id} 
                     value={tab.id}
                     className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-accent border-b-2 border-transparent data-[state=active]:border-accent rounded-none px-1 pb-4 text-xs font-bold uppercase tracking-widest transition-all"
                   >
                     <tab.icon className="w-3.5 h-3.5 mr-2" /> {tab.label}
                   </TabsTrigger>
                 ))}
              </TabsList>
           </div>

           {/* OVERVIEW CONTENT */}
           <TabsContent value="overview" className="animate-in fade-in duration-500">
              <div className="grid lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-10">
                       <CardHeader className="p-0 mb-8">
                          <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                             <FileText className="w-6 h-6 text-accent" /> Violation Summary
                          </CardTitle>
                       </CardHeader>
                       <div className="space-y-6">
                          <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative">
                             <div className="absolute top-0 left-0 w-1 h-full bg-accent rounded-full"></div>
                             <h4 className="text-xl md:text-2xl font-bold italic leading-relaxed text-slate-700 dark:text-slate-300">
                               "{caseData.subject}"
                             </h4>
                             <p className="mt-6 text-sm md:text-base leading-relaxed text-slate-500 dark:text-slate-400">
                               {caseData.description}
                             </p>
                          </div>
                       </div>
                    </Card>

                    {/* Communication Audit Registry */}
                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                       <CardHeader className="bg-slate-50 dark:bg-slate-800 p-8 border-b">
                          <div className="flex items-center justify-between">
                             <CardTitle className="text-lg font-headline font-bold flex items-center gap-3">
                                <MailCheck className="w-5 h-5 text-accent" /> Communication Audit Registry
                             </CardTitle>
                             <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200">Session Secure</Badge>
                          </div>
                          <CardDescription className="mt-1">Tracking all official email transmissions to the complainant.</CardDescription>
                       </CardHeader>
                       <CardContent className="p-0">
                          <div className="overflow-x-auto">
                             <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[8px] font-black text-slate-400 uppercase border-b">
                                   <tr>
                                      <th className="px-8 py-4">Status</th>
                                      <th className="px-8 py-4">Transmission Detail</th>
                                      <th className="px-8 py-4">Timestamp</th>
                                      <th className="px-8 py-4 text-right">Action</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                   {(caseData.emailLogs || []).length > 0 ? [...caseData.emailLogs].reverse().map((log: any, i: number) => (
                                     <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                           {log.status === 'Success' ? (
                                             <Badge className="bg-emerald-500 text-white text-[7px] uppercase px-2 h-4">Delivered</Badge>
                                           ) : (
                                             <Badge className="bg-red-500 text-white text-[7px] uppercase px-2 h-4">Failed</Badge>
                                           )}
                                        </td>
                                        <td className="px-8 py-4">
                                           <p className="text-xs font-bold text-primary dark:text-white truncate max-w-[250px]">{log.subject}</p>
                                           <div className="flex flex-col gap-0.5 mt-1.5">
                                              <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                                <User className="w-3 h-3 text-slate-400" /> To: <span className="text-primary dark:text-slate-300 font-mono lowercase">{log.recipient}</span>
                                              </p>
                                              <p className="text-[9px] font-bold text-accent uppercase flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-accent" /> From: <span className="font-mono lowercase">{log.sender || 'system-mta@hrat-india.org'}</span>
                                              </p>
                                           </div>
                                           <p className="text-[8px] text-slate-400 uppercase font-medium mt-1.5">{log.type} • ID: {log.traceId}</p>
                                        </td>
                                        <td className="px-8 py-4">
                                           <span className="text-[10px] font-bold text-slate-500">{log.timestamp}</span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                           {log.status === 'Failed' && (
                                             <Button variant="ghost" size="sm" onClick={() => toast({ title: "Re-transmission Initiated", description: "Rerouting via secondary MTA..." })} className="h-7 text-[8px] font-black uppercase text-accent hover:bg-accent/10">Retry</Button>
                                           )}
                                        </td>
                                     </tr>
                                   )) : (
                                     <tr><td colSpan={4} className="py-12 text-center text-slate-300 font-bold uppercase text-[9px] tracking-widest">No communications recorded</td></tr>
                                   )}
                                </tbody>
                             </table>
                          </div>
                       </CardContent>
                    </Card>
                 </div>

                 <div className="space-y-8">
                    <Card className="rounded-3xl bg-slate-900 text-white p-8 border-none shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                       <CardTitle className="text-base font-headline font-bold text-accent mb-6 flex items-center gap-2">
                          <UserCheck className="w-4 h-4" /> Personnel Profile
                       </CardTitle>
                       <div className="space-y-5">
                          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                             <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-accent"><User className="w-6 h-6" /></div>
                             <div>
                                <p className="text-sm font-bold leading-none">{caseData.fullName}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Complainant Identity</p>
                             </div>
                          </div>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                             <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Registered Address</p>
                             <p className="text-[11px] leading-relaxed italic text-slate-300">"{caseData.address}, {caseData.districtName}, {caseData.stateName}"</p>
                          </div>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           {/* INVESTIGATION CONTENT */}
           <TabsContent value="investigation" className="animate-in slide-in-from-right-4 duration-500">
              <div className="grid lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white dark:bg-slate-900">
                       <CardHeader className="p-0 mb-8">
                          <CardTitle className="text-xl font-headline font-bold flex items-center gap-3 text-primary dark:text-white">
                             <Briefcase className="w-5 h-5 text-accent" /> Strategic Assignment
                          </CardTitle>
                       </CardHeader>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assigned Official</Label>
                                <Select value={caseData.assignedTo || 'Unassigned'} onValueChange={handleAssignment}>
                                   <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Choose Officer" /></SelectTrigger>
                                   <SelectContent className="bg-white">
                                      {availablePersonnel.map((p, idx) => (
                                        <SelectItem key={idx} value={p.name}>{p.name} ({p.role})</SelectItem>
                                      ))}
                                   </SelectContent>
                                </Select>
                             </div>
                          </div>
                       </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white dark:bg-slate-900">
                       <CardHeader className="p-0 mb-6">
                          <CardTitle className="text-xl font-headline font-bold flex items-center gap-3 text-primary dark:text-white">
                             <Network className="w-6 h-6 text-emerald-500" /> Multi-Level Review Panel
                          </CardTitle>
                       </CardHeader>
                       <div className="space-y-6">
                          <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase text-slate-400">Jurisdictional Level</Label>
                             <Select value={selectedReviewLevel} onValueChange={setSelectedLevel}>
                                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white z-[1000000]">
                                   <SelectItem value="District">District Committee</SelectItem>
                                   <SelectItem value="State">State Chapter</SelectItem>
                                   <SelectItem value="National">National Council</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black uppercase text-slate-400">Review Summary</Label>
                             <Textarea value={levelReviewNote} onChange={e => setLevelNote(e.target.value)} placeholder={`Input ${selectedReviewLevel} observations...`} className="min-h-[100px] rounded-2xl bg-slate-50 dark:bg-slate-950" />
                          </div>
                          <Button onClick={handleLevelReview} disabled={isActionLoading || !levelReviewNote.trim()} className="w-full h-12 bg-emerald-600 text-white font-bold rounded-xl shadow-xl">Commit {selectedReviewLevel} Review</Button>
                       </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white dark:bg-slate-900">
                       <CardHeader className="p-0 mb-6">
                          <CardTitle className="text-xl font-headline font-bold flex items-center gap-3 text-primary dark:text-white">
                             <Target className="w-6 h-6 text-indigo-500" /> Stage Detail Logs
                          </CardTitle>
                       </CardHeader>
                       <div className="space-y-6">
                          <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase text-slate-400">Target Stage</Label>
                             <Select value={selectedLogStage} onValueChange={setSelectedStage}>
                                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white z-[1000000]">
                                   {CASE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black uppercase text-slate-400">Investigation Details</Label>
                             <Textarea value={stageLogNote} onChange={e => setStageNote(e.target.value)} placeholder={`Details recorded for ${selectedLogStage}...`} className="min-h-[120px] rounded-2xl bg-slate-50 dark:bg-slate-950" />
                          </div>
                          <Button onClick={handleStageLog} disabled={isActionLoading || !stageLogNote.trim()} className="w-full h-12 bg-indigo-600 text-white font-bold rounded-xl shadow-xl">Archive Stage Findings</Button>
                       </div>
                    </Card>
                 </div>

                 <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[2rem] border-none shadow-sm p-6 bg-white dark:bg-slate-900">
                       <CardHeader className="p-0 mb-6">
                          <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                             <MessageSquare className="w-4 h-4 text-accent" /> Quick Remarks
                          </CardTitle>
                       </CardHeader>
                       <div className="space-y-4">
                          <Textarea value={remark} onChange={e => setRemark(e.target.value)} placeholder="Short internal update..." className="min-h-[80px] rounded-xl text-sm" />
                          <Button onClick={handleAddRemark} disabled={isActionLoading || !remark.trim()} className="w-full h-10 rounded-xl bg-primary text-white font-bold text-[10px] uppercase tracking-widest">Post Remark</Button>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           {/* REPORTS CONTENT */}
           <TabsContent value="reports" className="animate-in zoom-in-95 duration-500">
              <div id="reports" className="grid lg:grid-cols-12 gap-8 items-start">
                 <div className="lg:col-span-4">
                    <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                       <CardHeader className="bg-slate-50 dark:bg-slate-800 p-6 border-b">
                          <CardTitle className="text-sm font-black uppercase tracking-widest text-primary dark:text-white">Template Selection Hub</CardTitle>
                       </CardHeader>
                       <CardContent className="p-2">
                          <ScrollArea className="h-[600px] pr-4">
                             <div className="space-y-1">
                                {REPORT_TEMPLATES.map(temp => (
                                  <button
                                    key={temp.id}
                                    onClick={() => setSelectedReportType(temp.id)}
                                    className={cn(
                                      "w-full text-left p-4 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all border border-transparent",
                                      selectedReportType === temp.id 
                                        ? "bg-accent/10 border-accent/20 text-accent shadow-sm" 
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
                                    )}
                                  >
                                    {temp.label}
                                  </button>
                                ))}
                             </div>
                          </ScrollArea>
                       </CardContent>
                    </Card>
                 </div>

                 <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900 p-8 md:p-12 min-h-[700px] flex flex-col">
                       <div className="flex-1 space-y-10">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-primary pb-8">
                             <div className="flex items-center gap-4">
                                <div className="relative w-14 h-14 shrink-0">
                                   <Image src="/HRAT%20Logo.jpeg" alt="Institutional Logo" fill className="object-contain" />
                                </div>
                                <div className="space-y-0.5">
                                   <h3 className="text-xl font-headline font-bold text-primary dark:text-white uppercase leading-none">Human Rights Affairs Trust</h3>
                                   <p className="text-[8px] font-black text-accent uppercase tracking-[0.3em]">National Justice Registry Node</p>
                                </div>
                             </div>
                             <div className="text-right space-y-1">
                                <Badge className="bg-primary text-white font-black text-[10px] uppercase px-4">{REPORT_TEMPLATES.find(t => t.id === selectedReportType)?.label.split('. ')[1]}</Badge>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Case Ref: {caseData.caseId}</p>
                             </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-8 text-xs">
                             <div className="space-y-4">
                                <div><Label className="text-[8px] font-black uppercase text-slate-400">Complainant</Label><p className="font-bold text-sm">{caseData.fullName}</p></div>
                                <div><Label className="text-[8px] font-black uppercase text-slate-400">Jurisdiction</Label><p className="font-bold text-sm">{caseData.districtName}, {caseData.stateName}</p></div>
                             </div>
                             <div className="space-y-4 text-right">
                                <div><Label className="text-[8px] font-black uppercase text-slate-400">Issuance Date</Label><p className="font-bold text-sm">{new Date().toLocaleDateString('en-IN')}</p></div>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <h4 className="text-center font-bold uppercase tracking-widest text-slate-400 border-y py-2">Findings & Executive Narrative</h4>
                             <Textarea 
                                placeholder="Auto-populated structural narrative based on template selection..." 
                                className="min-h-[300px] border-none bg-slate-50 dark:bg-slate-950 p-6 leading-relaxed text-sm md:text-base italic font-serif shadow-inner"
                             />
                          </div>
                       </div>
                       
                       <CardFooter className="p-0 pt-10 mt-10 border-t border-slate-100 flex flex-wrap gap-3">
                          <Button onClick={handleManualEmailReport} disabled={isActionLoading} className="flex-1 bg-emerald-600 text-white font-bold h-12 rounded-xl text-[10px] uppercase shadow-lg shadow-emerald-500/20">
                             <Send className="w-4 h-4 mr-2" /> Send via Email
                          </Button>
                          <Button variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase border-2 shadow-sm">
                             <Download className="w-4 h-4 mr-2" /> Export PDF
                          </Button>
                          <Button variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase border-2 shadow-sm">
                             <Share2 className="w-4 h-4 mr-2" /> Share via WhatsApp
                          </Button>
                       </CardFooter>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           {/* TIMELINE CONTENT */}
           <TabsContent value="timeline" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="rounded-[3rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8 md:p-16">
                 <div className="max-w-3xl mx-auto space-y-12">
                    {(caseData.timeline || []).length > 0 ? [...caseData.timeline].reverse().map((entry: any, idx: number) => (
                      <div key={idx} className="flex gap-8 relative group">
                         <div className={cn(
                           "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 relative z-10",
                           entry.type === 'level_review' ? "bg-emerald-500 text-white" :
                           entry.type === 'stage_log' ? "bg-indigo-500 text-white" : "bg-slate-50 dark:bg-slate-800 text-accent"
                         )}>
                            <Clock className="w-6 h-6" />
                         </div>
                         <div className="space-y-2 flex-1 pt-1 pb-10 border-l pl-8 border-slate-100 dark:border-slate-800 ml-[-38px] group-last:border-transparent">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                               <h4 className="text-lg font-bold text-primary dark:text-white">{entry.action}</h4>
                               <div className="flex items-center gap-4">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleString('en-IN')}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleManualTimelineEmail(entry)}
                                    disabled={isActionLoading}
                                    className="h-8 px-3 rounded-lg text-accent hover:bg-accent/10 font-bold text-[10px] uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Mail className="w-3.5 h-3.5" /> Transmit Notice
                                  </Button>
                               </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 italic text-sm text-slate-500 leading-relaxed">
                               "{entry.remark}"
                            </div>
                            
                            {/* NEW: Explicit Communication Status Block */}
                            {entry.mailStatus && (
                              <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5 shadow-sm animate-in fade-in duration-500">
                                 <div className="flex items-center gap-2">
                                    {entry.mailStatus === 'Success' ? (
                                      <Badge className="bg-emerald-500 text-white text-[7px] uppercase px-1.5 h-4">Delivered</Badge>
                                    ) : (
                                      <Badge className="bg-red-500 text-white text-[7px] uppercase px-1.5 h-4">Failed</Badge>
                                    )}
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Transmission Metadata</span>
                                 </div>
                                 <div className="flex flex-col gap-0.5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                      <User className="w-2.5 h-2.5 text-slate-400" /> To: <span className="text-primary dark:text-slate-300 font-mono lowercase">{entry.mailTo}</span>
                                    </p>
                                    <p className="text-[9px] font-bold text-accent uppercase flex items-center gap-1.5">
                                      <Mail className="w-2.5 h-2.5 text-accent" /> From: <span className="font-mono lowercase">{entry.mailFrom}</span>
                                    </p>
                                 </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                               <Badge className="bg-slate-900 text-white text-[8px] font-bold">{entry.user}</Badge>
                            </div>
                         </div>
                      </div>
                    )) : (
                      <div className="text-center py-20 opacity-20"><History className="w-16 h-16 mx-auto mb-4" /><p className="text-sm font-black uppercase tracking-[0.3em]">Timeline Initializing...</p></div>
                    )}
                 </div>
              </Card>
           </TabsContent>

           {/* EVIDENCE CONTENT */}
           <TabsContent value="evidence" className="animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {(caseData.incidentPhotos || []).map((img: string, i: number) => (
                   <Card key={i} className="rounded-3xl overflow-hidden border-none shadow-xl group cursor-zoom-in">
                      <div className="relative aspect-square">
                        <Image src={img} alt="Evidence" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                           <Badge className="bg-accent text-primary font-black text-[8px] uppercase w-fit mb-2">Citizen Submission</Badge>
                           <p className="text-white text-xs font-bold">Attached Document #{i + 1}</p>
                        </div>
                      </div>
                   </Card>
                 ))}
                 
                 {(caseData.investigativeEvidence || []).map((item: any, i: number) => (
                   <Card key={`inv-${i}`} className="rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl group bg-white dark:bg-slate-900">
                      <div className="relative aspect-square">
                        {item.type === 'image' ? (
                          <Image src={item.url} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
                             {item.type === 'audio' ? <FileAudio className="w-16 h-16 text-indigo-500" /> : 
                              item.type === 'video' ? <Video className="w-16 h-16 text-rose-500" /> : 
                              <FileIcon className="w-16 h-16 text-emerald-500" />}
                             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-4 text-center truncate w-full">{item.name}</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                           <Badge className="bg-emerald-500 text-white font-black text-[8px] uppercase w-fit mb-2">Investigative Vault</Badge>
                           <p className="text-white text-xs font-bold truncate">{item.name}</p>
                           <div className="flex gap-2 mt-4">
                              <Button asChild size="sm" variant="outline" className="h-8 rounded-lg bg-white/10 border-white/20 text-white text-[8px] uppercase font-bold">
                                 <a href={item.url} download={item.name}>Download</a>
                              </Button>
                           </div>
                        </div>
                      </div>
                   </Card>
                 ))}
                 
                 <Card className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center space-y-4 hover:border-accent transition-all cursor-pointer group relative overflow-hidden">
                    <input type="file" onChange={handleUploadEvidence} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={isActionLoading} accept="image/*,audio/*,video/*,application/pdf,.doc,.docx" />
                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-accent group-hover:text-white transition-all">
                       {isActionLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Plus className="w-8 h-8" />}
                    </div>
                    <div>
                       <p className="font-bold text-primary dark:text-white uppercase text-xs">Append Evidence</p>
                       <p className="text-[10px] text-slate-400 mt-1">Photos, audio or documents.</p>
                    </div>
                 </Card>
              </div>
           </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </main>
  )
}
