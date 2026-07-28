"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * PoliceDutiesPage: A highly focused legal resource page.
 * Displays a numbered list of captions for essential information as requested.
 */
export default function PoliceDutiesPage() {
  return (
    <main className="min-h-[80vh] bg-white dark:bg-slate-950 flex flex-col items-center pt-24 pb-20 px-6">
      <div className="max-w-2xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Focused List Container */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
          <ul className="space-y-10 list-none p-0 m-0">
            {/* Item 1 */}
            <li className="flex items-start gap-6 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary font-black text-lg shadow-lg transform group-hover:scale-110 transition-transform">
                ১.
              </div>
              <p className="text-xl md:text-2xl font-bold text-primary dark:text-white leading-snug pt-1">
                গ্রেপ্তার করার সময় পুলিশের অবশ্য পালনীয় কর্তব্য
              </p>
            </li>

            {/* Future Placeholder 2 */}
            <li className="flex items-start gap-6 opacity-20 select-none grayscale pointer-events-none">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 font-black text-lg">
                ২.
              </div>
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 animate-pulse"></div>
            </li>

            {/* Future Placeholder 3 */}
            <li className="flex items-start gap-6 opacity-10 select-none grayscale pointer-events-none">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 font-black text-lg">
                ৩.
              </div>
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-full mt-3"></div>
            </li>
          </ul>
        </div>

        <div className="pt-12 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link href="/">
            <Button variant="ghost" className="gap-2 font-bold text-slate-400 hover:text-accent transition-all uppercase text-[10px] tracking-[0.2em] h-10">
              <ArrowLeft className="w-4 h-4" /> Return to Homepage
            </Button>
          </Link>
        </div>
        
        <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] pt-8 text-center">
          Official Institutional Record • HRAT India
        </p>
      </div>
    </main>
  )
}
