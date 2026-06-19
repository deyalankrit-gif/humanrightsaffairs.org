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
 * Staff Access Login Page
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
    const isHardcodedStaff = inputEmail === 'deyalankrit@gmail.com' && password === 'Admin1234'

    try {
      // Step 1: Attempt Firebase Authentication first
      await signInWithEmailAndPassword(auth, inputEmail, password)

      // Step 2: Ensure user is authorized in the Firestore registry
      const userRef = doc(db, 'users', inputEmail)
      let userSnap = await getDoc(userRef)

      if (!userSnap.exists() && !isHardcodedStaff) {
        await signOut(auth)
        throw new Error("Clearance Required: Your email is not registered in the personnel database.")
      }

      // Step 3: Self-provision hardcoded staff if missing from registry
      if (isHardcodedStaff && !userSnap.exists()) {
        await setDoc(userRef, {
          email: inputEmail,
          name: 'Staff Alankrit',
          role: 'staff',
          lastLogin: serverTimestamp(),
          password: password, // Store key for secondary verification
          permissions: {
            analytics: false, // Default to disabled to test hierarchy
            memberAnalytics: true,
            members: true,
            visitors: true,
            accounts: true,
            expenses: true,
            applications: true,
            inventory: true,
            vendors: true,
            grievances: true,
            meetings: true,
            events: true,
            publicView: true
          }
        }, { merge: true });
        userSnap = await getDoc(userRef);
      }

      // Step 4: Secondary Governance Key Verification
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.password && userData.password !== password) {
          await signOut(auth);
          throw new Error("Access Denied: Stored governance key mismatch.");
        }
      }

      toast({
        title: "Staff Access Granted",
        description: "Credentials verified. Loading operational module.",
      })
      
      // Step 5: Intelligent Redirection Based on Permission Map
      const userData = userSnap.data();
      const perms = userData?.permissions || {};
      const isRoot = inputEmail === 'deydhritiman@gmail.com';
      
      if (isRoot) {
        router.push('/internal/analytics');
      } else {
        // Priority map for landing pages
        const priority = [
          { id: 'analytics', path: 'analytics' },
          { id: 'memberAnalytics', path: 'member-analytics' },
          { id: 'members', path: 'members' },
          { id: 'events', path: 'events' },
          { id: 'meetings', path: 'meetings' },
          { id: 'publicView', path: 'public-view' }
        ];
        
        const firstAvailable = priority.find(p => perms[p.id] === true);
        if (firstAvailable) {
          router.push(`/internal/${firstAvailable.path}`);
        } else {
          // If no specific operational modules, check others or fallback
          const anyPerm = Object.entries(perms).find(([k, v]) => v === true);
          if (anyPerm) {
            router.push(`/internal/${anyPerm[0] === 'memberAnalytics' ? 'member-analytics' : anyPerm[0]}`);
          } else {
            router.push('/internal/public-view');
          }
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Invalid credentials.",
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
                    placeholder="deyalankrit@gmail.com" 
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
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                Administrative session is monitored for data integrity.
              </p>
            </div>
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
