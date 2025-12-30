"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EnhancedMessage } from "@/components/enhanced-message"
import { FollowUpQuestions } from "@/components/follow-up-questions"
import { Loader2, Send, Sparkles } from "lucide-react"
import { useChatSize } from "@/hooks/use-chat-size"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { chatSize } = useChatSize()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          conversationId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setConversationId(data.conversationId)
      setFollowUpQuestions(data.followUpQuestions || [])
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleFollowUpClick = (question: string) => {
    sendMessage(question)
    setFollowUpQuestions([])
  }

  const spacingClass = chatSize === "compact" ? "space-y-2" : chatSize === "spacious" ? "space-y-6" : "space-y-4"

  const paddingClass = chatSize === "compact" ? "px-4 py-4" : chatSize === "spacious" ? "px-8 py-8" : "px-4 py-6"

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto ${paddingClass} ${spacingClass}`}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full p-6 mb-4 animate-pulse">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-balance">Welcome to Grafana12 AI Assistant</h2>
            <p className="text-muted-foreground max-w-md text-pretty leading-relaxed">
              Ask me anything about Grafana12 - from installation to advanced configuration, dashboards, alerts, and
              more.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <EnhancedMessage
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-slide-in-up">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
              AI
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 border border-border/50">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {followUpQuestions.length > 0 && !isLoading && (
          <FollowUpQuestions questions={followUpQuestions} onQuestionClick={handleFollowUpClick} />
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-background/95 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Grafana12..."
            disabled={isLoading}
            className="flex-1 bg-muted/50 border-border/50 focus-visible:ring-primary"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="shadow-lg shadow-primary/20 transition-all hover:scale-105"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
