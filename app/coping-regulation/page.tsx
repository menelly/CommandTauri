'use client'

import React, { useState, useEffect } from 'react'
import AppCanvas from '@/components/app-canvas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Heart,
  Wind,
  Zap,
  Brain,
  Eye,
  Headphones,
  Timer,
  Play,
  Pause,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Plus,
  X
} from 'lucide-react'

interface CopingTechnique {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  color: string
  type: 'breathing' | 'grounding' | 'muscle' | 'sensory' | 'cognitive'
  duration?: number // in seconds
  steps?: string[]
}

interface CopingSession {
  id: string
  techniqueId: string
  startTime: Date
  endTime?: Date
  completed: boolean
  helpful?: boolean
  notes?: string
}

const copingTechniques: CopingTechnique[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    description: 'Breathe in for 4, hold for 4, out for 4, hold for 4',
    icon: Wind,
    color: 'bg-blue-500',
    type: 'breathing',
    duration: 240, // 4 minutes
    steps: ['Breathe in for 4 counts', 'Hold for 4 counts', 'Breathe out for 4 counts', 'Hold for 4 counts']
  },
  {
    id: 'progressive-muscle',
    name: 'Progressive Muscle Relaxation',
    description: 'Tense and release muscle groups systematically',
    icon: Zap,
    color: 'bg-purple-500',
    type: 'muscle',
    duration: 600, // 10 minutes
    steps: [
      'Start with your toes - tense for 5 seconds, then release',
      'Move to your calves - tense and release',
      'Tense your thighs, then let go',
      'Clench your fists, then relax',
      'Tense your arms, then release',
      'Scrunch your face, then relax',
      'Tense your whole body, then completely let go'
    ]
  },
  {
    id: '5-4-3-2-1-grounding',
    name: '5-4-3-2-1 Grounding',
    description: 'Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste',
    icon: Eye,
    color: 'bg-green-500',
    type: 'grounding',
    steps: [
      'Name 5 things you can see',
      'Name 4 things you can hear',
      'Name 3 things you can feel',
      'Name 2 things you can smell',
      'Name 1 thing you can taste'
    ]
  },
  {
    id: 'cold-water',
    name: 'Cold Water Reset',
    description: 'Use cold water to activate your dive response',
    icon: Headphones,
    color: 'bg-cyan-500',
    type: 'sensory',
    steps: [
      'Run cold water over your wrists',
      'Splash cold water on your face',
      'Hold an ice cube in your hands',
      'Take slow, deep breaths'
    ]
  },
  {
    id: 'thought-stopping',
    name: 'Thought Stopping',
    description: 'Interrupt negative thought spirals',
    icon: Brain,
    color: 'bg-orange-500',
    type: 'cognitive',
    steps: [
      'Notice the negative thought',
      'Say "STOP" out loud or in your head',
      'Take 3 deep breaths',
      'Replace with a neutral or positive thought',
      'Engage in a different activity'
    ]
  }
]

export default function CopingRegulationPage() {
  const [selectedTechnique, setSelectedTechnique] = useState<CopingTechnique | null>(null)
  const [currentSession, setCurrentSession] = useState<CopingSession | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [breathingPhase, setBreathingPhase] = useState(0) // 0: breathe in, 1: hold, 2: breathe out, 3: hold
  const [phaseTimer, setPhaseTimer] = useState(0)
  const [stepCountdown, setStepCountdown] = useState(0)
  const [sessions, setSessions] = useState<CopingSession[]>([])
  const [customTechniques, setCustomTechniques] = useState<CopingTechnique[]>([])
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [newTechnique, setNewTechnique] = useState({ name: '', description: '', steps: [''] })

  // Load sessions and custom techniques from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('coping-sessions')
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    }

    const savedCustom = localStorage.getItem('custom-techniques')
    if (savedCustom) {
      setCustomTechniques(JSON.parse(savedCustom))
    }
  }, [])

  // Timer effect with auto-advance for all techniques
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && currentSession && selectedTechnique) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)

        if (selectedTechnique.id === 'box-breathing') {
          // Box breathing: 4 seconds per phase
          setPhaseTimer(prev => {
            const newTimer = prev + 1
            if (newTimer >= 4) {
              setBreathingPhase(current => (current + 1) % 4)
              return 0
            }
            return newTimer
          })
        } else if (selectedTechnique.id === 'progressive-muscle') {
          // Progressive muscle: 5 second countdown per step
          setStepCountdown(prev => {
            if (prev <= 1) {
              setCurrentStep(current => {
                const nextStep = current + 1
                if (nextStep >= selectedTechnique.steps!.length) {
                  return current // Stay on last step
                }
                return nextStep
              })
              return 5 // Reset countdown
            }
            return prev - 1
          })
        } else if (selectedTechnique.steps && selectedTechnique.steps.length > 1) {
          // Other techniques: 10 second countdown per step
          setStepCountdown(prev => {
            if (prev <= 1) {
              setCurrentStep(current => {
                const nextStep = current + 1
                if (nextStep >= selectedTechnique.steps!.length) {
                  return current // Stay on last step
                }
                return nextStep
              })
              return 10 // Reset countdown
            }
            return prev - 1
          })
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, currentSession, selectedTechnique])

  const startSession = (technique: CopingTechnique) => {
    const session: CopingSession = {
      id: Date.now().toString(),
      techniqueId: technique.id,
      startTime: new Date(),
      completed: false
    }

    setSelectedTechnique(technique)
    setCurrentSession(session)
    setIsActive(true)
    setTimeElapsed(0)
    setCurrentStep(0)
    setBreathingPhase(0)
    setPhaseTimer(0)

    // Set initial countdown based on technique
    if (technique.id === 'progressive-muscle') {
      setStepCountdown(5)
    } else if (technique.steps && technique.steps.length > 1) {
      setStepCountdown(10)
    }
  }

  const pauseSession = () => {
    setIsActive(false)
  }

  const resumeSession = () => {
    setIsActive(true)
  }

  const completeSession = (helpful?: boolean) => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        endTime: new Date(),
        completed: true,
        helpful
      }
      
      const updatedSessions = [...sessions, completedSession]
      setSessions(updatedSessions)
      localStorage.setItem('coping-sessions', JSON.stringify(updatedSessions))
    }
    
    resetSession()
  }

  const resetSession = () => {
    setSelectedTechnique(null)
    setCurrentSession(null)
    setIsActive(false)
    setTimeElapsed(0)
    setCurrentStep(0)
    setBreathingPhase(0)
    setPhaseTimer(0)
    setStepCountdown(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const addCustomTechnique = () => {
    if (newTechnique.name.trim() && newTechnique.description.trim()) {
      const technique: CopingTechnique = {
        id: `custom-${Date.now()}`,
        name: newTechnique.name.trim(),
        description: newTechnique.description.trim(),
        icon: Heart,
        color: 'bg-purple-500',
        type: 'cognitive',
        steps: newTechnique.steps.filter(step => step.trim())
      }

      const updatedCustom = [...customTechniques, technique]
      setCustomTechniques(updatedCustom)
      localStorage.setItem('custom-techniques', JSON.stringify(updatedCustom))

      setNewTechnique({ name: '', description: '', steps: [''] })
      setShowAddCustom(false)
    }
  }

  const addStep = () => {
    setNewTechnique(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }))
  }

  const updateStep = (index: number, value: string) => {
    setNewTechnique(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }))
  }

  const removeStep = (index: number) => {
    setNewTechnique(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }))
  }

  const allTechniques = [...copingTechniques, ...customTechniques]

  const getRecommendations = () => {
    const helpfulTechniques = sessions
      .filter(s => s.helpful === true)
      .reduce((acc, session) => {
        acc[session.techniqueId] = (acc[session.techniqueId] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return Object.entries(helpfulTechniques)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([id]) => allTechniques.find(t => t.id === id))
      .filter(Boolean)
  }

  if (selectedTechnique && currentSession) {
    return (
      <AppCanvas currentPage="coping-session">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={resetSession} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Techniques
            </Button>
            
            <Card>
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${selectedTechnique.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <selectedTechnique.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{selectedTechnique.name}</CardTitle>
                <CardDescription>{selectedTechnique.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-primary mb-2">
                    {formatTime(timeElapsed)}
                  </div>
                  
                  {selectedTechnique.duration && (
                    <Progress 
                      value={(timeElapsed / selectedTechnique.duration) * 100} 
                      className="w-full mb-4"
                    />
                  )}
                  
                  <div className="flex justify-center gap-2 mb-6">
                    {!isActive ? (
                      <Button onClick={resumeSession} size="lg">
                        <Play className="h-5 w-5 mr-2" />
                        {timeElapsed === 0 ? 'Start' : 'Resume'}
                      </Button>
                    ) : (
                      <Button onClick={pauseSession} variant="outline" size="lg">
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </Button>
                    )}
                    
                    <Button onClick={resetSession} variant="outline" size="lg">
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

{selectedTechnique.steps && (
                  <div className="space-y-6">
                    {selectedTechnique.id === 'box-breathing' ? (
                      <div className="text-center">
                        <div className="text-6xl font-bold text-primary mb-4">
                          {4 - phaseTimer}
                        </div>
                        <div className="text-2xl font-semibold mb-6">
                          {['Breathe In', 'Hold', 'Breathe Out', 'Hold'][breathingPhase]}
                        </div>
                      </div>
                    ) : stepCountdown > 0 && (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {stepCountdown}
                        </div>
                        <div className="text-lg text-muted-foreground">
                          {selectedTechnique.id === 'progressive-muscle' ? 'seconds to hold' : 'seconds on this step'}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h3 className="font-semibold text-center">
                        {selectedTechnique.id === 'box-breathing' ? 'Breathing Pattern:' : 'Steps:'}
                      </h3>
                      {selectedTechnique.steps.map((step, index) => {
                        const isActive = selectedTechnique.id === 'box-breathing' ?
                          index === breathingPhase :
                          index === currentStep

                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border transition-all duration-500 ${
                              isActive ? 'bg-primary/20 border-primary scale-105' : 'bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                                isActive ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-muted'
                              }`}>
                                {index + 1}
                              </div>
                              <span className={`text-lg ${isActive ? 'font-bold' : ''}`}>{step}</span>
                              {isActive && selectedTechnique.id !== 'box-breathing' && stepCountdown > 0 && (
                                <div className="ml-auto text-2xl font-bold text-primary">
                                  {stepCountdown}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {selectedTechnique.id !== 'box-breathing' && (
                      <div className="text-center text-sm text-muted-foreground">
                        <p>✨ This technique advances automatically - just follow along!</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-center mb-4">How are you feeling?</h3>
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => completeSession(true)} className="bg-green-500 hover:bg-green-600">
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      This helped!
                    </Button>
                    <Button onClick={() => completeSession(false)} variant="outline">
                      <ThumbsDown className="h-5 w-5 mr-2" />
                      Not helpful
                    </Button>
                    <Button onClick={() => completeSession()} variant="outline">
                      Skip feedback
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppCanvas>
    )
  }

  const recommendations = getRecommendations()

  return (
    <AppCanvas currentPage="coping-regulation">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-pink-500" />
            Coping & Regulation
          </h1>
          <p className="text-lg text-muted-foreground">
            Tools and techniques to help you regulate and cope
          </p>
        </header>

        {recommendations.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-green-500" />
                Recommended for You
              </CardTitle>
              <CardDescription>
                Based on what's helped you before
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((technique) => {
                  if (!technique) return null
                  const IconComponent = technique.icon
                  return (
                    <Button
                      key={technique.id}
                      onClick={() => startSession(technique)}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <div className={`w-12 h-12 ${technique.color} rounded-full flex items-center justify-center`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <span className="font-medium">{technique.name}</span>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {allTechniques.map((technique) => {
            const IconComponent = technique.icon
            const sessionsCount = sessions.filter(s => s.techniqueId === technique.id).length
            const helpfulCount = sessions.filter(s => s.techniqueId === technique.id && s.helpful === true).length
            
            return (
              <Card
                key={technique.id}
                className="relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer"
                onClick={() => startSession(technique)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${technique.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    {sessionsCount > 0 && (
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          Used {sessionsCount} times
                        </Badge>
                        {helpfulCount > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            ✓ Helpful {helpfulCount} times
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{technique.name}</CardTitle>
                  <CardDescription>{technique.description}</CardDescription>
                  {technique.duration && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      ~{Math.round(technique.duration / 60)} minutes
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Button variant="default" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                </CardContent>
              </Card>
            )
          })}

          {/* Add Custom Technique Card */}
          <Card
            className="relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border-dashed border-2"
            onClick={() => setShowAddCustom(true)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-gray-500 text-white">
                  <Plus className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-lg">Add Your Own</CardTitle>
              <CardDescription>Create a custom coping technique that works for you</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Technique
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Custom Technique Form Modal */}
        {showAddCustom && (
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Your Custom Coping Technique</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddCustom(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Technique Name</label>
                <Input
                  value={newTechnique.name}
                  onChange={(e) => setNewTechnique(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., My Special Breathing Technique"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTechnique.description}
                  onChange={(e) => setNewTechnique(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this technique does"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Steps</label>
                {newTechnique.steps.map((step, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={step}
                      onChange={(e) => updateStep(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                    />
                    {newTechnique.steps.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeStep(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addStep} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={addCustomTechnique} className="flex-1">
                  Save Technique
                </Button>
                <Button variant="outline" onClick={() => setShowAddCustom(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button variant="outline" onClick={() => window.location.href = '/choice'}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Choice
          </Button>
        </div>
      </div>
    </AppCanvas>
  )
}
