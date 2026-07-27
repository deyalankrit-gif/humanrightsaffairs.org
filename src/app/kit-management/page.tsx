
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Public Kit Tracking page has been decommissioned.
 * Redirecting to home.
 */
export default function RemovedKitTrackingPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/')
  }, [router])
  return null
}
