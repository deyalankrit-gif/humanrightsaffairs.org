"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
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
  Mail, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Loader2,
  AlertCircle,
  Edit,
  Save,
  Contact,
  FileText,
  Award,
  CalendarClock,
  Clock,
  Heart,
  Home,
  Camera,
  Hash,
  Trash2
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
import { DeleteMemberWorkflow } from '@/components/delete-member-workflow'

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
  const [isDeleting, setIsDeleting] = useState(false)

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
      setEditForm({
        ...profile,
        designationCategory: profile.designationCategory || (profile.designation === 'General Member' ? 'General Member' : profile.designation === 'Board Member' ? 'Board Member' : profile.designation === 'Volunteer' ? 'Volunteer' : 'Office-bearing Member')
      })
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditForm((prev: any) => ({ ...prev, imageId: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!docRef) return
    setIsSaving(true)
    try {
      await updateDoc(docRef, {
        ...editForm,
        updatedAt: serverTimestamp()
      })
      toast({ title: "Personnel Record Updated", description: "Changes committed to national registry." })
      setIsEditing(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "System Error" })
    } finally {
      setIsSaving(false)
    }
  }

  const parseMemberDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    try { return parse(dateStr, "PPP", new Date()); } catch { return undefined; }
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

  const nameLower = (profile.name || '').toLowerCase();
  const genderKey = (profile.gender || '').trim().toLowerCase();
  
  // Intelligent Gender Inference for Fallback
  const isMs = nameLower.startsWith('ms.') || nameLower.startsWith('mrs.') || nameLower.startsWith('miss');
  const femaleNames = ["moumita", "raisa", "rumpa", "anjali", "sujata", "fatema", "mousumi", "savita", "rajeshwari", "meenakshi", "pallavi", "suchitra", "amita", "debjani", "deepali", "tapasya", "priyanka", "anita", "sneha", "mitali"];
  const firstName = (profile.name || '').split(' ')[0].toLowerCase();
  const isKnownFemale = femaleNames.includes(firstName);

  let fallback = '/dummy m.png';
  if (genderKey === 'female' || genderKey === 'f' || genderKey === 'woman' || isMs || isKnownFemale) {
    fallback = '/dummy w.png';
  } else if (genderKey === 'male' || genderKey === 'm' || genderKey === 'man') {
    fallback = '/dummy m.png';
  }
  
  const isCustomPhoto = profile.imageId && (profile.imageId.startsWith('data:') || profile.imageId.startsWith('http'));
  const placeholder = PlaceHolderImages.find(i => i.id === profile.imageId)?.imageUrl;
  
  const displayImg = isCustomPhoto ? profile.imageId : (placeholder || fallback)
  
  const states = Object.keys(INDIA_DATA).sort()

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
                  <Button size="sm" onClick={() => setIsEditing(false)} variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white h-9 rounded-lg text-[10px] font-bold">Discard</Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-accent text-primary font-bold h-9 rounded-lg text-[10px] hover:bg-secondary hover:text-white transition-all">
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Save className="w-3 h-3 mr-1.5" />} SAVE CHANGES
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white/20 text-white border border-white/10 h-9 rounded-lg px-4 text-[10px] font-bold transition-all">
                  <Edit className="w-3 h-3 mr-1.5" /> EDIT MEMBER
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white/5 rounded-lg flex items-center justify-center border-2 border-white/10 shadow-xl relative group overflow-hidden shrink-0">
              <Image src={displayImg!} alt={profile.name} fill className="object-cover" />
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
                 <CardTitle className="text-lg mb-6 flex items-center justify-between text-primary dark:text-white">
                   <div className="flex items-center gap-2">
                     <ShieldCheck className="w-5 h-5 text-accent" /> Personnel Credentials
                   </div>
                   {!isEditing && (
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsDeleting(true)}
                        className="text-red-500 hover:bg-red-50 h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest gap-2"
                      >
                       <Trash2 className="w-4 h-4" /> DELETE MEMBER
                     </Button>
                   )}
                 </CardTitle>
                 
                 {isEditing ? (
                   <div className="space-y-6">
                     <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="relative w-32 h-32 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-accent transition-colors shadow-inner">
                          {editForm.imageId ? (
                            <Image src={editForm.imageId} alt="Preview" fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full"><Camera className="w-10 h-10 text-slate-300" /></div>
                          )}
                          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                        </div>
                        <Label className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">Update Portrait <span className="text-slate-400/50">(Optional)</span></Label>
                     </div>

                     <div className="grid md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                         <Label className="text-[10px] uppercase font-bold text-slate-500">Full Legal Name *</Label>
                         <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="border-2 border-black h-11" />
                       </div>
                       <div className="space-y-1">
                         <Label className="text-[10px] uppercase font-bold text-slate-500">Member ID *</Label>
                         <Input 
                            value={editForm.memberId || ''} 
                            onChange={e => setEditForm({...editForm, memberId: e.target.value.toUpperCase()})} 
                            placeholder="ABCDEF1234"
                            maxLength={10}
                            className="font-mono border-2 border-black h-11"
                         />
                       </div>
                     </div>

                     <div className="grid md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                         <Label className="text-[10px] uppercase font-bold text-slate-500">Operational Level *</Label>
                         <Select value={editForm.level} onValueChange={(val: any) => setEditForm({...editForm, level: val, stateName: '', districtName: ''})}>
                           <SelectTrigger className="h-11 rounded-xl border-2 border-black"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-white">
                             <SelectItem value="National">Central Council</SelectItem>
                             <SelectItem value="State">State Level</SelectItem>
                             <SelectItem value="District">District Level</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                       <div className="space-y-1">
                         <Label className="text-[10px] uppercase font-bold text-slate-500">Gender *</Label>
                         <Select value={editForm.gender} onValueChange={(val: any) => setEditForm({...editForm, gender: val})}>
                           <SelectTrigger className="h-11 rounded-xl border-2 border-black"><SelectValue /></SelectTrigger>
                           <SelectContent className="bg-white">
                             <SelectItem value="male">Male</SelectItem>
                             <SelectItem value="female">Female</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </div>

                     {(editForm.level === 'State' || editForm.level === 'District') && (
                       <div className="grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
                          <div className="space-y-1">
                             <Label className="text-[10px] uppercase font-bold text-accent">Chapter State *</Label>
                             <Select value={editForm.stateName} onValueChange={val => setEditForm({...editForm, stateName: val, districtName: ''})}>
                                <SelectTrigger className="h-11 rounded-xl border-2 border-black"><SelectValue placeholder="Select State" /></SelectTrigger>
                                <SelectContent className="max-h-60 bg-white">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                             </Select>
                          </div>
                          {editForm.level === 'District' && editForm.stateName && (
                             <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                                <Label className="text-[10px] uppercase font-bold text-accent">Chapter District *</Label>
                                <Select value={editForm.districtName} onValueChange={val => setEditForm({...editForm, districtName: val})}>
                                   <SelectTrigger className="h-11 rounded-xl border-2 border-black"><SelectValue placeholder="Select District" /></SelectTrigger>
                                   <SelectContent className="max-h-60 bg-white">{(INDIA_DATA[editForm.stateName] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                             </div>
                          )}
                       </div>
                     )}

                     <div className="grid md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                         <Label className="text-[10px] uppercase font-bold text-slate-500">Blood Group</Label>
                         <Select value={editForm.bloodGroup} onValueChange={val => setEditForm({...editForm, bloodGroup: val})}>
                            <SelectTrigger className="h-11 rounded-xl border-2 border-black"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent className="bg-white">
                              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                            </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-1">
                         <Label className="text-[10px] uppercase font-bold text-slate-500">Current Profession</Label>
                         <Input value={editForm.profession || ''} onChange={e => setEditForm({...editForm, profession: e.target.value})} placeholder="e.g. Advocate" className="h-11 rounded-xl border-2 border-black" />
                       </div>
                     </div>

                     <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-inner">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-accent font-bold text-[10px] uppercase">Membership Term *</Label>
                            <Select value={editForm.membershipDuration || '1 Year'} onValueChange={(val) => setEditForm({...editForm, membershipDuration: val})}>
                              <SelectTrigger className="bg-white dark:bg-slate-800 border-2 border-black h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="1 Year">1 Year Term</SelectItem>
                                <SelectItem value="2 Years">2 Years Term</SelectItem>
                                <SelectItem value="3 Years">3 Years Term</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-100">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-accent">Designation Category *</Label>
                            <Select value={editForm.designationCategory} onValueChange={(val: any) => {
                              const isFixed = val === 'General Member' || val === 'Board Member' || val === 'Volunteer';
                              setEditForm({
                                ...editForm, 
                                designationCategory: val, 
                                designation: isFixed ? val : ''
                              });
                            }}>
                              <SelectTrigger className="rounded-xl border-2 border-black h-11"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="General Member">General Member</SelectItem>
                                <SelectItem value="Board Member">Board Member</SelectItem>
                                <SelectItem value="Office-bearing Member">Office-bearing Member</SelectItem>
                                <SelectItem value="Volunteer">Volunteer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {editForm.designationCategory === 'Office-bearing Member' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                              <Label className="text-[10px] font-bold uppercase text-accent">Manual Designation *</Label>
                              <Input value={editForm.designation} onChange={e => setEditForm({...editForm, designation: e.target.value})} className="rounded-xl border-2 border-black h-11" />
                            </div>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Issue Date *</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 rounded-lg border-2 border-black", !editForm.joiningDate && "text-muted-foreground")}>
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {editForm.joiningDate ? editForm.joiningDate : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-[1000000]" align="start">
                                <Calendar mode="single" selected={parseMemberDate(editForm.joiningDate)} onSelect={(date) => setEditForm({...editForm, joiningDate: date ? format(date, "PPP") : ''})} initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Expiry Date</Label>
                            <Input disabled value={editForm.expiryDate} className="bg-slate-100/50 dark:bg-slate-900/50 border-2 border-black h-11" />
                          </div>
                        </div>
                     </div>

                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-slate-500">Email Address</Label>
                          <Input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="border-2 border-black h-11" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-slate-500">Primary Phone *</Label>
                          <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="border-2 border-black h-11 font-bold" />
                        </div>
                     </div>

                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <Label className="text-[10px] uppercase font-bold text-slate-500">Aadhaar Card Number *</Label>
                           <Input 
                              value={editForm.aadhaar || ''} 
                              onChange={e => setEditForm({...editForm, aadhaar: e.target.value})} 
                              placeholder="1234 5678 9012"
                              maxLength={12}
                              className="font-mono border-2 border-black h-11"
                           />
                        </div>
                        <div className="space-y-1">
                           <Label className="text-[10px] uppercase font-bold text-slate-500">PAN Number</Label>
                           <Input 
                              value={editForm.pan || ''} 
                              onChange={e => setEditForm({...editForm, pan: e.target.value.toUpperCase()})} 
                              placeholder="ABCDE1234F"
                              className="font-mono border-2 border-black h-11"
                           />
                        </div>
                     </div>

                     <div className="space-y-1">
                       <Label className="text-[10px] uppercase font-bold text-slate-500">Residential Address *</Label>
                       <Input value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="border-2 border-black h-11" />
                     </div>
                     
                     <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-slate-500">P.O. *</Label>
                          <Input value={editForm.postOffice} onChange={e => setEditForm({...editForm, postOffice: e.target.value})} className="border-2 border-black h-11" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-slate-500">P.S. *</Label>
                          <Input value={editForm.policeStation} onChange={e => setEditForm({...editForm, policeStation: e.target.value})} className="border-2 border-black h-11" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-slate-500">PIN *</Label>
                          <Input value={editForm.pinCode} onChange={e => setEditForm({...editForm, pinCode: e.target.value})} maxLength={6} className="font-mono border-2 border-black h-11" />
                        </div>
                     </div>
                   </div>
                 ) : (
                   <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Protocol</p>
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-primary flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-accent" /> {profile.email || 'N/A'}</p>
                            <p className="text-sm font-bold text-primary flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-accent" /> {profile.phone}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Identification</p>
                          <div className="space-y-2">
                             <p className="text-sm font-bold text-primary flex items-center gap-2"><Hash className="w-3.5 h-3.5 text-accent" /> Aadhaar: <span className="font-mono">{profile.aadhaar || 'Pending'}</span></p>
                             <p className="text-sm font-bold text-primary flex items-center gap-2"><Hash className="w-3.5 h-3.5 text-accent" /> PAN: <span className="font-mono uppercase">{profile.pan || 'N/A'}</span></p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Medical Record</p>
                          <p className="text-sm font-bold text-primary flex items-center gap-2">
                             <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/20" /> 
                             Blood Group: <span className="text-red-600">{profile.bloodGroup || 'Not Specified'}</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Membership Term</p>
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-primary flex items-center gap-2"><CalendarClock className="w-3.5 h-3.5 text-accent" /> Term: {profile.membershipDuration || '1 Year'}</p>
                            <p className="text-sm font-bold text-primary flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-emerald-500" /> Issued: {profile.joiningDate || 'N/A'}</p>
                            <p className="text-sm font-bold text-red-600 flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" /> Expires: {profile.expiryDate || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Verified Address</p>
                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                           <div className="flex gap-3">
                              <Home className="w-4 h-4 text-accent shrink-0 mt-1" />
                              <p className="text-sm text-slate-600 leading-relaxed font-medium">"{profile.address || 'Address data missing.'}"</p>
                           </div>
                           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                              <div>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase">Post Office</p>
                                 <p className="text-xs font-bold text-primary">{profile.postOffice || '--'}</p>
                              </div>
                              <div>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase">P.S.</p>
                                 <p className="text-xs font-bold text-primary">{profile.policeStation || '--'}</p>
                              </div>
                              <div>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase">PIN</p>
                                 <p className="text-xs font-mono font-bold text-primary">{profile.pinCode || '--'}</p>
                              </div>
                           </div>
                        </div>
                      </div>
                   </div>
                 )}
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
                      <Button variant="outline" className="w-full justify-start rounded-xl h-12 border-white/10 bg-white/5 hover:bg-accent hover:text-primary transition-all text-white hover:text-primary font-bold text-[10px] uppercase tracking-widest gap-3 hover:translate-x-1">
                         <Contact className="w-4 h-4 text-accent" /> Digital ID Card
                      </Button>
                   </Link>
                   <Link href={`/internal/members/${memberId}/certificate`} className="w-full">
                      <Button variant="outline" className="w-full justify-start rounded-xl h-12 border-white/10 bg-white/5 hover:bg-secondary hover:text-white transition-all text-white hover:text-white font-bold text-[10px] uppercase tracking-widest gap-3 hover:translate-x-1">
                         <Award className="w-4 h-4 text-emerald-400" /> Induction Cert
                      </Button>
                   </Link>
                   <Link href={`/internal/members/${memberId}/appointment`} className="w-full">
                      <Button variant="outline" className="w-full justify-start rounded-xl h-12 border-white/10 bg-white/5 hover:bg-secondary hover:text-white transition-all text-white hover:text-white font-bold text-[10px] uppercase tracking-widest gap-3 hover:translate-x-1">
                         <FileText className="w-4 h-4 text-indigo-400" /> Appointment Letter
                      </Button>
                   </Link>
                 </div>
                 <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">Personnel Management Node</p>
                 </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {isDeleting && (
        <DeleteMemberWorkflow 
          member={profile}
          onSuccess={() => { setIsDeleting(false); router.push('/internal/members'); }}
          onCancel={() => setIsDeleting(false)}
        />
      )}

      <Footer />
    </main>
  )
}
