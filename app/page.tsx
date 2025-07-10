"use client"

import AppCanvas from "@/components/app-canvas"
import CommandZone from "@/modules/life-management/zone/command-zone-v2"

export default function HomePage() {
  return (
    <AppCanvas currentPage="command-zone">
      <CommandZone />
    </AppCanvas>
  )
}
