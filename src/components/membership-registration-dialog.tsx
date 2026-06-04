
"use client"

import React, { useState } from 'react'
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
  DialogTrigger,
  DialogFooter
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Loader2, 
  ArrowRight,
  Globe,
  CheckCircle2,
  Users
} from 'lucide-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from '@/firebase'
import { useToast } from '@/hooks/use-toast'
import { INDIA_DATA } from '@/lib/india-data'

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Full address is required"),
  pan: z.string().length(10, "PAN must be 10 characters"),
  aadhaar: z.string().length(12, "Aadhaar must be 12 digits"),
  level: z.string().min(1, "Operational level required"),
  stateName: z.string().optional(),
  districtName: z.string().optional(),
  memberType: z.string().min(1, "Please select membership type"),
})

export function MembershipRegistrationDialog({ children }: { children: React.ReactNode }) {
  const db = useFirestore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      pan: '',
      aadhaar: '',
      level: 'National',
      memberType: 'Regular Member',
    }
  })

  const level = form.watch('level')
  const selectedState = form.watch('stateName')
  const states = Object.keys(INDIA_DATA).sort()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!db) return
    setLoading(true)

    const applicationData = {
      ...values,
      status: 'Pending',
      createdAt: serverTimestamp()
    }

    try {
      await addDoc(collection(db, "memberApplications"), applicationData)
      setIsSuccess(true)
      toast({ title: "Application Submitted", description: "Your registration is under review." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl text-center p-12">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-headline font-bold text-primary">Registration Received</h2>
              <p className="text-slate-500">Your application has been logged in the National registry. Our regional coordinator will contact you for verification.</p>
            </div>
            <Button onClick={() => setOpen(false)} className="w-full h-12 rounded-xl bg-primary text-white font-bold">Return to Site</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-accent" /> Personnel Commissioning
          </DialogTitle>
          <DialogDescription className="text-base">
            Apply to become a verified member of the Human Rights Affairs Trust.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="bg-accent/5 p-6 rounded-3xl border border-accent/20 mb-4">
               <FormField control={form.control} name="memberType" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2 flex items-center gap-2">
                    <Users className="w-3 h-3" /> Preferred Membership Capacity
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-12 rounded-xl border-accent/30 bg-white dark:bg-slate-900 font-bold"><SelectValue placeholder="Select Capacity" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Executive Designation" className="font-bold">Executive Designation (Leadership)</SelectItem>
                      <SelectItem value="Regular Member" className="font-bold">Regular Member</SelectItem>
                      <SelectItem value="Volunteer" className="font-bold">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Legal Name</FormLabel>
                  <FormControl><Input placeholder="Sanchita Banerjee" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Official Email</FormLabel>
                  <FormControl><Input placeholder="name@example.com" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact Number</FormLabel>
                  <FormControl><Input placeholder="+91 XXXXX XXXXX" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="level" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Operational Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="National">National Level</SelectItem>
                      <SelectItem value="State">State Level</SelectItem>
                      <SelectItem value="District">District Level</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {(level === 'State' || level === 'District') && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <FormField control={form.control} name="stateName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">State Chapter</FormLabel>
                    <Select onValueChange={(val) => { field.onChange(val); form.setValue('districtName', '') }}>
                      <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select State" /></SelectTrigger></FormControl>
                      <SelectContent className="max-h-60">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="districtName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">District</FormLabel>
                    <Select onValueChange={field.onChange} disabled={!selectedState}>
                      <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                      <SelectContent className="max-h-60">{(selectedState ? INDIA_DATA[selectedState] : []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Residential Address</FormLabel>
                <FormControl><Textarea placeholder="Complete address for background verification..." className="rounded-xl" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="pan" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PAN Number</FormLabel>
                  <FormControl><Input placeholder="ABCDE1234F" className="h-11 rounded-xl uppercase font-mono" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="aadhaar" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Aadhaar Number</FormLabel>
                  <FormControl><Input placeholder="12-digit number" className="h-11 rounded-xl font-mono" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-accent shrink-0 mt-1" />
              <p className="text-xs text-slate-500 leading-relaxed italic">
                By submitting this application, you agree to uphold the constitutional values of India and adhere to the conduct protocols of the Human Rights Affairs Trust.
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary/90 shadow-xl shadow-primary/20 flex gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <>Submit Registration Request <ArrowRight className="w-5 h-5" /></>}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
