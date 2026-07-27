
"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Printer, 
  FileText, 
  BadgeCheck, 
  Truck,
  Building2,
  X,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

/**
 * SupplierQuotationPage: High-fidelity interactive template for vendor quotes.
 * Optimized for F4 size printing (210mm x 330mm) with absolute minimum margins.
 * Features a Live Editor for administrative personnel.
 * Updated: Included specific institutional contact info in header.
 * Link refinement: Website link made larger and red.
 * Optimization: Compacted to 2 pages by reducing row height to py-12.
 * Print Refinement: Added thick top border for print output as requested.
 */
export default function SupplierQuotationPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    refNo: '',
    date: new Date().toLocaleDateString('en-IN'),
    supplierName: '',
    contactPerson: '',
    supplierAddress: '',
    mobile: '',
    email: '',
    gstNo: '',
    subtotal: '',
    gstAmount: '',
    freight: '',
    otherCharges: '',
    grandTotal: '',
    deliveryPeriod: '',
    deliveryAddress: 'HRAT Official Office',
    paymentTerms: '',
    warranty: '',
    installation: 'No',
    supplierNameSign: '',
    supplierDesignation: '',
    declarationDate: new Date().toLocaleDateString('en-IN'),
    requisitionNo: '',
    receivedDate: '',
    verifiedBy: '',
    recommended: 'No',
    approvedBy: '',
    approvalDate: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopy = () => {
    const tableHeader = "Sl.|Description|Spec|Qty|Unit|Rate|Total\n"
    const tableBody = [1,2,3,4,5].map(i => `${i}|--- |--- |0 |--- |0 |0`).join('\n')
    
    const text = `
HUMAN RIGHTS AFFAIRS TRUST
SUPPLIER / VENDOR QUOTATION FORM

Ref: ${formData.refNo || '____'}
Date: ${formData.date}

Supplier: ${formData.supplierName || '____'}
Contact: ${formData.contactPerson || '____'}
Address: ${formData.supplierAddress || '____'}

${tableHeader}${tableBody}

Subtotal: ₹${formData.subtotal || '0.00'}
Grand Total: ₹${formData.grandTotal || '0.00'}

Conditions:
1. Valid for 30 days.
2. Subject to Trust approval.
    `
    navigator.clipboard.writeText(text)
    toast({ title: "Draft Copied", description: "Minimal text version copied to clipboard." })
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
      {/* Dynamic Style for F4 Size Printing with Narrow Margins */}
      <style jsx global>{`
        @media print {
          @page {
            size: 210mm 330mm;
            margin: 5mm !important;
          }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
          }
          header, nav, footer, .print-hide, .no-print {
            display: none !important;
          }
          .print-content {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Navigation Header - Hidden on Print */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20 print:hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Truck className="w-8 h-8 text-accent" />
              </div>
              <BadgeCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 leading-tight">
              Supplier <span className="text-accent italic">Quotation</span> Form
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium">
              F4 Standard procurement format for institutional suppliers and vendors.
            </p>
          </div>
        </div>
      </section>

      {/* Editor Toolbar - Hidden on Print */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Procurement Tool (F4 Print Optimized)</span>
          </div>
          <div className="flex gap-3">
             <Button onClick={handleCopy} variant="outline" className="rounded-xl font-bold gap-2">
                <Copy className="w-4 h-4" /> Copy Text
             </Button>
             <Button onClick={handlePrint} className="bg-primary text-white hover:bg-secondary font-bold rounded-xl gap-2 shadow-xl shadow-primary/20">
                <Printer className="w-4 h-4" /> Print Quotation Form
             </Button>
          </div>
        </div>
      </section>

      {/* Main Document Body */}
      <section className="py-12 md:py-20 px-4 print:py-0 print:px-0 print:m-0">
        <div className="container mx-auto print:max-w-none print:p-0 print:m-0">
          <div className="max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0">
            
            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900 relative print:shadow-none print:rounded-none print:bg-white print:text-black print:p-0 print:w-full print:border-t-8 print:border-accent">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 print:hidden"></div>
               <div className="absolute top-0 left-0 w-1.5 h-full bg-accent print:hidden"></div>
               
               <CardContent className="p-8 md:p-12 space-y-6 text-slate-800 dark:text-slate-200 font-sans leading-relaxed text-sm md:text-base print:text-black print:p-4 print:space-y-4">
                  {/* Letterhead */}
                  <div className="text-center space-y-2 pb-6 border-b-2 border-slate-100 print:border-black print:pb-4">
                    <div className="relative w-16 h-16 mx-auto mb-2 print:w-12 print:h-12">
                      <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
                    </div>
                    <h2 className="text-xl md:text-3xl font-headline font-bold text-primary dark:text-white uppercase tracking-tight print:text-black leading-none mb-1">
                      HUMAN RIGHTS AFFAIRS TRUST
                    </h2>
                    <div className="text-[10px] md:text-xs font-bold text-slate-500 print:text-black space-y-0.5">
                      <p className="uppercase tracking-[0.2em] font-black text-slate-400">State Office (WB)</p>
                      <p>Biswanathpur, Deganga, 24 Parganas (N), WB</p>
                      <div className="flex justify-center gap-4">
                        <p>Phone: +91 70631 11471</p>
                        <p>Email: hrat.wb.chairman@gmail.com</p>
                      </div>
                      <p className="font-mono text-[11px] md:text-sm print:text-[12px] text-red-600 font-black">https://humanrightsaffairs.org</p>
                    </div>
                    <h3 className="text-sm md:text-lg font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest print:text-black mt-4">
                      SUPPLIER / VENDOR QUOTATION FORM
                    </h3>
                  </div>

                  {/* Reference & Date */}
                  <div className="flex justify-between items-baseline pt-2 print:pt-1">
                    <div className="flex gap-2">
                       <span className="font-bold text-xs">Quotation Reference No.:</span>
                       <Fillable name="refNo" placeholder="_________" className="w-40 text-xs" />
                    </div>
                    <div className="flex gap-2">
                       <span className="font-bold text-xs">Date:</span>
                       <Fillable name="date" placeholder="__ / __ / __" className="w-28 text-xs" />
                    </div>
                  </div>

                  {/* Supplier Details */}
                  <div className="space-y-3 print:space-y-2">
                    <h4 className="font-black text-primary dark:text-accent border-l-4 border-accent pl-3 uppercase text-[10px] tracking-widest print:text-black print:border-black">Supplier / Vendor Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pl-4 text-sm print:pl-2 print:gap-y-1">
                       <div className="flex gap-2">
                          <span className="font-bold text-xs">Name of Supplier/Firm:</span>
                          <Fillable name="supplierName" placeholder="____________________" className="flex-1 text-xs" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold text-xs">Contact Person:</span>
                          <Fillable name="contactPerson" placeholder="____________________" className="flex-1 text-xs" />
                       </div>
                       <div className="flex gap-2 md:col-span-2">
                          <span className="font-bold text-xs">Address:</span>
                          <Fillable name="supplierAddress" placeholder="________________________________________________________" className="flex-1 text-xs" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold text-xs">Mobile:</span>
                          <Fillable name="mobile" placeholder="__________" className="w-40 text-xs" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold text-xs">Email:</span>
                          <Fillable name="email" placeholder="__________" className="w-40 text-xs" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold text-xs">GST No. (If Applicable):</span>
                          <Fillable name="gstNo" placeholder="____________________" className="w-40 text-xs" />
                       </div>
                    </div>
                  </div>

                  {/* Quotation Table */}
                  <div className="space-y-3 print:space-y-2">
                    <h4 className="font-black text-primary dark:text-accent border-l-4 border-accent pl-3 uppercase text-[10px] tracking-widest print:text-black print:border-black">Quotation Registry</h4>
                    <div className="overflow-hidden">
                       <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 print:border-black">
                          <thead className="bg-slate-50 dark:bg-slate-900 print:bg-transparent">
                             <tr className="text-[9px] font-black uppercase tracking-tighter">
                                <th className="border border-slate-200 dark:border-slate-800 p-4 print:border-black w-8">Sl.</th>
                                <th className="border border-slate-200 dark:border-slate-800 p-4 print:border-black text-left">Item Description</th>
                                <th className="border border-slate-200 dark:border-slate-800 p-4 print:border-black text-left w-32 md:w-40">Specification</th>
                                <th className="border border-slate-200 dark:border-slate-800 p-4 print:border-black text-center w-10">Qty.</th>
                                <th className="border border-slate-200 dark:border-slate-800 p-4 print:border-black text-center w-10">Unit</th>
                                <th className="border border-slate-200 dark:border-slate-800 p-4 print:border-black text-right w-20">Rate (₹)</th>
                                <th className="border border-slate-200 dark:border-slate-800 p-4 print:border-black text-right w-24">Total (₹)</th>
                             </tr>
                          </thead>
                          <tbody>
                             {[1, 2, 3, 4, 5].map((idx) => (
                               <tr key={idx} className="text-[11px]">
                                  <td className="border border-slate-200 dark:border-slate-800 py-12 px-2 text-center print:border-black">{idx}</td>
                                  <td className="border border-slate-200 dark:border-slate-800 py-12 px-2 print:border-black"><Fillable name={`item${idx}`} placeholder="---" className="w-full font-normal text-[11px]" /></td>
                                  <td className="border border-slate-200 dark:border-slate-800 py-12 px-2 print:border-black w-32 md:w-40"><Fillable name={`spec${idx}`} placeholder="---" className="w-full font-normal text-[11px]" /></td>
                                  <td className="border border-slate-200 dark:border-slate-800 py-12 px-2 print:border-black text-center"><Fillable name={`qty${idx}`} placeholder="0" className="w-full text-center font-normal text-[11px]" /></td>
                                  <td className="border border-slate-200 dark:border-slate-800 py-12 px-2 print:border-black text-center"><Fillable name={`unit${idx}`} placeholder="---" className="w-full text-center font-normal text-[11px]" /></td>
                                  <td className="border border-slate-200 dark:border-slate-800 py-12 px-2 print:border-black text-right"><Fillable name={`rate${idx}`} placeholder="0.00" className="w-full text-right font-normal text-[11px]" /></td>
                                  <td className="border border-slate-200 dark:border-slate-800 py-12 px-2 print:border-black text-right"><Fillable name={`total${idx}`} placeholder="0.00" className="w-full text-right font-normal text-[11px]" /></td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="flex flex-col items-end space-y-1 pt-1 print:space-y-0.5">
                     <div className="flex gap-4 items-baseline">
                        <span className="font-bold text-[9px] uppercase text-slate-400 print:text-black">Subtotal:</span>
                        <div className="flex items-baseline gap-1 border-b border-slate-200 print:border-black">
                           <span className="font-bold text-[10px]">₹</span>
                           <Fillable name="subtotal" placeholder="0.00" className="w-28 text-right text-[10px]" />
                        </div>
                     </div>
                     <div className="flex gap-4 items-baseline">
                        <span className="font-bold text-[9px] uppercase text-slate-400 print:text-black">GST:</span>
                        <div className="flex items-baseline gap-1 border-b border-slate-200 print:border-black">
                           <span className="font-bold text-[10px]">₹</span>
                           <Fillable name="subtotal_gst" placeholder="0.00" className="w-28 text-right text-[10px]" />
                        </div>
                     </div>
                     <div className="flex gap-4 items-baseline">
                        <span className="font-bold text-[9px] uppercase text-slate-400 print:text-black">Freight:</span>
                        <div className="flex items-baseline gap-1 border-b border-slate-200 print:border-black">
                           <span className="font-bold text-[10px]">₹</span>
                           <Fillable name="freight" placeholder="0.00" className="w-28 text-right text-[10px]" />
                        </div>
                     </div>
                     <div className="flex gap-4 items-baseline pt-1">
                        <span className="font-black text-[10px] uppercase text-primary print:text-black">Grand Total:</span>
                        <div className="flex items-baseline gap-1 bg-slate-900 text-white px-3 py-1.5 rounded-lg print:bg-transparent print:text-black print:p-0 print:border-b-2 print:border-black print:rounded-none">
                           <span className="font-black text-xs">₹</span>
                           <Fillable name="grandTotal" placeholder="0.00" className="w-32 text-right text-sm print:text-black" />
                        </div>
                     </div>
                  </div>

                  {/* Delivery & Payment Terms */}
                  <div className="space-y-3 print:space-y-1.5">
                    <h4 className="font-black text-primary dark:text-accent border-l-4 border-accent pl-3 uppercase text-[10px] tracking-widest print:text-black print:border-black">Delivery & Payment Terms</h4>
                    <div className="space-y-1 pl-4 text-xs print:pl-2">
                       <div className="flex gap-2">
                          <span className="font-bold text-[11px]">Delivery Period:</span>
                          <Fillable name="deliveryPeriod" placeholder="____________________" className="flex-1 text-[11px]" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold text-[11px]">Delivery Address:</span>
                          <Fillable name="deliveryAddress" placeholder="________________________________________________________" className="flex-1 text-[11px]" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold text-[11px]">Payment Terms:</span>
                          <Fillable name="paymentTerms" placeholder="________________________________________________________" className="flex-1 text-[11px]" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold text-[11px]">Warranty / Guarantee:</span>
                          <Fillable name="warranty" placeholder="____________________" className="flex-1 text-[11px]" />
                       </div>
                       <div className="flex items-center gap-6 pt-1">
                          <span className="font-bold text-[11px]">Installation Required:</span>
                          <div className="flex gap-4 font-bold text-[11px]">
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="installation" value="Yes" checked={formData.installation === 'Yes'} onChange={handleChange} className="accent-accent" />
                                ☐ Yes
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="installation" value="No" checked={formData.installation === 'No'} onChange={handleChange} className="accent-accent" />
                                ☐ No
                             </label>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Declaration */}
                  <div className="space-y-4 pt-2 print:space-y-2">
                     <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 print:bg-transparent print:border-black print:p-2">
                        <p className="text-justify italic text-[10px] leading-relaxed print:text-black">
                          I/We certify that the above information is true and that the quoted prices are valid until the date mentioned. We agree to supply the above materials as per the specifications and terms stated in this quotation.
                        </p>
                     </div>
                     <div className="grid grid-cols-2 gap-20 pt-2 print:gap-10">
                        <div className="space-y-2">
                           <div className="border-b-2 border-slate-200 w-full h-8 print:border-black"></div>
                           <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 print:text-black">Supplier Signature</p>
                           <div className="relative w-56 h-20 border-2 border-dotted border-slate-100 flex items-center justify-center rounded-2xl print:border-black">
                              <span className="text-[10px] font-black uppercase text-slate-100 rotate-[-10deg] print:text-slate-200">Company Seal</span>
                           </div>
                        </div>
                        <div className="space-y-1.5 text-[11px] print:space-y-1">
                           <div className="flex gap-2"><span>Name:</span> <Fillable name="supplierNameSign" placeholder="__________" className="flex-1" /></div>
                           <div className="flex gap-2"><span>Post:</span> <Fillable name="supplierDesignation" placeholder="__________" className="flex-1" /></div>
                           <div className="flex gap-2"><span>Date:</span> <Fillable name="declarationDate" placeholder="__ / __ / __" className="w-28" /></div>
                        </div>
                     </div>
                  </div>

                  {/* Office Use Only Section */}
                  <div className="mt-4 p-6 rounded-[2rem] bg-slate-950 text-white border-none shadow-2xl relative overflow-hidden print:bg-transparent print:text-black print:border-2 print:border-black print:rounded-none print:shadow-none print:p-3 print:mt-2">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 print:hidden"></div>
                    <div className="relative z-10 space-y-4 print:space-y-2">
                       <h4 className="font-black uppercase tracking-[0.4em] text-[9px] text-accent text-center print:text-black">FOR OFFICE USE ONLY</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 text-[11px] print:gap-y-1">
                          <div className="flex gap-2"><span>Purchase Requisition No.:</span> <Fillable name="requisitionNo" placeholder="_______" className="flex-1 text-white border-white/30 print:text-black" /></div>
                          <div className="flex gap-2"><span>Quotation Received Date:</span> <Fillable name="receivedDate" placeholder="_______" className="flex-1 text-white border-white/30 print:text-black" /></div>
                          <div className="flex gap-2"><span>Quotation Verified By:</span> <Fillable name="verifiedBy" placeholder="_______" className="flex-1 text-white border-white/30 print:text-black" /></div>
                          <div className="flex items-center gap-4">
                             <span>Recommended for Approval:</span>
                             <div className="flex gap-3 font-bold text-[10px]">
                                <span>☐ Yes</span>
                                <span>☐ No</span>
                             </div>
                          </div>
                       </div>
                       <div className="grid grid-cols-3 gap-8 pt-2 border-t border-white/10 print:border-black print:gap-4">
                          <div className="space-y-1">
                             <div className="border-b border-white/30 h-8 print:border-black"></div>
                             <p className="text-[8px] font-bold uppercase text-slate-500 print:text-black">Approved By</p>
                          </div>
                          <div className="space-y-1">
                             <div className="border-b border-white/30 h-8 print:border-black"></div>
                             <p className="text-[8px] font-bold uppercase text-slate-500 print:text-black">Signature</p>
                          </div>
                          <div className="text-right">
                             <div className="border-b border-white/30 h-8 print:border-black"></div>
                             <p className="text-[8px] font-bold uppercase text-slate-500 print:text-black">Date</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Important Conditions Section */}
                  <div className="space-y-2 pt-4 border-t border-slate-100 print:border-black print:pt-2 print:mt-1">
                    <h4 className="font-bold text-primary dark:text-accent border-l-4 border-accent pl-3 uppercase text-[9px] tracking-widest print:text-black print:border-black">Important Conditions</h4>
                    <ol className="list-decimal pl-6 space-y-1 text-[9px] font-medium text-slate-500 print:text-black print:pl-4 print:space-y-0.5">
                       <li>This quotation shall remain valid for at least 30 days from the date of submission.</li>
                       <li>The Trust reserves the right to accept or reject any quotation, wholly or partly, without assigning any reason.</li>
                       <li>Payment shall be made only after satisfactory delivery and verification of the materials.</li>
                       <li>Any applicable taxes must be clearly mentioned in the quotation.</li>
                       <li>Delivery should be completed within the agreed time period.</li>
                    </ol>
                  </div>

                  {/* Seal Area */}
                  <div className="pt-6 flex flex-col items-center gap-2 print:pt-2">
                     <div className="w-24 h-24 border-2 border-dotted border-slate-200 rounded-full flex items-center justify-center relative opacity-10 print:opacity-40 print:w-16 print:h-16">
                        <Image src="/HRAT%20Logo.jpeg" alt="seal" width={40} height={40} className="object-contain grayscale print:w-30 print:h-30" />
                     </div>
                     <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300 print:text-black">Institutional Audit Node</p>
                  </div>
               </CardContent>
            </Card>

            <div className="mt-12 flex flex-col items-center gap-6 print:hidden pb-20">
               <Button onClick={handlePrint} size="lg" className="h-16 px-12 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                 <Printer className="w-5 h-5 mr-2" /> Download & Print F4 Quotation
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
