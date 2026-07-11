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
  BadgeCheck,
  CheckCircle2,
  FileSignature
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function ResolutionFormatPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    resolutionNo: '',
    meetingNo: '',
    district: '',
    date: new Date().toLocaleDateString('en-IN'),
    time: '',
    venue: '',
    subject: '',
    background: '',
    resolution1: '',
    resolution2: '',
    resolution3: '',
    responsibility: '',
    budget: '',
    timeLimit: '',
    votesFor: '',
    votesAgainst: '',
    votesAbstain: '',
    status: 'unanimous', // 'unanimous' | 'majority' | 'postponed'
    proposerName: '',
    proposerPost: '',
    seconderName: '',
    seconderPost: '',
    approvedByPresidentName: '',
    approvedBySecretaryName: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePrint = () => {
    window.print()
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
      {/* Navigation Header - Hidden on Print */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <Link href="/trust-responsibilities" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Responsibilities
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <FileSignature className="w-8 h-8 text-accent" />
              </div>
              <BadgeCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Resolution <span className="text-accent italic">Format</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium">
              Official institutional record format for Central, State, and District General Meetings.
            </p>
          </div>
        </div>
      </section>

      {/* Editor Toolbar - Hidden on Print */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Governance Tool</span>
          </div>
          <Button onClick={handlePrint} className="bg-primary text-white hover:bg-secondary font-bold rounded-xl gap-2 shadow-xl shadow-primary/20">
            <Printer className="w-4 h-4" /> Print Resolution
          </Button>
        </div>
      </section>

      {/* Main Document Body */}
      <section className="py-16 md:py-24 px-4 print:py-0 print:px-0">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            
            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900 relative print:shadow-none print:rounded-none print:bg-white print:text-black">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 print:hidden"></div>
               <div className="absolute top-0 left-0 w-1.5 h-full bg-accent print:hidden"></div>
               
               <CardContent className="p-8 md:p-16 space-y-8 text-slate-800 dark:text-slate-200 font-sans leading-relaxed text-sm md:text-base print:text-black print:p-12">
                  {/* Letterhead */}
                  <div className="text-center space-y-3 pb-8 border-b-2 border-slate-100 print:border-black">
                    <div className="relative w-20 h-20 mx-auto">
                      <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-headline font-bold text-primary dark:text-white uppercase tracking-tight print:text-black">
                      HUMAN RIGHTS AFFAIRS TRUST
                    </h2>
                    <p className="text-sm font-bold text-slate-500 print:text-black">
                      Central / State / District General Meeting – Resolution
                    </p>
                  </div>

                  {/* Header Grid */}
                  <div className="grid grid-cols-2 gap-y-4 pt-6">
                    <div className="flex gap-2">
                       <span className="font-bold">Resolution No.:</span>
                       <Fillable name="resolutionNo" placeholder="_________" className="w-32" />
                    </div>
                    <div className="flex gap-2">
                       <span className="font-bold">Meeting No.:</span>
                       <Fillable name="meetingNo" placeholder="_________" className="w-32" />
                    </div>
                    <div className="flex gap-2">
                       <span className="font-bold">District:</span>
                       <Fillable name="district" placeholder="__________" className="w-40" />
                    </div>
                    <div className="flex gap-2">
                       <span className="font-bold">Date:</span>
                       <Fillable name="date" placeholder="__ / __ / __" className="w-32" />
                    </div>
                    <div className="flex gap-2">
                       <span className="font-bold">Time:</span>
                       <Fillable name="time" placeholder="___________" className="w-32" />
                    </div>
                    <div className="flex gap-2">
                       <span className="font-bold">Venue:</span>
                       <Fillable name="venue" placeholder="__________" className="w-40" />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <h4 className="font-bold text-primary dark:text-accent border-l-4 border-accent pl-3 print:text-black print:border-black">Subject (বিষয়)</h4>
                      <textarea 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border-none focus:ring-1 focus:ring-accent print:bg-transparent print:p-0"
                        rows={1}
                        placeholder="Enter Subject..."
                      />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-primary dark:text-accent border-l-4 border-accent pl-3 print:text-black print:border-black">Background (প্রস্তাবের কারণ)</h4>
                      <textarea 
                        name="background"
                        value={formData.background}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border-none focus:ring-1 focus:ring-accent print:bg-transparent print:p-0"
                        rows={3}
                        placeholder="Context of the proposal..."
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-primary dark:text-accent border-l-4 border-accent pl-3 print:text-black print:border-black">Resolution (গৃহীত সিদ্ধান্ত)</h4>
                      <p className="text-xs md:text-sm text-slate-500 italic print:text-black">
                        জেলা সাধারণ সভায় উপস্থিত সদস্যদের আলোচনা ও সম্মিলিত মতামতের ভিত্তিতে নিম্নলিখিত সিদ্ধান্ত সর্বসম্মতিক্রমে / সংখ্যাগরিষ্ঠ ভোটে গৃহীত হলো:
                      </p>
                      <div className="space-y-2 pl-4">
                         <div className="flex gap-2 items-start">
                            <span className="font-bold">1.</span>
                            <textarea 
                              name="resolution1"
                              value={formData.resolution1}
                              onChange={handleChange}
                              className="flex-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border-none text-sm print:bg-transparent print:p-0"
                              rows={2}
                            />
                         </div>
                         <div className="flex gap-2 items-start">
                            <span className="font-bold">2.</span>
                            <textarea 
                              name="resolution2"
                              value={formData.resolution2}
                              onChange={handleChange}
                              className="flex-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border-none text-sm print:bg-transparent print:p-0"
                              rows={2}
                            />
                         </div>
                         <div className="flex gap-2 items-start">
                            <span className="font-bold">3.</span>
                            <textarea 
                              name="resolution3"
                              value={formData.resolution3}
                              onChange={handleChange}
                              className="flex-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border-none text-sm print:bg-transparent print:p-0"
                              rows={2}
                            />
                         </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 pt-4">
                       <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Responsibility (দায়িত্বপ্রাপ্ত ব্যক্তি/কমিটি)</h4>
                          <Fillable name="responsibility" placeholder="---" className="w-full" />
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Budget (যদি প্রযোজ্য হয়)</h4>
                          <div className="flex items-baseline gap-1">
                             <span className="font-bold">₹</span>
                             <Fillable name="budget" placeholder="_________" className="w-full" />
                          </div>
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Time Limit (বাস্তবায়নের সময়সীমা)</h4>
                          <Fillable name="timeLimit" placeholder="---" className="w-full" />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Voting Result (ভোটের ফলাফল)</h4>
                          <div className="flex gap-4 text-xs font-bold">
                             <div className="flex gap-1 items-baseline"><span>পক্ষে:</span> <Fillable name="votesFor" placeholder="____" className="w-10 text-center" /></div>
                             <div className="flex gap-1 items-baseline"><span>বিপক্ষে:</span> <Fillable name="votesAgainst" placeholder="____" className="w-10 text-center" /></div>
                             <div className="flex gap-1 items-baseline"><span>বিরত:</span> <Fillable name="votesAbstain" placeholder="____" className="w-10 text-center" /></div>
                          </div>
                       </div>
                    </div>

                    <div className="pt-4 flex flex-wrap gap-6 items-center">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">সিদ্ধান্তের অবস্থা:</p>
                       <div className="flex gap-4 text-xs font-bold">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="status" 
                              value="unanimous" 
                              checked={formData.status === 'unanimous'} 
                              onChange={handleChange}
                              className="accent-accent"
                            />
                            ☐ সর্বসম্মতিক্রমে গৃহীত
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="status" 
                              value="majority" 
                              checked={formData.status === 'majority'} 
                              onChange={handleChange}
                              className="accent-accent"
                            />
                            ☐ সংখ্যাগরিষ্ঠ ভোটে গৃহীত
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="status" 
                              value="postponed" 
                              checked={formData.status === 'postponed'} 
                              onChange={handleChange}
                              className="accent-accent"
                            />
                            ☐ স্থগিত
                          </label>
                       </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid md:grid-cols-2 gap-12 pt-10">
                     <div className="space-y-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Proposed By (প্রস্তাবকারী)</h4>
                        <div className="space-y-3 pl-4 border-l-2 border-slate-100 print:border-black">
                           <div className="flex gap-2"><span>নাম:</span> <Fillable name="proposerName" placeholder="________" className="w-full" /></div>
                           <div className="flex gap-2"><span>পদ:</span> <Fillable name="proposerPost" placeholder="_________" className="w-full" /></div>
                           <div className="pt-4"><span className="text-[10px] text-slate-400">স্বাক্ষর: _______</span></div>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Seconded By (সমর্থনকারী)</h4>
                        <div className="space-y-3 pl-4 border-l-2 border-slate-100 print:border-black">
                           <div className="flex gap-2"><span>নাম:</span> <Fillable name="seconderName" placeholder="________" className="w-full" /></div>
                           <div className="flex gap-2"><span>পদ:</span> <Fillable name="seconderPost" placeholder="_________" className="w-full" /></div>
                           <div className="pt-4"><span className="text-[10px] text-slate-400">স্বাক্ষর: _______</span></div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-12 mt-12 border-t-2 border-slate-100 print:border-black">
                     <h4 className="text-center font-bold uppercase tracking-widest text-primary mb-10 print:text-black">Approved By</h4>
                     <div className="grid grid-cols-2 gap-20">
                        <div className="text-center space-y-4">
                           <div className="border-b-2 border-slate-200 w-full h-12 mb-2 print:border-black"></div>
                           <p className="font-bold text-sm">District President/Chairperson</p>
                           <div className="flex gap-2 justify-center text-xs"><span>নাম:</span> <Fillable name="approvedByPresidentName" placeholder="________" className="w-32" /></div>
                        </div>
                        <div className="text-center space-y-4">
                           <div className="border-b-2 border-slate-200 w-full h-12 mb-2 print:border-black"></div>
                           <p className="font-bold text-sm">District Secretary</p>
                           <div className="flex gap-2 justify-center text-xs"><span>নাম:</span> <Fillable name="approvedBySecretaryName" placeholder="________" className="w-32" /></div>
                        </div>
                     </div>
                  </div>

                  {/* Seal Area */}
                  <div className="pt-16 flex flex-col items-center gap-4">
                     <div className="w-40 h-40 border-4 border-dotted border-slate-200 rounded-full flex items-center justify-center relative opacity-20 print:opacity-40">
                        <Image src="/HRAT%20Logo.jpeg" alt="seal" width={80} height={80} className="object-contain grayscale" />
                        <span className="absolute text-[8px] font-black uppercase tracking-widest text-center">Official Seal of<br/>Human Rights Affairs Trust</span>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 print:text-black">Verification Document</p>
                  </div>
               </CardContent>
            </Card>

            <div className="mt-16 flex flex-col items-center gap-6 print:hidden">
               <Button onClick={handlePrint} size="lg" className="h-16 px-12 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                 <Printer className="w-5 h-5 mr-2" /> Download & Print Resolution
               </Button>
               <Link href="/trust-responsibilities" className="text-slate-400 hover:text-primary transition-colors font-bold text-sm flex items-center gap-2">
                 <ArrowLeft className="w-4 h-4" /> Return to Guidelines
               </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
