
"use client"

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Search, MapPin, BadgeCheck, User, Users, Shield, Briefcase, Hash, ChevronDown } from 'lucide-react'
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
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi NCR"
]

const stateToDistricts: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Anantapur", "Kakinada"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat", "Along", "Tezu"],
  "Assam": ["Guwahati", "Dibrugarh", "Jorhat", "Silchar", "Nagaon", "Tinsukia", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur"],
  "Goa": ["North Goa", "South Goa", "Panaji", "Margao", "Vasco da Gama"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar"],
  "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Rohtak", "Hisar", "Karnal"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Hamirpur"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davangere"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas"],
  "Maharashtra": ["Mumbai Suburban", "Mumbai City", "Pune City", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur"],
  "Manipur": ["Imphal", "Churachandpur", "Thoubal", "Bishnupur", "Senapati"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh", "Williamnagar"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Puri", "Berhampur", "Balasore"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Hoshiarpur", "Mohali"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Sikar"],
  "Sikkim": ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Pakyong"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Erode"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Ambassa"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Prayagraj", "Bareilly"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Haldwani", "Roorkee", "Rudrapur", "Kashipur"],
  "West Bengal": [
    "Alipurduar",
    "Bankura",
    "Birbhum",
    "Cooch Behar",
    "Dakshin Dinajpur",
    "Darjeeling",
    "Hooghly",
    "Howrah",
    "Jalpaiguri",
    "Jhargram",
    "Kalimpong",
    "Kolkata",
    "Malda",
    "Murshidabad",
    "Nadia",
    "North 24 Parganas",
    "Paschim Bardhaman",
    "Paschim Medinipur",
    "Purba Bardhaman",
    "Purba Medinipur",
    "Purulia",
    "South 24 Parganas",
    "Uttar Dinajpur"
  ],
  "Delhi NCR": ["New Delhi Central", "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Northeast Delhi", "Southwest Delhi"]
}

const members: Member[] = [
  {
    id: "M001",
    name: "Dhritimaan Dey",
    designation: "Central Chairman & Founder",
    jurisdiction: "All India",
    level: "National",
    imageId: "chairman-photo"
  },
  {
    id: "M002",
    name: "Adv. Meera Deshmukh",
    designation: "National Legal Advisor",
    jurisdiction: "Supreme Court Division",
    level: "National",
    imageId: "leader-1"
  },
  {
    id: "M003",
    name: "Dr. Arvind Swamy",
    designation: "General Secretary",
    jurisdiction: "Central Secretariat",
    level: "National",
    imageId: "leader-2"
  },
  {
    id: "M004",
    name: "Vikram Malhotra",
    designation: "State Chairman",
    jurisdiction: "West Bengal",
    stateName: "West Bengal",
    level: "State",
    imageId: "leader-3"
  },
  {
    id: "M005",
    name: "Sonia Gandhi",
    designation: "Vice Chairperson",
    jurisdiction: "West Bengal",
    stateName: "West Bengal",
    level: "State",
    imageId: "leader-4"
  },
  {
    id: "M006",
    name: "Rajesh Patil",
    designation: "State Chairman",
    jurisdiction: "Maharashtra",
    stateName: "Maharashtra",
    level: "State",
    imageId: "leader-1"
  },
  {
    id: "M007",
    name: "Amruta Fadnavis",
    designation: "Legal Head",
    jurisdiction: "Maharashtra",
    stateName: "Maharashtra",
    level: "State",
    imageId: "leader-2"
  },
  {
    id: "M008",
    name: "Anil Kapoor",
    designation: "District Chairman",
    jurisdiction: "Kolkata",
    stateName: "West Bengal",
    districtName: "Kolkata",
    level: "District",
    imageId: "leader-3"
  },
  {
    id: "M009",
    name: "Sunil Shetty",
    designation: "District Chairman",
    jurisdiction: "Mumbai Suburban",
    stateName: "Maharashtra",
    districtName: "Mumbai Suburban",
    level: "District",
    imageId: "leader-4"
  },
  {
    id: "M010",
    name: "Prakash Jha",
    designation: "District Chairman",
    jurisdiction: "Pune City",
    stateName: "Maharashtra",
    districtName: "Pune City",
    level: "District",
    imageId: "leader-1"
  }
]

export default function MembersPage() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("All")
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)

  const availableDistricts = useMemo(() => {
    if (!selectedState) return []
    return stateToDistricts[selectedState] || []
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
                    {selectedState || "State"} <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-80 overflow-y-auto w-56">
                  <DropdownMenuItem onClick={() => handleLevelClick("State")}>
                    All States
                  </DropdownMenuItem>
                  {indianStates.map((state) => (
                    <DropdownMenuItem key={state} onClick={() => handleStateSelect(state)}>
                      {state}
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
                    <div className="p-4 text-xs text-slate-400 italic">Select a State first</div>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => handleLevelClick("District")}>
                        All Districts in {selectedState}
                      </DropdownMenuItem>
                      {availableDistricts.length > 0 ? (
                        availableDistricts.map((district) => (
                          <DropdownMenuItem key={district} onClick={() => handleDistrictSelect(district)}>
                            {district}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-4 text-xs text-slate-400 italic">No districts listed for this state</div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const img = PlaceHolderImages.find(i => i.id === member.imageId)
                const isDistrict = member.level === "District"

                return (
                  <Card key={member.id} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 flex flex-col h-full">
                    {!isDistrict ? (
                      <CardHeader className="p-0">
                        <div className="relative aspect-[4/5] overflow-hidden">
                          <Image 
                            src={img?.imageUrl || ''} 
                            alt={member.name} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            data-ai-hint={img?.imageHint}
                          />
                          <div className="absolute top-6 right-6">
                            <Badge className="bg-white/90 backdrop-blur-md text-primary font-bold shadow-lg border-none px-4 py-1">
                              {member.level}
                            </Badge>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent">
                             <div className="flex items-center gap-2 text-accent mb-2">
                               <BadgeCheck className="w-5 h-5 fill-accent text-primary" />
                               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Verified ID: {member.id}</span>
                             </div>
                             <h3 className="text-2xl font-headline font-bold text-white group-hover:text-accent transition-colors">
                              {member.name}
                            </h3>
                          </div>
                        </div>
                      </CardHeader>
                    ) : (
                      <CardHeader className="p-8 pb-0 flex flex-col items-center text-center">
                        <div className="mb-6">
                           <Badge className="bg-primary text-white font-bold px-4 py-1">
                            {member.level}
                          </Badge>
                        </div>
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                          <User className="w-10 h-10 text-slate-300 group-hover:text-accent transition-colors" />
                        </div>
                        <h3 className="text-2xl font-headline font-bold text-primary group-hover:text-accent transition-colors">
                          {member.name}
                        </h3>
                      </CardHeader>
                    )}
                    <CardContent className="p-8 space-y-4 flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-accent/10 transition-colors">
                          <Hash className="w-5 h-5 text-slate-400 group-hover:text-accent" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID Card Number</p>
                          <p className={`font-bold font-mono ${isDistrict ? 'text-accent' : 'text-primary'}`}>{member.id}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-accent/10 transition-colors">
                          <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-accent" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Designation</p>
                          <p className="font-bold text-primary">{member.designation}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 pt-2">
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-accent/10 transition-colors">
                          <MapPin className="w-5 h-5 text-slate-400 group-hover:text-accent" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jurisdiction</p>
                          <p className="font-bold text-slate-600">{member.jurisdiction}</p>
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
