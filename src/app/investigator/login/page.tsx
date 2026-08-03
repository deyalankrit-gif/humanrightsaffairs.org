
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useAuth, useFirestore } from '@/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Lock, ArrowRight, Loader2, Home, Search, UserCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Investigator Login Page: High-security terminal for investigative personnel.
 * Supports authentication via Official Email or Employee ID.
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

      // If the identifier is not an email, attempt to resolve it from the Employee ID registry
      if (!loginEmail.includes('@')) {
        const officersRef = collection(db, 'investigation_officers');
        const q = query(officersRef, where('employeeId', '==', identifier.toUpperCase().trim()));
        const snap = await getDocs(q);

        if (snap.empty) {
          throw new Error("Unauthorized ID: Employee record not identified in the registry.");
        }

        const officerData = snap.docs[0].data();
        loginEmail = officerData.email;
      }

      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password)
      const firebaseUser = userCredential.user;

      const userRef = doc(db, 'users', firebaseUser.email!.toLowerCase())
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        if (userData.role !== 'investigator') {
          await auth.signOut()
          throw new Error("Access Denied: You do not have investigative clearance.")
        }
        
        toast({ title: "Clearance Verified", description: "Accessing Investigative Terminal." })
        router.push('/investigator/dashboard')
      } else {
        await auth.signOut()
        throw new Error("Unauthorized Identity: Record not found in National Registry.")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
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
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-widest">
            <Home className="w-3 h-3" /> Public Portal
          </Link>
        </div>
        
        <Card className="bg-white border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden border-t-8 border-t-indigo-600">
          <CardHeader className="text-center space-y-4 pb-2 pt-10">
            <div className="flex justify-center">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-slate-100 p-2">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-headline font-bold text-primary">Investigator Entry</CardTitle>
              <CardDescription className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2">
                <Search className="w-4 h-4" /> Investigative Clearance Required
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
                    className="bg-slate-50 border-slate-200 h-12 rounded-xl pl-10 text-sm"
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 text-lg rounded-xl shadow-xl shadow-indigo-600/20" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Entry"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
