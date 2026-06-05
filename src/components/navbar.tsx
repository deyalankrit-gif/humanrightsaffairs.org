"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { useAuth, useUser } from '@/firebase'
import { 
  Home, 
  Handshake, 
  Calendar, 
  Users, 
  UserCheck, 
  UserX, 
  MessageSquareWarning, 
  Scale, 
  Phone,
  LayoutDashboard,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeaderActions } from './header-actions'

const publicLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Meetings', href: '/meetings', icon: Handshake },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Leadership', href: '/leadership', icon: Users },
  { name: 'Personnel', href: '/members', icon: UserCheck },
  { name: 'Revocations', href: '/terminated-members', icon: UserX },
  { name: 'Grievance', href: '/#grievances', icon: MessageSquareWarning },
  { name: 'Rights', href: '/#knowledge', icon: Scale },
  { name: 'Helpline', href: '/#helpline', icon: Phone },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuth()
  const { user } = useUser()

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth)
      router.push('/internal/login')
    }
  }

  return (
    <header className="flex h-16 md:h-20 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8 sticky top-0 z-50 transition-all duration-300">
      <Link href="/" className="flex items-center gap-3 mr-8 shrink-0 group">
        <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
          <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline font-bold text-lg md:text-xl leading-none">HRAT</span>
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">JusticeShield</span>
        </div>
      </Link>

      <nav className="flex-1 flex items-center overflow-x-auto no-scrollbar gap-2 md:gap-4 px-2">
        {publicLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={cn(
                "whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all",
                isActive 
                  ? "bg-accent/10 text-accent" 
                  : "text-muted-foreground hover:text-primary hover:bg-muted"
              )}
            >
              <link.icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-muted-foreground")} />
              <span>{link.name}</span>
            </Link>
          )
        })}

        {user && (
          <div className="flex items-center gap-2 border-l border-border pl-4 ml-2">
            <Link 
              href="/internal/analytics"
              className="whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <button 
              onClick={handleSignOut}
              className="whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </nav>

      <div className="ml-4 flex items-center gap-2 shrink-0">
        <HeaderActions />
      </div>
    </header>
  )
}
