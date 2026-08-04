
"use client"

import React, { useState, useEffect } from 'react'
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
  Calendar,
  Users,
  Building2,
  FileSignature
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function AGMFormatPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    agmNo: '',
    financialYear: '',
    date: '',
    time: '',
    venue: '',
    chairman: '',
    generalSecretary: '',
    totalMembers: '',
    presentMembers: '',
    absentMembers: '',
    res1No: '', res1Subject: '', res1Decision: '',
    res2No: '', res2Subject: '', res2Decision: '',
    res3No: '', res3Subject: '', res3Decision: '',
    chairmanName: '',
    secretaryName: '',
    treasurerName: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const agendaItems = [
    "Welcome Address (স্বাগত বক্তব্য)",
    "Confirmation of Previous AGM Minutes (গত AGM-এর কার্যবিবরণী অনুমোদন)",
    "Annual Report Presentation (বার্ষিক প্রতিবেদন উপস্থাপন)",
    "Auditor's Report Presentation (অডিট রিপোর্ট উপস্থাপন)",
    "Approval of Income & Expenditure Statement (আয়-ব্যয়ের হিসাব অনুমোদন)",
    "Budget Approval for Next Financial Year (পরবর্তী অর্থবছরের বাজেট অনুমোদন)",
    "Membership Report (সদস্যপদ প্রতিবেদন)",
    "Project & Development Report (প্রকল্প ও উন্নয়ন প্রতিবেদন)",
    "Adoption of New Resolution(s) (নতুন রেজুলেশন গ্রহণ)",
    "Election of Office Bearers (If Applicable) (প্রয়োজন হলে পদাধিকারীদের নির্বাচন)",
    "Future Action Plan (ভবিষ্যৎ কর্মপরিকল্পনা অনুমোদন)",
    "Any Other Matter with Permission of the Chair (চেয়ারম্যানের অনুমতিক্রমে অন্যান্য বিষয়)",
    "Vote of Thanks (ধন্যবাদ জ্ঞাপন)",
    "Adjournment of Meeting (সভা সমাপ্তি)"
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 print:bg-white print:p-0">
      {/* Header - Hidden on Print */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link href="/trust-responsibilities" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Responsibilities
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <BadgeCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              AGM <span className="text-accent italic">Format</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium">
              Standardized format for the Annual General Meeting (বার্ষিক সাধারণ সভা) of the Human Rights Affairs Trust.
            </p>
          </div>
        </div>
      </section>

      {/* Toolbar - Hidden on Print */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Governance Tool</span>
          </div>
          <Button onClick={handlePrint} className="bg-primary text-white hover:bg-secondary font-bold rounded-xl gap-2 shadow-xl shadow-primary/20">
            <Printer className="w-4 h-4" /> Print AGM Record
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
               
               <CardContent className="p-8 md:p-16 space-y-10 text-slate-800 dark:text-slate-200 font-sans leading-relaxed text-sm md:text-base print:text-black print:p-12">
                  {/* Letterhead */}
                  <div className="text-center space-y-3 pb-8 border-b-2 border-slate-100 print:border-black">
                    <div className="relative w-20 h-20 mx-auto">
                      <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-headline font-bold text-primary dark:text-white uppercase tracking-tight print:text-black">
                      HUMAN RIGHTS AFFAIRS TRUST
                    </h2>
                    <h3 className="text-lg md:text-xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest print:text-black">
                      Annual General Meeting (AGM)
                    </h3>
                    <p className="text-lg font-bold text-slate-500 print:text-black">
                      বার্ষিক সাধারণ সভা
                    </p>
                  </div>

                  {/* Header Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 pt-6">
                    <div className="flex gap-2">
                       <span className="font-bold">AGM No. (সভা নং):</span>
                       <Fillable name="agmNo" placeholder="_________" className="w-32" />
                    </div>
                    <div className="flex gap-2">
                       <span className="font-bold">Financial Year (অর্থবছর):</span>
                       <Fillable name="financialYear" placeholder="_________" className="w-32" />
                    </div>
                    <div className="flex gap-2">
                       <span className="font-bold">Date (তারিখ):</span>
                       <Fillable name="date" placeholder="__________" className="w-40" />
                    </div>
                    <div className="flex gap-2">
                       <span className="font-bold">Time (সময়):</span>
                       <Fillable name="time" placeholder="___________" className="w-32" />
                    </div>
                    <div className="flex gap-2 md:col-span-2">
                       <span className="font-bold">Venue (স্থান):</span>
                       <Fillable name="venue" placeholder="____________________________________" className="w-full" />
                    </div>
                    <div className="flex gap-2">
                       <span className="font-bold">Chairman (চেয়ারম্যান):</span>
                       <Fillable name="chairman" placeholder="__________" className="w-48" />
                    </div>
                    <div className="flex gap-2">
                       <span className="font-bold">General Secretary (সাধারণ সম্পাদক):</span>
                       <Fillable name="generalSecretary" placeholder="__________" className="w-48" />
                    </div>
                  </div>

                  {/* Notice Section */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 print:bg-transparent print:border-black print:p-4">
                    <h4 className="font-bold text-primary dark:text-accent mb-2 uppercase text-xs tracking-widest print:text-black">Notice of AGM (AGM-এর নোটিশ)</h4>
                    <p className="text-justify leading-relaxed italic print:text-black">
                      এতদ্বারা Human Rights Affairs Trust-এর সকল সদস্যকে জানানো যাচ্ছে যে, Trust-এর Annual General Meeting (AGM) উপরোক্ত তারিখ, সময় ও স্থানে অনুষ্ঠিত হবে। সকল সদস্যকে যথাসময়ে উপস্থিত থাকার জন্য অনুরোধ করা হচ্ছে।
                    </p>
                  </div>

                  {/* Attendance Section */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-primary dark:text-accent border-l-4 border-accent pl-3 print:text-black print:border-black uppercase text-xs tracking-widest">Attendance (উপস্থিতি)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-4">
                       <div className="flex gap-2 items-baseline">
                         <span className="font-bold text-sm">Total Members (মোট সদস্য):</span>
                         <Fillable name="totalMembers" placeholder="____" className="w-16 text-center" />
                       </div>
                       <div className="flex gap-2 items-baseline">
                         <span className="font-bold text-sm">Members Present (উপস্থিত সদস্য):</span>
                         <Fillable name="presentMembers" placeholder="____" className="w-16 text-center" />
                       </div>
                       <div className="flex gap-2 items-baseline">
                         <span className="font-bold text-sm">Members Absent (অনুপস্থিত সদস্য):</span>
                         <Fillable name="absentMembers" placeholder="____" className="w-16 text-center" />
                       </div>
                    </div>
                    <p className="text-xs text-slate-500 italic pl-4 print:text-black">Attendance Register সংযুক্ত থাকবে।</p>
                  </div>

                  {/* Agenda Section */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-primary dark:text-accent border-l-4 border-accent pl-3 print:text-black print:border-black uppercase text-xs tracking-widest">Agenda (আলোচ্যসূচি)</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pl-4">
                      {agendaItems.map((item, index) => (
                        <li key={index} className="text-sm flex gap-3 items-start">
                          <span className="font-bold text-accent print:text-black">{index + 1}.</span>
                          <span className="print:text-black">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Resolutions Section */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-primary dark:text-accent border-l-4 border-accent pl-3 print:text-black print:border-black uppercase text-xs tracking-widest">Resolutions Passed (গৃহীত সিদ্ধান্তসমূহ)</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 print:border-black">
                        <thead className="bg-slate-50 dark:bg-slate-900 print:bg-transparent">
                          <tr>
                            <th className="border border-slate-200 dark:border-slate-800 p-2 text-xs uppercase print:border-black">Resolution No.</th>
                            <th className="border border-slate-200 dark:border-slate-800 p-2 text-xs uppercase print:border-black">Subject (বিষয়)</th>
                            <th className="border border-slate-200 dark:border-slate-800 p-2 text-xs uppercase print:border-black">Decision (সিদ্ধান্ত)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3].map((row) => (
                            <tr key={row}>
                              <td className="border border-slate-200 dark:border-slate-800 p-2 print:border-black">
                                <Fillable name={`res${row}No`} placeholder="---" className="w-full" />
                              </td>
                              <td className="border border-slate-200 dark:border-slate-800 p-2 print:border-black">
                                <Fillable name={`res${row}Subject`} placeholder="---" className="w-full" />
                              </td>
                              <td className="border border-slate-200 dark:border-slate-800 p-2 print:border-black">
                                <Fillable name={`res${row}Decision`} placeholder="---" className="w-full" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
                     <div className="space-y-4 text-center">
                        <div className="border-b-2 border-slate-200 w-full h-12 mb-2 print:border-black"></div>
                        <p className="font-bold text-sm uppercase">Chairman (চেয়ারম্যান)</p>
                        <div className="flex gap-2 justify-center text-xs"><span>Name (নাম):</span> <Fillable name="chairmanName" placeholder="________" className="w-32" /></div>
                     </div>
                     <div className="space-y-4 text-center">
                        <div className="border-b-2 border-slate-200 w-full h-12 mb-2 print:border-black"></div>
                        <p className="font-bold text-sm uppercase">General Secretary (সাধারণ সম্পাদক)</p>
                        <div className="flex gap-2 justify-center text-xs"><span>Name (নাম):</span> <Fillable name="secretaryName" placeholder="________" className="w-32" /></div>
                     </div>
                     <div className="space-y-4 text-center">
                        <div className="border-b-2 border-slate-200 w-full h-12 mb-2 print:border-black"></div>
                        <p className="font-bold text-sm uppercase">Treasurer (কোষাধ্যক্ষ)</p>
                        <div className="flex gap-2 justify-center text-xs"><span>Name (নাম):</span> <Fillable name="treasurerName" placeholder="________" className="w-32" /></div>
                     </div>
                  </div>

                  {/* Seal Area */}
                  <div className="pt-16 flex flex-col items-center gap-4">
                     <div className="w-40 h-40 border-4 border-dotted border-slate-200 rounded-full flex items-center justify-center relative opacity-20 print:opacity-40">
                        <Image src="/HRAT%20Logo.jpeg" alt="seal" width={80} height={80} className="object-contain grayscale" />
                        <span className="absolute text-[8px] font-black uppercase tracking-widest text-center">Official Seal of<br/>Human Rights Affairs Trust</span>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 print:text-black">Institutional Audit Record</p>
                  </div>
               </CardContent>
            </Card>

            <div className="mt-16 flex flex-col items-center gap-6 print:hidden">
               <Button onClick={handlePrint} size="lg" className="h-16 px-12 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                 <Printer className="w-5 h-5 mr-2" /> Download & Print AGM Record
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
