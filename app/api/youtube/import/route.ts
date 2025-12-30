/**
 * API endpoint для импорта YouTube видео в RAG систему
 * 
 * POST /api/youtube/import
 * Body: { videoIds: string[], videoUrls?: string[] }
 * 
 * GET /api/youtube/import
 * Возвращает список импортированных видео
 */

import { getCombinedRAGProvider } from "@/lib/chat-service/providers/combined-rag-provider"

// Используем тот же экземпляр, что и в чат API
function getRAGProvider() {
  return getCombinedRAGProvider()
}

export async function POST(req: Request) {
  try {
    const { videoIds, videoUrls } = await req.json()

    if (!videoIds && !videoUrls) {
      return Response.json(
        { error: "videoIds or videoUrls required" },
        { status: 400 }
      )
    }

    const provider = getRAGProvider()
    const allVideos = [...(videoIds || []), ...(videoUrls || [])]

    const results = await Promise.allSettled(
      allVideos.map((videoId) => provider.addVideo(videoId))
    )

    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r.status === "rejected" ? r.reason?.message : "Unknown error"))

    return Response.json({
      success: true,
      imported: successful,
      failed,
      total: allVideos.length,
      errors: failed > 0 ? errors : undefined,
      videos: provider.getYouTubeRAG().getVideos().map((v) => ({
        videoId: v.videoId,
        url: v.url,
        title: v.title,
        chunksCount: v.chunks?.length || 0,
      })),
    })
  } catch (error) {
    console.error("[YouTube Import] Error:", error)
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to import videos",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/youtube/import - получить список импортированных видео
 */
export async function GET() {
  try {
    const provider = getRAGProvider()
    const videos = provider.getYouTubeRAG().getVideos()

    return Response.json({
      videos: videos.map((v) => ({
        videoId: v.videoId,
        url: v.url,
        title: v.title,
        chunksCount: v.chunks?.length || 0,
      })),
      totalChunks: videos.reduce((sum, v) => sum + (v.chunks?.length || 0), 0),
      totalVideos: videos.length,
    })
  } catch (error) {
    console.error("[YouTube Import] GET Error:", error)
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get videos",
      },
      { status: 500 }
    )
  }
}
