"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Printer, 
  FileText, 
  BadgeCheck, 
  CheckCircle2, 
  Truck,
  Building2,
  DollarSign,
  ClipboardList
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'

/**
 * SupplierQuotationPage: High-fidelity interactive template for vendor quotes.
 * Features: Fillable placeholders, calculation table, and print-ready layout.
 */
export default function SupplierQuotationPage() {
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
              Standardized procurement format for institutional suppliers and vendors.
            </p>
          </div>
        </div>
      </section>

      {/* Editor Toolbar - Hidden on Print */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b sticky top-[48px] md:top-[56px] z-30 shadow-sm print:hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Procurement Tool</span>
          </div>
          <Button onClick={handlePrint} className="bg-primary text-white hover:bg-secondary font-bold rounded-xl gap-2 shadow-xl shadow-primary/20">
            <Printer className="w-4 h-4" /> Print Quotation Form
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
                      SUPPLIER / VENDOR QUOTATION FORM
                    </h3>
                  </div>

                  {/* Reference & Date */}
                  <div className="flex justify-between items-baseline pt-6">
                    <div className="flex gap-2">
                       <span className="font-bold">Quotation Reference No.:</span>
                       <Fillable name="refNo" placeholder="_________" className="w-48" />
                    </div>
                    <div className="flex gap-2">
                       <span className="font-bold">Date:</span>
                       <Fillable name="date" placeholder="__ / __ / __" className="w-32" />
                    </div>
                  </div>

                  {/* Supplier Details */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-primary dark:text-accent border-l-4 border-accent pl-3 uppercase text-xs tracking-widest print:text-black print:border-black">Supplier / Vendor Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pl-4">
                       <div className="flex gap-2">
                          <span className="font-bold">Name of Supplier/Firm:</span>
                          <Fillable name="supplierName" placeholder="____________________" className="flex-1" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold">Contact Person:</span>
                          <Fillable name="contactPerson" placeholder="____________________" className="flex-1" />
                       </div>
                       <div className="flex gap-2 md:col-span-2">
                          <span className="font-bold">Address:</span>
                          <Fillable name="supplierAddress" placeholder="________________________________________________________" className="flex-1" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold">Mobile:</span>
                          <Fillable name="mobile" placeholder="__________" className="w-48" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold">Email:</span>
                          <Fillable name="email" placeholder="__________" className="w-48" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold">GST No. (If Applicable):</span>
                          <Fillable name="gstNo" placeholder="____________________" className="w-48" />
                       </div>
                    </div>
                  </div>

                  {/* Quotation Table */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-primary dark:text-accent border-l-4 border-accent pl-3 uppercase text-xs tracking-widest print:text-black print:border-black">Quotation</h4>
                    <div className="overflow-x-auto">
                       <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 print:border-black">
                          <thead className="bg-slate-50 dark:bg-slate-900 print:bg-transparent">
                             <tr className="text-[10px] font-black uppercase tracking-tighter">
                                <th className="border border-slate-200 dark:border-slate-800 p-2 print:border-black">Sl. No.</th>
                                <th className="border border-slate-200 dark:border-slate-800 p-2 print:border-black">Item Description</th>
                                <th className="border border-slate-200 dark:border-slate-800 p-2 print:border-black">Specification / Brand</th>
                                <th className="border border-slate-200 dark:border-slate-800 p-2 print:border-black text-center">Qty.</th>
                                <th className="border border-slate-200 dark:border-slate-800 p-2 print:border-black text-center">Unit</th>
                                <th className="border border-slate-200 dark:border-slate-800 p-2 print:border-black text-right">Unit Rate (₹)</th>
                                <th className="border border-slate-200 dark:border-slate-800 p-2 print:border-black text-right">Total (₹)</th>
                             </tr>
                          </thead>
                          <tbody>
                             {[1, 2, 3, 4, 5].map((idx) => (
                               <tr key={idx}>
                                  <td className="border border-slate-200 dark:border-slate-800 p-2 text-center print:border-black">{idx}</td>
                                  <td className="border border-slate-200 dark:border-slate-800 p-2 print:border-black"><Fillable name={`item${idx}`} placeholder="---" className="w-full font-normal" /></td>
                                  <td className="border border-slate-200 dark:border-slate-800 p-2 print:border-black"><Fillable name={`spec${idx}`} placeholder="---" className="w-full font-normal" /></td>
                                  <td className="border border-slate-200 dark:border-slate-800 p-2 print:border-black text-center"><Fillable name={`qty${idx}`} placeholder="0" className="w-12 text-center font-normal" /></td>
                                  <td className="border border-slate-200 dark:border-slate-800 p-2 print:border-black text-center"><Fillable name={`unit${idx}`} placeholder="---" className="w-12 text-center font-normal" /></td>
                                  <td className="border border-slate-200 dark:border-slate-800 p-2 print:border-black text-right"><Fillable name={`rate${idx}`} placeholder="0.00" className="w-20 text-right font-normal" /></td>
                                  <td className="border border-slate-200 dark:border-slate-800 p-2 print:border-black text-right"><Fillable name={`total${idx}`} placeholder="0.00" className="w-24 text-right font-normal" /></td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="flex flex-col items-end space-y-2 pt-4">
                     <div className="flex gap-4 items-baseline">
                        <span className="font-bold text-xs uppercase text-slate-400">Subtotal:</span>
                        <div className="flex items-baseline gap-1 border-b border-slate-200 print:border-black">
                           <span className="font-bold">₹</span>
                           <Fillable name="subtotal" placeholder="0.00" className="w-32 text-right" />
                        </div>
                     </div>
                     <div className="flex gap-4 items-baseline">
                        <span className="font-bold text-xs uppercase text-slate-400">GST:</span>
                        <div className="flex items-baseline gap-1 border-b border-slate-200 print:border-black">
                           <span className="font-bold">₹</span>
                           <Fillable name="gstAmount" placeholder="0.00" className="w-32 text-right" />
                        </div>
                     </div>
                     <div className="flex gap-4 items-baseline">
                        <span className="font-bold text-xs uppercase text-slate-400">Freight / Delivery:</span>
                        <div className="flex items-baseline gap-1 border-b border-slate-200 print:border-black">
                           <span className="font-bold">₹</span>
                           <Fillable name="freight" placeholder="0.00" className="w-32 text-right" />
                        </div>
                     </div>
                     <div className="flex gap-4 items-baseline">
                        <span className="font-bold text-xs uppercase text-slate-400">Other Charges:</span>
                        <div className="flex items-baseline gap-1 border-b border-slate-200 print:border-black">
                           <span className="font-bold">₹</span>
                           <Fillable name="otherCharges" placeholder="0.00" className="w-32 text-right" />
                        </div>
                     </div>
                     <div className="flex gap-4 items-baseline pt-4">
                        <span className="font-black text-sm uppercase text-primary">Grand Total:</span>
                        <div className="flex items-baseline gap-1 bg-slate-900 text-white px-4 py-2 rounded-xl print:bg-transparent print:text-black print:p-0 print:border-b-2 print:border-black print:rounded-none">
                           <span className="font-black">₹</span>
                           <Fillable name="grandTotal" placeholder="0.00" className="w-40 text-right text-lg print:text-black" />
                        </div>
                     </div>
                  </div>

                  {/* Delivery & Payment Terms */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-primary dark:text-accent border-l-4 border-accent pl-3 uppercase text-xs tracking-widest print:text-black print:border-black">Delivery & Payment Terms</h4>
                    <div className="space-y-3 pl-4">
                       <div className="flex gap-2">
                          <span className="font-bold">Delivery Period:</span>
                          <Fillable name="deliveryPeriod" placeholder="____________________" className="flex-1" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold">Delivery Address:</span>
                          <Fillable name="deliveryAddress" placeholder="________________________________________________________" className="flex-1" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold">Payment Terms:</span>
                          <Fillable name="paymentTerms" placeholder="________________________________________________________" className="flex-1" />
                       </div>
                       <div className="flex gap-2">
                          <span className="font-bold">Warranty / Guarantee:</span>
                          <Fillable name="warranty" placeholder="____________________" className="flex-1" />
                       </div>
                       <div className="flex items-center gap-6 pt-2">
                          <span className="font-bold">Installation / Demonstration:</span>
                          <div className="flex gap-4 text-xs font-bold">
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
                  <div className="space-y-6 pt-10">
                     <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 print:bg-transparent print:border-black">
                        <p className="text-justify italic text-xs leading-relaxed print:text-black">
                          I/We certify that the above information is true and that the quoted prices are valid until the date mentioned. We agree to supply the above materials as per the specifications and terms stated in this quotation.
                        </p>
                     </div>
                     <div className="grid grid-cols-2 gap-20 pt-6">
                        <div className="space-y-4">
                           <div className="border-b-2 border-slate-200 w-full h-12 print:border-black"></div>
                           <p className="font-bold text-xs uppercase tracking-widest text-slate-400 print:text-black">Supplier's Signature</p>
                           <div className="relative w-32 h-20 border-2 border-dotted border-slate-100 flex items-center justify-center rounded-xl print:border-black">
                              <span className="text-[8px] font-black uppercase text-slate-200 rotate-[-15deg] print:text-black">Company Seal</span>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <div className="flex gap-2"><span>Name:</span> <Fillable name="supplierNameSign" placeholder="__________" className="flex-1" /></div>
                           <div className="flex gap-2"><span>Designation:</span> <Fillable name="supplierDesignation" placeholder="__________" className="flex-1" /></div>
                           <div className="flex gap-2"><span>Date:</span> <Fillable name="declarationDate" placeholder="__ / __ / __" className="w-32" /></div>
                        </div>
                     </div>
                  </div>

                  {/* Office Use Only Section */}
                  <div className="mt-12 p-8 rounded-[3rem] bg-slate-950 text-white border-none shadow-2xl relative overflow-hidden print:bg-transparent print:text-black print:border-2 print:border-black print:rounded-none print:shadow-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 print:hidden"></div>
                    <div className="relative z-10 space-y-8">
                       <h4 className="font-black uppercase tracking-[0.4em] text-[10px] text-accent text-center print:text-black">FOR OFFICE USE ONLY</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                          <div className="flex gap-2"><span>Purchase Requisition No.:</span> <Fillable name="requisitionNo" placeholder="_______" className="flex-1 text-white border-white/30" /></div>
                          <div className="flex gap-2"><span>Quotation Received Date:</span> <Fillable name="receivedDate" placeholder="_______" className="flex-1 text-white border-white/30" /></div>
                          <div className="flex gap-2"><span>Quotation Verified By:</span> <Fillable name="verifiedBy" placeholder="_______" className="flex-1 text-white border-white/30" /></div>
                          <div className="flex items-center gap-4">
                             <span>Recommended:</span>
                             <div className="flex gap-3 font-bold text-xs">
                                <span>☐ Yes</span>
                                <span>☐ No</span>
                             </div>
                          </div>
                       </div>
                       <div className="grid grid-cols-3 gap-12 pt-6 border-t border-white/10 print:border-black">
                          <div className="space-y-2">
                             <div className="border-b border-white/30 h-10 print:border-black"></div>
                             <p className="text-[9px] font-bold uppercase text-slate-500 print:text-black">Approved By</p>
                          </div>
                          <div className="space-y-2">
                             <div className="border-b border-white/30 h-10 print:border-black"></div>
                             <p className="text-[9px] font-bold uppercase text-slate-500 print:text-black">Signature</p>
                          </div>
                          <div className="space-y-2 text-right">
                             <div className="border-b border-white/30 h-10 print:border-black"></div>
                             <p className="text-[9px] font-bold uppercase text-slate-500 print:text-black">Date</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Conditions Section */}
                  <div className="space-y-4 pt-10 border-t border-slate-100 print:border-black">
                    <h4 className="font-bold text-primary dark:text-accent border-l-4 border-accent pl-3 uppercase text-xs tracking-widest print:text-black print:border-black">Important Conditions</h4>
                    <ol className="list-decimal pl-6 space-y-2 text-xs font-bold text-slate-500 print:text-black">
                       <li>This quotation shall remain valid for at least 30 days from the date of submission.</li>
                       <li>The Trust reserves the right to accept or reject any quotation, wholly or partly, without assigning any reason.</li>
                       <li>Payment shall be made only after satisfactory delivery and verification of the materials.</li>
                       <li>Any applicable taxes must be clearly mentioned in the quotation.</li>
                       <li>Delivery should be completed within the agreed time period.</li>
                    </ol>
                  </div>

                  {/* Seal Area */}
                  <div className="pt-16 flex flex-col items-center gap-4">
                     <div className="w-32 h-32 border-4 border-dotted border-slate-200 rounded-full flex items-center justify-center relative opacity-20 print:opacity-40">
                        <Image src="/HRAT%20Logo.jpeg" alt="seal" width={60} height={60} className="object-contain grayscale" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 print:text-black">Authorized Procurement Record</p>
                  </div>
               </CardContent>
            </Card>

            <div className="mt-16 flex flex-col items-center gap-6 print:hidden">
               <Button onClick={handlePrint} size="lg" className="h-16 px-12 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20">
                 <Printer className="w-5 h-5 mr-2" /> Download & Print Form
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
