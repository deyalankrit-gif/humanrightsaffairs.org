"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useUser, useAuth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, ExternalLink, LogOut, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PortalSwitcher() {
  const { user } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  if (!user) return null

  const isAdminPortal = pathname.startsWith('/internal')
  const isLoginPage = pathname === '/internal/login' || pathname === '/login'

  if (isLoginPage) return null

  const handleSignOut = async () => {
    await signOut(auth)
    router.push('/internal/login')
  }

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href={isAdminPortal ? "/" : "/internal/analytics"}>
        <Button 
          className={cn(
            "h-14 md:h-16 px-6 md:px-8 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm md:text-base transition-all hover:scale-105 active:scale-95 group border-2 border-white/20 backdrop-blur-xl",
            isAdminPortal 
              ? "bg-slate-900 text-white hover:bg-slate-800" 
              : "bg-accent text-primary hover:bg-accent/90"
          )}
        >
          <div className="bg-white/10 p-2 rounded-xl group-hover:rotate-12 transition-transform">
            {isAdminPortal ? <ExternalLink className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] uppercase tracking-widest opacity-70">Switch Portal</span>
            <span>{isAdminPortal ? "Public Website" : "Admin Dashboard"}</span>
          </div>
          <div className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden md:block"></div>
        </Button>
      </Link>

      <Button 
        onClick={handleSignOut}
        variant="outline"
        className="h-12 px-6 rounded-xl shadow-lg flex items-center gap-3 font-bold text-xs transition-all hover:bg-red-500 hover:text-white border-red-500/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-red-500 group"
      >
        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="uppercase tracking-widest">Secure Sign Out</span>
      </Button>
    </div>
  )
}
