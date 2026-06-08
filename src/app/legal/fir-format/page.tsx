"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  FileText, 
  Info,
  CheckCircle2,
  BadgeCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export default function FIRFormatPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    policeStation: '',
    district: '',
    fullName: '',
    relationName: '',
    age: '',
    occupation: '',
    address: '',
    incidentDate: '',
    incidentTime: '',
    occurrencePlace: '',
    accusedNames: '',
    incidentDescription: '',
    lossDetails: '',
    witness1: '',
    witness2: '',
    mobileNo: '',
    email: '',
    submissionDate: new Date().toLocaleDateString('en-IN'),
    submissionPlace: '',
    evidenceDocs: 'Relevant documents/records',
    evidencePhotos: 'Photographs and/or video recordings',
    evidenceAudio: 'Audio recordings (if any)',
    evidenceMedical: 'Medical reports/documents (if applicable)',
    evidenceOther: 'Any other supporting evidence'
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
Sample Legal Format for Filing an FIR

To
The Officer-in-Charge (O.C.)
${formData.policeStation || '____'} Police Station
District: ${formData.district || '____'}

Subject: Application for Registration of FIR and Initiation of Legal Action under the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023.

Respected Sir/Madam,

I, Mr./Ms. ${formData.fullName || '[Full Name]'}, Son/Daughter/Wife of ${formData.relationName || '[Name]'}, aged ${formData.age || '[Age]'} years, occupation ${formData.occupation || '[Occupation]'}, residing at ${formData.address || '[Complete Address]'}, do hereby respectfully submit that the incident described below constitutes a punishable offence, and therefore I request that my complaint be registered as a First Information Report (FIR).

Facts of the Incident:
That on ${formData.incidentDate || '[Date]'} at approximately ${formData.incidentTime || '[Time]'}, while I was present at ${formData.occurrencePlace || '[Place of Occurrence]'}, ${formData.accusedNames || '[Name(s) of the accused person(s), if known]'}, unlawfully and intentionally ${formData.incidentDescription || '[Detailed description of the incident]'}.

That as a result of the aforesaid acts of the accused person(s), I/my family have suffered ${formData.lossDetails || '[mention physical, mental, financial, or any other loss or injury]'}.

The following persons witnessed the incident:
1. ${formData.witness1 || '____'}
2. ${formData.witness2 || '____'}

Available Evidence:
In support of my complaint, I possess the following evidence:
- ${formData.evidenceDocs}
- ${formData.evidencePhotos}
- ${formData.evidenceAudio}
- ${formData.evidenceMedical}
- ${formData.evidenceOther}

The aforesaid incident discloses the commission of a cognizable offence. Therefore, I request you to kindly register this written complaint as an FIR, conduct a fair and impartial investigation, and take appropriate legal action against the accused person(s) in accordance with the law.

I further request that I be provided with the FIR number and a certified copy of the FIR as per the applicable legal provisions.

In the interest of justice, I humbly seek your immediate intervention and necessary action in this matter.

Thanking you.

Yours faithfully,
Name: ${formData.fullName || '________'}
Address: ${formData.address || '________'}
Mobile No.: ${formData.mobileNo || '______'}
Date: ${formData.submissionDate || '________'}
Place: ${formData.submissionPlace || '________'}
    `
    navigator.clipboard.writeText(text)
    toast({
      title: "Draft Copied",
      description: "The filled FIR format has been copied to your clipboard.",
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
        "border-b border-dotted border-slate-400 bg-transparent focus:outline-none focus:border-accent focus:border-b-2 px-1 text-primary font-bold placeholder:text-slate-300 print:placeholder:text-transparent print:border-none",
        className
      )}
    />
  )

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
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <BadgeCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Filing an <span className="text-accent italic">FIR</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium">
              Interactive Legal Format updated for the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023. Fill the details below and print.
            </p>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Editor Enabled • BNSS 2023 Standard</span>
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

      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            
            <div className="mb-12 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900 p-6 rounded-[2rem] flex gap-4 items-start print:hidden">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Info className="w-6 h-6 text-amber-600 shrink-0" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-amber-900 dark:text-amber-400 text-sm uppercase tracking-wider">Instructions</p>
                <p className="text-amber-800/80 dark:text-amber-400/80 text-sm leading-relaxed italic">
                  "Click on the placeholders below to type your information. All changes are local and will be reflected when you print or copy the document."
                </p>
              </div>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900 relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 print:hidden"></div>
               <div className="absolute top-0 left-0 w-1.5 h-full bg-accent print:hidden"></div>
               
               <CardContent className="p-8 md:p-16 space-y-10" id="fir-document">
                  <div className="text-center border-b-2 border-slate-100 dark:border-slate-800 pb-8 mb-8">
                     <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary dark:text-white uppercase tracking-tight">
                       Legal Application for Filing an FIR
                     </h2>
                  </div>

                  <div className="space-y-8 text-slate-800 dark:text-slate-200 font-body leading-relaxed text-sm md:text-base">
                    <div className="space-y-1">
                      <p>To</p>
                      <p className="font-bold">The Officer-in-Charge (O.C.)</p>
                      <div className="flex items-baseline gap-2">
                        <Fillable name="policeStation" placeholder="Name of Station" className="w-48" />
                        <span>Police Station</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span>District:</span>
                        <Fillable name="district" placeholder="Enter District" className="w-48" />
                      </div>
                    </div>

                    <div className="pt-4">
                       <p className="font-bold">Subject: Application for Registration of FIR and Initiation of Legal Action under the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023.</p>
                    </div>

                    <div className="space-y-4">
                      <p>Respected Sir/Madam,</p>
                      <div className="text-justify leading-loose">
                        I, Mr./Ms. <Fillable name="fullName" placeholder="Your Full Name" className="min-w-[150px]" />, 
                        Son/Daughter/Wife of <Fillable name="relationName" placeholder="Guardian Name" className="min-w-[150px]" />, 
                        aged <Fillable name="age" placeholder="Age" className="w-12 text-center" /> years, 
                        occupation <Fillable name="occupation" placeholder="Your Occupation" className="min-w-[100px]" />, 
                        residing at <Fillable name="address" placeholder="Complete Residential Address" className="w-full" />, 
                        do hereby respectfully submit that the incident described below constitutes a punishable offence, and therefore I request that my complaint be registered as a First Information Report (FIR).
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="font-bold underline text-primary dark:text-accent uppercase tracking-widest text-xs">Facts of the Incident:</p>
                      <div className="text-justify leading-loose">
                        That on <Fillable name="incidentDate" placeholder="Date of Incident" className="w-32" /> 
                        at approximately <Fillable name="incidentTime" placeholder="Time" className="w-24" />, 
                        while I was present at <Fillable name="occurrencePlace" placeholder="Place of Occurrence" className="min-w-[150px]" />, 
                        <Fillable name="accusedNames" placeholder="Name(s) of accused (if known)" className="min-w-[200px]" />, 
                        unlawfully and intentionally 
                        <textarea
                          name="incidentDescription"
                          value={formData.incidentDescription}
                          onChange={handleChange}
                          placeholder="Provide a detailed description of the incident here..."
                          className="w-full mt-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-accent border-none italic text-sm print:bg-transparent print:p-0 print:italic-none"
                          rows={4}
                        />
                      </div>
                      <div className="text-justify leading-loose">
                        That as a result of the aforesaid acts of the accused person(s), I/my family have suffered 
                        <Fillable name="lossDetails" placeholder="mention physical, mental, financial loss or injury" className="w-full" />.
                      </div>
                    </div>

                    <div className="space-y-4">
                       <p className="font-bold text-xs uppercase tracking-widest opacity-50">Witnesses:</p>
                       <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                             <span className="font-bold text-accent">1.</span>
                             <Fillable name="witness1" placeholder="First Witness Name" className="w-full" />
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="font-bold text-accent">2.</span>
                             <Fillable name="witness2" placeholder="Second Witness Name" className="w-full" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                      <p className="font-bold underline text-primary dark:text-accent uppercase tracking-widest text-xs">Available Evidence:</p>
                      <p className="opacity-70">In support of my complaint, I possess the following evidence:</p>
                      <ul className="space-y-2 italic text-slate-600 dark:text-slate-400">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <Fillable name="evidenceDocs" placeholder="Relevant documents/records" className="w-full italic" />
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <Fillable name="evidencePhotos" placeholder="Photographs and/or video recordings" className="w-full italic" />
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <Fillable name="evidenceAudio" placeholder="Audio recordings (if any)" className="w-full italic" />
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <Fillable name="evidenceMedical" placeholder="Medical reports/documents (if applicable)" className="w-full italic" />
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <Fillable name="evidenceOther" placeholder="Any other supporting evidence" className="w-full italic" />
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                      <p className="text-justify">
                        The aforesaid incident discloses the commission of a cognizable offence. Therefore, I request you to kindly register this written complaint as an FIR, conduct a fair and impartial investigation, and take appropriate legal action against the accused person(s) in accordance with the law.
                      </p>
                      <p className="text-justify">
                        I further request that I be provided with the FIR number and a certified copy of the FIR as per the applicable legal provisions.
                      </p>
                    </div>

                    <div className="pt-6">
                      <p>Thanking you.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-12 pt-8">
                       <div className="space-y-6">
                          <p>Yours faithfully,</p>
                          <div className="space-y-3 pt-4">
                             <div className="border-b-2 border-slate-200 w-48 h-12 mb-2 print:border-slate-400"></div>
                             <p className="text-xs font-bold text-slate-400 uppercase">Signature</p>
                             <div className="space-y-2">
                                <p className="flex items-center gap-2">Name: <Fillable name="fullName" placeholder="Auto-fills from above" className="w-full" /></p>
                                <p className="flex items-center gap-2">Phone: <Fillable name="mobileNo" placeholder="Mobile No." className="w-full" /></p>
                                <p className="flex items-center gap-2">E-mail: <Fillable name="email" placeholder="Email Address" className="w-full" /></p>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-4 text-right">
                          <div className="flex justify-end items-baseline gap-2">
                             <span>Date:</span>
                             <Fillable name="submissionDate" placeholder="Date" className="w-32 text-right" />
                          </div>
                          <div className="flex justify-end items-baseline gap-2">
                             <span>Place:</span>
                             <Fillable name="submissionPlace" placeholder="Location" className="w-32 text-right" />
                          </div>
                       </div>
                    </div>

                    {/* Official Footer Section */}
                    <div className="pt-12 mt-12 bg-slate-50 dark:bg-slate-950 p-8 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                       <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] text-center mb-8">For Police Department Use Only</p>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-500 uppercase">G.D. Number</p>
                             <div className="border-b border-slate-300 min-h-[1.5rem]"></div>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-500 uppercase">Entry Date</p>
                             <div className="border-b border-slate-300 min-h-[1.5rem]"></div>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-500 uppercase">Official FIR No.</p>
                             <div className="border-b border-slate-300 min-h-[1.5rem]"></div>
                          </div>
                       </div>
                       <div className="mt-12 text-center">
                          <div className="w-48 h-20 border-2 border-dotted border-slate-300 mx-auto mb-2 flex items-center justify-center rounded-xl">
                             <span className="text-[8px] font-bold text-slate-300 uppercase">Department Seal</span>
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Receiving Officer Signature & Seal</p>
                       </div>
                    </div>
                  </div>
               </CardContent>
            </Card>

            <div className="mt-16 flex flex-col items-center gap-6 print:hidden">
               <div className="flex gap-4">
                 <Button onClick={handlePrint} size="lg" className="h-16 px-12 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                   <Printer className="w-5 h-5 mr-2" /> Download & Print FIR
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
