
"use client"

import React from 'react'
import Link from 'next/link'
import { Shield, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { usePathname } from 'next/navigation'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Leadership', href: '/leadership' },
  { name: 'Rights Center', href: '/#knowledge' },
  { name: 'Helpline', href: '/#helpline' },
  { name: 'Membership', href: '/#membership' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navColorClass = (isScrolled || !isHome) ? 'text-primary' : 'text-white'
  const bgColorClass = (isScrolled || !isHome) ? 'bg-white/70 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${bgColorClass}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Shield className={`w-10 h-10 transition-colors duration-500 ${navColorClass} fill-accent`} />
            <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex flex-col">
            <span className={`font-headline font-bold text-xl leading-none transition-colors duration-500 ${navColorClass}`}>HRAT</span>
            <span className="text-[10px] font-bold tracking-widest text-accent uppercase">JusticeShield</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`text-sm font-bold tracking-wide transition-all duration-500 hover:text-accent relative group ${navColorClass}`}
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
          <Button 
            variant="default" 
            className="bg-accent text-primary hover:bg-accent/90 rounded-full px-8 font-bold shadow-lg shadow-accent/20 transition-transform active:scale-95"
          >
            Donate
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={navColorClass}>
                <Menu className="w-8 h-8" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass">
              <div className="flex flex-col gap-6 mt-12">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className="text-2xl font-headline font-bold text-primary hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <Button className="w-full bg-primary text-white py-6 text-lg mt-4 shadow-xl">
                  Donate Now
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
