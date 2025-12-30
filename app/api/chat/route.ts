/**
 * Chat API Route using reusable Chat Service
 */

import { createChatHandler } from "@/lib/chat-service"
import { gigachatProvider } from "@/lib/chat-service/providers/gigachat-provider"
import { getCombinedRAGProvider } from "@/lib/chat-service/providers/combined-rag-provider"
import { supabaseDBProvider } from "@/lib/chat-service/providers/supabase-db-provider"

const combinedRAG = getCombinedRAGProvider()

let youtubeInitialized = false

async function initializeYouTubeVideos() {
  if (youtubeInitialized) return
  
  try {
    const videoIds = process.env.YOUTUBE_VIDEO_IDS?.split(",")
      .map((id) => id.trim())
      .filter(Boolean) || []
    
    if (videoIds.length > 0) {
      console.log(`[Chat API] Initializing ${videoIds.length} YouTube videos...`)
      await combinedRAG.addVideos(videoIds)
      console.log(`[Chat API] YouTube videos initialized`)
      youtubeInitialized = true
    }
  } catch (error) {
    console.error("[Chat API] Failed to initialize YouTube videos:", error)
  }
}

initializeYouTubeVideos().catch(console.error)

export const POST = createChatHandler({
  aiProvider: gigachatProvider,
  ragProvider: combinedRAG,
  databaseProvider: supabaseDBProvider,
  systemPrompt:
    "You are a helpful AI assistant specializing in Grafana12 documentation and support. You also have access to video transcripts from YouTube. Provide clear, concise, and helpful responses based on the documentation and video content provided.",
  enableFollowUpQuestions: true,
  enableSources: true,
})
