-- Create user_facts table for RAG Memory
CREATE TABLE IF NOT EXISTS public.user_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fact TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.user_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own facts"
    ON public.user_facts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own facts"
    ON public.user_facts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own facts"
    ON public.user_facts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own facts"
    ON public.user_facts FOR DELETE
    USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS user_facts_user_id_idx ON public.user_facts(user_id);
