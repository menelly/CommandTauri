"use client"

import { useState, useEffect } from "react"
import AppCanvas from "@/components/app-canvas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Settings,
  Plus,
  Minus,
  Battery,
  BatteryLow,
  Search,
  Trash2,
  ArrowLeft,
  Edit2,
  Calendar
} from "lucide-react"
import { useDailyData, CATEGORIES, formatDateForStorage } from "@/lib/database"
import { useGoblinMode } from "@/lib/goblin-mode-context"

interface EnergyEntry {
  id: string
  date: string
  energyLevel: number // 0-5
  notes?: string
  activities?: string[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export default function EnergyTracker() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const { saveData, getCategoryData, deleteData, getDateRange, isLoading } = useDailyData()
  const { goblinMode } = useGoblinMode()
  
  const [entries, setEntries] = useState<EnergyEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [energyLevel, setEnergyLevel] = useState(3)
  const [notes, setNotes] = useState("")
  const [activities, setActivities] = useState<string[]>([])
  const [newActivity, setNewActivity] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Edit state
  const [editingEntry, setEditingEntry] = useState<EnergyEntry | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // UI state
  const [activeTab, setActiveTab] = useState("entry")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  
  // ============================================================================
  // DATA LOADING
  // ============================================================================
  
  const loadEntries = async () => {
    try {
      setError(null)

      // Get all energy entries from the last 30 days using date range
      const endDate = formatDateForStorage(new Date())
      const startDate = formatDateForStorage(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

      // Get all records in date range for energy tracker
      const records = await getDateRange(startDate, endDate, CATEGORIES.TRACKER)

      // Filter for energy subcategory and extract entries
      const energyRecords = records.filter(record => record.subcategory === 'energy')

      let allEntries: EnergyEntry[] = []

      for (const record of energyRecords) {
        if (record.content?.entries) {
          // Parse entries with JSON parsing fix
          let entries = record.content.entries
          if (typeof entries === 'string') {
            try {
              entries = JSON.parse(entries)
            } catch (e) {
              console.error('Failed to parse energy entries JSON:', e)
              continue
            }
          }
          if (!Array.isArray(entries)) {
            entries = [entries]
          }

          allEntries.push(...entries.filter((entry: any) => entry && typeof entry === 'object'))
        }
      }

      // Sort by date (newest first)
      allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setEntries(allEntries)
      console.log(`⚡ Loaded ${allEntries.length} energy entries from last 30 days`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load energy entries'
      setError(errorMsg)
      console.error('Failed to load energy entries:', err)
    }
  }
  
  // Load entries on mount
  useEffect(() => {
    loadEntries()
  }, [])
  
  // ============================================================================
  // ENERGY LEVEL HELPERS
  // ============================================================================
  
  const getBatteryIcon = (level: number) => {
    if (level <= 1) return <BatteryLow className="h-5 w-5" />
    return <Battery className="h-5 w-5" />
  }
  
  const getBatteryColor = (level: number) => {
    if (level <= 1) return "text-red-500"
    if (level <= 2) return "text-orange-500"
    if (level <= 3) return "text-yellow-500"
    if (level <= 4) return "text-green-500"
    return "text-green-600"
  }
  
  const getEnergyLabel = (level: number) => {
    if (goblinMode) {
      // Goblin mode labels
      switch (level) {
        case 0: return "Potato Mode"
        case 1: return "Barely Alive"
        case 2: return "Low Power"
        case 3: return "Functional Chaos"
        case 4: return "Feeling Spicy"
        case 5: return "Maximum Chaos"
        default: return "Mysterious"
      }
    } else {
      // Professional mode labels
      switch (level) {
        case 0: return "Exhausted"
        case 1: return "Very Low"
        case 2: return "Low"
        case 3: return "Moderate"
        case 4: return "Good"
        case 5: return "Excellent"
        default: return "Unknown"
      }
    }
  }
  
  const getEnergyDescription = (level: number) => {
    if (goblinMode) {
      // Goblin mode descriptions
      switch (level) {
        case 0: return "Potato mode activated. Existence is questionable. Send help (and caffeine)."
        case 1: return "Functioning human simulation failing. Basic tasks feel like climbing Everest in flip-flops."
        case 2: return "Low-power mode engaged. Can handle essentials but don't ask for miracles."
        case 3: return "Moderately functional chaos gremlin. Normal tasks are achievable with mild grumbling."
        case 4: return "Feeling spicy! Productivity levels rising. The chaos is organized today."
        case 5: return "MAXIMUM CHAOS ENERGY! Ready to conquer worlds and reorganize entire universes!"
        default: return "Energy level: mysterious and unknowable"
      }
    } else {
      // Professional mode descriptions
      switch (level) {
        case 0: return "Can barely keep eyes open. Need immediate rest."
        case 1: return "Struggling to function. Basic tasks feel overwhelming."
        case 2: return "Low energy but can manage essential activities."
        case 3: return "Moderate energy. Can handle normal daily tasks."
        case 4: return "Good energy levels. Feeling productive and alert."
        case 5: return "Peak energy! Ready to conquer the world!"
        default: return "Energy level unknown"
      }
    }
  }
  
  // ============================================================================
  // FORM HANDLERS
  // ============================================================================
  
  const handleSubmit = async () => {
    try {
      setError(null)

      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toISOString()

      let updatedEntries: EnergyEntry[]

      if (isEditing && editingEntry) {
        // Update existing entry
        const updatedEntry: EnergyEntry = {
          ...editingEntry,
          energyLevel,
          notes: notes.trim() || undefined,
          activities: activities.length > 0 ? activities : undefined,
          tags: tags.length > 0 ? tags : undefined,
          updatedAt: now,
        }

        // Update entries array
        updatedEntries = entries.map(entry =>
          entry.id === editingEntry.id ? updatedEntry : entry
        )

        // Reset editing state
        setIsEditing(false)
        setEditingEntry(null)

        console.log('⚡ Energy entry updated successfully')
      } else {
        // Create new entry
        const newEntry: EnergyEntry = {
          id: `energy-${Date.now()}`,
          date: today,
          energyLevel,
          notes: notes.trim() || undefined,
          activities: activities.length > 0 ? activities : undefined,
          tags: tags.length > 0 ? tags : undefined,
          createdAt: now,
          updatedAt: now,
        }

        // Add to entries array
        updatedEntries = [newEntry, ...entries]

        console.log('⚡ Energy entry created successfully')
      }

      // Save all entries to database using new pattern
      await saveData(
        today,
        CATEGORIES.TRACKER,
        'energy',
        { entries: updatedEntries },
        tags
      )

      // Update local state
      setEntries(updatedEntries)

      // Reset form
      setEnergyLevel(3)
      setNotes("")
      setActivities([])
      setTags([])

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save energy entry'
      setError(errorMsg)
      console.error('Failed to save energy entry:', err)
    }
  }

  const handleEdit = (entry: EnergyEntry) => {
    setEditingEntry(entry)
    setIsEditing(true)
    setEnergyLevel(entry.energyLevel)
    setNotes(entry.notes || "")
    setActivities(entry.activities || [])
    setTags(entry.tags || [])

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (entry: EnergyEntry) => {
    if (!confirm('Are you sure you want to delete this energy entry?')) {
      return
    }

    try {
      setError(null)

      // Remove from entries array
      const updatedEntries = entries.filter(e => e.id !== entry.id)

      // Save updated entries to database
      await saveData(
        entry.date,
        CATEGORIES.TRACKER,
        'energy',
        { entries: updatedEntries }
      )

      // Update local state
      setEntries(updatedEntries)

      console.log('⚡ Energy entry deleted successfully')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete energy entry'
      setError(errorMsg)
      console.error('Failed to delete energy entry:', err)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingEntry(null)
    setEnergyLevel(3)
    setNotes("")
    setActivities([])
    setTags([])
  }
  
  const addActivity = () => {
    const trimmed = newActivity.trim()
    if (trimmed && !activities.includes(trimmed)) {
      setActivities([...activities, trimmed])
      setNewActivity("")
    }
  }
  
  const removeActivity = (activity: string) => {
    setActivities(activities.filter(a => a !== activity))
  }
  
  const increaseEnergy = () => {
    if (energyLevel < 5) {
      setEnergyLevel(energyLevel + 1)
    }
  }
  
  const decreaseEnergy = () => {
    if (energyLevel > 0) {
      setEnergyLevel(energyLevel - 1)
    }
  }
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <AppCanvas currentPage="energy">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="flex items-center gap-2"
            >
              <a href="/physical-health">
                <ArrowLeft className="h-4 w-4" />
                Physical Health
              </a>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Energy
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your energy levels using spoon theory concepts
          </p>
        </div>

        {/* Date Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📅 Select Date
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

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-soft)' }}>
            <TabsTrigger value="entry" style={{ color: 'var(--text-main)' }}>Energy Entry</TabsTrigger>
            <TabsTrigger value="history" style={{ color: 'var(--text-main)' }}>Energy History</TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="space-y-6">
            {/* Energy Entry Form */}
            <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {isEditing ? 'Edit Energy Entry' : "Today's Energy"}
                </CardTitle>
                <CardDescription>
                  {isEditing
                    ? `Editing entry from ${new Date(editingEntry!.date).toLocaleDateString()}`
                    : 'Rate your current energy level and track what\'s affecting it'
                  }
                </CardDescription>
              </div>
              {isEditing && (
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Energy Level Slider */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">⚡ Energy Level</Label>
              
              <div className="flex items-center justify-center space-y-4 flex-col">
                <div className={`flex items-center gap-3 ${getBatteryColor(energyLevel)}`}>
                  {getBatteryIcon(energyLevel)}
                  <span className="text-2xl font-bold">{energyLevel}/5</span>
                  <span className="text-lg">{getEnergyLabel(energyLevel)}</span>
                </div>
                
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {getEnergyDescription(energyLevel)}
                </p>
                
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseEnergy}
                    disabled={energyLevel === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setEnergyLevel(level)}
                        className={`w-8 h-8 rounded-full border-2 transition-colors ${
                          energyLevel === level
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted hover:border-primary'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseEnergy}
                    disabled={energyLevel === 5}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Activities */}
            <div className="space-y-4">
              <Label>Activities (what's affecting your energy?)</Label>

              {/* Quick-add common activities */}
              <div className="flex flex-wrap gap-2">
                {["Work", "Exercise", "Sleep", "Eating", "Socializing", "Commuting", "Household chores", "Screen time", "Reading", "Cooking", "Medical appointments", "Relaxing"].map((commonActivity) => (
                  <Button
                    key={commonActivity}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!activities.includes(commonActivity)) {
                        setActivities([...activities, commonActivity])
                      }
                    }}
                    disabled={activities.includes(commonActivity)}
                    className="text-xs"
                  >
                    {commonActivity}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom activity..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                />
                <Button onClick={addActivity} disabled={!newActivity.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {activities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activities.map((activity, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {activity}
                      <button
                        onClick={() => removeActivity(activity)}
                        className="ml-1 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="How are you feeling? What's helping or draining your energy?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">
              {isEditing ? 'Update Energy Entry' : 'Save Energy Entry'}
            </Button>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {/* Energy History */}
            <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Energy History
                </CardTitle>
                <CardDescription>
                  Your energy tracking history and patterns
                </CardDescription>
              </div>
              {entries.length > 0 && (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-5 w-5 animate-pulse" />
                  <span>Loading energy history...</span>
                </div>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No energy entries yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your energy levels to see patterns and trends over time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries
                  .filter(entry => {
                    if (!searchQuery) return true
                    const query = searchQuery.toLowerCase()
                    return (
                      entry.notes?.toLowerCase().includes(query) ||
                      entry.activities?.some(activity => activity.toLowerCase().includes(query)) ||
                      entry.tags?.some(tag => tag.toLowerCase().includes(query))
                    )
                  })
                  .map((entry) => (
                    <Card key={entry.id} className="border-l-4" style={{
                      borderLeftColor: entry.energyLevel <= 1 ? '#ef4444' :
                                     entry.energyLevel <= 2 ? '#f97316' :
                                     entry.energyLevel <= 3 ? '#eab308' :
                                     entry.energyLevel <= 4 ? '#22c55e' : '#16a34a'
                    }}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 ${getBatteryColor(entry.energyLevel)}`}>
                              {getBatteryIcon(entry.energyLevel)}
                              <span className="font-semibold text-lg">{entry.energyLevel}/5</span>
                              <Badge variant="outline" className="text-xs">
                                {getEnergyLabel(entry.energyLevel)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {new Date(entry.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(entry)}
                                className="h-8 w-8 p-0"
                                title="Edit entry"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(entry)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                title="Delete entry"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {entry.activities && entry.activities.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Activities:</p>
                            <div className="flex flex-wrap gap-1">
                              {entry.activities.map((activity, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {activity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {entry.notes && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Notes:</p>
                            <p className="text-sm">{entry.notes}</p>
                          </div>
                        )}

                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {entry.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                {entries.filter(entry => {
                  if (!searchQuery) return true
                  const query = searchQuery.toLowerCase()
                  return (
                    entry.notes?.toLowerCase().includes(query) ||
                    entry.activities?.some(activity => activity.toLowerCase().includes(query)) ||
                    entry.tags?.some(tag => tag.toLowerCase().includes(query))
                  )
                }).length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No matching entries</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or clear the search to see all entries.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppCanvas>
  )
}
