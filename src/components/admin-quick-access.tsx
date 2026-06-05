"use client"

import React from 'react'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { useUser } from '@/firebase'

/**
 * AdminQuickAccess provides a subtle, persistent link at the bottom-left 
 * of the public portal to allow authorized personnel easy entry 
 * into the administrative side of the site.
 */
export function AdminQuickAccess() {
  const { user } = useUser()

  return (
    <div className="fixed bottom-6 left-6 z-[100] print:hidden">
      <Link 
        href={user ? "/internal/analytics" : "/internal/login"}
        className="flex items-center gap-2 bg-slate-900/40 backdrop-blur-md hover:bg-slate-900 text-white/40 hover:text-white px-4 py-2 rounded-full border border-white/10 transition-all text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl group"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
        <span>Personnel Portal</span>
      </Link>
    </div>
  )
}
