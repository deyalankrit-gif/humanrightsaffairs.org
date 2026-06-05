"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Menu,
  Calendar,
  Handshake,
  MessageSquareWarning,
  FileText,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'
import { useUser } from '@/firebase'

export function AdminNavbar() {
  const { user } = useUser()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Analytics', href: '/internal/analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Applications', href: '/internal/applications', icon: <FileText className="w-4 h-4" /> },
    { name: 'Personnel', href: '/internal/members', icon: <Users className="w-4 h-4" /> },
    { name: 'Renewals', href: '/internal/renewals', icon: <RefreshCw className="w-4 h-4" /> },
    { name: 'Grievances', href: '/internal/grievances', icon: <MessageSquareWarning className="w-4 h-4" /> },
    { name: 'Meetings', href: '/internal/meetings', icon: <Handshake className="w-4 h-4" /> },
    { name: 'Events', href: '/internal/events', icon: <Calendar className="w-4 h-4" /> },
  ]

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 py-4",
      isScrolled ? "bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-2xl" : "bg-slate-900 border-b border-white/5"
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/internal/analytics" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-10 h-10 bg-white rounded-xl p-1.5 shadow-lg group-hover:scale-110 transition-transform">
              <Image src="/HRAT%20Logo.jpeg" alt="HRAT" fill className="object-contain p-1" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-white text-lg leading-none">Admin Portal</span>
              <span className="text-[9px] font-bold text-accent uppercase tracking-widest">JusticeShield</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 text-[11px] lg:text-xs font-bold transition-all py-2 px-3 rounded-xl relative",
                    isActive 
                      ? "text-accent bg-white/5" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.icon}
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-accent rounded-full shadow-[0_0_8px_rgba(212,175,55,0.5)]"></span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          <div className="hidden lg:flex flex-col items-end">
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Personnel Clearance</p>
            <p className="text-[11px] font-bold text-emerald-400">{user?.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="text-white hover:bg-white/10" />
            
            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden text-white">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-slate-900 border-l-white/10 text-white p-0">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 border-b border-white/5 text-left">
                    <SheetTitle className="text-white font-headline text-2xl">Control Center</SheetTitle>
                    <p className="text-accent text-[10px] font-bold uppercase tracking-widest">Administrative Access</p>
                  </SheetHeader>
                  
                  <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Authenticated Personnel</p>
                      <p className="text-xs font-bold text-emerald-400 truncate">{user?.email}</p>
                    </div>

                    {navLinks.map((link) => {
                      const isActive = pathname === link.href
                      return (
                        <Link 
                          key={link.name} 
                          href={link.href} 
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all relative border border-transparent",
                            isActive 
                              ? "text-accent bg-white/5" 
                              : "hover:bg-white/5 text-slate-300"
                          )}
                        >
                          <div className={cn("p-2 rounded-lg", isActive ? "bg-primary/10" : "bg-white/5")}>
                            {link.icon}
                          </div>
                          {link.name}
                          {isActive && (
                             <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-full"></span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
