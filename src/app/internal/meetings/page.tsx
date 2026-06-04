
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { AdminNavbar } from '@/components/admin-navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock,
  MapPin, 
  Edit, 
  Trash2, 
  Loader2, 
  Handshake,
  ShieldCheck,
  FileText
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'

export default function InternalMeetingsManagement() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editMeeting, setEditMeeting] = useState<any>(null)
  
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    agenda: '',
    minutes: '',
    level: 'National' as const,
    status: 'Upcoming' as const,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  const meetingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'meetings'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: meetings, loading: dataLoading } = useCollection(meetingsQuery);

  const handleAdd = () => {
    if (!db) return;
    if (!newMeeting.title.trim() || !newMeeting.date.trim()) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Title and Date are required." });
      return;
    }

    setIsActionLoading(true)
    const data = { ...newMeeting, createdAt: serverTimestamp() }

    addDoc(collection(db, 'meetings'), data)
      .then(() => {
        toast({ title: "Meeting Scheduled", description: "Record has been added to the registry." })
        setNewMeeting({ title: '', date: '', time: '', location: '', agenda: '', minutes: '', level: 'National', status: 'Upcoming' })
        setIsAddDialogOpen(false)
        setIsActionLoading(false)
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'meetings',
          operation: 'create',
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setIsActionLoading(false)
      })
  }

  const handleDelete = (id: string) => {
    if (!db) return;
    const docRef = doc(db, 'meetings', id)
    deleteDoc(docRef)
      .then(() => toast({ title: "Record Deleted" }))
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
  }

  const handleUpdate = () => {
    if (!db || !editMeeting) return
    setIsActionLoading(true)
    const { id, ...data } = editMeeting
    const docRef = doc(db, 'meetings', id)
    
    updateDoc(docRef, data)
      .then(() => {
        toast({ title: "Meeting Updated" })
        setEditMeeting(null)
        setIsActionLoading(false)
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setIsActionLoading(false)
      })
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  const filtered = (meetings || []).filter((m: any) => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.location.toLowerCase().includes(search.toLowerCase())
  )

  const levels = ["National", "State", "District"]
  const statuses = ["Upcoming", "Completed", "Postponed"]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminNavbar />

      <section className="pt-32 pb-12 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/30">
                <ShieldCheck className="w-3 h-3" /> Assembly Registry
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Meeting <span className="text-accent italic">Governance</span></h1>
              <p className="text-slate-400">Official log of organizational assemblies and executive resolutions.</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary font-bold rounded-2xl h-14 px-8 flex gap-2 hover:bg-accent/90 shadow-xl shadow-accent/20">
                  <Plus className="w-5 h-5" /> Schedule Assembly
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-[2rem] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Assembly Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Meeting Title</Label>
                    <Input value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} placeholder="e.g. Annual State Council" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} placeholder="March 15, 2024" />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input value={newMeeting.time} onChange={e => setNewMeeting({...newMeeting, time: e.target.value})} placeholder="10:30 AM" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Select value={newMeeting.level} onValueChange={(val: any) => setNewMeeting({...newMeeting, level: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={newMeeting.status} onValueChange={(val: any) => setNewMeeting({...newMeeting, status: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Venue / Link</Label>
                    <Input value={newMeeting.location} onChange={e => setNewMeeting({...newMeeting, location: e.target.value})} placeholder="Kolkata Head Office" />
                  </div>
                  <div className="space-y-2">
                    <Label>Agenda</Label>
                    <Textarea value={newMeeting.agenda} onChange={e => setNewMeeting({...newMeeting, agenda: e.target.value})} placeholder="Outline the meeting goals..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Minutes (Post-Meeting)</Label>
                    <Textarea value={newMeeting.minutes} onChange={e => setNewMeeting({...newMeeting, minutes: e.target.value})} placeholder="Key resolutions and minutes..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAdd} disabled={isActionLoading} className="w-full h-12 rounded-xl">
                    {isActionLoading ? <Loader2 className="animate-spin" /> : "Publish Record"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-12 border-b bg-white dark:bg-slate-900 transition-colors sticky top-[72px] md:top-[84px] z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Filter archives by title or location..." 
              className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-slate-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Connecting to Registry...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((meeting: any) => (
                <Card key={meeting.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-8 bg-slate-50 dark:bg-slate-800 md:w-56 text-center border-r border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                         <Badge variant="outline" className="border-accent text-accent text-[9px] font-bold uppercase px-3 py-1 mb-3">
                            {meeting.level}
                         </Badge>
                         <span className="text-2xl font-headline font-bold text-primary dark:text-white leading-none mb-1">{meeting.date.split(' ')[0]}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{meeting.date.split(' ').slice(1).join(' ')}</span>
                      </div>
                      
                      <div className="flex-1 p-8 grid lg:grid-cols-4 gap-8 items-center">
                        <div className="lg:col-span-2 space-y-1">
                          <h3 className="text-2xl font-bold text-primary dark:text-white">{meeting.title}</h3>
                          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-accent" /> {meeting.time}
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            <MapPin className="w-3.5 h-3.5 text-accent" /> {meeting.location}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center">
                           <Badge className={cn(
                             "font-bold uppercase tracking-widest text-[9px] px-4 py-1",
                             meeting.status === 'Upcoming' ? 'bg-emerald-500' : 'bg-primary text-white'
                           )}>
                             {meeting.status}
                           </Badge>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => setEditMeeting(meeting)} variant="outline" size="icon" className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-accent/10 hover:text-accent"><Edit className="w-4 h-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-[2rem] max-h-[90vh] overflow-y-auto">
                              <DialogHeader><DialogTitle>Edit Assembly Archive</DialogTitle></DialogHeader>
                              {editMeeting && (
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input value={editMeeting.title} onChange={e => setEditMeeting({...editMeeting, title: e.target.value})} />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Date</Label>
                                      <Input value={editMeeting.date} onChange={e => setEditMeeting({...editMeeting, date: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Status</Label>
                                      <Select value={editMeeting.status} onValueChange={(val: any) => setEditMeeting({...editMeeting, status: val})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Agenda</Label>
                                    <Textarea value={editMeeting.agenda} onChange={e => setEditMeeting({...editMeeting, agenda: e.target.value})} className="min-h-[100px]" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Minutes</Label>
                                    <Textarea value={editMeeting.minutes} onChange={e => setEditMeeting({...editMeeting, minutes: e.target.value})} className="min-h-[150px]" />
                                  </div>
                                  <Button onClick={handleUpdate} disabled={isActionLoading} className="w-full h-12 rounded-xl mt-4">
                                    {isActionLoading ? <Loader2 className="animate-spin" /> : "Commit Changes"}
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Assembly Record?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently remove the agenda and minutes from public archives.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(meeting.id)} className="bg-red-500 hover:bg-red-600 rounded-xl border-none">Confirm Deletion</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                   <Handshake className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest">No matching assembly records in secure database.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
