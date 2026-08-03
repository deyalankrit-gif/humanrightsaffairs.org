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
  MessageSquare
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const INVESTIGATION_STATUSES = [
  "Investigation Started",
  "Site Visit Scheduled",
  "Site Visit Completed",
  "Evidence Collected",
  "Witness Interview Completed",
  "Awaiting Additional Information",
  "Draft Report Ready",
  "Final Report Submitted"
]

export default function InvestigationCaseHub() {
  const { id } = useParams()
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
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
        remark: `Investigator transitioned case to ${newStatus}.`,
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
      
      toast({ title: isOfficial ? "Note Published" : "Note Archived Privately" });
      setRemark('');
    } catch (e) {
      toast({ variant: "destructive", title: "Save Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="animate-spin text-indigo-600 mx-auto" /></div>
  if (!c) return <div className="p-20 text-center font-bold text-slate-400">FILE NOT FOUND</div>

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
         <Button variant="ghost" onClick={() => router.push('/investigator/dashboard')} className="gap-2 font-bold uppercase text-[10px] tracking-widest text-slate-500 hover:text-indigo-600 transition-all">
           <ArrowLeft className="w-4 h-4" /> Back to Docket
         </Button>
         <Badge className="bg-indigo-600 text-white font-black uppercase text-[10px] px-6 h-8 rounded-full">{c.caseId}</Badge>
      </div>

      <header className="grid md:grid-cols-3 gap-6">
         <Card className="md:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white p-8">
            <div className="flex items-start justify-between">
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <h1 className="text-3xl font-headline font-bold text-primary">{c.subject}</h1>
                     {c.priority === 'High' && <Badge className="bg-red-600 animate-pulse text-[8px] font-black">CRITICAL</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" /> {c.districtName}, {c.stateName}</span>
                     <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent" /> Filed: {c.createdAt?.toDate?.()?.toLocaleDateString()}</span>
                  </div>
               </div>
            </div>
         </Card>

         <Card className="rounded-[2.5rem] border-none shadow-sm bg-indigo-600 text-white p-8">
            <p className="text-[10px] font-black uppercase text-indigo-200 tracking-widest mb-4">Current Field Status</p>
            <Select value={activeStatus} onValueChange={handleUpdateStatus}>
               <SelectTrigger className="bg-white/10 border-white/20 text-white font-bold rounded-xl h-12">
                  <SelectValue />
               </SelectTrigger>
               <SelectContent className="bg-white z-[1000000]">
                  {INVESTIGATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
               </SelectContent>
            </Select>
            <p className="text-[9px] font-medium text-indigo-100/60 mt-4 leading-relaxed italic">"Status changes are logged in the case audit trail instantly."</p>
         </Card>
      </header>

      <Tabs defaultValue="overview" className="space-y-8">
         <TabsList className="bg-white p-1 rounded-2xl border shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
            <TabsTrigger value="overview" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="evidence" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Evidence Vault</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Field Notes</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Timeline</TabsTrigger>
         </TabsList>

         <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-8">
               <Card className="rounded-[2.5rem] p-10 border-none shadow-sm bg-white">
                  <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-6 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Complainant Statement
                  </h3>
                  <p className="text-slate-600 leading-relaxed italic border-l-4 border-indigo-100 pl-6">"{c.description}"</p>
               </Card>
               <Card className="rounded-[2.5rem] p-10 border-none shadow-sm bg-white">
                  <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-6 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Accused Particulars
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{c.accusedDetails || "No specific names provided in original filing."}</p>
               </Card>
            </div>
         </TabsContent>

         <TabsContent value="evidence" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <Card className="rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center space-y-4 hover:border-indigo-600 transition-all cursor-pointer bg-white group">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                     <Plus className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-primary uppercase text-xs">Append Evidence</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">Photos, Audio or Logs</p>
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
                  <CardDescription>Official observations are visible to Administrators. Private notes are for your eyes only.</CardDescription>
               </CardHeader>
               <div className="space-y-6">
                  <Textarea 
                    value={remark} 
                    onChange={e => setRemark(e.target.value)} 
                    placeholder="Input field observation..." 
                    className="min-h-[150px] rounded-[1.5rem] p-6 bg-slate-50 border-none shadow-inner"
                  />
                  <div className="flex gap-4">
                     <Button onClick={() => handlePostNote(false)} variant="outline" className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                        <Lock className="w-3.5 h-3.5 mr-2" /> Save Private Note
                     </Button>
                     <Button onClick={() => handlePostNote(true)} className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg">
                        <Send className="w-3.5 h-3.5 mr-2" /> Publish Official Note
                     </Button>
                  </div>
               </div>
            </Card>
         </TabsContent>

         <TabsContent value="timeline" className="animate-in fade-in duration-500">
            <Card className="rounded-[2.5rem] border-none shadow-sm p-10 bg-white">
               <div className="space-y-8">
                  {(c.timeline || []).slice().reverse().map((entry: any, i: number) => (
                    <div key={i} className="flex gap-6 relative group">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 relative z-10">
                          <History className="w-5 h-5" />
                       </div>
                       <div className="flex-1 pt-1 pb-8 border-l-2 border-slate-100 pl-8 ml-[-40px] group-last:border-transparent">
                          <div className="flex justify-between items-center mb-2">
                             <h4 className="font-bold text-primary">{entry.action}</h4>
                             <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-slate-500 italic">"{entry.remark}"</p>
                          <Badge variant="outline" className="mt-3 text-[7px] font-black uppercase opacity-40">{entry.user}</Badge>
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
