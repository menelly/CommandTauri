/**
 * UPPER DIGESTIVE TRACKER TYPES
 * TypeScript interfaces and types for upper digestive tracking
 */

export interface UpperDigestiveEntry {
  id: string
  date: string
  time: string
  episodeType: 'nausea' | 'reflux' | 'gastroparesis' | 'indigestion' | 'general'
  symptoms: string[]
  severity: number // 1-10 scale
  triggers: string[]
  treatments: string[]
  duration?: {
    value: number
    unit: 'minutes' | 'hours' | 'days'
  }
  notes: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entry: UpperDigestiveEntry) => Promise<void>
  editingEntry?: UpperDigestiveEntry | null
}

export type EpisodeType = 'nausea' | 'reflux' | 'gastroparesis' | 'indigestion' | 'general'

export interface EpisodeTypeInfo {
  id: EpisodeType
  name: string
  icon: string
  description: string
  color: string
}
