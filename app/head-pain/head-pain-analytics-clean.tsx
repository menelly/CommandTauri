"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { Calendar, TrendingUp, AlertTriangle, Clock, Target, Download } from 'lucide-react'
import { useDailyData, CATEGORIES } from '@/lib/database'
import { format, subDays, parseISO, eachDayOfInterval } from 'date-fns'
import { HeadPainEntry } from './head-pain-types'
import { headPainIntensityToNumber, headPainEffectivenessToNumber, sanitizeChartData, safeAverage } from '@/lib/analytics-utils'

interface AnalyticsProps {
  className?: string
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

export default function HeadPainAnalyticsDesktop({ className }: AnalyticsProps) {
  const { getCategoryData } = useDailyData()
  const [entries, setEntries] = useState<HeadPainEntry[]>([])
  const [timeRange, setTimeRange] = useState('30')
  const [loading, setLoading] = useState(true)
  const [hasValidData, setHasValidData] = useState(false)

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
      const allEntries: HeadPainEntry[] = []

      for (const date of dateRange) {
        const dateKey = format(date, 'yyyy-MM-dd')
        const records = await getCategoryData(dateKey, CATEGORIES.TRACKER)
        const headPainRecord = records.find(record => record.subcategory === 'head-pain')
        
        if (headPainRecord?.content?.entries) {
          let entries = headPainRecord.content.entries
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

      // Sanitize data using standardized scale conversion
      const cleanEntries = allEntries.map(entry => ({
        ...entry,
        painIntensity: headPainIntensityToNumber(entry.painIntensity),
        treatmentEffectiveness: headPainEffectivenessToNumber(entry.treatmentEffectiveness)
      })).filter(entry => 
        entry.painIntensity >= 0 && entry.painIntensity <= 10 &&
        entry.treatmentEffectiveness >= 0 && entry.treatmentEffectiveness <= 10
      )

      console.log('🔍 Clean head-pain entries:', cleanEntries)
      
      setEntries(cleanEntries)
      setHasValidData(cleanEntries.length > 0)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Head Pain Analytics</h2>
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

  // Calculate basic analytics using safe math
  const totalEpisodes = entries.length
  const avgPainIntensity = safeAverage(entries.map(e => e.painIntensity)).toFixed(1)
  const avgTreatmentEffectiveness = safeAverage(entries.map(e => e.treatmentEffectiveness)).toFixed(1)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Head Pain Analytics 🧠</h2>
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
                <p className="text-2xl font-bold">{totalEpisodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Intensity</p>
                <p className="text-2xl font-bold">{avgPainIntensity}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Treatment Effectiveness</p>
                <p className="text-2xl font-bold">{avgTreatmentEffectiveness}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts or No Data Message */}
      {!hasValidData ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No valid head pain data available for charts. Start tracking to see analytics!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pain Intensity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Pain Intensity Distribution</CardTitle>
                <CardDescription>Frequency of different pain intensities (0-10 scale)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Low (1-3)', value: entries.filter(e => e.painIntensity >= 1 && e.painIntensity <= 3).length },
                        { name: 'Moderate (4-6)', value: entries.filter(e => e.painIntensity >= 4 && e.painIntensity <= 6).length },
                        { name: 'High (7-10)', value: entries.filter(e => e.painIntensity >= 7 && e.painIntensity <= 10).length }
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Treatment Effectiveness */}
            <Card>
              <CardHeader>
                <CardTitle>Treatment Effectiveness</CardTitle>
                <CardDescription>How well treatments work (0-10 scale)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { range: 'Poor (0-3)', count: entries.filter(e => e.treatmentEffectiveness >= 0 && e.treatmentEffectiveness <= 3).length },
                    { range: 'Fair (4-6)', count: entries.filter(e => e.treatmentEffectiveness >= 4 && e.treatmentEffectiveness <= 6).length },
                    { range: 'Good (7-10)', count: entries.filter(e => e.treatmentEffectiveness >= 7 && e.treatmentEffectiveness <= 10).length }
                  ].filter(item => item.count > 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
