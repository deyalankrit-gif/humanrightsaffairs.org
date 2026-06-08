"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Printer, 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  Database, 
  UserCheck, 
  Globe, 
  CheckCircle2, 
  Info,
  X,
  ChevronRight,
  Fingerprint,
  Mail,
  Scale
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

type PolicySection = {
  title: string
  icon: React.ReactNode
  desc: string
  detailedDesc: string
}

export default function PrivacyPolicyPage() {
  const [selectedSection, setSelectedSection] = useState<PolicySection | null>(null)

  const handlePrint = () => {
    window.print()
  }

  const sections: PolicySection[] = [
    { 
      title: "Data Collection", 
      icon: <Database className="w-5 h-5" />, 
      desc: "Information we collect during registration and donations.",
      detailedDesc: "We collect personal information necessary for identification and statutory compliance. This includes your full name, contact details, identification numbers (Aadhaar/PAN for 80G tax exemptions), and professional history provided during membership applications. We only collect data that you voluntarily submit through our official forms."
    },
    { 
      title: "Purpose of Use", 
      icon: <Info className="w-5 h-5" />, 
      desc: "How we utilize your information to advance our mission.",
      detailedDesc: "Your data is used to manage organizational memberships, issue digital ID cards, generate authenticated tax receipts for donations, and maintain communication for mission-related updates. We do not use your personal information for commercial marketing or profit-making activities."
    },
    { 
      title: "Data Security", 
      icon: <Lock className="w-5 h-5" />, 
      desc: "High-fidelity encryption and administrative protocols.",
      detailedDesc: "All data is stored in secure Firebase Firestore databases with end-to-end encryption. Access is strictly restricted to authorized administrative officials via multi-factor authentication. We employ continuous monitoring to detect and prevent unauthorized access or data breaches."
    },
    { 
      title: "Third-Party Disclosure", 
      icon: <Globe className="w-5 h-5" />, 
      desc: "Strict non-sharing policy for your personal records.",
      detailedDesc: "JusticeShield maintains a strict zero-sharing policy. We never sell, rent, or trade your personal information. Data is only shared with statutory government authorities (such as the Income Tax Department for 80G filing) when legally mandated under Indian law."
    },
    { 
      title: "Retention Policy", 
      icon: <FileText className="w-5 h-5" />, 
      desc: "How long we store your records in our registry.",
      detailedDesc: "Active member records are retained for the duration of the membership term. Terminated or cancelled membership data is archived in our secure logs for 5 years to maintain institutional transparency and prevent representation fraud. Donation records are kept indefinitely for accounting and auditing purposes."
    },
    { 
      title: "User Rights", 
      icon: <Fingerprint className="w-5 h-5" />, 
      desc: "Your right to access and manage your profile.",
      detailedDesc: "You have the right to access your verified profile at any time through our portal. You may request corrections to inaccurate data or request deletion of your records (subject to statutory audit requirements). All such requests must be made through our official grievance cell."
    },
    { 
      title: "Cookies & Analytics", 
      icon: <Eye className="w-5 h-5" />, 
      desc: "Non-intrusive tracking for portal optimization.",
      detailedDesc: "We use basic cookies and non-personal analytics to understand how users interact with our portal. This helps us optimize the user experience and ensure the security of our internal dashboards. We do not use tracking pixels for advertising purposes."
    },
    { 
      title: "Institutional Oversight", 
      icon: <ShieldCheck className="w-5 h-5" />, 
      desc: "Governance cell responsible for your privacy.",
      detailedDesc: "The Central Council Grievance Cell acts as our designated Data Privacy Office. They oversee the implementation of this policy across all state and district chapters. Any suspected violation of privacy protocols can be reported directly to this cell for immediate investigation."
    }
  ]

  const values = [
    { title: "Transparency", icon: <Eye className="w-6 h-6 text-emerald-500" />, detail: "Clear information on how data flows through our trust." },
    { title: "Integrity", icon: <CheckCircle2 className="w-6 h-6 text-indigo-500" />, detail: "Data is used only for the purpose it was collected." },
    { title: "Sovereignty", icon: <Globe className="w-6 h-6 text-amber-500" />, detail: "All data stays within Indian servers (Google Cloud)." },
    { title: "Legality", icon: <Scale className="w-6 h-6 text-red-500" />, detail: "Strict adherence to the Information Technology Act, 2000." }
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
                <ShieldCheck className="w-8 h-8 text-accent" />
              </div>
              <Badge className="bg-emerald-500 text-white font-bold px-3 py-1 uppercase tracking-tighter text-[10px]">Security Standard v2.0</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Privacy <span className="text-accent italic">Protocols</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium leading-relaxed">
              Your trust is our most valuable asset. We employ military-grade security and strict transparency to safeguard your personal data.
            </p>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Governance</span>
          </div>
          <Button onClick={handlePrint} className="bg-primary text-white font-bold rounded-xl gap-2 shadow-lg hover:bg-secondary transition-all">
            <Printer className="w-4 h-4" /> Print Policy
          </Button>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="space-y-16">
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
               <div className="space-y-6">
                 <h2 className="text-3xl font-headline font-bold text-primary dark:text-white">Our <span className="text-accent italic">Philosophy</span></h2>
                 <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-accent pl-6">
                   "Privacy is not a feature; it is a fundamental human right. At Human Rights Affairs Trust, we treat your information with the same level of care and advocacy that we apply to our mission on the ground."
                 </p>
                 <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      Our digital infrastructure is built on the <strong>Privacy-by-Design</strong> principle, ensuring that security and confidentiality are integrated into every line of code we write.
                    </p>
                 </div>
               </div>
               <div className="relative aspect-square md:aspect-auto md:h-80 bg-slate-200 rounded-[3rem] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-32 h-32 text-primary opacity-20 transform group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                     <p className="text-xs font-bold uppercase tracking-widest text-primary">Core Mandate</p>
                     <p className="font-bold text-primary dark:text-white">Data protection is mission critical.</p>
                  </div>
               </div>
            </div>

            <div className="space-y-12">
               <div className="text-center">
                 <h2 className="text-3xl font-headline font-bold text-primary dark:text-white">Policy <span className="text-accent italic">Framework</span></h2>
                 <p className="text-slate-500 uppercase font-bold text-[10px] tracking-widest mt-2">Comprehensive breakdown of our privacy standards (Click to Explore)</p>
               </div>
               
               <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {sections.map((section, i) => (
                   <Dialog key={i}>
                     <DialogTrigger asChild>
                       <Card 
                        onClick={() => setSelectedSection(section)}
                        className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] bg-white dark:bg-slate-900 group cursor-pointer hover:-translate-y-2 active:scale-95"
                       >
                         <CardContent className="p-8 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                              {section.icon}
                            </div>
                            <h3 className="font-headline font-bold text-xl">{i + 1}. {section.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{section.desc}</p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                               View Details <ChevronRight className="w-3 h-3" />
                            </div>
                         </CardContent>
                       </Card>
                     </DialogTrigger>
                     <DialogContent className="max-w-4xl p-0 border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 flex flex-col [&>button]:hidden max-h-[90vh]">
                        <DialogHeader className="sr-only">
                          <DialogTitle>{section.title}</DialogTitle>
                          <DialogDescription>Detailed breakdown of {section.title}.</DialogDescription>
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
                                  {React.cloneElement(section.icon as React.ReactElement, { className: "w-64 h-64 md:w-96 md:h-96" })}
                                </div>
                                <div className="relative z-10 space-y-4">
                                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                                    <ShieldCheck className="w-4 h-4 text-accent" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Privacy Protocol</span>
                                  </div>
                                  <h2 className="text-4xl md:text-7xl font-headline font-bold leading-tight drop-shadow-xl">
                                    {section.title}
                                  </h2>
                                  <p className="text-xl text-white/80 font-bold uppercase tracking-widest text-sm">Security Classification</p>
                                </div>
                             </div>

                             <div className="p-8 md:p-16 space-y-12 pb-24">
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                                     <span className="w-8 h-px bg-accent"></span> Detailed Briefing
                                  </h3>
                                  <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-body font-medium italic border-l-4 border-accent pl-6">
                                    "{section.detailedDesc}"
                                  </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                   <div className="flex items-start gap-4">
                                      <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md text-emerald-500">
                                        <CheckCircle2 className="w-6 h-6" />
                                      </div>
                                      <div className="space-y-2">
                                        <h4 className="font-bold text-primary dark:text-white uppercase tracking-wider text-sm">Governance Compliance</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                          This policy stage is audited monthly by our national security cell to ensure continuous compliance with the Information Technology Act of India and international human rights standards.
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
                                    Official Privacy Policy • Human Rights Affairs Trust
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
                    <h2 className="text-4xl font-headline font-bold">Privacy <span className="text-accent italic">Values</span></h2>
                    <p className="text-slate-400 leading-relaxed">
                      The core principles that guide our institutional data handling strategy.
                    </p>
                  </div>
                  <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                    {values.map((v, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          {v.icon}
                          <h4 className="font-bold text-lg">{v.title}</h4>
                        </div>
                        <p className="text-sm text-slate-400 italic">"{v.detail}"</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <Card className="md:col-span-1 border-none bg-emerald-50 dark:bg-emerald-950/20 rounded-[2rem]">
                  <CardHeader>
                    <CardTitle className="text-emerald-600 flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6" /> Data Sovereign
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400/80 mb-6">
                      Your information is hosted exclusively on secure servers within the territory of India.
                    </p>
                    <div className="text-center p-4 bg-white/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Location</p>
                       <p className="font-bold text-slate-900 dark:text-white">South Asia Region (MUM)</p>
                    </div>
                  </CardContent>
               </Card>
               <Card className="md:col-span-2 border-none shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 p-8">
                  <h4 className="font-bold mb-4 uppercase text-[10px] tracking-widest text-slate-400 flex items-center gap-2"><Mail className="w-3 h-3 text-accent" /> Privacy Inquiries</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    If you have any questions or concerns regarding our privacy practices, or if you wish to exercise your rights, please contact our National Data Oversight Cell:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                       <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Email Oversight</p>
                       <p className="text-xs font-bold text-primary dark:text-white">official@hrat-india.org</p>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                       <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Direct Helpline</p>
                       <p className="text-xs font-bold text-primary dark:text-white">+91 89811 52748</p>
                    </div>
                  </div>
               </Card>
            </div>

            <div className="text-center pt-8 border-t border-slate-100 dark:border-slate-800">
               <h3 className="text-2xl font-headline font-bold text-primary dark:text-white mb-4">Commitment to Freedom</h3>
               <p className="max-w-3xl mx-auto text-slate-500 leading-relaxed">
                 We believe that data privacy is an extension of the right to liberty. By protecting your digital identity, we are protecting your ability to advocate for justice without fear or compromise.
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
