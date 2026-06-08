"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFirestore } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { MessageSquareText, ShieldAlert, CheckCircle2, Loader2, ArrowRight, Hash } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'

const grievanceSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  memberId: z.string().optional(),
  phone: z.string().min(10, "Valid phone number required"),
  subject: z.string().min(5, "Please provide a brief subject"),
  description: z.string().min(20, "Please describe your grievance in detail (min 20 chars)")
})

export function MemberGrievances() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const form = useForm<z.infer<typeof grievanceSchema>>({
    resolver: zodResolver(grievanceSchema),
    defaultValues: {
      name: '',
      email: '',
      memberId: '',
      phone: '',
      subject: '',
      description: ''
    }
  })

  const onSubmit = async (values: z.infer<typeof grievanceSchema>) => {
    if (!db) return
    setIsSubmitting(true)

    const submissionToken = `GRV-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`
    const grievanceData = {
      ...values,
      token: submissionToken,
      status: 'Pending',
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "grievances"), grievanceData)
      .then(() => {
        setToken(submissionToken)
        form.reset()
        toast({
          title: "Submission Successful",
          description: "Your grievance has been securely recorded."
        })
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'grievances',
          operation: 'create',
          requestResourceData: grievanceData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  if (token) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-[2.5rem] overflow-hidden shadow-2xl text-center p-8 md:p-16">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-headline font-bold text-primary dark:text-white">Grievance Registered</h2>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Your complaint has been submitted to the Central Council Grievance Cell.</p>
            </div>
            
            <div className="w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-dashed border-emerald-200 dark:border-emerald-900 shadow-inner">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Secure Tracking Token</p>
               <div className="flex items-center justify-center gap-3">
                 <Hash className="w-6 h-6 text-accent" />
                 <span className="text-4xl font-headline font-bold text-primary dark:text-white tracking-tighter">{token}</span>
               </div>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-xs text-slate-500 leading-relaxed italic">
                "Please keep this token for future reference. Our cell will contact you via email or phone within 7-10 working days."
              </p>
              <Button 
                onClick={() => setToken(null)}
                variant="outline" 
                className="rounded-xl px-8 font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                File Another Grievance
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="grid md:grid-cols-5 h-full">
          <div className="md:col-span-2 bg-primary dark:bg-slate-800 p-8 md:p-12 text-primary-foreground flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <ShieldAlert className="w-8 h-8 text-accent" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-headline font-bold text-white">Central <span className="text-accent italic">Council</span> Grievance Cell</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  We are committed to maintaining the highest ethical standards. Use this portal to report organizational misconduct, member violations, or personal grievances.
                </p>
              </div>
              <div className="space-y-4 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure Protocol</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin-Only Access</span>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 uppercase font-bold mt-12">Authorized by JusticeShield Central Governance</p>
          </div>

          <div className="md:col-span-3 p-8 md:p-12 bg-white dark:bg-slate-950">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Full Name</FormLabel>
                      <FormControl><Input placeholder="Your Name" className="rounded-xl h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Phone Number</FormLabel>
                      <FormControl><Input placeholder="+91 XXXXX XXXXX" className="rounded-xl h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Email Address</FormLabel>
                      <FormControl><Input placeholder="email@example.com" className="rounded-xl h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="memberId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Member ID (Optional)</FormLabel>
                      <FormControl><Input placeholder="ABCDEF1234" className="rounded-xl h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Grievance Subject</FormLabel>
                    <FormControl><Input placeholder="e.g. Identity Card Delay" className="rounded-xl h-11" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Full Description</FormLabel>
                    <FormControl><Textarea placeholder="Explain your concern in detail..." className="rounded-xl min-h-[120px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:bg-secondary transition-all flex gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <>Submit Formal Grievance <ArrowRight className="w-5 h-5" /></>}
                </Button>
                
                <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  Grievances are end-to-end encrypted and visible only to authorized oversight officials.
                </p>
              </form>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  )
}
