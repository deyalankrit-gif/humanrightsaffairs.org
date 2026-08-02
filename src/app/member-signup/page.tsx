
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth'
import { useAuth, useFirestore } from '@/firebase'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  Home, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  MessageSquare
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { Captcha } from '@/components/captcha'
import { cn } from '@/lib/utils'

/**
 * Member Sign-Up Page: Allows prospective members to register their digital identity.
 * Refined: Removed pre-filled state. Displays generic placeholders.
 */
export default function MemberSignupPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
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

  const setupRecaptcha = () => {
    const container = document.getElementById('recaptcha-container');
    if (!container) return;

    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {}
      (window as any).recaptchaVerifier = null;
    }
    
    container.innerHTML = '<div id="recaptcha-target"></div>';
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-target', {
      size: 'invisible'
    });
  }

  const handleCreateRegistryUser = async (firebaseUser: any, customName?: string) => {
    const userRef = doc(db, 'users', firebaseUser.email?.toLowerCase() || firebaseUser.uid)
    const userSnap = await getDoc(userRef)
    
    // Always initialize as inactive for vetting if not already active
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email?.toLowerCase() || '',
        phone: firebaseUser.phoneNumber || '',
        name: customName || firebaseUser.displayName || 'New Member',
        role: 'member',
        status: 'inactive',
        permissions: { publicView: true },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      setIsSuccess(true)
    } else {
      toast({ title: "Account Identified", description: "Identity already in registry. Redirecting to login." })
      router.push('/member-login')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isCaptchaValid) {
      toast({ variant: "destructive", title: "Verification Required", description: "Please complete the security captcha." })
      return
    }
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Passphrase Mismatch", description: "The confirmation passphrase does not match." })
      return
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast({ variant: "destructive", title: "Weak Security", description: "Passphrase must be 8+ alphanumeric chars with 1 Capital." })
      return
    }

    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password)
      await updateProfile(userCredential.user, { displayName: name })
      await handleCreateRegistryUser(userCredential.user, name)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      if (result.user) {
        await handleCreateRegistryUser(result.user)
      }
    } catch (error: any) {
      if (auth.currentUser) {
        router.push('/account')
        return
      }
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ variant: "destructive", title: "Social Error", description: error.message })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOtp = async () => {
    if (!phoneNumber.startsWith('+')) {
      toast({ variant: "destructive", title: "Invalid Format", description: "Use international format (e.g. +91)." })
      return
    }
    setIsLoading(true)
    setupRecaptcha()
    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, (window as any).recaptchaVerifier)
      setConfirmationResult(result)
      toast({ title: "Verification Dispatched" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "SMS Error", description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!confirmationResult || !verificationCode) return
    setIsLoading(true)
    try {
      const result = await confirmationResult.confirm(verificationCode)
      if (result.user) {
        await handleCreateRegistryUser(result.user)
      }
    } catch (error: any) {
      if (auth.currentUser) {
        router.push('/account')
      } else {
        toast({ variant: "destructive", title: "OTP Incorrect" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-8">
        <Card className="max-w-md w-full border-2 border-emerald-500 bg-white rounded-[2.5rem] shadow-2xl text-center p-10 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-bold text-primary">Registration Success</h2>
              <p className="text-sm text-slate-500 leading-relaxed">Your digital identity has been created. Our oversight cell will notify you once access is approved.</p>
            </div>
            <Button asChild className="w-full h-12 rounded-xl bg-primary text-white font-bold"><Link href="/">Return to Home</Link></Button>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-8">
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-widest">
            <Home className="w-3 h-3" /> Abort Registration
          </Link>
        </div>
        
        <Card className="bg-white border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden border-t-8 border-t-accent">
          <CardHeader className="text-center space-y-4 pb-2 pt-10">
            <div className="flex justify-center">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-slate-100 p-2">
                <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-headline font-bold text-primary">Member Registration</CardTitle>
              <CardDescription className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" /> National Force Induction
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">

            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="outline" 
                onClick={handleGoogleSignup} 
                disabled={isLoading}
                className="h-12 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-wider"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" className="mr-2" alt="Google" />
                Sign Up with Google
              </Button>
              
              {!isPhoneMode ? (
                <Button 
                  variant="outline" 
                  onClick={() => setIsPhoneMode(true)} 
                  disabled={isLoading}
                  className="h-12 rounded-xl border-slate-200 gap-3 font-bold text-xs uppercase tracking-wider"
                >
                  <Phone className="w-4 h-4 text-emerald-500" />
                  Sign Up with Phone
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={() => { setIsPhoneMode(false); setConfirmationResult(null); }} 
                  className="text-[10px] font-bold uppercase text-slate-400"
                >
                  Back to Email Signup
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
                      <Input 
                        placeholder="e.g. +91 00000 00000" 
                        className="h-12 rounded-xl text-sm font-bold"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <Button onClick={handleSendOtp} disabled={isLoading || !phoneNumber} className="w-full h-12 rounded-xl bg-primary font-bold">
                      {isLoading ? <Loader2 className="animate-spin" /> : "Verify via SMS"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">6-Digit Code</Label>
                      <Input 
                        placeholder="e.g. 123456" 
                        maxLength={6}
                        className="h-14 rounded-xl text-center text-2xl font-black tracking-[0.5em]"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <Button onClick={handleVerifyOtp} disabled={isLoading || verificationCode.length < 6} className="w-full h-12 rounded-xl bg-emerald-600 text-white font-bold">
                      {isLoading ? <Loader2 className="animate-spin" /> : "Verify Identity"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-5" autoComplete="off">
                <div className="space-y-2">
                  <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Full Name</Label>
                  <div className="relative">
                    <Input placeholder="e.g. Pradip Kumar Paul" className="h-12 rounded-xl pl-10 text-sm" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" required />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Email Address</Label>
                  <div className="relative">
                    <Input type="email" placeholder="your@email.com" className="h-12 rounded-xl pl-10 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" required />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Passphrase</Label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password123"
                      className="h-12 rounded-xl pl-10 pr-10 text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Confirm Passphrase</Label>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Password123"
                      className="h-12 rounded-xl pl-10 pr-10 text-sm"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div className="py-4 border-t border-slate-100">
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
                  {isLoading ? <Loader2 className="animate-spin" /> : <>Establish Identity <ArrowRight className="ml-2 w-5 h-5" /></>}
                </Button>
              </form>
            )}

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link href="/member-login" className="text-accent font-black uppercase tracking-widest text-[10px] hover:underline">Sign In</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
