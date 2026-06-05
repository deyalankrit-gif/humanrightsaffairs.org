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
  const auth = authInstance()
  const router = useRouter()
  const pathname = usePathname()
  
  // Use useAuth hook if it exists, otherwise provide a fallback
  // This is a safety check for the specific implementation details
  function authInstance() {
    try {
      return useAuth();
    } catch (e) {
      return null;
    }
  }

  if (!user || !auth) return null

  const isAdminPortal = pathname.startsWith('/internal')
  const isLoginPage = pathname === '/internal/login' || pathname === '/login'

  if (isLoginPage) return null

  const handleSignOut = async () => {
    await signOut(auth)
    router.push('/internal/login')
  }

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[280px]">
      {/* Session Information Card - Background is 99% transparent, text and icons are extreme contrast */}
      <div className="bg-white/[0.01] dark:bg-slate-950/[0.01] backdrop-blur-3xl border border-slate-950/40 dark:border-white/40 p-5 rounded-[2.5rem] shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/10 dark:bg-white/10 p-2.5 rounded-2xl border border-slate-950/20 dark:border-white/20 shadow-sm">
            <UserCircle className="w-6 h-6 text-slate-950 dark:text-white stroke-[2.5px]" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-[10px] font-black text-slate-950 dark:text-white uppercase tracking-[0.2em] mb-0.5 opacity-70">
              Log In Information
            </p>
            <p className="text-[13px] font-black text-slate-950 dark:text-white truncate max-w-[180px]">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-950/20 dark:bg-white/20 w-full"></div>

        <div className="flex flex-col gap-2">
          <Link href={isAdminPortal ? "/" : "/internal/analytics"} className="w-full">
            <Button 
              variant="ghost"
              className={cn(
                "w-full h-12 justify-start gap-3 rounded-2xl font-black text-[13px] transition-all border border-transparent shadow-sm",
                isAdminPortal 
                  ? "text-slate-950 bg-yellow-100 hover:bg-yellow-200 border-yellow-200/50" 
                  : "text-slate-950 dark:text-white bg-slate-950/5 hover:bg-slate-950/20 dark:bg-white/5 dark:hover:bg-white/20"
              )}
            >
              {isAdminPortal ? <ExternalLink className="w-5 h-5 stroke-[3px]" /> : <LayoutDashboard className="w-5 h-5 stroke-[3px]" />}
              {isAdminPortal ? "Go to Public Site" : "Admin Dashboard"}
            </Button>
          </Link>

          <Button 
            onClick={handleSignOut}
            variant="ghost"
            className="w-full h-12 justify-start gap-3 rounded-2xl font-black text-[13px] text-red-600 dark:text-red-500 bg-red-600/5 hover:bg-red-600/15 border border-red-600/20 shadow-sm transition-all"
          >
            <LogOut className="w-5 h-5 stroke-[3px]" />
            <span className="uppercase tracking-widest">
              Secure Sign Out
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
