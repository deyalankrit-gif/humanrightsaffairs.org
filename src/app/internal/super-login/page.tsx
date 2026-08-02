
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useAuth, useFirestore } from '@/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ShieldAlert, Lock, ArrowRight, Loader2, Home, Eye, EyeOff, Terminal } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { Captcha } from '@/components/captcha'
import { cn } from '@/lib/utils'

/**
 * Root Login Page: High-security terminal for root administrator access.
 * Refined: Removed pre-filled state. Displays deydhritiman@gmail.com as a placeholder only.
 */
export default function RootLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCaptchaValid, setIsCaptchaValid] = useState(false)
  
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isCaptchaValid) {
      toast({
        variant: "destructive",
        title: "Security Block",
        description: "Please complete the alphanumeric verification.",
      })
      return
    }

    setIsLoading(true)
    const inputEmail = email.toLowerCase().trim()
    const isRootEmail = inputEmail === 'deydhritiman@gmail.com';

    try {
      if (!isRootEmail) {
        throw new Error("Access Denied: Insufficient authorization level for this terminal.")
      }

      const userCredential = await signInWithEmailAndPassword(auth, inputEmail, password)
      const firebaseUser = userCredential.user;
      
      const userRef = doc(db, 'users', inputEmail)
      const userSnap = await getDoc(userRef)
      
      const fullPermissions = {
        analytics: true, 
        memberAnalytics: true, 
        members: true, 
        renewals: true,
        visitors: true, 
        accounts: true,
        expenses: true, 
        applications: true, 
        materialManagement: true,
        inventory: true,
        vendors: true,
        grievances: true, 
        meetings: true, 
        events: true, 
        publicView: true,
        terminated: true,
        occasions: true,
        activityHub: true,
        kitManagement: true,
        gallery: true,
        financeDashboard: true,
        financeLedger: true,
        financeVouchers: true,
        financePayroll: true,
        financeProjects: true,
        financeAssets: true,
        financeCompliance: true,
        feedback: true
      };

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: inputEmail,
          name: 'Root Administrator',
          role: 'admin',
          status: 'active',
          createdAt: serverTimestamp(),
          permissions: fullPermissions
        });
      } else {
        await setDoc(userRef, { 
          uid: firebaseUser.uid, 
          lastLogin: serverTimestamp(),
          permissions: fullPermissions
        }, { merge: true });
      }

      toast({
        title: "ROOT ACCESS GRANTED",
        description: "Governance privileges unlocked. Accessing Command Center.",
      })
      
      router.push('/internal/daily-update')
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "SECURITY ALERT",
        description: error.message || "Root authentication protocol failed.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4 md:p-8">
      <div className="w-full max-w-md space-y-6 md:space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors text-[10px] md:text-xs font-bold uppercase tracking-widest">
            <Home className="w-3 h-3" /> Abort Session
          </Link>
        </div>
        
        <Card className="bg-slate-900 border-red-900/50 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-t-8 border-t-red-600">
          <CardHeader className="text-center space-y-4 pb-2 pt-8 md:pt-10">
            <div className="flex justify-center">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-transparent p-2">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
            </div>
            <div className="space-y-1 px-4">
              <CardTitle className="text-xl md:text-2xl font-headline font-bold text-white tracking-widest uppercase">Root Access</CardTitle>
              <CardDescription className="text-red-500 font-bold uppercase tracking-[0.3em] text-[8px] md:text-[10px] flex items-center justify-center gap-2">
                <ShieldAlert className="w-2.5 h-2.5 md:w-3 md:h-3 text-red-500" /> LEVEL 5 CLEARANCE
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleLogin} className="space-y-5 md:space-y-6" autoComplete="off">
              <div className="space-y-2">
                <Label className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">Root Identity</Label>
                <div className="relative">
                  <Input 
                    type="email" 
                    placeholder="deydhritiman@gmail.com" 
                    className="bg-black/50 border-red-900/30 text-red-500 h-11 md:h-12 rounded-xl pl-10 font-mono text-sm focus:ring-red-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    required
                  />
                  <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-900" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">Governance Key</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="bg-black/50 border-red-900/30 text-red-500 h-11 md:h-12 rounded-xl pl-10 pr-10 font-mono text-sm focus:ring-red-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    required
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-900" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-900 hover:text-red-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="py-2 border-t border-red-900/30">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 mb-2 block text-center">Security Verification</Label>
                <Captcha onVerify={setIsCaptchaValid} />
              </div>

              <Button 
                type="submit" 
                className={cn(
                  "w-full font-bold h-12 md:h-14 text-sm md:text-lg rounded-xl transition-all shadow-[0_10px_40px_rgba(220,38,38,0.3)]",
                  isCaptchaValid ? "bg-red-600 text-white hover:bg-red-700" : "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                )} 
                disabled={isLoading || !isCaptchaValid}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>INITIALIZE ROOT SESSION <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
           <Link href="/internal/login" className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 hover:text-primary tracking-[0.2em] transition-all">
             Return to Staff Access
           </Link>
        </div>
      </div>
    </main>
  )
}
