"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, AlertCircle } from 'lucide-react'
import { predictOvulation } from './ovulation-predictor'

interface CycleEntry {
  date: string
  flow?: string
  opk?: 'negative' | 'high' | 'low' | 'peak' | null
  bbt?: number | null
  cervicalFluid?: string
  ferning?: 'none' | 'partial' | 'full' | null
}

interface OvulationPredictionCardProps {
  entries: CycleEntry[]
  lmpDate?: string | null
  averageCycleLength?: number
  className?: string
}

export function OvulationPredictionCard({ 
  entries, 
  lmpDate = null, 
  averageCycleLength = 28, 
  className 
}: OvulationPredictionCardProps) {
  const [isClient, setIsClient] = useState(false)
  const [prediction, setPrediction] = useState<{
    status: string,
    confidence: string,
    message: string,
    method: string,
    daysUntilOvulation: number | null,
    predictedDay?: number | null,
    fertileWindowStart?: number | null,
    fertileWindowEnd?: number | null
  } | null>(null)

  useEffect(() => {
    setIsClient(true)
    // DEBUG: Log the data to see what we're getting
    console.log('🔍 DEBUG: Entries passed to prediction:', entries)
    console.log('🔍 DEBUG: LMP Date:', lmpDate)
    console.log('🔍 DEBUG: Average cycle length:', averageCycleLength)

    // Calculate prediction on client side to avoid hydration issues
    const result = predictOvulation(entries, lmpDate, averageCycleLength)
    console.log('🔍 DEBUG: Prediction result:', result)
    setPrediction(result)
  }, [entries, lmpDate, averageCycleLength])

  if (!isClient) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Ovulation Prediction
          </CardTitle>
          <CardDescription>Loading prediction...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!prediction) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Ovulation Prediction
          </CardTitle>
          <CardDescription>Unable to calculate prediction</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Not enough data available for prediction.</p>
        </CardContent>
      </Card>
    )
  }

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ovulation-likely': return 'text-purple-600'
      case 'pre-ovulation': return 'text-green-600'
      case 'post-ovulation': return 'text-blue-600'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Ovulation Prediction
          <Badge variant={getConfidenceBadgeVariant(prediction.confidence)}>
            {prediction.confidence} confidence
          </Badge>
        </CardTitle>
        <CardDescription>
          Based on {prediction.method.replace('-', ' ')} analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Prediction Message */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className={`text-lg font-medium ${getStatusColor(prediction.status)}`}>
            {prediction.message}
          </p>
        </div>

        {/* Prediction Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {prediction.predictedDay && (
            <div>
              <div className="text-2xl font-bold text-primary">Day {prediction.predictedDay}</div>
              <div className="text-sm text-muted-foreground">Predicted ovulation</div>
            </div>
          )}
          
          {prediction.daysUntilOvulation !== null && (
            <div>
              <div className="text-2xl font-bold text-primary">
                {prediction.daysUntilOvulation === 0 
                  ? 'Today' 
                  : prediction.daysUntilOvulation > 0 
                    ? `${prediction.daysUntilOvulation} days`
                    : `${Math.abs(prediction.daysUntilOvulation)} days ago`
                }
              </div>
              <div className="text-sm text-muted-foreground">
                {prediction.daysUntilOvulation >= 0 ? 'Until ovulation' : 'Since ovulation'}
              </div>
            </div>
          )}

          {prediction.fertileWindowStart && prediction.fertileWindowEnd && (
            <div>
              <div className="text-2xl font-bold text-primary">
                Days {prediction.fertileWindowStart}-{prediction.fertileWindowEnd}
              </div>
              <div className="text-sm text-muted-foreground">Fertile window</div>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Cycle Status</span>
            <span className={getStatusColor(prediction.status)}>
              {prediction.status.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </span>
          </div>
          
          {prediction.fertileWindowStart && prediction.fertileWindowEnd && (
            <Progress 
              value={prediction.status === 'pre-ovulation' ? 30 : 
                     prediction.status === 'ovulation-likely' ? 70 : 
                     prediction.status === 'post-ovulation' ? 100 : 0} 
              className="h-2" 
            />
          )}
        </div>

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Tip:</strong> Track BBT and cervical fluid for more accurate predictions</p>
          <p>📊 <strong>Note:</strong> Predictions improve with more cycle data</p>
        </div>
      </CardContent>
    </Card>
  )
}
