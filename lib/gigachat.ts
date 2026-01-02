/**
 * GigaChat API client
 * Documentation: https://developers.sber.ru/portal/products/gigachat
 */

import { randomUUID } from "crypto"

// Disable SSL certificate validation for GigaChat API
// GigaChat uses self-signed certificates
// WARNING: This is a security risk, but required for GigaChat API to work
// Only disable in development or if you trust the GigaChat infrastructure
if (process.env.GIGACHAT_REJECT_UNAUTHORIZED !== "true") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
}

interface GigaChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface GigaChatResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

let accessToken: string | null = null
let tokenExpiry: number = 0

/**
 * Reset access token (used when token expires or gets 401 error)
 */
function resetAccessToken(): void {
  accessToken = null
  tokenExpiry = 0
}

/**
 * Get access token from GigaChat OAuth
 * @param forceRefresh - Force token refresh even if current token is still valid
 */
async function getAccessToken(forceRefresh: boolean = false): Promise<string> {
  const clientId = process.env.GIGACHAT_CLIENT_ID
  const clientSecret = process.env.GIGACHAT_CLIENT_SECRET
  const scope = process.env.GIGACHAT_SCOPE || "GIGACHAT_API_PERS"

  if (!clientId || !clientSecret) {
    throw new Error("GIGACHAT_CLIENT_ID and GIGACHAT_CLIENT_SECRET must be set")
  }

  // Return cached token if still valid (unless force refresh)
  if (!forceRefresh && accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  const authUrl = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  // Создаем AbortController для таймаута
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 секунд таймаут

  try {
    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
        RqUID: randomUUID(),
        Accept: "application/json",
      },
      body: `scope=${scope}`,
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GigaChat auth failed: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    accessToken = data.access_token
    
    // expires_at is unix timestamp in milliseconds (according to API spec)
    // Refresh 5 minutes (300000 ms) early for safety
    if (data.expires_at) {
      // Check if expires_at is in milliseconds (>= 1000000000000) or seconds
      const expiresAt = data.expires_at >= 1000000000000 
        ? data.expires_at 
        : data.expires_at * 1000
      tokenExpiry = expiresAt - 300000 // 5 minutes buffer
    } else {
      // Fallback: assume 30 minutes from now
      tokenExpiry = Date.now() + (30 * 60 - 5) * 1000
    }

    return accessToken
  } catch (error: any) {
    clearTimeout(timeoutId)
    
    // Reset token on error
    resetAccessToken()
    
    // Обрабатываем различные типы ошибок
    if (error.name === "AbortError") {
      throw new Error("GigaChat auth timeout: Connection timed out after 10 seconds")
    }
    
    if (error.code === "SELF_SIGNED_CERT_IN_CHAIN" || error.message?.includes("certificate")) {
      throw new Error("GigaChat SSL certificate error. Set GIGACHAT_REJECT_UNAUTHORIZED=true to disable SSL verification")
    }
    
    if (error.message?.includes("timeout") || error.message?.includes("TIMEOUT")) {
      throw new Error("GigaChat connection timeout. Please check your network connection.")
    }
    
    throw error
  }
}

/**
 * Generate text using GigaChat API
 */
export async function generateTextWithGigaChat(
  messages: GigaChatMessage[],
  model?: string
): Promise<string> {
  const modelName = model || process.env.GIGACHAT_MODEL || "GigaChat/GigaChat-Pro"
  const apiUrl = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"

  // Helper function to make API request
  const makeRequest = async (token: string, isRetry: boolean = false): Promise<string> => {
    // Создаем AbortController для таймаута
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 секунд таймаут

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        let errorData: any = null
        
        // Try to parse error as JSON
        try {
          errorData = JSON.parse(errorText)
        } catch {
          // Not JSON, use text as is
        }
        
        const errorMessage = errorData?.message || errorText
        const fullErrorMessage = `GigaChat API error: ${response.status} ${errorMessage}`
        
        // Handle 401 Unauthorized - token expired
        // Check both status code and error message
        const isTokenExpired = response.status === 401 || 
          (errorData && (errorData.message?.toLowerCase().includes("token has expired") ||
                         errorData.message?.toLowerCase().includes("unauthorized")))
        
        if (isTokenExpired && !isRetry) {
          console.log("[GigaChat] Token expired (401), refreshing token and retrying...")
          // Reset token to force refresh
          resetAccessToken()
          // Get new token and retry once
          const newToken = await getAccessToken(true)
          return makeRequest(newToken, true)
        }
        
        throw new Error(fullErrorMessage)
      }

      const data: GigaChatResponse = await response.json()

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from GigaChat")
      }

      return data.choices[0].message.content
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === "AbortError") {
        throw new Error("GigaChat API timeout: Request timed out after 30 seconds")
      }
      
      throw fetchError
    }
  }

  try {
    const token = await getAccessToken()
    return await makeRequest(token)
  } catch (error: any) {
    // Логируем ошибку, но не пробрасываем дальше - будет fallback на mock
    console.error("GigaChat error:", error.message || error)
    throw error
  }
}

/**
 * Simple mock response for development when GigaChat is not configured
 */
function generateMockResponse(userMessage: string, context: string): string {
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! I'm your Grafana AI assistant. How can I help you with Grafana today?"
  }

  if (lowerMessage.includes("dashboard")) {
    return `Based on the documentation, dashboards in Grafana are composed of panels that visualize your data. You can create a new dashboard from the + menu or import existing dashboards from grafana.com. Panels can display graphs, tables, stats, and more. Use variables to make dashboards dynamic.`
  }

  if (lowerMessage.includes("data source") || lowerMessage.includes("datasource")) {
    return `Grafana supports multiple data sources including Prometheus, InfluxDB, MySQL, PostgreSQL, and Elasticsearch. To add a data source, go to Configuration > Data Sources > Add data source. Configure the connection details and test the connection before saving.`
  }

  if (lowerMessage.includes("alert")) {
    return `Grafana alerting allows you to define alert rules based on your data. Create alert rules from any graph panel. Configure notification channels like email, Slack, or PagerDuty. Alert rules can have multiple conditions and thresholds.`
  }

  if (context && context !== "No specific documentation found for this query.") {
    // Разнообразие в ответах
    const responses = [
      `Based on the Grafana documentation:\n\n${context}\n\nThis should help answer your question about "${userMessage}". If you need more specific information, please let me know!`,
      `Here's what I found in the Grafana documentation:\n\n${context}\n\nDoes this answer your question about "${userMessage}"? Feel free to ask for more details!`,
      `According to the Grafana documentation:\n\n${context}\n\nI hope this helps with "${userMessage}". Let me know if you'd like to know more!`,
      `From the Grafana documentation:\n\n${context}\n\nThis information should address your question: "${userMessage}". Need clarification on anything?`,
    ]
    
    // Выбираем случайный ответ для разнообразия
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    return randomResponse
  }

  return `I'm here to help you with Grafana! Your question: "${userMessage}". 

To provide better assistance, I can help you with:
- Getting started with Grafana
- Setting up data sources
- Creating dashboards
- Configuring alerts
- Using queries and transformations
- Installing plugins
- Authentication and API

What would you like to know more about?`
}

/**
 * Main function to generate AI response
 * Falls back to mock response if GigaChat is not configured
 */
export async function generateAIResponse(
  userMessage: string,
  context: string
): Promise<string> {
  const hasGigaChatConfig =
    process.env.GIGACHAT_CLIENT_ID && process.env.GIGACHAT_CLIENT_SECRET

  if (!hasGigaChatConfig) {
    console.log("[Dev Mode] Using mock response (GigaChat not configured)")
    return generateMockResponse(userMessage, context)
  }

  try {
    const messages: GigaChatMessage[] = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant specializing in Grafana12 documentation and support. Provide clear, concise, and helpful responses based on the documentation provided.",
      },
      {
        role: "user",
        content: `User question: ${userMessage}\n\nRelevant documentation:\n${context}\n\nProvide a clear, concise, and helpful response based ONLY on the documentation provided above. Do not repeat the same information if it was already mentioned. Focus on answering the specific question "${userMessage}". If the question is outside the scope of Grafana, politely redirect to Grafana-related topics. Include code examples when relevant. Make your response unique and tailored to this specific question.`,
      },
    ]

    return await generateTextWithGigaChat(messages)
  } catch (error: any) {
    // Всегда используем fallback на mock при любой ошибке GigaChat
    const errorMessage = error?.message || String(error)
    console.error("[GigaChat] Error, falling back to mock response:", errorMessage)
    
    // Не пробрасываем ошибку дальше, возвращаем mock response
    return generateMockResponse(userMessage, context)
  }
}

