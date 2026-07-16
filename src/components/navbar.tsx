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
  Image as ImageIcon,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeaderActions } from './header-actions'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    <header className="flex h-16 md:h-14 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8 sticky top-0 z-[100] transition-all duration-300">
      <Link href="/" className="flex items-center gap-2 md:gap-3 mr-4 md:mr-8 shrink-0 group">
        <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-110">
          <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline font-bold text-sm md:text-lg leading-none">HRAT</span>
          <span className="text-[7px] md:text-[9px] font-bold text-accent uppercase tracking-widest">Justice Shield</span>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex flex-1 items-center gap-1.5 md:gap-2 px-1 md:px-2">
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
            <Link 
              key={link.name} 
              href={link.href}
              onClick={() => {
                if (isHashLink) setActiveHash(linkHash)
                else setActiveHash('')
              }}
              className={cn(
                "whitespace-nowrap flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full text-[11px] md:text-[13px] font-bold transition-all group shrink-0",
                isActive 
                  ? "bg-accent text-white shadow-lg ring-1 ring-accent/20" 
                  : "text-muted-foreground hover:text-white hover:bg-secondary transition-colors"
              )}
            >
              <link.icon className={cn("w-3 md:w-3.5 h-3 md:h-3.5 transition-colors", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")} />
              <span>{link.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="flex-1 lg:hidden"></div>

      {/* Mobile Menu Trigger */}
      <div className="lg:hidden mr-2">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 border-none bg-white dark:bg-slate-950">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <Image src="/HRAT%20Logo.jpeg" alt="Logo" fill className="object-contain" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-headline font-bold text-lg leading-none">HRAT</span>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Justice Shield</span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-4 gap-1">
              {publicLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    pathname === link.href ? "bg-accent text-white" : "hover:bg-slate-100 dark:hover:bg-slate-900"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="ml-0 md:ml-4 flex items-center gap-2 shrink-0">
        <HeaderActions />
      </div>
    </header>
  )
}
