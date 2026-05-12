
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
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-primary/5 rounded-full blur-[120px] animate-delay-500"></div>
    </div>
  )
}

function IndianFlag() {
  return (
    <div className="relative mb-2 flex items-center justify-center">
      <div className="absolute inset-0 w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-accent/30 animate-ping opacity-20"></div>
      <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden shadow-2xl border-2 border-white/40 animate-float">
        <div className="h-1/3 bg-[#FF9933]"></div>
        <div className="h-1/3 bg-white flex items-center justify-center relative">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-[0.5px] border-[#000080] flex items-center justify-center relative animate-[spin_10s_linear_infinite]">
            {[...Array(24)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-[0.2px] h-full bg-[#000080]/60" 
                style={{ transform: `rotate(${i * 15}deg)` }}
              />
            ))}
            <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-[#000080] rounded-full"></div>
          </div>
        </div>
        <div className="h-1/3 bg-[#138808]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none"></div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <BackgroundDecor />
      <Navbar />
      
      <section className="relative min-h-screen flex flex-col items-center pt-24 pb-20">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/Human R2.jpeg" 
            alt="Human Rights Heritage" 
            fill 
            className="object-cover brightness-[0.2] scale-105 grayscale"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/80 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-white text-center">
          <div className="max-w-full space-y-4 md:space-y-6 flex flex-col items-center">
            
            <IndianFlag />

            <div className="flex flex-col items-center gap-4 w-full">
              {/* Niti Aayog Registered Satyamev Jayate Image Stack */}
              <div className="flex flex-col items-center group transition-transform hover:scale-[1.02] duration-500">
                <div className="relative w-40 h-52 md:w-64 md:h-80">
                  <Image 
                    src="/Niti3.png" 
                    alt="Niti Aayog Registered Emblem" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col items-center -mt-8 md:-mt-12 space-y-0.5 md:space-y-1">
                  <p className="text-white/90 text-sm md:text-xl font-body tracking-tight font-medium">Niti Aayog Registrated</p>
                  <p className="text-white/60 text-[9px] md:text-xs font-normal opacity-80">National Informatics Centre(NIC)</p>
                  <p className="text-white/60 text-[9px] md:text-xs font-normal opacity-80">Government of India</p>
                </div>
              </div>
              
              {/* Organization Title with Typewriter effect */}
              <div className="font-headline font-bold text-lg sm:text-2xl md:text-3xl lg:text-4xl tracking-tight leading-tight drop-shadow-2xl min-h-[1.2em] flex justify-center items-center mt-4">
                <span className="bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent italic block">
                  <Typewriter 
                    text="Human Rights Affairs Trust" 
                    speed={80} 
                    delay={500}
                  />
                </span>
              </div>
            </div>
            
            {/* Tagline - Large, One Line, Animated Gradient */}
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl font-headline font-bold leading-tight md:whitespace-nowrap bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x py-2 md:py-4 w-full">
              Upholding Justice. Empowering Citizens.
            </h1>
            
            <p className="text-sm sm:text-lg md:text-xl text-slate-300 font-body max-w-4xl leading-relaxed mx-auto px-4 opacity-90">
              Providing a robust shield against injustice through expert legal guidance, community support, and radical constitutional transparency.
            </p>
            
            <div className="flex flex-wrap gap-4 md:gap-6 pt-6 md:pt-10 justify-center">
              <DonationDialog>
                <Button size="lg" className="bg-accent text-primary font-bold hover:bg-accent/90 px-6 py-6 md:px-12 md:py-8 rounded-xl text-base md:text-xl shadow-2xl shadow-accent/30 transition-all hover:-translate-y-1">
                  Get Free Legal Aid <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </DonationDialog>
              <Button size="lg" variant="outline" className="border-white/60 text-white bg-white/10 hover:bg-white/20 px-6 py-6 md:px-12 md:py-8 rounded-xl text-base md:text-xl backdrop-blur-lg transition-all border-2 font-bold">
                Explore Rights Library
              </Button>
            </div>

            {/* Statistics Dashboard - Small Text labels */}
            <div className="w-full pt-12 md:pt-16 max-w-5xl mx-auto">
              <div className="glass-dark rounded-[1.5rem] md:rounded-[3rem] p-4 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 border-white/10">
                {[
                  { icon: <Gavel className="w-5 h-5 md:w-8 md:h-8 text-accent" />, count: "25k+", label: "Legal Cases Resolved" },
                  { icon: <Users className="w-5 h-5 md:w-8 md:h-8 text-emerald-400" />, count: "500+", label: "Expert Advocates" },
                  { icon: <Shield className="w-5 h-5 md:w-8 md:h-8 text-indigo-400" />, count: "100%", label: "Secure Data Handling" },
                  { icon: <HeartHandshake className="w-5 h-5 md:w-8 md:h-8 text-pink-400" />, count: "50+", label: "National Centers" }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-center gap-2 md:gap-4 text-white hover:scale-105 transition-transform cursor-default justify-center">
                    <div className="p-2 md:p-4 bg-white/10 rounded-lg md:rounded-2xl shrink-0">{stat.icon}</div>
                    <div className="space-y-0 text-center sm:text-left">
                      <p className="text-sm md:text-base font-bold font-headline">{stat.count}</p>
                      <p className="text-[7px] md:text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 leading-tight">
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
          <div className="text-center mb-12 md:mb-24">
            <h2 className="text-3xl md:text-7xl font-headline font-bold text-primary mb-6">AI-Enhanced <span className="text-accent">Rights</span> Explorer</h2>
            <p className="text-slate-500 max-w-3xl mx-auto text-base md:text-2xl">Instantly navigate complex legal frameworks. Our AI highlights exactly what you need to know about your constitutional protections.</p>
          </div>
          <DocSearch />
        </div>
      </section>

      <ChairmanMessage />
      
      <KnowledgeCenter />

      <EmergencyHelpline />

      <IDCardShowcase />

      <section className="py-16 md:py-32 bg-slate-50/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-primary rounded-[2rem] md:rounded-[5rem] p-8 md:p-32 flex flex-col items-center text-center text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="max-w-4xl space-y-8 md:space-y-12 relative z-10">
              <div className="animate-float">
                <Scale className="w-12 h-12 md:w-28 md:h-28 text-accent mx-auto" />
              </div>
              <h2 className="text-3xl md:text-8xl font-headline font-bold">Support the Cause of <span className="text-accent italic">Justice</span></h2>
              <p className="text-base md:text-2xl text-indigo-100 leading-relaxed">
                Your contributions help us provide free legal aid to the marginalized and run awareness campaigns across rural India. All donations are tax-exempt under 80G.
              </p>
              <div className="pt-8 flex flex-col md:flex-row gap-6 md:gap-10 justify-center">
                <DonationDialog>
                  <Button className="bg-accent text-primary font-bold hover:bg-accent/90 hover:scale-110 active:scale-95 transition-all px-10 py-6 md:px-16 md:py-10 rounded-xl md:rounded-[2rem] text-lg md:text-3xl shadow-2xl shadow-accent/30">
                    Donate Securely Now
                  </Button>
                </DonationDialog>
                <div className="flex flex-col items-center md:items-start justify-center text-left space-y-2 md:space-y-3">
                  <p className="font-bold flex items-center gap-2 md:gap-3 text-emerald-400 text-sm md:text-xl">
                    <CheckCircle2 className="w-4 h-4 md:w-7 md:h-7" /> Instant Receipt Generation
                  </p>
                  <p className="font-bold flex items-center gap-2 md:gap-3 text-emerald-400 text-sm md:text-xl">
                    <CheckCircle2 className="w-4 h-4 md:w-7 md:h-7" /> Transparent Fund Tracking
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
