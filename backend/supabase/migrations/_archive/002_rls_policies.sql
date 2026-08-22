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

-- Trigger Function to prevent non-admins from self-promoting or activating their profile
CREATE OR REPLACE FUNCTION public.check_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active) 
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden: Only administrators can modify user roles or activation status.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to enforce profile update policy
CREATE OR REPLACE TRIGGER restrict_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_update();

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
