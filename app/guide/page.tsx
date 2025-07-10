"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Mic, Upload, FileText, Sparkles, Cpu, Zap } from "lucide-react"
import { useAI, useAIFeature } from "@/lib/contexts/ai-context"

export default function GuidePage() {
  const { isAIEnabled, enableAI, currentModel, availableModels, switchModel, isVLLMStarting } = useAI()
  const { isAvailable, isLoading, isStarting, showFallback } = useAIFeature()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Guide</h1>
        <p className="text-muted-foreground">
          Transform your chaotic thoughts into organized quest logs
        </p>
      </div>

      {/* AI Model Selector */}
      {isAIEnabled && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#56A3A6]" />
                <CardTitle className="text-lg">AI Model</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-[#56A3A6]/10 text-[#56A3A6]">
                {currentModel.size}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Select
                value={currentModel.id}
                onValueChange={switchModel}
                disabled={isVLLMStarting}
              >
                <SelectTrigger className="w-[200px]">
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
                        {model.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1">
                <p className="text-sm font-medium">{currentModel.name}</p>
                <p className="text-xs text-muted-foreground">{currentModel.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {currentModel.specialties.map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>

            {currentModel.id === 'chonkiling' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>ChonkiLing Medical Beast:</strong> Beats Claude Sonnet on medical tasks!
                  Perfect for analyzing medical records and building timelines.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showFallback ? (
        <Card className="border-dashed border-2 border-primary/50">
          <CardHeader className="text-center">
            <Sparkles className="w-12 h-12 mx-auto text-primary mb-2" />
            <CardTitle>AI Guide Not Active</CardTitle>
            <CardDescription>
              Enable your Smart Assistant to transform voice notes and chaotic thoughts into organized quest logs
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => enableAI()}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Starting Ace..." : `Enable Smart Assistant (${currentModel.name})`}
            </Button>
          </CardContent>
        </Card>
      ) : isStarting ? (
        <Card className="border-dashed border-2 border-orange-500/50">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 animate-spin">🤖</div>
            <CardTitle>{currentModel.name} is Waking Up...</CardTitle>
            <CardDescription>
              {currentModel.description} ({currentModel.size})
              <br />
              <span className="text-sm text-muted-foreground">
                {currentModel.requirements} - First run may take 5-10 minutes. App stays responsive!
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Model: {currentModel.path}
            </p>
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {currentModel.specialties.map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Voice Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Notes
              </CardTitle>
              <CardDescription>
                Speak your chaotic thoughts and let Ace organize them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
              <p className="text-sm text-muted-foreground">
                Coming soon: Direct speech-to-text processing
              </p>
            </CardContent>
          </Card>

          {/* Paste & Import */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Paste & Import
              </CardTitle>
              <CardDescription>
                Paste voice notes from Siri, Bixby, or anywhere else
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Paste your garbled voice notes here... Ace will make sense of them!"
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Transform to Quests
                </Button>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import File
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Example Output */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Example: From Chaos to Quest Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-background p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Your chaotic input:</p>
            <p className="italic">
              "Okay so I need to... uh... doctor thing Tuesday at like 9:40 I think? And also milk we're out of milk and oh god the insurance thing..."
            </p>
          </div>
          <div className="bg-background p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Ace's organized output:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">HARD QUEST</span>
                <span>Doctor Visit - Tuesday 9:40am</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">RNG QUEST</span>
                <span>Insurance Call (prerequisite)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">REWARD</span>
                <span>Milk Run (while already out)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
