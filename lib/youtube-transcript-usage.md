# Использование YouTube Transcript для RAG

## Установка зависимостей

Для более надежной работы рекомендуется установить пакет для работы с YouTube:

```bash
npm install youtube-transcript
```

Или использовать альтернативные методы (см. ниже).

## Методы получения транскриптов

### Метод 1: Использование библиотеки youtube-transcript (рекомендуется)

```typescript
import { YoutubeTranscript } from 'youtube-transcript'

const transcript = await YoutubeTranscript.fetchTranscript('VIDEO_ID')
const text = transcript.map(item => item.text).join(' ')
```

### Метод 2: Использование yt-dlp (самый надежный)

```bash
# Установка yt-dlp
brew install yt-dlp  # macOS
# или
pip install yt-dlp   # Python

# Получение субтитров
yt-dlp --write-auto-sub --sub-lang ru --skip-download "VIDEO_URL"
```

### Метод 3: Использование YouTube Data API v3

Требует API ключ, но самый официальный способ.

## Использование в проекте

### 1. Импорт видео в RAG систему

```typescript
// Через API
const response = await fetch('/api/youtube/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoIds: ['dQw4w9WgXcQ'],
    videoUrls: ['https://www.youtube.com/watch?v=VIDEO_ID']
  })
})
```

### 2. Использование в чат-сервисе

```typescript
import { YouTubeRAGProvider } from '@/lib/youtube-rag-provider'
import { createChatHandler } from '@/lib/chat-service'
import { gigachatProvider } from '@/lib/chat-service/providers/gigachat-provider'

const youtubeRAG = new YouTubeRAGProvider()
await youtubeRAG.addVideo('VIDEO_ID', 'Название видео')

export const POST = createChatHandler({
  aiProvider: gigachatProvider,
  ragProvider: youtubeRAG,
})
```

### 3. Программное добавление видео

```typescript
import { YouTubeRAGProvider } from '@/lib/youtube-rag-provider'

const provider = new YouTubeRAGProvider()

// Добавить одно видео
await provider.addVideo('https://www.youtube.com/watch?v=VIDEO_ID', 'Название')

// Добавить несколько видео
await provider.addVideos([
  'VIDEO_ID_1',
  'VIDEO_ID_2',
  'https://www.youtube.com/watch?v=VIDEO_ID_3'
])

// Использовать в поиске
const docs = provider.findRelevantDocs('мой запрос', 5)
```

## Примеры использования

### Пример 1: Импорт плейлиста

```typescript
// Получить список видео из плейлиста (требует YouTube API)
const playlistId = 'PLrAXtmRdnEQy6nuLMH7P1p5Q5vNTzJ2hM'
// ... получение списка видео ...

const provider = new YouTubeRAGProvider()
await provider.addVideos(videoIds)
```

### Пример 2: Сохранение в базу данных

```typescript
// Сохранить чанки в Supabase/другую БД
const chunks = await getYouTubeTranscriptChunks('VIDEO_ID')

for (const chunk of chunks) {
  await supabase.from('youtube_chunks').insert({
    video_id: chunk.videoId,
    text: chunk.text,
    start_time: chunk.startTime,
    end_time: chunk.endTime,
    embedding: await generateEmbedding(chunk.text) // для векторного поиска
  })
}
```

### Пример 3: Комбинирование с другими источниками

```typescript
import { YouTubeRAGProvider } from '@/lib/youtube-rag-provider'
import { GrafanaRAGProvider } from '@/lib/chat-service/providers/grafana-rag-provider'

class CombinedRAGProvider implements RAGProvider {
  private youtube = new YouTubeRAGProvider()
  private grafana = new GrafanaRAGProvider()

  findRelevantDocs(query: string, limit: number) {
    const youtubeDocs = this.youtube.findRelevantDocs(query, limit)
    const grafanaDocs = this.grafana.findRelevantDocs(query, limit)
    
    // Объединяем и сортируем по релевантности
    return [...youtubeDocs, ...grafanaDocs]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit)
  }
}
```

## Ограничения

1. **Автоматические субтитры**: Не все видео имеют автоматические субтитры
2. **Язык**: Может потребоваться указать язык субтитров
3. **Rate limiting**: YouTube может ограничивать частые запросы
4. **Точность**: Автоматические субтитры могут содержать ошибки

## Улучшения

1. **Векторный поиск**: Использовать embeddings для более точного поиска
2. **Кэширование**: Сохранять транскрипты в БД
3. **Обработка ошибок**: Обрабатывать случаи, когда субтитры недоступны
4. **Метаданные**: Сохранять название, описание, теги видео

