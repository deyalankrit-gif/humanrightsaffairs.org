"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { usePathname } from 'next/navigation'
import { DonationDialog } from './donation-dialog'
import { cn } from '@/lib/utils'
import { useUser } from '@/firebase'
import { ThemeToggle } from './theme-toggle'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Meetings', href: '/meetings' },
  { name: 'Events', href: '/events' },
  { name: 'Leadership', href: '/leadership' },
  { name: 'Membership Dir', href: '/members' },
  { name: 'Terminated List', href: '/terminated-members' },
  { name: 'Grievance Cell', href: '/#grievances' },
  { name: 'Rights Center', href: '/#knowledge' },
  { name: 'Helpline', href: '/#helpline' },
]

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState('')
  const pathname = usePathname()
  const isHome = pathname === '/'
  const { user } = useUser()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      if (isHome) {
        const sections = ['knowledge', 'helpline', 'membership', 'grievances']
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

  const navColorClass = (isScrolled || !isHome) ? 'text-primary dark:text-white' : 'text-white'
  const bgColorClass = (isScrolled || !isHome) ? 'bg-white/95 backdrop-blur-md shadow-lg py-3 dark:bg-slate-950/95' : 'bg-transparent py-6'

  if (!mounted) return null

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
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isPageActive = pathname === link.href
            const isHashActive = isHome && activeHash && link.href === `/${activeHash}`
            const isActive = isPageActive || isHashActive || (link.href === '/' && isHome && !activeHash)

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
              </Link>
            )
          })}
          
          <ThemeToggle className={navColorClass} />

          <DonationDialog>
            <Button 
              variant="default" 
              className="bg-accent text-primary hover:bg-accent/90 rounded-full px-6 font-bold shadow-lg shadow-accent/20 transition-transform active:scale-95 text-xs h-9"
            >
              Donate
            </Button>
          </DonationDialog>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden flex items-center gap-4">
           <ThemeToggle className={navColorClass} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={navColorClass}>
                <Menu className="w-8 h-8" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white/95 backdrop-blur-xl border-l-primary/10 dark:bg-slate-950/95 dark:border-l-white/10">
              <SheetHeader className="text-left mb-8">
                <SheetTitle className="flex items-center gap-2">
                   <div className="relative w-10 h-10">
                    <Image src="/HRAT%20Logo.jpeg" alt="HRAT" fill className="object-contain" />
                   </div>
                   <span className="font-headline font-bold text-2xl text-primary dark:text-white">JusticeShield</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className="text-xl font-headline font-bold text-primary hover:text-accent dark:text-white"
                  >
                    {link.name}
                  </Link>
                ))}
                <DonationDialog>
                  <Button className="w-full bg-primary text-white py-6 text-lg mt-4 dark:bg-accent dark:text-primary">
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
