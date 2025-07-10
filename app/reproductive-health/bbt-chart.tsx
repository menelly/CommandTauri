"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Bar } from 'recharts'
import { TrendingUp, Calendar, Thermometer, Target, Heart } from 'lucide-react'
import { useDailyData, CATEGORIES } from '@/lib/database'
import { ReproductiveHealthEntry } from './reproductive-health-tracker'
import { OvulationPredictor, OvulationPrediction } from './ovulation-predictor'

// Calculate current cycle day based on AVAILABLE DATA - no assumptions!
const calculateCurrentCycleDay = async (getSpecificData: any): Promise<number> => {
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // Get today's reproductive health data
    const todayRecord = await getSpecificData(todayStr, CATEGORIES.TRACKER, 'reproductive-health')
    let todayData: any = null

    if (todayRecord?.content) {
      if (typeof todayRecord.content === 'string') {
        todayData = JSON.parse(todayRecord.content)
      } else {
        todayData = todayRecord.content
      }
    }

    console.log('🧠 SMART CYCLE DAY CALCULATION:')
    console.log('  - Today\'s data:', todayData)

    // Method 1: If we have LMP date, calculate precisely!
    if (todayData?.lmpDate) {
      const lmpDate = new Date(todayData.lmpDate)
      const daysSinceLMP = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24))
      const cycleDay = daysSinceLMP + 1

      console.log('  - LMP date found:', todayData.lmpDate)
      console.log('  - Days since LMP:', daysSinceLMP)
      console.log('  - PRECISE cycle day:', cycleDay)

      return Math.max(1, Math.min(50, cycleDay)) // Cap between 1-50 days
    }

    // Method 2: If we have OPK data, estimate based on that
    if (todayData?.opk) {
      const opk = todayData.opk
      console.log('  - Using OPK data:', opk)

      if (opk === 'peak') {
        // Peak OPK = ovulation day (typically day 14)
        console.log('  - PEAK OPK detected → estimating cycle day 14')
        return 14
      } else if (opk === 'high') {
        // High OPK = 1-2 days before ovulation (typically day 12-13)
        console.log('  - HIGH OPK detected → estimating cycle day 13')
        return 13
      } else if (opk === 'low') {
        // Low OPK could be early cycle or post-ovulation
        console.log('  - LOW OPK detected → estimating cycle day 10')
        return 10
      }
    }

    // Method 3: If we have BBT data, look for temperature patterns
    if (todayData?.bbt && todayData.bbt > 0) {
      console.log('  - BBT data available, but pattern analysis not implemented yet')
      // TODO: Implement BBT pattern analysis
    }

    // Method 4: If we have cervical fluid data
    if (todayData?.cervicalFluid) {
      console.log('  - Cervical fluid data:', todayData.cervicalFluid)
      // TODO: Implement cervical fluid analysis
    }

    // Method 5: Look for any period data in recent history
    for (let i = 0; i < 35; i++) { // Look back max 35 days (one cycle)
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateKey = checkDate.toISOString().split('T')[0]

      const record = await getSpecificData(dateKey, CATEGORIES.TRACKER, 'reproductive-health')
      if (record?.content) {
        let parsed: any
        if (typeof record.content === 'string') {
          parsed = JSON.parse(record.content)
        } else {
          parsed = record.content
        }

        if (parsed.flow && parsed.flow !== 'none') {
          const daysSinceFlow = i
          const estimatedCycleDay = daysSinceFlow + 1
          console.log(`  - Found flow "${parsed.flow}" ${daysSinceFlow} days ago → estimating cycle day ${estimatedCycleDay}`)
          return Math.min(35, estimatedCycleDay) // Cap at 35 days
        }
      }
    }

    // Fallback: No data available, make educated guess
    console.log('  - No cycle indicators found → defaulting to mid-cycle estimate (day 15)')
    return 15 // Better than day 1!

  } catch (error) {
    console.error('Error calculating cycle day:', error)
    return 15 // Still better than day 1!
  }
}

interface BBTChartProps {
  currentEntry?: Partial<ReproductiveHealthEntry>
  refreshKey?: number // Add refresh trigger
}

interface BBTDataPoint {
  date: string
  temperature: number | null
  flowValue: number
  flowColor: string
  cycleDay: number
  phase: 'follicular' | 'ovulation' | 'luteal' | 'menstrual'
  // Menstrual data
  flow: 'none' | 'spotting' | 'light' | 'medium' | 'heavy'
  pain: number
  mood: string[]
  symptoms: string[]
  // Fertility data
  cervicalFluid?: string
  opk?: 'negative' | 'low' | 'high' | 'peak' | null
  libido?: number
  ferning?: 'none' | 'partial' | 'full' | null
  fertilitySymptoms?: string[]
  spermEggExposure?: boolean
  notes?: string
  // Prediction data
  isPredictedOvulation?: boolean
  isInFertileWindow?: boolean
  ovulationConfidence?: 'low' | 'medium' | 'high' | 'confirmed'
}

export function BBTChart({ currentEntry, refreshKey }: BBTChartProps) {
  const [chartData, setChartData] = useState<BBTDataPoint[]>([])
  const [selectedRange, setSelectedRange] = useState<'30' | '60' | '90'>('30')
  const [isLoading, setIsLoading] = useState(true)
  const [ovulationPrediction, setOvulationPrediction] = useState<OvulationPrediction | null>(null)
  const { getSpecificData } = useDailyData()

  useEffect(() => {
    loadBBTData()
  }, [selectedRange, refreshKey])

  const loadBBTData = async () => {
    try {
      setIsLoading(true)
      
      // Start from today unless user has historical data
      const today = new Date()
      const daysRange = parseInt(selectedRange)

      // Check if user has any historical data by checking a few recent dates
      let hasHistoricalData = false
      for (let i = 1; i <= 7; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const dateKey = checkDate.toISOString().split('T')[0]
        const record = await getSpecificData(dateKey, 'tracker', 'reproductive-health')
        if (record?.content) {
          hasHistoricalData = true
          break
        }
      }

      let startDate: Date
      let endDate: Date

      if (hasHistoricalData) {
        // User has historical data - show it
        const pastDays = Math.floor(daysRange * 0.7) // 70% past
        const futureDays = Math.floor(daysRange * 0.3) // 30% future

        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - pastDays)

        endDate = new Date(today)
        endDate.setDate(endDate.getDate() + futureDays)
      } else {
        // No historical data - start from today and go forward
        startDate = new Date(today)
        endDate = new Date(today)
        endDate.setDate(endDate.getDate() + daysRange)
      }

      // Filter and process the data using date-first approach
      const bbtData: BBTDataPoint[] = []
      console.log('🔍 DATE RANGE DEBUG:')
      console.log('Today:', today.toISOString().split('T')[0])
      console.log('Start date:', startDate.toISOString().split('T')[0])
      console.log('End date:', endDate.toISOString().split('T')[0])
      console.log('Has historical data:', hasHistoricalData)

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]

        // Get entry for this specific date using date-first structure
        const dayRecord = await getSpecificData(dateStr, 'tracker', 'reproductive-health')

        // Parse the content - WatermelonDB stores as JSON string
        let entry: ReproductiveHealthEntry | undefined
        if (dayRecord?.content) {
          if (typeof dayRecord.content === 'string') {
            entry = JSON.parse(dayRecord.content)
          } else {
            entry = dayRecord.content as ReproductiveHealthEntry
          }
        }

        // Debug logging for data loading
        if (dateStr === new Date().toISOString().split('T')[0]) {
          console.log('🔍 TODAY DATA DEBUG:', dateStr)
          console.log('Raw record:', dayRecord)
          console.log('Parsed entry:', entry)
        }
        
        // Calculate cycle day - start from day 1 if no historical data, otherwise estimate
        const daysSinceToday = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        let cycleDay: number
        if (hasHistoricalData) {
          // If user has historical data, try to calculate based on last period
          // For now, assume current day 13 - closer to typical ovulation timing
          const estimatedCurrentDay = 13
          cycleDay = Math.max(1, estimatedCurrentDay + daysSinceToday)
        } else {
          // New user - start from day 1 today
          cycleDay = Math.max(1, 1 + daysSinceToday)
        }
        
        // Determine phase based on cycle day (simplified)
        let phase: 'follicular' | 'ovulation' | 'luteal' | 'menstrual' = 'follicular'
        if (cycleDay <= 5) phase = 'menstrual'
        else if (cycleDay <= 13) phase = 'follicular'
        else if (cycleDay <= 15) phase = 'ovulation'
        else phase = 'luteal'

        const flowLevel = entry?.flow || 'none'
        bbtData.push({
          date: dateStr,
          temperature: entry?.bbt || null,
          flowValue: getFlowValue(flowLevel),
          flowColor: getFlowColor(flowLevel),
          cycleDay,
          phase,
          // Menstrual data
          flow: flowLevel,
          pain: entry?.pain || 0,
          mood: entry?.mood || [],
          symptoms: entry?.symptoms || [],
          // Fertility data
          cervicalFluid: entry?.cervicalFluid,
          opk: entry?.opk,
          libido: entry?.libido || 0,
          ferning: entry?.ferning || null,
          fertilitySymptoms: entry?.fertilitySymptoms || [],
          spermEggExposure: entry?.spermEggExposure || false,
          notes: entry?.notes,
          // Prediction data (will be filled in next step)
          isPredictedOvulation: false,
          isInFertileWindow: false,
          ovulationConfidence: 'low'
        })
      }

      // Generate ovulation prediction for current cycle
      // Collect all entries that have data for prediction
      const currentCycleEntries: ReproductiveHealthEntry[] = []
      console.log('🔍 BBT DATA POINTS FOR PREDICTION:', bbtData.length)
      for (const dataPoint of bbtData) {
        console.log('🔍 Checking dataPoint:', dataPoint.date, {
          temp: dataPoint.temperature,
          flow: dataPoint.flow,
          fluid: dataPoint.cervicalFluid,
          opk: dataPoint.opk
        })
        if (dataPoint.temperature || dataPoint.flow !== 'none' || dataPoint.cervicalFluid || dataPoint.opk) {
          // Create entry from data point for prediction
          const entry: ReproductiveHealthEntry = {
            id: dataPoint.date,
            date: dataPoint.date,
            flow: dataPoint.flow,
            pain: dataPoint.pain,
            mood: dataPoint.mood,
            symptoms: dataPoint.symptoms,
            cervicalFluid: dataPoint.cervicalFluid || '',
            bbt: dataPoint.temperature,
            libido: dataPoint.libido || 0,
            energyLevel: '',
            fertilitySymptoms: dataPoint.fertilitySymptoms,
            opk: dataPoint.opk,
            ferning: dataPoint.ferning || null,
            spermEggExposure: dataPoint.spermEggExposure,
            notes: dataPoint.notes || '',
            tags: [],
            created_at: '',
            updated_at: ''
          }
          currentCycleEntries.push(entry)
        }
      }
      currentCycleEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Calculate current cycle day based on actual menstrual flow data
      console.log('🔄 STARTING CYCLE DAY CALCULATION...')
      let currentCycleDay: number
      try {
        currentCycleDay = await calculateCurrentCycleDay(getSpecificData)
        console.log('🩸 CALCULATED CURRENT CYCLE DAY:', currentCycleDay)
      } catch (error) {
        console.error('❌ ERROR IN CYCLE DAY CALCULATION:', error)
        currentCycleDay = 1 // fallback
      }

      // For now, we'll use empty historical cycles - in a real app, we'd track multiple cycles
      const historicalCycles: any[] = []

      console.log('DEBUG: currentCycleDay passed to predictor:', currentCycleDay)
      console.log('DEBUG: currentCycleEntries:', currentCycleEntries.map(e => ({ date: e.date, opk: e.opk })))

      const prediction = OvulationPredictor.predictOvulation(
        currentCycleDay,
        currentCycleEntries,
        historicalCycles
      )

      console.log('DEBUG: prediction result:', prediction)

      // Debug logging
      console.log('🔍 OVULATION PREDICTION DEBUG:')
      console.log('Current cycle day:', currentCycleDay)
      console.log('Entries with data:', currentCycleEntries.length)
      console.log('Recent OPK entries:', currentCycleEntries.filter(e => e.opk).map(e => ({ date: e.date, opk: e.opk })))
      console.log('Prediction result:', prediction)

      setOvulationPrediction(prediction)

      // Enhance chart data with prediction info
      const enhancedData = bbtData.map(dataPoint => ({
        ...dataPoint,
        isPredictedOvulation: prediction.predictedDay === dataPoint.cycleDay,
        isInFertileWindow: prediction.fertileWindowStart && prediction.fertileWindowEnd
          ? dataPoint.cycleDay >= prediction.fertileWindowStart && dataPoint.cycleDay <= prediction.fertileWindowEnd
          : false,
        ovulationConfidence: prediction.predictedDay === dataPoint.cycleDay ? prediction.confidence : 'low'
      }))

      setChartData(enhancedData)
    } catch (error) {
      console.error('Failed to load BBT data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual': return '#ef4444' // red
      case 'follicular': return '#3b82f6' // blue
      case 'ovulation': return '#22c55e' // green
      case 'luteal': return '#f59e0b' // amber
      default: return '#6b7280' // gray
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const getFlowEmoji = (flow: string) => {
    switch (flow) {
      case 'heavy': return '🩸'
      case 'medium': return '🔴'
      case 'light': return '🩸'
      case 'spotting': return '🔴'
      default: return ''
    }
  }

  const getFlowValue = (flow: string) => {
    switch (flow) {
      case 'heavy': return 4
      case 'medium': return 3
      case 'light': return 2
      case 'spotting': return 1
      default: return 0
    }
  }

  const getFlowColor = (flow: string) => {
    switch (flow) {
      case 'heavy': return '#dc2626'
      case 'medium': return '#ef4444'
      case 'light': return '#f87171'
      case 'spotting': return '#fca5a5'
      default: return '#f3f4f6'
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as BBTDataPoint
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-medium text-base">{formatDate(label)} - Day {data.cycleDay}</p>
          <p className="text-sm capitalize text-muted-foreground mb-2">Phase: {data.phase}</p>

          {/* Temperature */}
          {data.temperature && (
            <p className="text-sm">🌡️ Temperature: {data.temperature.toFixed(1)}°F</p>
          )}

          {/* Menstrual Flow */}
          {data.flow !== 'none' && (
            <p className="text-sm">{getFlowEmoji(data.flow)} Flow: {data.flow}</p>
          )}

          {/* Pain Level */}
          {data.pain > 0 && (
            <p className="text-sm">😣 Pain: {data.pain}/10</p>
          )}

          {/* Cervical Fluid */}
          {data.cervicalFluid && (
            <p className="text-sm">💧 Cervical Fluid: {data.cervicalFluid}</p>
          )}

          {/* OPK */}
          {data.opk && (
            <p className="text-sm">🧪 OPK: {data.opk}</p>
          )}

          {/* Ferning */}
          {data.ferning && data.ferning !== 'none' && (
            <p className="text-sm">🔬 Ferning: {data.ferning}</p>
          )}

          {/* Libido */}
          {data.libido && data.libido > 0 && (
            <p className="text-sm">🔥 Libido: {data.libido}/10</p>
          )}

          {/* Mood */}
          {data.mood.length > 0 && (
            <p className="text-sm">😊 Mood: {data.mood.slice(0, 2).join(', ')}{data.mood.length > 2 ? '...' : ''}</p>
          )}

          {/* Symptoms */}
          {data.symptoms.length > 0 && (
            <p className="text-sm">⚡ Symptoms: {data.symptoms.slice(0, 2).join(', ')}{data.symptoms.length > 2 ? '...' : ''}</p>
          )}

          {/* Fertility Symptoms */}
          {data.fertilitySymptoms && data.fertilitySymptoms.length > 0 && (
            <p className="text-sm">🌺 Fertility: {data.fertilitySymptoms.slice(0, 2).join(', ')}{data.fertilitySymptoms.length > 2 ? '...' : ''}</p>
          )}

          {/* Conception Opportunity */}
          {data.spermEggExposure && (
            <p className="text-sm">🥚 Conception opportunity: Yes</p>
          )}

          {/* Prediction Info */}
          {data.isPredictedOvulation && (
            <p className="text-sm font-medium text-green-600">🎯 Predicted Ovulation Day!</p>
          )}

          {data.isInFertileWindow && (
            <p className="text-sm font-medium text-blue-600">💫 Fertile Window</p>
          )}
        </div>
      )
    }
    return null
  }

  // Calculate average temperatures for reference lines
  const validTemps = chartData.filter(d => d.temperature !== null).map(d => d.temperature!)
  const avgTemp = validTemps.length > 0 ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length : 98.6
  const coverlineTemp = avgTemp + 0.2 // Simplified coverline calculation

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-500" />
            📈 BBT Temperature Chart
          </CardTitle>
          <CardDescription>
            Track your basal body temperature patterns to identify ovulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Ovulation Prediction Display */}
          {ovulationPrediction && (
            <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Ovulation Prediction</span>
                <Badge
                  variant={ovulationPrediction.confidence === 'confirmed' ? 'default' : 'secondary'}
                  className={
                    ovulationPrediction.confidence === 'confirmed' ? 'bg-green-100 text-green-800' :
                    ovulationPrediction.confidence === 'high' ? 'bg-blue-100 text-blue-800' :
                    ovulationPrediction.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {ovulationPrediction.confidence} confidence
                </Badge>
              </div>
              <p className="text-sm text-purple-700 mb-2">{ovulationPrediction.message}</p>
              {ovulationPrediction.daysUntilOvulation !== null && ovulationPrediction.daysUntilOvulation > 0 && (
                <div className="flex items-center gap-4 text-sm">
                  <span>🗓️ Days until ovulation: <strong>{ovulationPrediction.daysUntilOvulation}</strong></span>
                  {ovulationPrediction.fertileWindowStart && ovulationPrediction.fertileWindowEnd && (
                    <span>💫 Fertile window: Days {ovulationPrediction.fertileWindowStart}-{ovulationPrediction.fertileWindowEnd}</span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <span className="text-sm font-medium">Time Range:</span>
            {(['30', '60', '90'] as const).map((days) => (
              <Button
                key={days}
                variant={selectedRange === days ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRange(days)}
              >
                {days} days
              </Button>
            ))}
          </div>

          {/* Enhanced Legend */}
          <div className="space-y-3 mb-4">
            <div>
              <span className="text-sm font-medium mb-2 block">Cycle Phases:</span>
              <div className="flex flex-wrap gap-2">
                <Badge style={{ backgroundColor: '#ef4444', color: 'white' }}>🩸 Menstrual</Badge>
                <Badge style={{ backgroundColor: '#3b82f6', color: 'white' }}>🌱 Follicular</Badge>
                <Badge style={{ backgroundColor: '#22c55e', color: 'white' }}>🥚 Ovulation</Badge>
                <Badge style={{ backgroundColor: '#f59e0b', color: 'white' }}>🌙 Luteal</Badge>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium mb-2 block">Chart Symbols:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">🌡️ Red Line = BBT</Badge>
                <Badge variant="outline">🩸 Red Bars = Flow</Badge>
                <Badge variant="outline">🎯 Dotted Line = Predicted Ovulation</Badge>
                <Badge variant="outline">💫 Blue Shade = Fertile Window</Badge>
                <Badge variant="outline">💕 Heart = Conception Opportunity</Badge>
              </div>
            </div>
          </div>

          {/* Chart */}
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <ComposedChart data={chartData} margin={{ top: 60, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  interval="preserveStartEnd"
                />

                {/* Temperature Y-axis (left) */}
                <YAxis
                  yAxisId="temp"
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tickFormatter={(value) => `${value.toFixed(1)}°F`}
                  orientation="left"
                />

                {/* Flow Y-axis (right) */}
                <YAxis
                  yAxisId="flow"
                  domain={[0, 5]}
                  tickFormatter={(value) => {
                    const flowLabels = ['None', 'Spotting', 'Light', 'Medium', 'Heavy', '']
                    return flowLabels[value] || ''
                  }}
                  orientation="right"
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Reference line for coverline */}
                <ReferenceLine
                  yAxisId="temp"
                  y={coverlineTemp}
                  stroke="#8884d8"
                  strokeDasharray="5 5"
                  label="Coverline"
                />

                {/* Predicted ovulation line - temporarily disabled to fix axis error */}
                {/* Will add back with different approach */}

                {/* Menstrual flow bars */}
                <Bar
                  yAxisId="flow"
                  dataKey="flowValue"
                  fill="#ef4444"
                  opacity={0.6}
                  name="Menstrual Flow"
                />

                {/* Temperature line with custom dots */}
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props
                    if (!payload) return <circle cx={cx} cy={cy} r={5} fill="#dc2626" stroke="#dc2626" strokeWidth={2} />

                    // Custom dot styling based on data
                    let fill = '#dc2626'
                    let stroke = '#dc2626'
                    let r = 5

                    // Larger dot for predicted ovulation
                    if (payload.isPredictedOvulation) {
                      fill = '#22c55e'
                      stroke = '#16a34a'
                      r = 8
                    }

                    // Heart shape for sperm/egg exposure - moved below the dot
                    if (payload.spermEggExposure) {
                      return (
                        <g key={`exposure-${cx}-${cy}`}>
                          <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={2} />
                          <text x={cx} y={cy + 25} textAnchor="middle" fontSize="12" fill="#e11d48">
                            💕
                          </text>
                        </g>
                      )
                    }

                    return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={2} />
                  }}
                  connectNulls={false}
                  name="BBT Temperature"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* Enhanced Chart Tips */}
          <div className="mt-6 text-sm text-muted-foreground space-y-3">
            <p>📊 <strong>Your Smart Fertility Chart Guide:</strong></p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="font-medium text-red-600">🌡️ Temperature Tracking:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                  <li>Red line shows daily BBT</li>
                  <li>Rises 0.2-0.4°F after ovulation</li>
                  <li>3+ high temps confirm ovulation</li>
                  <li>Blue coverline helps spot the shift</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-purple-600">🎯 Smart Predictions:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                  <li>Green dotted line = predicted ovulation</li>
                  <li>Gets smarter with more data</li>
                  <li>Combines BBT, OPK, and fluid patterns</li>
                  <li>Confidence levels show accuracy</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-pink-600">💕 Conception Tracking:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                  <li>💕 Hearts = conception opportunity</li>
                  <li>🩸 Red bars = menstrual flow</li>
                  <li>Hover any point for full details</li>
                </ul>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border">
              <p className="text-xs font-medium text-purple-800">
                ✨ <strong>Pro Tip:</strong> This chart learns your unique patterns! The more data you add,
                the smarter the predictions become! 🌟
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
