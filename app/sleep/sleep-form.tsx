"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Moon } from "lucide-react"
import { format } from "date-fns"

interface SleepEntry {
  id: string
  date: string
  hoursSlept: number
  quality: "Great" | "Okay" | "Restless" | "Terrible"
  wokeUpMultipleTimes: boolean
  bedTime?: string
  wakeTime?: string
  notes: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

const QUALITY_OPTIONS = [
  { value: "Great", emoji: "😴", description: "Slept like a dream goblin!" },
  { value: "Okay", emoji: "😌", description: "Decent rest, could be better" },
  { value: "Restless", emoji: "😕", description: "Tossed and turned like a restless sprite" },
  { value: "Terrible", emoji: "😫", description: "The sleep demons were victorious" }
] as const

interface SleepFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entry: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  selectedDate: string
  editingEntry?: SleepEntry | null
  isLoading?: boolean
}

export function SleepForm({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedDate, 
  editingEntry = null,
  isLoading = false 
}: SleepFormProps) {
  // Form state
  const [hoursSlept, setHoursSlept] = useState([7])
  const [quality, setQuality] = useState<"Great" | "Okay" | "Restless" | "Terrible">("Okay")
  const [wokeUpMultipleTimes, setWokeUpMultipleTimes] = useState(false)
  const [bedTime, setBedTime] = useState("")
  const [wakeTime, setWakeTime] = useState("")
  const [notes, setNotes] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  // Reset form when modal closes or editing entry changes
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    } else if (editingEntry) {
      // Populate form with editing entry data
      setHoursSlept([editingEntry.hoursSlept])
      setQuality(editingEntry.quality)
      setWokeUpMultipleTimes(editingEntry.wokeUpMultipleTimes)
      setBedTime(editingEntry.bedTime || "")
      setWakeTime(editingEntry.wakeTime || "")
      setNotes(editingEntry.notes)
      setTags(editingEntry.tags || [])
    }
  }, [isOpen, editingEntry])

  const resetForm = () => {
    setHoursSlept([7])
    setQuality("Okay")
    setWokeUpMultipleTimes(false)
    setBedTime("")
    setWakeTime("")
    setNotes("")
    setTags([])
    setTagInput("")
  }

  const handleSubmit = () => {
    onSave({
      date: selectedDate,
      hoursSlept: hoursSlept[0],
      quality,
      wokeUpMultipleTimes,
      bedTime: bedTime || undefined,
      wakeTime: wakeTime || undefined,
      notes,
      tags
    })
  }

  const addTag = () => {
    if (tagInput.trim() && tags && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    if (tags) {
      setTags(tags.filter(tag => tag !== tagToRemove))
    }
  }

  const getQualityOption = (qualityValue: string) => {
    return QUALITY_OPTIONS.find(opt => opt.value === qualityValue) || QUALITY_OPTIONS[1]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Log Your Sleep
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Hours Slept Slider */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Hours Slept: {hoursSlept[0]} hours
            </Label>
            <Slider
              value={hoursSlept}
              onValueChange={setHoursSlept}
              max={12}
              min={0}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0h</span>
              <span>6h</span>
              <span>12h</span>
            </div>
          </div>

          {/* Sleep Quality */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sleep Quality</Label>
            <div className="grid grid-cols-2 gap-3">
              {QUALITY_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={quality === option.value ? "default" : "outline"}
                  onClick={() => setQuality(option.value)}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="text-center">
                    <div className="font-medium">{option.value}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Sleep Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedTime">Bedtime (optional)</Label>
              <Input
                id="bedTime"
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wakeTime">Wake Time (optional)</Label>
              <Input
                id="wakeTime"
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
            </div>
          </div>

          {/* Woke Up Multiple Times */}
          <div className="flex items-center justify-between">
            <Label htmlFor="wokeUp" className="text-base">
              Woke up multiple times during the night?
            </Label>
            <Switch
              id="wokeUp"
              checked={wokeUpMultipleTimes}
              onCheckedChange={setWokeUpMultipleTimes}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How did you sleep? Any dreams, disturbances, or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tags (optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1"
              />
              <Button onClick={addTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-xs hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
              <Moon className="h-4 w-4 mr-2" />
              {editingEntry ? 'Update Sleep Entry' : 'Save Sleep Entry'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
