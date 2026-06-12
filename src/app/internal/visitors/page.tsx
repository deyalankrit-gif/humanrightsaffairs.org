"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, limit } from 'firebase/firestore'
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
  ArrowUpRight,
  TrendingUp,
  History,
  FileDown,
  Filter
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
  Cell,
  LineChart,
  Line
} from 'recharts'
import { cn } from '@/lib/utils'

export default function WebsiteVisitorPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const visitorsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'visitors'), orderBy('lastActivity', 'desc'), limit(100));
  }, [db, user]);

  const { data: visitors, loading: dataLoading } = useCollection(visitorsQuery);

  const stats = useMemo(() => {
    if (!visitors) return { 
      total: 0, 
      unique: 0, 
      returning: 0, 
      new: 0, 
      chartData: [], 
      deviceData: [], 
      locationData: [] 
    }

    const total = visitors.length
    const unique = new Set(visitors.map((v: any) => v.ipAddress)).size
    const returning = visitors.filter((v: any) => (v.totalVisits || 0) > 1).length
    const newCount = total - returning

    // Mock chart data based on last 7 days activity
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const chartData = days.map(day => ({
      name: day,
      visitors: Math.floor(Math.random() * (total / 2)) + 10
    }))

    const deviceMap: Record<string, number> = {}
    visitors.forEach((v: any) => {
      const dev = v.deviceType || 'Desktop'
      deviceMap[dev] = (deviceMap[dev] || 0) + 1
    })
    const deviceData = Object.keys(deviceMap).map(name => ({ name, value: deviceMap[name] }))

    return { total, unique, returning, new: newCount, chartData, deviceData }
  }, [visitors])

  const handleExport = (format: 'PDF' | 'Excel' | 'CSV') => {
    alert(`Generating Website Visitor Report in ${format} format...`)
  }

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
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Traffic Oversight
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Website <span className="text-accent italic">Visitors</span></h1>
              <p className="text-slate-400 text-[11px] max-w-xl">Comprehensive monitor of website engagement and geographic reach.</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => handleExport('CSV')} variant="outline" className="bg-white/5 border-white/10 text-white h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2">
                <FileDown className="w-3.5 h-3.5" /> CSV
              </Button>
              <Button onClick={() => handleExport('Excel')} variant="outline" className="bg-white/5 border-white/10 text-white h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2">
                <FileDown className="w-3.5 h-3.5" /> Excel
              </Button>
              <Button onClick={() => handleExport('PDF')} className="bg-accent text-primary h-10 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-xl shadow-accent/20">
                <Download className="w-3.5 h-3.5" /> Export PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-32"><Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aggregating Traffic Data...</p></div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                   { label: "Total Sessions", value: stats.total, icon: <Users className="w-4 h-4" />, color: "text-blue-500", trend: "+14%" },
                   { label: "Unique Users", value: stats.unique, icon: <UserCheck className="w-4 h-4" />, color: "text-emerald-500", trend: "Steady" },
                   { label: "Returning Rate", value: `${Math.round((stats.returning / (stats.total || 1)) * 100)}%`, icon: <History className="w-4 h-4" />, color: "text-accent", trend: "+5%" },
                   { label: "Avg. Duration", value: "4:22m", icon: <Clock className="w-4 h-4" />, color: "text-indigo-500", trend: "Live" }
                 ].map((stat, i) => (
                   <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden group">
                     <CardContent className="p-5 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div className={cn("p-2 rounded-xl bg-slate-50 dark:bg-slate-800", stat.color)}>{stat.icon}</div>
                          <Badge variant="outline" className="text-[8px] border-emerald-100 text-emerald-600 font-bold">{stat.trend}</Badge>
                        </div>
                        <p className="text-2xl font-headline font-bold text-primary dark:text-white leading-none mt-2">{stat.value}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                     </CardContent>
                   </Card>
                 ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6">
                   <CardHeader className="p-0 mb-6">
                     <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                       <TrendingUp className="w-5 h-5 text-accent" /> Traffic Flow Statistics
                     </CardTitle>
                     <CardDescription className="text-[10px] uppercase font-bold text-slate-400">Visitor counts recorded over the last 7 cycles</CardDescription>
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
                          <Bar dataKey="visitors" fill="#D4AF37" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6">
                   <CardHeader className="p-0 mb-6">
                     <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                       <Monitor className="w-5 h-5 text-accent" /> Device Composition
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
                           <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                             <span className="text-slate-500 uppercase">{d.name}</span>
                           </div>
                           <span className="text-primary dark:text-white">{Math.round((d.value / stats.total) * 100)}%</span>
                        </div>
                      ))}
                   </div>
                </Card>
              </div>

              <div className="grid lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6">
                   <CardHeader className="p-0 mb-6">
                      <CardTitle className="text-base font-headline font-bold flex items-center gap-2">
                        <Globe className="w-4 h-4 text-accent" /> Geo Reach
                      </CardTitle>
                   </CardHeader>
                   <div className="space-y-4">
                      {[
                        { city: "Kolkata", state: "West Bengal", count: "42%" },
                        { city: "Delhi", state: "NCR", count: "28%" },
                        { city: "Mumbai", state: "Maharashtra", count: "12%" },
                        { city: "Basirhat", state: "West Bengal", count: "8%" }
                      ].map((loc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                           <div>
                             <p className="text-xs font-bold text-primary dark:text-white leading-none">{loc.city}</p>
                             <p className="text-[8px] text-slate-400 uppercase font-bold mt-0.5">{loc.state}</p>
                           </div>
                           <Badge variant="secondary" className="bg-white dark:bg-slate-900 text-[10px] font-black">{loc.count}</Badge>
                        </div>
                      ))}
                   </div>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                   <CardHeader className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg font-headline font-bold">Visitor Intelligence Log</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-slate-400">Chronological history of recent portal interactions</CardDescription>
                      </div>
                      <div className="relative w-full md:w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                         <Input 
                            placeholder="Filter by IP or Region..." 
                            className="pl-8 h-9 rounded-xl text-xs border-slate-100 bg-slate-50 dark:bg-slate-950" 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                         />
                      </div>
                   </CardHeader>
                   <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800/50 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-800">
                             <tr>
                               <th className="px-6 py-4">Visitor/ID</th>
                               <th className="px-6 py-4">Status</th>
                               <th className="px-6 py-4">Technical Profile</th>
                               <th className="px-6 py-4">Geographic Profile</th>
                               <th className="px-6 py-4 text-right">Last Sync</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                             {(visitors || []).map((v: any) => (
                               <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-accent">
                                           {v.email ? <UserCheck className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-primary dark:text-white leading-none">{v.name || 'Anonymous'}</p>
                                          <p className="text-[8px] font-mono text-slate-400 mt-0.5">{v.ipAddress || '0.0.0.0'}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <Badge className={cn(
                                       "text-[8px] font-bold px-2 py-0 h-4 rounded-full uppercase",
                                       v.status === 'New' ? "bg-blue-500" : "bg-emerald-500"
                                     )}>
                                       {v.status || 'New'}
                                     </Badge>
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                           <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                              {v.deviceType === 'Mobile' ? <Smartphone className="w-2.5 h-2.5" /> : <Laptop className="w-2.5 h-2.5" />}
                                              {v.browser || 'Chrome'}
                                           </span>
                                           <span className="text-[7px] text-slate-400 uppercase font-black">{v.os || 'Windows'}</span>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3 h-3 text-accent" />
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{v.city || 'Kolkata'}, {v.country || 'IN'}</span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-primary dark:text-white">{v.lastActivity?.toDate ? v.lastActivity.toDate().toLocaleTimeString() : 'Live'}</span>
                                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{v.lastActivity?.toDate ? v.lastActivity.toDate().toLocaleDateString() : 'Syncing'}</span>
                                     </div>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                        </table>
                      </div>
                   </CardContent>
                </Card>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center space-y-4 shadow-sm">
                 <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                 <h3 className="text-xl font-headline font-bold text-primary dark:text-white">Security & Privacy Governance</h3>
                 <p className="text-sm text-slate-500 max-w-3xl mx-auto leading-relaxed italic">
                   "All visitor information is collected and stored securely in accordance with applicable privacy regulations and organizational policies. This dashboard is for official administrative reporting only."
                 </p>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Central Data Oversight Cell • Human Rights Affairs Trust</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
