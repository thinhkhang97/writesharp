-- Create drafts table
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled - ' || TO_CHAR(NOW(), 'YYYY-MM-DD'),
  content TEXT,
  foundation JSONB DEFAULT '{"purpose": "", "audience": "", "topic": ""}',
  ideas JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Feedback Ready')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for quickly finding drafts by user_id
CREATE INDEX IF NOT EXISTS drafts_user_id_idx ON drafts(user_id);
CREATE INDEX IF NOT EXISTS drafts_updated_at_idx ON drafts(updated_at DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own drafts
CREATE POLICY "Users can view their own drafts" 
ON drafts FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own drafts
CREATE POLICY "Users can create their own drafts" 
ON drafts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own drafts
CREATE POLICY "Users can update their own drafts" 
ON drafts FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own drafts
CREATE POLICY "Users can delete their own drafts" 
ON drafts FOR DELETE 
USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on each update
CREATE TRIGGER update_drafts_updated_at
BEFORE UPDATE ON drafts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 