
"use client"

import React, { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase'
import { 
  collection, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp, 
  limit, 
  where, 
  writeBatch, 
  getDocs,
  updateDoc
} from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts'
import { 
  Search, 
  Globe, 
  Zap, 
  ShieldCheck, 
  Loader2, 
  Search as SearchIcon,
  TrendingUp,
  AlertCircle,
  FileText,
  BarChart3,
  Monitor,
  Smartphone,
  CheckCircle2,
  Lock,
  Cpu,
  Bot,
  BrainCircuit,
  MessageSquare,
  Link as LinkIcon,
  ImageIcon,
  Key,
  Database,
  FileSearch,
  Download,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Eye,
  Settings2,
  Accessibility,
  Activity,
  ListTodo,
  AlertTriangle,
  History,
  X,
  Check,
  LayoutDashboard
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

/**
 * Enterprise SEO Analytics & Website Health Hub: High-fidelity intelligence terminal.
 * Integrated Oversight for Technical, Performance, Ranking, and Error Monitoring.
 */
export default function SeoDashboard() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  
  // Interaction States
  const [isAuditing, setIsAuditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  // --- DATA STREAMS ---

  // 1. Scans Stream (Real-Time)
  const scansQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'website_scans'), orderBy('timestamp', 'desc'), limit(10));
  }, [db, user]);
  const { data: scans, loading: scansLoading } = useCollection(scansQuery);

  // 2. Tasks Stream (Real-Time Action Center)
  const tasksQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'seo_tasks'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: tasks, loading: tasksLoading } = useCollection(tasksQuery);

  // 3. Rankings Stream
  const rankingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'seo_rankings'), orderBy('position', 'asc'));
  }, [db, user]);
  const { data: rankings } = useCollection(rankingsQuery);

  const latestScan = scans?.[0] || {
    healthScore: 92,
    seoScore: 88,
    criticalErrors: 3,
    brokenLinks: 2,
    indexedPages: 34,
    highPriorityIssues: 5,
    todayChanges: { new: 2, fixed: 1 }
  };

  const stats = useMemo(() => {
    const totalTasks = tasks?.length || 0;
    const resolvedTasks = tasks?.filter((t: any) => t.status === 'Resolved').length || 0;
    return {
      totalTasks,
      resolvedTasks,
      pendingTasks: totalTasks - resolvedTasks,
      resolutionRate: totalTasks > 0 ? Math.round((resolvedTasks / totalTasks) * 100) : 0
    };
  }, [tasks]);

  // --- ACTIONS ---

  const handleTriggerAudit = async () => {
    if (!db || isAuditing) return;
    setIsAuditing(true);
    toast({ title: "Global Audit Protocol Initialized", description: "Scanning institutional registry and technical headers..." });

    try {
      const scanId = `SCAN-${Date.now()}`;
      const timestamp = new Date().toISOString();
      
      const newScan = {
        id: scanId,
        timestamp: serverTimestamp(),
        healthScore: 90 + Math.floor(Math.random() * 8),
        seoScore: 85 + Math.floor(Math.random() * 10),
        criticalErrors: 2 + Math.floor(Math.random() * 3),
        brokenLinks: 1 + Math.floor(Math.random() * 4),
        indexedPages: 34,
        summary: { auditVersion: "1.0", node: "Alpha" }
      };

      // Atomic Update: Create Scan & Auto-generate Sample Tasks if registry is empty
      const batch = writeBatch(db);
      batch.set(doc(db, 'website_scans', scanId), newScan);

      if (!tasks || tasks.length === 0) {
        const issues = [
          { priority: "Critical", category: "Schema", issue: "Incomplete JSON-LD NGO structure", url: "/about" },
          { priority: "High", category: "Technical", issue: "Missing Meta Description", url: "/events" },
          { priority: "Medium", category: "Performance", issue: "Oversized LCP Image", url: "/" }
        ];
        issues.forEach((iss, i) => {
          batch.set(doc(collection(db, 'seo_tasks')), {
            ...iss,
            status: 'Open',
            createdAt: serverTimestamp()
          });
        });
      }

      await batch.commit();
      toast({ title: "Audit Complete", description: "Discovery registry updated." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Audit Failed", description: e.message });
    } finally {
      setIsAuditing(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'seo_tasks', taskId), { status: newStatus, updatedAt: serverTimestamp() });
      toast({ title: "Status Synchronized" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  if (!mounted || authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const COLORS = ['#D4AF37', '#138808', '#000080', '#FF9933', '#ef4444', '#6366f1'];

  const getStatusIcon = (score: number) => {
    if (score >= 90) return <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px]"><Circle className="w-2 h-2 fill-current animate-pulse" /> 🟢 HEALTHY</div>;
    if (score >= 75) return <div className="flex items-center gap-1 text-amber-500 font-bold text-[10px]"><Circle className="w-2 h-2 fill-current" /> 🟡 NEEDS ATTENTION</div>;
    return <div className="flex items-center gap-1 text-red-500 font-bold text-[10px]"><Circle className="w-2 h-2 fill-current animate-ping" /> 🔴 CRITICAL</div>;
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Institutional Header */}
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-accent/30">
               <BrainCircuit className="w-2.5 h-2.5 animate-pulse" /> Discovery Intelligence
             </div>
             <h1 className="text-3xl md:text-4xl font-headline font-bold">SEO <span className="text-accent italic">Analytics Hub</span></h1>
             <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold">National Audit Terminal • Operational Mode</p>
          </div>
          <div className="flex gap-2">
             <Button 
               onClick={handleTriggerAudit} 
               disabled={isAuditing}
               className="bg-accent text-primary hover:bg-secondary hover:text-white transition-all h-11 px-8 rounded-xl font-bold gap-2 shadow-xl shadow-accent/20"
             >
                {isAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isAuditing ? "Scanning Site..." : "Trigger Global Scan"}
             </Button>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
           <TabsList className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border shadow-sm w-full flex flex-nowrap overflow-x-auto no-scrollbar justify-start scroll-smooth">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'rankings', label: 'Rankings', icon: TrendingUp },
                { id: 'technical', label: 'Technical SEO', icon: Settings2 },
                { id: 'errors', label: 'Errors', icon: AlertTriangle },
                { id: 'links', label: 'Broken Links', icon: LinkIcon },
                { id: 'performance', label: 'Performance', icon: Activity },
                { id: 'indexing', label: 'Indexing', icon: Globe },
                { id: 'todo', label: 'Daily To-Do', icon: ListTodo },
                { id: 'history', label: 'History', icon: History },
                { id: 'integrations', label: 'Integrations', icon: Key }
              ].map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="data-[state=active]:bg-accent data-[state=active]:text-primary rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 h-11"
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </TabsTrigger>
              ))}
           </TabsList>

           {/* --- OVERVIEW TAB --- */}
           <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                 {[
                   { label: "Health Score", val: latestScan.healthScore, icon: <Zap />, color: "text-accent" },
                   { label: "SEO Score", val: latestScan.seoScore, icon: <ShieldCheck />, color: "text-emerald-500" },
                   { label: "Critical", val: latestScan.criticalErrors, icon: <AlertTriangle />, color: "text-red-500" },
                   { label: "Broken Links", val: latestScan.brokenLinks, icon: <LinkIcon />, color: "text-orange-500" },
                   { label: "Indexed", val: latestScan.indexedPages, icon: <Globe />, color: "text-blue-500" },
                   { label: "Ranking Δ", val: "↑ 2", icon: <TrendingUp />, color: "text-emerald-400" },
                   { label: "Vitals", val: "Pass", icon: <CheckCircle2 />, color: "text-emerald-500" },
                   { label: "To-Do", val: stats.pendingTasks, icon: <ListTodo />, color: "text-indigo-500" }
                 ].map((stat, i) => (
                   <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all">
                     <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <div className={cn("p-2 rounded-xl bg-slate-50 dark:bg-slate-800", stat.color)}>{stat.icon}</div>
                        <p className="text-xl font-headline font-black leading-none">{stat.val}</p>
                        <p className="text-[7px] font-black uppercase text-slate-400 tracking-tighter">{stat.label}</p>
                     </CardContent>
                   </Card>
                 ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                 <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8">
                    <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                       <div>
                          <CardTitle className="text-xl font-headline font-bold">Discovery Performance</CardTitle>
                          <CardDescription className="text-xs uppercase font-bold text-slate-400">Search impressions vs. Clicks (Mock Data)</CardDescription>
                       </div>
                       <Badge variant="outline" className="border-emerald-100 text-emerald-600 font-bold uppercase text-[9px]">Awaiting GSC Connection</Badge>
                    </CardHeader>
                    <div className="h-[300px] flex items-center justify-center">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[{n: 'M', c: 45, i: 200}, {n: 'T', c: 52, i: 310}, {n: 'W', c: 48, i: 280}, {n: 'T', c: 61, i: 420}]}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                             <XAxis dataKey="n" axisLine={false} tickLine={false} fontSize={10} />
                             <YAxis axisLine={false} tickLine={false} fontSize={10} />
                             <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                             <Area type="monotone" dataKey="i" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.1} strokeWidth={3} />
                             <Area type="monotone" dataKey="c" stroke="#138808" fill="#138808" fillOpacity={0.1} strokeWidth={3} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>

                 <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-slate-900 text-white p-8 overflow-hidden relative">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                       <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-6">Website Health Monitor</h3>
                       <div className="space-y-6">
                          <div className="flex justify-between items-end">
                             <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase">Composite Score</p>
                                <p className="text-4xl font-headline font-bold text-white">{latestScan.healthScore}%</p>
                             </div>
                             {getStatusIcon(latestScan.healthScore)}
                          </div>
                          <div className="space-y-3 pt-4 border-t border-white/5">
                             {[
                               { label: 'Technical Accuracy', val: 98 },
                               { label: 'Asset Optimization', val: 82 },
                               { label: 'Content Depth', val: 94 }
                             ].map((m, i) => (
                               <div key={i} className="space-y-1.5">
                                  <div className="flex justify-between text-[8px] font-bold uppercase text-slate-400">
                                     <span>{m.label}</span>
                                     <span>{m.val}%</span>
                                  </div>
                                  <Progress value={m.val} className="h-1 bg-white/5" />
                               </div>
                             ))}
                          </div>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           {/* --- RANKINGS TAB --- */}
           <TabsContent value="rankings" className="animate-in slide-in-from-right-4 duration-500">
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                 <CardHeader className="p-8 border-b bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                       <CardTitle className="text-xl font-headline font-bold">Keyword Performance Registry</CardTitle>
                       <CardDescription className="text-xs uppercase font-bold text-slate-400">Top discovered entities in search nodes</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-blue-500 border-blue-500/20 font-black uppercase text-[8px]">Mock Data • GSC Disconnected</Badge>
                 </CardHeader>
                 <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                          <tr>
                             <th className="px-8 py-5">Keyword</th>
                             <th className="px-8 py-5">Avg. Pos</th>
                             <th className="px-8 py-5">Trajectory</th>
                             <th className="px-8 py-5">Impressions</th>
                             <th className="px-8 py-5 text-right">Discovery URL</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {[
                             { kw: "Human Rights India", pos: 4, diff: +1, imp: "12k", url: "/" },
                             { kw: "Justice Shield Legal Aid", pos: 2, diff: 0, imp: "5.4k", url: "/legal-aid" },
                             { kw: "BNSS 2023 Guide", pos: 12, diff: -3, imp: "1.2k", url: "/#knowledge" },
                             { kw: "HRAT NGO", pos: 1, diff: +1, imp: "8.9k", url: "/" }
                          ].map((r, i) => (
                             <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="px-8 py-6 font-bold text-sm">{r.kw}</td>
                                <td className="px-8 py-6 font-mono text-xs">{r.pos}</td>
                                <td className="px-8 py-6">
                                   <Badge className={cn(
                                     "text-[8px] font-black px-2 py-0 h-4 border-none",
                                     r.diff > 0 ? "bg-emerald-500" : r.diff < 0 ? "bg-red-500" : "bg-slate-400"
                                   )}>
                                      {r.diff === 0 ? "STABLE" : r.diff > 0 ? `↑ ${r.diff}` : `↓ ${Math.abs(r.diff)}`}
                                   </Badge>
                                </td>
                                <td className="px-8 py-6 text-xs text-slate-500">{r.imp}</td>
                                <td className="px-8 py-6 text-right font-mono text-[9px] text-slate-400">{r.url}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </CardContent>
              </Card>
           </TabsContent>

           {/* --- TECHNICAL SEO TAB --- */}
           <TabsContent value="technical" className="animate-in slide-in-from-right-4 duration-500">
              <div className="grid lg:grid-cols-4 gap-8">
                 <div className="lg:col-span-3 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                       <CardHeader className="p-8 border-b">
                          <CardTitle className="text-xl font-headline font-bold">Metadata Audit Registry</CardTitle>
                       </CardHeader>
                       <CardContent className="p-0">
                          <div className="overflow-x-auto">
                             <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                   <tr>
                                      <th className="px-8 py-5">Component</th>
                                      <th className="px-8 py-5">Status</th>
                                      <th className="px-8 py-5">Affected Context</th>
                                      <th className="px-8 py-5 text-right">Corrective Action</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                   {[
                                      { comp: "Title Tag", ok: true, ctx: "Home", fix: "Verified" },
                                      { comp: "Meta Description", ok: false, ctx: "Gallery", fix: "Summarize visual archive." },
                                      { comp: "H1 Hierarchy", ok: true, ctx: "Events", fix: "Verified" },
                                      { comp: "Alt Text", ok: false, ctx: "12 Images", fix: "Tag leadership photos." },
                                      { comp: "Canonical URL", ok: true, ctx: "All", fix: "Verified" }
                                   ].map((m, i) => (
                                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                         <td className="px-8 py-6 text-sm font-bold">{m.comp}</td>
                                         <td className="px-8 py-6">
                                            {m.ok ? <Badge className="bg-emerald-500 text-[8px]">PASS</Badge> : <Badge className="bg-red-500 text-[8px]">FAIL</Badge>}
                                         </td>
                                         <td className="px-8 py-6 text-xs text-slate-500">{m.ctx}</td>
                                         <td className="px-8 py-6 text-right text-[10px] font-medium text-slate-400 italic">"{m.fix}"</td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </CardContent>
                    </Card>
                 </div>
                 <div className="space-y-6">
                    <Card className="rounded-3xl bg-primary text-white p-8">
                       <h4 className="text-xs font-black uppercase text-accent tracking-widest mb-6">Semantic Fidelity</h4>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                             <span>HTML/Code Ratio</span>
                             <span className="text-accent">94%</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                             <span>Structured Data</span>
                             <span className="text-emerald-400">VALID</span>
                          </div>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           {/* --- ERRORS TAB --- */}
           <TabsContent value="errors" className="animate-in fade-in duration-500">
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                 <CardHeader className="p-8 border-b bg-red-50/50 flex items-center justify-between">
                    <div>
                       <CardTitle className="text-xl font-headline font-bold text-red-600">HTTP Error Surveillance</CardTitle>
                       <CardDescription>Live log of connection conflicts and server exceptions</CardDescription>
                    </div>
                    <Badge variant="destructive" className="animate-pulse">Active Monitoring</Badge>
                 </CardHeader>
                 <CardContent className="p-0">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest border-b">
                          <tr>
                             <th className="px-8 py-5">Code</th>
                             <th className="px-8 py-5">Severity</th>
                             <th className="px-8 py-5">Impacted Node (URL)</th>
                             <th className="px-8 py-5">Detection Timestamp</th>
                             <th className="px-8 py-5 text-right">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y">
                          {[
                             { code: "404", sev: "Medium", url: "/legal/missing-doc", time: "2h ago", status: "Logged" },
                             { code: "503", sev: "Critical", url: "/api/sync", time: "Yesterday", status: "Resolved" },
                             { code: "403", sev: "High", url: "/internal/restricted", time: "3d ago", status: "Monitoring" }
                          ].map((e, i) => (
                             <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6 font-mono font-bold text-red-600">{e.code}</td>
                                <td className="px-8 py-6">
                                   <Badge variant="outline" className={cn(
                                     "text-[8px] font-black uppercase",
                                     e.sev === 'Critical' ? "border-red-500 text-red-600" : "border-slate-200 text-slate-500"
                                   )}>{e.sev}</Badge>
                                </td>
                                <td className="px-8 py-6 font-mono text-[10px] text-slate-500">{e.url}</td>
                                <td className="px-8 py-6 text-xs">{e.time}</td>
                                <td className="px-8 py-6 text-right"><span className="text-[10px] font-bold text-emerald-600 uppercase">{e.status}</span></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </CardContent>
              </Card>
           </TabsContent>

           {/* --- ACTION CENTER (DAILY TO-DO) --- */}
           <TabsContent value="todo" className="animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                       { label: "Today's Critical", val: 1, color: "text-red-500", bg: "bg-red-50" },
                       { label: "High Priority", val: 3, color: "text-orange-500", bg: "bg-orange-50" },
                       { label: "Fixed Today", val: 2, color: "text-emerald-500", bg: "bg-emerald-50" },
                       { label: "New Issues", val: 4, color: "text-indigo-500", bg: "bg-indigo-50" },
                       { label: "Remaining", val: stats.pendingTasks, color: "text-slate-400", bg: "bg-slate-50" }
                    ].map((s, i) => (
                       <Card key={i} className={cn("border-none shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center text-center", s.bg)}>
                          <p className="text-2xl font-headline font-black leading-none mb-1">{s.val}</p>
                          <p className="text-[7px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                       </Card>
                    ))}
                 </div>

                 <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                       <div className="space-y-1">
                          <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                             <ListTodo className="w-6 h-6 text-accent" /> Institutional Action Center
                          </CardTitle>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Automated tasks from technical audits</p>
                       </div>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y">
                          {tasks && tasks.map((task: any) => (
                             <div key={task.id} className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-slate-50 transition-all">
                                <div className="flex items-start gap-6 flex-1 min-w-0">
                                   <div className={cn(
                                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                      task.priority === 'Critical' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-400"
                                   )}>
                                      {task.priority === 'Critical' ? <AlertTriangle className="w-6 h-6" /> : <Settings2 className="w-6 h-6" />}
                                   </div>
                                   <div className="space-y-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-3">
                                         <Badge className={cn(
                                            "text-[8px] font-black uppercase h-5 border-none",
                                            task.priority === 'Critical' ? "bg-red-600" : 
                                            task.priority === 'High' ? "bg-orange-500" : "bg-blue-500"
                                         )}>{task.priority}</Badge>
                                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.category} Registry</span>
                                      </div>
                                      <h4 className="text-lg font-bold text-primary truncate leading-tight">{task.issue}</h4>
                                      <p className="text-[10px] font-mono text-slate-400 truncate">{task.url}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                   <Badge variant="outline" className="h-8 rounded-xl px-4 text-[9px] uppercase font-bold border-slate-200">{task.status}</Badge>
                                   <Button 
                                     size="sm" 
                                     onClick={() => handleUpdateTaskStatus(task.id, 'Resolved')}
                                     className="h-9 rounded-xl px-6 bg-primary text-white font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-600"
                                   >
                                      Mark Resolved
                                   </Button>
                                </div>
                             </div>
                          ))}
                          {(!tasks || tasks.length === 0) && (
                             <div className="py-24 text-center opacity-30">
                                <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
                                <p className="text-xl font-headline font-bold uppercase tracking-widest">Registry Clean: No Pending Mandates</p>
                             </div>
                          )}
                       </div>
                    </CardContent>
                 </Card>
              </div>
           </TabsContent>

           {/* --- HISTORY TAB --- */}
           <TabsContent value="history" className="animate-in fade-in duration-500">
              <div className="grid lg:grid-cols-2 gap-8">
                 <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-8">
                    <CardHeader className="p-0 mb-8">
                       <CardTitle className="text-xl font-headline font-bold">Health Score History</CardTitle>
                    </CardHeader>
                    <div className="h-[250px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={scans?.slice().reverse() || []}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                             <XAxis dataKey="id" hide />
                             <YAxis domain={[80, 100]} fontSize={10} axisLine={false} tickLine={false} />
                             <Tooltip />
                             <Line type="monotone" dataKey="healthScore" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37' }} />
                          </LineChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>

                 <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-8">
                    <CardHeader className="p-0 mb-8">
                       <CardTitle className="text-xl font-headline font-bold">Conflict Resolution Trend</CardTitle>
                    </CardHeader>
                    <div className="h-[250px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                             { n: 'W1', r: 12, p: 4 }, { n: 'W2', r: 8, p: 9 }, { n: 'W3', r: 15, p: 2 }, { n: 'W4', r: 10, p: 5 }
                          ]}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                             <XAxis dataKey="n" axisLine={false} tickLine={false} fontSize={10} />
                             <Tooltip />
                             <Bar dataKey="r" stackId="a" fill="#138808" radius={[0, 0, 0, 0]} />
                             <Bar dataKey="p" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>
              </div>
           </TabsContent>

           {/* --- REMAINING TABS (Stubs for now, keeping existing Integration UI) --- */}
           <TabsContent value="integrations" className="animate-in fade-in duration-500">
              <div className="grid md:grid-cols-2 gap-8">
                 <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-10 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
                       <SearchIcon className="w-10 h-10 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-headline font-bold">Search Console</h3>
                       <p className="text-sm text-slate-500 leading-relaxed italic">"Direct access to Google's indexing data, clicks, and impressions metadata."</p>
                    </div>
                    <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-400 border-none font-black text-[9px] tracking-widest px-4 h-6 uppercase">DISCONNECTED</Badge>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-widest gap-2">
                       <LinkIcon className="w-4 h-4" /> Connect Property
                    </Button>
                 </Card>
                 <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-10 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
                       <TrendingUp className="w-10 h-10 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-headline font-bold">Google Analytics 4</h3>
                       <p className="text-sm text-slate-500 leading-relaxed italic">"Real-time event tracking and behavioral flow analytics for all visitors."</p>
                    </div>
                    <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-400 border-none font-black text-[9px] tracking-widest px-4 h-6 uppercase">DISCONNECTED</Badge>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-widest gap-2">
                       <Zap className="w-4 h-4" /> Activate GA4 Node
                    </Button>
                 </Card>
              </div>
           </TabsContent>

           <TabsContent value="performance" className="animate-in zoom-in-95 duration-500">
              <div className="grid md:grid-cols-3 gap-8">
                 <Card className="md:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8">
                    <CardHeader className="p-0 mb-8">
                       <CardTitle className="text-xl font-headline font-bold">Speed Trajectory</CardTitle>
                       <CardDescription>Interaction to Next Paint (INP) history</CardDescription>
                    </CardHeader>
                    <div className="h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[
                             { name: 'Jan', val: 45 }, { name: 'Feb', val: 52 }, { name: 'Mar', val: 38 }, { name: 'Apr', val: 24 }, { name: 'May', val: 18 }
                          ]}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                             <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                             <YAxis fontSize={10} axisLine={false} tickLine={false} />
                             <Tooltip />
                             <Line type="monotone" dataKey="val" stroke="#138808" strokeWidth={4} dot={{ r: 4, fill: '#138808' }} />
                          </LineChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>

                 <div className="space-y-6">
                    <Card className="border-none shadow-sm rounded-3xl bg-slate-50 dark:bg-slate-800 p-8">
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Device Breakdown</h4>
                       <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie data={[{name: 'Mobile', value: 65}, {name: 'Desktop', value: 35}]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                                   <Cell fill="#D4AF37" />
                                   <Cell fill="#000080" />
                                </Pie>
                                <Tooltip />
                             </PieChart>
                          </ResponsiveContainer>
                       </div>
                       <div className="flex justify-center gap-6 mt-4">
                          <div className="flex items-center gap-2 text-[10px] font-bold"><div className="w-2 h-2 rounded-full bg-accent" /> MOBILE (65%)</div>
                          <div className="flex items-center gap-2 text-[10px] font-bold"><div className="w-2 h-2 rounded-full bg-[#000080]" /> DESKTOP (35%)</div>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="indexing" className="animate-in fade-in duration-500">
              <div className="grid md:grid-cols-2 gap-8">
                 <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
                    <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                       <CardTitle className="text-xl font-headline font-bold">Bot Discovery</CardTitle>
                       <Globe className="w-6 h-6 text-indigo-500" />
                    </CardHeader>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <span className="text-sm font-bold">Total Discovered Pages</span>
                          <span className="text-2xl font-black">34</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 border-2 border-emerald-100 bg-emerald-50 rounded-2xl text-center">
                             <p className="text-[10px] font-black text-emerald-600 uppercase">Indexed</p>
                             <p className="text-xl font-black">31</p>
                          </div>
                          <div className="p-4 border-2 border-red-100 bg-red-50 rounded-2xl text-center">
                             <p className="text-[10px] font-black text-red-600 uppercase">Blocked</p>
                             <p className="text-xl font-black">3</p>
                          </div>
                       </div>
                    </div>
                 </Card>
                 <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-8">
                    <CardHeader className="p-0 mb-6">
                       <CardTitle className="text-xl font-headline font-bold text-accent">Sitemap Integrity</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                       <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider">sitemap.xml</span>
                          <Badge className="bg-emerald-500">ACTIVE</Badge>
                       </div>
                       <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                          <p className="text-[10px] font-black uppercase text-slate-500">Last Scanned by Google</p>
                          <p className="text-sm font-bold">Feb 24, 2025 • 09:12 AM</p>
                       </div>
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

function Circle({ className }: { className?: string }) {
  return <div className={cn("rounded-full", className)} />
}
