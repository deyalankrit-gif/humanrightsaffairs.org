"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase'
import { doc, updateDoc, serverTimestamp, arrayUnion, collection, query, orderBy, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore'
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
  Link as LinkIcon,
  Check,
  Settings2,
  Lock,
  ChevronRight
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
import { CASE_STATUSES, CASE_PRIORITIES, REPORT_TEMPLATES, REPORT_GUIDANCE, TASK_STATUSES, STANDARD_RESPONSIBILITIES } from '@/lib/complaint-constants'
import { getStatusColor } from '@/lib/complaint-utils'
import { sendTimelineEmailUpdate, sendReportEmail } from '@/lib/notification-service'
import { InvestigationJourney } from '@/components/investigation-journey'
import Link from 'next/link'
import Image from 'next/image'

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
  
  // Investigation Team States
  const [isAssigningOfficer, setIsAssigningOfficer] = useState(false)
  const [teamSearch, setTeamSearch] = useState('')
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  
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

  const filteredRegistry = useMemo(() => {
    if (!registryOfficers) return [];
    return registryOfficers.filter((o: any) => 
      o.name.toLowerCase().includes(teamSearch.toLowerCase()) || 
      o.employeeId.toLowerCase().includes(teamSearch.toLowerCase())
    );
  }, [registryOfficers, teamSearch]);

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com';

  useEffect(() => {
    if (caseData) {
      if (caseData.investigationTeam) setTeamMembers(caseData.investigationTeam);
      if (caseData.mandate) setMandate(prev => ({ ...prev, ...caseData.mandate }));
    }
  }, [caseData]);

  // --- ACTIONS ---

  const handleAddMember = async (officer: any) => {
    if (!docRef || !user) return;
    
    if (teamMembers.some(m => m.investigatorId === officer.employeeId)) {
      toast({ variant: "destructive", title: "Already Assigned", description: "Officer is already in the case team." });
      return;
    }

    setIsActionLoading(true);
    const newMember = {
      investigatorId: officer.employeeId,
      investigatorName: officer.name,
      designation: officer.designation,
      email: officer.email,
      phone: officer.phone || '',
      responsibilities: [],
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
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          action: "Investigator Provisioned",
          user: user.email,
          timestamp: new Date().toISOString(),
          remark: `Assigned Officer ${officer.name} (${officer.employeeId}) to the case team.`,
          type: 'assignment'
        })
      });
      toast({ title: "Personnel Assigned", description: `${officer.name} is now part of the task force.` });
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
          remark: `Modified responsibilities/status for ${updatedTeam[index].investigatorName}.`,
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

  const handleRemoveMember = async (index: number) => {
    if (!docRef || !user || !caseData) return;
    setIsActionLoading(true);

    const removedMember = teamMembers[index];
    const updatedTeam = teamMembers.filter((_, i) => i !== index);

    try {
      await updateDoc(docRef, { 
        investigationTeam: updatedTeam,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          action: "Clearance Revoked",
          user: user.email,
          timestamp: new Date().toISOString(),
          remark: `Removed ${removedMember.investigatorName} from the investigation team.`,
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
      await updateDoc(docRef, { 
        timeline: arrayUnion({
          action: "Investigative Remark",
          user: user.email,
          timestamp: new Date().toISOString(),
          remark: remark.trim(),
          type: 'remark'
        }),
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
      toast({ title: "Mandate Dispatched", description: "Instructions pushed to assigned investigators." });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
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
                 <Select onValueChange={handleUpdateStatus} value={caseData.status}>
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
                   <h1 className="text-xl md:text-3xl font-headline font-bold">{caseData.caseId || 'DOCKET-ENTRY'}</h1>
                   <Badge className={cn("text-[9px] font-black uppercase h-5", getStatusColor(caseData.status))}>{caseData.status}</Badge>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                   <Hash className="w-3.5 h-3.5 text-accent" /> Token: {caseData.token}
                </p>
              </div>
           </div>
           
           <div className="flex items-center gap-3 order-1 md:order-2">
              <Button onClick={() => setActiveTab('reports')} className="bg-accent text-primary font-bold h-11 px-8 rounded-xl shadow-xl hover:bg-secondary hover:text-white transition-all">
                <Gavel className="w-4 h-4 mr-2" /> Commission Findings
              </Button>
              <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-11 rounded-xl font-bold text-[10px] uppercase tracking-widest">
                <Link href={`/internal/public-complaints/analytics`}><Activity className="w-4 h-4 mr-2" /> Analytics</Link>
              </Button>
              {isRoot && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="h-11 px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-red-600 hover:bg-red-700 shadow-xl shadow-red-900/40">
                      <Trash2 className="w-4 h-4 mr-2" /> Purge Case
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[2.5rem]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>Are you sure you want to delete this item? This action may be irreversible. Please confirm before continuing.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {}} className="bg-red-600 hover:bg-red-700 rounded-xl">Confirm Deletion</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
           </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
           <TabsList className="bg-white p-1 rounded-2xl border shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar justify-start">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'team', label: 'Investigation Team', icon: Users },
                { id: 'mandate', label: 'Mission Mandate', icon: Target },
                { id: 'timeline', label: 'Audit Trail', icon: History },
                { id: 'evidence', label: 'Evidence Vault', icon: ShieldCheck },
                { id: 'reports', label: 'Commission Findings', icon: Gavel }
              ].map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-accent data-[state=active]:text-primary rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all">
                  <tab.icon className="w-3.5 h-3.5 mr-2" /> {tab.label}
                </TabsTrigger>
              ))}
           </TabsList>

           <TabsContent value="overview" className="animate-in fade-in duration-500">
              <div className="grid lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-sm p-10 bg-white">
                       <h3 className="text-xl font-headline font-bold text-primary mb-6 flex items-center gap-3"><FileText className="w-6 h-6 text-accent" /> Violation Narrative</h3>
                       <div className="p-8 bg-slate-50 rounded-[2rem] border italic text-slate-600 leading-relaxed">
                          "{caseData.description}"
                       </div>
                    </Card>
                 </div>
                 <div className="space-y-8">
                    <Card className="rounded-3xl bg-slate-900 text-white p-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                       <CardTitle className="text-base text-accent mb-6 flex items-center gap-2"><UserCheck className="w-4 h-4" /> Complainant</CardTitle>
                       <div className="space-y-4">
                          <p className="font-bold text-lg">{caseData.fullName}</p>
                          <div className="space-y-2 text-xs text-slate-400">
                             <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-accent" /> {caseData.phone}</div>
                             <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-accent" /> {caseData.email || 'N/A'}</div>
                             <div className="flex items-start gap-2"><MapPin className="w-3 h-3 text-accent mt-1" /> <span>{caseData.address}</span></div>
                          </div>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="team" className="animate-in slide-in-from-right-4 duration-500">
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                 <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
                       <CardHeader className="p-0 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                             <CardTitle className="text-xl font-headline font-bold flex items-center gap-3"><Users className="w-6 h-6 text-accent" /> Team Deployment</CardTitle>
                             <CardDescription>Authorized officials assigned to lead field investigations.</CardDescription>
                          </div>
                          <Dialog open={isAssigningOfficer} onOpenChange={setIsAssigningOfficer}>
                             <DialogTrigger asChild>
                                <Button className="bg-primary text-white rounded-xl h-10 px-6 gap-2"><UserPlus className="w-4 h-4" /> Assign Personnel</Button>
                             </DialogTrigger>
                             <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                                <div className="bg-slate-900 p-8 text-white relative border-b-4 border-accent/20">
                                   <DialogTitle className="text-2xl font-headline font-bold">Investigator Registry</DialogTitle>
                                   <div className="relative mt-4">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                      <Input 
                                        placeholder="Search by ID or name..." 
                                        className="pl-10 bg-white/5 border-white/10 text-white rounded-xl h-11"
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
                            <Card key={idx} className="rounded-3xl border-none shadow-sm bg-slate-50/50 p-6 md:p-8 hover:bg-white transition-all group border border-transparent hover:border-slate-100">
                               <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                  <div className="flex items-center gap-5 flex-1 min-w-0">
                                     <div className="w-14 h-14 rounded-2xl bg-white flex flex-col items-center justify-center text-accent shadow-sm shrink-0 border border-slate-100">
                                        <span className="text-[7px] font-black">REF</span>
                                        <span className="text-xs font-black">{member.investigatorId?.split('-').pop()}</span>
                                     </div>
                                     <div className="min-w-0">
                                        <h4 className="text-lg font-bold text-primary truncate leading-none mb-1">{member.investigatorName}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.designation}</p>
                                     </div>
                                  </div>

                                  <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 w-full md:w-auto">
                                     <div className="text-center md:text-right">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Assignment Progress</p>
                                        <div className="flex items-center gap-3">
                                           <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                              <div className="h-full bg-emerald-500" style={{ width: `${member.progressPercentage}%` }}></div>
                                           </div>
                                           <span className="text-xs font-black text-primary">{member.progressPercentage}%</span>
                                        </div>
                                     </div>
                                     
                                     <Dialog>
                                        <DialogTrigger asChild>
                                           <Button variant="ghost" size="sm" className="h-9 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-200 hover:bg-accent hover:text-primary transition-all">Assign Duties</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                                           <div className="bg-slate-900 p-8 text-white">
                                              <DialogTitle className="text-xl font-headline font-bold">Duty Management: {member.investigatorName}</DialogTitle>
                                              <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Assigning Tactical Responsibilities</p>
                                           </div>
                                           <div className="p-8 space-y-6">
                                              <div className="space-y-4">
                                                 <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Responsibility Matrix</Label>
                                                 <div className="grid grid-cols-2 gap-2">
                                                    {STANDARD_RESPONSIBILITIES.map((resp) => {
                                                       const isChecked = member.responsibilities?.includes(resp);
                                                       return (
                                                          <div 
                                                            key={resp} 
                                                            onClick={() => toggleResponsibility(idx, resp)}
                                                            className={cn(
                                                              "p-3 rounded-xl border-2 transition-all cursor-pointer select-none text-[10px] font-bold flex items-center gap-3",
                                                              isChecked ? "bg-accent/10 border-accent/40 text-primary" : "bg-white border-slate-100 text-slate-400"
                                                            )}
                                                          >
                                                             {isChecked ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> : <div className="w-3.5 h-3.5 rounded-full border-2" />}
                                                             {resp}
                                                          </div>
                                                       )
                                                    })}
                                                 </div>
                                              </div>
                                              <div className="space-y-2">
                                                 <Label className="text-[10px] font-black uppercase text-slate-500">Personnel Status</Label>
                                                 <Select value={member.status} onValueChange={v => handleUpdateMember(idx, { status: v })}>
                                                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="bg-white">
                                                       {['Assigned', 'Active', 'Completed', 'On Hold'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                    </SelectContent>
                                                 </Select>
                                              </div>
                                              <DialogClose asChild><Button className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-xl">Close Matrix</Button></DialogClose>
                                           </div>
                                        </DialogContent>
                                     </Dialog>

                                     <button onClick={() => handleRemoveMember(idx)} className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center shrink-0">
                                        <X className="w-5 h-5" />
                                     </button>
                                  </div>
                               </div>

                               <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                  {member.responsibilities?.map((r: string) => (
                                    <Badge key={r} variant="outline" className="bg-white dark:bg-slate-800 text-[8px] font-bold border-slate-200 py-0.5">{r}</Badge>
                                  ))}
                                  {(!member.responsibilities || member.responsibilities.length === 0) && <span className="text-[9px] text-slate-400 italic">No duties mapped yet.</span>}
                               </div>
                            </Card>
                          ))}
                          {teamMembers.length === 0 && (
                            <div className="py-24 text-center opacity-30 bg-slate-50 rounded-[2.5rem] border-4 border-dashed">
                               <Users className="w-16 h-16 mx-auto mb-4" />
                               <p className="text-sm font-black uppercase tracking-[0.3em]">No Personnel Deployed</p>
                            </div>
                          )}
                       </div>
                    </Card>
                 </div>
                 <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-3xl bg-slate-900 text-white p-8">
                       <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-6 flex items-center gap-2">
                          <History className="w-4 h-4" /> Tactical Log
                       </h3>
                       <div className="space-y-6">
                          {caseData.timeline?.filter((t: any) => t.type?.includes('assignment')).slice(0, 3).map((log: any, i: number) => (
                            <div key={i} className="space-y-1 relative pl-6 border-l-2 border-accent/30">
                               <p className="text-[10px] font-bold text-white leading-tight">{log.action}</p>
                               <p className="text-[9px] text-slate-400 italic">"{log.remark}"</p>
                               <span className="text-[7px] text-slate-500 font-black block mt-2 uppercase">{new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                          ))}
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
                       <Label className="text-[10px] font-black uppercase text-accent tracking-widest">Primary Operational Objective *</Label>
                       <Input value={mandate.objective} onChange={e => setMandate({...mandate, objective: e.target.value})} placeholder="What is the singular goal of this probe?" className="h-12 rounded-xl border-accent/20 font-bold" />
                    </div>

                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Official Instructions (Step-by-Step)</Label>
                       <Textarea value={mandate.instructions} onChange={e => setMandate({...mandate, instructions: e.target.value})} placeholder="Detailed procedural steps for the officer..." className="min-h-[150px] rounded-2xl p-6 bg-slate-50" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Required Field Actions</Label>
                          <Textarea value={mandate.requiredActions} onChange={e => setMandate({...mandate, requiredActions: e.target.value})} placeholder="Specific tasks (e.g. Visit local PS)..." className="min-h-[100px] rounded-xl" />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Evidence Requirements</Label>
                          <Textarea value={mandate.evidenceToCollect} onChange={e => setMandate({...mandate, evidenceToCollect: e.target.value})} placeholder="What must be retrieved (e.g. Video, Affidavits)..." className="min-h-[100px] rounded-xl" />
                       </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 p-6 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Official Reference Links</h4>
                       <div className="flex gap-3">
                          <Input value={newAttachment.name} onChange={e => setNewAttachment({...newAttachment, name: e.target.value})} placeholder="Label (e.g. Case Guideline PDF)" className="flex-1 rounded-xl" />
                          <Input value={newAttachment.url} onChange={e => setNewAttachment({...newAttachment, url: e.target.value})} placeholder="https://..." className="flex-1 rounded-xl" />
                          <Button onClick={() => setMandate({...mandate, attachments: [...(mandate.attachments || []), newAttachment]})} variant="outline" className="rounded-xl h-10 px-6">Append</Button>
                       </div>
                    </div>

                    <Button onClick={handleSaveMandate} disabled={isActionLoading} className="w-full h-16 bg-accent text-primary font-black uppercase tracking-widest text-lg rounded-[1.5rem] shadow-xl shadow-accent/20">
                       {isActionLoading ? <Loader2 className="animate-spin mr-2" /> : <><ShieldCheck className="w-6 h-6 mr-3" /> Authorize & Synchronize Mandate</>}
                    </Button>
                 </div>
              </Card>
           </TabsContent>

           <TabsContent value="timeline" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="rounded-[3rem] border-none shadow-sm bg-white p-8 md:p-16">
                 <div className="max-w-3xl mx-auto space-y-12">
                    {(caseData.timeline || []).length > 0 ? [...caseData.timeline].reverse().map((entry: any, idx: number) => (
                      <div key={idx} className="flex gap-8 relative group">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 text-accent shadow-sm shrink-0 relative z-10"><Clock className="w-6 h-6" /></div>
                        <div className="space-y-2 flex-1 pt-1 pb-10 border-l pl-8 border-slate-100 ml-[-38px] group-last:border-transparent">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"><h4 className="text-lg font-bold">{entry.action}</h4><span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(entry.timestamp).toLocaleString('en-IN')}</span></div>
                          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 italic text-sm text-slate-500">"{entry.remark}"</div>
                          <div className="flex items-center gap-2 pt-1"><Badge className="bg-slate-900 text-white text-[8px] font-bold">{entry.user}</Badge></div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-20 opacity-20"><History className="w-16 h-16 mx-auto mb-4" /><p className="text-sm font-black uppercase">Timeline Initializing...</p></div>
                    )}
                 </div>
              </Card>
           </TabsContent>

           <TabsContent value="evidence" className="animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {(caseData.incidentPhotos || []).map((img: string, i: number) => (
                   <Card key={i} className="rounded-3xl overflow-hidden border-none shadow-xl group cursor-zoom-in">
                      <div className="relative aspect-square"><Image src={img} alt="Evidence" fill className="object-cover group-hover:scale-110 transition-transform duration-700" /></div>
                   </Card>
                 ))}
                 <Card className="rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center space-y-4 bg-white group relative overflow-hidden">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-accent group-hover:text-white transition-all"><Plus className="w-8 h-8" /></div>
                    <div><p className="font-bold text-primary uppercase text-xs">Append Evidence</p></div>
                 </Card>
              </div>
           </TabsContent>

           <TabsContent value="reports" className="animate-in slide-in-from-right-4 duration-500">
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                 <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
                       <div className="mb-8">
                          <CardTitle className="text-xl font-headline font-bold flex items-center gap-3"><Gavel className="w-6 h-6 text-accent" /> Document Generation Hub</CardTitle>
                          <CardDescription>Select a mandated template to generate an official investigative report.</CardDescription>
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {REPORT_TEMPLATES.map((report) => {
                            const guidance = REPORT_GUIDANCE[report.id];
                            return (
                              <TooltipProvider key={report.id}>
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => setSelectedReportType(report.id)}
                                      className={cn(
                                        "p-4 rounded-2xl border-2 text-left transition-all group flex items-start justify-between",
                                        selectedReportType === report.id 
                                          ? "bg-accent/10 border-accent shadow-lg shadow-accent/5" 
                                          : "bg-white border-slate-100 hover:border-slate-200"
                                      )}
                                    >
                                      <div className="space-y-1 pr-2">
                                         <div className="flex items-center gap-2">
                                            <FileText className={cn("w-4 h-4", selectedReportType === report.id ? "text-accent" : "text-slate-400")} />
                                            <span className={cn("text-xs font-bold leading-tight", selectedReportType === report.id ? "text-primary" : "text-slate-600")}>
                                              {report.label}
                                            </span>
                                         </div>
                                         {selectedReportType === report.id && <div className="h-0.5 w-8 bg-accent rounded-full animate-in slide-in-from-left-2" />}
                                      </div>
                                      <div className={cn(
                                         "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                                         selectedReportType === report.id ? "bg-accent text-primary" : "bg-slate-50 text-slate-300 group-hover:bg-slate-100"
                                      )}>
                                         {selectedReportType === report.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                                      </div>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-[280px] p-5 bg-white dark:bg-slate-900 border-none shadow-2xl rounded-2xl space-y-4">
                                     <div className="space-y-1">
                                        <p className="text-xs font-black uppercase text-accent tracking-widest">{report.label}</p>
                                        <div className="h-0.5 w-12 bg-accent/30 rounded-full" />
                                     </div>
                                     <div className="space-y-3">
                                        <div className="space-y-1">
                                           <p className="text-[10px] font-black text-primary dark:text-white uppercase tracking-tighter">Purpose</p>
                                           <p className="text-[11px] text-slate-500 leading-relaxed italic">"{guidance.purpose}"</p>
                                        </div>
                                        <div className="space-y-1">
                                           <p className="text-[10px] font-black text-primary dark:text-white uppercase tracking-tighter">Use When</p>
                                           <p className="text-[11px] text-slate-500 leading-relaxed">"{guidance.useWhen}"</p>
                                        </div>
                                        <div className="space-y-1">
                                           <p className="text-[10px] font-black text-primary dark:text-white uppercase tracking-tighter">Includes</p>
                                           <p className="text-[11px] text-slate-500 leading-relaxed">"{guidance.includes}"</p>
                                        </div>
                                        <div className="space-y-1">
                                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Outcome</p>
                                           <p className="text-[11px] text-slate-500 leading-relaxed font-bold">"{guidance.outcome}"</p>
                                        </div>
                                     </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                       </div>
                    </Card>
                 </div>
                 
                 <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-3xl bg-slate-900 text-white p-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                       <CardTitle className="text-base text-accent mb-6 flex items-center gap-2"><Settings2 className="w-4 h-4" /> Generation Control</CardTitle>
                       <div className="space-y-6">
                          <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Selected Template</p>
                             <p className="text-sm font-bold text-white">{REPORT_TEMPLATES.find(r => r.id === selectedReportType)?.label}</p>
                          </div>
                          <Button className="w-full h-14 rounded-2xl bg-accent text-primary font-black uppercase tracking-widest text-xs hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                             Generate & Preview Report
                          </Button>
                          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                             <Info className="w-4 h-4 text-accent shrink-0" />
                             <p className="text-[10px] text-slate-400 leading-relaxed italic">"Generation creates a pre-filled draft based on the case metadata. You can further edit before final synchronization."</p>
                          </div>
                       </div>
                    </Card>
                 </div>
              </div>
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
