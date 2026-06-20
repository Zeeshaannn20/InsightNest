-- ============================================================
-- InsightNest LMS — Database Schema
-- Migration 001: Core Tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_enrollment_id ON public.profiles(enrollment_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- ============================================================
-- 2. COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC(10, 2) DEFAULT 0,
  duration_weeks INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_published ON public.courses(is_published);

-- ============================================================
-- 3. MODULES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_modules_course ON public.modules(course_id);

-- ============================================================
-- 4. LESSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'pdf', 'notes', 'link', 'recording')),
  content_url TEXT,
  content_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lessons_module ON public.lessons(module_id);

-- ============================================================
-- 5. ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);

-- ============================================================
-- 6. LIVE SESSIONS (Google Meet)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  meet_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_course ON public.live_sessions(course_id);
CREATE INDEX idx_sessions_date ON public.live_sessions(session_date);
CREATE INDEX idx_sessions_status ON public.live_sessions(status);

-- ============================================================
-- 7. ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  join_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  UNIQUE(student_id, session_id)
);

CREATE INDEX idx_attendance_student ON public.attendance(student_id);
CREATE INDEX idx_attendance_session ON public.attendance(session_id);

-- ============================================================
-- 8. ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  instructions TEXT,
  max_marks INTEGER NOT NULL DEFAULT 100,
  deadline TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assignments_course ON public.assignments(course_id);

-- ============================================================
-- 9. SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT,
  file_name TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  marks INTEGER,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late', 'resubmit')),
  graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  graded_at TIMESTAMPTZ,
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_student ON public.submissions(student_id);

-- ============================================================
-- 10. QUIZZES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  passing_percentage INTEGER NOT NULL DEFAULT 60,
  total_marks INTEGER NOT NULL DEFAULT 100,
  time_limit_minutes INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quizzes_course ON public.quizzes(course_id);

-- ============================================================
-- 11. QUIZ QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_option INTEGER NOT NULL,
  marks INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);

-- ============================================================
-- 12. QUIZ RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_marks INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  passed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(quiz_id, student_id)
);

CREATE INDEX idx_quiz_results_student ON public.quiz_results(student_id);

-- ============================================================
-- 13. ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('update', 'deadline', 'notification', 'general')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_course ON public.announcements(course_id);

-- ============================================================
-- 14. CHAT MESSAGES (Realtime)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  reply_to UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_course ON public.chat_messages(course_id);
CREATE INDEX idx_chat_sender ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_created ON public.chat_messages(created_at);

-- ============================================================
-- 15. LESSON PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_student ON public.lesson_progress(student_id);

-- ============================================================
-- 16. ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_created ON public.activity_logs(created_at);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_courses
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_live_sessions
  BEFORE UPDATE ON public.live_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_assignments
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_quizzes
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE((NEW.raw_user_meta_data->>'is_active')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Progress calculation function
CREATE OR REPLACE FUNCTION public.calculate_progress(p_student_id UUID, p_course_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  lesson_pct NUMERIC;
  total_assignments INTEGER;
  submitted_assignments INTEGER;
  assignment_pct NUMERIC;
  total_quiz_marks NUMERIC;
  earned_quiz_marks NUMERIC;
  quiz_pct NUMERIC;
  overall NUMERIC;
BEGIN
  -- Lesson completion (40%)
  SELECT COUNT(*) INTO total_lessons
  FROM public.lessons l
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.course_id = p_course_id;

  SELECT COUNT(*) INTO completed_lessons
  FROM public.lesson_progress lp
  JOIN public.lessons l ON lp.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE lp.student_id = p_student_id AND m.course_id = p_course_id;

  IF total_lessons > 0 THEN
    lesson_pct := (completed_lessons::NUMERIC / total_lessons) * 100;
  ELSE
    lesson_pct := 0;
  END IF;

  -- Assignment completion (30%)
  SELECT COUNT(*) INTO total_assignments
  FROM public.assignments WHERE course_id = p_course_id;

  SELECT COUNT(*) INTO submitted_assignments
  FROM public.submissions s
  JOIN public.assignments a ON s.assignment_id = a.id
  WHERE s.student_id = p_student_id AND a.course_id = p_course_id;

  IF total_assignments > 0 THEN
    assignment_pct := (submitted_assignments::NUMERIC / total_assignments) * 100;
  ELSE
    assignment_pct := 0;
  END IF;

  -- Quiz performance (30%)
  SELECT COALESCE(SUM(total_marks), 0) INTO total_quiz_marks
  FROM public.quizzes WHERE course_id = p_course_id AND is_published = true;

  SELECT COALESCE(SUM(qr.score), 0) INTO earned_quiz_marks
  FROM public.quiz_results qr
  JOIN public.quizzes q ON qr.quiz_id = q.id
  WHERE qr.student_id = p_student_id AND q.course_id = p_course_id;

  IF total_quiz_marks > 0 THEN
    quiz_pct := (earned_quiz_marks / total_quiz_marks) * 100;
  ELSE
    quiz_pct := 0;
  END IF;

  -- Overall: 40% lessons + 30% assignments + 30% quiz
  overall := (0.4 * lesson_pct) + (0.3 * assignment_pct) + (0.3 * quiz_pct);
  RETURN ROUND(overall, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
-- ============================================================
-- InsightNest LMS — Row Level Security Policies
-- Migration 002: RLS
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: check if current user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is instructor
CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'instructor')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================
-- Users can read their own profile
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Instructors can read student profiles
CREATE POLICY "Instructors read profiles"
  ON public.profiles FOR SELECT
  USING (public.is_instructor());

-- Users can update their own profile (name, phone, avatar)
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can insert/update/delete any profile
CREATE POLICY "Admins manage profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- Allow the trigger to insert profiles (service role)
CREATE POLICY "Service inserts profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- COURSES
-- ============================================================
-- Anyone authenticated can read published courses
CREATE POLICY "Read published courses"
  ON public.courses FOR SELECT
  USING (is_published = true);

-- Admins full access
CREATE POLICY "Admins manage courses"
  ON public.courses FOR ALL
  USING (public.is_admin());

-- Instructors read assigned courses
CREATE POLICY "Instructors read assigned courses"
  ON public.courses FOR SELECT
  USING (instructor_id = auth.uid());

-- ============================================================
-- MODULES
-- ============================================================
-- Read modules of accessible courses
CREATE POLICY "Read modules"
  ON public.modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND (c.is_published = true OR c.instructor_id = auth.uid())
    )
    OR public.is_admin()
  );

-- Admins/instructors manage modules
CREATE POLICY "Admins manage modules"
  ON public.modules FOR ALL
  USING (public.is_admin());

CREATE POLICY "Instructors manage modules"
  ON public.modules FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
  );

CREATE POLICY "Instructors update modules"
  ON public.modules FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
  );

-- ============================================================
-- LESSONS
-- ============================================================
CREATE POLICY "Read lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON m.course_id = c.id
      WHERE m.id = module_id AND (c.is_published = true OR c.instructor_id = auth.uid())
    )
    OR public.is_admin()
  );

CREATE POLICY "Admins manage lessons"
  ON public.lessons FOR ALL
  USING (public.is_admin());

CREATE POLICY "Instructors manage lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON m.course_id = c.id
      WHERE m.id = module_id AND c.instructor_id = auth.uid()
    )
  );

-- ============================================================
-- ENROLLMENTS
-- ============================================================
-- Students read own enrollments
CREATE POLICY "Students read own enrollments"
  ON public.enrollments FOR SELECT
  USING (student_id = auth.uid());

-- Admins full access
CREATE POLICY "Admins manage enrollments"
  ON public.enrollments FOR ALL
  USING (public.is_admin());

-- Instructors read enrollments for their courses
CREATE POLICY "Instructors read enrollments"
  ON public.enrollments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
  );

-- ============================================================
-- LIVE SESSIONS
-- ============================================================
-- Enrolled students can read sessions
CREATE POLICY "Students read sessions"
  ON public.live_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = live_sessions.course_id AND e.student_id = auth.uid()
    )
  );

-- Instructors read/manage their sessions
CREATE POLICY "Instructors manage sessions"
  ON public.live_sessions FOR ALL
  USING (instructor_id = auth.uid() OR public.is_admin());

-- ============================================================
-- ATTENDANCE
-- ============================================================
-- Students read own attendance
CREATE POLICY "Students read own attendance"
  ON public.attendance FOR SELECT
  USING (student_id = auth.uid());

-- Students can mark their own attendance
CREATE POLICY "Students mark attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Admins/instructors full access
CREATE POLICY "Admins manage attendance"
  ON public.attendance FOR ALL
  USING (public.is_admin() OR public.is_instructor());

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
-- Enrolled students can read assignments
CREATE POLICY "Students read assignments"
  ON public.assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = assignments.course_id AND e.student_id = auth.uid()
    )
  );

-- Admins/instructors manage
CREATE POLICY "Admins manage assignments"
  ON public.assignments FOR ALL
  USING (public.is_admin());

CREATE POLICY "Instructors manage assignments"
  ON public.assignments FOR ALL
  USING (created_by = auth.uid());

-- ============================================================
-- SUBMISSIONS
-- ============================================================
-- Students read/create own submissions
CREATE POLICY "Students read own submissions"
  ON public.submissions FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students create submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students update own submissions"
  ON public.submissions FOR UPDATE
  USING (student_id = auth.uid() AND status != 'graded');

-- Admins/instructors read all & grade
CREATE POLICY "Admins manage submissions"
  ON public.submissions FOR ALL
  USING (public.is_admin());

CREATE POLICY "Instructors grade submissions"
  ON public.submissions FOR SELECT
  USING (public.is_instructor());

CREATE POLICY "Instructors update submissions"
  ON public.submissions FOR UPDATE
  USING (public.is_instructor());

-- ============================================================
-- QUIZZES
-- ============================================================
-- Students read published quizzes
CREATE POLICY "Students read quizzes"
  ON public.quizzes FOR SELECT
  USING (
    is_published = true AND EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = quizzes.course_id AND e.student_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage quizzes"
  ON public.quizzes FOR ALL
  USING (public.is_admin());

CREATE POLICY "Instructors manage quizzes"
  ON public.quizzes FOR ALL
  USING (created_by = auth.uid());

-- ============================================================
-- QUIZ QUESTIONS
-- ============================================================
-- Students read questions of published quizzes
CREATE POLICY "Students read questions"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_id AND q.is_published = true
    )
  );

CREATE POLICY "Admins manage questions"
  ON public.quiz_questions FOR ALL
  USING (public.is_admin());

CREATE POLICY "Instructors manage questions"
  ON public.quiz_questions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_id AND q.created_by = auth.uid())
  );

-- ============================================================
-- QUIZ RESULTS
-- ============================================================
-- Students read own results
CREATE POLICY "Students read own results"
  ON public.quiz_results FOR SELECT
  USING (student_id = auth.uid());

-- Students submit results
CREATE POLICY "Students submit results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Admins/instructors read all
CREATE POLICY "Admins manage results"
  ON public.quiz_results FOR ALL
  USING (public.is_admin() OR public.is_instructor());

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
-- Enrolled students read announcements
CREATE POLICY "Students read announcements"
  ON public.announcements FOR SELECT
  USING (
    course_id IS NULL  -- general announcements
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = announcements.course_id AND e.student_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage announcements"
  ON public.announcements FOR ALL
  USING (public.is_admin());

CREATE POLICY "Instructors create announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (public.is_instructor());

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
-- Read messages for enrolled courses
CREATE POLICY "Read chat messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = chat_messages.course_id AND e.student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = chat_messages.course_id AND c.instructor_id = auth.uid()
    )
    OR public.is_admin()
  );

-- Send messages
CREATE POLICY "Send chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- ============================================================
-- LESSON PROGRESS
-- ============================================================
CREATE POLICY "Students read own progress"
  ON public.lesson_progress FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students mark progress"
  ON public.lesson_progress FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins read progress"
  ON public.lesson_progress FOR SELECT
  USING (public.is_admin() OR public.is_instructor());

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
CREATE POLICY "Admins read logs"
  ON public.activity_logs FOR ALL
  USING (public.is_admin());

CREATE POLICY "Users create own logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());
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
