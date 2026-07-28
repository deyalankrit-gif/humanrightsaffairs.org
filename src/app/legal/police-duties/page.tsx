"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * PoliceDutiesPage: A highly focused legal resource page.
 * Displays only the specific mandatory duties heading as requested by the administration.
 */
export default function PoliceDutiesPage() {
  return (
    <main className="min-h-[80vh] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 md:p-20">
      <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
        
        {/* The requested single statement */}
        <h1 className="text-3xl md:text-6xl font-headline font-bold text-primary dark:text-white leading-tight drop-shadow-sm">
          গ্রেপ্তার করার সময় পুলিশের অবশ্য পালনীয় কর্তব্য
        </h1>

        <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
          <Link href="/">
            <Button variant="ghost" className="gap-2 font-bold text-slate-400 hover:text-accent transition-all uppercase text-xs tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Return to Homepage
            </Button>
          </Link>
        </div>
        
        <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] pt-8">
          Official Institutional Record • HRAT India
        </p>
      </div>
    </main>
  )
}
