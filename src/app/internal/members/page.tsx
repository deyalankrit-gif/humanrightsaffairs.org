"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { AdminNavbar } from '@/components/admin-navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Lock, 
  ShieldCheck,
  Hash,
  Mail,
  Phone,
  ArrowRight,
  Loader2,
  FileText
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function InternalMembersDirectory() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const [search, setSearch] = useState('')

  const profilesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'memberProfiles'), orderBy('name', 'asc'));
  }, [db, user]);

  const { data: firestoreProfiles, loading: profilesLoading } = useCollection(profilesQuery);

  const internalMembers = firestoreProfiles && firestoreProfiles.length > 0 ? firestoreProfiles : [
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
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Authenticating clearance...</p>
        </div>
      </div>
    )
  }

  const filtered = internalMembers.filter((m: any) => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.id?.toLowerCase().includes(search.toLowerCase()) ||
    m.memberId?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <section className="pt-32 pb-16 bg-slate-900 text-white relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-[10px] font-bold border border-red-500/30 uppercase tracking-[0.2em]">
                <Lock className="w-3 h-3" />
                <span>Personnel Directory</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Secure <span className="text-accent italic">Member</span> Data</h1>
              <p className="text-slate-400 max-w-xl text-sm">
                Internal dashboard for verified HRAT personnel to access operational contact protocols.
              </p>
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
                placeholder="Search Secure Database (Member ID or Name)..." 
                className="pl-12 h-14 rounded-2xl border-slate-200 focus:ring-accent font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-bold text-primary flex gap-2">
              <FileText className="w-5 h-5" /> Export Logs
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {profilesLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Querying Encrypted Records...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((member: any) => (
                <Card key={member.id || member.memberId} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm overflow-hidden bg-white rounded-[2rem]">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="p-8 bg-slate-50 md:w-56 text-center border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                         <Hash className="w-5 h-5 text-accent mb-2" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">RECORD ID</span>
                         <span className="text-2xl font-headline font-bold text-primary tracking-tighter">{member.id || member.memberId}</span>
                      </div>
                      <div className="flex-1 p-8 grid lg:grid-cols-3 gap-8 items-center">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personnel Name</p>
                          <h3 className={`text-2xl font-bold transition-colors ${member.name === 'Dhritiman Dey' ? 'text-secondary' : 'text-primary'}`}>
                            {member.name}
                          </h3>
                          <p className="text-sm text-slate-500 font-bold italic">{member.designation}</p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Lines</p>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                              <Mail className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-slate-600 font-bold">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                              <Phone className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-slate-600 font-bold">{member.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-4">
                          <Badge className="bg-emerald-100 text-emerald-600 border-none px-6 py-2 font-bold uppercase tracking-widest text-[10px] rounded-full">
                            {member.status || 'Active'}
                          </Badge>
                          <Link href={`/internal/members/${member.id || member.memberId}`}>
                            <Button className="bg-primary text-white hover:bg-accent rounded-2xl h-12 px-6 group/btn transition-all flex gap-2">
                              Full Profile <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold uppercase tracking-widest">No matching records found in secure database.</p>
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
