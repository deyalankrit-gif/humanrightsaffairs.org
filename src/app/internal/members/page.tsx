
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Search, 
  Eye, 
  Lock, 
  FileText, 
  ExternalLink, 
  ShieldCheck,
  Hash,
  Mail,
  Phone
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function InternalMembersDirectory() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const [search, setSearch] = useState('')

  // Placeholder static members for the demo, in production these come from Firestore
  const internalMembers = [
    { id: 'M001', name: 'Dhritiman Dey', designation: 'Central Chairman', email: 'chairman@hrat.org', phone: '+91 90649 90024', status: 'Active' },
    { id: 'M004', name: 'Moumita Saha', designation: 'State Chairman (WB)', email: 'moumita.s@hrat.org', phone: '+91 98765 43210', status: 'Active' },
    { id: 'M002', name: 'Adv. Meera Deshmukh', designation: 'Legal Advisor', email: 'meera.law@hrat.org', phone: '+91 91234 56789', status: 'Active' }
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-accent animate-pulse mx-auto" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Verifying Credentials...</p>
        </div>
      </div>
    )
  }

  const filtered = internalMembers.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="pt-32 pb-16 bg-primary text-white relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1 rounded-full text-xs font-bold border border-accent/30">
                <Lock className="w-3 h-3" />
                <span>Confidential Personnel Access</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Secure <span className="text-accent italic">Member</span> Data</h1>
              <p className="text-indigo-100 opacity-80 max-w-xl">
                Internal dashboard for verified HRAT personnel to access sensitive member information and contact protocols.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Authenticated As</p>
              <p className="text-sm font-bold text-accent">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-b bg-white sticky top-[72px] md:top-[84px] z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by Member ID or Name..." 
                className="pl-12 h-14 rounded-2xl border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-bold text-primary flex gap-2">
              <FileText className="w-5 h-5" /> Export Data
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-4">
            {filtered.map((member) => (
              <Card key={member.id} className="group hover:shadow-lg transition-all border-none shadow-sm overflow-hidden bg-white">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="p-8 bg-slate-50 md:w-48 text-center border-r border-slate-100 flex flex-col items-center justify-center">
                       <Hash className="w-4 h-4 text-accent mb-1" />
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID NO</span>
                       <span className="text-xl font-headline font-bold text-primary">{member.id}</span>
                    </div>
                    <div className="flex-1 p-8 grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Personal Details</p>
                        <h3 className={`text-xl font-bold mb-1 ${member.name === 'Dhritiman Dey' ? 'text-red-600' : 'text-primary'}`}>{member.name}</h3>
                        <p className="text-sm text-slate-500 font-bold">{member.designation}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Protocol</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-accent" />
                          <span className="text-slate-600 font-bold">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-accent" />
                          <span className="text-slate-600 font-bold">{member.phone}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <Badge className="bg-emerald-100 text-emerald-600 border-none px-4 py-1 font-bold">
                          {member.status}
                        </Badge>
                        <Link href={`/internal/members/${member.id}`}>
                          <Button size="icon" className="bg-primary text-white hover:bg-accent rounded-xl transition-colors">
                            <Eye className="w-5 h-5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
