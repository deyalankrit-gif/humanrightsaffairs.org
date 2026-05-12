
"use client"

import React from 'react'
import Link from 'next/link'
import { Shield, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import { usePathname } from 'next/navigation'
import { DonationDialog } from './donation-dialog'
import { cn } from '@/lib/utils'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'Leadership', href: '/leadership' },
  { name: 'Members', href: '/members' },
  { name: 'Rights Center', href: '/#knowledge' },
  { name: 'Helpline', href: '/#helpline' },
  { name: 'Be A Member', href: '/#membership' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [activeHash, setActiveHash] = React.useState('')
  const [mounted, setMounted] = React.useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  React.useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      if (isHome) {
        // Detection for home sections
        const sections = ['knowledge', 'helpline', 'membership']
        let currentSection = ''
        for (const section of sections) {
          const el = document.getElementById(section)
          if (el) {
            const rect = el.getBoundingClientRect()
            // If the section is near the top of the viewport
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
    // Initial check
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  const navColorClass = (isScrolled || !isHome) ? 'text-primary' : 'text-white'
  const bgColorClass = (isScrolled || !isHome) ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-500",
      bgColorClass
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Shield className={cn(
              "w-10 h-10 transition-colors duration-500 fill-accent",
              navColorClass
            )} />
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
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            // Determine if the link is active
            const isPageActive = pathname === link.href
            const isHashActive = isHome && activeHash && link.href === `/${activeHash}`
            const isHomeRootActive = link.href === '/' && isHome && !activeHash
            
            const isActive = isPageActive || isHashActive || isHomeRootActive

            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={cn(
                  "text-sm font-bold tracking-wide transition-all duration-500 relative group py-2",
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
          {mounted && (
            <DonationDialog>
              <Button 
                variant="default" 
                className="bg-accent text-primary hover:bg-accent/90 rounded-full px-8 font-bold shadow-lg shadow-accent/20 transition-transform active:scale-95"
              >
                Donate
              </Button>
            </DonationDialog>
          )}
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
                   <Shield className="w-8 h-8 text-primary fill-accent" />
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
                {mounted && (
                  <DonationDialog>
                    <Button className="w-full bg-primary text-white py-8 text-xl mt-8 shadow-xl rounded-2xl">
                      Donate Now
                    </Button>
                  </DonationDialog>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
