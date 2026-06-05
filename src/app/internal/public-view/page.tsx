'use client';

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/firebase'
import { 
  Loader2, 
  Monitor, 
  RefreshCw,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * PublicViewPage provides an internal viewer for the public-facing site.
 * Adjusted to fit within the Sidebar-based administrative layout.
 */
export default function PublicViewPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [iframeKey, setIframeKey] = useState(0)

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

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {/* Mirror Controls */}
      <div className="bg-white dark:bg-slate-950 border-b flex items-center justify-between px-6 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-accent/10 rounded-lg">
            <Monitor className="w-4 h-4 text-accent" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[10px] font-bold text-primary dark:text-white leading-none uppercase tracking-widest">Public Site Mirror</h1>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Live Preview Root</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
            <Info className="w-3 h-3" />
            Navigating within the iframe preserves internal session
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-8 rounded-lg font-bold text-[9px] uppercase tracking-wider gap-2 shadow-sm"
          >
            <RefreshCw className="w-3 h-3" /> Reload Mirror
          </Button>
        </div>
      </div>

      {/* Full-bleed Iframe Viewer */}
      <div className="flex-1 relative bg-white">
        <iframe 
          key={iframeKey}
          src="/" 
          className="absolute inset-0 w-full h-full border-none"
          title="Public Site Preview"
        />
      </div>
    </main>
  )
}
