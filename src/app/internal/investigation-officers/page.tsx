
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth'
import { firebaseConfig } from '@/firebase/config'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc, getDoc, writeBatch, where, getDocs } from 'firebase/firestore'
import { Footer } from '@/components/footer'
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
  Info
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

  const officers = React.useMemo(() => {
    return (rawOfficers || []).filter(o => o && typeof o === 'object' && o.id);
  }, [rawOfficers]);

  const generateAlphanumeric = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const generateOfficerId = () => `HRAT-IO-${generateAlphanumeric(4)}`;

  const generateSmartPassword = (name: string, phone: string) => {
    const prefix = (name || 'HRAT').trim().substring(0, 3);
    const cleanPhone = (phone || '000').replace(/\D/g, '');
    const suffix = cleanPhone.length >= 3 ? cleanPhone.slice(-3) : '000';
    return `${prefix}#${suffix}`;
  };

  /**
   * validateOfficerMetadata: Strict governance check for required record info.
   * Attempts to recover missing identifiers from alternative fields if possible.
   */
  const validateOfficerMetadata = (officer: any) => {
    if (!officer || typeof officer !== 'object') {
      return { 
        isValid: false, 
        reason: "Registry record is null or malformed.", 
        missingField: "Root Object"
      };
    }

    // Capture primary identifiers with safe fallbacks
    let id = officer.id;
    let email = (officer.email || '').toLowerCase().trim();
    let name = (officer.name || '').trim();
    let uid = officer.uid;

    // RECOVERY LOGIC: If email is missing but ID looks like an email, remap it.
    if (!email && id && id.includes('@')) {
      email = id.toLowerCase().trim();
      console.log(`[GOVERNANCE-RECOVERY] Reconstructing email from ID for: ${id}`);
    }

    if (!id) return { isValid: false, reason: "Internal document ID missing.", missingField: "id" };
    if (!email) return { isValid: false, reason: "The official email identity is missing or unreadable.", missingField: "email" };
    if (!name) return { isValid: false, reason: "The officer's legal name is missing.", missingField: "name" };

    return { 
      isValid: true, 
      id, 
      email, 
      name, 
      uid, 
      employeeId: officer.employeeId,
      metadata: {
        collection: 'investigation_officers',
        type: 'investigator',
        entity: 'UserAccount'
      }
    };
  };

  const handleStartDelete = async (officer: any) => {
    if (!db || !user) return;
    
    const validation = validateOfficerMetadata(officer);
    if (!validation.isValid) {
      console.error(`[GOVERNANCE-AUDIT] Blocked deletion attempt:`, validation);
      toast({ 
        variant: "destructive", 
        title: "Incomplete Record", 
        description: "This record cannot be deleted because required information is missing. Refresh the page and try again." 
      });
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
      const q = query(
        complaintsRef, 
        where('status', 'not-in', ['Closed', 'Action Taken'])
      );
      
      const snap = await getDocs(q);
      const officerName = (officerToDelete.name || '').trim();
      
      const conflictCases = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((c: any) => 
          c.assignedTo === officerName || 
          (c.assignedOfficers || []).some((o: any) => (o.name || '').trim() === officerName)
        );
      
      if (conflictCases.length > 0 || (officerToDelete.assignedCount || 0) > 0) {
        setActiveAssignments(conflictCases);
        const reasons = new Set<string>();
        
        if (conflictCases.length > 0) {
          reasons.add("Active investigative assignments exist in the registry.");
        }
        
        if ((officerToDelete.assignedCount || 0) > 0) {
          reasons.add("Statistical record indicates pending responsibilities.");
        }
        
        setBlockReasons(Array.from(reasons));

        const blockedLogRef = doc(collection(db, 'deletion_audit_logs'));
        await setDoc(blockedLogRef, {
          adminId: user.uid,
          adminEmail: user.email,
          adminName: user.displayName || 'Root Administrator',
          targetId: officerToDelete.employeeId || 'N/A',
          targetName: officerToDelete.name || 'Unknown',
          timestamp: new Date().toISOString(),
          status: "Blocked by Governance Validation",
          failureReason: Array.from(reasons).join(' | ')
        });

        setDeleteDialogStep('blocked');
      } else {
        setDeleteDialogStep('warning');
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Audit Error", description: "Verification protocol failed. Please refresh the page." });
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
      let failureCount = 0;
      
      for (const officer of officers) {
        const officerName = (officer.name || '').trim();
        if (officerName === 'Raisa Das') continue;

        const validation = validateOfficerMetadata(officer);
        
        if (!validation.isValid) {
          console.error(`[PURGE-AUDIT] Skipping corrupted record: ${validation.reason}`, {
            recordId: officer.id,
            missing: validation.missingField
          });
          failureCount++;
          continue;
        }

        batch.delete(doc(db, 'investigation_officers', validation.id));
        batch.delete(doc(db, 'users', validation.email));
        count++;
      }
      
      if (count > 0) {
        await batch.commit();
        toast({ 
          title: "Registry Purged", 
          description: failureCount > 0 
            ? `${count} records removed. ${failureCount} records were skipped due to incomplete metadata.` 
            : `${count} personnel records removed successfully.` 
        });
        setIsPurgeOpen(false);
      } else if (failureCount > 0) {
        toast({ 
          variant: "destructive", 
          title: "Audit Required", 
          description: "One or more records could not be purged because required information is missing." 
        });
      } else {
        toast({ title: "Audit Complete", description: "No conflicting records found." });
        setIsPurgeOpen(false);
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "System Error", description: "The purge protocol encountered a communication error with the registry." });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailVal = (formData.email || '').toLowerCase().trim();
    const nameVal = (formData.name || '').trim();
    const passVal = formData.password;

    if (!db || !isRoot || !nameVal || !emailVal || !passVal) {
       toast({ variant: "destructive", title: "Validation Error", description: "All marked fields are mandatory." });
       return;
    }

    setIsActionLoading(true)
    const tempAppName = `TempApp-${Date.now()}`
    const secondaryApp = initializeApp(firebaseConfig, tempAppName)
    const secondaryAuth = getAuth(secondaryApp)

    let authUser: any = null

    try {
      const authUserCredential = await createUserWithEmailAndPassword(secondaryAuth, emailVal, passVal)
      authUser = authUserCredential.user
      await updateProfile(authUser, { displayName: nameVal })

      const batch = writeBatch(db)
      
      const officerRef = doc(collection(db, 'investigation_officers'))
      batch.set(officerRef, {
        ...formData,
        name: nameVal,
        email: emailVal,
        uid: authUser.uid,
        assignedCount: 0,
        createdAt: serverTimestamp()
      })

      const userRef = doc(db, 'users', emailVal)
      batch.set(userRef, {
        uid: authUser.uid,
        email: emailVal,
        name: nameVal,
        role: 'investigator',
        status: 'active',
        permissions: { publicView: true },
        createdAt: serverTimestamp(),
        lastLogin: null
      })

      await batch.commit()

      toast({ title: "Officer Provisioned", description: "Identity established and registry synchronized." })
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
    
    const validation = validateOfficerMetadata(editOfficer);
    if (!validation.isValid) {
       toast({ 
         variant: "destructive", 
         title: "Update Denied", 
         description: "Please resolve the missing record information before attempting update." 
       });
       return;
    }

    setIsActionLoading(true)
    try {
      const batch = writeBatch(db)
      
      batch.update(doc(db, 'investigation_officers', validation.id), {
        ...editOfficer,
        updatedAt: serverTimestamp()
      })

      batch.update(doc(db, 'users', validation.email), {
        name: editOfficer.name,
        status: editOfficer.status,
        updatedAt: serverTimestamp()
      })

      await batch.commit()
      toast({ title: "Profile Refreshed" })
      setEditOfficer(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: "Communication with governance node interrupted." });
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!db || !officerToDelete || !isRoot || !user) return;

    const validation = validateOfficerMetadata(officerToDelete);
    if (!validation.isValid) {
       toast({ 
         variant: "destructive", 
         title: "Purge Cancelled", 
         description: "This record cannot be deleted because required information is missing." 
       });
       return;
    }

    setIsDeleting(true)
    try {
      const batch = writeBatch(db)
      
      batch.delete(doc(db, 'investigation_officers', validation.id))
      batch.delete(doc(db, 'users', validation.email))
      
      const auditRef = doc(collection(db, 'deletion_audit_logs'));
      batch.set(auditRef, {
        adminId: user.uid,
        adminName: user.displayName || 'Root Administrator',
        targetId: officerToDelete.employeeId || 'N/A',
        targetName: officerToDelete.name || 'Unknown',
        targetEmail: validation.email,
        timestamp: new Date().toISOString(),
        status: "Permanently Purged - Successful"
      })
      
      await batch.commit()
      toast({ title: "Clearance Revoked", description: "Identity purged and access revoked instantly." })
      
      setDeleteDialogStep(null)
      setOfficerToDelete(null)
      setDeleteInputText('')
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Protocol Error", description: "Failed to commit purge batch. Registry integrity preserved." });
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = (officers || []).filter((o: any) => {
    if (!o || typeof o !== 'object') return false;
    const name = (o.name || '').toLowerCase();
    const designation = (o.designation || '').toLowerCase();
    const empId = (o.employeeId || '').toLowerCase();
    const s = (search || '').toLowerCase();

    return name.includes(s) || designation.includes(s) || empId.includes(s);
  });

  if (authLoading || !isRoot) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/30">
               <ShieldCheck className="w-2.5 h-2.5" /> Force Registry Node
             </div>
             <h1 className="text-3xl md:text-4xl font-headline font-bold">Investigator <span className="text-accent italic">Pool</span></h1>
             <p className="text-slate-400 text-[11px] uppercase font-black">Official Registry of Investigative Personnel</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Dialog open={isPurgeOpen} onOpenChange={setIsPurgeOpen}>
               <DialogTrigger asChild>
                 <Button variant="outline" className="bg-white/5 border-red-500/30 text-red-500 h-11 px-6 rounded-xl font-bold gap-2 hover:bg-red-500/10 transition-all">
                    <Wrench className="w-4 h-4" /> Registry Maintenance
                 </Button>
               </DialogTrigger>
               <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                  <div className="bg-red-600 p-8 text-white relative">
                     <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white"><X className="w-4 h-4" /></Button></DialogClose></div>
                     <Badge className="bg-white/20 text-white font-black text-[8px] uppercase mb-2 border-white/30">Governance Protocol</Badge>
                     <DialogTitle className="text-2xl font-headline font-bold">Registry Cleanup</DialogTitle>
                  </div>
                  <div className="p-8 space-y-6">
                     <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                           <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                           <p className="text-sm font-bold text-red-900 leading-relaxed">
                              This protocol will permanently purge ALL investigation officers and their access credentials from the registry, EXCEPT for **Raisa Das**.
                           </p>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed italic">
                           "All assignments, dockets, and authentication keys for other officials will be destroyed. Ensure all active cases have been transferred before execution."
                        </p>
                     </div>
                     <Button 
                       onClick={handlePurgeAllExceptRaisa} 
                       disabled={isActionLoading}
                       className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-red-900/40"
                     >
                        {isActionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Authorize Registry Reset"}
                     </Button>
                  </div>
               </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all transform hover:scale-105 active:scale-95">
                  <Plus className="w-4 h-4" /> Add Investigation Officer
                </Button>
              </DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                 <div className="bg-slate-900 p-8 text-white relative">
                    <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 h-8 w-8"><X className="w-4 h-4" /></Button></DialogClose></div>
                    <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2">Personnel Node</Badge>
                    <DialogTitle className="text-2xl font-headline font-bold">Provision Officer</DialogTitle>
                    <DialogDescription className="text-slate-400">Atomic registration: Creates Auth account and registry record simultaneously.</DialogDescription>
                 </div>
                 <form onSubmit={handleAdd} className="p-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-bold uppercase text-slate-400">Officer Name *</Label>
                         <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Adv. Sourav Chatterjee" className="h-11 rounded-xl" required />
                      </div>
                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-bold uppercase text-slate-400">Employee ID *</Label>
                         <div className="flex gap-2">
                            <Input 
                              value={formData.employeeId} 
                              onChange={e => setFormData({...formData, employeeId: (e.target.value || '').toUpperCase()})} 
                              placeholder="HRAT-IO-001" 
                              className="h-11 rounded-xl font-mono flex-1" 
                              required 
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              title="Generate ID"
                              className="h-11 w-11 shrink-0 rounded-xl border-dashed hover:bg-accent/10"
                              onClick={() => setFormData({...formData, employeeId: generateOfficerId()})}
                            >
                              <Sparkles className="w-4 h-4 text-accent" />
                            </Button>
                         </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-bold uppercase text-slate-400">Official Email *</Label>
                         <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="officer@hrat-india.org" className="h-11 rounded-xl" required />
                      </div>
                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-bold uppercase text-slate-400">Login Password *</Label>
                         <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input 
                                type={showPassword ? "text" : "password"}
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                placeholder="Min 8 chars" 
                                className="h-11 rounded-xl pr-10" 
                                required 
                              />
                              <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-accent"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              title="Generate Protocol Password"
                              className="h-11 w-11 shrink-0 rounded-xl border-dashed hover:bg-accent/10"
                              onClick={() => setFormData({...formData, password: generateSmartPassword(formData.name, formData.phone)})}
                            >
                              <Lock className="w-4 h-4 text-accent" />
                            </Button>
                         </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5 flex-1">
                         <Label className="text-[10px] font-bold uppercase text-slate-400">Designation / Rank *</Label>
                         <Select value={formData.designation} onValueChange={(val) => setFormData({...formData, designation: val})}>
                            <SelectTrigger className="h-11 rounded-xl">
                               <SelectValue placeholder="Select Rank" />
                            </SelectTrigger>
                            <SelectContent className="bg-white z-[1000000]">
                               {OFFICER_DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-bold uppercase text-slate-400">Contact Number</Label>
                         <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91" className="h-11 rounded-xl" />
                      </div>
                    </div>

                    <Button type="submit" disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl hover:bg-secondary shadow-xl transition-all">
                       {isActionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Authorize & Provision Account"}
                    </Button>
                 </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-5xl">
         <div className="relative mb-12">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name, ID or designation..." 
              className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-900 shadow-sm border-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
         </div>

         {dataLoading ? (
           <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
         ) : (
           <div className="grid gap-6">
              {filtered.map((officer: any) => (
                <Card key={officer.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group transition-all hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                       <div className="p-8 md:w-56 text-center border-r bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center shrink-0">
                          <Badge variant="outline" className="text-[8px] font-mono font-bold border-accent text-accent mb-4 tracking-tighter">
                             {(officer.employeeId || 'IO-TEMP')}
                          </Badge>
                          <div className="w-16 h-16 rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                             <UserRoundCheck className="w-8 h-8" />
                          </div>
                          <Badge className={cn("mt-4 text-[8px] font-black uppercase h-5", officer.status === 'active' ? "bg-emerald-500" : "bg-red-500")}>
                             {officer.status}
                          </Badge>
                       </div>
                       
                       <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="space-y-4 text-center md:text-left flex-1">
                             <div className="space-y-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-3">
                                  <h3 className="text-2xl font-headline font-bold text-primary dark:text-white leading-tight">{officer.name}</h3>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setSelectedOfficerForDetails(officer)}
                                    className="h-7 px-3 rounded-full text-[8px] font-black uppercase tracking-widest border-slate-200 hover:bg-accent hover:text-primary transition-all w-fit"
                                  >
                                    <Eye className="w-3 h-3 mr-1.5" /> View Details
                                  </Button>
                                </div>
                                <p className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                                   <Briefcase className="w-3.5 h-3.5" /> {officer.designation}
                                </p>
                             </div>

                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-accent" /> {officer.email}</span>
                                <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-accent" /> {officer.phone || 'N/A'}</span>
                                <span className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Real-time Sync Active</span>
                             </div>
                          </div>

                          <div className="flex items-center gap-3">
                             <Button onClick={() => setEditOfficer(officer)} variant="outline" size="sm" className="h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest border-2 hover:bg-primary hover:text-white transition-all">Modify</Button>
                             <button 
                               onClick={() => handleStartDelete(officer)}
                               disabled={isActionLoading}
                               className="h-10 w-10 text-slate-300 hover:text-red-500 transition-all rounded-xl flex items-center justify-center"
                             >
                               {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                             </button>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filtered.length === 0 && (
                <div className="text-center py-40 opacity-30">
                   <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                   <p className="text-sm font-bold uppercase tracking-widest">Registry Synchronization Idle</p>
                </div>
              )}
           </div>
         )}
      </section>

      {/* View Details Dialog - Read Only */}
      <Dialog open={!!selectedOfficerForDetails} onOpenChange={(val) => !val && setSelectedOfficerForDetails(null)}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 flex flex-col max-h-[90vh]">
          {selectedOfficerForDetails && (
            <>
               <div className="bg-slate-900 p-8 text-white relative shrink-0 border-b-8 border-accent/20">
                  <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 h-10 w-10 hover:bg-white/10"><X className="w-6 h-6" /></Button></DialogClose></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2 tracking-[0.2em]">Force Profile View</Badge>
                  <DialogTitle className="text-3xl font-headline font-bold leading-tight">{selectedOfficerForDetails.name}</DialogTitle>
                  <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified Registry Entry
                  </DialogDescription>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Employee ID</p>
                        <p className="text-sm font-mono font-bold text-primary dark:text-white uppercase">{(selectedOfficerForDetails.employeeId || 'IO-PENDING')}</p>
                     </div>
                     <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Official Rank</p>
                        <p className="text-sm font-bold text-primary dark:text-white truncate">{selectedOfficerForDetails.designation}</p>
                     </div>
                     <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Registry Passphrase</p>
                        <div className="flex items-center gap-2">
                           <Lock className="w-3.5 h-3.5 text-accent" />
                           <p className="text-sm font-bold text-primary dark:text-white">{selectedOfficerForDetails.password || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase text-accent tracking-[0.25em] flex items-center gap-2">
                        <Navigation className="w-3 h-3" /> Communication Protocols
                     </h4>
                     <div className="space-y-2">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group transition-all">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-accent"><Mail className="w-5 h-5" /></div>
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Registered Email</span>
                              <span className="text-sm font-bold text-primary dark:text-white">{selectedOfficerForDetails.email}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group transition-all">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-accent"><Phone className="w-5 h-5" /></div>
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</span>
                              <span className="text-sm font-bold text-primary dark:text-white">{selectedOfficerForDetails.phone || 'N/A'}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                           <p className="text-[8px] font-black text-slate-400 uppercase">Operational Status</p>
                           <div className={cn("w-2 h-2 rounded-full", selectedOfficerForDetails.status === 'active' ? "bg-emerald-500" : "bg-red-500")} />
                        </div>
                        <Badge className={cn("text-[9px] font-black uppercase h-5", selectedOfficerForDetails.status === 'active' ? "bg-emerald-600" : "bg-red-600")}>
                           {selectedOfficerForDetails.status === 'active' ? 'Full Clearance' : 'Suspended'}
                        </Badge>
                     </div>
                     <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Commissioned On</p>
                        <div className="flex items-center gap-2">
                           <Clock className="w-3.5 h-3.5 text-accent" />
                           <span className="text-xs font-bold">{selectedOfficerForDetails.createdAt?.toDate?.()?.toLocaleDateString() || 'Historical Entry'}</span>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-100 dark:border-indigo-900 text-center space-y-3">
                     <UserRoundCheck className="w-10 h-10 text-indigo-400 mx-auto" />
                     <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest">
                        Access to this record is audited. No modifications are permitted within this view terminal.
                     </p>
                  </div>
               </div>

               <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-900 border-t shrink-0">
                  <Button onClick={() => setSelectedOfficerForDetails(null)} className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-xl">
                    Terminate Review
                  </Button>
               </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Multi-Stage Deletion Dialog (Super Admin Only) */}
      <Dialog open={!!deleteDialogStep} onOpenChange={(open) => { if(!open) { setDeleteDialogStep(null); setOfficerToDelete(null); setDeleteInputText(''); setActiveAssignments([]); } }}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
          
          {deleteDialogStep === 'confirm' && (
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Confirm Deletion</DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 leading-relaxed font-medium">
                    You are about to permanently delete this record. This action may permanently remove related data. This action cannot be undone. Please confirm that you want to continue.
                  </DialogDescription>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setDeleteDialogStep(null); setOfficerToDelete(null); }} className="flex-1 h-12 rounded-xl font-bold">Cancel</Button>
                <Button variant="destructive" onClick={executeGovernanceAudit} className="flex-1 h-12 rounded-xl font-bold">Delete Permanently</Button>
              </div>
            </div>
          )}

          {deleteDialogStep === 'blocked' && (
            <div className="flex flex-col animate-in fade-in duration-500">
              <div className="bg-red-600 p-8 text-white relative shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                    <ShieldAlert className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-black text-[8px] uppercase mb-1">Administrative Blockade</Badge>
                    <DialogTitle className="text-2xl font-headline font-bold">Unable to Delete Officer</DialogTitle>
                  </div>
                </div>
                <p className="text-red-100 text-sm font-medium leading-relaxed">
                  This Investigation Officer cannot be deleted because they currently have active assignments. Please cancel, complete, or reassign all active assignments before deleting this officer.
                </p>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-red-600 tracking-[0.2em] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Conflict Identified:
                  </h4>
                  <div className="grid gap-2">
                    {blockReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/40">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                         <span className="text-xs font-bold text-red-900 dark:text-red-400">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center justify-between px-1">
                    <span>Dependency Summary ({activeAssignments.length})</span>
                    <Badge variant="outline" className="text-[8px] font-bold border-slate-100">Live Audit</Badge>
                  </h4>
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <ScrollArea className="h-[200px]">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                          <TableRow>
                            <TableHead className="text-[9px] font-black uppercase h-10">Case ID</TableHead>
                            <TableHead className="text-[9px] font-black uppercase h-10">Subject</TableHead>
                            <TableHead className="text-[9px] font-black uppercase h-10 text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeAssignments.map((c) => (
                            <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors">
                              <TableCell className="text-[10px] font-mono font-bold text-accent py-3">{(c.caseId || c.token)}</TableCell>
                              <TableCell className="text-[10px] font-bold py-3 truncate max-w-[150px]">{c.subject}</TableCell>
                              <TableCell className="text-right py-3"><Badge className="text-[7px] h-4 uppercase bg-slate-800">{c.status}</Badge></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 flex items-start gap-4">
                   <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                   <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase">
                     Required Action: Reassign these cases to another official or mark them as completed before proceeding with the identity purge.
                   </p>
                </div>

                <div className="flex gap-3">
                   <Button asChild variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2 border-slate-200">
                     <Link href="/internal/public-complaints">
                        <ClipboardList className="w-4 h-4" /> View Assignments
                     </Link>
                   </Button>
                   <Button onClick={() => setDeleteDialogStep(null)} className="flex-1 h-12 rounded-xl bg-primary text-white font-bold">Acknowledge</Button>
                </div>
              </div>
            </div>
          )}

          {deleteDialogStep === 'warning' && (
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Security Warning</DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 leading-relaxed font-medium">
                    You are attempting to permanently purge the record for <strong className="text-primary dark:text-white">{officerToDelete?.name}</strong>. This action will revoke their investigative clearance and delete their authentication credentials. This is irreversible.
                  </DialogDescription>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setDeleteDialogStep(null); setOfficerToDelete(null); }} className="flex-1 h-12 rounded-xl font-bold">Cancel</Button>
                <Button variant="destructive" onClick={() => setDeleteDialogStep('verify')} className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700">Proceed</Button>
              </div>
            </div>
          )}

          {deleteDialogStep === 'verify' && (
            <div className="p-8 space-y-6">
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                  <AlertTriangle className="w-3 h-3" /> Verification Protocol
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-xl font-headline font-bold">Confirm Permanent Deletion</DialogTitle>
                  <p className="text-xs text-slate-500">To authorize this purge, please type the word <strong className="text-red-600 uppercase">delete</strong> below.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Input 
                  placeholder="Type 'delete' here..." 
                  value={deleteInputText} 
                  onChange={(e) => setDeleteInputText(e.target.value)} 
                  className="h-12 rounded-xl border-2 focus:ring-red-500 font-bold text-center"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => { setDeleteDialogStep(null); setOfficerToDelete(null); setDeleteInputText(''); }} className="flex-1 h-12 rounded-xl text-slate-400 font-bold">Abort</Button>
                <Button 
                  variant="destructive" 
                  disabled={(deleteInputText || '').toLowerCase() !== 'delete' || isDeleting} 
                  onClick={handleDelete}
                  className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20"
                >
                  {isDeleting ? <Loader2 className="animate-spin" /> : "Verify & Purge Record"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editOfficer} onOpenChange={(val) => !val && setEditOfficer(null)}>
        <DialogContent className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          {editOfficer && (
            <>
               <div className="bg-slate-900 p-8 text-white relative">
                  <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40 h-8 w-8"><X className="w-4 h-4" /></Button></DialogClose></div>
                  <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2">Registry Update</Badge>
                  <DialogTitle className="text-2xl font-headline font-bold">Update Profile Meta</DialogTitle>
                  <DialogDescription className="text-slate-400">Sync status and designation changes instantly.</DialogDescription>
               </div>
               <div className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Legal Name</Label><Input value={editOfficer.name || ''} onChange={e => setEditOfficer({...editOfficer, name: e.target.value})} className="h-11 rounded-xl" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Employee ID</Label><Input value={(editOfficer.employeeId || '')} disabled className="h-11 rounded-xl bg-slate-50 font-mono" /></div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 flex-1">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Assigned Rank</Label>
                       <Select value={editOfficer.designation || 'Investigation Officer'} onValueChange={(val) => setEditOfficer({...editOfficer, designation: val})}>
                          <SelectTrigger className="h-11 rounded-xl">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-[1000001]">
                             {OFFICER_DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Status</Label>
                       <Select value={editOfficer.status || 'active'} onValueChange={(val: any) => setEditOfficer({...editOfficer, status: val})}>
                          <SelectTrigger className="h-11 rounded-xl">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-[1000001]">
                             <SelectItem value="active">Active (Full Access)</SelectItem>
                             <SelectItem value="inactive">Inactive (Access Suspended)</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                     <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                     <p className="text-[10px] text-amber-800 font-bold uppercase">Password resets must be initiated through the Governance Roles terminal or Auth service directly.</p>
                  </div>
                  <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl transition-all">
                     {isActionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Commit Profile Refresh"}
                  </Button>
               </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
