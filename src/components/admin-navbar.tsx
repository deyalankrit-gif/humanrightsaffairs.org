
"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { useAuth, useUser } from '@/firebase'
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  Menu,
  X,
  Calendar,
  Handshake,
  MessageSquareWarning
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

export function AdminNavbar() {
  const { user } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/internal/login')
  }

  const navLinks = [
    { name: 'Analytics', href: '/internal/analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Personnel', href: '/internal/members', icon: <Users className="w-4 h-4" /> },
    { name: 'Grievances', href: '/internal/grievances', icon: <MessageSquareWarning className="w-4 h-4" /> },
    { name: 'Meetings', href: '/internal/meetings', icon: <Handshake className="w-4 h-4" /> },
    { name: 'Events', href: '/internal/events', icon: <Calendar className="w-4 h-4" /> },
  ]

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 py-4",
      isScrolled ? "bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-2xl dark:bg-black/90" : "bg-slate-900 border-b border-white/5"
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/internal/analytics" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 bg-white rounded-xl p-1.5 shadow-lg group-hover:scale-110 transition-transform">
              <Image src="/HRAT%20Logo.jpeg" alt="HRAT" fill className="object-contain p-1" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-white text-lg leading-none">Admin Portal</span>
              <span className="text-[9px] font-bold text-accent uppercase tracking-widest">JusticeShield</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-bold transition-colors py-2 px-3 rounded-lg",
                  pathname === link.href 
                    ? "bg-accent/10 text-accent" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Signed in as</p>
            <p className="text-xs font-bold text-emerald-400">{user?.email}</p>
          </div>

          <ThemeToggle className="text-white hover:bg-white/10" />

          <Link href="/">
            <Button variant="outline" className="hidden md:flex border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl h-10 px-4 text-xs font-bold gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Public Website
            </Button>
          </Link>

          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="hidden md:flex text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl h-10 px-4 text-xs font-bold gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-900 border-l-white/10 text-white p-0">
              <div className="flex flex-col h-full">
                <SheetHeader className="p-6 border-b border-white/5 text-left">
                  <SheetTitle className="text-white font-headline text-2xl">Control Center</SheetTitle>
                  <p className="text-accent text-[10px] font-bold uppercase tracking-widest">Administrative Access</p>
                </SheetHeader>
                
                <div className="flex-1 p-6 space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Personnel</p>
                    <p className="text-xs font-bold text-emerald-400 truncate">{user?.email}</p>
                  </div>

                  {navLinks.map((link) => (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all",
                        pathname === link.href 
                          ? "bg-accent text-primary" 
                          : "hover:bg-white/5"
                      )}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="p-6 border-t border-white/5 space-y-3">
                  <Link href="/" className="block">
                    <Button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold h-14 rounded-2xl gap-3">
                      <ExternalLink className="w-5 h-5" />
                      Public Website
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold h-14 rounded-2xl gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    Secure Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
