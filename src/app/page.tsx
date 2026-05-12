
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { ChairmanMessage } from '@/components/chairman-message'
import { KnowledgeCenter } from '@/components/knowledge-center'
import { EmergencyHelpline } from '@/components/emergency-helpline'
import { IDCardShowcase } from '@/components/id-card-sample'
import { AIChat } from '@/components/ai-chat'
import { DocSearch } from '@/components/doc-search'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Shield, Scale, Users, HeartHandshake, ArrowRight, Gavel } from 'lucide-react'

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-human-rights')

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroImg?.imageUrl || ''} 
            alt="Human Rights Unity" 
            fill 
            className="object-cover brightness-[0.4]"
            priority
            data-ai-hint={heroImg?.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-white">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-bold border border-accent/30 backdrop-blur-md">
              <Shield className="w-4 h-4" />
              <span>India's Leading Human Rights Watch</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold leading-tight">
              Empowering Every <span className="text-accent italic">Citizen</span> Through Legal Knowledge.
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 font-body max-w-2xl">
              We provide a robust shield against injustice, offering expert legal guidance, community support, and constitutional awareness.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="bg-accent text-primary font-bold hover:bg-accent/90 px-8 py-7 rounded-2xl text-xl">
                Get Free Legal Aid <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-7 rounded-2xl text-xl backdrop-blur-sm">
                Explore Rights Library
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full container px-4 hidden lg:block">
           <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 grid grid-cols-4 gap-8">
             {[
               { icon: <Gavel className="w-6 h-6 text-accent" />, count: "25k+", label: "Legal Cases Resolved" },
               { icon: <Users className="w-6 h-6 text-emerald-400" />, count: "500+", label: "Expert Advocates" },
               { icon: <Shield className="w-6 h-6 text-indigo-400" />, count: "100%", label: "Secure Data" },
               { icon: <HeartHandshake className="w-6 h-6 text-pink-400" />, count: "50+", label: "National Centers" }
             ].map((stat, i) => (
               <div key={i} className="flex items-center gap-4 text-white">
                 <div className="p-3 bg-white/10 rounded-2xl">{stat.icon}</div>
                 <div>
                   <p className="text-2xl font-bold font-headline">{stat.count}</p>
                   <p className="text-xs font-bold uppercase tracking-widest text-slate-300">{stat.label}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* AI Search Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold text-primary mb-2">AI-Enhanced Document Search</h2>
            <p className="text-slate-500">Instantly find specific legal clauses within our extensive library.</p>
          </div>
          <DocSearch />
        </div>
      </section>

      <ChairmanMessage />
      
      <KnowledgeCenter />

      <EmergencyHelpline />

      <IDCardShowcase />

      {/* Final CTA / Donation */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-primary rounded-[3rem] p-12 md:p-24 flex flex-col items-center text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="max-w-3xl space-y-8 relative z-10">
              <Scale className="w-16 h-16 text-accent mx-auto" />
              <h2 className="text-4xl md:text-6xl font-headline font-bold">Support the Cause of <span className="text-accent italic">Justice</span></h2>
              <p className="text-xl text-indigo-100">
                Your contributions help us provide free legal aid to the marginalized and run awareness campaigns across rural India. All donations are tax-exempt.
              </p>
              <div className="pt-4 flex flex-col md:flex-row gap-6 justify-center">
                <Button className="bg-accent text-primary font-bold hover:bg-accent/90 px-12 py-8 rounded-2xl text-xl">
                  Donate Securely Now
                </Button>
                <div className="flex flex-col items-center md:items-start justify-center text-left">
                  <p className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Instant Receipt Generation</p>
                  <p className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Transparent Fund Tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <AIChat />
    </main>
  )
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
