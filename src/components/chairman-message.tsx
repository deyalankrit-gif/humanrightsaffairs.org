import Image from 'next/image'
import { Quote } from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'

export function ChairmanMessage() {
  const chairmanImg = PlaceHolderImages.find(img => img.id === 'chairman-photo')
  
  return (
    <section id="leadership" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl group-hover:bg-accent/30 transition duration-500"></div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 md:border-8 border-white dark:border-slate-800">
              <Image 
                src={chairmanImg?.imageUrl || '/Dhritiman.jpeg'} 
                alt="Dhritiman Dey" 
                fill 
                className="object-cover"
                data-ai-hint={chairmanImg?.imageHint}
              />
            </div>
            {/* Red Branding on Photo Overlay */}
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 bg-white/5 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-lg border border-white/10">
              <h3 className="font-headline text-2xl md:text-4xl font-bold text-red-600 leading-tight">Dhritiman Dey</h3>
              <p className="text-primary dark:text-white font-bold text-[10px] md:text-lg tracking-widest uppercase">Central Chairman (INDIA) & Founder</p>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary dark:bg-primary/20 px-4 py-1.5 rounded-full text-[10px] md:text-sm font-bold mx-auto lg:mx-0">
              <Quote className="w-3 h-3 md:w-4 md:h-4 fill-primary" />
              <span>Chairman's Vision 2026</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-headline font-bold text-primary dark:text-foreground leading-tight">
              A World Where Justice Is A <span className="text-accent italic">Fundamental Promise</span>, Not A Privilege.
            </h2>
            <div className="space-y-4 md:space-y-6 text-sm md:text-lg text-muted-foreground font-body leading-relaxed">
              <p>
                "At Human Rights Affairs Trust, we believe that every individual, regardless of their background, deserves the full protection of their constitutional rights. Our organization was founded on the bedrock of Indian democratic values and international humanitarian principles."
              </p>
              <p>
                "Through Justice Shield, we are bridging the gap between legal complexity and the common man. Our mission is to empower every citizen with knowledge and provide a strong shield against injustice."
              </p>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-secondary font-bold text-lg md:text-xl shrink-0">
                 DD
               </div>
               <div className="text-left">
                 <p className="font-bold text-lg md:text-3xl text-secondary leading-none">Dhritiman Dey</p>
                 <p className="text-muted-foreground font-bold text-[10px] md:text-2xl italic mt-1 md:mt-2">Founder & Chairman</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
