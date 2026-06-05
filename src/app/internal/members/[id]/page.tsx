
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
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border-2 border-white/10 shadow-xl relative group overflow-hidden shrink-0">
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
               <Card className="rounded-3xl p-6 md:p-8"><CardTitle className="text-lg mb-6">Credentials</CardTitle>
                 <div className="grid md:grid-cols-2 gap-6">
                    <div><p className="text-[9px] font-bold text-slate-400 uppercase">Email</p><p className="text-sm font-bold">{profile.email}</p></div>
                    <div><p className="text-[9px] font-bold text-slate-400 uppercase">Phone</p><p className="text-sm font-bold">{profile.phone}</p></div>
                 </div>
               </Card>
            </div>
            <div className="space-y-8">
              <Card className="rounded-3xl p-6 bg-slate-900 text-white"><CardTitle className="text-base text-accent mb-6 uppercase">Operational Center</CardTitle>
                 <Link href={`/internal/members/${memberId}/id-card`} className="w-full">
                    <Button variant="outline" className="w-full justify-start rounded-xl h-10 border-accent/20 text-accent font-bold text-[10px] uppercase tracking-widest gap-2">
                       <IdCard className="w-3.5 h-3.5" /> ID Card
                    </Button>
                 </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
