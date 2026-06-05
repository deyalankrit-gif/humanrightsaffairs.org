"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useUser, useAuth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, ExternalLink, LogOut, UserCircle } from 'lucide-react'
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
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[280px]">
      {/* Session Information Card - Background is 99% transparent, but text is high-contrast */}
      <div className="bg-white/[0.01] dark:bg-slate-900/[0.01] backdrop-blur-3xl border border-slate-300/30 dark:border-white/20 p-5 rounded-[2rem] shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/20">
            <UserCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-[9px] font-black text-primary dark:text-accent uppercase tracking-[0.2em] mb-0.5">Log In Information</p>
            <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{user?.email}</p>
          </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-white/10 w-full"></div>

        <div className="flex flex-col gap-2">
          <Link href={isAdminPortal ? "/" : "/internal/analytics"} className="w-full">
            <Button 
              variant="ghost"
              className={cn(
                "w-full h-11 justify-start gap-3 rounded-xl font-black text-xs transition-all border border-transparent hover:border-accent/20",
                isAdminPortal 
                  ? "text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5" 
                  : "text-accent bg-accent/5 hover:bg-accent/10 border-accent/10"
              )}
            >
              {isAdminPortal ? <ExternalLink className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
              {isAdminPortal ? "Go to Public Site" : "Admin Dashboard"}
            </Button>
          </Link>

          <Button 
            onClick={handleSignOut}
            variant="ghost"
            className="w-full h-11 justify-start gap-3 rounded-xl font-black text-xs text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="uppercase tracking-widest">Secure Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
