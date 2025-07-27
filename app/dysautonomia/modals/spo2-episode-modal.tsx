/**
 * SPO2 EPISODE MODAL 💨
 * Dedicated modal for tracking oxygen desaturation episodes
 * Because oxygen is NOT optional!
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Activity, AlertTriangle } from 'lucide-react'

import { DysautonomiaEntry, EpisodeModalProps } from '../dysautonomia-types'
import { DYSAUTONOMIA_SYMPTOMS, DYSAUTONOMIA_TRIGGERS, DYSAUTONOMIA_INTERVENTIONS, POSITION_CHANGES, DURATION_UNITS, getSeverityLabel, getSeverityColor } from '../dysautonomia-constants'
import { TagInput } from '@/components/tag-input'

export function SpO2EpisodeModal({ isOpen, onClose, onSave, editingEntry }: EpisodeModalProps) {
  // SpO2-specific form state
  const [restingSpO2, setRestingSpO2] = useState('')
  const [standingSpO2, setStandingSpO2] = useState('')
  const [lowestSpO2, setLowestSpO2] = useState('')
  const [spO2Duration, setSpO2Duration] = useState('')
  const [triggerPosition, setTriggerPosition] = useState('')
  
  // General episode state
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [severity, setSeverity] = useState([5])
  const [triggers, setTriggers] = useState<string[]>([])
  const [positionChange, setPositionChange] = useState('')
  const [durationValue, setDurationValue] = useState('')
  const [durationUnit, setDurationUnit] = useState('minutes')
  const [interventions, setInterventions] = useState<string[]>([])
  const [interventionEffectiveness, setInterventionEffectiveness] = useState([3])
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])

  // Load editing data
  useEffect(() => {
    if (editingEntry && editingEntry.episodeType === 'spo2') {
      setRestingSpO2(editingEntry.restingSpO2?.toString() || '')
      setStandingSpO2(editingEntry.standingSpO2?.toString() || '')
      setLowestSpO2(editingEntry.lowestSpO2?.toString() || '')
      setSpO2Duration(editingEntry.spO2Duration || '')
      setSymptoms(editingEntry.symptoms || [])
      setSeverity([editingEntry.severity || 5])
      setTriggers(editingEntry.triggers || [])
      setPositionChange(editingEntry.positionChange || '')
      
      // Parse duration
      if (editingEntry.duration) {
        const parts = editingEntry.duration.split(' ')
        if (parts.length >= 2) {
          setDurationValue(parts[0])
          setDurationUnit(parts[1])
        }
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
    setRestingSpO2('')
    setStandingSpO2('')
    setLowestSpO2('')
    setSpO2Duration('')
    setTriggerPosition('')
    setSymptoms([])
    setSeverity([5])
    setTriggers([])
    setPositionChange('')
    setDurationValue('')
    setDurationUnit('minutes')
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
    const entryData: Omit<DysautonomiaEntry, 'id' | 'timestamp' | 'date'> = {
      episodeType: 'spo2',
      restingSpO2: restingSpO2 ? parseInt(restingSpO2) : undefined,
      standingSpO2: standingSpO2 ? parseInt(standingSpO2) : undefined,
      lowestSpO2: lowestSpO2 ? parseInt(lowestSpO2) : undefined,
      spO2Duration: spO2Duration || undefined,
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

  // Calculate SpO2 drops and warnings
  const spO2Drop = restingSpO2 && standingSpO2 ? parseInt(restingSpO2) - parseInt(standingSpO2) : null
  const lowestValue = lowestSpO2 ? parseInt(lowestSpO2) : null
  const isCritical = lowestValue && lowestValue < 90
  const isSevere = lowestValue && lowestValue < 85

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-500" />
            SpO2 Desaturation Episode 💨
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* SpO2 Measurements - The main focus! */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-lg font-semibold">SpO2 Measurements</Label>
              <Badge variant="outline">Oxygen Saturation</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resting-spo2">Resting SpO2 (%)</Label>
                <Input
                  id="resting-spo2"
                  type="number"
                  placeholder="e.g., 98"
                  min="70"
                  max="100"
                  value={restingSpO2}
                  onChange={(e) => setRestingSpO2(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="standing-spo2">Standing SpO2 (%)</Label>
                <Input
                  id="standing-spo2"
                  type="number"
                  placeholder="e.g., 95"
                  min="70"
                  max="100"
                  value={standingSpO2}
                  onChange={(e) => setStandingSpO2(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lowest-spo2">Lowest SpO2 (%) 🚨</Label>
                <Input
                  id="lowest-spo2"
                  type="number"
                  placeholder="e.g., 85"
                  min="70"
                  max="100"
                  value={lowestSpO2}
                  onChange={(e) => setLowestSpO2(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="spo2-duration">Desaturation Duration</Label>
                <Input
                  id="spo2-duration"
                  placeholder="e.g., 2 minutes"
                  value={spO2Duration}
                  onChange={(e) => setSpO2Duration(e.target.value)}
                />
              </div>
            </div>
            
            {/* SpO2 Analysis */}
            <div className="space-y-2 text-sm">
              {spO2Drop !== null && (
                <div className={`flex items-center gap-2 ${spO2Drop > 4 ? 'text-red-600' : 'text-muted-foreground'}`}>
                  SpO2 Drop: {spO2Drop}% 
                  {spO2Drop > 4 && <Badge variant="destructive">Significant</Badge>}
                </div>
              )}
              {isCritical && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  Critical SpO2: {lowestValue}% (Normal: ≥95%)
                </div>
              )}
              {isSevere && (
                <div className="flex items-center gap-2 text-red-800 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  SEVERE SpO2: {lowestValue}% - Seek immediate medical attention!
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Symptoms - Focus on respiratory/SpO2 related */}
          <div className="space-y-3">
            <Label>Symptoms During Episode</Label>
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingEntry ? 'Update Episode' : 'Save SpO2 Episode'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
