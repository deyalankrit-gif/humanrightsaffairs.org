"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Search, UserX, AlertTriangle, ShieldAlert, Calendar as CalendarIcon, Hash, Info, Plus, Edit, Trash2, Loader2, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
import { format } from "date-fns"
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type TerminatedMember = {
  id: string
  name: string
  designation: string
  level?: "National" | "State" | "District"
  terminationDate: string
  reason: string
  status: "Revoked" | "Cancelled"
  imageId?: string
  gender: 'male' | 'female'
}

export default function TerminatedMembersPage() {
  const [search, setSearch] = useState("")
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isMirror, setIsMirror] = useState(false)
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const isAdmin = user?.email === 'deydhritiman@gmail.com' && isMirror

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMirror(window.self !== window.top)
    }
  }, [])

  const terminatedQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'terminatedMembers'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: firestoreTerminated, loading: dataLoading } = useCollection(terminatedQuery);

  const [editMember, setEditMember] = useState<any>(null)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUri = reader.result as string
        if (isEdit) {
          setEditMember({ ...editMember, imageId: dataUri })
        } else {
          setNewMember({ ...newMember, imageId: dataUri })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdd = async () => {
    if (!newMember.name || !newMember.terminationDate) return
    setIsActionLoading(true)
    try {
      await addDoc(collection(db, 'terminatedMembers'), {
        ...newMember,
        createdAt: serverTimestamp()
      })
      toast({ title: "Entry Added", description: "Termination notice has been published." })
      setNewMember({ name: '', designation: '', level: 'National', terminationDate: '', reason: '', status: 'Revoked', gender: 'male', imageId: '' })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'terminatedMembers', id))
      toast({ title: "Record Removed" })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    }
  }

  const handleUpdate = async () => {
    if (!editMember) return
    setIsActionLoading(true)
    try {
      const { id, ...data } = editMember
      await updateDoc(doc(db, 'terminatedMembers', id), data)
      toast({ title: "Entry Updated" })
      setEditMember(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const members = (firestoreTerminated || []) as TerminatedMember[]
  const filtered = members.filter(m => 
    (m.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (m.id?.toLowerCase() || '').includes(search.toLowerCase())
  )

  const parseTerminationDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      return new Date(dateStr);
    } catch {
      return undefined;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-40 pb-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-sm font-bold border border-red-500/30 mb-6 uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4" />
            <span>Public Notice</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">Terminated <span className="text-red-500 italic">Memberships</span></h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
            This directory lists individuals who are no longer authorized to represent the Human Rights Affairs Trust (Justice Shield).
          </p>

          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-red-500 text-white font-bold rounded-2xl h-14 px-10 flex gap-2 hover:bg-secondary hover:text-white shadow-2xl shadow-red-500/20 mx-auto transition-all">
                  <Plus className="w-6 h-6" /> Add Termination Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-[2rem] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Termination Notice</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                      <div className="relative w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden grayscale">
                        <Image 
                          src={newMember.imageId?.startsWith('data:') ? newMember.imageId : (newMember.gender.toLowerCase() === 'female' ? '/dummy w.png' : '/dummy m.png')} 
                          alt="Preview" 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <Button variant="outline" className="w-full relative h-12 rounded-xl">
                        <Upload className="w-4 h-4 mr-2" /> Upload Photo
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleFileChange(e, false)}
                        />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} placeholder="e.g. Subhashis Ganguly" className="h-12 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Termination Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12 rounded-xl", !newMember.terminationDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newMember.terminationDate ? newMember.terminationDate : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={parseTerminationDate(newMember.terminationDate)}
                            onSelect={(date) => setNewMember({...newMember, terminationDate: date ? format(date, "PPP") : ''})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Operational Level</Label>
                      <Select value={newMember.level} onValueChange={(val: any) => setNewMember({...newMember, level: val})}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="National">Central Council</SelectItem>
                          <SelectItem value="State">State Level</SelectItem>
                          <SelectItem value="District">District Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Designation (Last Held)</Label>
                    <Input value={newMember.designation} onChange={e => setNewMember({...newMember, designation: e.target.value})} placeholder="e.g. District Observer" className="h-12 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={newMember.status} onValueChange={(val: any) => setNewMember({...newMember, status: val})}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Revoked">Revoked</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={newMember.gender} onValueChange={(val: any) => setNewMember({...newMember, gender: val})}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Textarea value={newMember.reason} onChange={e => setNewMember({...newMember, reason: e.target.value})} placeholder="Official reason for revocation..." className="rounded-xl" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAdd} disabled={isActionLoading} className="w-full bg-red-500 hover:bg-secondary text-white font-bold h-12 rounded-xl">Publish Notice</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[56px] md:top-[64px] z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by name or Termination ID..." 
                className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-red-500 text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
              <Alert variant="destructive" className="relative bg-white dark:bg-slate-900 border-4 border-red-600 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="bg-red-600 text-white p-4 rounded-full shadow-lg animate-bounce">
                    <ShieldAlert className="h-10 w-10 md:h-12 md:w-12" />
                  </div>
                  <div className="space-y-4">
                    <AlertTitle className="font-headline font-black text-2xl md:text-3xl text-red-600 uppercase tracking-[0.2em] mb-4">
                      Urgent  Public  Security  Disclaimer
                    </AlertTitle>
                    <AlertDescription className="text-secondary dark:text-emerald-400 font-black text-sm md:text-lg leading-relaxed max-w-5xl mx-auto">
                      "The individuals listed below are no longer affiliated with Justice Shield. Any attempt to use organizational logos, car sticker, official designation plate for car, ID cards, or represent themselves as member/officials is a punishable offense. If any such misuse is observed, the police authorities or the administration may immediately take any appropriate legal action."
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            </div>

            {dataLoading ? (
              <div className="text-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mx-auto" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-4">Querying Records...</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filtered.length > 0 ? (
                  filtered.map((member) => {
                    const fallback = member.gender?.toLowerCase() === 'female' ? '/dummy w.png' : '/dummy m.png'
                    const displayImg = member.imageId?.startsWith('data:') ? member.imageId : (PlaceHolderImages.find(i => i.id === member.imageId)?.imageUrl || fallback)
                    return (
                      <Card key={member.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="p-8 bg-slate-50 dark:bg-slate-800 md:w-48 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-700 text-center shrink-0">
                              <div className="relative w-24 h-24 rounded-2xl overflow-hidden mb-3 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                <Image 
                                  src={displayImg} 
                                  alt={member.name} 
                                  fill 
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</span>
                              <Badge variant="destructive" className="uppercase text-[10px] font-bold px-4">
                                {member.status}
                              </Badge>
                            </div>
                            
                            <div className="flex-1 p-8 grid md:grid-cols-2 gap-8 items-center">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                    <Hash className="w-3 h-3" /> REF: {member.id.slice(-6).toUpperCase()}
                                  </div>
                                  {member.level && (
                                    <Badge variant="outline" className="border-red-200 text-red-400 text-[9px] font-bold uppercase py-0">
                                      {member.level === 'National' ? 'Central Council' : member.level}
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-3xl font-headline font-bold text-primary dark:text-white group-hover:text-red-600 transition-colors">
                                  {member.name}
                                </h3>
                                <p className="text-slate-500 font-bold italic">{member.designation}</p>
                              </div>

                              <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    <Info className="w-3 h-3" /> Reason for Termination
                                  </div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                    "{member.reason}"
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                  <CalendarIcon className="w-4 h-4" /> 
                                  Effective Since: <span className="text-primary dark:text-accent font-bold">{member.terminationDate}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>

                        {isAdmin && (
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button onClick={() => setEditMember(member)} size="icon" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-secondary hover:text-white rounded-full shadow-lg border border-white/20">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-[2rem] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Notice</DialogTitle>
                                </DialogHeader>
                                {editMember && (
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Profile Picture</Label>
                                      <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl">
                                        <div className="relative w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden grayscale">
                                          <Image 
                                            src={editMember.imageId?.startsWith('data:') ? editMember.imageId : (editMember.gender.toLowerCase() === 'female' ? '/dummy w.png' : '/dummy m.png')} 
                                            alt="Preview" 
                                            fill 
                                            className="object-cover"
                                          />
                                        </div>
                                        <Button variant="outline" className="w-full relative h-12 rounded-xl">
                                          <Upload className="w-4 h-4 mr-2" /> Change Photo
                                          <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => handleFileChange(e, true)}
                                          />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Full Name</Label>
                                      <Input value={editMember.name} onChange={e => setEditMember({...editMember, name: e.target.value})} className="h-12 rounded-xl" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <Label>Operational Level</Label>
                                        <Select value={editMember.level} onValueChange={(val: any) => setEditMember({...editMember, level: val})}>
                                          <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="National">Central Council</SelectItem>
                                            <SelectItem value="State">State Level</SelectItem>
                                            <SelectItem value="District">District Level</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-1">
                                        <Label>Termination Date</Label>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12 rounded-xl", !editMember.terminationDate && "text-muted-foreground")}>
                                              <CalendarIcon className="mr-2 h-4 w-4" />
                                              {editMember.terminationDate ? editMember.terminationDate : "Pick a date"}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                              mode="single"
                                              selected={parseTerminationDate(editMember.terminationDate)}
                                              onSelect={(date) => setEditMember({...editMember, terminationDate: date ? format(date, "PPP") : ''})}
                                              initialFocus
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Designation</Label>
                                      <Input value={editMember.designation} onChange={e => setEditMember({...editMember, designation: e.target.value})} placeholder="Designation" className="h-12 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Reason</Label>
                                      <Textarea value={editMember.reason} onChange={e => setEditMember({...editMember, reason: e.target.value})} className="rounded-xl" />
                                    </div>
                                    <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full bg-primary text-white font-bold h-12 rounded-xl hover:bg-secondary transition-all">
                                      {isActionLoading ? <Loader2 className="animate-spin mr-2" /> : "Save Changes"}
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" className="bg-red-500 text-white rounded-full shadow-lg border border-white/20">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2rem] bg-white dark:bg-slate-900">
                                <AlertDialogHeader><AlertDialogTitle>Remove Notice?</AlertDialogTitle></AlertDialogHeader>
                                <div className="flex justify-end gap-3 mt-4">
                                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(member.id)} className="bg-red-500 hover:bg-red-600 rounded-xl border-none font-bold text-white transition-all">Remove</AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </Card>
                    )
                  })
                ) : (
                  <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <UserX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-headline font-bold text-primary dark:text-white">No records match your search</h3>
                    <p className="text-slate-500">If you are verifying an ID card, ensure the name or ID is entered correctly.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
