"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Hammer, Wrench, Cog, Plus, Sparkles, Zap, Target } from "lucide-react"

export default function ForgePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Hammer className="w-8 h-8 text-orange-500" />
          Forge
        </h1>
        <p className="text-muted-foreground">
          Build your own custom trackers and tools
        </p>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-dashed border-2 border-primary/50 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-500 rounded-full flex items-center justify-center">
            <Hammer className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">The Forge is Being Built!</CardTitle>
          <CardDescription className="text-lg">
            Soon you'll be able to create custom trackers for anything your medical team needs
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-background rounded-lg border">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold mb-1">Custom Trackers</h3>
              <p className="text-sm text-muted-foreground">
                Build trackers for your specific medical needs
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <Wrench className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold mb-1">Flexible Fields</h3>
              <p className="text-sm text-muted-foreground">
                Add any data types your doctors want to track
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold mb-1">Smart Patterns</h3>
              <p className="text-sm text-muted-foreground">
                AI will learn to spot patterns in your custom data
              </p>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-sm px-4 py-2">
            🚧 Coming after Mind module is complete
          </Badge>
        </CardContent>
      </Card>

      {/* Preview of What's Coming */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Custom Tracker Builder
            </CardTitle>
            <CardDescription>
              Create trackers for anything your medical team needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded animate-pulse"></div>
              <div className="h-8 bg-muted rounded animate-pulse"></div>
              <div className="h-8 bg-muted rounded animate-pulse"></div>
            </div>
            <Button className="w-full" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Create New Tracker
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cog className="w-5 h-5" />
              Field Types
            </CardTitle>
            <CardDescription>
              Choose from many data types for your custom fields
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline">📊 Numbers</Badge>
              <Badge variant="outline">📝 Text</Badge>
              <Badge variant="outline">📅 Dates</Badge>
              <Badge variant="outline">⏰ Times</Badge>
              <Badge variant="outline">🎯 Scales</Badge>
              <Badge variant="outline">✅ Yes/No</Badge>
              <Badge variant="outline">🏷️ Tags</Badge>
              <Badge variant="outline">📷 Photos</Badge>
            </div>
            <Button className="w-full" disabled>
              <Wrench className="w-4 h-4 mr-2" />
              Configure Fields
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Example Use Cases */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Example: What You'll Be Able to Build</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-background p-4 rounded-lg border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Oncology Lab Tracker
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                For Stacey's specific lab values her oncologist wants to monitor
              </p>
              <div className="space-y-1 text-xs">
                <div>• White Blood Cell Count</div>
                <div>• Platelet Count</div>
                <div>• Hemoglobin Levels</div>
                <div>• Custom markers her doctor specified</div>
              </div>
            </div>
            
            <div className="bg-background p-4 rounded-lg border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Pediatric Tracker
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                For parents tracking their child's specific needs
              </p>
              <div className="space-y-1 text-xs">
                <div>• Growth measurements</div>
                <div>• Developmental milestones</div>
                <div>• Medication responses</div>
                <div>• Behavioral patterns</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why This Matters */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="text-lg">Why Custom Trackers Matter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Every medical condition is different. Every doctor has different priorities. 
            Instead of trying to guess what everyone needs, the Forge will let YOU build 
            exactly what YOUR medical team wants to track. Whether it's rare lab values, 
            specific symptoms, or unique measurements - you'll be able to create trackers 
            that fit your exact situation.
          </p>
        </CardContent>
      </Card>

      {/* Back to Choice */}
      <div className="text-center">
        <Button variant="outline" onClick={() => window.location.href = '/choice'}>
          Back to Choice
        </Button>
      </div>
    </div>
  )
}
