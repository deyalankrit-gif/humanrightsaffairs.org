import Image from 'next/image'
import { Quote } from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'

export function ChairmanMessage() {
  const chairmanImg = PlaceHolderImages.find(img => img.id === 'chairman-photo')
  
  return (
    <section id="leadership" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl group-hover:bg-accent/30 transition duration-500"></div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
              <Image 
                src={chairmanImg?.imageUrl || '/Dhritiman.jpeg'} 
                alt="Dhritiman Dey" 
                fill 
                className="object-cover"
                data-ai-hint={chairmanImg?.imageHint}
              />
            </div>
            <div className="absolute bottom-6 left-6 right-6 bg-white/5 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/10">
              <h3 className="font-headline text-2xl font-bold text-emerald-600">Dhritiman Dey</h3>
              <p className="text-primary font-bold text-sm tracking-widest uppercase">Central Chairman (INDIA) & Founder</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold">
              <Quote className="w-4 h-4 fill-primary" />
              <span>Chairman's Vision 2024</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary leading-tight">
              A World Where Justice Is A <span className="text-accent italic">Fundamental Promise</span>, Not A Privilege.
            </h2>
            <div className="space-y-6 text-lg text-slate-600 font-body leading-relaxed">
              <p>
                "At Human Rights Affairs Trust, we believe that every individual, regardless of their background, deserves the full protection of their constitutional rights. Our organization was founded on the bedrock of Indian democratic values and international humanitarian principles."
              </p>
              <p>
                "Through JusticeShield, we are bridging the gap between legal complexity and the common man. Our mission is to empower every citizen with knowledge and provide a robust shield against injustice."
              </p>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
               <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-secondary font-bold text-xl">
                 DD
               </div>
               <div>
                 <p className="font-bold text-lg text-accent">Dhritiman Dey</p>
                 <p className="text-slate-500">Central Chairman (INDIA) & Founder</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
