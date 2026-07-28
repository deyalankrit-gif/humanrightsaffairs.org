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
  MapPin,
  Quote,
  Sparkles,
  Star
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * DEMI_TESTIMONIALS: High-fidelity institutional seed data.
 * Represents a diverse cross-section of Indian citizens and their feedback.
 * Expanded to 40 items with a shuffle to provide a vibrant, real-time feel.
 */
const DEMI_TESTIMONIALS = [
  { id: 'd21', name: "Vijay Pratap Singh", address: "Varanasi, UP", comment: "मानवाधिकारों की सुरक्षा के लिए यह संस्था बहुत सराहनीय कार्य कर रही है।", rating: 5 },
  { id: 'd1', name: "Arindam Das", address: "Kolkata, West Bengal", comment: "The Legal Aid Cell provided me with incredible support during my family's property dispute. Truly a shield for the common man.", rating: 5 },
  { id: 'd22', name: "Sumit Biswas", address: "Nadia, WB", comment: "খুবই ভালো উদ্যোগ। মানবাধিকার নিয়ে এমন স্বচ্ছ কাজ সচরাচর দেখা যায় না।", rating: 5 },
  { id: 'd2', name: "Meena Iyer", address: "Chennai, Tamil Nadu", comment: "Excellent initiative for constitutional literacy. The awareness programs in our block have empowered many women.", rating: 4 },
  { id: 'd23', name: "Rajesh Khanna", address: "Indore, MP", comment: "कानूनी सहायता के लिए जस्टिस शील्ड एक भरोसेमंद नाम बन गया है। जय हिन्द।", rating: 4 },
  { id: 'd3', name: "Biren Baruah", address: "Guwahati, Assam", comment: "Highly professional approach to human rights advocacy. Their intervention in my workplace grievance was swift and effective.", rating: 5 },
  { id: 'd24', name: "Mithu Das", address: "Howrah, WB", comment: "আইনি সহায়তার জন্য আপনাদের কাছে গিয়ে আমি সত্যিই উপকৃত হয়েছি।", rating: 4 },
  { id: 'd4', name: "Rajesh Mohanty", address: "Bhubaneswar, Odisha", comment: "The documentation assistance for filing an FIR was very helpful, though the response time at the district office could be improved.", rating: 3 },
  { id: 'd25', name: "Sunita Kumari", address: "Patna, Bihar", comment: "संवैधानिक साक्षरता अभियान से हमारे क्षेत्र के लोगों में नई जागृति आई है।", rating: 5 },
  { id: 'd5', name: "Priya Sharma", address: "New Delhi", comment: "The AI-Enhanced Rights Explorer is a game changer for students and law professionals alike. Highly accurate!", rating: 5 },
  { id: 'd26', name: "Rahul Sengupta", address: "Birbhum, WB", comment: "আমাদের এলাকার সচেতনতা শিবিরের জন্য আপনাদের অনেক ধন্যবাদ।", rating: 5 },
  { id: 'd6', name: "Amit Singh", address: "Lucknow, Uttar Pradesh", comment: "HRAT is doing a great job in North India. I appreciate their dedication to labor rights and fair wages.", rating: 4 },
  { id: 'd27', name: "Amit Bhardwaj", address: "Jaipur, Rajasthan", comment: "संगठन की पारदर्शिता अच्छी है पर क्षेत्रीय कार्यालय में संपर्क करने में थोड़ी देरी होती है।", rating: 3 },
  { id: 'd7', name: "Sunita Patil", address: "Mumbai, Maharashtra", comment: "The Women and Child Protection Cell is a blessing. They helped me secure my rights with absolute dignity.", rating: 5 },
  { id: 'd28', name: "Anita Patra", address: "Midnapore, WB", comment: "সংগঠনের প্রতিটি সদস্য খুব হেল্পফুল। তবে কাজ শেষ হতে একটু সময় লাগছে।", rating: 3 },
  { id: 'd8', name: "Karthik V", address: "Bengaluru, Karnataka", comment: "Very impressed with the technical transparency. The digital ID card verification is very secure.", rating: 4 },
  { id: 'd29', name: "Manish Tiwari", address: "Bhopal, MP", comment: "गरीबों को न्याय दिलाने का आपका प्रयास ईश्वर का कार्य है। सराहनीय!", rating: 5 },
  { id: 'd9', name: "Lipika Roy", address: "Siliguri, West Bengal", comment: "Justice Shield-এর আইনি পরামর্শ আমাদের গ্রামের অনেক মানুষকে সাহায্য করেছে। অসংখ্য ধন্যবাদ!", rating: 5 },
  { id: 'd30', name: "Pradip Mahanta", address: "Murshidabad, WB", comment: "মানবাধিকার সুরক্ষায় জাস্টিস শিল্ডের ভূমিকা অতুলনীয়। আপনাদের পাশে আছি।", rating: 5 },
  { id: 'd10', name: "Debashish Patra", address: "Cuttack, Odisha", comment: "Reliable guidance on government schemes. They helped me get the benefits my elderly parents were entitled to.", rating: 4 },
  { id: 'd31', name: "Rekha Sharma", address: "Chandigarh", comment: "वेबसाइट पर मौजूद कानूनी जानकारी बहुत ही सरल और उपयोगी है।", rating: 4 },
  { id: 'd11', name: "Anjali Devi", address: "Ranchi, Jharkhand", comment: "The grievance portal is a good step towards accountability. My issue was recorded and I received a tracking token.", rating: 3 },
  { id: 'd32', name: "Somnath Halder", address: "Barasat, WB", comment: "আইডি কার্ড ভেরিফিকেশন সিস্টেমটি খুব আধুনিক এবং নিরাপদ। ভালো কাজ।", rating: 4 },
  { id: 'd12', name: "Manjunath Reddy", address: "Hyderabad, Telangana", comment: "Excellent work in promoting legal literacy. Their simple language manuals are perfect for non-legal backgrounds.", rating: 5 },
  { id: 'd33', name: "Sanjay Yadav", address: "Gurugram, Haryana", comment: "आरती (RTI) फाइल करने में आपकी टीम ने मेरी बहुत मदद की। आभार।", rating: 5 },
  { id: 'd13', name: "Sangita Borah", address: "Jorhat, Assam", comment: "The pro-bono services are a lifesaver for marginalized sections. The advocates are very compassionate.", rating: 4 },
  { id: 'd34', name: "Mallika Ghosh", address: "Malda, WB", comment: "গরীব মানুষের আইনি লড়াইয়ে আপনারা যে পাশে দাঁড়িয়েছেন, তা সত্যি প্রশংসনীয়।", rating: 5 },
  { id: 'd14', name: "Thangavelu M", address: "Madurai, Tamil Nadu", comment: "I received justice through their intervention in a land encroachment case. Faith in humanity restored.", rating: 5 },
  { id: 'd35', name: "Pawan Joshi", address: "Haridwar, UK", comment: "पहाड़ी क्षेत्रों में पहुँच थोड़ी कम है, आशा है आप वहां भी शिविर लगाएंगे।", rating: 3 },
  { id: 'd15', name: "Rahul Gupta", address: "Jaipur, Rajasthan", comment: "Good platform for rights awareness. The RTI assistant helped me draft my application perfectly.", rating: 4 },
  { id: 'd36', name: "Arup Sarkar", address: "Jalpaiguri, WB", comment: "সংবিধানিক অধিকার সম্পর্কে সাধারণ মানুষকে সচেতন করার এই প্রচেষ্টা জারি থাকুক।", rating: 4 },
  { id: 'd16', name: "Swapna Barman", address: "Cooch Behar, West Bengal", comment: "সংগঠনের কাজের স্বচ্ছতা ও সততা আমাকে মুগ্ধ করেছে। প্রান্তিক মানুষের লড়াইয়ে আপনারা সবসময় পাশে থাকুন।", rating: 5 },
  { id: 'd37', name: "Deepa Rawat", address: "Dehradun, UK", comment: "महिला सुरक्षा के लिए आपके द्वारा किए गए कार्य बहुत प्रभावी हैं। धन्यवाद।", rating: 5 },
  { id: 'd17', name: "Naveen Kumar", address: "Amritsar, Punjab", comment: "Great intent and vision. I hope to see more local centers in the border regions soon.", rating: 3 },
  { id: 'd38', name: "Kakoli Roy", address: "Bankura, WB", comment: "খুবই সুন্দর ওয়েবসাইট। তবে ফোন নম্বর দিয়ে লগইন করতে সমস্যা হচ্ছে মাঝে মাঝে।", rating: 3 },
  { id: 'd18', name: "Divya Reddy", address: "Kochi, Kerala", comment: "The most high-fidelity NGO portal I have encountered. The data security measures are top-notch.", rating: 5 },
  { id: 'd39', name: "Kishan Lal", address: "Mathura, UP", comment: "सत्य और न्याय की इस यात्रा में जस्टिस शील्ड एक मजबूत ढाल है।", rating: 4 },
  { id: 'd19', name: "Sanjay Raut", address: "Pune, Maharashtra", comment: "Professional leadership and clear communication. Their newsletters keep us well informed.", rating: 4 },
  { id: 'd40', name: "Joydeep Dutta", address: "Krishnanagar, WB", comment: "আপনাদের কাজের স্বচ্ছতা আমাদের ভরসা জোগায়। মানবতার জয় হোক।", rating: 5 },
  { id: 'd20', name: "Tapas Jena", address: "Puri, Odisha", comment: "The real shield for voiceless people. Their commitment to human rights is truly inspiring for everyone.", rating: 5 }
];

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

  const { data: firestoreFeedback, loading } = useCollection(feedbackQuery);

  // Merge Firestore data with Demi-Testimonials for a rich initial view
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
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg mt-4 max-w-xl mx-auto">
            Real-time voices and ratings from citizens across India supporting the mission of Justice Shield.
          </p>
        </div>

        <div className="relative overflow-hidden w-full h-80 flex items-center mb-16">
          <div className="flex animate-marquee hover:pause whitespace-nowrap gap-8">
            {feedbackItems.length > 0 ? (
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
