"use client"

import AppCanvas from "@/components/app-canvas"
import TrackerBuilder from "@/components/forge/tracker-builder"

export default function ForgePage() {
  return (
    <AppCanvas currentPage="forge">
      <TrackerBuilder />
    </AppCanvas>
  )
}
