"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Droplets, Heart, Activity } from 'lucide-react'
import { TagInput } from "@/components/tag-input"
import { ReproductiveHealthEntry, FLOW_LEVELS, MOOD_OPTIONS, SYMPTOM_OPTIONS } from './reproductive-health-tracker'

interface MenstrualFormProps {
  formData: Partial<ReproductiveHealthEntry>
  updateFormData: (field: keyof ReproductiveHealthEntry, value: unknown) => void
  onSave: () => void
  isLoading: boolean
}

export function MenstrualForm({ formData, updateFormData, onSave, isLoading }: MenstrualFormProps) {
  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item)
    } else {
      return [...array, item]
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Flow Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-red-500" />
            🩸 Flow Level
          </CardTitle>
          <CardDescription>
            Track your menstrual flow intensity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {FLOW_LEVELS.map((level) => (
              <Button
                key={level.value}
                variant={formData.flow === level.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateFormData('flow', level.value)}
                className="flex items-center gap-2"
              >
                <span>{level.emoji}</span>
                {level.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pain Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            💢 Pain Level
          </CardTitle>
          <CardDescription>
            Rate your menstrual pain from 0 (none) to 10 (severe)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={[formData.pain || 0]}
              onValueChange={(value) => updateFormData('pain', value[0])}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>No pain</span>
              <span className="font-medium text-lg">Pain Level: {formData.pain || 0}/10</span>
              <span>Severe pain</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mood Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            😊 Mood & Emotions
          </CardTitle>
          <CardDescription>
            Select all moods that apply to you today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((mood) => (
              <Badge
                key={mood}
                variant={formData.mood?.includes(mood) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => updateFormData('mood', toggleArrayItem(formData.mood || [], mood))}
              >
                {mood}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            🤒 Symptoms
          </CardTitle>
          <CardDescription>
            Track any symptoms you&apos;re experiencing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((symptom) => (
              <Badge
                key={symptom}
                variant={formData.symptoms?.includes(symptom) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => updateFormData('symptoms', toggleArrayItem(formData.symptoms || [], symptom))}
              >
                {symptom}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Libido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            🔥 Libido Level
          </CardTitle>
          <CardDescription>
            Libido tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Slider
              value={[formData.libido || 0]}
              onValueChange={(value) => updateFormData('libido', value[0])}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>No libido</span>
              <span className="font-medium text-lg">Libido Level: {formData.libido || 0}/10</span>
              <span>High libido</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Notes & Observations
          </CardTitle>
          <CardDescription>
            Add any additional notes about your menstrual cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => updateFormData('notes', e.target.value)}
            placeholder="How are you feeling today? Any patterns you've noticed? The cycle goblins want to know! 🧚‍♀️"
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏷️ Custom Tags
          </CardTitle>
          <CardDescription>
            Add custom tags to categorize this entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagInput
            value={formData.tags || []}
            onChange={(tags) => updateFormData('tags', tags)}
            placeholder="Add tags like 'heavy-day', 'pms', 'cramps'..."
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={onSave}
            disabled={isLoading}
            className="w-full text-lg py-6"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                💾 Save Menstrual Entry
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}