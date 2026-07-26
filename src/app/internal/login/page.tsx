
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
      const userCredential = await signInWithEmailAndPassword(auth, inputEmail, password)
      const firebaseUser = userCredential.user;

      const userRef = doc(db, 'users', inputEmail)
      let userSnap = await getDoc(userRef)

      const isHardcodedStaff = inputEmail === 'deyalankrit@gmail.com' && password === 'Admin1234'
      
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
        terminated: true,
        occasions: true,
        financeDashboard: true,
        financeLedger: true,
        financeVouchers: true,
        financePayroll: true,
        financeProjects: true,
        financeAssets: true,
        financeCompliance: true
      }

      if (!userSnap.exists()) {
        if (isHardcodedStaff) {
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
          
          userSnap = await getDoc(userRef);
        } else {
          await signOut(auth)
          throw new Error("Clearance Required: Your identity is not present in the institutional registry.")
        }
      } else if (isHardcodedStaff) {
        // Sync permissions for hardcoded staff to ensure new modules are available
        await setDoc(userRef, { 
          permissions: initialPermissions,
          lastLogin: serverTimestamp() 
        }, { merge: true });
      }

      await setDoc(userRef, { lastLogin: serverTimestamp(), uid: firebaseUser.uid }, { merge: true });

      toast({
        title: "Access Granted",
        description: "Institutional clearance verified.",
      })
      
      const userData = userSnap.data();
      const perms = userData?.permissions || {};
      
      const priority = [
        { id: 'financeDashboard', path: 'finance/dashboard' },
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
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-8">
      <div className="w-full max-w-md space-y-6 md:space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-[10px] md:text-xs font-bold uppercase tracking-widest">
            <Home className="w-3 h-3 md:w-3.5 md:h-3.5" /> Public Portal
          </Link>
        </div>
        
        <Card className="bg-white border-slate-200 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-t-8 border-t-primary">
          <CardHeader className="text-center space-y-4 pb-2 pt-8 md:pt-10">
            <div className="flex justify-center">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-transparent p-2">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
            </div>
            <div className="space-y-1 px-4">
              <CardTitle className="text-xl md:text-2xl font-headline font-bold text-primary">Staff Access</CardTitle>
              <CardDescription className="text-primary/60 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px] flex items-center justify-center gap-2">
                <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-500" /> Operational Clearance
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Official Email</Label>
                <div className="relative">
                  <Input 
                    type="email" 
                    placeholder="name@hrat.org" 
                    className="bg-slate-50 border-slate-200 h-11 md:h-12 rounded-xl pl-10 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Passphrase</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="bg-slate-50 border-slate-200 h-11 md:h-12 rounded-xl pl-10 pr-10 text-sm"
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
                className="w-full bg-primary text-white font-bold h-12 md:h-14 text-base md:text-lg rounded-xl hover:bg-secondary transition-all shadow-xl shadow-primary/20 group" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Authorize Entry <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
           <Link href="/internal/super-login" className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 hover:text-accent tracking-[0.2em] transition-all">
             Switch to Root Access
           </Link>
        </div>
      </div>
    </main>
  )
}
