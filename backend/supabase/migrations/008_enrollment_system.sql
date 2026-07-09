-- 008_enrollment_system.sql
-- Up Migration for dual-path enrollment system

-- ============================================================
-- 1. COURSES
-- ============================================================
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS price_paise INTEGER,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('open', 'closed', 'coming_soon')) DEFAULT 'coming_soon';

-- Update existing course (Data Analyst)
UPDATE public.courses
SET slug = 'data-analyst', price_paise = 299900, status = 'closed', is_published = true
WHERE title ILIKE '%data analyst%' OR title ILIKE '%data analytics%';

-- Insert the Business Analytics course (if it doesn't exist)
INSERT INTO public.courses (title, description, slug, price_paise, currency, status, is_published, duration_weeks)
SELECT 'Business Analyst Fundamentals', 'Master Business Intelligence and Strategy', 'business-analytics', 299900, 'INR', 'coming_soon', true, 4
WHERE NOT EXISTS (
  SELECT 1 FROM public.courses WHERE slug = 'business-analytics'
);

-- ============================================================
-- 2. ENROLLMENTS
-- ============================================================
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('razorpay', 'manual')),
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMPTZ DEFAULT now();

-- Ensure RLS is strictly enforced on enrollments
-- Only allow students to SELECT their own rows. Admins get ALL. Service role bypasses RLS automatically.

DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Allow users to read their own enrollments" ON public.enrollments;

CREATE POLICY "Students can view their own enrollments" 
ON public.enrollments FOR SELECT 
TO authenticated 
USING (student_id = auth.uid());

CREATE POLICY "Admins can manage enrollments" 
ON public.enrollments FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
