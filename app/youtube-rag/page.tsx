"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Video, FileText, RefreshCw, ExternalLink, Plus, Loader2 } from "lucide-react"

interface VideoInfo {
  videoId: string
  url: string
  title?: string
  chunksCount: number
  totalTextLength: number
}

interface ChunkInfo {
  videoId: string
  videoTitle?: string
  videoUrl: string
  text: string
  startTime: number
  endTime: number
  duration: number
  preview: string
}

interface RAGContent {
  summary?: {
    totalVideos: number
    totalChunks: number
    totalTextLength: number
  }
  videos: VideoInfo[]
  sampleChunks: ChunkInfo[]
  showing: number
  search: string | null
  message?: string
  suggestion?: string
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function formatBytes(bytes: number | undefined): string {
  if (!bytes || bytes === 0 || isNaN(bytes)) return "0 B"
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / 1024 / 1024).toFixed(1) + " MB"
}

export default function YouTubeRAGPage() {
  const [data, setData] = useState<RAGContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importInput, setImportInput] = useState("")
  const [importError, setImportError] = useState<string | null>(null)

  const fetchData = async (searchQuery?: string) => {
    setLoading(true)
    try {
      const url = new URL("/api/youtube/rag-content", window.location.origin)
      if (selectedVideo) {
        url.searchParams.set("videoId", selectedVideo)
      }
      if (searchQuery) {
        url.searchParams.set("search", searchQuery)
      }
      url.searchParams.set("limit", "20")

      const response = await fetch(url.toString())
      const result = await response.json()

      if (response.ok) {
        setData(result)
      } else {
        console.error("Error:", result)
      }
    } catch (error) {
      console.error("Failed to fetch RAG content:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedVideo])

  const handleSearch = () => {
    fetchData(search)
  }

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideo(selectedVideo === videoId ? null : videoId)
    setSearch("")
  }

  const handleImport = async () => {
    if (!importInput.trim()) {
      setImportError("Введите ID видео или URL")
      return
    }

    setImporting(true)
    setImportError(null)

    try {
      // Извлекаем ID из URL или используем как есть
      const videoIds = importInput
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .map((id) => {
          // Если это URL, извлекаем ID
          const match = id.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
          return match ? match[1] : id
        })

      const response = await fetch("/api/youtube/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoIds }),
      })

      const result = await response.json()

      if (response.ok) {
        setImportInput("")
        // Обновляем данные после импорта
        await fetchData()
      } else {
        setImportError(result.error || "Ошибка при импорте видео")
      }
    } catch (error) {
      setImportError("Не удалось импортировать видео")
      console.error("Import error:", error)
    } finally {
      setImporting(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!data || (data.summary?.totalVideos === 0)) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">YouTube RAG Content</h1>
          <p className="text-muted-foreground mt-2">
            Импортируйте YouTube видео для использования в RAG системе
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Импорт видео</CardTitle>
            <CardDescription>
              Введите ID видео или URL YouTube (можно несколько через запятую)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="VIDEO_ID или https://www.youtube.com/watch?v=VIDEO_ID"
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !importing && handleImport()}
                disabled={importing}
              />
              <Button onClick={handleImport} disabled={importing}>
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Импорт...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Импортировать
                  </>
                )}
              </Button>
            </div>
            {importError && (
              <p className="text-sm text-destructive">{importError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Примеры: dQw4w9WgXcQ или https://www.youtube.com/watch?v=dQw4w9WgXcQ
              <br />
              <span className="text-yellow-600">Примечание: Видео должно иметь автоматические субтитры</span>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">YouTube RAG Content</h1>
          <p className="text-muted-foreground mt-2">
            Просмотр содержимого RAG системы из YouTube видео
          </p>
        </div>
        <Button onClick={() => fetchData(search)} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Статистика */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Видео</p>
                <p className="text-2xl font-bold">{data.summary?.totalVideos || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Чанков</p>
                <p className="text-2xl font-bold">{data.summary?.totalChunks || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Текст</p>
                <p className="text-2xl font-bold">
                  {formatBytes(data.summary?.totalTextLength || 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Импорт видео */}
      <Card>
        <CardHeader>
          <CardTitle>Импорт видео</CardTitle>
          <CardDescription>
            Добавьте новые YouTube видео в RAG систему
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="VIDEO_ID или URL (можно несколько через запятую)"
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !importing && handleImport()}
              disabled={importing}
            />
            <Button onClick={handleImport} disabled={importing}>
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Импорт...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Импортировать
                </>
              )}
            </Button>
          </div>
          {importError && (
            <p className="text-sm text-destructive">{importError}</p>
          )}
          <p className="text-xs text-muted-foreground">
            <span className="text-yellow-600">⚠️ Видео должно иметь автоматические субтитры. Если видео не импортируется, возможно у него нет субтитров.</span>
          </p>
        </CardContent>
      </Card>

      {/* Поиск */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск по содержимому</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Поиск по тексту чанков..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Найти
            </Button>
            {search && (
              <Button variant="outline" onClick={() => {
                setSearch("")
                fetchData()
              }}>
                Сбросить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Список видео */}
      <Card>
        <CardHeader>
          <CardTitle>Импортированные видео</CardTitle>
          <CardDescription>
            Нажмите на видео, чтобы увидеть его чанки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.videos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Нет импортированных видео
              </p>
            ) : (
              data.videos.map((video) => (
                <div
                  key={video.videoId}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedVideo === video.videoId
                      ? "bg-accent border-primary"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => handleVideoSelect(video.videoId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="h-4 w-4" />
                        <h3 className="font-semibold">
                          {video.title || video.videoId}
                        </h3>
                        <Badge variant="secondary">{video.chunksCount} чанков</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {video.url}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Текст: {formatBytes(video.totalTextLength)}
                      </p>
                    </div>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-4"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Примеры чанков */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedVideo
              ? `Чанки видео: ${data.videos.find((v) => v.videoId === selectedVideo)?.title || selectedVideo}`
              : "Примеры чанков"}
          </CardTitle>
          <CardDescription>
            Показано {data.showing} из {data.summary?.totalChunks || 0} чанков
            {search && ` (поиск: "${search}")`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.sampleChunks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {search ? "Ничего не найдено" : "Нет чанков для отображения"}
              </p>
            ) : (
              data.sampleChunks.map((chunk, index) => (
                <div
                  key={`${chunk.videoId}-${chunk.startTime}-${index}`}
                  className="p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      {!selectedVideo && (
                        <div className="flex items-center gap-2 mb-2">
                          <Video className="h-3 w-3 text-muted-foreground" />
                          <a
                            href={chunk.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:underline"
                          >
                            {chunk.videoTitle || chunk.videoId}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">
                          {formatTime(chunk.startTime)} - {formatTime(chunk.endTime)}
                        </Badge>
                        <span>Длительность: {formatTime(chunk.duration)}</span>
                      </div>
                    </div>
                    <a
                      href={chunk.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4"
                    >
                      <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </a>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{chunk.text}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
