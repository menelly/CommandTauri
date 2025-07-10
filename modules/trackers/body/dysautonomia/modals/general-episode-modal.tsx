/**
 * GENERAL DYSAUTONOMIA EPISODE MODAL
 * Comprehensive modal for mixed symptoms and complex episodes
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RotateCcw, Plus } from 'lucide-react'

// Local imports
import { DysautonomiaEntry, EpisodeModalProps } from '../dysautonomia-types'
import { DYSAUTONOMIA_SYMPTOMS, DYSAUTONOMIA_TRIGGERS, DYSAUTONOMIA_INTERVENTIONS, POSITION_CHANGES, DURATION_UNITS, getSeverityLabel, getSeverityColor } from '../dysautonomia-constants'
import { TagInput } from '@/components/tag-input'

export function GeneralEpisodeModal({ isOpen, onClose, onSave, editingEntry }: EpisodeModalProps) {
  // Form state
  const [restingHeartRate, setRestingHeartRate] = useState('')
  const [standingHeartRate, setStandingHeartRate] = useState('')
  const [bloodPressureSitting, setBloodPressureSitting] = useState('')
  const [bloodPressureStanding, setBloodPressureStanding] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [severity, setSeverity] = useState([5])
  const [triggers, setTriggers] = useState<string[]>([])
  const [positionChange, setPositionChange] = useState('')
  const [durationValue, setDurationValue] = useState('')
  const [durationUnit, setDurationUnit] = useState('hours')
  const [interventions, setInterventions] = useState<string[]>([])
  const [interventionEffectiveness, setInterventionEffectiveness] = useState([3])
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])

  // Load editing data
  useEffect(() => {
    if (editingEntry && editingEntry.episodeType === 'general') {
      setRestingHeartRate(editingEntry.restingHeartRate?.toString() || '')
      setStandingHeartRate(editingEntry.standingHeartRate?.toString() || '')
      setBloodPressureSitting(editingEntry.bloodPressureSitting || '')
      setBloodPressureStanding(editingEntry.bloodPressureStanding || '')
      setSymptoms(editingEntry.symptoms || [])
      setSeverity([editingEntry.severity || 5])
      setTriggers(editingEntry.triggers || [])
      setPositionChange(editingEntry.positionChange || '')

      // Parse existing duration like "2 hours" or "30 minutes"
      if (editingEntry.duration) {
        const match = editingEntry.duration.match(/^(\d+(?:\.\d+)?)\s*(.+)$/)
        if (match) {
          setDurationValue(match[1])
          setDurationUnit(match[2])
        } else {
          setDurationValue('')
          setDurationUnit('hours')
        }
      } else {
        setDurationValue('')
        setDurationUnit('hours')
      }

      setInterventions(editingEntry.interventions || [])
      setInterventionEffectiveness([editingEntry.interventionEffectiveness || 3])
      setNotes(editingEntry.notes || '')
      setTags(editingEntry.tags || [])
    } else {
      resetForm()
    }
  }, [editingEntry, isOpen])

  const resetForm = () => {
    setRestingHeartRate('')
    setStandingHeartRate('')
    setBloodPressureSitting('')
    setBloodPressureStanding('')
    setSymptoms([])
    setSeverity([5])
    setTriggers([])
    setPositionChange('')
    setDurationValue('')
    setDurationUnit('hours')
    setInterventions([])
    setInterventionEffectiveness([3])
    setNotes('')
    setTags([])
  }

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
  }

  const handleTriggerToggle = (trigger: string) => {
    setTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    )
  }

  const handleInterventionToggle = (intervention: string) => {
    setInterventions(prev => 
      prev.includes(intervention) 
        ? prev.filter(i => i !== intervention)
        : [...prev, intervention]
    )
  }

  const handleSave = () => {
    const restingHR = restingHeartRate ? parseInt(restingHeartRate) : undefined
    const standingHR = standingHeartRate ? parseInt(standingHeartRate) : undefined
    const heartRateIncrease = restingHR && standingHR ? standingHR - restingHR : undefined

    const entryData: Omit<DysautonomiaEntry, 'id' | 'timestamp' | 'date'> = {
      episodeType: 'general',
      restingHeartRate: restingHR,
      standingHeartRate: standingHR,
      heartRateIncrease,
      bloodPressureSitting: bloodPressureSitting || undefined,
      bloodPressureStanding: bloodPressureStanding || undefined,
      symptoms,
      severity: severity[0],
      triggers,
      positionChange: positionChange || undefined,
      duration: durationValue && durationUnit ? `${durationValue} ${durationUnit}` : undefined,
      interventions,
      interventionEffectiveness: interventions.length > 0 ? interventionEffectiveness[0] : undefined,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined
    }

    onSave(entryData)
    resetForm()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-purple-500" />
            🔄 General Dysautonomia Episode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vitals Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Vitals (Optional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resting-hr">Resting HR (bpm)</Label>
                <Input
                  id="resting-hr"
                  type="number"
                  placeholder="e.g., 70"
                  value={restingHeartRate}
                  onChange={(e) => setRestingHeartRate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="standing-hr">Standing HR (bpm)</Label>
                <Input
                  id="standing-hr"
                  type="number"
                  placeholder="e.g., 110"
                  value={standingHeartRate}
                  onChange={(e) => setStandingHeartRate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bp-sitting">Sitting BP</Label>
                <Input
                  id="bp-sitting"
                  placeholder="e.g., 120/80"
                  value={bloodPressureSitting}
                  onChange={(e) => setBloodPressureSitting(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bp-standing">Standing BP</Label>
                <Input
                  id="bp-standing"
                  placeholder="e.g., 90/60"
                  value={bloodPressureStanding}
                  onChange={(e) => setBloodPressureStanding(e.target.value)}
                />
              </div>
            </div>
            {restingHeartRate && standingHeartRate && (
              <div className="text-sm text-muted-foreground">
                Heart Rate Increase: +{parseInt(standingHeartRate) - parseInt(restingHeartRate)} bpm
              </div>
            )}
          </div>

          {/* Symptoms */}
          <div className="space-y-3">
            <Label>Dysautonomia Symptoms</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {DYSAUTONOMIA_SYMPTOMS.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={`symptom-${symptom}`}
                    checked={symptoms.includes(symptom)}
                    onCheckedChange={() => handleSymptomToggle(symptom)}
                  />
                  <Label htmlFor={`symptom-${symptom}`} className="text-sm">
                    {symptom}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div className="space-y-3">
            <Label>Severity: {severity[0]} - <span className={getSeverityColor(severity[0])}>{getSeverityLabel(severity[0])}</span></Label>
            <Slider
              value={severity}
              onValueChange={setSeverity}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Position Change */}
          <div className="space-y-3">
            <Label>Position Change (Optional)</Label>
            <Select value={positionChange} onValueChange={setPositionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select position change" />
              </SelectTrigger>
              <SelectContent>
                {POSITION_CHANGES.map((change) => (
                  <SelectItem key={change.value} value={change.value}>
                    {change.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <Label htmlFor="duration">Duration (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="duration"
                type="number"
                min="0"
                step="0.5"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                placeholder="0.5"
                className="flex-1"
              />
              <Select value={durationUnit} onValueChange={setDurationUnit}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 How long did the dysautonomia episode last? (0.5 hours = 30 minutes)
            </p>
          </div>

          {/* Triggers */}
          <div className="space-y-3">
            <Label>Triggers (Optional)</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {DYSAUTONOMIA_TRIGGERS.map((trigger) => (
                <div key={trigger} className="flex items-center space-x-2">
                  <Checkbox
                    id={`trigger-${trigger}`}
                    checked={triggers.includes(trigger)}
                    onCheckedChange={() => handleTriggerToggle(trigger)}
                  />
                  <Label htmlFor={`trigger-${trigger}`} className="text-sm">
                    {trigger}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Interventions */}
          <div className="space-y-3">
            <Label>What Helped? (Optional)</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {DYSAUTONOMIA_INTERVENTIONS.map((intervention) => (
                <div key={intervention} className="flex items-center space-x-2">
                  <Checkbox
                    id={`intervention-${intervention}`}
                    checked={interventions.includes(intervention)}
                    onCheckedChange={() => handleInterventionToggle(intervention)}
                  />
                  <Label htmlFor={`intervention-${intervention}`} className="text-sm">
                    {intervention}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Intervention Effectiveness */}
          {interventions.length > 0 && (
            <div className="space-y-3">
              <Label>How well did interventions help? (1-5)</Label>
              <Slider
                value={interventionEffectiveness}
                onValueChange={setInterventionEffectiveness}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">
                {interventionEffectiveness[0]}/5 - {
                  interventionEffectiveness[0] === 1 ? 'Not helpful' :
                  interventionEffectiveness[0] === 2 ? 'Slightly helpful' :
                  interventionEffectiveness[0] === 3 ? 'Moderately helpful' :
                  interventionEffectiveness[0] === 4 ? 'Very helpful' :
                  'Extremely helpful'
                }
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this dysautonomia episode..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags (Optional)</Label>
            <TagInput
              tags={tags}
              setTags={setTags}
              placeholder="Add tags like 'complex', 'flare', 'mixed-symptoms', 'nope'..."
              categoryFilter={['health', 'tracker']}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1"
              disabled={symptoms.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              {editingEntry ? 'Update Episode' : 'Save General Episode'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
