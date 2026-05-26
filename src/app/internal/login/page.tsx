
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useAuth, useUser } from '@/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

export default function InternalLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const auth = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      router.push('/internal/members')
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "Access Granted",
        description: "Welcome to the internal membership portal.",
      })
      router.push('/internal/members')
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid credentials or unauthorized access.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
      </div>

      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/10 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-white to-secondary"></div>
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20">
              <Image src="/HRAT%20Logo.jpeg" alt="HRAT Logo" fill className="object-contain" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-headline font-bold text-white">Internal Portal</CardTitle>
            <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Secure Access Only
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white text-xs font-bold uppercase tracking-wider">Authorized Email</Label>
              <div className="relative">
                <Input 
                  type="email" 
                  placeholder="admin@hrat-india.org" 
                  className="bg-white/5 border-white/10 text-white pl-10 focus:ring-accent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white text-xs font-bold uppercase tracking-wider">Security Key</Label>
              <div className="relative">
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-white/5 border-white/10 text-white pl-10 focus:ring-accent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-accent text-primary font-bold py-6 text-lg hover:bg-accent/90" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Enter Restricted Area <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </Button>
          </form>
          <p className="mt-8 text-center text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
            Authorized personnel only. Access is monitored and logged.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
