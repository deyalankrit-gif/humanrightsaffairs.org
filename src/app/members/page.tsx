"use client"

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Search, MapPin, BadgeCheck, User, Users, Briefcase, Hash, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Member = {
  id: string
  name: string
  designation: string
  jurisdiction: string
  level: "National" | "State" | "District"
  stateName?: string
  districtName?: string
  imageId: string
  gender: 'male' | 'female'
}

const chapters = [
  "West Bengal", "Tripura Chapter", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand"
]

const chapterToDistricts: Record<string, string[]> = {
  "West Bengal": [
    "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur",
    "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram",
    "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia",
    "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur",
    "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"
  ],
  "Tripura Chapter": [
    "Dharmanagar", "Kailasahar", "Ambassa", "Khowai", "Belonia", "Bishalgarh", "Agartala"
  ]
}

const members: Member[] = [
  {
    id: "M001",
    name: "Dhritiman Dey",
    designation: "Central Chairman (INDIA) & Founder",
    jurisdiction: "All India",
    level: "National",
    imageId: "chairman-photo",
    gender: 'male'
  },
  {
    id: "M002",
    name: "Adv. Meera Deshmukh",
    designation: "National Legal Advisor",
    jurisdiction: "Supreme Court Division",
    level: "National",
    imageId: "female-avatar",
    gender: 'female'
  },
  {
    id: "M003",
    name: "Dr. Arvind Swamy",
    designation: "General Secretary",
    jurisdiction: "Central Secretariat",
    level: "National",
    imageId: "male-avatar",
    gender: 'male'
  },
  {
    id: "M004",
    name: "Moumita Saha",
    designation: "Chairman (West Bengal) & Founder",
    jurisdiction: "West Bengal",
    stateName: "West Bengal",
    level: "State",
    imageId: "moumita-photo",
    gender: 'female'
  },
  {
    id: "M005",
    name: "Sonia Gandhi",
    designation: "Vice Chairperson",
    jurisdiction: "West Bengal",
    stateName: "West Bengal",
    level: "State",
    imageId: "female-avatar",
    gender: 'female'
  },
  {
    id: "M006",
    name: "Rajesh Patil",
    designation: "Chapter Chairman",
    jurisdiction: "Tripura Chapter",
    stateName: "Tripura Chapter",
    level: "State",
    imageId: "male-avatar",
    gender: 'male'
  },
  {
    id: "M007",
    name: "Amruta Fadnavis",
    designation: "Legal Head",
    jurisdiction: "Tripura Chapter",
    stateName: "Tripura Chapter",
    level: "State",
    imageId: "female-avatar",
    gender: 'female'
  },
  {
    id: "M008",
    name: "Anil Kapoor",
    designation: "District Chairman",
    jurisdiction: "Kolkata",
    stateName: "West Bengal",
    districtName: "Kolkata",
    level: "District",
    imageId: "male-avatar",
    gender: 'male'
  },
  {
    id: "M009",
    name: "Sunil Shetty",
    designation: "District Chairman",
    jurisdiction: "Howrah",
    stateName: "West Bengal",
    districtName: "Howrah",
    level: "District",
    imageId: "male-avatar",
    gender: 'male'
  },
  {
    id: "M010",
    name: "Prakash Jha",
    designation: "District Chairman",
    jurisdiction: "Howrah",
    stateName: "West Bengal",
    districtName: "Howrah",
    level: "District",
    imageId: "male-avatar",
    gender: 'male'
  }
]

export default function MembersPage() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("All")
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const availableDistricts = useMemo(() => {
    if (!selectedState) return []
    return chapterToDistricts[selectedState] || []
  }, [selectedState])

  const handleLevelClick = (level: string) => {
    setLevelFilter(level)
    setSelectedState(null)
    setSelectedDistrict(null)
  }

  const handleStateSelect = (state: string) => {
    setLevelFilter("State")
    setSelectedState(state)
    setSelectedDistrict(null) 
  }

  const handleDistrictSelect = (district: string) => {
    setLevelFilter("District")
    setSelectedDistrict(district)
  }

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.jurisdiction.toLowerCase().includes(search.toLowerCase()) ||
                          m.designation.toLowerCase().includes(search.toLowerCase());
    
    let matchesLevel = levelFilter === "All" || m.level === levelFilter;
    
    if (levelFilter === "State" && selectedState) {
      matchesLevel = m.level === "State" && m.stateName === selectedState;
    }

    if (levelFilter === "District") {
      if (selectedState && selectedDistrict) {
        matchesLevel = m.level === "District" && m.stateName === selectedState && m.districtName === selectedDistrict;
      } else if (selectedState) {
        matchesLevel = m.level === "District" && m.stateName === selectedState;
      } else {
        matchesLevel = m.level === "District";
      }
    }

    return matchesSearch && matchesLevel;
  })

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="pt-40 pb-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-bold border border-accent/30 mb-6">
            <Users className="w-4 h-4" />
            <span>Official Personnel Directory</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">Verified <span className="text-accent italic">Members</span></h1>
          <p className="text-indigo-100 max-w-2xl mx-auto text-lg">
            Meet the dedicated human rights defenders of JusticeShield, operating with transparency and integrity across the nation.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-slate-200 sticky top-[72px] md:top-[84px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={levelFilter === "All" ? "default" : "outline"}
                onClick={() => handleLevelClick("All")}
                className={`rounded-full px-6 font-bold ${levelFilter === "All" ? 'bg-primary text-white' : 'hover:border-accent hover:text-accent'}`}
              >
                All
              </Button>
              <Button
                variant={levelFilter === "National" ? "default" : "outline"}
                onClick={() => handleLevelClick("National")}
                className={`rounded-full px-6 font-bold ${levelFilter === "National" ? 'bg-primary text-white' : 'hover:border-accent hover:text-accent'}`}
              >
                National
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={levelFilter === "State" ? "default" : "outline"}
                    className={`rounded-full px-6 font-bold flex items-center gap-2 ${levelFilter === "State" ? 'bg-primary text-white' : 'hover:border-accent hover:text-accent'}`}
                  >
                    {selectedState || "State/Chapter"} <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-80 overflow-y-auto w-56">
                  <DropdownMenuItem onClick={() => handleLevelClick("State")}>
                    All States/Chapters
                  </DropdownMenuItem>
                  {chapters.map((chapter) => (
                    <DropdownMenuItem key={chapter} onClick={() => handleStateSelect(chapter)}>
                      {chapter}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={levelFilter === "District" ? "default" : "outline"}
                    className={`rounded-full px-6 font-bold flex items-center gap-2 ${levelFilter === "District" ? 'bg-primary text-white' : 'hover:border-accent hover:text-accent'}`}
                  >
                    {selectedDistrict || "District"} <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-80 overflow-y-auto w-56">
                  {!selectedState ? (
                    <div className="p-4 text-xs text-slate-400 italic">Select a State/Chapter first</div>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => handleLevelClick("District")}>
                        All Districts in {selectedState}
                      </DropdownMenuItem>
                      {availableDistricts.length > 0 ? (
                        availableDistricts.map((district, index) => (
                          <DropdownMenuItem key={`${district}-${index}`} onClick={() => handleStateSelect(district)}>
                            {district}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-4 text-xs text-slate-400 italic">No districts listed for this region</div>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by name, designation or location..." 
                className="pl-12 h-14 rounded-2xl border-slate-200 focus:ring-accent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const img = PlaceHolderImages.find(i => i.id === member.imageId)
                const fallback = member.gender === 'female' ? '/dummy w.png' : '/dummy m.png'
                const isChairman = member.designation.includes("Central Chairman")
                const isStateChairman = member.designation.includes("Chairman (West Bengal)")
                const isMoumita = member.name === "Moumita Saha"
                const isDhritiman = member.name === "Dhritiman Dey"
                
                return (
                  <Card key={member.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white border border-slate-100 flex flex-col h-full">
                    <CardHeader className="p-0">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image 
                          src={img?.imageUrl || fallback} 
                          alt={member.name} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          data-ai-hint={img?.imageHint}
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white/90 backdrop-blur-md text-primary font-bold shadow-lg border-none px-2 py-0.5 text-[8px] md:text-[10px]">
                            {member.level}
                          </Badge>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary/95 via-primary/60 to-transparent">
                            <div className="flex items-center gap-1.5 text-accent mb-1">
                              <BadgeCheck className="w-3 h-3 md:w-4 md:h-4 fill-accent text-primary" />
                              <span className="text-[6px] md:text-[8px] font-bold uppercase tracking-[0.2em] text-white">ID: {member.id}</span>
                            </div>
                            <h3 className={`font-headline font-bold group-hover:text-accent transition-colors ${isChairman || isStateChairman ? 'text-sm md:text-base' : 'text-xs md:text-sm'} ${isDhritiman ? 'text-red-600' : isMoumita ? 'text-secondary' : 'text-white'}`}>
                            {member.name}
                          </h3>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 flex-1">
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-accent/10 transition-colors">
                          <Briefcase className="w-3 h-3 md:w-4 md:h-4 text-slate-400 group-hover:text-accent" />
                        </div>
                        <div>
                          <p className="text-[6px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Designation</p>
                          <p className={`font-bold text-primary leading-tight ${isChairman || isStateChairman ? 'text-[10px] md:text-xs' : 'text-[9px] md:text-[11px]'}`}>{member.designation}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-accent/10 transition-colors">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4 text-slate-400 group-hover:text-accent" />
                        </div>
                        <div>
                          <p className="text-[6px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Jurisdiction</p>
                          <p className="font-bold text-slate-600 text-[9px] md:text-[11px] leading-tight">{member.jurisdiction}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full py-32 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <User className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-primary">No members found</h3>
                <p className="text-slate-500">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
