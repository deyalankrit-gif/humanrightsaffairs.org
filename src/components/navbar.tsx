
"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import { usePathname } from 'next/navigation'
import { DonationDialog } from './donation-dialog'
import { cn } from '@/lib/utils'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'Leadership', href: '/leadership' },
  { name: 'Membership Dir', href: '/members' },
  { name: 'Terminated List', href: '/terminated-members' },
  { name: 'Rights Center', href: '/#knowledge' },
  { name: 'Helpline', href: '/#helpline' },
]

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState('')
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      if (isHome) {
        const sections = ['knowledge', 'helpline', 'membership']
        let currentSection = ''
        for (const section of sections) {
          const el = document.getElementById(section)
          if (el) {
            const rect = el.getBoundingClientRect()
            if (rect.top <= 200 && rect.bottom >= 200) {
              currentSection = `#${section}`
              break
            }
          }
        }
        setActiveHash(currentSection)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  const navColorClass = (isScrolled || !isHome) ? 'text-primary' : 'text-white'
  const bgColorClass = (isScrolled || !isHome) ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'

  if (!mounted) {
    return (
      <nav className={cn("fixed top-0 w-full z-50 transition-all duration-500", bgColorClass)}>
        <div className="container mx-auto px-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-200/20 animate-pulse"></div>
            <div className="h-6 w-24 bg-slate-200/20 animate-pulse rounded"></div>
           </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-500",
      bgColorClass
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="relative w-12 h-12 transition-transform duration-500 group-hover:scale-110">
              <Image 
                src="/HRAT%20Logo.jpeg" 
                alt="HRAT Official Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "font-headline font-bold text-xl leading-none transition-colors duration-500",
              navColorClass
            )}>HRAT</span>
            <span className="text-[10px] font-bold tracking-widest text-accent uppercase">JusticeShield</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isPageActive = pathname === link.href
            const isHashActive = isHome && activeHash && link.href === `/${activeHash}`
            const isHomeRootActive = link.href === '/' && isHome && !activeHash
            const isActive = isPageActive || isHashActive || isHomeRootActive

            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={cn(
                  "text-xs font-bold tracking-wide transition-all duration-500 relative group py-2",
                  navColorClass,
                  isActive ? "text-accent" : "hover:text-accent/80"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-accent transition-all duration-300",
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                )}></span>
              </Link>
            )
          })}
          <DonationDialog>
            <Button 
              variant="default" 
              className="bg-accent text-primary hover:bg-accent/90 rounded-full px-6 font-bold shadow-lg shadow-accent/20 transition-transform active:scale-95 text-xs"
            >
              Donate
            </Button>
          </DonationDialog>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={navColorClass}>
                <Menu className="w-8 h-8" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white/95 backdrop-blur-xl border-l-primary/10">
              <SheetHeader className="text-left mb-8">
                <SheetTitle className="flex items-center gap-2">
                   <div className="relative w-10 h-10">
                    <Image 
                      src="/HRAT%20Logo.jpeg" 
                      alt="HRAT Official Logo" 
                      fill 
                      className="object-contain"
                    />
                   </div>
                   <span className="font-headline font-bold text-2xl text-primary">JusticeShield</span>
                </SheetTitle>
                <SheetDescription className="text-[10px] font-bold tracking-widest text-accent uppercase">
                  Central Government Registered Human Rights Organization
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => {
                  const isPageActive = pathname === link.href
                  const isHashActive = isHome && activeHash && link.href === `/${activeHash}`
                  const isHomeRootActive = link.href === '/' && isHome && !activeHash
                  const isActive = isPageActive || isHashActive || isHomeRootActive
                  
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href} 
                      className={cn(
                        "text-2xl font-headline font-bold transition-colors border-l-4 pl-4",
                        isActive ? "text-accent border-accent" : "text-primary border-transparent hover:text-accent"
                      )}
                    >
                      {link.name}
                    </Link>
                  )
                })}
                <DonationDialog>
                  <Button className="w-full bg-primary text-white py-8 text-xl mt-8 shadow-xl rounded-2xl">
                    Donate Now
                  </Button>
                </DonationDialog>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
