
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  User, 
  ShieldCheck, 
  BadgeCheck, 
  CreditCard, 
  History, 
  Bell, 
  FileText, 
  Settings, 
  Download, 
  Share2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Lock, 
  ChevronRight, 
  ArrowUpRight, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Heart, 
  GraduationCap, 
  Briefcase, 
  Hash, 
  LogOut,
  Sparkles,
  HelpCircle,
  QrCode,
  Edit3,
  TrendingUp,
  Award,
  Zap,
  Fingerprint,
  RefreshCw,
  Loader2,
  Globe,
  Building2,
  Users,
  Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useUser, useCollection, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { collection, query, where, orderBy } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'
import { format, parseISO, differenceInDays } from 'date-fns'
import { PlaceHolderImages } from '@/lib/placeholder-images'

/**
 * Account Dashboard: Premium user interface for Human Rights Affairs Trust members.
 * Unified hub for profile management, membership tracking, and contribution history.
 */
export default function UserAccountDashboard() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const [activeTab, setActiveTab] = useState('overview')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Data Fetching: Find member profile linked to current user email
  const memberQuery = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return query(collection(db, 'memberProfiles'), where('email', '==', user.email.toLowerCase()));
  }, [db, user?.email]);

  const { data: memberProfiles, loading: profileLoading } = useCollection(memberQuery);
  const profile = memberProfiles?.[0];

  // Data Fetching: Donation History
  const donationQuery = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return query(collection(db, 'donations'), where('email', '==', user.email.toLowerCase()), orderBy('createdAt', 'desc'));
  }, [db, user?.email]);

  const { data: donations, loading: donationLoading } = useCollection(donationQuery);

  // Stats Calculations
  const stats = useMemo(() => {
    if (!profile || !mounted) return { completion: 0, daysActive: 0, totalDonated: 0 };
    
    let completion = 0;
    const fields = ['name', 'phone', 'address', 'imageId', 'bloodGroup', 'aadhaar', 'profession', 'education'];
    fields.forEach(f => { if (profile[f]) completion += (100 / fields.length); });

    const totalDonated = (donations || []).reduce((acc, curr: any) => acc + Number(curr.amount || 0), 0);
    
    let daysActive = 0;
    if (profile.joiningDate) {
      try {
        const join = new Date(profile.joiningDate);
        daysActive = Math.max(0, differenceInDays(new Date(), join));
      } catch (e) {}
    }

    return { completion: Math.round(completion), daysActive, totalDonated };
  }, [profile, donations, mounted]);

  if (!mounted || authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Accessing National Registry...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-md w-full rounded-[2.5rem] border-none shadow-2xl p-10 text-center">
           <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-slate-400" />
           </div>
           <h2 className="text-2xl font-headline font-bold text-primary mb-2">Secure Access Required</h2>
           <p className="text-slate-500 mb-8 leading-relaxed">Please authenticate through the mission portal to access your private dashboard.</p>
           <Button asChild className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-secondary transition-all">
             <Link href="/internal/login">Authorized Login</Link>
           </Button>
        </Card>
      </main>
    )
  }

  const genderKey = (profile?.gender || '').trim().toLowerCase();
  let fallbackImg = '/dummy m.png';
  if (genderKey === 'female' || genderKey === 'f' || genderKey === 'woman') {
    fallbackImg = '/dummy w.png';
  } else if (genderKey === 'male' || genderKey === 'm' || genderKey === 'man') {
    fallbackImg = '/dummy m.png';
  }
  
  const isCustomPhoto = profile?.imageId && (profile.imageId.startsWith('data:') || profile.imageId.startsWith('http'));
  const placeholder = PlaceHolderImages.find(i => i.id === profile?.imageId)?.imageUrl;
  
  const finalDisplayImg = isCustomPhoto ? profile.imageId : (placeholder || user.photoURL || fallbackImg);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl">
                 <ShieldCheck className="w-5 h-5 text-accent" />
              </div>
              <h1 className="text-sm md:text-lg font-headline font-bold text-primary dark:text-white uppercase tracking-tight">Personnel <span className="text-accent italic">Dashboard</span></h1>
           </div>
           <div className="flex items-center gap-4">
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 font-bold text-[9px] uppercase tracking-widest hidden sm:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" /> Live Session
              </Badge>
              <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-red-500">
                 <LogOut className="w-5 h-5" />
              </Button>
           </div>
        </div>
      </header>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Column: Profile Overview */}
            <div className="lg:col-span-4 space-y-8">
               <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 relative group">
                  <div className="absolute top-0 left-0 w-full h-32 bg-primary">
                     <div className="absolute inset-0 bg-accent/5 opacity-50 skew-y-6 transform origin-top-left" />
                  </div>
                  <CardContent className="pt-16 pb-10 text-center relative z-10 px-8">
                     <div className="relative w-36 h-36 mx-auto mb-6">
                        <div className="absolute -inset-2 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl"></div>
                        <div className="relative w-full h-full rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                           <Image 
                             src={finalDisplayImg!} 
                             alt={user.displayName || 'User'} 
                             fill 
                             className="object-cover group-hover:scale-110 transition-transform duration-700" 
                           />
                        </div>
                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-primary shadow-lg hover:scale-110 transition-all">
                           <Camera className="w-4 h-4" />
                        </button>
                     </div>

                     <div className="space-y-1">
                        <h2 className="text-2xl font-headline font-bold text-primary dark:text-white leading-tight">
                           {profile?.name || user.displayName || 'Member Name'}
                        </h2>
                        <div className="flex items-center justify-center gap-2">
                           <Badge variant="outline" className="text-[10px] font-bold border-accent/20 text-accent uppercase tracking-widest px-3">
                              {profile?.memberId || 'PENDING ID'}
                           </Badge>
                           <Badge className={cn(
                             "text-[9px] font-black uppercase tracking-tighter px-3 h-5 border-none",
                             profile?.status === 'Active' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                           )}>
                             {profile?.status || 'Active'}
                           </Badge>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
                        <div className="text-left">
                           <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Joined On</p>
                           <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{profile?.joiningDate || 'Verification Pending'}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Chapter</p>
                           <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{profile?.stateName || 'Central Council'}</p>
                        </div>
                     </div>

                     <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                        <div className="flex flex-col text-left">
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Digital Verification</span>
                           <span className="text-[10px] font-bold text-primary dark:text-white">SCAN TO VERIFY</span>
                        </div>
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-100 dark:border-slate-800">
                           <Image 
                             src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=HRAT-MEMBER-${profile?.memberId || 'TEMP'}`} 
                             alt="QR ID" 
                             width={40} 
                             height={40} 
                           />
                        </div>
                     </div>

                     <Button className="w-full mt-6 h-12 rounded-xl bg-accent text-primary font-bold hover:bg-secondary hover:text-white transition-all shadow-lg shadow-accent/20 group">
                        <Edit3 className="w-4 h-4 mr-2" /> Modify Profile Data
                     </Button>
                  </CardContent>
               </Card>

               <Card className="border-none shadow-lg rounded-3xl bg-slate-900 text-white p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="text-xs font-black uppercase tracking-widest text-accent">Profile Completion</h3>
                       <span className="text-lg font-headline font-bold">{stats.completion}%</span>
                    </div>
                    <Progress value={stats.completion} className="h-1.5 bg-white/10" />
                    
                    <div className="space-y-3">
                       <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">Mandatory Actions</p>
                       <ul className="space-y-3">
                          {!profile?.imageId && <li className="flex items-center gap-3 text-[11px] font-medium text-slate-400 group cursor-pointer hover:text-accent"><Circle className="w-2 h-2 text-accent" /> Upload verified photo</li>}
                          {!profile?.phone && <li className="flex items-center gap-3 text-[11px] font-medium text-slate-400 group cursor-pointer hover:text-accent"><Circle className="w-2 h-2 text-accent" /> Authenticate mobile number</li>}
                          {!profile?.address && <li className="flex items-center gap-3 text-[11px] font-medium text-slate-400 group cursor-pointer hover:text-accent"><Circle className="w-2 h-2 text-accent" /> Provide residential proof</li>}
                          <li className="flex items-center gap-3 text-[11px] font-medium text-emerald-500"><CheckCircle2 className="w-3.5 h-3.5" /> Email identity verified</li>
                       </ul>
                    </div>
                  </div>
               </Card>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 px-4">Quick Governance Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                     {[
                       { label: 'Renew Term', icon: RefreshCw, color: 'text-blue-500' },
                       { label: 'Download ID', icon: FileText, color: 'text-emerald-500' },
                       { label: 'Request Aid', icon: HelpCircle, color: 'text-accent' },
                       { label: 'Share ID', icon: Share2, color: 'text-indigo-500' }
                     ].map((act, i) => (
                       <Button key={i} variant="outline" className="h-20 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                          <act.icon className={cn("w-5 h-5", act.color)} />
                          <span className="text-[9px] font-black uppercase tracking-tight">{act.label}</span>
                       </Button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-8">
               
               {/* Horizontal Statistics */}
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Days Active', value: stats.daysActive, icon: Clock, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Contributions', value: `₹${stats.totalDonated}`, icon: Heart, color: 'bg-red-50 text-red-600' },
                    { label: 'Certificates', value: profile?.id ? 2 : 0, icon: Award, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Requests', value: 0, icon: Zap, color: 'bg-amber-50 text-amber-600' }
                  ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-lg transition-all">
                       <CardContent className="p-6 flex flex-col gap-1">
                          <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-3", stat.color)}>
                             <stat.icon className="w-5 h-5" />
                          </div>
                          <p className="text-2xl font-headline font-bold text-primary dark:text-white leading-none">{stat.value}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                       </CardContent>
                    </Card>
                  ))}
               </div>

               <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-[1.75rem] shadow-sm mb-8 inline-flex w-full md:w-auto overflow-x-auto no-scrollbar">
                    <TabsList className="bg-transparent border-none p-0 flex">
                      {[
                        { id: 'overview', label: 'Overview', icon: Globe },
                        { id: 'personal', label: 'Personal', icon: User },
                        { id: 'membership', label: 'Membership', icon: Award },
                        { id: 'donations', label: 'History', icon: CreditCard },
                        { id: 'security', label: 'Security', icon: Lock }
                      ].map(tab => (
                        <TabsTrigger 
                          key={tab.id} 
                          value={tab.id} 
                          className="rounded-xl px-6 h-10 data-[state=active]:bg-accent data-[state=active]:text-primary font-bold text-xs uppercase tracking-widest transition-all"
                        >
                          <tab.icon className="w-3.5 h-3.5 mr-2" />
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
                     <div className="grid md:grid-cols-2 gap-8">
                        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                           <CardHeader className="p-8 pb-0">
                              <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                                 <History className="w-5 h-5 text-accent" /> Activity Stream
                              </CardTitle>
                           </CardHeader>
                           <CardContent className="p-8">
                              <div className="space-y-8 relative">
                                 <div className="absolute top-0 left-[15px] bottom-0 w-0.5 bg-slate-50 dark:bg-slate-800" />
                                 {[
                                   { title: 'Profile Synchronized', time: '2h ago', icon: RefreshCw, color: 'bg-blue-500' },
                                   { title: 'Identity Authenticated', time: 'Yesterday', icon: Fingerprint, color: 'bg-emerald-500' },
                                   { title: 'Commissioned in National Registry', time: '3 days ago', icon: Award, color: 'bg-accent' }
                                 ].map((act, i) => (
                                   <div key={i} className="flex gap-6 relative z-10">
                                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg shrink-0", act.color)}>
                                         <act.icon className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1">
                                         <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{act.title}</p>
                                         <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{act.time}</p>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                           <CardHeader className="p-8 pb-0">
                              <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                                 <Bell className="w-5 h-5 text-accent" /> Notifications
                              </CardTitle>
                           </CardHeader>
                           <CardContent className="p-8">
                              <div className="space-y-4">
                                 <div className="p-4 bg-accent/5 rounded-2xl border border-accent/20 flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                                       <Sparkles className="w-5 h-5 text-accent" />
                                    </div>
                                    <div className="space-y-1">
                                       <p className="text-[11px] font-bold text-primary dark:text-white leading-tight">Welcome to JusticeShield</p>
                                       <p className="text-[10px] text-slate-500">Your personnel credentials are now live in the National Registry.</p>
                                    </div>
                                 </div>
                                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex gap-4 opacity-60">
                                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                       <ShieldCheck className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="space-y-1">
                                       <p className="text-[11px] font-bold text-slate-500 leading-tight">Registry System Update</p>
                                       <p className="text-[10px] text-slate-500">Scheduled maintenance completed successfully.</p>
                                    </div>
                                 </div>
                              </div>
                           </CardContent>
                        </Card>
                     </div>

                     <Card className="rounded-[2.5rem] border-none shadow-sm bg-slate-900 text-white overflow-hidden p-10 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                           <div className="space-y-4 text-center md:text-left">
                              <h3 className="text-3xl font-headline font-bold leading-tight">Mission <span className="text-accent italic">Support Center</span></h3>
                              <p className="text-slate-400 text-sm max-w-md">Need administrative assistance or legal guidance regarding your profile? Our support cell is standing by.</p>
                              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                 <Button className="rounded-xl bg-accent text-primary font-bold px-8 h-12 shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all">Contact Support</Button>
                                 <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10 h-12 px-8">Frequently Asked Questions</Button>
                              </div>
                           </div>
                           <div className="w-32 h-32 md:w-48 md:h-48 relative animate-float">
                              <Image src="/HRAT%20Logo.jpeg" alt="HRAT Seal" fill className="object-contain opacity-20" />
                           </div>
                        </div>
                     </Card>
                  </TabsContent>

                  <TabsContent value="personal" className="animate-in slide-in-from-right-4 duration-500">
                     <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                        <CardHeader className="p-8 md:p-12 border-b">
                           <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                              <User className="w-6 h-6 text-accent" /> Identity Particulars
                           </CardTitle>
                           <CardDescription>Verified personal data established during commissioning.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12">
                           <div className="grid md:grid-cols-2 gap-12">
                              <div className="space-y-8">
                                 {[
                                   { label: 'Full Legal Name', value: profile?.name, icon: User },
                                   { label: 'Official Identity (Email)', value: profile?.email || user.email, icon: Mail },
                                   { label: 'Primary Contact', value: profile?.phone, icon: Phone },
                                   { label: 'Medical (Blood Group)', value: profile?.bloodGroup, icon: Heart }
                                 ].map((item, i) => (
                                   <div key={i} className="flex gap-4 group">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-accent transition-colors">
                                         <item.icon className="w-5 h-5" />
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                                         <span className="font-bold text-primary dark:text-white">{item.value || 'Not Recorded'}</span>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                              <div className="space-y-8">
                                 {[
                                   { label: 'Verified Address', value: profile?.address, icon: MapPin },
                                   { label: 'Post Office', value: profile?.postOffice, icon: Building2 },
                                   { label: 'Police Station', value: profile?.policeStation, icon: ShieldCheck },
                                   { label: 'Jurisdiction (PIN)', value: profile?.pinCode, icon: Globe }
                                 ].map((item, i) => (
                                   <div key={i} className="flex gap-4 group">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-accent transition-colors">
                                         <item.icon className="w-5 h-5" />
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                                         <span className="font-bold text-primary dark:text-white leading-relaxed">{item.value || 'Not Recorded'}</span>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </div>
                           <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 grid md:grid-cols-2 gap-8">
                              <div>
                                 <p className="text-[10px] font-black uppercase text-accent tracking-[0.2em] mb-4">Academic & Professional</p>
                                 <div className="space-y-4">
                                    <div className="flex gap-4">
                                       <GraduationCap className="w-5 h-5 text-slate-400" />
                                       <p className="text-sm font-medium italic">"{profile?.education || 'Educational credentials pending review.'}"</p>
                                    </div>
                                    <div className="flex gap-4">
                                       <Briefcase className="w-5 h-5 text-slate-400" />
                                       <p className="text-sm font-medium italic">"{profile?.experience || 'No professional history recorded.'}"</p>
                                    </div>
                                 </div>
                              </div>
                              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-center">
                                 <div className="space-y-2">
                                    <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                                    <p className="text-[10px] font-bold uppercase text-slate-500">Verification Integrity</p>
                                    <p className="text-xs text-slate-400 italic">"Personal data is immutable once verified. Contact the National Cell for corrections."</p>
                                 </div>
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  <TabsContent value="membership" className="animate-in slide-in-from-right-4 duration-500">
                     <div className="grid md:grid-cols-3 gap-8">
                        <Card className="md:col-span-2 rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                           <CardHeader className="p-8 md:p-12 border-b">
                              <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                                 <Award className="w-6 h-6 text-accent" /> Institutional Status
                              </CardTitle>
                           </CardHeader>
                           <CardContent className="p-8 md:p-12">
                              <div className="grid sm:grid-cols-2 gap-y-10 gap-x-12">
                                 {[
                                   { label: 'Category', value: profile?.designationCategory, icon: Users },
                                   { label: 'Role Designation', value: profile?.designation, icon: Star },
                                   { label: 'Operational Level', value: profile?.level, icon: ShieldCheck },
                                   { label: 'Expiry (System Warning)', value: profile?.expiryDate, icon: AlertCircle, red: true },
                                   { label: 'Registration Ref', value: profile?.memberId, icon: Hash },
                                   { label: 'Issuance Term', value: profile?.membershipDuration, icon: Calendar }
                                 ].map((item, i) => (
                                   <div key={i} className="flex gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                         <item.icon className={cn("w-5 h-5", item.red && "text-red-500")} />
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                                         <span className={cn("font-bold text-primary dark:text-white uppercase truncate max-w-[180px]", item.red && "text-red-600")}>{item.value || 'N/A'}</span>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </CardContent>
                        </Card>
                        
                        <div className="space-y-8">
                           <Card className="rounded-[2.5rem] bg-primary text-white border-none shadow-2xl p-8 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-accent mb-6">Digital Portfolio</h4>
                              <div className="space-y-4">
                                 <Link href={profile?.id ? `/internal/members/${profile.id}/id-card` : '#'} className="block">
                                    <Button variant="outline" className="w-full h-14 rounded-xl border-white/20 bg-white/5 hover:bg-accent hover:text-primary transition-all text-xs font-bold uppercase tracking-widest gap-3 justify-start">
                                       <FileText className="w-4 h-4 text-accent" /> Member ID Card
                                    </Button>
                                 </Link>
                                 <Link href={profile?.id ? `/internal/members/${profile.id}/certificate` : '#'} className="block">
                                    <Button variant="outline" className="w-full h-14 rounded-xl border-white/20 bg-white/5 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest gap-3 justify-start">
                                       <Award className="w-4 h-4 text-emerald-400" /> Introduction Cert
                                    </Button>
                                 </Link>
                                 <Link href={profile?.id ? `/internal/members/${profile.id}/appointment` : '#'} className="block">
                                    <Button variant="outline" className="w-full h-14 rounded-xl border-white/20 bg-white/5 hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest gap-3 justify-start">
                                       <FileText className="w-4 h-4 text-indigo-400" /> Appointment Letter
                                    </Button>
                                 </Link>
                              </div>
                           </Card>

                           <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border text-center space-y-4">
                              <QrCode className="w-12 h-12 text-slate-200 mx-auto" />
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Share Verification</p>
                              <p className="text-xs text-slate-500 italic">Generate a secure link to share your digital credentials with authorities.</p>
                              <Button variant="ghost" className="text-accent font-bold text-xs uppercase tracking-widest hover:bg-accent/10">Share Digital ID</Button>
                           </div>
                        </div>
                     </div>
                  </TabsContent>

                  <TabsContent value="donations" className="animate-in slide-in-from-right-4 duration-500">
                     <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                        <CardHeader className="p-8 md:p-12 border-b flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <div className="space-y-1">
                              <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                                 <Heart className="w-6 h-6 text-red-500" /> Contribution Ledger
                              </CardTitle>
                              <CardDescription>Comprehensive record of mission-supporting donations.</CardDescription>
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border text-center md:text-right shrink-0">
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Lifetime Total</p>
                              <p className="text-3xl font-headline font-bold text-emerald-600">₹{stats.totalDonated.toLocaleString()}</p>
                           </div>
                        </CardHeader>
                        <CardContent className="p-0">
                           <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                 <thead className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b">
                                    <tr>
                                       <th className="px-10 py-6">Date</th>
                                       <th className="px-10 py-6">Amount</th>
                                       <th className="px-10 py-6">Reference / ID</th>
                                       <th className="px-10 py-6">Method</th>
                                       <th className="px-10 py-6 text-right">Receipt</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {(donations || []).map((d: any) => (
                                       <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                          <td className="px-10 py-6 text-sm font-bold text-slate-700 dark:text-slate-300">{d.timestamp?.split(',')[0]}</td>
                                          <td className="px-10 py-6 text-sm font-black text-primary dark:text-white">₹{Number(d.amount).toLocaleString()}</td>
                                          <td className="px-10 py-6 text-[11px] font-mono text-slate-400 uppercase">{d.transactionId}</td>
                                          <td className="px-10 py-6">
                                             <Badge variant="outline" className="text-[8px] font-bold uppercase border-slate-100">{d.paymentMethod}</Badge>
                                          </td>
                                          <td className="px-10 py-6 text-right">
                                             <Button variant="ghost" size="icon" className="text-accent hover:bg-accent/10 rounded-lg">
                                                <Download className="w-4 h-4" />
                                             </Button>
                                          </td>
                                       </tr>
                                    ))}
                                    {(!donations || donations.length === 0) && (
                                      <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                           <Heart className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No donations recorded for this identity.</p>
                                        </td>
                                      </tr>
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  <TabsContent value="security" className="animate-in slide-in-from-right-4 duration-500">
                     <div className="grid md:grid-cols-2 gap-8">
                        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8 md:p-12 space-y-10">
                           <div className="space-y-1">
                              <h3 className="text-xl font-headline font-bold flex items-center gap-2">
                                 <Lock className="w-5 h-5 text-accent" /> Passphrase Governance
                              </h3>
                              <p className="text-sm text-slate-400">Regularly updating your security key ensures registry sovereignty.</p>
                           </div>
                           
                           <div className="space-y-6">
                              <div className="space-y-2">
                                 <Label className="text-[10px] font-bold uppercase text-slate-400">Current Security Key</Label>
                                 <Input type="password" value="••••••••••••" disabled className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl h-11" />
                              </div>
                              <Button className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-secondary">Initialize Update Protocol</Button>
                           </div>

                           <div className="pt-8 border-t space-y-4">
                              <div className="flex items-center justify-between">
                                 <div className="space-y-0.5">
                                    <p className="text-xs font-bold">Two-Factor Authentication</p>
                                    <p className="text-[10px] text-slate-400">Add an extra layer of protection to your account.</p>
                                 </div>
                                 <Badge className="bg-slate-100 text-slate-400 uppercase text-[8px] font-black h-5 px-3">COMING SOON</Badge>
                              </div>
                           </div>
                        </Card>

                        <div className="space-y-8">
                           <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Credential Status</h4>
                              <div className="space-y-4">
                                 <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900">
                                    <div className="flex items-center gap-3">
                                       <Mail className="w-4 h-4 text-emerald-600" />
                                       <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Email Identity Verified</span>
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                 </div>
                                 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 opacity-60">
                                    <div className="flex items-center gap-3">
                                       <Phone className="w-4 h-4 text-slate-400" />
                                       <span className="text-xs font-bold text-slate-50">Mobile Verification Pending</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6 text-[8px] font-black uppercase text-accent hover:bg-accent/10">Start</Button>
                                 </div>
                              </div>
                           </Card>

                           <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Recent Login Activity</h4>
                              <div className="space-y-4">
                                 {[
                                   { location: 'Kolkata, WB (Current)', device: 'Chrome / MacOS', time: 'Just now', ok: true },
                                   { location: 'Delhi, IN', device: 'Safari / iOS', time: '3 days ago', ok: true }
                                 ].map((log, i) => (
                                   <div key={i} className="flex items-start gap-4">
                                      <div className={cn("w-2 h-2 rounded-full mt-1.5", log.ok ? 'bg-emerald-500' : 'bg-red-500')}></div>
                                      <div className="space-y-0.5">
                                         <p className="text-[11px] font-bold text-primary dark:text-white leading-none">{log.location}</p>
                                         <p className="text-[9px] text-slate-500 uppercase tracking-tighter">{log.device} • {log.time}</p>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </Card>
                        </div>
                     </div>
                  </TabsContent>
               </Tabs>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function Circle({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}
