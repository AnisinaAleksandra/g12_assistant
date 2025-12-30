/**
 * YouTube RAG Provider
 * 
 * Интеграция YouTube транскриптов в RAG систему
 */

import type { RAGProvider, RelevantDoc } from "@/lib/chat-service/types"
import {
  getYouTubeTranscriptChunks,
  extractVideoId,
  formatChunkForRAG,
  type TranscriptChunk,
} from "./youtube-transcript"

interface YouTubeVideo {
  videoId: string
  url: string
  title?: string
  chunks?: TranscriptChunk[]
}

export class YouTubeRAGProvider implements RAGProvider {
  private videos: Map<string, YouTubeVideo> = new Map()
  private allChunks: TranscriptChunk[] = []

  /**
   * Добавляет видео в RAG систему
   */
  async addVideo(videoIdOrUrl: string, title?: string): Promise<void> {
    const videoId = extractVideoId(videoIdOrUrl)
    if (!videoId) {
      throw new Error(`Invalid YouTube URL or video ID: ${videoIdOrUrl}`)
    }

    if (this.videos.has(videoId)) {
      console.log(`Video ${videoId} already added`)
      return
    }

    try {
      const chunks = await getYouTubeTranscriptChunks(videoId, 500, "ru")
      
      if (chunks.length === 0) {
        console.warn(`[YouTube RAG] Video ${videoId} has no transcript chunks. Skipping.`)
        // Сохраняем видео без чанков для информации
        const video: YouTubeVideo = {
          videoId,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          title,
          chunks: [],
        }
        this.videos.set(videoId, video)
        return
      }
      
      const video: YouTubeVideo = {
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title,
        chunks,
      }

      this.videos.set(videoId, video)
      this.allChunks.push(...chunks)
      
      console.log(`[YouTube RAG] Added video ${videoId} with ${chunks.length} chunks`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[YouTube RAG] Failed to add video ${videoId}:`, errorMessage)
      // Не бросаем ошибку дальше - просто логируем
      // Это позволяет импортировать другие видео даже если одно не удалось
    }
  }

  /**
   * Добавляет несколько видео
   */
  async addVideos(videoIdsOrUrls: string[]): Promise<void> {
    await Promise.all(videoIdsOrUrls.map((id) => this.addVideo(id)))
  }

  /**
   * Поиск релевантных документов по запросу
   */
  findRelevantDocs(query: string, limit: number = 3): RelevantDoc[] {
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2)

    // Оцениваем каждый чанк
    const scored = this.allChunks.map((chunk) => {
      let score = 0
      const chunkText = chunk.text.toLowerCase()

      // Проверяем совпадения слов
      queryWords.forEach((word) => {
        const wordCount = (chunkText.match(new RegExp(word, "g")) || []).length
        score += wordCount * 2
      })

      // Проверяем точные совпадения фраз
      if (chunkText.includes(queryLower)) {
        score += 10
      }

      // Проверяем частичные совпадения
      queryWords.forEach((word) => {
        if (chunkText.includes(word)) {
          score += 3
        }
      })

      return {
        chunk,
        score,
      }
    })

    // Сортируем и берем топ результаты
    const topResults = scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    // Преобразуем в формат RelevantDoc
    return topResults.map((item) => {
      const video = this.videos.get(item.chunk.videoId)
      const topic = video?.title || `YouTube Video: ${item.chunk.videoId}`
      
      return {
        topic,
        content: formatChunkForRAG(item.chunk, video?.title),
        score: item.score,
      }
    })
  }

  /**
   * Генерирует follow-up вопросы на основе найденных видео
   */
  generateFollowUpQuestions(topic: string): string[] {
    // Находим видео, связанные с темой
    const relatedVideos = Array.from(this.videos.values()).filter((video) =>
      video.title?.toLowerCase().includes(topic.toLowerCase())
    )

    if (relatedVideos.length === 0) {
      return [
        "Расскажи подробнее об этом",
        "Какие еще есть примеры?",
        "Как это применить на практике?",
      ]
    }

    return [
      `Расскажи подробнее о ${topic}`,
      `Покажи примеры из видео`,
      `Какие еще видео есть по этой теме?`,
      `Объясни это простыми словами`,
    ]
  }

  /**
   * Получает список всех добавленных видео
   */
  getVideos(): YouTubeVideo[] {
    return Array.from(this.videos.values())
  }

  /**
   * Очищает все видео
   */
  clear(): void {
    this.videos.clear()
    this.allChunks = []
  }
}

