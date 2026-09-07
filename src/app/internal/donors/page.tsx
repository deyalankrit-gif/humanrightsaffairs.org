
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Award, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  Star, 
  Users, 
  Palette,
  ArrowRight,
  GripVertical,
  X,
  Camera,
  User
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * Internal Donors Management: Real-time oversight for Wall of Honor.
 * Allows administrators to curate donor circles, descriptions, and benefactor lists.
 */
export default function InternalDonorsManagement() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editTier, setEditTier] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [memberPhoto, setMemberPhoto] = useState<string | null>(null)

  const [newTier, setNewTier] = useState({
    title: '',
    description: '',
    color: 'from-blue-600 to-indigo-800',
    iconName: 'Award',
    members: [] as { name: string, imageId?: string | null }[],
    priority: 1,
    newMemberName: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const tiersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'donor_tiers'), orderBy('priority', 'desc'));
  }, [db, user]);

  const { data: tiers, loading: dataLoading } = useCollection(tiersQuery);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 102400) { // 100KB limit for thumbnails
        toast({ variant: "destructive", title: "Image Too Large", description: "Donor thumbnails must be under 100KB." });
        return;
      }
      const reader = new FileReader()
      reader.onloadend = () => setMemberPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAddTier = async () => {
    if (!db) return;
    if (!newTier.title) {
      toast({ variant: "destructive", title: "Missing Title", description: "Donor circle needs a designated title." });
      return;
    }
    setIsActionLoading(true)
    const { newMemberName, ...data } = newTier;
    addDoc(collection(db, 'donor_tiers'), { ...data, createdAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Tier Established", description: "Recognition circle added to registry." })
        setNewTier({ title: '', description: '', color: 'from-blue-600 to-indigo-800', iconName: 'Award', members: [], priority: 1, newMemberName: '' })
        setIsAddDialogOpen(false)
      })
      .finally(() => setIsActionLoading(false))
  }

  const handleUpdateTier = async () => {
    if (!db || !editTier) return;
    setIsActionLoading(true)
    const { id, newMemberName, ...data } = editTier;
    updateDoc(doc(db, 'donor_tiers', id), data)
      .then(() => {
        toast({ title: "Registry Updated" })
        setIsEditDialogOpen(false)
        setEditTier(null)
      })
      .finally(() => setIsActionLoading(false))
  }

  const handleDeleteTier = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'donor_tiers', id)).then(() => toast({ title: "Tier Purged" }));
  }

  const addMember = (isEdit: boolean) => {
    if (isEdit) {
      if (!editTier.newMemberName?.trim()) return;
      setEditTier({
        ...editTier,
        members: [...(editTier.members || []), { name: editTier.newMemberName.trim(), imageId: memberPhoto }],
        newMemberName: ''
      });
    } else {
      if (!newTier.newMemberName?.trim()) return;
      setNewTier({
        ...newTier,
        members: [...newTier.members, { name: newTier.newMemberName.trim(), imageId: memberPhoto }],
        newMemberName: ''
      });
    }
    setMemberPhoto(null);
  }

  const removeMember = (index: number, isEdit: boolean) => {
    if (isEdit) {
      const updated = [...editTier.members];
      updated.splice(index, 1);
      setEditTier({ ...editTier, members: updated });
    } else {
      const updated = [...newTier.members];
      updated.splice(index, 1);
      setNewTier({ ...newTier, members: updated });
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const colorOptions = [
    { label: "Platinum Blue", value: "from-blue-600 to-indigo-800" },
    { label: "Gold Amber", value: "from-amber-500 to-orange-700" },
    { label: "Silver Slate", value: "from-slate-400 to-slate-600" },
    { label: "Emerald Green", value: "from-emerald-500 to-teal-700" },
    { label: "Royal Purple", value: "from-purple-600 to-indigo-900" },
    { label: "Ruby Red", value: "from-red-600 to-rose-800" }
  ]

  const iconOptions = [
    { label: "Award / Trophy", value: "Award", component: <Award className="w-4 h-4" /> },
    { label: "Star / Brilliance", value: "Star", component: <Star className="w-4 h-4" /> },
    { label: "Shield / Protection", value: "ShieldCheck", component: <ShieldCheck className="w-4 h-4" /> },
    { label: "Users / Community", value: "Users", component: <Users className="w-4 h-4" /> }
  ]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30 tracking-widest">
               <ShieldCheck className="w-2.5 h-2.5" /> Gratitude Governance
             </div>
             <h1 className="text-3xl md:text-4xl font-headline font-bold">Wall of <span className="text-accent italic">Donors</span></h1>
             <p className="text-slate-400 text-[11px] uppercase font-black">Official Benefactor Recognition Registry</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={(v) => { setIsAddDialogOpen(v); if(!v) setMemberPhoto(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-8 flex gap-2 shadow-2xl shadow-accent/20 hover:bg-secondary hover:text-white transition-all transform hover:scale-105">
                <Plus className="w-4 h-4" /> Add Recognition Circle
              </Button>
            </DialogTrigger>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl [&>button]:hidden">
              <DialogHeader className="relative">
                <div className="absolute right-0 top-0">
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <X className="w-4 h-4" />
                    </Button>
                  </DialogClose>
                </div>
                <DialogTitle>New Recognition Level</DialogTitle>
                <DialogDescription>Define a donor tier to be displayed on the public Wall of Gratitude.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-2">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Tier Title</Label>
                    <div className="flex gap-2">
                       <Select onValueChange={(val) => setNewTier({...newTier, title: val})}>
                          <SelectTrigger className="w-[160px] h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200">
                             <SelectValue placeholder="Presets" />
                          </SelectTrigger>
                          <SelectContent position="popper" className="z-[1000001] bg-white">
                             <SelectItem value="Platinum Circle">Platinum Circle</SelectItem>
                             <SelectItem value="Gold Circle">Gold Circle</SelectItem>
                             <SelectItem value="Silver Circle">Silver Circle</SelectItem>
                          </SelectContent>
                       </Select>
                       <Input placeholder="Or enter manually..." value={newTier.title} onChange={e => setNewTier({...newTier, title: e.target.value})} className="h-11 rounded-xl flex-1" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] font-bold uppercase text-slate-400">Priority (Sort)</Label><Input type="number" value={newTier.priority} onChange={e => setNewTier({...newTier, priority: Number(e.target.value)})} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-[10px] font-bold uppercase text-slate-400">Visual Aesthetic</Label>
                    <Select value={newTier.color} onValueChange={v => setNewTier({...newTier, color: v})}><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">{colorOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Symbol</Label>
                  <Select value={newTier.iconName} onValueChange={v => setNewTier({...newTier, iconName: v})}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">{iconOptions.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-1"><Label className="text-[10px] font-bold uppercase text-slate-400">Mission Impact Narrative</Label><Textarea placeholder="Describe how this circle supports the Trust..." value={newTier.description} onChange={e => setNewTier({...newTier, description: e.target.value})} className="rounded-xl min-h-[80px]" /></div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <Label className="text-[10px] font-black uppercase text-accent">Benefactors Management</Label>
                  <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                     <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                           {memberPhoto ? (
                             <Image src={memberPhoto} alt="Thumb" fill className="object-cover" />
                           ) : (
                             <Camera className="w-5 h-5 text-slate-300" />
                           )}
                           <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                        </div>
                        <div className="flex-1 space-y-2">
                           <Input placeholder="Member Full Name" value={newTier.newMemberName} onChange={e => setNewTier({...newTier, newMemberName: e.target.value})} className="h-10 rounded-xl" onKeyDown={e => e.key === 'Enter' && addMember(false)} />
                           <p className="text-[7px] font-bold uppercase text-slate-400">Click icon area to upload portrait</p>
                        </div>
                        <Button onClick={() => addMember(false)} variant="secondary" className="h-10 px-4 rounded-xl font-bold"><Plus className="w-4 h-4" /></Button>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {newTier.members.map((m, idx) => (
                      <Badge key={idx} className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-xl flex items-center justify-between group shadow-sm">
                        <div className="flex items-center gap-2 truncate">
                           {m.imageId ? (
                             <div className="w-5 h-5 rounded-md overflow-hidden relative shrink-0"><Image src={m.imageId} alt="p" fill className="object-cover" /></div>
                           ) : <User className="w-3 h-3 text-slate-400 shrink-0" />}
                           <span className="truncate">{m.name}</span>
                        </div>
                        <button onClick={() => removeMember(idx, false)} className="hover:text-red-500 ml-2"><X className="w-3 h-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter><Button onClick={handleAddTier} disabled={isActionLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary">Commit Recognition Circle</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="py-12 pb-24">
        <div className="container mx-auto px-4">
           {dataLoading ? (
             <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" /></div>
           ) : (
             <div className="grid gap-8 max-w-4xl mx-auto">
               {(tiers || []).map((tier: any) => (
                 <Card key={tier.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] group hover:shadow-xl transition-all duration-500">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                         <div className={cn("p-8 md:w-56 text-center border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 bg-gradient-to-br text-white", tier.color)}>
                            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 mb-3">
                               {tier.iconName === 'Award' ? <Award className="w-8 h-8" /> : tier.iconName === 'Star' ? <Star className="w-8 h-8" /> : tier.iconName === 'ShieldCheck' ? <ShieldCheck className="w-8 h-8" /> : <Users className="w-8 h-8" />}
                            </div>
                            <h3 className="font-headline font-bold text-lg leading-tight">{tier.title}</h3>
                            <Badge variant="outline" className="mt-2 text-[8px] border-white/30 text-white font-bold">Priority {tier.priority}</Badge>
                         </div>
                         <div className="flex-1 p-8 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                               <div className="space-y-1.5 flex-1 w-full">
                                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{tier.description}"</p>
                                  <div className="pt-4 space-y-4">
                                     <p className="text-[9px] font-black uppercase text-accent tracking-[0.1em]">Top Benefactors ({tier.members?.length || 0})</p>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(tier.members || []).map((m: any, i: number) => {
                                          const name = typeof m === 'string' ? m : m.name;
                                          const portrait = typeof m === 'string' ? null : m.imageId;
                                          
                                          return (
                                            <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shrink-0 relative">
                                                {portrait ? (
                                                  <Image src={portrait} alt={name} fill className="object-cover" />
                                                ) : <User className="w-6 h-6 m-3 text-slate-300" />}
                                              </div>
                                              <span className="text-xs font-bold text-primary dark:text-slate-200 truncate">{name}</span>
                                            </div>
                                          );
                                        })}
                                     </div>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2 shrink-0">
                                  <Button variant="outline" size="sm" onClick={() => { setEditTier(tier); setIsEditDialogOpen(true); }} className="h-10 px-5 rounded-xl text-[10px] font-bold border-slate-200 hover:bg-primary hover:text-white transition-all">Modify</Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <button className="h-10 w-10 text-slate-300 hover:text-red-500 transition-all rounded-xl flex items-center justify-center"><Trash2 className="w-4.5 h-4.5" /></button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          You are about to permanently delete this record. This action may permanently remove related data. This action cannot be undone. Please confirm that you want to continue.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteTier(tier.id)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11">Delete Permanently</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                               </div>
                            </div>
                         </div>
                      </div>
                    </CardContent>
                 </Card>
               ))}

               {(tiers || []).length === 0 && (
                 <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 opacity-40">
                    <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Honor Registry Empty</p>
                 </div>
               )}
             </div>
           )}
        </div>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={(v) => { setIsEditDialogOpen(v); if(!v) { setEditTier(null); setMemberPhoto(null); } }}>
        <DialogContent className="max-w-xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl [&>button]:hidden">
          <DialogHeader className="relative">
            <div className="absolute right-0 top-0">
               <DialogClose asChild>
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                   <X className="w-4 h-4" />
                 </Button>
               </DialogClose>
            </div>
            <DialogTitle>Update Recognition Meta</DialogTitle>
          </DialogHeader>
          {editTier && (
            <div className="space-y-6 py-2">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Tier Title</Label>
                    <div className="flex gap-2">
                       <Select onValueChange={(val) => setEditTier({...editTier, title: val})}>
                          <SelectTrigger className="w-[160px] h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200">
                             <SelectValue placeholder="Presets" />
                          </SelectTrigger>
                          <SelectContent position="popper" className="z-[1000001] bg-white">
                             <SelectItem value="Platinum Circle">Platinum Circle</SelectItem>
                             <SelectItem value="Gold Circle">Gold Circle</SelectItem>
                             <SelectItem value="Silver Circle">Silver Circle</SelectItem>
                          </SelectContent>
                       </Select>
                       <Input placeholder="Or enter manually..." value={editTier.title} onChange={e => setEditTier({...editTier, title: e.target.value})} className="h-11 rounded-xl flex-1" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Priority</Label><Input type="number" value={editTier.priority} onChange={e => setEditTier({...editTier, priority: Number(e.target.value)})} /></div>
                  <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Visual Aesthetic</Label>
                    <Select value={editTier.color} onValueChange={v => setEditTier({...editTier, color: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">{colorOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase">Symbol</Label>
                  <Select value={editTier.iconName} onValueChange={v => setEditTier({...editTier, iconName: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">{iconOptions.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Mission Narrative</Label><Textarea value={editTier.description} onChange={e => setEditTier({...editTier, description: e.target.value})} className="min-h-[80px]" /></div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                   <Label className="text-[10px] font-bold uppercase text-accent">Active Benefactors</Label>
                   <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                     <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                           {memberPhoto ? (
                             <Image src={memberPhoto} alt="Thumb" fill className="object-cover" />
                           ) : (
                             <Camera className="w-5 h-5 text-slate-300" />
                           )}
                           <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                        </div>
                        <div className="flex-1 space-y-2">
                           <Input placeholder="Member Full Name" value={editTier.newMemberName || ''} onChange={e => setEditTier({...editTier, newMemberName: e.target.value})} className="h-10 rounded-xl" onKeyDown={e => e.key === 'Enter' && addMember(true)} />
                           <p className="text-[7px] font-bold uppercase text-slate-400">Click icon area to upload portrait</p>
                        </div>
                        <Button onClick={() => addMember(true)} variant="secondary" className="h-10 px-4 rounded-xl"><Plus className="w-4 h-4" /></Button>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                     {(editTier.members || []).map((m: any, idx: number) => {
                       const name = typeof m === 'string' ? m : m.name;
                       const portrait = typeof m === 'string' ? null : m.imageId;
                       
                       return (
                        <Badge key={idx} className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-xl flex items-center justify-between group shadow-sm">
                          <div className="flex items-center gap-2 truncate">
                             {portrait ? (
                               <div className="w-5 h-5 rounded-md overflow-hidden relative shrink-0"><Image src={portrait} alt="p" fill className="object-cover" /></div>
                             ) : <User className="w-3 h-3 text-slate-400 shrink-0" />}
                             <span className="truncate">{name}</span>
                          </div>
                          <button onClick={() => removeMember(idx, true)} className="hover:text-red-500 ml-2"><X className="w-3 h-3" /></button>
                        </Badge>
                       );
                     })}
                   </div>
                </div>
                <Button onClick={handleUpdateTier} disabled={isActionLoading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-2xl mt-4">Commit Profile Refresh</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  )
}
