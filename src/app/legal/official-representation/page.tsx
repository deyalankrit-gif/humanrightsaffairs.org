"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  FileText, 
  Info,
  CheckCircle2,
  BadgeCheck,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function OfficialRepresentationPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    stateOfficeAddress: 'Vill. - Biswanathpur, P.O. - Ramnathpur, P.S. - Deganga, Dist. - 24 Parganas (N), WB - 743423',
    phone: '+91 70631 11471',
    email: 'hrat.wb.chairman@gmail.com',
    website: 'www.humanrightsaffairs.org',
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    districtName: '',
    districtAddress: '',
    subjectMatter: '',
    issueDescription: '',
    chairmanName: 'Moumita Saha',
    chairmanMobile: '+91 70631 11471',
    chairmanEmail: 'hrat.wb.chairman@gmail.com',
    enclosure1: 'Copy of supporting documents.',
    enclosure2: 'Relevant representations/complaints.',
    enclosure3: 'Any other relevant records.'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopy = () => {
    const text = `
Human Rights Affairs Trust
${formData.stateOfficeAddress}
Phone: ${formData.phone}
Email: ${formData.email}
Website: ${formData.website}

Date: ${formData.date}

To
The District Magistrate & Collector
${formData.districtName || '[District Name]'}
${formData.districtAddress || '[District Address]'}

Subject: Request for Administrative Assistance Regarding ${formData.subjectMatter || '______'}

Official Representation

Respected Sir/Madam,

On behalf of Human Rights Affairs Trust, I respectfully submit this representation seeking your kind intervention and necessary administrative assistance regarding the matter mentioned above.

Human Rights Affairs Trust is a non-profit organization dedicated to the promotion, protection, and advancement of human rights and social justice. During the course of our activities, we have come across the issue relating to ${formData.issueDescription || '_________________'}.

The matter requires urgent attention as it directly affects the welfare, rights, and legitimate interests of the concerned individuals/community. We therefore request your good office to kindly examine the matter and take such appropriate administrative measures as may be deemed fit under the prevailing laws, rules, and government guidelines.

We shall be grateful if necessary directions may kindly be issued to the concerned authorities for an expeditious and fair resolution of the issue. The Trust remains ready to extend all possible cooperation and provide any additional information or documentation that may be required.

We sincerely hope for your kind consideration and appropriate action in the interest of justice, public welfare, and protection of human rights.

Thanking you.

Yours faithfully,

${formData.chairmanName}
State Chairman
Human Rights Affairs Trust
${formData.chairmanMobile}
${formData.chairmanEmail}

Enclosures:

1. ${formData.enclosure1}
2. ${formData.enclosure2}
3. ${formData.enclosure3}
    `
    navigator.clipboard.writeText(text)
    toast({
      title: "Draft Copied",
      description: "The representation format has been copied to your clipboard.",
    })
  }

  const Fillable = ({ name, placeholder, className = "" }: { name: string, placeholder: string, className?: string }) => (
    <input
      type="text"
      name={name}
      value={(formData as any)[name]}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(
        "border-b border-dotted border-slate-400 bg-transparent focus:outline-none focus:border-accent focus:border-b-2 px-1 text-primary font-bold placeholder:text-slate-300 print:placeholder:text-transparent print:border-none print:text-black",
        className
      )}
    />
  )

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 print:bg-white print:p-0">
      {/* Hero Section - Hidden on Print */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary via-primary/95 to-accent text-primary-foreground relative overflow-hidden border-b-8 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Building2 className="w-8 h-8 text-accent" />
              </div>
              <BadgeCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Official <span className="text-accent italic">Representation</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium">
              Administrative assistance request format for communicating with district authorities and government bodies.
            </p>
          </div>
        </div>
      </section>

      {/* Editor Toolbar - Hidden on Print */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Correspondence Editor</span>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCopy} variant="outline" className="rounded-xl font-bold gap-2">
              <Copy className="w-4 h-4" /> Copy Draft
            </Button>
            <Button onClick={handlePrint} className="bg-primary text-white hover:bg-secondary font-bold rounded-xl gap-2 shadow-xl shadow-primary/20">
              <Printer className="w-4 h-4" /> Print Document
            </Button>
          </div>
        </div>
      </section>

      {/* Main Document Body */}
      <section className="py-16 md:py-24 px-4 print:py-0 print:px-0">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            
            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900 relative print:shadow-none print:rounded-none print:bg-white print:text-black">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 print:hidden"></div>
               <div className="absolute top-0 left-0 w-1.5 h-full bg-accent print:hidden"></div>
               
               <CardContent className="p-8 md:p-16 space-y-10 text-slate-800 dark:text-slate-200 font-serif leading-relaxed text-sm md:text-base print:text-black print:p-12">
                  {/* Letterhead with Logo */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-primary pb-6 mb-10 font-sans print:border-black gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
                        <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-primary dark:text-white uppercase tracking-tight print:text-black leading-none">Human Rights Affairs Trust</h2>
                        <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] print:text-black">Justice Shield</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col text-right space-y-0.5 text-xs text-slate-500 font-medium print:text-black">
                      <div className="flex items-baseline justify-end gap-2">
                        <Fillable name="stateOfficeAddress" placeholder="State Office Address" className="w-full text-right" />
                      </div>
                      <div className="flex justify-end gap-4">
                        <p>Phone: <Fillable name="phone" placeholder="Phone Number" className="w-40 text-right" /></p>
                        <p>Email: <Fillable name="email" placeholder="Email Address" className="w-56 text-right" /></p>
                      </div>
                      <p>Website: <Fillable name="website" placeholder="Website URL" className="w-56 text-right" /></p>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline mb-8">
                    <div></div>
                    <div className="flex items-baseline gap-2">
                       <span className="font-bold">Date:</span>
                       <Fillable name="date" placeholder="Current Date" className="w-40 text-right" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="font-bold">To</p>
                      <p className="font-bold">The District Magistrate & Collector</p>
                      <Fillable name="districtName" placeholder="[District Name]" className="w-64 block" />
                      <Fillable name="districtAddress" placeholder="[District Address]" className="w-full block" />
                    </div>

                    <div className="pt-4">
                       <p className="font-bold">Subject: Request for Administrative Assistance Regarding <Fillable name="subjectMatter" placeholder="Enter Subject Matter" className="w-full" /></p>
                    </div>

                    <div className="text-center pt-4">
                       <p className="font-bold text-lg border-b-2 border-slate-900 inline-block px-4 print:border-black">Official Representation</p>
                    </div>

                    <div className="space-y-6 text-justify">
                      <p>Respected Sir/Madam,</p>
                      
                      <p>
                        On behalf of Human Rights Affairs Trust, I respectfully submit this representation seeking your kind intervention and necessary administrative assistance regarding the matter mentioned above.
                      </p>

                      <p>
                        Human Rights Affairs Trust is a non-profit organization dedicated to the promotion, protection, and advancement of human rights and social justice. During the course of our activities, we have come across the issue relating to 
                        <textarea
                          name="issueDescription"
                          value={formData.issueDescription}
                          onChange={handleChange}
                          placeholder="Provide a detailed description of the issue here..."
                          className="w-full mt-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-accent border-none italic text-sm font-serif print:bg-transparent print:p-0 print:italic-none print:text-black"
                          rows={4}
                        />
                      </p>

                      <p>
                        The matter requires urgent attention as it directly affects the welfare, rights, and legitimate interests of the concerned individuals/community. We therefore request your good office to kindly examine the matter and take such appropriate administrative measures as may be deemed fit under the prevailing laws, rules, and government guidelines.
                      </p>

                      <p>
                        We shall be grateful if necessary directions may kindly be issued to the concerned authorities for an expeditious and fair resolution of the issue. The Trust remains ready to extend all possible cooperation and provide any additional information or documentation that may be required.
                      </p>

                      <p>
                        We sincerely hope for your kind consideration and appropriate action in the interest of justice, public welfare, and protection of human rights.
                      </p>
                    </div>

                    <div className="pt-6">
                      <p>Thanking you.</p>
                    </div>

                    <div className="space-y-6 pt-4">
                      <p>Yours faithfully,</p>
                      <div className="space-y-2">
                        <div className="border-b-2 border-slate-200 w-64 h-12 mb-2 print:border-slate-400"></div>
                        <div className="font-bold font-sans">
                           <Fillable name="chairmanName" placeholder="Name of State Chairman" className="w-64 block text-lg" />
                           <p className="text-slate-600 print:text-black">State Chairman</p>
                           <p className="text-slate-600 print:text-black">Human Rights Affairs Trust</p>
                           <Fillable name="chairmanMobile" placeholder="Mobile Number" className="w-64 block mt-1" />
                           <Fillable name="chairmanEmail" placeholder="Email Address" className="w-64 block" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 space-y-3">
                       <p className="font-bold underline uppercase text-xs tracking-widest text-slate-400 print:text-black">Enclosures:</p>
                       <div className="space-y-2">
                         <div className="flex gap-2 items-baseline text-slate-500 italic text-sm print:text-black">
                           <span>1.</span> <Fillable name="enclosure1" placeholder="Enclosure 1" className="w-full italic" />
                         </div>
                         <div className="flex gap-2 items-baseline text-slate-500 italic text-sm print:text-black">
                           <span>2.</span> <Fillable name="enclosure2" placeholder="Enclosure 2" className="w-full italic" />
                         </div>
                         <div className="flex gap-2 items-baseline text-slate-500 italic text-sm print:text-black">
                           <span>3.</span> <Fillable name="enclosure3" placeholder="Enclosure 3" className="w-full italic" />
                         </div>
                       </div>
                    </div>
                  </div>
               </CardContent>
            </Card>

            <div className="mt-16 flex flex-col items-center gap-6 print:hidden">
               <div className="flex gap-4">
                 <Button onClick={handlePrint} size="lg" className="h-16 px-12 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                   <Printer className="w-5 h-5 mr-2" /> Download & Print Representation
                 </Button>
               </div>
               <Link href="/" className="text-slate-400 hover:text-primary transition-colors font-bold text-sm flex items-center gap-2">
                 <ArrowLeft className="w-4 h-4" /> Return to Homepage
               </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
