"use client"

import React, { useState, useEffect } from 'react'

interface TypewriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
}

export function Typewriter({ text, speed = 100, delay = 0, className = "" }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!started) return

    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.substring(0, displayedText.length + 1))
      }, speed)
      return () => clearTimeout(timer)
    }
  }, [displayedText, text, started, speed])

  return (
    <span className={className}>
      {displayedText}
      {displayedText.length < text.length && (
        <span className="inline-block w-[2px] h-[0.9em] bg-accent ml-1 animate-blink align-middle"></span>
      )}
    </span>
  )
}