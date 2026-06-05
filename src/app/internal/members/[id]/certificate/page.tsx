"use client"

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft, Award, ShieldCheck, BadgeCheck, CheckCircle2, Download } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function MembershipCertificateGenerator() {
  const { id } = useParams()
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

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

  const handleDownload = () => {
    toast({
      title: "Downloading Certificate",
      description: "Select 'Save as PDF' from the printer options to download your file.",
    })
    setTimeout(() => window.print(), 500)
  }

  return (
    <main className="min-h-screen bg-slate-200 p-8 md:p-16 print:p-0 print:bg-white flex flex-col items-center">
      
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 print:hidden">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-bold uppercase text-xs tracking-widest bg-white/50 backdrop-blur-md">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Button>
        <div className="flex gap-4">
          <Button onClick={handleDownload} variant="outline" className="border-emerald-600 text-emerald-600 font-bold h-12 rounded-xl gap-2 bg-white/50">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
          <Button onClick={handlePrint} className="bg-emerald-600 text-white font-bold h-12 rounded-xl gap-2 shadow-lg shadow-emerald-600/20">
            <Printer className="w-4 h-4" /> Print Certificate
          </Button>
        </div>
      </div>

      {/* Certificate Frame */}
      <div className="relative w-full max-w-5xl aspect-[1.414/1] bg-white shadow-2xl p-4 md:p-12 print:shadow-none print:p-4 border-[16px] border-primary overflow-hidden">
        
        {/* Inner Border Decorative */}
        <div className="h-full w-full border-4 border-accent p-12 md:p-20 relative flex flex-col items-center text-center">
          
          {/* Background Watermark */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <div className="relative w-[60%] h-[60%]">
               <Image src="/HRAT%20Logo.jpeg" alt="watermark" fill className="object-contain" />
            </div>
          </div>

          <div className="relative z-10 space-y-8 w-full">
            {/* Header */}
            <div className="space-y-4">
              <div className="relative w-24 h-24 mx-auto mb-4">
                 <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
              <p className="text-xs md:text-sm font-bold tracking-[0.4em] uppercase text-accent leading-none">Human Rights Affairs Trust</p>
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">Certificate of Membership</h1>
              <div className="flex items-center justify-center gap-4 py-2">
                 <div className="h-px bg-slate-300 flex-1"></div>
                 <BadgeCheck className="w-10 h-10 text-primary" />
                 <div className="h-px bg-slate-300 flex-1"></div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-10">
               <p className="text-xl md:text-2xl font-serif italic text-slate-500">This official document is proudly presented to</p>
               
               <div className="space-y-2">
                 <h2 className="text-4xl md:text-6xl font-headline font-bold text-primary underline underline-offset-8 decoration-accent/30">{member.name}</h2>
                 <p className="text-lg md:text-xl font-bold uppercase tracking-widest text-accent mt-4">Designation: {member.designation}</p>
               </div>

               <p className="max-w-3xl mx-auto text-base md:text-lg text-slate-600 leading-relaxed font-serif">
                 In recognition of your unwavering commitment to the principles of human rights, social justice, and constitutional literacy. You are hereby inducted as a verified member of the <strong>{member.level} Council</strong> of the Human Rights Affairs Trust (Justice Shield).
               </p>

               <div className="grid grid-cols-2 gap-20 pt-16 max-w-4xl mx-auto">
                  <div className="text-center space-y-2">
                     <p className="font-mono text-sm text-primary font-bold">#{member.memberId || 'HRAT-GEN-001'}</p>
                     <div className="h-px bg-slate-300 w-full mx-auto"></div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Membership ID</p>
                  </div>
                  <div className="text-center space-y-2">
                     <p className="font-mono text-sm text-primary font-bold">{member.joiningDate || 'Feb 2025'}</p>
                     <div className="h-px bg-slate-300 w-full mx-auto"></div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Issue</p>
                  </div>
               </div>
            </div>

            {/* Signature Area */}
            <div className="pt-20 flex justify-between items-end w-full px-10">
               <div className="text-center">
                  <div className="h-10 border-b border-slate-300 w-48 mb-2"></div>
                  <p className="font-bold text-primary text-sm uppercase">Auth. Registrar</p>
               </div>
               <div className="relative">
                 <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-32 h-32 opacity-10">
                    <CheckCircle2 className="w-full h-full text-primary" />
                 </div>
                 <div className="relative w-20 h-20 bg-slate-50 rounded-full border-2 border-accent/20 p-2 flex items-center justify-center mb-2">
                    <Image src="/HRAT%20Logo.jpeg" alt="seal" width={60} height={60} className="object-contain opacity-40 grayscale" />
                 </div>
                 <p className="text-[8px] font-bold text-slate-400 uppercase">Trust Seal</p>
               </div>
               <div className="text-center">
                  <div className="h-10 border-b border-slate-300 w-48 mb-2"></div>
                  <p className="font-bold text-primary text-sm uppercase">Central Chairman</p>
               </div>
            </div>
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-accent"></div>
          <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-accent"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-accent"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-accent"></div>
        </div>

      </div>

    </main>
  )
}
