"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft, Download, Mail, Globe, Phone, MapPin, ShieldCheck, BadgeCheck, X } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * IDCardGenerator produces a high-fidelity, printable ID card
 * based on the member's verified profile data.
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
          
          {/* FRONT SIDE */}
          <div className={cn(
            "relative w-[800px] h-[500px] bg-white rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 print:shadow-none print:border-slate-200 transition-all duration-500 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]",
            view !== 'front' && "hidden print:block"
          )}>
            {/* Professional Slanted Header */}
            <div className="h-[100px] flex relative">
              <div className="w-[45%] bg-[#001f54] text-white flex items-center px-8 relative overflow-hidden">
                 <h1 className="text-[42px] font-black italic tracking-tighter uppercase leading-none z-10">Human Rights</h1>
                 <div className="absolute right-0 top-0 h-full w-16 bg-[#001f54] skew-x-[-25deg] translate-x-1/2 border-r-[6px] border-white z-10"></div>
              </div>
              <div className="flex-1 bg-[#c91010] text-white flex items-center px-16 relative">
                 <h1 className="text-[42px] font-black italic tracking-tighter uppercase leading-none z-0">Affairs Trust</h1>
                 {/* High-Contrast Seal */}
                 <div className="absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full p-1.5 shadow-2xl z-30 border-[4px] border-white ring-4 ring-black/5">
                    <Image src="/HRAT%20Logo.jpeg" alt="Logo" fill className="object-contain p-1 rounded-full" />
                 </div>
              </div>
            </div>

            {/* Member ID Watermark (Strategic Positioning) */}
            <div className="absolute top-[120px] left-10">
               <span className="text-[48px] font-black text-[#001f54]/90 tracking-tighter font-headline drop-shadow-sm">{member.memberId || 'WB25LA09531'}</span>
            </div>

            <div className="flex px-10 mt-16 gap-12">
               {/* Portrait Section with Rounded Frame & Security Mark */}
               <div className="relative w-56 h-[280px] rounded-3xl overflow-hidden border-[8px] border-white shadow-2xl bg-slate-50 mt-2 ring-1 ring-slate-200">
                  <Image src={displayImg} alt={member.name} fill className="object-cover" />
                  <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white/40 backdrop-blur-md p-1.5 border border-white/60 shadow-lg">
                    <Image src="/HRAT%20Logo.jpeg" alt="Watermark" fill className="object-contain p-0.5 opacity-60 grayscale" />
                  </div>
               </div>

               {/* Center Information Block */}
               <div className="flex-1 flex flex-col pt-4">
                  <div className="text-center space-y-0.5 mb-10">
                     <p className="text-[26px] font-black text-[#006400] tracking-tight leading-none uppercase">Registered by Govt. of India NITI Aayog</p>
                     <p className="text-[26px] font-black text-[#006400] tracking-tight leading-none uppercase">Regd.No. - WB/2025/0762605</p>
                  </div>

                  <div className="space-y-2">
                     <h2 className="text-[52px] font-black text-slate-900 leading-none uppercase tracking-tighter">{member.name}</h2>
                     <div className="flex items-center gap-3">
                        <div className="h-1 flex-1 bg-[#006400]/20 rounded-full"></div>
                        <p className="text-[20px] font-black text-[#006400] uppercase tracking-wide whitespace-nowrap">
                            {member.designation}
                        </p>
                        <div className="h-1 flex-1 bg-[#006400]/20 rounded-full"></div>
                     </div>
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] text-center">
                        {member.stateName?.toUpperCase() || 'NATIONAL'} STATE COMMITTEE
                     </p>
                  </div>
               </div>

               {/* Right Side: QR & Status Block */}
               <div className="w-52 flex flex-col items-end pt-4 space-y-6">
                  <div className="text-right">
                    <div className="relative w-32 h-32 bg-white border-2 border-slate-100 p-2 rounded-2xl shadow-xl group hover:scale-105 transition-transform">
                       <Image 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HRAT-VERIFY-MEMBER-${member.memberId}`} 
                        alt="Verification QR" 
                        fill 
                        className="object-contain"
                       />
                    </div>
                  </div>
                  
                  <div className="text-[15px] font-black text-slate-800 space-y-1 leading-tight pr-2 w-full font-mono">
                     <div className="flex justify-between gap-4 border-b border-slate-100 pb-1">
                        <span className="text-slate-400 uppercase text-[10px]">Issue</span> 
                        <span>{member.joiningDate || '01.05.2025'}</span>
                     </div>
                     <div className="flex justify-between gap-4 border-b border-slate-100 pb-1">
                        <span className="text-slate-400 uppercase text-[10px]">Expire</span> 
                        <span className="text-red-600">{member.expiryDate || '01.05.2028'}</span>
                     </div>
                     <div className="flex justify-between gap-4 pt-1">
                        <span className="text-slate-400 uppercase text-[10px]">Mobile</span> 
                        <span>+91 {member.phone?.slice(0, 5)}XXXXX</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* High-Fidelity Footer Banner */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-[#001f54] flex items-center px-10 text-white border-t-[4px] border-white/10">
               <div className="absolute left-0 top-0 h-full w-32 bg-[#c91010] skew-x-[35deg] -translate-x-1/2 border-r-[6px] border-white"></div>
               
               <div className="flex items-center gap-4 relative z-10 mr-auto ml-8">
                  <div className="bg-white rounded-full p-1.5 shadow-lg">
                    <Mail className="w-4 h-4 text-[#c91010] fill-[#c91010]" />
                  </div>
                  <span className="text-[15px] font-black tracking-tight">humanrightsaffairstrust@gmail.com</span>
               </div>

               <div className="flex items-center gap-4 relative z-10">
                  <div className="bg-white rounded-full p-1.5 shadow-lg">
                    <Globe className="w-4 h-4 text-[#001f54]" />
                  </div>
                  <span className="text-[15px] font-black tracking-tight">www.humanrightsaffairs.org</span>
               </div>
            </div>
          </div>

          {/* BACK SIDE (DUMMY) - Institutional Mandate */}
          <div className={cn(
            "relative w-[800px] h-[500px] bg-[#fdfdfd] rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200 print:shadow-none print:border-slate-300 transition-all duration-500",
            view !== 'back' && "hidden print:block"
          )}>
            <div className="h-6 bg-[#c91010] w-full"></div>
            <div className="p-12 flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]">
               <div className="flex justify-between items-start mb-10">
                  <div className="space-y-6">
                     <h3 className="text-[28px] font-black text-[#001f54] uppercase tracking-tighter border-b-[4px] border-accent w-fit pb-1">Organizational Mandate</h3>
                     <ul className="space-y-3 text-[14px] font-bold text-slate-600 list-disc pl-6 max-w-lg leading-relaxed">
                        <li>This card is for official identification purposes only.</li>
                        <li>Misuse of organizational logos or representing the trust without authorization is a punishable offense under Indian Law.</li>
                        <li>In case of loss, please report to the National HQ or the nearest State Office immediately.</li>
                        <li>This membership is valid across all Indian states and Union Territories for the specified term duration.</li>
                     </ul>
                  </div>
                  <div className="text-right">
                     <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Authorized Signature</p>
                     <div className="w-48 h-20 border-[3px] border-dashed border-slate-200 bg-white/50 rounded-2xl flex items-center justify-center">
                        <span className="text-[10px] text-slate-200 font-bold uppercase">Manual Seal</span>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-12 mt-auto pb-16">
                  <div className="space-y-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                     <p className="text-[12px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> National Head Office
                     </p>
                     <p className="text-[13px] font-bold text-slate-700 leading-tight">
                        9567, Tokri Walan Azad Market, Delhi. <br /> Pin - 110006
                     </p>
                  </div>
                  <div className="space-y-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                     <p className="text-[12px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> State Head Office (WB)
                     </p>
                     <p className="text-[13px] font-bold text-slate-700 leading-tight">
                        Deganga, North 24 Parganas, WB - 743423
                     </p>
                  </div>
               </div>

               <div className="flex justify-between items-end border-t-2 border-slate-100 pt-8 mt-6">
                  <div className="flex items-center gap-5 opacity-50">
                     <div className="relative w-16 h-16 grayscale">
                        <Image src="/HRAT%20Logo.jpeg" alt="Seal" fill className="object-contain" />
                     </div>
                     <p className="text-[10px] font-black uppercase max-w-[150px] text-slate-400 leading-tight">Human Rights Affairs Trust (INDIA)</p>
                  </div>
                  <div className="text-right">
                     <div className="h-12 border-b-[3px] border-slate-200 w-56 ml-auto mb-2"></div>
                     <p className="text-[18px] font-black text-[#001f54] uppercase tracking-tighter">Central Chairman</p>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorized Official Signatory</p>
                  </div>
               </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-6 bg-[#001f54]"></div>
          </div>
        </div>

        {/* Security Validation Disclaimer */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 print:hidden text-center max-w-xl mx-auto shadow-xl relative overflow-hidden mt-8">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16"></div>
           <ShieldCheck className="w-14 h-14 text-accent mx-auto mb-6 drop-shadow-lg" />
           <h3 className="font-headline font-bold text-2xl mb-3 text-primary">Authenticated Digital Identity</h3>
           <p className="text-slate-500 text-base mb-8 leading-relaxed">
             This digital ID card is an official document of the Human Rights Affairs Trust. For physical issuance, please print this layout on <strong>high-quality PVC</strong> or <strong>300GSM card stock</strong>.
           </p>
           <div className="flex flex-col gap-3">
             <div className="flex items-center gap-3 text-xs font-bold text-emerald-600 uppercase justify-center bg-emerald-50 py-2 rounded-xl border border-emerald-100">
               <BadgeCheck className="w-5 h-5 text-emerald-500" /> NITI Aayog Verified Credentials
             </div>
             <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase justify-center border border-slate-100 py-2 rounded-xl">
               <BadgeCheck className="w-5 h-5 text-emerald-500" /> Secure Live QR Verification Linked
             </div>
           </div>
        </div>

      </div>
    </main>
  )
}
