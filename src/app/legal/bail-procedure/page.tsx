"use client"

import React, { useState } from 'react'
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
  AlertCircle,
  X,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils'

type BailStep = {
  title: string
  icon: React.ReactNode
  desc: string
  detailedDesc: string
  color: string
}

export default function BailProcedurePage() {
  const [selectedStep, setSelectedStep] = useState<BailStep | null>(null)

  const handlePrint = () => {
    window.print()
  }

  const steps: BailStep[] = [
    { 
      title: "Arrest", 
      icon: <Lock className="w-5 h-5" />, 
      desc: "Produced before Magistrate within prescribed time.",
      detailedDesc: "When a person is arrested for an alleged offence, they are taken into police custody and must be produced before the competent Magistrate within the time prescribed by law. This production must occur within 24 hours (excluding travel time), ensuring the detainee's right to judicial oversight is upheld immediately and preventing unauthorized detention.",
      color: "from-blue-600 to-indigo-600"
    },
    { 
      title: "Classification", 
      icon: <Scale className="w-5 h-5" />, 
      desc: "Bailable (statutory right) vs Non-Bailable (court discretion).",
      detailedDesc: "Offences are generally classified into two categories: Bailable Offences, where the accused has a statutory right to be released on bail (the police or court must grant release upon execution of a bond), and Non-Bailable Offences, where release is not a right and is granted solely at the discretion of the court after weighing the facts and circumstances of the case.",
      color: "from-emerald-600 to-teal-600"
    },
    { 
      title: "Application", 
      icon: <Info className="w-5 h-5" />, 
      desc: "Legal counsel files application with particulars of the case.",
      detailedDesc: "The accused or their legal counsel files a formal bail application before the appropriate court. This document contains comprehensive details of the accused, the specific particulars of the case, and the legal grounds on which bail is sought—such as the absence of a prima facie case, medical grounds, or lack of necessity for custodial interrogation.",
      color: "from-amber-600 to-orange-600"
    },
    { 
      title: "Hearing", 
      icon: <Gavel className="w-5 h-5" />, 
      desc: "Court considers submissions from prosecution and defense.",
      detailedDesc: "Upon receiving the application, the court conducts a formal hearing. The presiding judge considers oral and written submissions from both the prosecution (who may oppose bail based on risk to the public or potential absconding) and the defense. The case diary and police reports are typically examined during this stage.",
      color: "from-purple-600 to-violet-600"
    },
    { 
      title: "Judicial Discretion", 
      icon: <ShieldCheck className="w-5 h-5" />, 
      desc: "Nature of offence and risk factors considered.",
      detailedDesc: "While deciding a bail application, the court exercises its discretion based on several factors: the gravity of the offence, criminal antecedents, the likelihood of the accused absconding, the possibility of influencing witnesses, the risk of tampering with evidence, and the status of the investigation. The goal is to balance personal liberty with the interests of justice.",
      color: "from-red-600 to-rose-600"
    },
    { 
      title: "Grant of Bail", 
      icon: <CheckCircle2 className="w-5 h-5" />, 
      desc: "Court imposes conditions (bond, surety, travel limits).",
      detailedDesc: "If satisfied that bail should be granted, the court issues an order imposing specific conditions. These typically include the execution of a personal bond, furnishing one or more reliable sureties, mandates for regular appearance before investigators, restrictions on traveling abroad, and an undertaking not to contact witnesses.",
      color: "from-cyan-600 to-sky-600"
    },
    { 
      title: "Execution", 
      icon: <UserCheck className="w-5 h-5" />, 
      desc: "Accused/sureties submit documents and sign bonds.",
      detailedDesc: "The accused and the required sureties execute the bail bond and submit all necessary documentation (ID proof, property papers, or cash security) as directed by the court. The registrar or clerk of the court verifies these documents to ensure the financial and legal undertakings are valid and binding.",
      color: "from-indigo-600 to-blue-600"
    },
    { 
      title: "Release", 
      icon: <ArrowLeft className="w-5 h-5" />, 
      desc: "Authorities release the accused from custody.",
      detailedDesc: "Once all bail conditions are fulfilled and the bond is officially accepted, the court issues a release order ('Release Memo'). This is communicated to the jail or police authorities, who then release the accused from physical custody. The individual remains under the court's jurisdiction for the remainder of the trial.",
      color: "from-teal-600 to-emerald-600"
    }
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
              Detailed breakdown of the judicial mechanism safeguarding personal liberty under the Bharatiya Nagarik Suraksha Sanhita.
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
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
               <div className="space-y-6">
                 <h2 className="text-3xl font-headline font-bold text-primary dark:text-white">Legal <span className="text-accent italic">Definition</span></h2>
                 <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-accent pl-6">
                   "Bail is a legal process through which an accused person is temporarily released from custody during investigation or trial, protecting personal liberty while ensuring judicial cooperation."
                 </p>
                 <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Under the provisions of the <strong>BNSS, 2023</strong>, the objective is to protect individual rights while ensuring the cooperation of the accused with the investigation.
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
                     <p className="font-bold text-primary dark:text-white">Ensuring presence without compromising liberty.</p>
                  </div>
               </div>
            </div>

            <div className="space-y-12">
               <div className="text-center">
                 <h2 className="text-3xl font-headline font-bold text-primary dark:text-white">The release <span className="text-accent italic">Roadmap</span></h2>
                 <p className="text-slate-500 uppercase font-bold text-[10px] tracking-widest mt-2">Sequential Steps in the Bail Procedure (Click to Explore)</p>
               </div>
               
               <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {steps.map((step, i) => (
                   <Dialog key={i}>
                     <DialogTrigger asChild>
                       <Card 
                        onClick={() => setSelectedStep(step)}
                        className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] bg-white dark:bg-slate-900 group cursor-pointer hover:-translate-y-2 active:scale-95"
                       >
                         <CardContent className="p-8 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                              {step.icon}
                            </div>
                            <h3 className="font-headline font-bold text-xl">{i + 1}. {step.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{step.desc}</p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                               View Details <ChevronRight className="w-3 h-3" />
                            </div>
                         </CardContent>
                       </Card>
                     </DialogTrigger>
                     <DialogContent className="max-w-4xl p-0 border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 flex flex-col [&>button]:hidden max-h-[90vh]">
                        <DialogHeader className="sr-only">
                          <DialogTitle>{step.title}</DialogTitle>
                          <DialogDescription>Detailed legal breakdown of {step.title}.</DialogDescription>
                        </DialogHeader>
                        
                        <div className="absolute right-6 top-6 z-50">
                          <DialogClose asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full bg-blue-600 hover:bg-blue-500 text-white h-10 w-10 shadow-xl border-2 border-white/20 transition-all hover:scale-110 hover:rotate-90 duration-300 active:scale-95"
                            >
                              <X className="w-6 h-6 text-white" />
                            </Button>
                          </DialogClose>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                           <div className="flex flex-col">
                             <div className={cn("relative p-12 md:p-16 text-white overflow-hidden border-b-8 border-accent/20 bg-gradient-to-br from-primary via-primary/95 to-accent")}>
                                <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-[-10px]">
                                  {React.cloneElement(step.icon as React.ReactElement, { className: "w-64 h-64 md:w-96 md:h-96" })}
                                </div>
                                <div className="relative z-10 space-y-4">
                                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                                    <ShieldCheck className="w-4 h-4 text-accent" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step {i + 1} • Procedural Record</span>
                                  </div>
                                  <h2 className="text-4xl md:text-7xl font-headline font-bold leading-tight drop-shadow-xl">
                                    {step.title}
                                  </h2>
                                  <p className="text-xl text-white/80 font-bold uppercase tracking-widest text-sm">Legal Stage Classification</p>
                                </div>
                             </div>

                             <div className="p-8 md:p-16 space-y-12 pb-24">
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                                     <span className="w-8 h-px bg-accent"></span> Detailed Briefing
                                  </h3>
                                  <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-body font-medium italic border-l-4 border-accent pl-6">
                                    "{step.detailedDesc}"
                                  </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                   <div className="flex items-start gap-4">
                                      <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md text-emerald-500">
                                        <CheckCircle2 className="w-6 h-6" />
                                      </div>
                                      <div className="space-y-2">
                                        <h4 className="font-bold text-primary dark:text-white uppercase tracking-wider text-sm">Key Regulatory Compliance</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                          This stage is governed strictly by the provisions of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, ensuring that the rights of the citizen are preserved throughout the judicial process.
                                        </p>
                                      </div>
                                   </div>
                                </div>

                                <div className="pt-12 flex flex-col gap-4 items-center">
                                  <DialogClose asChild>
                                    <Button 
                                      size="lg" 
                                      className="w-full bg-primary text-primary-foreground font-bold h-16 rounded-2xl text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-primary/20"
                                    >
                                      Close Page
                                    </Button>
                                  </DialogClose>
                                  <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-4">
                                    Official Legal Guide • Human Rights Affairs Trust
                                  </p>
                                </div>
                             </div>
                           </div>
                        </div>
                     </DialogContent>
                   </Dialog>
                 ))}
               </div>
            </div>

            <div className="bg-slate-900 text-white rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
               <div className="relative z-10 grid lg:grid-cols-3 gap-12 items-start">
                  <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-4xl font-headline font-bold">Types of <span className="text-accent italic">Bail</span></h2>
                    <p className="text-slate-400 leading-relaxed">
                      Classification of bail instruments available based on the stage of investigation and nature of offence.
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

            <div className="grid md:grid-cols-3 gap-8">
               <Card className="md:col-span-1 border-none bg-red-50 dark:bg-red-950/20 rounded-[2rem]">
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-6 h-6" /> Cancellation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-700 dark:text-red-400/80 mb-6">
                      The court reserves the right to cancel bail if conditions are violated or if the trial process is obstructed.
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
                      "Tampering with evidence",
                      "Committing another offence",
                      "Failure to appear before court"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
               </Card>
            </div>

            <div className="text-center pt-8 border-t border-slate-100 dark:border-slate-800">
               <h3 className="text-2xl font-headline font-bold text-primary dark:text-white mb-4">Conclusion</h3>
               <p className="max-w-3xl mx-auto text-slate-500 leading-relaxed">
                 Grant of bail does not amount to an acquittal or a declaration of innocence. It is a legal mechanism designed to safeguard the personal liberty of an accused person while ensuring their presence and cooperation throughout the investigation and trial.
               </p>
               <div className="mt-12">
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
