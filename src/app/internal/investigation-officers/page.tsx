
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
  Info,
  MapPin,
  Hash
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

  const generateOfficerId = () => `HRAT-IO-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  const generateSmartPassword = (name: string, phone: string) => {
    const prefix = (name || 'HRAT').trim().substring(0, 3);
    const cleanPhone = (phone || '000').replace(/\D/g, '');
    const suffix = cleanPhone.length >= 3 ? cleanPhone.slice(-3) : '000';
    return `${prefix}#${suffix}`;
  };

  /**
   * validateOfficerMetadata: Governance check for required record info.
   * PERMISSIVE MODE: Now attempts recovery or allows partial return to ensure force delete.
   */
  const validateOfficerMetadata = (officer: any) => {
    if (!officer || typeof officer !== 'object') {
      return { isValid: false, reason: "Record unavailable." };
    }

    const id = officer.id;
    let email = (officer.email || '').toLowerCase().trim();
    const name = (officer.name || 'Unknown Officer').trim();

    // Recovery: If email is missing but ID contains an @, treat ID as email (legacy support)
    if (!email && id && id.includes('@')) {
      email = id.toLowerCase().trim();
    }

    // A Document ID is the absolute minimum requirement to attempt ANY deletion.
    if (!id) return { isValid: false, reason: "Internal ID missing." };

    return { 
      isValid: true, 
      id, 
      email: email || null, // Allow null email for fault-tolerant skip
      name 
    };
  };

  const handleStartDelete = async (officer: any) => {
    if (!db || !user) return;
    
    const validation = validateOfficerMetadata(officer);
    if (!validation.isValid) {
      toast({ 
        variant: "destructive", 
        title: "Registry Inconsistency", 
        description: "This record is too corrupted to delete via normal protocol. Contact support." 
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
          (c.assignedTo && c.assignedTo.trim() === officerName) || 
          (c.assignedOfficers || []).some((o: any) => (o.name || '').trim() === officerName)
        );
      
      if (conflictCases.length > 0) {
        setActiveAssignments(conflictCases);
        setBlockReasons(["Active investigative assignments exist in the national registry."]);
        setDeleteDialogStep('blocked');
      } else {
        setDeleteDialogStep('warning');
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Audit Error", description: "Verification protocol failed. Please refresh." });
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
        if (!validation.id) continue; // Unrecoverable

        // Purge Registry Profile (Primary)
        batch.delete(doc(db, 'investigation_officers', validation.id));
        
        // Purge Auth Link (Secondary - Skip if email missing/invalid)
        if (validation.email) {
          batch.delete(doc(db, 'users', validation.email));
        }
        
        count++;
      }
      
      await batch.commit();
      toast({ title: "Registry Purged", description: `${count} personnel records removed.` });
      setIsPurgeOpen(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Partial Purge", description: "Some records could not be removed. Check audit log." });
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
       toast({ variant: "destructive", title: "Incomplete Form" });
       return;
    }

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
        uid: authUser.uid,
        email: emailVal,
        name: nameVal,
        role: 'investigator',
        status: 'active',
        permissions: { publicView: true },
        createdAt: serverTimestamp()
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
      
      batch.update(doc(db, 'investigation_officers', editOfficer.id), {
        ...editOfficer,
        updatedAt: serverTimestamp()
      })

      if (email) {
        batch.update(doc(db, 'users', email), {
          name: editOfficer.name,
          status: editOfficer.status,
          updatedAt: serverTimestamp()
        })
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

      // Graceful Primary Deletion
      batch.delete(doc(db, 'investigation_officers', id))

      // Fault-Tolerant Secondary Deletion
      if (!email && id.includes('@')) email = id; // Recovery
      if (email) {
        batch.delete(doc(db, 'users', email.toLowerCase().trim()))
      }
      
      // Audit Logging (Captures available data)
      const auditRef = doc(collection(db, 'deletion_audit_logs'));
      batch.set(auditRef, {
        adminId: user.uid,
        adminName: user.displayName || 'Root',
        targetId: officerToDelete.employeeId || 'N/A',
        targetName: officerToDelete.name || 'Incomplete Record',
        targetEmail: email || 'N/A',
        timestamp: new Date().toISOString(),
        status: "Permanently Purged - Successful"
      })
      
      await batch.commit()
      toast({ title: "Clearance Revoked", description: "Identity purged from national registry." })
      setDeleteDialogStep(null)
      setOfficerToDelete(null)
      setDeleteInputText('')
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Incomplete", description: "Partial registry sync failure. Please refresh." });
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

  if (authLoading || !isRoot) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-accent" /></div>
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/30">
               <ShieldCheck className="w-2.5 h-2.5" /> Registry Protocol Active
             </div>
             <h1 className="text-3xl md:text-4xl font-headline font-bold">Investigator <span className="text-accent italic">Pool</span></h1>
             <p className="text-slate-400 text-[11px] uppercase font-black">Official Registry of Investigative Personnel</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Dialog open={isPurgeOpen} onOpenChange={setIsPurgeOpen}>
               <DialogTrigger asChild>
                 <Button variant="outline" className="bg-white/5 border-red-500/30 text-red-500 h-11 px-6 rounded-xl font-bold gap-2">
                    <Wrench className="w-4 h-4" /> Maintenance
                 </Button>
               </DialogTrigger>
               <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                  <div className="bg-red-600 p-8 text-white relative">
                     <div className="absolute right-6 top-6"><DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full text-white/40"><X className="w-4 h-4" /></Button></DialogClose></div>
                     <DialogTitle className="text-2xl font-headline font-bold">Registry Reset</DialogTitle>
                  </div>
                  <div className="p-8 space-y-6">
                     <p className="text-sm font-bold text-red-900 bg-red-50 p-4 rounded-xl leading-relaxed">
                        This will permanently purge ALL investigation officers (except Raisa Das) and their associated access credentials.
                     </p>
                     <Button onClick={handlePurgeAllExceptRaisa} disabled={isActionLoading} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs">
                        {isActionLoading ? <Loader2 className="animate-spin" /> : "Authorize Registry Reset"}
                     </Button>
                  </div>
               </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary font-bold rounded-xl h-11 px-8 shadow-xl shadow-accent/20">
                  <Plus className="w-4 h-4" /> Add Investigator
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                 <div className="bg-slate-900 p-8 text-white"><DialogTitle className="text-2xl font-headline font-bold">Provision Officer</DialogTitle></div>
                 <form onSubmit={handleAdd} className="p-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Name *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Employee ID *</Label><Input value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value.toUpperCase()})} required /></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Official Email *</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-bold uppercase text-slate-400">Passphrase *</Label>
                         <div className="relative">
                            <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                         </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5 flex-1">
                         <Label className="text-[10px] font-bold uppercase text-slate-400">Designation *</Label>
                         <Select value={formData.designation} onValueChange={(val) => setFormData({...formData, designation: val})}>
                            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white">{OFFICER_DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Phone</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                    </div>
                    <Button type="submit" disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl">Provision Account</Button>
                 </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <section className="py-8 container mx-auto px-4 max-w-5xl">
         <div className="relative mb-12">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search registry..." className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-900 shadow-sm border-none" value={search} onChange={e => setSearch(e.target.value)} />
         </div>

         {dataLoading ? (
           <div className="text-center py-20"><Loader2 className="animate-spin text-accent" /></div>
         ) : (
           <div className="grid gap-6">
              {filtered.map((officer: any) => (
                <Card key={officer.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                       <div className="p-8 md:w-56 text-center border-r bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center shrink-0">
                          <Badge variant="outline" className="text-[8px] font-mono border-accent text-accent mb-4">{(officer.employeeId || 'IO-TEMP')}</Badge>
                          <div className="w-16 h-16 rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-accent"><UserRoundCheck className="w-8 h-8" /></div>
                          <Badge className={cn("mt-4 text-[8px] font-black uppercase h-5", officer.status === 'active' ? "bg-emerald-500" : "bg-red-500")}>{officer.status}</Badge>
                       </div>
                       <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="space-y-4 text-center md:text-left flex-1">
                             <div className="space-y-1">
                                <h3 className="text-2xl font-headline font-bold text-primary dark:text-white leading-tight">{officer.name}</h3>
                                <p className="text-[10px] font-black text-accent uppercase tracking-widest">{officer.designation}</p>
                             </div>
                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-accent" /> {officer.email}</span>
                                <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-accent" /> {officer.phone || 'N/A'}</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <Button 
                              onClick={() => setSelectedOfficerForDetails(officer)} 
                              variant="outline" 
                              size="sm" 
                              className="h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                             >
                               Details
                             </Button>
                             <Button onClick={() => setEditOfficer(officer)} variant="outline" size="sm" className="h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest">Modify</Button>
                             <button onClick={() => handleStartDelete(officer)} disabled={isActionLoading} className="h-10 w-10 text-slate-300 hover:text-red-500 rounded-xl flex items-center justify-center">{isActionLoading ? <Loader2 className="animate-spin" /> : <Trash2 className="w-5 h-5" />}</button>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
           </div>
         )}
      </section>

      {/* Forced Fault-Tolerant Deletion Dialog */}
      <Dialog open={!!deleteDialogStep} onOpenChange={(open) => { if(!open) { setDeleteDialogStep(null); setOfficerToDelete(null); setDeleteInputText(''); } }}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
          {deleteDialogStep === 'confirm' && (
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center animate-pulse"><ShieldAlert className="w-10 h-10" /></div>
                <div className="space-y-2">
                  <DialogTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Confirm Identity Purge</DialogTitle>
                  <DialogDescription className="text-sm font-medium">You are about to permanently delete this record. This action cannot be undone.</DialogDescription>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setDeleteDialogStep(null); setOfficerToDelete(null); }} className="flex-1 h-12 rounded-xl font-bold">Cancel</Button>
                <Button variant="destructive" onClick={executeGovernanceAudit} className="flex-1 h-12 rounded-xl font-bold">Authorize Audit</Button>
              </div>
            </div>
          )}

          {deleteDialogStep === 'blocked' && (
            <div className="flex flex-col animate-in fade-in duration-500">
              <div className="bg-red-600 p-8 text-white shrink-0">
                <DialogTitle className="text-2xl font-headline font-bold">Operation Blocked</DialogTitle>
                <p className="text-red-100 text-sm mt-2">Active investigative assignments must be resolved or reassigned before this officer can be purged from the registry.</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="rounded-2xl border bg-slate-50 overflow-hidden">
                  <ScrollArea className="h-[150px]">
                    <Table>
                      <TableBody>
                        {activeAssignments.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-[10px] font-mono font-bold text-accent py-3">{c.caseId || c.token}</TableCell>
                            <TableCell className="text-[10px] font-bold py-3 truncate">{c.subject}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
                <Button onClick={() => setDeleteDialogStep(null)} className="w-full h-12 bg-primary text-white font-bold rounded-xl">Acknowledge</Button>
              </div>
            </div>
          )}

          {deleteDialogStep === 'warning' && (
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center"><ShieldAlert className="w-10 h-10" /></div>
                <div className="space-y-2">
                  <DialogTitle className="text-2xl font-headline font-bold">Security Final Warning</DialogTitle>
                  <DialogDescription className="text-sm font-medium">This will permanently revoke all access credentials and delete every available record associated with {officerToDelete?.name || 'this official'}.</DialogDescription>
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
              <div className="space-y-2 text-center">
                <DialogTitle className="text-xl font-headline font-bold">Verification Protocol</DialogTitle>
                <p className="text-xs text-slate-500">To authorize this purge, please type the word <strong className="text-red-600 uppercase">delete</strong> below.</p>
              </div>
              <Input placeholder="Type 'delete'..." value={deleteInputText} onChange={(e) => setDeleteInputText(e.target.value)} className="h-12 rounded-xl border-2 focus:ring-red-500 font-bold text-center" />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => { setDeleteDialogStep(null); setOfficerToDelete(null); setDeleteInputText(''); }} className="flex-1 h-12 rounded-xl text-slate-400 font-bold">Abort</Button>
                <Button 
                  variant="destructive" 
                  disabled={(deleteInputText || '').toLowerCase() !== 'delete' || isDeleting} 
                  onClick={handleDelete}
                  className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? <Loader2 className="animate-spin" /> : "Verify & Force Purge"}
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
               <div className="bg-slate-900 p-8 text-white shrink-0"><DialogTitle className="text-2xl font-headline font-bold">Update Profile Meta</DialogTitle></div>
               <div className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Name</Label><Input value={editOfficer.name || ''} onChange={e => setEditOfficer({...editOfficer, name: e.target.value})} className="h-11 rounded-xl" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-400">Employee ID</Label><Input value={(editOfficer.employeeId || '')} disabled className="h-11 rounded-xl bg-slate-50 font-mono" /></div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 flex-1">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Rank</Label>
                       <Select value={editOfficer.designation || 'Investigation Officer'} onValueChange={(val) => setEditOfficer({...editOfficer, designation: val})}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white">{OFFICER_DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Status</Label>
                       <Select value={editOfficer.status || 'active'} onValueChange={(val: any) => setEditOfficer({...editOfficer, status: val})}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white"><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                       </Select>
                    </div>
                  </div>
                  <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl">Commit Refresh</Button>
               </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!selectedOfficerForDetails} onOpenChange={(val) => !val && setSelectedOfficerForDetails(null)}>
        <DialogContent className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
          {selectedOfficerForDetails && (
            <>
              <div className="bg-slate-900 p-8 text-white relative">
                <div className="absolute right-6 top-6">
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white">
                      <X className="w-5 h-5" />
                    </Button>
                  </DialogClose>
                </div>
                <Badge className="bg-accent text-primary font-black text-[8px] uppercase mb-2">Personnel Profile</Badge>
                <DialogTitle className="text-2xl font-headline font-bold">{selectedOfficerForDetails.name}</DialogTitle>
                <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-accent" /> {selectedOfficerForDetails.employeeId || 'IO-PENDING'}
                </p>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Official Rank</p>
                    <p className="text-sm font-bold text-primary dark:text-white leading-tight">{selectedOfficerForDetails.designation}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <Badge className={cn(
                      "text-[9px] font-black uppercase h-5 px-3 border-none",
                      selectedOfficerForDetails.status === 'active' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                    )}>
                      {selectedOfficerForDetails.status || 'active'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <User className="w-4 h-4 text-accent" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact Protocols</h4>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-primary dark:text-white truncate">{selectedOfficerForDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-primary dark:text-white">{selectedOfficerForDetails.phone || 'NO SECURE PHONE RECORDED'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Jurisdictional Node</h4>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <Navigation className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-primary dark:text-white uppercase tracking-tight">{selectedOfficerForDetails.region || 'National Investigative Hub'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Registered: {selectedOfficerForDetails.createdAt?.toDate ? selectedOfficerForDetails.createdAt.toDate().toLocaleDateString('en-IN') : 'Archive Entry'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Docket: {selectedOfficerForDetails.assignedCount || 0}</span>
                  </div>
                </div>

                <Button onClick={() => setSelectedOfficerForDetails(null)} className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
                  Close Profile
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
