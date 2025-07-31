'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Heart, Sparkles, X, Edit3, Save, RotateCcw } from 'lucide-react'
import { useDailyData } from '@/lib/database/hooks/use-daily-data'
import { CATEGORIES, SUBCATEGORIES } from '@/lib/database/dexie-db'

interface DailyPrompt {
  id: string
  text: string
  category: 'self-care' | 'goals' | 'gratitude' | 'reflection' | 'energy'
  icon: string
}

interface DailyPromptData {
  promptId: string
  response: string
  isDismissed: boolean
  respondedAt?: string
}

const DAILY_PROMPTS: DailyPrompt[] = [
  {
    id: 'self-care-small',
    text: 'What one small thing can you do for yourself today that\'ll move you closer to your goals or make you more content in life?',
    category: 'self-care',
    icon: '💜'
  },
  {
    id: 'energy-check',
    text: 'How are your energy levels today? What would help you honor where you\'re at right now?',
    category: 'energy',
    icon: '⚡'
  },
  {
    id: 'gratitude-chaos',
    text: 'What\'s one thing (big or tiny) that made you smile or feel grateful today?',
    category: 'gratitude',
    icon: '✨'
  },
  {
    id: 'goals-gentle',
    text: 'If you could only accomplish ONE thing today, what would make you feel most accomplished?',
    category: 'goals',
    icon: '🎯'
  },
  {
    id: 'reflection-kind',
    text: 'What would you tell a friend who was having the kind of day you\'re having?',
    category: 'reflection',
    icon: '🤗'
  },
  {
    id: 'self-care-boundaries',
    text: 'What\'s one boundary you can set today to protect your energy and well-being?',
    category: 'self-care',
    icon: '🛡️'
  },
  {
    id: 'chaos-celebration',
    text: 'What\'s one way your beautiful chaos or unique perspective helped you today?',
    category: 'reflection',
    icon: '🌈'
  },
  {
    id: 'gentle-progress',
    text: 'What\'s the smallest step you could take today that your future self would thank you for?',
    category: 'goals',
    icon: '🌱'
  }
]

export default function DailyPrompts() {
  const { getSpecificData, saveData } = useDailyData()
  const [currentPrompt, setCurrentPrompt] = useState<DailyPrompt | null>(null)
  const [response, setResponse] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [savedResponse, setSavedResponse] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Get today's prompt and load saved data
  useEffect(() => {
    const loadPromptData = async () => {
      if (typeof window === 'undefined') return

      try {
        setIsLoading(true)

        // Get today's prompt (deterministic based on date)
        const today = new Date()
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
        const promptIndex = dayOfYear % DAILY_PROMPTS.length
        const todaysPrompt = DAILY_PROMPTS[promptIndex]
        setCurrentPrompt(todaysPrompt)

        // Load saved data from Dexie
        const dateKey = today.toISOString().split('T')[0]
        const savedData = await getSpecificData(dateKey, CATEGORIES.JOURNAL, SUBCATEGORIES.DAILY_PROMPTS)

        if (savedData?.content) {
          const promptData = savedData.content as DailyPromptData
          // Only load if it's for the same prompt (in case prompt rotated)
          if (promptData.promptId === todaysPrompt.id) {
            setResponse(promptData.response || '')
            setSavedResponse(promptData.response || '')
            setIsDismissed(promptData.isDismissed || false)
          }
        }
      } catch (error) {
        console.warn('Failed to load daily prompt data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPromptData()
  }, [])

  const handleSaveResponse = async () => {
    if (!currentPrompt) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const promptData: DailyPromptData = {
        promptId: currentPrompt.id,
        response,
        isDismissed: false,
        respondedAt: new Date().toISOString()
      }

      await saveData(today, CATEGORIES.JOURNAL, SUBCATEGORIES.DAILY_PROMPTS, promptData)
      setSavedResponse(response)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save daily prompt response:', error)
    }
  }

  const handleDismiss = async () => {
    if (!currentPrompt) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const promptData: DailyPromptData = {
        promptId: currentPrompt.id,
        response: savedResponse,
        isDismissed: true
      }

      await saveData(today, CATEGORIES.JOURNAL, SUBCATEGORIES.DAILY_PROMPTS, promptData)
      setIsDismissed(true)
    } catch (error) {
      console.error('Failed to dismiss daily prompt:', error)
    }
  }

  const handleUndismiss = async () => {
    if (!currentPrompt) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const promptData: DailyPromptData = {
        promptId: currentPrompt.id,
        response: savedResponse,
        isDismissed: false
      }

      await saveData(today, CATEGORIES.JOURNAL, SUBCATEGORIES.DAILY_PROMPTS, promptData)
      setIsDismissed(false)
    } catch (error) {
      console.error('Failed to undismiss daily prompt:', error)
    }
  }

  if (isLoading || !currentPrompt) return null

  if (isDismissed) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">Daily prompt dismissed</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleUndismiss}
            className="text-purple-600 hover:text-purple-700"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Show prompt
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-purple-500" />
            Daily Reflection
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {currentPrompt.icon} {currentPrompt.category}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
          {currentPrompt.text}
        </p>
        
        {!isEditing && !savedResponse && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Reflect on this
          </Button>
        )}

        {!isEditing && savedResponse && (
          <div className="space-y-2">
            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-purple-100 dark:border-purple-800">
              <p className="text-sm text-foreground whitespace-pre-wrap">{savedResponse}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-purple-600 hover:text-purple-700"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit reflection
            </Button>
          </div>
        )}

        {isEditing && (
          <div className="space-y-3">
            <Textarea
              placeholder="Take a moment to reflect... (optional)"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-[80px] border-purple-200 focus:border-purple-400"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveResponse}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setResponse(savedResponse)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          <Sparkles className="h-3 w-3 inline mr-1" />
          A new prompt appears each day
        </p>
      </CardContent>
    </Card>
  )
}
