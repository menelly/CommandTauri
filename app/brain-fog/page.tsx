'use client'

import { useState, useEffect } from "react"
import AppCanvas from "@/components/app-canvas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Cloud, Plus, Edit, Trash2, Calendar, AlertCircle, Info } from "lucide-react"
import { useDailyData, CATEGORIES } from "@/lib/database"
import { useGoblinMode } from "@/lib/goblin-mode-context"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface BrainFogEntry {
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

const BRAIN_FOG_SYMPTOMS = [
  { value: "memory_issues", emoji: "🧠", description: "Trouble remembering things" },
  { value: "word_finding", emoji: "💭", description: "Can't find the right words" },
  { value: "concentration", emoji: "🎯", description: "Difficulty focusing" },
  { value: "mental_fatigue", emoji: "😴", description: "Brain feels tired" },
  { value: "confusion", emoji: "😵", description: "Feeling confused or mixed up" },
  { value: "slow_processing", emoji: "🐌", description: "Thinking feels slow" },
  { value: "conversation_trouble", emoji: "💬", description: "Hard to follow conversations" },
  { value: "reading_difficulty", emoji: "📖", description: "Trouble reading/comprehending" },
  { value: "multitasking", emoji: "🤹", description: "Can't handle multiple tasks" },
  { value: "mental_cloudiness", emoji: "☁️", description: "Mind feels foggy/cloudy" },
  { value: "decision_making", emoji: "🤔", description: "Hard to make decisions" },
  { value: "organizing_thoughts", emoji: "🗂️", description: "Can't organize thoughts" }
]

const SEVERITY_LEVELS = Array.from({ length: 10 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `${i + 1}`,
  description: i === 0 ? "Minimal" : i === 4 ? "Moderate" : i === 9 ? "Severe" : ""
}))

const COMMON_TRIGGERS = [
  "Stress", "Poor sleep", "Dehydration", "Medication", "Illness", "Hormones",
  "Weather changes", "Overexertion", "Screen time", "Noise", "Crowds", "Other"
]

const COMMON_TREATMENTS = [
  "Rest", "Hydration", "Fresh air", "Meditation", "Light exercise", "Breaks",
  "Reduce stimulation", "Medication", "Sleep", "Nutrition", "Other"
]

const BRAIN_FOG_GOBLINISMS = [
  "Brain fog documented! The cognitive gremlins are taking notes! 🧠✨",
  "Your mental mist has been logged by the fog fairies! 🌫️",
  "Cognitive chaos saved! The memory sprites approve! 💭",
  "Your brain fog saga has been recorded by the clarity gnomes! 🧚‍♂️",
  "Mental fog entry logged! The concentration pixies are pleased! ✨"
]

export default function BrainFogTracker() {
  const { saveData, getCategoryData, deleteData, getDateRange, isLoading } = useDailyData()
  const { toast } = useToast()
  const { goblinMode } = useGoblinMode()

  // Form state
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [time, setTime] = useState(format(new Date(), 'HH:mm'))
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [severity, setSeverity] = useState("")
  const [triggers, setTriggers] = useState<string[]>([])
  const [treatments, setTreatments] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  // UI state
  const [entries, setEntries] = useState<BrainFogEntry[]>([])
  const [editingEntry, setEditingEntry] = useState<BrainFogEntry | null>(null)
  const [activeTab, setActiveTab] = useState("entry")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Load entries on mount
  useEffect(() => {
    loadEntries()
  }, [])

  // Load entries for selected date
  useEffect(() => {
    loadEntries()
  }, [selectedDate])

  const loadEntries = async () => {
    try {
      const records = await getCategoryData(selectedDate, CATEGORIES.TRACKER)
      const brainFogRecord = records.find(record => record.subcategory === 'brain-fog')

      if (brainFogRecord?.content?.entries) {
        // Parse entries with JSON parsing fix
        let entries = brainFogRecord.content.entries
        if (typeof entries === 'string') {
          try {
            entries = JSON.parse(entries)
          } catch (e) {
            console.error('Error parsing brain fog entries:', e)
            entries = []
          }
        }
        setEntries(Array.isArray(entries) ? entries : [])
      } else {
        setEntries([])
      }
    } catch (error) {
      console.error('Error loading brain fog entries:', error)
      setEntries([])
    }
  }

  const handleSave = async () => {
    if (!severity || symptoms.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select severity and at least one symptom.",
        variant: "destructive"
      })
      return
    }

    const newEntry: BrainFogEntry = {
      id: editingEntry?.id || Date.now().toString(),
      date: selectedDate,
      time,
      symptoms,
      severity,
      triggers,
      treatments,
      notes,
      tags,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      // Get existing entries for this date
      const records = await getCategoryData(selectedDate, CATEGORIES.TRACKER)
      const existingRecord = records.find(record => record.subcategory === 'brain-fog')

      let existingEntries: BrainFogEntry[] = []
      if (existingRecord?.content?.entries) {
        let entries = existingRecord.content.entries
        if (typeof entries === 'string') {
          try {
            entries = JSON.parse(entries)
          } catch (e) {
            console.error('Error parsing existing entries:', e)
            entries = []
          }
        }
        existingEntries = Array.isArray(entries) ? entries : []
      }

      // Update or add entry
      if (editingEntry) {
        const entryIndex = existingEntries.findIndex(e => e.id === editingEntry.id)
        if (entryIndex >= 0) {
          existingEntries[entryIndex] = newEntry
        } else {
          existingEntries.push(newEntry)
        }
      } else {
        existingEntries.push(newEntry)
      }

      await saveData(selectedDate, CATEGORIES.TRACKER, 'brain-fog', { entries: existingEntries })

      const randomGoblinism = BRAIN_FOG_GOBLINISMS[Math.floor(Math.random() * BRAIN_FOG_GOBLINISMS.length)]
      toast({
        title: "Entry Saved!",
        description: goblinMode ? randomGoblinism : "Brain fog entry saved successfully.",
      })

      resetForm()
      setIsAddDialogOpen(false)
      setEditingEntry(null)
      await loadEntries()
    } catch (error) {
      console.error('Error saving brain fog entry:', error)
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setTime(format(new Date(), 'HH:mm'))
    setSymptoms([])
    setSeverity("")
    setTriggers([])
    setTreatments([])
    setNotes("")
    setTags([])
    setTagInput("")
  }

  const handleEdit = (entry: BrainFogEntry) => {
    setEditingEntry(entry)
    setTime(entry.time)
    setSymptoms(entry.symptoms)
    setSeverity(entry.severity)
    setTriggers(entry.triggers)
    setTreatments(entry.treatments)
    setNotes(entry.notes)
    setTags(entry.tags)
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (entry: BrainFogEntry) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      const records = await getCategoryData(entry.date, CATEGORIES.TRACKER)
      const existingRecord = records.find(record => record.subcategory === 'brain-fog')

      if (existingRecord?.content?.entries) {
        let entries = existingRecord.content.entries
        if (typeof entries === 'string') {
          try {
            entries = JSON.parse(entries)
          } catch (e) {
            console.error('Error parsing entries for deletion:', e)
            entries = []
          }
        }

        const updatedEntries = entries.filter((e: BrainFogEntry) => e.id !== entry.id)

        if (updatedEntries.length === 0) {
          await deleteData(entry.date, CATEGORIES.TRACKER, 'brain-fog')
        } else {
          await saveData(entry.date, CATEGORIES.TRACKER, 'brain-fog', { entries: updatedEntries })
        }
      }

      toast({
        title: "Entry Deleted",
        description: "Brain fog entry has been removed."
      })
      await loadEntries()
    } catch (error) {
      console.error('Error deleting brain fog entry:', error)
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive"
      })
    }
  }

  const toggleSymptom = (symptomValue: string) => {
    setSymptoms(prev =>
      prev.includes(symptomValue)
        ? prev.filter(s => s !== symptomValue)
        : [...prev, symptomValue]
    )
  }

  const toggleTrigger = (trigger: string) => {
    setTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    )
  }

  const toggleTreatment = (treatment: string) => {
    setTreatments(prev =>
      prev.includes(treatment)
        ? prev.filter(t => t !== treatment)
        : [...prev, treatment]
    )
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const getSymptomInfo = (symptomValue: string) => {
    return BRAIN_FOG_SYMPTOMS.find(s => s.value === symptomValue)
  }

  return (
    <AppCanvas currentPage="brain-fog">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Cloud className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Brain Fog & Cognitive</h1>
          </div>
          <p className="text-muted-foreground">
            Record your cognitive symptoms and brain fog levels
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entry">Track Symptoms</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Track Symptoms Tab */}
          <TabsContent value="entry" className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 text-6xl">🧠</div>
                <CardTitle className="text-xl">Track brain fog symptoms</CardTitle>
                <CardDescription>
                  Record cognitive symptoms, brain fog levels, and triggers to identify patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Log Brain Fog Symptoms
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Entry History</h2>
              <div className="flex items-center gap-2">
                <Label htmlFor="date-select">Date:</Label>
                <Input
                  id="date-select"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading entries...</p>
              </div>
            ) : entries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Cloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No entries for this date</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your brain fog symptoms to see your history here.
                  </p>
                  <Button onClick={() => setActiveTab("entry")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">🧠</div>
                          <div>
                            <h3 className="font-semibold">
                              {format(new Date(`${entry.date}T${entry.time}`), 'h:mm a')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Severity: {entry.severity}/10
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {entry.symptoms.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2">Symptoms</h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.symptoms.map((symptom) => {
                              const symptomInfo = getSymptomInfo(symptom)
                              return (
                                <Badge key={symptom} variant="outline">
                                  {symptomInfo?.emoji} {symptomInfo?.description || symptom}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {entry.triggers.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2">Triggers</h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.triggers.map((trigger) => (
                              <Badge key={trigger} variant="secondary">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.treatments.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2">Treatments</h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.treatments.map((treatment) => (
                              <Badge key={treatment} variant="outline">
                                {treatment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.notes && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2">Notes</h4>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                            {entry.notes}
                          </p>
                        </div>
                      )}

                      {entry.tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Brain fog analytics and insights will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Entry Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Brain Fog Entry' : 'Log Brain Fog Symptoms'}
              </DialogTitle>
              <DialogDescription>
                Record your cognitive symptoms and brain fog levels for {format(new Date(selectedDate), 'PPP')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              {/* Severity */}
              <div className="space-y-3">
                <Label>Brain Fog Level (1-10)</Label>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {SEVERITY_LEVELS.map((level) => (
                    <Button
                      key={level.value}
                      variant={severity === level.value ? "default" : "outline"}
                      className={`h-12 flex flex-col items-center justify-center text-xs ${
                        severity === level.value ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSeverity(level.value)}
                    >
                      <span className="font-bold">{level.label}</span>
                      {level.description && (
                        <span className="text-[10px] opacity-75">{level.description}</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div className="space-y-3">
                <Label>Cognitive Symptoms</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {BRAIN_FOG_SYMPTOMS.map((symptom) => (
                    <Button
                      key={symptom.value}
                      variant={symptoms.includes(symptom.value) ? "default" : "outline"}
                      className="h-auto p-3 justify-start text-left"
                      onClick={() => toggleSymptom(symptom.value)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{symptom.emoji}</span>
                        <span className="text-sm">{symptom.description}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Triggers */}
              <div className="space-y-3">
                <Label>Possible Triggers</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {COMMON_TRIGGERS.map((trigger) => (
                    <Button
                      key={trigger}
                      variant={triggers.includes(trigger) ? "default" : "outline"}
                      className="h-auto p-2 text-xs"
                      onClick={() => toggleTrigger(trigger)}
                    >
                      {trigger}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Treatments */}
              <div className="space-y-3">
                <Label>Treatments Used</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {COMMON_TREATMENTS.map((treatment) => (
                    <Button
                      key={treatment}
                      variant={treatments.includes(treatment) ? "default" : "outline"}
                      className="h-auto p-2 text-xs"
                      onClick={() => toggleTreatment(treatment)}
                    >
                      {treatment}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe your experience, what helped, or any other details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1" disabled={isLoading}>
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setEditingEntry(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppCanvas>
  )
}
