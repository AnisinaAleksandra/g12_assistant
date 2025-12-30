/**
 * GigaChat AI Provider implementation
 */

import type { AIProvider } from "../types"
import { generateAIResponse } from "@/lib/gigachat"

export class GigaChatProvider implements AIProvider {
  async generateResponse(userMessage: string, context: string): Promise<string> {
    return generateAIResponse(userMessage, context)
  }
}

export const gigachatProvider = new GigaChatProvider()

