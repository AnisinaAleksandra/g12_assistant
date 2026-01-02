/**
 * Types for reusable chat service
 */

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

export interface ChatRequest {
  message: string
  conversationId?: string | null
  context?: string
}

export interface ChatResponse {
  response: string
  conversationId: string
  followUpQuestions?: string[]
  sources?: string[]
}

export interface RelevantDoc {
  topic: string
  content: string
  score?: number
}

export interface RAGProvider {
  findRelevantDocs(query: string, limit?: number): RelevantDoc[] | Promise<RelevantDoc[]>
  generateFollowUpQuestions?(topic: string): string[]
}

export interface DatabaseProvider {
  createConversation?(title: string): Promise<string>
  saveMessage?(conversationId: string, role: "user" | "assistant", content: string): Promise<void>
  updateConversation?(conversationId: string): Promise<void>
}

export interface AIProvider {
  generateResponse(userMessage: string, context: string): Promise<string>
}

export interface ChatServiceConfig {
  aiProvider: AIProvider
  ragProvider?: RAGProvider
  databaseProvider?: DatabaseProvider
  systemPrompt?: string
  enableFollowUpQuestions?: boolean
  enableSources?: boolean
}


