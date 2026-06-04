"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { AdminNavbar } from '@/components/admin-navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Droplets,
  Heart,
  FileCheck,
  Loader2,
  AlertCircle,
  Edit,
  Save,
  X,
  Camera,
  Globe
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import Image from 'next/image'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { INDIA_DATA } from '@/lib/india-data'
import { cn } from '@/lib/utils'

export default function MemberDetailsPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const params = useParams()
  const memberId = params.id as string
  const db = useFirestore()
  const { toast } = useToast()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<any>(null)

  const docRef = useMemoFirebase(() => {
    if (!db || !memberId || !user) return null;
    return doc(db, 'memberProfiles', memberId);
  }, [db, memberId, user]);

  const { data: profile, loading: profileLoading } = useDoc(docRef);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (profile) {
      setEditForm(profile)
    }
  }, [profile])

  const handleSave = async () => {
    if (!docRef) return
    setIsSaving(true)
    try {
      await updateDoc(docRef, editForm)
      toast({
        title: "Record Updated",
        description: "The personnel profile has been securely updated in the database."
      })
      setIsEditing(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "System Error",
        description: error.message
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Accessing encrypted file...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-headline font-bold text-primary">Record Not Found</h2>
          <Link href="/internal/members"><Button className="mt-4 rounded-xl">Back to Directory</Button></Link>
        </div>
      </div>
    )
  }

  const fallback = profile.gender === 'female' ? '/dummy w.png' : '/dummy m.png'
  const displayImg = profile.imageId?.startsWith('data:') ? profile.imageId : (PlaceHolderImages.find(i => i.id === profile.imageId)?.imageUrl || fallback)
  const states = Object.keys(INDIA_DATA).sort()

  const parseProfileDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      return new Date(dateStr);
    } catch {
      return undefined;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminNavbar />

      <section className="pt-32 pb-12 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <Link href="/internal/members" className="inline-flex items-center gap-2 text-slate-400 hover:text-accent transition-colors font-bold text-xs uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Back to Secure Database
            </Link>
            <div className="flex gap-4">
              {isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="border-white/10 bg-white/5 text-white h-12 rounded-xl">Discard</Button>
                  <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-primary font-bold h-12 rounded-xl">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white/20 text-white border border-white/10 h-12 rounded-xl px-8">
                  <Edit className="w-4 h-4 mr-2" /> Modify Profile
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-40 h-40 bg-white/5 rounded-[2.5rem] flex items-center justify-center border-2 border-white/10 shadow-2xl relative group overflow-hidden">
              <Image src={displayImg} alt={profile.name} fill className="object-cover" />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-slate-900 shadow-xl z-20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="text-center md:text-left space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Badge className="bg-accent text-primary font-bold px-4 py-1 uppercase tracking-widest text-[10px] rounded-full">
                  {profile.level || 'Operational Personnel'}
                </Badge>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <MapPin className="w-3 h-3 text-accent" />
                  {profile.districtName ? `${profile.districtName}, ` : ''}{profile.stateName || 'National'}
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-headline font-bold text-white transition-colors">
                {profile.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                <p className="text-accent font-bold tracking-[0.2em] uppercase text-xs">{profile.designation}</p>
                <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                <p className="text-slate-400 font-mono text-sm tracking-tighter">REF: {profile.memberId || profile.id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            
            <div className="lg:col-span-2 space-y-10">
              <Card className="border-none shadow-sm rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 p-10">
                  <CardTitle className="text-2xl font-headline font-bold text-primary dark:text-white flex items-center gap-4">
                    <FileCheck className="w-8 h-8 text-accent" /> Personnel Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                           <Label>Full Name</Label>
                           <Input value={editForm?.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="h-12 rounded-xl" />
                         </div>
                         <div className="space-y-2">
                           <Label>Designation</Label>
                           <Input value={editForm?.designation} onChange={e => setEditForm({...editForm, designation: e.target.value})} className="h-12 rounded-xl" />
                         </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-6">
                         <div className="space-y-2">
                           <Label>Operational Level</Label>
                           <Select value={editForm?.level} onValueChange={(val: any) => setEditForm({...editForm, level: val, stateName: '', districtName: ''})}>
                             <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="National">National</SelectItem>
                               <SelectItem value="State">State</SelectItem>
                               <SelectItem value="District">District</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                         {(editForm?.level === 'State' || editForm?.level === 'District') && (
                           <div className="space-y-2">
                             <Label className="flex items-center gap-2"><Globe className="w-3 h-3 text-accent" /> State / UT</Label>
                             <Select value={editForm?.stateName} onValueChange={(val) => setEditForm({...editForm, stateName: val, districtName: ''})}>
                               <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Choose State" /></SelectTrigger>
                               <SelectContent className="max-h-60">
                                 {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                               </SelectContent>
                             </Select>
                           </div>
                         )}
                         {editForm?.level === 'District' && editForm?.stateName && (
                           <div className="space-y-2">
                             <Label className="flex items-center gap-2"><MapPin className="w-3 h-3 text-accent" /> District</Label>
                             <Select value={editForm?.districtName} onValueChange={(val) => setEditForm({...editForm, districtName: val})}>
                               <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Choose District" /></SelectTrigger>
                               <SelectContent className="max-h-60">
                                 {(INDIA_DATA[editForm.stateName] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                               </SelectContent>
                             </Select>
                           </div>
                         )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input value={editForm?.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input value={editForm?.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="h-12 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Communication</p>
                        <p className="text-xl font-bold text-primary dark:text-white flex items-center gap-3 break-all">
                          <Mail className="w-6 h-6 text-accent shrink-0" /> {profile.email}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dedicated Hotline</p>
                        <p className="text-xl font-bold text-primary dark:text-white flex items-center gap-3">
                          <Phone className="w-6 h-6 text-accent shrink-0" /> {profile.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-10">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/20 transition-colors"></div>
                <CardHeader className="p-0 mb-8">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <CalendarIcon className="w-8 h-8 text-accent" />
                   </div>
                </CardHeader>
                <div className="space-y-8 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Commission Date</p>
                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white h-12 rounded-xl", !editForm?.joiningDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editForm?.joiningDate ? editForm.joiningDate : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={parseProfileDate(editForm?.joiningDate)}
                            onSelect={(date) => setEditForm({...editForm, joiningDate: date ? format(date, "PPP") : ''})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <p className="text-3xl font-headline font-bold">{profile.joiningDate || 'Date Unavailable'}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operational Status</p>
                    {isEditing ? (
                      <Select value={editForm?.status} onValueChange={(val) => setEditForm({...editForm, status: val})}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-3 bg-emerald-500/10 w-fit px-4 py-2 rounded-xl border border-emerald-500/20">
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                        <p className="text-lg font-bold text-emerald-400 uppercase tracking-widest">{profile.status || 'Active'}</p>
                      </div>
                    )}
                  </div>
                  <div className="pt-8 border-t border-white/5">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-3">Verification Hash</p>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center font-mono text-xl tracking-tighter text-slate-300">
                      #{profile.memberId || profile.id.slice(-8).toUpperCase()}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="bg-accent/5 p-8 rounded-[2.5rem] border border-accent/20 border-dashed text-center space-y-4">
                <ShieldCheck className="w-10 h-10 text-accent mx-auto" />
                <p className="text-[10px] font-bold text-primary dark:text-accent uppercase tracking-widest">Data Integrity Check</p>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  "This profile is protected under end-to-end encryption. Unauthorized disclosure of this data is a punishable offense."
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
