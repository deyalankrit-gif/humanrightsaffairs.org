"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

/**
 * Income Tax Compliances Page: Official repository for institutional tax filings.
 * Currently established as a secure placeholder node.
 */
export default function IncomeTaxCompliancesPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Institutional Header */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <ShieldCheck className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Income Tax <span className="text-accent italic">Compliances</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium">
              Institutional tax records and statutory filing history of the Human Rights Affairs Trust.
            </p>
          </div>
        </div>
      </section>

      {/* Empty Registry State */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center opacity-20">
          <FileText className="w-20 h-20 mx-auto mb-6 text-slate-300 dark:text-slate-700" />
          <p className="text-xl font-headline font-bold uppercase tracking-widest text-slate-400">Registry node empty</p>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Awaiting official data population</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
