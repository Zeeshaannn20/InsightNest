-- ============================================================
-- 17. GOOGLE CALENDAR / MEET INTEGRATION TOKENS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_google_tokens (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date BIGINT NOT NULL, -- Unix timestamp in milliseconds
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_google_tokens ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to perform operations on their own tokens
CREATE POLICY "Users can manage their own Google tokens"
  ON public.user_google_tokens
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
