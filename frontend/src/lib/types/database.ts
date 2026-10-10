// ============================================================
// InsightNest LMS — Database Types
//
// Row shapes come from ./database.generated.ts, which mirrors the live
// Postgres schema. This file adds the optional relation fields used by
// nested selects, plus form and view-model types.
//
// To refresh after a schema change, regenerate database.generated.ts —
// never hand-edit it.
// ============================================================

import type {
  ActivityLogRow,
  AnnouncementRow,
  AssignmentRow,
  AttendanceRow,
  CertificateRow,
  ChatMessageRow,
  CommunityChannelRow,
  CourseRow,
  EnrollmentRow,
  EscalatedQuestionRow,
  LessonProgressRow,
  LessonRow,
  LiveSessionRow,
  ModuleRow,
  NoteRow,
  NotificationRow,
  PaymentRow,
  ProfileRow,
  QuizAttemptRow,
  QuizQuestionRow,
  QuizResultRow,
  QuizRow,
  RecordedLectureRow,
  ResourceRow,
  SubmissionRow,
  SubscriptionRow,
  VideoProgressRow,
} from "./database.generated";

// Re-export the generated row types and status unions
// (UserRole, EnrollmentStatus, CourseStatus, QuestionType, …)
export * from "./database.generated";

// ============================================================
// Core entities — row shape + the relations we select alongside them
// ============================================================

export type Profile = ProfileRow;

export interface Course extends CourseRow {
  instructor?: Profile;
  modules?: Module[];
  enrollment_count?: number;
}

export interface Module extends ModuleRow {
  lessons?: Lesson[];
  assignments?: Assignment[];
  quizzes?: Quiz[];
}

export interface Lesson extends LessonRow {
  resources?: Resource[];
  /** Derived client-side from video_progress. */
  is_completed?: boolean;
}

export interface Enrollment extends EnrollmentRow {
  student?: Profile;
  course?: Course;
  /** Select as `grantor:profiles!enrollments_granted_by_fkey(full_name, email)`. */
  grantor?: Profile;
}

export interface LiveSession extends LiveSessionRow {
  instructor?: Profile;
  course?: Course;
}

export interface Attendance extends AttendanceRow {
  student?: Profile;
  session?: LiveSession;
}

export interface Assignment extends AssignmentRow {
  submission?: Submission;
  submissions?: Submission[];
  course?: Course;
}

export interface Submission extends SubmissionRow {
  user?: Profile;
  assignment?: Assignment;
  reviewer?: Profile;
}

export interface Quiz extends QuizRow {
  questions?: QuizQuestion[];
  attempt?: QuizAttempt;
  course?: Course;
}

/**
 * Note: `correct_answer` is readable by enrolled students through the REST
 * API, so grade server-side and never select this column in the browser.
 */
export type QuizQuestion = QuizQuestionRow;

export interface QuizAttempt extends QuizAttemptRow {
  user?: Profile;
  quiz?: Quiz;
}

export interface QuizResult extends QuizResultRow {
  student?: Profile;
  quiz?: Quiz;
}

export interface Announcement extends AnnouncementRow {
  author?: Profile;
  course?: Course;
}

export interface ChatMessage extends ChatMessageRow {
  user?: Profile;
  channel?: CommunityChannel;
  parent_message?: ChatMessage;
}

export type CommunityChannel = CommunityChannelRow;

export interface Certificate extends CertificateRow {
  user?: Profile;
  course?: Course;
}

export interface Payment extends PaymentRow {
  user?: Profile;
}

export type Subscription = SubscriptionRow;

export type Notification = NotificationRow;

export type Note = NoteRow;

export type Resource = ResourceRow;

export type VideoProgress = VideoProgressRow;

export type LessonProgress = LessonProgressRow;

export interface EscalatedQuestion extends EscalatedQuestionRow {
  student?: Profile;
  instructor?: Profile;
  course?: Course;
}

export interface RecordedLecture extends RecordedLectureRow {
  course?: Course;
}

export interface ActivityLog extends ActivityLogRow {
  user?: Profile;
}

// ============================================================
// View models
// ============================================================

export interface ProgressData {
  lesson_pct: number;
  assignment_pct: number;
  quiz_pct: number;
  overall: number;
}

export interface DashboardStats {
  total_students: number;
  active_students: number;
  attendance_pct: number;
  completion_pct: number;
  total_submissions: number;
  total_quizzes_completed: number;
}

// ============================================================
// Form types
// ============================================================

export interface CreateStudentForm {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface CreateCourseForm {
  title: string;
  description: string;
  instructor_id?: string;
  price_paise: number;
  duration_weeks: number;
}

export interface CreateSessionForm {
  course_id: string;
  instructor_id?: string;
  title: string;
  description: string;
  session_date: string;
  start_time: string;
  end_time: string;
  meet_link: string;
}

export interface CreateAssignmentForm {
  course_id: string;
  module_id?: string;
  title: string;
  description: string;
  due_date: string;
}

export interface CreateQuizForm {
  course_id: string;
  module_id?: string;
  title: string;
  description: string;
  passing_score: number;
  time_limit_minutes?: number;
  max_attempts?: number;
  questions: CreateQuestionForm[];
}

export interface CreateQuestionForm {
  question: string;
  question_type: QuizQuestion["question_type"];
  options: string[];
  correct_answer: string;
  points: number;
}
