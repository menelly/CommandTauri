"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Waves, ArrowLeft, BarChart3, History } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import AppCanvas from '@/components/app-canvas'
import Link from 'next/link'
import { SensoryForm } from './sensory-form'
import { SensoryHistory } from './sensory-history'
import { SensoryAnalytics } from './sensory-analytics'
import { SensoryEntry } from './sensory-types'
import { SENSORY_GOBLINISMS } from './sensory-constants'

// Dexie imports
import { useDailyData, CATEGORIES, formatDateForStorage } from '@/lib/database'
import { format } from 'date-fns'

export default function SensoryTracker() {
  const { saveData, getCategoryData, deleteData, isLoading } = useDailyData()
  const { toast } = useToast()

  // State
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [editingEntry, setEditingEntry] = useState<SensoryEntry | null>(null)
  const [activeTab, setActiveTab] = useState("track")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Handle saving sensory entries
  const handleSave = async (entryData: Omit<SensoryEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const sensoryEntry: SensoryEntry = {
        id: editingEntry?.id || `sensory-${Date.now()}`,
        ...entryData,
        createdAt: editingEntry?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await saveData(
        entryData.date,
        CATEGORIES.TRACKER,
        `sensory-${sensoryEntry.id}`,
        JSON.stringify(sensoryEntry),
        entryData.tags
      )

      // Reset editing state and refresh
      setEditingEntry(null)
      setIsFormOpen(false)
      setRefreshTrigger(prev => prev + 1)

      // Show caring goblin message
      toast({
        title: "Sensory entry saved with love! 🌈",
        description: SENSORY_GOBLINISMS[Math.floor(Math.random() * SENSORY_GOBLINISMS.length)]
      })

    } catch (error) {
      console.error('Error saving sensory entry:', error)
      toast({
        title: "Error saving entry",
        description: "Please try again. Your sensory experiences matter! 💜",
        variant: "destructive"
      })
    }
  }

  // Handle editing entries
  const handleEdit = (entry: SensoryEntry) => {
    setEditingEntry(entry)
    setIsFormOpen(true)
    setActiveTab("track")
  }

  // Handle deleting entries
  const handleDelete = async (entry: SensoryEntry) => {
    try {
      await deleteData(entry.date, CATEGORIES.TRACKER, `sensory-${entry.id}`)
      setRefreshTrigger(prev => prev + 1)
      
      toast({
        title: "Entry deleted",
        description: "Your sensory tracking continues with care! 🌈"
      })
    } catch (error) {
      console.error('Error deleting sensory entry:', error)
      toast({
        title: "Error deleting entry",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  return (
    <AppCanvas currentPage="sensory-tracker">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Link href="/mind">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mind
              </Button>
            </Link>
          </div>
          
          <div className="space-y-2">
            <div className="text-6xl">🌈</div>
            <h1 className="text-3xl font-bold text-foreground">
              Sensory Processing Tracker
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track sensory overload, preferences, and comfort needs with understanding. 
              Your sensory experiences are valid and deserve gentle attention.
            </p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="track" className="flex items-center gap-2">
              <Waves className="h-4 w-4" />
              Track
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Patterns
            </TabsTrigger>
          </TabsList>

          {/* Track Tab */}
          <TabsContent value="track" className="space-y-6">
            {!isFormOpen ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sensory Overload */}
                <Card className="border-2 border-red-200 hover:border-red-300 transition-colors cursor-pointer" 
                      onClick={() => setIsFormOpen(true)}>
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-2 text-4xl">🌪️</div>
                    <CardTitle className="text-lg">Sensory Overload</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Track overwhelming sensory experiences
                    </p>
                  </CardHeader>
                </Card>

                {/* Sensory Preferences */}
                <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer" 
                      onClick={() => setIsFormOpen(true)}>
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-2 text-4xl">💜</div>
                    <CardTitle className="text-lg">Sensory Preferences</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Document what sensory input you prefer
                    </p>
                  </CardHeader>
                </Card>

                {/* Comfort & Safe Spaces */}
                <Card className="border-2 border-green-200 hover:border-green-300 transition-colors cursor-pointer" 
                      onClick={() => setIsFormOpen(true)}>
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-2 text-4xl">🤗</div>
                    <CardTitle className="text-lg">Comfort & Safe Spaces</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Track what brings sensory comfort
                    </p>
                  </CardHeader>
                </Card>
              </div>
            ) : (
              <SensoryForm
                initialData={editingEntry}
                onSave={handleSave}
                onCancel={() => {
                  setIsFormOpen(false)
                  setEditingEntry(null)
                }}
              />
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <SensoryHistory
              refreshTrigger={refreshTrigger}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <SensoryAnalytics refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </div>
    </AppCanvas>
  )
}
