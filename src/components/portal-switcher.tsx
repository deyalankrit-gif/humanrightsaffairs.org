"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useUser, useAuth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, ExternalLink, LogOut, ShieldCheck, UserCircle } from 'lucide-react'
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
      {/* Session Information Card */}
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl shadow-black/50 space-y-3">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/20">
            <UserCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Authenticated Personnel</p>
            <p className="text-[11px] font-bold text-white truncate max-w-[180px]">{user?.email}</p>
          </div>
        </div>

        <div className="h-px bg-white/5 w-full"></div>

        <div className="flex flex-col gap-2">
          <Link href={isAdminPortal ? "/" : "/internal/analytics"} className="w-full">
            <Button 
              variant="ghost"
              className={cn(
                "w-full h-11 justify-start gap-3 rounded-xl font-bold text-xs transition-all",
                isAdminPortal 
                  ? "text-slate-400 hover:text-white hover:bg-white/5" 
                  : "text-accent hover:bg-accent/10"
              )}
            >
              {isAdminPortal ? <ExternalLink className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
              {isAdminPortal ? "Go to Public Site" : "Admin Dashboard"}
            </Button>
          </Link>

          <Button 
            onClick={handleSignOut}
            variant="ghost"
            className="w-full h-11 justify-start gap-3 rounded-xl font-bold text-xs text-red-400 hover:text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Secure Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
