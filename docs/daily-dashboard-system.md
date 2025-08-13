# 📊 Daily Dashboard System

## Overview

The Daily Dashboard is a customizable daily view that aggregates widgets from all your trackers. Users can toggle individual tracker widgets on/off directly from each tracker page, making it contextual and easy to manage.

## How It Works

### For Users
1. **Navigate to any tracker** (e.g., Physical Health → Medications)
2. **Look for the + button** in the top-right corner of each tracker card
3. **Click to add/remove** that tracker's widget from your daily dashboard
4. **Visit daily dashboard** via calendar day links to see your personalized view

### For Developers
1. **Add the toggle component** to any tracker page
2. **Create the widget component** for the daily dashboard
3. **Register the widget** in the daily dashboard's available widgets list

## Implementation

### Adding Toggle to Tracker Pages

```tsx
import DailyDashboardToggle from "@/components/daily-dashboard-toggle"

// In your tracker card header:
<div className="flex items-center gap-1">
  <DailyDashboardToggle
    trackerId="medications"
    trackerName="Medications"
    description="Quick medication logging"
    variant="compact" // or "button" or "switch"
  />
  {/* other header buttons */}
</div>
```

### Creating Dashboard Widgets

Add your widget to `app/calendar/day/[date]/page.tsx`:

```tsx
// In the availableWidgets array:
{
  id: 'medications',
  name: 'Quick Add Medication',
  component: (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">💊 Quick Add Medication</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Your widget content here */}
        <Button size="sm" onClick={handleQuickAdd}>
          Add Medication
        </Button>
      </CardContent>
    </Card>
  ),
  enabled: enabledWidgets.includes('medications'),
  category: 'health'
}
```

## Widget Categories

- **health**: Medical tracking widgets
- **planning**: Task and calendar widgets  
- **wellness**: Self-care and mental health widgets
- **fun**: Motivation and companion widgets

## Toggle Variants

### Compact (Default)
- Small + button in tracker headers
- Minimal space usage
- Perfect for tracker cards

### Button
- Larger "Add to Daily" button
- More prominent call-to-action
- Good for main tracker pages

### Switch
- Toggle switch with label
- Clean settings-style interface
- Good for preference pages

## Storage

Settings are stored in `localStorage` as:
```json
{
  "daily-dashboard-widgets": ["survival-button", "medications", "mood-tracker"]
}
```

## Navigation

Daily dashboard is accessible via:
- **Calendar day clicks**: `/calendar/day/2024-12-15`
- **Weekly view day numbers**: Click any day number
- **Monthly view day numbers**: Click any day number

## Future Enhancements

- [ ] Widget ordering/drag-and-drop
- [ ] Widget size preferences (small/medium/large)
- [ ] Category-based organization
- [ ] Quick widget search/filter
- [ ] Export daily dashboard as image
- [ ] Multiple dashboard layouts (morning/evening)

## Benefits

✅ **Contextual**: Toggle widgets where you use them  
✅ **Scalable**: Works with 50+ trackers without UI bloat  
✅ **Discoverable**: Users naturally find toggles while exploring  
✅ **Flexible**: Multiple toggle styles for different contexts  
✅ **Persistent**: Settings saved across sessions  
✅ **Incremental**: Dashboard grows as trackers are built  

## Example Usage

```tsx
// Physical Health tracker page
<DailyDashboardToggle
  trackerId="pain-tracker"
  trackerName="Pain Tracking"
  description="Quick pain level logging"
  variant="compact"
/>

// Mental Health main page  
<DailyDashboardToggle
  trackerId="mood-check"
  trackerName="Mood Check-in"
  description="Daily mood and energy tracking"
  variant="button"
/>

// Settings page
<DailyDashboardToggle
  trackerId="affirmations"
  trackerName="Daily Affirmations"
  description="Personalized daily affirmations"
  variant="switch"
/>
```

This system makes the daily dashboard feel organic and user-controlled rather than overwhelming with options!
