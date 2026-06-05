"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { useAuth, useUser } from '@/firebase'
import { ThemeToggle } from './theme-toggle'
import { Button } from '@/components/ui/button'
import { LogOut, Monitor, UserCircle } from 'lucide-react'

/**
 * HeaderActions provides global utility actions in the top bar.
 * In the admin portal, it also displays session information and mirrors navigation.
 */
export function HeaderActions() {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuth()
  const { user } = useUser()
  const isAdminPortal = pathname?.startsWith('/internal')

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth)
      router.push('/internal/login')
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isAdminPortal && user && (
        <div className="flex items-center gap-1.5 mr-2">
          {/* Session Official Status */}
          <div className="hidden xl:flex items-center gap-2 px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md">
            <UserCircle className="w-3 h-3 text-accent" />
            <div className="flex flex-col">
              <span className="text-[6px] font-bold text-slate-400 uppercase leading-none">Session Official</span>
              <span className="text-[8px] font-bold text-primary dark:text-white truncate max-w-[100px] leading-tight">{user.email}</span>
            </div>
          </div>

          {/* Public Mirror Link */}
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="h-7 px-2 gap-1.5 font-bold text-[8px] uppercase tracking-wider rounded-md hover:bg-accent/10 hover:text-accent transition-all hidden md:flex"
          >
            <Link href="/internal/public-view">
              <Monitor className="w-3 h-3" /> Public Mirror
            </Link>
          </Button>

          {/* Sign Out Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="h-7 px-2 gap-1.5 font-bold text-[8px] uppercase tracking-wider rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </Button>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
        </div>
      )}
      <ThemeToggle className="h-7 w-7 hover:bg-accent/10 rounded-md" />
    </div>
  )
}
