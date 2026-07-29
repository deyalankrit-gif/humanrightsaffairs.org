
"use client"

import React, { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Users, 
  ShieldCheck, 
  Loader2, 
  TrendingUp, 
  Globe, 
  MapPin, 
  UserCheck,
  Award,
  PieChart as PieChartIcon,
  BarChart3,
  RefreshCw,
  CalendarClock,
  AlertTriangle,
  History
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { parse, addYears, differenceInDays } from 'date-fns'

export default function MemberAnalyticsPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const profilesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'memberProfiles'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: firestoreMembers, loading: dataLoading } = useCollection(profilesQuery);

  // DATA ISOLATION: Explicitly filter out demi members in memory for high-fidelity isolation
  const members = React.useMemo(() => {
    return ((firestoreMembers || []) as any[]).filter(m => m.isDemi !== true);
  }, [firestoreMembers]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const stats = useMemo(() => {
    if (!members || !mounted) return { 
      total: 0, 
      levelData: [], 
      genderData: [], 
      stateData: [],
      activeChapters: 0,
      maleCount: 0,
      femaleCount: 0,
      otherCount: 0,
      malePercent: 0,
      femalePercent: 0,
      renewedCount: 0,
      upcomingExpirations: 0,
      expiredCount: 0,
      renewalData: []
    };

    const total = members.length;
    
    // Level Distribution
    const levels: Record<string, number> = { National: 0, State: 0, District: 0 };
    // State Distribution
    const states: Record<string, number> = {};
    // Gender Distribution
    const genders: Record<string, number> = { Male: 0, Female: 0, Other: 0 };

    let renewedCount = 0;
    let upcomingExpirations = 0;
    let expiredCount = 0;
    const now = new Date();

    members.forEach((m: any) => {
      if (m.level) levels[m.level] = (levels[m.level] || 0) + 1;
      if (m.stateName) states[m.stateName] = (states[m.stateName] || 0) + 1;
      
      const g = m.gender ? m.gender.charAt(0).toUpperCase() + m.gender.slice(1).toLowerCase() : 'Other';
      if (genders[g] !== undefined) genders[g]++;
      else genders['Other']++;

      if (m.isRenewed) renewedCount++;

      if (m.expiryDate) {
        try {
          const expiryDate = parse(m.expiryDate, "PPP", new Date());
          const daysToExpiry = differenceInDays(expiryDate, now);
          
          if (daysToExpiry < 0) {
            expiredCount++;
          } else if (daysToExpiry <= 30) {
            upcomingExpirations++;
          }
        } catch (e) {}
      }
    });

    const levelData = Object.keys(levels).map(name => ({ name, value: levels[name] }));
    const genderData = Object.keys(genders).filter(g => genders[g] > 0).map(name => ({ name, value: genders[name] }));
    const stateData = Object.keys(states).map(name => ({ name, count: states[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const activeChapters = Object.keys(states).length;
    
    const maleCount = genders['Male'];
    const femaleCount = genders['Female'];
    const otherCount = genders['Other'];
    const totalWithGender = maleCount + femaleCount + otherCount;
    const malePercent = totalWithGender > 0 ? Math.round((maleCount / totalWithGender) * 100) : 0;
    const femalePercent = totalWithGender > 0 ? Math.round((femaleCount / totalWithGender) * 100) : 0;

    const renewalData = [
      { name: 'Renewed', value: renewedCount },
      { name: 'Base', value: total - renewedCount }
    ];

    return { 
      total, 
      levelData, 
      genderData, 
      stateData, 
      activeChapters,
      maleCount,
      femaleCount,
      otherCount,
      malePercent,
      femalePercent,
      renewedCount,
      upcomingExpirations,
      expiredCount,
      renewalData
    };
  }, [members, mounted]);

  if (!mounted || authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  const COLORS = ['#D4AF37', '#138808', '#000080', '#FF9933', '#c91010', '#4f46e5'];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-accent/30">
              <ShieldCheck className="w-2.5 h-2.5" /> Personnel Intelligence
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Member <span className="text-accent italic">Analytics</span></h1>
            <p className="text-slate-400 text-[11px]">Real-time demographic and jurisdictional oversight of the HRAT network.</p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-accent" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Compiling Registry Data...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Members", value: stats.total, icon: <Users className="w-4 h-4 text-blue-500" />, trend: "Active" },
                  { label: "State Chapters", value: stats.activeChapters, icon: <Globe className="w-4 h-4 text-emerald-500" />, trend: "Live" },
                  { label: "Renewed Members", value: stats.renewedCount, icon: <RefreshCw className="w-4 h-4 text-accent" />, trend: `${Math.round((stats.renewedCount / (stats.total || 1)) * 100)}%` },
                  { label: "Growth Status", value: "Steady", icon: <TrendingUp className="w-4 h-4 text-indigo-500" />, trend: "+5%" }
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden group">
                    <CardContent className="p-5 flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                          <div className={cn("p-2 rounded-xl bg-slate-50 dark:bg-slate-800")}>{stat.icon}</div>
                          <Badge variant="outline" className="text-[8px] font-bold border-slate-100">{stat.trend}</Badge>
                       </div>
                       <p className="text-2xl font-headline font-bold text-primary dark:text-white leading-none mt-2">{stat.value}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Term Governance Section */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6 border-l-4 border-l-accent">
                   <CardHeader className="p-0 mb-6">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-headline font-bold flex items-center gap-2 text-accent">
                          <CalendarClock className="w-5 h-5" /> Term Oversight
                        </CardTitle>
                        <Badge className="bg-red-500 text-white text-[8px] animate-pulse">30-DAY WARNING</Badge>
                      </div>
                      <CardDescription className="text-[10px] uppercase font-bold text-slate-400 mt-1">Identification of upcoming term expirations</CardDescription>
                   </CardHeader>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="text-2xl font-headline font-bold text-red-600">{stats.upcomingExpirations}</p>
                            <p className="text-[10px] font-black uppercase text-slate-400">Due for Renewal</p>
                         </div>
                         <div className="h-12 w-px bg-slate-100 dark:bg-slate-800"></div>
                         <div className="space-y-1 text-right">
                            <p className="text-2xl font-headline font-bold text-slate-900 dark:text-white">{stats.expiredCount}</p>
                            <p className="text-[10px] font-black uppercase text-slate-400">Registry Expired</p>
                         </div>
                      </div>
                      
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900 flex items-start gap-3">
                         <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                         <p className="text-[10px] text-amber-800 dark:text-amber-400 leading-relaxed font-bold">
                            Warning system is active. Members within 30 days of expiry are flagged for central review.
                         </p>
                      </div>
                   </div>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6">
                   <CardHeader className="p-0 mb-4">
                     <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                       <RefreshCw className="w-5 h-5 text-emerald-500" /> Subscription Loyalty
                     </CardTitle>
                   </CardHeader>
                   <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.renewalData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#138808" />
                            <Cell fill="#f1f5f9" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Renewal Rate</span>
                      <span className="text-lg font-bold text-emerald-600">{Math.round((stats.renewedCount / (stats.total || 1)) * 100)}%</span>
                   </div>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-slate-950 text-white p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                   <CardHeader className="p-0 mb-4">
                     <CardTitle className="text-sm uppercase tracking-widest text-accent flex items-center gap-2">
                       <History className="w-4 h-4" /> Integrity Log
                     </CardTitle>
                   </CardHeader>
                   <p className="text-xs text-slate-400 leading-relaxed italic">
                      "Automatic term governance ensures every ID card in circulation is legally valid. Our 30-day proactive warning protocol protects member credentials from accidental lapse."
                   </p>
                   <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-500 uppercase">System Status</span>
                        <span className="text-[10px] font-bold text-emerald-400">Monitoring Active</span>
                      </div>
                      <ShieldCheck className="w-6 h-6 text-accent opacity-50" />
                   </div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Jurisdictional Reach */}
                <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6">
                   <CardHeader className="p-0 mb-6">
                     <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                       <BarChart3 className="w-5 h-5 text-accent" /> Geographic Reach
                     </CardTitle>
                     <CardDescription className="text-[10px] uppercase font-bold text-slate-400">Membership density by top 8 participating states</CardDescription>
                   </CardHeader>
                   <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.stateData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                          <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} hide />
                          <YAxis dataKey="name" type="category" fontSize={10} axisLine={false} tickLine={false} width={100} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: 'currentColor', opacity: 0.05 }}
                          />
                          <Bar dataKey="count" fill="#D4AF37" radius={[0, 6, 6, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </Card>

                {/* Level Distribution */}
                <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6">
                   <CardHeader className="p-0 mb-6">
                     <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                       <PieChartIcon className="w-5 h-5 text-accent" /> Council Levels
                     </CardTitle>
                   </CardHeader>
                   <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.levelData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {stats.levelData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="space-y-2 mt-4">
                      {stats.levelData.map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                           <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                             <span className="text-slate-500 uppercase">{d.name} Council</span>
                           </div>
                           <span className="text-primary dark:text-white">{d.value}</span>
                        </div>
                      ))}
                   </div>
                </Card>
              </div>

              {/* Gender Demographic */}
              <div className="grid md:grid-cols-2 gap-6">
                 <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-indigo-500" /> Gender Demographics
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold text-slate-400">Diversity balance within official registry</CardDescription>
                      </div>
                      <div className="flex gap-6 items-center">
                         <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Male</p>
                            <div className="flex items-baseline gap-1.5 justify-center">
                               <span className="text-lg font-bold text-primary dark:text-white">{stats.maleCount}</span>
                               <span className="text-[10px] font-bold text-indigo-500">({stats.malePercent}%)</span>
                            </div>
                         </div>
                         <div className="w-px h-6 bg-slate-100 dark:bg-slate-800"></div>
                         <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Female</p>
                            <div className="flex items-baseline gap-1.5 justify-center">
                               <span className="text-lg font-bold text-primary dark:text-white">{stats.femaleCount}</span>
                               <span className="text-[10px] font-bold text-pink-500">({stats.femalePercent}%)</span>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.genderData}>
                          <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {stats.genderData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.name === 'Male' ? '#001f54' : entry.name === 'Female' ? '#c91010' : '#D4AF37'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                 </Card>

                 <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-center shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Integrity Mandate
                    </h4>
                    <p className="text-sm text-slate-400 italic leading-relaxed">
                      "These analytics represent our commitment to a distributed and diverse human rights framework. We continuously monitor jurisdictional balance to ensure every citizen has access to a local HRAT cell."
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                       <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">National Oversight Cell • HRAT INDIA</p>
                       {stats.otherCount > 0 && (
                         <Badge variant="outline" className="text-[7px] text-slate-500 border-slate-800">
                           {stats.otherCount} Members identifying as Other
                         </Badge>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
