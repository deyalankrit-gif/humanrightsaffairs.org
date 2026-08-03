
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth'
import { firebaseConfig } from '@/firebase/config'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  Loader2, 
  Mail, 
  User, 
  Lock, 
  Search, 
  Activity, 
  Key, 
  Eye, 
  EyeOff, 
  Edit,
  AlertTriangle,
  ShieldCheck,
  Fingerprint,
  Users,
  CheckCircle2,
  XCircle,
  X,
  UserCheck,
  Info,
  Filter,
  Settings2,
  LockKeyhole,
  LayoutDashboard,
  Globe,
  MessageSquareQuote
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * MODULES: The comprehensive suite of permissions available for Staff and Admins.
 * These are strictly hidden from General Member views.
 */
const STAFF_ADMIN_MODULES = [
  { id: 'dailyUpdate', label: 'Daily Update Terminal' },
  { id: 'financeDashboard', label: 'Finance Dashboard' },
  { id: 'financeLedger', label: 'General Ledger' },
  { id: 'financeVouchers', label: 'Voucher Hub' },
  { id: 'financePayroll', label: 'Payroll Suite' },
  { id: 'financeProjects', label: 'Project Accounting' },
  { id: 'financeAssets', label: 'Asset Registry' },
  { id: 'financeCompliance', label: 'Tax & Compliance' },
  { id: 'materialManagement', label: 'Material System' },
  { id: 'inventory', label: 'Stock Inventory' },
  { id: 'seoDashboard', label: 'SEO Analytics Hub' },
  { id: 'analytics', label: 'Donation Analytics' },
  { id: 'members', label: 'Member Directory' },
  { id: 'renewals', label: 'Member Renewals' },
  { id: 'accounts', label: 'Accounts Management' },
  { id: 'expenses', label: 'Expenses Tracking' },
  { id: 'applications', label: 'Membership Apps' },
  { id: 'publicComplaints', label: 'Public Complaints' },
  { id: 'kitManagement', label: 'Kit & Asset Management' },
  { id: 'vendors', label: 'Vendor Registry' },
  { id: 'grievances', label: 'Grievance Cell' },
  { id: 'meetings', label: 'General Meetings' },
  { id: 'events', label: 'Event Archives' },
  { id: 'gallery', label: 'Gallery Archive' },
  { id: 'occasions', label: 'Occasion Greetings' },
  { id: 'donorWall', label: 'Donor Wall Management' },
  { id: 'terminated', label: 'Terminated Registry' },
]

/**
 * MEMBER_MODULES: A specific, restricted subset of permissions for General Members.
 */
const MEMBER_MODULES = [
  { id: 'publicView', label: 'Internal Mirror Access' },
  { id: 'activityHub', label: 'Activity Hub Access' },
  { id: 'memberAnalytics', label: 'Demographic Intelligence' },
  { id: 'feedback', label: 'Community Voice Hub' },
]

export default function AccessRolesPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [roleTab, setRoleTab] = useState<'Admin' | 'Staff' | 'Member'>('Staff')
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('staff')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isEditDialogOpen, setIsAddingEditDialogOpen] = useState(false)

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com'

  // Initialize role creation choice based on current tab
  useEffect(() => {
    if (roleTab === 'Member') setNewRole('member');
    else if (roleTab === 'Admin') setNewRole('admin');
    else setNewRole('staff');
  }, [roleTab]);

  useEffect(() => {
    if (!authLoading && !isRoot) {
      router.push('/internal/super-login')
    }
  }, [isRoot, authLoading, router])

  const usersQuery = useMemoFirebase(() => {
    if (!db || !isRoot) return null;
    return query(collection(db, 'users'), orderBy('email', 'asc'));
  }, [db, isRoot]);

  const { data: users, loading: dataLoading } = useCollection(usersQuery);

  const handleTogglePermission = async (userEmail: string, module: string, currentVal: boolean) => {
    if (!db || !isRoot) return
    setIsSaving(`${userEmail}-${module}`)
    
    const userRef = doc(db, 'users', userEmail.toLowerCase().trim())
    
    const updateData = {
      [`permissions.${module}`]: !currentVal,
      updatedAt: serverTimestamp()
    }
    
    updateDoc(userRef, updateData)
      .then(() => {
        toast({ title: "Access Modified", description: `${module.toUpperCase()} permission updated.` })
        setIsSaving(null)
      })
      .catch(() => setIsSaving(null))
  }

  const handleToggleStatus = async (userEmail: string, currentStatus: string) => {
    if (!db || !isRoot) return
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const userRef = doc(db, 'users', userEmail.toLowerCase().trim());
    
    updateDoc(userRef, { status: nextStatus, updatedAt: serverTimestamp() })
      .then(() => {
        toast({ title: nextStatus === 'active' ? "Access Approved" : "Access Suspended" })
      })
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !isRoot || !newEmail.trim() || !newPassword.trim()) return
    setIsAdding(true)

    const userEmail = newEmail.toLowerCase().trim()
    const tempAppName = `TempApp-${Date.now()}`
    const secondaryApp = initializeApp(firebaseConfig, tempAppName);
    const secondaryAuth = getAuth(secondaryApp);

    let authUser: any = null;

    try {
      const authUserCredential = await createUserWithEmailAndPassword(secondaryAuth, userEmail, newPassword);
      authUser = authUserCredential.user;
      
      if (authUser) {
        await updateProfile(authUser, { displayName: newName || userEmail.split('@')[0] });
      }

      const initialPermissions = (newRole === 'member' ? MEMBER_MODULES : STAFF_ADMIN_MODULES).reduce((acc, mod) => ({ ...acc, [mod.id]: false }), {
        publicView: true
      })
      
      const userRef = doc(db, 'users', userEmail)
      const userData = {
        uid: authUser.uid,
        email: userEmail,
        name: newName || userEmail.split('@')[0],
        role: newRole,
        status: 'active',
        permissions: initialPermissions,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.uid || 'root-admin'
      }

      await setDoc(userRef, userData)
      
      toast({ title: "Personnel Provisioned", description: `Account established as ${newRole.toUpperCase()}.` })
      setNewEmail('')
      setNewName('')
      setNewPassword('')
      await deleteApp(secondaryApp);
      setIsAdding(false)
    } catch (err: any) {
      if (authUser) {
        try { await deleteUser(authUser); } catch (rollbackErr) {}
      }
      toast({ variant: "destructive", title: "Protocol Failure", description: err.message })
      try { await deleteApp(secondaryApp); } catch(e) {}
      setIsAdding(false)
    }
  }

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !isRoot || !editingUser) return
    setIsUpdating(true)

    const userRef = doc(db, 'users', editingUser.email.toLowerCase().trim())
    const updateData: any = {
      name: editingUser.name,
      role: editingUser.role,
      updatedAt: serverTimestamp()
    }

    try {
      await updateDoc(userRef, updateData)
      toast({ title: "Profile Refreshed" })
      setEditingUser(null);
      setIsAddingEditDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = async (userEmail: string) => {
    if (!db || !isRoot || !userEmail) return
    const userRef = doc(db, 'users', userEmail.toLowerCase().trim())
    setIsDeleting(userEmail)
    deleteDoc(userRef)
      .then(() => {
        toast({ title: "Clearance Revoked" })
        setIsDeleting(null)
      })
      .catch(() => setIsDeleting(null))
  }

  const filteredUsers = (users || []).filter((u: any) => {
    const emailStr = (u.email || u.id || '').toLowerCase();
    const nameStr = (u.name || '').toLowerCase();
    const matchesSearch = emailStr.includes(search.toLowerCase()) || nameStr.includes(search.toLowerCase());
    const userRole = (u.role || '').toLowerCase();
    return matchesSearch && userRole === roleTab.toLowerCase();
  })

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 border-b-8 border-red-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-accent/30">
                <ShieldAlert className="w-2.5 h-2.5" /> Force Governance
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">Access <span className="text-red-600 italic">Roles</span></h1>
              <p className="text-slate-500 text-[11px] uppercase tracking-widest font-black">Official Personnel Registry Terminal</p>
            </div>
            <div className="flex items-center gap-4 p-1.5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
               {['Admin', 'Staff', 'Member'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setRoleTab(tab as any)}
                   className={cn(
                     "px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all tracking-[0.1em]",
                     roleTab === tab ? "bg-red-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                   )}
                 >
                   {tab}S
                 </button>
               ))}
            </div>
          </div>
        </div>
      </header>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Context-Aware Provisioning Form */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-slate-900 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                 <CardHeader className="bg-white/5 border-b border-white/5 p-6">
                   <CardTitle className="text-lg font-headline font-bold text-white flex items-center gap-2 uppercase tracking-tighter">
                     <UserPlus className="w-5 h-5 text-red-600" /> Provision {roleTab}
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8">
                   <form onSubmit={handleAddStaff} className="space-y-6">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Official Name</Label>
                        <Input value={newName} onChange={e => setNewName(e.target.value)} className="bg-black/50 border-white/5 text-white rounded-xl h-11" placeholder="Full Legal Identity" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Registry Identity (Email)</Label>
                        <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-black/50 border-white/5 text-white rounded-xl h-11" placeholder="name@hrat-india.org" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Fixed Role</Label>
                          <div className="h-11 rounded-xl bg-black/30 border border-white/5 flex items-center px-4 text-xs font-bold text-slate-300 uppercase">
                             {roleTab === 'Member' ? 'General Member' : roleTab === 'Admin' ? 'Administrator' : 'Staff Member'}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Auth Key</Label>
                          <div className="relative">
                            <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-black/50 border-white/5 text-white rounded-xl h-11 pl-10 pr-10 text-xs" placeholder="••••••••" required />
                            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-700" />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                          </div>
                        </div>
                      </div>
                      <Button type="submit" disabled={isAdding} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl shadow-red-600/10">
                        {isAdding ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Provision Identity"}
                      </Button>
                   </form>
                 </CardContent>
              </Card>

              <div className="p-8 rounded-[2.5rem] bg-red-950/20 border-2 border-dashed border-red-900/30 text-center space-y-4">
                 <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                 <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500">Dual-Registry Policy</h4>
                 <p className="text-[9px] text-slate-400 font-bold leading-relaxed italic uppercase">
                   "Identity records are atomically synchronized between Firebase Auth and the National Registry. Any status suspension instantly terminates organizational access rights."
                 </p>
              </div>
            </div>

            {/* Right Column: Registry Stream */}
            <div className="lg:col-span-8 space-y-6">
              <div className="relative mb-6">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                 <Input 
                    placeholder={`Filter verified ${roleTab.toLowerCase()} records...`}
                    className="pl-12 bg-slate-900 border-white/5 text-white h-12 rounded-2xl text-sm shadow-inner focus:ring-red-600/20" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                 />
              </div>

              {dataLoading ? (
                <div className="text-center py-24"><Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto" /></div>
              ) : (
                <div className="grid gap-6">
                  {filteredUsers.map((u: any) => {
                    const isMember = (u.role || '').toLowerCase() === 'member';
                    
                    return (
                      <Card key={u.id} className="bg-slate-900 border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-red-900/40 transition-all shadow-xl">
                        <CardHeader className="p-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 bg-white/5">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-red-600 transition-colors">
                                <User className="w-7 h-7 text-slate-500" />
                              </div>
                              <div className="space-y-1">
                                 <CardTitle className="text-xl font-headline font-bold text-white flex items-center gap-3">
                                   {u.name || (u.email || u.id).split('@')[0]}
                                   <Badge className={cn(
                                     "text-[8px] font-black px-3 h-5 rounded-full uppercase border-none", 
                                     u.role === 'admin' ? "bg-red-600 text-white" : isMember ? "bg-secondary text-white" : "bg-slate-800 text-white"
                                   )}>
                                     {u.role?.toUpperCase()}
                                   </Badge>
                                 </CardTitle>
                                 <div className="flex items-center gap-3">
                                    <Mail className="w-3.5 h-3.5 text-red-500" />
                                    <span className="text-[11px] font-mono text-slate-500">{u.email || u.id}</span>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/50 border border-white/5">
                                      <div className={cn("w-1 h-1 rounded-full animate-pulse", u.status === 'active' ? "bg-emerald-500" : "bg-red-500")} />
                                      <span className={cn("text-[8px] font-black uppercase", u.status === 'active' ? "text-emerald-500" : "text-red-500")}>{u.status || 'Active'}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleToggleStatus(u.id, u.status || 'active')}
                                className={cn("h-9 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2", u.status === 'active' ? "text-red-500 hover:bg-red-500/10" : "text-emerald-500 hover:bg-emerald-500/10")}
                              >
                                {u.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                {u.status === 'active' ? 'Suspend' : 'Verify'}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => { setEditingUser({ ...u, email: u.email || u.id }); setIsAddingEditDialogOpen(true); }} className="h-9 w-9 text-slate-600 hover:text-accent rounded-xl transition-colors"><Edit className="w-4 h-4" /></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600 hover:text-red-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-900 border-white/10 text-white rounded-[2rem]">
                                  <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2 text-red-500">Confirm Deletion</AlertDialogTitle><AlertDialogDescription className="text-slate-400 uppercase tracking-widest text-[10px]">You are about to permanently delete this record. This action may permanently remove related data. This action cannot be undone. Please confirm that you want to continue.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter><AlertDialogCancel className="bg-white/5 border-white/10 text-white rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(u.id)} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold">{isDeleting === u.id ? <Loader2 className="animate-spin" /> : "Delete Permanently"}</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                           </div>
                        </CardHeader>
                        <CardContent className="p-8">
                           {isMember ? (
                             <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-3">
                                  <UserCheck className="w-4 h-4 text-emerald-500" />
                                  <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em]">Member Arrangement Suite</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {MEMBER_MODULES.map((mod) => {
                                    const hasAccess = u.permissions?.[mod.id] === true;
                                    const loadingId = `${u.id}-${mod.id}`;
                                    return (
                                      <div key={mod.id} className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all duration-300", hasAccess ? "bg-emerald-500/5 border-emerald-900/30 text-emerald-400 shadow-lg shadow-emerald-500/5" : "bg-black/20 border-white/5 text-slate-500")}>
                                        <span className="text-[10px] font-black uppercase tracking-tighter">{mod.label}</span>
                                        <Switch 
                                          checked={hasAccess} 
                                          disabled={isSaving === loadingId} 
                                          onCheckedChange={() => handleTogglePermission(u.id, mod.id, hasAccess)} 
                                          className="data-[state=checked]:bg-emerald-500" 
                                        />
                                      </div>
                                    )
                                  })}
                                </div>
                                <div className="p-5 bg-black/40 rounded-3xl border border-white/5 flex items-start gap-4">
                                   <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                   <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase italic">
                                     "Arrangements for standard members are strictly limited to institutional intelligence and internal mirror access. No staff administrative modules are visible or available in this context."
                                   </p>
                                </div>
                             </div>
                           ) : (
                             <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-3">
                                  <ShieldCheck className="w-4 h-4 text-red-500" />
                                  <span className="text-[10px] font-black uppercase text-red-500 tracking-[0.3em]">Staff Administrative Arrangement</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {STAFF_ADMIN_MODULES.map((mod) => {
                                    const hasAccess = u.permissions?.[mod.id] === true;
                                    const loadingId = `${u.id}-${mod.id}`;
                                    return (
                                      <div key={mod.id} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all duration-300", hasAccess ? "bg-red-500/5 border-red-900/30 text-red-400" : "bg-black/20 border-white/5 text-slate-500")}>
                                        <span className="text-[9px] font-bold uppercase truncate pr-2">{mod.label}</span>
                                        <Switch 
                                          checked={hasAccess} 
                                          disabled={isSaving === loadingId} 
                                          onCheckedChange={() => handleTogglePermission(u.id, mod.id, hasAccess)} 
                                          className="data-[state=checked]:bg-red-600" 
                                        />
                                      </div>
                                    )
                                  })}
                                </div>
                             </div>
                           )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-40 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5">
                       <UserCheck className="w-16 h-16 text-white/5 mx-auto mb-6" />
                       <p className="text-lg font-headline font-bold text-slate-500 uppercase tracking-widest">No {roleTab.toLowerCase()} records identified</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsAddingEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/5 text-white rounded-[2.5rem] shadow-2xl z-[1000001]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-2 uppercase tracking-tighter">Update Personnel Metadata</DialogTitle>
            <DialogDescription className="text-slate-400 uppercase tracking-widest text-[10px] font-black">Registry Refresh Protocol</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateStaff} className="space-y-6 py-4">
               <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-500">Verified ID</Label><Input value={editingUser.email} disabled className="bg-black/30 border-white/5 text-slate-500 rounded-xl h-11" /></div>
               <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-slate-500">Legal Name</Label><Input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="bg-black/50 border-white/5 text-white rounded-xl h-11" /></div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Operational Role</Label>
                  <Select value={editingUser.role} onValueChange={v => setEditingUser({...editingUser, role: v})}>
                    <SelectTrigger className="bg-black/50 border-white/10 h-11 rounded-xl text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white z-[1000001]">
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="staff">Staff Personnel</SelectItem>
                      <SelectItem value="member">General Member</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <DialogFooter><Button type="submit" disabled={isUpdating} className="w-full h-12 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl">Commit Profile Refresh</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  )
}
