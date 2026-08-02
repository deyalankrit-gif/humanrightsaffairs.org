"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { useAuth, useFirestore } from '@/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { UserPlus, Mail, Lock, User, ArrowRight, Loader2, Home, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { Captcha } from '@/components/captcha'
import { cn } from '@/lib/utils'

/**
 * Member Sign-Up Page: Allows prospective members to register their digital identity.
 * Features: Double-line password verification and strict alphanumeric validation.
 * Includes alphanumeric captcha security protocol.
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
  
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isCaptchaValid) {
      toast({
        variant: "destructive",
        title: "Verification Required",
        description: "Please enter the correct captcha code to proceed.",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passphrase Mismatch",
        description: "The confirmation passphrase does not match the original entry.",
      })
      return
    }

    // Alphanumeric, min 8 chars, at least one capital letter
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast({
        variant: "destructive",
        title: "Security Requirement Not Met",
        description: "Passphrase must be at least 8 alphanumeric characters with at least one capital letter.",
      })
      return
    }

    setIsLoading(true)
    const inputEmail = email.toLowerCase().trim()
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, inputEmail, password)
      const firebaseUser = userCredential.user

      await updateProfile(firebaseUser, { displayName: name })

      const userRef = doc(db, 'users', inputEmail)
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: inputEmail,
        name: name,
        role: 'member',
        status: 'inactive',
        permissions: { publicView: true },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      setIsSuccess(true)
      toast({
        title: "Identity Established",
        description: "Your account is now awaiting administrative approval.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not complete the registration protocol.",
      })
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
              <p className="text-sm text-slate-500 leading-relaxed">
                Your digital identity has been created for <strong className="text-primary">{email}</strong>. 
                For security reasons, your account is currently <strong>Inactive</strong>.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 w-full">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Next Step</p>
               <p className="text-xs font-bold text-slate-600">The National Oversight Cell will review your credentials. You will be notified once access is approved.</p>
            </div>
            <Button asChild className="w-full h-12 rounded-xl bg-primary text-white font-bold">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-widest">
            <Home className="w-3 h-3" /> Abort Registration
          </Link>
        </div>
        
        <Card className="bg-white border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden border-t-8 border-t-accent">
          <CardHeader className="text-center space-y-4 pb-2 pt-10">
            <div className="flex justify-center">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-lg border border-slate-100 p-2">
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
          <CardContent className="p-8">
            <form onSubmit={handleSignup} className="space-y-5" autoComplete="off">
              <div className="space-y-2">
                <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Full Name</Label>
                <div className="relative">
                  <Input 
                    placeholder="Enter your legal name" 
                    className="bg-slate-50 border-slate-200 h-12 rounded-xl pl-10 text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Email Address</Label>
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
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Passphrase</Label>
                  <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-accent">
                    <AlertCircle className="w-3 h-3" /> 8+ Alphanumeric with 1 Capital
                  </div>
                </div>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create a secure key" 
                    className="bg-slate-50 border-slate-200 h-12 rounded-xl pl-10 pr-10 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Confirm Passphrase</Label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Re-enter secure key" 
                    className="bg-slate-50 border-slate-200 h-12 rounded-xl pl-10 pr-10 text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="py-4 border-t border-slate-100">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block text-center">Security Verification</Label>
                <Captcha onVerify={setIsCaptchaValid} />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                <p className="text-[9px] text-slate-400 font-bold uppercase text-center leading-relaxed">
                  By signing up, you agree to the organizational bylaws. Your account will remain inactive until approved by the board.
                </p>
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
                  <>Establish Identity <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <Link href="/member-login" className="text-accent font-black uppercase tracking-widest text-[10px] hover:underline">Sign In</Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
