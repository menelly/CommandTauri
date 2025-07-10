"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

// AI Model configurations
export interface AIModel {
  id: string
  name: string
  description: string
  path: string
  size: string
  specialties: string[]
  requirements: string
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'slim4b',
    name: 'Slim4b',
    description: 'Fast 4-bit quantized model for general use',
    path: 'unsloth/llava-v1.6-mistral-7b-hf-bnb-4bit',
    size: '~4GB',
    specialties: ['General AI', 'Voice Processing', 'Quick Responses'],
    requirements: '8GB RAM minimum'
  },
  {
    id: 'chonkiling',
    name: 'ChonkiLing',
    description: 'Medical specialist that rivals Claude Sonnet',
    path: './models/models-lingshu-medical-mllm-Lingshu-7B',
    size: '~7GB',
    specialties: ['Medical Analysis', 'Document Processing', 'Clinical Data'],
    requirements: '16GB RAM recommended'
  }
]

// Declare global electronAPI type
declare global {
  interface Window {
    electronAPI?: {
      startVLLM: (modelPath?: string) => Promise<{ success: boolean; message?: string; error?: string }>
      stopVLLM: () => Promise<{ success: boolean; message?: string; error?: string }>
      getVLLMStatus: () => Promise<{ running: boolean; pid?: number }>
      onVLLMReady: (callback: () => void) => void
      onVLLMStopped: (callback: () => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
}

interface AIContextType {
  isAIEnabled: boolean
  isAILoading: boolean
  isVLLMStarting: boolean
  aiError: string | null
  currentModel: AIModel
  availableModels: AIModel[]
  enableAI: (modelId?: string) => Promise<void>
  disableAI: () => void
  switchModel: (modelId: string) => Promise<void>
  checkAIStatus: () => Promise<boolean>
  checkVLLMStatus: () => Promise<boolean>
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [isAIEnabled, setIsAIEnabled] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)
  const [isVLLMStarting, setIsVLLMStarting] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [currentModel, setCurrentModel] = useState<AIModel>(AI_MODELS[0]) // Default to Slim4b
  const { toast } = useToast()

  // Check if AI auto-start is enabled and start if so
  useEffect(() => {
    const savedAutoStart = localStorage.getItem('ai-auto-start')
    const savedModelId = localStorage.getItem('ai-model')

    if (savedModelId) {
      const savedModel = AI_MODELS.find(m => m.id === savedModelId)
      if (savedModel) {
        setCurrentModel(savedModel)
      }
    }

    // Auto-start AI if user enabled auto-start preference
    if (savedAutoStart === 'true') {
      console.log('[AI] Auto-starting AI based on user preference...')
      // Use setTimeout to ensure the component is fully mounted
      setTimeout(() => {
        enableAI(savedModelId || undefined)
      }, 1000) // 1 second delay to let the app settle
    }

    // CLEANUP FUNCTION - Remove all listeners when component unmounts
    return () => {
      if (window.electronAPI) {
        console.log('[AI] Cleaning up event listeners...')
        window.electronAPI.removeAllListeners('vllm-ready')
        window.electronAPI.removeAllListeners('vllm-stopped')
      }
    }
  }, [])

  const checkAIStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/health')
      const data = await response.json()
      const aiAvailable = data.services?.ai || false
      setIsAIEnabled(aiAvailable)
      return aiAvailable
    } catch (error) {
      console.error('Failed to check AI status:', error)
      setIsAIEnabled(false)
      return false
    }
  }

  const enableAI = async (modelId?: string): Promise<void> => {
    setIsAILoading(true)
    setIsVLLMStarting(true)
    setAiError(null)

    // Set the model if specified
    const selectedModel = modelId ? AI_MODELS.find(m => m.id === modelId) || currentModel : currentModel
    setCurrentModel(selectedModel)

    try {
      // Show initial toast with model info
      toast({
        title: `🤖 Starting ${selectedModel.name}...`,
        description: `${selectedModel.description} (${selectedModel.size})`,
      })

      // First, initialize the AI processor (HTTP client)
      const initResponse = await fetch('http://localhost:5000/api/ai/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const initData = await initResponse.json()
      if (!initData.success) {
        throw new Error(initData.error || 'Failed to initialize AI processor')
      }

      // Start vLLM server if we're in Electron
      if (window.electronAPI) {
        const vllmResult = await window.electronAPI.startVLLM(selectedModel.path)
        if (!vllmResult.success) {
          throw new Error(vllmResult.error || 'Failed to start vLLM server')
        }

        toast({
          title: `🧠 Loading ${selectedModel.name}...`,
          description: `${selectedModel.requirements} - First run may take 5-10 minutes`,
        })

        // Clean up existing listeners before setting up new ones
        window.electronAPI.removeAllListeners('vllm-ready')
        window.electronAPI.removeAllListeners('vllm-stopped')

        // Set up listeners for vLLM events
        window.electronAPI.onVLLMReady(() => {
          setIsAIEnabled(true)
          setIsVLLMStarting(false)
          localStorage.setItem('ai-enabled', 'true')
          localStorage.setItem('ai-model', selectedModel.id)

          toast({
            title: `✨ ${selectedModel.name} is ready!`,
            description: `Specialties: ${selectedModel.specialties.join(', ')}`,
          })
        })

        window.electronAPI.onVLLMStopped(() => {
          setIsAIEnabled(false)
          setIsVLLMStarting(false)
        })

        // Wait for vLLM server to be ready (with timeout)
        const waitResult = await fetch('http://localhost:5000/api/ai/vllm/wait', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ max_wait_seconds: 300 }) // 5 minutes
        })

        const waitData = await waitResult.json()
        if (!waitData.success) {
          throw new Error('Timeout waiting for AI server to start')
        }

      } else {
        // Fallback for non-Electron environments
        setIsAIEnabled(true)
        localStorage.setItem('ai-enabled', 'true')
        localStorage.setItem('ai-model', selectedModel.id)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setAiError(errorMessage)
      setIsAIEnabled(false)
      setIsVLLMStarting(false)

      toast({
        title: `❌ ${selectedModel.name} startup failed`,
        description: errorMessage,
        variant: "destructive"
      })

      console.error('Failed to enable AI:', error)
    } finally {
      setIsAILoading(false)
    }
  }

  const checkVLLMStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/ai/vllm/status')
      const data = await response.json()
      return data.vllm_running || false
    } catch (error) {
      console.error('Failed to check vLLM status:', error)
      return false
    }
  }

  const switchModel = async (modelId: string): Promise<void> => {
    const newModel = AI_MODELS.find(m => m.id === modelId)
    if (!newModel) {
      throw new Error(`Model ${modelId} not found`)
    }

    if (newModel.id === currentModel.id) {
      return // Already using this model
    }

    try {
      // Show switching toast
      toast({
        title: `🔄 Switching to ${newModel.name}...`,
        description: `Stopping ${currentModel.name} and starting ${newModel.name}`,
      })

      // Stop current vLLM server
      if (window.electronAPI && isAIEnabled) {
        await window.electronAPI.stopVLLM()
        setIsAIEnabled(false)
        setIsVLLMStarting(true)

        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // Start with new model
      await enableAI(modelId)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast({
        title: "❌ Model switch failed",
        description: errorMessage,
        variant: "destructive"
      })
      console.error('Failed to switch model:', error)
    }
  }

  const disableAI = (): void => {
    setIsAIEnabled(false)
    setIsVLLMStarting(false)
    localStorage.setItem('ai-enabled', 'false')
    setAiError(null)

    // Stop vLLM server if we're in Electron
    if (window.electronAPI) {
      window.electronAPI.stopVLLM()
      window.electronAPI.removeAllListeners('vllm-ready')
      window.electronAPI.removeAllListeners('vllm-stopped')
    }
  }

  const value: AIContextType = {
    isAIEnabled,
    isAILoading,
    isVLLMStarting,
    aiError,
    currentModel,
    availableModels: AI_MODELS,
    enableAI,
    disableAI,
    switchModel,
    checkAIStatus,
    checkVLLMStatus
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI(): AIContextType {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}

// Helper hook for conditional AI features
export function useAIFeature() {
  const { isAIEnabled, isAILoading, isVLLMStarting } = useAI()

  return {
    isAvailable: isAIEnabled && !isAILoading && !isVLLMStarting,
    isLoading: isAILoading || isVLLMStarting,
    isStarting: isVLLMStarting,
    showFallback: !isAIEnabled && !isVLLMStarting
  }
}
