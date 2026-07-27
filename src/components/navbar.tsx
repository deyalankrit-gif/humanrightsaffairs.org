
"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Calendar, 
  Users, 
  UserCheck, 
  UserX, 
  Scale, 
  Phone,
  Image as ImageIcon,
  ShieldAlert
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeaderActions } from './header-actions'
import { OccasionBanner } from './occasion-banner'

const publicLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
  { name: 'Leadership', href: '/leadership', icon: Users },
  { name: 'Members', href: '/members', icon: UserCheck },
  { name: 'Terminated', href: '/terminated-members', icon: UserX },
  { name: 'Report a complaint', href: '/report-a-complaint', icon: ShieldAlert },
  { name: 'Rights', href: '/#knowledge', icon: Scale },
  { name: 'Helpline', href: '/#helpline', icon: Phone },
]

export function Navbar() {
  const pathname = usePathname()
  const [activeHash, setActiveHash] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        setScrolled(window.scrollY > 20)
      }
      const handleHashChange = () => {
        setActiveHash(window.location.hash || '')
      }
      window.addEventListener('scroll', handleScroll)
      window.addEventListener('hashchange', handleHashChange)
      handleHashChange()
      handleScroll()
      return () => {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('hashchange', handleHashChange)
      }
    }
  }, [])

  return (
    <header className={cn(
      "flex h-14 md:h-16 shrink-0 items-center transition-all duration-500 z-[100] overflow-visible print:hidden",
      scrolled 
        ? "fixed top-3 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] max-w-7xl rounded-full bg-background/70 backdrop-blur-xl border border-white/20 shadow-2xl px-4 md:px-6" 
        : "sticky top-0 w-full px-2 md:px-4 bg-background border-b"
    )}>
      {/* Brand Section */}
      <Link href="/" className="flex items-center gap-2 mr-2 md:mr-8 shrink-0 group">
        <div className="relative w-7 h-7 md:w-9 md:h-9 transition-transform group-hover:scale-110 duration-500">
          <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" priority />
        </div>
        <div className="flex flex-col">
          <span className="font-headline font-bold text-[10px] md:text-lg leading-none">HRAT</span>
          <span className="text-[4px] md:text-[8px] font-bold text-accent uppercase tracking-[0.1em] md:tracking-[0.15em] leading-none mt-0.5">Justice Shield</span>
        </div>
      </Link>

      {/* Unified Uniform Navigation (Middle) */}
      <div className="flex-1 min-w-0 h-full relative">
        <nav className="w-full flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar gap-1 md:gap-2 px-1 touch-pan-x scroll-smooth h-full">
          {publicLinks.map((link) => {
            const isHashLink = link.href.includes('#')
            const linkPath = isHashLink ? link.href.split('#')[0] || '/' : link.href
            const linkHash = isHashLink ? '#' + link.href.split('#')[1] : ''
            
            let isActive = false
            if (isHashLink) {
              isActive = pathname === linkPath && activeHash === linkHash
            } else {
              isActive = pathname === link.href && activeHash === ''
            }

            return (
              <div key={link.name} className="relative h-full flex items-center shrink-0">
                <Link 
                  href={link.href}
                  onClick={() => {
                    if (isHashLink) setActiveHash(linkHash)
                    else setActiveHash('')
                  }}
                  className={cn(
                    "whitespace-nowrap flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[12px] font-bold transition-all group",
                    isActive 
                      ? "bg-accent text-white shadow-sm" 
                      : "text-muted-foreground hover:text-white hover:bg-secondary transition-all"
                  )}
                >
                  <link.icon className={cn("w-3 h-3 md:w-3.5 md:h-3.5 transition-colors", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")} />
                  <span>{link.name}</span>
                </Link>
              </div>
            )
          })}
        </nav>
        
        {/* Occasion Banner */}
        <OccasionBanner />
      </div>

      {/* Header Actions (Right) */}
      <div className="ml-2 md:ml-8 flex items-center gap-1 md:gap-2 shrink-0 h-full pl-2 md:pl-6 border-l border-slate-100 dark:border-slate-800">
        <HeaderActions />
      </div>
    </header>
  )
}
