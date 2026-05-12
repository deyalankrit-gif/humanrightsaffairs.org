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
import { Shield, Scale, Users, HeartHandshake, ArrowRight, Gavel, CheckCircle2 } from 'lucide-react'
import { DonationDialog } from '@/components/donation-dialog'
import { Typewriter } from '@/components/typewriter'

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
            className="object-cover brightness-[0.3] scale-105"
            priority
            data-ai-hint={heroImg?.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/60 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-white">
          <div className="max-w-4xl space-y-6 animate-fade-in-up">
            <div className="space-y-2">
              <p className="text-accent font-headline font-bold text-2xl md:text-3xl tracking-wide italic">
                <Typewriter text="Human Rights Affairs Trust" speed={80} delay={500} />
              </p>
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-bold border border-accent/30 backdrop-blur-md">
                <Shield className="w-4 h-4" />
                <span>India's Trusted Human Rights Shield</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-headline font-bold leading-tight">
              Upholding <span className="text-accent italic">Justice</span> <br/> 
              Empowering <span className="text-emerald-400">Citizens</span>.
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-200 font-body max-w-2xl leading-relaxed">
              We provide a robust shield against injustice through expert legal guidance, community-led support, and radical constitutional transparency.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <DonationDialog>
                <Button size="lg" className="bg-accent text-primary font-bold hover:bg-accent/90 px-8 py-7 rounded-2xl text-xl shadow-lg shadow-accent/20 transition-all hover:-translate-y-1">
                  Get Free Legal Aid <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </DonationDialog>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8 py-7 rounded-2xl text-xl backdrop-blur-sm transition-all">
                Explore Rights Library
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full container px-4 hidden lg:block animate-fade-in-up animate-delay-500">
           <div className="glass-dark rounded-[2.5rem] p-8 grid grid-cols-4 gap-8">
             {[
               { icon: <Gavel className="w-6 h-6 text-accent" />, count: "25k+", label: "Legal Cases Resolved" },
               { icon: <Users className="w-6 h-6 text-emerald-400" />, count: "500+", label: "Expert Advocates" },
               { icon: <Shield className="w-6 h-6 text-indigo-400" />, count: "100%", label: "Secure Data" },
               { icon: <HeartHandshake className="w-6 h-6 text-pink-400" />, count: "50+", label: "National Centers" }
             ].map((stat, i) => (
               <div key={i} className="flex items-center gap-4 text-white hover:scale-105 transition-transform cursor-default">
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

      {/* AI Search Section with Animation */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">AI-Enhanced <span className="text-accent">Rights</span> Explorer</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Instantly navigate complex legal frameworks. Our AI highlights exactly what you need to know about your constitutional protections.</p>
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
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-primary rounded-[3rem] p-12 md:p-24 flex flex-col items-center text-center text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="max-w-3xl space-y-8 relative z-10">
              <div className="animate-float">
                <Scale className="w-20 h-20 text-accent mx-auto" />
              </div>
              <h2 className="text-4xl md:text-6xl font-headline font-bold">Support the Cause of <span className="text-accent italic">Justice</span></h2>
              <p className="text-xl text-indigo-100 leading-relaxed">
                Your contributions help us provide free legal aid to the marginalized and run awareness campaigns across rural India. All donations are tax-exempt under 80G.
              </p>
              <div className="pt-4 flex flex-col md:flex-row gap-6 justify-center">
                <DonationDialog>
                  <Button className="bg-accent text-primary font-bold hover:bg-accent/90 hover:scale-105 active:scale-95 transition-all px-12 py-8 rounded-2xl text-xl shadow-xl shadow-accent/20">
                    Donate Securely Now
                  </Button>
                </DonationDialog>
                <div className="flex flex-col items-center md:items-start justify-center text-left space-y-2">
                  <p className="font-bold flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" /> Instant Receipt Generation
                  </p>
                  <p className="font-bold flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" /> Transparent Fund Tracking
                  </p>
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