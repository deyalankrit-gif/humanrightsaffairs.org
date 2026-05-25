
"use client"

import React, { useState } from 'react'
import { BookOpen, Scale, FileText, UserCheck, ShieldCheck, Download, ExternalLink, Globe, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const guides = [
  {
    id: "constitution",
    title: "Constitution of India",
    desc: "A complete guide to Fundamental Rights & Duties.",
    details: "The Constitution of India is the supreme law of India. It imparts constitutional supremacy and was adopted by its people with a declaration in its preamble. It is the framework that defines fundamental political code, structure, procedures, powers, and duties of government institutions.",
    features: ["Fundamental Rights (Articles 12-35)", "Directive Principles of State Policy", "Fundamental Duties of Citizens", "Independence of the Judiciary"],
    icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />,
    color: "bg-indigo-50",
    size: "lg"
  },
  {
    id: "womens-rights",
    title: "Women's Rights",
    desc: "Legal protection against harassment & discrimination.",
    details: "Comprehensive legal frameworks protect women in India from domestic violence, workplace harassment, and ensure equal pay. Understanding these rights is crucial for empowerment and safety.",
    features: ["Domestic Violence Act, 2005", "POSH Act, 2013", "Maternity Benefit Rights", "Right to Equal Pay"],
    icon: <UserCheck className="w-8 h-8 text-pink-500" />,
    color: "bg-pink-50",
    size: "md"
  },
  {
    id: "labor-laws",
    title: "Labor Laws",
    desc: "Knowing your rights in the Indian workplace.",
    details: "Indian labor laws ensure fair treatment of employees, covering minimum wages, safe working conditions, and social security benefits like PF and Gratuity.",
    features: ["Minimum Wages Compliance", "Industrial Disputes Rights", "Social Security Benefits", "Workplace Safety Norms"],
    icon: <Scale className="w-8 h-8 text-amber-500" />,
    color: "bg-amber-50",
    size: "md"
  },
  {
    id: "rti",
    title: "Right to Info (RTI)",
    desc: "How to file an RTI and track your request.",
    details: "The RTI Act is a landmark legislation that allows citizens to question the government and its departments, promoting transparency and combating corruption.",
    features: ["Filing Procedure Guide", "Drafting Applications", "Appellate Authority Info", "Tracking Status Guidelines"],
    icon: <FileText className="w-8 h-8 text-emerald-500" />,
    color: "bg-emerald-50",
    size: "md"
  },
  {
    id: "manuals",
    title: "Manuals (PDF)",
    desc: "Download legal manuals in Hindi, English & Bengali.",
    details: "Access our simplified legal manuals designed for the common citizen. These manuals break down complex legal jargon into understandable regional languages.",
    features: ["Hindi Language Editions", "Bengali Language Editions", "English Quick-Start Guides", "Interactive Case Studies"],
    icon: <BookOpen className="w-8 h-8 text-sky-500" />,
    color: "bg-sky-50",
    size: "lg"
  }
]

export function KnowledgeCenter() {
  const [selectedGuide, setSelectedGuide] = useState<typeof guides[0] | null>(null)

  const scrollToSearch = () => {
    setSelectedGuide(null);
    const element = document.getElementById('search');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const handleAccessRepository = () => {
    if (selectedGuide?.id === 'constitution') {
      window.open('https://www.indiacode.nic.in/bitstream/123456789/19150/1/constitution_of_india.pdf', '_blank');
    } else if (selectedGuide?.id === 'womens-rights') {
      window.open('https://clpr.org.in/wp-content/uploads/2024/12/Womens-Book_Accessible.pdf', '_blank');
    } else if (selectedGuide?.id === 'labor-laws') {
      window.open('https://ncib.in/pdf/ncib_pdf/Labour%20Act.pdf', '_blank');
    } else {
      scrollToSearch();
    }
  }

  return (
    <section id="knowledge" className="py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-secondary font-bold mb-4 text-sm">
              <Globe className="w-4 h-4 md:w-5 md:h-5" />
              <span>Multilingual Knowledge Hub</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-4">Digital Library of Human Rights</h2>
            <p className="text-slate-600 text-sm md:text-base">Access legal manuals, rights guides, and educational materials in English, Hindi, and Bengali. Knowledge is your first line of defense.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={scrollToSearch}
            className="border-primary text-primary hover:bg-primary hover:text-white w-full md:w-auto font-bold"
          >
            View All Documentation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-auto md:auto-rows-[250px]">
          {guides.map((guide, idx) => (
            <Card 
              key={idx} 
              className={`p-6 md:p-8 border-none flex flex-col justify-between group overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-500 ${guide.color} ${guide.size === 'lg' ? 'md:col-span-2' : ''}`}
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700 hidden md:block">
                {React.cloneElement(guide.icon as React.ReactElement, { className: "w-32 h-32 md:w-48 md:h-48" })}
              </div>
              <div className="relative z-10">
                <div className="p-2 md:p-3 bg-white rounded-xl w-fit shadow-sm mb-4 md:mb-6">
                  {guide.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-headline font-bold text-primary mb-2">{guide.title}</h3>
                <p className="text-slate-600 text-xs md:text-sm max-w-xs">{guide.desc}</p>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2 mt-4 md:mt-0">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedGuide(guide)}
                  className="text-primary hover:text-accent font-bold px-0 flex items-center gap-1 text-xs md:text-sm"
                >
                  Read More <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                {guide.title.includes('Manuals') && (
                  <Button size="sm" onClick={scrollToSearch} className="bg-primary text-white ml-auto text-xs h-8 md:h-9">
                    <Download className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Download
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedGuide} onOpenChange={(open) => !open && setSelectedGuide(null)}>
        {selectedGuide && (
          <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
            <div className={`p-8 md:p-12 ${selectedGuide.color} relative`}>
              <DialogHeader className="relative z-10 text-left">
                <div className="bg-white p-4 rounded-2xl w-fit shadow-sm mb-6">
                  {React.cloneElement(selectedGuide.icon as React.ReactElement, { className: "w-10 h-10" })}
                </div>
                <DialogTitle className="text-3xl md:text-4xl font-headline font-bold text-primary mb-2">
                  {selectedGuide.title}
                </DialogTitle>
                <DialogDescription className="text-lg text-slate-600 font-medium">
                  {selectedGuide.desc}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-8 md:p-12 bg-white space-y-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-accent">Overview</h4>
                <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                  {selectedGuide.details}
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-accent">Key Areas of Focus</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedGuide.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-accent/30 transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-bold text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={handleAccessRepository}
                  className="flex-1 bg-primary text-white font-bold py-6 rounded-xl hover:bg-primary/90 text-lg shadow-xl shadow-primary/10"
                >
                  Access Full Repository
                </Button>
                {selectedGuide.id === 'manuals' && (
                  <Button variant="outline" onClick={scrollToSearch} className="flex-1 border-primary text-primary font-bold py-6 rounded-xl hover:bg-slate-50 text-lg">
                    <Download className="w-5 h-5 mr-2" /> Download PDFs
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  )
}
