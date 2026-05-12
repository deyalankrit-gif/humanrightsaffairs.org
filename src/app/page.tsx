
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
    <div className="animate-flag-wave origin-left relative mb-8 self-start ml-4 md:ml-8">
      <div className="flex flex-col w-16 h-10 md:w-28 md:h-16 rounded-sm shadow-2xl shrink-0 overflow-hidden relative">
        <div className="h-1/3 bg-[#FF9933]"></div>
        <div className="h-1/3 bg-white flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-3 h-3 md:w-5 md:h-5 rounded-full border-[0.5px] border-[#000080] flex items-center justify-center">
               <div className="w-0.5 h-0.5 bg-[#000080] rounded-full"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-[0.5px] h-1.5 md:h-2 bg-[#000080]/80" 
                      style={{ transform: `rotate(${i * 15}deg)` }}
                    />
                  ))}
               </div>
             </div>
          </div>
        </div>
        <div className="h-1/3 bg-[#138808]"></div>
        
        {/* Cloth ripples and shadows */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-white/20 to-black/20 bg-[length:200%_100%] animate-flag-ripple pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent bg-[length:150%_100%] animate-flag-ripple-alt pointer-events-none mix-blend-multiply opacity-30"></div>
      </div>
      {/* Flagpole */}
      <div className="absolute -left-1.5 -top-2 bottom-[-10px] w-1.5 bg-gradient-to-r from-slate-600 via-slate-300 to-slate-500 rounded-full shadow-lg"></div>
    </div>
  )
}

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-human-rights')
  const nitiLogo = PlaceHolderImages.find(img => img.id === 'niti-logo')

  return (
    <main className="min-h-screen relative">
      <BackgroundDecor />
      <Navbar />
      
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-32 pb-24">
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
          <div className="max-w-full space-y-10 animate-fade-in-up flex flex-col items-center">
            <div className="flex flex-col items-center gap-6 w-full">
              <IndianFlag />
              
              {nitiLogo && (
                <div className="relative w-32 h-32 md:w-56 md:h-56 transition-transform hover:scale-105 duration-700 mx-auto">
                  <Image 
                    src="/Niti.png" 
                    alt="Niti Aayog Registered Emblem" 
                    fill 
                    className="object-contain mix-blend-screen opacity-90"
                  />
                </div>
              )}
              
              <div className="font-headline font-bold text-[5.5vw] sm:text-[4.5vw] md:text-[5vw] lg:text-[5.5vw] xl:text-[6vw] tracking-tighter leading-none whitespace-nowrap overflow-visible drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] mx-auto">
                <Typewriter 
                  text="Human Rights Affairs Trust" 
                  speed={80} 
                  delay={400} 
                  className="bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent italic" 
                />
              </div>
              
              <div className="inline-flex items-center gap-2 bg-accent/30 text-accent px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-lg font-bold border border-accent/40 backdrop-blur-md mx-auto">
                <Shield className="w-4 h-4 md:w-6 md:h-6" />
                <span>India's Trusted Human Rights Shield</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold leading-tight max-w-5xl mx-auto bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x py-2">
              Upholding Justice. Empowering Citizens.
            </h1>
            
            <p className="text-base md:text-xl text-slate-200 font-body max-w-2xl leading-relaxed mx-auto">
              Providing a robust shield against injustice through expert legal guidance, community support, and radical constitutional transparency.
            </p>
            
            <div className="flex flex-wrap gap-4 md:gap-6 pt-6 justify-center">
              <DonationDialog>
                <Button size="lg" className="bg-accent text-primary font-bold hover:bg-accent/90 px-8 py-7 md:px-12 md:py-9 rounded-xl md:rounded-2xl text-lg md:text-2xl shadow-2xl shadow-accent/20 transition-all hover:-translate-y-1">
                  Get Free Legal Aid <ArrowRight className="ml-2 w-5 h-5 md:w-7 md:h-7" />
                </Button>
              </DonationDialog>
              <Button size="lg" variant="outline" className="border-white/60 text-white bg-white/10 hover:bg-white/20 px-8 py-7 md:px-12 md:py-9 rounded-xl md:rounded-2xl text-lg md:text-2xl backdrop-blur-lg transition-all border-2 font-bold">
                Explore Rights Library
              </Button>
            </div>

            <div className="w-full pt-12 max-w-6xl mx-auto">
              <div className="glass-dark rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 border-white/10 overflow-hidden">
                {[
                  { icon: <Gavel className="w-6 h-6 md:w-10 md:h-10 text-accent" />, count: "25k+", label: "Legal Cases Resolved" },
                  { icon: <Users className="w-6 h-6 md:w-10 md:h-10 text-emerald-400" />, count: "500+", label: "Expert Advocates" },
                  { icon: <Shield className="w-6 h-6 md:w-10 md:h-10 text-indigo-400" />, count: "100%", label: "Secure Data Handling" },
                  { icon: <HeartHandshake className="w-6 h-6 md:w-10 md:h-10 text-pink-400" />, count: "50+", label: "National Centers" }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-white hover:scale-105 transition-transform cursor-default justify-center">
                    <div className="p-3 md:p-5 bg-white/10 rounded-xl md:rounded-3xl shrink-0">{stat.icon}</div>
                    <div className="space-y-1 text-center md:text-left">
                      <p className="text-xl md:text-3xl font-bold font-headline">{stat.count}</p>
                      <p className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-slate-300 leading-tight">
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

      <section id="search" className="py-16 md:py-24 bg-white/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-4">AI-Enhanced <span className="text-accent">Rights</span> Explorer</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-lg">Instantly navigate complex legal frameworks. Our AI highlights exactly what you need to know about your constitutional protections.</p>
          </div>
          <DocSearch />
        </div>
      </section>

      <ChairmanMessage />
      
      <KnowledgeCenter />

      <EmergencyHelpline />

      <IDCardShowcase />

      <section className="py-16 md:py-24 bg-slate-50/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-primary rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 flex flex-col items-center text-center text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="max-w-3xl space-y-6 md:space-y-8 relative z-10">
              <div className="animate-float">
                <Scale className="w-12 h-12 md:w-20 md:h-20 text-accent mx-auto" />
              </div>
              <h2 className="text-3xl md:text-6xl font-headline font-bold">Support the Cause of <span className="text-accent italic">Justice</span></h2>
              <p className="text-base md:text-xl text-indigo-100 leading-relaxed">
                Your contributions help us provide free legal aid to the marginalized and run awareness campaigns across rural India. All donations are tax-exempt under 80G.
              </p>
              <div className="pt-4 flex flex-col md:flex-row gap-4 md:gap-6 justify-center">
                <DonationDialog>
                  <Button className="bg-accent text-primary font-bold hover:bg-accent/90 hover:scale-105 active:scale-95 transition-all px-8 py-6 md:px-12 md:py-8 rounded-xl md:rounded-2xl text-lg md:text-xl shadow-xl shadow-accent/20">
                    Donate Securely Now
                  </Button>
                </DonationDialog>
                <div className="flex flex-col items-center md:items-start justify-center text-left space-y-2">
                  <p className="font-bold flex items-center gap-2 text-emerald-400 text-sm md:text-base">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> Instant Receipt Generation
                  </p>
                  <p className="font-bold flex items-center gap-2 text-emerald-400 text-sm md:text-base">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> Transparent Fund Tracking
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
