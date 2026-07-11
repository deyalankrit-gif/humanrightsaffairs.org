"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Download, Printer, ShieldCheck, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

/**
 * ActivityCalendarPage provides a professional viewer for the Trust's official schedule.
 * Optimized for zero vertical scroll containers and maximum vertical efficiency.
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header Section - Minimized to absolute limit */}
      <section className="pt-14 pb-0.5 bg-primary text-primary-foreground relative overflow-hidden border-b border-accent/20 print:hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-1">
            <div className="space-y-0">
              <Link href="/" className="inline-flex items-center gap-1.5 text-accent font-bold text-[8px] uppercase tracking-widest hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-2.5 h-2.5" /> Home
              </Link>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <h1 className="text-lg md:text-xl font-headline font-bold leading-none">
                  Activity <span className="text-accent italic">Calendar</span>
                </h1>
              </div>
            </div>
            
            <div className="flex gap-2 mb-1">
              <Button onClick={handlePrint} variant="outline" size="sm" className="rounded-lg font-bold gap-2 h-6 px-3 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all text-[8px]">
                <Printer className="w-3 h-3" /> Print
              </Button>
              <Button asChild size="sm" className="bg-accent text-primary font-bold h-6 px-3 rounded-lg hover:bg-secondary hover:text-white transition-all shadow-lg shadow-accent/20 text-[8px]">
                <a href="/Activity Calender.jpeg" download>
                  <Download className="w-3 h-3 mr-1" /> Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Viewer Section - No Card Frames, No Internal Scroll */}
      <section className="py-1 px-4 flex-1">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto space-y-1">
            
            {/* Zoom Control Strip - Compact and Sticky-ready */}
            <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400">Registry Log 2025-26</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-0.5 rounded-md">
                  <Button variant="ghost" size="icon" onClick={zoomOut} className="h-4 w-4 rounded-sm" disabled={zoom <= 0.5}>
                    <ZoomOut className="w-2 h-2" />
                  </Button>
                  <div className="w-6 text-center text-[7px] font-black text-slate-500">
                    {Math.round(zoom * 100)}%
                  </div>
                  <Button variant="ghost" size="icon" onClick={zoomIn} className="h-4 w-4 rounded-sm" disabled={zoom >= 3}>
                    <ZoomIn className="w-2 h-2" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={resetZoom} className="h-5 w-5 text-slate-400 hover:text-accent" title="Reset View">
                  <RotateCcw className="w-2.5 h-2.5" />
                </Button>
              </div>
            </div>
            
            {/* Direct Image Viewer - Removal of all internal scroll containers */}
            <div className="relative w-full overflow-x-auto no-scrollbar">
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
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
