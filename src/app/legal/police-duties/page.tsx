"use client"

import React from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ShieldCheck, 
  Gavel, 
  FileText, 
  Users, 
  CheckCircle2, 
  ShieldAlert, 
  Info,
  Scale,
  Printer,
  BadgeCheck,
  UserCheck,
  Lock,
  Search,
  Eye,
  Camera,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'

export default function PoliceDutiesPage() {
  const handlePrint = () => {
    window.print()
  }

  const guidelines = [
    {
      title: "Identification of Personnel",
      icon: <UserCheck className="w-6 h-6 text-accent" />,
      text: "The police personnel carrying out the arrest and handling the interrogation of the arrestee should bear accurate, visible, and clear identification and name tags with their designations."
    },
    {
      title: "Arrest Memo",
      icon: <FileText className="w-6 h-6 text-emerald-500" />,
      text: "That the police officer carrying out the arrest shall prepare a memo of arrest at the time of arrest and such memo shall be attested by at least one witness, who may be either a member of the family of the arrestee or a respectable person of the locality from where the arrest is made. It shall also be counter-signed by the arrestee and shall contain the time and date of arrest."
    },
    {
      title: "Right to Information",
      icon: <Info className="w-6 h-6 text-blue-500" />,
      text: "A person who has been arrested or detained and is being held in custody in a police station or interrogation center or other lock-up, shall be entitled to have one friend or relative or other person known to him or having interest in his welfare being informed, as soon as practicable, that he has been arrested and is being detained at the particular place."
    },
    {
      title: "Diary Entry",
      icon: <BookOpen className="w-6 h-6 text-indigo-500" />,
      text: "An entry must be made in the diary at the place of detention regarding the arrest of the person which shall also disclose the name of the next friend of the person who has been informed of the arrest and the names and particulars of the police officials in whose custody the arrestee is."
    },
    {
      title: "Medical Examination",
      icon: <ShieldCheck className="w-6 h-6 text-sky-500" />,
      text: "The arrestee should, where he so requests, be also examined at the time of his arrest and major and minor injuries, if any present on his/her body, must be recorded at that time. The 'Inspection Memo' must be signed both by the arrestee and the police officer."
    },
    {
      title: "Regular Health Checks",
      icon: <Activity className="w-6 h-6 text-rose-500" />,
      text: "The arrestee should be subjected to medical examination by a trained doctor every 48 hours during his detention in custody by a doctor on the panel of approved doctors appointed by Director, Health Services of the State or Union Territory concerned."
    },
    {
      title: "Magistrate Notification",
      icon: <Gavel className="w-6 h-6 text-purple-500" />,
      text: "Copies of all the documents including the arrest memo, referred to above, should be sent to the Illaqa Magistrate for his record."
    },
    {
      title: "Legal Consultation",
      icon: <Scale className="w-6 h-6 text-amber-500" />,
      text: "The arrestee may be permitted to meet his lawyer during interrogation, though not throughout the interrogation."
    },
    {
      title: "Police Control Room",
      icon: <Search className="w-6 h-6 text-red-500" />,
      text: "A police control room should be provided at all district and state headquarters, where information regarding the arrest and the place of custody of the arrestee shall be communicated by the officer causing the arrest, within 12 hours of effecting the arrest and at the police control room it should be displayed on a conspicuous notice board."
    }
  ]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <ShieldAlert className="w-8 h-8 text-accent" />
              </div>
              <Badge className="bg-emerald-500 text-white font-bold px-3 py-1">DK Basu Guidelines</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Police Duties <span className="text-accent italic">During Arrest</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium leading-relaxed border-l-4 border-accent pl-6">
              Mandatory procedural safeguards for protection of citizen rights during arrest and detention as established by the Supreme Court of India.
            </p>
          </div>
        </div>
      </section>

      {/* Action Toolbar */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Legal Guide • BNSS 2023 Compliant</span>
          </div>
          <Button onClick={handlePrint} className="bg-primary text-white font-bold rounded-xl gap-2 shadow-lg hover:bg-secondary transition-all">
            <Printer className="w-4 h-4" /> Print Guidelines
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="space-y-16">
            
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
               <div className="relative z-10 space-y-8">
                  <div className="text-center max-w-3xl mx-auto space-y-4">
                     <h2 className="text-2xl md:text-4xl font-headline font-bold text-primary dark:text-white">গ্রেপ্তার করার সময় পুলিশের অবশ্য পালনীয় কর্তব্য</h2>
                     <p className="text-slate-500 font-bold uppercase tracking-widest text-xs md:text-sm">মাননীয় সুপ্রিম কোর্টের ডি.কে. বাসু বনাম পশ্চিমবঙ্গ রাজ্য মামলার নির্দেশাবলী</p>
                  </div>
                  
                  <div className="grid gap-6">
                     {guidelines.map((item, idx) => (
                       <div key={idx} className="flex flex-col md:flex-row gap-6 p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-accent/40 transition-all group">
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                             {item.icon}
                          </div>
                          <div className="space-y-2">
                             <h3 className="text-lg font-bold text-primary dark:text-white leading-none">{item.title}</h3>
                             <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                                {item.text}
                             </p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <Card className="rounded-[3rem] bg-slate-900 text-white p-10 md:p-16 border-none shadow-2xl relative overflow-hidden">
               <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full -ml-48 -mb-48 blur-[100px]"></div>
               <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
                  <BadgeCheck className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h3 className="text-2xl md:text-5xl font-headline font-bold leading-tight">Upholding <span className="text-accent italic">Human Dignity</span></h3>
                  <p className="text-slate-300 text-lg leading-relaxed italic">
                    "Arbitrary arrest and custodial torture are the gravest violations of Article 21 of the Indian Constitution. These guidelines are not mere suggestions; they are mandatory legal protocols that every police officer must follow. Knowledge of these rights is the first step towards a just society."
                  </p>
                  <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-6">
                     <div className="bg-white/10 px-6 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest">
                       Article 21 Protected
                     </div>
                     <div className="bg-white/10 px-6 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest">
                       Mandatory Protocol
                     </div>
                  </div>
               </div>
            </Card>

            <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
               <h4 className="text-2xl font-headline font-bold text-primary dark:text-white mb-6">Need Legal Assistance?</h4>
               <p className="max-w-3xl mx-auto text-slate-500 dark:text-slate-400 mb-12">
                 If you or someone you know has experienced a violation of these arrest protocols, our Legal Aid Cell is ready to provide expert guidance and representation.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Link href="/report-a-complaint" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full rounded-xl px-10 h-14 font-bold border-primary text-primary hover:bg-secondary hover:text-white transition-all">
                      File a Violation Report
                    </Button>
                 </Link>
                 <Link href="/legal-aid" className="w-full sm:w-auto">
                    <Button className="w-full rounded-xl px-10 h-14 font-bold bg-accent text-primary hover:bg-secondary hover:text-white shadow-xl shadow-accent/20 transition-all">
                      Get Free Legal Aid
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

import { Activity } from 'lucide-react'
