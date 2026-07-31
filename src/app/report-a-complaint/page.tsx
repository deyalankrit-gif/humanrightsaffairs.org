"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { useFirestore } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  Hash, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Gavel,
  AlertCircle,
  Clock,
  ArrowLeft,
  FileText,
  Scale,
  ChevronRight,
  Home,
  UserRoundX,
  Baby,
  Users,
  Upload,
  Camera,
  X,
  ImageIcon,
  Trash2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'
import { sendComplaintNotification } from '@/lib/notification-service'

const complaintSchema = z.object({
  // Complainant Info
  fullName: z.string().min(2, "Full name is required"),
  relationName: z.string().min(2, "Father's or husband's name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  aadhaar: z.string().length(12, "Aadhaar must be exactly 12 digits"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Street address is required"),
  postOffice: z.string().min(2, "Post Office is required"),
  policeStation: z.string().min(2, "Police Station is required"),
  pinCode: z.string().length(6, "PIN Code must be 6 digits"),
  
  // Third Party Reporting
  isThirdParty: z.boolean().default(false),
  victimName: z.string().optional(),
  victimPhone: z.string().optional(),
  victimAddress: z.string().optional(),
  victimAadhaar: z.string().optional(),
  
  // Minor Victim Info
  victimIsMinor: z.boolean().default(false),
  victimAge: z.string().optional(),
  victimGender: z.string().optional(),

  // Incident Details
  incidentDate: z.string().min(1, "Date of incident is required"),
  incidentLocation: z.string().min(5, "Venue/Location is required"),
  subject: z.string().min(5, "Please provide a subject for the complaint"),
  description: z.string().min(30, "Please describe the incident in detail (min 30 chars)"),
  accusedDetails: z.string().optional(),
  witnesses: z.string().optional(),
  
  // Procedural Details
  otherAuthorities: z.string().optional(),
  isSubJudice: z.string().optional(),
})

export default function ReportAComplaintPage() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [incidentPhotos, setIncidentPhotos] = useState<string[]>([])

  const form = useForm<z.infer<typeof complaintSchema>>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      fullName: '',
      relationName: '',
      email: '',
      aadhaar: '',
      phone: '',
      address: '',
      postOffice: '',
      policeStation: '',
      pinCode: '',
      isThirdParty: false,
      victimName: '',
      victimPhone: '',
      victimAddress: '',
      victimAadhaar: '',
      victimIsMinor: false,
      victimAge: '',
      victimGender: '',
      incidentDate: '',
      incidentLocation: '',
      subject: '',
      description: '',
      accusedDetails: '',
      witnesses: '',
      otherAuthorities: '',
      isSubJudice: ''
    }
  })

  const isThirdParty = form.watch('isThirdParty')
  const victimIsMinor = form.watch('victimIsMinor')

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    if (incidentPhotos.length + newFiles.length > 3) {
      toast({
        variant: "destructive",
        title: "Limit Exceeded",
        description: "You can only upload a maximum of 3 photos."
      })
      return
    }

    newFiles.forEach(file => {
      if (file.size > 102400) { // 100KB limit
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: `${file.name} exceeds the 100KB limit. Please compress and try again.`
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setIncidentPhotos(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setIncidentPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: z.infer<typeof complaintSchema>) => {
    if (!db) return
    setIsSubmitting(true)

    const submissionToken = `CMP-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`
    const complaintData = {
      ...values,
      incidentPhotos,
      token: submissionToken,
      status: 'Pending',
      type: 'Public Complaint',
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "public_complaints"), complaintData)
      .then(() => {
        const complainantName = values.fullName;
        const currentToken = submissionToken;
        const now = new Date().toLocaleString('en-IN');

        setToken(submissionToken)
        form.reset()
        setIncidentPhotos([])
        toast({
          title: "Complaint Lodged",
          description: "Your official report has been recorded in the national registry."
        })

        // 🔔 Dispatch Notification to Administrative terminal
        sendComplaintNotification({
          complainantName,
          token: currentToken,
          timestamp: now
        }).catch(err => {
          console.warn("[NOTIFICATION-SILENT-FAIL] Administrative alert failed:", err.message);
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'public_complaints',
          operation: 'create',
          requestResourceData: complaintData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  if (token) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-[2.5rem] shadow-2xl text-center p-8 md:p-16 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center gap-8">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary dark:text-white">Submission Successful</h2>
              <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 font-medium">Your formal complaint has been securely transmitted to the National Human Rights Oversight Cell.</p>
            </div>
            
            <div className="w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-dashed border-emerald-200 dark:border-emerald-900 shadow-inner">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Official Tracking Reference</p>
               <div className="flex items-center justify-center gap-3">
                 <Hash className="w-6 h-6 text-accent" />
                 <span className="text-3xl md:text-5xl font-headline font-bold text-primary dark:text-white tracking-tighter">{token}</span>
               </div>
            </div>

            <div className="space-y-6 pt-4 w-full">
              <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-xs text-slate-500 leading-relaxed italic">
                "Please retain this reference token for all future correspondence. An authorized investigator from our trust will review your submission and contact you within 5-10 business days."
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="outline" className="flex-1 rounded-xl h-12 border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold">
                  <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" /> Home Page</Link>
                </Button>
                <Button onClick={() => setToken(null)} className="flex-1 rounded-xl h-12 bg-primary text-white font-bold hover:bg-secondary">
                  Report New Issue
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden border-b-8 border-accent/20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.2em] mb-8 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-4 h-4" /> Return to Portal
            </Link>
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <ShieldAlert className="w-10 h-10 text-accent animate-pulse" />
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl md:text-6xl font-headline font-bold leading-tight">
                  Report a <span className="text-accent italic">Violation</span>
                </h1>
                <p className="text-lg md:text-xl text-primary-foreground/70 font-medium tracking-wide">Official Human Rights Complaint Submission Portal</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Badge className="bg-accent text-primary font-bold px-4 py-1 uppercase tracking-widest text-[10px] border-none shadow-sm">BNSS 2023 Compliant</Badge>
              <Badge className="bg-emerald-500 text-white font-bold px-4 py-1 uppercase tracking-widest text-[10px] border-none shadow-sm">Secure Registry</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Complaint Form Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            
            <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-8 md:p-12">
                 <CardTitle className="text-2xl font-headline font-bold text-primary dark:text-white flex items-center gap-3">
                   <FileText className="w-6 h-6 text-accent" /> Formal Complaint Application
                 </CardTitle>
                 <p className="text-slate-400 text-sm font-medium mt-2">Please fill in all mandatory fields to ensure institutional processing of your report.</p>
              </CardHeader>
              <CardContent className="p-8 md:p-16">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                    
                    {/* Part 1: Complainant Credentials */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                        <span className="w-8 h-px bg-accent"></span> Complainant Particulars / অভিযোগকারীর বিবরণ
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Legal Name / পূর্ণ আইনি নাম *</FormLabel>
                            <FormControl><Input placeholder="Complainant Name" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="relationName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Father's or Husband's Name / পিতার বা স্বামীর নাম *</FormLabel>
                            <FormControl><Input placeholder="Guardian Name" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="aadhaar" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Aadhaar Number / আধার নম্বর *</FormLabel>
                            <FormControl><Input placeholder="12-digit Aadhaar Number" maxLength={12} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact Number / যোগাযোগের নম্বর *</FormLabel>
                            <FormControl><Input placeholder="+91 XXXXX XXXXX" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Official Email (Optional) / অফিসিয়াল ইমেল (ঐচ্ছিক)</FormLabel>
                            <FormControl><Input placeholder="email@example.com" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Part 1.1: Address Details */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                        <span className="w-8 h-px bg-accent"></span> Verified Residential Address / যাচাইকৃত আবাসিক ঠিকানা
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary mb-4">
                           <Home className="w-5 h-5 text-accent" />
                           <span className="text-sm font-bold uppercase tracking-widest">Address Protocol</span>
                        </div>
                        <FormField control={form.control} name="address" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Street / Village / House No / রাস্তা / গ্রাম / বাড়ি নম্বর *</FormLabel>
                            <FormControl><Input placeholder="Street/Detailed Address" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField control={form.control} name="postOffice" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Post Office / পোস্ট অফিস *</FormLabel>
                              <FormControl><Input placeholder="Post Office" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="policeStation" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Police Station / পুলিশ স্টেশন *</FormLabel>
                              <FormControl><Input placeholder="Police Station" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="pinCode" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PIN Code / পিন কোড *</FormLabel>
                              <FormControl><Input placeholder="6 digits" maxLength={6} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    </div>

                    {/* Part 1.2: Conditional Third Party Section */}
                    <div className="space-y-6 p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                      <FormField control={form.control} name="isThirdParty" render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-accent h-5 w-5" /></FormControl>
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-black text-primary dark:text-white uppercase tracking-tight cursor-pointer">
                              Report on behalf of someone else / এই অভিযোগ কি অন্য কারো পক্ষে?
                            </FormLabel>
                            <FormDescription className="text-[10px] uppercase font-bold text-slate-400">Enable this if the victim is a third party.</FormDescription>
                          </div>
                        </FormItem>
                      )} />

                      {isThirdParty && (
                        <div className="space-y-8 pt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="victimName" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-accent">Victim's Full Name / ভুক্তভোগীর পূর্ণ নাম *</FormLabel>
                                <FormControl><Input placeholder="Name of the aggrieved person" className="h-12 rounded-xl bg-white dark:bg-slate-950" {...field} /></FormControl>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="victimPhone" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-accent">Victim's Contact / ভুক্তভোগীর ফোন নম্বর</FormLabel>
                                <FormControl><Input placeholder="Phone number (if available)" className="h-12 rounded-xl bg-white dark:bg-slate-950" {...field} /></FormItem>
                            )} />
                            <FormField control={form.control} name="victimAadhaar" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-accent">Victim's Aadhaar / ভুক্তভোগীর আধার নম্বর</FormLabel>
                                <FormControl><Input placeholder="Victim's 12-digit Aadhaar" maxLength={12} className="h-12 rounded-xl bg-white dark:bg-slate-950 font-mono" {...field} /></FormControl>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="victimAddress" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-accent">Victim's Address / ভুক্তভোগীর ঠিকানা</FormLabel>
                                <FormControl><Input placeholder="Complete residential address" className="h-12 rounded-xl bg-white dark:bg-slate-950" {...field} /></FormControl>
                              </FormItem>
                            )} />
                          </div>

                          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <FormField control={form.control} name="victimIsMinor" render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-red-500 h-5 w-5" /></FormControl>
                                <div className="space-y-0.5">
                                  <FormLabel className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-tight cursor-pointer">
                                    Victim is a Minor / ভুক্তভোগী কি নাবালক?
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )} />

                            {victimIsMinor && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-in zoom-in-95 duration-300">
                                <FormField control={form.control} name="victimAge" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-red-500">Minor's Age / ভুক্তভোগীর বয়স *</FormLabel>
                                    <FormControl><Input placeholder="Current Age" type="number" className="h-12 rounded-xl bg-white dark:bg-slate-950" {...field} /></FormControl>
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="victimGender" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-red-500">Minor's Gender / ভুক্তভোগীর লিঙ্গ *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-slate-950"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-white">
                                        <SelectItem value="male">Male / পুরুষ</SelectItem>
                                        <SelectItem value="female">Female / মহিলা</SelectItem>
                                        <SelectItem value="other">Other / অন্যান্য</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Part 2: Incident Logistics */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                        <span className="w-8 h-px bg-accent"></span> Incident Logistics / ঘটনার বিবরণ
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="incidentDate" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date of Occurrence / ঘটনার তারিখ *</FormLabel>
                            <FormControl><Input type="date" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="incidentLocation" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Venue / Location / ঘটনাস্থল / অবস্থান *</FormLabel>
                            <FormControl><Input placeholder="Place where incident happened" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Part 3: Violation Details */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                        <span className="w-8 h-px bg-accent"></span> Violation Narrative / লঙ্ঘনের বিবরণ
                      </h3>
                      <div className="space-y-6">
                        <FormField control={form.control} name="subject" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Complaint Subject / অভিযোগের বিষয় *</FormLabel>
                            <FormControl><Input placeholder="Title of the incident" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Detailed Description / বিস্তারিত বিবরণ *</FormLabel>
                            <FormControl><Textarea placeholder="Explain the facts and sequence of events in detail..." className="min-h-[200px] rounded-2xl bg-slate-50 dark:bg-slate-950 p-6 leading-relaxed" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="accusedDetails" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Accused Person(s) / অভিযুক্ত ব্যক্তি(গণ)</FormLabel>
                              <FormControl><Textarea placeholder="Names and identifiers of violators..." className="min-h-[100px] rounded-2xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="witnesses" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Witness Details / প্রত্যক্ষদর্শী</FormLabel>
                              <FormControl><Textarea placeholder="Names and contact of witnesses..." className="min-h-[100px] rounded-2xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    </div>

                    {/* Part 4: Evidence Upload Section */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                        <span className="w-8 h-px bg-accent"></span> Evidence Upload / প্রমাণ আপলোড
                      </h3>
                      <div className="p-6 md:p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
                          <div className="space-y-1 text-center md:text-left">
                            <FormLabel className="text-sm font-black text-primary dark:text-white uppercase tracking-tight">Upload Incident Photos / ঘটনার ছবি আপলোড করুন</FormLabel>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Maximum 3 photos. Max size 100KB per photo. / সর্বোচ্চ ৩টি ছবি। প্রতি ছবির আকার ১০০ কেবি-র মধ্যে হতে হবে।</p>
                          </div>
                          <div className="relative shrink-0">
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="h-12 rounded-xl border-accent/30 text-accent font-bold px-6 gap-2 hover:bg-accent hover:text-white transition-all disabled:opacity-30"
                              disabled={incidentPhotos.length >= 3}
                            >
                              <Upload className="w-4 h-4" /> Select Photos
                              <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                onChange={handlePhotoUpload}
                                disabled={incidentPhotos.length >= 3}
                              />
                            </Button>
                          </div>
                        </div>

                        {incidentPhotos.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-500">
                            {incidentPhotos.map((photo, idx) => (
                              <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg">
                                <Image src={photo} alt={`Incident ${idx + 1}`} fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="icon" 
                                    className="rounded-full h-8 w-8"
                                    onClick={() => removePhoto(idx)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="absolute bottom-2 left-2">
                                  <Badge className="bg-primary/60 backdrop-blur-sm text-[8px] border-none"># {idx + 1}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {incidentPhotos.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-10 opacity-30">
                            <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No photos attached / কোনো ছবি যুক্ত করা হয়নি</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Part 5: Procedural Status */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                        <span className="w-8 h-px bg-accent"></span> Procedural Status / পদ্ধতিগত অবস্থা
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="otherAuthorities" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lodged with other authorities? / অন্য কোনো কর্তৃপক্ষের কাছে অভিযোগ করা হয়েছে কি?</FormLabel>
                            <FormControl><Textarea placeholder="Details of prior reporting to Police/NHRC etc." className="min-h-[100px] rounded-2xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="isSubJudice" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sub Judice / Pending Proceedings / আইনি পদক্ষেপ বা মামলা কি বিচারাধীন?</FormLabel>
                            <FormControl><Textarea placeholder="Details of pending court cases if any..." className="min-h-[100px] rounded-2xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                      <div className="bg-slate-950 rounded-3xl p-8 text-white relative overflow-hidden mb-10 shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="flex items-start gap-4 relative z-10">
                           <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0 mt-1" />
                           <div className="space-y-2">
                             <p className="font-bold text-sm uppercase tracking-widest text-emerald-400 leading-none">Affirmation of Integrity</p>
                             <p className="text-xs text-slate-400 leading-relaxed font-medium">
                               "I solemnly affirm that the information provided in this formal complaint is true and accurate to the best of my knowledge. I understand that Human Rights Affairs Trust operates in collaboration with statutory authorities for the protection of constitutional rights."
                             </p>
                           </div>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-16 rounded-[1.5rem] bg-accent text-primary font-bold text-xl hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20 flex gap-3 group"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>Lodge Formal Complaint <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </Button>

                      <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-8">
                        National Rights Registry Node • HRAT India
                      </p>
                    </div>

                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="mt-16 text-center">
              <Link href="/legal-aid" className="text-primary dark:text-white font-bold hover:text-accent transition-colors flex items-center justify-center gap-2 group">
                 <Scale className="w-5 h-5 text-accent" /> Need immediate legal advice? Visit Legal Aid Cell <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
