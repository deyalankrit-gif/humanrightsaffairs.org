"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeaderActions } from './header-actions'
import { OccasionBanner } from './occasion-banner'

const publicLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Meetings', href: '/meetings', icon: Handshake },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
  { name: 'Leadership', href: '/leadership', icon: Users },
  { name: 'Members', href: '/members', icon: UserCheck },
  { name: 'Terminated', href: '/terminated-members', icon: UserX },
  { name: 'Grievance', href: '/#grievances', icon: MessageSquareWarning },
  { name: 'Rights', href: '/#knowledge', icon: Scale },
  { name: 'Helpline', href: '/#helpline', icon: Phone },
]

export function Navbar() {
  const pathname = usePathname()
  const [isIframe, setIsIframe] = useState(false)
  const [activeHash, setActiveHash] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsIframe(window.self !== window.top)
      const handleHashChange = () => {
        setActiveHash(window.location.hash || '')
      }
      window.addEventListener('hashchange', handleHashChange)
      handleHashChange()
      return () => window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  if (isIframe) return null

  return (
    <header className="flex h-14 md:h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-10 sticky top-0 z-[100] transition-all duration-300 w-full overflow-visible">
      <Link href="/" className="flex items-center gap-3 mr-6 md:mr-10 shrink-0 group">
        <div className="relative w-8 h-8 md:w-11 md:h-11 transition-transform group-hover:scale-110 duration-500">
          <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline font-bold text-sm md:text-xl leading-none">HRAT</span>
          <span className="text-[6px] md:text-[10px] font-bold text-accent uppercase tracking-[0.2em] leading-none mt-1">Justice Shield</span>
        </div>
      </Link>

      <nav className="flex-1 flex items-center overflow-x-auto md:overflow-visible no-scrollbar gap-1.5 md:gap-3 px-2 touch-pan-x scroll-smooth h-full">
        {publicLinks.map((link) => {
          const isHashLink = link.href.includes('#')
          const linkPath = isHashLink ? link.href.split('#')[0] || '/' : link.href
          const linkHash = isHashLink ? '#' + link.href.split('#')[1] : ''
          const isHelpline = link.name === 'Helpline'
          
          let isActive = false
          if (isHashLink) {
            isActive = pathname === linkPath && activeHash === linkHash
          } else {
            isActive = pathname === link.href && activeHash === ''
          }

          return (
            <div key={link.name} className="relative shrink-0 group/link h-full flex items-center overflow-visible">
              <Link 
                href={link.href}
                onClick={() => {
                  if (isHashLink) setActiveHash(linkHash)
                  else setActiveHash('')
                }}
                className={cn(
                  "whitespace-nowrap flex items-center gap-1.5 px-3 md:px-5 py-2 rounded-full text-[10px] md:text-[14px] font-bold transition-all group shrink-0",
                  isActive 
                    ? "bg-accent text-white shadow-xl shadow-accent/20 ring-1 ring-white/10" 
                    : "text-muted-foreground hover:text-white hover:bg-secondary transition-all"
                )}
              >
                <link.icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4 transition-colors", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")} />
                <span>{link.name}</span>
              </Link>
              
              {/* Institutional Occasion Display Hanging Below Helpline */}
              {isHelpline && <OccasionBanner />}
            </div>
          )
        })}
      </nav>

      <div className="ml-4 flex items-center gap-3 shrink-0">
        <HeaderActions />
      </div>
    </header>
  )
}
