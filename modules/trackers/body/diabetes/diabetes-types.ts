/**
 * DIABETES TRACKER TYPES
 * Type definitions for diabetes tracking system
 */

export interface DiabetesEntry {
  id: string
  user_id: string
  entry_date: string
  entry_time: string
  blood_glucose?: number
  ketones?: number
  insulin_type?: string
  insulin_amount?: number
  carbs?: number
  cgm_timer?: number
  pump_timer?: number
  glp1_timer?: number
  mood?: string
  notes?: string
  tags: string[]
  created_at: string
}

export interface Timer {
  id: string
  type: 'cgm' | 'pump' | 'glp1'
  name: string
  inserted_at: string  // When the device was inserted
  expires_at: string   // When it needs to be changed
  user_id: string
}

export interface DiabetesAnalyticsProps {
  entries: DiabetesEntry[]
  currentDate: string
}

export interface DiabetesHistoryProps {
  // No props needed - self-contained
}

export interface TimerManagerProps {
  timers: Timer[]
  onTimersChange: (timers: Timer[]) => void
  currentUserId: string
}
