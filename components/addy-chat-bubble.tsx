"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { ScrollArea } from "@/components/ui/scroll-area" // Component is empty
import { Send, X, Minimize2 } from "lucide-react"
import { type ConversationContext, type AddyResponse } from "@/shared/ai/personality-engine"
import addyAI from "@/lib/ai/transformers-client"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  safety_level?: AddyResponse['safety_level']
  tone?: AddyResponse['tone']
}

export default function AddyChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAiAvailable, setIsAiAvailable] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  // Check AI availability on mount
  useEffect(() => {
    checkAiAvailability()
  }, [])

  const checkAiAvailability = async () => {
    try {
      // Only check in browser environment
      if (typeof window === 'undefined') {
        setIsAiAvailable(false)
        return
      }

      // Check if the client-side AI is ready or loading
      if (await addyAI.isReady()) {
        setIsAiAvailable(true)
      } else if (addyAI.isLoadingModel()) {
        setIsAiAvailable(false)
        // Wait for initialization to complete
        setTimeout(checkAiAvailability, 1000)
      } else {
        // Try to initialize
        const success = await addyAI.initialize()
        setIsAiAvailable(success)
      }
    } catch (error) {
      console.log('AI not available:', error)
      setIsAiAvailable(false)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      if (!isAiAvailable) {
        // Fallback response when AI isn't available
        const fallbackResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Hey friend! 💜 I'm still warming up my circuits. Give me a moment to get my brain online, then we can chat properly! In the meantime, know that you're doing great! ✨",
          timestamp: new Date(),
          tone: 'supportive'
        }
        setMessages(prev => [...prev, fallbackResponse])
        setIsLoading(false)
        return
      }

      // Build conversation context
      const context: ConversationContext = {
        user_message: userMessage.content,
        conversation_history: messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        current_time: new Date().toISOString(),
        user_state: 'neutral', // Could be enhanced with mood detection
        app_context: {
          current_page: 'chat',
          recent_data: null,
          patterns_detected: []
        }
      }

      // Generate response using client-side AI
      const aiResponse = await addyAI.generateResponse(context)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        safety_level: aiResponse.safety_level,
        tone: aiResponse.tone
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! Something went wonky with my brain circuits. 🤖💫 Can you try that again? I promise I'm usually more coherent than this!",
        timestamp: new Date(),
        tone: 'supportive'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }



  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false)
      setIsMinimized(false)
    } else {
      setIsOpen(true)
      setIsMinimized(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-32 z-[9999]">
      {/* Chat Bubble Button */}
      <Button
        onClick={toggleChat}
        className="h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, var(--primary-purple), var(--accent-orange))',
          border: '2px solid var(--border-soft)',
        }}
        size="icon"
      >
        <div className="relative">
          <img
            src="/addy.png"
            alt="Addy"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 animate-pulse"
            style={{
              backgroundColor: isAiAvailable ? '#34d399' : '#fbbf24',
              borderColor: 'var(--deep-space)',
            }}
          />
        </div>
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`absolute bottom-20 right-0 rounded-lg shadow-xl border transition-all duration-300 ${
            isMinimized ? 'h-12' : 'h-96'
          } w-80`}
          style={{
            backgroundColor: 'var(--deep-space)',
            borderColor: 'var(--border-soft)',
          }}
        >
          {/* Chat Header */}
          <div
            className="flex items-center justify-between p-3 border-b"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            <div className="flex items-center gap-2">
              <img
                src="/addy.png"
                alt="Addy"
                className="h-6 w-6 rounded-full object-cover"
              />
              <span
                className="font-medium text-sm"
                style={{ color: 'var(--text-main)' }}
              >
                Addy
              </span>
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: isAiAvailable ? '#34d399' : '#fbbf24' }}
              />
            </div>
            <div className="flex gap-1">
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                variant="ghost"
                size="icon"
                className="h-6 w-6"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="h-64 p-3 overflow-y-auto">
                {messages.length === 0 ? (
                  <div
                    className="text-center text-sm py-8"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <p className="mb-2">Hey friend! 💜 I'm Addy!</p>
                    <p>What's on your mind today?</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                    >
                      <div
                        className={`inline-block max-w-[80%] p-2 rounded-lg text-sm ${
                          message.role === 'user'
                            ? 'rounded-br-none'
                            : 'rounded-bl-none'
                        }`}
                        style={{
                          backgroundColor: message.role === 'user'
                            ? 'var(--accent-orange)'
                            : 'var(--primary-purple)',
                          color: message.role === 'user'
                            ? 'var(--deep-space)'
                            : 'var(--text-main)',
                        }}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="text-left mb-3">
                    <div
                      className="inline-block p-2 rounded-lg rounded-bl-none text-sm"
                      style={{
                        backgroundColor: 'var(--primary-purple)',
                        color: 'var(--text-main)',
                      }}
                    >
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)' }}></div>
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)', animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)', animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div
                className="p-3 border-t"
                style={{ borderColor: 'var(--border-soft)' }}
              >
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={isLoading}
                    className="flex-1 text-sm"
                    style={{
                      backgroundColor: 'var(--surface-1, var(--primary-purple))',
                      borderColor: 'var(--border-soft)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="icon"
                    className="h-9 w-9"
                    style={{
                      backgroundColor: 'var(--accent-orange)',
                      color: 'var(--deep-space)',
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
