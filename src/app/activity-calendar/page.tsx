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
 */
export default function ActivityCalendarPage() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
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
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Activity <span className="text-accent italic">Calendar</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium leading-relaxed">
              Official annual schedule of human rights conventions, awareness camps, and organizational activities.
            </p>
          </div>
        </div>
      </section>

      {/* Calendar Viewer */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Institutional Schedule 2025-26
              </div>
              <div className="flex gap-4">
                <Button onClick={handlePrint} variant="outline" className="rounded-xl font-bold gap-2 h-11 px-6 border-slate-200">
                  <Printer className="w-4 h-4" /> Print
                </Button>
                <Button asChild className="bg-accent text-primary font-bold h-11 px-8 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                  <a href="/Activity Calender.jpeg" download>
                    <Download className="w-4 h-4 mr-2" /> Download Image
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Image Container with high shadow and rounded corners */}
            <div className="relative w-full aspect-[1/1.414] rounded-[2.5rem] overflow-hidden shadow-2xl bg-white border-8 border-white dark:border-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
               <Image 
                src="/Activity Calender.jpeg" 
                alt="HRAT Official Activity Calendar" 
                fill 
                className="object-contain"
                priority
               />
            </div>
            
            <div className="text-center pt-8 print:hidden">
               <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                 Verified Mission Record • Human Rights Affairs Trust (INDIA)
               </p>
               <div className="flex justify-center mt-6 opacity-20">
                  <div className="relative w-16 h-16">
                    <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain grayscale" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
