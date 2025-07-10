"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Palette } from "lucide-react"
import { useGoblinMode } from "@/lib/goblin-mode-context"

interface VisualSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VisualSettingsModal({ isOpen, onClose }: VisualSettingsModalProps) {
  const [currentTheme, setCurrentTheme] = useState('theme-lavender')
  const [currentFont, setCurrentFont] = useState('font-atkinson')
  const { goblinMode, setGoblinMode } = useGoblinMode()

  const themes = [
    { id: 'theme-lavender', name: 'Lavender Garden', description: 'Gentle lavender serenity (default)' },
    { id: 'theme-chaos', name: 'Chaos Vortex', description: 'Purple chaos energy' },
    { id: 'theme-light', name: 'Light Mode', description: 'Clean and bright' },
    { id: 'theme-colorblind', name: 'Colorblind Friendly', description: 'High contrast accessibility' },
    { id: 'theme-glitter', name: 'Glitter Mode', description: 'Sparkly pink dreams' },
    { id: 'theme-calm', name: 'Calm Mode', description: 'Blue and gold serenity' },
    { id: 'theme-accessibility', name: 'Accessibility', description: 'Maximum contrast and large text' },
    { id: 'theme-storm', name: 'Storm Mode', description: 'Dark storm energy' }
  ]

  const fonts = [
    { id: 'font-atkinson', name: 'Atkinson Hyperlegible', description: 'Designed for low vision accessibility' },
    { id: 'font-poppins', name: 'Poppins', description: 'Modern and friendly' },
    { id: 'font-lexend', name: 'Lexend', description: 'Optimized for reading proficiency' },
    { id: 'font-system', name: 'System Font', description: 'Your device default' }
  ]

  const applyTheme = (themeId: string) => {
    // Remove all theme classes
    themes.forEach(theme => document.body.classList.remove(theme.id))
    // Add new theme class (lavender is default, no class needed)
    if (themeId !== 'theme-lavender') {
      document.body.classList.add(themeId)
    }
    setCurrentTheme(themeId)
    localStorage.setItem('chaos-theme', themeId)
  }

  const applyFont = (fontId: string) => {
    // Remove all font classes
    fonts.forEach(font => document.body.classList.remove(font.id))
    // Add new font class
    document.body.classList.add(fontId)
    setCurrentFont(fontId)
    localStorage.setItem('chaos-font', fontId)
  }

  // Load saved theme and font on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('chaos-theme') || 'theme-lavender'
    const savedFont = localStorage.getItem('chaos-font') || 'font-atkinson'

    setCurrentTheme(savedTheme)
    setCurrentFont(savedFont)

    // Apply saved theme
    themes.forEach(theme => document.body.classList.remove(theme.id))
    if (savedTheme !== 'theme-lavender') {
      document.body.classList.add(savedTheme)
    }

    // Apply saved font
    fonts.forEach(font => document.body.classList.remove(font.id))
    document.body.classList.add(savedFont)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Visual Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Theme</Label>
            <Select value={currentTheme} onValueChange={applyTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <div>
                      <div className="font-medium">{theme.name}</div>
                      <div className="text-xs text-muted-foreground">{theme.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Font Family</Label>
            <Select value={currentFont} onValueChange={applyFont}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font.id} value={font.id}>
                    <div>
                      <div className="font-medium">{font.name}</div>
                      <div className="text-xs text-muted-foreground">{font.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Goblin Mode Toggle */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Language Style</Label>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">
                  {goblinMode ? '🧙‍♂️ Goblin Mode' : '👩‍⚕️ Professional Mode'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {goblinMode
                    ? 'Chaotic humor and slam poetry descriptions'
                    : 'Clinical terminology suitable for medical professionals'
                  }
                </div>
              </div>
              <Switch
                checked={goblinMode}
                onCheckedChange={setGoblinMode}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
