/**
 * MEDICATIONS PAGE
 * 
 * Main page for medication tracking functionality.
 * Simple wrapper that renders the main medication tracker component.
 */

import { Metadata } from 'next';
import { MedicationTracker } from '@/components/medications/medication-tracker';

export const metadata: Metadata = {
  title: 'Medications | Compendium',
  description: 'Track your medications, dosages, refill dates, and reminders',
};

export default function MedicationsPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          💊 Medication Tracker
        </h1>
        <p className="text-muted-foreground">
          Keep track of your medications, dosages, refill dates, and set up reminders. 
          Only a medication name is required - add as much or as little detail as you want!
        </p>
      </div>
      
      <MedicationTracker />
    </div>
  );
}
