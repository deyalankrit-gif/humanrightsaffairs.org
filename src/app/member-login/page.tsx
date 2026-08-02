
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useAuth, useFirestore, useUser } from '@/firebase'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { BadgeCheck, Lock, ArrowRight, Loader2, Home, Eye, EyeOff, UserCircle, ShieldCheck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Member Login Page: High-fidelity terminal for Trust members to access their private dashboards.
 * Features: Automatic role verification, status approval checks, and password recovery redirection.
 */
export default function MemberLoginPage() {
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
      const userCredential = await signInWithEmailAndPassword(auth, inputEmail, password)
      const firebaseUser = userCredential.user;

      const userRef = doc(db, 'users', inputEmail)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        // Fallback for members who have profiles but no 'user' account yet (auto-provision as 'member')
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: inputEmail,
          name: firebaseUser.displayName || inputEmail.split('@')[0],
          role: 'member',
          status: 'active',
          permissions: { publicView: true },
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else {
        const userData = userSnap.data();
        if (userData.status === 'inactive') {
          throw new Error("Account Locked: Your membership access is currently suspended or awaiting administrative approval.")
        }
        await updateDoc(userRef, { lastLogin: serverTimestamp(), uid: firebaseUser.uid });
      }

      toast({
        title: "Access Granted",
        description: "Welcome back to the Justice Shield portal.",
      })
      
      router.push('/account');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Denied",
        description: error.message || "Invalid credentials or unauthorized membership status.",
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
            <Home className="w-3 h-3" /> Return to Portal
          </Link>
        </div>
        
        <Card className="bg-white border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden border-t-8 border-t-secondary">
          <CardHeader className="text-center space-y-4 pb-2 pt-10">
            <div className="flex justify-center">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-slate-100 p-2">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-headline font-bold text-primary">Member Access</CardTitle>
              <CardDescription className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2">
                <BadgeCheck className="w-4 h-4" /> Verified Membership Node
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Membership Email</Label>
                <div className="relative">
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="bg-slate-50 border-slate-200 h-12 rounded-xl pl-10 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Passphrase</Label>
                  <Link href="/forgot-password" size="sm" className="text-[9px] font-black uppercase text-accent hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="bg-slate-50 border-slate-200 h-12 rounded-xl pl-10 pr-10 text-sm"
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
                  <>Authorize & Enter <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  New member?{' '}
                  <Link href="/member-signup" className="text-secondary font-black uppercase tracking-widest text-[10px] hover:underline">Sign Up Now</Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center p-4 bg-white/50 rounded-2xl border border-dashed border-slate-200">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
             Only active members of the Human Rights Affairs Trust can access this terminal. 
             Misuse is subject to legal oversight.
           </p>
        </div>
      </div>
    </main>
  )
}
