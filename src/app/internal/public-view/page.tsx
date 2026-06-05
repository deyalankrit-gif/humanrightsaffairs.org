
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/firebase'
import { 
  Loader2, 
  Monitor, 
  Globe, 
  RefreshCw,
  Home,
  Handshake,
  Calendar,
  Users,
  UserCheck,
  UserX,
  MessageSquareWarning,
  Scale,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const publicLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Meetings', href: '/meetings', icon: Handshake },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Leadership', href: '/leadership', icon: Users },
  { name: 'Personnel', href: '/members', icon: UserCheck },
  { name: 'Revocations', href: '/terminated-members', icon: UserX },
  { name: 'Grievance', href: '/#grievances', icon: MessageSquareWarning },
  { name: 'Rights', href: '/#knowledge', icon: Scale },
  { name: 'Helpline', href: '/#helpline', icon: Phone },
]

/**
 * PublicViewPage provides an internal viewer for the public-facing site
 * directly within the administrative portal shell.
 */
export default function PublicViewPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [iframeKey, setIframeKey] = useState(0)
  const [currentUrl, setCurrentUrl] = useState('/')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/internal/login')
    }
  }, [user, authLoading, router])

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

  const navigateTo = (href: string) => {
    setCurrentUrl(href)
    // Force iframe reload
    setIframeKey(prev => prev + 1)
  }

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 dark:bg-slate-900">
      {/* Sub-header for the preview controls */}
      <div className="bg-white dark:bg-slate-800 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between shadow-sm z-10 transition-colors">
        
        {/* Identifier Section */}
        <div className="flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 shrink-0">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Monitor className="w-4 h-4 text-accent" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-[10px] font-bold text-primary dark:text-white leading-none uppercase tracking-widest">Public Site Mirror</h1>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
              <Globe className="w-2 h-2" /> Internal Preview
            </p>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 relative flex items-center overflow-hidden">
          <div className="flex-1 flex items-center gap-2 overflow-x-auto px-4 py-2 no-scrollbar scroll-smooth">
            {publicLinks.map((link) => {
              const isActive = currentUrl === link.href
              return (
                <Button
                  key={link.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateTo(link.href)}
                  className={cn(
                    "h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider gap-2 shrink-0 border transition-all",
                    isActive 
                      ? "bg-accent/10 text-accent border-accent/20" 
                      : "text-slate-500 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-white"
                  )}
                >
                  <link.icon className={cn("w-3.5 h-3.5", isActive ? "text-accent" : "text-slate-400")} />
                  {link.name}
                </Button>
              )
            })}
          </div>
        </div>
        
        {/* Global Controls Area */}
        <div className="flex items-center gap-2 px-6 py-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider gap-2 border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3 h-3" /> Refresh Preview
          </Button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
          <p className="text-[9px] font-bold text-slate-400 uppercase leading-none max-w-[120px] text-right hidden lg:block">
            Displaying live content from the public root
          </p>
        </div>
      </div>

      {/* The Iframe Viewer */}
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
