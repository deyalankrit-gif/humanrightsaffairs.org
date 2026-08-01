"use client"

import React, { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  ShieldCheck, 
  Loader2, 
  Activity, 
  Globe, 
  MapPin, 
  AlertCircle,
  Clock,
  TrendingUp,
  FileText,
  Users,
  Target,
  ArrowLeft,
  Search,
  CheckCircle2,
  Lock,
  UserRoundX,
  Scale,
  Navigation,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Public Complaints Analytics: High-Fidelity Multi-Indicator Dashboard.
 * Optimized for institutional oversight and regional performance auditing.
 * Refined: Fixed text contrast in the Health Monitor section and improved chart visibility.
 */
export default function ComplaintAnalyticsPage() {
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

  const complaintsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'public_complaints'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: complaints, loading: dataLoading } = useCollection(complaintsQuery);

  const stats = useMemo(() => {
    if (!complaints || !mounted) return { 
      total: 0, 
      resolved: 0,
      atRisk: 0,
      avgLoad: 0,
      statusData: [], 
      priorityData: [], 
      stateData: [],
      trendData: [],
      investigatorStats: []
    };

    const total = complaints.length;
    let resolvedCount = 0;
    let atRiskCount = 0;
    
    // Status Aggregation
    const statusMap: Record<string, number> = {};
    // Priority Aggregation
    const priorityMap: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    // Geographic Aggregation
    const stateMap: Record<string, number> = {};
    // Investigator Workload
    const workloadMap: Record<string, number> = {};
    // Timeline Trends (Last 7 months)
    const monthMap: Record<string, number> = {};

    complaints.forEach((c: any) => {
      // Resolve status logic
      const status = c.status || 'New Complaint';
      statusMap[status] = (statusMap[status] || 0) + 1;
      if (status === 'Action Taken' || status === 'Closed' || status === 'Resolved') resolvedCount++;

      // Priority logic
      if (c.priority && priorityMap[c.priority] !== undefined) priorityMap[c.priority]++;
      if (c.victimIsMinor === true) atRiskCount++;

      // Geo logic
      const state = c.stateName || 'Unspecified';
      stateMap[state] = (stateMap[state] || 0) + 1;

      // Workload logic
      const team = c.assignedOfficers || [];
      team.forEach((o: any) => {
        if (o.name) workloadMap[o.name] = (workloadMap[o.name] || 0) + 1;
      });
      if (team.length === 0 && c.assignedTo) {
        workloadMap[c.assignedTo] = (workloadMap[c.assignedTo] || 0) + 1;
      }

      // Trend logic
      if (c.createdAt?.toDate) {
        const month = format(c.createdAt.toDate(), 'MMM yy');
        monthMap[month] = (monthMap[month] || 0) + 1;
      }
    });

    const statusData = Object.keys(statusMap).map(name => ({ name, value: statusMap[name] }));
    const priorityData = Object.keys(priorityMap).map(name => ({ name, value: priorityMap[name] }));
    const stateData = Object.keys(stateMap).map(name => ({ name, count: stateMap[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    const trendData = Object.keys(monthMap).map(name => ({ name, intake: monthMap[name] })).reverse();
    
    const investigatorStats = Object.keys(workloadMap).map(name => ({
      name,
      cases: workloadMap[name]
    })).sort((a, b) => b.cases - a.cases);

    const activeInvestigators = investigatorStats.length;
    const avgLoad = activeInvestigators > 0 ? Math.round(total / activeInvestigators) : 0;

    return { 
      total, 
      resolved: total > 0 ? Math.round((resolvedCount / total) * 100) : 0, 
      atRisk: atRiskCount,
      avgLoad,
      statusData, 
      priorityData, 
      stateData, 
      trendData,
      investigatorStats
    };
  }, [complaints, mounted]);

  const COLORS = ['#001f54', '#D4AF37', '#138808', '#ef4444', '#6366f1', '#f59e0b', '#10b981', '#3b82f6'];

  if (authLoading || !user || !mounted) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/10 h-10 w-10 p-0 rounded-full">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-accent/30">
                  <Activity className="w-2.5 h-2.5" /> Force Intelligence Node
                </div>
                <h1 className="text-3xl md:text-4xl font-headline font-bold">Complaint <span className="text-accent italic">Analytics</span></h1>
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Multi-Indicator Performance Dashboard</p>
              </div>
           </div>
           <div className="flex gap-2">
             <Button variant="outline" className="bg-white/5 border-white/10 text-white h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2">
               <Download className="w-3.5 h-3.5" /> Master PDF Export
             </Button>
           </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4">
        {dataLoading ? (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Compiling Multi-Indicator Data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Primary KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
               {[
                 { label: "Complaint Intake", value: stats.total, icon: <Activity className="text-blue-500" />, trend: "Registry Total" },
                 { label: "Resolution Rate", value: `${stats.resolved}%`, icon: <CheckCircle2 className="text-emerald-500" />, trend: "Finalized Cases" },
                 { label: "Minor at Risk", value: stats.atRisk, icon: <AlertCircle className="text-red-500" />, trend: "Critical Intervention" },
                 { label: "Avg Workload", value: stats.avgLoad, icon: <Target className="text-accent" />, trend: "Cases Per Official" }
               ].map((s, i) => (
                 <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden group">
                   <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-accent/10 transition-colors">{s.icon}</div>
                        <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-100">{s.trend}</Badge>
                      </div>
                      <p className="text-3xl font-headline font-bold text-primary dark:text-white leading-none mb-1">{s.value}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                   </CardContent>
                 </Card>
               ))}
            </div>

            {/* Strategic Distribution Row */}
            <div className="grid lg:grid-cols-3 gap-8">
               <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8">
                  <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                     <div>
                        <CardTitle className="text-xl font-headline font-bold">Geographic Density</CardTitle>
                        <CardDescription>Intake distribution by top participating Indian states</CardDescription>
                     </div>
                     <Globe className="w-6 h-6 text-emerald-500" />
                  </CardHeader>
                  <div className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.stateData} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                           <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} hide />
                           <YAxis dataKey="name" type="category" fontSize={9} axisLine={false} tickLine={false} width={100} />
                           <Tooltip cursor={{ fill: 'currentColor', opacity: 0.05 }} />
                           <Bar dataKey="count" fill="#D4AF37" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </Card>

               <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8">
                  <CardHeader className="p-0 mb-6">
                     <CardTitle className="text-xl font-headline font-bold">Lifecycle Status</CardTitle>
                  </CardHeader>
                  <div className="h-[200px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                             data={stats.statusData}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={80}
                             paddingAngle={5}
                             dataKey="value"
                           >
                             {stats.statusData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <Tooltip />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                     {stats.statusData.map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-[9px] font-bold uppercase">
                           <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                             <span className="text-slate-500 truncate max-w-[150px]">{d.name}</span>
                           </div>
                           <span className="text-primary dark:text-white">{d.value}</span>
                        </div>
                      ))}
                  </div>
               </Card>
            </div>

            {/* Performance Indicators */}
            <div className="grid lg:grid-cols-3 gap-8">
               <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8">
                  <CardHeader className="p-0 mb-8">
                     <CardTitle className="text-xl font-headline font-bold">Priority Spectrum</CardTitle>
                  </CardHeader>
                  <div className="space-y-6">
                    {stats.priorityData.map((p: any, i) => {
                      const percent = Math.round((p.value / stats.total) * 100);
                      const barColor = p.name === 'High' ? "bg-red-600" : p.name === 'Medium' ? "bg-amber-500" : "bg-blue-600";
                      return (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">{p.name} Priority</span>
                            <span className="text-primary dark:text-white">{p.value} Cases ({percent}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <div className={cn("h-full transition-all duration-1000", barColor)} style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
               </Card>

               <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <CardHeader className="p-0 mb-8">
                     <div className="flex items-center justify-between">
                        <div>
                           <CardTitle className="text-xl font-headline font-bold">Investigator Distribution</CardTitle>
                           <CardDescription className="text-slate-400">Tactical workload per authorized investigative official</CardDescription>
                        </div>
                        <Users className="w-6 h-6 text-accent" />
                     </div>
                  </CardHeader>
                  <div className="h-[200px] overflow-y-auto custom-scrollbar pr-4">
                     <div className="grid gap-3">
                        {stats.investigatorStats.map((inv, idx) => (
                           <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                    <ShieldCheck className="w-4 h-4" />
                                 </div>
                                 <span className="text-xs font-bold uppercase">{inv.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] font-black text-slate-500 uppercase">Active Docket</span>
                                 <Badge className="bg-emerald-600 text-white font-black">{inv.cases}</Badge>
                              </div>
                           </div>
                        ))}
                        {stats.investigatorStats.length === 0 && (
                          <div className="text-center py-10 opacity-30">
                             <UserRoundX className="w-10 h-10 mx-auto mb-2" />
                             <p className="text-[10px] font-black uppercase tracking-widest">No assigned investigators identified</p>
                          </div>
                        )}
                     </div>
                  </div>
               </Card>
            </div>

            {/* Strategic Area Logic */}
            <Card className="border-none shadow-2xl rounded-[3rem] bg-primary text-primary-foreground p-10 md:p-16 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full -mr-48 -mt-48 blur-[120px]"></div>
               <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8">
                     <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-xs font-bold border border-accent/30 uppercase tracking-widest">
                        <Scale className="w-4 h-4" /> Protocol Efficiency
                     </div>
                     <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight">National Registry <br/><span className="text-accent italic">Health Monitor</span></h2>
                     <p className="text-primary-foreground/70 text-sm md:text-lg leading-relaxed italic">
                        "Real-time monitoring of rights violations and investigative progress enables the central council to identify regional spikes and deploy specialized tactical teams where they are most needed."
                     </p>
                     <div className="flex gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center flex-1">
                           <p className="text-2xl font-black text-white">{stats.total}</p>
                           <p className="text-[9px] font-bold text-primary-foreground/40 uppercase tracking-widest">Total Intake</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center flex-1">
                           <p className="text-2xl font-black text-emerald-400">{stats.resolved}%</p>
                           <p className="text-[9px] font-bold text-primary-foreground/40 uppercase tracking-widest">Global Resolution</p>
                        </div>
                     </div>
                  </div>
                  <div className="h-[250px] md:h-[350px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.trendData}>
                           <defs>
                              <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                           <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" />
                           <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" />
                           <Tooltip contentStyle={{ backgroundColor: '#001f54', border: 'none', borderRadius: '1rem', color: '#fff' }} />
                           <Area type="monotone" dataKey="intake" stroke="#D4AF37" fillOpacity={1} fill="url(#colorIntake)" strokeWidth={3} />
                        </AreaChart>
                     </ResponsiveContainer>
                     <p className="text-center text-[9px] font-black text-primary-foreground/30 uppercase tracking-[0.4em] mt-4">Case Intake Historical Trend</p>
                  </div>
               </div>
            </Card>

            {/* Mandatory Compliance Tag */}
            <div className="flex flex-col items-center gap-4 opacity-30 pt-10">
               <ShieldCheck className="w-12 h-12 text-slate-400" />
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">Official Institutional Intelligence node • HRAT India</p>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}

function format(date: Date, str: string) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${month} ${year}`;
}
