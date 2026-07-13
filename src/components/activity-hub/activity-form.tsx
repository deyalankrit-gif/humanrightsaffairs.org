
"use client"

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select'
import { 
  ACTIVITY_CATEGORIES, ACTIVITY_PRIORITIES, ACTIVITY_STATUSES 
} from '@/lib/activity-hub-constants'
import { useFirestore, useUser } from '@/firebase'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Loader2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  venue: z.string().optional(),
  organizer: z.string().optional(),
  responsiblePerson: z.string().optional(),
  budget: z.coerce.number().optional(),
  notes: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  priority: z.string().min(1, "Priority is required"),
})

export function ActivityForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: any, 
  onSuccess: () => void 
}) {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      category: 'Human Rights',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '17:00',
      venue: '',
      organizer: 'HRAT',
      responsiblePerson: '',
      budget: 0,
      notes: '',
      status: 'Planned',
      priority: 'Medium',
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!db || !user) return
    setLoading(true)

    try {
      if (initialData?.id) {
        await updateDoc(doc(db, 'activity_events', initialData.id), {
          ...values,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid
        })
        toast({ title: "Event Updated" })
      } else {
        await addDoc(collection(db, 'activity_events'), {
          ...values,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        })
        toast({ title: "Event Scheduled" })
      }
      onSuccess()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent className="bg-white">
                  {ACTIVITY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="startTime" render={({ field }) => (
            <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>
          )} />
          <FormField control={form.control} name="endTime" render={({ field }) => (
            <FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="venue" render={({ field }) => (
          <FormItem><FormLabel>Venue</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent className="bg-white">
                  {ACTIVITY_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormItem>
          )} />
          <FormField control={form.control} name="priority" render={({ field }) => (
            <FormItem><FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent className="bg-white">
                  {ACTIVITY_PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
        )} />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {initialData?.id ? "Update Event" : "Create Event"}
        </Button>
      </form>
    </Form>
  )
}
