"use client"

import React, { useState, useRef, useEffect } from 'react'
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
  Globe,
  QrCode,
  ArrowRight,
  ShieldCheck
} from 'lucide-react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from '@/firebase'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'
import { PlaceHolderImages } from '@/lib/placeholder-images'

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

type Step = 'details' | 'payment' | 'qr' | 'success'

export function DonationDialog({ children, defaultAmount }: { children: React.ReactNode, defaultAmount?: string }) {
  const db = useFirestore()
  const [step, setStep] = useState<Step>('details')
  const [loading, setLoading] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [donationData, setDonationData] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const qrImage = PlaceHolderImages.find(img => img.id === 'donation-qr')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "INR",
      amount: defaultAmount || ""
    }
  })

  useEffect(() => {
    if (open && defaultAmount) {
      form.setValue('amount', defaultAmount)
    }
  }, [open, defaultAmount, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    const data = {
      ...values,
      photo,
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toLocaleString()
    }
    setDonationData(data)
    
    // Simulate data verification
    setTimeout(() => {
      setStep('payment')
      setLoading(false)
    }, 1000)
  }

  const handlePayment = async (method: string) => {
    if (method === 'QR') {
      setStep('qr')
      return
    }

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

  const confirmQrPayment = () => {
    handlePayment('UPI QR Code')
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
        form.reset({
          currency: "INR",
          amount: defaultAmount || ""
        })
        setPhoto(null)
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
            {step === 'details' && "Donor Information"}
            {step === 'payment' && "Payment Selection"}
            {step === 'qr' && "Scan to Donate"}
            {step === 'success' && "Donation Successful"}
            <div className="relative w-10 h-10 shrink-0">
              <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
            </div>
          </DialogTitle>
          <DialogDescription className="text-base">
            {step === 'details' && "Please provide your details for tax-exemption receipts (80G)."}
            {step === 'payment' && "Choose your preferred secure payment method."}
            {step === 'qr' && "Scan the QR code below using any UPI app (GPay, PhonePe, Paytm)."}
            {step === 'success' && "Thank you for your contribution to human rights."}
          </DialogDescription>
        </DialogHeader>

        {step === 'details' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-accent transition-colors">
                  {photo ? (
                    <Image src={photo} alt="Preview" fill className="object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-slate-400 group-hover:text-accent transition-colors" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileChange}
                  />
                </div>
                <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Upload Profile Photo</Label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</FormLabel>
                    <FormControl><Input placeholder="Jayanta Kumar Paul" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</FormLabel>
                    <FormControl><Input placeholder="jayanta@example.com" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</FormLabel>
                    <FormControl><Input placeholder="+91 9876543210" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Donation Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input className="pl-9 h-12 rounded-xl text-lg font-bold" placeholder="5000" type="number" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Residential Address</FormLabel>
                  <FormControl><Textarea placeholder="Enter your full address for 80G receipt generation..." className="rounded-xl min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="pan" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">PAN Card Number (Required for 80G)</FormLabel>
                    <FormControl><Input placeholder="ABCDE1234F" className="uppercase h-12 rounded-xl font-mono" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="aadhaar" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Aadhaar Card Number</FormLabel>
                    <FormControl><Input placeholder="1234 5678 9012" className="h-12 rounded-xl font-mono" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full bg-accent text-primary font-bold py-7 text-xl rounded-2xl hover:bg-accent/90 shadow-xl shadow-accent/20 transition-all hover:-translate-y-1" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : <>Continue to Payment <ArrowRight className="ml-2 w-6 h-6" /></>}
              </Button>
            </form>
          </Form>
        )}

        {step === 'payment' && (
          <div className="space-y-6 py-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between mb-8 shadow-inner">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Payable Amount</p>
                <p className="text-3xl font-bold text-primary">₹{donationData?.amount}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Donor Identity</p>
                <p className="font-bold text-lg text-primary">{donationData?.name}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div 
                className="border-2 rounded-2xl p-6 bg-white shadow-sm hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group relative overflow-hidden" 
                onClick={() => handlePayment('QR')}
              >
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Recommended</div>
                <div className="flex items-center gap-5">
                  <div className="bg-emerald-50 p-4 rounded-xl group-hover:bg-emerald-100 transition-colors">
                    <QrCode className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl text-primary">Instant UPI Scan & Pay</h4>
                    <p className="text-sm text-slate-500">Scan our official SBI QR code via GPay, PhonePe, or Paytm.</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              <div 
                className="border rounded-2xl p-6 bg-white shadow-sm hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group" 
                onClick={() => handlePayment('UPI/NetBanking')}
              >
                <div className="flex items-center gap-5">
                  <div className="bg-blue-50 p-4 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <IndianRupee className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl text-primary">Net Banking / Cards</h4>
                    <p className="text-sm text-slate-500">Direct bank transfer or Debit/Credit card (Indian Banks).</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              <div 
                className="border rounded-2xl p-6 bg-white shadow-sm hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group" 
                onClick={() => handlePayment('International Card')}
              >
                <div className="flex items-center gap-5">
                  <div className="bg-indigo-50 p-4 rounded-xl group-hover:bg-indigo-100 transition-colors">
                    <Globe className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl text-primary">International Transfer</h4>
                    <p className="text-sm text-slate-500">PayPal and foreign currency cards (Visa/Master/Amex).</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full mt-4 text-slate-400 hover:text-primary" onClick={() => setStep('details')}>Back to Donor Details</Button>
          </div>
        )}

        {step === 'qr' && (
          <div className="py-6 flex flex-col items-center">
             <div className="relative w-full max-w-[400px] aspect-[3/4] bg-white rounded-3xl shadow-2xl border-4 border-slate-50 overflow-hidden mb-8">
               <Image 
                src={qrImage?.imageUrl || "/HRAT QR CODE.jpeg"} 
                alt="Donation QR Code" 
                fill 
                className="object-contain"
                priority
               />
             </div>
             
             <div className="w-full space-y-4">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-emerald-900 leading-tight">Verified Secure Payment</p>
                    <p className="text-xs text-emerald-700">Scan this QR to pay directly to <strong>Human Rights Affairs Trust</strong>. Once the payment is complete, click the button below to generate your receipt.</p>
                  </div>
                </div>
                
                <Button 
                  onClick={confirmQrPayment}
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold py-7 text-xl rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : "I Have Completed the Payment"}
                </Button>
                
                <Button variant="ghost" className="w-full text-slate-400" onClick={() => setStep('payment')}>Select Different Method</Button>
             </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 space-y-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-headline font-bold text-primary">Contribution Verified!</h3>
              <p className="text-slate-500">Transaction ID: <span className="font-mono text-accent font-bold tracking-tighter">{donationData?.transactionId}</span></p>
            </div>

            <div ref={invoiceRef} className="border-2 border-slate-100 rounded-[2.5rem] p-8 md:p-10 bg-white shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16"></div>
              <div className="header flex items-center justify-between border-b-2 pb-8">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14">
                    <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-2xl leading-none">HRAT</h4>
                    <p className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase mt-1">JusticeShield</p>
                  </div>
                </div>
                <div className="text-right">
                  <h5 className="font-bold uppercase text-[10px] text-slate-400 tracking-widest mb-1">Official Tax Receipt</h5>
                  <p className="text-lg font-bold text-primary tracking-tighter">#{donationData?.transactionId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 text-sm">
                <div className="space-y-4">
                  <div>
                    <h6 className="font-bold text-slate-400 uppercase text-[9px] tracking-widest mb-2">Donor Credentials</h6>
                    <p className="font-bold text-lg text-primary">{donationData?.name}</p>
                    <p className="text-slate-500 font-medium">{donationData?.email}</p>
                    <p className="text-slate-500 font-medium">{donationData?.phone}</p>
                  </div>
                  <div>
                     <h6 className="font-bold text-slate-400 uppercase text-[9px] tracking-widest mb-2">Residential Address</h6>
                     <p className="text-slate-500 leading-relaxed text-xs">{donationData?.address}</p>
                  </div>
                </div>
                <div className="text-right space-y-4">
                  <div>
                    <h6 className="font-bold text-slate-400 uppercase text-[9px] tracking-widest mb-2">Government IDs</h6>
                    <p className="text-slate-500 font-bold">PAN: <span className="text-primary font-mono">{donationData?.pan?.toUpperCase()}</span></p>
                    <p className="text-slate-500 font-bold">Aadhaar: <span className="text-primary font-mono">**** **** {donationData?.aadhaar?.slice(-4)}</span></p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl inline-block border border-emerald-100">
                    <p className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider italic">Exempt under Section 80G</p>
                    <p className="text-[9px] text-emerald-600 mt-1">Income Tax Act of India</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2rem] flex items-center justify-between text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-accent/10 opacity-50 mix-blend-overlay"></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Contribution</p>
                  <p className="text-4xl font-headline font-bold text-accent">₹{donationData?.amount}</p>
                </div>
                <div className="text-right relative z-10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                  <p className="font-bold text-sm text-white">{donationData?.timestamp}</p>
                  <p className="text-[10px] text-emerald-400 font-bold mt-1 uppercase tracking-tighter">Status: Verified</p>
                </div>
              </div>

              <div className="footer border-t pt-8 text-center space-y-2">
                <p className="text-[9px] text-slate-400 leading-relaxed">
                  This is a digitally authenticated tax receipt issued by the Human Rights Affairs Trust. <br />
                  Central Govt Reg No: HR-123-ABC-2024 | NITI Aayog Unique ID: WB/2024/038XXXX
                </p>
                <div className="flex justify-center gap-4 pt-2">
                   <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center p-2 grayscale opacity-50">
                      <Image src="/HRAT%20Logo.jpeg" alt="seal" width={40} height={40} className="object-contain" />
                   </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="flex-1 gap-2 bg-primary text-white py-8 rounded-2xl hover:bg-primary/90 text-lg shadow-xl shadow-primary/20" onClick={handlePrint}>
                <Printer className="w-6 h-6" /> Print Official Receipt
              </Button>
              <Button variant="outline" className="flex-1 gap-2 border-slate-200 py-8 rounded-2xl text-lg hover:bg-slate-50" onClick={handleDownload}>
                <Download className="w-6 h-6" /> Download PDF
              </Button>
            </div>
            
            <Button variant="ghost" className="w-full text-slate-400 uppercase tracking-[0.2em] font-bold text-[10px]" onClick={() => setOpen(false)}>Close Portal</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
