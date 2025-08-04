'use client'

import React from 'react'
import AppCanvas from '@/components/app-canvas'
import TestPinManagerComponent from '@/components/test-pin-manager'

export default function TestPinsPage() {
  return (
    <AppCanvas currentPage="test-pins">
      <div className="container mx-auto p-6">
        <TestPinManagerComponent />
      </div>
    </AppCanvas>
  )
}
