export interface MentalHealthEntry {
  id: string
  date: string
  time: string
  
  // Mood & Emotional State
  mood: string // emoji-based mood selection
  moodIntensity: number // 1-10 scale
  emotionalState: string[] // multiple emotions can apply
  
  // Mental Health Scales (0-10)
  anxietyLevel: number
  depressionLevel: number
  maniaLevel: number
  energyLevel: number
  stressLevel: number

  // Symptoms & Triggers
  triggers: string[]
  copingStrategies: string[]
  
  // Therapy & Treatment
  therapyNotes: string
  medicationTaken: boolean
  medicationNotes: string
  
  // General
  notes: string
  tags: string[]
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface MoodOption {
  value: string
  emoji: string
  label: string
  color: string
}

export interface EmotionalState {
  value: string
  emoji: string
  label: string
  category: 'positive' | 'negative' | 'neutral'
}



export interface Trigger {
  value: string
  label: string
  category: 'environmental' | 'social' | 'physical' | 'emotional'
}

export interface CopingStrategy {
  value: string
  label: string
  category: 'immediate' | 'long-term' | 'professional'
}
