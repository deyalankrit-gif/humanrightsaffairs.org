"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft, Download, Mail, Globe, MapPin, ShieldCheck, BadgeCheck, X, Heart, Phone, ZoomIn, ZoomOut } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * IDCardGenerator produces a high-fidelity digital ID card using all available
 * member details, matching the HRAT institutional branding precisely.
 * Responsive Update: Uses overflow-x-auto to protect the fixed layout on mobile.
 */
export default function IDCardGenerator() {
  const { id } = useParams()
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [view, setView] = useState<'front' | 'back'>('front')
  const [scale, setScale] = useState(1)

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

  // Adjust initial scale for mobile devices
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 850) {
        setScale(Math.max(0.4, window.innerWidth / 900));
      } else {
        setScale(1);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white flex flex-col items-center overflow-x-hidden">
      <div className="max-w-4xl w-full flex flex-col gap-6 md:gap-8 print:gap-0">
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white flex flex-col items-center overflow-x-hidden">
      <div className="max-w-4xl w-full flex flex-col gap-6 md:gap-8 print:gap-0">
        
        <div className="flex flex-col md:flex-row items-center justify-between print:hidden gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-bold uppercase text-[10px] tracking-widest text-slate-500 hover:text-primary transition-colors w-full md:w-auto justify-start">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto justify-center">
            <Button 
              variant={view === 'front' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('front')}
              className="rounded-xl text-[10px] font-bold px-4 md:px-6 h-8 flex-1 md:flex-none"
            >
              Front
            </Button>
            <Button 
              variant={view === 'back' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('back')}
              className="rounded-xl text-[10px] font-bold px-4 md:px-6 h-8 flex-1 md:flex-none"
            >
              Back
            </Button>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={handleDownload} variant="outline" className="flex-1 md:flex-none border-slate-200 text-slate-600 font-bold h-10 rounded-xl gap-2 text-xs">
              <Download className="w-3.5 h-3.5" /> Save
            </Button>
            <Button onClick={handlePrint} className="flex-1 md:flex-none bg-primary text-white font-bold h-10 rounded-xl gap-2 shadow-xl shadow-primary/20 text-xs">
              <Printer className="w-3.5 h-3.5" /> Print
            </Button>
          </div>
        </div>

        {/* Scalable Container for Mobile View */}
        <div className="w-full overflow-x-auto no-scrollbar pb-10 flex flex-col items-center gap-8 print:gap-8 print:py-10">
          
          {/* FRONT SIDE */}
          <div className={cn(
            "relative w-[800px] h-[500px] bg-white rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 print:shadow-none print:border-2 print:border-slate-300 transition-all duration-500 select-none shrink-0 origin-top",
            view !== 'front' && "hidden print:block"
          )}>
            {/* Header Section with Slanted Division */}
            <div className="h-[100px] w-full flex relative overflow-hidden">
              <div className="absolute inset-0 bg-[#001f54]"></div>
              <div 
                className="absolute right-0 top-0 h-full w-[65%] bg-[#c91010]" 
                style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
              ></div>
              
              <div className="relative z-20 w-full h-full flex items-center px-10">
                <h1 className="text-[36px] font-black italic tracking-tighter uppercase leading-none text-white drop-shadow-lg whitespace-nowrap">
                  HUMAN RIGHTS AFFAIRS TRUST
                </h1>
                
                {/* Framed Logo with Authority Ring */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full p-0.5 border-2 border-[#D4AF37] shadow-2xl z-30 flex items-center justify-center">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image src="/HRAT%20Logo.jpeg" alt="Logo" fill className="object-contain" />
                  </div>
                </div>
              </div>
            </div>

              <div className="absolute top-[110px] left-10">
                 <span className="text-[28px] font-black text-[#001f54] tracking-tighter uppercase opacity-20">{member.memberId}</span>
              </div>

              <div className="flex px-10 mt-24 gap-10">
                 <div className="relative w-48 h-[220px] rounded-[2rem] overflow-hidden border-[6px] border-slate-50 shadow-2xl bg-slate-100 ring-1 ring-slate-200 shrink-0">
                    <Image src={displayImg} alt={member.name} fill className="object-cover" />
                    <div className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-white/40 backdrop-blur-lg p-1 border-2 border-white/60 z-20 overflow-hidden">
                      <div className="relative w-full h-full">
                        <Image src="/HRAT%20Logo.jpeg" alt="Hologram" fill className="object-contain opacity-80 brightness-110" />
                      </div>
                    </div>
                 </div>

                 <div className="flex-1 flex flex-col pt-2">
                    <div className="text-center space-y-1 mb-8">
                       <p className="text-[22px] font-black text-[#006400] tracking-tight leading-none uppercase">Registered by Govt. of India NITI Aayog</p>
                       <a href="https://ngodarpan.gov.in/#/search-ngo" target="_blank" rel="noopener noreferrer" className="text-[15px] font-black text-[#006400] tracking-tight leading-none uppercase hover:underline decoration-[#006400]/50 underline-offset-4">Regd.No. - WB/2025/0762605</a>
                    </div>

                    <div className="space-y-1.5">
                       <h2 className="text-[22px] font-black text-slate-900 leading-tight uppercase tracking-tighter drop-shadow-sm whitespace-nowrap truncate">
                         {member.name}
                       </h2>
                       <p className="text-[14px] font-black text-[#006400] uppercase tracking-wide border-l-4 border-[#006400] pl-4">
                          {member.designation} ({member.level === 'District' ? member.districtName?.toUpperCase() : member.stateName?.toUpperCase() || 'WEST BENGAL'} {member.level?.toUpperCase()} COMMITTEE)
                       </p>
                    </div>
                 </div>

                 <div className="w-52 flex flex-col items-end pt-2 space-y-6">
                    <div className="text-right">
                      <p className="text-[13px] font-black text-[#001f54] font-mono mb-2 tracking-widest">{member.memberId}</p>
                      <div className="relative w-26 h-26 bg-white border-2 border-slate-100 p-1 rounded-2xl shadow-xl">
                         <Image 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HRAT-VERIFY-${member.memberId}`} 
                          alt="Verification QR" 
                          width={100}
                          height={100}
                          className="object-contain"
                         />
                      </div>
                    </div>
                    
                    <div className="text-[13px] font-bold text-slate-800 space-y-1 leading-tight pr-1 font-mono">
                       <div className="flex justify-end gap-3">
                          <span className="text-slate-400">Issue :</span> <span className="text-primary">{member.joiningDate}</span>
                       </div>
                       <div className="flex justify-end gap-3">
                          <span className="text-slate-400">Expire :</span> <span className="text-[#c91010]">{member.expiryDate}</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-[65px] overflow-hidden">
                 <div className="absolute inset-0 bg-[#001f54]"></div>
                 <div 
                   className="absolute right-0 top-0 h-full w-[55%] bg-[#c91010]" 
                   style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}
                 ></div>
                 <div className="relative z-20 w-full h-full flex items-center text-white text-[16px] font-bold">
                    <div className="flex items-center justify-center w-1/2 gap-2">humanrightsaffairstrust@gmail.com</div>
                    <div className="flex items-center justify-center w-1/2 gap-2 pl-10">www.humanrightsaffairs.org</div>
                 </div>
              </div>
            </div>

          {/* BACK SIDE */}
          <div className={cn(
            "relative w-[800px] h-[500px] bg-[#f8fafc] rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200 print:shadow-none print:border-2 print:border-slate-300 transition-all duration-500 shrink-0 origin-top",
            view !== 'back' && "hidden print:block"
          )}>
            <div className="h-5 bg-[#c91010] w-full shadow-sm"></div>
            <div className="p-10 flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]">
               <div className="flex justify-between items-start mb-8">
                  <div className="space-y-4">
                     <h3 className="text-[28px] font-black text-[#001f54] uppercase tracking-tighter border-b-[4px] border-accent w-fit pb-1">Personnel Information</h3>
                     <div className="space-y-2 bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm max-w-lg">
                        <div className="flex gap-3">
                           <MapPin className="w-4 h-4 text-accent shrink-0 mt-1" />
                           <p className="text-[14px] font-bold text-slate-700 leading-relaxed">
                              {member.address}<br />
                              P.O: {member.postOffice}, P.S: {member.policeStation}<br />
                              Pin Code: {member.pinCode}
                           </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 mt-2">
                           <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-accent shrink-0" />
                              <p className="text-[14px] font-bold text-slate-700">{member.phone}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                              <p className="text-[14px] font-bold text-slate-700">Blood Group: <span className="text-red-600 font-black">{member.bloodGroup || 'N/A'}</span></p>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">Organizational Seal</p>
                     <div className="w-44 h-24 border-[3px] border-dashed border-slate-200 bg-white/60 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden relative">
                        <div className="relative w-16 h-16 opacity-10">
                           <Image src="/HRAT%20Logo.jpeg" alt="HRAT Seal" fill className="object-contain grayscale" />
                        </div>
                        <span className="absolute text-[10px] text-slate-300 font-bold uppercase tracking-widest">Digital Stamp</span>
                     </div>
                  </div>
               </div>

                 <div className="grid grid-cols-2 gap-10 mt-auto pb-12">
                    <div className="p-5 bg-white border border-slate-100 rounded-2xl text-[13px] font-bold">
                       <p className="text-accent uppercase mb-1">National Head Office</p>
                       <p className="text-slate-700">9567, Tokri Walan Azad Market, Delhi. Pin - 110006</p>
                    </div>
                    <div className="p-5 bg-white border border-slate-100 rounded-2xl text-[13px] font-bold">
                       <p className="text-accent uppercase mb-1">State Office (WB)</p>
                       <p className="text-slate-700">Biswanathpur, PO-Ramnathpur, P.S. Deganga, North 24 Parganas, WB - 743423</p>
                    </div>
                 </div>

                 <div className="flex justify-between items-end border-t-2 border-slate-100 pt-6">
                    <p className="text-[10px] font-black uppercase text-slate-500 opacity-50">Human Rights Affairs Trust (INDIA)</p>
                    <div className="text-right">
                       <div className="h-10 border-b-[3px] border-slate-300 w-56 ml-auto mb-1"></div>
                       <p className="text-[18px] font-black text-[#001f54] uppercase leading-none">Central Chairman</p>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>

        {/* Security Validation Disclaimer */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 print:hidden text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
           <ShieldCheck className="w-10 h-10 md:w-14 md:h-14 text-accent mx-auto mb-4 md:mb-6 drop-shadow-xl animate-float" />
           <h3 className="font-headline font-bold text-xl md:text-2xl mb-2 md:mb-3 text-primary">High-Fidelity Verified Identity</h3>
           <p className="text-slate-500 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed font-medium">
             This identity record for <strong>{member.name}</strong> is generated using verified credentials. 
             Optimized for **Industrial PVC Card Printing** (85.6mm x 53.98mm).
           </p>
           <div className="flex flex-col sm:flex-row items-center gap-3 text-[10px] md:text-[11px] font-bold text-emerald-600 uppercase justify-center bg-emerald-50 py-2.5 px-4 rounded-xl border border-emerald-100 shadow-sm">
             <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" /> NITI Aayog Verified Credentials & <a href="https://ngodarpan.gov.in/#/search-ngo" target="_blank" rel="noopener noreferrer" className="hover:underline">80G Compliant</a>
           </div>
        </div>

      </div>
    </main>
  )
}
