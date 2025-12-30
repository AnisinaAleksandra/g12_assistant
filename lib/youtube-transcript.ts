/**
 * YouTube Transcript Extractor
 * 
 * Получает транскрипты (субтитры) с YouTube видео для использования в RAG системе.
 * 
 * Использование:
 * ```typescript
 * const transcript = await getYouTubeTranscript('VIDEO_ID')
 * const chunks = splitTranscriptIntoChunks(transcript, 500)
 * ```
 */

interface TranscriptItem {
  text: string
  start: number
  duration: number
}

interface TranscriptChunk {
  text: string
  startTime: number
  endTime: number
  videoId: string
  videoUrl: string
}

/**
 * Извлекает ID видео из YouTube URL
 */
export function extractVideoId(urlOrId: string): string | null {
  // Если это уже ID (11 символов)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId
  }

  // Извлекаем из различных форматов URL
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = urlOrId.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Получает транскрипт видео с YouTube
 * Пробует несколько методов для получения субтитров
 */
export async function getYouTubeTranscript(
  videoIdOrUrl: string,
  language: string = "ru"
): Promise<TranscriptItem[]> {
  const videoId = extractVideoId(videoIdOrUrl)
  if (!videoId) {
    throw new Error(`Invalid YouTube URL or video ID: ${videoIdOrUrl}`)
  }

  // Метод 1: Пробуем использовать библиотеку youtube-transcript (если установлена)
  try {
    // @ts-ignore - динамический импорт
    const { YoutubeTranscript } = await import("youtube-transcript")
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: language,
    })
    
    return transcript.map((item: any) => ({
      text: item.text,
      start: item.offset / 1000, // конвертируем миллисекунды в секунды
      duration: item.duration / 1000,
    }))
  } catch (importError) {
    // Библиотека не установлена, используем альтернативный метод
    console.log("youtube-transcript not available, using alternative method")
  }

  // Метод 2: Используем публичный API YouTube для получения субтитров
  try {
    const languages = [language, "en", "ru"] // Пробуем несколько языков
    let lastError: Error | null = null

    for (const lang of languages) {
      try {
        const videoInfoUrl = `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}&fmt=srv3`
        
        const response = await fetch(videoInfoUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "text/xml",
          },
        })

        if (response.ok) {
          const xmlText = await response.text()
          const parsed = parseYouTubeXML(xmlText)
          if (parsed.length > 0) {
            return parsed
          }
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        continue
      }
    }

    if (lastError) {
      throw lastError
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[YouTube Transcript] Error for video ${videoId}:`, errorMessage)
    
    // Не бросаем ошибку, возвращаем пустой массив
    // Это позволяет системе продолжать работу даже если некоторые видео не имеют субтитров
    return []
  }

  // Если дошли сюда, значит транскрипт недоступен
  console.warn(`[YouTube Transcript] No transcript available for video ${videoId}`)
  return []
}

/**
 * Парсит XML субтитры YouTube
 */
function parseYouTubeXML(xmlText: string): TranscriptItem[] {
  const items: TranscriptItem[] = []
  
  // Простой парсинг XML (можно использовать более надежный XML парсер)
  const textRegex = /<text start="([\d.]+)" dur="([\d.]+)">(.*?)<\/text>/g
  let match

  while ((match = textRegex.exec(xmlText)) !== null) {
    const start = parseFloat(match[1])
    const duration = parseFloat(match[2])
    let text = match[3]
    
    // Декодируем HTML entities
    text = text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, "") // Удаляем HTML теги
      .trim()

    if (text) {
      items.push({ text, start, duration })
    }
  }

  return items
}

/**
 * Разбивает транскрипт на чанки для RAG
 */
export function splitTranscriptIntoChunks(
  transcript: TranscriptItem[],
  chunkSize: number = 500,
  overlap: number = 50
): TranscriptChunk[] {
  if (transcript.length === 0) {
    return []
  }

  const chunks: TranscriptChunk[] = []
  const videoId = "unknown" // Можно передавать отдельно
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  // Объединяем все тексты
  let fullText = transcript.map((item) => item.text).join(" ")
  const words = fullText.split(/\s+/)
  
  let currentChunk: string[] = []
  let currentLength = 0
  let chunkStartTime = transcript[0]?.start || 0
  let chunkEndTime = transcript[0]?.start || 0

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const wordLength = word.length + 1 // +1 для пробела

    // Находим время для текущего слова
    const wordIndex = fullText.indexOf(word, currentLength)
    const relativePos = wordIndex / fullText.length
    const transcriptIndex = Math.floor(relativePos * transcript.length)
    const currentItem = transcript[transcriptIndex] || transcript[transcript.length - 1]
    chunkEndTime = currentItem.start + currentItem.duration

    if (currentLength + wordLength > chunkSize && currentChunk.length > 0) {
      // Сохраняем текущий чанк
      chunks.push({
        text: currentChunk.join(" "),
        startTime: chunkStartTime,
        endTime: chunkEndTime,
        videoId,
        videoUrl,
      })

      // Начинаем новый чанк с overlap
      const overlapWords = Math.floor((overlap / chunkSize) * currentChunk.length)
      currentChunk = currentChunk.slice(-overlapWords)
      currentLength = currentChunk.join(" ").length
      chunkStartTime = currentItem.start
    }

    currentChunk.push(word)
    currentLength += wordLength
  }

  // Добавляем последний чанк
  if (currentChunk.length > 0) {
    chunks.push({
      text: currentChunk.join(" "),
      startTime: chunkStartTime,
      endTime: chunkEndTime,
      videoId,
      videoUrl,
    })
  }

  return chunks
}

/**
 * Получает транскрипт и сразу разбивает на чанки
 */
export async function getYouTubeTranscriptChunks(
  videoIdOrUrl: string,
  chunkSize: number = 500,
  language: string = "ru"
): Promise<TranscriptChunk[]> {
  const videoId = extractVideoId(videoIdOrUrl)
  if (!videoId) {
    throw new Error(`Invalid YouTube URL or video ID: ${videoIdOrUrl}`)
  }

  const transcript = await getYouTubeTranscript(videoId, language)
  const chunks = splitTranscriptIntoChunks(transcript, chunkSize)
  
  // Добавляем videoId и videoUrl к каждому чанку
  return chunks.map((chunk) => ({
    ...chunk,
    videoId,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
  }))
}

/**
 * Форматирует чанк для использования в RAG
 */
export function formatChunkForRAG(chunk: TranscriptChunk, videoTitle?: string): string {
  const timeStart = formatTime(chunk.startTime)
  const timeEnd = formatTime(chunk.endTime)
  
  let formatted = `[YouTube Video${videoTitle ? `: ${videoTitle}` : ""}]\n`
  formatted += `Time: ${timeStart} - ${timeEnd}\n`
  formatted += `URL: ${chunk.videoUrl}\n\n`
  formatted += `Content:\n${chunk.text}`

  return formatted
}

/**
 * Форматирует время в читаемый формат
 */
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

