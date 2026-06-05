"use client"

import React from 'react'
import { ThemeToggle } from './theme-toggle'

export function HeaderActions() {
  return (
    <div className="ml-auto flex items-center gap-3">
      <ThemeToggle className="hover:bg-accent/10 rounded-lg" />
    </div>
  )
}
