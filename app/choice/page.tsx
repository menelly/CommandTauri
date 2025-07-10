'use client'

import React from 'react'
import AppCanvas from '@/components/app-canvas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bed,
  Droplets,
  Utensils,
  Activity,
  Battery,
  Heart,
  ArrowRight
} from 'lucide-react'

export default function ChoicePage() {
  const choiceAreas = [
    {
      title: "Sleep",
      description: "Track sleep quality, duration, and your bedtime routines",
      icon: Bed,
      color: "bg-indigo-500",
      route: "/sleep",
    },
    {
      title: "Hydration",
      description: "Monitor water intake and hydration habits you control",
      icon: Droplets,
      color: "bg-blue-500",
      route: "/hydration"
    },
    {
      title: "Food Choice",
      description: "Track what you choose to eat and your relationship with food",
      icon: Utensils,
      color: "bg-green-500",
      route: "/food-choice"
    },
    {
      title: "Movement",
      description: "Log physical activity and movement you choose to do",
      icon: Activity,
      color: "bg-orange-500",
      route: "/movement"
    },
    {
      title: "Energy & Pacing",
      description: "Manage your energy levels and pacing decisions",
      icon: Battery,
      color: "bg-yellow-500",
      route: "/energy"
    },
    {
      title: "Coping & Regulation",
      description: "Track coping strategies and regulation tools you use",
      icon: Heart,
      color: "bg-pink-500",
      route: "/coping-regulation"
    }
  ]

  const handleNavigation = (route: string) => {
    window.location.href = route
  }

  return (
    <AppCanvas currentPage="choice">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-green-500" />
            Choice
          </h1>
          <p className="text-lg text-muted-foreground">
            Track the things that are entirely within YOUR choice
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {choiceAreas.map((area, index) => {
            const IconComponent = area.icon

            return (
              <Card
                key={index}
                className="relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer"
                onClick={() => handleNavigation(area.route)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${area.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{area.title}</CardTitle>
                  <CardDescription>{area.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="default" className="w-full">
                    Open <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Philosophy Box */}
        <div className="bg-muted/50 p-6 rounded-lg text-center mt-8">
          <h3 className="text-lg font-semibold mb-2">Your Agency Matters</h3>
          <p className="text-muted-foreground">
            While chronic illness affects many aspects of life, this section celebrates the choices
            that remain yours. Track your self-care wins and build sustainable habits at your own pace.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            ← Back to Command Center
          </Button>
        </div>
      </div>
    </AppCanvas>
  )
}
