// ============================================================
// InsightNest LMS — database row types
//
// GENERATED FROM THE LIVE SCHEMA. Do not edit by hand.
// Relations, form types and helpers live in ./database.ts
// ============================================================

export type UserRole = 'admin' | 'instructor' | 'student';
export type EnrollmentStatus = 'active' | 'completed' | 'dropped';
export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late';
export type SubmissionStatus = 'submitted' | 'under_review' | 'approved' | 'needs_revision';
export type CourseStatus = 'open' | 'closed' | 'coming_soon' | 'draft' | 'published' | 'archived';
export type EnrollmentSource = 'razorpay' | 'manual';
export type QuestionType = 'mcq' | 'true_false' | 'case_study' | 'fill_blank' | 'code_output';
export type NotificationType = 'info' | 'warning' | 'success' | 'live_class' | 'assignment' | 'announcement' | 'escalation';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type ChatMessageType = 'text' | 'code' | 'image' | 'file';
export type EscalationStatus = 'pending' | 'answered';

export interface ActivityLogRow {
  id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AnnouncementRow {
  id: string;
  instructor_id: string;
  course_id: string | null;
  title: string;
  content: string;
  created_at: string | null;
}

export interface AssignmentRow {
  id: string;
  module_id: string | null;
  course_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  max_file_size: number | null;
  allowed_file_types: string[] | null;
  created_at: string | null;
}

export interface AttendanceRow {
  id: string;
  student_id: string;
  session_id: string;
  join_timestamp: string;
  status: AttendanceStatus;
}

export interface CertificateRow {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  certificate_url: string | null;
  issued_at: string | null;
}

export interface ChatMessageRow {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  message_type: ChatMessageType | null;
  metadata: Record<string, unknown> | null;
  is_ai_response: boolean | null;
  parent_message_id: string | null;
  created_at: string | null;
}

export interface CommunityChannelRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  order_index: number | null;
  created_at: string | null;
}

export interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string | null;
  status: CourseStatus;
  thumbnail_url: string | null;
  price: number | null;
  currency: string | null;
  total_lessons: number | null;
  total_duration: string | null;
  category: string | null;
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  is_published: boolean;
  duration_weeks: number | null;
  slug: string | null;
  price_paise: number | null;
}

export interface EnrollmentRow {
  id: string;
  student_id: string;
  course_id: string;
  progress_pct: number | null;
  enrolled_at: string | null;
  last_accessed: string | null;
  status: EnrollmentStatus;
  source: EnrollmentSource | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  purchased_at: string | null;
}

export interface EscalatedQuestionRow {
  id: string;
  student_id: string;
  course_id: string | null;
  question: string;
  ai_response: string | null;
  confidence_score: number | null;
  instructor_response: string | null;
  instructor_id: string | null;
  status: EscalationStatus | null;
  created_at: string | null;
  answered_at: string | null;
}

export interface LessonProgressRow {
  id: string;
  student_id: string;
  lesson_id: string;
  completed_at: string;
}

export interface LessonRow {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  order_index: number;
  duration: string | null;
  is_free_preview: boolean | null;
  created_at: string | null;
}

export interface LiveClassAttendanceRow {
  id: string;
  live_class_id: string;
  user_id: string;
  joined_at: string | null;
  left_at: string | null;
}

export interface LiveClassRow {
  id: string;
  course_id: string | null;
  instructor_id: string;
  title: string;
  description: string | null;
  meet_link: string;
  scheduled_at: string;
  duration_minutes: number | null;
  recording_url: string | null;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled' | null;
  created_at: string | null;
}

export interface LiveSessionRow {
  id: string;
  course_id: string;
  instructor_id: string | null;
  title: string;
  description: string | null;
  session_date: string;
  start_time: string;
  end_time: string;
  meet_link: string | null;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
}

export interface ModuleRow {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  lesson_count: number | null;
  duration: string | null;
  created_at: string | null;
}

export interface NoteRow {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  timestamp_sec: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType | null;
  link: string | null;
  is_read: boolean | null;
  created_at: string | null;
}

export interface PaymentRow {
  id: string;
  user_id: string;
  amount: number;
  currency: string | null;
  plan_type: 'basic' | 'pro' | 'premium';
  payment_method: string | null;
  payment_id: string | null;
  status: PaymentStatus | null;
  created_at: string | null;
}

export interface ProfileRow {
  id: string;
  enrollment_id: string | null;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizAttemptRow {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number | null;
  answers: Record<string, string> | null;
  passed: boolean | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface QuizQuestionRow {
  id: string;
  quiz_id: string;
  question: string;
  question_type: QuestionType;
  options: string[] | null;
  correct_answer: string | null;
  explanation: string | null;
  points: number | null;
  order_index: number | null;
}

export interface QuizResultRow {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_marks: number;
  answers: Record<string, string>;
  attempted_at: string;
  passed: boolean;
}

export interface QuizRow {
  id: string;
  module_id: string | null;
  course_id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number | null;
  passing_score: number | null;
  max_attempts: number | null;
  is_randomized: boolean | null;
  created_at: string | null;
}

export interface RecordedLectureRow {
  id: string;
  course_id: string;
  title: string;
  youtube_url: string;
  duration_minutes: number | null;
  created_at: string;
}

export interface ResourceRow {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string | null;
}

export interface SubmissionRow {
  id: string;
  assignment_id: string;
  user_id: string;
  file_url: string;
  file_name: string | null;
  status: SubmissionStatus;
  feedback: string | null;
  reviewed_by: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_type: 'basic' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | null;
  starts_at: string | null;
  expires_at: string | null;
  payment_id: string | null;
  created_at: string | null;
}

export interface UserGoogleTokenRow {
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  expiry_date: number;
  created_at: string;
  updated_at: string;
}

export interface VideoProgressRow {
  id: string;
  user_id: string;
  lesson_id: string;
  last_position_sec: number | null;
  is_completed: boolean | null;
  updated_at: string | null;
}
