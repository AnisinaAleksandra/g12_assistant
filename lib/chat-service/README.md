# Chat Service - Reusable Chat API Module

Переиспользуемый модуль для создания чат-API в Next.js проектах.

## Возможности

- ✅ Универсальный интерфейс для различных AI провайдеров
- ✅ Поддержка RAG (Retrieval-Augmented Generation)
- ✅ Интеграция с базами данных (опционально)
- ✅ Генерация follow-up вопросов
- ✅ Отслеживание источников информации
- ✅ Легко расширяемый и настраиваемый

## Установка

Скопируйте папку `lib/chat-service` в ваш проект.

## Использование

### Базовый пример

```typescript
// app/api/chat/route.ts
import { createChatHandler } from "@/lib/chat-service"
import { gigachatProvider } from "@/lib/chat-service/providers/gigachat-provider"

export const POST = createChatHandler({
  aiProvider: gigachatProvider,
  systemPrompt: "You are a helpful assistant.",
})
```

### С RAG и базой данных

```typescript
// app/api/chat/route.ts
import { createChatHandler } from "@/lib/chat-service"
import { gigachatProvider } from "@/lib/chat-service/providers/gigachat-provider"
import { grafanaRAGProvider } from "@/lib/chat-service/providers/grafana-rag-provider"
import { supabaseDBProvider } from "@/lib/chat-service/providers/supabase-db-provider"

export const POST = createChatHandler({
  aiProvider: gigachatProvider,
  ragProvider: grafanaRAGProvider,
  databaseProvider: supabaseDBProvider,
  systemPrompt: "You are a Grafana expert assistant.",
  enableFollowUpQuestions: true,
  enableSources: true,
})
```

### Создание собственного провайдера

```typescript
// lib/chat-service/providers/custom-ai-provider.ts
import type { AIProvider } from "../types"

export class CustomAIProvider implements AIProvider {
  async generateResponse(userMessage: string, context: string): Promise<string> {
    // Ваша логика генерации ответа
    return "Response from custom AI"
  }
}
```

## Интерфейсы

### AIProvider

```typescript
interface AIProvider {
  generateResponse(userMessage: string, context: string): Promise<string>
}
```

### RAGProvider

```typescript
interface RAGProvider {
  findRelevantDocs(query: string, limit?: number): RelevantDoc[] | Promise<RelevantDoc[]>
  generateFollowUpQuestions?(topic: string): string[]
}
```

### DatabaseProvider

```typescript
interface DatabaseProvider {
  createConversation?(title: string): Promise<string>
  saveMessage?(conversationId: string, role: "user" | "assistant", content: string): Promise<void>
  updateConversation?(conversationId: string): Promise<void>
}
```

## Конфигурация

```typescript
interface ChatServiceConfig {
  aiProvider: AIProvider                    // Обязательно
  ragProvider?: RAGProvider                 // Опционально
  databaseProvider?: DatabaseProvider       // Опционально
  systemPrompt?: string                     // Опционально
  enableFollowUpQuestions?: boolean         // Опционально, по умолчанию true
  enableSources?: boolean                   // Опционально, по умолчанию true
}
```

## Примеры использования в других проектах

### Проект с OpenAI

```typescript
import { createChatHandler } from "@/lib/chat-service"

class OpenAIProvider implements AIProvider {
  async generateResponse(userMessage: string, context: string): Promise<string> {
    // Интеграция с OpenAI API
  }
}

export const POST = createChatHandler({
  aiProvider: new OpenAIProvider(),
})
```

### Проект с собственной RAG системой

```typescript
class CustomRAGProvider implements RAGProvider {
  async findRelevantDocs(query: string, limit = 3): Promise<RelevantDoc[]> {
    // Поиск в вашей векторной БД
  }
}

export const POST = createChatHandler({
  aiProvider: yourAIProvider,
  ragProvider: new CustomRAGProvider(),
})
```

## Структура модуля

```
lib/chat-service/
├── types.ts                    # TypeScript интерфейсы
├── chat-service.ts             # Основной класс сервиса
├── index.ts                    # Экспорты
├── providers/                  # Реализации провайдеров
│   ├── gigachat-provider.ts
│   ├── grafana-rag-provider.ts
│   └── supabase-db-provider.ts
└── README.md                   # Документация
```

## Лицензия

Модуль можно свободно использовать в любых проектах.


