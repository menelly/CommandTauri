# 🔄 Migration Guide: Old Storage → Dexie

## Overview

This guide covers migrating existing components from the old storage systems to the new unified Dexie database.

## 🎯 **Components That Need Migration**

### ✅ **MIGRATION COMPLETE - ALL COMPONENTS MIGRATED**
- [x] **Journal System** - Updated to use Dexie with date-first storage
- [x] **Weekly Calendar** (`app/calendar/week/[week]/page.tsx`) - Migrated to Dexie
- [x] **Providers** (`app/providers/page.tsx`) - Migrated to Dexie
- [x] **Appointments** (`app/appointments/page.tsx`) - Migrated to Dexie
- [x] **Demographics** (`app/demographics/page.tsx`) - Migrated to Dexie
- [x] **Appointment Components** (`components/appointments/`) - Migrated to Dexie

### 🗑️ **Old Storage System Removed**
- [x] **Deleted** `hooks/use-storage.ts` - Old storage hook
- [x] **Deleted** `lib/storage/` directory - All old storage files removed
- [x] **Deleted** SQL.js dependencies and adapters

## 📋 **Migration Checklist**

For each component, follow these steps:

### 1. Update Imports
```typescript
// OLD
import { useDirectSQLiteStorage } from '@/lib/storage/direct-sqlite-storage';
import { useUniversalRegistry } from '@/lib/storage/universal-registry';

// NEW
import { useDailyData } from '@/lib/database';
import { CATEGORIES, SUBCATEGORIES, formatDateForStorage } from '@/lib/database';
```

### 2. Replace Storage Hook
```typescript
// OLD
const dateStorage = useDirectSQLiteStorage();
const { isInitialized } = dateStorage;

// NEW
const { 
  saveData, 
  getSpecificData, 
  getCategoryData,
  isLoading,
  error 
} = useDailyData();
```

### 3. Update Save Operations
```typescript
// OLD
await dateStorage.saveDateContent(date, 'calendar', 'monthly', content);

// NEW
await saveData(date, CATEGORIES.CALENDAR, SUBCATEGORIES.MONTHLY, content);
```

### 4. Update Load Operations
```typescript
// OLD
const content = await dateStorage.getDateContent(date, 'calendar', 'monthly');

// NEW
const record = await getSpecificData(date, CATEGORIES.CALENDAR, SUBCATEGORIES.MONTHLY);
const content = record?.content || '';
```

### 5. Update Date Formatting
```typescript
// OLD
const dateKey = date.toISOString().split('T')[0];

// NEW
const dateKey = formatDateForStorage(date);
```

## 🔧 **Specific Migration Examples**

### Calendar Components

#### Before (Old System)
```typescript
export default function MonthlyCalendar() {
  const dateStorage = useDirectSQLiteStorage();
  
  const loadCalendarContent = async (year: number, month: number) => {
    if (!dateStorage.isInitialized) return {};
    
    const content = await dateStorage.getDateContent(
      `${year}-${month + 1}-01`, 
      'calendar', 
      'monthly'
    );
    return content || '';
  };
  
  const saveCalendarContent = async (date: string, content: string) => {
    await dateStorage.saveDateContent(date, 'calendar', 'monthly', content);
  };
}
```

#### After (New System)
```typescript
import { useDailyData, CATEGORIES, SUBCATEGORIES, formatDateForStorage } from '@/lib/database';

export default function MonthlyCalendar() {
  const { saveData, getSpecificData } = useDailyData();
  
  const loadCalendarContent = async (year: number, month: number) => {
    const date = formatDateForStorage(new Date(year, month, 1));
    const record = await getSpecificData(date, CATEGORIES.CALENDAR, SUBCATEGORIES.MONTHLY);
    return record?.content || '';
  };
  
  const saveCalendarContent = async (date: string, content: string) => {
    await saveData(date, CATEGORIES.CALENDAR, SUBCATEGORIES.MONTHLY, content);
  };
}
```

### Provider Components

#### Before (Old System)
```typescript
// Providers were likely using a separate table/storage
const saveProvider = async (providerData) => {
  await storage.save('provider-info', providerData);
};
```

#### After (New System)
```typescript
// Providers now go under user category
const saveProvider = async (providerData) => {
  const today = formatDateForStorage(new Date());
  await saveData(today, CATEGORIES.USER, SUBCATEGORIES.PROVIDERS, providerData);
};

// Or for provider master list (not date-specific)
const saveProviderMaster = async (providerData) => {
  await saveData('master', CATEGORIES.USER, SUBCATEGORIES.PROVIDERS, providerData);
};
```

## 🏷️ **Category Mapping**

Map old storage locations to new categories:

| Old Location | New Category | New Subcategory |
|-------------|--------------|-----------------|
| `calendar/monthly` | `CATEGORIES.CALENDAR` | `SUBCATEGORIES.MONTHLY` |
| `calendar/weekly` | `CATEGORIES.CALENDAR` | `SUBCATEGORIES.WEEKLY` |
| `calendar/daily` | `CATEGORIES.CALENDAR` | `SUBCATEGORIES.DAILY` |
| `planning/journal` | `CATEGORIES.JOURNAL` | `SUBCATEGORIES.MAIN` |
| `health/symptoms` | `CATEGORIES.TRACKER` | `SUBCATEGORIES.SYMPTOMS` |
| `user/demographics` | `CATEGORIES.USER` | `SUBCATEGORIES.DEMOGRAPHICS` |
| `user/providers` | `CATEGORIES.USER` | `SUBCATEGORIES.PROVIDERS` |

## 🔍 **Testing Migration**

### 1. Verify Data Persistence
```typescript
// Test save and reload
await saveData('2025-06-16', 'test', 'migration', 'test data');
const result = await getSpecificData('2025-06-16', 'test', 'migration');
console.log('Persistence test:', result?.content === 'test data');
```

### 2. Check Hard Refresh
1. Save some data
2. Hard refresh browser (Ctrl+F5)
3. Verify data is still there

### 3. Verify Date Ranges
```typescript
// Test date range queries
const rangeData = await getDateRange('2025-06-01', '2025-06-30', 'calendar');
console.log('Date range test:', rangeData.length);
```

## ⚠️ **Common Pitfalls**

### 1. Async/Await Issues
```typescript
// WRONG - Missing await
const data = getSpecificData(date, category, subcategory);

// RIGHT - Proper await
const data = await getSpecificData(date, category, subcategory);
```

### 2. Date Format Consistency
```typescript
// WRONG - Inconsistent date formats
const date1 = '2025-6-16';    // Single digit month
const date2 = '2025-06-16';   // Zero-padded month

// RIGHT - Use helper function
const date = formatDateForStorage(new Date());
```

### 3. Category Constants
```typescript
// WRONG - Hardcoded strings
await saveData(date, 'journal', 'main', content);

// RIGHT - Use constants
await saveData(date, CATEGORIES.JOURNAL, SUBCATEGORIES.MAIN, content);
```

## 🚀 **Migration Priority**

Migrate in this order:

1. **Calendar Components** (most used, easiest to test)
2. **Demographics** (simple, one-time data)
3. **Providers** (reference data)
4. **Appointments** (date-based, good test case)

## 📝 **Post-Migration Cleanup**

After successful migration:

1. Remove old storage imports
2. Delete unused storage files (after confirming everything works)
3. Update any remaining references to old storage system
4. Test all functionality thoroughly
5. Update documentation

## 🆘 **Rollback Plan**

If migration fails:
1. Keep old storage files until migration is 100% confirmed
2. Use git to revert changes
3. Test old system still works
4. Debug issues before re-attempting migration
