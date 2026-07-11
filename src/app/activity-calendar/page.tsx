"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Download, Printer, ShieldCheck, ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { Slider } from '@/components/ui/slider'

/**
 * ActivityCalendarPage provides a professional viewer for the Trust's official schedule.
 * Features interactive zoom and optimized vertical layout to minimize empty space.
 */
export default function ActivityCalendarPage() {
  const [zoom, setZoom] = useState(1)
  
  const handlePrint = () => {
    window.print()
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const resetZoom = () => setZoom(1)

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Header Section - Optimized vertical space */}
      <section className="pt-24 pb-6 bg-primary text-primary-foreground relative overflow-hidden border-b-4 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-[10px] uppercase tracking-[0.2em] hover:translate-x-[-4px] transition-transform">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-headline font-bold leading-tight">
                    Activity <span className="text-accent italic">Calendar</span>
                  </h1>
                  <p className="text-xs md:text-sm text-primary-foreground/60 font-bold uppercase tracking-widest mt-1">
                    Institutional Record Reference: 2025-26/AC
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline" size="sm" className="rounded-xl font-bold gap-2 h-9 px-4 border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all shadow-sm">
                <Printer className="w-4 h-4" /> Print
              </Button>
              <Button asChild size="sm" className="bg-accent text-primary font-bold h-9 px-5 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-lg shadow-accent/20">
                <a href="/Activity Calender.jpeg" download>
                  <Download className="w-4 h-4 mr-2" /> Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Viewer Section - Minimized Padding */}
      <section className="py-4 md:py-8 px-4 flex-1">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto space-y-4">
            
            {/* Interactive Zoom Controls */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Mission Schedule</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <Button variant="ghost" size="icon" onClick={zoomOut} className="h-7 w-7 rounded-md" disabled={zoom <= 0.5}>
                    <ZoomOut className="w-3.5 h-3.5" />
                  </Button>
                  <div className="w-12 text-center text-[10px] font-bold text-slate-500">
                    {Math.round(zoom * 100)}%
                  </div>
                  <Button variant="ghost" size="icon" onClick={zoomIn} className="h-7 w-7 rounded-md" disabled={zoom >= 3}>
                    <ZoomIn className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                <Button variant="ghost" size="icon" onClick={resetZoom} className="h-8 w-8 text-slate-400 hover:text-accent" title="Reset View">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Image Container - Scrollable and Scalable */}
            <div className="relative w-full bg-white dark:bg-slate-900 rounded-[2rem] p-2 md:p-6 shadow-2xl border border-white dark:border-slate-800 overflow-hidden">
               <div className="overflow-auto custom-scrollbar max-h-[75vh] rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900">
                  <div 
                    className="relative w-full aspect-[1/1.414] transition-transform duration-200 origin-top"
                    style={{ transform: `scale(${zoom})`, minWidth: '100%' }}
                  >
                    <Image 
                      src="/Activity Calender.jpeg" 
                      alt="HRAT Official Activity Calendar" 
                      fill 
                      className="object-contain"
                      priority
                    />
                  </div>
               </div>
               
               {/* Minimal footer branding within the card */}
               <div className="mt-4 flex items-center justify-between opacity-30 px-2">
                  <div className="flex items-center gap-3">
                     <div className="relative w-8 h-8">
                        <Image src="/HRAT%20Logo.jpeg" alt="HRAT" fill className="object-contain grayscale" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary">HRAT INDIA</span>
                        <span className="text-[6px] font-bold text-slate-500">Central Governance Cell</span>
                     </div>
                  </div>
                  <p className="text-[6px] font-black uppercase tracking-[0.3em] text-slate-400">Digital Document ID: 2025-26/AC/VERIFIED</p>
               </div>
            </div>
            
            <div className="text-center pb-4 print:hidden">
               <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-slate-200/50 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px]">
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
