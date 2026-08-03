
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useAuth, useFirestore } from '@/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Lock, ArrowRight, Loader2, Home, Search, UserCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Investigator Login Page: High-security terminal for investigative personnel.
 * Features real-time synchronization with the national investigator registry.
 */
export default function InvestigatorLoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let loginEmail = identifier.toLowerCase().trim();

      // 1. Resolve Identifier to Official Email
      if (!loginEmail.includes('@')) {
        const officersRef = collection(db, 'investigation_officers');
        const q = query(officersRef, where('employeeId', '==', identifier.toUpperCase().trim()));
        const snap = await getDocs(q);

        if (snap.empty) {
          throw new Error("Unauthorized ID: Employee record not identified in the national registry.");
        }

        const officerData = snap.docs[0].data();
        loginEmail = officerData.email;
      }

      // 2. Initial Authentication Handshake
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password)
      const firebaseUser = userCredential.user;

      // 3. Real-time Role & Status Synchronization
      const userRef = doc(db, 'users', firebaseUser.email!.toLowerCase())
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        
        // Strict Role Gate
        if (userData.role !== 'investigator') {
          await signOut(auth)
          throw new Error("Access Denied: You do not have investigative clearance for this terminal.")
        }
        
        // Instant Status Gate (Real-time sync with Admin suspension)
        if (userData.status !== 'active') {
          await signOut(auth)
          throw new Error("Access Suspended: Your investigative credentials have been temporarily or permanently revoked.")
        }
        
        toast({ 
          title: "Clearance Verified", 
          description: `Welcome back, ${userData.name}. Accessing assigned dockets.` 
        })
        router.push('/investigator/dashboard')
      } else {
        await signOut(auth)
        throw new Error("Unauthorized Identity: Governance record missing. Please contact the National Registry Cell.")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Protocol Error",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-widest">
            <Home className="w-3 h-3" /> Return to Public Portal
          </Link>
        </div>
        
        <Card className="bg-white border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden border-t-8 border-t-indigo-600">
          <CardHeader className="text-center space-y-4 pb-2 pt-10">
            <div className="flex justify-center">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-lg border border-slate-100 p-2">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-headline font-bold text-primary">Investigator Entry</CardTitle>
              <CardDescription className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2">
                <Search className="w-4 h-4" /> SECURE INVESTIGATIVE CLEARANCE
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Official ID or Email</Label>
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="e.g. HRAT-IO-001 or name@hrat.org" 
                    className="bg-slate-50 border-slate-200 h-12 rounded-xl pl-10 text-sm font-bold"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                  <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Secure Passphrase</Label>
                <div className="relative">
                  <Input 
                    type="password"
                    placeholder="••••••••" 
                    className="bg-slate-50 border-slate-200 h-12 rounded-xl pl-10 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 text-lg rounded-xl shadow-xl shadow-indigo-600/20 group" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Authorize Entry <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 flex gap-4">
           <ShieldCheck className="w-6 h-6 text-indigo-500 shrink-0" />
           <p className="text-[10px] text-indigo-700 font-medium leading-relaxed italic">
             "Credential sync is verified in real-time. Unauthorized access attempts to the National Investigative Node are recorded and flagged to root security."
           </p>
        </div>
      </div>
    </main>
  )
}
