
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
import { Shield, Scale, Users, HeartHandshake, ArrowRight, Gavel, CircleCheck, FileText, Heart } from 'lucide-react'
import { DonationDialog } from '@/components/donation-dialog'
import { Typewriter } from '@/components/typewriter'

function BackgroundDecor() {
  const libraryImg = PlaceHolderImages.find(img => img.id === 'legal-library')
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-human-rights')

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none opacity-30">
      {/* Floating Faint Images */}
      <div className="absolute top-[10%] right-[15%] w-64 h-64 rounded-full overflow-hidden opacity-[0.05] blur-[2px] animate-float">
        <Image 
          src={libraryImg?.imageUrl || ''} 
          alt="Legal Heritage" 
          fill 
          className="object-cover grayscale"
        />
      </div>
      <div className="absolute bottom-[15%] right-[25%] w-80 h-80 rounded-[3rem] overflow-hidden opacity-[0.04] blur-[1px] animate-float animate-delay-500">
        <Image 
          src={heroImg?.imageUrl || ''} 
          alt="Unity" 
          fill 
          className="object-cover sepia"
        />
      </div>

      {/* Animated Scale of Justice */}
      <div className="absolute top-[15%] left-[5%] animate-float opacity-[0.08]">
        <Scale className="w-48 h-48 text-primary" />
      </div>
      {/* Animated Shield */}
      <div className="absolute top-[40%] right-[8%] animate-float animate-delay-200 opacity-[0.06]">
        <Shield className="w-64 h-64 text-accent" />
      </div>
      {/* Animated Handshake */}
      <div className="absolute bottom-[20%] left-[10%] animate-float animate-delay-500 opacity-[0.08]">
        <HeartHandshake className="w-56 h-56 text-emerald-500" />
      </div>
      {/* Animated Document/Law */}
      <div className="absolute top-[70%] right-[15%] animate-float animate-delay-300 opacity-[0.05]">
        <FileText className="w-40 h-40 text-primary" />
      </div>
      {/* Subtle Heart */}
      <div className="absolute top-[10%] right-[25%] animate-pulse opacity-[0.06]">
        <Heart className="w-24 h-24 text-accent" />
      </div>
      {/* Another Gavel */}
      <div className="absolute bottom-[5%] right-[5%] animate-float animate-delay-100 opacity-[0.07]">
        <Gavel className="w-32 h-32 text-primary" />
      </div>
      
      {/* Soft Glows */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] animate-glow animate-delay-500"></div>
    </div>
  )
}

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-human-rights')

  return (
    <main className="min-h-screen relative">
      <BackgroundDecor />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroImg?.imageUrl || ''} 
            alt="Human Rights Unity" 
            fill 
            className="object-cover brightness-[0.2] scale-105"
            priority
            data-ai-hint={heroImg?.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/70 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-white">
          <div className="max-w-7xl space-y-12 animate-fade-in-up">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Indian Tricolor Flag */}
                <div className="flex flex-col w-20 h-12 rounded shadow-2xl border border-white/30 shrink-0 overflow-hidden">
                  <div className="h-1/3 bg-[#FF9933]"></div>
                  <div className="h-1/3 bg-white flex items-center justify-center relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-3 h-3 rounded-full border border-[#000080] flex items-center justify-center">
                         <div className="w-0.5 h-0.5 bg-[#000080] rounded-full"></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                            {[...Array(24)].map((_, i) => (
                              <div 
                                key={i} 
                                className="absolute w-px h-1 bg-[#000080]/40" 
                                style={{ transform: `rotate(${i * 15}deg)` }}
                              />
                            ))}
                         </div>
                       </div>
                    </div>
                  </div>
                  <div className="h-1/3 bg-[#138808]"></div>
                </div>
                
                <div className="font-headline font-bold text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tighter leading-none whitespace-nowrap overflow-visible drop-shadow-2xl">
                  <Typewriter 
                    text="Human Rights Affairs Trust" 
                    speed={80} 
                    delay={400} 
                    className="bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent italic" 
                  />
                </div>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-accent/30 text-accent px-5 py-2 rounded-full text-base font-bold border border-accent/40 backdrop-blur-md animate-pulse">
                <Shield className="w-5 h-5" />
                <span>India's Trusted Human Rights Shield</span>
              </div>
            </div>
            
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-headline font-bold leading-tight">
              Upholding <span className="text-accent italic">Justice</span> Empowering <span className="text-emerald-400">Citizens</span>.
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-200 font-body max-w-3xl leading-relaxed">
              We provide a robust shield against injustice through expert legal guidance, community-led support, and radical constitutional transparency.
            </p>
            
            <div className="flex flex-wrap gap-6 pt-6">
              <DonationDialog>
                <Button size="lg" className="bg-accent text-primary font-bold hover:bg-accent/90 px-10 py-8 rounded-2xl text-2xl shadow-2xl shadow-accent/20 transition-all hover:-translate-y-1">
                  Get Free Legal Aid <ArrowRight className="ml-2 w-8 h-8" />
                </Button>
              </DonationDialog>
              <Button size="lg" variant="outline" className="border-white/60 text-white bg-white/10 hover:bg-white/20 px-10 py-8 rounded-2xl text-2xl backdrop-blur-lg transition-all border-2 font-bold">
                Explore Rights Library
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full container px-4 hidden lg:block animate-fade-in-up animate-delay-500">
           <div className="glass-dark rounded-[3rem] p-10 grid grid-cols-4 gap-10">
             {[
               { icon: <Gavel className="w-8 h-8 text-accent" />, count: "25k+", label: "Legal Cases Resolved" },
               { icon: <Users className="w-8 h-8 text-emerald-400" />, count: "500+", label: "Expert Advocates" },
               { icon: <Shield className="w-8 h-8 text-indigo-400" />, count: "100%", label: "Secure Data" },
               { icon: <HeartHandshake className="w-8 h-8 text-pink-400" />, count: "50+", label: "National Centers" }
             ].map((stat, i) => (
               <div key={i} className="flex items-center gap-5 text-white hover:scale-105 transition-transform cursor-default">
                 <div className="p-4 bg-white/10 rounded-2xl">{stat.icon}</div>
                 <div>
                   <p className="text-3xl font-bold font-headline">{stat.count}</p>
                   <p className="text-xs font-bold uppercase tracking-widest text-slate-300">{stat.label}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* AI Search Section */}
      <section id="search" className="py-24 bg-white/50 backdrop-blur-sm relative overflow-hidden">
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
      <section className="py-24 bg-slate-50/50 backdrop-blur-sm relative overflow-hidden">
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
                    <CircleCheck className="w-5 h-5" /> Instant Receipt Generation
                  </p>
                  <p className="font-bold flex items-center gap-2 text-emerald-400">
                    <CircleCheck className="w-5 h-5" /> Transparent Fund Tracking
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
