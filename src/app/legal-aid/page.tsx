"use client"

import React from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ShieldCheck, 
  Scale, 
  FileText, 
  Users, 
  CheckCircle2, 
  HeartHandshake,
  Building2,
  Lock,
  UserCheck,
  Globe,
  Gavel,
  Briefcase,
  GraduationCap,
  Network,
  PhoneCall
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const services = [
  {
    id: 1,
    title: "Affordable and, in deserving cases, Free Initial Legal Consultation",
    Icon: Users,
    iconColor: "text-accent",
    bullets: [
      "Initial consultation with a legal professional.",
      "Explanation of the legal aspects and merits of the case.",
      "Guidance on available remedies and possible legal actions."
    ]
  },
  {
    id: 2,
    title: "Legal Documentation Assistance",
    Icon: FileText,
    iconColor: "text-emerald-500",
    bullets: [
      "Drafting of complaints and representations.",
      "Preparation of legal notices.",
      "Assistance with affidavits.",
      "RTI (Right to Information) applications.",
      "Support in completing and submitting various government application forms."
    ]
  },
  {
    id: 3,
    title: "FIR and Police Assistance",
    Icon: Gavel,
    iconColor: "text-blue-500",
    bullets: [
      "Assistance in drafting FIRs and police complaints.",
      "Guidance on filing complaints with law enforcement authorities.",
      "Advice regarding investigation procedures and progress.",
      "Awareness and guidance on victims' rights."
    ]
  },
  {
    id: 4,
    title: "Human Rights Protection Services",
    Icon: ShieldCheck,
    iconColor: "text-indigo-500",
    bullets: [
      "Receiving and reviewing complaints relating to human rights violations.",
      "Fact-finding and information collection.",
      "Representation before relevant authorities.",
      "Submission of complaints and representations to commissions and administrative bodies."
    ]
  },
  {
    id: 5,
    title: "Women and Child Protection Cell",
    Icon: HeartHandshake,
    iconColor: "text-pink-500",
    bullets: [
      "Assistance in cases of domestic violence.",
      "Support for victims of sexual harassment.",
      "Guidance in matters involving child abuse and child protection.",
      "Assistance with maintenance and support-related issues.",
      "Advice on the POCSO Act and other laws relating to women's rights and protection."
    ]
  },
  {
    id: 6,
    title: "Senior Citizen Assistance",
    Icon: UserCheck,
    iconColor: "text-amber-600",
    bullets: [
      "Guidance on property-related disputes.",
      "Support in cases of neglect, abuse, or mistreatment.",
      "Advice on rights and protections available under the Maintenance and Welfare of Parents and Senior Citizens Act."
    ]
  },
  {
    id: 7,
    title: "Cyber Crime Assistance",
    Icon: Lock,
    iconColor: "text-red-500",
    bullets: [
      "Guidance in cases of online fraud and cyber scams.",
      "Assistance regarding social media harassment.",
      "Support in cases involving digital blackmail and cyber extortion.",
      "Guidance on filing cyber crime complaints."
    ]
  },
  {
    id: 8,
    title: "Workers' and Employees' Rights Assistance",
    Icon: Briefcase,
    iconColor: "text-orange-500",
    bullets: [
      "Assistance regarding unpaid wages and salary disputes.",
      "Guidance in cases of unlawful termination or workplace grievances.",
      "Advice on labor laws and employment rights.",
      "Information and assistance regarding ESI, PF, and other statutory benefits."
    ]
  },
  {
    id: 9,
    title: "Consumer Protection Assistance",
    Icon: Scale,
    iconColor: "text-cyan-500",
    bullets: [
      "Support in matters involving defective products or deficient services.",
      "Assistance in filing complaints before Consumer Commissions."
    ]
  },
  {
    id: 10,
    title: "Mediation and Dispute Resolution Services",
    Icon: Globe,
    iconColor: "text-teal-600",
    bullets: [
      "Family dispute resolution.",
      "Neighborhood and community dispute mediation.",
      "Assistance in resolving minor business disputes.",
      "Promotion of amicable settlements outside court proceedings."
    ]
  },
  {
    id: 11,
    title: "Legal Awareness Programmes",
    Icon: GraduationCap,
    iconColor: "text-violet-500",
    bullets: [
      "Legal awareness camps in urban and rural areas.",
      "Seminars and workshops on human rights, women's rights, child rights, and cyber safety.",
      "Distribution of legal awareness literature, booklets, and informational materials."
    ]
  },
  {
    id: 12,
    title: "Referral Panel Services",
    Icon: Network,
    iconColor: "text-slate-500",
    bullets: [
      "Referral of complex matters to experienced legal practitioners.",
      "Facilitation of access to Pro Bono (free legal) services wherever available."
    ]
  },
  {
    id: 13,
    title: "Assistance in Accessing Government Schemes and Benefits",
    Icon: Building2,
    iconColor: "text-accent",
    bullets: [
      "Information regarding government welfare schemes and entitlements.",
      "Guidance in application and documentation procedures.",
      "Awareness of legal rights and public benefits."
    ]
  },
  {
    id: 14,
    title: "Legal Aid Helpline",
    Icon: PhoneCall,
    iconColor: "text-emerald-600",
    bullets: [
      "Assistance through phone, WhatsApp, and email.",
      "Online complaint registration and support.",
      "Case tracking and follow-up assistance."
    ]
  }
]

export default function LegalAidServicesPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Gavel className="w-8 h-8 text-accent" />
              </div>
              <Badge className="bg-accent text-primary font-bold px-3 py-1 uppercase tracking-tighter text-[10px]">Access to Justice</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 leading-tight">
              Affordable <span className="text-accent italic">Legal Aid</span> Services
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 font-medium leading-relaxed border-l-4 border-accent pl-6">
              Affordable Legal Aid Services – Providing Accessible Justice, Legal Guidance, Human Rights Protection, Documentation Support, Mediation, and Advocacy for All.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service) => (
              <Card key={service.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white dark:bg-slate-900 group">
                <CardHeader className="p-8 pb-4">
                   <div className="flex items-start gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                        <service.Icon className={cn("w-6 h-6 transition-colors", service.iconColor, "group-hover:text-white")} />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-xl md:text-2xl font-headline font-bold text-primary dark:text-white group-hover:text-accent transition-colors leading-tight">
                          {service.title}
                        </CardTitle>
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="p-8 pt-2">
                   <ul className="space-y-3">
                      {service.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-slate-600 dark:text-slate-400">
                           <div className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-accent"></div>
                           <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                   </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action Footer */}
          <div className="mt-20 p-8 md:p-16 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden text-center shadow-2xl max-w-6xl mx-auto">
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
             <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
                <ShieldCheck className="w-16 h-16 text-accent mx-auto mb-4" />
                <h3 className="text-2xl md:text-4xl font-headline font-bold">Upholding the <span className="text-accent italic">Right to Justice</span></h3>
                <p className="text-slate-400 leading-relaxed italic">
                  "The Trust is dedicated to ensuring that no one is denied justice due to financial constraints. Our legal aid cell works tirelessly to provide expert consultation and procedural support to the marginalized and under-represented."
                </p>
                <div className="pt-6">
                   <Link href="/#helpline">
                     <Button className="bg-accent text-primary font-bold px-10 py-6 rounded-xl text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                       Contact Legal Aid Cell
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
