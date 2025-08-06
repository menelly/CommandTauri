'use client'

import React, { useEffect } from 'react'
import { useUser } from '@/lib/contexts/user-context'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const { logout } = useUser()
  const router = useRouter()

  useEffect(() => {
    // Immediately logout and redirect to home/login
    logout()
    router.push('/')
  }, [logout, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-2xl mb-2">🚪</div>
        <p className="text-muted-foreground">Logging out...</p>
      </div>
    </div>
  )
}
