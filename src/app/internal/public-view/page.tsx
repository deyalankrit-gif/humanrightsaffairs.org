
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/firebase'
import { Loader2, Monitor, Globe, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * PublicViewPage provides an internal viewer for the public-facing site
 * directly within the administrative portal shell.
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
    <main className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 dark:bg-slate-900">
      {/* Sub-header for the preview controls */}
      <div className="bg-white dark:bg-slate-800 border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Monitor className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-primary dark:text-white leading-none">Public Site Mirror</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5" /> Internal Preview Mode
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider gap-2 border-slate-200"
          >
            <RefreshCw className="w-3 h-3" /> Refresh Preview
          </Button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <p className="text-[9px] font-bold text-slate-400 uppercase leading-none max-w-[120px] text-right">
            Displaying live content from the public root
          </p>
        </div>
      </div>

      {/* The Iframe Viewer */}
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
