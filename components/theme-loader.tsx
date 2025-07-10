"use client"

import { useEffect, useState } from "react"

export default function ThemeLoader() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load saved theme and font from localStorage
    const savedTheme = localStorage.getItem('chaos-theme') || 'theme-lavender'
    const savedFont = localStorage.getItem('chaos-font') || 'font-atkinson'

    // Available themes and fonts
    const themes = [
      'theme-lavender', 'theme-chaos', 'theme-light', 'theme-colorblind',
      'theme-glitter', 'theme-calm', 'theme-accessibility', 'theme-storm'
    ]
    const fonts = ['font-atkinson', 'font-poppins', 'font-lexend', 'font-system']

    // Remove all theme classes first
    themes.forEach(theme => document.body.classList.remove(theme))

    // Apply saved theme (lavender is default, no class needed)
    if (savedTheme !== 'theme-lavender') {
      document.body.classList.add(savedTheme)
    }

    // Remove all font classes first
    fonts.forEach(font => document.body.classList.remove(font))

    // Apply saved font
    document.body.classList.add(savedFont)

    console.log(`🎨 Theme loaded: ${savedTheme}`)
    console.log(`🔤 Font loaded: ${savedFont}`)

    setIsLoaded(true);
  }, [])

  // Don't render anything until theme is loaded to prevent hydration mismatch
  if (!isLoaded) {
    return null;
  }

  return null // This component doesn't render anything
}
