"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Download, Printer, ShieldCheck, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * ActivityCalendarPage provides a full-screen, high-fidelity viewer for the Trust's official schedule.
 * Features: Immersive scaling, one-handed panning (click/touch drag), mouse wheel zoom, and zero-margin layout.
 */
export default function ActivityCalendarPage() {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  
  const handlePrint = () => {
    window.print()
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4))
  const zoomOut = () => {
    setZoom(prev => {
      const next = Math.max(prev - 0.25, 0.5)
      if (next <= 1) setPosition({ x: 0, y: 0 }) // Reset position if zoomed out to normal
      return next
    })
  }

  const resetZoom = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  // Mouse Wheel Zoom Implementation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const zoomStep = 0.1 // Smooth scroll increment
      if (e.deltaY < 0) {
        setZoom(prev => Math.min(prev + zoomStep, 4))
      } else {
        setZoom(prev => {
          const next = Math.max(prev - zoomStep, 0.5)
          if (next <= 1) setPosition({ x: 0, y: 0 })
          return next
        })
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [])

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1) return
    setIsDragging(true)
    const touch = e.touches[0]
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const touch = e.touches[0]
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    })
  }

  return (
    <main className="h-screen w-screen bg-slate-950 overflow-hidden flex flex-col relative select-none">
      
      {/* Floating Minimalist Control Bar - Overlays content to save space */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none print:hidden">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button asChild variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-accent hover:text-primary transition-all">
            <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-2xl flex items-center gap-3">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white hidden sm:inline">Activity Calendar 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-white/10 backdrop-blur-xl p-1 rounded-full border border-white/20 shadow-2xl flex items-center gap-1">
             <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8 rounded-full text-white hover:bg-white/20" disabled={zoom <= 0.5}>
               <ZoomOut className="w-4 h-4" />
             </Button>
             <div className="w-10 text-center text-[9px] font-black text-white">
               {Math.round(zoom * 100)}%
             </div>
             <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8 rounded-full text-white hover:bg-white/20" disabled={zoom >= 4}>
               <ZoomIn className="w-4 h-4" />
             </Button>
             <div className="w-px h-4 bg-white/20 mx-1"></div>
             <Button variant="ghost" size="icon" onClick={resetZoom} className="h-8 w-8 rounded-full text-white hover:bg-white/20" title="Reset">
               <RotateCcw className="w-4 h-4" />
             </Button>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white transition-all">
              <Printer className="w-5 h-5" />
            </Button>
            <Button asChild size="icon" className="h-10 w-10 rounded-full shadow-2xl bg-accent text-primary hover:bg-secondary hover:text-white transition-all">
              <a href="/Activity Calender.jpeg" download>
                <Download className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Full-Screen Content Area */}
      <div 
        ref={containerRef}
        className={cn(
          "flex-1 w-full h-full relative overflow-hidden bg-slate-950 flex items-center justify-center transition-colors",
          isDragging ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Dynamic Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        {/* The Calendar Viewer - Calculated to fill 100% of height with 0 gaps */}
        <div 
          className="relative w-full h-full transition-transform duration-75 ease-out flex items-center justify-center will-change-transform"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`
          }}
        >
          <div className="relative w-full h-full">
            <Image 
              src="/Activity Calender.jpeg" 
              alt="HRAT Official Activity Calendar" 
              fill 
              className="object-contain"
              priority
              sizes="100vw"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Bottom Legal Tag - Slim and Non-intrusive */}
      <div className="absolute bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none print:hidden">
        <div className="bg-black/40 backdrop-blur-md px-6 py-1.5 rounded-full border border-white/5 flex items-center gap-3">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">Official Mission Schedule • Human Rights Affairs Trust</p>
        </div>
      </div>

    </main>
  )
}
