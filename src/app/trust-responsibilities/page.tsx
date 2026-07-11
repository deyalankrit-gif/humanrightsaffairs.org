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
  UserCheck,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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

  const bengaliGuidelines = [
    {
      title: "১. মানবিক সহায়তা ও সামাজিক দায়িত্ব",
      items: [
        "অসহায়, দুঃস্থ ও বিপদগ্রস্ত মানুষের পাশে দাঁড়ানো।",
        "দুর্ঘটনা, অসুস্থতা বা জরুরি পরিস্থিতিতে যথাসম্ভব সহায়তা প্রদান।",
        "প্রবীণ, বিধবা, প্রতিবন্ধী ও সমাজের অবহেলিত মানুষের কল্যাণে কাজ করা।",
        "রক্তদান, স্বাস্থ্য শিবির ও জনসচেতনতামূলক কর্মসূচিতে অংশগ্রহণ করা।"
      ]
    },
    {
      title: "২. মানবাধিকার সুরক্ষা",
      items: [
        "মানবাধিকার লঙ্ঘনের ঘটনা সম্পর্কে সচেতন থাকা।",
        "অন্যায়, বৈষম্য, নির্যাতন বা শোষণের বিরুদ্ধে প্রতিবাদ জানানো।",
        "মানবাধিকার লঙ্ঘনের ঘটনা যথাযথ কর্তৃপক্ষ ও প্রশাসনের নজরে আনা।",
        "ন্যায়বিচার প্রতিষ্ঠার লক্ষ্যে আইনসম্মত ও শান্তিপূর্ণ পদক্ষেপ গ্রহণ করা।"
      ]
    },
    {
      title: "৩. আইনি সহায়তা",
      items: [
        "দরিদ্র ও অসহায় মানুষকে প্রাথমিক আইনি পরামর্শ প্রদানে সহযোগিতা করা।",
        "প্রয়োজনে আইনজীবী বা সংশ্লিষ্ট বিশেষজ্ঞের সাথে যোগাযোগ স্থাপনে সহায়তা করা।",
        "আইন সম্পর্কে সাধারণ মানুষের মধ্যে সচেতনতা বৃদ্ধি করা।",
        "ভুক্তভোগীদের অভিযোগ ও আবেদনপত্র প্রস্তুতে সহযোগিতা করা।"
      ]
    },
    {
      title: "৪. শিক্ষা ও শিশু কল্যাণ",
      items: [
        "সুবিধাবঞ্চিত শিশুদের শিক্ষার সুযোগ বৃদ্ধিতে কাজ করা।",
        "স্কুলছুট শিশুদের পুনরায় শিক্ষার আওতায় আনতে উদ্যোগ নেওয়া।",
        "শিক্ষাসামগ্রী, বই, খাতা ও অন্যান্য প্রয়োজনীয় সহায়তা প্রদানে সহযোগিতা করা।",
        "শিশু অধিকার ও শিশু সুরক্ষা বিষয়ে সচেতনতা বৃদ্ধি করা।"
      ]
    },
    {
      title: "৫. নারী ও শিশু সুরক্ষা",
      items: [
        "নারী নির্যাতন, বাল্যবিবাহ, পাচার ও সহিংসতার বিরুদ্ধে সচেতনতা গড়ে তোলা।",
        "নির্যাতিত নারী ও শিশুদের প্রয়োজনীয় সহায়তা ও পরামর্শ প্রদান করা।",
        "নারীদের স্বনির্ভরতা ও দক্ষতা উন্নয়নে সহায়ক কর্মসূচি পরিচালনা করা।"
      ]
    },
    {
      title: "৬. কর্মসংস্থান ও স্বনির্ভরতা",
      items: [
        "বেকার ও আর্থিকভাবে পিছিয়ে পড়া মানুষের কর্মসংস্থানের সুযোগ তৈরিতে সহযোগিতা করা।",
        "কারিগরি শিক্ষা, দক্ষতা উন্নয়ন ও প্রশিক্ষণমূলক কর্মসূচি আয়োজন করা।",
        "ক্ষুদ্র উদ্যোক্তা ও স্বনির্ভর প্রকল্পকে উৎসাহিত করা।"
      ]
    },
    {
      title: "৭. দুর্যোগ ও ত্রাণ কার্যক্রম",
      items: [
        "বন্যা, ঘূর্ণিঝড়, ভূমিকম্প, অগ্নিকাণ্ডসহ প্রাকৃতিক ও মানবসৃষ্ট দুর্যোগে ক্ষতিগ্রস্ত মানুষের পাশে দাঁড়ানো।",
        "ত্রাণ, খাদ্য, বস্ত্র, ওষুধ ও অন্যান্য জরুরি সামগ্রী বিতরণে অংশগ্রহণ করা।",
        "পুনর্বাসন কার্যক্রমে সহযোগিতা করা।"
      ]
    },
    {
      title: "৮. সামাজিক সচেতনতা বৃদ্ধি",
      items: [
        "মাদকবিরোধী, পরিবেশ সচেতনতা ও স্বাস্থ্য সচেতনতা কর্মসূচি পরিচালনা করা।",
        "সামাজিক কুসংস্কার, বৈষম্য ও অসহিষ্ণুতার বিরুদ্ধে সচেতনতা তৈরি করা।",
        "নাগরিক অধিকার ও দায়িত্ব সম্পর্কে জনগণকে অবহিত করা।"
      ]
    },
    {
      title: "৯. পরিবেশ ও জনকল্যাণ",
      items: [
        "বৃক্ষরোপণ ও পরিবেশ সংরক্ষণ কার্যক্রমে অংশগ্রহণ করা।",
        "পরিষ্কার-পরিচ্ছন্নতা ও জনস্বাস্থ্য উন্নয়নে কাজ করা।",
        "নিরাপদ ও সুস্থ পরিবেশ গড়ে তুলতে জনসচেতনতা বৃদ্ধি করা।"
      ]
    },
    {
      title: "১০. সংগঠনের নৈতিক দায়িত্ব",
      items: [
        "সততা, নিরপেক্ষতা ও মানবিক মূল্যবোধ বজায় রাখা।",
        "সকল মানুষের প্রতি সমান সম্মান ও মর্যাদা প্রদর্শন করা।",
        "ধর্ম, বর্ণ, লিঙ্গ, ভাষা বা রাজনৈতিক মতাদর্শ নির্বিশেষে সেবা প্রদান করা।",
        "সংগঠনের সুনাম ও মর্যাদা রক্ষা করা।",
        "আইন, সংবিধান ও মানবাধিকারের মৌলিক নীতিমালা মেনে চলা।"
      ]
    },
    {
      title: "১১. সাংগঠনিক বাধ্যতামূলক রেকর্ড (Monthly)",
      items: [
        "Meeting Notice (সভার নোটিশ)",
        "Agenda Sheet (আলোচ্যসূচি)",
        "Attendance Register (উপস্থিতি রেজিস্টার ও স্বাক্ষর)",
        "Minutes Book (সভার কার্যবিবরণী)",
        { isLink: true, label: "Resolution Register / Resolution Copy (গৃহীত সিদ্ধান্তের রেকর্ড)", href: "/legal/resolution-format", color: "text-blue-600 dark:text-blue-400" },
        "Action Taken Report (ATR) (গত মাসের সিদ্ধান্ত কতটা বাস্তবায়িত হয়েছে তার রিপোর্ট)",
        "উন্নয়নমূলক পরিকল্পনার জন্য:",
        "Development Proposal Form (নতুন প্রস্তাব জমা দেওয়ার ফর্ম)",
        "Project Planning Sheet (প্রকল্পের পরিকল্পনা)",
        "Budget Approval Sheet (বাজেট অনুমোদন)",
        "Responsibility Assignment Sheet (কে কোন কাজ করবেন তার তালিকা)",
        "Timeline / Work Schedule (কাজ শেষ করার সময়সীমা)",
        "প্রশাসনিক রেকর্ড:",
        "Correspondence Register (আগত ও প্রেরিত চিঠির রেজিস্টার)",
        "Visitor Register (দর্শনার্থী রেজিস্টার)",
        "Complaint & Suggestion Register (অভিযোগ ও পরামর্শ)",
        "Member Proposal Register (সদস্যদের প্রস্তাবের রেকর্ড)",
        "Asset Register (অফিসের সম্পদের তালিকা)",
        "আর্থিক রেকর্ড:",
        "Cash Book",
        "Voucher File (Receipt ও Payment Voucher)",
        "Donation Register",
        "Expense Register",
        "Bank Transaction Register",
        "আলাদা ফাইল:",
        "Monthly Meeting File",
        "Resolution File",
        "Project File",
        "Legal & Compliance File",
        "Membership File",
        "Photo & Activity Report File"
      ]
    },
    {
      title: "১২. বছরে একবার বাধ্যতামূলক করনীয়",
      titleHref: "/legal/annual-governance-checklist",
      titleColor: "text-blue-600 dark:text-blue-400",
      items: [
        "বার্ষিক সাধারণ সভা (AGM)",
        "বার্ষিক প্রতিবেদন প্রকাশ",
        "অডিট রিপোর্ট উপস্থাপন",
        "শ্রেষ্ঠ স্বেচ্ছাসেবক ও সমাজসেবী সম্মাননা",
        "আগামী বছরের কর্মপরিকল্পনা অনুমোদন"
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
               <h4 className="text-2xl font-headline font-bold text-primary dark:text-white mb-6">Transparency & Accountability</h4>
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
            </div>
          </div>
        </div>
      </section>

      {/* Bengali Guidelines Section */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t-8 border-emerald-500/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-4xl font-headline font-bold text-primary dark:text-white">Human Rights Affairs Trust</h2>
              <h3 className="text-xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">কর্মী, স্বেচ্ছাসেবক ও নেতৃবৃন্দের করণীয় ও দায়িত্বসমূহ</h3>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-900 inline-block shadow-sm">
                <p className="font-bold text-emerald-800 dark:text-emerald-400 text-lg">আমাদের মূল আদর্শ: “মানবতার সেবা, ন্যায়ের প্রতিষ্ঠা এবং মানবাধিকারের সুরক্ষা।”</p>
              </div>
            </div>

            <div className="grid gap-10">
              {bengaliGuidelines.map((section: any, idx) => (
                <div key={idx} className="space-y-6 group">
                  {section.titleHref ? (
                    <Link href={section.titleHref} className="block group/title w-fit">
                      <h4 className={cn(
                        "text-xl md:text-2xl font-bold border-l-4 border-accent pl-4 hover:underline decoration-accent/30 underline-offset-8 flex items-center gap-2 transition-all",
                        section.titleColor || "text-primary dark:text-white"
                      )}>
                        {section.title}
                        <ExternalLink className="w-5 h-5 opacity-50 group-hover/title:opacity-100 transition-opacity" />
                      </h4>
                    </Link>
                  ) : (
                    <h4 className="text-xl md:text-2xl font-bold text-primary dark:text-white border-l-4 border-accent pl-4 group-hover:text-accent transition-colors">{section.title}</h4>
                  )}
                  
                  <ul className="grid gap-3 pl-4">
                    {section.items.map((item: any, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        {typeof item === 'string' ? (
                           <span className={cn("leading-relaxed", item.endsWith(":") && "font-bold text-primary border-b border-accent/20 pb-1 mt-4 block w-fit")}>{item}</span>
                        ) : (
                          <Link 
                            href={item.href} 
                            className={cn(
                              "font-bold hover:underline decoration-accent/30 underline-offset-4 flex items-center gap-2 group/link",
                              item.color || "text-accent"
                            )}
                          >
                             {item.label}
                             <ExternalLink className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-20 p-10 md:p-16 rounded-[3rem] bg-slate-950 text-white text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-accent mb-6">সংগঠনের অঙ্গীকার</p>
              <p className="text-xl md:text-3xl font-bold italic leading-relaxed text-slate-200">
                “আমরা অন্যায়ের বিরুদ্ধে সোচ্চার হব, ন্যায়ের পক্ষে দৃঢ়ভাবে দাঁড়াব, মানবাধিকারের সুরক্ষায় কাজ করব এবং মানবতার কল্যাণে নিজেদের সর্বোচ্চ সামর্থ্য নিয়োজিত রাখব।”
              </p>
              <div className="mt-12 flex justify-center opacity-30">
                 <div className="relative w-20 h-20">
                    <img src="/HRAT%20Logo.jpeg" alt="Logo" className="object-contain grayscale" />
                 </div>
              </div>
            </div>

            <div className="text-center pt-12">
               <Link href="/" className="text-slate-400 hover:text-primary transition-colors font-bold text-sm flex items-center justify-center gap-2">
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
