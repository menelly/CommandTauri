"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, Activity } from 'lucide-react'
import { differenceInDays } from 'date-fns'

interface CycleEntry {
  date: string
  flow?: string
  pain?: number
  mood?: string[]
  bbt?: number | null
  opk?: 'negative' | 'low' | 'high' | 'peak' | null
  cervicalFluid?: string
  ferning?: 'none' | 'partial' | 'full' | null
}

interface CycleAnalyticsProps {
  entries: CycleEntry[]
  lmpDate: string | null
  averageCycleLength?: number
  className?: string
}

export function CycleAnalytics({ entries, lmpDate, averageCycleLength = 28, className }: CycleAnalyticsProps) {
  // Fix hydration mismatch by using client-side state
  const [isClient, setIsClient] = useState(false)
  const [currentCycleDay, setCurrentCycleDay] = useState<number | null>(null)

  useEffect(() => {
    setIsClient(true)
    if (lmpDate) {
      const today = new Date()
      setCurrentCycleDay(differenceInDays(today, new Date(lmpDate)) + 1)
    }
  }, [lmpDate])
  
  // Count basic stuff
  const totalEntries = entries.length
  const entriesWithFlow = entries.filter(e => e.flow && e.flow !== 'none').length
  const entriesWithBBT = entries.filter(e => e.bbt !== null && e.bbt !== undefined).length
  const entriesWithOPK = entries.filter(e => e.opk && e.opk !== 'negative').length
  
  // Pain level distribution (simple)
  const painData = [
    { level: 'None (0)', count: entries.filter(e => !e.pain || e.pain === 0).length },
    { level: 'Mild (1-3)', count: entries.filter(e => e.pain && e.pain >= 1 && e.pain <= 3).length },
    { level: 'Moderate (4-6)', count: entries.filter(e => e.pain && e.pain >= 4 && e.pain <= 6).length },
    { level: 'Severe (7-10)', count: entries.filter(e => e.pain && e.pain >= 7 && e.pain <= 10).length },
  ].filter(item => item.count > 0)

  // Cycle progress (if we have LMP)
  const cycleProgress = currentCycleDay ? Math.min(100, (currentCycleDay / averageCycleLength) * 100) : 0

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Loading Analytics...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Cycle Overview */}
      {lmpDate && currentCycleDay && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Cycle
            </CardTitle>
            <CardDescription>
              Day {currentCycleDay} of estimated {averageCycleLength}-day cycle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Cycle Progress</span>
                  <span>{Math.round(cycleProgress)}%</span>
                </div>
                <Progress value={cycleProgress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">Day {currentCycleDay}</div>
                  <div className="text-sm text-muted-foreground">Current cycle day</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {Math.max(0, averageCycleLength - currentCycleDay)}
                  </div>
                  <div className="text-sm text-muted-foreground">Days until expected period</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Tracking Summary
          </CardTitle>
          <CardDescription>
            Your data collection over the last {totalEntries} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{entriesWithFlow}</div>
              <div className="text-sm text-muted-foreground">Period days logged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{entriesWithBBT}</div>
              <div className="text-sm text-muted-foreground">BBT readings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{entriesWithOPK}</div>
              <div className="text-sm text-muted-foreground">OPK tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{totalEntries}</div>
              <div className="text-sm text-muted-foreground">Total entries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pain Levels */}
      {painData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pain Level Distribution
            </CardTitle>
            <CardDescription>
              How often you experience different pain levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={painData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Simple Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Tracking Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Consistency is key:</strong> Try to log data daily for better patterns</p>
          <p>• <strong>BBT works best:</strong> Take temperature same time each morning before getting up</p>
          <p>• <strong>OPK timing:</strong> Test around the same time daily, usually afternoon</p>
          <p>• <strong>Patterns emerge:</strong> It takes 2-3 cycles to see your unique patterns</p>
        </CardContent>
      </Card>
    </div>
  )
}
