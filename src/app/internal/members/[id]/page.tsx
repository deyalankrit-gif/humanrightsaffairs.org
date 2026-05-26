
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Droplets,
  Heart,
  FileCheck,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function MemberDetailsPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const params = useParams()
  const memberId = params.id as string
  const db = useFirestore()

  // Dynamic fetch from Firestore - only if user is authorized
  const docRef = useMemoFirebase(() => {
    if (!db || !memberId || !user) return null;
    return doc(db, 'memberProfiles', memberId);
  }, [db, memberId, user]);

  const { data: firestoreProfile, loading: profileLoading } = useDoc(docRef);

  // Demo data for member details as fallback
  const demoProfiles: Record<string, any> = {
    'M001': {
      memberId: 'M001',
      name: 'Dhritiman Dey',
      designation: 'Central Chairman (INDIA) & Founder',
      email: 'dhritiman.dey@hrat-india.org',
      phone: '+91 90649 90024',
      address: 'Human Rights Bhawan, Lodhi Road, New Delhi, 110003',
      bloodGroup: 'B+',
      emergencyContact: 'Mrs. Dey (+91 90000 00000)',
      joiningDate: '12 Jan 2018',
      status: 'Active',
      level: 'National Council'
    },
    'M004': {
      memberId: 'M004',
      name: 'Moumita Saha',
      designation: 'Chairman (West Bengal) & Founder',
      email: 'moumita.saha@hrat-india.org',
      phone: '+91 98765 43210',
      address: 'Kolkata Zonal Office, Salt Lake, West Bengal',
      bloodGroup: 'O+',
      emergencyContact: 'Mr. Saha (+91 91111 22222)',
      joiningDate: '15 Mar 2018',
      status: 'Active',
      level: 'State Chapter'
    }
  }

  const profile = firestoreProfile || demoProfiles[memberId]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

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
          <p className="text-slate-500 max-w-xs">The requested Member ID does not exist in our encrypted records.</p>
          <Link href="/internal/members">
            <Button className="mt-4 rounded-xl">Back to Directory</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isDhritiman = profile.name === 'Dhritiman Dey'

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="pt-32 pb-12 bg-slate-900 text-white border-b-8 border-accent/20">
        <div className="container mx-auto px-4">
          <Link href="/internal/members" className="inline-flex items-center gap-2 text-slate-400 hover:text-accent transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Secure Database
          </Link>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-40 h-40 bg-white/5 rounded-[2.5rem] flex items-center justify-center border-2 border-white/10 shadow-2xl relative">
              <User className="w-20 h-20 text-slate-400" />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-slate-900 shadow-xl">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-center md:text-left space-y-3">
              <Badge className="bg-accent text-primary font-bold px-4 py-1 uppercase tracking-widest text-[10px] rounded-full">
                {profile.level || 'Operational Personnel'}
              </Badge>
              <h1 className={`text-5xl md:text-6xl font-headline font-bold transition-colors ${isDhritiman ? 'text-secondary' : 'text-white'}`}>
                {profile.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                <p className="text-accent font-bold tracking-[0.2em] uppercase text-xs">{profile.designation}</p>
                <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                <p className="text-slate-400 font-mono text-sm tracking-tighter">REF: {profile.memberId || profile.id}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            
            <div className="lg:col-span-2 space-y-10">
              <Card className="border-none shadow-sm rounded-[3rem] overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-10">
                  <CardTitle className="text-2xl font-headline font-bold text-primary flex items-center gap-4">
                    <FileCheck className="w-8 h-8 text-accent" /> Personnel Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 grid md:grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Communication</p>
                    <p className="text-xl font-bold text-primary flex items-center gap-3 break-all">
                      <Mail className="w-6 h-6 text-accent shrink-0" /> {profile.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dedicated Hotline</p>
                    <p className="text-xl font-bold text-primary flex items-center gap-3">
                      <Phone className="w-6 h-6 text-accent shrink-0" /> {profile.phone}
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-2 pt-6 border-t border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Operational Base / Address</p>
                    <p className="text-xl font-bold text-primary flex items-center gap-3 leading-relaxed">
                      <MapPin className="w-6 h-6 text-accent shrink-0" /> {profile.address}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[3rem] overflow-hidden bg-white">
                <CardHeader className="bg-red-50/30 border-b border-red-50 p-10">
                  <CardTitle className="text-2xl font-headline font-bold text-primary flex items-center gap-4">
                    <Heart className="w-8 h-8 text-red-500" /> Emergency Protocols
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 grid md:grid-cols-2 gap-10">
                  <div className="bg-red-50/50 p-8 rounded-[2rem] space-y-2 border border-red-100/50">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Blood Type</p>
                    <p className="text-4xl font-headline font-bold text-red-600 flex items-center gap-3">
                      <Droplets className="w-8 h-8" /> {profile.bloodGroup}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2rem] space-y-2 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority Kin / Contact</p>
                    <p className="text-xl font-bold text-primary flex items-center gap-3">
                      <Phone className="w-6 h-6 text-accent shrink-0" /> {profile.emergencyContact}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-10">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/20 transition-colors"></div>
                <CardHeader className="p-0 mb-8">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <Calendar className="w-8 h-8 text-accent" />
                   </div>
                </CardHeader>
                <div className="space-y-8 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Commission Date</p>
                    <p className="text-3xl font-headline font-bold">{profile.joiningDate}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operational Status</p>
                    <div className="flex items-center gap-3 bg-emerald-500/10 w-fit px-4 py-2 rounded-xl border border-emerald-500/20">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                      <p className="text-lg font-bold text-emerald-400 uppercase tracking-widest">{profile.status}</p>
                    </div>
                  </div>
                  <div className="pt-8 border-t border-white/5">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-3">Verification Hash</p>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center font-mono text-xl tracking-tighter text-slate-300">
                      #{profile.memberId || profile.id}
                    </div>
                  </div>
                  <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold h-14 rounded-2xl">
                    Generate Identity Certificate
                  </Button>
                </div>
              </Card>

              <div className="bg-accent/5 p-8 rounded-[2.5rem] border border-accent/20 border-dashed text-center space-y-4">
                <ShieldCheck className="w-10 h-10 text-accent mx-auto" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Data Integrity Check</p>
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
