
"use client"

import React from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  ShieldCheck, 
  FileText, 
  Gavel, 
  Scale, 
  Info,
  CheckCircle2,
  Download,
  BadgeCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function FIRFormatPage() {
  const { toast } = useToast()

  const handlePrint = () => {
    window.print()
  }

  const handleCopy = () => {
    const text = document.getElementById('fir-text')?.innerText
    if (text) {
      navigator.clipboard.writeText(text)
      toast({
        title: "Format Copied",
        description: "The legal template has been copied to your clipboard.",
      })
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary via-primary/95 to-accent text-primary-foreground relative overflow-hidden border-b-8 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <BadgeCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Filing an <span className="text-accent italic">FIR</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium">
              Sample Legal Format for Filing an FIR under the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023.
            </p>
          </div>
        </div>
      </section>

      {/* Utility Bar */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verified BNSS 2023 Standard</span>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCopy} variant="outline" className="rounded-xl font-bold gap-2">
              <Copy className="w-4 h-4" /> Copy Format
            </Button>
            <Button onClick={handlePrint} className="bg-primary text-white hover:bg-secondary font-bold rounded-xl gap-2 shadow-xl shadow-primary/20">
              <Printer className="w-4 h-4" /> Print Format
            </Button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            
            {/* Disclaimer Alert */}
            <div className="mb-12 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900 p-6 rounded-[2rem] flex gap-4 items-start print:hidden">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Info className="w-6 h-6 text-amber-600 shrink-0" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-amber-900 dark:text-amber-400 text-sm uppercase tracking-wider">Note to Citizens</p>
                <p className="text-amber-800/80 dark:text-amber-400/80 text-sm leading-relaxed italic">
                  "This format is intended as a guide. While it covers essential legal parameters under BNSS 2023, you may consult a legal professional for complex cases. Ensure all details provided are accurate and truthful."
                </p>
              </div>
            </div>

            {/* Document Paper */}
            <Card className="rounded-[2rem] border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900 relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 print:hidden"></div>
               <div className="absolute top-0 left-0 w-1 h-full bg-accent print:hidden"></div>
               
               <CardContent className="p-8 md:p-16 space-y-10" id="fir-text">
                  <div className="text-center border-b-2 border-slate-100 dark:border-slate-800 pb-8 mb-8">
                     <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary dark:text-white uppercase tracking-tight">
                       Sample Legal Format for Filing an FIR
                     </h2>
                  </div>

                  <div className="space-y-6 text-slate-800 dark:text-slate-200 font-body leading-relaxed text-sm md:text-base">
                    <div className="space-y-1">
                      <p>To</p>
                      <p className="font-bold">The Officer-in-Charge (O.C.)</p>
                      <p className="border-b border-dotted border-slate-400 w-48 inline-block">____</p> Police Station
                      <p>District: <span className="border-b border-dotted border-slate-400 w-48 inline-block">____</span></p>
                    </div>

                    <div className="pt-4">
                       <p className="font-bold">Subject: Application for Registration of FIR and Initiation of Legal Action under the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023.</p>
                    </div>

                    <div className="space-y-4">
                      <p>Respected Sir/Madam,</p>
                      <p className="text-justify">
                        I, Mr./Ms. <span className="font-bold">[Full Name]</span>, Son/Daughter/Wife of <span className="font-bold">[Name]</span>, aged <span className="font-bold">[Age]</span> years, occupation <span className="font-bold">[Occupation]</span>, residing at <span className="font-bold">[Complete Address]</span>, do hereby respectfully submit that the incident described below constitutes a punishable offence, and therefore I request that my complaint be registered as a First Information Report (FIR).
                      </p>
                    </div>

                    <div className="space-y-4">
                      <p className="font-bold underline text-primary dark:text-accent">Facts of the Incident:</p>
                      <p className="text-justify">
                        That on <span className="font-bold">[Date]</span> at approximately <span className="font-bold">[Time]</span>, while I was present at <span className="font-bold">[Place of Occurrence]</span>, <span className="font-bold">[Name(s) of the accused person(s), if known]</span>, unlawfully and intentionally <span className="font-bold">[Provide a detailed description of the incident]</span>.
                      </p>
                      <p className="text-justify">
                        That as a result of the aforesaid acts of the accused person(s), I/my family have suffered <span className="font-bold">[mention physical, mental, financial, or any other loss or injury]</span>.
                      </p>
                    </div>

                    <div className="space-y-2">
                       <p className="font-bold">The following persons witnessed the incident:</p>
                       <div className="space-y-1 pl-4">
                          <p>1. <span className="border-b border-dotted border-slate-400 w-full inline-block min-h-[1.5em]"></span></p>
                          <p>2. <span className="border-b border-dotted border-slate-400 w-full inline-block min-h-[1.5em]"></span></p>
                       </div>
                    </div>

                    <div className="space-y-4">
                      <p className="font-bold underline text-primary dark:text-accent">Available Evidence:</p>
                      <p>In support of my complaint, I possess the following evidence:</p>
                      <ul className="list-disc pl-8 space-y-2 italic text-slate-600 dark:text-slate-400">
                        <li>Relevant documents/records</li>
                        <li>Photographs and/or video recordings</li>
                        <li>Audio recordings (if any)</li>
                        <li>Medical reports/documents (if applicable)</li>
                        <li>Any other supporting evidence</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <p className="text-justify">
                        The aforesaid incident discloses the commission of a cognizable offence. Therefore, I request you to kindly register this written complaint as an FIR, conduct a fair and impartial investigation, and take appropriate legal action against the accused person(s) in accordance with the law.
                      </p>
                      <p className="text-justify">
                        I further request that I be provided with the FIR number and a certified copy of the FIR as per the applicable legal provisions.
                      </p>
                      <p className="text-justify">
                        In the interest of justice, I humbly seek your immediate intervention and necessary action in this matter.
                      </p>
                    </div>

                    <div className="pt-6">
                      <p>Thanking you.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-12 pt-8">
                       <div className="space-y-1">
                          <p>Yours faithfully,</p>
                          <div className="pt-10 space-y-2">
                             <p>Signature: <span className="border-b border-dotted border-slate-400 w-48 inline-block">_______</span></p>
                             <p>Name: <span className="border-b border-dotted border-slate-400 w-48 inline-block">________</span></p>
                             <p>Father’s/Husband’s Name: <span className="border-b border-dotted border-slate-400 w-48 inline-block">________</span></p>
                             <p>Address: <span className="border-b border-dotted border-slate-400 w-48 inline-block">________</span></p>
                             <p>Mobile No.: <span className="border-b border-dotted border-slate-400 w-48 inline-block">______</span></p>
                             <p>E-mail: <span className="border-b border-dotted border-slate-400 w-48 inline-block">_______</span></p>
                          </div>
                       </div>
                       <div className="space-y-2 text-right">
                          <p>Date: <span className="border-b border-dotted border-slate-400 w-32 inline-block">_________</span></p>
                          <p>Place: <span className="border-b border-dotted border-slate-400 w-32 inline-block">________</span></p>
                       </div>
                    </div>

                    <div className="pt-12 space-y-4 border-t border-slate-100 dark:border-slate-800 mt-12">
                       <p className="font-bold text-accent uppercase tracking-widest text-xs">Enclosures:</p>
                       <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500">
                          <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Copy of Identity Proof</p>
                          <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Relevant Documents</p>
                          <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Photographs/Videos/Audio Evidence</p>
                          <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Other Supporting Documents (if any)</p>
                       </div>
                    </div>

                    <div className="pt-12 mt-12 bg-slate-50 dark:bg-slate-950 p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                       <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] text-center mb-8">For Official Use Only</p>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-500 uppercase">General Diary (G.D.) No.</p>
                             <div className="border-b border-slate-300 min-h-[1.5rem]"></div>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-500 uppercase">Date</p>
                             <div className="border-b border-slate-300 min-h-[1.5rem]"></div>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-500 uppercase">FIR No.</p>
                             <div className="border-b border-slate-300 min-h-[1.5rem]"></div>
                          </div>
                       </div>
                       <div className="mt-12 text-center">
                          <div className="w-48 h-20 border-2 border-dotted border-slate-300 mx-auto mb-2 flex items-center justify-center">
                             <span className="text-[8px] font-bold text-slate-300 uppercase">Officer's Seal</span>
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Signature & Seal of Receiving Officer</p>
                       </div>
                    </div>
                  </div>
               </CardContent>
            </Card>

            {/* Bottom Actions */}
            <div className="mt-16 flex flex-col items-center gap-6 print:hidden">
               <div className="flex gap-4">
                 <Button onClick={handlePrint} size="lg" className="h-16 px-12 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                   <Printer className="w-5 h-5 mr-2" /> Download & Print Template
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
