export interface MovementEntry {
  id: string
  date: string
  time: string
  type: string
  duration: string
  intensity: string
  energyBefore: number // 1-10 scale
  energyAfter: number // 1-10 scale
  bodyFeel: string[]
  location: string
  notes: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface MovementType {
  value: string
  emoji: string
  description: string
}

export interface IntensityLevel {
  value: string
  emoji: string
  description: string
}
