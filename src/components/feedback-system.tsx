"use client"

import React, { useState } from 'react'
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
  MapPin,
  Quote,
  Sparkles,
  Star
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * Community Feedback System: Elevated Public Voice module.
 * Features: 5-Star rating system, animated colorful marquee, and real-time registry sync.
 */
export function FeedbackSystem() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [formData, setFormData] = useState({ 
    name: '', 
    address: '', 
    comment: '',
    rating: 5 
  })

  const feedbackQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: feedbackItems, loading } = useCollection(feedbackQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return
    if (!formData.name.trim() || !formData.address.trim() || !formData.comment.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "All fields are required." })
      return
    }

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, 'feedback'), {
        ...formData,
        createdAt: serverTimestamp()
      })
      toast({ title: "Feedback Recorded", description: "Thank you for your valuable input." })
      setFormData({ name: '', address: '', comment: '', rating: 5 })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Submission Failed" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Predefined colorful gradient themes for the floating boxes
  const themes = [
    "from-orange-500 via-amber-400 to-yellow-500", // Saffron-Gold
    "from-emerald-500 via-teal-400 to-cyan-500",   // Emerald-Teal
    "from-indigo-600 via-purple-500 to-pink-500",  // Indigo-Purple
    "from-rose-500 via-red-400 to-orange-500",     // Rose-Pink
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-accent/30 mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Public Voice Hub
          </div>
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary dark:text-white leading-tight">
            Community <span className="text-accent italic">Testimonials</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg mt-4 max-w-xl mx-auto">
            Real-time voices and ratings from citizens across India supporting the mission of Justice Shield.
          </p>
        </div>

        {/* Marquee Feedback Display */}
        <div className="relative overflow-hidden w-full h-80 flex items-center mb-16">
          <div className="flex animate-marquee hover:pause whitespace-nowrap gap-8">
            {feedbackItems && feedbackItems.length > 0 ? (
              // Double the items to create seamless loop
              [...feedbackItems, ...feedbackItems].map((item: any, idx) => {
                const themeClass = themes[idx % themes.length];
                return (
                  <Card 
                    key={`${item.id}-${idx}`} 
                    className={cn(
                      "inline-block min-w-[320px] md:min-w-[450px] border-none shadow-2xl rounded-[2.5rem] p-0 relative overflow-hidden transform hover:scale-105 transition-all duration-500"
                    )}
                  >
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r bg-[length:200%_auto] animate-gradient-x opacity-10 dark:opacity-20",
                      themeClass
                    )}></div>
                    
                    <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-between bg-white/40 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-white/5">
                      <Quote className="absolute top-6 right-8 w-12 h-12 text-primary/5 dark:text-white/5" />
                      
                      <CardContent className="p-0 space-y-4">
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "w-4 h-4", 
                                i < (item.rating || 5) ? "fill-accent text-accent" : "text-slate-200 dark:text-slate-700"
                              )} 
                            />
                          ))}
                        </div>

                        <p className="text-base md:text-lg font-medium italic text-primary dark:text-slate-100 leading-relaxed whitespace-normal line-clamp-3">
                          "{item.comment}"
                        </p>
                        
                        <div className="flex items-center gap-4 pt-4 border-t border-primary/10 dark:border-white/10">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 bg-gradient-to-br animate-gradient-x bg-[length:200%_auto]",
                            themeClass
                          )}>
                            <User className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-primary dark:text-white truncate uppercase tracking-tight">{item.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.1em] flex items-center gap-1.5 truncate">
                              <MapPin className="w-3 h-3 text-accent" /> {item.address}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })
            ) : loading ? (
              <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs px-10 py-8 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed">
                <Loader2 className="w-5 h-5 animate-spin text-accent" /> Synchronizing Verified Voices...
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs px-10 py-8 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed">
                <MessageSquare className="w-5 h-5 text-slate-300" /> No feedback recorded yet. Be the first to share your experience.
              </div>
            )}
          </div>
        </div>

        {/* Submission Form Card */}
        <Card className="max-w-2xl mx-auto rounded-[3rem] border-none shadow-2xl bg-white dark:bg-slate-950 p-8 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-accent"></div>
          <div className="relative z-10 space-y-8">
            <div className="space-y-1">
              <h3 className="text-xl font-headline font-bold text-primary dark:text-white">Share Your Experience</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">আমরা আপনার মতামতের গুরুত্ব দিই</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name / নাম *</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="Enter your name" 
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none shadow-inner text-sm font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Address / ঠিকানা *</Label>
                  <Input 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    placeholder="City, State" 
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none shadow-inner text-sm font-bold"
                    required
                  />
                </div>
              </div>

              {/* Star Rating Selector */}
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Rate Our Mission / রেটিং দিন *</Label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl w-fit shadow-inner">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setFormData({...formData, rating: star})}
                      className="transition-all hover:scale-125 active:scale-95 p-1"
                    >
                      <Star 
                        className={cn(
                          "w-8 h-8 transition-colors",
                          star <= (hoverRating || formData.rating) 
                            ? "fill-accent text-accent" 
                            : "text-slate-300 dark:text-slate-700"
                        )} 
                      />
                    </button>
                  ))}
                  <span className="ml-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    {formData.rating}/5 Stars
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Your Comment / আপনার মতামত *</Label>
                <Textarea 
                  value={formData.comment} 
                  onChange={e => setFormData({...formData, comment: e.target.value})} 
                  placeholder="Tell us about the impact of Justice Shield in your life..." 
                  className="rounded-[1.5rem] min-h-[120px] bg-slate-50 dark:bg-slate-900 border-none shadow-inner text-sm font-medium p-4 leading-relaxed"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary transition-all shadow-xl shadow-primary/20 flex gap-3 group"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-6 h-6" />
                ) : (
                  <>Submit Feedback <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </section>
  )
}
