"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div
      className={cn(
        "flex gap-4 mb-6 transition-all duration-300",
        role === "user" ? "justify-end" : "justify-start",
        isVisible ? "animate-slide-in-up" : "opacity-0",
      )}
    >
      <div className={cn("flex gap-3 max-w-[80%]", role === "user" ? "flex-row-reverse" : "flex-row")}>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-transform hover:scale-110",
            role === "user"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
              : "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg",
          )}
        >
          {role === "user" ? "U" : "AI"}
        </div>
        <div className="flex flex-col gap-2">
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm leading-relaxed backdrop-blur-sm transition-all hover:shadow-lg",
              role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-none shadow-md shadow-primary/20"
                : "bg-muted text-foreground rounded-tl-none border border-border/50",
            )}
          >
            {content}
          </div>
          {timestamp && <span className="text-xs text-muted-foreground px-2 animate-fade-in">{timestamp}</span>}
        </div>
      </div>
    </div>
  )
}
