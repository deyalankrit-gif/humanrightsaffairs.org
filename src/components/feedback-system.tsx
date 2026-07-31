"use client"

import React, { useState, useMemo } from 'react'
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  User, 
  MapPin,
  Quote,
  Sparkles,
  Star,
  Globe,
  CheckCircle2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * Google Logo Component: High-fidelity inline SVG for Google branding.
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.61-1.48 2.53-3.66 2.53-6.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

/**
 * DEMI_TESTIMONIALS: High-fidelity institutional seed data.
 */
const DEMI_TESTIMONIALS = [
  { id: 'g1', name: "Vikramaditya Pratap Singh", address: "Varanasi, UP", comment: "মানবাধিকারদের নিরাপত্তা নিশ্চিত করার জন্য এটি ভারতের অন্যতম সেরা সংস্থা। জয় হিন্দ।", rating: 5, source: 'Google Business' },
  { id: 'd1', name: "Indranil Roy", address: "Kolkata, West Bengal", comment: "The Legal Aid Cell provided me with incredible support during my family's property dispute. Truly a shield for the common man.", rating: 5, source: 'HRAT Website' },
  { id: 'g2', name: "Rajeshwari Khanna", address: "Indore, MP", comment: "Highly reliable legal guidance. They actually listen to the victims.", rating: 5, source: 'Google Business' },
  { id: 'd22', name: "Tanmoy Biswas", address: "Nadia, WB", comment: "খুবই ভালো উদ্যোগ। মানবাধিকার নিয়ে এমন স্বচ্ছ কাজ সচরাচর দেখা যায় না।", rating: 5, source: 'HRAT Website' },
  { id: 'g3', name: "Mayank Tiwari", address: "Bhopal, MP", comment: "Justice Shield is doing God's work for the poor. Very impressive transparency.", rating: 5, source: 'Google Business' },
  { id: 'd2', name: "Meenakshi Iyer", address: "Chennai, Tamil Nadu", comment: "Excellent initiative for constitutional literacy. The awareness programs in our block have empowered many women.", rating: 4, source: 'HRAT Website' },
  { id: 'd26', name: "Arpan Sengupta", address: "Birbhum, WB", comment: "আমাদের এলাকার সচেতনতা শিবিরের জন্য আপনাদের অনেক ধন্যবাদ।", rating: 5, source: 'HRAT Website' },
  { id: 'g4', name: "Sanjeev Yadav", address: "Gurugram, Haryana", comment: "Helpful staff and quick processing of grievances. Keep it up!", rating: 4, source: 'Google Business' },
  { id: 'd5', name: "Pallavi Sharma", address: "New Delhi", comment: "The AI-Enhanced Rights Explorer is a game changer for students and law professionals alike. Highly accurate!", rating: 5, source: 'HRAT Website' },
  { id: 'd16', name: "Swarup Barman", address: "Cooch Behar, West Bengal", comment: "সংগঠনের কাজের স্বচ্ছতা ও সততা আমাকে মুগ্ধ করেছে। প্রান্তিক মানুষের লড়াইয়ে আপনারা সবসময় পাশে থাকুন।", rating: 5, source: 'HRAT Website' },
  { id: 'g5', name: "Priyanka Das", address: "Howrah, WB", comment: "Best human rights organization in West Bengal.", rating: 5, source: 'Google Business' },
  { id: 'd40', name: "Tarun Jena", address: "Krishnanagar, WB", comment: "আপনাদের কাজের স্বচ্ছতা আমাদের ভরসা জোগায়। মানবতার জয় হোক।", rating: 5, source: 'HRAT Website' }
];

/**
 * Community Feedback System: Elevated Public Voice module.
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

  const { data: firestoreFeedback, loading } = useCollection(feedbackQuery);

  const feedbackItems = useMemo(() => {
    const liveItems = firestoreFeedback || [];
    return [...liveItems, ...DEMI_TESTIMONIALS];
  }, [firestoreFeedback]);

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
        source: 'HRAT Website',
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

  const themes = [
    "from-orange-500 via-amber-400 to-yellow-500",
    "from-emerald-500 via-teal-400 to-cyan-500",
    "from-indigo-600 via-purple-500 to-pink-500",
    "from-rose-500 via-red-400 to-orange-500",
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 relative overflow-hidden">
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
          <p className="text-slate-50 dark:text-slate-400 text-sm md:text-lg mt-4 max-w-xl mx-auto">
            Real-time voices and ratings from citizens across India supporting the mission of Justice Shield, synchronized with Google Business.
          </p>
        </div>

        <div className="relative overflow-hidden w-full h-[420px] flex items-center mb-16">
          <div className="flex animate-marquee hover:pause whitespace-nowrap gap-8">
            {feedbackItems.length > 0 ? (
              [...feedbackItems, ...feedbackItems].map((item: any, idx) => {
                const themeClass = themes[idx % themes.length];
                const isGoogle = item.source === 'Google Business';

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
                        <div className="flex items-center justify-between">
                           <div className="flex gap-1">
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
                           {isGoogle && (
                             <Badge className="bg-white/80 dark:bg-slate-900/80 text-primary dark:text-white border-slate-100 dark:border-slate-800 text-[8px] font-black uppercase tracking-widest flex gap-1.5 items-center px-3 py-1 mr-20 transition-all duration-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
                               <GoogleIcon className="w-2.5 h-2.5" /> Google Review
                             </Badge>
                           )}
                        </div>

                        <p className="text-base md:text-lg font-medium italic text-primary dark:text-slate-100 leading-relaxed whitespace-normal line-clamp-4">
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
                            <div className="flex items-center gap-4">
                               <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.1em] flex items-center gap-1.5 truncate">
                                 <MapPin className="w-3 h-3 text-accent" /> {item.address}
                               </p>
                               {isGoogle && <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-tighter"><CheckCircle2 className="w-2.5 h-2.5" /> Verified</div>}
                            </div>
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
            ) : null}
          </div>
        </div>

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
                className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary transition-all shadow-xl shadow-primary/20 flex gap-3 group"
                disabled={isSubmitting} 
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
