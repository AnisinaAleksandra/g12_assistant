"use client"

import { useEffect, useState } from "react"

export type ChatSize = "compact" | "comfortable" | "spacious"

export function useChatSize() {
  const [chatSize, setChatSize] = useState<ChatSize>("comfortable")

  useEffect(() => {
    // Load chat size from localStorage
    const savedSize = localStorage.getItem("chatSize") as ChatSize | null
    if (savedSize) {
      setChatSize(savedSize)
    }
  }, [])

  const updateChatSize = (size: ChatSize) => {
    setChatSize(size)
    localStorage.setItem("chatSize", size)
  }

  return { chatSize, updateChatSize }
}
