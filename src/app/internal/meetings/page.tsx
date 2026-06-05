"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
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
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Clock,
  MapPin, 
  Edit, 
  Trash2, 
  Loader2, 
  ShieldCheck,
  Globe,
  Users
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function InternalMeetingsManagement() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('All')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

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

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  const filtered = (meetings || []).filter((m: any) => {
    const matchesSearch = (m.title?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'All' || m.level === levelFilter;
    return matchesSearch && matchesLevel;
  })

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-16 pb-8 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-accent/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Assembly Registry
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Meeting <span className="text-accent italic">Governance</span></h1>
              <p className="text-slate-400 text-[11px]">Official log of organizational assemblies and executive resolutions.</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-accent text-primary font-bold rounded-xl h-11 px-6 shadow-lg"><Plus className="w-4 h-4 mr-2" /> Schedule Assembly</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-3xl"><DialogHeader><DialogTitle>New Assembly</DialogTitle></DialogHeader>
                 <Button className="w-full h-11 rounded-xl mt-4">Publish Record</Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-6 border-b bg-white dark:bg-slate-900 sticky top-10 z-30 shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg">
              {["All", "National", "State", "District"].map((lvl) => (
                <Button key={lvl} variant={levelFilter === lvl ? "default" : "ghost"} onClick={() => setLevelFilter(lvl)} className={cn("h-7 rounded-md px-4 text-[10px] font-bold uppercase", levelFilter === lvl ? "bg-accent text-primary" : "text-slate-500")}>{lvl}</Button>
              ))}
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input placeholder="Filter archives..." className="pl-8 h-9 rounded-lg border-slate-100 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {dataLoading ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" /></div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((meeting: any) => (
                <Card key={meeting.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-5 bg-slate-50 dark:bg-slate-800 md:w-44 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                         <Badge variant="outline" className="border-accent text-accent text-[8px] font-bold uppercase px-2 py-0 mb-2">{meeting.level}</Badge>
                         <span className="text-xl font-headline font-bold leading-none mb-1">{meeting.date?.split(' ')[0] || '--'}</span>
                         <span className="text-[8px] font-bold text-slate-400 uppercase">{meeting.date?.split(' ').slice(1).join(' ') || ''}</span>
                      </div>
                      <div className="flex-1 p-5 grid lg:grid-cols-4 gap-6 items-center">
                        <div className="lg:col-span-2 space-y-1">
                          <h3 className="text-lg font-bold text-slate-900 leading-tight">{meeting.title}</h3>
                          <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-accent" /> {meeting.time}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5 text-accent" /> {meeting.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                           <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold px-3">Minutes</Button>
                           <Button size="sm" variant="ghost" className="h-8 w-8 text-slate-300"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
