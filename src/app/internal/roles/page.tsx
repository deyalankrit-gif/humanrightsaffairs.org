
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
  Settings2
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
 * MODULES: The full suite of permissions available for Staff and Admins.
 */
const MODULES = [
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
  { id: 'memberAnalytics', label: 'Member Analytics' },
  { id: 'visitors', label: 'Website Visitors' },
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
  { id: 'activityHub', label: 'Activity Hub' },
  { id: 'publicView', label: 'Public Site View' },
  { id: 'terminated', label: 'Terminated Registry' },
]

/**
 * MEMBER_MODULES: A specific subset of permissions that can be granted to standard members.
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
  const [roleTab, setRoleTab] = useState<'All' | 'Admin' | 'Staff' | 'Member'>('All')
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

      const initialPermissions = MODULES.reduce((acc, mod) => ({ ...acc, [mod.id]: false }), {
        publicView: true,
        dailyUpdate: newRole === 'staff'
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
      
      toast({ title: "Personnel Provisioned", description: `Account success for ${userEmail}.` })
      setNewEmail('')
      setNewName('')
      setNewPassword('')
      setNewRole('staff')
      await deleteApp(secondaryApp);
      setIsAdding(false)
    } catch (err: any) {
      if (authUser) {
        try {
          await deleteUser(authUser);
        } catch (rollbackErr) {
          console.error("Rollback critical failure:", rollbackErr);
        }
      }
      toast({ variant: "destructive", title: "Provisioning Critical Failure", description: err.message || "Could not complete dual-registry synchronization." })
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
      toast({ title: "Registry Updated", description: `Profile for ${editingUser.email} refreshed.` })
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
    
    const targetUser = users?.find(u => (u.email || u.id).toLowerCase() === userEmail.toLowerCase())
    if (targetUser?.role === 'admin') {
      toast({ variant: "destructive", title: "Forbidden Action", description: "Root administration cannot be purged." });
      return
    }

    setIsDeleting(userEmail)
    const userRef = doc(db, 'users', userEmail.toLowerCase().trim())
    
    deleteDoc(userRef)
      .then(() => {
        toast({ title: "Clearance Revoked", description: "The personnel record has been purged from Firestore." })
        setIsDeleting(null)
      })
      .catch(() => setIsDeleting(null))
  }

  if (authLoading || !isRoot) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-red-600" /></div>
  }

  const filteredUsers = (users || []).filter((u: any) => {
    const emailStr = (u.email || u.id || '').toLowerCase();
    const nameStr = (u.name || '').toLowerCase();
    const matchesSearch = emailStr.includes(search.toLowerCase()) || nameStr.includes(search.toLowerCase());
    
    const userRole = (u.role || '').toLowerCase();
    const matchesRole = roleTab === 'All' || userRole === roleTab.toLowerCase();
    
    return matchesSearch && matchesRole;
  })

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      <section className="pt-16 pb-8 bg-slate-900 border-b-8 border-red-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-accent/30">
                <ShieldAlert className="w-2.5 h-2.5" /> Secure Governance
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">Access <span className="text-red-600 italic">Roles</span></h1>
              <p className="text-slate-500 text-[11px] max-w-xl font-medium uppercase tracking-widest">Auth-Firestore Synchronized Provisioning Suite</p>
            </div>
            <Activity className="w-6 h-6 text-red-600 animate-pulse hidden md:block" />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-slate-900 border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                 <CardHeader className="bg-white/5 border-b border-white/5">
                   <CardTitle className="text-lg font-headline font-bold text-white flex items-center gap-2">
                     <UserPlus className="w-5 h-5 text-red-600" /> Provision Account
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                   <form onSubmit={handleAddStaff} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-300">Full Legal Name</Label>
                        <Input value={newName} onChange={e => setNewName(e.target.value)} className="bg-black/50 border-white/5 text-white rounded-xl h-11" placeholder="Official Name" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-300">Official Identity (Email)</Label>
                        <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-black/50 border-white/5 text-white rounded-xl h-11" placeholder="name@hrat-india.org" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-300">Institutional Role</Label>
                          <Select value={newRole} onValueChange={setNewRole}>
                             <SelectTrigger className="bg-black/50 border-white/10 h-11 rounded-xl text-white"><SelectValue placeholder="Select Role" /></SelectTrigger>
                             <SelectContent className="bg-slate-900 border-white/10 text-white z-[1000001]">
                                <SelectItem value="staff">Staff Personnel</SelectItem>
                                <SelectItem value="member">General Member</SelectItem>
                             </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-300">Auth Secret</Label>
                          <div className="relative">
                            <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-black/50 border-white/5 text-white rounded-xl h-11 pl-10 pr-10" placeholder="••••••••" required />
                            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                          </div>
                        </div>
                      </div>
                      <Button type="submit" disabled={isAdding} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xl shadow-red-600/10 mt-2">
                        {isAdding ? <Loader2 className="animate-spin w-5 h-5" /> : "Authorize & Create Account"}
                      </Button>
                   </form>
                 </CardContent>
              </Card>

              <div className="p-8 rounded-[2.5rem] bg-red-950/20 border border-red-900/30 text-center space-y-4 shadow-inner">
                 <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                 <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500">Approval Mandate</h4>
                 <p className="text-[10px] text-slate-400 italic leading-relaxed">
                   "All accounts, including General Members, must be toggled to 'Active' status to gain access to their respective dashboards. Revoking status instantly terminates session tokens."
                 </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-2">
                 <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                    {['All', 'Admin', 'Staff', 'Member'].map((role) => (
                      <button
                        key={role}
                        onClick={() => setRoleTab(role as any)}
                        className={cn(
                          "whitespace-nowrap rounded-xl px-5 font-black h-9 text-[10px] uppercase transition-all tracking-widest",
                          roleTab === role 
                            ? "bg-red-600 text-white shadow-[0_4px_15px_rgba(220,38,38,0.3)]" 
                            : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                 </div>
                 <div className="relative w-full max-md:max-w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <Input 
                       placeholder="Search registry by name or email..." 
                       className="pl-9 bg-slate-900 border-white/5 text-white h-11 rounded-2xl text-xs shadow-inner focus:ring-red-600/20" 
                       value={search} 
                       onChange={e => setSearch(e.target.value)} 
                    />
                 </div>
              </div>

              {dataLoading ? (
                <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto" /></div>
              ) : (
                <div className="grid gap-6">
                  {filteredUsers.map((u: any) => {
                    const isMember = (u.role || '').toLowerCase() === 'member';
                    
                    return (
                      <Card key={u.id} className="bg-slate-900 border-white/5 rounded-[2rem] overflow-hidden group hover:border-red-900/30 transition-all">
                        <CardHeader className="p-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-red-600 transition-colors"><User className="w-6 h-6 text-slate-400" /></div>
                              <div>
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
                                    <Mail className="w-3 h-3 text-red-500" />
                                    <span className="text-[10px] font-mono text-slate-500">{u.email || u.id}</span>
                                    <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                                      <div className={cn("w-1.5 h-1.5 rounded-full", u.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                                      <span className={cn("text-[8px] font-black uppercase", u.status === 'active' ? "text-emerald-500" : "text-red-500")}>{u.status || 'Active'}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              {u.role !== 'admin' && (
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleToggleStatus(u.id, u.status || 'active')}
                                    className={cn("h-9 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2", u.status === 'active' ? "text-red-500 hover:bg-red-500/10" : "text-emerald-500 hover:bg-emerald-500/10")}
                                  >
                                    {u.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {u.status === 'active' ? 'Suspend' : 'Approve'}
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => { setEditingUser({ ...u, email: u.email || u.id }); setIsAddingEditDialogOpen(true); }} className="h-9 w-9 text-slate-600 hover:text-accent rounded-xl transition-colors"><Edit className="w-4 h-4" /></Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600 hover:text-red-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-900 border-white/10 text-white rounded-[2rem]">
                                      <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2 text-red-500"><AlertTriangle className="w-6 h-6" /> Revoke Clearance?</AlertDialogTitle><AlertDialogDescription className="text-slate-400 uppercase tracking-widest text-[10px]">Permanently purge the record for <strong className="text-white">{u.email || u.id}</strong>? Access will be terminated immediately.</AlertDialogDescription></AlertDialogHeader>
                                      <AlertDialogFooter><AlertDialogCancel className="bg-white/5 border-white/10 text-white rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(u.id)} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold">{isDeleting === u.id ? <Loader2 className="animate-spin" /> : "Revoke Clearance"}</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
                           </div>
                        </CardHeader>
                        <CardContent className="p-6">
                           {isMember ? (
                             <div className="space-y-4 animate-in fade-in duration-500">
                                <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                                  <UserCheck className="w-4 h-4 text-emerald-500" />
                                  <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">Member Specific Governance</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {MEMBER_MODULES.map((mod) => {
                                    const hasAccess = u.permissions?.[mod.id] === true;
                                    const loadingId = `${u.id}-${mod.id}`;
                                    return (
                                      <div key={mod.id} className={cn("flex items-center justify-between p-3 rounded-2xl border transition-all duration-300", hasAccess ? "bg-emerald-500/5 border-emerald-900/30 text-emerald-400 shadow-lg shadow-emerald-500/5" : "bg-black/20 border-white/5 text-slate-500")}>
                                        <span className="text-[10px] font-bold uppercase tracking-tighter">{mod.label}</span>
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
                                <div className="pt-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-start gap-3 leading-relaxed">
                                    <Info className="w-4 h-4 text-accent shrink-0" /> Standard members can only see this restricted set of institutional intelligence nodes.
                                  </p>
                                </div>
                             </div>
                           ) : (
                             <div className="space-y-4 animate-in fade-in duration-500">
                                <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                                  <ShieldCheck className="w-4 h-4 text-red-500" />
                                  <span className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em]">Full Administrative Suite</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {MODULES.map((mod) => {
                                    const hasAccess = u.permissions?.[mod.id] === true;
                                    const loadingId = `${u.id}-${mod.id}`;
                                    return (
                                      <div key={mod.id} className={cn("flex items-center justify-between p-3 rounded-2xl border transition-all duration-300", hasAccess ? "bg-red-500/5 border-red-900/30 text-red-400" : "bg-black/20 border-white/5 text-slate-500")}>
                                        <span className="text-[10px] font-bold uppercase tracking-tighter">{mod.label}</span>
                                        <Switch 
                                          checked={hasAccess} 
                                          disabled={isSaving === loadingId || u.role === 'admin'} 
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
                       <p className="text-lg font-headline font-bold text-slate-500 uppercase tracking-widest">No matching records identified</p>
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
            <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-2"><Edit className="w-6 h-6 text-accent" /> Update Account Metadata</DialogTitle>
            <DialogDescription className="text-slate-400 uppercase tracking-widest text-[10px]">Modify registry profile for authorized official or member.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateStaff} className="space-y-6 py-4">
               <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-300">Identity (Registry ID)</Label><Input value={editingUser.email} disabled className="bg-black/30 border-white/5 text-slate-500 rounded-xl h-11" /></div>
               <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-300">Legal Name</Label><Input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="bg-black/50 border-white/5 text-white rounded-xl h-11" /></div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-300">Role Elevation/Demotion</Label>
                  <Select value={editingUser.role} onValueChange={v => setEditingUser({...editingUser, role: v})}>
                    <SelectTrigger className="bg-black/50 border-white/10 h-11 rounded-xl text-white"><SelectValue placeholder="Select Role" /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white z-[1000001]">
                      <SelectItem value="staff">Staff Personnel</SelectItem>
                      <SelectItem value="member">General Member</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <DialogFooter><Button type="submit" disabled={isUpdating} className="w-full h-12 bg-accent text-primary font-bold rounded-xl shadow-xl shadow-accent/10">{isUpdating ? <Loader2 className="animate-spin w-6 h-6" /> : "Commit Profile Refresh"}</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  )
}
