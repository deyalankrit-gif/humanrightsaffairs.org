"use client"

import React, { useState } from "react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useFirestore } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, X } from 'lucide-react'

const ranks = ["Chairman", "Vice-Chairman", "Secretary", "Treasurer", "Director", "Officer", "Agent", "Member"];
const posts = ["National", "State", "District", "Block", "Panchayat"];

/**
 * Shared field styling: a clearly visible 2px black border on every input, textarea and select.
 */
const fieldBase =
  "rounded-xl bg-white text-slate-900 placeholder:text-slate-400 " +
  "!border-2 !border-black hover:!border-slate-700 " + 
  "focus-visible:!border-accent focus-visible:ring-2 focus-visible:ring-accent/30 " +
  "transition-colors";

const inputClass = `h-12 ${fieldBase}`;
const textareaClass = fieldBase;

const memberSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  rank: z.string().min(1, "Rank is required"),
  post: z.string().min(1, "Post is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  aadhaarUID: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  fullAddress: z.object({
    street: z.string().min(1, "Street/Village is required"),
    po: z.string().min(1, "Post Office is required"),
    ps: z.string().min(1, "Police Station is required"),
    city: z.string().min(1, "City/District is required"),
    state: z.string().min(1, "State is required"),
    pinCode: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
  }),
  profilePhotoUrl: z.string().url().optional(),
});

export function MembershipRegistrationDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { toast } = useToast();
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      rank: '',
      post: '',
      email: '',
      phone: '',
      aadhaarUID: '',
      panNumber: '',
      fullAddress: {
        street: '',
        po: '',
        ps: '',
        city: '',
        state: '',
        pinCode: '',
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof memberSchema>) => {
    if (!db) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'members'), {
        ...values,
        commissionDate: serverTimestamp(),
        status: 'active', // Default status
      });
      toast({ title: "Success", description: "New personnel has been commissioned." });
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({ title: "Error", description: "Failed to commission personnel.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-900 border-accent/20 text-white rounded-3xl p-0">
        <DialogHeader className="p-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="bg-accent text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded-full inline-block mb-2">Commission Terminal</div>
              <DialogTitle className="text-3xl font-bold font-headline text-white">Personnel Commissioning</DialogTitle>
              <DialogDescription className="text-slate-400">High-fidelity official record induction.</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:bg-white/10 hover:text-white"><X className="w-5 h-5" /></Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl><Input placeholder="Enter full name" {...field} className={inputClass} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl><Input placeholder="Enter email address" {...field} className={inputClass} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl><Input placeholder="Enter 10-digit phone number" {...field} className={inputClass} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="rank" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rank *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClass}><SelectValue placeholder="Select rank" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ranks.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="post" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClass}><SelectValue placeholder="Select post" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {posts.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="aadhaarUID" render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhaar UID *</FormLabel>
                  <FormControl><Input placeholder="Enter 12-digit UID" {...field} className={inputClass} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="panNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN Number *</FormLabel>
                  <FormControl><Input placeholder="Enter PAN" {...field} className={inputClass} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="fullAddress.street" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Full Residence Protocol *</FormLabel>
                  <FormControl><Textarea placeholder="Street Address / Village..." {...field} className={textareaClass} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="fullAddress.po" render={({ field }) => (
                <FormItem>
                  <FormLabel>P.O. *</FormLabel>
                  <FormControl><Input placeholder="Post Office" {...field} className={inputClass} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="fullAddress.ps" render={({ field }) => (
                <FormItem>
                  <FormLabel>P.S. *</FormLabel>
                  <FormControl><Input placeholder="Police Station" {...field} className={inputClass} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="fullAddress.pinCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN *</FormLabel>
                  <FormControl><Input placeholder="PIN Code" {...field} className={inputClass} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="fullAddress.city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City/District *</FormLabel>
                  <FormControl><Input placeholder="City or District" {...field} className={inputClass} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="fullAddress.state" render={({ field }) => (
                <FormItem>
                  <FormLabel>State *</FormLabel>
                  <FormControl><Input placeholder="State" {...field} className={inputClass} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <DialogFooter className="pt-8">
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-200">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                Establish Force Record
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}