
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Legacy Login page has been decommissioned.
 * Administrative login is handled via /internal/login.
 */
export default function DecommissionedLoginPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/')
  }, [router])

  return null
}
