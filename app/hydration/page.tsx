"use client"

import { useState, useEffect } from "react"
import AppCanvas from "@/components/app-canvas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Droplets, Edit, Trash2, Calendar, Target, Settings } from "lucide-react"
import { useDailyData, formatDateForStorage } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { formatLocalDateString } from "@/lib/utils/dateUtils"
import { HydrationForm } from './hydration-form'

interface HydrationEntry {
  id: string
  date: string
  drinkType: string
  amount: number // in ml
  time: string
  notes: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface DailyHydrationGoal {
  targetAmount: number // in ml
  reminderInterval: number // in hours
}

const DRINK_TYPES = [
  { value: "water", label: "💧 Water", emoji: "💧", multiplier: 1 },
  { value: "herbal-tea", label: "🍵 Herbal Tea", emoji: "🍵", multiplier: 1 },
  { value: "green-tea", label: "🍃 Green Tea", emoji: "🍃", multiplier: 0.8 },
  { value: "coffee", label: "☕ Coffee", emoji: "☕", multiplier: 0.85 },
  { value: "juice", label: "🧃 Juice", emoji: "🧃", multiplier: 0.7 },
  { value: "smoothie", label: "🥤 Smoothie", emoji: "🥤", multiplier: 0.8 },
  { value: "sports-drink", label: "⚡ Sports Drink", emoji: "⚡", multiplier: 0.9 },
  { value: "coconut-water", label: "🥥 Coconut Water", emoji: "🥥", multiplier: 1.1 },
  { value: "other", label: "🥛 Other", emoji: "🥛", multiplier: 0.8 }
]

const COMMON_AMOUNTS = [
  { label: "Small Glass", amount: 6 },
  { label: "Large Glass", amount: 12 },
  { label: "Water Bottle", amount: 16 },
  { label: "Large Bottle", amount: 24 },
  { label: "Mug", amount: 8 },
  { label: "Cup", amount: 5 }
]

const HYDRATION_GOBLINISMS = [
  "Splash! Your hydration has been logged by the water sprites! 💧✨",
  "The aqua goblins are pleased with your fluid documentation! 🧚‍♀️💦",
  "Hydration entry saved! The moisture minions approve! 🌊",
  "Your liquid adventure has been recorded by the droplet dragons! 💧🐉",
  "Drink logged! The thirst-quenching pixies celebrate! 🧚‍♂️💙"
]

export default function HydrationTracker() {
  const { saveData, getCategoryData, getSpecificData, deleteData, isLoading } = useDailyData()
  const { toast } = useToast()
  
  // State
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [entries, setEntries] = useState<HydrationEntry[]>([])
  const [editingEntry, setEditingEntry] = useState<HydrationEntry | null>(null)
  const [activeTab, setActiveTab] = useState("entry")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Goal state
  const [dailyGoal, setDailyGoal] = useState(64) // 64oz default (about 8 cups)
  const [reminderInterval, setReminderInterval] = useState(2) // 2 hours
  const [showGoalDialog, setShowGoalDialog] = useState(false)

  // Load entries for selected date
  useEffect(() => {
    loadEntries()
    loadGoals()
  }, [selectedDate])

  const loadEntries = async () => {
    try {
      const data = await getCategoryData(selectedDate, 'tracker')
      const hydrationEntries = data
        .filter(record => record.subcategory.startsWith('hydration-'))
        .map(record => {
          try {
            // Check if content is already an object or needs parsing
            let parsed: HydrationEntry
            if (typeof record.content === 'string') {
              parsed = JSON.parse(record.content) as HydrationEntry
            } else {
              parsed = record.content as HydrationEntry
            }
            return parsed
          } catch {
            return null
          }
        })
        .filter(Boolean) as HydrationEntry[]
      
      setEntries(hydrationEntries.sort((a, b) => (a.time || '').localeCompare(b.time || '')))
    } catch (error) {
      console.error('Failed to load hydration entries:', error)
    }
  }

  const loadGoals = async () => {
    try {
      const goalData = await getSpecificData(selectedDate, 'settings', 'hydration-goal')
      if (goalData) {
        // Check if content is already an object or needs parsing
        let goal: DailyHydrationGoal
        if (typeof goalData.content === 'string') {
          goal = JSON.parse(goalData.content) as DailyHydrationGoal
        } else {
          goal = goalData.content as DailyHydrationGoal
        }
        setDailyGoal(goal.targetAmount)
        setReminderInterval(goal.reminderInterval)
      }
    } catch (error) {
      console.error('Failed to load hydration goals:', error)
    }
  }

  const saveGoals = async () => {
    try {
      const goalData: DailyHydrationGoal = {
        targetAmount: dailyGoal,
        reminderInterval
      }

      await saveData(
        selectedDate,
        'settings',
        'hydration-goal',
        goalData
      )

      setShowGoalDialog(false)
      toast({
        title: "Goals Updated! 🎯",
        description: "Your hydration goals have been saved by the water wizards!"
      })
    } catch (error) {
      console.error('🍉 FAILED TO SAVE GOALS:', error)
      toast({
        title: "Error saving goals",
        description: "Failed to save hydration goals",
        variant: "destructive"
      })
    }
  }

  const handleSave = async (entryData: Omit<HydrationEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true)
      const hydrationEntry: HydrationEntry = {
        id: editingEntry?.id || `hydration-${Date.now()}`,
        ...entryData,
        createdAt: editingEntry?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await saveData(
        selectedDate,
        'tracker',
        `hydration-${hydrationEntry.id}`,
        JSON.stringify(hydrationEntry),
        entryData.tags
      )

      // Reset state and refresh
      setEditingEntry(null)
      setIsModalOpen(false)
      await loadEntries()

      toast({
        title: "Hydration logged! 💧",
        description: HYDRATION_GOBLINISMS[Math.floor(Math.random() * HYDRATION_GOBLINISMS.length)]
      })
    } catch (error) {
      console.error('Failed to save hydration entry:', error)
      toast({
        title: "Error saving entry",
        description: "The water sprites are confused and can't find the save button!",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (entry: HydrationEntry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleDelete = async (entry: HydrationEntry) => {
    try {
      await deleteData(entry.date, 'tracker', `hydration-${entry.id}`)
      await loadEntries()
      toast({
        title: "Entry Deleted 🗑️",
        description: "Hydration entry has been evaporated into the digital ether!"
      })
    } catch (error) {
      console.error('Failed to delete hydration entry:', error)
      toast({
        title: "Error deleting entry",
        description: "Failed to delete hydration entry",
        variant: "destructive"
      })
    }
  }



  const getDrinkType = (typeValue: string) => {
    return DRINK_TYPES.find(type => type.value === typeValue) || DRINK_TYPES[0]
  }

  // Calculate daily progress

  const totalIntake = entries.reduce((total, entryRaw) => {
    // Parse string entries to objects
    let entry: HydrationEntry
    if (typeof entryRaw === 'string') {
      try {
        entry = JSON.parse(entryRaw)
      } catch (error) {
        return total
      }
    } else {
      entry = entryRaw as HydrationEntry
    }

    if (!entry || !entry.drinkType || !entry.amount) {
      return total
    }

    const drinkType = getDrinkType(entry.drinkType)
    const effectiveAmount = entry.amount * drinkType.multiplier
    return total + effectiveAmount
  }, 0)



  const progressPercentage = Math.min((totalIntake / dailyGoal) * 100, 100)
  const isGoalMet = totalIntake >= dailyGoal

  return (
    <AppCanvas currentPage="hydration">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Droplets className="h-8 w-8 text-blue-500" />
            💧 Hydration Tracker
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your liquid adventures with the aqua goblins and water sprites
          </p>
        </header>

        {/* Date Selection & Daily Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="max-w-xs"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Daily Progress
                </span>
                <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hydration Goals</DialogTitle>
                      <DialogDescription>
                        Set your daily hydration targets
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Daily Goal (oz)</Label>
                        <Input
                          type="number"
                          value={dailyGoal}
                          onChange={(e) => setDailyGoal(Number(e.target.value))}
                          min={16}
                          max={128}
                          step={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Reminder Interval (hours)</Label>
                        <Input
                          type="number"
                          value={reminderInterval}
                          onChange={(e) => setReminderInterval(Number(e.target.value))}
                          min={0.5}
                          max={8}
                          step={0.5}
                        />
                      </div>
                      <Button onClick={saveGoals} className="w-full">
                        Save Goals
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{Math.round(totalIntake)}oz</span>
                  <span>{dailyGoal}oz</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="text-center">
                  {isGoalMet ? (
                    <Badge variant="default" className="bg-green-500">
                      🎉 Goal Achieved!
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      {Math.round(dailyGoal - totalIntake)}oz to go
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-soft)' }}>
            <TabsTrigger value="entry" style={{ color: 'var(--text-main)' }}>Log Drink</TabsTrigger>
            <TabsTrigger value="history" style={{ color: 'var(--text-main)' }}>Hydration History</TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="space-y-6">
            {/* Clean Interface with Modal Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">💧</div>
                  <h2 className="text-2xl font-bold text-foreground">Log Your Hydration</h2>
                  <p className="text-muted-foreground">
                    Track your liquid adventures with the hydration sprites and water goblins
                  </p>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full h-20 text-lg"
                    variant="outline"
                  >
                    <Droplets className="h-6 w-6 mr-2" />
                    💧 Log Drink
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {/* Hydration History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Hydration History
                </CardTitle>
                <CardDescription>
                  Your documented liquid adventures for {formatLocalDateString(selectedDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <div className="text-center py-8">
                    <Droplets className="h-12 w-12 text-secondary-foreground mx-auto mb-4" />
                    <p className="text-secondary-foreground">
                      No hydration entries for this date
                    </p>
                    <p className="text-sm text-secondary-foreground mt-2">
                      The water sprites are waiting for your drink data!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entryRaw) => {
                      // If entry is still a string, parse it here
                      let entry: HydrationEntry
                      if (typeof entryRaw === 'string') {
                        try {
                          entry = JSON.parse(entryRaw)
                        } catch (error) {
                          console.error('🍉 FAILED TO PARSE HYDRATION ENTRY:', entryRaw)
                          return null
                        }
                      } else {
                        entry = entryRaw as HydrationEntry
                      }

                      const drinkTypeInfo = getDrinkType(entry.drinkType)
                      const effectiveAmount = Math.round(entry.amount * drinkTypeInfo.multiplier)
                      
                      return (
                        <Card key={entry.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{drinkTypeInfo.emoji}</span>
                                <div>
                                  <h3 className="font-semibold">
                                    {entry.amount}oz {drinkTypeInfo.label.replace(/^.+ /, '')}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {entry.time} • {effectiveAmount}oz effective hydration
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(entry)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(entry)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {entry.notes && (
                              <p className="text-sm mb-3">{entry.notes}</p>
                            )}
                            
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {entry.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Hydration Modal */}
        <HydrationForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          selectedDate={selectedDate}
          editingEntry={editingEntry}
          isLoading={isLoading}
        />

        <div className="text-center">
          <Button variant="outline" asChild>
            <a href="/choice">
              ← Back to Choice
            </a>
          </Button>
        </div>
      </div>
    </AppCanvas>
  )
}
