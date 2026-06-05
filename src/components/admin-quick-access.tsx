
"use client"

import React from 'react'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { useUser } from '@/firebase'

/**
 * AdminQuickAccess provides a prominent, persistent link at the bottom-left 
 * of the public portal to allow authorized personnel easy entry 
 * into the administrative side of the site.
 */
export function AdminQuickAccess() {
  const { user } = useUser()

  return (
    <div className="fixed bottom-6 left-6 z-[999] print:hidden">
      <Link 
        href={user ? "/internal/analytics" : "/internal/login"}
        className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-full border border-white/20 transition-all text-[11px] font-bold uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:bg-accent hover:text-primary hover:scale-105 active:scale-95 group"
      >
        <ShieldAlert className="w-4 h-4 text-red-500 group-hover:text-primary transition-transform group-hover:scale-110" />
        <span>Personnel Portal</span>
      </Link>
    </div>
  )
}
