/**
 * DATABASE EXPORTS
 *
 * Central export file for all database functionality.
 * 🎯 BACK TO DEXIE: WatermelonDB was causing too many issues!
 */

// Dexie (primary database) - RESTORED!
export { useDailyData } from './hooks/use-daily-data';
export { db } from './dexie-db';

// Re-export common constants and utilities
export { CATEGORIES, SUBCATEGORIES, formatDateForStorage, getCurrentTimestamp } from './dexie-db';

// Re-export types
export type { UserTag, DailyDataRecord, ImageBlob } from './dexie-db';


