
"use client"

import React from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  ListChecks, 
  ArrowRight,
  BadgeCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'

/**
 * IncomeTaxHub: Master landing page for institutional tax governance.
 * Provides navigation to the three primary modules: Rules, Calendar, and Checklist.
 */
export default function IncomeTaxHub() {
  const complianceModules = [
    {
      id: "page-1",
      title: "General Rules & Basics",
      desc: "Fundamental income tax rules for Charitable Trusts, including ITR types and the 85% application principle.",
      icon: FileText,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/20",
      href: "/legal/income-tax-compliances/page-1"
    },
    {
      id: "page-2",
      title: "Compliance Calendar",
      desc: "A month-by-month roadmap (April-March) for mandatory filings like Form 10BD, 10B/10BB and ITR-7.",
      icon: Calendar,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      href: "/legal/income-tax-compliances/page-2"
    },
    {
      id: "page-3",
      title: "Master Audit Checklist",
      desc: "Comprehensive 13-point checklist to ensure your Trust is always ready for a CA audit.",
      icon: ListChecks,
      color: "text-accent",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      href: "/legal/income-tax-compliances/page-3"
    }
  ]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <ShieldCheck className="w-10 h-10 text-accent" />
              </div>
              <div className="space-y-1">
                <Badge className="bg-accent text-primary font-black px-4 py-1 uppercase tracking-tighter text-[10px] mb-2">Governance Hub</Badge>
                <h1 className="text-4xl md:text-6xl font-headline font-bold leading-tight">
                  Income Tax <span className="text-accent italic">Compliances</span>
                </h1>
              </div>
            </div>
            <p className="text-lg md:text-xl text-primary-foreground/80 font-medium leading-relaxed border-l-4 border-accent pl-6 max-w-3xl">
              Master Institutional Hub for Tax Governance, Yearly Filing Calendars, and Audit Readiness Protocols for the Human Rights Affairs Trust.
            </p>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {complianceModules.map((module) => (
              <Card key={module.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden group">
                <CardContent className="p-8 md:p-10 flex flex-col h-full justify-between gap-8">
                   <div className="space-y-6 text-center md:text-left">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 mx-auto md:mx-0", module.bg)}>
                        <module.icon className={cn("w-6 h-6", module.color)} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl md:text-2xl font-headline font-bold text-primary dark:text-white group-hover:text-accent transition-colors leading-tight">
                          {module.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          {module.desc}
                        </p>
                      </div>
                   </div>
                   <Link href={module.href}>
                     <Button className="w-full bg-slate-50 dark:bg-slate-800 text-primary dark:text-white hover:bg-accent hover:text-primary font-bold rounded-xl h-11 border-none shadow-none flex justify-between px-6 group/btn">
                        Open Section <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                     </Button>
                   </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Institutional Compliance Card */}
          <Card className="max-w-6xl mx-auto mt-16 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl border-none">
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
             <CardContent className="p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="p-5 bg-white/10 rounded-[2rem] border border-white/20 shrink-0">
                   <BadgeCheck className="w-12 h-12 text-accent" />
                </div>
                <div className="space-y-4 text-center md:text-left">
                   <h3 className="text-2xl md:text-4xl font-headline font-bold uppercase tracking-tight">Statutory <span className="text-accent italic">Integrity</span></h3>
                   <p className="text-slate-400 text-lg leading-relaxed italic">
                     "Our commitment to transparency and legal compliance is non-negotiable. This hub provides the necessary technical blueprints to maintain the 12AB and 80G status across all regional chapters."
                   </p>
                </div>
             </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
