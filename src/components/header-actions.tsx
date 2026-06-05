"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useUser, useAuth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, ExternalLink, LogOut, UserCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

export function HeaderActions() {
  const { user } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isAdminPortal = pathname.startsWith('/internal')

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth)
      router.push('/internal/login')
    }
  }

  return (
    <div className="ml-auto flex items-center gap-3">
      {/* Theme Toggle - Always visible */}
      <ThemeToggle className="hover:bg-accent/10 rounded-lg" />

      {user && (
        <>
          {/* Session Info - Visible on tablets and up */}
          <div className="hidden lg:flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-xl border border-border">
            <UserCircle className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Log In Information</span>
              <span className="text-[11px] font-bold truncate max-w-[150px]">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={isAdminPortal ? "/" : "/internal/analytics"}>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-9 px-3 gap-2 font-bold text-xs rounded-lg transition-all",
                  isAdminPortal 
                    ? "bg-accent/10 text-accent hover:bg-accent/20" 
                    : "bg-primary/5 text-primary hover:bg-primary/10"
                )}
              >
                {isAdminPortal ? (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Go to Public Site</span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Admin Dashboard</span>
                  </>
                )}
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="h-9 px-3 gap-2 font-bold text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline uppercase tracking-widest">Sign Out</span>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
