"use client"

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft, Download, ShieldCheck, Mail, Phone, MapPin, Globe } from 'lucide-react'
import { Loader2 } from 'lucide-react'

export default function AppointmentLetterGenerator() {
  const { id } = useParams()
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()

  const docRef = useMemoFirebase(() => {
    if (!db || !id || !user) return null;
    return doc(db, 'memberProfiles', id as string);
  }, [db, id, user]);

  const { data: member, loading: dataLoading } = useDoc(docRef);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  if (!member) return null

  const handlePrint = () => {
    window.print()
  }

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <main className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white font-serif">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-sans font-bold uppercase text-xs tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Button>
          <Button onClick={handlePrint} className="bg-indigo-600 text-white font-sans font-bold h-12 rounded-xl gap-2">
            <Printer className="w-4 h-4" /> Print Appointment Letter
          </Button>
        </div>

        {/* Letter Layout */}
        <div className="w-full bg-white shadow-2xl p-12 md:p-20 print:shadow-none print:p-12 relative overflow-hidden border border-slate-100 min-h-[1100px]">
          {/* Virtual Letterhead */}
          <div className="border-b-4 border-primary pb-8 mb-12 flex items-center justify-between">
             <div className="flex items-center gap-6">
                <div className="relative w-20 h-20">
                   <Image src="/HRAT%20Logo.jpeg" alt="HRAT" fill className="object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-primary tracking-tight">Human Rights Affairs Trust</h1>
                  <p className="text-xs font-bold text-accent uppercase tracking-[0.3em] mt-1">Justice Shield • Registered with Government of India</p>
                </div>
             </div>
             <div className="text-right text-[10px] space-y-1 font-sans text-slate-500 font-bold uppercase tracking-wider">
               <p className="flex items-center justify-end gap-2"><MapPin className="w-3 h-3 text-accent" /> National HQ, New Delhi</p>
               <p className="flex items-center justify-end gap-2"><Globe className="w-3 h-3 text-accent" /> www.hrat-india.org</p>
               <p className="flex items-center justify-end gap-2"><Mail className="w-3 h-3 text-accent" /> official@hrat-india.org</p>
             </div>
          </div>

          {/* Letter Body */}
          <div className="space-y-10 leading-relaxed text-slate-800">
             <div className="flex justify-between font-sans text-sm font-bold uppercase text-slate-500">
                <p>Ref: HRAT/APP/{member.memberId || 'TEMP'}</p>
                <p>Date: {today}</p>
             </div>

             <div className="space-y-1">
                <p className="font-bold">To,</p>
                <p className="text-xl font-bold text-primary">{member.name}</p>
                <p className="text-sm font-medium">{member.profession}</p>
                <p className="text-sm text-slate-500">{member.districtName ? `${member.districtName}, ` : ''}{member.stateName || 'India'}</p>
             </div>

             <div className="space-y-4">
                <h2 className="text-xl font-bold border-b border-slate-200 pb-2 text-primary">Sub: Letter of Appointment for the position of {member.designation}</h2>
                
                <p className="text-justify">Dear {member.name},</p>
                
                <p className="text-justify">
                  With reference to your verified application for membership and subsequent vetting process by the Board of Governance, we are pleased to officially appoint you as the <strong>{member.designation}</strong> of the <strong>Human Rights Affairs Trust (Justice Shield)</strong> at the <strong>{member.level} Level</strong>, effective from {member.joiningDate || today}.
                </p>

                <div className="space-y-2">
                   <p className="font-bold underline">Terms of Appointment:</p>
                   <ul className="list-disc pl-6 space-y-2 text-sm italic">
                     <li>Your primary objective will be to promote constitutional literacy and provide legal aid to marginalized sections of society within your operational region.</li>
                     <li>You shall strictly abide by the organizational bylaws, human rights standards, and the non-disclosure policy of the Trust.</li>
                     <li>Your credentials and membership identity card are for official identification purposes only and any misuse is strictly prohibited under Indian law.</li>
                     <li>The Trust reserves the right to review your performance and adherence to ethical standards on a periodic basis.</li>
                   </ul>
                </div>

                <p className="text-justify">
                  We look forward to your dedicated contribution to our national mission for social justice and human rights advocacy. Together, we shall strive to build a more equitable society.
                </p>
             </div>

             <div className="pt-20 flex justify-between items-end">
                <div className="space-y-1 text-center">
                   <div className="w-16 h-16 relative mx-auto opacity-30 grayscale mb-2">
                      <Image src="/HRAT%20Logo.jpeg" alt="seal" fill className="object-contain" />
                   </div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase font-sans">Organizational Seal</p>
                </div>
                
                <div className="space-y-1 text-right">
                   <div className="h-10 border-b-2 border-slate-300 w-48 ml-auto mb-2"></div>
                   <p className="font-bold text-primary">Central Chairman</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase font-sans">Human Rights Affairs Trust (INDIA)</p>
                </div>
             </div>
          </div>

          {/* Page Footer */}
          <div className="absolute bottom-12 left-12 right-12 text-center text-[8px] text-slate-400 uppercase tracking-widest font-sans border-t pt-4">
             JusticeShield is a non-profit registered under the Societies Registration Act. Reg No: WB/2025/0762605.
          </div>
        </div>

      </div>
    </main>
  )
}
