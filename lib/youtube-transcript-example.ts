/**
 * Примеры использования YouTube Transcript
 * 
 * Этот файл содержит примеры кода для работы с транскриптами YouTube
 */

import {
  getYouTubeTranscript,
  getYouTubeTranscriptChunks,
  extractVideoId,
  splitTranscriptIntoChunks,
} from "./youtube-transcript"
import { YouTubeRAGProvider } from "./youtube-rag-provider"

// ============================================
// Пример 1: Получение простого транскрипта
// ============================================

export async function example1_SimpleTranscript() {
  const videoId = "dQw4w9WgXcQ" // или полный URL
  const transcript = await getYouTubeTranscript(videoId, "ru")
  
  // Получить весь текст
  const fullText = transcript.map((item) => item.text).join(" ")
  console.log("Full transcript:", fullText)
  
  return fullText
}

// ============================================
// Пример 2: Разбиение на чанки для RAG
// ============================================

export async function example2_Chunks() {
  const videoId = "dQw4w9WgXcQ"
  const chunks = await getYouTubeTranscriptChunks(videoId, 500, "ru")
  
  console.log(`Got ${chunks.length} chunks`)
  chunks.forEach((chunk, index) => {
    console.log(`Chunk ${index + 1}:`, {
      text: chunk.text.substring(0, 100) + "...",
      startTime: chunk.startTime,
      endTime: chunk.endTime,
    })
  })
  
  return chunks
}

// ============================================
// Пример 3: Использование в RAG системе
// ============================================

export async function example3_RAGIntegration() {
  const provider = new YouTubeRAGProvider()
  
  // Добавить видео
  await provider.addVideo("dQw4w9WgXcQ", "Название видео")
  await provider.addVideo("https://www.youtube.com/watch?v=VIDEO_ID_2")
  
  // Поиск релевантных документов
  const docs = provider.findRelevantDocs("мой запрос", 5)
  
  console.log("Found documents:", docs)
  return docs
}

// ============================================
// Пример 4: Импорт через API
// ============================================

export async function example4_APIImport() {
  const response = await fetch("/api/youtube/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      videoIds: ["dQw4w9WgXcQ", "VIDEO_ID_2"],
      videoUrls: ["https://www.youtube.com/watch?v=VIDEO_ID_3"],
    }),
  })
  
  const result = await response.json()
  console.log("Import result:", result)
  return result
}

// ============================================
// Пример 5: Сохранение в базу данных
// ============================================

export async function example5_SaveToDatabase() {
  const chunks = await getYouTubeTranscriptChunks("VIDEO_ID", 500)
  
  // Пример для Supabase
  // for (const chunk of chunks) {
  //   await supabase.from('youtube_chunks').insert({
  //     video_id: chunk.videoId,
  //     text: chunk.text,
  //     start_time: chunk.startTime,
  //     end_time: chunk.endTime,
  //     video_url: chunk.videoUrl,
  //   })
  // }
  
  return chunks
}

// ============================================
// Пример 6: Извлечение ID из разных форматов URL
// ============================================

export function example6_ExtractVideoId() {
  const urls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "dQw4w9WgXcQ", // уже ID
  ]
  
  urls.forEach((url) => {
    const id = extractVideoId(url)
    console.log(`${url} -> ${id}`)
  })
}

// ============================================
// Пример 7: Комбинирование с другими RAG провайдерами
// ============================================

export async function example7_CombinedRAG() {
  const youtubeRAG = new YouTubeRAGProvider()
  await youtubeRAG.addVideo("VIDEO_ID")
  
  // Использовать вместе с другими провайдерами
  // const combinedDocs = [
  //   ...youtubeRAG.findRelevantDocs("query", 3),
  //   ...otherRAGProvider.findRelevantDocs("query", 3),
  // ]
  
  return youtubeRAG
}


