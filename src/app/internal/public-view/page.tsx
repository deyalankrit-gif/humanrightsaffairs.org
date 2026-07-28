
'use client';

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/firebase'
import { 
  Loader2, 
  Monitor, 
  RefreshCw,
  Info,
  Home,
  Calendar,
  Users,
  UserCheck,
  UserX,
  Scale,
  Phone,
  Image as ImageIcon,
  ShieldAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const publicLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
  { name: 'Leadership', href: '/leadership', icon: Users },
  { name: 'Members', href: '/members', icon: UserCheck },
  { name: 'Terminated', href: '/terminated-members', icon: UserX },
  { name: 'Report', href: '/report-a-complaint', icon: ShieldAlert },
  { name: 'Rights', href: '/#knowledge', icon: Scale },
  { name: 'Helpline', href: '/#helpline', icon: Phone },
]

/**
 * PublicViewPage provides an internal viewer for the public-facing site.
 * Enhanced: Horizontal navigation now centers the active item automatically.
 */
export default function PublicViewPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [iframeKey, setIframeKey] = useState(0)
  const [currentUrl, setCurrentUrl] = useState('/')
  const activeBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

  // Center the active button in the horizontal navigation tray
  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [currentUrl]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1)
  }

  const navigateMirror = (href: string) => {
    setCurrentUrl(href)
    setIframeKey(prev => prev + 1)
  }

  return (
    <main className="flex flex-col h-[calc(100vh-40px)] bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {/* Mirror Header with Scrollbar */}
      <div className="bg-white dark:bg-slate-950 border-b flex flex-col shrink-0">
        <div className="flex items-center justify-between px-6 py-1.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Monitor className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 leading-none uppercase tracking-widest">Public Site Mirror</h1>
              <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Live Preview Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase">
              <Info className="w-2.5 h-2.5" />
              Internal Session Preserved
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="h-7 rounded-lg font-bold text-[8px] uppercase tracking-wider gap-2 shadow-sm px-3"
            >
              <RefreshCw className="w-3 h-3" /> Reload Mirror
            </Button>
          </div>
        </div>

        {/* Scrollable Navigation Area with Visible Scrollbar */}
        <nav className="flex items-center overflow-x-auto admin-scrollbar px-4 py-2.5 gap-3 bg-slate-50/50 dark:bg-slate-900/50 scroll-smooth no-scrollbar">
          {publicLinks.map((link) => {
            const isActive = currentUrl === link.href;
            return (
              <button
                key={link.name}
                ref={isActive ? activeBtnRef : null}
                onClick={() => navigateMirror(link.href)}
                className={cn(
                  "whitespace-nowrap flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all border shrink-0",
                  isActive
                    ? "bg-accent text-primary border-accent shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:border-accent hover:text-accent"
                )}
              >
                <link.icon className={cn("w-3.5 h-3.5", isActive ? "text-primary" : "text-slate-400")} />
                {link.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Full-bleed Iframe Viewer */}
      <div className="flex-1 relative bg-white">
        <iframe 
          key={iframeKey}
          src={currentUrl} 
          className="absolute inset-0 w-full h-full border-none"
          title="Public Site Preview"
        />
      </div>
    </main>
  )
}
