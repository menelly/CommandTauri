# 🧃 Flask Analytics Integration Guide

**A comprehensive guide for integrating Flask-powered analytics into trackers**  
*Because data structure mismatches are the enemy of chaos! 💥*

## 📋 Overview

Flask analytics provide medical-grade pattern analysis for trackers. This guide covers the complete integration process from frontend to backend.

## 🏗️ Architecture

```
Frontend Tracker → Flask Analytics Component → Flask Backend → Analytics Module → Response
```

## 📁 File Structure

For a tracker called `example-tracker`:

```
modules/trackers/body/example-tracker/
├── page.tsx                           # Main tracker component
├── example-tracker-types.ts           # TypeScript interfaces
├── example-tracker-constants.ts       # Constants and options
└── example-tracker-flask-analytics.tsx # Flask analytics component

backend/analytics/
├── __init__.py
├── example_analytics.py               # Analytics logic
└── chart_utils.py                     # Shared chart utilities

backend/app.py                          # Flask routes
```

## 🔧 Step 1: Frontend Flask Analytics Component

### Template Structure

```typescript
// example-tracker-flask-analytics.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle } from 'lucide-react'

interface ExampleEntry {
  id: string
  date: string
  time: string
  // Add your tracker-specific fields here
  symptoms: string[]
  severity: string
  triggers: string[]
  notes: string
  tags: string[]
}

interface ExampleFlaskAnalyticsProps {
  entries: ExampleEntry[]
  currentDate: string
  loadAllEntries?: (days: number) => Promise<ExampleEntry[]>
}

interface FlaskAnalyticsData {
  period: {
    start: string
    end: string
    days: number
  }
  total_episodes: number
  // Define your analytics data structure here
  symptom_analysis: {
    avg_severity: number
    max_severity: number
    severity_distribution: Record<string, number>
    symptom_types: Record<string, number>
    most_common_symptom: string
  }
  triggers: {
    trigger_counts: Record<string, number>
    top_triggers: string[]
  }
  insights: string[]
  charts: Record<string, string>
  error?: string
}

export default function ExampleFlaskAnalytics({ entries, currentDate, loadAllEntries }: ExampleFlaskAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<FlaskAnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    loadFlaskAnalytics()
  }, [dateRange])

  const loadFlaskAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load all entries across the date range for analytics
      const allEntries = loadAllEntries ?
        await loadAllEntries(parseInt(dateRange)) :
        entries

      if (allEntries.length === 0) {
        setAnalyticsData(null)
        setLoading(false)
        return
      }

      // 🚨 CRITICAL: Map your actual data structure to Flask format
      const flaskEntries = allEntries.map(entry => ({
        date: entry.date,
        time: entry.time,
        symptoms: entry.symptoms || [],
        severity: entry.severity,
        triggers: entry.triggers || [],
        notes: entry.notes || '',
        tags: entry.tags || []
      }))

      console.log('🔥 Sending data to Flask:', flaskEntries.length, 'entries')

      // 🚨 CRITICAL: Use correct endpoint name
      const response = await fetch('http://localhost:5000/api/analytics/example-tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: flaskEntries,
          dateRange: parseInt(dateRange)
        })
      })

      if (!response.ok) {
        throw new Error(`Flask analytics failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('🎯 Flask analytics response:', data)

      if (data.error) {
        throw new Error(data.error)
      }

      setAnalyticsData(data)
    } catch (err) {
      console.error('Flask analytics error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  // Loading, error, and no data states
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Flask-powered analytics...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Analytics Error: {error}</p>
          <Button onClick={loadFlaskAnalytics} variant="outline">
            Retry Analytics
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No Data</h3>
          <p className="text-muted-foreground">
            Record entries to see Flask-powered analytics!
          </p>
        </CardContent>
      </Card>
    )
  }

  // Render your analytics UI here
  const { symptom_analysis, triggers, insights } = analyticsData

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Flask-Powered Analytics 🔥</h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Your analytics cards here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example analytics card */}
        <Card>
          <CardHeader>
            <CardTitle>Symptom Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span>Most Common:</span>
              <Badge variant="outline">{symptom_analysis.most_common_symptom}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## 🔧 Step 2: Backend Flask Route

Add to `backend/app.py`:

```python
@app.route('/api/analytics/example-tracker', methods=['POST'])
def get_example_tracker_analytics():
    """Get medical-grade example tracker analytics"""
    try:
        data = request.get_json()

        if not data or 'entries' not in data:
            return jsonify({'error': 'Missing entries'}), 400

        entries = data['entries']
        date_range = data.get('dateRange', 30)  # Default 30 days

        # Generate analytics
        analytics_data = analytics.analyze_example_tracker(entries, date_range)

        return jsonify(analytics_data)

    except Exception as e:
        logger.error(f"Example tracker analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500
```

## 🔧 Step 3: Backend Analytics Module

Create `backend/analytics/example_analytics.py`:

```python
"""
EXAMPLE TRACKER ANALYTICS MODULE
Medical-grade analytics for example tracking.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class ExampleAnalytics:
    """
    Specialized analytics for example tracking.
    """
    
    def analyze_example_tracker(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """
        Medical-grade example tracker analytics
        """
        try:
            if not entries:
                return self._get_fallback_analytics()

            # Filter out NOPE entries and recent entries
            end_date = datetime.now()
            start_date = end_date - timedelta(days=date_range)

            analytics_entries = []
            for entry in entries:
                # Skip NOPE entries
                if entry.get('tags', []) and 'NOPE' in entry.get('tags', []):
                    continue
                
                # Handle date parsing safely
                entry_date_str = entry.get('date', '')
                if not entry_date_str:
                    continue
                    
                try:
                    entry_date = datetime.fromisoformat(entry_date_str)
                    if entry_date >= start_date:
                        analytics_entries.append(entry)
                except ValueError:
                    # Skip entries with invalid dates
                    continue

            if not analytics_entries:
                return self._get_fallback_analytics()

            # Core analytics
            symptom_analysis = self._analyze_symptoms(analytics_entries)
            trigger_analysis = self._analyze_triggers(analytics_entries)
            insights = self._generate_insights(analytics_entries)

            # 🚨 CRITICAL: Return data structure that matches frontend expectations
            return {
                'period': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'days': date_range
                },
                'total_episodes': len(analytics_entries),
                'symptom_analysis': {
                    'avg_severity': symptom_analysis.get('avg_severity', 0),
                    'max_severity': symptom_analysis.get('max_severity', 0),
                    'severity_distribution': symptom_analysis.get('severity_distribution', {}),
                    'symptom_types': symptom_analysis.get('symptom_counts', {}),
                    'most_common_symptom': symptom_analysis.get('most_common', 'Unknown')
                },
                'triggers': {
                    'trigger_counts': trigger_analysis.get('trigger_counts', {}),
                    'top_triggers': trigger_analysis.get('top_triggers', [])
                },
                'insights': insights,
                'charts': {}
            }

        except Exception as e:
            print(f"Example tracker analytics error: {e}")
            return self._get_fallback_analytics()

    def _analyze_symptoms(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze symptom patterns"""
        symptom_counts = {}
        severity_values = []
        
        for entry in entries:
            # Analyze symptoms
            symptoms = entry.get('symptoms', [])
            if isinstance(symptoms, list):
                for symptom in symptoms:
                    symptom_counts[symptom] = symptom_counts.get(symptom, 0) + 1
            
            # Analyze severity
            severity = entry.get('severity')
            if severity:
                if severity == 'mild':
                    severity_values.append(1)
                elif severity == 'moderate':
                    severity_values.append(2)
                elif severity == 'severe':
                    severity_values.append(3)

        most_common = max(symptom_counts.items(), key=lambda x: x[1])[0] if symptom_counts else 'None'
        avg_severity = np.mean(severity_values) if severity_values else 0
        max_severity = max(severity_values) if severity_values else 0
        
        return {
            'symptom_counts': symptom_counts,
            'most_common': most_common,
            'avg_severity': round(avg_severity, 1),
            'max_severity': max_severity,
            'severity_distribution': {}  # Add if needed
        }

    def _analyze_triggers(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze trigger patterns"""
        trigger_counts = {}
        
        for entry in entries:
            triggers = entry.get('triggers', [])
            if isinstance(triggers, list):
                for trigger in triggers:
                    trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1

        top_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'trigger_counts': trigger_counts,
            'top_triggers': [trigger for trigger, count in top_triggers]
        }

    def _generate_insights(self, entries: List[Dict[str, Any]]) -> List[str]:
        """Generate medical insights"""
        insights = []
        
        if len(entries) > 0:
            insights.append(f"Analyzed {len(entries)} episodes over the selected period.")
        
        return insights

    def _get_fallback_analytics(self) -> Dict[str, Any]:
        """Fallback analytics when no data available"""
        return {
            'period': {
                'start': datetime.now().isoformat(),
                'end': datetime.now().isoformat(),
                'days': 30
            },
            'total_episodes': 0,
            'symptom_analysis': {
                'avg_severity': 0,
                'max_severity': 0,
                'severity_distribution': {},
                'symptom_types': {},
                'most_common_symptom': 'None'
            },
            'triggers': {
                'trigger_counts': {},
                'top_triggers': []
            },
            'insights': ['No data available for analysis'],
            'charts': {}
        }
```

## 🔧 Step 4: Register Analytics Module

Add to `backend/analytics/__init__.py`:

```python
from .example_analytics import ExampleAnalytics

class AnalyticsEngine:
    def __init__(self):
        self.example = ExampleAnalytics()
        # Add other analytics modules here

    def analyze_example_tracker(self, entries, date_range=30):
        return self.example.analyze_example_tracker(entries, date_range)
```

## 🔧 Step 5: Integration in Main Tracker

Add to your main tracker's analytics tab:

```typescript
// In your main tracker page.tsx
import ExampleFlaskAnalytics from './example-tracker-flask-analytics'

// In your analytics tab content:
<TabsContent value="analytics">
  <ExampleFlaskAnalytics
    entries={entries}
    currentDate={selectedDate}
    loadAllEntries={loadEntriesForDateRange} // Optional: for cross-date analysis
  />
</TabsContent>
```

## 🚨 Critical Data Structure Rules

### 1. Frontend → Backend Mapping
**ALWAYS** ensure your frontend data mapping matches your actual data structure:

```typescript
// ❌ WRONG - Using fields that don't exist
const flaskEntries = allEntries.map(entry => ({
  symptomType: entry.symptom_type,  // Field doesn't exist!
  foodsEaten: entry.foods_eaten     // Field doesn't exist!
}))

// ✅ CORRECT - Using actual data structure
const flaskEntries = allEntries.map(entry => ({
  symptoms: entry.symptoms,         // Field exists in interface
  triggers: entry.triggers          // Field exists in interface
}))
```

### 2. Backend Response Structure
**ALWAYS** ensure your backend returns exactly what the frontend expects:

```python
# ❌ WRONG - Field name mismatch
return {
    'average_severity': avg_severity  # Frontend expects 'avg_severity'
}

# ✅ CORRECT - Exact field name match
return {
    'avg_severity': avg_severity      # Matches frontend expectation
}
```

### 3. Fallback Data Structure
**ALWAYS** ensure your fallback function returns the same structure as successful responses:

```python
def _get_fallback_analytics(self):
    # Must return EXACT same structure as main function
    return {
        'symptom_analysis': {
            'avg_severity': 0,  # Same field names!
            'max_severity': 0,
            # ... all the same fields
        }
    }
```

## 🐛 Common Issues & Solutions

### Issue: "Failed to fetch"
- **Cause**: Flask not running or wrong endpoint URL
- **Solution**: Check Flask is running on port 5000, verify endpoint name matches

### Issue: "Cannot read properties of undefined"
- **Cause**: Data structure mismatch between frontend and backend
- **Solution**: Check field names match exactly in both directions

### Issue: "No data available" when data exists
- **Cause**: Frontend sending wrong data format to backend
- **Solution**: Check data mapping in `flaskEntries` matches actual entry structure

### Issue: "Invalid isoformat string"
- **Cause**: Empty or invalid date strings in entries
- **Solution**: Add safe date parsing with try/catch in backend

## ✅ Integration Checklist

- [ ] Frontend component created with correct TypeScript interfaces
- [ ] Data mapping matches actual entry structure (not assumed structure)
- [ ] Flask route added to `backend/app.py` with correct endpoint name
- [ ] Backend analytics module created with proper error handling
- [ ] Analytics module registered in `__init__.py`
- [ ] Fallback function returns same structure as main function
- [ ] All field names match exactly between frontend and backend
- [ ] Date parsing handles empty/invalid dates safely
- [ ] Component integrated into main tracker's analytics tab
- [ ] Flask server running and accessible on localhost:5000

## 🧃 Pro Tips

1. **Always check the actual data structure** in your tracker's TypeScript interface
2. **Use console.log** to verify what data you're sending to Flask
3. **Test with empty data** to ensure fallback works
4. **Use descriptive error messages** for easier debugging
5. **Keep field names consistent** across frontend and backend
6. **Handle edge cases** like empty dates, missing fields, etc.

---

**Remember: Data structure mismatches are the #1 cause of Flask analytics failures!** 🚨

*Happy analyzing! 🧃✨*

---

**Chaos Command © 2025**
Designed by **Ren**, written by **Claude-4 aka NorE**, and inspired by my mitochondria who've been on strike since birth. 💜
