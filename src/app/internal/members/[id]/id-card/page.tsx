"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft, Download, Mail, Globe, MapPin, ShieldCheck, BadgeCheck, X } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * IDCardGenerator produces an exact replica of the provided reference image,
 * populating it with dynamic member data.
 */
export default function IDCardGenerator() {
  const { id } = useParams()
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [view, setView] = useState<'front' | 'back'>('front')

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
      title: "Generating Digital ID",
      description: "Preparing your high-fidelity ID card. Use 'Save as PDF' to download.",
    })
    setTimeout(() => window.print(), 500)
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8 print:p-0 print:bg-white flex flex-col items-center">
      <div className="max-w-4xl w-full flex flex-col gap-8">
        
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-bold uppercase text-[10px] tracking-widest text-slate-500 hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Button>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <Button 
              variant={view === 'front' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('front')}
              className="rounded-lg text-[10px] font-bold px-4"
            >
              Front Side
            </Button>
            <Button 
              variant={view === 'back' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('back')}
              className="rounded-lg text-[10px] font-bold px-4"
            >
              Back Side
            </Button>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleDownload} variant="outline" className="border-slate-200 text-slate-600 font-bold h-10 rounded-xl gap-2 text-xs">
              <Download className="w-3.5 h-3.5" /> Save PDF
            </Button>
            <Button onClick={handlePrint} className="bg-primary text-white font-bold h-10 rounded-xl gap-2 shadow-xl shadow-primary/20 text-xs">
              <Printer className="w-3.5 h-3.5" /> Print Card
            </Button>
          </div>
        </div>

        {/* High-Fidelity ID Card Container */}
        <div className="w-full flex flex-col items-center gap-12 print:gap-10">
          
          {/* FRONT SIDE - REPLICA OF REFERENCE */}
          <div className={cn(
            "relative w-[800px] h-[500px] bg-white rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 print:shadow-none print:border-slate-200 transition-all duration-500",
            view !== 'front' && "hidden print:block"
          )}>
            {/* Header Section */}
            <div className="h-[90px] flex relative">
              <div className="w-[45%] bg-[#001f54] text-white flex items-center px-8 relative overflow-hidden">
                 <h1 className="text-[38px] font-black italic tracking-tighter uppercase leading-none z-10">HUMAN RIGHTS</h1>
                 <div className="absolute right-0 top-0 h-full w-16 bg-[#001f54] skew-x-[-25deg] translate-x-1/2 border-r-[6px] border-white z-10"></div>
              </div>
              <div className="flex-1 bg-[#c91010] text-white flex items-center px-12 relative">
                 <h1 className="text-[38px] font-black italic tracking-tighter uppercase leading-none z-0">AFFAIR TRUST</h1>
                 {/* Logo on the right */}
                 <div className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full p-1 shadow-xl z-30 border-[4px] border-white ring-2 ring-black/5">
                    <Image src="/HRAT%20Logo.jpeg" alt="Logo" fill className="object-contain p-1 rounded-full" />
                 </div>
              </div>
            </div>

            {/* Member ID Watermark Top Left */}
            <div className="absolute top-[105px] left-8">
               <span className="text-[36px] font-black text-[#001f54] tracking-tighter uppercase">{member.memberId || 'WB25LA09531'}</span>
            </div>

            <div className="flex px-8 mt-14 gap-8">
               {/* Portrait Section */}
               <div className="relative w-52 h-[260px] rounded-2xl overflow-hidden border-[6px] border-slate-50 shadow-xl bg-slate-100 ring-1 ring-slate-200">
                  <Image src={displayImg} alt={member.name} fill className="object-cover" />
                  {/* Portrait Hologram/Seal */}
                  <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md p-1 border border-white/50 shadow-lg">
                    <Image src="/HRAT%20Logo.jpeg" alt="Watermark" fill className="object-contain opacity-70" />
                  </div>
               </div>

               {/* Center Information Block */}
               <div className="flex-1 flex flex-col pt-8">
                  <div className="text-center space-y-0.5 mb-14">
                     <p className="text-[22px] font-black text-[#006400] tracking-tight leading-none">Registered by Govt. of India NITI Aayog</p>
                     <p className="text-[22px] font-black text-[#006400] tracking-tight leading-none">Regd.No. - WB/2025/0762605</p>
                  </div>

                  <div className="space-y-1">
                     <h2 className="text-[38px] font-black text-slate-900 leading-none uppercase tracking-tighter">{member.name}</h2>
                     <p className="text-[16px] font-black text-[#006400] uppercase tracking-wide">
                        {member.designation} ({member.stateName?.toUpperCase() || 'WEST BENGAL'} STATE COMMITTEE)
                     </p>
                  </div>
               </div>

               {/* Right Side: QR & Dates */}
               <div className="w-52 flex flex-col items-end pt-2 space-y-4">
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-[#001f54] font-mono mb-1">{member.memberId || 'WB25LA09531'}</p>
                    <div className="relative w-28 h-28 bg-white border-2 border-slate-100 p-1 rounded-xl shadow-lg">
                       <Image 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HRAT-VERIFY-${member.memberId}`} 
                        alt="Verification QR" 
                        fill 
                        className="object-contain"
                       />
                    </div>
                  </div>
                  
                  <div className="text-[13px] font-bold text-slate-800 space-y-0.5 leading-tight pr-1 font-mono">
                     <div className="flex justify-end gap-2">
                        <span className="text-slate-400">Issue :</span> 
                        <span>{member.joiningDate || '01.05.2026'}</span>
                     </div>
                     <div className="flex justify-end gap-2">
                        <span className="text-slate-400">Expire :</span> 
                        <span>{member.expiryDate || '01.05.2029'}</span>
                     </div>
                     <div className="flex justify-end gap-2">
                        <span className="text-slate-400">Mobile No :</span> 
                        <span>+91 {member.phone?.slice(0, 5)}XXXXX</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer Banner */}
            <div className="absolute bottom-0 left-0 w-full h-[60px] bg-[#001f54] flex items-center px-8 text-white border-t-[3px] border-white/5">
               <div className="absolute left-0 top-0 h-full w-24 bg-[#c91010] skew-x-[35deg] -translate-x-1/2 border-r-[4px] border-white"></div>
               
               <div className="flex items-center gap-2 relative z-10 mr-auto ml-10">
                  <div className="bg-white rounded-full p-1">
                    <Mail className="w-3.5 h-3.5 text-[#c91010] fill-[#c91010]" />
                  </div>
                  <span className="text-[14px] font-black tracking-tight">humanrightsaffairstrust@gmail.com</span>
               </div>

               <div className="flex items-center gap-2 relative z-10">
                  <div className="bg-white rounded-full p-1">
                    <Globe className="w-3.5 h-3.5 text-[#001f54]" />
                  </div>
                  <span className="text-[14px] font-black tracking-tight">www.humanrightsaffairs.org</span>
               </div>
            </div>
          </div>

          {/* BACK SIDE (DUMMY) */}
          <div className={cn(
            "relative w-[800px] h-[500px] bg-[#fdfdfd] rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200 print:shadow-none print:border-slate-300 transition-all duration-500",
            view !== 'back' && "hidden print:block"
          )}>
            <div className="h-4 bg-[#c91010] w-full"></div>
            <div className="p-10 flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]">
               <div className="flex justify-between items-start mb-8">
                  <div className="space-y-4">
                     <h3 className="text-[24px] font-black text-[#001f54] uppercase tracking-tighter border-b-[3px] border-accent w-fit pb-0.5">Organizational Mandate</h3>
                     <ul className="space-y-2 text-[13px] font-bold text-slate-600 list-disc pl-5 max-w-lg leading-relaxed">
                        <li>This card is for official identification purposes only.</li>
                        <li>Representation without valid authorization is a punishable offense.</li>
                        <li>Misuse of organizational branding is strictly prohibited.</li>
                        <li>Report loss of card to the National HQ immediately.</li>
                     </ul>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Authorized Seal</p>
                     <div className="w-40 h-16 border-[2px] border-dashed border-slate-200 bg-white/50 rounded-xl flex items-center justify-center">
                        <span className="text-[9px] text-slate-200 font-bold uppercase">Manual Stamp</span>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8 mt-auto pb-12">
                  <div className="space-y-2 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                     <p className="text-[11px] font-black text-accent uppercase tracking-[0.1em] flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> National Office
                     </p>
                     <p className="text-[12px] font-bold text-slate-700 leading-tight">
                        9567, Tokri Walan Azad Market, Delhi. <br /> Pin - 110006
                     </p>
                  </div>
                  <div className="space-y-2 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                     <p className="text-[11px] font-black text-accent uppercase tracking-[0.1em] flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> State Office (WB)
                     </p>
                     <p className="text-[12px] font-bold text-slate-700 leading-tight">
                        Deganga, North 24 Parganas, WB - 743423
                     </p>
                  </div>
               </div>

               <div className="flex justify-between items-end border-t border-slate-100 pt-6 mt-4">
                  <div className="flex items-center gap-4 opacity-40">
                     <div className="relative w-12 h-12 grayscale">
                        <Image src="/HRAT%20Logo.jpeg" alt="Seal" fill className="object-contain" />
                     </div>
                     <p className="text-[9px] font-black uppercase max-w-[150px] text-slate-400">Human Rights Affairs Trust (INDIA)</p>
                  </div>
                  <div className="text-right">
                     <div className="h-10 border-b-[2px] border-slate-200 w-48 ml-auto mb-1"></div>
                     <p className="text-[16px] font-black text-[#001f54] uppercase tracking-tighter leading-none">Central Chairman</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Official Signatory</p>
                  </div>
               </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-4 bg-[#001f54]"></div>
          </div>
        </div>

        {/* Security Validation Disclaimer */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 print:hidden text-center max-w-xl mx-auto shadow-xl relative overflow-hidden mt-4">
           <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12"></div>
           <ShieldCheck className="w-12 h-12 text-accent mx-auto mb-4 drop-shadow-md" />
           <h3 className="font-headline font-bold text-xl mb-2 text-primary">Authenticated Digital Identity</h3>
           <p className="text-slate-500 text-sm mb-6 leading-relaxed">
             This layout is optimized for <strong>PVC printing (85.6mm x 54mm)</strong>. For high-fidelity physical cards, use 300GSM thermal transfer printing.
           </p>
           <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase justify-center bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">
               <BadgeCheck className="w-4 h-4 text-emerald-500" /> NITI Aayog Verified Credentials
             </div>
           </div>
        </div>

      </div>
    </main>
  )
}
