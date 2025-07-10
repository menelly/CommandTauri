"use client"

import { useState } from "react"

// Simplified canvas component - sidebar is now handled at layout level

interface AppCanvasProps {
  children: React.ReactNode
  currentPage?: string
}

export default function AppCanvas({ children, currentPage = "index" }: AppCanvasProps) {
  // Simplified canvas - sidebar is now handled at layout level
  const [deviceOverride, setDeviceOverride] = useState<'desktop' | 'tablet' | 'mobile' | null>(null)

  // Apply device override classes
  const getDeviceClasses = () => {
    if (deviceOverride === 'mobile') return 'max-w-sm mx-auto'
    if (deviceOverride === 'tablet') return 'max-w-2xl mx-auto'
    return '' // desktop - full width
  }



  return (
    <div className={`min-h-screen bg-background ${getDeviceClasses()}`}>
      {/* Content Area */}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
