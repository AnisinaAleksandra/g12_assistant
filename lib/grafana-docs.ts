// Grafana12 documentation knowledge base for RAG
export const grafanaDocsKnowledge = [
  {
    topic: "Getting Started",
    content: `Grafana12 is an open-source platform for monitoring and observability. 
    To get started, download and install Grafana from the official website. 
    The default port is 3000, and the default login is admin/admin.`,
    keywords: ["install", "setup", "getting started", "download", "login"],
  },
  {
    topic: "Data Sources",
    content: `Grafana supports multiple data sources including Prometheus, InfluxDB, MySQL, PostgreSQL, and Elasticsearch. 
    To add a data source, go to Configuration > Data Sources > Add data source. 
    Configure the connection details and test the connection before saving.`,
    keywords: ["data source", "prometheus", "influxdb", "mysql", "postgresql", "elasticsearch", "connection"],
  },
  {
    topic: "Dashboards",
    content: `Dashboards in Grafana are composed of panels that visualize your data. 
    You can create a new dashboard from the + menu or import existing dashboards from grafana.com. 
    Panels can display graphs, tables, stats, and more. Use variables to make dashboards dynamic.`,
    keywords: ["dashboard", "panel", "visualization", "graph", "table", "import", "variable"],
  },
  {
    topic: "Alerts",
    content: `Grafana alerting allows you to define alert rules based on your data. 
    Create alert rules from any graph panel. Configure notification channels like email, Slack, or PagerDuty. 
    Alert rules can have multiple conditions and thresholds.`,
    keywords: ["alert", "notification", "slack", "email", "pagerduty", "threshold", "rule"],
  },
  {
    topic: "Queries",
    content: `Each panel in Grafana has a query editor specific to its data source. 
    For Prometheus, use PromQL. For SQL databases, write SQL queries. 
    Use query transformations to modify data before visualization. 
    The query editor supports autocomplete and syntax highlighting.`,
    keywords: ["query", "promql", "sql", "transformation", "editor"],
  },
  {
    topic: "Plugins",
    content: `Grafana has a rich ecosystem of plugins including data source plugins, panel plugins, and app plugins. 
    Install plugins via the Grafana CLI or the UI. Popular plugins include the worldmap panel and the clock panel. 
    You can also develop custom plugins using the Grafana SDK.`,
    keywords: ["plugin", "extension", "custom", "worldmap", "sdk"],
  },
  {
    topic: "Authentication",
    content: `Grafana supports multiple authentication methods including basic auth, OAuth, LDAP, and SAML. 
    Configure authentication in the grafana.ini file or via environment variables. 
    Set up organizations and teams to manage user access and permissions.`,
    keywords: ["auth", "authentication", "oauth", "ldap", "saml", "login", "user", "permission"],
  },
  {
    topic: "API",
    content: `Grafana provides a comprehensive HTTP API for automation. 
    Use the API to create dashboards, data sources, users, and more programmatically. 
    Authentication can be done via API keys or basic auth. 
    API documentation is available at /docs/api on your Grafana instance.`,
    keywords: ["api", "http", "automation", "rest", "endpoint", "key"],
  },
]

// Improved RAG implementation with better relevance scoring
export function findRelevantDocs(query: string, limit = 3) {
  const queryLower = query.toLowerCase().trim()
  const queryWords = queryLower
    .split(/\s+/)
    .filter((word) => word.length > 2) // Игнорируем короткие слова
    .map((word) => word.replace(/[^\w]/g, "")) // Убираем пунктуацию

  if (queryWords.length === 0) {
    // Если запрос слишком короткий, возвращаем первые документы
    return grafanaDocsKnowledge.slice(0, limit)
  }

  // Score each document based on keyword and content matches
  const scored = grafanaDocsKnowledge.map((doc) => {
    let score = 0
    const docContentLower = doc.content.toLowerCase()
    const docTopicLower = doc.topic.toLowerCase()

    // 1. Точное совпадение с темой (высокий приоритет)
    if (queryLower === docTopicLower || docTopicLower.includes(queryLower)) {
      score += 20
    }

    // 2. Совпадение ключевых слов в теме
    queryWords.forEach((word) => {
      if (docTopicLower.includes(word)) {
        score += 10
      }
    })

    // 3. Проверка ключевых слов документа
    doc.keywords.forEach((keyword) => {
      const keywordLower = keyword.toLowerCase()
      
      // Точное совпадение ключевого слова
      if (queryWords.some((word) => word === keywordLower)) {
        score += 8
      }
      
      // Частичное совпадение
      if (queryWords.some((word) => keywordLower.includes(word) || word.includes(keywordLower))) {
        score += 5
      }
      
      // Совпадение в запросе
      if (queryLower.includes(keywordLower)) {
        score += 3
      }
    })

    // 4. Совпадение в содержимом (более низкий приоритет, но все равно важно)
    if (docContentLower.includes(queryLower)) {
      score += 6
    }

    // 5. Совпадение отдельных слов в содержимом
    let wordMatches = 0
    queryWords.forEach((word) => {
      if (word.length > 3) {
        const wordRegex = new RegExp(`\\b${word}\\b`, "i")
        if (wordRegex.test(docContentLower)) {
          wordMatches++
          score += 2
        } else if (docContentLower.includes(word)) {
          score += 1
        }
      }
    })

    // Бонус за множественные совпадения слов
    if (wordMatches === queryWords.length && queryWords.length > 1) {
      score += 5
    }

    // 6. Штраф за слишком общие запросы (чтобы не всегда возвращать одни и те же документы)
    const isGenericQuery = ["help", "what", "how", "tell", "show", "explain"].some(
      (generic) => queryLower.startsWith(generic)
    )
    if (isGenericQuery && score < 10) {
      // Для общих запросов добавляем случайность
      score += Math.random() * 3
    }

    return { ...doc, score }
  })

  // Фильтруем и сортируем
  const filtered = scored.filter((doc) => doc.score > 0)

  // Если нет совпадений, возвращаем документы с наименьшим score (чтобы не возвращать пустой результат)
  if (filtered.length === 0) {
    return grafanaDocsKnowledge.slice(0, limit)
  }

  // Сортируем по score
  const sorted = filtered.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    // Если score одинаковый, добавляем небольшую случайность для разнообразия
    return Math.random() - 0.5
  })

  // Возвращаем топ результаты
  return sorted.slice(0, limit)
}

// Generate follow-up questions based on topic
export function generateFollowUpQuestions(topic: string): string[] {
  const followUps: Record<string, string[]> = {
    "Getting Started": [
      "How do I change the default port?",
      "What are the system requirements?",
      "How do I upgrade Grafana?",
    ],
    "Data Sources": [
      "How do I configure Prometheus?",
      "Can I use multiple data sources?",
      "How do I troubleshoot connection issues?",
    ],
    Dashboards: ["How do I share a dashboard?", "Can I export dashboards?", "How do I use dashboard variables?"],
    Alerts: [
      "How do I set up Slack notifications?",
      "Can I have multiple alert conditions?",
      "How do I silence alerts?",
    ],
    Queries: ["What is PromQL?", "How do I join multiple queries?", "Can I use regular expressions in queries?"],
    Plugins: ["How do I install a plugin?", "Where can I find community plugins?", "How do I develop a custom plugin?"],
    Authentication: ["How do I set up OAuth?", "Can I use Active Directory?", "How do I manage user permissions?"],
    API: ["How do I create an API key?", "Can I automate dashboard creation?", "What are the API rate limits?"],
  }

  return followUps[topic] || ["Tell me more about Grafana", "How do I get started?", "What are the main features?"]
}
