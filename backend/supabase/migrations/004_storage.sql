-- ============================================================
-- InsightNest LMS — Storage Buckets
-- Migration 004: Supabase Storage for file uploads
-- ============================================================

-- Create submissions bucket for assignment uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submissions',
  'submissions',
  false,
  52428800,  -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/zip',
    'application/x-zip-compressed',
    'text/x-python',
    'application/x-python-code',
    'text/plain'
  ]
);

-- Create course-assets bucket for lesson resources
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'course-assets',
  'course-assets',
  true,
  104857600  -- 100MB limit
);

-- ============================================================
-- Storage RLS Policies
-- ============================================================

-- Submissions: Students upload to their own folder
CREATE POLICY "Students upload submissions"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'submissions'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Submissions: Students read their own files
CREATE POLICY "Students read own submissions"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'submissions'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Submissions: Admins/Instructors read all submissions
CREATE POLICY "Staff read submissions"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'submissions'
    AND (public.is_admin() OR public.is_instructor())
  );

-- Course assets: Anyone authenticated can read
CREATE POLICY "Read course assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-assets');

-- Course assets: Admins/Instructors can upload
CREATE POLICY "Staff upload course assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course-assets'
    AND (public.is_admin() OR public.is_instructor())
  );

-- Course assets: Admins/Instructors can delete
CREATE POLICY "Staff delete course assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'course-assets'
    AND (public.is_admin() OR public.is_instructor())
  );
