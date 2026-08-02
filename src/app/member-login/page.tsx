
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth'
import { useAuth, useFirestore, useUser } from '@/firebase'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  BadgeCheck, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Home, 
  Eye, 
  EyeOff, 
  UserCircle, 
  ShieldCheck,
  Phone,
  MessageSquare,
  CheckCircle2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { Captcha } from '@/components/captcha'
import { cn } from '@/lib/utils'

/**
 * Member Login Page: High-fidelity terminal for Trust members to access their private dashboards.
 * Features: Email/Password, Google Sign-In, and Phone Auth with OTP.
 */
export default function MemberLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCaptchaValid, setIsCaptchaValid] = useState(false)
  
  // Phone Auth States
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [isPhoneMode, setIsPhoneMode] = useState(false)

  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  // Initialize reCAPTCHA for Phone Auth
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        }
      });
    }
  }

  const handleSyncUser = async (firebaseUser: any) => {
    const userRef = doc(db, 'users', firebaseUser.email?.toLowerCase() || firebaseUser.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      // Create as inactive member if not in registry
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email?.toLowerCase() || '',
        phone: firebaseUser.phoneNumber || '',
        name: firebaseUser.displayName || 'New Member',
        role: 'member',
        status: 'inactive',
        permissions: { publicView: true },
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      throw new Error("Account Provisioned: Your identity is established but awaiting administrative approval.")
    } else {
      const userData = userSnap.data();
      if (userData.status === 'inactive') {
        throw new Error("Account Locked: Your membership is currently suspended or awaiting approval.")
      }
      await updateDoc(userRef, { lastLogin: serverTimestamp(), uid: firebaseUser.uid });
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isCaptchaValid) {
      toast({ variant: "destructive", title: "Verification Required", description: "Please complete the security captcha." })
      return
    }

    setIsLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password)
      await handleSyncUser(userCredential.user)
      toast({ title: "Access Granted", description: "Welcome back to the Justice Shield portal." })
      router.push('/account');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Denied", description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      await handleSyncUser(result.user)
      toast({ title: "Authorized via Google", description: "Identity verified successfully." })
      router.push('/account')
    } catch (error: any) {
      toast({ variant: "destructive", title: "Social Login Failed", description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOtp = async () => {
    if (!phoneNumber.startsWith('+')) {
      toast({ variant: "destructive", title: "Invalid Format", description: "Please include country code (e.g. +91)." })
      return
    }
    setIsLoading(true)
    setupRecaptcha()
    try {
      const appVerifier = (window as any).recaptchaVerifier
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      setConfirmationResult(result)
      toast({ title: "OTP Dispatched", description: "Check your mobile for the verification code." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Dispatch Failed", description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!confirmationResult || !verificationCode) return
    setIsLoading(true)
    try {
      const result = await confirmationResult.confirm(verificationCode)
      await handleSyncUser(result.user)
      toast({ title: "Phone Verified", description: "Welcome to the National Registry." })
      router.push('/account')
    } catch (error: any) {
      toast({ variant: "destructive", title: "Verification Failed", description: "The OTP entered is incorrect." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-8">
      <div id="recaptcha-container"></div>
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
          <CardContent className="p-8 space-y-6">
            
            {/* Alternative Login Methods */}
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="outline" 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                className="h-12 rounded-xl border-slate-200 gap-3 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
              >
                <img src="https://www.gstatic.com/firebase/anonymous/google.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </Button>
              
              {!isPhoneMode ? (
                <Button 
                  variant="outline" 
                  onClick={() => setIsPhoneMode(true)} 
                  disabled={isLoading}
                  className="h-12 rounded-xl border-slate-200 gap-3 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  <Phone className="w-4 h-4 text-emerald-500" />
                  Use Phone Number
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={() => { setIsPhoneMode(false); setConfirmationResult(null); }} 
                  className="text-[10px] font-bold uppercase text-slate-400"
                >
                  Switch to Email Login
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-slate-100 flex-1"></div>
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">or continue with</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            {isPhoneMode ? (
              <div className="space-y-4 animate-in fade-in duration-500">
                {!confirmationResult ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Mobile Number</Label>
                      <div className="relative">
                        <Input 
                          placeholder="+91 00000 00000" 
                          className="h-12 rounded-xl pl-10 text-sm font-bold"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <Button onClick={handleSendOtp} disabled={isLoading || !phoneNumber} className="w-full h-12 rounded-xl bg-primary font-bold">
                      {isLoading ? <Loader2 className="animate-spin" /> : "Send Verification Code"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Verification OTP</Label>
                      <div className="relative">
                        <Input 
                          placeholder="6-digit code" 
                          maxLength={6}
                          className="h-12 rounded-xl pl-10 text-center text-lg font-black tracking-[0.5em]"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <Button onClick={handleVerifyOtp} disabled={isLoading || verificationCode.length < 6} className="w-full h-12 rounded-xl bg-emerald-600 text-white font-bold">
                      {isLoading ? <Loader2 className="animate-spin" /> : "Confirm Identity"}
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmationResult(null)} className="w-full text-[10px] uppercase font-bold text-slate-400">Edit Number</Button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
                <div className="space-y-2">
                  <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Membership Email</Label>
                  <div className="relative">
                    <Input 
                      type="email" 
                      placeholder="abcd@gmail.com" 
                      className="bg-slate-50 border-slate-200 h-12 rounded-xl pl-10 text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
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
                      autoComplete="current-password"
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

                <div className="py-2 border-t border-slate-100">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block text-center">Security Verification</Label>
                  <Captcha onVerify={setIsCaptchaValid} />
                </div>

                <Button 
                  type="submit" 
                  className={cn(
                    "w-full font-bold h-14 text-lg rounded-xl transition-all shadow-xl group",
                    isCaptchaValid ? "bg-primary text-white hover:bg-secondary shadow-primary/20" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  )} 
                  disabled={isLoading || !isCaptchaValid}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Authorize & Enter <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
              </form>
            )}

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                New member?{' '}
                <Link href="/member-signup" className="text-secondary font-black uppercase tracking-widest text-[10px] hover:underline">Sign Up Now</Link>
              </p>
            </div>
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
