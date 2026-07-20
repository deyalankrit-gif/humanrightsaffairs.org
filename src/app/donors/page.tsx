
"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/footer'
import { 
  Heart, 
  Award, 
  Star, 
  ShieldCheck, 
  Users, 
  HandHeart, 
  Scale, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Globe,
  Sparkles,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DonationDialog } from '@/components/donation-dialog'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { cn } from '@/lib/utils'

export default function DonorsPage() {
  const db = useFirestore()
  const impactImg1 = PlaceHolderImages.find(img => img.id === 'donation-bg-1');
  const impactImg2 = PlaceHolderImages.find(img => img.id === 'donation-bg-2');

  const tiersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'donor_tiers'), orderBy('priority', 'desc'));
  }, [db]);

  const { data: donorTiers, loading } = useCollection(tiersQuery);

  const impactMetrics = [
    { label: "Free Consultations", value: "4,500+", color: "text-emerald-500" },
    { label: "Awareness Camps", value: "120+", color: "text-accent" },
    { label: "State Reach", value: "18 States", color: "text-indigo-500" },
    { label: "Success Rate", value: "92%", color: "text-blue-500" }
  ]

  const getIcon = (name: string) => {
    switch (name) {
      case 'Award': return <Award className="w-8 h-8 text-white/80" />;
      case 'Star': return <Star className="w-8 h-8 text-white/80" />;
      case 'ShieldCheck': return <ShieldCheck className="w-8 h-8 text-white/80" />;
      case 'Users': return <Users className="w-8 h-8 text-white/80" />;
      default: return <Award className="w-8 h-8 text-white/80" />;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="bg-accent text-white font-bold px-4 py-1.5 uppercase tracking-widest text-[10px] border-none mb-6">Wall of Gratitude</Badge>
            <h1 className="text-4xl md:text-7xl font-headline font-bold mb-6">Thank You <span className="text-accent italic">Our Donors</span></h1>
            <p className="text-lg md:text-xl opacity-80 leading-relaxed font-medium mb-12">
              Every coin contributed is a brick in the foundation of a more just and equitable India. We celebrate the spirit of giving that powers our mission.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
               {impactMetrics.map((m, i) => (
                 <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <p className={cn("text-2xl md:text-3xl font-headline font-bold", m.color)}>{m.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-1">{m.label}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Honor Roll */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary dark:text-white">Our <span className="text-accent italic">Wall of Honor</span></h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">Recognizing the individuals and institutions that provide the critical resources for JusticeShield to function.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
               <Loader2 className="w-10 h-10 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {(donorTiers || []).map((tier: any, idx: number) => (
                <Card key={idx} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 flex flex-col group hover:-translate-y-2 transition-all duration-500">
                  <div className={cn("h-32 flex items-center justify-center bg-gradient-to-br relative", tier.color)}>
                     <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="relative z-10 p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                        {getIcon(tier.iconName)}
                     </div>
                  </div>
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-headline font-bold text-primary dark:text-white">{tier.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
                    <div className="space-y-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{tier.description}"</p>
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent">Top Benefactors</p>
                        <ul className="space-y-3">
                          {(tier.members || []).map((name: string, i: number) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-bold text-primary dark:text-slate-200">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              {name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Impact Story Section */}
      <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3rem] blur-2xl"></div>
              <div className="relative grid grid-cols-2 gap-4">
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl rotate-[-3deg] translate-y-4">
                  <Image src={impactImg1?.imageUrl || "/female.jpeg"} alt="Impact" fill className="object-cover" />
                </div>
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl rotate-[3deg] -translate-y-4">
                  <Image src={impactImg2?.imageUrl || "/child.jpeg"} alt="Impact" fill className="object-cover" />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white dark:bg-slate-900 rounded-full shadow-2xl flex items-center justify-center p-4">
                <div className="relative w-full h-full">
                   <Image src="/HRAT%20Logo.jpeg" alt="HRAT" fill className="object-contain" />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-100 uppercase tracking-widest">
                <TrendingUp className="w-4 h-4" />
                <span>Impact Transparency</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary dark:text-white leading-tight">Your <span className="text-emerald-600 italic">Rupees</span> at Work.</h2>
              
              <div className="space-y-6">
                {[
                  { title: "Pro-Bono Legal Cell", desc: "Funding advocate fees for marginalized citizens who cannot afford high-fidelity legal defense.", icon: <Scale className="text-indigo-500" /> },
                  { title: "Constitutional Literacy", desc: "Printing regional language manuals and running workshops in rural Bengal and North India.", icon: <Sparkles className="text-accent" /> },
                  { title: "Rescue & Relief", desc: "Emergency assistance for victims of human rights violations and immediate administrative liaison.", icon: <HandHeart className="text-pink-500" /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 h-fit">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-primary dark:text-white">{item.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Supporter CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto rounded-[3rem] bg-slate-950 p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full -ml-32 -mb-32 blur-[100px]"></div>
            
            <div className="relative z-10 space-y-8">
              <Heart className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
              <h2 className="text-3xl md:text-6xl font-headline font-bold leading-tight">Be the Shield that <br/><span className="text-accent italic">Protects Justice</span>.</h2>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                Join our mission today. Whether you are a student, professional, or a corporation—your contribution creates a legacy of human rights.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                <DonationDialog>
                   <Button className="h-16 px-12 rounded-2xl bg-accent text-primary font-bold text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20 hover:scale-105 active:scale-95">
                     Contribute Now <ArrowRight className="ml-2 w-5 h-5" />
                   </Button>
                </DonationDialog>
                
                <div className="flex flex-col items-center sm:items-start text-xs font-bold text-emerald-400 uppercase tracking-widest gap-2">
                   <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> 80G Tax Exempt</div>
                   <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> NITI Aayog Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
