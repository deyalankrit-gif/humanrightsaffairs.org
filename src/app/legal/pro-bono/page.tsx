"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Printer, 
  HeartHandshake, 
  ShieldCheck, 
  FileText, 
  Users, 
  CheckCircle2, 
  Info,
  Scale,
  X,
  ChevronRight,
  Gavel,
  Briefcase,
  Search,
  AlertCircle,
  GraduationCap
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

type ProBonoStep = {
  title: string
  icon: React.ReactNode
  desc: string
  detailedDesc: string
}

export default function ProBonoPage() {
  const [selectedStep, setSelectedStep] = useState<ProBonoStep | null>(null)

  const handlePrint = () => {
    window.print()
  }

  const steps: ProBonoStep[] = [
    { 
      title: "Initial Screening", 
      icon: <Search className="w-5 h-5" />, 
      desc: "Assessment of case merit and financial eligibility.",
      detailedDesc: "The pro-bono journey begins with a rigorous screening process. Our legal cell evaluates the nature of your grievance to ensure it falls within our human rights mandate. Simultaneously, we assess financial eligibility to prioritize those who genuinely cannot afford professional legal representation, ensuring aid reaches the most vulnerable."
    },
    { 
      title: "Document Review", 
      icon: <FileText className="w-5 h-5" />, 
      desc: "Expert analysis of available evidence and papers.",
      detailedDesc: "Once a case is preliminarily accepted, our team of legal analysts conducts a deep dive into your documentation. This includes reviewing FIRs, medical reports, property deeds, or any existing court orders. A strong evidentiary foundation is critical for successful pro-bono advocacy."
    },
    { 
      title: "Counsel Assignment", 
      icon: <Users className="w-5 h-5" />, 
      desc: "Matching your case with a specialist volunteer advocate.",
      detailedDesc: "We match your specific legal needs with an advocate from our panel of dedicated volunteers. Whether your case involves criminal law, family disputes, or constitutional violations, we ensure you are represented by a professional with the right expertise and a commitment to social justice."
    },
    { 
      title: "Strategic Planning", 
      icon: <Briefcase className="w-5 h-5" />, 
      desc: "Developing a tailored legal roadmap for the case.",
      detailedDesc: "Your assigned advocate will collaborate with the HRAT central cell to draft a comprehensive legal strategy. This roadmap outlines the relevant statutes (such as BNSS or BNS), identifies potential challenges, and sets clear objectives for the litigation or mediation phase."
    },
    { 
      title: "Drafting & Filing", 
      icon: <Gavel className="w-5 h-5" />, 
      desc: "Preparation of petitions and submission to court.",
      detailedDesc: "The advocate prepares all necessary legal drafts, including writ petitions, bail applications, or civil suits. These documents are filed in the competent court. HRAT ensures that all procedural formalities are met, providing a seamless start to the judicial proceedings."
    },
    { 
      title: "Judicial Representation", 
      icon: <Scale className="w-5 h-5" />, 
      desc: "Direct advocacy and arguments before the judge.",
      detailedDesc: "On the day of the hearing, your pro-bono advocate appears in court to represent your interests. They present oral arguments, cross-examine witnesses if necessary, and ensure that your voice is heard clearly and professionally within the temple of justice."
    },
    { 
      title: "Litigation Support", 
      icon: <ShieldCheck className="w-5 h-5" />, 
      desc: "Continuous monitoring and procedural assistance.",
      detailedDesc: "Beyond the courtroom, HRAT provides ongoing support. We track the status of your case, handle communication with court officials, and provide regular updates. We also assist in obtaining certified copies of orders and ensuring they are implemented on the ground."
    },
    { 
      title: "Final Advocacy", 
      icon: <GraduationCap className="w-5 h-5" />, 
      desc: "Ensuring rights are upheld through to resolution.",
      detailedDesc: "Our commitment doesn't end with a judgment. We provide post-resolution advocacy to ensure that court directives are followed by administrative authorities. Whether it is securing a release from custody or ensuring a compensation payout, we stand by you until justice is fully served."
    }
  ]

  const eligibility = [
    { title: "Marginalized Communities", detail: "Members of Scheduled Castes (SC) and Scheduled Tribes (ST)." },
    { title: "Vulnerable Groups", detail: "Women, children, and victims of human trafficking or forced labor." },
    { title: "Specially Abled", detail: "Persons with disabilities as defined under the relevant statutes." },
    { title: "Custodial Aid", detail: "Persons in custody, including under-trials in jail." },
    { title: "Economic Criteria", detail: "Individuals whose annual income falls below the prescribed limit (verified via affidavit)." }
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
                <HeartHandshake className="w-8 h-8 text-accent" />
              </div>
              <Badge className="bg-emerald-500 text-white font-bold px-3 py-1">Pro-Bono Standard</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Pro-Bono <span className="text-accent italic">Legal Aid</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium leading-relaxed">
              Eliminating the financial barriers to justice. Access expert legal representation and consultation at zero cost for eligible citizens.
            </p>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Social Justice Unit</span>
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
                 <h2 className="text-3xl font-headline font-bold text-primary dark:text-white">Our <span className="text-accent italic">Commitment</span></h2>
                 <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-accent pl-6">
                   "Justice should not be for sale. Our Pro-Bono Services ensure that the poorest of the poor have the same legal standing as the most powerful, upholding the constitutional promise of equality before the law."
                 </p>
                 <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Through a national network of volunteer advocates, we provide end-to-end litigation support, from drafting petitions to final arguments in court.
                    </p>
                 </div>
               </div>
               <div className="relative aspect-square md:aspect-auto md:h-80 bg-slate-200 rounded-[3rem] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HeartHandshake className="w-32 h-32 text-primary opacity-20 transform group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                     <p className="text-xs font-bold uppercase tracking-widest text-primary">Core Value</p>
                     <p className="font-bold text-primary dark:text-white">Empowering the voiceless through law.</p>
                  </div>
               </div>
            </div>

            <div className="space-y-12">
               <div className="text-center">
                 <h2 className="text-3xl font-headline font-bold text-primary dark:text-white">Service <span className="text-accent italic">Roadmap</span></h2>
                 <p className="text-slate-500 uppercase font-bold text-[10px] tracking-widest mt-2">The Pro-Bono Lifecycle (Click to Explore)</p>
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
                          <DialogDescription>Detailed breakdown of {step.title}.</DialogDescription>
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
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step {i + 1} • Pro-Bono Protocol</span>
                                  </div>
                                  <h2 className="text-4xl md:text-7xl font-headline font-bold leading-tight drop-shadow-xl">
                                    {step.title}
                                  </h2>
                                  <p className="text-xl text-white/80 font-bold uppercase tracking-widest text-sm">Legal Service Stage</p>
                                </div>
                             </div>

                             <div className="p-8 md:p-16 space-y-12 pb-24">
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                                     <span className="w-8 h-px bg-accent"></span> Process Details
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
                                        <h4 className="font-bold text-primary dark:text-white uppercase tracking-wider text-sm">Commitment to Ethics</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                          Our pro-bono services are provided with the highest standards of professional ethics. Advocates volunteer their time while HRAT oversees the quality and progress of every case.
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
                                    Official Legal Aid Guide • Human Rights Affairs Trust
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
                    <h2 className="text-4xl font-headline font-bold">Eligibility <span className="text-accent italic">Criteria</span></h2>
                    <p className="text-slate-400 leading-relaxed">
                      Who can apply for pro-bono services as per NALSA guidelines and HRAT policy.
                    </p>
                  </div>
                  <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                    {eligibility.map((item, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <h4 className="font-bold text-lg">{item.title}</h4>
                        </div>
                        <p className="text-sm text-slate-400 italic">"{item.detail}"</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <Card className="md:col-span-1 border-none bg-red-50 dark:bg-red-950/20 rounded-[2rem]">
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-6 h-6" /> Note
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-700 dark:text-red-400/80 mb-6">
                      Pro-bono aid covers advocate fees. However, mandatory court fees or administrative costs may apply unless exempted by the State.
                    </p>
                    <div className="text-center p-4 bg-white/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                       <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Coverage</p>
                       <p className="font-bold text-slate-900 dark:text-white">Expert Time & Advice</p>
                    </div>
                  </CardContent>
               </Card>
               <Card className="md:col-span-2 border-none shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 p-8">
                  <h4 className="font-bold mb-4 uppercase text-[10px] tracking-widest text-slate-400">Available Support Channels:</h4>
                  <ul className="grid md:grid-cols-2 gap-4">
                    {[
                      "Supreme Court & High Court Petitions",
                      "District Court Litigation",
                      "Family Court & Mediation",
                      "Consumer Forum Support",
                      "Criminal Defense (Select Cases)"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
               </Card>
            </div>

            <div className="text-center pt-8 border-t border-slate-100 dark:border-slate-800">
               <h3 className="text-2xl font-headline font-bold text-primary dark:text-white mb-4">Empowering Citizens</h3>
               <p className="max-w-3xl mx-auto text-slate-500 leading-relaxed">
                 We believe that professional legal support is a right, not a luxury. Our pro-bono wing is dedicated to ensuring that no one is denied justice due to financial constraints.
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
