"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Download, Printer, ShieldCheck, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

/**
 * ActivityCalendarPage provides a professional viewer for the Trust's official schedule.
 * Optimized for minimal vertical empty space and features interactive zoom.
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
      {/* Header Section - Minimized vertical space */}
      <section className="pt-20 pb-3 bg-primary text-primary-foreground relative overflow-hidden border-b-2 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-[10px] uppercase tracking-[0.2em] hover:translate-x-[-4px] transition-transform">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-headline font-bold leading-tight">
                    Activity <span className="text-accent italic">Calendar</span>
                  </h1>
                  <p className="text-[10px] text-primary-foreground/60 font-bold uppercase tracking-widest">
                    Reference: 2025-26/AC
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mb-1">
              <Button onClick={handlePrint} variant="outline" size="sm" className="rounded-lg font-bold gap-2 h-8 px-3 border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all text-[10px]">
                <Printer className="w-3.5 h-3.5" /> Print
              </Button>
              <Button asChild size="sm" className="bg-accent text-primary font-bold h-8 px-4 rounded-lg hover:bg-secondary hover:text-white transition-all shadow-lg shadow-accent/20 text-[10px]">
                <a href="/Activity Calender.jpeg" download>
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Viewer Section - Tight Spacing */}
      <section className="py-2 px-4 flex-1">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto space-y-2">
            
            {/* Zoom Control Strip */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Verified Institutional Schedule</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md">
                  <Button variant="ghost" size="icon" onClick={zoomOut} className="h-6 w-6 rounded-sm" disabled={zoom <= 0.5}>
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <div className="w-10 text-center text-[9px] font-bold text-slate-500">
                    {Math.round(zoom * 100)}%
                  </div>
                  <Button variant="ghost" size="icon" onClick={zoomIn} className="h-6 w-6 rounded-sm" disabled={zoom >= 3}>
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                </div>
                <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
                <Button variant="ghost" size="icon" onClick={resetZoom} className="h-7 w-7 text-slate-400 hover:text-accent" title="Reset View">
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            
            {/* Image Stage */}
            <div className="relative w-full bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
               <div className="overflow-auto custom-scrollbar max-h-[80vh] rounded-lg bg-slate-50 dark:bg-slate-950">
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
               
               {/* Minimal internal card branding */}
               <div className="mt-2 flex items-center justify-between opacity-30 px-1">
                  <div className="flex items-center gap-2">
                     <div className="relative w-6 h-6">
                        <Image src="/HRAT%20Logo.jpeg" alt="HRAT" fill className="object-contain grayscale" />
                     </div>
                     <span className="text-[7px] font-black uppercase tracking-widest text-primary">HRAT INDIA</span>
                  </div>
                  <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400">DOC ID: 2025-26/AC/V</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
