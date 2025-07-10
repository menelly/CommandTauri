'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Edit, Trash2, Clock, Droplets, Zap, Apple, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { db, CATEGORIES, SUBCATEGORIES, formatDateForStorage, getCurrentTimestamp } from '@/lib/database'
import { useDailyData } from '@/lib/database/hooks/use-daily-data'
import { toast } from '@/hooks/use-toast'

// Shared utility function for timer calculations
const getTimeRemaining = (timer: Timer) => {
  const expires = new Date(timer.expires_at)
  const now = new Date()
  const remainingMs = expires.getTime() - now.getTime()

  if (remainingMs <= 0) return { expired: true, text: "⚠️ EXPIRED!" }

  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return { expired: false, text: `${days}d ${hours}h remaining` }
  } else {
    return { expired: false, text: `${hours}h remaining` }
  }
}

// Types
interface DiabetesEntry {
  id: string
  user_id: string
  entry_date: string
  entry_time: string
  blood_glucose?: number
  ketones?: number
  insulin_type?: string
  insulin_amount?: number
  carbs?: number
  cgm_timer?: number
  pump_timer?: number
  glp1_timer?: number
  mood?: string
  notes?: string
  tags: string[]
  created_at: string
}

interface Timer {
  id: string
  type: 'cgm' | 'pump' | 'glp1'
  name: string
  inserted_at: string  // When the device was inserted
  expires_at: string   // When it needs to be changed
  user_id: string
}

export default function DiabetesTracker() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('tracking')
  const [entries, setEntries] = useState<DiabetesEntry[]>([])
  const [timers, setTimers] = useState<Timer[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DiabetesEntry | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])

  // Tracker enable/disable settings
  const [trackerEnabled, setTrackerEnabled] = useState(true)
  const [enabledFeatures, setEnabledFeatures] = useState({
    bloodGlucose: true,
    ketones: true,
    insulin: true,
    carbs: true,
    timers: true,
    mood: true,
    tags: true,
    analytics: true
  })

  // Form state
  const [formBloodGlucose, setFormBloodGlucose] = useState('')
  const [formKetones, setFormKetones] = useState('')
  const [formInsulinType, setFormInsulinType] = useState('')
  const [formInsulinAmount, setFormInsulinAmount] = useState('')
  const [formCarbs, setFormCarbs] = useState('')
  const [formMood, setFormMood] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formTags, setFormTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')

  // Timer form state
  const [timerType, setTimerType] = useState<'cgm' | 'pump' | 'glp1'>('cgm')
  const [timerName, setTimerName] = useState('')
  const [timerInsertedDate, setTimerInsertedDate] = useState('')
  const [timerInsertedTime, setTimerInsertedTime] = useState('')
  const [timerDays, setTimerDays] = useState('')
  const [editingTimer, setEditingTimer] = useState<Timer | null>(null)
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false)

  const currentUserId = 'default' // TODO: Get from theme/user context

  // Database hook
  const { saveData, getSpecificData } = useDailyData()

  // Load data
  useEffect(() => {
    loadEntries()
    loadTimers()
  }, [currentDate])

  // Check for expired timers and send notifications
  useEffect(() => {
    const checkExpiredTimers = () => {
      timers.forEach(timer => {
        const remaining = getTimeRemaining(timer)
        if (remaining.expired) {
          // Send browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${timer.type.toUpperCase()} Timer Expired!`, {
              body: `Time to change your ${timer.name}`,
              icon: '/icon-192x192.png',
              tag: `timer-${timer.id}` // Prevents duplicate notifications
            })
          }

          // Show toast notification
          toast({
            title: `⚠️ ${timer.type.toUpperCase()} Timer Expired!`,
            description: `Time to change your ${timer.name}`,
            variant: "destructive"
          })
        }
      })
    }

    // Check immediately
    checkExpiredTimers()

    // Check every minute
    const interval = setInterval(checkExpiredTimers, 60000)
    return () => clearInterval(interval)
  }, [timers, toast])

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const loadEntries = async () => {
    try {
      const dateKey = formatDateForStorage(new Date(currentDate))
      const diabetesRecord = await db.daily_data
        .where('[date+category+subcategory]')
        .equals([dateKey, CATEGORIES.HEALTH, 'diabetes'])
        .first()

      if (diabetesRecord && diabetesRecord.content) {
        const loadedEntries = Array.isArray(diabetesRecord.content) ? diabetesRecord.content : [diabetesRecord.content]
        setEntries(loadedEntries)
        console.log('📖 Loaded diabetes entries:', loadedEntries.length)
      } else {
        setEntries([])
        console.log('📖 No diabetes entries for', dateKey)
      }
    } catch (error) {
      console.error('Error loading diabetes entries:', error)
    }
  }

  const loadTimers = async () => {
    try {
      // Load ALL timer records from all dates using the correct index!
      // We need to use category first, then filter by subcategory
      const allTimerRecords = await db.daily_data
        .where('category')
        .equals(CATEGORIES.HEALTH)
        .and(record => record.subcategory === 'diabetes_timers')
        .toArray()

      let allTimers: Timer[] = []

      // Collect timers from all date records
      allTimerRecords.forEach(record => {
        if (record.content) {
          const recordTimers = Array.isArray(record.content) ? record.content : [record.content]
          allTimers = [...allTimers, ...recordTimers]
        }
      })

      // Remove duplicates by ID (in case of data issues)
      const uniqueTimers = allTimers.filter((timer, index, self) =>
        index === self.findIndex(t => t.id === timer.id)
      )

      setTimers(uniqueTimers)
      console.log('📖 Loaded diabetes timers from all dates:', uniqueTimers.length, allTimerRecords.length, 'records')

    } catch (error) {
      console.error('Error loading timers:', error)
      setTimers([])
    }
  }

  const resetForm = () => {
    setFormBloodGlucose('')
    setFormKetones('')
    setFormInsulinType('')
    setFormInsulinAmount('')
    setFormCarbs('')
    setFormMood('')
    setFormNotes('')
    setFormTags([])
    setCustomTag('')
  }

  const handleSubmit = async () => {
    const newEntry: DiabetesEntry = {
      id: editingEntry?.id || `diabetes-${Date.now()}`,
      user_id: currentUserId,
      entry_date: currentDate,
      entry_time: new Date().toTimeString().slice(0, 5),
      blood_glucose: formBloodGlucose ? parseFloat(formBloodGlucose) : undefined,
      ketones: formKetones ? parseFloat(formKetones) : undefined,
      insulin_type: formInsulinType || undefined,
      insulin_amount: formInsulinAmount ? parseFloat(formInsulinAmount) : undefined,
      carbs: formCarbs ? parseFloat(formCarbs) : undefined,
      mood: formMood || undefined,
      notes: formNotes || undefined,
      tags: formTags,
      created_at: editingEntry?.created_at || new Date().toISOString()
    }

    try {
      let updatedEntries
      if (editingEntry) {
        // Update existing entry
        updatedEntries = entries.map(e => e.id === editingEntry.id ? newEntry : e)
      } else {
        // Add new entry
        updatedEntries = [...entries, newEntry]
      }

      const dateKey = formatDateForStorage(new Date(currentDate))
      await db.daily_data.put({
        date: dateKey,
        category: CATEGORIES.HEALTH,
        subcategory: 'diabetes',
        content: updatedEntries,
        tags: newEntry.tags,
        metadata: {
          created_at: getCurrentTimestamp(),
          updated_at: getCurrentTimestamp(),
          user_id: currentUserId
        }
      })

      setEntries(updatedEntries)
      setIsAddModalOpen(false)
      setEditingEntry(null)
      resetForm()

      toast({
        title: editingEntry ? "📝 Entry Updated!" : "🩸 Entry Saved!",
        description: editingEntry ? "Your diabetes entry has been updated." : "Your diabetes data has been logged!"
      })

      console.log('✅ Diabetes entry saved:', newEntry)
    } catch (error) {
      console.error('❌ Failed to save diabetes entry:', error)
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return

    try {
      const updatedEntries = entries.filter(e => e.id !== id)
      const dateKey = formatDateForStorage(new Date(currentDate))
      await db.daily_data.put({
        date: dateKey,
        category: CATEGORIES.HEALTH,
        subcategory: 'diabetes',
        content: updatedEntries,
        tags: [],
        metadata: {
          created_at: getCurrentTimestamp(),
          updated_at: getCurrentTimestamp(),
          user_id: currentUserId
        }
      })

      setEntries(updatedEntries)

      toast({
        title: "🗑️ Entry Deleted",
        description: "Your diabetes entry has been removed."
      })

      console.log('✅ Diabetes entry deleted:', id)
    } catch (error) {
      console.error('❌ Failed to delete diabetes entry:', error)
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive"
      })
    }
  }

  const startEdit = (entry: DiabetesEntry) => {
    setEditingEntry(entry)
    setFormBloodGlucose(entry.blood_glucose?.toString() || '')
    setFormKetones(entry.ketones?.toString() || '')
    setFormInsulinType(entry.insulin_type || '')
    setFormInsulinAmount(entry.insulin_amount?.toString() || '')
    setFormCarbs(entry.carbs?.toString() || '')
    setFormMood(entry.mood || '')
    setFormNotes(entry.notes || '')
    setFormTags(entry.tags || [])
    setIsAddModalOpen(true)
  }

  const addTag = (tag: string) => {
    if (tag && !formTags.includes(tag)) {
      setFormTags([...formTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setFormTags(formTags.filter(t => t !== tag))
  }

  const addCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim())
      setCustomTag('')
    }
  }

  const startTimer = async () => {
    console.log('🔧 startTimer called with:', { timerName, timerInsertedDate, timerInsertedTime, timerDays })

    if (!timerInsertedDate || !timerInsertedTime || !timerDays) {
      console.log('❌ Missing required fields:', { timerInsertedDate, timerInsertedTime, timerDays })
      toast({
        title: "Missing Information",
        description: "Please fill in date, time, and days for your timer.",
        variant: "destructive"
      })
      return
    }

    // Combine date and time into insertion datetime
    const insertedDateTime = new Date(`${timerInsertedDate}T${timerInsertedTime}`)

    // Calculate expiration based on custom days
    const expirationDateTime = new Date(insertedDateTime)
    expirationDateTime.setDate(expirationDateTime.getDate() + parseInt(timerDays))

    const newTimer: Timer = {
      id: editingTimer?.id || `timer-${Date.now()}`,
      type: timerType,
      name: timerName || `${timerType.toUpperCase()} Timer`, // Auto-generate name if empty
      inserted_at: insertedDateTime.toISOString(),
      expires_at: expirationDateTime.toISOString(),
      user_id: currentUserId
    }

    try {
      // CREATION DATE ARCHITECTURE: Save timer to its INSERTION DATE, not today!
      const timerCreationDate = formatDateForStorage(insertedDateTime)

      console.log('💾 Saving timer to its creation date:', timerCreationDate)

      // Get existing timers for the CREATION DATE only
      const existingRecord = await db.daily_data
        .where('[date+category+subcategory]')
        .equals([timerCreationDate, CATEGORIES.HEALTH, 'diabetes_timers'])
        .first()

      let updatedTimers: Timer[] = []

      if (existingRecord && Array.isArray(existingRecord.content)) {
        updatedTimers = existingRecord.content as Timer[]
      }

      if (editingTimer) {
        // Update existing timer (restart it)
        updatedTimers = updatedTimers.map(t => t.id === editingTimer.id ? newTimer : t)
        console.log('🔄 Restarting existing timer:', editingTimer.id)
      } else {
        // Add new timer to creation date record
        updatedTimers = [...updatedTimers, newTimer]
        console.log('➕ Adding new timer to creation date')
      }

      const timerRecord = {
        date: timerCreationDate, // SAVE TO CREATION DATE!
        category: CATEGORIES.HEALTH,
        subcategory: 'diabetes_timers',
        content: updatedTimers,
        tags: [],
        metadata: {
          created_at: getCurrentTimestamp(),
          updated_at: getCurrentTimestamp(),
          user_id: currentUserId
        }
      }

      console.log('💾 About to save timer record:', timerRecord)
      console.log('💾 Updated timers array:', updatedTimers)

      const result = await db.daily_data.put(timerRecord)
      console.log('💾 Database put result:', result)

      setTimers(updatedTimers)
      setTimerName('')
      setTimerInsertedDate('')
      setTimerInsertedTime('')
      setTimerDays('')
      setEditingTimer(null)
      setIsTimerModalOpen(false)

      toast({
        title: editingTimer ? "🔄 Timer Restarted!" : "⏰ Timer Started!",
        description: editingTimer
          ? `${newTimer.name} timer has been restarted. Change by ${new Date(newTimer.expires_at).toLocaleDateString()}.`
          : `${newTimer.name} timer is now running. Change by ${new Date(newTimer.expires_at).toLocaleDateString()}.`
      })

      console.log('✅ Timer saved:', newTimer)

      // Add to calendar
      console.log('🔧 About to add to calendar:', newTimer)
      addToCalendar(newTimer)

    } catch (error) {
      console.error('❌ Failed to save timer:', error)
      toast({
        title: "Error",
        description: "Failed to save timer. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Add timer reminder to internal calendar
  const addToCalendar = async (timer: Timer) => {
    try {
      const expirationDate = new Date(timer.expires_at)
      const dateKey = formatDateForStorage(expirationDate)

      // Create calendar event for the internal calendar
      const calendarEvent = {
        id: `timer-${timer.id}`,
        title: `🩸 Change ${timer.name}`,
        date: dateKey, // YYYY-MM-DD format
        color: timer.type === 'cgm' ? '#ef4444' : timer.type === 'pump' ? '#3b82f6' : '#10b981' // Red for CGM, Blue for Pump, Green for GLP-1
      }

      console.log('📅 Calendar event created:', calendarEvent)

      // ACTUALLY SAVE TO DATABASE - Create events array format
      const eventsData = {
        events: [calendarEvent]
      }

      // Save to calendar database
      await saveData(
        dateKey,
        CATEGORIES.CALENDAR,
        SUBCATEGORIES.MONTHLY,
        JSON.stringify(eventsData)
      )

      console.log('💾 Calendar event saved to database:', dateKey, eventsData)

      toast({
        title: "📅 Timer Reminder Created!",
        description: `Reminder set for ${expirationDate.toLocaleDateString()}. Check your monthly calendar!`
      })

    } catch (error) {
      console.error('❌ Failed to create calendar reminder:', error)
      toast({
        title: "Calendar Error",
        description: "Failed to save calendar reminder. Timer saved successfully though!",
        variant: "destructive"
      })
    }
  }

  // Remove timer reminder from internal calendar
  const removeFromCalendar = async (timer: Timer) => {
    try {
      const expirationDate = new Date(timer.expires_at)
      const dateKey = formatDateForStorage(expirationDate)

      console.log('🗑️ Removing calendar event for timer:', timer.id, 'on date:', dateKey)

      // Get existing calendar data for that date
      const existingRecord = await getSpecificData(dateKey, CATEGORIES.CALENDAR, SUBCATEGORIES.MONTHLY)

      if (existingRecord?.content) {
        let calendarData
        try {
          calendarData = JSON.parse(existingRecord.content)
        } catch (e) {
          console.log('📅 Calendar data is not JSON, treating as empty')
          return // Nothing to remove
        }

        if (calendarData.events) {
          // Remove the timer event
          const eventIdToRemove = `timer-${timer.id}`
          const updatedEvents = calendarData.events.filter((event: any) => event.id !== eventIdToRemove)

          if (updatedEvents.length !== calendarData.events.length) {
            // Event was found and removed
            const updatedCalendarData = { events: updatedEvents }

            if (updatedEvents.length === 0) {
              // No events left, remove the entire calendar record
              await db.daily_data.where('[date+category+subcategory]')
                .equals([dateKey, CATEGORIES.CALENDAR, SUBCATEGORIES.MONTHLY])
                .delete()
              console.log('🗑️ Removed empty calendar record for', dateKey)
            } else {
              // Update with remaining events
              await saveData(dateKey, CATEGORIES.CALENDAR, SUBCATEGORIES.MONTHLY, JSON.stringify(updatedCalendarData))
              console.log('🗑️ Updated calendar with remaining events for', dateKey)
            }
          }
        }
      }

      console.log('✅ Calendar event removal completed')
    } catch (error) {
      console.error('❌ Failed to remove calendar event:', error)
    }
  }

  const editTimer = (timer: Timer) => {
    setEditingTimer(timer)
    setTimerType(timer.type)
    setTimerName(timer.name)

    // Convert inserted_at back to date and time for editing
    const insertedDate = new Date(timer.inserted_at)
    setTimerInsertedDate(insertedDate.toISOString().split('T')[0])
    setTimerInsertedTime(insertedDate.toTimeString().slice(0, 5))

    // Calculate days between inserted and expires
    const expiresDate = new Date(timer.expires_at)
    const daysDiff = Math.ceil((expiresDate.getTime() - insertedDate.getTime()) / (1000 * 60 * 60 * 24))
    setTimerDays(daysDiff.toString())

    setIsTimerModalOpen(true)
  }

  const resetTimerForm = () => {
    setEditingTimer(null)
    setTimerName('')
    setTimerInsertedDate('')
    setTimerInsertedTime('')
    setTimerDays('')
    setTimerType('cgm')
  }

  const stopTimer = async (id: string) => {
    try {
      // Find the timer being deleted
      const timerToDelete = timers.find(t => t.id === id)
      if (!timerToDelete) {
        console.error('❌ Timer not found:', id)
        return
      }

      console.log('🗑️ Deleting timer from ALL database records:', id)

      // FIND AND DELETE FROM ALL DATE RECORDS!
      // Load all timer records to find which dates contain this timer
      const allTimerRecords = await db.daily_data
        .where('category')
        .equals(CATEGORIES.HEALTH)
        .and(record => record.subcategory === 'diabetes_timers')
        .toArray()

      // Update each record that contains this timer
      for (const record of allTimerRecords) {
        if (record.content && Array.isArray(record.content)) {
          const recordTimers = record.content as Timer[]
          const hasTimer = recordTimers.some(t => t.id === id)

          if (hasTimer) {
            console.log('🗑️ Found timer in record:', record.date, 'removing it')
            const updatedRecordTimers = recordTimers.filter(t => t.id !== id)

            if (updatedRecordTimers.length === 0) {
              // No timers left, delete the entire record
              await db.daily_data.delete(record.id!)
              console.log('🗑️ Deleted empty timer record for', record.date)
            } else {
              // Update record with remaining timers
              await db.daily_data.update(record.id!, {
                content: updatedRecordTimers,
                metadata: {
                  ...record.metadata,
                  updated_at: getCurrentTimestamp()
                }
              })
              console.log('🗑️ Updated timer record for', record.date)
            }
          }
        }
      }

      // ALSO DELETE THE CALENDAR EVENT!
      await removeFromCalendar(timerToDelete)

      // Update local state
      const updatedTimers = timers.filter(t => t.id !== id)
      setTimers(updatedTimers)

      toast({
        title: "⏹️ Timer Stopped",
        description: "Timer and calendar reminder have been permanently removed."
      })

      console.log('✅ Timer completely deleted from all records:', id)
    } catch (error) {
      console.error('❌ Failed to stop timer:', error)
      toast({
        title: "Error",
        description: "Failed to stop timer. Please try again.",
        variant: "destructive"
      })
    }
  }



  const commonTags = ['morning', 'afternoon', 'evening', 'before-meal', 'after-meal', 'bedtime', 'exercise', 'stress', 'sick', 'nope']
  const moodOptions = ['great', 'good', 'okay', 'tired', 'stressed', 'unwell']
  const insulinTypes = ['rapid-acting', 'short-acting', 'intermediate', 'long-acting', 'mixed', 'other']

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--deep-space, #f8f9fa)' }}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold flex-1 text-center" style={{ color: 'var(--primary-purple)' }}>
              Diabetes Tracker
            </h1>

            {/* Expired Timer Alert in Header */}
            {timers.some(timer => getTimeRemaining(timer).expired) && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 border border-red-300 rounded-lg animate-pulse">
                <span className="text-red-600 font-bold text-sm">
                  🚨 {timers.filter(timer => getTimeRemaining(timer).expired).length} Timer(s) Expired!
                </span>
              </div>
            )}
          </div>

          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="timers">Timers</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Blood Sugar & More</h2>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingEntry(null)
                      resetForm()
                    }}
                    className="flex items-center gap-2"
                    style={{
                      backgroundColor: 'var(--accent-orange)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-2xl max-h-[80vh] overflow-y-auto"
                  style={{
                    backgroundColor: 'var(--surface-1, #ffffff)',
                    border: '1px solid var(--border, #e2e8f0)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <DialogHeader>
                    <DialogTitle>
                      {editingEntry ? 'Edit Entry' : 'Add Diabetes Entry'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingEntry ? 'Update your diabetes tracking data.' : 'Record your blood glucose, insulin, carbs, and other diabetes data.'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Blood Glucose */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bloodGlucose">Blood Glucose (mg/dL)</Label>
                        <Input
                          id="bloodGlucose"
                          type="number"
                          placeholder="120"
                          value={formBloodGlucose}
                          onChange={(e) => setFormBloodGlucose(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ketones">Ketones (mmol/L)</Label>
                        <Input
                          id="ketones"
                          type="number"
                          step="0.1"
                          placeholder="0.5"
                          value={formKetones}
                          onChange={(e) => setFormKetones(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Insulin */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="insulinType">Insulin Type</Label>
                        <Select value={formInsulinType} onValueChange={setFormInsulinType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent
                            style={{
                              backgroundColor: 'var(--surface-1, #ffffff)',
                              border: '1px solid var(--border, #e2e8f0)',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                          >
                            {insulinTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="insulinAmount">Insulin Amount (units)</Label>
                        <Input
                          id="insulinAmount"
                          type="number"
                          step="0.5"
                          placeholder="10"
                          value={formInsulinAmount}
                          onChange={(e) => setFormInsulinAmount(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Carbs */}
                    <div>
                      <Label htmlFor="carbs">Carbohydrates (grams)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        placeholder="45"
                        value={formCarbs}
                        onChange={(e) => setFormCarbs(e.target.value)}
                      />
                    </div>

                    {/* Mood */}
                    <div>
                      <Label htmlFor="mood">Mood (Optional)</Label>
                      <Select value={formMood} onValueChange={setFormMood}>
                        <SelectTrigger>
                          <SelectValue placeholder="How are you feeling?" />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            backgroundColor: 'var(--surface-1, #ffffff)',
                            border: '1px solid var(--border, #e2e8f0)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          }}
                        >
                          {moodOptions.map(mood => (
                            <SelectItem key={mood} value={mood}>
                              {mood.charAt(0).toUpperCase() + mood.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {commonTags.map(tag => (
                          <Button
                            key={tag}
                            type="button"
                            variant={formTags.includes(tag) ? "default" : "outline"}
                            size="sm"
                            onClick={() => formTags.includes(tag) ? removeTag(tag) : addTag(tag)}
                            className={tag === 'nope' ? 'bg-red-100 text-red-700 border-red-300' : ''}
                          >
                            {tag === 'nope' ? '🍰 NOPE' : tag}
                          </Button>
                        ))}
                      </div>

                      {/* Custom tag input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom tag..."
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                        />
                        <Button type="button" onClick={addCustomTag} size="sm">Add</Button>
                      </div>

                      {/* Selected tags */}
                      {formTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {formTags.map(tag => (
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

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional notes..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        style={{
                          backgroundColor: 'var(--accent-orange)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {editingEntry ? 'Update' : 'Save'} Entry
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Entries List */}
            <div className="space-y-4">
              {entries.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p style={{ color: 'var(--text-muted)' }}>No entries for {currentDate}</p>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                      Add your first entry to start tracking!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                entries.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{entry.entry_time}</span>
                            {entry.tags.includes('nope') && (
                              <Badge className="bg-red-100 text-red-700">🍰 NOPE</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {entry.blood_glucose && (
                              <div className="flex items-center gap-1">
                                <Droplets className="h-4 w-4 text-red-500" />
                                <span>{entry.blood_glucose} mg/dL</span>
                              </div>
                            )}
                            {entry.ketones && (
                              <div className="flex items-center gap-1">
                                <Zap className="h-4 w-4 text-purple-500" />
                                <span>{entry.ketones} mmol/L</span>
                              </div>
                            )}
                            {entry.insulin_amount && (
                              <div className="flex items-center gap-1">
                                <span className="text-blue-500">💉</span>
                                <span>{entry.insulin_amount}u {entry.insulin_type}</span>
                              </div>
                            )}
                            {entry.carbs && (
                              <div className="flex items-center gap-1">
                                <Apple className="h-4 w-4 text-green-500" />
                                <span>{entry.carbs}g carbs</span>
                              </div>
                            )}
                          </div>

                          {entry.mood && (
                            <div className="mt-2 text-sm">
                              <span style={{ color: 'var(--text-muted)' }}>Mood: </span>
                              <span>{entry.mood}</span>
                            </div>
                          )}

                          {entry.notes && (
                            <div className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                              {entry.notes}
                            </div>
                          )}

                          {entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.tags.map(tag => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className={tag === 'nope' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Timers Tab */}
          <TabsContent value="timers" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">CGM/Pump/GLP-1 Timers</h2>

              {/* Add Timer Button */}
              <div className="mb-6 text-center">
                <Dialog open={isTimerModalOpen} onOpenChange={setIsTimerModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        resetTimerForm()
                        setIsTimerModalOpen(true)
                      }}
                      className="flex items-center gap-2"
                      style={{
                        backgroundColor: 'var(--accent-orange)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Clock className="h-4 w-4" />
                      Start New Timer
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    style={{
                      backgroundColor: 'var(--surface-1, #ffffff)',
                      border: '1px solid var(--border, #e2e8f0)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <DialogHeader>
                      <DialogTitle>
                        {editingTimer ? 'Edit Timer' : 'Start New Timer'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingTimer ? 'Restart your timer with updated settings.' : 'Set up a timer to track when to change your CGM, pump, or GLP-1.'}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="timerType">Type</Label>
                        <Select value={timerType} onValueChange={(value: 'cgm' | 'pump' | 'glp1') => setTimerType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            style={{
                              backgroundColor: 'var(--surface-1, #ffffff)',
                              border: '1px solid var(--border, #e2e8f0)',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                          >
                            <SelectItem value="cgm">CGM</SelectItem>
                            <SelectItem value="pump">Pump</SelectItem>
                            <SelectItem value="glp1">GLP-1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timerName">Name (Optional)</Label>
                        <Input
                          id="timerName"
                          placeholder="Leave blank for 'CGM Timer', 'PUMP Timer', etc."
                          value={timerName}
                          onChange={(e) => setTimerName(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Optional: Add a custom name like "Dexcom G7" or leave blank for auto-naming.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="timerInsertedDate">
                            {timerType === 'glp1' ? 'Date' : 'Date Inserted'}
                          </Label>
                          <Input
                            id="timerInsertedDate"
                            type="date"
                            value={timerInsertedDate}
                            onChange={(e) => setTimerInsertedDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="timerInsertedTime">Time Inserted</Label>
                          <Input
                            id="timerInsertedTime"
                            type="time"
                            value={timerInsertedTime}
                            onChange={(e) => setTimerInsertedTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="timerDays">Days Until Change</Label>
                        <Input
                          id="timerDays"
                          type="number"
                          placeholder="10 (CGM), 3 (pump), 7 (GLP-1)"
                          value={timerDays}
                          onChange={(e) => setTimerDays(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Customize based on your needs: some keep Omnis 2-3 days, Medtronic pumps 3-7 days, etc.
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsTimerModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={startTimer}
                          style={{
                            backgroundColor: 'var(--accent-orange)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {editingTimer ? 'Restart Timer' : 'Start Timer'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Active Timers */}
              <div className="space-y-4">
                {timers.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p style={{ color: 'var(--text-muted)' }}>No active timers</p>
                      <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                        Start a timer to track your CGM, pump, or GLP-1 schedule
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  timers.map((timer) => {
                    const remaining = getTimeRemaining(timer)
                    const isExpired = remaining.expired

                    return (
                      <Card key={timer.id} className={isExpired ? 'border-red-500 bg-red-50 shadow-lg animate-pulse' : 'border-gray-200'}>
                        <CardContent className="p-4">
                          {isExpired && (
                            <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                              <div className="flex items-center gap-2 text-red-700 font-bold text-lg">
                                🚨 REMINDER: Time to change your {timer.name}!
                              </div>
                              <div className="text-red-600 text-sm mt-1">
                                Your {timer.type.toUpperCase()} expired. Please replace it and start a new timer.
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className={`h-4 w-4 ${isExpired ? 'text-red-500' : ''}`} />
                                <span className="font-medium">{timer.name}</span>
                                <Badge variant={isExpired ? "destructive" : "outline"}>
                                  {timer.type.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                {timer.type === 'glp1' ? 'Date' : 'Inserted'}: {new Date(timer.inserted_at).toLocaleString()}
                              </div>
                              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Change by: {new Date(timer.expires_at).toLocaleDateString()} at {new Date(timer.expires_at).toLocaleTimeString()}
                              </div>
                              <div className={`text-lg font-bold mt-1 ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                                {remaining.text}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {isExpired && (
                                <Button
                                  onClick={() => {
                                    // Quick restart with same settings
                                    editTimer(timer)
                                    toast({
                                      title: "🔄 Ready to restart",
                                      description: "Timer form is filled. Click 'Restart Timer' when you've changed your device."
                                    })
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  size="sm"
                                >
                                  ✅ Changed It!
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editTimer(timer)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => stopTimer(timer.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <DiabetesHistory />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <DiabetesAnalytics entries={entries} currentDate={currentDate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Analytics Component
interface DiabetesAnalyticsProps {
  entries: DiabetesEntry[]
  currentDate: string
}

function DiabetesAnalytics({ entries, currentDate }: DiabetesAnalyticsProps) {
  // NOPE entries don't exist - filter them out completely
  const analyticsEntries = entries.filter(e => !e.tags.includes('nope'))

  // Calculate stats (only from non-NOPE entries)
  const totalEntries = analyticsEntries.length

  // Blood glucose stats
  const bgEntries = analyticsEntries.filter(e => e.blood_glucose)
  const avgBG = bgEntries.length > 0 ? Math.round(bgEntries.reduce((sum, e) => sum + (e.blood_glucose || 0), 0) / bgEntries.length) : 0
  const highBG = bgEntries.filter(e => (e.blood_glucose || 0) > 180).length
  const lowBG = bgEntries.filter(e => (e.blood_glucose || 0) < 70).length
  const inRangeBG = bgEntries.length - highBG - lowBG

  // Insulin stats
  const insulinEntries = analyticsEntries.filter(e => e.insulin_amount)
  const totalInsulin = insulinEntries.reduce((sum, e) => sum + (e.insulin_amount || 0), 0)

  // Carb stats
  const carbEntries = analyticsEntries.filter(e => e.carbs)
  const totalCarbs = carbEntries.reduce((sum, e) => sum + (e.carbs || 0), 0)

  // Ketone stats
  const ketoneEntries = analyticsEntries.filter(e => e.ketones)
  const avgKetones = ketoneEntries.length > 0 ? (ketoneEntries.reduce((sum, e) => sum + (e.ketones || 0), 0) / ketoneEntries.length).toFixed(1) : '0.0'

  // Tag frequency
  const tagCounts: { [key: string]: number } = {}
  analyticsEntries.forEach(entry => {
    entry.tags.forEach(tag => {
      if (tag !== 'nope') {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }
    })
  })

  const topTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-2)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                {totalEntries}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Entries</div>
            </div>

            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-2)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--accent-orange)' }}>
                {bgEntries.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>BG Readings</div>
            </div>

            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-2)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                {avgBG}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg BG (mg/dL)</div>
            </div>

            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-2)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--accent-orange)' }}>
                {insulinEntries.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Insulin Doses</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blood Glucose Analysis */}
      {bgEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Blood Glucose Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-green-50">
                <div className="text-xl font-bold text-green-600">{inRangeBG}</div>
                <div className="text-sm text-green-700">In Range (70-180)</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50">
                <div className="text-xl font-bold text-red-600">{highBG}</div>
                <div className="text-sm text-red-700">High (&gt;180)</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-50">
                <div className="text-xl font-bold text-yellow-600">{lowBG}</div>
                <div className="text-sm text-yellow-700">Low (&lt;70)</div>
              </div>
            </div>

            {bgEntries.length > 0 && (
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Time in range: {Math.round((inRangeBG / bgEntries.length) * 100)}%
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Insulin & Carbs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Insulin Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                {totalInsulin.toFixed(1)}u
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Total insulin from {insulinEntries.length} doses
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carbohydrates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--accent-orange)' }}>
                {totalCarbs}g
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Total carbs from {carbEntries.length} entries
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ketones & Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ketones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                {avgKetones}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Average mmol/L from {ketoneEntries.length} readings
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {topTags.length > 0 ? (
              <div className="space-y-2">
                {topTags.map(([tag, count]) => (
                  <div key={tag} className="flex justify-between items-center">
                    <Badge variant="outline">{tag}</Badge>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {count} times
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center" style={{ color: 'var(--text-muted)' }}>
                No tags used yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// History Component
function DiabetesHistory() {
  const [historyEntries, setHistoryEntries] = useState<DiabetesEntry[]>([])
  const [historyTimers, setHistoryTimers] = useState<Timer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState(7) // Days to look back

  useEffect(() => {
    loadHistoryData()
  }, [dateRange])

  const loadHistoryData = async () => {
    setIsLoading(true)
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - dateRange)

      // Load entries from date range
      const allEntries: DiabetesEntry[] = []
      const allTimers: Timer[] = []

      // Generate array of dates to check
      const dates = []
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(formatDateForStorage(new Date(d)))
      }

      // Load entries for each date
      for (const dateKey of dates) {
        // Load diabetes entries
        const entriesRecord = await db.daily_data
          .where('[date+category+subcategory]')
          .equals([dateKey, CATEGORIES.HEALTH, 'diabetes'])
          .first()

        if (entriesRecord && entriesRecord.content) {
          const dateEntries = Array.isArray(entriesRecord.content) ? entriesRecord.content : [entriesRecord.content]
          allEntries.push(...dateEntries)
        }
      }

      // Load all timers (they persist across dates)
      const timerRecords = await db.daily_data
        .where('category')
        .equals(CATEGORIES.HEALTH)
        .and(record => record.subcategory === 'diabetes_timers')
        .toArray()

      timerRecords.forEach(record => {
        if (record.content) {
          const recordTimers = Array.isArray(record.content) ? record.content : [record.content]
          allTimers.push(...recordTimers)
        }
      })

      // Remove timer duplicates
      const uniqueTimers = allTimers.filter((timer, index, self) =>
        index === self.findIndex(t => t.id === timer.id)
      )

      // Sort entries by timestamp (newest first)
      allEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setHistoryEntries(allEntries)
      setHistoryTimers(uniqueTimers)

    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    console.log('🕐 Formatting timestamp:', timestamp)
    const date = new Date(timestamp)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('❌ Invalid timestamp:', timestamp)
      return `Invalid Date`
    }

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    console.log('🕐 Date diff:', diffDays, 'days')

    if (diffDays === 0) return `Today at ${date.toLocaleTimeString()}`
    if (diffDays === 1) return `Yesterday at ${date.toLocaleTimeString()}`
    if (diffDays < 0) return `Future: ${date.toLocaleString()}`
    return `${diffDays} days ago at ${date.toLocaleTimeString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Diabetes History</h2>
        <div className="flex gap-2">
          <Button
            variant={dateRange === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(7)}
          >
            7 Days
          </Button>
          <Button
            variant={dateRange === 14 ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(14)}
          >
            2 Weeks
          </Button>
          <Button
            variant={dateRange === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(30)}
          >
            1 Month
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading history...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Timer History */}
          {historyTimers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Device Timers ({historyTimers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {historyTimers.map(timer => {
                  const remaining = getTimeRemaining(timer)
                  return (
                    <div key={timer.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{timer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {timer.type === 'glp1' ? 'Date' : 'Inserted'}: {new Date(timer.inserted_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={remaining.expired ? "destructive" : "outline"}>
                          {timer.type.toUpperCase()}
                        </Badge>
                        <div className="text-sm mt-1">{remaining.text}</div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Entry History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Tracking History ({historyEntries.length} entries)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyEntries.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No entries found in the last {dateRange} days
                </p>
              ) : (
                <div className="space-y-3">
                  {historyEntries.map(entry => (
                    <div key={entry.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-muted-foreground">
                          {entry.timestamp ? formatTimestamp(entry.timestamp) :
                           entry.created_at ? formatTimestamp(entry.created_at) :
                           entry.id ? formatTimestamp(entry.id.split('-')[1] || 'Unknown') : 'Unknown time'}
                        </div>
                        <div className="flex gap-1">
                          {entry.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {entry.blood_glucose && (
                          <div>
                            <span className="font-medium">Blood Sugar:</span>
                            <div>{entry.blood_glucose} mg/dL</div>
                          </div>
                        )}
                        {entry.ketones && (
                          <div>
                            <span className="font-medium">Ketones:</span>
                            <div>{entry.ketones}</div>
                          </div>
                        )}
                        {entry.insulin_type && (
                          <div>
                            <span className="font-medium">Insulin:</span>
                            <div>{entry.insulin_amount} units {entry.insulin_type}</div>
                          </div>
                        )}
                        {entry.carbs && (
                          <div>
                            <span className="font-medium">Carbs:</span>
                            <div>{entry.carbs}g</div>
                          </div>
                        )}
                      </div>

                      {entry.mood && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Mood:</span> {entry.mood}
                        </div>
                      )}

                      {entry.notes && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Notes:</span> {entry.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
