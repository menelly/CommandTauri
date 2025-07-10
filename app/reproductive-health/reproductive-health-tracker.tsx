"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { useDailyData, formatDateForStorage, CATEGORIES } from '@/lib/database'
import { format, addDays, subDays } from 'date-fns'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  Moon,
  Sparkles,
  Settings,
  History,
  TrendingUp
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { TagInput } from "@/components/tag-input"
import { useGoblinMode } from "@/lib/goblin-mode-context"
import { MenstrualForm } from "./menstrual-form"
import { FertilityForm } from "./fertility-form"
import { BBTChart } from "./bbt-chart"
import { ReproductiveHistory } from "./reproductive-history"

// Types for reproductive health data
export interface ReproductiveHealthEntry {
  id: string
  date: string
  // Menstrual tracking
  flow: 'none' | 'spotting' | 'light' | 'medium' | 'heavy'
  pain: number // 0-10 scale
  mood: string[]
  symptoms: string[]
  libido: number // 0-10 scale (moved here because everyone has libido!)
  // Fertility tracking
  cervicalFluid: string
  bbt: number | null // Basal body temperature
  energyLevel: string
  fertilitySymptoms: string[]
  opk: 'negative' | 'low' | 'high' | 'peak' | null // Ovulation predictor kit
  ferning: 'none' | 'partial' | 'full' | null // Saliva ferning pattern
  spermEggExposure: boolean // Inclusive tracking for all fertility journeys
  lmpDate: string | null // Last Menstrual Period date (optional, for better cycle day calculation)
  // General
  notes: string
  tags: string[]
  created_at: string
  updated_at: string
}

export const FLOW_LEVELS = [
  { value: 'none', label: 'None', emoji: '⚪', color: 'bg-gray-100' },
  { value: 'spotting', label: 'Spotting', emoji: '🔴', color: 'bg-pink-100' },
  { value: 'light', label: 'Light', emoji: '🩸', color: 'bg-red-100' },
  { value: 'medium', label: 'Medium', emoji: '🔴', color: 'bg-red-200' },
  { value: 'heavy', label: 'Heavy', emoji: '🩸', color: 'bg-red-300' }
] as const

export const OPK_LEVELS = [
  { value: 'negative', label: 'Negative', color: 'bg-gray-100' },
  { value: 'low', label: 'Low', color: 'bg-yellow-100' },
  { value: 'high', label: 'High', color: 'bg-orange-100' },
  { value: 'peak', label: 'Peak', color: 'bg-green-100' }
] as const

export const MOOD_OPTIONS = [
  'happy', 'sad', 'irritable', 'anxious', 'calm', 'energetic', 'tired', 'emotional', 'stable', 'moody'
]

export const SYMPTOM_OPTIONS = [
  'cramps', 'headache', 'bloating', 'breast tenderness', 'back pain', 'nausea', 'acne', 'food cravings', 'insomnia', 'fatigue'
]

export const FERTILITY_SYMPTOM_OPTIONS = [
  'ovary twinge', 'wetness', 'cervical position change', 'increased libido', 'breast changes', 'mild cramping', 'spotting'
]

export default function ReproductiveHealthTracker() {
  const { goblinMode } = useGoblinMode()
  const { saveData, getSpecificData, getCategoryData, deleteData, isLoading } = useDailyData()
  const [currentDate, setCurrentDate] = useState(new Date())

  const [entries, setEntries] = useState<ReproductiveHealthEntry[]>([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ReproductiveHealthEntry | null>(null)
  const [chartRefreshKey, setChartRefreshKey] = useState(0)

  // Form state
  const [formData, setFormData] = useState<Partial<ReproductiveHealthEntry>>({
    flow: 'none',
    pain: 0,
    mood: [],
    symptoms: [],
    libido: 0,
    cervicalFluid: '',
    bbt: null,
    energyLevel: '',
    fertilitySymptoms: [],
    opk: null,
    ferning: null,
    spermEggExposure: false,
    lmpDate: null,
    notes: '',
    tags: []
  })

  // Load data for current date
  useEffect(() => {
    loadEntryForDate(currentDate)
    loadAllEntries()
  }, [currentDate])

  const loadEntryForDate = async (date: Date) => {
    const dateKey = formatDateForStorage(date)
    const record = await getSpecificData(dateKey, CATEGORIES.TRACKER, 'reproductive-health')

    if (record?.content) {
      // Check if content is already an object or needs parsing
      let parsed: any
      if (typeof record.content === 'string') {
        parsed = JSON.parse(record.content)
      } else {
        parsed = record.content
      }
      setFormData(parsed)
    } else {
      // Reset form for new date
      setFormData({
        flow: 'none',
        pain: 0,
        mood: [],
        symptoms: [],
        libido: 0,
        cervicalFluid: '',
        bbt: null,
        energyLevel: '',
        fertilitySymptoms: [],
        opk: null,
        ferning: null,
        spermEggExposure: false,
        lmpDate: null,
        notes: '',
        tags: []
      })
    }
  }

  const loadAllEntries = async () => {
    // Load recent entries for history view - get last 30 days
    const promises = []
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), i)
      const dateKey = formatDateForStorage(date)
      promises.push(getSpecificData(dateKey, CATEGORIES.TRACKER, 'reproductive-health'))
    }

    const records = await Promise.all(promises)
    const reproductiveEntries = records
      .filter(record => record?.content)
      .map(record => {
        // Check if content is already an object or needs parsing
        let parsed: any
        if (typeof record!.content === 'string') {
          parsed = JSON.parse(record!.content)
        } else {
          parsed = record!.content
        }

        return {
          id: record!.id?.toString() || '',
          date: record!.date,
          ...parsed,
          created_at: record!.metadata?.created_at || '',
          updated_at: record!.metadata?.updated_at || ''
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setEntries(reproductiveEntries)
  }

  const handleSave = async () => {
    try {
      const dateKey = formatDateForStorage(currentDate)
      await saveData(dateKey, CATEGORIES.TRACKER, 'reproductive-health', formData, formData.tags)

      toast({
        title: "🌙 Reproductive Health Entry Saved!",
        description: "Your cycle data has been recorded. The cycle spirits are taking notes! ✨",
      })

      // Reload entries to show the new one
      await loadAllEntries()

      // Trigger BBT chart refresh
      setChartRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Failed to save reproductive health entry:', error)
      toast({
        title: "Error saving entry",
        description: "Failed to save reproductive health entry. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (entryDate: string) => {
    try {
      await deleteData(entryDate, CATEGORIES.TRACKER, 'reproductive-health')

      toast({
        title: "Entry Deleted 🗑️",
        description: "Reproductive health entry has been removed from your records.",
      })

      // Reload entries and current date data
      await loadAllEntries()
      if (formatDateForStorage(currentDate) === entryDate) {
        await loadEntryForDate(currentDate)
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
      toast({
        title: "Error deleting entry",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive"
      })
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev'
      ? subDays(currentDate, 1)
      : addDays(currentDate, 1)
    setCurrentDate(newDate)
  }

  const updateFormData = (field: keyof ReproductiveHealthEntry, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getReproductiveGoblinism = () => {
    const goblinisms = [
      "The cycle sprites have been documented! 🌙🧚‍♀️",
      "Fertility spirits are updating their magical charts! ✨📊",
      "The hormone goblins are taking detailed notes! 🧙‍♀️📝",
      "Reproductive wellness data filed in the enchanted archives! 🌙📚",
      "Your body's wisdom has been recorded by the cycle sages! 🌛🔮",
      "The ovulation oracles have updated their predictions! 🥚✨",
      "Menstrual magic documented for future reference! 🩸🌟",
      "The fertility forest spirits are pleased with your tracking! 🌿🧚‍♀️"
    ]
    return goblinisms[Math.floor(Math.random() * goblinisms.length)]
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header with fun title and navigation */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('prev')}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <Moon className="h-6 w-6 text-slate-500" />
                🌙 Reproductive Health Tracker 🌛
                <Sparkles className="h-6 w-6 text-slate-500" />
              </CardTitle>
              <CardDescription className="mt-2">
                Track your menstrual cycle, ovulation signs, and reproductive wellness
              </CardDescription>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('next')}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Date selector */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !currentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {currentDate ? format(currentDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => {
                    if (date) {
                      setCurrentDate(date)
                      setIsCalendarOpen(false)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>


          </div>
        </CardHeader>
      </Card>

      {/* Main content */}
      <Tabs defaultValue="menstrual" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 bg-card">
          <TabsTrigger value="menstrual" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
            <Droplets className="h-4 w-4 flex-shrink-0" />
            <span className="text-center leading-tight">Menstrual</span>
          </TabsTrigger>
          <TabsTrigger value="fertility" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
            <Moon className="h-4 w-4 flex-shrink-0" />
            <span className="text-center leading-tight">Ovulation</span>
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
            <Thermometer className="h-4 w-4 flex-shrink-0" />
            <span className="text-center leading-tight">BBT Chart</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
            <CalendarIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-center leading-tight">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
            <History className="h-4 w-4 flex-shrink-0" />
            <span className="text-center leading-tight">History</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="hidden lg:flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4 flex-shrink-0" />
            <span className="text-center leading-tight">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menstrual" className="mt-6">
          <MenstrualForm
            formData={formData}
            updateFormData={updateFormData}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="fertility" className="mt-6">
          <FertilityForm
            formData={formData}
            updateFormData={updateFormData}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="chart" className="mt-6">
          <BBTChart currentEntry={formData} refreshKey={chartRefreshKey} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Cycle Calendar View
              </CardTitle>
              <CardDescription>
                Visual calendar showing your menstrual cycle, fertile days, and symptoms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  className="rounded-md border"
                  modifiers={{
                    menstrual: entries.filter(e => e.menstrualFlow && e.menstrualFlow !== 'none').map(e => new Date(e.date)),
                    fertile: entries.filter(e => e.cervicalFluid && ['egg-white', 'creamy'].includes(e.cervicalFluid)).map(e => new Date(e.date)),
                    ovulation: entries.filter(e => e.ovulationTest === 'positive').map(e => new Date(e.date))
                  }}
                  modifiersStyles={{
                    menstrual: { backgroundColor: '#ef4444', color: 'white' },
                    fertile: { backgroundColor: '#22c55e', color: 'white' },
                    ovulation: { backgroundColor: '#8b5cf6', color: 'white' }
                  }}
                />
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Menstrual Days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Fertile Days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span>Ovulation</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ReproductiveHistory
            entries={entries}
            onDelete={handleDelete}
            onEdit={(entry) => {
              setCurrentDate(new Date(entry.date))
              // No need to change activeTab since we're now using proper tabs
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Cycle Analytics
              </CardTitle>
              <CardDescription>
                Detailed analysis of your menstrual cycle patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">📊 Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed cycle analysis, pattern recognition, and predictive insights coming in desktop version
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>• Cycle length trends and variations</p>
                  <p>• Symptom pattern analysis</p>
                  <p>• Fertility window predictions</p>
                  <p>• BBT trend analysis</p>
                  <p>• Exportable reports for healthcare providers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}