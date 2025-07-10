/**
 * AI service using Tauri Rust backend with Candle
 * Works on both desktop and mobile platforms
 */

import { invoke } from '@tauri-apps/api/core'

// Types that match the Rust backend
export interface ConversationContext {
  user_message: string
  conversation_history?: Array<{role: 'user' | 'assistant', content: string}>
  current_time?: string
  user_state?: 'struggling' | 'neutral' | 'celebrating' | 'crisis'
  detected_triggers?: string[]
  app_context?: {
    current_page?: string
    recent_data?: any
    patterns_detected?: string[]
  }
}

export interface AddyResponse {
  message: string
  safety_level: 'safe' | 'concern' | 'intervention' | 'emergency'
  suggested_actions?: string[]
  resources?: string[]
  follow_up_needed?: boolean
  tone: 'supportive' | 'gentle_firm' | 'celebratory' | 'protective'
}

class TauriAIClient {
  private isLoading = false
  private isInitialized = false

  constructor() {
    // Don't auto-initialize - wait for browser environment
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized || this.isLoading) {
      return this.isInitialized
    }

    this.isLoading = true
    console.log('🤖 Initializing Addy AI (Tauri + Candle + Rust)...')

    try {
      // Call Rust backend to initialize AI
      console.log('🧠 Loading Gemma model in Rust backend...')
      const success = await invoke<boolean>('initialize_ai')

      this.isInitialized = success
      if (success) {
        console.log('✅ Addy AI initialized successfully with Rust + Candle!')
      } else {
        console.error('❌ Failed to initialize AI in Rust backend')
      }
      return success
    } catch (error) {
      console.error('❌ Failed to initialize Addy AI:', error)
      this.isInitialized = false
      return false
    } finally {
      this.isLoading = false
    }
  }

  async generateResponse(context: ConversationContext): Promise<AddyResponse> {
    // Ensure AI is initialized
    if (!this.isInitialized) {
      const success = await this.initialize()
      if (!success) {
        throw new Error('AI model not available')
      }
    }

    try {
      // Call Rust backend to generate response
      // The Rust backend has the personality engine built-in
      const response = await invoke<AddyResponse>('generate_ai_response', {
        context
      })

      return response
    } catch (error) {
      console.error('Error generating AI response:', error)
      throw error
    }
  }

  async isReady(): Promise<boolean> {
    try {
      return await invoke<boolean>('is_ai_ready')
    } catch {
      return false
    }
  }

  isLoadingModel(): boolean {
    return this.isLoading
  }

  async dispose(): Promise<void> {
    // Nothing to clean up on the frontend - Rust handles everything
    this.isInitialized = false
  }
}

// Export singleton instance
export const addyAI = new TauriAIClient()
export default addyAI
