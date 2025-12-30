/**
 * Combined RAG Provider
 * 
 * Объединяет несколько RAG провайдеров для поиска по разным источникам
 */

import type { RAGProvider, RelevantDoc } from "../types"
import { grafanaRAGProvider } from "./grafana-rag-provider"
import { YouTubeRAGProvider } from "@/lib/youtube-rag-provider"

export class CombinedRAGProvider implements RAGProvider {
  private grafanaRAG: RAGProvider
  private youtubeRAG: YouTubeRAGProvider

  constructor() {
    this.grafanaRAG = grafanaRAGProvider
    this.youtubeRAG = new YouTubeRAGProvider()
  }

  /**
   * Получить YouTube RAG провайдер для добавления видео
   */
  getYouTubeRAG(): YouTubeRAGProvider {
    return this.youtubeRAG
  }

  /**
   * Добавить видео в YouTube RAG
   */
  async addVideo(videoIdOrUrl: string, title?: string): Promise<void> {
    return this.youtubeRAG.addVideo(videoIdOrUrl, title)
  }

  /**
   * Добавить несколько видео
   */
  async addVideos(videoIdsOrUrls: string[]): Promise<void> {
    return this.youtubeRAG.addVideos(videoIdsOrUrls)
  }

  /**
   * Поиск релевантных документов во всех источниках
   */
  findRelevantDocs(query: string, limit: number = 3): RelevantDoc[] {
    // Получаем больше результатов из каждого источника для лучшего выбора
    const sourceLimit = Math.max(limit, 5)
    const grafanaDocs = this.grafanaRAG.findRelevantDocs(query, sourceLimit)
    const youtubeDocs = this.youtubeRAG.findRelevantDocs(query, sourceLimit)

    // Объединяем и сортируем по релевантности
    const allDocs = [...grafanaDocs, ...youtubeDocs]

    // Убираем дубликаты по topic (если есть)
    const uniqueDocs = allDocs.reduce((acc, doc) => {
      const existing = acc.find((d) => d.topic === doc.topic && d.content === doc.content)
      if (!existing) {
        acc.push(doc)
      } else if ((doc.score || 0) > (existing.score || 0)) {
        // Заменяем на более релевантный
        const index = acc.indexOf(existing)
        acc[index] = doc
      }
      return acc
    }, [] as RelevantDoc[])

    // Сортируем по score (если есть) или по порядку
    const sorted = uniqueDocs.sort((a, b) => {
      const scoreA = a.score || 0
      const scoreB = b.score || 0
      if (scoreB !== scoreA) {
        return scoreB - scoreA
      }
      // Если score одинаковый, добавляем небольшую случайность для разнообразия
      return Math.random() - 0.5
    })

    // Возвращаем топ результаты
    return sorted.slice(0, limit)
  }

  /**
   * Генерирует follow-up вопросы на основе всех источников
   */
  generateFollowUpQuestions(topic: string): string[] {
    const grafanaQuestions = this.grafanaRAG.generateFollowUpQuestions?.(topic) || []
    const youtubeQuestions = this.youtubeRAG.generateFollowUpQuestions(topic)

    // Объединяем и убираем дубликаты
    const allQuestions = [...grafanaQuestions, ...youtubeQuestions]
    const uniqueQuestions = Array.from(new Set(allQuestions))

    return uniqueQuestions.slice(0, 5) // Максимум 5 вопросов
  }
}

// Создаем глобальный экземпляр для переиспользования
let combinedRAGInstance: CombinedRAGProvider | null = null

export function getCombinedRAGProvider(): CombinedRAGProvider {
  if (!combinedRAGInstance) {
    combinedRAGInstance = new CombinedRAGProvider()
  }
  return combinedRAGInstance
}

