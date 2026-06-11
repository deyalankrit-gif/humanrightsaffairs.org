
"use client"

import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'

export function StateChairpersonMessage() {
  const chairpersonImg = PlaceHolderImages.find(img => img.id === 'moumita-photo')
  
  return (
    <section className="py-20 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-100 dark:border-emerald-900/30">
              <ShieldCheck className="w-4 h-4" />
              <span>West Bengal State Chapter</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary dark:text-foreground leading-tight">
              Empowering the People of <span className="text-emerald-600 italic">Bengal</span> Through Constitutional Literacy.
            </h2>
            <div className="space-y-4 text-base text-muted-foreground font-body leading-relaxed">
              <p>
                "As the Chairman of West Bengal, my focus is to ensure that the mission of Justice Shield reaches every corner of our state. We are dedicated to provide accessible legal support and awareness to the marginalized communities across all districts."
              </p>
              <p>
                "Our state chapter is actively working with legal experts and local volunteers to bridge the gap between rights and reality. We believe that an informed citizen is a protected citizen."
              </p>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-primary dark:text-indigo-400 font-bold text-xl">
                 MS
               </div>
               <div>
                 <p className="font-bold text-2xl md:text-3xl lg:text-4xl text-emerald-600">Moumita Saha</p>
                 <p className="text-muted-foreground text-lg md:text-xl font-bold">Chairman (West Bengal) & Founder</p>
               </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative group order-1 lg:order-2">
            <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-2xl group-hover:bg-emerald-500/20 transition duration-500"></div>
            <div className="relative aspect-square md:aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white dark:border-slate-800">
              <Image 
                src={chairpersonImg?.imageUrl || '/Moumita.jpeg'} 
                alt="Moumita Saha" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                data-ai-hint="moumita saha portrait"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent"></div>
            </div>
            <div className="absolute bottom-6 left-6 bg-white/20 backdrop-blur-3xl px-8 py-4 rounded-full shadow-2xl border border-white/30">
              <p className="text-accent font-bold text-2xl tracking-wide">Moumita Saha</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
