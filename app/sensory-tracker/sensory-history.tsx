"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface SensoryHistoryProps {
  refreshTrigger: number
  onEdit: (entry: any) => void
  onDelete: (entry: any) => void
}

export function SensoryHistory({ refreshTrigger, onEdit, onDelete }: SensoryHistoryProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="text-6xl">🌈</div>
          <div>
            <h3 className="text-lg font-medium">Sensory History Coming Soon!</h3>
            <p className="text-muted-foreground">
              Your sensory tracking journey will appear here with beautiful, caring displays.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
