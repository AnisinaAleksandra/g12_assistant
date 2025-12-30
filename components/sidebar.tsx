"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  title: string
  created_at: string
}

export function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("conversations").select("*").order("updated_at", { ascending: false })

    if (!error && data) {
      setConversations(data)
    }
  }

  const handleNewChat = () => {
    setSelectedId(null)
    window.location.reload()
  }

  return (
    <div className="w-64 border-r bg-card/50 backdrop-blur-sm flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <Button onClick={handleNewChat} className="w-full shadow-md hover:shadow-lg transition-all" variant="default">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:bg-muted hover:scale-[1.02]",
                selectedId === conv.id && "bg-muted shadow-sm",
              )}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{conv.title}</span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
