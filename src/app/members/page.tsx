
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Search, MapPin, BadgeCheck, User, Users, Briefcase, ChevronDown, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Member = {
  id: string
  memberId?: string
  name: string
  designation: string
  level: "National" | "State" | "District"
  stateName?: string
  districtName?: string
  imageId?: string
  gender?: 'male' | 'female'
  email?: string
  phone?: string
}

const chapters = [
  "West Bengal", "Tripura Chapter", "Delhi", "Maharashtra", "Tamil Nadu", "Karnataka", "Uttar Pradesh", "Bihar"
]

export default function MembersPage() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("All")
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const db = useFirestore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const membersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
  }, [db]);

  const { data: firestoreMembers, loading: membersLoading } = useCollection(membersQuery);

  const handleLevelClick = (level: string) => {
    setLevelFilter(level)
    setSelectedState(null)
  }

  const handleStateSelect = (state: string) => {
    setLevelFilter("State")
    setSelectedState(state)
  }

  const members = (firestoreMembers || []) as Member[]

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.designation?.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId?.toLowerCase().includes(search.toLowerCase());
    
    let matchesLevel = levelFilter === "All" || m.level === levelFilter;
    
    if (levelFilter === "State" && selectedState) {
      matchesLevel = m.level === "State" && m.stateName === selectedState;
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
            <span>Official Membership Records</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">Verified <span className="text-accent italic">Personnel</span></h1>
          <p className="text-indigo-100 max-w-2xl mx-auto text-lg">
            A dynamic ledger of our dedicated human rights defenders, updated in real-time by the central administration.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-slate-200 sticky top-[72px] md:top-[84px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap justify-center gap-2">
              {["All", "National", "State", "District"].map((level) => (
                <Button
                  key={level}
                  variant={levelFilter === level ? "default" : "outline"}
                  onClick={() => handleLevelClick(level)}
                  className={`rounded-full px-6 font-bold ${levelFilter === level ? 'bg-primary text-white' : 'hover:border-accent hover:text-accent'}`}
                >
                  {level}
                </Button>
              ))}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={levelFilter === "State" ? "default" : "outline"}
                    className={`rounded-full px-6 font-bold flex items-center gap-2 ${levelFilter === "State" ? 'bg-primary text-white' : 'hover:border-accent hover:text-accent'}`}
                  >
                    {selectedState || "Filter by Chapter"} <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-80 overflow-y-auto w-56">
                  {chapters.map((chapter) => (
                    <DropdownMenuItem key={chapter} onClick={() => handleStateSelect(chapter)}>
                      {chapter}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by name, ID or role..." 
                className="pl-12 h-14 rounded-2xl border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {membersLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Live Directory...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const fallback = member.gender === 'female' ? '/dummy w.png' : '/dummy m.png'
                  return (
                    <Card key={member.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white border border-slate-100">
                      <CardHeader className="p-0">
                        <div className="relative aspect-square overflow-hidden bg-slate-100">
                          <Image 
                            src={member.imageId || fallback} 
                            alt={member.name} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-primary/80 backdrop-blur-md text-white font-bold border-none">
                              {member.level}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start gap-2">
                           <BadgeCheck className="w-5 h-5 text-accent shrink-0 mt-1" />
                           <div>
                             <h3 className="font-headline font-bold text-xl text-primary leading-tight">{member.name}</h3>
                             <p className="text-xs font-bold text-accent uppercase tracking-widest mt-1">{member.designation}</p>
                           </div>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{member.stateName || 'All India'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            <span>ID: {member.memberId || 'N/A'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <div className="col-span-full py-32 text-center">
                  <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-2xl font-headline font-bold text-primary">No members found</h3>
                  <p className="text-slate-500">The directory is empty or no matches were found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
