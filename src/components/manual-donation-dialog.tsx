
"use client"

import React, { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, IndianRupee, User, Mail, Phone, MapPin, Hash, CreditCard } from 'lucide-react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from '@/firebase'
import { useToast } from '@/hooks/use-toast'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'

const formSchema = z.object({
  donorName: z.string().min(2, "Name is required"),
  donorEmail: z.string().email("Invalid email"),
  donorPhone: z.string().min(10, "Phone number is required"),
  donorAddress: z.string().min(5, "Address is required"),
  amount: z.coerce.number().min(1, "Amount must be positive"),
  paymentMethod: z.string().min(1, "Method is required"),
  paymentDetails: z.string().optional(),
  chequeNumber: z.string().optional(),
  bankName: z.string().optional(),
  branchName: z.string().optional(),
  pan: z.string().optional(),
  aadhaar: z.string().optional(),
  status: z.string().default("Completed"),
})

export function ManualDonationDialog({ children }: { children: React.ReactNode }) {
  const db = useFirestore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donorName: '',
      donorEmail: '',
      donorPhone: '',
      donorAddress: '',
      amount: 0,
      paymentMethod: 'Cash',
      status: 'Completed'
    }
  })

  const selectedMethod = form.watch('paymentMethod')

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!db) return
    setLoading(true)

    const transactionId = `MANUAL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const donationData = {
      ...values,
      transactionId,
      createdAt: serverTimestamp(),
      isManual: true,
      timestamp: new Date().toLocaleString()
    }

    const docRef = doc(db, "donations", transactionId)

    setDoc(docRef, donationData)
      .then(() => {
        toast({ title: "Donation Recorded", description: `Record ID: ${transactionId}` })
        form.reset()
        setOpen(false)
        setLoading(false)
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: donationData,
        } satisfies SecurityRuleContext);
        
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false)
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-[2rem] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-2">
            <Plus className="w-6 h-6 text-accent" /> Detailed Manual Entry
          </DialogTitle>
          <DialogDescription>Record offline contributions with full donor profiling for tax receipts.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField control={form.control} name="donorName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"><User className="w-3 h-3" /> Full Name</FormLabel>
                  <FormControl><Input placeholder="Jayanta Paul" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="donorEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"><Mail className="w-3 h-3" /> Email</FormLabel>
                  <FormControl><Input placeholder="donor@example.com" type="email" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField control={form.control} name="donorPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"><Phone className="w-3 h-3" /> Phone</FormLabel>
                  <FormControl><Input placeholder="+91 98765..." className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"><IndianRupee className="w-3 h-3" /> Amount (₹)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input className="pl-8 h-11 rounded-xl font-bold" type="number" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="donorAddress" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"><MapPin className="w-3 h-3" /> Address</FormLabel>
                <FormControl><Textarea placeholder="Full residential address for tax auditing..." className="min-h-[80px] rounded-xl" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5" /> Payment Method
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl border-accent/20 bg-white dark:bg-slate-800 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="UPI">UPI Payment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Record Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-800 border-none shadow-sm font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {selectedMethod === 'Cheque' ? (
                <div className="grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <FormField control={form.control} name="chequeNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Cheque No.</FormLabel>
                      <FormControl><Input placeholder="000123" className="h-10 rounded-lg" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bankName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Bank Name</FormLabel>
                      <FormControl><Input placeholder="SBI" className="h-10 rounded-lg" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="branchName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Branch</FormLabel>
                      <FormControl><Input placeholder="Kolkata" className="h-10 rounded-lg" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              ) : (
                <FormField control={form.control} name="paymentDetails" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Reference / Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Transaction ID, A/c Last 4, etc." className="h-10 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="pan" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"><Hash className="w-3 h-3" /> PAN (Optional)</FormLabel>
                  <FormControl><Input className="uppercase font-mono h-11 rounded-xl" placeholder="ABCDE1234F" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="aadhaar" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"><Hash className="w-3 h-3" /> Aadhaar (Optional)</FormLabel>
                  <FormControl><Input className="font-mono h-11 rounded-xl" placeholder="1234 5678 9012" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl mt-4 font-bold text-lg bg-accent text-primary hover:bg-accent/90 shadow-xl shadow-accent/10" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Record Official Contribution"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
