
"use client"

import React, { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useAuth } from '@/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

/**
 * Forgot Password Page: Allows users to request a secure recovery link.
 * Aligned with HRAT institutional security standards.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const auth = useAuth()
  const { toast } = useToast()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim())
      setIsSent(true)
      toast({
        title: "Recovery Link Dispatched",
        description: "Check your inbox for further instructions.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error.message || "Could not initialize recovery protocol.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="bg-white border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden border-t-8 border-t-accent">
          <CardHeader className="text-center space-y-4 pb-2 pt-10">
            <div className="flex justify-center">
              <div className="p-4 bg-accent/10 rounded-2xl text-accent">
                {isSent ? <CheckCircle2 className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-headline font-bold text-primary">Identity Recovery</CardTitle>
              <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                {isSent ? "Verification Link Active" : "National Registry Protocol"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {isSent ? (
              <div className="text-center space-y-6 animate-in fade-in duration-500">
                <p className="text-sm text-slate-500 leading-relaxed">
                  A secure passphrase recovery link has been dispatched to <strong className="text-primary">{email}</strong>. 
                  Please check your inbox and spam folders to continue.
                </p>
                <Button asChild className="w-full h-12 rounded-xl bg-primary text-white font-bold">
                  <Link href="/member-login">Return to Login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">Registered Email</Label>
                  <div className="relative">
                    <Input 
                      type="email" 
                      placeholder="name@hrat.org" 
                      className="bg-slate-50 border-slate-200 h-12 rounded-xl pl-10 text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-accent text-white font-bold h-14 text-lg rounded-xl hover:bg-secondary transition-all shadow-xl shadow-accent/20" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Recovery Link"}
                </Button>
                <div className="text-center">
                  <Link href="/member-login" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-widest">
                    <ArrowLeft className="w-3 h-3" /> Back to Access Terminal
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
