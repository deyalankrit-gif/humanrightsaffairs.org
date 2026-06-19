"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useAuth, useUser, useFirestore } from '@/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ShieldAlert, Lock, ArrowRight, Loader2, Home, Eye, EyeOff, Terminal } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Root Access Login Page
 */
export default function RootLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const auth = useAuth()
  const db = useFirestore()
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const rootEmails = ['deydhritiman@gmail.com', 'deyalankrit@gmail.com'];
    if (user && rootEmails.includes(user.email?.toLowerCase() || '')) {
      router.push('/internal/analytics')
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const inputEmail = email.toLowerCase().trim()
    const isRootEmail = ['deydhritiman@gmail.com', 'deyalankrit@gmail.com'].includes(inputEmail);

    try {
      if (!isRootEmail) {
        throw new Error("Access Denied: Insufficient authorization level for this terminal.")
      }

      // Step 1: Sign in first
      await signInWithEmailAndPassword(auth, inputEmail, password)
      
      // Step 2: Now authenticated, ensure root document exists in the permission registry
      const userRef = doc(db, 'users', inputEmail)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: inputEmail,
          name: inputEmail === 'deyalankrit@gmail.com' ? 'Approved Staff Alankrit' : 'Root Administrator',
          role: 'admin',
          createdAt: serverTimestamp(),
          permissions: {
            analytics: true, members: true, visitors: true, accounts: true,
            expenses: true, applications: true, inventory: true, vendors: true,
            grievances: true, meetings: true, events: true, publicView: true
          }
        });
      }

      toast({
        title: "ROOT ACCESS GRANTED",
        description: "Governance privileges unlocked.",
      })
      router.push('/internal/analytics')
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "SECURITY ALERT",
        description: error.message || "Root authentication failed.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-widest">
            <Home className="w-3 h-3" /> Abort Session
          </Link>
        </div>
        
        <Card className="bg-slate-900 border-red-900/50 shadow-2xl rounded-[2.5rem] overflow-hidden border-t-8 border-t-red-600">
          <CardHeader className="text-center space-y-4 pb-2 pt-10">
            <div className="flex justify-center">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white p-2">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-headline font-bold text-white tracking-widest uppercase">Root Access</CardTitle>
              <CardDescription className="text-red-500 font-bold uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-2">
                <ShieldAlert className="w-3 h-3" /> LEVEL 5 CLEARANCE
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Root Identity</Label>
                <div className="relative">
                  <Input 
                    type="email" 
                    placeholder="deydhritiman@gmail.com" 
                    className="bg-black/50 border-red-900/30 text-red-500 h-12 rounded-xl pl-10 font-mono focus:ring-red-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-900" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Governance Key</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="bg-black/50 border-red-900/30 text-red-500 h-12 rounded-xl pl-10 pr-10 font-mono focus:ring-red-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              <Button 
                type="submit" 
                className="w-full bg-red-600 text-white font-bold h-14 text-lg rounded-xl hover:bg-red-700 transition-all shadow-[0_10px_40px_rgba(220,38,38,0.3)]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>INITIALIZE ROOT SESSION <ArrowRight className="ml-2 w-5 h-5" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
           <Link href="/internal/login" className="text-[10px] font-black uppercase text-slate-400 hover:text-primary tracking-[0.2em] transition-all">
             Return to Staff Access
           </Link>
        </div>
      </div>
    </main>
  )
}
