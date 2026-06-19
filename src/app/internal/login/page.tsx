
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useAuth, useFirestore } from '@/firebase'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Lock, ArrowRight, Loader2, Home, Eye, EyeOff, UserCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Staff Access Login Page: Unified Auth-Firestore verification.
 */
export default function StaffLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const inputEmail = email.toLowerCase().trim()
    
    try {
      // PHASE 1: Primary Authentication via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, inputEmail, password)
      const firebaseUser = userCredential.user;

      // PHASE 2: Authorized Personnel Registry Verification
      const userRef = doc(db, 'users', inputEmail)
      let userSnap = await getDoc(userRef)

      // Auto-Provision logic for hardcoded staff if missing from DB but valid in Auth
      const isHardcodedStaff = inputEmail === 'deyalankrit@gmail.com' && password === 'Admin1234'
      
      if (!userSnap.exists()) {
        if (isHardcodedStaff) {
          const initialPermissions = {
            analytics: false,
            memberAnalytics: true,
            members: true,
            renewals: true,
            visitors: true,
            accounts: true,
            expenses: true,
            applications: true,
            inventory: true,
            vendors: true,
            grievances: true,
            meetings: true,
            events: true,
            publicView: true,
            terminated: true
          }
          
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: inputEmail,
            name: 'Staff Alankrit',
            role: 'staff',
            status: 'active',
            permissions: initialPermissions,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          }, { merge: true });
          
          // Re-fetch to ensure we have the local state ready
          userSnap = await getDoc(userRef);
        } else {
          // If not in registry and not hardcoded, terminate session
          await signOut(auth)
          throw new Error("Clearance Required: Your identity is not present in the institutional registry.")
        }
      }

      // Record successful login timestamp
      await setDoc(userRef, { lastLogin: serverTimestamp(), uid: firebaseUser.uid }, { merge: true });

      toast({
        title: "Access Granted",
        description: "Institutional clearance verified. Redirecting to operational module.",
      })
      
      // PHASE 3: Context-Aware Redirection
      const userData = userSnap.data();
      const perms = userData?.permissions || {};
      
      // Priority-based dashboard landing
      const priority = [
        { id: 'analytics', path: 'analytics' },
        { id: 'memberAnalytics', path: 'member-analytics' },
        { id: 'members', path: 'members' },
        { id: 'renewals', path: 'renewals' },
        { id: 'terminated', path: 'terminated-members' },
        { id: 'events', path: 'events' },
        { id: 'meetings', path: 'meetings' },
        { id: 'publicView', path: 'public-view' }
      ];
      
      const firstAvailable = priority.find(p => perms[p.id] === true);
      if (firstAvailable) {
        router.push(`/internal/${firstAvailable.path}`);
      } else {
        router.push('/internal/public-view');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Invalid credentials or unauthorized terminal.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">
            <Home className="w-3 h-3" /> Public Portal
          </Link>
        </div>
        
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden border-t-8 border-t-primary">
          <CardHeader className="text-center space-y-4 pb-2 pt-10">
            <div className="flex justify-center">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-white p-2">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-headline font-bold text-primary dark:text-white">Staff Access</CardTitle>
              <CardDescription className="text-primary/60 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Operational Clearance
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Official Email</Label>
                <div className="relative">
                  <Input 
                    type="email" 
                    placeholder="name@hrat.org" 
                    className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 rounded-xl pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Passphrase</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 rounded-xl pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary text-white font-bold h-14 text-lg rounded-xl hover:bg-secondary transition-all shadow-xl shadow-primary/20 group" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Authorize Entry <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
           <Link href="/internal/super-login" className="text-[10px] font-black uppercase text-slate-400 hover:text-accent tracking-[0.2em] transition-all">
             Switch to Root Access
           </Link>
        </div>
      </div>
    </main>
  )
}
