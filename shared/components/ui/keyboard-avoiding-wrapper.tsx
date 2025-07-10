"use client"

import { ReactNode, useEffect, useState } from "react"

interface KeyboardAvoidingWrapperProps {
  children: ReactNode
  className?: string
}

export function KeyboardAvoidingWrapper({ 
  children, 
  className = "" 
}: KeyboardAvoidingWrapperProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    // Only run on mobile/PWA environments
    if (typeof window === 'undefined') return

    const handleResize = () => {
      // Detect virtual keyboard on mobile by viewport height change
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const windowHeight = window.screen.height
      
      // If viewport is significantly smaller than screen, keyboard is likely open
      const keyboardOpen = windowHeight - viewportHeight > 150
      
      if (keyboardOpen) {
        setKeyboardHeight(windowHeight - viewportHeight)
      } else {
        setKeyboardHeight(0)
      }
    }

    // Listen for viewport changes (mobile keyboard)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => window.visualViewport?.removeEventListener('resize', handleResize)
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div 
      className={`transition-all duration-300 ${className}`}
      style={{
        paddingBottom: keyboardHeight > 0 ? `${Math.min(keyboardHeight, 300)}px` : '0px'
      }}
    >
      {children}
    </div>
  )
}
