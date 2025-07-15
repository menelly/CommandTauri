// 🩸 Diabetes History Display Component
// Displays diabetes entries with proper JSON parsing and CRUD operations

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Droplets, Zap, Apple } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { 
  DiabetesEntry, 
  DiabetesHistoryProps 
} from './diabetes-types'
import { 
  getBGCategoryColor,
  formatInsulinType,
  NOTIFICATION_MESSAGES,
  STYLE_CLASSES
} from './diabetes-constants'

export function DiabetesHistory({ 
  entries, 
  onEdit, 
  onDelete, 
  currentDate 
}: DiabetesHistoryProps) {

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return

    try {
      await onDelete(id)
      toast(NOTIFICATION_MESSAGES.ENTRY_DELETED)
    } catch (error) {
      console.error('❌ Failed to delete diabetes entry:', error)
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Parse entries data with JSON parsing fix
  const parseEntries = (rawEntries: any): DiabetesEntry[] => {
    if (!rawEntries) return []
    
    let parsedEntries = rawEntries
    
    // Apply JSON parsing fix for WatermelonDB compatibility
    if (typeof parsedEntries === 'string') {
      try {
        parsedEntries = JSON.parse(parsedEntries)
      } catch (e) {
        console.error('Failed to parse entries JSON:', e)
        return []
      }
    }
    
    if (!Array.isArray(parsedEntries)) {
      parsedEntries = [parsedEntries]
    }
    
    return parsedEntries.filter((entry: any) => entry && typeof entry === 'object') as DiabetesEntry[]
  }

  const displayEntries = parseEntries(entries)

  if (displayEntries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p style={{ color: 'var(--text-muted)' }}>No entries for {currentDate}</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Add your first entry to start tracking!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {displayEntries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{entry.entry_time}</span>
                  {entry.tags.includes('nope') && (
                    <Badge className={STYLE_CLASSES.NOPE_TAG}>🍰 NOPE</Badge>
                  )}
                </div>

                {/* Vital Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {entry.blood_glucose && (
                    <div className="flex items-center gap-1">
                      <Droplets className="h-4 w-4 text-red-500" />
                      <span className={getBGCategoryColor(entry.blood_glucose)}>
                        {entry.blood_glucose} mg/dL
                      </span>
                    </div>
                  )}
                  {entry.ketones && (
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-purple-500" />
                      <span>{entry.ketones} mmol/L</span>
                    </div>
                  )}
                  {entry.insulin_amount && (
                    <div className="flex items-center gap-1">
                      <span className="text-blue-500">💉</span>
                      <span>
                        {entry.insulin_amount}u {entry.insulin_type ? formatInsulinType(entry.insulin_type) : ''}
                      </span>
                    </div>
                  )}
                  {entry.carbs && (
                    <div className="flex items-center gap-1">
                      <Apple className="h-4 w-4 text-green-500" />
                      <span>{entry.carbs}g carbs</span>
                    </div>
                  )}
                </div>

                {/* Mood */}
                {entry.mood && (
                  <div className="mt-2 text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Mood: </span>
                    <span className="capitalize">{entry.mood}</span>
                  </div>
                )}

                {/* Notes */}
                {entry.notes && (
                  <div className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {entry.notes}
                  </div>
                )}

                {/* Tags */}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={tag === 'nope' ? STYLE_CLASSES.NOPE_BADGE : ''}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(entry)}
                  title="Edit entry"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Helper component for displaying blood glucose with color coding
export function BloodGlucoseDisplay({ 
  glucose, 
  className = "" 
}: { 
  glucose: number
  className?: string 
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Droplets className="h-4 w-4 text-red-500" />
      <span className={getBGCategoryColor(glucose)}>
        {glucose} mg/dL
      </span>
    </div>
  )
}

// Helper component for displaying insulin with proper formatting
export function InsulinDisplay({ 
  amount, 
  type, 
  className = "" 
}: { 
  amount: number
  type?: string
  className?: string 
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-blue-500">💉</span>
      <span>
        {amount}u {type ? formatInsulinType(type) : ''}
      </span>
    </div>
  )
}

// Helper component for displaying carbs
export function CarbsDisplay({ 
  carbs, 
  className = "" 
}: { 
  carbs: number
  className?: string 
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Apple className="h-4 w-4 text-green-500" />
      <span>{carbs}g carbs</span>
    </div>
  )
}

// Helper component for displaying ketones
export function KetonesDisplay({ 
  ketones, 
  className = "" 
}: { 
  ketones: number
  className?: string 
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Zap className="h-4 w-4 text-purple-500" />
      <span>{ketones} mmol/L</span>
    </div>
  )
}
