"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { SettingsMenu } from "@/components/settings-menu"
import { Button } from "@/components/ui/button"
import { MessageSquare, X, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Home() {
  const [isChatExpanded, setIsChatExpanded] = useState(false)

  const toggleChat = () => {
    setIsChatExpanded(!isChatExpanded)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold">Grafana12 AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Your intelligent guide to Grafana</p>
          </div>
        </div>
        <SettingsMenu />
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome to Grafana12 AI Assistant</h2>
          <p className="text-muted-foreground text-lg">
            Click the chat button in the bottom right corner to start a conversation.
          </p>
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={toggleChat}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          variant="default"
        >
          {isChatExpanded ? (
            <Minimize2 className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
        </Button>
        <div
          className={cn(
            "absolute bottom-20 right-0 w-96 h-[32rem] bg-card border border-border rounded-lg shadow-xl flex flex-col overflow-hidden transition-all duration-300",
            isChatExpanded
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          )}
        >
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold">Chat Assistant</h3>
            <Button onClick={toggleChat} size="icon" variant="ghost" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  )
}

