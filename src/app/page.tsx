import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { ChairmanMessage } from '@/components/chairman-message'
import { StateChairpersonMessage } from '@/components/state-chairperson-message'
import { KnowledgeCenter } from '@/components/knowledge-center'
import { EmergencyHelpline } from '@/components/emergency-helpline'
import { IDCardShowcase } from '@/components/id-card-sample'
import { AIChat } from '@/components/ai-chat'
import { DocSearch } from '@/components/doc-search'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Shield, Scale, Users, HeartHandshake, ArrowRight, Gavel, CheckCircle2 } from 'lucide-react'
import { DonationDialog } from '@/components/donation-dialog'
import { Typewriter } from '@/components/typewriter'

function BackgroundDecor() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none opacity-30">
      <div className="absolute top-[12%] left-[8%] animate-float opacity-[0.05]">
        <Scale className="w-20 h-20 md:w-32 md:h-32 text-primary" />
      </div>
      <div className="absolute bottom-[8%] right-[12%] animate-float animate-delay-100 opacity-[0.04]">
        <Gavel className="w-16 h-16 md:w-24 md:h-24 text-primary" />
      </div>
      <div className="absolute top-[35%] right-[5%] animate-float animate-delay-200 opacity-[0.03]">
        <Shield className="w-24 h-24 md:w-40 md:h-40 text-accent" />
      </div>
      
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-accent/5 rounded-full blur-[150px] animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-primary/5 rounded-full blur-[120px] animate-delay-500"></div>
    </div>
  )
}

function IndianFlag() {
  return (
    <div className="relative mb-0 flex items-center justify-center">
      <div className="absolute inset-0 w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-accent/20 animate-ping opacity-10"></div>
      <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden shadow-xl border-2 border-white/50 animate-float bg-white">
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
        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/10 pointer-events-none"></div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <BackgroundDecor />
      <Navbar />
      
      <section className="relative min-h-screen flex flex-col items-center pt-28 md:pt-36 pb-20">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/Human%20R2.jpeg" 
            alt="Human Rights Heritage" 
            fill 
            className="object-cover brightness-[0.15] scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/80"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-white text-center">
          <div className="max-w-full space-y-4 md:space-y-6 flex flex-col items-center">
            
            <div className="flex flex-col items-center gap-4">
              <IndianFlag />
              <div className="relative w-full max-w-[300px] h-[150px] md:max-w-[500px] md:h-[250px] transition-all duration-700">
                <Image 
                  src="/niti2.png" 
                  alt="Niti Aayog" 
                  fill 
                  className="object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 w-full mt-2 md:mt-4">
              <p className="text-[#D4AF37] font-bold text-[10px] sm:text-sm md:text-base uppercase tracking-[0.25em] drop-shadow-lg animate-fade-in">
                Government of India ( Niti Aayog Registered )
              </p>
              <div className="font-headline font-bold text-xl sm:text-3xl md:text-5xl lg:text-6xl tracking-tight leading-tight min-h-[1.5em] flex justify-center items-center overflow-visible w-full">
                <span className="bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent italic block drop-shadow-sm px-2 pb-4">
                  <Typewriter 
                    text="Human Rights Affairs Trust" 
                    speed={80} 
                    delay={500}
                  />
                </span>
              </div>
            </div>
            
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-headline font-bold leading-tight bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x py-2 w-full drop-shadow-md">
              Upholding Justice. Empowering Citizens.
            </h1>
            
            <p className="text-xs sm:text-base md:text-lg text-slate-300 font-body max-w-2xl leading-relaxed mx-auto px-4 opacity-90">
              Providing a robust shield against injustice through expert legal guidance, community support, and constitutional transparency.
            </p>
            
            <div className="flex flex-wrap gap-4 md:gap-6 pt-8 justify-center">
              <DonationDialog>
                <Button size="lg" className="bg-accent text-primary font-bold hover:bg-accent/90 px-6 py-5 md:px-10 md:py-7 rounded-xl text-sm md:text-lg shadow-xl shadow-accent/20 transition-all hover:-translate-y-1">
                  Get Free Legal Aid <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </DonationDialog>
              <Link href="/#knowledge">
                <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/5 hover:bg-white/15 px-6 py-5 md:px-10 md:py-7 rounded-xl text-sm md:text-lg backdrop-blur-md transition-all border-2 font-bold">
                  Explore Rights Library
                </Button>
              </Link>
            </div>

            <div className="w-full pt-12 md:pt-20 max-w-4xl mx-auto">
              <div className="glass-dark rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 border-white/5">
                {[
                  { icon: <Scale className="w-4 h-4 md:w-5 md:h-5 text-accent" />, count: "2k+", label: "Legal Cases Resolved" },
                  { icon: <Users className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />, count: "50+", label: "Expert Advocates" },
                  { icon: <Shield className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />, count: "100%", label: "Secure Data Handling" },
                  { icon: <HeartHandshake className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />, count: "20+", label: "National Centers" }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 text-white hover:opacity-80 transition-opacity cursor-default justify-center">
                    <div className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl shrink-0">{stat.icon}</div>
                    <div className="space-y-0 text-center sm:text-left">
                      <p className="text-xs md:text-sm font-bold font-headline leading-none">{stat.count}</p>
                      <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400 leading-tight">
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
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-6xl font-headline font-bold text-primary mb-6">AI-Enhanced <span className="text-accent">Rights</span> Explorer</h2>
            <p className="text-slate-500 max-w-3xl mx-auto text-sm md:text-xl">Instantly navigate complex legal frameworks. Our AI highlights exactly what you need to know about your constitutional protections.</p>
          </div>
          <DocSearch />
        </div>
      </section>

      <ChairmanMessage />
      
      <StateChairpersonMessage />
      
      <KnowledgeCenter />

      <EmergencyHelpline />

      <IDCardShowcase />

      <section className="py-16 md:py-32 bg-slate-50/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-primary rounded-[2rem] md:rounded-[4rem] p-8 md:p-24 flex flex-col items-center text-center text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            
            <div className="max-w-4xl space-y-6 md:space-y-10 relative z-10">
              <div className="animate-float">
                <Scale className="w-12 h-12 md:w-24 md:h-24 text-accent mx-auto" />
              </div>
              <h2 className="text-3xl md:text-7xl font-headline font-bold">Support the Cause of <span className="text-accent italic">Justice</span></h2>
              <p className="text-sm md:text-xl text-indigo-100 leading-relaxed max-w-2xl mx-auto">
                Your contributions help us provide free legal aid to the marginalized and run awareness campaigns across rural India. All donations are tax-exempt under 80G.
              </p>
              
              <div className="pt-8 flex flex-col items-center space-y-8">
                {/* Donate Instantly Buttons */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-secondary text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 transition-transform cursor-default">
                    Donate Instantly
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                    <DonationDialog defaultAmount="100">
                      <Button variant="outline" className="border-accent/30 text-white hover:bg-accent hover:text-primary rounded-full px-6 md:px-8 font-bold h-10 md:h-12 transition-all hover:scale-105 active:scale-95 bg-white/5 backdrop-blur-sm">
                        ₹100
                      </Button>
                    </DonationDialog>
                    <DonationDialog defaultAmount="500">
                      <Button variant="outline" className="border-accent/30 text-white hover:bg-accent hover:text-primary rounded-full px-6 md:px-8 font-bold h-10 md:h-12 transition-all hover:scale-105 active:scale-95 bg-white/5 backdrop-blur-sm">
                        ₹500
                      </Button>
                    </DonationDialog>
                    <DonationDialog defaultAmount="1000">
                      <Button variant="outline" className="border-accent/30 text-white hover:bg-accent hover:text-primary rounded-full px-6 md:px-8 font-bold h-10 md:h-12 transition-all hover:scale-105 active:scale-95 bg-white/5 backdrop-blur-sm">
                        ₹1,000
                      </Button>
                    </DonationDialog>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center items-center">
                  <DonationDialog>
                    <Button className="bg-accent text-primary font-bold hover:bg-accent/90 hover:scale-105 active:scale-95 transition-all px-8 py-5 md:px-14 md:py-8 rounded-xl text-base md:text-2xl shadow-xl shadow-accent/20">
                      Donate Securely Now
                    </Button>
                  </DonationDialog>
                  <div className="flex flex-col items-start space-y-2">
                    <p className="font-bold flex items-center gap-2 text-emerald-400 text-[10px] md:text-lg">
                      <CheckCircle2 className="w-3 h-3 md:w-5 md:h-5" /> Instant Receipt Generation
                    </p>
                    <p className="font-bold flex items-center gap-2 text-emerald-400 text-[10px] md:text-lg">
                      <CheckCircle2 className="w-3 h-3 md:w-5 md:h-5" /> Transparent Fund Tracking
                    </p>
                  </div>
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
