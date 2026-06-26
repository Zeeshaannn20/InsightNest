-- ============================================================
-- InsightNest LMS — Recorded Lectures
-- Migration 007: recorded_lectures table and RLS policies
-- ============================================================

CREATE TABLE IF NOT EXISTS public.recorded_lectures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for performance on queries filtering by course_id
CREATE INDEX IF NOT EXISTS idx_recorded_lectures_course ON public.recorded_lectures(course_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.recorded_lectures ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy: Admins, Course Instructors, and Enrolled Students
CREATE POLICY "Select recorded lectures" ON public.recorded_lectures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = course_id AND e.student_id = auth.uid() AND e.status = 'active'
    )
  );

-- 2. INSERT Policy: Admins and Course Instructors
CREATE POLICY "Insert recorded lectures" ON public.recorded_lectures
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
  );

-- 3. UPDATE Policy: Admins and Course Instructors
CREATE POLICY "Update recorded lectures" ON public.recorded_lectures
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
  );

-- 4. DELETE Policy: Admins and Course Instructors
CREATE POLICY "Delete recorded lectures" ON public.recorded_lectures
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
  );
