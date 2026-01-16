-- Create event_types table to match the backend expectations
-- Enable UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- EVENT TYPES TABLE
CREATE TABLE IF NOT EXISTS public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_types_user_id ON public.event_types(user_id);
CREATE INDEX IF NOT EXISTS idx_event_types_slug ON public.event_types(slug);
CREATE INDEX IF NOT EXISTS idx_event_types_is_active ON public.event_types(is_active);

-- Disable RLS (to match your other tables)
ALTER TABLE public.event_types DISABLE ROW LEVEL SECURITY;
