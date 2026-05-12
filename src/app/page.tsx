
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
import { Shield, Scale, Users, HeartHandshake, ArrowRight, Gavel, CheckCircle2, FileText, Heart, Globe } from 'lucide-react'
import { DonationDialog } from '@/components/donation-dialog'
import { Typewriter } from '@/components/typewriter'

function BackgroundDecor() {
  const libraryImg = PlaceHolderImages.find(img => img.id === 'legal-library')
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-human-rights')

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none opacity-40">
      <div className="absolute top-[5%] right-[10%] w-48 h-48 md:w-80 md:h-80 rounded-full overflow-hidden opacity-[0.04] blur-[2px] animate-float">
        <Image 
          src={libraryImg?.imageUrl || ''} 
          alt="Legal Heritage" 
          fill 
          className="object-cover grayscale"
        />
      </div>
      <div className="absolute bottom-[10%] left-[5%] w-56 h-56 md:w-96 md:h-96 rounded-[4rem] overflow-hidden opacity-[0.03] blur-[1px] animate-float animate-delay-500">
        <Image 
          src={heroImg?.imageUrl || ''} 
          alt="Humanitarian Unity" 
          fill 
          className="object-cover grayscale"
        />
      </div>

      <div className="absolute top-[12%] left-[8%] animate-float opacity-[0.07]">
        <Scale className="w-20 h-20 md:w-40 md:h-40 text-primary" />
      </div>
      <div className="absolute bottom-[8%] right-[12%] animate-float animate-delay-100 opacity-[0.06]">
        <Gavel className="w-16 h-16 md:w-32 md:h-32 text-primary" />
      </div>

      <div className="absolute top-[35%] right-[5%] animate-float animate-delay-200 opacity-[0.05]">
        <Shield className="w-24 h-24 md:w-56 md:h-56 text-accent" />
      </div>

      <div className="absolute top-[60%] left-[15%] animate-float animate-delay-300 opacity-[0.06]">
        <Users className="w-28 h-28 md:w-64 md:h-64 text-emerald-500" />
      </div>

      <div className="absolute bottom-[25%] left-[10%] animate-float animate-delay-500 opacity-[0.07]">
        <HeartHandshake className="w-24 h-24 md:w-48 md:h-48 text-emerald-500" />
      </div>
      <div className="absolute top-[10%] right-[25%] animate-pulse opacity-[0.05]">
        <Heart className="w-10 h-10 md:w-20 md:h-20 text-accent" />
      </div>

      <div className="absolute top-[50%] right-[20%] animate-float animate-delay-200 opacity-[0.04]">
        <Globe className="w-20 h-20 md:w-40 md:h-40 text-indigo-400" />
      </div>

      <div className="absolute bottom-[15%] right-[25%] animate-float animate-delay-300 opacity-[0.05]">
        <FileText className="w-16 h-16 md:w-32 md:h-32 text-primary" />
      </div>
      
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-accent/5 rounded-full blur-[150px] animate-glow"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-primary/5 rounded-full blur-[120px] animate-glow animate-delay-500"></div>
    </div>
  )
}

function IndianFlag() {
  return (
    <div className="relative mb-12 self-start ml-4 md:ml-12 h-12 md:h-24">
      {/* Ornate Flagpole - STATIONARY */}
      <div className="absolute -left-2 -top-4 bottom-[-20px] w-2 bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400 rounded-full shadow-2xl z-20">
        <div className="absolute -top-3 -left-1 w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-600 via-yellow-200 to-yellow-600 shadow-lg"></div>
      </div>

      {/* Flag Fabric - ANIMATED */}
      <div className="animate-flag-wave origin-left flex flex-col w-24 h-14 md:w-44 md:h-28 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.4)] shrink-0 overflow-hidden relative border-l border-white/20 z-10">
        {/* Colors */}
        <div className="h-1/3 bg-[#FF9933] relative"></div>
        <div className="h-1/3 bg-white flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-4 h-4 md:w-8 md:h-8 rounded-full border-[0.5px] border-[#000080]/60 flex items-center justify-center">
               <div className="w-0.5 h-0.5 bg-[#000080] rounded-full"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-[0.5px] h-2 md:h-4 bg-[#000080]/70" 
                      style={{ transform: `rotate(${i * 15}deg)` }}
                    />
                  ))}
               </div>
             </div>
          </div>
        </div>
        <div className="h-1/3 bg-[#138808]"></div>
        
        {/* Real Cloth Texturing */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-30 pointer-events-none"></div>
        
        {/* Complex Light & Shadow Layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 bg-[length:150%_100%] animate-flag-ripple pointer-events-none mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/40 to-white/10 bg-[length:200%_100%] animate-flag-ripple-alt pointer-events-none mix-blend-overlay"></div>
        
        {/* Highlight Layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-40 pointer-events-none"></div>
      </div>
    </div>
  )
}

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-human-rights')
  const logoImg = PlaceHolderImages.find(img => img.id === 'niti-logo')

  return (
    <main className="min-h-screen relative">
      <BackgroundDecor />
      <Navbar />
      
      <section className="relative min-h-screen flex flex-col items-center overflow-hidden pt-40 pb-24">
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroImg?.imageUrl || ''} 
            alt="Human Rights Unity" 
            fill 
            className="object-cover brightness-[0.25] scale-105 grayscale"
            priority
            data-ai-hint={heroImg?.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/80 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-white text-center">
          <div className="max-w-full space-y-12 animate-fade-in-up flex flex-col items-center">
            
            <IndianFlag />

            <div className="flex flex-col items-center gap-8 w-full">
              {logoImg && (
                <div className="relative w-28 h-28 md:w-48 md:h-48 mb-4 transition-transform hover:scale-105">
                  <Image 
                    src={logoImg.imageUrl} 
                    alt="Official Emblem" 
                    fill 
                    className="object-contain"
                  />
                </div>
              )}
              
              <div className="font-headline font-bold text-[7vw] sm:text-[6vw] md:text-[6.5vw] lg:text-[7vw] xl:text-[7.5vw] tracking-tighter leading-none whitespace-nowrap drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]">
                <Typewriter 
                  text="Human Rights Affairs Trust" 
                  speed={80} 
                  delay={400} 
                  className="bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent italic" 
                />
              </div>
              
              <div className="inline-flex items-center gap-3 bg-accent/30 text-accent px-6 py-2.5 md:px-8 md:py-3.5 rounded-full text-sm md:text-xl font-bold border border-accent/40 backdrop-blur-md">
                <Shield className="w-5 h-5 md:w-7 md:h-7" />
                <span>India's Trusted Human Rights Shield</span>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-headline font-bold leading-tight max-w-6xl mx-auto bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x py-8">
              Upholding Justice. Empowering Citizens.
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-200 font-body max-w-3xl leading-relaxed mx-auto px-4">
              Providing a robust shield against injustice through expert legal guidance, community support, and radical constitutional transparency.
            </p>
            
            <div className="flex flex-wrap gap-4 md:gap-8 pt-8 justify-center">
              <DonationDialog>
                <Button size="lg" className="bg-accent text-primary font-bold hover:bg-accent/90 px-10 py-8 md:px-14 md:py-10 rounded-xl md:rounded-2xl text-xl md:text-3xl shadow-2xl shadow-accent/30 transition-all hover:-translate-y-2">
                  Get Free Legal Aid <ArrowRight className="ml-3 w-6 h-6 md:w-8 md:h-8" />
                </Button>
              </DonationDialog>
              <Button size="lg" variant="outline" className="border-white/60 text-white bg-white/10 hover:bg-white/20 px-10 py-8 md:px-14 md:py-10 rounded-xl md:rounded-2xl text-xl md:text-3xl backdrop-blur-lg transition-all border-2 font-bold">
                Explore Rights Library
              </Button>
            </div>

            <div className="w-full pt-20 max-w-7xl mx-auto">
              <div className="glass-dark rounded-[3rem] md:rounded-[5rem] p-10 md:p-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-14 border-white/10">
                {[
                  { icon: <Gavel className="w-10 h-10 md:w-14 md:h-14 text-accent" />, count: "25k+", label: "Legal Cases Resolved" },
                  { icon: <Users className="w-10 h-10 md:w-14 md:h-14 text-emerald-400" />, count: "500+", label: "Expert Advocates" },
                  { icon: <Shield className="w-10 h-10 md:w-14 md:h-14 text-indigo-400" />, count: "100%", label: "Secure Data Handling" },
                  { icon: <HeartHandshake className="w-10 h-10 md:w-14 md:h-14 text-pink-400" />, count: "50+", label: "National Centers" }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-6 text-white hover:scale-110 transition-transform cursor-default justify-start sm:justify-center">
                    <div className="p-5 md:p-7 bg-white/10 rounded-2xl md:rounded-[2.5rem] shrink-0">{stat.icon}</div>
                    <div className="space-y-2 text-left">
                      <p className="text-4xl md:text-6xl font-bold font-headline">{stat.count}</p>
                      <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-slate-300 leading-tight">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="search" className="py-20 md:py-32 bg-white/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[120px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 md:mb-24 animate-fade-in-up">
            <h2 className="text-4xl md:text-7xl font-headline font-bold text-primary mb-6">AI-Enhanced <span className="text-accent">Rights</span> Explorer</h2>
            <p className="text-slate-500 max-w-3xl mx-auto text-lg md:text-2xl">Instantly navigate complex legal frameworks. Our AI highlights exactly what you need to know about your constitutional protections.</p>
          </div>
          <DocSearch />
        </div>
      </section>

      <ChairmanMessage />
      
      <KnowledgeCenter />

      <EmergencyHelpline />

      <IDCardShowcase />

      <section className="py-20 md:py-32 bg-slate-50/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-primary rounded-[3rem] md:rounded-[5rem] p-10 md:p-32 flex flex-col items-center text-center text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="max-w-4xl space-y-8 md:space-y-12 relative z-10">
              <div className="animate-float">
                <Scale className="w-16 h-16 md:w-28 md:h-28 text-accent mx-auto" />
              </div>
              <h2 className="text-4xl md:text-8xl font-headline font-bold">Support the Cause of <span className="text-accent italic">Justice</span></h2>
              <p className="text-lg md:text-2xl text-indigo-100 leading-relaxed">
                Your contributions help us provide free legal aid to the marginalized and run awareness campaigns across rural India. All donations are tax-exempt under 80G.
              </p>
              <div className="pt-8 flex flex-col md:flex-row gap-6 md:gap-10 justify-center">
                <DonationDialog>
                  <Button className="bg-accent text-primary font-bold hover:bg-accent/90 hover:scale-110 active:scale-95 transition-all px-12 py-8 md:px-16 md:py-10 rounded-xl md:rounded-[2rem] text-xl md:text-3xl shadow-2xl shadow-accent/30">
                    Donate Securely Now
                  </Button>
                </DonationDialog>
                <div className="flex flex-col items-center md:items-start justify-center text-left space-y-3">
                  <p className="font-bold flex items-center gap-3 text-emerald-400 text-base md:text-xl">
                    <CheckCircle2 className="w-5 h-5 md:w-7 md:h-7" /> Instant Receipt Generation
                  </p>
                  <p className="font-bold flex items-center gap-3 text-emerald-400 text-base md:text-xl">
                    <CheckCircle2 className="w-5 h-5 md:w-7 md:h-7" /> Transparent Fund Tracking
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
