"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { CodeBlock } from "@/components/code-block"

interface EnhancedMessageProps {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

export function EnhancedMessage({ role, content, timestamp }: EnhancedMessageProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Parse content for code blocks
  const parseContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: text.slice(lastIndex, match.index) })
      }

      // Add code block
      parts.push({
        type: "code",
        language: match[1] || "text",
        content: match[2].trim(),
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.slice(lastIndex) })
    }

    return parts.length > 0 ? parts : [{ type: "text", content: text }]
  }

  const contentParts = parseContent(content)

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
            style={{ maxWidth: "300px" }}
            className={cn(
              "rounded-2xl px-4 py-3 backdrop-blur-sm transition-all hover:shadow-lg",
              role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-none shadow-md shadow-primary/20"
                : "bg-muted text-foreground rounded-tl-none border border-border/50",
            )}
          >
            {contentParts.map((part, index) => {
              if (part.type === "code") {
                return <CodeBlock key={index} code={part.content} language={part.language} />
              }
              return (
                <div key={index} className="text-sm leading-relaxed whitespace-pre-wrap">
                  {part.content}
                </div>
              )
            })}
          </div>
          {timestamp && <span className="text-xs text-muted-foreground px-2 animate-fade-in">{timestamp}</span>}
        </div>
      </div>
    </div>
  )
}
