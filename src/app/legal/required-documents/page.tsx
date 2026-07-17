"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Printer, 
  ShieldCheck, 
  FileCheck, 
  Building2, 
  Users, 
  Wallet, 
  IndianRupee, 
  BookOpen, 
  Handshake, 
  Briefcase, 
  HeartHandshake, 
  UserPlus, 
  Scale, 
  Globe, 
  ImageIcon, 
  Calendar,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function RequiredDocumentsPage() {
  const handlePrint = () => {
    window.print()
  }

  const sections = [
    {
      id: 'A',
      title: "Trust Registration",
      icon: <Building2 className="w-5 h-5" />,
      items: [
        "Registered Trust Deed",
        "Trust Registration Certificate",
        "PAN Card (Trust)",
        "TAN (if applicable)",
        "Registered Office Address Proof",
        "Office NOC (if office is rented)",
        "Electricity Bill / Property Tax Receipt",
        "Trust Seal / Rubber Stamp"
      ]
    },
    {
      id: 'B',
      title: "Trustees' Documents",
      icon: <Users className="w-5 h-5" />,
      items: [
        "List of Trustees",
        "Aadhaar Card of all Trustees",
        "PAN Card of all Trustees",
        "Passport-size Photographs",
        "Mobile Numbers",
        "Email Addresses",
        "KYC Documents",
        "Trustee Acceptance Letter (if applicable)"
      ]
    },
    {
      id: 'C',
      title: "Government Registrations",
      icon: <FileCheck className="w-5 h-5" />,
      items: [
        "NITI Aayog NGO DARPAN Unique ID",
        "Income Tax e-Filing Registration",
        "Digital Signature Certificate (DSC)",
        "CSR-1 Registration Certificate",
        "12AB Registration Certificate",
        "80G Registration Certificate",
        "FCRA Registration / Prior Permission (if applicable)"
      ]
    },
    {
      id: 'D',
      title: "Banking",
      icon: <Wallet className="w-5 h-5" />,
      items: [
        "Current Bank Account",
        "Cancelled Cheque",
        "Passbook / Bank Statements",
        "Internet Banking",
        "Cheque Book",
        "Board Resolution for Bank Operation",
        "Authorized Signatory Details"
      ]
    },
    {
      id: 'E',
      title: "Income Tax Compliance",
      icon: <IndianRupee className="w-5 h-5" />,
      items: [
        "Annual ITR-7 Filing",
        "Audit Report (where applicable)",
        "Form 10B / Form 10BB (where applicable)",
        "Form 10BD Filing",
        "Form 10BE issued to Donors",
        "TDS Compliance (if applicable)"
      ]
    },
    {
      id: 'F',
      title: "Accounting Records",
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        "Cash Book",
        "Bank Book",
        "Ledger",
        "Journal",
        "Trial Balance",
        "Receipt Book",
        "Payment Voucher Register",
        "Donation Receipt Book",
        "Income & Expenditure Account",
        "Receipts & Payments Account",
        "Balance Sheet",
        "Fixed Asset Register",
        "Asset Verification Register",
        "Budget Register",
        "Audit File"
      ]
    },
    {
      id: 'G',
      title: "Administrative Registers",
      icon: <ClipboardList className="w-5 h-5" />,
      items: [
        "Trustee Register",
        "Membership Register (if applicable)",
        "Volunteer Register",
        "Employee Register (if applicable)",
        "Attendance Register",
        "Visitor Register",
        "Complaint Register",
        "Document Register",
        "Resolution Register",
        "Seal Register"
      ]
    },
    {
      id: 'H',
      title: "Meetings & Governance",
      icon: <Handshake className="w-5 h-5" />,
      items: [
        "Trustee Meeting Minutes Book",
        "Annual Meeting Minutes Book",
        "Board Resolution File",
        "Meeting Attendance Register",
        "Notice Register",
        "Agenda Register"
      ]
    },
    {
      id: 'I',
      title: "Project Management",
      icon: <Briefcase className="w-5 h-5" />,
      items: [
        "Project Proposal File",
        "Project Budget",
        "Beneficiary Register",
        "Activity Report",
        "Monitoring Report",
        "Project Completion Report",
        "Utilization Certificate (UC)"
      ]
    },
    {
      id: 'J',
      title: "Donation & CSR Management",
      icon: <HeartHandshake className="w-5 h-5" />,
      items: [
        "Donation Register",
        "Donor Register",
        "CSR Register",
        "Grant Register",
        "Grant Agreement File",
        "Donation Receipt Counterfoils",
        "CSR Utilization Report"
      ]
    },
    {
      id: 'K',
      title: "Human Resource",
      icon: <UserPlus className="w-5 h-5" />,
      items: [
        "Appointment Letters",
        "Employee Personal Files",
        "Salary Register",
        "Leave Register",
        "HR Policy",
        "Code of Conduct"
      ]
    },
    {
      id: 'L',
      title: "Legal & Policy Documents",
      icon: <Scale className="w-5 h-5" />,
      items: [
        "Finance Policy",
        "Procurement Policy",
        "Conflict of Interest Policy",
        "Child Protection Policy",
        "POSH Policy",
        "Whistleblower Policy",
        "Anti-Fraud Policy",
        "Data Protection & Privacy Policy",
        "Volunteer Policy",
        "Organizational Policy Manual"
      ]
    },
    {
      id: 'M',
      title: "Digital Infrastructure",
      icon: <Globe className="w-5 h-5" />,
      items: [
        "Official Website",
        "Official Domain Name",
        "Official Email ID",
        "Cloud Backup",
        "Document Management System (DMS)",
        "Social Media Accounts"
      ]
    },
    {
      id: 'N',
      title: "Branding",
      icon: <ImageIcon className="w-5 h-5" />,
      items: [
        "Official Logo",
        "Letterhead",
        "Rubber Stamp",
        "Identity Cards",
        "Visiting Cards",
        "Brochures",
        "Annual Report"
      ]
    },
    {
      id: 'O',
      title: "Annual Compliance Calendar",
      icon: <Calendar className="w-5 h-5" />,
      items: [
        "Statutory Audit Completed",
        "ITR-7 Filed",
        "Form 10BD Filed",
        "Form 10BE Issued",
        "Annual Accounts Approved",
        "Annual Activity Report Prepared",
        "Compliance Review Completed",
        "Renewal of Registrations (if applicable)",
        "Renewal of DSC (if applicable)"
      ]
    }
  ]

  const masterFileItems = [
    "Registered Trust Deed",
    "Registration Certificate",
    "PAN Card",
    "TAN (if applicable)",
    "Bank Documents",
    "NITI Aayog NGO DARPAN Certificate",
    "12AB Certificate",
    "80G Certificate",
    "CSR-1 Certificate",
    "Digital Signature Certificate (DSC)",
    "FCRA Certificate (if applicable)",
    "Audit Reports",
    "ITR-7 Acknowledgements",
    "Trustee Records",
    "Minutes Books",
    "Donation Register",
    "Asset Register",
    "Project Files",
    "Utilization Certificates",
    "Annual Reports",
    "Organizational Policies",
    "Compliance Calendar"
  ]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 print:bg-white print:p-0">
      {/* Header - Hidden on Print */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
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
              Required <span className="text-accent italic">Documents</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium">
              Master Compliance Checklist for the Human Rights Affairs Trust.
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
            <Printer className="w-4 h-4" /> Print Compliance File
          </Button>
        </div>
      </section>

      {/* Main Document Body */}
      <section className="py-16 md:py-24 px-4 print:py-0 print:px-0">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            
            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900 relative print:shadow-none print:rounded-none print:bg-white print:text-black">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 print:hidden"></div>
               
               <CardContent className="p-8 md:p-16 space-y-12 text-slate-800 dark:text-slate-200 font-sans leading-relaxed text-sm md:text-base print:text-black print:p-12">
                  {/* Letterhead */}
                  <div className="text-center space-y-3 pb-8 border-b-2 border-slate-100 print:border-black">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
                    </div>
                    <h2 className="text-2xl md:text-5xl font-headline font-bold text-primary dark:text-white uppercase tracking-tight print:text-black leading-none">
                      HUMAN RIGHTS AFFAIRS TRUST
                    </h2>
                    <h3 className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] print:text-black mt-2">
                      MASTER COMPLIANCE CHECKLIST
                    </h3>
                    <p className="text-sm font-bold text-slate-500 print:text-black">
                      (West Bengal Registered Public Charitable Trust)
                    </p>
                  </div>

                  {/* Checklist Sections */}
                  <div className="space-y-12">
                    {sections.map((section) => (
                      <div key={section.id} className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 print:border-black">
                           <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-accent print:text-black">
                              {section.icon}
                           </div>
                           <h4 className="text-xl font-bold text-primary dark:text-white print:text-black">
                             {section.id}. {section.title}
                           </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                           {section.items.map((item, idx) => (
                             <div key={idx} className="flex items-start gap-3 group">
                               <div className="h-5 w-5 shrink-0 rounded border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 group-hover:border-accent transition-colors flex items-center justify-center print:border-black">
                                 <span className="text-[10px] text-transparent">✓</span>
                               </div>
                               <span className="font-medium text-slate-600 dark:text-slate-400 print:text-black">{item}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Master Compliance File Highlight */}
                  <div className="mt-16 p-8 md:p-12 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl print:bg-white print:text-black print:border-2 print:border-black print:rounded-none">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full -mr-24 -mt-24 blur-3xl print:hidden"></div>
                    <div className="relative z-10 space-y-8">
                       <div className="flex items-center gap-4 border-b border-white/10 pb-6 print:border-black">
                         <ShieldCheck className="w-8 h-8 text-accent" />
                         <h4 className="text-2xl font-headline font-bold">MASTER COMPLIANCE FILE</h4>
                       </div>
                       <p className="text-slate-400 italic text-sm print:text-black">Maintain the following documents in one secure Master Compliance File:</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6">
                         {masterFileItems.map((item, idx) => (
                           <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-300 print:text-black">
                             <div className="h-4 w-4 border border-white/30 rounded flex items-center justify-center shrink-0 print:border-black">
                               <span className="text-[8px] text-transparent">✓</span>
                             </div>
                             {item}
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="pt-16 border-t-2 border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 print:border-black">
                     <div className="space-y-1 text-center md:text-left">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Entity Metadata</p>
                        <div className="flex flex-col text-sm font-bold text-primary dark:text-white print:text-black">
                           <span>Prepared for: Human Rights Affairs Trust</span>
                           <span>Entity Type: Registered Public Charitable Trust</span>
                           <span>Jurisdiction: West Bengal, India</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-center gap-2">
                        <div className="w-32 h-32 border-4 border-dotted border-slate-200 rounded-full flex items-center justify-center relative opacity-20 print:opacity-50">
                           <Image src="/HRAT%20Logo.jpeg" alt="seal" width={60} height={60} className="object-contain grayscale" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 print:text-black">Authorized Official Audit Record</p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="mt-16 flex flex-col items-center gap-6 print:hidden">
               <Button onClick={handlePrint} size="lg" className="h-16 px-12 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                 <Printer className="w-5 h-5 mr-2" /> Download & Print Master Checklist
               </Button>
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
