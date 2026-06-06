
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { doc, updateDoc } from 'firebase/firestore'
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
  FileCheck,
  Loader2,
  AlertCircle,
  Edit,
  Save,
  Globe,
  Briefcase,
  Sparkles,
  IdCard,
  FileText,
  Award,
  CalendarClock,
  Clock
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parse, addYears } from "date-fns"
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

  // Auto-calculate expiry date for the editor
  useEffect(() => {
    if (isEditing && editForm?.joiningDate && editForm?.membershipDuration) {
      try {
        const joinDate = parse(editForm.joiningDate, "PPP", new Date());
        const years = parseInt(editForm.membershipDuration);
        if (!isNaN(years)) {
          const expiry = addYears(joinDate, years);
          const formattedExpiry = format(expiry, "PPP");
          if (editForm.expiryDate !== formattedExpiry) {
            setEditForm((prev: any) => ({ ...prev, expiryDate: formattedExpiry }));
          }
        }
      } catch (e) {}
    }
  }, [isEditing, editForm?.joiningDate, editForm?.membershipDuration]);

  const handleSave = async () => {
    if (!docRef) return
    setIsSaving(true)
    try {
      await updateDoc(docRef, editForm)
      toast({ title: "Record Updated" })
      setIsEditing(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "System Error" })
    } finally {
      setIsSaving(false)
    }
  }

  const parseMemberDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      return parse(dateStr, "PPP", new Date());
    } catch {
      return undefined;
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
  }

  if (profileLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Accessing encrypted file...</p></div>
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

  const fallback = profile.gender?.toLowerCase() === 'female' ? '/dummy w.png' : '/dummy m.png'
  const displayImg = profile.imageId?.startsWith('data:') ? profile.imageId : (PlaceHolderImages.find(i => i.id === profile.imageId)?.imageUrl || fallback)

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-10 pb-6 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/internal/members" className="inline-flex items-center gap-2 text-slate-400 hover:text-accent transition-colors font-bold text-[10px] uppercase tracking-widest">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Database
            </Link>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={() => setIsEditing(false)} variant="outline" className="border-white/10 bg-white/5 text-white h-9 rounded-lg text-[10px] font-bold">Discard</Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-accent text-primary font-bold h-9 rounded-lg text-[10px]">
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Save className="w-3 h-3 mr-1.5" />} Save
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white/20 text-white border border-white/10 h-9 rounded-lg px-4 text-[10px] font-bold">
                  <Edit className="w-3 h-3 mr-1.5" /> Modify Profile
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white/5 rounded-lg flex items-center justify-center border-2 border-white/10 shadow-xl relative group overflow-hidden shrink-0">
              <Image src={displayImg} alt={profile.name} fill className="object-cover" />
            </div>
            
            <div className="text-center md:text-left space-y-1 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge className="bg-accent text-primary font-bold px-3 py-0.5 uppercase tracking-widest text-[8px] rounded-full">
                  {profile.level || 'Operational'}
                </Badge>
                <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                  <MapPin className="w-2.5 h-2.5 text-accent" />
                  {profile.stateName || 'National'}
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-white transition-colors leading-none">
                {profile.name}
              </h1>
              <p className="text-accent font-bold tracking-[0.2em] uppercase text-[9px]">{profile.designation}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               <Card className="rounded-3xl p-6 md:p-8">
                 <CardTitle className="text-lg mb-6">Credential Details</CardTitle>
                 <div className="space-y-6">
                   {isEditing ? (
                     <div className="space-y-6">
                       <div className="grid md:grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <Label className="text-[10px] uppercase font-bold text-slate-400">Full Name</Label>
                           <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                         </div>
                         <div className="space-y-1">
                           <Label className="text-[10px] uppercase font-bold text-slate-400">Designation</Label>
                           <Input value={editForm.designation} onChange={e => setEditForm({...editForm, designation: e.target.value})} />
                         </div>
                       </div>

                       <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-accent font-bold text-[10px] uppercase flex items-center gap-2"><CalendarClock className="w-3.5 h-3.5" /> Membership Duration</Label>
                            <Select value={editForm.membershipDuration || '1 Year'} onValueChange={(val) => setEditForm({...editForm, membershipDuration: val})}>
                              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-800 border-accent/20 font-bold">
                                <SelectValue placeholder="Select Duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1 Year" className="font-bold">1 Year Term</SelectItem>
                                <SelectItem value="2 Years" className="font-bold">2 Years Term</SelectItem>
                                <SelectItem value="3 Years" className="font-bold">3 Years Term</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-slate-400">Issue Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 rounded-lg", !editForm.joiningDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editForm.joiningDate ? editForm.joiningDate : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={parseMemberDate(editForm.joiningDate)} onSelect={(date) => setEditForm({...editForm, joiningDate: date ? format(date, "PPP") : ''})} initialFocus />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-slate-400">Expiry Date (Auto-calculated)</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 rounded-lg bg-slate-100/50 dark:bg-slate-800/50", !editForm.expiryDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editForm.expiryDate ? editForm.expiryDate : "Auto-calculated"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={parseMemberDate(editForm.expiryDate)} onSelect={(date) => setEditForm({...editForm, expiryDate: date ? format(date, "PPP") : ''})} initialFocus />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Email</Label><Input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} /></div>
                          <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-400">Phone</Label><Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
                       </div>
                     </div>
                   ) : (
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contact Info</p>
                          <p className="text-sm font-bold text-primary flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-accent" /> {profile.email}</p>
                          <p className="text-sm font-bold text-primary flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-accent" /> {profile.phone}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Membership Term</p>
                          <p className="text-sm font-bold text-primary flex items-center gap-2"><CalendarClock className="w-3.5 h-3.5 text-accent" /> Duration: {profile.membershipDuration || '1 Year'}</p>
                          <p className="text-sm font-bold text-primary flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-emerald-500" /> Issued: {profile.joiningDate || 'N/A'}</p>
                          <p className="text-sm font-bold text-red-600 flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" /> Expires: {profile.expiryDate || 'N/A'}</p>
                        </div>
                     </div>
                   )}
                 </div>
               </Card>
            </div>
            <div className="space-y-8">
              <Card className="rounded-3xl p-6 bg-slate-900 text-white shadow-2xl border-none relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                 <CardTitle className="text-base text-accent mb-6 uppercase tracking-widest font-headline flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4" /> Operational Center
                 </CardTitle>
                 <div className="space-y-3">
                   <Link href={`/internal/members/${memberId}/id-card`} className="w-full">
                      <Button variant="outline" className="w-full justify-start rounded-xl h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest gap-3 transition-all hover:translate-x-1">
                         <IdCard className="w-4 h-4 text-accent" /> Digital ID Card
                      </Button>
                   </Link>
                   <Link href={`/internal/members/${memberId}/certificate`} className="w-full">
                      <Button variant="outline" className="w-full justify-start rounded-xl h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest gap-3 transition-all hover:translate-x-1">
                         <Award className="w-4 h-4 text-emerald-400" /> induction Certificate
                      </Button>
                   </Link>
                   <Link href={`/internal/members/${memberId}/appointment`} className="w-full">
                      <Button variant="outline" className="w-full justify-start rounded-xl h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest gap-3 transition-all hover:translate-x-1">
                         <FileText className="w-4 h-4 text-indigo-400" /> Appointment Letter
                      </Button>
                   </Link>
                 </div>
                 <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">Authorized for Internal Use Only</p>
                 </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
