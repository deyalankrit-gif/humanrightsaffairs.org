
"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  ShieldCheck, 
  BadgeCheck, 
  FileCheck, 
  Globe, 
  Building2, 
  Gavel, 
  CheckCircle2, 
  FileText,
  ExternalLink,
  Award,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'

export default function TrustCredentialsPage() {
  const credentials = [
    {
      title: "Government Registration",
      icon: <Building2 className="w-8 h-8 text-accent" />,
      detail: "Human Rights Affairs Trust is registered under the Societies Registration Act, functioning as a non-profit human rights organization.",
      ref: "Reg No: WB/2025/0762605"
    },
    {
      title: "NITI Aayog (NGO-Darpan)",
      icon: <FileCheck className="w-8 h-8 text-emerald-500" />,
      detail: "Official enlistment with NITI Aayog, Government of India, ensuring institutional transparency and eligibility for government collaborations.",
      link: "https://ngodarpan.gov.in/#/search-ngo"
    },
    {
      title: "80G Tax Exemption",
      icon: <CheckCircle2 className="w-8 h-8 text-indigo-500" />,
      detail: "Donations to the Trust are exempt under Section 80G of the Income Tax Act, 1961, promoting charitable contributions for social justice.",
      ref: "Verified Status"
    },
    {
      title: "National Presence",
      icon: <Globe className="w-8 h-8 text-sky-500" />,
      detail: "Operating across multiple states with regional chapters dedicated to promoting constitutional literacy and providing legal aid.",
      ref: "Pan-India Operations"
    }
  ]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <Badge className="bg-accent text-primary font-bold px-3 py-1 uppercase tracking-tighter text-[10px]">Institutional Veracity</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 leading-tight">
              Trust <span className="text-accent italic">Credentials</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 font-medium leading-relaxed border-l-4 border-accent pl-6">
              Official registration details, government affiliations, and statutory compliance records of the Human Rights Affairs Trust (Justice Shield).
            </p>
          </div>
        </div>
      </section>

      {/* Credentials Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="grid md:grid-cols-2 gap-8">
              {credentials.map((cred, idx) => (
                <Card key={idx} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden group">
                  <CardHeader className="p-8 pb-4">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-accent transition-colors duration-500">
                           {React.cloneElement(cred.icon as React.ReactElement, { className: "w-6 h-6 text-accent group-hover:text-white" })}
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-headline font-bold text-primary dark:text-white group-hover:text-accent transition-colors">
                          {cred.title}
                        </CardTitle>
                     </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-2 space-y-4">
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {cred.detail}
                    </p>
                    {cred.ref && (
                      <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-[10px] font-bold text-primary dark:text-white uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                        <BadgeCheck className="w-3.5 h-3.5 text-accent" />
                        {cred.ref}
                      </div>
                    )}
                    {cred.link && (
                      <a 
                        href={cred.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-accent hover:text-secondary font-bold text-xs uppercase tracking-widest transition-colors"
                      >
                        Verify on NGO-Darpan <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Logo & Emblem Focus */}
            <Card className="rounded-[3rem] bg-slate-900 text-white overflow-hidden relative border-none shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
               <CardContent className="p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 relative z-10">
                  <div className="relative w-40 h-40 md:w-56 md:h-56 shrink-0 bg-transparent p-4 rounded-[2rem] shadow-2xl rotate-[-3deg]">
                    <Image src="/HRAT%20Logo.jpeg" alt="Official Logo" fill className="object-contain p-4" />
                  </div>
                  <div className="space-y-6 text-center md:text-left">
                    <h3 className="text-2xl md:text-4xl font-headline font-bold">The <span className="text-accent italic">Justice Shield</span> Emblem</h3>
                    <p className="text-slate-300 text-lg leading-relaxed italic">
                      "Our logo represents the collective strength of citizens protected by the shield of the law. The scales of justice at its heart signify our unwavering commitment to equality and humanitarian principles."
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                      <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                        Copyright Protected
                      </div>
                      <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                        Official Seal
                      </div>
                    </div>
                  </div>
               </CardContent>
            </Card>

            {/* Bottom Actions */}
            <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
               <h4 className="text-2xl font-headline font-bold text-primary dark:text-white mb-6">Transparency & Accountability</h4>
               <p className="max-w-3xl mx-auto text-slate-500 dark:text-slate-400 mb-12">
                 Human Rights Affairs Trust maintains an open-door policy regarding institutional records. For specific verification requests or official documents, please contact the National Registry Cell.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Link href="/#helpline">
                    <Button variant="outline" className="rounded-xl px-10 h-14 font-bold border-primary text-primary hover:bg-secondary hover:text-white transition-all">
                      Contact Registry Cell
                    </Button>
                 </Link>
                 <Link href="/legal-aid">
                    <Button className="rounded-xl px-10 h-14 font-bold bg-accent text-primary hover:bg-secondary hover:text-white shadow-xl shadow-accent/20 transition-all">
                      Explore Legal Services
                    </Button>
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
