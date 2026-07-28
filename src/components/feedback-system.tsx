
"use client"

import React, { useState, useMemo } from 'react'
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  User, 
  Star,
  Quote
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function FeedbackSystem() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', comment: '' })

  const feedbackQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: feedbackItems, loading } = useCollection(feedbackQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return
    if (!formData.name.trim() || !formData.comment.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Name and comment are required." })
      return
    }

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, 'feedback'), {
        ...formData,
        createdAt: serverTimestamp()
      })
      toast({ title: "Feedback Recorded", description: "Thank you for your valuable input." })
      setFormData({ name: '', comment: '' })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Submission Failed" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/30 mb-4">
            <MessageSquare className="w-3.5 h-3.5" /> Public Voice
          </div>
          <h2 className="text-3xl font-headline font-bold text-primary dark:text-white">Community <span className="text-accent italic">Feedback</span></h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Your insights help us strengthen the shield of justice.</p>
        </div>

        {/* Marquee Feedback Display */}
        <div className="relative overflow-hidden w-full h-48 flex items-center mb-12">
          <div className="flex animate-marquee hover:pause whitespace-nowrap gap-6">
            {feedbackItems && feedbackItems.length > 0 ? (
              // Double the items to create seamless loop
              [...feedbackItems, ...feedbackItems].map((item: any, idx) => (
                <Card key={`${item.id}-${idx}`} className="inline-block min-w-[300px] md:min-w-[400px] border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 relative">
                  <Quote className="absolute top-4 right-4 w-10 h-10 text-slate-50 dark:text-slate-800" />
                  <CardContent className="p-0 space-y-4">
                    <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">"{item.comment}"</p>
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-50 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary dark:text-white">{item.name}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verified Citizen</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : loading ? (
              <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <Loader2 className="w-4 h-4 animate-spin" /> Synchronizing Feedback...
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                No feedback recorded yet. Be the first to share your experience.
              </div>
            )}
          </div>
        </div>

        {/* Submission Form */}
        <Card className="max-w-xl mx-auto rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-950 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name / নাম</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Jayanta Paul" 
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Your Experience / আপনার মতামত</Label>
              <Textarea 
                value={formData.comment} 
                onChange={e => setFormData({...formData, comment: e.target.value})} 
                placeholder="Share your thoughts on our services..." 
                className="rounded-2xl min-h-[120px]"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary transition-all flex gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send className="w-5 h-5" /> Submit Feedback</>}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  )
}
