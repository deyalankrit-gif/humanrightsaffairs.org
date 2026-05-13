
"use client"

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { 
  CreditCard, 
  Download, 
  Printer, 
  CheckCircle2, 
  Loader2, 
  Camera,
  IndianRupee,
  Globe
} from 'lucide-react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from '@/firebase'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Full address is required"),
  pan: z.string().length(10, "PAN must be 10 characters"),
  aadhaar: z.string().length(12, "Aadhaar must be 12 digits"),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("INR")
})

type Step = 'details' | 'payment' | 'success'

export function DonationDialog({ children }: { children: React.ReactNode }) {
  const db = useFirestore()
  const [step, setStep] = useState<Step>('details')
  const [loading, setLoading] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [donationData, setDonationData] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "INR"
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    const data = {
      ...values,
      photo,
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toLocaleString()
    }
    setDonationData(data)
    setTimeout(() => {
      setStep('payment')
      setLoading(false)
    }, 1000)
  }

  const handlePayment = async (method: string) => {
    setLoading(true)
    const donationId = donationData.transactionId
    
    const finalData = {
      ...donationData,
      paymentMethod: method,
      status: 'completed',
      createdAt: serverTimestamp()
    }
    
    const docRef = doc(db, "donations", donationId)
    
    setDoc(docRef, finalData)
      .then(() => {
        setStep('success')
        setLoading(false)
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: finalData,
        } satisfies SecurityRuleContext);
        
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false)
      });
  }

  const handlePrint = () => {
    const printContent = invoiceRef.current?.innerHTML
    const win = window.open('', '', 'height=700,width=700')
    if (win) {
      win.document.write('<html><head><title>Donation Invoice</title>')
      win.document.write('<style>body{font-family:sans-serif;padding:40px;} .header{text-align:center;border-bottom:2px solid #000;padding-bottom:20px;margin-bottom:20px;} .row{display:flex;justify-content:space-between;margin-bottom:10px;} .footer{margin-top:40px;text-align:center;font-size:12px;color:#666;}</style>')
      win.document.write('</head><body>')
      win.document.write(printContent || '')
      win.document.write('</body></html>')
      win.document.close()
      win.print()
    }
  }

  const handleDownload = () => {
    const content = invoiceRef.current?.innerText
    const blob = new Blob([content || ''], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Invoice-${donationData?.transactionId}.txt`
    a.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if(!val) {
        setStep('details')
        form.reset()
        setPhoto(null)
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
            {step === 'details' && "Donor Information"}
            {step === 'payment' && "Secure Payment Gateway"}
            {step === 'success' && "Donation Successful"}
            <div className="relative w-10 h-10">
              <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
            </div>
          </DialogTitle>
          <DialogDescription>
            {step === 'details' && "Please provide your details for tax-exemption receipts (80G)."}
            {step === 'payment' && "Choose your preferred payment method."}
            {step === 'success' && "Thank you for your contribution to human rights."}
          </DialogDescription>
        </DialogHeader>

        {step === 'details' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                  {photo ? (
                    <Image src={photo} alt="Preview" fill className="object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-slate-400" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileChange}
                  />
                </div>
                <Label className="text-xs text-slate-500 uppercase font-bold tracking-widest">Upload Profile Photo</Label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl><Input placeholder="john@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="+91 9876543210" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Donation Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input className="pl-9" placeholder="5000" type="number" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Residential Address</FormLabel>
                  <FormControl><Textarea placeholder="Enter your full address..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="pan" render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN Card Number</FormLabel>
                    <FormControl><Input placeholder="ABCDE1234F" className="uppercase" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="aadhaar" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar Card Number</FormLabel>
                    <FormControl><Input placeholder="1234 5678 9012" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full bg-accent text-primary font-bold py-6 text-lg rounded-xl hover:bg-accent/90" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Proceed to Payment"}
              </Button>
            </form>
          </Form>
        )}

        {step === 'payment' && (
          <div className="space-y-6 py-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between mb-8">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Payable Amount</p>
                <p className="text-2xl font-bold text-primary">{donationData?.currency} {donationData?.amount}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold">Donor</p>
                <p className="font-bold">{donationData?.name}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="border rounded-2xl p-6 bg-white shadow-sm hover:border-accent transition-colors cursor-pointer group" onClick={() => handlePayment('UPI/NetBanking')}>
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 p-3 rounded-xl group-hover:bg-emerald-100"><IndianRupee className="w-6 h-6 text-emerald-600" /></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-primary">Indian Payment Methods</h4>
                    <p className="text-xs text-slate-500">UPI, NetBanking, Debit/Credit Cards (Rupay/Visa/Mastercard)</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-2xl p-6 bg-white shadow-sm hover:border-accent transition-colors cursor-pointer group" onClick={() => handlePayment('International Card')}>
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-100"><Globe className="w-6 h-6 text-indigo-600" /></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-primary">International Payments</h4>
                    <p className="text-xs text-slate-500">PayPal, International Credit Cards (Visa/Mastercard/Amex)</p>
                  </div>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full mt-4" onClick={() => setStep('details')}>Back to Details</Button>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 space-y-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-primary">Payment Received Successfully!</h3>
              <p className="text-slate-500">Transaction Ref: <span className="font-mono text-accent font-bold">{donationData?.transactionId}</span></p>
            </div>

            <div ref={invoiceRef} className="border-2 border-slate-100 rounded-[2rem] p-8 bg-white shadow-lg space-y-6">
              <div className="header flex items-center justify-between border-b-2 pb-6">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xl leading-none">HRAT</h4>
                    <p className="text-[10px] tracking-widest font-bold text-accent uppercase">JusticeShield</p>
                  </div>
                </div>
                <div className="text-right">
                  <h5 className="font-bold uppercase text-xs text-slate-400">Tax Invoice / Receipt</h5>
                  <p className="text-sm font-bold text-primary">#{donationData?.transactionId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <h6 className="font-bold text-slate-400 uppercase text-[10px] mb-2">Donor Details</h6>
                  <p className="font-bold">{donationData?.name}</p>
                  <p className="text-slate-500">{donationData?.email}</p>
                  <p className="text-slate-500">{donationData?.phone}</p>
                  <p className="text-slate-500 mt-2">{donationData?.address}</p>
                </div>
                <div className="text-right">
                  <h6 className="font-bold text-slate-400 uppercase text-[10px] mb-2">Registration Info</h6>
                  <p className="text-slate-500">PAN: <span className="font-bold text-primary">{donationData?.pan}</span></p>
                  <p className="text-slate-500">Aadhaar: <span className="font-bold text-primary">**** **** {donationData?.aadhaar?.slice(-4)}</span></p>
                  <p className="text-slate-500 mt-2 italic">Exempt under Section 80G of IT Act</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Contribution</p>
                  <p className="text-3xl font-bold text-primary">{donationData?.currency} {donationData?.amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Date</p>
                  <p className="font-bold">{donationData?.timestamp}</p>
                </div>
              </div>

              <div className="footer border-t pt-6 text-center">
                <p className="text-[10px] text-slate-400">This is a digitally generated invoice. No signature required. HRAT-India Reg No: HR-123-ABC-2024</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="flex-1 gap-2 bg-primary text-white py-6 rounded-xl hover:bg-primary/90" onClick={handlePrint}>
                <Printer className="w-5 h-5" /> Print Receipt
              </Button>
              <Button variant="outline" className="flex-1 gap-2 border-slate-200 py-6 rounded-xl" onClick={handleDownload}>
                <Download className="w-5 h-5" /> Download PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
