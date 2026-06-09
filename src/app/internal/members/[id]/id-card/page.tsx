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
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-bold uppercase text-[10px] tracking-widest text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Button>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <Button 
              variant={view === 'front' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('front')}
              className="rounded-xl text-[10px] font-bold px-6 h-8"
            >
              Front Side
            </Button>
            <Button 
              variant={view === 'back' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('back')}
              className="rounded-xl text-[10px] font-bold px-6 h-8"
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
          
          {/* FRONT SIDE - PRECISE REPLICA OF REFERENCE */}
          <div className={cn(
            "relative w-[800px] h-[500px] bg-white rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 print:shadow-none print:border-slate-200 transition-all duration-500 select-none",
            view !== 'front' && "hidden print:block"
          )}>
            {/* Header Section */}
            <div className="h-[100px] flex relative">
              {/* Slanted Navy Blue Segment */}
              <div className="w-[45%] bg-[#001f54] text-white flex items-center px-10 relative overflow-hidden">
                 <h1 className="text-[42px] font-black italic tracking-tighter uppercase leading-none z-10 drop-shadow-lg">HUMAN RIGHTS</h1>
                 <div className="absolute right-0 top-0 h-full w-20 bg-[#001f54] skew-x-[-28deg] translate-x-1/2 border-r-[8px] border-white z-10 shadow-[4px_0_10px_rgba(0,0,0,0.3)]"></div>
              </div>
              {/* Slanted Red Segment */}
              <div className="flex-1 bg-[#c91010] text-white flex items-center px-14 relative">
                 <h1 className="text-[42px] font-black italic tracking-tighter uppercase leading-none z-0 drop-shadow-lg">AFFAIR TRUST</h1>
                 {/* Logo on the right */}
                 <div className="absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full p-1.5 shadow-2xl z-30 border-[5px] border-white ring-4 ring-black/5">
                    <div className="relative w-full h-full">
                      <Image src="/HRAT%20Logo.jpeg" alt="Logo" fill className="object-contain p-1" />
                    </div>
                 </div>
              </div>
            </div>

            {/* Member ID Watermark Top Left - High Contrast */}
            <div className="absolute top-[115px] left-10">
               <span className="text-[40px] font-black text-[#001f54] tracking-tighter uppercase opacity-90">{member.memberId || 'WB25LA09531'}</span>
            </div>

            <div className="flex px-10 mt-14 gap-10">
               {/* Portrait Section */}
               <div className="relative w-56 h-[280px] rounded-[2rem] overflow-hidden border-[8px] border-slate-50 shadow-2xl bg-slate-100 ring-2 ring-slate-200 shrink-0">
                  <Image src={displayImg} alt={member.name} fill className="object-cover" />
                  {/* Portrait Hologram/Seal Overlay */}
                  <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white/40 backdrop-blur-md p-1.5 border-2 border-white/60 shadow-xl">
                    <Image src="/HRAT%20Logo.jpeg" alt="Watermark" fill className="object-contain opacity-80 grayscale" />
                  </div>
               </div>

               {/* Center Information Block */}
               <div className="flex-1 flex flex-col pt-6">
                  <div className="text-center space-y-1 mb-16">
                     <p className="text-[24px] font-black text-[#006400] tracking-tight leading-none uppercase">Registered by Govt. of India NITI Aayog</p>
                     <p className="text-[24px] font-black text-[#006400] tracking-tight leading-none uppercase">Regd.No. - WB/2025/0762605</p>
                  </div>

                  <div className="space-y-2">
                     <h2 className="text-[44px] font-black text-slate-900 leading-[1.1] uppercase tracking-tighter drop-shadow-sm">{member.name}</h2>
                     <p className="text-[18px] font-black text-[#006400] uppercase tracking-wide border-l-4 border-[#006400] pl-4">
                        {member.designation} ({member.stateName?.toUpperCase() || 'WEST BENGAL'} STATE COMMITTEE)
                     </p>
                  </div>
               </div>

               {/* Right Side: QR & Dates */}
               <div className="w-52 flex flex-col items-end pt-2 space-y-6">
                  <div className="text-right">
                    <p className="text-[16px] font-black text-[#001f54] font-mono mb-2 tracking-widest">{member.memberId || 'WB25LA09531'}</p>
                    <div className="relative w-32 h-32 bg-white border-2 border-slate-100 p-1.5 rounded-2xl shadow-xl hover:scale-105 transition-transform">
                       <Image 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HRAT-VERIFY-${member.memberId}`} 
                        alt="Verification QR" 
                        fill 
                        className="object-contain"
                       />
                    </div>
                  </div>
                  
                  <div className="text-[14px] font-bold text-slate-800 space-y-1 leading-tight pr-1 font-mono">
                     <div className="flex justify-end gap-3">
                        <span className="text-slate-400">Issue :</span> 
                        <span className="text-primary">{member.joiningDate || '01.05.2025'}</span>
                     </div>
                     <div className="flex justify-end gap-3">
                        <span className="text-slate-400">Expire :</span> 
                        <span className="text-[#c91010]">{member.expiryDate || '01.05.2028'}</span>
                     </div>
                     <div className="flex justify-end gap-3">
                        <span className="text-slate-400">Mobile :</span> 
                        <span className="text-primary">+91 {member.phone?.slice(0, 5)}XXXXX</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer Banner */}
            <div className="absolute bottom-0 left-0 w-full h-[65px] bg-[#001f54] flex items-center px-10 text-white border-t-[4px] border-white/10">
               {/* Suffix Red Slant */}
               <div className="absolute left-0 top-0 h-full w-28 bg-[#c91010] skew-x-[38deg] -translate-x-1/2 border-r-[5px] border-white shadow-lg"></div>
               
               <div className="flex items-center gap-3 relative z-10 mr-auto ml-12">
                  <div className="bg-white rounded-full p-1.5 shadow-md">
                    <Mail className="w-4 h-4 text-[#c91010] fill-[#c91010]" />
                  </div>
                  <span className="text-[16px] font-black tracking-tight text-slate-50">humanrightsaffairstrust@gmail.com</span>
               </div>

               <div className="flex items-center gap-3 relative z-10">
                  <div className="bg-white rounded-full p-1.5 shadow-md">
                    <Globe className="w-4 h-4 text-[#001f54]" />
                  </div>
                  <span className="text-[16px] font-black tracking-tight text-slate-50">www.humanrightsaffairs.org</span>
               </div>
            </div>
          </div>

          {/* BACK SIDE - DUMMY WITH PROFESSIONAL LAYOUT */}
          <div className={cn(
            "relative w-[800px] h-[500px] bg-[#f8fafc] rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200 print:shadow-none print:border-slate-300 transition-all duration-500",
            view !== 'back' && "hidden print:block"
          )}>
            <div className="h-5 bg-[#c91010] w-full shadow-sm"></div>
            <div className="p-12 flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]">
               <div className="flex justify-between items-start mb-10">
                  <div className="space-y-6">
                     <h3 className="text-[28px] font-black text-[#001f54] uppercase tracking-tighter border-b-[4px] border-accent w-fit pb-1">Organizational Mandate</h3>
                     <ul className="space-y-3 text-[14px] font-bold text-slate-600 list-disc pl-6 max-w-lg leading-relaxed italic">
                        <li>This card is for official identification purposes only.</li>
                        <li>Representation without valid authorization is a punishable offense.</li>
                        <li>Misuse of organizational branding is strictly prohibited under Indian law.</li>
                        <li>Report loss of card to the National HQ immediately.</li>
                     </ul>
                  </div>
                  <div className="text-right">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">Institutional Seal</p>
                     <div className="w-44 h-20 border-[3px] border-dashed border-slate-200 bg-white/60 rounded-2xl flex items-center justify-center shadow-inner">
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Manual Stamp</span>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-10 mt-auto pb-16">
                  <div className="space-y-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                     <p className="text-[12px] font-black text-accent uppercase tracking-[0.15em] flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> National Head Office
                     </p>
                     <p className="text-[14px] font-bold text-slate-700 leading-tight">
                        9567, Tokri Walan Azad Market, Delhi. <br /> Pin - 110006
                     </p>
                  </div>
                  <div className="space-y-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                     <p className="text-[12px] font-black text-accent uppercase tracking-[0.15em] flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> State Office (WB)
                     </p>
                     <p className="text-[14px] font-bold text-slate-700 leading-tight">
                        Deganga, North 24 Parganas, WB - 743423
                     </p>
                  </div>
               </div>

               <div className="flex justify-between items-end border-t-2 border-slate-100 pt-8 mt-4">
                  <div className="flex items-center gap-5 opacity-50">
                     <div className="relative w-14 h-14 grayscale hover:grayscale-0 transition-all duration-500">
                        <Image src="/HRAT%20Logo.jpeg" alt="Seal" fill className="object-contain" />
                     </div>
                     <p className="text-[10px] font-black uppercase max-w-[180px] text-slate-500 leading-tight tracking-wider">
                        Human Rights Affairs Trust (INDIA)
                     </p>
                  </div>
                  <div className="text-right">
                     <div className="h-12 border-b-[3px] border-slate-300 w-56 ml-auto mb-2"></div>
                     <p className="text-[18px] font-black text-[#001f54] uppercase tracking-tighter leading-none">Central Chairman</p>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorized Signatory</p>
                  </div>
               </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-5 bg-[#001f54] shadow-sm"></div>
          </div>
        </div>

        {/* Security Validation Disclaimer */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 print:hidden text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden mt-6">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
           <ShieldCheck className="w-14 h-14 text-accent mx-auto mb-6 drop-shadow-xl animate-float" />
           <h3 className="font-headline font-bold text-2xl mb-3 text-primary">High-Fidelity Verified Identity</h3>
           <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
             This layout is optimized for **Industrial PVC Card Printing (85.6mm x 53.98mm)**. 
             The typography and slanted header branding are locked for organizational consistency.
           </p>
           <div className="flex flex-col gap-3">
             <div className="flex items-center gap-3 text-[11px] font-bold text-emerald-600 uppercase justify-center bg-emerald-50 py-2.5 rounded-xl border border-emerald-100 shadow-sm">
               <BadgeCheck className="w-5 h-5 text-emerald-500" /> NITI Aayog Verified Credentials & 80G Compliant
             </div>
           </div>
        </div>

      </div>
    </main>
  )
}
