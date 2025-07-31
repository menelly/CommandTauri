'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Plus, Package, Clock, Moon, ChevronRight, ChevronDown, Backpack, Heart } from 'lucide-react'
import SurvivalButton from '@/components/survival-button'
import DailyPrompts from '@/components/daily-prompts'

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
  const [gearCheck, setGearCheck] = useState<GearItem[]>([
    { id: '1', name: 'Purse/Bag', completed: false, essential: true },
    { id: '2', name: 'Wallet', completed: false, essential: true },
    { id: '3', name: 'Phone', completed: false, essential: true },
    { id: '4', name: 'Keys', completed: false, essential: true },
  ])
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([
    { id: '1', name: 'Morning Routine', startTime: '08:00', endTime: '09:00', color: 'bg-pink-100' },
    { id: '2', name: 'Work/Focus Time', startTime: '09:00', endTime: '12:00', color: 'bg-blue-100' },
    { id: '3', name: 'Lunch Break', startTime: '12:00', endTime: '13:00', color: 'bg-green-100' },
    { id: '4', name: 'Afternoon Tasks', startTime: '13:00', endTime: '17:00', color: 'bg-purple-100' },
    { id: '5', name: 'Evening Wind Down', startTime: '17:00', endTime: '21:00', color: 'bg-orange-100' },
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
    const updatedTasks = dailyTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
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
    const updatedGear = gearCheck.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
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
        <h1 className="text-4xl font-bold text-pink-600 mb-2">Command Zone</h1>
        <p className="text-gray-600">Your daily quest hub - let's get stuff done! ✨</p>
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
        <Card className="bg-gradient-to-r from-pink-100 to-purple-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{completedTasks}</div>
            <div className="text-sm text-gray-600">Tasks Done Today</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-100 to-blue-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedGear}/{gearCheck.length}</div>
            <div className="text-sm text-gray-600">Gear Ready</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {schedule.map(block => (
              <div key={block.id} className={`p-3 rounded-lg ${block.color} flex justify-between items-center`}>
                <div>
                  <div className="font-medium">{block.name}</div>
                  <div className="text-sm text-gray-600">{block.startTime} - {block.endTime}</div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-500">
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
              <Package className="h-5 w-5 text-purple-500" />
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
                <div key={task.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.text}
                  </span>
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {dailyTasks.length === 0 && (
                <p className="text-gray-500 text-center py-4">No tasks yet - add one above!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gear Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Backpack className="h-5 w-5 text-green-500" />
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
                <div key={item.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleGearItem(item.id)}
                  />
                  <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                    {item.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGearItem(item.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ×
                  </Button>
                </div>
              ))}
              {gearCheck.length === 0 && (
                <p className="text-gray-500 text-center py-4">No gear items yet - add some above!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tuck-in Tracker Placeholder */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              Tuck-in Tracker
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Coming Soon</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              End-of-day reflection and wind-down flow will be here soon! 🌙
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
