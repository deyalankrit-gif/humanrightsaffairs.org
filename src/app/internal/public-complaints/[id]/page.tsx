"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase'
import { doc, updateDoc, serverTimestamp, arrayUnion, collection, query, orderBy, where, getDocs, addDoc, deleteDoc, writeBatch } from 'firebase/firestore'
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
  ArrowLeft, 
  ShieldCheck, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Hash, 
  Clock, 
  FileText, 
  Gavel, 
  Scale, 
  CheckCircle2, 
  Activity, 
  History, 
  Eye, 
  Download, 
  Upload, 
  Plus, 
  X,
  Target, 
  FileSearch, 
  ExternalLink,
  ChevronRight,
  UserPlus,
  Users,
  Link as LinkIcon,
  Check,
  Settings2,
  Lock,
  Info,
  Trash2,
  UserCheck,
  Search,
  ListTodo,
  ClipboardCheck,
  AlertTriangle,
  ChevronDown,
  Languages,
  BookOpenCheck,
  GraduationCap,
  MessageSquareWarning,
  BadgeCheck,
  FileQuestion
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
  DialogFooter
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
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { CASE_STATUSES, REPORT_TEMPLATES, REPORT_GUIDANCE, STANDARD_RESPONSIBILITIES } from '@/lib/complaint-constants'
import { getStatusColor } from '@/lib/complaint-utils'
import { InvestigationJourney } from '@/components/investigation-journey'
import { InvestigationTutorial } from '@/components/investigation-tutorial'
import { Footer } from '@/components/footer'
import Link from 'next/link'

export default function CaseHubPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [activeStatus, setActiveStatus] = useState('')
  const [selectedReportType, setSelectedReportType] = useState('preliminary_assessment')
  
  // Investigation Team States
  const [isAssigningOfficer, setIsAssigningOfficer] = useState(false)
  const [teamSearch, setTeamSearch] = useState('')
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  
  // Task Management States
  const [isAddingTask, setIsAddingTask] = useState<number | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    deadline: ''
  })

  // Mandate State
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
  
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' })

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com';

  // Data Fetching: Target Case (Real-Time)
  const docRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'public_complaints', id as string);
  }, [db, id]);

  const { data: caseData, loading: dataLoading } = useDoc(docRef);

  // Data Fetching: Registered Investigators (Real-Time)
  const officersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'investigation_officers'), where('status', '==', 'active'));
  }, [db]);

  const { data: registryOfficers } = useCollection(officersQuery);

  const filteredRegistry = useMemo(() => {
    if (!registryOfficers) return [];
    return registryOfficers.filter((o: any) => 
      o.name.toLowerCase().includes(teamSearch.toLowerCase()) || 
      o.employeeId.toLowerCase().includes(teamSearch.toLowerCase())
    );
  }, [registryOfficers, teamSearch]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'team', 'mandate', 'timeline', 'evidence', 'reports'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (caseData) {
      if (caseData.investigationTeam) setTeamMembers(caseData.investigationTeam);
      if (caseData.mandate) setMandate(prev => ({ ...prev, ...caseData.mandate }));
      setActiveStatus(caseData.status);
    }
  }, [caseData]);

  // --- ACTIONS ---

  const handleAddMember = async (officer: any) => {
    if (!docRef || !user || !caseData) return;
    
    if (teamMembers.some(m => m.investigatorId === officer.employeeId)) {
      toast({ variant: "destructive", title: "Already Assigned", description: "Officer is already in the case team." });
      return;
    }

    setIsActionLoading(true);
    const newOfficerEmail = officer.email.toLowerCase().trim();
    const newOfficerName = officer.name.trim();

    const newMember = {
      investigatorId: officer.employeeId,
      investigatorName: newOfficerName,
      designation: officer.designation,
      email: newOfficerEmail,
      phone: officer.phone || '',
      responsibilities: [],
      tasks: [],
      status: 'Assigned',
      progressPercentage: 0,
      assignedBy: user.email,
      assignedDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      remarks: ''
    };

    try {
      await updateDoc(docRef, {
        investigationTeam: arrayUnion(newMember),
        investigatorEmails: arrayUnion(newOfficerEmail),
        assignedOfficersNames: arrayUnion(newOfficerName),
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          action: "Investigator Provisioned",
          user: user.email,
          timestamp: new Date().toISOString(),
          remark: `Assigned Officer ${officer.name} (${officer.employeeId}) to the case team.`,
          type: 'assignment'
        })
      });
      toast({ title: "Personnel Assigned" });
      setIsAssigningOfficer(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Assignment Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateMember = async (index: number, updates: any) => {
    if (!docRef || !user || !caseData) return;
    setIsActionLoading(true);

    const updatedTeam = [...teamMembers];
    updatedTeam[index] = { 
      ...updatedTeam[index], 
      ...updates, 
      updatedDate: new Date().toISOString() 
    };

    try {
      await updateDoc(docRef, { 
        investigationTeam: updatedTeam,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          action: "Assignment Profile Updated",
          user: user.email,
          timestamp: new Date().toISOString(),
          remark: `Modified duties for ${updatedTeam[index].investigatorName}.`,
          type: 'assignment_update'
        })
      });
      toast({ title: "Profile Synced" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddTask = async (memberIndex: number) => {
    if (!newTask.title.trim()) return;
    
    const updatedTeam = [...teamMembers];
    const memberTasks = updatedTeam[memberIndex].tasks || [];
    
    const taskEntry = {
      id: `task-${Date.now()}`,
      ...newTask,
      status: 'Pending',
      progress: 0,
      assignedBy: user?.email,
      assignedAt: new Date().toISOString(),
      reports: []
    };

    updatedTeam[memberIndex].tasks = [...memberTasks, taskEntry];
    
    try {
      await updateDoc(docRef!, { 
        investigationTeam: updatedTeam,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          action: "Tactical Task Assigned",
          user: user?.email,
          timestamp: new Date().toISOString(),
          remark: `Assigned task "${newTask.title}" to ${updatedTeam[memberIndex].investigatorName}.`,
          type: 'task_assignment'
        })
      });
      toast({ title: "Task Assigned" });
      setNewTask({ title: '', description: '', priority: 'Medium', deadline: '' });
      setIsAddingTask(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Assignment Failed" });
    }
  };

  const handleRemoveMember = async (index: number) => {
    if (!docRef || !user || !caseData) return;
    setIsActionLoading(true);

    const removedMember = teamMembers[index];
    const updatedTeam = teamMembers.filter((_, i) => i !== index);
    
    const updatedEmails = updatedTeam.map(m => (m.email || '').toLowerCase().trim());
    const updatedNames = updatedTeam.map(m => (m.investigatorName || '').trim());

    try {
      await updateDoc(docRef, { 
        investigationTeam: updatedTeam,
        investigatorEmails: updatedEmails,
        assignedOfficersNames: updatedNames,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          action: "Clearance Revoked",
          user: user.email,
          timestamp: new Date().toISOString(),
          remark: `Removed ${removedMember.investigatorName} from the team.`,
          type: 'assignment_removed'
        })
      });
      toast({ title: "Personnel Removed" });
    } catch (e) {
      toast({ variant: "destructive", title: "Removal Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const toggleResponsibility = (memberIndex: number, resp: string) => {
    const current = teamMembers[memberIndex].responsibilities || [];
    const updated = current.includes(resp)
      ? current.filter((r: string) => r !== resp)
      : [...current, resp];
    
    handleUpdateMember(memberIndex, { responsibilities: updated });
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!docRef || !user) return;
    setIsActionLoading(true);
    try {
      await updateDoc(docRef, { 
        status: newStatus,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          action: `Status Transition: ${newStatus}`,
          user: user.email,
          timestamp: new Date().toISOString(),
          remark: `Authorized lifecycle update to ${newStatus}.`,
          type: 'status_change'
        })
      });
      toast({ title: "Lifecycle Updated" });
      setActiveStatus(newStatus);
    } catch (e) {
      toast({ variant: "destructive", title: "Transition Denied" });
    } finally {
      setIsActionLoading(false);
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
          action: "Mission Mandate Synchronized",
          user: user.email,
          timestamp: new Date().toISOString(),
          remark: `Global directives updated: ${mandate.title || 'Official Mandate'}`,
          type: 'mandate_update'
        })
      });
      toast({ title: "Mandate Dispatched" });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUploadEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !docRef || !user) return;

    if (file.size > 102400) { // 100KB limit
      toast({ variant: "destructive", title: "File Too Large", description: "Vault sync is limited to 100KB per file." });
      return;
    }

    setIsActionLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      const evidenceEntry = {
        name: file.name,
        type: file.type,
        url: dataUri,
        uploadedBy: user.email,
        timestamp: new Date().toISOString()
      };

      try {
        await updateDoc(docRef, {
          investigativeEvidence: arrayUnion(evidenceEntry),
          timeline: arrayUnion({
            action: "Exhibit Buffered",
            user: user.email,
            timestamp: new Date().toISOString(),
            remark: `New evidence uploaded to vault: ${file.name}`,
            type: 'evidence'
          })
        });
        toast({ title: "Exhibit Secured" });
      } catch (err) {
        toast({ variant: "destructive", title: "Upload Failed" });
      } finally {
        setIsActionLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEvidence = async (index: number) => {
    if (!docRef || !caseData || !user || !isRoot) return;
    setIsActionLoading(true);
    const updatedEvidence = [...(caseData.investigativeEvidence || [])];
    const removed = updatedEvidence.splice(index, 1)[0];

    try {
      await updateDoc(docRef, {
        investigativeEvidence: updatedEvidence,
        timeline: arrayUnion({
          action: "Exhibit Purged",
          user: user.email,
          timestamp: new Date().toISOString(),
          remark: `Evidence removed from vault: ${removed.name}`,
          type: 'evidence_removed'
        })
      });
      toast({ title: "Vault Updated" });
    } catch (err) {
      toast({ variant: "destructive", title: "Removal Denied" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteCase = async () => {
    if (!db || !id || !isRoot) return;
    setIsActionLoading(true);
    try {
      await deleteDoc(doc(db, 'public_complaints', id as string));
      toast({ title: "Record Purged" });
      router.push('/internal/public-complaints');
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (isActionLoading) return;
    const template = REPORT_TEMPLATES.find(r => r.id === selectedReportType);
    setIsActionLoading(true);
    toast({ title: "Generating Report Draft", description: `Synthesizing ${template?.label}...` });
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ title: "Report Draft Ready" });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (authLoading || dataLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-accent" /></div>

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 w-full overflow-x-hidden">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 sticky top-0 z-40 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6 w-full md:w-auto order-2 md:order-1">
              <div className="flex flex-col items-center shrink-0">
                 <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest animate-pulse mb-1">Go to Next Process</span>
                 <Select onValueChange={handleUpdateStatus} value={activeStatus}>
                    <SelectTrigger className="w-full md:w-56 h-10 bg-white/5 border-white/10 text-white font-bold text-[9px] uppercase">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[1000000] bg-white">
                       {CASE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>
              <Link href="/internal/public-complaints" className="flex flex-col items-center group">
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </div>
              </Link>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                   <h1 className="text-xl md:text-2xl font-headline font-bold whitespace-nowrap truncate">{caseData.caseId || 'DOCKET NO'}</h1>
                   <Badge className={cn("text-[8px] font-black uppercase h-5 shrink-0", getStatusColor(caseData.status))}>{caseData.status}</Badge>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                   <Hash className="w-3 h-3 text-accent" /> Token: {caseData.token}
                </p>
              </div>
           </div>
           
           <div className="flex items-center gap-2 order-1 md:order-2 flex-wrap justify-center w-full md:w-auto">
              <Button onClick={() => setActiveTab('reports')} className="bg-accent text-primary font-bold h-10 px-6 rounded-xl shadow-lg hover:bg-secondary hover:text-white transition-all text-xs">
                <Gavel className="w-3.5 h-3.5 mr-2" /> Commission Findings
              </Button>
              {isRoot && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="h-10 px-6 rounded-xl font-bold text-[9px] uppercase tracking-widest bg-red-600 hover:bg-red-700 shadow-lg">
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Purge
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[2.5rem] w-[95vw] md:w-full">
                    <AlertDialogHeader><AlertDialogTitle>Purge Case?</AlertDialogTitle><AlertDialogDescription>This action is irreversible.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCase} className="bg-red-600 hover:bg-red-700 rounded-xl">Confirm</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
           </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
           <TabsList className="bg-white p-1 rounded-2xl border shadow-sm w-full flex flex-nowrap overflow-x-auto no-scrollbar justify-start items-center">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'team', label: 'Team', icon: Users },
                { id: 'mandate', label: 'Mandate', icon: Target },
                { id: 'timeline', label: 'Trail', icon: History },
                { id: 'evidence', label: 'Vault', icon: ShieldCheck },
                { id: 'reports', label: 'Reports', icon: Gavel }
              ].map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="data-[state=active]:bg-accent data-[state=active]:text-primary rounded-xl px-4 md:px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-2 h-10"
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </TabsTrigger>
              ))}
           </TabsList>

           <TabsContent value="overview" className="animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-sm p-6 md:p-10 bg-white">
                       <h3 className="text-lg font-headline font-bold text-primary mb-6 flex items-center gap-3"><FileText className="w-5 h-5 text-accent" /> Violation Narrative</h3>
                       <div className="p-6 md:p-8 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] border italic text-slate-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                          "{caseData.description}"
                       </div>
                    </Card>
                 </div>
                 <div className="space-y-6">
                    <Card className="rounded-3xl bg-slate-900 text-white p-6 md:p-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                       <CardTitle className="text-sm md:text-base text-accent mb-6 flex items-center gap-2 uppercase tracking-widest"><UserCheck className="w-4 h-4" /> Complainant</CardTitle>
                       <div className="space-y-4">
                          <p className="font-bold text-lg md:text-xl">{caseData.fullName}</p>
                          <div className="space-y-2 text-[11px] md:text-xs text-slate-400">
                             <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-accent" /> {caseData.phone}</div>
                             <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-accent" /> {caseData.email || 'N/A'}</div>
                             <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-accent mt-0.5" /> <span className="leading-tight">{caseData.address}</span></div>
                          </div>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="team" className="animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                 <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-sm p-6 md:p-8 bg-white">
                       <CardHeader className="p-0 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                             <CardTitle className="text-xl font-headline font-bold flex items-center gap-3"><Users className="w-6 h-6 text-accent" /> Team Deployment</CardTitle>
                             <CardDescription className="text-xs uppercase font-bold text-slate-400 tracking-widest">Field Personnel Registry</CardDescription>
                          </div>
                          <Dialog open={isAssigningOfficer} onOpenChange={setIsAssigningOfficer}>
                             <DialogTrigger asChild>
                                <Button className="bg-primary text-white rounded-xl h-10 px-6 gap-2 text-xs font-bold"><UserPlus className="w-4 h-4" /> Assign Personnel</Button>
                             </DialogTrigger>
                             <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl w-[95vw]">
                                <div className="bg-slate-900 p-8 text-white relative border-b-4 border-accent/20">
                                   <DialogTitle className="text-2xl font-headline font-bold">Investigator Registry</DialogTitle>
                                   <div className="relative mt-4">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                      <Input 
                                        placeholder="Search by ID or name..." 
                                        className="pl-10 bg-white/5 border-white/10 text-white rounded-xl h-11 text-sm"
                                        value={teamSearch}
                                        onChange={e => setTeamSearch(e.target.value)}
                                      />
                                   </div>
                                </div>
                                <ScrollArea className="max-h-[400px] p-6 bg-slate-50">
                                   <div className="grid gap-3">
                                      {filteredRegistry.map((officer: any) => (
                                         <button 
                                          key={officer.id}
                                          onClick={() => handleAddMember(officer)}
                                          className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-accent transition-all group text-left"
                                         >
                                            <div className="flex items-center gap-4">
                                               <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-accent"><User className="w-5 h-5" /></div>
                                               <div>
                                                  <p className="text-xs font-bold text-primary leading-none uppercase">{officer.name}</p>
                                                  <p className="text-[10px] text-slate-400 font-mono mt-1">{officer.employeeId}</p>
                                               </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                         </button>
                                      ))}
                                   </div>
                                </ScrollArea>
                             </DialogContent>
                          </Dialog>
                       </CardHeader>
                       
                       <div className="grid gap-6">
                          {teamMembers.map((member, idx) => (
                            <Card key={idx} className="rounded-3xl border-none shadow-sm bg-slate-50/50 p-6 md:p-8 hover:bg-white transition-all group border-2 border-transparent hover:border-slate-100">
                               <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                                  <div className="flex items-center gap-5 flex-1 min-w-0 w-full md:w-auto">
                                     <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white flex flex-col items-center justify-center text-accent shadow-sm shrink-0 border border-slate-100">
                                        <span className="text-[6px] md:text-[7px] font-black uppercase">REF</span>
                                        <span className="text-[10px] md:text-xs font-black">{member.investigatorId?.split('-').pop()}</span>
                                     </div>
                                     <div className="min-w-0">
                                        <h4 className="text-base md:text-lg font-bold text-primary truncate leading-none mb-1">{member.investigatorName}</h4>
                                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.designation}</p>
                                     </div>
                                  </div>

                                  <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6 w-full md:w-auto">
                                     <div className="text-center md:text-right flex-1 md:flex-none">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                        <Badge variant="outline" className="h-6 text-[8px] uppercase border-indigo-100 text-indigo-600 bg-white">{member.status}</Badge>
                                     </div>
                                     
                                     <div className="flex gap-2 w-full md:w-auto">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                             <Button variant="ghost" size="sm" className="h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 hover:bg-accent hover:text-primary transition-all flex-1 md:flex-none">Duties</Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl w-[95vw]">
                                             <div className="bg-slate-900 p-8 text-white"><DialogTitle className="text-xl font-headline font-bold">Duty Management</DialogTitle></div>
                                             <div className="p-8 space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                   {STANDARD_RESPONSIBILITIES.map((resp) => {
                                                      const isChecked = member.responsibilities?.includes(resp);
                                                      return (
                                                         <div key={resp} onClick={() => toggleResponsibility(idx, resp)} className={cn("p-3 rounded-xl border-2 transition-all cursor-pointer select-none text-[9px] font-black flex items-center gap-3", isChecked ? "bg-accent/10 border-accent/40 text-primary" : "bg-white border-slate-100 text-slate-400")}>
                                                            {isChecked ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> : <div className="w-3.5 h-3.5 rounded-full border-2" />} {resp}
                                                         </div>
                                                      )
                                                   })}
                                                </div>
                                                <DialogClose asChild><Button className="w-full h-11 bg-primary text-white font-bold rounded-xl">Save</Button></DialogClose>
                                             </div>
                                          </DialogContent>
                                        </Dialog>

                                        <Dialog open={isAddingTask === idx} onOpenChange={(val) => setIsAddingTask(val ? idx : null)}>
                                          <DialogTrigger asChild>
                                             <Button variant="outline" size="sm" className="h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-indigo-100 bg-indigo-50 text-indigo-700 flex-1 md:flex-none">Tasks</Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl w-[95vw]">
                                             <div className="bg-indigo-600 p-8 text-white"><DialogTitle className="text-xl font-headline font-bold">Assignment Hub</DialogTitle></div>
                                             <div className="p-8 space-y-4">
                                                <Input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Task Title" className="h-11 rounded-xl" />
                                                <Button onClick={() => handleAddTask(idx)} className="w-full h-11 bg-indigo-600 text-white font-bold rounded-xl">Assign Task</Button>
                                             </div>
                                          </DialogContent>
                                        </Dialog>

                                        <button onClick={() => handleRemoveMember(idx)} className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center shrink-0 border border-transparent hover:border-red-100">
                                           <X className="w-4 h-4" />
                                        </button>
                                     </div>
                                  </div>
                               </div>
                            </Card>
                          ))}
                       </div>
                    </Card>
                 </div>
                 <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-3xl bg-slate-900 text-white p-6 md:p-8">
                       <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-6 flex items-center gap-2">
                          <History className="w-4 h-4" /> Personnel Log
                       </h3>
                       <div className="space-y-6">
                          {caseData.timeline?.filter((t: any) => t.type?.includes('assignment')).slice(0, 3).map((log: any, i: number) => (
                            <div key={i} className="space-y-1 relative pl-6 border-l-2 border-accent/30">
                               <p className="text-[10px] font-bold text-white leading-tight">{log.action}</p>
                               <p className="text-[9px] text-slate-400 italic truncate">"{log.remark}"</p>
                               <span className="text-[7px] text-slate-500 font-black block mt-1 uppercase">{new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                          ))}
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="mandate" className="animate-in slide-in-from-right-4 duration-500">
              <Card className="rounded-[2.5rem] border-none shadow-sm p-6 md:p-12 bg-white">
                 <CardHeader className="p-0 mb-10">
                    <CardTitle className="text-xl md:text-2xl font-headline font-bold flex items-center gap-3"><Target className="w-7 h-7 text-accent" /> Investigation Mandate</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Official tactical directives for field personnel.</CardDescription>
                 </CardHeader>
                 <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Mission Title *</Label>
                          <Input value={mandate.title} onChange={e => setMandate({...mandate, title: e.target.value})} className="h-11 rounded-xl" />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Deadline</Label>
                          <Input type="date" value={mandate.deadline} onChange={e => setMandate({...mandate, deadline: e.target.value})} className="h-11 rounded-xl" />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <Label className="text-[9px] font-black uppercase text-accent tracking-widest">Operational Objective *</Label>
                       <Input value={mandate.objective} onChange={e => setMandate({...mandate, objective: e.target.value})} className="h-11 rounded-xl font-bold" />
                    </div>

                    <div className="space-y-1.5">
                       <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Official Instructions</Label>
                       <Textarea value={mandate.instructions} onChange={e => setMandate({...mandate, instructions: e.target.value})} className="min-h-[150px] rounded-2xl p-6 bg-slate-50 text-sm" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Witness Protocol</Label>
                          <Textarea value={mandate.witnessesToContact} onChange={e => setMandate({...mandate, witnessesToContact: e.target.value})} className="min-h-[100px] rounded-xl text-sm" />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Reporting Directives</Label>
                          <Textarea value={mandate.reportingInstructions} onChange={e => setMandate({...mandate, reportingInstructions: e.target.value})} className="min-h-[100px] rounded-xl text-sm" />
                       </div>
                    </div>

                    <Button onClick={handleSaveMandate} disabled={isActionLoading} className="w-full h-14 bg-accent text-primary font-black uppercase tracking-widest text-xs md:text-sm rounded-2xl shadow-xl hover:bg-secondary hover:text-white transition-all">
                       {isActionLoading ? <Loader2 className="animate-spin mr-2" /> : <><ShieldCheck className="w-5 h-5 mr-3" /> Synchronize Mandate</>}
                    </Button>
                 </div>
              </Card>
           </TabsContent>

           <TabsContent value="evidence" className="animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {/* Upload Trigger Card */}
                 <Card 
                  onClick={() => document.getElementById('vault-upload')?.click()}
                  className="rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center space-y-4 hover:border-accent transition-all cursor-pointer bg-slate-50/30 group h-[200px]"
                 >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:bg-accent group-hover:text-primary transition-all shadow-sm">
                       {isActionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                    </div>
                    <div className="space-y-1">
                       <p className="font-bold text-primary dark:text-white uppercase text-[10px] tracking-widest">Append Document</p>
                       <p className="text-[8px] text-slate-400 font-bold uppercase">Max 100KB per file</p>
                    </div>
                    <input 
                      type="file" 
                      id="vault-upload" 
                      className="hidden" 
                      onChange={handleUploadEvidence}
                      disabled={isActionLoading}
                    />
                 </Card>

                 {/* Render Administrative Exhibits */}
                 {((caseData.investigativeEvidence || []) as any[]).map((file, idx) => (
                    <Card key={idx} className="rounded-3xl overflow-hidden border shadow-sm group h-[200px] flex flex-col">
                       <div className="relative flex-1 bg-slate-100 flex items-center justify-center overflow-hidden">
                          {file.type?.includes('image') ? (
                            <Image src={file.url} alt="Evidence" fill className="object-cover group-hover:scale-110 transition-all duration-700" />
                          ) : (
                            <FileText className="w-12 h-12 text-slate-300" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <Button variant="ghost" size="icon" className="text-white hover:bg-accent rounded-full h-10 w-10" onClick={() => window.open(file.url, '_blank')}>
                                <ExternalLink className="w-5 h-5" />
                             </Button>
                             {isRoot && (
                               <Button variant="ghost" size="icon" className="text-white hover:bg-red-500 rounded-full h-10 w-10" onClick={() => handleRemoveEvidence(idx)}>
                                  <Trash2 className="w-5 h-5" />
                               </Button>
                             )}
                          </div>
                       </div>
                       <div className="p-3 bg-white dark:bg-slate-900 border-t">
                          <p className="text-[9px] font-bold text-primary dark:text-white truncate uppercase">{file.name}</p>
                          <p className="text-[7px] text-slate-400 font-bold uppercase">{file.type?.split('/')[1] || 'FILE'}</p>
                       </div>
                    </Card>
                 ))}

                 {/* Render Public Exhibits */}
                 {((caseData.incidentPhotos || []) as string[]).map((url, idx) => (
                    <Card key={`pub-${idx}`} className="rounded-3xl overflow-hidden border shadow-sm group h-[200px] flex flex-col">
                       <div className="relative flex-1 bg-slate-100 overflow-hidden">
                          <Image src={url} alt="Public Photo" fill className="object-cover" />
                          <div className="absolute top-2 left-2">
                             <Badge className="bg-red-600 text-white text-[7px] font-black uppercase border-none">Public Exhibit</Badge>
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Button variant="ghost" size="icon" className="text-white hover:bg-accent rounded-full h-10 w-10" onClick={() => window.open(url, '_blank')}>
                                <Eye className="w-5 h-5" />
                             </Button>
                          </div>
                       </div>
                       <div className="p-3 bg-white dark:bg-slate-900 border-t">
                          <p className="text-[9px] font-bold text-primary dark:text-white uppercase truncate">Citizen Upload #{idx + 1}</p>
                          <p className="text-[7px] text-slate-400 font-bold uppercase">Incident Proof</p>
                       </div>
                    </Card>
                 ))}
              </div>
           </TabsContent>

           <TabsContent value="timeline" className="animate-in fade-in duration-500">
              <Card className="rounded-[2.5rem] border-none shadow-sm p-10 bg-white">
                 <div className="space-y-10">
                    {(caseData.timeline || []).slice().reverse().map((entry: any, i: number) => (
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

           <TabsContent value="reports" className="animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                 <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-[2rem] md:rounded-[2.5rem] border-none shadow-sm p-6 md:p-10 bg-white">
                       <CardTitle className="text-lg md:text-xl font-headline font-bold flex items-center gap-3 mb-6"><Gavel className="w-6 h-6 text-accent" /> Findings Terminal</CardTitle>
                       <TooltipProvider>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                            {REPORT_TEMPLATES.map((report) => {
                               const guidance = REPORT_GUIDANCE[report.id];
                               return (
                                  <Tooltip key={report.id}>
                                     <TooltipTrigger asChild>
                                        <button
                                          onClick={() => setSelectedReportType(report.id)}
                                          className={cn(
                                            "p-3 md:p-4 rounded-xl border-2 text-left transition-all text-[10px] md:text-xs font-bold leading-tight flex items-center justify-between",
                                            selectedReportType === report.id ? "bg-accent/10 border-accent text-primary" : "bg-white border-slate-50 hover:border-slate-200"
                                          )}
                                        >
                                          {report.label}
                                          {selectedReportType === report.id && <CheckCircle2 className="w-4 h-4 text-accent" />}
                                        </button>
                                     </TooltipTrigger>
                                     <TooltipContent className="max-w-md p-6 bg-slate-900 text-white border-none rounded-3xl shadow-2xl z-[1000000] overflow-y-auto max-h-[60vh] scroll-smooth custom-scrollbar">
                                        <div className="space-y-6">
                                          <div className="border-b border-white/10 pb-3">
                                            <p className="font-headline font-bold text-accent text-lg leading-tight">{report.label}</p>
                                          </div>
                                          
                                          <div className="space-y-4 text-[11px] leading-relaxed">
                                            <div>
                                              <p className="font-black text-white uppercase tracking-widest text-[9px] mb-1 flex items-center gap-2">
                                                <Target className="w-3 h-3 text-accent" /> Objective & Purpose
                                              </p>
                                              <p className="text-slate-300 italic whitespace-pre-line">"{guidance?.purpose}"</p>
                                            </div>

                                            <div>
                                              <p className="font-black text-white uppercase tracking-widest text-[9px] mb-1 flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-accent" /> Deployment Scenario
                                              </p>
                                              <p className="text-slate-300 whitespace-pre-line">{guidance?.useWhen}</p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 pt-2 border-t border-white/5">
                                              <div>
                                                <p className="font-black text-emerald-400 uppercase tracking-widest text-[9px] mb-1 flex items-center gap-2">
                                                  <BadgeCheck className="w-3 h-3" /> Mandatory Exhibits
                                                </p>
                                                <p className="text-slate-400 whitespace-pre-line">{guidance?.evidence}</p>
                                              </div>
                                              <div>
                                                <p className="font-black text-emerald-400 uppercase tracking-widest text-[9px] mb-1 flex items-center gap-2">
                                                  <ClipboardCheck className="w-3 h-3" /> Required Particulars
                                                </p>
                                                <p className="text-slate-400 whitespace-pre-line">{guidance?.mandatory}</p>
                                              </div>
                                            </div>

                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                              <p className="font-black text-sky-400 uppercase tracking-widest text-[9px] mb-1 flex items-center gap-2">
                                                <Sparkles className="w-3 h-3" /> Procedural Best Practices
                                              </p>
                                              <p className="text-slate-300 whitespace-pre-line">{guidance?.bestPractices}</p>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 pt-2">
                                              <div className="flex-1">
                                                <p className="font-black text-white uppercase tracking-widest text-[9px] mb-1 flex items-center gap-2">
                                                  <ArrowRight className="w-3 h-3 text-accent" /> Expected Outcome
                                                </p>
                                                <p className="text-slate-400 whitespace-pre-line">{guidance?.output}</p>
                                              </div>
                                            </div>

                                            {guidance?.warnings && (
                                              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                                                <p className="text-red-200 text-[10px] leading-tight font-medium whitespace-pre-line">{guidance.warnings}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                     </TooltipContent>
                                  </Tooltip>
                               );
                            })}
                        </div>
                       </TooltipProvider>
                    </Card>
                 </div>
                 
                 <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-3xl bg-slate-900 text-white p-6 md:p-8 relative overflow-hidden">
                       <CardTitle className="text-sm uppercase tracking-widest text-accent mb-6 flex items-center gap-2"><Settings2 className="w-4 h-4" /> Controls</CardTitle>
                       <div className="space-y-6">
                          <Button onClick={handleGenerateReport} disabled={isActionLoading} className="w-full h-12 rounded-xl bg-accent text-primary font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg shadow-accent/20">
                             {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Draft"}
                          </Button>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <Info className="w-4 h-4 text-accent mb-2" />
                             <p className="text-[10px] text-slate-400 leading-relaxed italic uppercase tracking-tighter">"Draft synthesis uses current registry metadata."</p>
                          </div>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>
        </Tabs>
        
        <div className="mt-12 md:mt-20 pt-12 md:pt-20 border-t border-slate-200">
           <InvestigationJourney complaint={caseData} />
        </div>

        <div className="mt-8 md:mt-12">
           <InvestigationTutorial />
        </div>
      </section>
      <Footer />
    </main>
  )
}
