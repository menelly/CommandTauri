"use client"

import { useState } from "react"
import AppCanvas from "@/components/app-canvas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Brain,
  Cloud,
  AlertTriangle,
  Ear,
  Phone,
  Heart,
  Shield,
  Smile,
  Frown,
  HelpCircle,
  Palette
} from "lucide-react"

interface TrackerButton {
  id: string
  name: string
  shortDescription: string
  helpContent: string
  icon: React.ReactNode
  status: 'available' | 'coming-soon' | 'planned'
}

export default function MentalHealthIndex() {
  const trackers: TrackerButton[] = [
    {
      id: 'brain-fog',
      name: 'Brain Fog & Cognitive',
      shortDescription: 'Word-finding, memory issues, cognitive tracking',
      helpContent: 'Track cognitive symptoms like brain fog, word-finding difficulties, memory issues, and concentration problems. Rate severity, identify triggers, and track patterns over time. Perfect for ADHD, chronic illness, or post-viral cognitive symptoms.',
      icon: <Cloud className="h-5 w-5" />,
      status: 'available',
      href: '/brain-fog'
    },
    {
      id: 'mental-health-general',
      name: 'Mental Health Overview',
      shortDescription: 'Mood, anxiety, depression, therapy notes',
      helpContent: 'Comprehensive mental health tracking including mood patterns, anxiety levels, depression symptoms, and therapy session notes. Integrates with other mental health trackers for a complete picture.',
      icon: <Brain className="h-5 w-5" />,
      status: 'coming-soon'
    },
    {
      id: 'mood-check-in',
      name: 'Mood Check-in',
      shortDescription: 'Emotional state with custom emojis',
      helpContent: 'Quick daily mood tracking with customizable emoji scales. Track emotional states, energy levels, and overall mental weather. Simple enough for bad brain days, detailed enough for patterns.',
      icon: <Smile className="h-5 w-5" />,
      status: 'coming-soon'
    },
    {
      id: 'anxiety-tracker',
      name: 'Anxiety Tracker',
      shortDescription: 'Worry patterns and solutions',
      helpContent: 'Track anxiety levels, worry patterns, triggers, and what helps. Rate intensity, identify situations that cause anxiety, and build a toolkit of effective coping strategies.',
      icon: <Frown className="h-5 w-5" />,
      status: 'coming-soon'
    },
    {
      id: 'panic-meltdowns',
      name: 'Panic & Meltdowns',
      shortDescription: 'Crisis tracking, triggers, recovery',
      helpContent: 'Track panic attacks, meltdowns, and overwhelm episodes. Record triggers, warning signs, what helped, and recovery time. Build your personal crisis management toolkit.',
      icon: <AlertTriangle className="h-5 w-5" />,
      status: 'coming-soon'
    },
    {
      id: 'self-care-tracker',
      name: 'Self-Care Tracker',
      shortDescription: 'Wellness activities and habits',
      helpContent: 'Track self-care activities and their impact on your mental health. Monitor sleep, exercise, social connection, creative activities, and other wellness practices that support your mental health.',
      icon: <Heart className="h-5 w-5" />,
      status: 'coming-soon'
    },
    {
      id: 'sensory-overload',
      name: 'Sensory Overload',
      shortDescription: 'Sensory processing, overwhelm tracking',
      helpContent: 'Track sensory overwhelm episodes, identify triggers (sounds, lights, textures, crowds), and monitor your sensory processing patterns. Essential for neurodivergent individuals.',
      icon: <Ear className="h-5 w-5" />,
      status: 'coming-soon'
    },
    {
      id: 'sensory-preferences',
      name: 'Sensory Preferences',
      shortDescription: 'Environment and comfort tracking',
      helpContent: 'Document your sensory preferences and environmental needs. Track what sensory inputs help vs. overwhelm you, and build your ideal environment profile for different situations.',
      icon: <Palette className="h-5 w-5" />,
      status: 'coming-soon'
    },
    {
      id: 'crisis-plan',
      name: 'Crisis Plan',
      shortDescription: 'Emergency contacts and strategies',
      helpContent: 'Your emergency mental health plan. Store crisis contacts, warning signs to watch for, strategies that help, and important information for when you need help RIGHT NOW. Can be set to show on app open.',
      icon: <Phone className="h-5 w-5" />,
      status: 'coming-soon'
    }
  ]

  const handleTrackerClick = (trackerId: string) => {
    const tracker = trackers.find(t => t.id === trackerId)
    if (tracker?.status === 'available' && tracker.href) {
      window.location.href = tracker.href
    } else {
      console.log(`Tracker ${trackerId} not yet available`)
    }
  }

  return (
    <AppCanvas currentPage="mental-health">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            Mind
          </h1>
          <p className="text-lg text-muted-foreground">
            Mental wellness and emotional support tracking
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trackers.map((tracker) => (
            <Card
              key={tracker.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardHeader
                className="pb-3 cursor-pointer"
                onClick={() => handleTrackerClick(tracker.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-primary">
                      {tracker.icon}
                    </div>
                    <CardTitle className="text-base leading-tight">{tracker.name}</CardTitle>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {tracker.icon}
                          {tracker.name}
                        </DialogTitle>
                        <DialogDescription className="text-left">
                          {tracker.helpContent}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription className="text-sm mt-2">
                  {tracker.shortDescription}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* HELP SECTION */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Mental Health Help
            </CardTitle>
            <CardDescription>
              Comprehensive guides and tutorials for all mental health trackers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              📖 Open Mental Health Guide
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            ← Back to Command Center
          </Button>
        </div>
      </div>
    </AppCanvas>
  )
}
