/**
 * DIABETES TRACKER CONSTANTS
 * Constants and helper functions for diabetes tracking
 */

// Blood Glucose Categories (mg/dL)
export const BG_CATEGORIES = {
  VERY_LOW: { min: 0, max: 54, color: 'text-red-600 font-bold', label: 'Very Low' },
  LOW: { min: 55, max: 69, color: 'text-red-500', label: 'Low' },
  NORMAL: { min: 70, max: 180, color: 'text-green-600', label: 'Normal' },
  HIGH: { min: 181, max: 250, color: 'text-yellow-600', label: 'High' },
  VERY_HIGH: { min: 251, max: 999, color: 'text-red-600 font-bold', label: 'Very High' }
}

// Helper function to get blood glucose category color
export const getBGCategoryColor = (glucose: number): string => {
  if (glucose <= 54) return BG_CATEGORIES.VERY_LOW.color
  if (glucose <= 69) return BG_CATEGORIES.LOW.color
  if (glucose <= 180) return BG_CATEGORIES.NORMAL.color
  if (glucose <= 250) return BG_CATEGORIES.HIGH.color
  return BG_CATEGORIES.VERY_HIGH.color
}

// Insulin type formatting
export const INSULIN_TYPES = {
  'rapid-acting': 'Rapid',
  'short-acting': 'Short',
  'intermediate': 'Intermediate',
  'long-acting': 'Long',
  'mixed': 'Mixed',
  'other': 'Other'
}

export const formatInsulinType = (type: string): string => {
  return INSULIN_TYPES[type as keyof typeof INSULIN_TYPES] || type
}

// Notification messages
export const NOTIFICATION_MESSAGES = {
  ENTRY_DELETED: {
    title: "🗑️ Entry Deleted",
    description: "Your diabetes entry has been removed."
  },
  ENTRY_SAVED: {
    title: "💾 Entry Saved",
    description: "Your diabetes entry has been saved successfully."
  },
  ENTRY_UPDATED: {
    title: "✏️ Entry Updated", 
    description: "Your diabetes entry has been updated successfully."
  }
}

// Style classes
export const STYLE_CLASSES = {
  NOPE_TAG: 'bg-pink-100 text-pink-800 border-pink-200',
  NOPE_BADGE: 'bg-pink-100 text-pink-800 border-pink-200',
  BG_VERY_LOW: 'text-red-600 font-bold',
  BG_LOW: 'text-red-500',
  BG_NORMAL: 'text-green-600',
  BG_HIGH: 'text-yellow-600',
  BG_VERY_HIGH: 'text-red-600 font-bold'
}

// Common tags for diabetes entries
export const COMMON_TAGS = [
  'morning', 'afternoon', 'evening', 
  'before-meal', 'after-meal', 'bedtime',
  'exercise', 'stress', 'sick', 'nope'
]

// Mood options
export const MOOD_OPTIONS = [
  'great', 'good', 'okay', 'tired', 'stressed', 'unwell'
]

// Insulin types for form
export const INSULIN_TYPE_OPTIONS = [
  'rapid-acting', 'short-acting', 'intermediate', 'long-acting', 'mixed', 'other'
]
