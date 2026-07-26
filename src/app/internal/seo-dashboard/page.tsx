
"use client"

import React, { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Image as ImageIcon,
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
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Enterprise SEO Analytics Dashboard: High-fidelity intelligence terminal.
 * Read-only Oversight Hub for Technical, Performance, and AI Search compatibility.
 */
export default function SeoDashboard() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  if (!mounted || authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  // --- MOCK INTELLIGENCE DATA (Future ready for API integration) ---
  const seoHealth = 92;
  const coreVitals = { LCP: "1.2s", FID: "15ms", CLS: "0.01" };
  const aiReadiness = { total: 88, gemini: 94, gpt: 91, googleAI: 85 };
  
  const issueRegistry = [
    { id: 1, type: "Technical", label: "Missing Meta Description", severity: "High", pages: 2, fix: "Generate tactical summaries for all event archives." },
    { id: 2, type: "Performance", label: "Oversized Media Assets", severity: "Medium", pages: 12, fix: "Enable automated WebP compression for gallery uploads." },
    { id: 3, type: "Schema", label: "Incomplete JSON-LD", severity: "Critical", pages: 1, fix: "Define Organization ID in institutional registry." },
  ];

  const rankingTrend = [
    { date: 'Mon', pos: 12 }, { date: 'Tue', pos: 10 }, { date: 'Wed', pos: 11 }, { date: 'Thu', pos: 9 }, { date: 'Fri', pos: 8 }, { date: 'Sat', pos: 8 }, { date: 'Sun', pos: 7 }
  ];

  const COLORS = ['#D4AF37', '#138808', '#000080', '#FF9933'];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-accent/30">
                <BrainCircuit className="w-2.5 h-2.5" /> Discovery Intelligence
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">SEO <span className="text-accent italic">Analytics Hub</span></h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Read-Only Oversight Terminal v1.0</p>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2">
                 <Download className="w-3.5 h-3.5" /> CSV Export
               </Button>
               <Button className="bg-accent text-primary hover:bg-secondary hover:text-white transition-all h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 shadow-xl shadow-accent/20">
                 <RefreshCw className="w-3.5 h-3.5" /> Trigger Audit
               </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        <Tabs defaultValue="overview" className="space-y-8">
           <TabsList className="bg-white dark:bg-slate-900 p-1 rounded-2xl border shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar justify-start">
             <TabsTrigger value="overview" className="rounded-xl px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-primary">Overview</TabsTrigger>
             <TabsTrigger value="ai" className="rounded-xl px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-primary">AI Readiness</TabsTrigger>
             <TabsTrigger value="performance" className="rounded-xl px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-primary">Performance</TabsTrigger>
             <TabsTrigger value="audit" className="rounded-xl px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-primary">Technical Audit</TabsTrigger>
             <TabsTrigger value="integrations" className="rounded-xl px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-primary">Integrations</TabsTrigger>
           </TabsList>

           <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                    <CardContent className="p-6 space-y-4">
                       <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Health Score</p>
                          <Zap className="w-4 h-4 text-accent" />
                       </div>
                       <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-headline font-bold text-primary dark:text-white">{seoHealth}</span>
                          <span className="text-xs font-bold text-emerald-500">/ 100</span>
                       </div>
                       <Progress value={seoHealth} className="h-2" />
                    </CardContent>
                 </Card>

                 <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                       <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">AI Visibility</p>
                          <Bot className="w-4 h-4 text-blue-500" />
                       </div>
                       <p className="text-4xl font-headline font-bold text-primary dark:text-white">{aiReadiness.total}%</p>
                       <div className="flex gap-1">
                          <div className="h-1 flex-1 bg-blue-500 rounded-full"></div>
                          <div className="h-1 flex-1 bg-blue-500 rounded-full"></div>
                          <div className="h-1 flex-1 bg-blue-200 rounded-full"></div>
                       </div>
                    </CardContent>
                 </Card>

                 <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                       <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Web Vitals</p>
                          <Activity className="w-4 h-4 text-emerald-500" />
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-center">
                             <p className="text-[8px] font-bold text-slate-400 uppercase">LCP</p>
                             <p className="text-sm font-black text-emerald-500">{coreVitals.LCP}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-center">
                             <p className="text-[8px] font-bold text-slate-400 uppercase">CLS</p>
                             <p className="text-sm font-black text-emerald-500">{coreVitals.CLS}</p>
                          </div>
                       </div>
                    </CardContent>
                 </Card>

                 <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                       <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Index Status</p>
                          <Globe className="w-4 h-4 text-indigo-500" />
                       </div>
                       <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <div>
                             <p className="text-sm font-bold">34 URLs Indexed</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase">XML Sitemap Verified</p>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                 <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8">
                    <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                       <div>
                          <CardTitle className="text-xl font-headline font-bold">Ranking Trajectory</CardTitle>
                          <CardDescription>Primary keywords average position trend</CardDescription>
                       </div>
                       <Badge variant="outline" className="border-emerald-100 text-emerald-600 font-bold">Trending Up</Badge>
                    </CardHeader>
                    <div className="h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={rankingTrend}>
                             <defs>
                                <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                                   <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                             <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} />
                             <YAxis reversed domain={[1, 20]} axisLine={false} tickLine={false} fontSize={10} />
                             <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                             <Area type="monotone" dataKey="pos" stroke="#D4AF37" fillOpacity={1} fill="url(#colorPos)" strokeWidth={3} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>

                 <div className="space-y-6">
                    <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-8">
                       <h3 className="text-xs font-black uppercase text-accent tracking-[0.2em] mb-6 flex items-center gap-2">
                          <Settings2 className="w-4 h-4" /> Crawl Integrity
                       </h3>
                       <div className="space-y-4">
                          {[
                             { label: "Robots.txt", ok: true },
                             { label: "Sitemap.xml", ok: true },
                             { label: "SSL Certificate", ok: true },
                             { label: "HSTS Header", ok: false }
                          ].map((s, i) => (
                             <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
                                {s.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                             </div>
                          ))}
                       </div>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-8 border-l-4 border-l-accent">
                       <div className="flex flex-col items-center text-center gap-4">
                          <ShieldCheck className="w-10 h-10 text-accent animate-pulse" />
                          <div className="space-y-1">
                             <p className="text-sm font-black text-primary dark:text-white uppercase tracking-tighter">Protocol Verified</p>
                             <p className="text-[10px] text-slate-400 leading-relaxed italic">"Website structure is optimized for high-fidelity discovery by institutional search nodes."</p>
                          </div>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="ai" className="animate-in slide-in-from-right-4 duration-500">
              <div className="grid lg:grid-cols-3 gap-8">
                 <Card className="lg:col-span-1 border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 space-y-8">
                    <div className="space-y-2">
                       <CardTitle className="text-xl font-headline font-bold">LLM Discovery Score</CardTitle>
                       <p className="text-xs text-slate-500">Estimated index coverage across primary AI search models.</p>
                    </div>
                    <div className="space-y-6">
                       {[
                          { name: "Google AI Overview", score: 85, color: "bg-emerald-500" },
                          { name: "ChatGPT (SearchGPT)", score: 91, color: "bg-primary" },
                          { name: "Gemini", score: 94, color: "bg-accent" },
                          { name: "Perplexity AI", score: 78, color: "bg-indigo-500" }
                       ].map((ai, i) => (
                          <div key={i} className="space-y-2">
                             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span>{ai.name}</span>
                                <span>{ai.score}%</span>
                             </div>
                             <Progress value={ai.score} className={cn("h-1.5", ai.color)} />
                          </div>
                       ))}
                    </div>
                 </Card>

                 <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 space-y-10">
                       <div className="flex items-center gap-4">
                          <Bot className="w-10 h-10 text-accent animate-float" />
                          <div>
                             <h3 className="text-2xl font-headline font-bold">AI Search Optimization</h3>
                             <p className="text-slate-400 text-xs uppercase tracking-[0.2em] font-bold">Semantic Entity Mapping</p>
                          </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Technical Foundation</h4>
                             <ul className="space-y-3">
                                {[
                                   "Validated JSON-LD (NGO Schema)",
                                   "Semantic H1-H6 Hierarchies",
                                   "Entity-Relative Internal Linking",
                                   "Optimized NITI Aayog Reference"
                                ].map((item, idx) => (
                                   <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {item}
                                   </li>
                                ))}
                             </ul>
                          </div>
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-accent">Content Clarity</h4>
                             <ul className="space-y-3">
                                {[
                                   "Answer-Oriented Headlines",
                                   "High Content-to-Code Ratio",
                                   "Bilingual Metadata Support",
                                   "Tactical FAQ Structures"
                                ].map((item, idx) => (
                                   <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                                      <CheckCircle2 className="w-4 h-4 text-accent" /> {item}
                                   </li>
                                ))}
                             </ul>
                          </div>
                       </div>

                       <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Cpu className="w-4 h-4 text-slate-600" />
                             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">AI Search Engine Ready</span>
                          </div>
                          <Button variant="outline" className="h-9 px-6 rounded-lg text-[10px] border-white/10 text-white hover:bg-white/10">Run AI Simulation</Button>
                       </div>
                    </div>
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

           <TabsContent value="audit" className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                 <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="p-8 border-b bg-slate-50/50 dark:bg-slate-800/50">
                       <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                             <FileSearch className="w-6 h-6 text-accent" /> Tactical SEO Registry
                          </CardTitle>
                          <Badge className="bg-red-500 text-white font-black text-[9px] tracking-widest animate-pulse">3 ISSUES IDENTIFIED</Badge>
                       </div>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="overflow-x-auto">
                          <table className="w-full text-left">
                             <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                <tr>
                                   <th className="px-8 py-5">Severity</th>
                                   <th className="px-8 py-5">Identified Conflict</th>
                                   <th className="px-8 py-5">Scope</th>
                                   <th className="px-8 py-5 text-right">Corrective Action</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {issueRegistry.map((issue) => (
                                   <tr key={issue.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                      <td className="px-8 py-6">
                                         <Badge className={cn(
                                            "text-[8px] font-black uppercase tracking-tighter px-2.5 h-5 border-none",
                                            issue.severity === 'Critical' ? "bg-red-600 text-white" : 
                                            issue.severity === 'High' ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
                                         )}>
                                            {issue.severity}
                                         </Badge>
                                      </td>
                                      <td className="px-8 py-6">
                                         <p className="text-sm font-bold text-primary dark:text-white leading-tight">{issue.label}</p>
                                         <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{issue.type} Audit</p>
                                      </td>
                                      <td className="px-8 py-6">
                                         <span className="text-sm font-bold text-slate-500">{issue.pages} Pages</span>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                         <p className="text-xs font-medium text-slate-600 dark:text-slate-400 italic">"{issue.fix}"</p>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </CardContent>
                 </Card>
              </div>
           </TabsContent>

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
                    <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-400 border-none font-black text-[9px] tracking-widest px-4 h-6">WAITING FOR CONNECTION</Badge>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-widest">Connect Property</Button>
                 </Card>

                 <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-10 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
                       <TrendingUp className="w-10 h-10 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-headline font-bold">Google Analytics 4</h3>
                       <p className="text-sm text-slate-500 leading-relaxed italic">"Real-time event tracking and behavioral flow analytics for all visitors."</p>
                    </div>
                    <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-400 border-none font-black text-[9px] tracking-widest px-4 h-6">WAITING FOR CONNECTION</Badge>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-widest">Activate GA4 Node</Button>
                 </Card>
              </div>
           </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </main>
  )
}
