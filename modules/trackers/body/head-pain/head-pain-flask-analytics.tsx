/**
 * HEAD PAIN FLASK ANALYTICS COMPONENT 🧠
 * Flask-powered migraine tracking, trigger analysis, and pain pattern detection
 * 
 * Because head pain patterns are CRUCIAL for management! 💊
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Brain, Zap, TrendingUp, AlertCircle, Clock, Target } from 'lucide-react'

interface HeadPainEntry {
  entry_date: string
  entry_time: string
  pain_type: string
  severity: number
  location: string[]
  duration_hours?: number
  triggers: string[]
  symptoms: string[]
  medications: string[]
  relief_methods: string[]
  effectiveness?: number
  notes: string
  tags?: string[]
}

interface HeadPainFlaskAnalyticsProps {
  entries: HeadPainEntry[]
  currentDate: string
  loadAllEntries?: (days: number) => Promise<HeadPainEntry[]>
}

interface FlaskAnalyticsData {
  period: {
    start: string
    end: string
    days: number
  }
  total_episodes: number
  pain_analysis: {
    avg_severity: number
    max_severity: number
    severity_distribution: Record<string, number>
    pain_types: Record<string, number>
    most_common_type: string
  }
  duration: {
    has_data: boolean
    avg_duration?: number
    total_hours?: number
    longest_episode?: number
    shortest_episode?: number
  }
  triggers: {
    trigger_counts: Record<string, number>
    top_triggers: string[]
  }
  medications: {
    medication_counts: Record<string, number>
    effectiveness_avg: Record<string, number>
    most_effective: string[]
  }
  patterns: {
    episodes_by_day: Record<string, number>
    episodes_by_hour: Record<string, number>
    weekly_average: number
    daily_average: number
  }
  relief: {
    relief_methods: Record<string, number>
    avg_effectiveness: number
  }
  insights: string[]
  charts: Record<string, string>
  error?: string
}

export default function HeadPainFlaskAnalytics({ entries, currentDate, loadAllEntries }: HeadPainFlaskAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<FlaskAnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30')

  // Load Flask analytics when date range changes
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

      // 🚨 DEBUG: Log actual entry structure
      console.log('🧠 Raw entry structure:', allEntries[0])
      console.log('🧠 Entry keys:', Object.keys(allEntries[0] || {}))

      // 🚨 CRITICAL: Map actual HeadPainEntry structure to Flask format
      const flaskEntries = allEntries.map(entry => ({
        date: entry.date,
        time: entry.timestamp,
        painType: entry.painType || [],
        severity: entry.painIntensity,
        location: entry.painLocation || [],
        duration: entry.duration,
        triggers: entry.triggers || [],
        symptoms: entry.associatedSymptoms || [],
        auraPresent: entry.auraPresent || false,
        auraSymptoms: entry.auraSymptoms || [],
        treatments: entry.treatments || [],
        effectiveness: entry.treatmentEffectiveness,
        functionalImpact: entry.functionalImpact,
        notes: entry.notes || '',
        tags: entry.tags || []
      }))

      console.log('🧠 Sending head pain data to Flask:', flaskEntries.length, 'entries')
      console.log('🧠 Sample entry being sent:', flaskEntries[0])
      console.log('🧠 Date range:', dateRange)

      const response = await fetch('http://localhost:5000/api/analytics/head-pain', {
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
      console.log('🎯 Flask head pain analytics response:', data)
      console.log('🎯 Response keys:', Object.keys(data))
      console.log('🎯 Total episodes:', data.total_episodes)

      if (data.error) {
        throw new Error(data.error)
      }

      setAnalyticsData(data)
    } catch (err) {
      console.error('Flask head pain analytics error:', err)
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
          <p className="text-muted-foreground">Loading Flask-powered head pain analytics...</p>
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

  if (!analyticsData || entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Head Pain Data</h3>
          <p className="text-muted-foreground">
            Record head pain episodes to see Flask-powered migraine and trigger analytics!
          </p>
        </CardContent>
      </Card>
    )
  }

  const {
    pain_analysis = {},
    duration = {},
    triggers = {},
    medications = {},
    patterns = {},
    relief = {},
    insights = []
  } = analyticsData || {}

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-500" />
          Flask-Powered Head Pain Analytics 🧠
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
            <Card key={index} className="border-l-4 border-l-purple-500">
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
            <Zap className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{analyticsData.total_episodes}</div>
            <div className="text-sm text-muted-foreground">Total Episodes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{pain_analysis.avg_severity || 0}/10</div>
            <div className="text-sm text-muted-foreground">Avg Severity</div>
          </CardContent>
        </Card>

        {duration.has_data && (
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{duration.avg_duration}h</div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{patterns.weekly_average || 0}</div>
            <div className="text-sm text-muted-foreground">Weekly Average</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pain Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500" />
              Pain Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Most Common Type:</span>
              <Badge variant="outline">{pain_analysis.most_common_type || 'N/A'}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Max Severity:</span>
              <Badge variant={(pain_analysis.max_severity || 0) >= 8 ? "destructive" : "secondary"}>
                {pain_analysis.max_severity || 0}/10
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Pain Types:</div>
              {Object.entries(pain_analysis.pain_types || {}).slice(0, 3).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{type}:</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Triggers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Top Triggers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(triggers.top_triggers || []).slice(0, 5).map((trigger, index) => (
              <div key={trigger} className="flex justify-between">
                <span className="text-sm">{trigger}</span>
                <Badge variant="outline">{(triggers.trigger_counts || {})[trigger]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Medication Effectiveness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Medication Effectiveness 💊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {medications.most_effective.slice(0, 5).map((med) => (
              <div key={med} className="flex justify-between">
                <span className="text-sm">{med}</span>
                <Badge variant="outline">
                  {medications.effectiveness_avg[med]}/10
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 🧃 Pain Type Breakdown - ALL THE CHAOS! */}
        {pain_analysis.pain_types && Object.keys(pain_analysis.pain_types).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Pain Type Breakdown 🧠
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(pain_analysis.pain_types).map(([type, count]) => {
                const percentage = ((count / analyticsData.total_episodes) * 100).toFixed(1)
                const getTypeIcon = (painType: string) => {
                  switch (painType.toLowerCase()) {
                    case 'migraine': return '🌩️'
                    case 'tension': return '😤'
                    case 'cluster': return '🔥'
                    case 'sinus': return '🤧'
                    case 'cervicogenic': return '🦴'
                    default: return '🧠'
                  }
                }

                return (
                  <div key={type} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span>{getTypeIcon(type)}</span>
                      <span className="capitalize">{type}</span>
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

        {/* 🧃 Relief Methods - What actually helps! */}
        {relief.relief_methods && Object.keys(relief.relief_methods).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-500" />
                Relief Methods 🛠️
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(relief.relief_methods)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([method, count]) => (
                  <div key={method} className="flex justify-between items-center">
                    <span className="text-sm">{method}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Avg Effectiveness:</span>
                  <Badge variant="outline">{relief.avg_effectiveness}/10</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
