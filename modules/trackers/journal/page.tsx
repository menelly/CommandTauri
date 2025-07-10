"use client"

import AppCanvas from "@/components/app-canvas"
import UnifiedJournal from "@/components/journal/unified-journal"

export default function JournalPage() {
  return (
    <AppCanvas currentPage="journal">
      <UnifiedJournal />
    </AppCanvas>
  )
}
