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
  Star,
  ShieldAlert,
  Circle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useUser, useCollection, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase'
import { collection, query, where, orderBy, doc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'
import { format, parseISO, differenceInDays } from 'date-fns'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useRouter } from 'next/navigation'

/**
 * Account Dashboard: Premium user interface for Human Rights Affairs Trust members and personnel.
 * Fully responsive stackable layout for all mobile devices.
 */
export default function UserAccountDashboard() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const auth = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // User Account Metadata from Registry
  const userRegistryRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);
  const { data: userAccount, loading: registryLoading } = useDoc(userRegistryRef);

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

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  }

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

  const isMemberRole = userAccount?.role === 'member';
  const hasIntelligenceAccess = userAccount?.permissions?.memberAnalytics || userAccount?.permissions?.analytics;

  if (!mounted || authLoading || profileLoading || registryLoading) {
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
        <Card className="max-w-md w-full rounded-[2rem] md:rounded-[2.5rem] border-none shadow-2xl p-8 md:p-10 text-center">
           <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />
           </div>
           <h2 className="text-xl md:text-2xl font-headline font-bold text-primary mb-2">Secure Access Required</h2>
           <p className="text-slate-500 mb-8 leading-relaxed text-sm">Please authenticate through the mission portal to access your private dashboard.</p>
           <div className="grid gap-3">
             <Button asChild className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-secondary transition-all">
               <Link href="/member-login">Member Login</Link>
             </Button>
             <Button asChild variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all">
               <Link href="/internal/login">Authorized Staff Entry</Link>
             </Button>
           </div>
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 w-full overflow-x-hidden">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary rounded-lg">
                 <ShieldCheck className="w-4 h-4 text-accent" />
              </div>
              <h1 className="text-[10px] md:text-lg font-headline font-bold text-primary dark:text-white uppercase tracking-tight">
                {isMemberRole ? 'Member' : 'Personnel'} <span className="text-accent italic">Dashboard</span>
              </h1>
           </div>
           <div className="flex items-center gap-3 md:gap-4">
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 font-bold text-[8px] md:text-[9px] uppercase tracking-widest hidden xs:flex">
                <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 animate-pulse" /> Live Session
              </Badge>
              <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full text-slate-400 hover:text-red-500">
                 <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
           </div>
        </div>
      </header>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Column: Profile Overview */}
            <div className="lg:col-span-4 space-y-6 md:space-y-8">
               <Card className="border-none shadow-xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 relative group">
                  <div className={cn("absolute top-0 left-0 w-full h-24 md:h-32", isMemberRole ? "bg-secondary" : "bg-primary")}>
                     <div className="absolute inset-0 bg-accent/5 opacity-50 skew-y-6 transform origin-top-left" />
                  </div>
                  <CardContent className="pt-12 md:pt-16 pb-8 md:pb-10 text-center relative z-10 px-6 md:px-8">
                     <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-6">
                        <div className="absolute -inset-2 bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl"></div>
                        <div className="relative w-full h-full rounded-[1.25rem] md:rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                           <Image 
                             src={finalDisplayImg!} 
                             alt={user.displayName || 'User'} 
                             fill 
                             className="object-cover group-hover:scale-110 transition-transform duration-700" 
                           />
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-accent rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-primary shadow-lg hover:scale-110 transition-all">
                           <Camera className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                     </div>

                     <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-headline font-bold text-primary dark:text-white leading-tight">
                           {profile?.name || user.displayName || 'Member Name'}
                        </h2>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                           <Badge variant="outline" className="text-[8px] md:text-[10px] font-bold border-accent/20 text-accent uppercase tracking-widest px-2 md:px-3">
                              {profile?.memberId || 'PENDING ID'}
                           </Badge>
                           <Badge className={cn(
                             "text-[8px] md:text-[9px] font-black uppercase tracking-tighter px-2 md:px-3 h-5 border-none",
                             profile?.status === 'Active' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                           )}>
                             {profile?.status || 'Active'}
                           </Badge>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mt-6 md:mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
                        <div className="text-left">
                           <p className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Joined On</p>
                           <p className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300">{profile?.joiningDate || 'Pending'}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Chapter</p>
                           <p className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300">{profile?.stateName || 'Central'}</p>
                        </div>
                     </div>

                     <div className="mt-6 md:mt-8 p-3 md:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                        <div className="flex flex-col text-left">
                           <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest">Verification</span>
                           <span className="text-[8px] md:text-[10px] font-bold text-primary dark:text-white uppercase">Scan to Verify</span>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-100 dark:border-slate-800">
                           <Image 
                             src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=HRAT-MEMBER-${profile?.memberId || 'TEMP'}`} 
                             alt="QR ID" 
                             width={40} 
                             height={40} 
                           />
                        </div>
                     </div>

                     {!isMemberRole && (
                       <Button className="w-full mt-6 h-12 rounded-xl bg-accent text-primary font-bold hover:bg-secondary hover:text-white transition-all shadow-lg shadow-accent/20 group">
                          <Edit3 className="w-4 h-4 mr-2" /> Modify Profile Data
                       </Button>
                     )}
                  </CardContent>
               </Card>

               {!isMemberRole && (
                 <Card className="border-none shadow-lg rounded-2xl md:rounded-3xl bg-slate-900 text-white p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-center">
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-accent">Completion</h3>
                         <span className="text-base md:text-lg font-headline font-bold">{stats.completion}%</span>
                      </div>
                      <Progress value={stats.completion} className="h-1.5 bg-white/10" />
                      
                      <div className="space-y-3">
                         <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">Mandatory</p>
                         <ul className="space-y-2 md:space-y-3">
                            {!profile?.imageId && <li className="flex items-center gap-3 text-[10px] md:text-[11px] font-medium text-slate-400 group cursor-pointer hover:text-accent"><Circle className="w-1.5 h-1.5 text-accent" /> Upload photo</li>}
                            {!profile?.phone && <li className="flex items-center gap-3 text-[10px] md:text-[11px] font-medium text-slate-400 group cursor-pointer hover:text-accent"><Circle className="w-1.5 h-1.5 text-accent" /> Verify mobile</li>}
                            <li className="flex items-center gap-3 text-[10px] md:text-[11px] font-medium text-emerald-500"><CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> Email verified</li>
                         </ul>
                      </div>
                    </div>
                 </Card>
               )}

               <div className="space-y-3 md:space-y-4">
                  <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 px-4">Registry Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                     {[
                       { label: 'Renew Term', icon: RefreshCw, color: 'text-blue-500', hide: isMemberRole },
                       { label: 'Download ID', icon: FileText, color: 'text-emerald-500' },
                       { label: 'Request Aid', icon: HelpCircle, color: 'text-accent' },
                       { label: 'Share ID', icon: Share2, color: 'text-indigo-500' }
                     ].filter(a => !a.hide).map((act, i) => (
                       <Button key={i} variant="outline" className="h-16 md:h-20 rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                          <act.icon className={cn("w-4 h-4 md:w-5 md:h-5", act.color)} />
                          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tight">{act.label}</span>
                       </Button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-6 md:space-y-8">
               
               {/* Horizontal Statistics */}
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  {[
                    { label: 'Days Active', value: stats.daysActive, icon: Clock, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Contribution', value: `₹${stats.totalDonated}`, icon: Heart, color: 'bg-red-50 text-red-600' },
                    { label: 'Certificates', value: profile?.id ? 1 : 0, icon: Award, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Requests', value: 0, icon: Zap, color: 'bg-amber-50 text-amber-600' }
                  ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-2xl md:rounded-[2rem] overflow-hidden group hover:shadow-lg transition-all">
                       <CardContent className="p-4 md:p-6 flex flex-col gap-1">
                          <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-3", stat.color)}>
                             <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                          <p className="text-xl md:text-2xl font-headline font-bold text-primary dark:text-white leading-none truncate">{stat.value}</p>
                          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{stat.label}</p>
                       </CardContent>
                    </Card>
                  ))}
               </div>

               <Tabs defaultValue={isMemberRole && !hasIntelligenceAccess ? "personal" : "overview"} className="w-full" onValueChange={setActiveTab}>
                  <div className="bg-white dark:bg-slate-900 p-1 rounded-xl md:rounded-[1.75rem] shadow-sm mb-6 md:mb-8 inline-flex w-full md:w-auto overflow-x-auto no-scrollbar">
                    <TabsList className="bg-transparent border-none p-0 flex">
                      {[
                        { id: 'overview', label: 'Overview', icon: Globe, hide: isMemberRole && !hasIntelligenceAccess },
                        { id: 'personal', label: 'Identity', icon: User },
                        { id: 'membership', label: 'Institutional', icon: Award },
                        { id: 'donations', label: 'Financials', icon: CreditCard },
                        { id: 'security', label: 'Security', icon: Lock, hide: isMemberRole }
                      ].filter(t => !t.hide).map(tab => (
                        <TabsTrigger 
                          key={tab.id} 
                          value={tab.id} 
                          className="rounded-lg md:rounded-xl px-4 md:px-6 h-9 md:h-10 data-[state=active]:bg-accent data-[state=active]:text-primary font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all shrink-0"
                        >
                          <tab.icon className="w-3.5 h-3.5 mr-2 hidden xs:inline" />
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <TabsContent value="overview" className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                          <Card className="rounded-[2rem] md:rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                            <CardHeader className="p-6 md:p-8 pb-0">
                                <CardTitle className="text-base md:text-lg font-headline font-bold flex items-center gap-2">
                                  <History className="w-5 h-5 text-accent" /> Activity Stream
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8">
                                <div className="space-y-6 md:space-y-8 relative">
                                  <div className="absolute top-0 left-[15px] bottom-0 w-0.5 bg-slate-50 dark:bg-slate-800" />
                                  {[
                                    { title: 'Profile Synchronized', time: '2h ago', icon: RefreshCw, color: 'bg-blue-500' },
                                    { title: 'Identity Authenticated', time: 'Yesterday', icon: Fingerprint, color: 'bg-emerald-500' },
                                    { title: 'Commissioned', time: '3 days ago', icon: Award, color: 'bg-accent' }
                                  ].map((act, i) => (
                                    <div key={i} className="flex gap-4 md:gap-6 relative z-10">
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg shrink-0", act.color)}>
                                          <act.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{act.title}</p>
                                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">{act.time}</p>
                                        </div>
                                    </div>
                                  ))}
                                </div>
                            </CardContent>
                          </Card>

                          <Card className="rounded-[2rem] md:rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                            <CardHeader className="p-6 md:p-8 pb-0">
                                <CardTitle className="text-base md:text-lg font-headline font-bold flex items-center gap-2">
                                  <Bell className="w-5 h-5 text-accent" /> Notifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8">
                                <div className="space-y-3 md:space-y-4">
                                  <div className="p-3 md:p-4 bg-accent/5 rounded-xl md:rounded-2xl border border-accent/20 flex gap-3 md:gap-4">
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="text-[10px] md:text-[11px] font-bold text-primary dark:text-white leading-tight">Welcome to Shield</p>
                                        <p className="text-[9px] md:text-[10px] text-slate-500 leading-tight">Your credentials are now live.</p>
                                      </div>
                                  </div>
                                  <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl md:rounded-2xl flex gap-3 md:gap-4 opacity-60">
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="text-[10px] md:text-[11px] font-bold text-slate-500 leading-tight">System Update</p>
                                        <p className="text-[9px] md:text-[10px] text-slate-500 leading-tight">Maintenance completed.</p>
                                      </div>
                                  </div>
                                </div>
                            </CardContent>
                          </Card>
                      </div>

                      <Card className="rounded-[2rem] md:rounded-[2.5rem] border-none shadow-sm bg-slate-900 text-white overflow-hidden p-6 md:p-10 relative">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                            <div className="space-y-4 text-center md:text-left">
                                <h3 className="text-2xl md:text-3xl font-headline font-bold leading-tight">Mission <span className="text-accent italic">Support Cell</span></h3>
                                <p className="text-slate-400 text-xs md:text-sm max-w-md">Need administrative assistance or legal guidance regarding your profile?</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                  <Button className="rounded-xl bg-accent text-primary font-bold px-6 h-11 text-xs shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all">Contact Support</Button>
                                  <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10 h-11 px-6 text-xs">FAQs</Button>
                                </div>
                            </div>
                            <div className="w-24 h-24 md:w-32 md:h-32 relative animate-float opacity-30">
                                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Seal" fill className="object-contain" />
                            </div>
                          </div>
                      </Card>
                  </TabsContent>

                  <TabsContent value="personal" className="animate-in slide-in-from-right-4 duration-500">
                     <Card className="rounded-[2rem] md:rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                        <CardHeader className="p-6 md:p-12 border-b">
                           <CardTitle className="text-xl md:text-2xl font-headline font-bold flex items-center gap-3">
                              <User className="w-5 h-5 md:w-6 md:h-6 text-accent" /> Identity Particulars
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-12">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                              <div className="space-y-6 md:space-y-8">
                                 {[
                                   { label: 'Full Legal Name', value: profile?.name, icon: User },
                                   { label: 'Official Identity', value: profile?.email || user.email, icon: Mail },
                                   { label: 'Primary Contact', value: profile?.phone, icon: Phone },
                                   { label: 'Medical Group', value: profile?.bloodGroup, icon: Heart }
                                 ].map((item, i) => (
                                   <div key={i} className="flex gap-3 md:gap-4 group">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-accent transition-colors shrink-0">
                                         <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                         <span className="text-[7px] md:text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                                         <span className="font-bold text-primary dark:text-white truncate">{item.value || 'Not Recorded'}</span>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                              <div className="space-y-6 md:space-y-8">
                                 {[
                                   { label: 'Residential Address', value: profile?.address, icon: MapPin },
                                   { label: 'Post Office', value: profile?.postOffice, icon: Building2 },
                                   { label: 'Police Station', value: profile?.policeStation, icon: ShieldCheck },
                                   { label: 'Jurisdiction (PIN)', value: profile?.pinCode, icon: Globe }
                                 ].map((item, i) => (
                                   <div key={i} className="flex gap-3 md:gap-4 group">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-accent transition-colors shrink-0">
                                         <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                         <span className="text-[7px] md:text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                                         <span className="font-bold text-primary dark:text-white leading-relaxed text-xs md:text-sm">{item.value || 'Not Recorded'}</span>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  <TabsContent value="membership" className="animate-in slide-in-from-right-4 duration-500">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <Card className="md:col-span-2 rounded-[2rem] md:rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                           <CardHeader className="p-6 md:p-12 border-b">
                              <CardTitle className="text-xl md:text-2xl font-headline font-bold flex items-center gap-3">
                                 <Award className="w-5 h-5 md:w-6 md:h-6 text-accent" /> Institutional Status
                              </CardTitle>
                           </CardHeader>
                           <CardContent className="p-6 md:p-12">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 md:gap-y-10 gap-x-12">
                                 {[
                                   { label: 'Category', value: profile?.designationCategory, icon: Users },
                                   { label: 'Role Designation', value: profile?.designation, icon: Star },
                                   { label: 'Operational Level', value: profile?.level, icon: ShieldCheck },
                                   { label: 'Expiry Alert', value: profile?.expiryDate, icon: AlertCircle, red: true },
                                   { label: 'Registry Ref', value: profile?.memberId, icon: Hash },
                                   { label: 'Issuance Term', value: profile?.membershipDuration, icon: Calendar }
                                 ].map((item, i) => (
                                   <div key={i} className="flex gap-4 min-w-0">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                         <item.icon className={cn("w-4 h-4 md:w-5 md:h-5", item.red && "text-red-500")} />
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                         <span className="text-[7px] md:text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                                         <span className={cn("font-bold text-primary dark:text-white uppercase truncate", item.red && "text-red-600")}>{item.value || 'N/A'}</span>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </CardContent>
                        </Card>
                        
                        <div className="space-y-6 md:space-y-8">
                           <Card className="rounded-[2rem] md:rounded-[2.5rem] bg-primary text-white border-none shadow-2xl p-6 md:p-8 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                              <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-accent mb-6">Digital Portfolio</h4>
                              <div className="space-y-3 md:space-y-4">
                                 <Link href={profile?.id ? `/internal/members/${profile.id}/id-card` : '#'} className="block">
                                    <Button variant="outline" className="w-full h-12 md:h-14 rounded-xl border-white/20 bg-white/5 hover:bg-accent hover:text-primary transition-all text-[10px] font-bold uppercase tracking-widest gap-2 md:gap-3 justify-start">
                                       <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" /> Member ID Card
                                    </Button>
                                 </Link>
                                 <Link href={profile?.id ? `/internal/members/${profile.id}/certificate` : '#'} className="block">
                                    <Button variant="outline" className="w-full h-12 md:h-14 rounded-xl border-white/20 bg-white/5 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest gap-2 md:gap-3 justify-start">
                                       <Award className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" /> Introduction Cert
                                    </Button>
                                 </Link>
                              </div>
                           </Card>
                        </div>
                     </div>
                  </TabsContent>

                  <TabsContent value="donations" className="animate-in slide-in-from-right-4 duration-500">
                     <Card className="rounded-[2rem] md:rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                        <CardHeader className="p-6 md:p-12 border-b flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <div className="space-y-1">
                              <CardTitle className="text-xl md:text-2xl font-headline font-bold flex items-center gap-3">
                                 <Heart className="w-5 h-5 md:w-6 md:h-6 text-red-500" /> Contribution Ledger
                              </CardTitle>
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-800 p-3 md:p-4 rounded-xl md:rounded-2xl border text-center md:text-right shrink-0">
                              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Lifetime Total</p>
                              <p className="text-xl md:text-3xl font-headline font-bold text-emerald-600">₹{stats.totalDonated.toLocaleString()}</p>
                           </div>
                        </CardHeader>
                        <CardContent className="p-0">
                           <div className="overflow-x-auto w-full">
                              <table className="w-full text-left min-w-[600px]">
                                 <thead className="bg-slate-50 dark:bg-slate-800/50 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                    <tr>
                                       <th className="px-6 md:px-10 py-4 md:py-6">Date</th>
                                       <th className="px-6 md:px-10 py-4 md:py-6">Amount</th>
                                       <th className="px-6 md:px-10 py-4 md:py-6">Reference</th>
                                       <th className="px-6 md:px-10 py-4 md:py-6 text-right">Action</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {(donations || []).map((d: any) => (
                                       <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                          <td className="px-6 md:px-10 py-4 md:py-6 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">{d.timestamp?.split(',')[0]}</td>
                                          <td className="px-6 md:px-10 py-4 md:py-6 text-xs md:text-sm font-black text-primary dark:text-white">₹{Number(d.amount).toLocaleString()}</td>
                                          <td className="px-6 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-mono text-slate-400 uppercase">{d.transactionId}</td>
                                          <td className="px-6 md:px-10 py-4 md:py-6 text-right">
                                             <Button variant="ghost" size="icon" className="text-accent hover:bg-accent/10 rounded-lg h-8 w-8">
                                                <Download className="w-3.5 h-3.5" />
                                             </Button>
                                          </td>
                                       </tr>
                                    ))}
                                    {(!donations || donations.length === 0) && (
                                      <tr>
                                        <td colSpan={4} className="py-20 text-center">
                                           <Heart className="w-10 h-10 md:w-12 md:h-12 text-slate-100 mx-auto mb-4" />
                                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No records identified.</p>
                                        </td>
                                      </tr>
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </CardContent>
                     </Card>
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