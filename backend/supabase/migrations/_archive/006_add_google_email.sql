-- Migration to add google_email to user_google_tokens
ALTER TABLE public.user_google_tokens 
ADD COLUMN IF NOT EXISTS google_email TEXT;
