import Image from 'next/image'
import Link from 'next/link'
import { ChairmanMessage } from '@/components/chairman-message'
import { StateChairpersonMessage } from '@/components/state-chairperson-message'
import { KnowledgeCenter } from '@/components/knowledge-center'
import { EmergencyHelpline } from '@/components/emergency-helpline'
import { IDCardShowcase } from '@/components/id-card-sample'
import { AIChat } from '@/components/ai-chat'
import { DocSearch } from '@/components/doc-search'
import { MemberGrievances } from '@/components/member-grievances'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Shield, Scale, Users, HeartHandshake, ArrowRight, Gavel, CheckCircle2, MessageSquareText, Building2 } from 'lucide-react'
import { DonationDialog } from '@/components/donation-dialog'
import { Typewriter } from '@/components/typewriter'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { RazorpayDonation } from '@/components/razorpay-donation'

function BackgroundDecor() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none opacity-30">
      <div className="absolute top-[12%] left-[8%] animate-float opacity-[0.05]">
        <Scale className="w-12 h-12 md:w-32 md:h-32 text-primary" />
      </div>
      <div className="absolute bottom-[8%] right-[12%] animate-float animate-delay-100 opacity-[0.04]">
        <Gavel className="w-10 h-10 md:w-24 md:h-24 text-primary" />
      </div>
      <div className="absolute top-[35%] right-[5%] animate-float animate-delay-200 opacity-[0.03]">
        <Shield className="w-16 h-16 md:w-40 md:h-40 text-accent" />
      </div>
      
      <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-accent/5 rounded-full blur-[80px] md:blur-[150px] animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] md:w-[500px] md:h-[500px] bg-primary/5 rounded-full blur-[60px] md:blur-[120px] animate-delay-500"></div>
    </div>
  )
}

function IndianFlag() {
  return (
    <div className="relative mb-0 flex items-center justify-center">
      <div className="absolute inset-0 w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-accent/20 animate-ping opacity-10"></div>
      <div className="relative w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden shadow-xl border-2 border-white/50 animate-float bg-white">
        <div className="h-1/3 bg-[#FF9933]"></div>
        <div className="h-1/3 bg-white flex items-center justify-center relative">
          <div className="w-2 h-2 md:w-4 md:h-4 rounded-full border-[0.5px] border-[#000080] flex items-center justify-center relative animate-[spin_10s_linear_infinite]">
            {[...Array(24)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-[0.1px] md:w-[0.2px] h-full bg-[#000080]/60" 
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
  const donationImg1 = PlaceHolderImages.find(img => img.id === 'donation-bg-1');
  const donationImg2 = PlaceHolderImages.find(img => img.id === 'donation-bg-2');

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <BackgroundDecor />
      
      <section className="relative min-h-[90vh] md:min-h-screen flex flex-col items-center pt-24 md:pt-28 pb-20 px-4">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/Human%20R2.jpeg" 
            alt="Human Rights Heritage" 
            fill 
            className="object-cover brightness-[0.25] scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/20 to-primary/60 dark:from-slate-950/70 dark:via-slate-950/50 dark:to-slate-950/80"></div>
        </div>

        {/* Institutional Branding - Aligned Left */}
        <div className="absolute top-8 left-8 z-20 hidden xl:flex items-center gap-6 animate-in fade-in slide-in-from-left-4 duration-1000">
          <div className="relative w-24 h-24 transition-transform hover:scale-105">
            <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
          </div>
          <div className="flex flex-col text-white">
            <span className="font-headline font-bold text-3xl leading-none tracking-tight">HRAT</span>
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Justice Shield</span>
            <span className="text-[12px] font-bold text-white mt-1 border-t border-white/10 pt-1">মানবাধিকার সংগঠন</span>
          </div>
        </div>

        <div className="container mx-auto px-0 md:px-4 relative z-10 text-white text-center">
          <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 flex flex-col items-center">
            
            <div className="flex flex-col items-center gap-4">
              <IndianFlag />
              <div className="relative w-full max-w-[150px] h-[80px] sm:max-w-[200px] sm:h-[100px] md:max-w-[500px] md:h-[250px] transition-all duration-700">
                <Image 
                  src="/niti2.png" 
                  alt="Niti Aayog" 
                  fill 
                  className="object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 w-full mt-2 md:mt-4">
              <p className="text-[#D4AF37] font-bold text-[8px] sm:text-xs md:text-base uppercase tracking-[0.2em] md:tracking-[0.25em] drop-shadow-lg animate-fade-in">
                Government of India ( Niti Aayog Registered )
              </p>
              <div className="font-headline font-bold text-lg sm:text-3xl md:text-5xl lg:text-6xl tracking-tight leading-tight min-h-[1.5em] flex justify-center items-center overflow-visible w-full">
                <span className="bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent italic block drop-shadow-sm px-2 pb-4 text-center">
                  <Typewriter 
                    text="Human Rights Affairs Trust" 
                    speed={80} 
                    delay={500}
                  />
                </span>
              </div>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-headline font-bold leading-tight bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x py-2 w-full drop-shadow-md">
              Upholding Justice. Empowering Citizens.
            </h1>
            
            <p className="text-[10px] sm:text-sm md:text-lg text-slate-300 font-body max-w-2xl leading-relaxed mx-auto px-4 opacity-90">
              Providing a robust shield against injustice through expert legal guidance, community support, and constitutional transparency.
            </p>
            
            <div className="flex flex-wrap gap-3 md:gap-6 pt-6 md:pt-8 justify-center">
              <Link href="/legal-aid" className="w-full sm:w-auto">
                <Button size="lg" className="bg-accent text-white font-bold hover:bg-secondary hover:text-white px-5 py-4 md:px-10 md:py-7 rounded-xl text-xs md:text-lg shadow-xl shadow-accent/20 transition-all hover:-translate-y-1 h-auto whitespace-normal w-full max-w-xs mx-auto">
                  Legal Aid Cell <ArrowRight className="ml-2 w-3 h-3 md:w-5 md:h-5 shrink-0" />
                </Button>
              </Link>
              <Link href="/#knowledge" className="w-full sm:w-auto">
                <Button size="lg" className="bg-secondary text-white font-bold hover:bg-accent px-5 py-4 md:px-10 md:py-7 rounded-xl text-xs md:text-lg transition-all shadow-xl shadow-secondary/10 hover:scale-105 active:scale-95 hover:shadow-2xl hover:shadow-accent/20 h-auto w-full sm:w-auto">
                  Rights Library
                </Button>
              </Link>
            </div>

            <div className="w-full pt-10 md:pt-20 max-w-4xl mx-auto">
              <div className="glass-dark rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 border-white/5">
                {[
                  { icon: <Scale className="w-4 h-4 md:w-5 md:h-5 text-accent" />, count: "2k+", label: "Cases Resolved" },
                  { icon: <Users className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />, count: "50+", label: "Advocates" },
                  { icon: <Shield className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />, count: "100%", label: "Secure Vault" },
                  { icon: <HeartHandshake className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />, count: "20+", label: "Centers" }
                ].map((stat, i) => (
                  <div className="flex flex-col items-center gap-1.5 md:gap-3 text-white hover:opacity-80 transition-opacity cursor-default justify-center" key={i}>
                    <div className="p-1.5 md:p-3 bg-white/5 rounded-lg md:rounded-xl shrink-0">{stat.icon}</div>
                    <div className="space-y-0 text-center">
                      <p className="text-[10px] md:text-sm font-bold font-headline leading-none">{stat.count}</p>
                      <p className="text-[6px] md:text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400 leading-tight">
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

      <section id="search" className="py-16 md:py-32 bg-white/50 backdrop-blur-sm dark:bg-slate-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[120px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10 md:mb-20">
            <h2 className="text-2xl md:text-6xl font-headline font-bold text-primary mb-4 md:mb-6">AI-Enhanced <span className="text-accent">Rights</span> Explorer</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-xs md:text-xl">Instantly navigate complex legal frameworks. Our AI highlights exactly what you need to know about your constitutional protections.</p>
          </div>
          <DocSearch />
        </div>
      </section>

      <ChairmanMessage />
      
      <StateChairpersonMessage />
      
      <KnowledgeCenter />

      <EmergencyHelpline />

      <IDCardShowcase />

      <section id="grievances" className="py-16 md:py-32 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 px-4">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border border-accent/30 mb-4 md:mb-6">
              <MessageSquareText className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>Institutional Oversight</span>
            </div>
            <h2 className="text-3xl md:text-6xl font-headline font-bold text-primary dark:text-white mb-2 md:mb-4">File a Formal <span className="text-accent italic">Grievance</span></h2>
            <p className="text-primary dark:text-white font-bold text-sm md:text-base mb-6">কেবলমাত্র অর্গানাইজেশনের সদস্যদের অভিযোগ জানানোর নিজস্ব ব্যবস্থা</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg">
              Submit your concerns directly to our governance cell. Your submission is protected by strict privacy protocols and will be reviewed by the central administration.
            </p>
          </div>
          <MemberGrievances />
        </div>
      </section>

      <section className="py-16 md:py-32 bg-slate-50/50 backdrop-blur-sm dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-slate-950 rounded-[2rem] md:rounded-[4rem] p-6 md:p-24 flex flex-col items-center text-center text-white shadow-2xl relative overflow-hidden group">
            
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-44 h-60 md:w-64 md:h-80 hidden xl:block animate-float pointer-events-none z-10 opacity-30 group-hover:opacity-100 transition-opacity">
              <div className="relative w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 md:border-8 border-white shadow-2xl rotate-[-6deg] bg-slate-200">
                <Image 
                  src={donationImg1?.imageUrl || "/female.jpeg"} 
                  alt="Inspiration Female" 
                  fill 
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
              </div>
            </div>

            <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-44 h-60 md:w-64 md:h-80 hidden xl:block animate-float animate-delay-500 pointer-events-none z-10 opacity-30 group-hover:opacity-100 transition-opacity">
              <div className="relative w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 md:border-8 border-white shadow-2xl rotate-[6deg] bg-slate-200">
                <Image 
                  src={donationImg2?.imageUrl || "/child.jpeg"} 
                  alt="Inspiration Child" 
                  fill 
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
              </div>
            </div>

            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
              <Image 
                src={donationImg1?.imageUrl || "/female.jpeg"} 
                alt="Donation Background" 
                fill 
                className="object-cover grayscale"
              />
              <div className="absolute inset-0 bg-slate-900/90"></div>
            </div>

            <div className="max-w-4xl space-y-6 md:space-y-10 relative z-30 px-2 md:px-10">
              <div className="flex items-center justify-center gap-4 md:gap-16 animate-float">
                <div className="relative w-12 h-14 md:w-28 md:h-36 rounded-2xl md:rounded-[2rem] overflow-hidden border-2 md:border-4 border-white/20 rotate-[-8deg] shadow-2xl hidden sm:block shrink-0">
                  <Image 
                    src={donationImg1?.imageUrl || "/female.jpeg"} 
                    alt="Support" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <Scale className="w-8 h-8 md:w-20 md:h-20 text-accent shrink-0" />
                <div className="relative w-12 h-14 md:w-28 md:h-36 rounded-2xl md:rounded-[2rem] overflow-hidden border-2 md:border-4 border-white/20 rotate-[8deg] shadow-2xl hidden sm:block shrink-0">
                  <Image 
                    src={donationImg2?.imageUrl || "/child.jpeg"} 
                    alt="Support" 
                    fill 
                    className="object-cover"
                  />
                </div>
              </div>

              <h2 className="text-2xl md:text-7xl font-headline font-bold leading-tight">Support the Cause of <span className="text-accent italic">Justice</span></h2>
              <p className="text-xs md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium">
                Your contributions help us provide free legal aid to the marginalized and run awareness campaigns across rural India. All donations are tax-exempt under 80G.
              </p>

              <div className="mt-6 md:mt-10 bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 max-w-md mx-auto shadow-2xl relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-emerald-500/20 p-2.5 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4 md:mb-6 flex items-center gap-2">
                     Official Bank Details
                  </h3>
                  <div className="w-full space-y-3 md:space-y-4 font-body">
                    <div className="text-center pb-3 md:pb-4 border-b border-white/5">
                      <p className="text-base md:text-xl font-bold text-white leading-tight">State Bank of India</p>
                      <p className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mangal Deep Island Khaki Estate Branch</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:gap-3">
                      <div className="flex justify-between items-center bg-black/20 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
                         <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">IFS Code</span>
                         <span className="font-mono text-xs md:text-lg font-bold text-accent">SBIN0064519</span>
                      </div>
                      <div className="flex justify-between items-center bg-black/20 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
                         <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account No</span>
                         <span className="font-mono text-xs md:text-lg font-bold text-accent">44784606147</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 md:pt-8 flex flex-col items-center space-y-6 md:space-y-8">
                <div className="flex flex-col items-center space-y-3 md:space-y-4">
                  <div className="bg-secondary text-white px-6 py-2 md:px-8 md:py-3 rounded-full font-bold text-[10px] md:text-sm uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 transition-transform cursor-default border-2 border-white/10">
                    Donate Instantly
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                    <DonationDialog defaultAmount="100" initialStep="qr">
                      <Button variant="outline" className="border-accent/30 text-white hover:bg-secondary hover:text-white rounded-full px-5 md:px-8 font-bold h-9 md:h-12 transition-all hover:scale-105 active:scale-95 bg-white/5 backdrop-blur-sm text-[10px] md:text-xs">
                        ₹100
                      </Button>
                    </DonationDialog>
                    <DonationDialog defaultAmount="500" initialStep="qr">
                      <Button variant="outline" className="border-accent/30 text-white hover:bg-secondary hover:text-white rounded-full px-5 md:px-8 font-bold h-9 md:h-12 transition-all hover:scale-105 active:scale-95 bg-white/5 backdrop-blur-sm text-[10px] md:text-xs">
                        ₹500
                      </Button>
                    </DonationDialog>
                    <DonationDialog defaultAmount="1000" initialStep="qr">
                      <Button variant="outline" className="border-accent/30 text-white hover:bg-secondary hover:text-white rounded-full px-5 md:px-8 font-bold h-9 md:h-12 transition-all hover:scale-105 active:scale-95 bg-white/5 backdrop-blur-sm text-[10px] md:text-xs">
                        ₹1,000
                      </Button>
                    </DonationDialog>
                  </div>
                </div>

                <RazorpayDonation />

                <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center items-center w-full px-4">
                  <DonationDialog>
                    <Button className="bg-accent text-white font-bold hover:bg-secondary hover:text-white hover:scale-105 active:scale-95 transition-all px-6 py-5 md:px-14 md:py-8 rounded-xl text-sm md:text-2xl shadow-xl shadow-accent/20 w-full md:w-auto h-auto">
                      Donate Securely Now
                    </Button>
                  </DonationDialog>
                  <div className="flex flex-col items-center md:items-start space-y-1 md:space-y-2">
                    <p className="font-bold flex items-center gap-2 text-emerald-400 text-[9px] md:text-lg">
                      <CheckCircle2 className="w-3 h-3 md:w-5 md:h-5" /> Instant Receipt Generation
                    </p>
                    <p className="font-bold flex items-center gap-2 text-emerald-400 text-[9px] md:text-lg">
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
