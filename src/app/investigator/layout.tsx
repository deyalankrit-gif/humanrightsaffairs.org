"use client"

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  useUser, 
  useFirestore, 
  useDoc, 
  useMemoFirebase, 
  useAuth 
} from '@/firebase'
import { doc } from 'firebase/firestore'
import { LayoutDashboard, Bell, LogOut, Search, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from 'firebase/auth'

/**
 * InvestigatorLayout: Secure isolated terminal for investigative personnel.
 * Features total session isolation from the Root/Staff Admin Panel.
 */
export default function InvestigatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <InvestigatorTerminalContent>
      {children}
    </InvestigatorTerminalContent>
  )
}

function InvestigatorTerminalContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const auth = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'users', user.email.toLowerCase());
  }, [db, user?.email]);

  const { data: userData, loading: userLoading } = useDoc(userRef);

  useEffect(() => {
    if (mounted && !authLoading && !user && pathname !== '/investigator/login') {
      router.push('/investigator/login')
    }
  }, [user, authLoading, pathname, router, mounted])

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/investigator/login');
  }

  if (!mounted || authLoading || (user && userLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (pathname === '/investigator/login') return <>{children}</>;

  const navItems = [
    { name: 'Dashboard', href: '/investigator/dashboard', icon: LayoutDashboard },
    { name: 'Notifications', href: '/investigator/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-slate-900 text-white flex items-center px-6 sticky top-0 z-50 border-b-4 border-indigo-600/30">
        <div className="container mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                 <Search className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                 <h1 className="text-lg font-headline font-bold leading-none">Investigative <span className="text-indigo-400">Terminal</span></h1>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Authorized Access Only</p>
              </div>
           </div>

           <nav className="flex items-center gap-2">
              {navItems.map(item => (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" className={cn(
                    "h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-widest gap-2",
                    pathname === item.href ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                  )}>
                    <item.icon className="w-4 h-4" /> <span className="hidden md:inline">{item.name}</span>
                  </Button>
                </Link>
              ))}
           </nav>

           <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col text-right">
                 <p className="text-[10px] font-black text-emerald-400 uppercase leading-none">Officer Session</p>
                 <p className="text-[11px] font-bold text-slate-300 mt-1 truncate max-w-[150px]">{user?.email}</p>
              </div>
              <Button onClick={handleSignOut} size="icon" variant="ghost" className="rounded-full text-slate-400 hover:text-red-500">
                 <LogOut className="w-5 h-5" />
              </Button>
           </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        {children}
      </main>
      
      <footer className="py-6 border-t bg-white text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">National Investigative Registry • HRAT INDIA</p>
      </footer>
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return <Clock className={cn("animate-spin", className)} />
}
