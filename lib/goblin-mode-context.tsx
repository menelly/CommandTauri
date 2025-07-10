"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface GoblinModeContextType {
  goblinMode: boolean
  setGoblinMode: (enabled: boolean) => void
}

const GoblinModeContext = createContext<GoblinModeContextType | undefined>(undefined)

export function GoblinModeProvider({ children }: { children: React.ReactNode }) {
  const [goblinMode, setGoblinModeState] = useState(true)

  const setGoblinMode = (enabled: boolean) => {
    setGoblinModeState(enabled)
    localStorage.setItem('chaos-goblin-mode', enabled.toString())
  }

  useEffect(() => {
    const savedGoblinMode = localStorage.getItem('chaos-goblin-mode') !== 'false'
    setGoblinModeState(savedGoblinMode)
  }, [])

  return (
    <GoblinModeContext.Provider value={{ goblinMode, setGoblinMode }}>
      {children}
    </GoblinModeContext.Provider>
  )
}

export function useGoblinMode() {
  const context = useContext(GoblinModeContext)
  if (context === undefined) {
    throw new Error('useGoblinMode must be used within a GoblinModeProvider')
  }
  return context
}
