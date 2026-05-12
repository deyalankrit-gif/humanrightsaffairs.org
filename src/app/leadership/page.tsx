
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Users, Shield, Award, ChevronDown } from 'lucide-react'

type Leader = {
  name: string
  title: string
  imageId: string
  description?: string
}

const centralTeam: Leader[] = [
  { name: "Dhritimaan Dey", title: "Central Chairman & Founder", imageId: "chairman-photo" },
  { name: "Adv. Meera Deshmukh", title: "National Legal Advisor", imageId: "leader-1" },
  { name: "Dr. Arvind Swamy", title: "General Secretary", imageId: "leader-2" },
]

const stateTeams = [
  {
    state: "West Bengal",
    leaders: [
      { name: "Vikram Malhotra", title: "State Chairman", imageId: "leader-3" },
      { name: "Sonia Gandhi", title: "Vice Chairperson", imageId: "leader-4" }
    ]
  },
  {
    state: "Maharashtra",
    leaders: [
      { name: "Rajesh Patil", title: "State Chairman", imageId: "leader-1" },
      { name: "Amruta Fadnavis", title: "Legal Head", imageId: "leader-2" }
    ]
  }
]

const districtTeams = [
  {
    district: "Kolkata",
    leaders: [{ name: "Anil Kapoor", title: "District Chairman", imageId: "leader-3" }]
  },
  {
    district: "Mumbai Suburban",
    leaders: [{ name: "Sunil Shetty", title: "District Chairman", imageId: "leader-4" }]
  },
  {
    district: "Pune City",
    leaders: [{ name: "Prakash Jha", title: "District Chairman", imageId: "leader-1" }]
  }
]

function LeaderCard({ leader, variant = "default" }: { leader: Leader, variant?: "large" | "default" | "small" }) {
  const img = PlaceHolderImages.find(i => i.id === leader.imageId)
  
  const sizeClasses = {
    large: "w-64 h-80",
    default: "w-48 h-60",
    small: "w-32 h-40"
  }

  return (
    <div className="flex flex-col items-center group">
      <div className={`relative ${sizeClasses[variant]} rounded-2xl overflow-hidden shadow-xl border-4 border-white group-hover:border-accent transition-all duration-500`}>
        <Image 
          src={img?.imageUrl || ''} 
          alt={leader.name} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          data-ai-hint={img?.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="mt-4 text-center">
        <h4 className={`font-headline font-bold text-primary ${variant === 'large' ? 'text-xl' : 'text-lg'}`}>{leader.name}</h4>
        <p className="text-accent text-xs font-bold uppercase tracking-widest">{leader.title}</p>
      </div>
    </div>
  )
}

export default function LeadershipPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Header */}
      <section className="pt-40 pb-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-bold border border-accent/30 mb-6">
            <Users className="w-4 h-4" />
            <span>Organizational Hierarchy</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">Our <span className="text-accent italic">Leadership</span> Tree</h1>
          <p className="text-indigo-100 max-w-2xl mx-auto text-lg">
            A unified force of dedicated human rights defenders operating across national, state, and district levels to ensure justice reaches every corner.
          </p>
        </div>
      </section>

      {/* Hierarchy Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          
          {/* Level 1: Central */}
          <div className="flex flex-col items-center mb-24">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.3em] mb-12">
              <Award className="w-6 h-6 text-accent" />
              <span>Central Governance</span>
            </div>
            <div className="flex flex-wrap justify-center gap-12">
              {centralTeam.map((leader, i) => (
                <div key={i} className="relative">
                  <LeaderCard leader={leader} variant={i === 0 ? "large" : "default"} />
                  {i === 0 && (
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 hidden md:block">
                      <ChevronDown className="w-8 h-8 text-slate-300 animate-bounce" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Visual Connector Line */}
          <div className="hidden md:block w-px h-24 bg-gradient-to-b from-slate-300 to-transparent mx-auto -mt-12 mb-12"></div>

          {/* Level 2: State */}
          <div className="space-y-24">
            <div className="flex items-center justify-center gap-2 text-primary font-bold uppercase tracking-[0.3em] mb-12">
              <Shield className="w-6 h-6 text-emerald-500" />
              <span>State Jurisdictions</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {stateTeams.map((team, i) => (
                <div key={i} className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center">
                  <div className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full font-bold text-sm mb-12">
                    {team.state} Chapter
                  </div>
                  <div className="flex flex-wrap justify-center gap-8">
                    {team.leaders.map((leader, j) => (
                      <LeaderCard key={j} leader={leader} />
                    ))}
                  </div>
                  {/* District Connectors */}
                  <div className="w-px h-12 bg-slate-200 mt-12"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Level 3: District */}
          <div className="mt-24">
            <div className="flex items-center justify-center gap-2 text-primary font-bold uppercase tracking-[0.3em] mb-12">
              <div className="w-6 h-6 rounded-full border-2 border-indigo-400 flex items-center justify-center text-[10px]">D</div>
              <span>District Divisions</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {districtTeams.map((team, i) => (
                <div key={i} className="bg-slate-100/50 p-6 rounded-[2rem] border border-white flex flex-col items-center hover:bg-white hover:shadow-lg transition-all">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{team.district}</p>
                  {team.leaders.map((leader, j) => (
                    <LeaderCard key={j} leader={leader} variant="small" />
                  ))}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  )
}
