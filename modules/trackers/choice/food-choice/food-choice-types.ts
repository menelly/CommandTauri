// Food Choice Tracker Types

export interface SimpleFoodEntry {
  id: string
  timestamp: string
  didEat: boolean
  mealType?: string // breakfast, lunch, dinner, snack
  mood?: string // how they felt about eating
  notes?: string
  tags: string[]
}

export interface DetailedFoodEntry {
  id: string
  timestamp: string
  mealType: string
  foods: string[]
  
  // Macros (optional)
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  
  // Food groups
  foodGroups: string[]
  
  // Context
  notes?: string
  tags: string[]
}

export interface FoodChoiceEntry {
  simpleEntries: SimpleFoodEntry[]
  detailedEntries: DetailedFoodEntry[]
  generalNotes?: string
  tags: string[]
}

export interface FoodAnalytics {
  totalMeals: number
  eatingDays: number
  averageMealsPerDay: number
  commonMealTimes: Array<{time: string, count: number}>
  moodPatterns: Array<{mood: string, count: number}>
  foodGroupFrequency: Array<{group: string, count: number}>
}
