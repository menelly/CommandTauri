"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bot, Zap, Cpu, Settings2, Power, PowerOff } from "lucide-react"
import { useAI } from "@/lib/contexts/ai-context"

interface AISettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const { 
    isAIEnabled, 
    currentModel, 
    availableModels, 
    enableAI, 
    disableAI, 
    switchModel,
    isVLLMStarting 
  } = useAI()
  
  const [autoStartEnabled, setAutoStartEnabled] = useState(false)
  const [preferredModel, setPreferredModel] = useState(currentModel.id)

  // Load settings on mount
  useEffect(() => {
    const savedAutoStart = localStorage.getItem('ai-auto-start')
    const savedModel = localStorage.getItem('ai-model')
    
    setAutoStartEnabled(savedAutoStart === 'true')
    if (savedModel) {
      setPreferredModel(savedModel)
    }
  }, [])

  const handleAutoStartToggle = (enabled: boolean) => {
    setAutoStartEnabled(enabled)
    localStorage.setItem('ai-auto-start', enabled.toString())
    
    if (enabled) {
      // If enabling auto-start and AI isn't currently running, start it
      if (!isAIEnabled && !isVLLMStarting) {
        enableAI(preferredModel)
      }
    }
  }

  const handleModelChange = (modelId: string) => {
    setPreferredModel(modelId)
    localStorage.setItem('ai-model', modelId)
    
    // If AI is currently running and auto-start is enabled, switch to the new model
    if (isAIEnabled && autoStartEnabled) {
      switchModel(modelId)
    }
  }

  const handleManualToggle = () => {
    if (isAIEnabled) {
      disableAI()
    } else {
      enableAI(preferredModel)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Smart Assistant Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Status */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                <Label className="text-sm font-medium">Current Status</Label>
              </div>
              <Badge variant={isAIEnabled ? "default" : "secondary"}>
                {isVLLMStarting ? "Starting..." : isAIEnabled ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            {isAIEnabled && (
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>{currentModel.name}</strong> is ready to help!
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentModel.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {isVLLMStarting && (
              <p className="text-sm text-muted-foreground">
                {currentModel.name} is waking up... This may take a few minutes on first run.
              </p>
            )}
            
            {!isAIEnabled && !isVLLMStarting && (
              <p className="text-sm text-muted-foreground">
                Your Smart Assistant is currently sleeping.
              </p>
            )}
          </div>

          {/* Auto-Start Setting */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Power className="h-4 w-4" />
                <Label className="text-sm font-medium">Auto-Start on App Launch</Label>
              </div>
              <Switch
                checked={autoStartEnabled}
                onCheckedChange={handleAutoStartToggle}
                disabled={isVLLMStarting}
              />
            </div>
            
            <p className="text-sm text-muted-foreground">
              {autoStartEnabled 
                ? "Your Smart Assistant will automatically start when you open the app. No more manual button clicking!" 
                : "You'll need to manually start your Smart Assistant each time you open the app."
              }
            </p>
            
            {autoStartEnabled && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  ✨ <strong>Gremlin Mode Activated!</strong> Your AI buddy will be ready when you are.
                </p>
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="h-4 w-4" />
              <Label className="text-sm font-medium">Preferred Model</Label>
            </div>
            
            <Select
              value={preferredModel}
              onValueChange={handleModelChange}
              disabled={isVLLMStarting}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      {model.id === 'chonkiling' ? (
                        <Zap className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <Cpu className="w-4 h-4 text-blue-500" />
                      )}
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.size}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-3">
              {availableModels.find(m => m.id === preferredModel) && (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>{availableModels.find(m => m.id === preferredModel)?.name}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {availableModels.find(m => m.id === preferredModel)?.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {availableModels.find(m => m.id === preferredModel)?.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Manual Control */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <PowerOff className="h-4 w-4" />
              <Label className="text-sm font-medium">Manual Control</Label>
            </div>
            
            <Button
              onClick={handleManualToggle}
              disabled={isVLLMStarting}
              className={`w-full ${isAIEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isVLLMStarting ? (
                "Starting..."
              ) : isAIEnabled ? (
                <>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Stop Smart Assistant
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Start Smart Assistant
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Override auto-start settings and manually control your AI buddy
            </p>
          </div>

          {/* Meet Your AI Buddies */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4" />
              <Label className="text-sm font-medium">Meet Your AI Buddies</Label>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-background rounded border">
                <Cpu className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">🧃 Addy (Slim4b)</p>
                  <p className="text-xs text-muted-foreground">
                    Femme-coded ADHD chaos coach. Fast, enthusiastic, occasionally forgets her point but circles back with sparkles.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-background rounded border">
                <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">🧠 Nam (ChonkiLing)</p>
                  <p className="text-xs text-muted-foreground">
                    Masc-ish autistic medical beast. Methodical, precise, beats Claude Sonnet on medical tasks. Perfect for analyzing records.
                  </p>
                </div>
              </div>
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
