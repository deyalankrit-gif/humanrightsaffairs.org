"use client"

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft, Download, ShieldCheck, Hash, MapPin, BadgeCheck, Calendar as CalendarIcon } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useToast } from '@/hooks/use-toast'

export default function IDCardGenerator() {
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

  const fallback = member.gender?.toLowerCase() === 'female' ? '/dummy w.png' : '/dummy m.png'
  const displayImg = member.imageId?.startsWith('data:') ? member.imageId : (PlaceHolderImages.find(i => i.id === member.imageId)?.imageUrl || fallback)

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    toast({
      title: "Generating PDF",
      description: "Please select 'Save as PDF' from the printer destination to download your digital ID card.",
    })
    setTimeout(() => window.print(), 500)
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8 print:p-0 print:bg-white flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-bold uppercase text-xs tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Button>
          <div className="flex gap-4">
            <Button onClick={handleDownload} variant="outline" className="border-primary text-primary font-bold h-12 rounded-xl gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </Button>
            <Button onClick={handlePrint} className="bg-primary text-white font-bold h-12 rounded-xl gap-2 shadow-xl shadow-primary/20">
              <Printer className="w-4 h-4" /> Print ID Card
            </Button>
          </div>
        </div>

        {/* Horizontal ID Card Layout */}
        <div className="w-full flex justify-center print:mt-20">
          <div className="relative w-[500px] h-[320px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-slate-300">
            {/* Header */}
            <div className="h-24 bg-primary text-white p-6 flex items-center gap-4 border-b-4 border-accent">
               <div className="relative w-12 h-12 bg-white rounded-xl p-1 shrink-0">
                  <Image src="/HRAT%20Logo.jpeg" alt="HRAT" fill className="object-contain p-1" />
               </div>
               <div className="flex-1">
                 <h1 className="font-headline font-bold text-xl leading-none">Human Rights Affairs Trust</h1>
                 <p className="text-[9px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Justice Shield • Central Govt. Registered</p>
               </div>
            </div>

            {/* Body */}
            <div className="p-6 flex gap-6">
              <div className="space-y-4 shrink-0">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-md">
                   <Image src={displayImg} alt={member.name} fill className="object-cover" />
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest text-center border border-emerald-100">
                  Verified Member
                </div>
              </div>

              <div className="flex-1 space-y-4">
                 <div>
                   <h2 className="text-2xl font-headline font-bold text-primary leading-none mb-1">{member.name}</h2>
                   <p className="text-xs font-bold text-accent uppercase tracking-widest">{member.designation}</p>
                 </div>

                 <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-slate-500 uppercase text-[9px]">Member ID:</span>
                      <span className="font-mono font-bold text-primary">{member.memberId || 'PENDING'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-slate-500 uppercase text-[9px]">Region:</span>
                      <span className="font-bold text-primary">{member.districtName ? `${member.districtName}, ` : ''}{member.stateName || 'National'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-slate-500 uppercase text-[9px]">Issue Date:</span>
                      <span className="font-bold text-primary">{member.joiningDate || 'UNAVAILABLE'}</span>
                    </div>
                 </div>

                 <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                    <div className="space-y-1">
                       <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Official Seal</p>
                       <div className="w-10 h-10 relative opacity-50 grayscale">
                          <Image src="/HRAT%20Logo.jpeg" alt="seal" fill className="object-contain" />
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Auth. Signature</p>
                       <div className="h-6 border-b border-slate-300 w-24 ml-auto"></div>
                       <p className="text-[8px] font-bold text-primary mt-1 uppercase">Central Chairman</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Footer Accent */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-secondary"></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 print:hidden text-center max-w-lg mx-auto shadow-sm mt-8">
           <ShieldCheck className="w-12 h-12 text-accent mx-auto mb-4" />
           <h3 className="font-headline font-bold text-xl mb-2">Ready to Print</h3>
           <p className="text-slate-500 text-sm mb-6 leading-relaxed">
             Click the <strong>Print ID Card</strong> button to send this document directly to your default printer. For best quality, use glossy card stock.
           </p>
           <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase justify-center">
               <BadgeCheck className="w-4 h-4 text-emerald-500" /> Auto-detects default printer
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase justify-center">
               <BadgeCheck className="w-4 h-4 text-emerald-500" /> High-fidelity digital output
             </div>
           </div>
        </div>

      </div>
    </main>
  )
}
