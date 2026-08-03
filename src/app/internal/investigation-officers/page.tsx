
"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth'
import { firebaseConfig } from '@/firebase/config'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc, getDoc, writeBatch, where, getDocs } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  UserRoundCheck,
  Building2,
  X,
  Check,
  User,
  Mail,
  Phone,
  Fingerprint,
  Briefcase,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Navigation,
  ShieldAlert,
  ClipboardList,
  Wrench,
  Info,
  MapPin,
  Hash,
  Activity,
  Cpu,
  TrendingUp,
  UserCheck,
  Users,
  Star,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Footer } from '@/components/footer'

const OFFICER_DESIGNATIONS = [
  "Senior Investigation Officer",
  "Investigation Officer",
  "Assistant Investigation Officer",
  "Junior Investigation Officer",
  "Field Investigator"
]

export default function InvestigationOfficersRegistry() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isPurgeOpen, setIsPurgeOpen] = useState(false)
  const [editOfficer, setEditOfficer] = useState<any>(null)
  const [selectedOfficerForDetails, setSelectedOfficerForDetails] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Deletion States
  const [deleteDialogStep, setDeleteDialogStep] = useState<'confirm' | 'warning' | 'verify' | 'blocked' | null>(null)
  const [officerToDelete, setOfficerToDelete] = useState<any>(null)
  const [deleteInputText, setDeleteInputText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeAssignments, setActiveAssignments] = useState<any[]>([])
  const [blockReasons, setBlockReasons] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    password: '',
    designation: 'Investigation Officer',
    status: 'active' as 'active' | 'inactive'
  })

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com'

  useEffect(() => {
    if (!authLoading && !isRoot) {
      router.push('/internal/login')
    }
  }, [isRoot, authLoading, router])

  const officersQuery = useMemoFirebase(() => {
    if (!db || !isRoot) return null;
    return query(collection(db, 'investigation_officers'), orderBy('name', 'asc'));
  }, [db, isRoot]);

  const { data: rawOfficers, loading: dataLoading } = useCollection(officersQuery);

  const officers = useMemo(() => {
    return (rawOfficers || []).filter(o => o && typeof o === 'object' && o.id);
  }, [rawOfficers]);

  // Strategic Stats
  const stats = useMemo(() => {
    if (!officers) return { total: 0, active: 0, load: 0 };
    const total = officers.length;
    const active = officers.filter((o: any) => o.status === 'active').length;
    const load = officers.reduce((acc, curr: any) => acc + (curr.assignedCount || 0), 0);
    return { total, active, load };
  }, [officers]);

  const generateEmployeeId = () => {
    const numbers = '0123456789';
    let result = 'HRAT-IO-';
    for (let i = 0; i < 4; i++) {
      result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return result;
  }

  const generatePassword = () => {
    const name = (formData.name || 'OFF').trim();
    const phone = (formData.phone || '000').replace(/\D/g, '');
    let namePart = name.substring(0, 3);
    if (namePart.length < 3) namePart = namePart.padEnd(3, 'X');
    namePart = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
    const phonePart = (phone || '000').slice(-3).padStart(3, '0');
    const counter = (officers?.length || 0) + 1;
    return `${namePart}#${phonePart}${counter}`;
  }

  const validateOfficerMetadata = (officer: any) => {
    if (!officer || typeof officer !== 'object') return { isValid: false, reason: "Record unavailable." };
    const id = officer.id;
    let email = (officer.email || '').toLowerCase().trim();
    const name = (officer.name || 'Unknown Officer').trim();
    if (!email && id && id.includes('@')) email = id.toLowerCase().trim();
    if (!id) return { isValid: false, reason: "Internal ID missing." };
    return { isValid: true, id, email: email || null, name };
  };

  const handleStartDelete = async (officer: any) => {
    if (!db || !user) return;
    const validation = validateOfficerMetadata(officer);
    if (!validation.isValid) {
      toast({ variant: "destructive", title: "Registry Inconsistency", description: "Incomplete record." });
      return;
    }
    setOfficerToDelete(officer);
    setDeleteDialogStep('confirm');
  };

  const executeGovernanceAudit = async () => {
    if (!db || !user || !officerToDelete) return;
    setIsActionLoading(true);
    try {
      const complaintsRef = collection(db, 'public_complaints');
      const q = query(complaintsRef, where('status', 'not-in', ['Closed', 'Action Taken']));
      const snap = await getDocs(q);
      const officerName = (officerToDelete.name || '').trim();
      const conflictCases = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((c: any) => 
          (c.assignedTo && c.assignedTo.trim() === officerName) || 
          (c.assignedOfficers || []).some((o: any) => (o.name || '').trim() === officerName)
        );
      if (conflictCases.length > 0) {
        setActiveAssignments(conflictCases);
        setBlockReasons(["Active investigative assignments exist."]);
        setDeleteDialogStep('blocked');
      } else {
        setDeleteDialogStep('warning');
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Audit Error" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePurgeAllExceptRaisa = async () => {
    if (!db || !isRoot || !officers) return;
    setIsActionLoading(true);
    try {
      const batch = writeBatch(db);
      let count = 0;
      for (const officer of officers) {
        const officerName = (officer.name || '').trim();
        if (officerName === 'Raisa Das') continue;
        const validation = validateOfficerMetadata(officer);
        if (!validation.id) continue;
        batch.delete(doc(db, 'investigation_officers', validation.id));
        if (validation.email) batch.delete(doc(db, 'users', validation.email));
        count++;
      }
      await batch.commit();
      toast({ title: "Registry Purged", description: `${count} records removed.` });
      setIsPurgeOpen(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Purge Failed" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailVal = (formData.email || '').toLowerCase().trim();
    const nameVal = (formData.name || '').trim();
    const passVal = formData.password;
    if (!db || !isRoot || !nameVal || !emailVal || !passVal) return;

    setIsActionLoading(true)
    const tempAppName = `TempApp-${Date.now()}`
    const secondaryApp = initializeApp(firebaseConfig, tempAppName)
    const secondaryAuth = getAuth(secondaryApp)

    try {
      const authUserCredential = await createUserWithEmailAndPassword(secondaryAuth, emailVal, passVal)
      const authUser = authUserCredential.user
      await updateProfile(authUser, { displayName: nameVal })
      const batch = writeBatch(db)
      batch.set(doc(collection(db, 'investigation_officers')), {
        ...formData,
        name: nameVal,
        email: emailVal,
        uid: authUser.uid,
        assignedCount: 0,
        createdAt: serverTimestamp()
      })
      batch.set(doc(db, 'users', emailVal), {
        uid: authUser.uid, email: emailVal, name: nameVal, role: 'investigator', status: 'active',
        permissions: { publicView: true }, createdAt: serverTimestamp()
      })
      await batch.commit()
      toast({ title: "Officer Provisioned" })
      setFormData({ name: '', email: '', phone: '', employeeId: '', password: '', designation: 'Investigation Officer', status: 'active' })
      setIsAddOpen(false)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Provisioning Failed", description: e.message })
    } finally {
      await deleteApp(secondaryApp)
      setIsActionLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!db || !editOfficer) return;
    setIsActionLoading(true)
    try {
      const batch = writeBatch(db)
      const email = (editOfficer.email || '').toLowerCase().trim();
      batch.update(doc(db, 'investigation_officers', editOfficer.id), { ...editOfficer, updatedAt: serverTimestamp() })
      if (email) {
        batch.update(doc(db, 'users', email), { name: editOfficer.name, status: editOfficer.status, updatedAt: serverTimestamp() })
      }
      await batch.commit()
      toast({ title: "Profile Refreshed" })
      setEditOfficer(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Error" });
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!db || !officerToDelete || !isRoot || !user) return;
    setIsDeleting(true)
    try {
      const batch = writeBatch(db)
      const id = officerToDelete.id;
      let email = (officerToDelete.email || '').toLowerCase().trim();
      batch.delete(doc(db, 'investigation_officers', id))
      if (!email && id.includes('@')) email = id;
      if (email) batch.delete(doc(db, 'users', email.toLowerCase().trim()))
      const auditRef = doc(collection(db, 'deletion_audit_logs'));
      batch.set(auditRef, {
        adminId: user.uid, adminName: user.displayName || 'Root', targetId: officerToDelete.employeeId || 'N/A',
        targetName: officerToDelete.name || 'Incomplete Record', targetEmail: email || 'N/A', timestamp: new Date().toISOString(),
        status: "Permanently Purged"
      })
      await batch.commit()
      toast({ title: "Clearance Revoked" })
      setDeleteDialogStep(null)
      setOfficerToDelete(null)
      setDeleteInputText('')
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Failed" });
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = (officers || []).filter((o: any) => {
    if (!o) return false;
    const name = (o.name || '').toLowerCase();
    const designation = (o.designation || '').toLowerCase();
    const empId = (o.employeeId || '').toLowerCase();
    const s = (search || '').toLowerCase();
    return name.includes(s) || designation.includes(s) || empId.includes(s);
  });

  const getRankColor = (rank: string) => {
    if (rank.includes('Senior')) return 'bg-indigo-600';
    if (rank.includes('Assistant')) return 'bg-sky-500';
    if (rank.includes('Junior')) return 'bg-blue-400';
    return 'bg-primary';
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-12 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-accent/5 -skew-x-12 animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-accent/30 animate-in slide-in-from-left-4 duration-700">
               <ShieldCheck className="w-3.5 h-3.5" /> Registry Protocol Active
             </div>
             <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-xl">Investigator <span className="text-accent italic">Pool</span></h1>
             <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
               <Cpu className="w-4 h-4 text-emerald-500" /> National Investigative Node Control
             </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Dialog open={isPurgeOpen} onOpenChange={setIsPurgeOpen}>
               <DialogTrigger asChild>
                 <button className="bg-white/5 border border-red-500/30 text-red-500 h-12 px-8 rounded-2xl font-bold flex items-center gap-2 transition-all hover:bg-red-500 hover:text-white group">
                    <Wrench className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /> Maintenance
                 </button>
               </DialogTrigger>
               <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden [&>button]:hidden">
                  <div className="bg-red-600 p-8 text-white relative">
                     <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10"><X className="w-5 h-5" /></Button></DialogClose></div>
                     <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-tight">Registry Reset</DialogTitle>
                  </div>
                  <div className="p-8 space-y-6">
                     <p className="text-sm font-bold text-red-900 bg-red-50 p-6 rounded-2xl leading-relaxed italic border border-red-100">
                        "Warning: This will permanently purge ALL investigation officers (except Raisa Das) and their associated credentials. This action is irreversible."
                     </p>
                     <Button onClick={handlePurgeAllExceptRaisa} disabled={isActionLoading} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-red-900/40">
                        {isActionLoading ? <Loader2 className="animate-spin" /> : "Authorize Registry Reset"}
                     </Button>
                  </div>
               </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary font-bold rounded-2xl h-12 px-10 shadow-2xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all transform hover:scale-105 active:scale-95 border-none">
                  <Plus className="w-5 h-5 mr-2" /> Add Investigator
                </Button>
              </DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 [&>button]:hidden max-h-[90vh] flex flex-col">
                 <div className="bg-slate-900 p-8 text-white relative border-b-4 border-accent/20 shrink-0">
                    <div className="absolute right-6 top-6">
                      <DialogClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full text-white hover:text-white hover:bg-white/10 h-10 w-10 transition-all">
                          <X className="w-6 h-6" />
                        </Button>
                      </DialogClose>
                    </div>
                    <DialogTitle className="text-3xl font-headline font-bold">Provision Officer</DialogTitle>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Establishing Digital Investigative Identity</p>
                 </div>
                 <form onSubmit={handleAdd} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Name *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl h-11 bg-slate-50 border-none shadow-inner font-bold" required /></div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Employee ID *</Label>
                        <div className="flex gap-2">
                          <Input value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value.toUpperCase()})} className="rounded-xl h-11 font-mono font-bold flex-1 bg-slate-50 border-none shadow-inner" required />
                          <Button type="button" variant="outline" size="icon" onClick={() => setFormData({...formData, employeeId: generateEmployeeId()})} className="h-11 w-11 rounded-xl border-dashed hover:bg-accent/10">
                            <Sparkles className="w-4 h-4 text-accent" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Official Email *</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl h-11 bg-slate-50 border-none shadow-inner" required /></div>
                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Passphrase *</Label>
                         <div className="flex gap-2">
                            <div className="relative flex-1">
                               <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="rounded-xl h-11 pr-10 bg-slate-50 border-none shadow-inner" required />
                               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                            </div>
                            <Button type="button" variant="outline" size="icon" onClick={() => setFormData({...formData, password: generatePassword()})} className="h-11 w-11 rounded-xl border-dashed hover:bg-accent/10">
                              <RefreshCw className="w-4 h-4 text-accent" />
                            </Button>
                         </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Designation *</Label>
                         <Select value={formData.designation} onValueChange={(val) => setFormData({...formData, designation: val})}>
                            <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none shadow-inner font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white z-[1000000]">{OFFICER_DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Phone</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl h-11 bg-slate-50 border-none shadow-inner" /></div>
                    </div>
                    <Button type="submit" disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl hover:bg-secondary transition-all text-base md:text-lg">Provision Account</Button>
                 </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-7xl">
         
         {/* Strategic Intelligence Row */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            {[
              { label: "Registry Total", val: stats.total, icon: <Users className="w-6 h-6 text-blue-600" />, bg: "bg-blue-50/50 border-blue-100" },
              { label: "Field Ready", val: stats.active, icon: <UserCheck className="w-6 h-6 text-emerald-600" />, bg: "bg-emerald-50/50 border-emerald-100" },
              { label: "Active Dockets", val: stats.load, icon: <TrendingUp className="w-6 h-6 text-amber-600" />, bg: "bg-amber-50/50 border-amber-100" }
            ].map((s, i) => (
              <Card key={i} className={cn("border-2 shadow-sm rounded-3xl overflow-hidden p-6 md:p-8 flex items-center gap-6 group hover:shadow-xl transition-all duration-500", s.bg)}>
                 <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">{s.icon}</div>
                 <div>
                    <p className="text-3xl md:text-5xl font-headline font-bold text-primary dark:text-white leading-none">{s.val}</p>
                    <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">{s.label}</p>
                 </div>
              </Card>
            ))}
         </div>

         <div className="relative mb-12 animate-in fade-in duration-500 delay-300">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            <Input 
              placeholder="Search registry by name, rank or employee ID..." 
              className="pl-14 h-16 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border-none text-base md:text-lg font-medium focus:ring-2 focus:ring-accent/50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
         </div>

         {dataLoading ? (
           <div className="text-center py-32 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-accent" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Live Feed...</p>
           </div>
         ) : (
           <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {filtered.map((officer: any) => (
                <Card key={officer.id} className={cn(
                  "border-none shadow-md overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all hover:shadow-2xl hover:-translate-y-1 duration-500",
                  officer.status === 'active' ? "border-l-8 border-emerald-500" : "border-l-8 border-red-500"
                )}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                       <div className="p-8 md:w-52 text-center border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 space-y-4 bg-slate-50/50 dark:bg-slate-800/30">
                          <div className="space-y-1">
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">RANK ID</span>
                             <div className="text-sm font-black text-primary dark:text-white tracking-tighter bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                                {officer.employeeId || 'IO-PENDING'}
                             </div>
                          </div>
                          <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-500 border border-slate-50 dark:border-slate-800">
                             <UserRoundCheck className="w-8 h-8" />
                             <div className={cn("absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900", officer.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                          </div>
                          <Badge className={cn("text-[9px] font-black uppercase px-5 py-1 rounded-full border-none shadow-md", officer.status === 'active' ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                             {officer.status}
                          </Badge>
                       </div>
                       <div className="flex-1 p-8 flex flex-col justify-between gap-8">
                          <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
                             <div className="space-y-1.5">
                                <h3 className="text-2xl md:text-3xl font-headline font-bold text-primary dark:text-white leading-tight group-hover:text-accent transition-colors truncate">{officer.name}</h3>
                                <Badge className={cn("text-[8px] font-black uppercase tracking-widest px-3 h-5 border-none text-white shadow-sm", getRankColor(officer.designation))}>
                                   {officer.designation}
                                </Badge>
                             </div>
                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-100 dark:border-slate-800">
                                <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800"><Mail className="w-3.5 h-3.5 text-accent" /> {officer.email}</span>
                                <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800"><Phone className="w-3.5 h-3.5 text-accent" /> {officer.phone || 'NO SECURE LINE'}</span>
                             </div>
                          </div>
                          <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3 shrink-0">
                             <Button 
                              onClick={() => setSelectedOfficerForDetails(officer)} 
                              variant="outline" 
                              className="h-11 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-95"
                             >
                               Examine
                             </Button>
                             <Button onClick={() => setEditOfficer(officer)} variant="ghost" size="icon" className="h-11 w-11 text-slate-300 hover:text-accent hover:bg-accent/10 rounded-2xl transition-all"><Edit className="w-5 h-5" /></Button>
                             <button 
                                onClick={() => handleStartDelete(officer)} 
                                disabled={isActionLoading} 
                                className="h-11 w-11 text-slate-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl flex items-center justify-center transition-all active:scale-95"
                             >
                                {isActionLoading ? <Loader2 className="animate-spin w-5 h-5 text-red-500" /> : <Trash2 className="w-5 h-5" />}
                             </button>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-48 bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800 opacity-40">
                   <Activity className="w-24 h-24 mx-auto mb-6 text-slate-200" />
                   <h3 className="text-3xl font-headline font-bold text-slate-400">Registry Entry Empty</h3>
                   <p className="text-sm font-bold uppercase tracking-widest mt-2">Adjust search parameters or examine filters</p>
                </div>
              )}
           </div>
         )}
      </section>

      {/* FAULT-TOLERANT DELETION WORKFLOW */}
      <Dialog open={!!deleteDialogStep} onOpenChange={(open) => { if(!open) { setDeleteDialogStep(null); setOfficerToDelete(null); setDeleteInputText(''); } }}>
        <DialogContent className="max-w-2xl rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 [&>button]:hidden">
          {deleteDialogStep === 'confirm' && (
            <div className="p-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="absolute right-6 top-6">
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-red-500 h-10 w-10"><X className="w-6 h-6" /></Button>
                </DialogClose>
              </div>
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-[2.5rem] flex items-center justify-center animate-pulsate shadow-xl shadow-red-500/10">
                  <ShieldAlert className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <DialogTitle className="text-3xl font-headline font-bold text-primary dark:text-white">Initialize Identity Purge</DialogTitle>
                  <DialogDescription className="text-base font-medium leading-relaxed max-w-md mx-auto">
                    You are attempting to permanently remove <strong>{officerToDelete?.name}</strong> from the national pool. This action requires administrative clearance and a dependency audit.
                  </DialogDescription>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => { setDeleteDialogStep(null); setOfficerToDelete(null); }} className="flex-1 h-14 rounded-2xl font-bold border-2 text-xs uppercase tracking-widest">Abort Session</Button>
                <Button variant="destructive" onClick={executeGovernanceAudit} className="flex-1 h-14 rounded-2xl font-bold bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 text-xs uppercase tracking-widest border-none">Authorize Audit</Button>
              </div>
            </div>
          )}

          {deleteDialogStep === 'blocked' && (
            <div className="flex flex-col animate-in fade-in duration-500">
              <div className="bg-red-600 p-10 text-white shrink-0 relative overflow-hidden">
                <div className="absolute right-6 top-6">
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-white h-10 w-10"><X className="w-5 h-5" /></Button>
                  </DialogClose>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex items-center gap-4 mb-4">
                  <ShieldAlert className="w-10 h-10" />
                  <DialogTitle className="text-3xl font-headline font-bold">Operation Blocked</DialogTitle>
                </div>
                <p className="text-red-100 text-sm leading-relaxed font-medium">
                  Active investigative assignments identified. The officer must resolve, complete, or reassign all pending mandates before the profile can be purged.
                </p>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Dependency Summary ({activeAssignments.length} Cases)</h4>
                   <div className="rounded-[2rem] border bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-inner">
                    <ScrollArea className="h-[200px]">
                      <Table>
                        <TableBody>
                          {activeAssignments.map((c) => (
                            <TableRow key={c.id} className="hover:bg-white transition-colors border-slate-100">
                              <TableCell className="text-[10px] font-mono font-bold text-accent py-4">{c.caseId || c.token}</TableCell>
                              <TableCell className="text-[10px] font-bold py-4 truncate max-w-[200px]">{c.subject}</TableCell>
                              <TableCell className="text-right py-4">
                                <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200">{c.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>
                <div className="flex gap-4">
                   <Button onClick={() => setDeleteDialogStep(null)} variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-2 text-xs uppercase tracking-widest">Acknowledge</Button>
                   <Button asChild className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold shadow-xl text-xs uppercase tracking-widest">
                      <Link href="/internal/public-complaints">View All Assignments <ArrowRight className="ml-2 w-4 h-4" /></Link>
                   </Button>
                </div>
              </div>
            </div>
          )}

          {deleteDialogStep === 'warning' && (
            <div className="p-10 space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="absolute right-6 top-6">
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-red-500 h-10 w-10"><X className="w-5 h-5" /></Button>
                </DialogClose>
              </div>
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-amber-500/10">
                  <AlertTriangle className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <DialogTitle className="text-3xl font-headline font-bold text-primary dark:text-white uppercase">Security Escalation</DialogTitle>
                  <DialogDescription className="text-base font-medium leading-relaxed max-w-md mx-auto">
                    Audit confirmed: No active assignments. This will permanently revoke all credentials for <strong>{officerToDelete?.name}</strong> regardless of registry data integrity.
                  </DialogDescription>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => { setDeleteDialogStep(null); setOfficerToDelete(null); }} className="flex-1 h-14 rounded-2xl font-bold border-2 text-xs uppercase tracking-widest">Cancel Purge</Button>
                <Button variant="destructive" onClick={() => setDeleteDialogStep('verify')} className="flex-1 h-14 rounded-2xl font-bold bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/30 text-xs uppercase tracking-widest">Proceed to Auth</Button>
              </div>
            </div>
          )}

          {deleteDialogStep === 'verify' && (
            <div className="p-10 space-y-8 animate-in zoom-in-95 duration-500">
              <div className="absolute right-6 top-6">
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-red-500 h-10 w-10"><X className="w-6 h-6" /></Button>
                </DialogClose>
              </div>
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                   <Lock className="w-3.5 h-3.5" /> Verification Protocol
                </div>
                <div className="space-y-2">
                   <DialogTitle className="text-2xl font-headline font-bold">Authorize Force Deletion</DialogTitle>
                   <p className="text-sm text-slate-500 font-medium">Please type the word <strong className="text-red-600 uppercase">delete</strong> to finalize the purge.</p>
                </div>
              </div>
              <div className="space-y-6">
                 <Input 
                  placeholder="AUTHORIZATION TEXT" 
                  value={deleteInputText} 
                  onChange={(e) => setDeleteInputText(e.target.value)} 
                  className="h-16 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 text-center text-2xl font-black focus:ring-red-500 tracking-[0.2em] bg-slate-50 dark:bg-slate-950" 
                 />
                 <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => { setDeleteDialogStep(null); setOfficerToDelete(null); setDeleteInputText(''); }} className="flex-1 h-14 rounded-2xl text-slate-400 font-bold uppercase text-[10px] tracking-widest">Abort</Button>
                    <Button 
                      variant="destructive" 
                      disabled={(deleteInputText || '').toLowerCase() !== 'delete' || isDeleting} 
                      onClick={handleDelete}
                      className="flex-1 h-14 rounded-2xl font-bold bg-red-600 hover:bg-red-700 shadow-2xl shadow-red-600/30 uppercase text-[10px] tracking-widest"
                    >
                      {isDeleting ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Force Purge"}
                    </Button>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Multi-Functional Edit Dialog */}
      <Dialog open={!!editOfficer} onOpenChange={(val) => !val && setEditOfficer(null)}>
        <DialogContent className="max-w-xl rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 [&>button]:hidden max-h-[90vh] flex flex-col">
          {editOfficer && (
            <>
               <div className="bg-slate-900 p-10 text-white shrink-0 border-b-4 border-accent/20 relative">
                  <div className="absolute right-6 top-6">
                    <DialogClose asChild>
                      <Button variant="ghost" size="icon" className="rounded-full text-white hover:text-white h-10 w-10 transition-all">
                        <X className="w-5 h-5" />
                      </Button>
                    </DialogClose>
                  </div>
                  <Badge className="bg-accent text-primary font-black uppercase text-[9px] mb-2 tracking-widest">Metadata Editor</Badge>
                  <DialogTitle className="text-3xl font-headline font-bold">Update Profile Meta</DialogTitle>
               </div>
               <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Legal Name</Label><Input value={editOfficer.name || ''} onChange={e => setEditOfficer({...editOfficer, name: e.target.value})} className="h-12 rounded-2xl shadow-inner border-none bg-slate-50 dark:bg-slate-950 font-bold" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Employee ID</Label><Input value={(editOfficer.employeeId || '')} disabled className="h-12 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 border-none font-mono font-bold text-slate-400" /></div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 flex-1">
                       <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Official Rank</Label>
                       <Select value={editOfficer.designation || 'Investigation Officer'} onValueChange={(val) => setEditOfficer({...editOfficer, designation: val})}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-none shadow-inner font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white z-[1000000]">{OFFICER_DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Registry Status</Label>
                       <Select value={editOfficer.status || 'active'} onValueChange={(val: any) => setEditOfficer({...editOfficer, status: val})}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-none shadow-inner font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white z-[1000000]"><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                       </Select>
                    </div>
                  </div>
                  <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-16 rounded-2xl bg-primary text-white font-bold shadow-xl hover:bg-secondary transition-all flex gap-2">
                     {isActionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <><RefreshCw className="w-5 h-5" /> Commit Registry Refresh</>}
                  </Button>
               </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Personnel Detailed Account View (Examine) */}
      <Dialog open={!!selectedOfficerForDetails} onOpenChange={(val) => !val && setSelectedOfficerForDetails(null)}>
        <DialogContent className="max-w-xl rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 [&>button]:hidden max-h-[90vh] flex flex-col">
          {selectedOfficerForDetails && (
            <>
              <div className="bg-slate-900 p-10 text-white relative border-b-8 border-accent/20 shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute right-6 top-6">
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-white h-10 w-10 hover:bg-white/10 transition-all">
                      <X className="w-5 h-5" />
                    </Button>
                  </DialogClose>
                </div>
                <Badge className="bg-accent text-primary font-black text-[10px] uppercase mb-4 tracking-[0.3em] px-5 h-7 rounded-full shadow-lg">Verified Official Record</Badge>
                <DialogTitle className="text-4xl font-headline font-bold drop-shadow-md leading-tight">{selectedOfficerForDetails.name}</DialogTitle>
                <div className="flex items-center gap-3 mt-4">
                   <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg border border-white/10 backdrop-blur-sm">
                      <Hash className="w-3.5 h-3.5 text-accent" />
                      <span className="text-xs font-mono font-bold tracking-widest">{selectedOfficerForDetails.employeeId || 'IO-PENDING'}</span>
                   </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner group hover:bg-white dark:hover:bg-slate-950 transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Star className="w-3 h-3 text-accent" /> Institutional Rank
                    </p>
                    <p className="text-sm md:text-base font-bold text-primary dark:text-white leading-tight">{selectedOfficerForDetails.designation}</p>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner group hover:bg-white dark:hover:bg-slate-950 transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Lock className="w-3 h-3 text-accent" /> Secure Passphrase
                    </p>
                    <p className="text-sm md:text-base font-bold text-primary dark:text-white leading-tight font-mono">{selectedOfficerForDetails.password || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Fingerprint className="w-5 h-5 text-accent" />
                    <h4 className="text-xs font-black uppercase tracking-[0.25em] text-primary dark:text-white">Contact Protocols</h4>
                  </div>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:bg-white dark:hover:bg-slate-950 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all"><Mail className="w-5 h-5" /></div>
                      <span className="text-sm font-bold truncate">{selectedOfficerForDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:bg-white dark:hover:bg-slate-950 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all"><Phone className="w-5 h-5" /></div>
                      <span className="text-sm font-bold">{selectedOfficerForDetails.phone || 'NO SECURE LINE RECORDED'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"><Clock className="w-4 h-4 text-slate-400" /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Registered: {selectedOfficerForDetails.createdAt?.toDate ? selectedOfficerForDetails.createdAt.toDate().toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-8 rounded-xl border-accent/20 text-accent font-black gap-2">
                       <Briefcase className="w-3.5 h-3.5" /> DOCKET: {selectedOfficerForDetails.assignedCount || 0}
                    </Badge>
                  </div>
                </div>

                <Button onClick={() => setSelectedOfficerForDetails(null)} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 text-base border-none">
                  Dismiss Account Node
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="mt-20 flex flex-col items-center gap-6 opacity-30 animate-in fade-in duration-1000">
         <div className="h-px w-48 bg-slate-300 dark:bg-slate-700" />
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] text-center">National Governance Node • HRAT INDIA</p>
      </div>

      <Footer />
    </main>
  )
}
