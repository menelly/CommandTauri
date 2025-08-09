'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Plus, Package, Clock, Moon, ChevronRight, ChevronDown, Backpack, Heart } from 'lucide-react'
import SurvivalButton from '@/components/survival-button'
import DailyPrompts from '@/components/daily-prompts'
import confetti from 'canvas-confetti'

interface DailyTask {
  id: string
  text: string
  completed: boolean
  subtasks?: DailyTask[]
  expanded?: boolean
}

interface GearItem {
  id: string
  name: string
  completed: boolean
  essential: boolean
}

interface ScheduleBlock {
  id: string
  name: string
  startTime: string
  endTime: string
  color: string
}

export default function CommandZone() {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([])
  const [newTask, setNewTask] = useState('')
  const [newGearItem, setNewGearItem] = useState('')
  const [celebrationEmojis, setCelebrationEmojis] = useState<Array<{id: number, emoji: string, x: number, y: number}>>([])

  // Luka's epic task celebration function! 🎉
  const triggerLukasCelebration = useCallback(() => {
    // CONFETTI EXPLOSION! 🎉
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#b19cd9', '#87ceeb', '#dda0dd', '#f0e6ff', '#e6f3ff'] // Luka's penguin theme colors!
    })

    // More confetti from different angles!
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#b19cd9', '#87ceeb', '#dda0dd']
      })
    }, 200)

    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#b19cd9', '#87ceeb', '#dda0dd']
      })
    }, 400)

    // Floating celebration emojis! 🐧✨
    const celebrationEmojis = ['🎉', '🐧', '✨', '🌟', '💜', '🎯', '🚀', '⭐', '🎊', '🏆']
    const newEmojis = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      emoji: celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)],
      x: Math.random() * 80 + 10, // 10% to 90% of screen width
      y: Math.random() * 80 + 10  // 10% to 90% of screen height
    }))

    setCelebrationEmojis(newEmojis)

    // Clear emojis after animation
    setTimeout(() => {
      setCelebrationEmojis([])
    }, 3000)
  }, [])
  const [gearCheck, setGearCheck] = useState<GearItem[]>([
    { id: '1', name: 'Purse/Bag', completed: false, essential: true },
    { id: '2', name: 'Wallet', completed: false, essential: true },
    { id: '3', name: 'Phone', completed: false, essential: true },
    { id: '4', name: 'Keys', completed: false, essential: true },
  ])
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([
    { id: '1', name: 'Morning Routine', startTime: '08:00', endTime: '09:00', color: 'bg-[var(--surface-1)]' },
    { id: '2', name: 'Work/Focus Time', startTime: '09:00', endTime: '12:00', color: 'bg-[var(--surface-2)]' },
    { id: '3', name: 'Lunch Break', startTime: '12:00', endTime: '13:00', color: 'bg-[var(--grounding-bg)]' },
    { id: '4', name: 'Afternoon Tasks', startTime: '13:00', endTime: '17:00', color: 'bg-[var(--surface-1)]' },
    { id: '5', name: 'Evening Wind Down', startTime: '17:00', endTime: '21:00', color: 'bg-[var(--surface-2)]' },
  ])

  // Load data from localStorage
  useEffect(() => {
    const today = new Date().toDateString()
    const savedTasks = localStorage.getItem(`daily-tasks-${today}`)
    const savedGear = localStorage.getItem(`gear-check`)

    if (savedTasks) setDailyTasks(JSON.parse(savedTasks))
    if (savedGear) setGearCheck(JSON.parse(savedGear))
  }, [])

  const saveTasks = (tasks: DailyTask[]) => {
    const today = new Date().toDateString()
    localStorage.setItem(`daily-tasks-${today}`, JSON.stringify(tasks))
  }

  const saveGear = (gear: GearItem[]) => {
    localStorage.setItem(`gear-check`, JSON.stringify(gear))
  }

  const addTask = () => {
    if (newTask.trim()) {
      const task: DailyTask = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
        subtasks: [],
        expanded: false
      }
      const updatedTasks = [...dailyTasks, task]
      setDailyTasks(updatedTasks)
      saveTasks(updatedTasks)
      setNewTask('')
    }
  }

  const toggleTask = (taskId: string) => {
    const updatedTasks = dailyTasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed
        // If task is being completed (not uncompleted), trigger Luka's celebration! 🎉
        if (newCompleted && !task.completed) {
          triggerLukasCelebration()
        }
        return { ...task, completed: newCompleted }
      }
      return task
    })
    setDailyTasks(updatedTasks)
    saveTasks(updatedTasks)
  }

  const addGearItem = () => {
    if (newGearItem.trim()) {
      const item: GearItem = {
        id: Date.now().toString(),
        name: newGearItem.trim(),
        completed: false,
        essential: false
      }
      const updatedGear = [...gearCheck, item]
      setGearCheck(updatedGear)
      saveGear(updatedGear)
      setNewGearItem('')
    }
  }

  const toggleGearItem = (itemId: string) => {
    const updatedGear = gearCheck.map(item => {
      if (item.id === itemId) {
        const newCompleted = !item.completed
        // If gear item is being completed, trigger celebration too! 🎒✨
        if (newCompleted && !item.completed) {
          triggerLukasCelebration()
        }
        return { ...item, completed: newCompleted }
      }
      return item
    })
    setGearCheck(updatedGear)
    saveGear(updatedGear)
  }

  const removeGearItem = (itemId: string) => {
    const updatedGear = gearCheck.filter(item => item.id !== itemId)
    setGearCheck(updatedGear)
    saveGear(updatedGear)
  }

  const completedTasks = dailyTasks.filter(task => task.completed).length
  const completedGear = gearCheck.filter(item => item.completed).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[var(--primary-purple)] mb-2">Command Zone</h1>
        <p className="text-muted-foreground">Your daily quest hub - let's get stuff done! ✨</p>
      </div>

      {/* SURVIVAL BOX & DAILY PROMPTS - The heart of it all! */}
      <div className="mb-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SurvivalButton />
          </div>
          <div>
            <DailyPrompts />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-[var(--surface-1)] to-[var(--surface-2)]">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[var(--primary-purple)]">{completedTasks}</div>
            <div className="text-sm text-muted-foreground">Tasks Done Today</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-[var(--grounding-bg)] to-[var(--surface-1)]">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[var(--accent-orange)]">{completedGear}/{gearCheck.length}</div>
            <div className="text-sm text-muted-foreground">Gear Ready</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--accent-orange)]" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {schedule.map(block => (
              <div key={block.id} className={`p-3 rounded-lg ${block.color} flex justify-between items-center`}>
                <div>
                  <div className="font-medium">{block.name}</div>
                  <div className="text-sm text-muted-foreground">{block.startTime} - {block.endTime}</div>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Edit
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[var(--hover-glow)]" />
              Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a task for today..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                className="flex-1"
              />
              <Button onClick={addTask} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dailyTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.text}
                  </span>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {dailyTasks.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No tasks yet - add one above!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gear Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Backpack className="h-5 w-5 text-[var(--accent-orange)]" />
              Gear Check (Leaving House)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add gear item (meds, kid stuff, etc.)"
                value={newGearItem}
                onChange={(e) => setNewGearItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addGearItem()}
                className="flex-1"
              />
              <Button onClick={addGearItem} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {gearCheck.map(item => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleGearItem(item.id)}
                  />
                  <span className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGearItem(item.id)}
                    className="text-[var(--crisis-accent)] hover:text-[var(--crisis-border)]"
                  >
                    ×
                  </Button>
                </div>
              ))}
              {gearCheck.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No gear items yet - add some above!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tuck-in Tracker Placeholder */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-[var(--hover-glow)]" />
              Tuck-in Tracker
              <span className="text-sm bg-[var(--surface-1)] text-[var(--text-main)] px-2 py-1 rounded">Coming Soon</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              End-of-day reflection and wind-down flow will be here soon! 🌙
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Luka's Epic Celebration Overlay! 🎉🐧 */}
      {celebrationEmojis.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {celebrationEmojis.map((emoji) => (
            <div
              key={emoji.id}
              className="absolute text-4xl animate-bounce"
              style={{
                left: `${emoji.x}%`,
                top: `${emoji.y}%`,
                animationDuration: '2s',
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              {emoji.emoji}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
