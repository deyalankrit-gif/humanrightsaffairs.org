"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Loader2, 
  Mail, 
  User, 
  Settings,
  Lock,
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  Activity,
  History,
  AlertTriangle,
  Key,
  Eye,
  EyeOff
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'

const MODULES = [
  { id: 'analytics', label: 'Donation Analytics' },
  { id: 'members', label: 'Member Directory' },
  { id: 'visitors', label: 'Website Visitors' },
  { id: 'accounts', label: 'Accounts Management' },
  { id: 'expenses', label: 'Expenses Tracking' },
  { id: 'applications', label: 'Membership Apps' },
  { id: 'inventory', label: 'Material Inventory' },
  { id: 'vendors', label: 'Vendor Registry' },
  { id: 'grievances', label: 'Grievance Cell' },
  { id: 'meetings', label: 'General Meetings' },
  { id: 'events', label: 'Event Archives' },
  { id: 'publicView', label: 'Public Site View' },
]

export default function AccessRolesPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

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
      permissions: {
        [module]: !currentVal
      }
    }
    
    setDoc(userRef, updateData, { merge: true })
      .then(() => {
        toast({ title: "Permission Updated", description: `${module.toUpperCase()} access modified.` })
        setIsSaving(null)
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: updateData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setIsSaving(null)
      })
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !isRoot || !newEmail.trim() || !newPassword.trim()) return
    setIsAdding(true)

    const initialPermissions = MODULES.reduce((acc, mod) => ({ ...acc, [mod.id]: false }), {})
    const userEmail = newEmail.toLowerCase().trim()
    const userRef = doc(db, 'users', userEmail)
    const userData = {
      email: userEmail,
      name: newName || userEmail.split('@')[0],
      password: newPassword,
      role: 'staff',
      permissions: initialPermissions,
      createdAt: serverTimestamp()
    }

    setDoc(userRef, userData)
      .then(() => {
        toast({ title: "Staff Provisioned", description: `${userEmail} added with governance key.` })
        setNewEmail('')
        setNewName('')
        setNewPassword('')
        setIsAdding(false)
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'create',
          requestResourceData: userData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setIsAdding(false)
      })
  }

  const handleDeleteUser = async (userEmail: string) => {
    if (!db || !isRoot || !userEmail) return
    
    // Find the user to check role
    const targetUser = users?.find(u => u.id.toLowerCase() === userEmail.toLowerCase())
    if (targetUser?.role === 'admin') {
      toast({ variant: "destructive", title: "Action Restricted", description: "Root administrative records cannot be deleted." });
      return
    }

    setIsDeleting(userEmail)
    const userRef = doc(db, 'users', userEmail.toLowerCase().trim())
    
    deleteDoc(userRef)
      .then(() => {
        toast({ title: "Access Revoked", description: `Record for ${userEmail} purged.` })
        setIsDeleting(null)
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setIsDeleting(null)
      })
  }

  const togglePasswordVisibility = (email: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [email]: !prev[email]
    }))
  }

  if (authLoading || !isRoot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto" />
          <p className="text-[10px] font-black uppercase text-red-900 tracking-[0.3em]">Validating Root Clearance...</p>
        </div>
      </div>
    )
  }

  const filteredUsers = (users || []).filter(u => 
    u.id.toLowerCase().includes(search.toLowerCase()) || 
    (u.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      <section className="pt-16 pb-8 bg-slate-900 border-b-8 border-red-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-red-600/30">
                <ShieldAlert className="w-2.5 h-2.5" /> Level 5 Governance
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">Access <span className="text-red-600 italic">Configuration</span></h1>
              <p className="text-slate-500 text-[11px] max-w-xl font-medium">Root control over institutional module visibility and database permissions.</p>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="text-right hidden md:block">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Active Registry</p>
                  <p className="text-xs font-bold text-red-500">{(users || []).length} Provisioned Accounts</p>
               </div>
               <div className="w-px h-8 bg-white/5"></div>
               <Activity className="w-6 h-6 text-red-600 animate-pulse" />
            </div>
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
                     <UserPlus className="w-5 h-5 text-red-600" /> Provision Staff
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                   <form onSubmit={handleAddStaff} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Full Name</Label>
                        <Input 
                          value={newName} 
                          onChange={e => setNewName(e.target.value)} 
                          className="bg-black/50 border-white/5 text-white rounded-xl h-11"
                          placeholder="e.g. Alankrit Dey"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Official Email *</Label>
                        <Input 
                          value={newEmail} 
                          onChange={e => setNewEmail(e.target.value)} 
                          className="bg-black/50 border-white/5 text-white rounded-xl h-11"
                          placeholder="deyalankrit@gmail.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Governance Key (Password) *</Label>
                        <div className="relative">
                           <Input 
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            className="bg-black/50 border-white/5 text-white rounded-xl h-11 pl-10 pr-10"
                            placeholder="••••••••"
                            required
                          />
                          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isAdding} 
                        className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xl shadow-red-600/10 mt-2"
                      >
                        {isAdding ? <Loader2 className="animate-spin w-5 h-5" /> : "Authorize Protocol"}
                      </Button>
                   </form>
                 </CardContent>
              </Card>

              <div className="p-8 rounded-[2.5rem] bg-red-950/20 border border-red-900/30 text-center space-y-4 shadow-inner">
                 <Lock className="w-10 h-10 text-red-600 mx-auto" />
                 <h4 className="text-sm font-black uppercase tracking-widest text-red-500">Security Mandate</h4>
                 <p className="text-[11px] text-slate-400 italic leading-relaxed">
                   "Staff members can only access the portal once their email is provisioned here. The password set during provisioning acts as the secondary governance key."
                 </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="relative max-w-md ml-auto">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                 <Input 
                    placeholder="Search roles..." 
                    className="pl-9 bg-slate-900 border-white/5 text-white h-11 rounded-2xl text-xs"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                 />
              </div>

              {dataLoading ? (
                <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto" /></div>
              ) : (
                <div className="grid gap-6">
                  {filteredUsers.map((u: any) => (
                    <Card key={u.id} className="bg-slate-900 border-white/5 rounded-[2rem] overflow-hidden group hover:border-red-900/30 transition-all">
                      <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-red-600 transition-colors">
                               <User className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                               <CardTitle className="text-xl font-headline font-bold text-white">{u.name || u.id.split('@')[0]}</CardTitle>
                               <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="w-3 h-3 text-red-500" />
                                    <span className="text-[10px] font-mono text-slate-500">{u.id}</span>
                                  </div>
                                  
                                  {u.password && (
                                    <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                                       <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Key:</span>
                                       <span className="text-[10px] font-mono text-accent">
                                          {visiblePasswords[u.id] ? u.password : "••••••••"}
                                       </span>
                                       <button 
                                        onClick={() => togglePasswordVisibility(u.id)}
                                        className="text-slate-500 hover:text-white transition-colors"
                                       >
                                          {visiblePasswords[u.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                       </button>
                                    </div>
                                  )}
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <Badge className={cn("text-[9px] font-black px-3 py-0.5 rounded-full uppercase border-none", u.role === 'admin' ? "bg-red-600" : "bg-slate-800")}>
                               {u.role === 'admin' ? "ROOT" : "STAFF"}
                            </Badge>
                            
                            {u.role === 'staff' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-red-500 rounded-full transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-900 border-white/10 text-white rounded-[2rem] shadow-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                                      <AlertTriangle className="w-6 h-6" /> Revoke Access?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                      This will permanently purge the institutional permissions for <strong className="text-white">{u.id}</strong>. The user will be unable to access administrative modules immediately.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white rounded-xl hover:bg-white/10">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteUser(u.id)}
                                      className="bg-red-600 hover:bg-red-700 rounded-xl font-bold"
                                    >
                                      {isDeleting === u.id ? <Loader2 className="animate-spin w-4 h-4" /> : "Revoke Clearance"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                         </div>
                      </CardHeader>
                      <CardContent className="p-6">
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {MODULES.map((mod) => {
                              const hasAccess = u.permissions?.[mod.id] === true;
                              const loadingId = `${u.id}-${mod.id}`;
                              
                              return (
                                <div key={mod.id} className={cn(
                                  "flex items-center justify-between p-3 rounded-2xl border transition-all duration-300",
                                  hasAccess 
                                    ? "bg-emerald-500/5 border-emerald-900/30 text-emerald-400" 
                                    : "bg-black/20 border-white/5 text-slate-500"
                                )}>
                                  <span className="text-[10px] font-bold uppercase tracking-tighter">{mod.label}</span>
                                  <Switch 
                                    checked={hasAccess} 
                                    disabled={isSaving === loadingId || u.role === 'admin'}
                                    onCheckedChange={() => handleTogglePermission(u.id, mod.id, hasAccess)}
                                    className="data-[state=checked]:bg-emerald-500"
                                  />
                                </div>
                              )
                            })}
                         </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
