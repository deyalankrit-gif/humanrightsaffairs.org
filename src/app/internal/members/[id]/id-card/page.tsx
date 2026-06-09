"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft, Download, Mail, Globe, Phone, MapPin, Hash, ShieldCheck, BadgeCheck } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

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
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-bold uppercase text-xs tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Button>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border">
            <Button 
              variant={view === 'front' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('front')}
              className="rounded-lg text-xs font-bold"
            >
              Front Side
            </Button>
            <Button 
              variant={view === 'back' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('back')}
              className="rounded-lg text-xs font-bold"
            >
              Back Side
            </Button>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleDownload} variant="outline" className="border-primary text-primary font-bold h-12 rounded-xl gap-2">
              <Download className="w-4 h-4" /> Save PDF
            </Button>
            <Button onClick={handlePrint} className="bg-primary text-white font-bold h-12 rounded-xl gap-2 shadow-xl shadow-primary/20">
              <Printer className="w-4 h-4" /> Print Card
            </Button>
          </div>
        </div>

        {/* High-Fidelity ID Card Layout */}
        <div className="w-full flex flex-col items-center gap-20 print:gap-10">
          
          {/* FRONT SIDE */}
          <div className={cn(
            "relative w-[800px] h-[500px] bg-white rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-200 print:shadow-none print:border-slate-300 transition-all duration-500",
            view !== 'front' && "hidden print:block"
          )}>
            {/* Header Section */}
            <div className="h-[90px] flex">
              <div className="w-[45%] bg-[#001f54] text-white flex items-center px-6 relative">
                 <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Human Rights</h1>
                 <div className="absolute right-0 top-0 h-full w-12 bg-[#001f54] skew-x-[-20deg] translate-x-1/2 z-10"></div>
              </div>
              <div className="flex-1 bg-[#c91010] text-white flex items-center px-16 relative">
                 <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Affair Trust</h1>
                 <div className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full p-1 shadow-xl z-20">
                    <Image src="/HRAT%20Logo.jpeg" alt="Logo" fill className="object-contain p-1" />
                 </div>
              </div>
            </div>

            {/* Member ID Watermark Top Left */}
            <div className="absolute top-28 left-8">
               <span className="text-4xl font-black text-[#001f54] tracking-tight">{member.memberId || 'WB25LA09531'}</span>
            </div>

            <div className="flex px-8 mt-12 gap-10">
               {/* Left: Portrait */}
               <div className="relative w-56 h-[260px] rounded-2xl overflow-hidden border-[6px] border-white shadow-2xl bg-slate-100 mt-4">
                  <Image src={displayImg} alt={member.name} fill className="object-cover" />
                  {/* Security Overlay Logo */}
                  <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md p-1 border border-white/50">
                    <Image src="/HRAT%20Logo.jpeg" alt="Seal" fill className="object-contain p-0.5 opacity-80" />
                  </div>
               </div>

               {/* Right: Info Body */}
               <div className="flex-1 flex flex-col pt-10">
                  <div className="text-center space-y-1 mb-8">
                     <p className="text-2xl font-black text-[#006400] tracking-tight">Registered by Govt. of India NITI Aayog</p>
                     <p className="text-2xl font-black text-[#006400] tracking-tight">Regd.No. - WB/2025/0762605</p>
                  </div>

                  <div className="space-y-1">
                     <h2 className="text-4xl font-black text-slate-900 leading-none uppercase">{member.name}</h2>
                     <p className="text-lg font-black text-[#006400] uppercase tracking-wide">
                        {member.designation} ({member.stateName?.toUpperCase() || 'NATIONAL'} STATE COMMITTEE)
                     </p>
                  </div>
               </div>

               {/* Right Edge: QR & Dates */}
               <div className="w-48 flex flex-col items-end pt-12 space-y-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#001f54] uppercase mb-1">{member.memberId || 'WB25LA09531'}</p>
                    <div className="relative w-28 h-28 bg-white border border-slate-200 p-1.5 rounded-lg shadow-md">
                       <Image 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HRAT-MEMBER-${member.memberId}`} 
                        alt="Verification QR" 
                        fill 
                        className="object-contain"
                       />
                    </div>
                  </div>
                  
                  <div className="text-[14px] font-black text-slate-900 space-y-0.5 leading-none pr-2">
                     <p className="flex justify-between gap-4"><span>Issue</span> : <span>{member.joiningDate || '01.05.2025'}</span></p>
                     <p className="flex justify-between gap-4"><span>Expire</span> : <span>{member.expiryDate || '01.05.2028'}</span></p>
                     <p className="flex justify-between gap-4 whitespace-nowrap"><span>Mobile No</span> : <span>+91 {member.phone?.slice(0, 5)}XXXXX</span></p>
                  </div>
               </div>
            </div>

            {/* Footer Banner */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-[#001f54] flex items-center px-8 text-white">
               {/* Red decorative slant on bottom left */}
               <div className="absolute left-0 top-0 h-full w-24 bg-[#c91010] skew-x-[30deg] -translate-x-1/2"></div>
               
               <div className="flex items-center gap-3 relative z-10 mr-auto ml-4">
                  <div className="bg-white rounded-full p-1">
                    <Mail className="w-3.5 h-3.5 text-[#c91010] fill-[#c91010]" />
                  </div>
                  <span className="text-[14px] font-black tracking-tight">humanrightsaffairstrust@gmail.com</span>
               </div>

               <div className="flex items-center gap-3 relative z-10">
                  <div className="bg-white rounded-full p-1">
                    <Globe className="w-3.5 h-3.5 text-[#001f54]" />
                  </div>
                  <span className="text-[14px] font-black tracking-tight">www.humanrightsaffairs.org</span>
               </div>
            </div>
          </div>

          {/* BACK SIDE (DUMMY) */}
          <div className={cn(
            "relative w-[800px] h-[500px] bg-[#f8fafc] rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-200 print:shadow-none print:border-slate-300 transition-all duration-500",
            view !== 'back' && "hidden print:block"
          )}>
            <div className="h-4 bg-[#c91010] w-full"></div>
            <div className="p-10 flex flex-col h-full">
               <div className="flex justify-between items-start mb-8">
                  <div className="space-y-4">
                     <h3 className="text-2xl font-black text-[#001f54] uppercase tracking-tighter border-b-2 border-accent w-fit pb-1">Organizational Mandate</h3>
                     <ul className="space-y-2 text-[12px] font-bold text-slate-600 list-disc pl-5 max-w-md">
                        <li>This card is for official identification purposes only.</li>
                        <li>Misuse of organizational logos or representing the trust without authorization is a punishable offense.</li>
                        <li>In case of loss, please report to the National Office immediately.</li>
                        <li>This membership is valid across all Indian states and Union Territories.</li>
                     </ul>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Member Signature</p>
                     <div className="w-40 h-16 border-2 border-dashed border-slate-200 bg-white rounded-xl"></div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-10 mt-auto pb-12">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> National Head Office
                     </p>
                     <p className="text-[11px] font-bold text-slate-700 leading-tight">
                        9567, Tokri Walan Azad Market, Delhi. <br /> Pin - 110006
                     </p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> State Head Office (WB)
                     </p>
                     <p className="text-[11px] font-bold text-slate-700 leading-tight">
                        Vill - Biswanathpur, P.O. - Ramnathpur, P.S. - Deganga, Dist - North 24 Parganas, WB - 743423
                     </p>
                  </div>
               </div>

               <div className="flex justify-between items-end border-t-2 border-slate-100 pt-6 mt-4">
                  <div className="flex items-center gap-4 opacity-40">
                     <div className="relative w-14 h-14 grayscale">
                        <Image src="/HRAT%20Logo.jpeg" alt="Seal" fill className="object-contain" />
                     </div>
                     <p className="text-[9px] font-black uppercase max-w-[100px] text-slate-400">Human Rights Affairs Trust (INDIA)</p>
                  </div>
                  <div className="text-right">
                     <div className="h-10 border-b-2 border-slate-200 w-48 ml-auto mb-2"></div>
                     <p className="text-sm font-black text-[#001f54] uppercase tracking-tighter">Central Chairman</p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorized Signatory</p>
                  </div>
               </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-4 bg-[#001f54]"></div>
          </div>

        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 print:hidden text-center max-w-lg mx-auto shadow-sm mt-8">
           <ShieldCheck className="w-12 h-12 text-accent mx-auto mb-4" />
           <h3 className="font-headline font-bold text-xl mb-2">Authenticated Digital Card</h3>
           <p className="text-slate-500 text-sm mb-6 leading-relaxed">
             This digital ID card is an official document of the Human Rights Affairs Trust. For physical issuance, please print this layout on high-quality PVC or 300GSM card stock.
           </p>
           <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase justify-center">
               <BadgeCheck className="w-4 h-4 text-emerald-500" /> NITI Aayog Verified Credentials
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase justify-center">
               <BadgeCheck className="w-4 h-4 text-emerald-500" /> Secure QR Verification Linked
             </div>
           </div>
        </div>

      </div>
    </main>
  )
}
