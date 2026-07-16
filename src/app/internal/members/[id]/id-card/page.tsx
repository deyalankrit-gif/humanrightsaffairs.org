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
 * Updated to support stacked print layout and responsive scaling for mobile preview.
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
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-bold uppercase text-[10px] tracking-widest text-slate-500 hover:text-primary transition-colors self-start md:self-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Button>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto justify-center">
            <Button 
              variant={view === 'front' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('front')}
              className="rounded-xl text-[10px] font-bold px-4 md:px-6 h-8 flex-1 md:flex-none"
            >
              Front Side
            </Button>
            <Button 
              variant={view === 'back' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('back')}
              className="rounded-xl text-[10px] font-bold px-4 md:px-6 h-8 flex-1 md:flex-none"
            >
              Back Side
            </Button>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={handleDownload} variant="outline" className="flex-1 md:flex-none border-slate-200 text-slate-600 font-bold h-10 rounded-xl gap-2 text-xs">
              <Download className="w-3.5 h-3.5" /> Save PDF
            </Button>
            <Button onClick={handlePrint} className="flex-1 md:flex-none bg-primary text-white font-bold h-10 rounded-xl gap-2 shadow-xl shadow-primary/20 text-xs">
              <Printer className="w-3.5 h-3.5" /> Print Card
            </Button>
          </div>
        </div>

        {/* Zoom Controls for Mobile Preview */}
        <div className="flex justify-center gap-4 print:hidden">
          <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.max(0.3, prev - 0.1))} className="rounded-full h-8 w-8 p-0">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-[10px] font-bold text-slate-400 self-center uppercase tracking-widest">{Math.round(scale * 100)}% Preview</span>
          <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.min(1.5, prev + 0.1))} className="rounded-full h-8 w-8 p-0">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* Card Canvas - Scalable Container */}
        <div className="w-full overflow-x-auto no-scrollbar py-10 flex flex-col items-center print:overflow-visible print:py-0">
          <div 
            className="transition-transform origin-top flex flex-col items-center gap-12 print:gap-8 print:py-10 print:scale-100"
            style={{ transform: `scale(${scale})` }}
          >
            
            {/* FRONT SIDE */}
            <div className={cn(
              "relative w-[800px] h-[500px] bg-white rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 print:shadow-none print:border-2 print:border-slate-300 select-none shrink-0",
              view !== 'front' && "hidden print:block"
            )}>
              {/* Header Section */}
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
              "relative w-[800px] h-[500px] bg-[#f8fafc] rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200 print:shadow-none print:border-2 print:border-slate-300 shrink-0",
              view !== 'back' && "hidden print:block"
            )}>
              <div className="h-5 bg-[#c91010] w-full"></div>
              <div className="p-10 flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]">
                 <div className="flex justify-between items-start mb-8">
                    <div className="space-y-4">
                       <h3 className="text-[28px] font-black text-[#001f54] uppercase tracking-tighter border-b-[4px] border-accent w-fit pb-1">Personnel Information</h3>
                       <div className="space-y-2 bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm max-w-lg text-[14px] font-bold text-slate-700">
                          <p>{member.address}<br />P.O: {member.postOffice}, P.S: {member.policeStation}, PIN: {member.pinCode}</p>
                          <div className="pt-2 border-t mt-2 flex gap-6">
                             <p>Phone: {member.phone}</p>
                             <p>Blood Group: <span className="text-red-600 font-black">{member.bloodGroup || 'N/A'}</span></p>
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="w-44 h-24 border-[3px] border-dashed border-slate-200 bg-white/60 rounded-2xl flex items-center justify-center relative">
                          <div className="relative w-16 h-16 opacity-10"><Image src="/HRAT%20Logo.jpeg" alt="HRAT Seal" fill className="object-contain grayscale" /></div>
                          <span className="absolute text-[10px] text-slate-300 font-bold uppercase">Digital Stamp</span>
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

        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 print:hidden text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden mt-6 mx-4">
           <ShieldCheck className="w-12 h-12 md:w-14 md:h-14 text-accent mx-auto mb-6" />
           <h3 className="font-headline font-bold text-xl md:text-2xl mb-3 text-primary">High-Fidelity Verified Identity</h3>
           <p className="text-slate-500 text-xs md:text-sm mb-8 leading-relaxed font-medium">
             Identity record for <strong>{member.name}</strong>. Optimized for **Industrial PVC Card Printing**.
           </p>
           <div className="flex items-center gap-2 text-[9px] md:text-[11px] font-bold text-emerald-600 uppercase justify-center bg-emerald-50 py-2.5 rounded-xl border border-emerald-100">
             <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" /> NITI Aayog Verified Credentials
           </div>
        </div>

      </div>
    </main>
  )
}
