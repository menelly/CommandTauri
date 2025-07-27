/**
 * BATHROOM FLASK ANALYTICS COMPONENT 💩
 * Flask-powered lower digestive analytics, Bristol Scale analysis, and bowel movement pattern detection
 * 
 * Because digestive health data deserves proper analysis! 🚽✨
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Activity, TrendingUp, AlertCircle, Clock, Target, Heart, Wind } from 'lucide-react'

interface BathroomEntry {
  id: string
  date: string
  time: string
  status: string
  bristolScale: string
  painLevel: string
  notes: string
  count: number
  tags: string[]
  photos?: string[]
  createdAt: string
  updatedAt: string
}

interface BathroomFlaskAnalyticsProps {
  entries: BathroomEntry[]
  currentDate: string
  loadAllEntries?: (days: number) => Promise<BathroomEntry[]>
}

interface FlaskAnalyticsData {
  period: {
    start: string
    end: string
    days: number
  }
  total_movements: number
  total_visits: number
  status_analysis: {
    status_distribution: Record<string, number>
    most_common_status: string
    normal_percentage: number
  }
  bristol_analysis: {
    has_data: boolean
    bristol_distribution: Record<string, number>
    avg_bristol_score: number
    most_common_type: string
    constipation_episodes: number
    diarrhea_episodes: number
  }
  pain_analysis: {
    has_data: boolean
    avg_pain_level: number
    max_pain_level: number
    pain_distribution: Record<string, number>
    painful_episodes: number
  }
  frequency_patterns: {
    daily_average: number
    weekly_average: number
    frequency_by_day: Record<string, number>
    consistency_score: number
  }
  timing_patterns: {
    time_distribution: Record<string, number>
    peak_hours: string[]
    morning_percentage: number
  }
  insights: string[]
  charts: Record<string, string>
  error?: string
}

export default function BathroomFlaskAnalytics({ entries, currentDate, loadAllEntries }: BathroomFlaskAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<FlaskAnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30')

  // Load Flask analytics when entries change
  useEffect(() => {
    loadFlaskAnalytics()
  }, [dateRange])

  const loadFlaskAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load all entries across the date range for analytics
      const allEntries = loadAllEntries ?
        await loadAllEntries(parseInt(dateRange)) :
        entries

      if (allEntries.length === 0) {
        setAnalyticsData(null)
        setLoading(false)
        return
      }

      // 🚨 CRITICAL: Map actual data structure to Flask format
      const flaskEntries = allEntries.map(entry => ({
        date: entry.date,
        time: entry.time,
        status: entry.status,
        bristolScale: entry.bristolScale,
        painLevel: entry.painLevel,
        notes: entry.notes || '',
        count: entry.count || 1,
        tags: entry.tags || []
      }))

      console.log('💩 Sending bathroom data to Flask:', flaskEntries.length, 'entries')

      const response = await fetch('http://localhost:5000/api/analytics/bathroom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: flaskEntries,
          dateRange: parseInt(dateRange)
        })
      })

      if (!response.ok) {
        throw new Error(`Flask analytics failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('🎯 Flask bathroom analytics response:', data)

      if (data.error) {
        throw new Error(data.error)
      }

      setAnalyticsData(data)
    } catch (err) {
      console.error('Flask bathroom analytics error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Flask-powered bathroom analytics...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Analytics Error: {error}</p>
          <Button onClick={loadFlaskAnalytics} variant="outline">
            Retry Analytics
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Bathroom Data</h3>
          <p className="text-muted-foreground">
            Record bathroom visits to see Flask-powered digestive health analytics!
          </p>
        </CardContent>
      </Card>
    )
  }

  const { status_analysis, bristol_analysis, pain_analysis, frequency_patterns, timing_patterns, insights } = analyticsData

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-brown-500" />
          Flask-Powered Bathroom Analytics 💩
        </h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Insights Cards */}
      {insights && insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <Card key={index} className="border-l-4 border-l-brown-500">
              <CardContent className="p-4">
                <p className="text-sm font-medium">{insight}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-brown-500" />
            <div className="text-2xl font-bold">{analyticsData.total_movements}</div>
            <div className="text-sm text-muted-foreground">Total Visits</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{status_analysis.normal_percentage}%</div>
            <div className="text-sm text-muted-foreground">Normal Visits</div>
          </CardContent>
        </Card>

        {bristol_analysis.has_data && (
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{bristol_analysis.avg_bristol_score}</div>
              <div className="text-sm text-muted-foreground">Avg Bristol Score</div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{frequency_patterns.daily_average}</div>
            <div className="text-sm text-muted-foreground">Daily Average</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brown-500" />
              Status Analysis 💩
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Most Common:</span>
              <Badge variant="outline">{status_analysis.most_common_status}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Normal Visits:</span>
              <Badge variant={status_analysis.normal_percentage >= 70 ? "default" : "secondary"}>
                {status_analysis.normal_percentage}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Status Distribution:</div>
              {Object.entries(status_analysis.status_distribution).slice(0, 3).map(([status, count]) => (
                <div key={status} className="flex justify-between text-sm">
                  <span>{status.replace(/^[^\s]+ /, '')}:</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bristol Scale Analysis */}
        {bristol_analysis.has_data && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Bristol Scale Analysis 📊
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Average Score:</span>
                <Badge variant="outline">{bristol_analysis.avg_bristol_score}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Most Common:</span>
                <Badge variant="outline">{bristol_analysis.most_common_type}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Constipation Episodes:</span>
                <Badge variant={bristol_analysis.constipation_episodes > 0 ? "destructive" : "default"}>
                  {bristol_analysis.constipation_episodes}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Diarrhea Episodes:</span>
                <Badge variant={bristol_analysis.diarrhea_episodes > 0 ? "destructive" : "default"}>
                  {bristol_analysis.diarrhea_episodes}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pain Analysis */}
        {pain_analysis.has_data && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Pain Analysis 😣
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Average Pain:</span>
                <Badge variant="outline">{pain_analysis.avg_pain_level}/10</Badge>
              </div>
              <div className="flex justify-between">
                <span>Max Pain:</span>
                <Badge variant={pain_analysis.max_pain_level >= 8 ? "destructive" : "secondary"}>
                  {pain_analysis.max_pain_level}/10
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Painful Episodes:</span>
                <Badge variant={pain_analysis.painful_episodes > 0 ? "destructive" : "default"}>
                  {pain_analysis.painful_episodes}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Frequency Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Frequency Patterns 📈
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Daily Average:</span>
              <Badge variant="outline">{frequency_patterns.daily_average}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Weekly Average:</span>
              <Badge variant="outline">{frequency_patterns.weekly_average}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Consistency Score:</span>
              <Badge variant={frequency_patterns.consistency_score >= 70 ? "default" : "secondary"}>
                {frequency_patterns.consistency_score}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Timing Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              Timing Patterns ⏰
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Morning Visits:</span>
              <Badge variant="outline">{timing_patterns.morning_percentage}%</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Peak Hours:</div>
              {timing_patterns.peak_hours.slice(0, 3).map((hour, index) => (
                <div key={hour} className="flex justify-between text-sm">
                  <span>#{index + 1}:</span>
                  <Badge variant="secondary">{hour}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 🧃 Status Type Breakdown - ALL THE BATHROOM CHAOS! */}
        {status_analysis.status_distribution && Object.keys(status_analysis.status_distribution).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-brown-500" />
                Status Breakdown 💩
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(status_analysis.status_distribution).map(([status, count]) => {
                const percentage = ((count / analyticsData.total_movements) * 100).toFixed(1)
                const getStatusIcon = (statusType: string) => {
                  if (statusType.includes('💨')) return '💨'
                  if (statusType.includes('💩')) return '💩'
                  if (statusType.includes('💥')) return '💥'
                  if (statusType.includes('❗')) return '❗'
                  if (statusType.includes('💀')) return '💀'
                  return '🚽'
                }

                return (
                  <div key={status} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span>{getStatusIcon(status)}</span>
                      <span className="text-sm">{status.replace(/^[^\s]+ /, '')}</span>
                    </span>
                    <Badge variant="outline">
                      {count} ({percentage}%)
                    </Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
