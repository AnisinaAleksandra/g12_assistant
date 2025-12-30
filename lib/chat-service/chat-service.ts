/**
 * Reusable Chat Service
 * 
 * This service provides a generic chat API handler that can be used
 * in any Next.js project with different AI providers, RAG systems, and databases.
 * 
 * Usage:
 * ```typescript
 * import { createChatService } from '@/lib/chat-service/chat-service'
 * import { yourAIProvider } from '@/lib/ai-provider'
 * import { yourRAGProvider } from '@/lib/rag-provider'
 * import { yourDatabaseProvider } from '@/lib/database-provider'
 * 
 * const chatService = createChatService({
 *   aiProvider: yourAIProvider,
 *   ragProvider: yourRAGProvider,
 *   databaseProvider: yourDatabaseProvider,
 * })
 * 
 * // In your API route:
 * export async function POST(req: Request) {
 *   return chatService.handleRequest(req)
 * }
 * ```
 */

import type {
  ChatRequest,
  ChatResponse,
  ChatServiceConfig,
  RelevantDoc,
} from "./types"

export class ChatService {
  private config: ChatServiceConfig

  constructor(config: ChatServiceConfig) {
    this.config = {
      systemPrompt:
        "You are a helpful AI assistant. Provide clear, concise, and helpful responses based on the context provided.",
      enableFollowUpQuestions: true,
      enableSources: true,
      ...config,
    }
  }

  /**
   * Handle incoming chat request
   */
  async handleRequest(req: Request): Promise<Response> {
    try {
      const body: ChatRequest = await req.json()
      const { message, conversationId, context: providedContext } = body

      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return Response.json({ error: "Message is required" }, { status: 400 })
      }

      // Get context from RAG if provider is available
      let context = providedContext
      let relevantDocs: RelevantDoc[] = []
      let primaryTopic = "General"

      if (this.config.ragProvider) {
        relevantDocs = await this.getRelevantDocs(message)
        
        // Логирование для отладки
        if (process.env.NODE_ENV === "development") {
          console.log(`[ChatService] Query: "${message}"`)
          console.log(`[ChatService] Found ${relevantDocs.length} relevant docs:`, 
            relevantDocs.map(d => ({ topic: d.topic, score: d.score }))
          )
        }
        
        context = this.buildContext(relevantDocs, providedContext)
        primaryTopic =
          relevantDocs.length > 0 ? relevantDocs[0].topic : "General"
      } else if (!context) {
        context = "No specific context provided."
      }

      // Generate AI response
      let response: string
      try {
        response = await this.config.aiProvider.generateResponse(message, context)
      } catch (error: any) {
        // Если AI провайдер упал, используем fallback ответ
        console.error("[ChatService] AI provider error:", error?.message || error)
        response = `I apologize, but I'm having trouble processing your request right now. 

Based on the available documentation:

${context}

Please try rephrasing your question, or contact support if the issue persists.`
      }

      // Get follow-up questions if enabled
      let followUpQuestions: string[] | undefined
      if (
        this.config.enableFollowUpQuestions &&
        this.config.ragProvider?.generateFollowUpQuestions
      ) {
        followUpQuestions = this.config.ragProvider.generateFollowUpQuestions(primaryTopic)
      }

      // Handle database operations if provider is available
      let finalConversationId = conversationId || null
      if (this.config.databaseProvider) {
        finalConversationId = await this.handleDatabaseOperations(
          message,
          response,
          finalConversationId
        )
      }

      const chatResponse: ChatResponse = {
        response,
        conversationId: finalConversationId || "temp",
        ...(this.config.enableFollowUpQuestions && followUpQuestions && { followUpQuestions }),
        ...(this.config.enableSources &&
          relevantDocs.length > 0 && {
            sources: relevantDocs.map((doc) => doc.topic),
          }),
      }

      return Response.json(chatResponse)
    } catch (error) {
      console.error("[ChatService] Error:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process message"
      return Response.json({ error: errorMessage }, { status: 500 })
    }
  }

  /**
   * Get relevant documents from RAG provider
   */
  private async getRelevantDocs(query: string): Promise<RelevantDoc[]> {
    if (!this.config.ragProvider) {
      return []
    }

    const docs = this.config.ragProvider.findRelevantDocs(query, 3)
    return Array.isArray(docs) ? docs : await docs
  }

  /**
   * Build context string from relevant documents
   */
  private buildContext(
    relevantDocs: RelevantDoc[],
    providedContext?: string
  ): string {
    if (providedContext) {
      return providedContext
    }

    if (relevantDocs.length === 0) {
      return "No specific context found for this query."
    }

    // Сортируем по релевантности (если есть score)
    const sortedDocs = [...relevantDocs].sort((a, b) => {
      const scoreA = a.score || 0
      const scoreB = b.score || 0
      return scoreB - scoreA
    })

    // Формируем контекст только из наиболее релевантных документов
    // Ограничиваем количество, чтобы не перегружать контекст
    const maxDocs = Math.min(sortedDocs.length, 3)
    const topDocs = sortedDocs.slice(0, maxDocs)

    return topDocs
      .map((doc, index) => {
        // Добавляем приоритет для лучшей релевантности
        const priority = index === 0 ? "Most relevant" : `Also relevant`
        return `${priority} - Topic: ${doc.topic}\n${doc.content}`
      })
      .join("\n\n")
  }

  /**
   * Handle database operations (conversations and messages)
   */
  private async handleDatabaseOperations(
    userMessage: string,
    assistantResponse: string,
    conversationId: string | null
  ): Promise<string> {
    if (!this.config.databaseProvider) {
      return conversationId || "temp"
    }

    const db = this.config.databaseProvider
    let finalConversationId = conversationId

    // Create conversation if needed
    if (!finalConversationId && db.createConversation) {
      const title = userMessage.slice(0, 50)
      finalConversationId = await db.createConversation(title)
    }

    // Save messages if provider supports it
    if (finalConversationId && db.saveMessage) {
      await db.saveMessage(finalConversationId, "user", userMessage)
      await db.saveMessage(finalConversationId, "assistant", assistantResponse)

      // Update conversation timestamp
      if (db.updateConversation) {
        await db.updateConversation(finalConversationId)
      }
    }

    return finalConversationId || "temp"
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ChatServiceConfig>): void {
    this.config = { ...this.config, ...updates }
  }
}

/**
 * Factory function to create a ChatService instance
 */
export function createChatService(config: ChatServiceConfig): ChatService {
  return new ChatService(config)
}

/**
 * Create a Next.js API route handler
 */
export function createChatHandler(config: ChatServiceConfig) {
  const service = createChatService(config)
  return async (req: Request) => service.handleRequest(req)
}

