
"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Calendar, MapPin, Search, Filter, ArrowRight, Camera } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type Event = {
  id: number
  title: string
  date: string
  location: string
  category: "Campaign" | "Workshop" | "Convention" | "Relief"
  imageId: string
  description: string
}

const events: Event[] = [
  {
    id: 1,
    title: "State-Level Legal Aid Camp",
    date: "March 15, 2024",
    location: "Kolkata, West Bengal",
    category: "Relief",
    imageId: "event-legal-aid",
    description: "Provided pro-bono legal consultation to over 500 marginalized families regarding property and civil rights."
  },
  {
    id: 2,
    title: "National Rights Awareness Rally",
    date: "January 26, 2024",
    location: "New Delhi",
    category: "Campaign",
    imageId: "event-rally",
    description: "A massive public march to promote constitutional literacy and advocate for stronger human rights protections."
  },
  {
    id: 3,
    title: "JusticeShield Annual Convention",
    date: "November 10, 2023",
    location: "Mumbai, Maharashtra",
    category: "Convention",
    imageId: "event-convention",
    description: "Gathering of over 2,000 legal experts and activists to discuss the future of human rights in India."
  },
  {
    id: 4,
    title: "Student Constitutional Workshop",
    date: "September 05, 2023",
    location: "Lucknow, Uttar Pradesh",
    category: "Workshop",
    imageId: "event-workshop",
    description: "Interactive session with university students to simplify complex constitutional clauses and empower the youth."
  },
  {
    id: 5,
    title: "Rural Outreach Program",
    date: "July 20, 2023",
    location: "Patna, Bihar",
    category: "Relief",
    imageId: "hero-human-rights",
    description: "Bringing legal resources and awareness to remote villages where access to justice is often limited."
  },
  {
    id: 6,
    title: "International Human Rights Day Seminar",
    date: "December 10, 2023",
    location: "Chennai, Tamil Nadu",
    category: "Campaign",
    imageId: "legal-library",
    description: "A high-profile seminar focusing on international humanitarian law and its local implementation."
  }
]

export default function EventsPage() {
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")

  const filteredEvents = events.filter(e => 
    (filter === "All" || e.category === filter) &&
    (e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase()))
  )

  const categories = ["All", "Campaign", "Workshop", "Convention", "Relief"]

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 -skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="bg-accent text-primary font-bold mb-6 px-4 py-1">Mission Impact</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">Our <span className="text-accent italic">Event</span> Gallery</h1>
            <p className="text-xl text-indigo-100 leading-relaxed">
              Witness the journey of JusticeShield as we traverse the length and breadth of India to protect, educate, and empower.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-white border-b border-slate-200 sticky top-[72px] md:top-[84px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={filter === cat ? "default" : "outline"}
                  onClick={() => setFilter(cat)}
                  className={`rounded-full px-6 ${filter === cat ? 'bg-primary text-white' : 'hover:border-accent hover:text-accent'}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search events or locations..." 
                className="pl-10 h-12 rounded-full border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const img = PlaceHolderImages.find(i => i.id === event.imageId)
                return (
                  <Card key={event.id} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image 
                        src={img?.imageUrl || ''} 
                        alt={event.title} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        data-ai-hint={img?.imageHint}
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/90 backdrop-blur-md text-primary font-bold shadow-lg">
                          {event.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-8 pb-0">
                      <div className="flex items-center gap-4 text-xs font-bold text-accent uppercase tracking-widest mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                      </div>
                      <CardTitle className="text-2xl font-headline font-bold text-primary group-hover:text-accent transition-colors">
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {event.description}
                      </p>
                    </CardContent>
                    <CardFooter className="p-8 pt-0 border-t border-slate-50 mt-auto">
                      <Button variant="ghost" className="p-0 h-auto font-bold text-primary hover:text-accent flex items-center gap-2 group/btn">
                        View Event Details <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full py-32 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Camera className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-primary">No events found</h3>
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
