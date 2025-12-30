/**
 * Examples of using Chat Service in different projects
 * 
 * These examples show how to use the chat-service module
 * with different AI providers, RAG systems, and databases.
 */

import type { AIProvider, RAGProvider, DatabaseProvider } from "./types"
import { createChatHandler } from "./chat-service"

// ============================================
// Example 1: Simple setup with only AI provider
// ============================================

class SimpleAIProvider implements AIProvider {
  async generateResponse(userMessage: string, context: string): Promise<string> {
    // Your AI integration here (OpenAI, Anthropic, etc.)
    return `Response to: ${userMessage}`
  }
}

export const simpleChatHandler = createChatHandler({
  aiProvider: new SimpleAIProvider(),
})

// ============================================
// Example 2: OpenAI Provider
// ============================================

class OpenAIProvider implements AIProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateResponse(userMessage: string, context: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: context },
          { role: "user", content: userMessage },
        ],
      }),
    })

    const data = await response.json()
    return data.choices[0].message.content
  }
}

export const openAIChatHandler = createChatHandler({
  aiProvider: new OpenAIProvider(process.env.OPENAI_API_KEY!),
  systemPrompt: "You are a helpful assistant.",
})

// ============================================
// Example 3: Custom RAG Provider with Vector DB
// ============================================

class VectorDBRAGProvider implements RAGProvider {
  async findRelevantDocs(query: string, limit = 3) {
    // Search in your vector database (Pinecone, Weaviate, etc.)
    // This is a mock implementation
    return [
      {
        topic: "Example Topic",
        content: "Example content from vector search",
        score: 0.95,
      },
    ]
  }

  generateFollowUpQuestions(topic: string): string[] {
    return [`Tell me more about ${topic}`, `How does ${topic} work?`]
  }
}

export const vectorDBChatHandler = createChatHandler({
  aiProvider: new SimpleAIProvider(),
  ragProvider: new VectorDBRAGProvider(),
  enableFollowUpQuestions: true,
  enableSources: true,
})

// ============================================
// Example 4: Custom Database Provider
// ============================================

class MongoDBProvider implements DatabaseProvider {
  async createConversation(title: string): Promise<string> {
    // Create conversation in MongoDB
    // Return conversation ID
    return "conversation-id"
  }

  async saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<void> {
    // Save message to MongoDB
  }

  async updateConversation(conversationId: string): Promise<void> {
    // Update conversation timestamp in MongoDB
  }
}

export const mongoDBChatHandler = createChatHandler({
  aiProvider: new SimpleAIProvider(),
  databaseProvider: new MongoDBProvider(),
})

// ============================================
// Example 5: Full setup with all features
// ============================================

export const fullChatHandler = createChatHandler({
  aiProvider: new OpenAIProvider(process.env.OPENAI_API_KEY!),
  ragProvider: new VectorDBRAGProvider(),
  databaseProvider: new MongoDBProvider(),
  systemPrompt: "You are an expert assistant with access to documentation.",
  enableFollowUpQuestions: true,
  enableSources: true,
})

// ============================================
// Example 6: Using in Next.js App Router
// ============================================

/*
// app/api/chat/route.ts
import { createChatHandler } from "@/lib/chat-service"
import { yourAIProvider } from "@/lib/ai-provider"
import { yourRAGProvider } from "@/lib/rag-provider"
import { yourDBProvider } from "@/lib/db-provider"

export const POST = createChatHandler({
  aiProvider: yourAIProvider,
  ragProvider: yourRAGProvider,
  databaseProvider: yourDBProvider,
  systemPrompt: "Your custom system prompt",
  enableFollowUpQuestions: true,
  enableSources: true,
})
*/

// ============================================
// Example 7: Dynamic configuration
// ============================================

import { ChatService } from "./chat-service"

const chatService = new ChatService({
  aiProvider: new SimpleAIProvider(),
})

// Update configuration at runtime
chatService.updateConfig({
  systemPrompt: "New system prompt",
  enableFollowUpQuestions: false,
})

// Use in custom handler
export async function customHandler(req: Request) {
  // Add custom logic before/after
  const response = await chatService.handleRequest(req)
  // Add custom logic
  return response
}

