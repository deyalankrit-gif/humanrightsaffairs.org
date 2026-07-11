"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Download, Printer, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

/**
 * ActivityCalendarPage provides a professional viewer for the Trust's official schedule.
 * It references the static image provided by the user in the public directory.
 * Layout optimized to align the background area tightly with the calendar document.
 */
export default function ActivityCalendarPage() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Header Section */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Calendar className="w-8 h-8 text-accent" />
              </div>
              <div className="h-8 w-px bg-white/20 mx-2" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-accent">Institutional Record</span>
                <span className="text-xs font-bold text-white/60">Reference: 2025-26/AC</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Activity <span className="text-accent italic">Calendar</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium leading-relaxed">
              Official annual schedule of human rights conventions, awareness camps, and induction ceremonies.
            </p>
          </div>
        </div>
      </section>

      {/* Calendar Viewer */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified Mission Schedule
              </div>
              <div className="flex gap-3">
                <Button onClick={handlePrint} variant="outline" className="rounded-xl font-bold gap-2 h-10 px-5 border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all">
                  <Printer className="w-4 h-4" /> Print
                </Button>
                <Button asChild className="bg-accent text-primary font-bold h-10 px-6 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-lg shadow-accent/20">
                  <a href="/Activity Calender.jpeg" download>
                    <Download className="w-4 h-4 mr-2" /> Download Document
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Image Container - Aligned precisely with the calendar space */}
            <div className="relative w-full bg-white rounded-[2rem] md:rounded-[3.5rem] p-4 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-white dark:border-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
               <div className="relative w-full aspect-[1/1.414] rounded-2xl overflow-hidden shadow-inner bg-slate-50">
                  <Image 
                    src="/Activity Calender.jpeg" 
                    alt="HRAT Official Activity Calendar" 
                    fill 
                    className="object-contain"
                    priority
                  />
               </div>
               
               {/* Bottom watermark for the card */}
               <div className="mt-8 flex items-center justify-between opacity-40 grayscale">
                  <div className="flex items-center gap-3">
                     <div className="relative w-10 h-10">
                        <Image src="/HRAT%20Logo.jpeg" alt="HRAT" fill className="object-contain" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">HRAT INDIA</span>
                        <span className="text-[8px] font-bold text-slate-500">Central Governance Cell</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400">Digitally Verified Document</p>
                  </div>
               </div>
            </div>
            
            <div className="text-center pt-4 print:hidden">
               <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full border border-slate-100 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px]">
                    Authorized Institutional Schedule • Human Rights Affairs Trust
                  </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
