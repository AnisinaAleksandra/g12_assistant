/**
 * Supabase Database Provider implementation
 */

import type { DatabaseProvider } from "../types"
import { createClient } from "@/lib/supabase/server"

export class SupabaseDBProvider implements DatabaseProvider {
  async createConversation(title: string): Promise<string> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("conversations")
      .insert({ title })
      .select()
      .single()

    if (error) throw error
    return data.id
  }

  async saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      role,
      content,
    })

    if (error) throw error
  }

  async updateConversation(conversationId: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId)

    if (error) throw error
  }
}

export const supabaseDBProvider = new SupabaseDBProvider()


