/**
 * Grafana RAG Provider implementation
 */

import type { RAGProvider, RelevantDoc } from "../types"
import {
  findRelevantDocs as findGrafanaDocs,
  generateFollowUpQuestions as generateGrafanaFollowUps,
} from "@/lib/grafana-docs"

export class GrafanaRAGProvider implements RAGProvider {
  findRelevantDocs(query: string, limit = 3): RelevantDoc[] {
    return findGrafanaDocs(query, limit)
  }

  generateFollowUpQuestions(topic: string): string[] {
    return generateGrafanaFollowUps(topic)
  }
}

export const grafanaRAGProvider = new GrafanaRAGProvider()


