-- ============================================================
-- InsightNest — canonical schema baseline
--
-- Generated from the LIVE database. This is the single source of
-- truth for the public schema and supersedes the earlier numbered
-- migrations, which had drifted from production.
--
-- Already applied to production: every statement is guarded so this
-- file is safe to run against the existing database, and reproduces
-- the schema from scratch on a new one.
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------- tables ----------

create table if not exists public.activity_logs (
  id uuid default uuid_generate_v4() not null,
  user_id uuid,
  action text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.announcements (
  id uuid default uuid_generate_v4() not null,
  instructor_id uuid not null,
  course_id uuid,
  title text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.assignments (
  id uuid default uuid_generate_v4() not null,
  module_id uuid,
  course_id uuid not null,
  title text not null,
  description text,
  due_date timestamp with time zone,
  max_file_size bigint default 26214400,
  allowed_file_types text[] default ARRAY['pdf'::text, 'xlsx'::text, 'py'::text, 'ipynb'::text, 'zip'::text, 'pbix'::text, 'sql'::text, 'png'::text, 'jpg'::text],
  created_at timestamp with time zone default now()
);

create table if not exists public.attendance (
  id uuid default uuid_generate_v4() not null,
  student_id uuid not null,
  session_id uuid not null,
  join_timestamp timestamp with time zone default now() not null,
  status text default 'present'::text not null
);

create table if not exists public.certificates (
  id uuid default uuid_generate_v4() not null,
  user_id uuid not null,
  course_id uuid not null,
  certificate_number text not null,
  certificate_url text,
  issued_at timestamp with time zone default now()
);

create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() not null,
  channel_id uuid not null,
  user_id uuid not null,
  content text not null,
  message_type text default 'text'::text,
  metadata jsonb,
  is_ai_response boolean default false,
  parent_message_id uuid,
  created_at timestamp with time zone default now()
);

create table if not exists public.community_channels (
  id uuid default uuid_generate_v4() not null,
  name text not null,
  description text,
  icon text default 'tag'::text,
  order_index integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.courses (
  id uuid default uuid_generate_v4() not null,
  title text not null,
  description text,
  instructor_id uuid,
  status text default 'coming_soon'::text not null,
  thumbnail_url text,
  price numeric(10,2) default 0,
  currency text default 'INR'::text,
  total_lessons integer default 0,
  total_duration interval,
  category text,
  tags text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_published boolean default false not null,
  duration_weeks integer default 4,
  slug text,
  price_paise integer
);

create table if not exists public.enrollments (
  id uuid default uuid_generate_v4() not null,
  student_id uuid not null,
  course_id uuid not null,
  progress_pct numeric(5,2) default 0,
  enrolled_at timestamp with time zone default now(),
  last_accessed timestamp with time zone default now(),
  status text default 'active'::text not null,
  source text,
  razorpay_order_id text,
  razorpay_payment_id text,
  purchased_at timestamp with time zone default now()
);

create table if not exists public.escalated_questions (
  id uuid default uuid_generate_v4() not null,
  student_id uuid not null,
  course_id uuid,
  question text not null,
  ai_response text,
  confidence_score numeric(5,2),
  instructor_response text,
  instructor_id uuid,
  status text default 'pending'::text,
  created_at timestamp with time zone default now(),
  answered_at timestamp with time zone
);

create table if not exists public.lesson_progress (
  id uuid default uuid_generate_v4() not null,
  student_id uuid not null,
  lesson_id uuid not null,
  completed_at timestamp with time zone default now() not null
);

create table if not exists public.lessons (
  id uuid default uuid_generate_v4() not null,
  module_id uuid not null,
  title text not null,
  description text,
  video_url text,
  order_index integer default 0 not null,
  duration interval,
  is_free_preview boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.live_class_attendance (
  id uuid default uuid_generate_v4() not null,
  live_class_id uuid not null,
  user_id uuid not null,
  joined_at timestamp with time zone default now(),
  left_at timestamp with time zone
);

create table if not exists public.live_classes (
  id uuid default uuid_generate_v4() not null,
  course_id uuid,
  instructor_id uuid not null,
  title text not null,
  description text,
  meet_link text not null,
  scheduled_at timestamp with time zone not null,
  duration_minutes integer default 60,
  recording_url text,
  status text default 'scheduled'::text,
  created_at timestamp with time zone default now()
);

create table if not exists public.live_sessions (
  id uuid default uuid_generate_v4() not null,
  course_id uuid not null,
  instructor_id uuid,
  title text not null,
  description text,
  session_date date not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  meet_link text,
  status text default 'scheduled'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.modules (
  id uuid default uuid_generate_v4() not null,
  course_id uuid not null,
  title text not null,
  description text,
  order_index integer default 0 not null,
  lesson_count integer default 0,
  duration interval,
  created_at timestamp with time zone default now()
);

create table if not exists public.notes (
  id uuid default uuid_generate_v4() not null,
  user_id uuid not null,
  lesson_id uuid not null,
  content text not null,
  timestamp_sec integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.notifications (
  id uuid default uuid_generate_v4() not null,
  user_id uuid not null,
  title text not null,
  message text not null,
  type text default 'info'::text,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.payments (
  id uuid default uuid_generate_v4() not null,
  user_id uuid not null,
  amount numeric(10,2) not null,
  currency text default 'INR'::text,
  plan_type text not null,
  payment_method text,
  payment_id text,
  status text default 'pending'::text,
  created_at timestamp with time zone default now()
);

create table if not exists public.profiles (
  id uuid not null,
  enrollment_id text,
  role text default 'student'::text not null,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  is_active boolean default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.quiz_attempts (
  id uuid default uuid_generate_v4() not null,
  quiz_id uuid not null,
  user_id uuid not null,
  score numeric(5,2),
  answers jsonb,
  passed boolean default false,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

create table if not exists public.quiz_questions (
  id uuid default uuid_generate_v4() not null,
  quiz_id uuid not null,
  question text not null,
  question_type text default 'mcq'::text not null,
  options jsonb,
  correct_answer text,
  explanation text,
  points integer default 1,
  order_index integer default 0
);

create table if not exists public.quiz_results (
  id uuid default uuid_generate_v4() not null,
  quiz_id uuid not null,
  student_id uuid not null,
  score integer default 0 not null,
  total_marks integer not null,
  answers jsonb default '{}'::jsonb not null,
  attempted_at timestamp with time zone default now() not null,
  passed boolean default false not null
);

create table if not exists public.quizzes (
  id uuid default uuid_generate_v4() not null,
  module_id uuid,
  course_id uuid not null,
  title text not null,
  description text,
  time_limit_minutes integer,
  passing_score numeric(5,2) default 70,
  max_attempts integer default 3,
  is_randomized boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.recorded_lectures (
  id uuid default uuid_generate_v4() not null,
  course_id uuid not null,
  title text not null,
  youtube_url text not null,
  duration_minutes integer default 0,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.resources (
  id uuid default uuid_generate_v4() not null,
  lesson_id uuid not null,
  title text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  created_at timestamp with time zone default now()
);

create table if not exists public.submissions (
  id uuid default uuid_generate_v4() not null,
  assignment_id uuid not null,
  user_id uuid not null,
  file_url text not null,
  file_name text,
  status text default 'submitted'::text not null,
  feedback text,
  reviewed_by uuid,
  submitted_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone
);

create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() not null,
  user_id uuid not null,
  plan_type text not null,
  status text default 'active'::text,
  starts_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  payment_id uuid,
  created_at timestamp with time zone default now()
);

create table if not exists public.user_google_tokens (
  user_id uuid not null,
  access_token text not null,
  refresh_token text,
  expiry_date bigint not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.video_progress (
  id uuid default uuid_generate_v4() not null,
  user_id uuid not null,
  lesson_id uuid not null,
  last_position_sec integer default 0,
  is_completed boolean default false,
  updated_at timestamp with time zone default now()
);

-- ---------- constraints ----------
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'activity_logs_pkey' and conrelid = 'public.activity_logs'::regclass) then
    alter table public.activity_logs add constraint activity_logs_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'announcements_pkey' and conrelid = 'public.announcements'::regclass) then
    alter table public.announcements add constraint announcements_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'assignments_pkey' and conrelid = 'public.assignments'::regclass) then
    alter table public.assignments add constraint assignments_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'attendance_pkey' and conrelid = 'public.attendance'::regclass) then
    alter table public.attendance add constraint attendance_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'certificates_pkey' and conrelid = 'public.certificates'::regclass) then
    alter table public.certificates add constraint certificates_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'chat_messages_pkey' and conrelid = 'public.chat_messages'::regclass) then
    alter table public.chat_messages add constraint chat_messages_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'community_channels_pkey' and conrelid = 'public.community_channels'::regclass) then
    alter table public.community_channels add constraint community_channels_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'courses_pkey' and conrelid = 'public.courses'::regclass) then
    alter table public.courses add constraint courses_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'enrollments_pkey' and conrelid = 'public.enrollments'::regclass) then
    alter table public.enrollments add constraint enrollments_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'escalated_questions_pkey' and conrelid = 'public.escalated_questions'::regclass) then
    alter table public.escalated_questions add constraint escalated_questions_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'lesson_progress_pkey' and conrelid = 'public.lesson_progress'::regclass) then
    alter table public.lesson_progress add constraint lesson_progress_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'lessons_pkey' and conrelid = 'public.lessons'::regclass) then
    alter table public.lessons add constraint lessons_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'live_class_attendance_pkey' and conrelid = 'public.live_class_attendance'::regclass) then
    alter table public.live_class_attendance add constraint live_class_attendance_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'live_classes_pkey' and conrelid = 'public.live_classes'::regclass) then
    alter table public.live_classes add constraint live_classes_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'live_sessions_pkey' and conrelid = 'public.live_sessions'::regclass) then
    alter table public.live_sessions add constraint live_sessions_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'modules_pkey' and conrelid = 'public.modules'::regclass) then
    alter table public.modules add constraint modules_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'notes_pkey' and conrelid = 'public.notes'::regclass) then
    alter table public.notes add constraint notes_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'notifications_pkey' and conrelid = 'public.notifications'::regclass) then
    alter table public.notifications add constraint notifications_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'payments_pkey' and conrelid = 'public.payments'::regclass) then
    alter table public.payments add constraint payments_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_pkey' and conrelid = 'public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quiz_attempts_pkey' and conrelid = 'public.quiz_attempts'::regclass) then
    alter table public.quiz_attempts add constraint quiz_attempts_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quiz_questions_pkey' and conrelid = 'public.quiz_questions'::regclass) then
    alter table public.quiz_questions add constraint quiz_questions_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quiz_results_pkey' and conrelid = 'public.quiz_results'::regclass) then
    alter table public.quiz_results add constraint quiz_results_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quizzes_pkey' and conrelid = 'public.quizzes'::regclass) then
    alter table public.quizzes add constraint quizzes_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'recorded_lectures_pkey' and conrelid = 'public.recorded_lectures'::regclass) then
    alter table public.recorded_lectures add constraint recorded_lectures_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'resources_pkey' and conrelid = 'public.resources'::regclass) then
    alter table public.resources add constraint resources_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'submissions_pkey' and conrelid = 'public.submissions'::regclass) then
    alter table public.submissions add constraint submissions_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'subscriptions_pkey' and conrelid = 'public.subscriptions'::regclass) then
    alter table public.subscriptions add constraint subscriptions_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'user_google_tokens_pkey' and conrelid = 'public.user_google_tokens'::regclass) then
    alter table public.user_google_tokens add constraint user_google_tokens_pkey PRIMARY KEY (user_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'video_progress_pkey' and conrelid = 'public.video_progress'::regclass) then
    alter table public.video_progress add constraint video_progress_pkey PRIMARY KEY (id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'attendance_student_id_session_id_key' and conrelid = 'public.attendance'::regclass) then
    alter table public.attendance add constraint attendance_student_id_session_id_key UNIQUE (student_id, session_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'certificates_certificate_number_key' and conrelid = 'public.certificates'::regclass) then
    alter table public.certificates add constraint certificates_certificate_number_key UNIQUE (certificate_number);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'certificates_user_id_course_id_key' and conrelid = 'public.certificates'::regclass) then
    alter table public.certificates add constraint certificates_user_id_course_id_key UNIQUE (user_id, course_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'community_channels_name_key' and conrelid = 'public.community_channels'::regclass) then
    alter table public.community_channels add constraint community_channels_name_key UNIQUE (name);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'courses_slug_key' and conrelid = 'public.courses'::regclass) then
    alter table public.courses add constraint courses_slug_key UNIQUE (slug);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'enrollments_razorpay_payment_id_key' and conrelid = 'public.enrollments'::regclass) then
    alter table public.enrollments add constraint enrollments_razorpay_payment_id_key UNIQUE (razorpay_payment_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'enrollments_user_id_course_id_key' and conrelid = 'public.enrollments'::regclass) then
    alter table public.enrollments add constraint enrollments_user_id_course_id_key UNIQUE (student_id, course_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'lesson_progress_student_id_lesson_id_key' and conrelid = 'public.lesson_progress'::regclass) then
    alter table public.lesson_progress add constraint lesson_progress_student_id_lesson_id_key UNIQUE (student_id, lesson_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'live_class_attendance_live_class_id_user_id_key' and conrelid = 'public.live_class_attendance'::regclass) then
    alter table public.live_class_attendance add constraint live_class_attendance_live_class_id_user_id_key UNIQUE (live_class_id, user_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_enrollment_id_key' and conrelid = 'public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_enrollment_id_key UNIQUE (enrollment_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quiz_results_quiz_id_student_id_key' and conrelid = 'public.quiz_results'::regclass) then
    alter table public.quiz_results add constraint quiz_results_quiz_id_student_id_key UNIQUE (quiz_id, student_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'video_progress_user_id_lesson_id_key' and conrelid = 'public.video_progress'::regclass) then
    alter table public.video_progress add constraint video_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'attendance_status_check' and conrelid = 'public.attendance'::regclass) then
    alter table public.attendance add constraint attendance_status_check CHECK ((status = ANY (ARRAY['present'::text, 'absent'::text, 'late'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'chat_messages_message_type_check' and conrelid = 'public.chat_messages'::regclass) then
    alter table public.chat_messages add constraint chat_messages_message_type_check CHECK ((message_type = ANY (ARRAY['text'::text, 'code'::text, 'image'::text, 'file'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'courses_status_check' and conrelid = 'public.courses'::regclass) then
    alter table public.courses add constraint courses_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text, 'coming_soon'::text, 'draft'::text, 'published'::text, 'archived'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'enrollments_source_check' and conrelid = 'public.enrollments'::regclass) then
    alter table public.enrollments add constraint enrollments_source_check CHECK ((source = ANY (ARRAY['razorpay'::text, 'manual'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'enrollments_status_check' and conrelid = 'public.enrollments'::regclass) then
    alter table public.enrollments add constraint enrollments_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'dropped'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'escalated_questions_status_check' and conrelid = 'public.escalated_questions'::regclass) then
    alter table public.escalated_questions add constraint escalated_questions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'answered'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'live_classes_status_check' and conrelid = 'public.live_classes'::regclass) then
    alter table public.live_classes add constraint live_classes_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'live'::text, 'completed'::text, 'cancelled'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'live_sessions_status_check' and conrelid = 'public.live_sessions'::regclass) then
    alter table public.live_sessions add constraint live_sessions_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'live'::text, 'completed'::text, 'cancelled'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'notifications_type_check' and conrelid = 'public.notifications'::regclass) then
    alter table public.notifications add constraint notifications_type_check CHECK ((type = ANY (ARRAY['info'::text, 'warning'::text, 'success'::text, 'live_class'::text, 'assignment'::text, 'announcement'::text, 'escalation'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'payments_plan_type_check' and conrelid = 'public.payments'::regclass) then
    alter table public.payments add constraint payments_plan_type_check CHECK ((plan_type = ANY (ARRAY['basic'::text, 'pro'::text, 'premium'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'payments_status_check' and conrelid = 'public.payments'::regclass) then
    alter table public.payments add constraint payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check' and conrelid = 'public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'instructor'::text, 'student'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quiz_questions_question_type_check' and conrelid = 'public.quiz_questions'::regclass) then
    alter table public.quiz_questions add constraint quiz_questions_question_type_check CHECK ((question_type = ANY (ARRAY['mcq'::text, 'true_false'::text, 'case_study'::text, 'fill_blank'::text, 'code_output'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'submissions_status_check' and conrelid = 'public.submissions'::regclass) then
    alter table public.submissions add constraint submissions_status_check CHECK ((status = ANY (ARRAY['submitted'::text, 'under_review'::text, 'approved'::text, 'needs_revision'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'subscriptions_plan_type_check' and conrelid = 'public.subscriptions'::regclass) then
    alter table public.subscriptions add constraint subscriptions_plan_type_check CHECK ((plan_type = ANY (ARRAY['basic'::text, 'pro'::text, 'premium'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'subscriptions_status_check' and conrelid = 'public.subscriptions'::regclass) then
    alter table public.subscriptions add constraint subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text])));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'activity_logs_user_id_fkey' and conrelid = 'public.activity_logs'::regclass) then
    alter table public.activity_logs add constraint activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'announcements_course_id_fkey' and conrelid = 'public.announcements'::regclass) then
    alter table public.announcements add constraint announcements_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'assignments_course_id_fkey' and conrelid = 'public.assignments'::regclass) then
    alter table public.assignments add constraint assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'assignments_module_id_fkey' and conrelid = 'public.assignments'::regclass) then
    alter table public.assignments add constraint assignments_module_id_fkey FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'attendance_session_id_fkey' and conrelid = 'public.attendance'::regclass) then
    alter table public.attendance add constraint attendance_session_id_fkey FOREIGN KEY (session_id) REFERENCES live_sessions(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'attendance_student_id_fkey' and conrelid = 'public.attendance'::regclass) then
    alter table public.attendance add constraint attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'certificates_course_id_fkey' and conrelid = 'public.certificates'::regclass) then
    alter table public.certificates add constraint certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'chat_messages_channel_id_fkey' and conrelid = 'public.chat_messages'::regclass) then
    alter table public.chat_messages add constraint chat_messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES community_channels(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'chat_messages_parent_message_id_fkey' and conrelid = 'public.chat_messages'::regclass) then
    alter table public.chat_messages add constraint chat_messages_parent_message_id_fkey FOREIGN KEY (parent_message_id) REFERENCES chat_messages(id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'courses_instructor_id_fkey' and conrelid = 'public.courses'::regclass) then
    alter table public.courses add constraint courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES profiles(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'enrollments_course_id_fkey' and conrelid = 'public.enrollments'::regclass) then
    alter table public.enrollments add constraint enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'escalated_questions_course_id_fkey' and conrelid = 'public.escalated_questions'::regclass) then
    alter table public.escalated_questions add constraint escalated_questions_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'lesson_progress_lesson_id_fkey' and conrelid = 'public.lesson_progress'::regclass) then
    alter table public.lesson_progress add constraint lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'lesson_progress_student_id_fkey' and conrelid = 'public.lesson_progress'::regclass) then
    alter table public.lesson_progress add constraint lesson_progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'lessons_module_id_fkey' and conrelid = 'public.lessons'::regclass) then
    alter table public.lessons add constraint lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'live_class_attendance_live_class_id_fkey' and conrelid = 'public.live_class_attendance'::regclass) then
    alter table public.live_class_attendance add constraint live_class_attendance_live_class_id_fkey FOREIGN KEY (live_class_id) REFERENCES live_classes(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'live_classes_course_id_fkey' and conrelid = 'public.live_classes'::regclass) then
    alter table public.live_classes add constraint live_classes_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'live_sessions_course_id_fkey' and conrelid = 'public.live_sessions'::regclass) then
    alter table public.live_sessions add constraint live_sessions_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'live_sessions_instructor_id_fkey' and conrelid = 'public.live_sessions'::regclass) then
    alter table public.live_sessions add constraint live_sessions_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES profiles(id) ON DELETE SET NULL;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'modules_course_id_fkey' and conrelid = 'public.modules'::regclass) then
    alter table public.modules add constraint modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'notes_lesson_id_fkey' and conrelid = 'public.notes'::regclass) then
    alter table public.notes add constraint notes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_id_fkey' and conrelid = 'public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quiz_attempts_quiz_id_fkey' and conrelid = 'public.quiz_attempts'::regclass) then
    alter table public.quiz_attempts add constraint quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quiz_questions_quiz_id_fkey' and conrelid = 'public.quiz_questions'::regclass) then
    alter table public.quiz_questions add constraint quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quiz_results_quiz_id_fkey' and conrelid = 'public.quiz_results'::regclass) then
    alter table public.quiz_results add constraint quiz_results_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quiz_results_student_id_fkey' and conrelid = 'public.quiz_results'::regclass) then
    alter table public.quiz_results add constraint quiz_results_student_id_fkey FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quizzes_course_id_fkey' and conrelid = 'public.quizzes'::regclass) then
    alter table public.quizzes add constraint quizzes_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quizzes_module_id_fkey' and conrelid = 'public.quizzes'::regclass) then
    alter table public.quizzes add constraint quizzes_module_id_fkey FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'recorded_lectures_course_id_fkey' and conrelid = 'public.recorded_lectures'::regclass) then
    alter table public.recorded_lectures add constraint recorded_lectures_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'resources_lesson_id_fkey' and conrelid = 'public.resources'::regclass) then
    alter table public.resources add constraint resources_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'submissions_assignment_id_fkey' and conrelid = 'public.submissions'::regclass) then
    alter table public.submissions add constraint submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'subscriptions_payment_id_fkey' and conrelid = 'public.subscriptions'::regclass) then
    alter table public.subscriptions add constraint subscriptions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'user_google_tokens_user_id_fkey' and conrelid = 'public.user_google_tokens'::regclass) then
    alter table public.user_google_tokens add constraint user_google_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'video_progress_lesson_id_fkey' and conrelid = 'public.video_progress'::regclass) then
    alter table public.video_progress add constraint video_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
  end if;
end $$;

-- ---------- indexes ----------
create index if not exists idx_recorded_lectures_course ON public.recorded_lectures USING btree (course_id);

-- ---------- functions ----------

CREATE OR REPLACE FUNCTION public.calculate_progress(p_student_id uuid, p_course_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  total_lessons INTEGER; completed_lessons INTEGER; lesson_pct NUMERIC;
  total_assignments INTEGER; submitted_assignments INTEGER; assignment_pct NUMERIC;
  total_quiz_marks NUMERIC; earned_quiz_marks NUMERIC; quiz_pct NUMERIC;
  overall NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_lessons FROM public.lessons l JOIN public.modules m ON l.module_id = m.id WHERE m.course_id = p_course_id;
  SELECT COUNT(*) INTO completed_lessons FROM public.lesson_progress lp JOIN public.lessons l ON lp.lesson_id = l.id JOIN public.modules m ON l.module_id = m.id WHERE lp.student_id = p_student_id AND m.course_id = p_course_id;
  IF total_lessons > 0 THEN lesson_pct := (completed_lessons::NUMERIC / total_lessons) * 100; ELSE lesson_pct := 0; END IF;

  SELECT COUNT(*) INTO total_assignments FROM public.assignments WHERE course_id = p_course_id;
  SELECT COUNT(*) INTO submitted_assignments FROM public.submissions s JOIN public.assignments a ON s.assignment_id = a.id WHERE s.student_id = p_student_id AND a.course_id = p_course_id;
  IF total_assignments > 0 THEN assignment_pct := (submitted_assignments::NUMERIC / total_assignments) * 100; ELSE assignment_pct := 0; END IF;

  SELECT COALESCE(SUM(total_marks), 0) INTO total_quiz_marks FROM public.quizzes WHERE course_id = p_course_id AND is_published = true;
  SELECT COALESCE(SUM(qr.score), 0) INTO earned_quiz_marks FROM public.quiz_results qr JOIN public.quizzes q ON qr.quiz_id = q.id WHERE qr.student_id = p_student_id AND q.course_id = p_course_id;
  IF total_quiz_marks > 0 THEN quiz_pct := (earned_quiz_marks / total_quiz_marks) * 100; ELSE quiz_pct := 0; END IF;

  overall := (0.4 * lesson_pct) + (0.3 * assignment_pct) + (0.3 * quiz_pct);
  RETURN ROUND(overall, 1);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select coalesce(
    (select role in ('admin', 'instructor')
       from public.profiles
      where id = auth.uid()),
    false
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_enrolled(p_course_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select exists (
    select 1
      from public.enrollments
     where student_id = auth.uid()
       and course_id  = p_course_id
  );
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'role changes are not permitted';
  end if;
  return new;
end;
$function$
;

-- ---------- triggers ----------
drop trigger if exists set_updated_at_assignments on public.assignments;
CREATE TRIGGER set_updated_at_assignments BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
drop trigger if exists set_updated_at_courses on public.courses;
CREATE TRIGGER set_updated_at_courses BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
drop trigger if exists set_updated_at_live_sessions on public.live_sessions;
CREATE TRIGGER set_updated_at_live_sessions BEFORE UPDATE ON public.live_sessions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
drop trigger if exists set_updated_at_profiles on public.profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
drop trigger if exists trg_prevent_role_escalation on public.profiles;
CREATE TRIGGER trg_prevent_role_escalation BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();
drop trigger if exists set_updated_at_quizzes on public.quizzes;
CREATE TRIGGER set_updated_at_quizzes BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ---------- row level security ----------
alter table public.activity_logs enable row level security;
alter table public.announcements enable row level security;
alter table public.assignments enable row level security;
alter table public.attendance enable row level security;
alter table public.certificates enable row level security;
alter table public.chat_messages enable row level security;
alter table public.community_channels enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.escalated_questions enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.lessons enable row level security;
alter table public.live_class_attendance enable row level security;
alter table public.live_classes enable row level security;
alter table public.live_sessions enable row level security;
alter table public.modules enable row level security;
alter table public.notes enable row level security;
alter table public.notifications enable row level security;
alter table public.payments enable row level security;
alter table public.profiles enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_results enable row level security;
alter table public.quizzes enable row level security;
alter table public.recorded_lectures enable row level security;
alter table public.resources enable row level security;
alter table public.submissions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_google_tokens enable row level security;
alter table public.video_progress enable row level security;

-- ---------- policies ----------
-- NOTE: reproduced as they exist in production today. Several are known
-- to be over-permissive; see the security phase of the backlog.
drop policy if exists "Anyone can view announcements" on public.announcements;
create policy "Anyone can view announcements" on public.announcements as permissive for select to public using (true);
drop policy if exists "announcements_select_enrolled" on public.announcements;
create policy "announcements_select_enrolled" on public.announcements as permissive for select to authenticated using ((is_enrolled(course_id) OR is_admin()));
drop policy if exists "Enrolled students can view assignments" on public.assignments;
create policy "Enrolled students can view assignments" on public.assignments as permissive for select to public using (((EXISTS ( SELECT 1
   FROM enrollments
  WHERE ((enrollments.course_id = assignments.course_id) AND (enrollments.student_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM courses
  WHERE ((courses.id = assignments.course_id) AND (courses.instructor_id = auth.uid()))))));
drop policy if exists "assignments_select_enrolled" on public.assignments;
create policy "assignments_select_enrolled" on public.assignments as permissive for select to authenticated using ((is_enrolled(course_id) OR is_admin()));
drop policy if exists "attendance_select_own" on public.attendance;
create policy "attendance_select_own" on public.attendance as permissive for select to authenticated using ((student_id = auth.uid()));
drop policy if exists "Public certificate verification" on public.certificates;
create policy "Public certificate verification" on public.certificates as permissive for select to public using (true);
drop policy if exists "Users can view own certificates" on public.certificates;
create policy "Users can view own certificates" on public.certificates as permissive for select to public using ((user_id = auth.uid()));
drop policy if exists "certificates_select_own" on public.certificates;
create policy "certificates_select_own" on public.certificates as permissive for select to authenticated using ((user_id = auth.uid()));
drop policy if exists "Anyone can view messages" on public.chat_messages;
create policy "Anyone can view messages" on public.chat_messages as permissive for select to public using (true);
drop policy if exists "Authenticated users can send messages" on public.chat_messages;
create policy "Authenticated users can send messages" on public.chat_messages as permissive for insert to public with check (((auth.uid() IS NOT NULL) AND (user_id = auth.uid())));
drop policy if exists "chat_messages_delete_own" on public.chat_messages;
create policy "chat_messages_delete_own" on public.chat_messages as permissive for delete to authenticated using (((user_id = auth.uid()) OR is_admin()));
drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own" on public.chat_messages as permissive for insert to authenticated with check ((user_id = auth.uid()));
drop policy if exists "chat_messages_select_authenticated" on public.chat_messages;
create policy "chat_messages_select_authenticated" on public.chat_messages as permissive for select to authenticated using (true);
drop policy if exists "chat_messages_update_own" on public.chat_messages;
create policy "chat_messages_update_own" on public.chat_messages as permissive for update to authenticated using ((user_id = auth.uid())) with check ((user_id = auth.uid()));
drop policy if exists "Anyone can view channels" on public.community_channels;
create policy "Anyone can view channels" on public.community_channels as permissive for select to public using (true);
drop policy if exists "community_channels_select_authenticated" on public.community_channels;
create policy "community_channels_select_authenticated" on public.community_channels as permissive for select to authenticated using (true);
drop policy if exists "Anyone can view published courses" on public.courses;
create policy "Anyone can view published courses" on public.courses as permissive for select to public using (((status = 'published'::text) OR (instructor_id = auth.uid())));
drop policy if exists "Instructors can update own courses" on public.courses;
create policy "Instructors can update own courses" on public.courses as permissive for update to public using ((instructor_id = auth.uid()));
drop policy if exists "courses_select_public" on public.courses;
create policy "courses_select_public" on public.courses as permissive for select to anon,authenticated using (true);
drop policy if exists "Admins can manage enrollments" on public.enrollments;
create policy "Admins can manage enrollments" on public.enrollments as permissive for all to authenticated using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));
drop policy if exists "Instructors can view course enrollments" on public.enrollments;
create policy "Instructors can view course enrollments" on public.enrollments as permissive for select to public using ((EXISTS ( SELECT 1
   FROM courses
  WHERE ((courses.id = enrollments.course_id) AND (courses.instructor_id = auth.uid())))));
drop policy if exists "Students can view their own enrollments" on public.enrollments;
create policy "Students can view their own enrollments" on public.enrollments as permissive for select to authenticated using ((student_id = auth.uid()));
drop policy if exists "Users can enroll themselves" on public.enrollments;
create policy "Users can enroll themselves" on public.enrollments as permissive for insert to public with check ((student_id = auth.uid()));
drop policy if exists "Users can update own enrollment" on public.enrollments;
create policy "Users can update own enrollment" on public.enrollments as permissive for update to public using ((student_id = auth.uid()));
drop policy if exists "Users can view own enrollments" on public.enrollments;
create policy "Users can view own enrollments" on public.enrollments as permissive for select to public using ((student_id = auth.uid()));
drop policy if exists "enrollments_select_own" on public.enrollments;
create policy "enrollments_select_own" on public.enrollments as permissive for select to authenticated using ((student_id = auth.uid()));
drop policy if exists "Students can create escalations" on public.escalated_questions;
create policy "Students can create escalations" on public.escalated_questions as permissive for insert to public with check ((student_id = auth.uid()));
drop policy if exists "Students can view own escalations" on public.escalated_questions;
create policy "Students can view own escalations" on public.escalated_questions as permissive for select to public using ((student_id = auth.uid()));
drop policy if exists "escalated_questions_insert_own" on public.escalated_questions;
create policy "escalated_questions_insert_own" on public.escalated_questions as permissive for insert to authenticated with check (((student_id = auth.uid()) AND is_enrolled(course_id)));
drop policy if exists "escalated_questions_select_admin" on public.escalated_questions;
create policy "escalated_questions_select_admin" on public.escalated_questions as permissive for select to authenticated using (is_admin());
drop policy if exists "escalated_questions_select_own" on public.escalated_questions;
create policy "escalated_questions_select_own" on public.escalated_questions as permissive for select to authenticated using ((student_id = auth.uid()));
drop policy if exists "lesson_progress_insert_own" on public.lesson_progress;
create policy "lesson_progress_insert_own" on public.lesson_progress as permissive for insert to authenticated with check ((student_id = auth.uid()));
drop policy if exists "lesson_progress_select_own" on public.lesson_progress;
create policy "lesson_progress_select_own" on public.lesson_progress as permissive for select to authenticated using ((student_id = auth.uid()));
drop policy if exists "lesson_progress_update_own" on public.lesson_progress;
create policy "lesson_progress_update_own" on public.lesson_progress as permissive for update to authenticated using ((student_id = auth.uid())) with check ((student_id = auth.uid()));
drop policy if exists "Instructors can manage lessons" on public.lessons;
create policy "Instructors can manage lessons" on public.lessons as permissive for all to public using ((EXISTS ( SELECT 1
   FROM (modules m
     JOIN courses c ON ((m.course_id = c.id)))
  WHERE ((m.id = lessons.module_id) AND (c.instructor_id = auth.uid())))));
drop policy if exists "Lessons visible for accessible courses" on public.lessons;
create policy "Lessons visible for accessible courses" on public.lessons as permissive for select to public using ((EXISTS ( SELECT 1
   FROM (modules m
     JOIN courses c ON ((m.course_id = c.id)))
  WHERE ((m.id = lessons.module_id) AND ((c.status = 'published'::text) OR (c.instructor_id = auth.uid()))))));
drop policy if exists "lessons_select_authenticated" on public.lessons;
create policy "lessons_select_authenticated" on public.lessons as permissive for select to authenticated using (true);
drop policy if exists "Users can log own attendance" on public.live_class_attendance;
create policy "Users can log own attendance" on public.live_class_attendance as permissive for all to public using ((user_id = auth.uid()));
drop policy if exists "live_class_attendance_select_own" on public.live_class_attendance;
create policy "live_class_attendance_select_own" on public.live_class_attendance as permissive for select to authenticated using ((user_id = auth.uid()));
drop policy if exists "Anyone can view scheduled live classes" on public.live_classes;
create policy "Anyone can view scheduled live classes" on public.live_classes as permissive for select to public using ((status = ANY (ARRAY['scheduled'::text, 'live'::text])));
drop policy if exists "Instructors can manage live classes" on public.live_classes;
create policy "Instructors can manage live classes" on public.live_classes as permissive for all to public using ((instructor_id = auth.uid()));
drop policy if exists "live_classes_select_enrolled" on public.live_classes;
create policy "live_classes_select_enrolled" on public.live_classes as permissive for select to authenticated using ((is_enrolled(course_id) OR is_admin()));
drop policy if exists "live_sessions_select_enrolled" on public.live_sessions;
create policy "live_sessions_select_enrolled" on public.live_sessions as permissive for select to authenticated using ((is_enrolled(course_id) OR is_admin()));
drop policy if exists "Instructors can manage modules" on public.modules;
create policy "Instructors can manage modules" on public.modules as permissive for all to public using ((EXISTS ( SELECT 1
   FROM courses
  WHERE ((courses.id = modules.course_id) AND (courses.instructor_id = auth.uid())))));
drop policy if exists "Modules visible for accessible courses" on public.modules;
create policy "Modules visible for accessible courses" on public.modules as permissive for select to public using ((EXISTS ( SELECT 1
   FROM courses
  WHERE ((courses.id = modules.course_id) AND ((courses.status = 'published'::text) OR (courses.instructor_id = auth.uid()))))));
drop policy if exists "modules_select_enrolled" on public.modules;
create policy "modules_select_enrolled" on public.modules as permissive for select to authenticated using ((is_enrolled(course_id) OR is_admin()));
drop policy if exists "Users can manage own notes" on public.notes;
create policy "Users can manage own notes" on public.notes as permissive for all to public using ((user_id = auth.uid()));
drop policy if exists "notes_all_own" on public.notes;
create policy "notes_all_own" on public.notes as permissive for all to authenticated using ((user_id = auth.uid())) with check ((user_id = auth.uid()));
drop policy if exists "Users can manage own notifications" on public.notifications;
create policy "Users can manage own notifications" on public.notifications as permissive for all to public using ((user_id = auth.uid()));
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications as permissive for select to authenticated using ((user_id = auth.uid()));
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications as permissive for update to authenticated using ((user_id = auth.uid())) with check ((user_id = auth.uid()));
drop policy if exists "Users can view own payments" on public.payments;
create policy "Users can view own payments" on public.payments as permissive for all to public using ((user_id = auth.uid()));
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments as permissive for select to authenticated using ((user_id = auth.uid()));
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles as permissive for select to authenticated using (is_admin());
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles as permissive for select to authenticated using ((id = auth.uid()));
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles as permissive for update to authenticated using ((id = auth.uid())) with check ((id = auth.uid()));
drop policy if exists "Instructors can view quiz attempts" on public.quiz_attempts;
create policy "Instructors can view quiz attempts" on public.quiz_attempts as permissive for select to public using ((EXISTS ( SELECT 1
   FROM (quizzes q
     JOIN courses c ON ((q.course_id = c.id)))
  WHERE ((q.id = quiz_attempts.quiz_id) AND (c.instructor_id = auth.uid())))));
drop policy if exists "Users can manage own quiz attempts" on public.quiz_attempts;
create policy "Users can manage own quiz attempts" on public.quiz_attempts as permissive for all to public using ((user_id = auth.uid()));
drop policy if exists "quiz_attempts_insert_own" on public.quiz_attempts;
create policy "quiz_attempts_insert_own" on public.quiz_attempts as permissive for insert to authenticated with check ((user_id = auth.uid()));
drop policy if exists "quiz_attempts_select_own" on public.quiz_attempts;
create policy "quiz_attempts_select_own" on public.quiz_attempts as permissive for select to authenticated using ((user_id = auth.uid()));
drop policy if exists "Enrolled students can view quiz questions" on public.quiz_questions;
create policy "Enrolled students can view quiz questions" on public.quiz_questions as permissive for select to public using ((EXISTS ( SELECT 1
   FROM (quizzes q
     JOIN enrollments e ON ((q.course_id = e.course_id)))
  WHERE ((q.id = quiz_questions.quiz_id) AND (e.student_id = auth.uid())))));
drop policy if exists "quiz_questions_select_authenticated" on public.quiz_questions;
create policy "quiz_questions_select_authenticated" on public.quiz_questions as permissive for select to authenticated using (true);
drop policy if exists "quiz_results_select_own" on public.quiz_results;
create policy "quiz_results_select_own" on public.quiz_results as permissive for select to authenticated using ((student_id = auth.uid()));
drop policy if exists "Enrolled students can view quizzes" on public.quizzes;
create policy "Enrolled students can view quizzes" on public.quizzes as permissive for select to public using (((EXISTS ( SELECT 1
   FROM enrollments
  WHERE ((enrollments.course_id = quizzes.course_id) AND (enrollments.student_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM courses
  WHERE ((courses.id = quizzes.course_id) AND (courses.instructor_id = auth.uid()))))));
drop policy if exists "quizzes_select_enrolled" on public.quizzes;
create policy "quizzes_select_enrolled" on public.quizzes as permissive for select to authenticated using ((is_enrolled(course_id) OR is_admin()));
drop policy if exists "Delete recorded lectures" on public.recorded_lectures;
create policy "Delete recorded lectures" on public.recorded_lectures as permissive for delete to public using (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM courses c
  WHERE ((c.id = recorded_lectures.course_id) AND (c.instructor_id = auth.uid()))))));
drop policy if exists "Insert recorded lectures" on public.recorded_lectures;
create policy "Insert recorded lectures" on public.recorded_lectures as permissive for insert to public with check (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM courses c
  WHERE ((c.id = recorded_lectures.course_id) AND (c.instructor_id = auth.uid()))))));
drop policy if exists "Select recorded lectures" on public.recorded_lectures;
create policy "Select recorded lectures" on public.recorded_lectures as permissive for select to public using (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM courses c
  WHERE ((c.id = recorded_lectures.course_id) AND (c.instructor_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.course_id = e.course_id) AND (e.student_id = auth.uid()) AND (e.status = 'active'::text))))));
drop policy if exists "Update recorded lectures" on public.recorded_lectures;
create policy "Update recorded lectures" on public.recorded_lectures as permissive for update to public using (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM courses c
  WHERE ((c.id = recorded_lectures.course_id) AND (c.instructor_id = auth.uid()))))));
drop policy if exists "recorded_lectures_select_enrolled" on public.recorded_lectures;
create policy "recorded_lectures_select_enrolled" on public.recorded_lectures as permissive for select to authenticated using ((is_enrolled(course_id) OR is_admin()));
drop policy if exists "Resources visible for accessible lessons" on public.resources;
create policy "Resources visible for accessible lessons" on public.resources as permissive for select to public using ((EXISTS ( SELECT 1
   FROM ((lessons l
     JOIN modules m ON ((l.module_id = m.id)))
     JOIN courses c ON ((m.course_id = c.id)))
  WHERE ((l.id = resources.lesson_id) AND ((c.status = 'published'::text) OR (c.instructor_id = auth.uid()))))));
drop policy if exists "resources_select_authenticated" on public.resources;
create policy "resources_select_authenticated" on public.resources as permissive for select to authenticated using (true);
drop policy if exists "Instructors can update submissions" on public.submissions;
create policy "Instructors can update submissions" on public.submissions as permissive for update to public using ((EXISTS ( SELECT 1
   FROM (assignments a
     JOIN courses c ON ((a.course_id = c.id)))
  WHERE ((a.id = submissions.assignment_id) AND (c.instructor_id = auth.uid())))));
drop policy if exists "Instructors can view course submissions" on public.submissions;
create policy "Instructors can view course submissions" on public.submissions as permissive for select to public using ((EXISTS ( SELECT 1
   FROM (assignments a
     JOIN courses c ON ((a.course_id = c.id)))
  WHERE ((a.id = submissions.assignment_id) AND (c.instructor_id = auth.uid())))));
drop policy if exists "Users can create submissions" on public.submissions;
create policy "Users can create submissions" on public.submissions as permissive for insert to public with check ((user_id = auth.uid()));
drop policy if exists "Users can view own submissions" on public.submissions;
create policy "Users can view own submissions" on public.submissions as permissive for select to public using ((user_id = auth.uid()));
drop policy if exists "submissions_insert_own" on public.submissions;
create policy "submissions_insert_own" on public.submissions as permissive for insert to authenticated with check ((user_id = auth.uid()));
drop policy if exists "submissions_select_admin" on public.submissions;
create policy "submissions_select_admin" on public.submissions as permissive for select to authenticated using (is_admin());
drop policy if exists "submissions_select_own" on public.submissions;
create policy "submissions_select_own" on public.submissions as permissive for select to authenticated using ((user_id = auth.uid()));
drop policy if exists "submissions_update_own" on public.submissions;
create policy "submissions_update_own" on public.submissions as permissive for update to authenticated using ((user_id = auth.uid())) with check ((user_id = auth.uid()));
drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "Users can view own subscriptions" on public.subscriptions as permissive for all to public using ((user_id = auth.uid()));
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions as permissive for select to authenticated using ((user_id = auth.uid()));
drop policy if exists "Users can manage their own Google tokens" on public.user_google_tokens;
create policy "Users can manage their own Google tokens" on public.user_google_tokens as permissive for all to authenticated using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));
drop policy if exists "Users can manage own video progress" on public.video_progress;
create policy "Users can manage own video progress" on public.video_progress as permissive for all to public using ((user_id = auth.uid()));
drop policy if exists "video_progress_insert_own" on public.video_progress;
create policy "video_progress_insert_own" on public.video_progress as permissive for insert to authenticated with check ((user_id = auth.uid()));
drop policy if exists "video_progress_select_own" on public.video_progress;
create policy "video_progress_select_own" on public.video_progress as permissive for select to authenticated using ((user_id = auth.uid()));
drop policy if exists "video_progress_update_own" on public.video_progress;
create policy "video_progress_update_own" on public.video_progress as permissive for update to authenticated using ((user_id = auth.uid())) with check ((user_id = auth.uid()));
