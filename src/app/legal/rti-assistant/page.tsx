"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Printer, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Send, 
  CheckCircle2, 
  Info,
  Clock,
  UserCheck,
  AlertCircle,
  X,
  ChevronRight,
  IndianRupee,
  Scale,
  Search
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

type RTIStep = {
  title: string
  icon: React.ReactNode
  desc: string
  detailedDesc: string
  color: string
}

export default function RTIAssistantPage() {
  const [selectedStep, setSelectedStep] = useState<RTIStep | null>(null)

  const handlePrint = () => {
    window.print()
  }

  const steps: RTIStep[] = [
    { 
      title: "Drafting", 
      icon: <FileText className="w-5 h-5" />, 
      desc: "Identify the public authority and draft your query.",
      detailedDesc: "The first step is to identify which Public Authority holds the information you need. Draft a clear and concise application. Under the RTI Act, 2005, there is no prescribed format, but the application must specify the details of the information sought in simple language.",
      color: "from-blue-600 to-indigo-600"
    },
    { 
      title: "Fee Payment", 
      icon: <IndianRupee className="w-5 h-5" />, 
      desc: "Attach the required application fee (usually ₹10).",
      detailedDesc: "A nominal application fee (standard ₹10) is mandatory for general citizens. This can be paid via Indian Postal Order, Demand Draft, or electronic means for online portals. Citizens belonging to the Below Poverty Line (BPL) category are exempt from this fee upon submission of proof.",
      color: "from-emerald-600 to-teal-600"
    },
    { 
      title: "Submission", 
      icon: <Send className="w-5 h-5" />, 
      desc: "Submit to the Public Information Officer (PIO).",
      detailedDesc: "The application is submitted to the Central or State Public Information Officer (PIO/APIO). You can submit it via registered post, speed post, or through the RTI Online portal. Always keep a copy of the application and the acknowledgment/tracking receipt.",
      color: "from-amber-600 to-orange-600"
    },
    { 
      title: "Processing", 
      icon: <Clock className="w-5 h-5" />, 
      desc: "PIO examines the request and gathers data.",
      detailedDesc: "Once received, the PIO has a statutory obligation to process the request. They will coordinate with internal departments to gather the information. If the info concerns another department, they must transfer the application within 5 days.",
      color: "from-purple-600 to-violet-600"
    },
    { 
      title: "Response", 
      icon: <CheckCircle2 className="w-5 h-5" />, 
      desc: "Information provided within 30 days (standard).",
      detailedDesc: "The PIO must provide the information or a rejection notice within 30 days of receipt. In cases involving 'Life or Liberty,' the information must be provided within 48 hours. If additional fees for copying are required, the PIO will notify you in writing.",
      color: "from-red-600 to-rose-600"
    },
    { 
      title: "First Appeal", 
      icon: <Scale className="w-5 h-5" />, 
      desc: "Filed if info is denied or delayed beyond 30 days.",
      detailedDesc: "If you receive no response or are unsatisfied with the PIO's decision, you can file a 'First Appeal' within 30 days of the deadline. This is filed with the First Appellate Authority (FAA), who is an officer senior in rank to the PIO.",
      color: "from-cyan-600 to-sky-600"
    },
    { 
      title: "Second Appeal", 
      icon: <ShieldCheck className="w-5 h-5" />, 
      desc: "Filed with the Information Commission (CIC/SIC).",
      detailedDesc: "If the FAA fails to provide a satisfactory resolution, you can file a Second Appeal with the Central Information Commission (CIC) or State Information Commission (SIC) within 90 days. The Commission has the power to penalize officers for non-compliance.",
      color: "from-indigo-600 to-blue-600"
    },
    { 
      title: "Resolution", 
      icon: <Search className="w-5 h-5" />, 
      desc: "Final directive issued by the Commission.",
      detailedDesc: "The Commission reviews the case and issues a final directive. This may include a mandate to provide the information, a penalty for the PIO (₹250 per day up to ₹25,000), or a recommendation for disciplinary action against defaulting officials.",
      color: "from-teal-600 to-emerald-600"
    }
  ]

  const facts = [
    { title: "Statutory Right", detail: "RTI is a fundamental right derived from Article 19(1)(a) of the Constitution." },
    { title: "Universal Access", detail: "Any Indian citizen can file an RTI request regardless of their location." },
    { title: "Zero Reason", detail: "Citizens are NOT required to give any reason for requesting information." },
    { title: "BPL Waiver", detail: "Citizens below the poverty line pay no fees for filing or copying." }
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
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
              <Badge className="bg-emerald-500 text-white font-bold px-3 py-1">Transparency Standard</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              RTI <span className="text-accent italic">Assistant</span> Portal
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium leading-relaxed">
              Your comprehensive guide to the Right to Information Act, 2005. Empowering citizens through transparency and institutional accountability.
            </p>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Governance Support Unit</span>
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
                 <h2 className="text-3xl font-headline font-bold text-primary dark:text-white">Empowerment thru <span className="text-accent italic">Knowledge</span></h2>
                 <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-accent pl-6">
                   "The Right to Information Act, 2005 is a landmark tool that enables any Indian citizen to ask questions and demand accountability from public authorities, promoting a corruption-free democracy."
                 </p>
                 <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Whether it's checking the status of local infrastructure, understanding government spending, or verifying eligibility for schemes—RTI is your key to the truth.
                    </p>
                 </div>
               </div>
               <div className="relative aspect-square md:aspect-auto md:h-80 bg-slate-200 rounded-[3rem] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scale className="w-32 h-32 text-primary opacity-20 transform group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                     <p className="text-xs font-bold uppercase tracking-widest text-primary">Mission Statement</p>
                     <p className="font-bold text-primary dark:text-white">Information is the oxygen of democracy.</p>
                  </div>
               </div>
            </div>

            <div className="space-y-12">
               <div className="text-center">
                 <h2 className="text-3xl font-headline font-bold text-primary dark:text-white">Procedural <span className="text-accent italic">Roadmap</span></h2>
                 <p className="text-slate-500 uppercase font-bold text-[10px] tracking-widest mt-2">Steps to successfully file and resolve an RTI (Click to Explore)</p>
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
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step {i + 1} • Regulatory Standard</span>
                                  </div>
                                  <h2 className="text-4xl md:text-7xl font-headline font-bold leading-tight drop-shadow-xl">
                                    {step.title}
                                  </h2>
                                  <p className="text-xl text-white/80 font-bold uppercase tracking-widest text-sm">RTI Process Stage</p>
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
                                          All steps are governed strictly by the Right to Information Act, 2005. Failure of a public official to adhere to these timelines can lead to penalties imposed by the Information Commission.
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
                    <h2 className="text-4xl font-headline font-bold">RTI <span className="text-accent italic">Quick Facts</span></h2>
                    <p className="text-slate-400 leading-relaxed">
                      Essential information every applicant must know before filing a request.
                    </p>
                  </div>
                  <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                    {facts.map((fact, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <h4 className="font-bold text-lg">{fact.title}</h4>
                        </div>
                        <p className="text-sm text-slate-400 italic">"{fact.detail}"</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <Card className="md:col-span-1 border-none bg-red-50 dark:bg-red-950/20 rounded-[2rem]">
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-6 h-6" /> Exemptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-700 dark:text-red-400/80 mb-6">
                      Under Section 8, certain information is exempt from disclosure.
                    </p>
                    <div className="text-center p-4 bg-white/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                       <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Restricted</p>
                       <p className="font-bold text-slate-900 dark:text-white">National Security & Intelligence</p>
                    </div>
                  </CardContent>
               </Card>
               <Card className="md:col-span-2 border-none shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 p-8">
                  <h4 className="font-bold mb-4 uppercase text-[10px] tracking-widest text-slate-400">Valid Reasons for Rejection:</h4>
                  <ul className="grid md:grid-cols-2 gap-4">
                    {[
                      "Sovereignty and integrity of India",
                      "Security and strategic interests",
                      "Information related to Cabinet papers",
                      "Privacy of third parties (under Sec 11)",
                      "Fiduciary relationship disclosures"
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
               <h3 className="text-2xl font-headline font-bold text-primary dark:text-white mb-4">Final Words</h3>
               <p className="max-w-3xl mx-auto text-slate-500 leading-relaxed">
                 RTI is not just about getting documents—it is about holding power to account. Use this tool responsibly to build a more transparent and just society for all.
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
