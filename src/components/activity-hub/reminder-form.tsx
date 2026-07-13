
"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select'
import { REMINDER_OPTIONS } from '@/lib/activity-hub-constants'
import { useFirestore, useUser } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Loader2, Bell } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { addDays, parseISO, startOfDay } from 'date-fns'

const formSchema = z.object({
  daysBefore: z.coerce.number().min(0),
})

export function ReminderForm({ 
  event, 
  onSuccess 
}: { 
  event: any, 
  onSuccess: () => void 
}) {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      daysBefore: 1
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!db || !user) return
    setLoading(true)

    try {
      const eventDate = parseISO(event.date);
      const remindDate = addDays(eventDate, -values.daysBefore);
      
      await addDoc(collection(db, 'activity_reminders'), {
        uid: user.uid,
        title: event.title,
        eventId: event.id,
        daysBefore: values.daysBefore,
        remindAt: remindDate.toISOString(),
        notified: false,
        createdAt: serverTimestamp()
      })
      
      toast({ title: "Reminder Saved" })
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
        <FormField control={form.control} name="daysBefore" render={({ field }) => (
          <FormItem><FormLabel>Notify me</FormLabel>
            <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value.toString()}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent className="bg-white">
                {REMINDER_OPTIONS.map(opt => <SelectItem key={opt.days} value={opt.days.toString()}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormItem>
        )} />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
          Save Reminder
        </Button>
      </form>
    </Form>
  )
}
