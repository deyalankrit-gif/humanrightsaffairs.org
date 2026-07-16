"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFirestore } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { 
  ShieldAlert, 
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
  Camera,
  ArrowLeft
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

const complaintSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Full address is required for documentation"),
  incidentDate: z.string().min(1, "Date of incident is required"),
  incidentLocation: z.string().min(5, "Venue/Location is required"),
  subject: z.string().min(5, "Please provide a subject for the complaint"),
  description: z.string().min(30, "Please describe the incident in detail (min 30 chars)"),
  accusedDetails: z.string().optional(),
  witnesses: z.string().optional(),
})

export default function ReportAComplaintPage() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const form = useForm<z.infer<typeof complaintSchema>>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      incidentDate: '',
      incidentLocation: '',
      subject: '',
      description: '',
      accusedDetails: '',
      witnesses: ''
    }
  })

  const onSubmit = async (values: z.infer<typeof complaintSchema>) => {
    if (!db) return
    setIsSubmitting(true)

    const submissionToken = `CMP-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`
    const complaintData = {
      ...values,
      token: submissionToken,
      status: 'Pending',
      type: 'Public Complaint',
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "public_complaints"), complaintData)
      .then(() => {
        setToken(submissionToken)
        form.reset()
        toast({
          title: "Complaint Lodged",
          description: "Your official report has been recorded in the national registry."
        })
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
            
            <div className="mb-12 grid md:grid-cols-3 gap-6">
               <Card className="bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900 rounded-3xl p-6 flex flex-col items-center text-center gap-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                  <p className="text-[10px] font-black uppercase text-red-700 dark:text-red-400">Strict Confidentiality</p>
                  <p className="text-xs text-red-800/70 dark:text-red-400/70 leading-relaxed font-medium">Your identity and submission data are encrypted and accessible only to the central council.</p>
               </Card>
               <Card className="bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900 rounded-3xl p-6 flex flex-col items-center text-center gap-4">
                  <Gavel className="w-10 h-10 text-indigo-600" />
                  <p className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400">Legal Merit Audit</p>
                  <p className="text-xs text-indigo-800/70 dark:text-indigo-400/70 leading-relaxed font-medium">Every report undergoes a preliminary legal assessment by our pro-bono advocate panel.</p>
               </Card>
               <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900 rounded-3xl p-6 flex flex-col items-center text-center gap-4">
                  <Clock className="w-10 h-10 text-emerald-600" />
                  <p className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">Live Response Track</p>
                  <p className="text-xs text-emerald-800/70 dark:text-emerald-400/70 leading-relaxed font-medium">Use your generated token to verify the investigation status across all regional chapters.</p>
               </Card>
            </div>

            <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-8 md:p-12">
                 <CardTitle className="text-2xl font-headline font-bold text-primary dark:text-white flex items-center gap-3">
                   <FileText className="w-6 h-6 text-accent" /> Formal Complaint Application
                 </CardTitle>
                 <p className="text-slate-400 text-sm font-medium mt-2">Please fill in all mandatory fields to ensure institutional processing of your report.</p>
              </CardHeader>
              <CardContent className="p-8 md:p-16">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    
                    {/* Part 1: Complainant Credentials */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                        <span className="w-8 h-px bg-accent"></span> Complainant Particulars
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Legal Name *</FormLabel>
                            <FormControl><Input placeholder="Enter your name as per ID" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Official Email *</FormLabel>
                            <FormControl><Input placeholder="name@example.com" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact Number *</FormLabel>
                            <FormControl><Input placeholder="+91 XXXXX XXXXX" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="address" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Complete Address *</FormLabel>
                            <FormControl><Input placeholder="Street, Village, PS, PO, District" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Part 2: Incident Logistics */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                        <span className="w-8 h-px bg-accent"></span> Incident Logistics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="incidentDate" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date of Occurrence *</FormLabel>
                            <FormControl><Input type="date" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="incidentLocation" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Venue / Location *</FormLabel>
                            <FormControl><Input placeholder="Where did it happen?" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Part 3: Narrative & Accused */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                        <span className="w-8 h-px bg-accent"></span> Violation Narrative
                      </h3>
                      <div className="space-y-6">
                        <FormField control={form.control} name="subject" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Complaint Subject *</FormLabel>
                            <FormControl><Input placeholder="Brief title for the issue" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Detailed Description *</FormLabel>
                            <FormControl><Textarea placeholder="Explain the incident in sequence. Mention facts, times, and specific actions..." className="min-h-[180px] rounded-2xl bg-slate-50 dark:bg-slate-950 p-6 leading-relaxed" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="accusedDetails" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Accused Person(s) - If Known</FormLabel>
                              <FormControl><Textarea placeholder="Names, designations, or descriptions of the alleged violators..." className="min-h-[100px] rounded-2xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="witnesses" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Eye Witnesses</FormLabel>
                              <FormControl><Textarea placeholder="Names and contact of people present during the incident..." className="min-h-[100px] rounded-2xl bg-slate-50 dark:bg-slate-950" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                      <div className="bg-slate-950 rounded-3xl p-8 text-white relative overflow-hidden mb-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="flex items-start gap-4 relative z-10">
                           <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0 mt-1" />
                           <div className="space-y-2">
                             <p className="font-bold text-sm uppercase tracking-widest text-emerald-400 leading-none">Affirmation of Truth</p>
                             <p className="text-xs text-slate-400 leading-relaxed font-medium">
                               "By submitting this complaint, I solemnly affirm that the information provided is true to the best of my knowledge. I understand that Human Rights Affairs Trust operates in liaison with law enforcement and administrative authorities."
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
                        Central Command Registry Node • HRAT India
                      </p>
                    </div>

                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="mt-16 text-center">
              <Link href="/legal-aid" className="text-primary dark:text-white font-bold hover:text-accent transition-colors flex items-center justify-center gap-2 group">
                 <Scale className="w-5 h-5 text-accent" /> Need immediate legal advice instead? Visit our Legal Aid Cell <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
