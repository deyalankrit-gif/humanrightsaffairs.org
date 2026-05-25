
"use client"

import React from 'react'
import { Phone, MapPin, Search, LifeBuoy, UserCheck } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const helplines = [
  { id: 1, name: "National Human Rights Commission", phone: "14433", state: "National", type: "General" },
  { id: 2, name: "Women's Helpline (Domestic Violence)", phone: "1091", state: "National", type: "Women" },
  { id: 3, name: "Child Helpline", phone: "1098", state: "National", type: "Children" },
  { id: 4, name: "Police Emergency", phone: "112", state: "National", type: "Police" },
  { id: 5, name: "Legal Aid Authority (DLSA)", phone: "15100", state: "Delhi", type: "Legal" },
  { id: 6, name: "Cyber Crime Helpline", phone: "1930", state: "National", type: "Cyber" },
]

export function EmergencyHelpline() {
  const [filter, setFilter] = React.useState("")
  const [stateFilter, setStateFilter] = React.useState("all")

  const filtered = helplines.filter(h => 
    (h.name.toLowerCase().includes(filter.toLowerCase()) || h.phone.includes(filter)) &&
    (stateFilter === "all" || h.state.toLowerCase() === stateFilter.toLowerCase())
  )

  return (
    <section id="helpline" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex p-2 md:p-3 rounded-2xl bg-red-100 text-red-600 mb-4 animate-bounce">
            <Phone className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-4">Emergency Helpline Dashboard</h2>
          <p className="text-slate-600 text-sm md:text-base">
            Immediate assistance is just a call away. Filter by state or service type to find the right help.
          </p>
          
          {/* Featured Chairman Contact */}
          <div className="mt-8 max-w-md mx-auto">
            <Card className="border-accent bg-accent/5 shadow-lg border-2 overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 text-left">
                <CardTitle className="text-lg font-headline font-bold text-primary">
                  Chairman, West Bengal Human Rights Affairs Trust
                </CardTitle>
                <div className="bg-accent/20 p-2 rounded-lg shrink-0">
                  <UserCheck className="w-5 h-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent className="text-left">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
                  <MapPin className="w-3 h-3" />
                  <span>West Bengal State Chapter</span>
                </div>
                <a 
                  href="tel:9064990024" 
                  className="flex items-center justify-between bg-primary text-white p-4 rounded-xl font-bold text-xl md:text-2xl hover:bg-primary/90 transition-colors"
                >
                  90649 90024
                  <Phone className="w-6 h-6 fill-white" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name or number..." 
              className="pl-10 h-12" 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-full md:w-64 h-12">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="national">National</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="mumbai">Maharashtra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((item) => (
            <Card key={item.id} className="group border-slate-100 hover:border-accent transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base md:text-lg font-headline font-bold text-primary group-hover:text-accent transition-colors">
                  {item.name}
                </CardTitle>
                <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-accent/10 transition-colors shrink-0">
                  <LifeBuoy className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm mb-4">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{item.state} Service</span>
                </div>
                <a 
                  href={`tel:${item.phone}`} 
                  className="flex items-center justify-between bg-primary text-white p-3 md:p-4 rounded-xl font-bold text-xl md:text-2xl hover:bg-primary/90 transition-colors"
                >
                  {item.phone}
                  <Phone className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
