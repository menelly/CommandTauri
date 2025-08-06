"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface SensoryAnalyticsProps {
  refreshTrigger: number
}

export function SensoryAnalytics({ refreshTrigger }: SensoryAnalyticsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="text-6xl">📊</div>
          <div>
            <h3 className="text-lg font-medium">Sensory Analytics Coming Soon!</h3>
            <p className="text-muted-foreground">
              Beautiful patterns and insights about your sensory experiences will appear here.
              (Plus Flask integration for advanced analytics!)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
