-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth needs)
CREATE POLICY "Allow public to view conversations" ON conversations FOR SELECT USING (true);
CREATE POLICY "Allow public to insert conversations" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to update conversations" ON conversations FOR UPDATE USING (true);
CREATE POLICY "Allow public to delete conversations" ON conversations FOR DELETE USING (true);

CREATE POLICY "Allow public to view messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public to insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to update messages" ON messages FOR UPDATE USING (true);
CREATE POLICY "Allow public to delete messages" ON messages FOR DELETE USING (true);
