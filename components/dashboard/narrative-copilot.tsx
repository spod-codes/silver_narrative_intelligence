'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Database, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  dataContext?: {
    narrativeCount: number
    clusterCount: number
    conflictCount: number
    sourcesAvailable: number
  } | null
}

const SUGGESTED_QUESTIONS = [
  "What is the current sentiment?",
  "What are the top narratives?",
  "Any narrative conflicts?",
  "Tell me about the squeeze narrative",
]

export function NarrativeCopilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        dataContext: data.dataContext
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Unable to process your question. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="rounded-lg border border-border bg-card flex flex-col h-[500px]">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Narrative Copilot</h3>
            <p className="text-[10px] font-mono text-muted-foreground">REAL DATA ONLY</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
          <Database className="h-3 w-3" />
          <span>Live Data</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Bot className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-foreground font-medium mb-1">
              Ask about silver market narratives
            </p>
            <p className="text-xs text-muted-foreground max-w-[250px] mb-4">
              I analyze real-world data only. No simulations or estimations.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-[300px]">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[10px] font-mono px-2 py-1 rounded-md bg-secondary hover:bg-accent text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content.split('\n').map((line, i) => {
                      // Handle bold text
                      const parts = line.split(/\*\*(.*?)\*\*/g)
                      return (
                        <p key={i} className={i > 0 ? 'mt-1' : ''}>
                          {parts.map((part, j) => 
                            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                          )}
                        </p>
                      )
                    })}
                  </div>
                  {message.dataContext && (
                    <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-3 text-[9px] font-mono text-muted-foreground">
                      <span>{message.dataContext.narrativeCount} narratives</span>
                      <span>{message.dataContext.clusterCount} clusters</span>
                      <span>{message.dataContext.sourcesAvailable} sources</span>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-secondary rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Analyzing data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 border-t border-border bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          <span>Responses based on real scraped data only. No simulations or hallucinations.</span>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about narratives, sentiment, conflicts..."
            disabled={isLoading}
            className="flex-1 font-mono text-sm"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
