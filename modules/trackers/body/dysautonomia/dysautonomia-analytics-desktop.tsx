/**
 * DYSAUTONOMIA ANALYTICS DESKTOP COMPONENT
 * Desktop-only analytics placeholder for dysautonomia tracking
 */

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Heart } from 'lucide-react'

export function DysautonomiaAnalyticsDesktop() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Dysautonomia Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Desktop Analytics Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            Advanced dysautonomia analytics with heart rate correlations, trigger patterns, 
            and intervention effectiveness will be available in the desktop version.
          </p>
          <div className="text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 inline mr-1" />
            Features planned: HR trend analysis, trigger correlation, intervention effectiveness tracking
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
