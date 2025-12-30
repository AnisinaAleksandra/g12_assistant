/**
 * API endpoint для просмотра содержимого RAG из YouTube видео
 * 
 * GET /api/youtube/rag-content
 * Query params:
 *   - videoId?: string - показать чанки конкретного видео
 *   - limit?: number - количество чанков (по умолчанию 10)
 *   - search?: string - поиск по тексту чанков
 */

import { getCombinedRAGProvider } from "@/lib/chat-service/providers/combined-rag-provider"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get("videoId")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")?.toLowerCase()

    const provider = getCombinedRAGProvider()
    const youtubeRAG = provider.getYouTubeRAG()
    const videos = youtubeRAG.getVideos()

    if (videos.length === 0) {
      return Response.json({
        summary: {
          totalVideos: 0,
          totalChunks: 0,
          totalTextLength: 0,
        },
        videos: [],
        sampleChunks: [],
        showing: 0,
        search: null,
        message: "No videos imported yet",
        suggestion: "Import videos using POST /api/youtube/import",
      })
    }

    // Если указан videoId, показываем чанки конкретного видео
    if (videoId) {
      const video = videos.find((v) => v.videoId === videoId)
      if (!video) {
        return Response.json(
          { error: `Video ${videoId} not found` },
          { status: 404 }
        )
      }

      let chunks = video.chunks || []

      // Фильтруем по поисковому запросу
      if (search) {
        chunks = chunks.filter((chunk) =>
          chunk.text.toLowerCase().includes(search)
        )
      }

      return Response.json({
        video: {
          videoId: video.videoId,
          url: video.url,
          title: video.title,
        },
        chunks: chunks.slice(0, limit).map((chunk) => ({
          text: chunk.text,
          startTime: chunk.startTime,
          endTime: chunk.endTime,
          duration: chunk.endTime - chunk.startTime,
          preview: chunk.text.substring(0, 200) + (chunk.text.length > 200 ? "..." : ""),
        })),
        totalChunks: chunks.length,
        showing: Math.min(limit, chunks.length),
      })
    }

    // Показываем общую статистику и примеры чанков
    const allChunks = videos.flatMap((v) => v.chunks || [])
    let sampleChunks = allChunks

    // Фильтруем по поисковому запросу
    if (search) {
      sampleChunks = allChunks.filter((chunk) =>
        chunk.text.toLowerCase().includes(search)
      )
    }

    // Сортируем по времени начала
    sampleChunks.sort((a, b) => a.startTime - b.startTime)

    return Response.json({
      summary: {
        totalVideos: videos.length,
        totalChunks: allChunks.length,
        totalTextLength: allChunks.reduce((sum, chunk) => sum + chunk.text.length, 0),
      },
      videos: videos.map((v) => ({
        videoId: v.videoId,
        url: v.url,
        title: v.title,
        chunksCount: v.chunks?.length || 0,
        totalTextLength: (v.chunks || []).reduce((sum, chunk) => sum + chunk.text.length, 0),
      })),
      sampleChunks: sampleChunks.slice(0, limit).map((chunk) => {
        const video = videos.find((v) => v.videoId === chunk.videoId)
        return {
          videoId: chunk.videoId,
          videoTitle: video?.title,
          videoUrl: chunk.videoUrl,
          text: chunk.text,
          startTime: chunk.startTime,
          endTime: chunk.endTime,
          duration: chunk.endTime - chunk.startTime,
          preview: chunk.text.substring(0, 150) + (chunk.text.length > 150 ? "..." : ""),
        }
      }),
      showing: Math.min(limit, sampleChunks.length),
      search: search || null,
    })
  } catch (error) {
    console.error("[YouTube RAG Content] Error:", error)
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get RAG content",
      },
      { status: 500 }
    )
  }
}
