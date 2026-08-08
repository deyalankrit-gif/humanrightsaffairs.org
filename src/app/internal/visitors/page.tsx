"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, limit, doc } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserCheck, 
  MapPin, 
  Monitor, 
  Globe, 
  Clock, 
  Search, 
  Download, 
  Loader2, 
  ShieldCheck,
  Smartphone,
  Laptop,
  Tablet,
  TrendingUp,
  History,
  FileDown,
  Wifi,
  Activity,
  Circle,
  Navigation,
  Cpu,
  Fingerprint,
  X,
  FileSearch,
  Eye,
  Bot,
  User,
  Hash,
  LaptopMinimal,
  Maximize,
  Languages,
  ArrowRightLeft,
  MousePointer2,
  Lock,
  Link as LinkIcon
} from 'lucide-react'
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
  Cell
} from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog"
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { isToday } from 'date-fns'

export default function WebsiteVisitorsPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  
  const [search, setSearch] = useState('')
  const [localVisitorId, setLocalVisitorId] = useState<string | null>(null)
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('hrat_visitor_id');
      setLocalVisitorId(id);
    }
  }, []);

  // Real-time listener for the last 100 visitors
  const visitorsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'visitors'), orderBy('lastActivity', 'desc'), limit(100));
  }, [db, user]);

  const { data: visitors, loading: dataLoading } = useCollection(visitorsQuery);

  const stats = useMemo(() => {
    if (!visitors) return { 
      total: 0, 
      unique: 0, 
      uniqueIPs: 0,
      returning: 0, 
      new: 0, 
      wbCount: 0,
      otherStateCount: 0,
      intlCount: 0,
      todayPageViews: 0,
      todayWebsiteViews: 0,
      todayUniqueIPs: 0,
      chartData: [], 
      deviceData: [] 
    }

    const todayStr = new Date().toLocaleDateString('en-CA').replace(/-/g, '_');
    const todayViewsKey = `views_${todayStr}`;
    const todayVisitsKey = `visits_${todayStr}`;

    const total = visitors.length
    const unique = visitors.length
    const returning = visitors.filter((v: any) => v.status === 'Returning').length
    const newCount = visitors.filter((v: any) => v.status === 'New').length

    // IP Specific Analytics
    const uniqueIPsList = new Set(visitors.map((v: any) => v.ipAddress).filter(Boolean));
    const uniqueIPs = uniqueIPsList.size;
    
    const todayUniqueIPs = new Set(
      visitors
        .filter((v: any) => v.lastActivity?.toDate && isToday(v.lastActivity.toDate()))
        .map((v: any) => v.ipAddress)
        .filter(Boolean)
    ).size;

    // Calculate daily metrics across loaded visitors
    const todayPageViews = visitors.reduce((acc, v: any) => acc + (v[todayViewsKey] || 0), 0);
    const todayWebsiteViews = visitors.reduce((acc, v: any) => acc + (v[todayVisitsKey] || 0), 0);

    // Granular Geo Counts
    const wbCount = visitors.filter((v: any) => {
      const country = v.country || 'IN';
      const isIndia = country === 'India' || country === 'IN';
      const state = v.state || '';
      return isIndia && (state === 'West Bengal' || state.toLowerCase() === 'west bengal');
    }).length;

    const otherStateCount = visitors.filter((v: any) => {
      const country = v.country || 'IN';
      const isIndia = country === 'India' || country === 'IN';
      const state = v.state || '';
      return isIndia && state !== 'West Bengal' && state.toLowerCase() !== 'west bengal' && state !== 'Unknown';
    }).length;

    const intlCount = visitors.filter((v: any) => {
      const country = v.country || 'IN';
      const isIndia = country === 'India' || country === 'IN';
      return !isIndia;
    }).length;

    const chartData = [
      { name: 'New', count: newCount },
      { name: 'Returning', count: returning },
      { name: 'Active', count: visitors.filter((v: any) => v.status === 'Active').length }
    ]

    const deviceMap: Record<string, number> = {}
    visitors.forEach((v: any) => {
      const dev = v.deviceType || 'Computer/Laptop'
      deviceMap[dev] = (deviceMap[dev] || 0) + 1
    })
    const deviceData = Object.keys(deviceMap).map(name => ({ name, value: deviceMap[name] }))

    return { total, unique, uniqueIPs, returning, new: newCount, wbCount, otherStateCount, intlCount, todayPageViews, todayWebsiteViews, todayUniqueIPs, chartData, deviceData }
  }, [visitors])

  const handleExport = (format: 'PDF' | 'Excel' | 'CSV') => {
    alert(`Generating Real-Time Website Visitor Report in ${format} format...`)
  }

  const getLatestPath = (visitor: any) => {
    if (!visitor.pagesVisited || !visitor.pagesVisited.length) return '/';
    const lastEntry = visitor.pagesVisited[visitor.pagesVisited.length - 1];
    if (typeof lastEntry === 'object' && lastEntry !== null) {
      return lastEntry.path || '/';
    }
    return lastEntry || '/';
  };

  const getEntryPage = (visitor: any) => {
    if (visitor.landingPage) return visitor.landingPage;
    if (!visitor.pagesVisited || !visitor.pagesVisited.length) return '/';
    const firstEntry = visitor.pagesVisited[0];
    if (typeof firstEntry === 'object' && firstEntry !== null) return firstEntry.path || '/';
    return firstEntry || '/';
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  const COLORS = ['#D4AF37', '#138808', '#000080', '#FF9933'];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-emerald-500/30">
                <Wifi className="w-2.5 h-2.5 animate-pulse" /> Live Real-Time Feed
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Website <span className="text-accent italic">Visitors</span></h1>
              <p className="text-slate-400 text-[11px] max-w-xl">Comprehensive oversight of real-time website engagement and geographic reach.</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => handleExport('CSV')} variant="outline" className="bg-white/5 border-white/10 text-white h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2 hover:bg-white/10 hover:text-white transition-all">
                <FileDown className="w-3.5 h-3.5" /> CSV
              </Button>
              <Button onClick={() => handleExport('PDF')} className="bg-accent text-primary h-10 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all">
                <Download className="w-3.5 h-3.5" /> Export PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-32"><Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Live Logs...</p></div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 gap-4">
                 {[
                   { label: "Total Sessions", value: stats.total, icon: <Users className="w-4 h-4" />, color: "text-blue-500", trend: "Live" },
                   { label: "Unique Users", value: stats.unique, icon: <UserCheck className="w-4 h-4" />, color: "text-emerald-500", trend: "Steady" },
                   { label: "Unique IPs", value: stats.uniqueIPs, icon: <Fingerprint className="w-4 h-4" />, color: "text-orange-500", trend: `+${stats.todayUniqueIPs} Today` },
                   { label: "Daily Page Views", value: stats.todayPageViews, icon: <Activity className="w-4 h-4" />, color: "text-indigo-500", trend: "Today" },
                   { label: "Website Views", value: stats.todayWebsiteViews, icon: <Monitor className="w-4 h-4" />, color: "text-rose-500", trend: "Today" },
                   { label: "WB Visitors", value: stats.wbCount, icon: <MapPin className="w-4 h-4" />, color: "text-emerald-600", trend: "State" },
                   { label: "Other States", value: stats.otherStateCount, icon: <Globe className="w-4 h-4" />, color: "text-amber-500", trend: "National" },
                   { label: "International", value: stats.intlCount, icon: <Globe className="w-4 h-4" />, color: "text-red-500", trend: "Global" },
                   { label: "Connection", value: "Verified", icon: <Wifi className="w-4 h-4" />, color: "text-slate-400", trend: "Stable" }
                 ].map((stat, i) => (
                   <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden group">
                     <CardContent className="p-5 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div className={cn("p-2 rounded-xl bg-slate-50 dark:bg-slate-800", stat.color)}>{stat.icon}</div>
                          <Badge variant="outline" className="text-[7px] border-emerald-100 text-emerald-600 font-bold flex gap-1 items-center whitespace-nowrap">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" /> {stat.trend}
                          </Badge>
                        </div>
                        <p className="text-xl md:text-2xl font-headline font-bold text-primary dark:text-white leading-none mt-2">{stat.value}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                     </CardContent>
                   </Card>
                 ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6">
                   <CardHeader className="p-0 mb-6">
                     <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                       <TrendingUp className="w-5 h-5 text-accent" /> Interaction Pulse
                     </CardTitle>
                     <CardDescription className="text-[10px] uppercase font-bold text-slate-400">Current mix of recent visitor statuses</CardDescription>
                   </CardHeader>
                   <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                          <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: 'currentColor', opacity: 0.05 }}
                          />
                          <Bar dataKey="count" fill="#D4AF37" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6">
                   <CardHeader className="p-0 mb-6">
                     <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                       <Monitor className="w-5 h-5 text-accent" /> Technical Composition
                     </CardTitle>
                   </CardHeader>
                   <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.deviceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {stats.deviceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="space-y-2 mt-4">
                      {stats.deviceData.map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                           <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                             <span className="text-slate-500 uppercase">{d.name}</span>
                           </div>
                           <span className="text-primary dark:text-white">{Math.round((d.value / (stats.total || 1)) * 100)}%</span>
                        </div>
                      ))}
                   </div>
                </Card>
              </div>

              <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                 <CardHeader className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-headline font-bold">Live Interaction Log</CardTitle>
                        <Badge className="bg-emerald-500 text-white font-bold text-[8px] animate-pulse">UPDATED INSTANTLY</Badge>
                      </div>
                      <CardDescription className="text-[10px] font-bold uppercase text-slate-400">Unique IP tracking with Bot/Human classification and session auditing</CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                       <Input 
                          placeholder="Search IPs or IDs..." 
                          className="pl-8 h-9 rounded-xl text-xs border-slate-100 bg-slate-50 dark:bg-slate-950" 
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                       />
                    </div>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="overflow-x-auto w-full">
                      <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800/50 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-800">
                             <tr>
                               <th className="px-6 py-4 min-w-[200px]">Visitor/Session</th>
                               <th className="px-6 py-4">IP Address</th>
                               <th className="px-6 py-4">Identity Node</th>
                               <th className="px-6 py-4 min-w-[150px]">Platform Info</th>
                               <th className="px-6 py-4 min-w-[150px]">Geo Location</th>
                               <th className="px-6 py-4 min-w-[120px]">Current Page</th>
                               <th className="px-6 py-4">Date</th>
                               <th className="px-6 py-4 text-right">Audit</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                             {(visitors || []).filter(v => (v.id || '').toLowerCase().includes(search.toLowerCase()) || (v.ipAddress || '').includes(search)).map((v: any) => {
                               const country = v.country || 'IN';
                               const state = v.state || 'Unknown';
                               const isInternational = country !== 'India' && country !== 'IN';
                               const isOutOfState = !isInternational && state !== 'West Bengal' && state !== 'Unknown';
                               const isCurrentDevice = v.id === localVisitorId;
                               const isLikelyBot = v.isBot === true;

                               return (
                               <tr key={v.id} className={cn(
                                 "hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group",
                                 isInternational ? "bg-red-50/20 dark:bg-red-950/10" : isOutOfState ? "bg-amber-50/20 dark:bg-amber-950/10" : "",
                                 isCurrentDevice ? "bg-accent/5" : ""
                               )}>
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-accent relative">
                                           {v.email ? <UserCheck className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                                           <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-primary dark:text-white leading-none">{v.name || 'Anonymous Guest'}</p>
                                            {isCurrentDevice && (
                                              <Badge className="bg-accent text-primary font-black text-[6px] h-3 px-1 leading-none border-none flex gap-0.5 items-center">
                                                <Cpu className="w-2 h-2" /> THIS DEVICE
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-[8px] font-mono text-slate-400 mt-0.5">{v.id}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                       {v.ipAddress || '0.0.0.0'}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4">
                                     <Badge className={cn(
                                       "text-[8px] font-black px-3 h-5 border-none",
                                       isLikelyBot ? "bg-slate-800 text-white" : "bg-emerald-500 text-white"
                                     )}>
                                       {isLikelyBot ? <><Bot className="w-2.5 h-2.5 mr-1" /> LIKELY BOT</> : <><User className="w-2.5 h-2.5 mr-1" /> HUMAN</>}
                                     </Badge>
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                           {v.deviceType === 'Smartphone' ? <Smartphone className="w-2.5 h-2.5" /> : 
                                            v.deviceType === 'Tablet' ? <Tablet className="w-2.5 h-2.5" /> : 
                                            <Laptop className="w-2.5 h-2.5" />}
                                           {v.deviceType || 'Computer'} — {v.browser}
                                        </span>
                                        <span className="text-[7px] text-slate-400 uppercase font-black">{v.os}</span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                           <MapPin className={cn(
                                             "w-3 h-3 shrink-0", 
                                             isInternational ? "text-red-500 animate-pulse" : isOutOfState ? "text-amber-500" : "text-accent"
                                           )} />
                                           <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                              {v.city || 'Unknown'}, {state}
                                           </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{country}</span>
                                           {isInternational && <Badge className="bg-red-500 text-[6px] h-3 px-1 border-none">INTL</Badge>}
                                           {isOutOfState && <Badge className="bg-amber-500 text-[6px] h-3 px-1 border-none">OUT-STATE</Badge>}
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-1.5">
                                        <Navigation className="w-3 h-3 text-slate-400" />
                                        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
                                           {getLatestPath(v)}
                                        </span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-primary dark:text-white">
                                          {v.lastActivity?.toDate ? v.lastActivity.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                        </span>
                                        <span className="text-[7px] font-black text-slate-400 uppercase">
                                          {v.lastActivity?.toDate ? v.lastActivity.toDate().toLocaleDateString() : ''}
                                        </span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => setSelectedVisitor(v)}
                                      className="h-8 w-8 rounded-lg text-slate-300 hover:text-accent hover:bg-accent/10 transition-all opacity-0 group-hover:opacity-100"
                                     >
                                        <Eye className="w-4 h-4" />
                                     </Button>
                                  </td>
                               </tr>
                             )})}
                          </tbody>
                        </table>
                      </div>
                    </div>
                 </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Visitor Detail Audit Dialog */}
      <Dialog open={!!selectedVisitor} onOpenChange={(val) => !val && setSelectedVisitor(null)}>
         <DialogContent className="max-w-4xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 flex flex-col max-h-[95vh]">
            <DialogHeader className="sr-only"><DialogTitle>Visitor Examination</DialogTitle></DialogHeader>
            {selectedVisitor && (
              <>
                <div className="bg-slate-900 p-8 text-white relative border-b-4 border-accent/20">
                   <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white"><X className="w-5 h-5" /></Button></DialogClose></div>
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center text-accent border border-white/10">
                         <Fingerprint className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                         <Badge className="bg-accent text-primary font-black uppercase text-[8px] tracking-widest">{selectedVisitor.status || 'Active'}</Badge>
                         <DialogTitle className="text-3xl font-headline font-bold">{selectedVisitor.ipAddress || 'IP: 0.0.0.0'}</DialogTitle>
                         <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                           <Hash className="w-3.5 h-3.5" /> ID: {selectedVisitor.id}
                         </p>
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-white border-white/20 text-[9px] uppercase px-3 h-6 flex gap-2 items-center">
                        <Monitor className="w-3 h-3" /> {selectedVisitor.deviceType || 'Not Available'}
                      </Badge>
                      <Badge variant="outline" className="text-white border-white/20 text-[9px] uppercase px-3 h-6">
                        {selectedVisitor.browser || 'Not Available'}
                      </Badge>
                      <Badge variant="outline" className="text-white border-white/20 text-[9px] uppercase px-3 h-6">
                        {selectedVisitor.os || 'Not Available'}
                      </Badge>
                   </div>
                </div>

                <ScrollArea className="flex-1 p-8 space-y-10 custom-scrollbar">
                   {/* ROW 1: Identity & Temporal Intelligence */}
                   <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <Clock className="w-4 h-4 text-accent" />
                            <h4 className="text-[10px] font-black uppercase text-primary dark:text-white tracking-[0.25em]">Temporal Intelligence</h4>
                         </div>
                         <div className="grid gap-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                               <div className="space-y-0.5">
                                  <p className="text-[8px] font-black text-slate-400 uppercase">First Detection</p>
                                  <p className="text-sm font-bold">{selectedVisitor.firstVisit?.toDate ? selectedVisitor.firstVisit.toDate().toLocaleString() : 'Not Available'}</p>
                               </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                               <div className="space-y-0.5">
                                  <p className="text-[8px] font-black text-slate-400 uppercase">Latest Handshake</p>
                                  <p className="text-sm font-bold">{selectedVisitor.lastActivity?.toDate ? selectedVisitor.lastActivity.toDate().toLocaleString() : 'Not Available'}</p>
                               </div>
                               {isToday(selectedVisitor.lastActivity?.toDate?.() || new Date(0)) && <Badge className="bg-emerald-500 h-5">Today</Badge>}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <Globe className="w-4 h-4 text-accent" />
                            <h4 className="text-[10px] font-black uppercase text-primary dark:text-white tracking-[0.25em]">Geographic Node</h4>
                         </div>
                         <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Country</p>
                                  <p className="text-sm font-bold truncate">{selectedVisitor.country || 'Not Available'}</p>
                               </div>
                               <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Region/State</p>
                                  <p className="text-sm font-bold truncate">{selectedVisitor.state || 'Not Available'}</p>
                               </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                               <div className="flex justify-between items-center">
                                  <div className="space-y-0.5">
                                     <p className="text-[8px] font-black text-slate-400 uppercase">City & Timezone</p>
                                     <p className="text-sm font-bold">{selectedVisitor.city || 'Unknown'} • {selectedVisitor.timeZone || 'Not Available'}</p>
                                  </div>
                                  <Navigation className="w-4 h-4 text-slate-300" />
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* ROW 2: Technical Specifications & Session Flow */}
                   <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <LaptopMinimal className="w-4 h-4 text-accent" />
                            <h4 className="text-[10px] font-black uppercase text-primary dark:text-white tracking-[0.25em]">Technical Specifications</h4>
                         </div>
                         <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><Maximize className="w-2.5 h-2.5" /> Resolution</p>
                                  <p className="text-sm font-bold font-mono">{selectedVisitor.screenResolution || 'Not Available'}</p>
                               </div>
                               <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><Languages className="w-2.5 h-2.5" /> Language</p>
                                  <p className="text-sm font-bold uppercase">{selectedVisitor.language || 'Not Available'}</p>
                               </div>
                            </div>
                            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-2">
                               <p className="text-[8px] font-black text-slate-600 uppercase flex items-center gap-1.5"><Bot className="w-2.5 h-2.5" /> Raw User Agent</p>
                               <p className="text-[10px] font-mono text-slate-400 break-all leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
                                  {selectedVisitor.userAgent || 'Not Available'}
                               </p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <Activity className="w-4 h-4 text-accent" />
                            <h4 className="text-[10px] font-black uppercase text-primary dark:text-white tracking-[0.25em]">Session Flow Intelligence</h4>
                         </div>
                         <div className="grid gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                               <div className="flex justify-between items-center">
                                  <div className="space-y-0.5">
                                     <p className="text-[8px] font-black text-slate-400 uppercase">Referral Source</p>
                                     <p className="text-xs font-bold text-primary dark:text-white truncate max-w-[200px]">{selectedVisitor.referrer || 'Direct Entry / Secure'}</p>
                                  </div>
                                  <LinkIcon className="w-3.5 h-3.5 text-slate-300" />
                               </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Hits</p>
                                  <p className="text-xl font-headline font-bold text-primary dark:text-white">{selectedVisitor.pageViews || 0}</p>
                               </div>
                               <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Session Depth</p>
                                  <p className="text-xl font-headline font-bold text-emerald-600">{selectedVisitor.pagesVisited?.length || 0}</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* ROW 3: Full Navigational Path Audit */}
                   <div className="space-y-6 pt-6 border-t dark:border-slate-800">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <FileSearch className="w-4 h-4 text-accent" />
                            <h4 className="text-[10px] font-black uppercase text-primary dark:text-white tracking-[0.25em]">Navigational Path Audit</h4>
                         </div>
                         <Badge variant="outline" className="text-[8px] border-slate-100 dark:border-slate-800 text-slate-400">CHRONOLOGICAL</Badge>
                      </div>
                      <div className="space-y-3">
                         {((selectedVisitor.pagesVisited || []) as any[]).slice().reverse().map((path, pIdx) => {
                           const pathStr = typeof path === 'object' ? path.path : path;
                           const isEntry = pIdx === selectedVisitor.pagesVisited.length - 1;
                           const isExit = pIdx === 0;

                           return (
                           <div key={pIdx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm">
                              <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 w-6 text-center">{selectedVisitor.pagesVisited.length - pIdx}</span>
                              <Badge variant="outline" className="text-[8px] h-5 px-2 border-slate-200 uppercase font-black">GET</Badge>
                              <span className="text-xs font-mono font-bold text-primary dark:text-slate-300 flex-1 truncate">{pathStr}</span>
                              <div className="flex gap-2">
                                 {isEntry && <Badge className="bg-blue-600 text-[6px] h-4 px-1.5 border-none">ENTRY NODE</Badge>}
                                 {isExit && <Badge className="bg-red-500 text-[6px] h-4 px-1.5 border-none">EXIT NODE</Badge>}
                              </div>
                           </div>
                         )})}
                         {(!selectedVisitor.pagesVisited || selectedVisitor.pagesVisited.length === 0) && (
                            <div className="py-10 text-center opacity-20 bg-slate-50 rounded-2xl border-2 border-dashed">
                               <MousePointer2 className="w-10 h-10 mx-auto mb-2" />
                               <p className="text-[10px] font-black uppercase">No path recorded</p>
                            </div>
                         )}
                      </div>
                   </div>
                </ScrollArea>
                
                <div className="p-8 border-t bg-slate-50 dark:bg-slate-950 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Authorized Audit Session • Node-Alpha</span>
                   </div>
                   <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Button variant="ghost" onClick={() => setSelectedVisitor(null)} className="flex-1 sm:flex-none h-11 rounded-xl px-8 font-black uppercase text-[10px] tracking-widest text-slate-500">Dismiss</Button>
                      <Button className="flex-1 sm:flex-none h-11 rounded-xl px-10 bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">Acknowledge Node</Button>
                   </div>
                </div>
              </>
            )}
         </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
