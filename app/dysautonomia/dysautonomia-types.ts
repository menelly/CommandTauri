/**
 * DYSAUTONOMIA TRACKER TYPES
 * TypeScript interfaces for dysautonomia episode tracking
 */

export interface DysautonomiaEntry {
  id: string
  timestamp: string
  date: string
  episodeType: 'pots' | 'blood-pressure' | 'gi-symptoms' | 'temperature' | 'spo2' | 'general'
  
  // Vital Signs (Lite Vitals - Phase 3 will have full vitals)
  restingHeartRate?: number
  standingHeartRate?: number
  heartRateIncrease?: number
  bloodPressureSitting?: string // e.g., "120/80"
  bloodPressureStanding?: string // e.g., "90/60"

  // SpO2 Monitoring - Because oxygen is NOT optional! 💨
  restingSpO2?: number // SpO2 while resting
  standingSpO2?: number // SpO2 after standing/position change
  lowestSpO2?: number // Lowest SpO2 during episode
  spO2Duration?: string // How long desaturation lasted
  
  // Symptoms (comprehensive list for episode context)
  symptoms: string[]
  severity: number // 1-10 scale
  
  // Position & Context
  positionChange?: string // 'lying-to-sitting' | 'sitting-to-standing' | 'prolonged-standing' | 'other'
  duration?: string // how long symptoms lasted
  
  // Triggers & Environment
  triggers: string[]
  temperature?: string
  hydrationLevel?: string
  
  // Interventions & Effectiveness
  interventions: string[]
  interventionEffectiveness?: number // 1-5 scale
  
  // Notes & Tags
  notes?: string
  tags?: string[]
}

export interface EpisodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entry: Omit<DysautonomiaEntry, 'id' | 'timestamp' | 'date'>) => void
  editingEntry?: DysautonomiaEntry | null
}
