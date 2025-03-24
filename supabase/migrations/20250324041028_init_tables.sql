-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create drafts table
CREATE TABLE IF NOT EXISTS public.drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL,
  user_id UUID NOT NULL,
  ideas JSONB,
  foundation JSONB,
  evaluation JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create writer_profiles table
CREATE TABLE IF NOT EXISTS public.writer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  evaluations JSONB[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add row level security (RLS) policies
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writer_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own drafts"
ON public.drafts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drafts"
ON public.drafts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts"
ON public.drafts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts"
ON public.drafts
FOR DELETE
USING (auth.uid() = user_id);

-- Profile policies
CREATE POLICY "Users can view their own profile"
ON public.writer_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.writer_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.drafts
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.writer_profiles
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_drafts_user_id ON public.drafts(user_id);
CREATE INDEX idx_writer_profiles_user_id ON public.writer_profiles(user_id); 