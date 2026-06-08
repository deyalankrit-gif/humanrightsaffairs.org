"use client"

import React from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Printer, 
  Gavel, 
  ShieldCheck, 
  Scale, 
  Lock, 
  CheckCircle2, 
  Info,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'

export default function BailProcedurePage() {
  const handlePrint = () => {
    window.print()
  }

  const steps = [
    { title: "Arrest", icon: <Lock className="w-5 h-5" />, desc: "Produced before Magistrate within prescribed time." },
    { title: "Classification", icon: <Scale className="w-5 h-5" />, desc: "Bailable (statutory right) vs Non-Bailable (court discretion)." },
    { title: "Application", icon: <Info className="w-5 h-5" />, desc: "Legal counsel files application with particulars of the case." },
    { title: "Hearing", icon: <Gavel className="w-5 h-5" />, desc: "Court considers submissions from prosecution and defense." },
    { title: "Judicial Discretion", icon: <ShieldCheck className="w-5 h-5" />, desc: "Nature of offence, antecedents, and risk of tampering considered." },
    { title: "Grant of Bail", icon: <CheckCircle2 className="w-5 h-5" />, desc: "Court imposes conditions (bond, surety, travel limits)." },
    { title: "Execution", icon: <UserCheck className="w-5 h-5" />, desc: "Accused/sureties submit documents and sign bonds." },
    { title: "Release", icon: <ArrowLeft className="w-5 h-5" />, desc: "Authorities release the accused from custody." }
  ]

  const types = [
    { name: "Regular Bail", icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />, detail: "Granted after arrest by a competent court." },
    { name: "Anticipatory Bail", icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />, detail: "Pre-arrest remedy for apprehended non-bailable offences." },
    { name: "Interim Bail", icon: <Clock className="w-6 h-6 text-amber-500" />, detail: "Temporary release until main application is decided." },
    { name: "Default Bail", icon: <Scale className="w-6 h-6 text-red-500" />, detail: "Statutory right if investigation is not finished in time." }
  ]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary via-primary/95 to-accent text-primary-foreground relative overflow-hidden border-b-8 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Gavel className="w-8 h-8 text-accent" />
              </div>
              <Badge className="bg-emerald-500 text-white font-bold px-3 py-1">BNSS 2023 Standard</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Bail <span className="text-accent italic">Procedure</span> Insights
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium leading-relaxed">
              Understanding the temporary release process and judicial mechanisms safeguarding personal liberty under the Bharatiya Nagarik Suraksha Sanhita.
            </p>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Legal Knowledge Base</span>
          </div>
          <Button onClick={handlePrint} className="bg-primary text-white font-bold rounded-xl gap-2 shadow-lg hover:bg-secondary transition-all">
            <Printer className="w-4 h-4" /> Print Briefing
          </Button>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="space-y-16">
            
            {/* Overview Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
               <div className="space-y-6">
                 <h2 className="text-3xl font-headline font-bold text-primary dark:text-white">Legal <span className="text-accent italic">Definition</span></h2>
                 <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-accent pl-6">
                   "Bail is a legal process through which an accused person is temporarily released from custody during investigation or trial, protecting personal liberty while ensuring judicial cooperation."
                 </p>
                 <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Under the provisions of the <strong>Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023</strong>, the objective is to balance the rights of the individual with the interests of justice and public safety.
                    </p>
                 </div>
               </div>
               <div className="relative aspect-square md:aspect-auto md:h-80 bg-slate-200 rounded-[3rem] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scale className="w-32 h-32 text-primary opacity-20 transform group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                     <p className="text-xs font-bold uppercase tracking-widest text-primary">Core Objective</p>
                     <p className="font-bold text-primary dark:text-white">Presumption of Innocence until proven guilty.</p>
                  </div>
               </div>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-12">
               <div className="text-center">
                 <h2 className="text-3xl font-headline font-bold text-primary dark:text-white">The release <span className="text-accent italic">Roadmap</span></h2>
                 <p className="text-slate-500 uppercase font-bold text-[10px] tracking-widest mt-2">Sequential Steps in the Bail Procedure</p>
               </div>
               <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {steps.map((step, i) => (
                   <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] bg-white dark:bg-slate-900 group">
                     <CardContent className="p-8 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                          {step.icon}
                        </div>
                        <h3 className="font-headline font-bold text-xl">{i + 1}. {step.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                     </CardContent>
                   </Card>
                 ))}
               </div>
            </div>

            {/* Types of Bail */}
            <div className="bg-slate-900 text-white rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
               <div className="relative z-10 grid lg:grid-cols-3 gap-12 items-start">
                  <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-4xl font-headline font-bold">Types of <span className="text-accent italic">Bail</span></h2>
                    <p className="text-slate-400 leading-relaxed">
                      Classification of bail instruments available to individuals based on the stage of investigation and the nature of the alleged offence.
                    </p>
                  </div>
                  <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                    {types.map((type, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          {type.icon}
                          <h4 className="font-bold text-lg">{type.name}</h4>
                        </div>
                        <p className="text-sm text-slate-400 italic">"{type.detail}"</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Cancellation Section */}
            <div className="grid md:grid-cols-3 gap-8">
               <Card className="md:col-span-1 border-none bg-red-50 dark:bg-red-950/20 rounded-[2rem]">
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-6 h-6" /> Cancellation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-700 dark:text-red-400/80 mb-6">
                      The court reserves the right to cancel bail if the released person violates judicial conditions.
                    </p>
                    <div className="text-center p-4 bg-white/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                       <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Consequence</p>
                       <p className="font-bold text-slate-900 dark:text-white">Immediate Re-arrest & Detention</p>
                    </div>
                  </CardContent>
               </Card>
               <Card className="md:col-span-2 border-none shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 p-8">
                  <h4 className="font-bold mb-4 uppercase text-[10px] tracking-widest text-slate-400">Violations leading to revocation:</h4>
                  <ul className="grid md:grid-cols-2 gap-4">
                    {[
                      "Violation of bail conditions",
                      "Influencing or threatening witnesses",
                      "Tampering with case evidence",
                      "Committing another offence while on bail",
                      "Failure to appear before the court"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
               </Card>
            </div>

            {/* Conclusion */}
            <div className="text-center pt-8 border-t border-slate-100 dark:border-slate-800">
               <h3 className="text-2xl font-headline font-bold text-primary dark:text-white mb-4">Conclusion</h3>
               <p className="max-w-3xl mx-auto text-slate-500 leading-relaxed">
                 Grant of bail does not amount to an acquittal or a declaration of innocence. It is a legal mechanism designed to safeguard personal liberty while ensuring presence and cooperation throughout the trial. The court balances the rights of the accused with the interests of public safety.
               </p>
               <div className="mt-12 flex flex-col items-center gap-4">
                 <Link href="/">
                    <Button variant="ghost" className="gap-2 font-bold text-slate-400 hover:text-primary">
                      <ArrowLeft className="w-4 h-4" /> Return to Homepage
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
