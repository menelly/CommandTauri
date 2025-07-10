"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { Calendar, TrendingUp, AlertTriangle, Clock, Target, Download } from 'lucide-react'
import { useDailyData, CATEGORIES } from '@/lib/database'
import { format, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { UPPER_DIGESTIVE_SYMPTOMS, UPPER_DIGESTIVE_TRIGGERS, UPPER_DIGESTIVE_TREATMENTS, SEVERITY_LABELS } from './upper-digestive-constants'

interface UpperDigestiveEntry {
  id: string
  date: string
  time: string
  symptoms: string[]
  severity: string
  triggers: string[]
  treatments: string[]
  notes: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface AnalyticsProps {
  className?: string
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

export default function UpperDigestiveAnalyticsDesktop({ className }: AnalyticsProps) {
  const { getCategoryData, getDateRange } = useDailyData()
  const [entries, setEntries] = useState<UpperDigestiveEntry[]>([])
  const [timeRange, setTimeRange] = useState('30') // days
  const [loading, setLoading] = useState(true)

  // Load data based on time range
  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const days = parseInt(timeRange)
      const endDate = new Date()
      const startDate = subDays(endDate, days - 1)
      
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
      const allEntries: UpperDigestiveEntry[] = []

      for (const date of dateRange) {
        const dateKey = format(date, 'yyyy-MM-dd')
        const records = await getCategoryData(dateKey, CATEGORIES.TRACKER)
        const upperDigestiveRecord = records.find(record => record.subcategory === 'upper-digestive')

        if (upperDigestiveRecord?.content?.entries) {
          let entries = upperDigestiveRecord.content.entries
          if (typeof entries === 'string') {
            try {
              entries = JSON.parse(entries)
            } catch (e) {
              console.error('Failed to parse JSON:', e)
              entries = []
            }
          }
          if (Array.isArray(entries)) {
            allEntries.push(...entries)
          }
        }
      }

      setEntries(allEntries)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Map severity labels to numbers for calculations
  const severityToNumber = (severity: string): number => {
    switch (severity?.toLowerCase()) {
      case 'mild': return 3
      case 'moderate': return 6
      case 'severe': return 9
      default: return 0
    }
  }

  // Calculate analytics
  const totalEntries = entries.length
  const avgSeverity = entries.length > 0
    ? (entries.reduce((sum, entry) => sum + severityToNumber(entry.severity || ''), 0) / entries.length).toFixed(1)
    : '0'

  // Symptom frequency analysis
  const symptomFrequency = entries.reduce((acc, entry) => {
    entry.symptoms.forEach(symptom => {
      acc[symptom] = (acc[symptom] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const topSymptoms = Object.entries(symptomFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([symptom, count]) => ({ symptom, count }))

  // Trigger analysis
  const triggerFrequency = entries.reduce((acc, entry) => {
    entry.triggers.forEach(trigger => {
      acc[trigger] = (acc[trigger] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const topTriggers = Object.entries(triggerFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([trigger, count]) => ({ trigger, count }))

  // Treatment effectiveness (simplified)
  const treatmentFrequency = entries.reduce((acc, entry) => {
    entry.treatments.forEach(treatment => {
      acc[treatment] = (acc[treatment] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const topTreatments = Object.entries(treatmentFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([treatment, count]) => ({ treatment, count }))

  // Severity distribution
  const severityDistribution = entries.reduce((acc, entry) => {
    const severity = entry.severity || 'unknown'
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const severityData = Object.entries(severityDistribution)
    .map(([severity, count]) => ({
      severity: severity.charAt(0).toUpperCase() + severity.slice(1),
      count,
      label: severity
    }))
    .sort((a, b) => {
      const order = ['mild', 'moderate', 'severe', 'unknown']
      return order.indexOf(a.label) - order.indexOf(b.label)
    })

  // Time pattern analysis (by hour)
  const timePatterns = entries.reduce((acc, entry) => {
    const hour = parseInt(entry.time.split(':')[0])
    const timeSlot = hour < 6 ? 'Night (12-6am)' :
                   hour < 12 ? 'Morning (6am-12pm)' :
                   hour < 18 ? 'Afternoon (12-6pm)' :
                   'Evening (6pm-12am)'
    acc[timeSlot] = (acc[timeSlot] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const timeData = Object.entries(timePatterns)
    .map(([time, count]) => ({ time, count }))

  // Weekly trend
  const weeklyData = entries.reduce((acc, entry) => {
    const date = entry.date
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const trendData = Object.entries(weeklyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: format(parseISO(date), 'MMM dd'),
      count
    }))

  // Export data for Python analysis
  const exportAnalyticsData = () => {
    const analyticsData = {
      summary: {
        totalEntries,
        avgSeverity: parseFloat(avgSeverity),
        timeRange: parseInt(timeRange),
        dateRange: {
          start: format(subDays(new Date(), parseInt(timeRange) - 1), 'yyyy-MM-dd'),
          end: format(new Date(), 'yyyy-MM-dd')
        }
      },
      symptoms: {
        frequency: symptomFrequency,
        topSymptoms: topSymptoms.slice(0, 5)
      },
      triggers: {
        frequency: triggerFrequency,
        topTriggers: topTriggers.slice(0, 5)
      },
      treatments: {
        frequency: treatmentFrequency,
        topTreatments: topTreatments.slice(0, 5)
      },
      severity: {
        distribution: severityDistribution,
        average: parseFloat(avgSeverity)
      },
      timePatterns: timePatterns,
      trends: weeklyData,
      rawEntries: entries.map(entry => ({
        date: entry.date,
        time: entry.time,
        symptoms: entry.symptoms,
        severity: parseInt(entry.severity || '0'),
        triggers: entry.triggers,
        treatments: entry.treatments,
        notes: entry.notes
      }))
    }

    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `upper-digestive-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Upper Digestive Analytics</h2>
          <div className="animate-pulse bg-muted h-10 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Upper Digestive Analytics</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalyticsData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Episodes</p>
                <p className="text-2xl font-bold">{totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Severity</p>
                <p className="text-2xl font-bold">{avgSeverity}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Top Trigger</p>
                <p className="text-lg font-bold">{topTriggers[0]?.trigger || 'None'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Top Symptom</p>
                <p className="text-lg font-bold">{topSymptoms[0]?.symptom || 'None'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symptom Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Most Common Symptoms</CardTitle>
            <CardDescription>Frequency of symptoms over the last {timeRange} days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSymptoms}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="symptom"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trigger Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Common Triggers</CardTitle>
            <CardDescription>What might be causing your symptoms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTriggers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="trigger"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>How severe your symptoms typically are</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={false}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [value, props.payload.label]} />
                <Legend
                  formatter={(value, entry) => `${entry.payload.severity} (${entry.payload.count})`}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Time of Day Patterns</CardTitle>
            <CardDescription>When symptoms occur most often</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Episode Frequency Trend</CardTitle>
          <CardDescription>Daily episode count over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-4))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Treatment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Usage</CardTitle>
          <CardDescription>Most frequently used treatments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTreatments.map((treatment, index) => (
              <div key={treatment.treatment} className="flex items-center justify-between">
                <span className="text-sm font-medium">{treatment.treatment}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-chart-5"
                      style={{
                        width: `${(treatment.count / (topTreatments[0]?.count || 1)) * 100}%`
                      }}
                    />
                  </div>
                  <Badge variant="secondary">{treatment.count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Patterns and recommendations based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {totalEntries === 0 ? (
              <p className="text-muted-foreground">No data available for analysis. Start tracking to see insights!</p>
            ) : (
              <div className="space-y-3">
                {parseFloat(avgSeverity) > 7 && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">High Severity Alert</p>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        Your average severity is {avgSeverity}/10. Consider discussing with your healthcare provider.
                      </p>
                    </div>
                  </div>
                )}

                {topTriggers.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Top Trigger Identified</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        "{topTriggers[0].trigger}" appears in {topTriggers[0].count} episodes. Consider avoiding or managing this trigger.
                      </p>
                    </div>
                  </div>
                )}

                {timeData.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <Clock className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">Time Pattern Detected</p>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        Most episodes occur during {Object.entries(timePatterns).sort(([,a], [,b]) => b - a)[0]?.[0]}.
                        Consider preventive measures during this time.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
