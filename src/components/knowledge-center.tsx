"use client"

import React, { useState } from 'react'
import { BookOpen, Scale, FileText, UserCheck, ShieldCheck, Download, ExternalLink, Globe, CheckCircle2, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog"

const guides = [
  {
    id: "constitution",
    title: "Constitution of India",
    desc: "A complete guide to Fundamental Rights & Duties.",
    overview: "The Constitution of India is the supreme law of India. It imparts constitutional supremacy and was adopted by its people with a declaration in its preamble. It is the framework that defines fundamental political code, structure, procedures, powers, and duties of government institutions.",
    features: ["Fundamental Rights (Articles 12-35)", "Directive Principles of State Policy", "Fundamental Duties of Citizens", "Independence of the Judiciary"],
    icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />,
    color: "bg-indigo-50 dark:bg-indigo-950/40",
    size: "lg"
  },
  {
    id: "womens-rights",
    title: "Women's Rights",
    desc: "Legal protection against harassment & discrimination.",
    overview: "Comprehensive legal frameworks protect women in India from domestic violence, workplace harassment, and ensure equal pay. Understanding these rights is crucial for empowerment and safety.",
    features: ["Domestic Violence Act, 2005", "POSH Act, 2013", "Maternity Benefit Rights", "Right to Equal Pay"],
    icon: <UserCheck className="w-8 h-8 text-pink-500" />,
    color: "bg-pink-50 dark:bg-pink-950/40",
    size: "md"
  },
  {
    id: "labor-laws",
    title: "Labor Laws",
    desc: "Knowing your rights in the Indian workplace.",
    overview: "Indian labor laws ensure fair treatment of employees, covering minimum wages, safe working conditions, and social security benefits like PF and Gratuity.",
    features: ["Minimum Wages Compliance", "Industrial Disputes Rights", "Social Security Benefits", "Workplace Safety Norms"],
    icon: <Scale className="w-8 h-8 text-amber-500" />,
    color: "bg-amber-50 dark:bg-amber-950/40",
    size: "md"
  },
  {
    id: "rti",
    title: "Right to Info (RTI)",
    desc: "How to file an RTI and track your request.",
    overview: "The RTI Act is a landmark legislation that allows citizens to question the government and its departments, promoting transparency and combating corruption.",
    features: ["Filing Procedure Guide", "Drafting Applications", "Appellate Authority Info", "Tracking Status Guidelines"],
    icon: <FileText className="w-8 h-8 text-emerald-500" />,
    color: "bg-emerald-50 dark:bg-emerald-950/40",
    size: "md"
  },
  {
    id: "manuals",
    title: "Manuals (PDF)",
    desc: "Download legal manuals in Hindi, English & Bengali.",
    overview: "Access our simplified legal manuals designed for the common citizen. These manuals break down complex legal jargon into understandable regional languages.",
    features: ["Hindi Language Editions", "Bengali Language Editions", "English Quick-Start Guides", "Interactive Case Studies"],
    icon: <BookOpen className="w-8 h-8 text-sky-500" />,
    color: "bg-sky-50 dark:bg-sky-950/40",
    size: "lg"
  }
]

export function KnowledgeCenter() {
  const [selectedGuide, setSelectedGuide] = useState<typeof guides[0] | null>(null)
  const [open, setOpen] = useState(false)

  const handleOpenDetail = (guide: typeof guides[0]) => {
    setSelectedGuide(guide)
    setOpen(true)
  }

  const handleAccessRepository = () => {
    if (!selectedGuide) return;
    let url = "";
    switch (selectedGuide.id) {
      case "constitution":
        url = "https://www.india.gov.in/my-government/constitution-of-india";
        break;
      case "womens-rights":
        url = "https://clpr.org.in/wp-content/uploads/2024/12/Womens-Book_Accessible.pdf";
        break;
      case "labor-laws":
        url = "https://clc.gov.in/clc/labour-law";
        break;
      case "rti":
        url = "https://rti.dopt.gov.in/";
        break;
      case "manuals":
        url = "https://bprd.nic.in/uploads/pdf/BNS%20Book_After%20Correction.pdf";
        break;
      default:
        return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="knowledge" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-secondary font-bold mb-4 text-sm">
              <Globe className="w-4 h-4 md:w-5 md:h-5" />
              <span>Multilingual Knowledge Hub</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary dark:text-foreground mb-4">Digital Library of Human Rights</h2>
            <p className="text-muted-foreground text-sm md:text-base">Access legal manuals, rights guides, and educational materials in English, Hindi, and Bengali. Knowledge is your first line of defense.</p>
          </div>
          <Button 
            variant="outline" 
            asChild
            className="border-primary text-primary hover:bg-secondary hover:text-white dark:border-slate-700 dark:text-slate-300 w-full md:w-auto font-bold transition-colors"
          >
            <a href="#search">View All Documentation</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-auto md:auto-rows-[250px]">
          {guides.map((guide) => (
            <Card 
              key={guide.id} 
              className={`p-6 md:p-8 border-none flex flex-col justify-between group overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-500 ${guide.color} ${guide.size === 'lg' ? 'md:col-span-2' : ''}`}
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700 hidden md:block">
                {React.cloneElement(guide.icon as React.ReactElement, { className: "w-32 h-32 md:w-48 md:h-48" })}
              </div>
              <div className="relative z-10">
                <div className="p-2 md:p-3 bg-white dark:bg-slate-800 rounded-xl w-fit shadow-sm mb-4 md:mb-6">
                  {guide.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-headline font-bold text-primary dark:text-white mb-2">{guide.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm max-w-xs">{guide.desc}</p>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2 mt-4 md:mt-0">
                <Button 
                  variant="ghost" 
                  onClick={() => handleOpenDetail(guide)}
                  className="text-primary dark:text-white hover:text-white hover:bg-secondary font-bold px-4 rounded-lg flex items-center gap-1 text-xs md:text-sm transition-all"
                >
                  Read More <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                {guide.id === 'manuals' && (
                  <Button size="sm" onClick={() => window.open('https://bprd.nic.in/uploads/pdf/BNS%20Book_After%20Correction.pdf', '_blank')} className="bg-primary text-primary-foreground ml-auto text-xs h-8 md:h-9 hover:bg-secondary hover:text-white transition-colors">
                    <Download className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Download
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] p-0 border-none shadow-2xl bg-white dark:bg-slate-950 flex flex-col [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedGuide?.title || 'Guide Details'}</DialogTitle>
            <DialogDescription>Detailed human rights documentation.</DialogDescription>
          </DialogHeader>
          
          <div className="absolute right-6 top-6 z-50">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-white h-10 w-10 backdrop-blur-xl border border-white/20 transition-all">
                <X className="w-6 h-6" />
              </Button>
            </DialogClose>
          </div>

          {selectedGuide && (
            <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
              <div className="flex flex-col">
                <div className="relative bg-gradient-to-br from-primary via-primary/95 to-accent/30 p-12 md:p-16 text-primary-foreground overflow-hidden shrink-0 border-b-8 border-accent/20">
                  <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-[-10px]">
                    {React.cloneElement(selectedGuide.icon as React.ReactElement, { className: "w-64 h-64 md:w-80 md:h-80" })}
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-accent/30">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Official Legal Resource</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight pr-12">
                      {selectedGuide.title}
                    </h2>
                    <p className="text-xl text-primary-foreground/70 font-medium italic">
                      {selectedGuide.desc}
                    </p>
                  </div>
                </div>

                <div className="p-8 md:p-12 space-y-12 pb-24">
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                       <span className="w-8 h-px bg-accent"></span> Overview
                    </h3>
                    <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-body font-medium italic border-l-4 border-accent pl-6">
                      "{selectedGuide.overview}"
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                     <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary dark:text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Areas of Focus
                        </h4>
                        <ul className="space-y-4">
                          {selectedGuide.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-accent transition-all shadow-sm">
                               <span className="w-7 h-7 bg-accent text-primary rounded-full flex items-center justify-center text-[10px] font-bold shadow-md">{idx + 1}</span>
                               <span className="font-bold text-slate-700 dark:text-slate-200">{feature}</span>
                            </li>
                          ))}
                        </ul>
                     </div>

                     <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary dark:text-white">Significance</h4>
                        <div className="p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 shadow-inner">
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic text-sm md:text-base font-medium">
                            "The knowledge of these rights is not just informative—it is transformative. By understanding the legal safeguards provided by the State, every citizen becomes a vital part of a just and transparent democracy."
                          </p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-12 flex flex-col gap-4 items-center">
                    <Button 
                      size="lg" 
                      onClick={handleAccessRepository}
                      className="w-full bg-accent text-primary font-bold h-16 rounded-2xl text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20 group"
                    >
                      Access Full Repository <ExternalLink className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Button>
                    
                    <DialogClose asChild>
                      <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50">
                        Close Page
                      </Button>
                    </DialogClose>
                    
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-4">
                      Official Record • Human Rights Affairs Trust
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
