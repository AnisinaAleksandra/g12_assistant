/**
 * Утилита для отладки RAG системы
 * Помогает понять, почему возвращаются одни и те же ответы
 */

import { findRelevantDocs } from "./grafana-docs"
import { getCombinedRAGProvider } from "./chat-service/providers/combined-rag-provider"

/**
 * Тестирует поиск для разных запросов
 */
export function testRAGSearch(queries: string[]) {
  console.log("\n=== RAG Search Test ===\n")
  
  queries.forEach((query) => {
    console.log(`Query: "${query}"`)
    
    // Тест Grafana RAG
    const grafanaResults = findRelevantDocs(query, 3)
    console.log("Grafana RAG results:")
    grafanaResults.forEach((doc, index) => {
      console.log(`  ${index + 1}. [Score: ${doc.score || 0}] ${doc.topic}`)
    })
    
    // Тест Combined RAG
    const combinedRAG = getCombinedRAGProvider()
    const combinedResults = combinedRAG.findRelevantDocs(query, 3)
    console.log("Combined RAG results:")
    combinedResults.forEach((doc, index) => {
      console.log(`  ${index + 1}. [Score: ${doc.score || 0}] ${doc.topic}`)
    })
    
    console.log("")
  })
}

/**
 * Сравнивает результаты для похожих запросов
 */
export function compareSimilarQueries(queries: string[]) {
  console.log("\n=== Comparing Similar Queries ===\n")
  
  const results = queries.map((query) => {
    const docs = findRelevantDocs(query, 3)
    return {
      query,
      topics: docs.map((d) => d.topic),
      scores: docs.map((d) => d.score || 0),
    }
  })
  
  console.table(results)
  
  // Проверяем на дубликаты
  const allTopics = results.flatMap((r) => r.topics)
  const uniqueTopics = new Set(allTopics)
  
  console.log(`\nUnique topics found: ${uniqueTopics.size}`)
  console.log(`Total results: ${allTopics.length}`)
  console.log(`Diversity: ${((uniqueTopics.size / allTopics.length) * 100).toFixed(1)}%`)
}

// Пример использования (можно вызвать из консоли или API)
if (typeof window === "undefined" && process.env.NODE_ENV === "development") {
  // Автоматический тест при разработке
  const testQueries = [
    "provisioning",
    "Can I use Active Directory?",
    "How do I set up OAuth?",
    "dashboard",
    "data source",
    "alerts",
  ]
  
  // Раскомментируйте для автоматического тестирования
  // testRAGSearch(testQueries)
  // compareSimilarQueries(testQueries)
}


