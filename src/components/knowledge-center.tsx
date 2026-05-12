
"use client"

import React from 'react'
import { BookOpen, Scale, FileText, UserCheck, ShieldCheck, Download, ExternalLink, Globe } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const guides = [
  {
    title: "Constitution of India",
    desc: "A complete guide to Fundamental Rights & Duties.",
    icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />,
    color: "bg-indigo-50",
    size: "lg"
  },
  {
    title: "Women's Rights",
    desc: "Legal protection against harassment & discrimination.",
    icon: <UserCheck className="w-8 h-8 text-pink-500" />,
    color: "bg-pink-50",
    size: "md"
  },
  {
    title: "Labor Laws",
    desc: "Knowing your rights in the Indian workplace.",
    icon: <Scale className="w-8 h-8 text-amber-500" />,
    color: "bg-amber-50",
    size: "md"
  },
  {
    title: "Right to Info (RTI)",
    desc: "How to file an RTI and track your request.",
    icon: <FileText className="w-8 h-8 text-emerald-500" />,
    color: "bg-emerald-50",
    size: "md"
  },
  {
    title: "Manuals (PDF)",
    desc: "Download legal manuals in Hindi, English & Bengali.",
    icon: <BookOpen className="w-8 h-8 text-sky-500" />,
    color: "bg-sky-50",
    size: "lg"
  }
]

export function KnowledgeCenter() {
  return (
    <section id="knowledge" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-secondary font-bold mb-4">
              <Globe className="w-5 h-5" />
              <span>Multilingual Knowledge Hub</span>
            </div>
            <h2 className="text-4xl font-headline font-bold text-primary mb-4">Digital Library of Human Rights</h2>
            <p className="text-slate-600">Access legal manuals, rights guides, and educational materials in English, Hindi, and Bengali. Knowledge is your first line of defense.</p>
          </div>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            View All Documentation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {guides.map((guide, idx) => (
            <Card 
              key={idx} 
              className={`p-8 border-none flex flex-col justify-between group overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-500 ${guide.color} ${guide.size === 'lg' ? 'md:col-span-2' : ''}`}
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                {React.cloneElement(guide.icon as React.ReactElement, { className: "w-48 h-48" })}
              </div>
              <div className="relative z-10">
                <div className="p-3 bg-white rounded-xl w-fit shadow-sm mb-6">
                  {guide.icon}
                </div>
                <h3 className="text-2xl font-headline font-bold text-primary mb-2">{guide.title}</h3>
                <p className="text-slate-600 text-sm max-w-xs">{guide.desc}</p>
              </div>
              <div className="relative z-10 flex gap-2">
                <Button variant="ghost" className="text-primary hover:text-accent font-bold px-0 flex items-center gap-1">
                  Read More <ExternalLink className="w-4 h-4" />
                </Button>
                {guide.title.includes('Manuals') && (
                  <Button size="sm" className="bg-primary text-white ml-auto">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
