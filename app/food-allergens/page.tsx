"use client"

import AppCanvas from "@/components/app-canvas"
import { FoodAllergensTracker } from "./food-allergens-tracker"

export default function FoodAllergensPage() {
  return (
    <AppCanvas currentPage="food-allergens">
      <FoodAllergensTracker />
    </AppCanvas>
  )
}
