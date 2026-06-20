"use client"

import React from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ShieldCheck, 
  Scale, 
  Users, 
  CheckCircle2, 
  FileText, 
  Gavel, 
  Globe, 
  Briefcase, 
  GraduationCap,
  Award,
  BookOpen,
  Scale as ScaleIcon,
  UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'

export default function TrustResponsibilitiesPage() {
  const sections = [
    {
      title: "Central Council Responsibilities",
      icon: <Award className="w-8 h-8 text-accent" />,
      items: [
        "National Policy Formulation: Drafting the strategic roadmap for human rights advocacy across India.",
        "Regional Oversight: Monitoring the performance and integrity of State and District Chapters.",
        "Legal Mandate Management: Ensuring organizational compliance with NITI Aayog and Central Government registrations.",
        "External Relations: Representing the Trust at national and international human rights conventions."
      ]
    },
    {
      title: "State Chapter Mandates",
      icon: <Globe className="w-8 h-8 text-emerald-500" />,
      items: [
        "Regional Advocacy: Implementing central missions within the specific cultural and legal context of the State.",
        "Chapter Expansion: Overseeing the establishment and vetting of new District Level Committees.",
        "Government Liaison: Maintaining official representation with the State administration and high courts.",
        "Resource Allocation: Distributing educational materials and legal aid resources to local cells."
      ]
    },
    {
      title: "District Committee Duties",
      icon: <Users className="w-8 h-8 text-indigo-500" />,
      items: [
        "Ground Zero Action: Acting as the primary point of contact for citizens seeking urgent legal assistance.",
        "Case Verification: Conducting fact-finding missions for reported human rights violations in the district.",
        "Local Awareness: Organizing legal literacy camps and community outreach programs in rural blocks.",
        "Member Coordination: Managing the local registry of volunteers and verified members."
      ]
    },
    {
      title: "Staff & Volunteer Ethics",
      icon: <ShieldCheck className="w-8 h-8 text-secondary" />,
      items: [
        "Integrity Protocol: Strictly adhering to the non-disclosure policy and ethical standards of the Trust.",
        "Non-Political Stance: Maintaining a strictly non-partisan and humanitarian approach in all official actions.",
        "Zero Misuse Policy: Ensuring official ID cards and car plates are used solely for authorized institutional duties.",
        "Continuous Learning: Participating in periodic constitutional literacy training and rights workshops."
      ]
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
                <Gavel className="w-8 h-8 text-accent" />
              </div>
              <Badge className="bg-accent text-primary font-bold px-3 py-1 uppercase tracking-tighter text-[10px]">Governance Framework</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 leading-tight">
              Duties & <span className="text-accent italic">Responsibilities</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 font-medium leading-relaxed border-l-4 border-accent pl-6">
              Institutional guidelines defining the operational mandates, ethical conduct, and jurisdictional duties for all HRAT representatives.
            </p>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="grid md:grid-cols-2 gap-8">
              {sections.map((section, idx) => (
                <Card key={idx} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden group">
                  <CardHeader className="p-8 pb-4">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-accent transition-colors duration-500">
                           {React.cloneElement(section.icon as React.ReactElement, { className: "w-6 h-6 text-accent group-hover:text-white" })}
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-headline font-bold text-primary dark:text-white group-hover:text-accent transition-colors">
                          {section.title}
                        </CardTitle>
                     </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-2">
                    <ul className="space-y-4">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Code of Conduct Highlight */}
            <Card className="rounded-[3rem] bg-slate-900 text-white overflow-hidden relative border-none shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
               <CardContent className="p-10 md:p-16 text-center space-y-8 relative z-10">
                  <ShieldCheck className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h3 className="text-2xl md:text-4xl font-headline font-bold">The <span className="text-accent italic">Integrity</span> Mandate</h3>
                  <p className="text-slate-300 text-lg leading-relaxed italic max-w-4xl mx-auto">
                    "Every member of the Human Rights Affairs Trust is a guardian of justice. Our authority is derived from the trust of the citizens we serve. Any representative who compromises organizational values or misuses their credentials faces immediate revocation of their membership."
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 pt-6">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest">
                      Zero Corruption Tolerance
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest">
                      Humanitarian Neutrality
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest">
                      Constitutional Loyalty
                    </div>
                  </div>
               </CardContent>
            </Card>

            {/* Bottom Actions */}
            <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
               <h4 className="text-2xl font-headline font-bold text-primary dark:text-white mb-6">Commitment to Service</h4>
               <p className="max-w-3xl mx-auto text-slate-500 dark:text-slate-400 mb-12">
                 These responsibilities ensure that our organization operates as a unified and effective shield for human rights across the nation. All personnel are expected to uphold these standards in every official interaction.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Link href="/leadership">
                    <Button variant="outline" className="rounded-xl px-10 h-14 font-bold border-primary text-primary hover:bg-secondary hover:text-white transition-all">
                      View Leadership Hierarchy
                    </Button>
                 </Link>
                 <Link href="/#membership">
                    <Button className="rounded-xl px-10 h-14 font-bold bg-accent text-primary hover:bg-secondary hover:text-white shadow-xl shadow-accent/20 transition-all">
                      Join the Mission
                    </Button>
                 </Link>
               </div>
               <div className="mt-12">
                 <Link href="/" className="text-slate-400 hover:text-primary transition-colors font-bold text-sm flex items-center justify-center gap-2">
                   <ArrowLeft className="w-4 h-4" /> Return to Homepage
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
