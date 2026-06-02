
"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Search, UserX, AlertTriangle, ShieldAlert, Calendar, Hash, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type TerminatedMember = {
  id: string
  name: string
  designation: string
  terminationDate: string
  reason: string
  status: "Revoked" | "Cancelled"
  imageId: string
  gender: 'male' | 'female'
}

const terminatedMembers: TerminatedMember[] = [
  {
    id: "T-0982",
    name: "Subhashis Ganguly",
    designation: "Former District Secretary",
    terminationDate: "February 12, 2024",
    reason: "Unauthorized use of trust emblem and misrepresentation of authority.",
    status: "Revoked",
    imageId: "male-avatar",
    gender: 'male'
  },
  {
    id: "T-0441",
    name: "Pritam Das",
    designation: "Former Legal Assistant",
    terminationDate: "January 05, 2024",
    reason: "Violation of professional ethics and organizational non-compliance.",
    status: "Cancelled",
    imageId: "male-avatar",
    gender: 'male'
  },
  {
    id: "T-1120",
    name: "Mousumi Chatterjee",
    designation: "Former Zonal Volunteer",
    terminationDate: "November 20, 2023",
    reason: "Failure to adhere to constitutional guidelines and trust bylaws.",
    status: "Revoked",
    imageId: "female-avatar",
    gender: 'female'
  }
]

export default function TerminatedMembersPage() {
  const [search, setSearch] = useState("")

  const filtered = terminatedMembers.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="pt-40 pb-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-sm font-bold border border-red-500/30 mb-6 uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4" />
            <span>Public Notice</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6">Terminated <span className="text-red-500 italic">Memberships</span></h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            This directory lists individuals who are no longer authorized to represent the Human Rights Affairs Trust (JusticeShield).
          </p>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-slate-200 sticky top-[72px] md:top-[84px] z-30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by name or Termination ID..." 
                className="pl-12 h-14 rounded-2xl border-slate-200 focus:ring-red-500 text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-[2rem] p-6">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="font-bold text-lg mb-2">Important Disclaimer</AlertTitle>
              <AlertDescription className="text-red-700">
                The individuals listed below are no longer affiliated with JusticeShield. Any attempt to use organizational logos, ID cards, or represent themselves as officials is a punishable offense. Please report any such activity to our national helpline.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6">
              {filtered.length > 0 ? (
                filtered.map((member) => {
                  const img = PlaceHolderImages.find(i => i.id === member.imageId)
                  const fallback = member.gender === 'female' ? '/dummy w.png' : '/dummy m.png'
                  
                  return (
                    <Card key={member.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="p-8 bg-slate-50 md:w-48 flex flex-col items-center justify-center border-r border-slate-100 text-center shrink-0">
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden mb-3 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                              <Image 
                                src={img?.imageUrl || fallback} 
                                alt={member.name} 
                                fill 
                                className="object-cover"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</span>
                            <Badge variant="destructive" className="uppercase text-[10px] font-bold px-4">
                              {member.status}
                            </Badge>
                          </div>
                          
                          <div className="flex-1 p-8 grid md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                <Hash className="w-3 h-3" /> REF: {member.id}
                              </div>
                              <h3 className="text-3xl font-headline font-bold text-primary group-hover:text-red-600 transition-colors">
                                {member.name}
                              </h3>
                              <p className="text-slate-500 font-bold italic">{member.designation}</p>
                            </div>

                            <div className="space-y-4">
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                  <Info className="w-3 h-3" /> Reason for Termination
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed italic">
                                  "{member.reason}"
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <Calendar className="w-4 h-4" /> 
                                Effective Since: <span className="text-primary">{member.terminationDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <UserX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-headline font-bold text-primary">No records match your search</h3>
                  <p className="text-slate-500">If you are verifying an ID card, ensure the name or ID is entered correctly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
