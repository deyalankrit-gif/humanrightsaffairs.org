'use client';

import React, { useMemo } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Gavel, 
  FileText, 
  Search, 
  UserCheck, 
  ClipboardList, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Target,
  Users,
  Clock,
  Briefcase,
  AlertCircle,
  HelpCircle,
  Mail,
  MessageCircle,
  Globe,
  Landmark
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * JOURNEY_STAGES: Logical procedural stages mapped to institutional status codes.
 */
const JOURNEY_STAGES = [
  { id: 'New Complaint', label: 'Complaint Registered', icon: FileText, desc: 'Your grievance has been successfully established in the National Registry.' },
  { id: 'Under Preliminary Review', label: 'Initial Review', icon: Search, desc: 'Central Oversight Cell is performing initial vetting for case merit.' },
  { id: 'Assigned for Investigation', label: 'Officer Assignment', icon: UserCheck, desc: 'Authorized investigative personnel have been deployed for your case.' },
  { id: 'Investigation in Progress', label: 'Investigation in Progress', icon: Activity, desc: 'Active field investigation and fact-finding are currently underway.' },
  { id: 'Awaiting Documents', label: 'Document Verification', icon: ClipboardList, desc: 'Registry is performing high-fidelity verification of submitted evidence.' },
  { id: 'Under Legal Review', label: 'Authority Review', icon: ShieldCheck, desc: 'Case findings are being reviewed by the competent Legal Council.' },
  { id: 'Recommendation Submitted', label: 'Decision Preparation', icon: Gavel, desc: 'Final executive resolutions are being drafted for judicial submission.' },
  { id: 'Action Taken', label: 'Decision Issued', icon: CheckCircle2, desc: 'Official directives have been dispatched to relevant authorities.' },
  { id: 'Closed', label: 'Case Closed', icon: Lock, desc: 'Investigation concluded. Rights restoration verified.' }
];

export function InvestigationJourney({ complaint }: { complaint: any }) {
  const currentStatus = complaint?.status || 'New Complaint';
  const currentIndex = useMemo(() => JOURNEY_STAGES.findIndex(s => s.id === currentStatus), [currentStatus]);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  
  const progressPercent = Math.round(((safeIndex + 1) / JOURNEY_STAGES.length) * 100);
  const nextStep = JOURNEY_STAGES[safeIndex + 1] || null;
  const isActionRequired = currentStatus === 'Awaiting Documents';

  const completedActivities = useMemo(() => {
    return (complaint?.timeline || [])
      .filter((entry: any) => entry.type === 'status_change' || entry.type === 'assignment')
      .slice(0, 5);
  }, [complaint]);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      
      {/* SECTION HEADER */}
      <div className="text-center space-y-4">
         <div className="inline-flex p-3 bg-accent/10 rounded-2xl text-accent animate-bounce">
            <ShieldCheck className="w-8 h-8" />
         </div>
         <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary dark:text-white">
            Investigation <span className="text-accent italic">Journey</span>
         </h2>
         <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base font-medium">
            Track the complete progress of your complaint from submission to final resolution through our high-fidelity procedural roadmap.
         </p>
      </div>

      {/* CURRENT STATUS SUMMARY */}
      <div className="grid lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
               <CardContent className="p-8 md:p-12 relative z-10 space-y-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="space-y-2 text-center md:text-left">
                        <Badge className="bg-accent text-primary font-black uppercase tracking-widest text-[9px] px-4 h-6 mb-2">Live Status Node</Badge>
                        <h3 className="text-4xl md:text-5xl font-headline font-bold leading-tight drop-shadow-md">
                           {JOURNEY_STAGES[safeIndex]?.label}
                        </h3>
                        <p className="text-slate-400 text-sm italic">"{JOURNEY_STAGES[safeIndex]?.desc}"</p>
                     </div>
                     <div className="text-center md:text-right shrink-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Progress</p>
                        <p className="text-5xl font-black text-emerald-400 tabular-nums">{progressPercent}%</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Registry Handshake</span>
                        <span>Authorized Decision Node</span>
                     </div>
                     <Progress value={progressPercent} className="h-2.5 bg-white/5" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                     <div><p className="text-[8px] font-black text-slate-500 uppercase">Case Number</p><p className="font-bold text-xs truncate">{complaint.caseId || 'Pending'}</p></div>
                     <div><p className="text-[8px] font-black text-slate-500 uppercase">Priority</p><p className="font-bold text-xs text-accent">{complaint.priority || 'Medium'}</p></div>
                     <div><p className="text-[8px] font-black text-slate-500 uppercase">Filed On</p><p className="font-bold text-xs">{complaint.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}</p></div>
                     <div><p className="text-[8px] font-black text-slate-500 uppercase">Next Sync</p><p className="font-bold text-xs text-emerald-400">Within 48h</p></div>
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 p-8 flex flex-col justify-center items-center text-center group">
               <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-4 animate-pulse">
                  <Target className="w-8 h-8" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Intelligence</p>
               <h4 className="text-2xl font-headline font-bold text-primary dark:text-white">YOU ARE HERE</h4>
               <div className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-xs shadow-lg shadow-blue-600/30">
                  {currentStatus}
               </div>
            </Card>

            {isActionRequired && (
              <Card className="rounded-[2.5rem] border-none shadow-2xl bg-red-600 text-white p-8 animate-bounce">
                 <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 shrink-0 mt-1" />
                    <div>
                       <h4 className="font-black uppercase tracking-widest text-xs">Action Required</h4>
                       <p className="text-xs font-bold leading-relaxed mt-1">Please provide the missing documentation requested by the investigator.</p>
                    </div>
                 </div>
              </Card>
            )}
         </div>
      </div>

      {/* THE INVESTIGATION JOURNEY TIMELINE */}
      <div className="relative">
         <div className="hidden md:flex justify-between items-center px-4 relative mb-12">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0">
               <div 
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercent}%` }}
               />
            </div>
            {JOURNEY_STAGES.map((stage, idx) => {
               const isCompleted = idx < safeIndex;
               const isActive = idx === safeIndex;
               const isFuture = idx > safeIndex;
               return (
                  <div key={idx} className="relative z-10 flex flex-col items-center">
                     <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl border-4 border-white dark:border-slate-900",
                        isCompleted ? "bg-emerald-500 text-white" : 
                        isActive ? "bg-blue-600 text-white animate-pulsate scale-110" : 
                        "bg-slate-200 dark:bg-slate-800 text-slate-400"
                     )}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <stage.icon className="w-5 h-5" />}
                     </div>
                     <span className={cn(
                        "absolute top-full mt-4 text-[8px] font-black uppercase tracking-tighter text-center w-24",
                        isCompleted ? "text-emerald-600" : isActive ? "text-blue-600" : "text-slate-400"
                     )}>
                        {stage.label}
                     </span>
                  </div>
               )
            })}
         </div>

         {/* Mobile Vertical Timeline */}
         <div className="md:hidden space-y-6">
            {JOURNEY_STAGES.slice(0, safeIndex + 2).map((stage, idx) => {
               const isCompleted = idx < safeIndex;
               const isActive = idx === safeIndex;
               return (
                  <div key={idx} className="flex gap-4">
                     <div className="flex flex-col items-center shrink-0">
                        <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border-2 border-white",
                           isCompleted ? "bg-emerald-500 text-white" : isActive ? "bg-blue-600 text-white scale-105" : "bg-slate-200 text-slate-400"
                        )}>
                           {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <stage.icon className="w-5 h-5" />}
                        </div>
                        <div className="w-0.5 h-full bg-slate-100 min-h-[20px]"></div>
                     </div>
                     <div className="pt-1 pb-4">
                        <h4 className={cn("text-sm font-bold uppercase tracking-tight", isActive ? "text-blue-600" : "text-slate-500")}>{stage.label}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{stage.desc}</p>
                     </div>
                  </div>
               )
            })}
         </div>
      </div>

      {/* PROCEDURAL CARDS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
         
         {/* NEXT STEP */}
         {nextStep && (
           <Card className="rounded-[2.5rem] border-none shadow-xl bg-blue-600 text-white overflow-hidden relative">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-16 -mr-16"></div>
              <CardContent className="p-8 space-y-6 relative z-10">
                 <div className="flex justify-between items-start">
                    <Badge className="bg-white/10 text-white font-black uppercase text-[8px] h-5 border-none">Next Action Node</Badge>
                    <ArrowRight className="w-6 h-6 animate-float-horizontal" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-2xl font-headline font-bold">{nextStep.label}</h4>
                    <p className="text-xs text-white/80 leading-relaxed font-medium">"{nextStep.desc}"</p>
                 </div>
                 <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <Clock className="w-4 h-4 text-blue-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Est. Time: 3-5 Working Days</span>
                 </div>
              </CardContent>
           </Card>
         )}

         {/* COMPLETED CHECKLIST */}
         <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8 space-y-6">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
               <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed Activities
            </h4>
            <div className="space-y-3">
               {completedActivities.length > 0 ? completedActivities.map((act: any, i) => (
                 <div key={i} className="flex items-center gap-3 animate-in slide-in-from-left-2 transition-all">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{act.action}</span>
                 </div>
               )) : (
                 <p className="text-xs text-slate-400 italic">Processing initial registration...</p>
               )}
            </div>
         </Card>

         {/* INVESTIGATION STATS */}
         <Card className="rounded-[2.5rem] border-none shadow-sm bg-slate-50 dark:bg-slate-800/50 p-8 space-y-6">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
               <Activity className="w-4 h-4 text-accent" /> Statistics
            </h4>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Stages</p>
                  <p className="text-xl font-black text-primary dark:text-white leading-none">{safeIndex + 1} / {JOURNEY_STAGES.length}</p>
               </div>
               <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Evidence</p>
                  <p className="text-xl font-black text-emerald-600 leading-none">{(complaint.investigativeEvidence || []).length + (complaint.incidentPhotos || []).length}</p>
               </div>
            </div>
            <div className="p-4 bg-primary text-white rounded-2xl flex items-center justify-between shadow-xl shadow-primary/20">
               <span className="text-[9px] font-black uppercase tracking-widest">Expected End</span>
               <span className="text-xs font-bold text-accent">~ 18 Working Days</span>
            </div>
         </Card>
      </div>

      {/* DOCUMENT & AUTHORITY STATUS */}
      <div className="grid lg:grid-cols-2 gap-8">
         <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8">
            <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
               <CardTitle className="text-lg font-headline font-bold">Document Audit State</CardTitle>
               <FileText className="w-5 h-5 text-accent" />
            </CardHeader>
            <div className="space-y-3">
               {[
                 { label: "Identity Proof (Aadhaar)", status: "Verified" },
                 { label: "Incident Photographs", status: (complaint.incidentPhotos || []).length > 0 ? "Verified" : "Pending" },
                 { label: "Witness Statements", status: complaint.witnesses ? "Received" : "Pending" },
                 { label: "Local Authority NOC", status: "In Process" }
               ].map((doc, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl group hover:bg-slate-100 transition-colors">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{doc.label}</span>
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-black uppercase px-3 h-5 border-none",
                      doc.status === 'Verified' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                    )}>{doc.status}</Badge>
                 </div>
               ))}
            </div>
         </Card>

         <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8">
            <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
               <CardTitle className="text-lg font-headline font-bold">Current Authority</CardTitle>
               <Landmark className="w-5 h-5 text-accent" />
            </CardHeader>
            <div className="space-y-6">
               <div className="flex items-center gap-5 p-6 bg-slate-900 text-white rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-accent shrink-0"><Building2 className="w-6 h-6" /></div>
                  <div className="min-w-0">
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Lead Investigative Unit</p>
                     <p className="text-sm font-bold truncate uppercase">{complaint.stateName || 'Central'} Regional Chapter</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Responsible Cell</p>
                     <p className="text-[10px] font-bold text-primary dark:text-white uppercase leading-tight">Human Rights Oversight Cell</p>
                  </div>
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Primary Unit</p>
                     <p className="text-[10px] font-bold text-primary dark:text-white uppercase leading-tight">{complaint.districtName || 'National'} District Hub</p>
                  </div>
               </div>
            </div>
         </Card>
      </div>

      {/* IMPORTANT NOTICE & SUPPORT */}
      <div className="space-y-8">
         <Card className="rounded-[2rem] border-none bg-amber-50 dark:bg-amber-950/20 p-8 md:p-10 border-2 border-dashed border-amber-200 dark:border-amber-900/50">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-amber-600 shrink-0"><Info className="w-6 h-6" /></div>
               <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase text-amber-900 dark:text-amber-400">Institutional Notice</h4>
                  <p className="text-xs md:text-sm text-amber-800 dark:text-amber-500/80 leading-relaxed italic font-medium">
                     "Investigation timelines are subject to dynamic variables including legal complexities, jurisdictional requirements, and witness availability. The Trust is committed to a fair and exhaustive audit of every reported violation."
                  </p>
               </div>
            </div>
         </Card>

         <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="rounded-xl h-14 px-8 bg-primary text-white font-bold text-[11px] uppercase tracking-widest gap-2 shadow-xl hover:bg-secondary">
               <User className="w-4 h-4" /> Contact Lead Investigator
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl h-14 px-8 border-2 font-bold text-[11px] uppercase tracking-widest gap-2">
               <Mail className="w-4 h-4" /> Official Support Channel
            </Button>
            <Button size="lg" variant="ghost" className="h-14 px-8 text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:text-accent">
               <Globe className="w-4 h-4 mr-2" /> National Help Center
            </Button>
         </div>
      </div>

      <div className="flex flex-col items-center gap-4 opacity-30 pt-10">
         <div className="h-px w-32 bg-slate-300 dark:bg-slate-700" />
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Official Investigative Roadmap Node • HRAT INDIA</p>
      </div>
    </div>
  );
}
