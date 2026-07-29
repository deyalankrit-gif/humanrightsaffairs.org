
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  UserX, 
  AlertTriangle, 
  ShieldAlert, 
  Calendar as CalendarIcon, 
  Hash, 
  Info, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Upload,
  ShieldCheck
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parse } from "date-fns"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export default function InternalTerminatedMembers() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editMember, setEditMember] = useState<any>(null)

  const userRegistryRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);

  const { data: registry, loading: registryLoading } = useDoc(userRegistryRef);

  const isRoot = user?.email?.toLowerCase() === 'deydhritiman@gmail.com'
  const hasAccess = isRoot || (registry?.permissions?.terminated === true);

  const [newMember, setNewMember] = useState({
    name: '',
    designation: '',
    level: 'National' as const,
    terminationDate: '',
    reason: '',
    status: 'Revoked' as const,
    gender: 'male' as const,
    imageId: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
      return;
    }
    if (user && !registryLoading && registry && !hasAccess) {
      router.push('/internal/public-view');
    }
  }, [user, authLoading, registry, registryLoading, hasAccess, router])

  const terminatedQuery = useMemoFirebase(() => {
    if (!db || !user || !hasAccess) return null;
    return query(collection(db, 'terminatedMembers'), orderBy('createdAt', 'desc'));
  }, [db, user, hasAccess]);

  const { data: terminated, loading: dataLoading } = useCollection(terminatedQuery);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUri = reader.result as string
        if (isEdit) setEditMember({ ...editMember, imageId: dataUri })
        else setNewMember({ ...newMember, imageId: dataUri })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdd = async () => {
    if (!db) return
    if (!newMember.name || !newMember.terminationDate) {
      toast({ variant: "destructive", title: "Missing Information", description: "Name and Termination Date are required." })
      return
    }

    setIsActionLoading(true)
    try {
      await addDoc(collection(db, 'terminatedMembers'), {
        ...newMember,
        createdAt: serverTimestamp()
      })
      toast({ title: "Blacklist Entry Published", description: "Termination notice is now live on the public site." })
      setNewMember({ name: '', designation: '', level: 'National', terminationDate: '', reason: '', status: 'Revoked', gender: 'male', imageId: '' })
      setIsAddDialogOpen(false)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Submission Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!db || !editMember) return
    setIsActionLoading(true)
    try {
      const { id, ...data } = editMember
      await updateDoc(doc(db, 'terminatedMembers', id), data)
      toast({ title: "Registry Record Updated" })
      setEditMember(null)
      setIsEditDialogOpen(false)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !isRoot) return
    try {
      await deleteDoc(doc(db, 'terminatedMembers', id))
      toast({ title: "Record Purged" })
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Denied" })
    }
  }

  const parseTerminationDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try { return parse(dateStr, "PPP", new Date()); } catch { return undefined; }
  }

  if (authLoading || !user || registryLoading || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  const filtered = (terminated || []).filter((m: any) => 
    (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (m.id || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-red-500/30 tracking-[0.2em]">
                <ShieldCheck className="w-2.5 h-2.5" /> Blacklist Control
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Terminated <span className="text-accent italic">Registry</span></h1>
              <p className="text-slate-400 text-[11px]">Management of revoked organizational representation rights.</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 flex gap-2 shadow-lg hover:bg-secondary hover:text-white transition-all">
                  <Plus className="w-4 h-4" /> Publish Revocation
                </Button>
              </DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-md rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                <DialogHeader><DialogTitle>New Revocation Entry</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                    <div className="relative w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden grayscale opacity-50">
                      {newMember.imageId ? <Image src={newMember.imageId} alt="Preview" fill className="object-cover" /> : (
                        <div className="flex flex-col items-center justify-center h-full gap-1">
                          <UserX className="w-10 h-10 text-slate-300" />
                          <span className="text-[8px] font-bold text-slate-400">SELECT IMAGE</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false)} />
                    </div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Profile Reference Photo</Label>
                  </div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Full Name</Label><Input value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="h-11 rounded-xl" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Termination Date</Label>
                      <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full h-11 rounded-xl text-left font-normal">{newMember.terminationDate || "Select Date"}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[1000001]"><Calendar mode="single" selected={parseTerminationDate(newMember.terminationDate)} onSelect={d => setNewMember({...newMember, terminationDate: d ? format(d, "PPP") : ''})} initialFocus /></PopoverContent></Popover></div>
                    <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Status</Label>
                      <Select value={newMember.status} onValueChange={(v: any) => setNewMember({...newMember, status: v})}><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent position="popper" className="z-[1000001]"><SelectItem value="Revoked">Revoked</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem></SelectContent></Select></div>
                  </div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Reason for Termination</Label><Textarea value={newMember.reason} onChange={e => setNewMember({...newMember, reason: e.target.value})} className="rounded-xl min-h-[100px]" placeholder="Official justification..." /></div>
                </div>
                <DialogFooter><Button onClick={handleAdd} disabled={isActionLoading} className="w-full h-12 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">Commit to Blacklist</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search blocked individuals..." className="pl-9 h-11 rounded-xl border-slate-200 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4 max-w-4xl mx-auto">
              {filtered.map((m: any) => {
                const gender = (m.gender || '').trim().toLowerCase();
                let fallback = '/dummy m.png';
                if (gender === 'female' || gender === 'f' || gender === 'woman') fallback = '/dummy w.png';
                
                return (
                  <Card key={m.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 group">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className="p-5 bg-red-50 dark:bg-red-950/20 md:w-44 text-center border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center shrink-0">
                           <div className="relative w-16 h-16 rounded-2xl overflow-hidden mb-2 grayscale opacity-50">
                             <Image src={m.imageId || fallback} alt="Thumb" fill className="object-cover" />
                           </div>
                           <Badge variant="destructive" className="text-[8px] font-bold px-2 py-0.5 uppercase">{m.status}</Badge>
                           <p className="text-[9px] font-bold text-red-600 mt-2">{m.terminationDate}</p>
                        </div>
                        <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="space-y-1 text-center md:text-left">
                             <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">{m.name}</h3>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.designation || "EX-MEMBER"}</p>
                             <p className="text-xs text-slate-400 italic mt-2 line-clamp-1">"{m.reason}"</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <Button onClick={() => { setEditMember(m); setIsEditDialogOpen(true); }} variant="outline" size="sm" className="h-8 rounded-xl text-[10px] font-bold px-4 border-slate-200">Modify</Button>
                             {isRoot && (
                               <Button onClick={() => handleDelete(m.id)} variant="ghost" size="sm" className="h-8 w-8 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                             )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {filtered.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed">
                   <UserX className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching revocation records found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader><DialogTitle>Update Revocation Record</DialogTitle></DialogHeader>
          {editMember && (
            <div className="space-y-4 py-2">
               <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                  <div className="relative w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden grayscale opacity-50">
                    <Image src={editMember.imageId || (editMember.gender?.trim().toLowerCase() === 'female' || editMember.gender?.trim().toLowerCase() === 'f' ? '/dummy w.png' : '/dummy m.png')} alt="Preview" fill className="object-cover" />
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true)} />
                  </div>
                </div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Full Name</Label><Input value={editMember.name} onChange={e => setEditMember({...editMember, name: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Termination Date</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full h-11 rounded-xl text-left font-normal">{editMember.terminationDate}</Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[1000001]"><Calendar mode="single" selected={parseTerminationDate(editMember.terminationDate)} onSelect={d => setEditMember({...editMember, terminationDate: d ? format(d, "PPP") : ''})} initialFocus /></PopoverContent></Popover></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Status</Label>
                    <Select value={editMember.status} onValueChange={(v: any) => setEditMember({...editMember, status: v})}><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent position="popper" className="z-[1000001]"><SelectItem value="Revoked">Revoked</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Justification</Label><Textarea value={editMember.reason} onChange={e => setEditMember({...editMember, reason: e.target.value})} className="rounded-xl min-h-[100px]" /></div>
                <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-12 bg-primary text-white font-bold rounded-xl mt-4">Commit Updates</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
