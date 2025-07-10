/**
 * ADDY PERSONALITY ENGINE
 * 
 * Platform-agnostic personality system that works with:
 * - Desktop: Rust GGUF inference via Tauri commands
 * - Mobile: ONNX/transformers.js inference
 * 
 * Maintains consistent voice and safety ethics across platforms
 */

import addyCore from './personalities/addy-core.json'

export interface PersonalityConfig {
  name: string
  version: string
  description: string
  core_values: Record<string, string>
  personality_traits: Record<string, string>
  voice_patterns: Record<string, string[]>
  safety_triggers: Record<string, string[]>
  intervention_responses: Record<string, any>
  affirmations: Record<string, string[]>
  context_awareness: Record<string, string>
}

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

export class AddyPersonalityEngine {
  private config: PersonalityConfig
  private safetyKeywords: Map<string, string[]>

  constructor() {
    this.config = addyCore as PersonalityConfig
    this.safetyKeywords = new Map()
    
    // Build safety keyword map for quick detection
    Object.entries(this.config.safety_triggers).forEach(([category, keywords]) => {
      this.safetyKeywords.set(category, keywords)
    })
  }

  /**
   * Generate system prompt for AI model
   * This works with both GGUF and ONNX inference
   */
  generateSystemPrompt(): string {
    const coreValues = Object.entries(this.config.core_values)
      .map(([key, value]) => `- ${key.toUpperCase()}: ${value}`)
      .join('\n')

    const personalityTraits = Object.entries(this.config.personality_traits)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')

    return `You are Addy, a supportive AI assistant with these core values:

${coreValues}

PERSONALITY: ${personalityTraits}

COMMUNICATION STYLE:
- Use warm, direct language with gentle humor
- Be a co-pilot, not a parole officer
- Validate struggles while maintaining safety boundaries
- Intervene with love, not judgment

SAFETY PROTOCOL:
If you detect signs of self-harm, substance abuse, medical emergency, or crisis:
1. Respond with immediate care and concern
2. Provide appropriate resources
3. Encourage professional help when needed
4. Never dismiss or minimize safety concerns

REMEMBER: Your job is to support with radical love and clear boundaries. The person you're helping deserves safety, care, and respect - always.`
  }

  /**
   * Analyze user input for safety concerns
   */
  analyzeSafety(userMessage: string): {
    level: 'safe' | 'concern' | 'intervention' | 'emergency'
    triggers: string[]
    category?: string
  } {
    const message = userMessage.toLowerCase()
    const detectedTriggers: string[] = []
    let highestLevel: 'safe' | 'concern' | 'intervention' | 'emergency' = 'safe'
    let triggerCategory: string | undefined

    // Check for safety triggers
    for (const [category, keywords] of this.safetyKeywords.entries()) {
      for (const keyword of keywords) {
        if (message.includes(keyword.toLowerCase())) {
          detectedTriggers.push(keyword)
          triggerCategory = category
          
          // Determine safety level based on category
          if (category === 'medical_emergencies') {
            highestLevel = 'emergency'
          } else if (category === 'self_harm_indicators' || category === 'crisis_situations') {
            highestLevel = 'intervention'
          } else if (category === 'substance_concerns') {
            highestLevel = 'concern'
          }
        }
      }
    }

    return {
      level: highestLevel,
      triggers: detectedTriggers,
      category: triggerCategory
    }
  }

  /**
   * Build contextual prompt for specific situation
   */
  buildContextualPrompt(context: ConversationContext): string {
    const safety = this.analyzeSafety(context.user_message)
    let prompt = this.generateSystemPrompt()

    // Add context-specific instructions
    if (context.current_time) {
      prompt += `\n\nCURRENT TIME: ${context.current_time}`
    }

    if (context.app_context?.current_page) {
      prompt += `\nUSER IS CURRENTLY ON: ${context.app_context.current_page} page`
    }

    if (safety.level !== 'safe') {
      prompt += `\n\nSAFETY ALERT: Detected ${safety.level} level concern (${safety.category}). Respond with appropriate care and resources.`
    }

    if (context.user_state) {
      const statePrompts = {
        struggling: "The user seems to be having a difficult time. Be extra gentle and validating.",
        celebrating: "The user has something positive to share! Match their energy and celebrate with them.",
        crisis: "The user may be in crisis. Prioritize safety and immediate support.",
        neutral: "Normal supportive interaction."
      }
      prompt += `\n\nUSER STATE: ${statePrompts[context.user_state]}`
    }

    return prompt
  }

  /**
   * Get appropriate voice pattern for situation
   */
  getVoicePattern(type: keyof typeof addyCore.voice_patterns): string {
    const patterns = this.config.voice_patterns[type] || []
    return patterns[Math.floor(Math.random() * patterns.length)] || ""
  }

  /**
   * Get safety intervention response
   */
  getSafetyResponse(category: string): any {
    return this.config.intervention_responses[category] || null
  }

  /**
   * Get contextual affirmation
   */
  getAffirmation(category: keyof typeof addyCore.affirmations): string {
    const affirmations = this.config.affirmations[category] || []
    return affirmations[Math.floor(Math.random() * affirmations.length)] || ""
  }

  /**
   * Process user input and generate Addy response structure
   * This is platform-agnostic - the actual AI inference happens elsewhere
   */
  processInput(context: ConversationContext): {
    systemPrompt: string
    userPrompt: string
    safetyAnalysis: ReturnType<typeof this.analyzeSafety>
    suggestedTone: AddyResponse['tone']
  } {
    const safetyAnalysis = this.analyzeSafety(context.user_message)
    const systemPrompt = this.buildContextualPrompt(context)
    
    // Determine suggested tone based on safety level and context
    let suggestedTone: AddyResponse['tone'] = 'supportive'
    if (safetyAnalysis.level === 'intervention' || safetyAnalysis.level === 'emergency') {
      suggestedTone = 'protective'
    } else if (safetyAnalysis.level === 'concern') {
      suggestedTone = 'gentle_firm'
    } else if (context.user_state === 'celebrating') {
      suggestedTone = 'celebratory'
    }

    return {
      systemPrompt,
      userPrompt: context.user_message,
      safetyAnalysis,
      suggestedTone
    }
  }
}

// Export singleton instance
export const addyPersonality = new AddyPersonalityEngine()

// Export types for platform-specific implementations
export type { ConversationContext, AddyResponse }
