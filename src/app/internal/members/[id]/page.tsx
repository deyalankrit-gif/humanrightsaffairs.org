
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser, useFirestore, useDoc } from '@/firebase'
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
  FileCheck
} from 'lucide-react'
import Link from 'next/link'

export default function MemberDetailsPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const params = useParams()
  const memberId = params.id as string

  // Demo data for member details
  const memberProfiles: Record<string, any> = {
    'M001': {
      id: 'M001',
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
      id: 'M004',
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

  const profile = memberProfiles[memberId]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) return null

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Profile Not Found</h2>
          <Link href="/internal/members">
            <Button className="mt-4">Back to Directory</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="pt-32 pb-12 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <Link href="/internal/members" className="inline-flex items-center gap-2 text-slate-400 hover:text-accent transition-colors mb-8 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Secure Directory
          </Link>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-accent/20 rounded-3xl flex items-center justify-center border-2 border-accent/40 shadow-2xl relative">
              <User className="w-16 h-16 text-accent" />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-full border-4 border-slate-900">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <Badge className="bg-accent text-primary font-bold">{profile.level}</Badge>
              <h1 className={`text-4xl md:text-5xl font-headline font-bold ${profile.name === 'Dhritiman Dey' ? 'text-red-500' : 'text-white'}`}>
                {profile.name}
              </h1>
              <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">{profile.designation}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50 p-8">
                  <CardTitle className="text-xl font-headline font-bold text-primary flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-accent" /> Sensitive Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Email</p>
                    <p className="text-lg font-bold text-primary flex items-center gap-2">
                      <Mail className="w-5 h-5 text-accent" /> {profile.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Phone Line</p>
                    <p className="text-lg font-bold text-primary flex items-center gap-2">
                      <Phone className="w-5 h-5 text-accent" /> {profile.phone}
                    </p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Residential Address</p>
                    <p className="text-lg font-bold text-primary flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent shrink-0" /> {profile.address}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50 p-8">
                  <CardTitle className="text-xl font-headline font-bold text-primary flex items-center gap-3">
                    <Heart className="w-6 h-6 text-red-500" /> Medical & Emergency
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Group</p>
                    <p className="text-lg font-bold text-red-600 flex items-center gap-2">
                      <Droplets className="w-5 h-5" /> {profile.bloodGroup}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emergency Contact</p>
                    <p className="text-lg font-bold text-primary flex items-center gap-2">
                      <Phone className="w-5 h-5 text-accent" /> {profile.emergencyContact}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="border-none shadow-sm rounded-[2rem] bg-primary text-white p-8">
                <CardHeader className="p-0 mb-6">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-accent" />
                   </div>
                </CardHeader>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Date of Induction</p>
                    <p className="text-2xl font-headline font-bold">{profile.joiningDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Operational Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                      <p className="text-xl font-bold">{profile.status}</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2">Member ID No</p>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center font-mono text-xl tracking-tighter">
                      {profile.id}
                    </div>
                  </div>
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
