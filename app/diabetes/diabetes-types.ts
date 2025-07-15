/**
 * DIABETES TRACKER TYPES
 * TypeScript interfaces for diabetes tracking data
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

export interface DiabetesHistoryProps {
  entries: DiabetesEntry[]
  onEdit: (entry: DiabetesEntry) => void
  onDelete: (id: string) => void
  currentDate: string
}

export interface Timer {
  id: string
  type: 'cgm' | 'pump' | 'glp1'
  name: string
  inserted_at: string  // When the device was inserted
  expires_at: string   // When it needs to be changed
  user_id: string
}
