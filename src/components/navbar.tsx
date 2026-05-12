
"use client"

import React from 'react'
import Link from 'next/link'
import { Shield, Menu, X, Heart, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Leadership', href: '#leadership' },
  { name: 'Rights Center', href: '#knowledge' },
  { name: 'Helpline', href: '#helpline' },
  { name: 'Membership', href: '#membership' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary fill-accent" />
          <div className="flex flex-col">
            <span className="font-headline font-bold text-lg leading-none text-primary">HRAT</span>
            <span className="text-[10px] font-bold tracking-widest text-accent uppercase">JusticeShield</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-sm font-medium hover:text-accent transition-colors">
              {link.name}
            </Link>
          ))}
          <Button variant="default" className="bg-primary text-white rounded-full px-6">
            Donate
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-12">
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href} className="text-xl font-headline font-semibold">
                    {link.name}
                  </Link>
                ))}
                <Button className="w-full bg-primary text-white mt-4">
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
