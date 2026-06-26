// ============================================================
// InsightNest LMS — Database Types
// TypeScript interfaces mirroring all PostgreSQL tables
// ============================================================

export type UserRole = 'admin' | 'instructor' | 'student';

export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type LessonType = 'video' | 'pdf' | 'notes' | 'link' | 'recording';

export type SubmissionStatus = 'submitted' | 'graded' | 'late' | 'resubmit';

export type AnnouncementType = 'update' | 'deadline' | 'notification' | 'general';

// ============================================================
// Core Tables
// ============================================================

export interface Profile {
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

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  instructor_id: string | null;
  is_published: boolean;
  price: number;
  duration_weeks: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  instructor?: Profile;
  modules?: Module[];
  enrollment_count?: number;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  // Joined fields
  lessons?: Lesson[];
  assignments?: Assignment[];
  quizzes?: Quiz[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: LessonType;
  content_url: string | null;
  content_text: string | null;
  sort_order: number;
  duration_minutes: number;
  created_at: string;
  // Joined
  is_completed?: boolean;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  status: EnrollmentStatus;
  // Joined
  student?: Profile;
  course?: Course;
}

export interface LiveSession {
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
  // Joined
  instructor?: Profile;
  course?: Course;
}

export interface Attendance {
  id: string;
  student_id: string;
  session_id: string;
  join_timestamp: string;
  status: AttendanceStatus;
  // Joined
  student?: Profile;
  session?: LiveSession;
}

export interface Assignment {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  instructions: string | null;
  max_marks: number;
  deadline: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  submission?: Submission;
  submissions?: Submission[];
  course?: Course;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url: string | null;
  file_name: string | null;
  submitted_at: string;
  marks: number | null;
  feedback: string | null;
  status: SubmissionStatus;
  graded_by: string | null;
  graded_at: string | null;
  // Joined
  student?: Profile;
  assignment?: Assignment;
}

export interface Quiz {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  description: string | null;
  passing_percentage: number;
  total_marks: number;
  time_limit_minutes: number | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  questions?: QuizQuestion[];
  result?: QuizResult;
  course?: Course;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[]; // JSONB array
  correct_option: number;
  marks: number;
  sort_order: number;
}

export interface QuizResult {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_marks: number;
  answers: Record<string, number>; // { question_id: selected_option }
  attempted_at: string;
  passed: boolean;
  // Joined
  student?: Profile;
  quiz?: Quiz;
}

export interface Announcement {
  id: string;
  course_id: string | null;
  title: string;
  content: string;
  type: AnnouncementType;
  created_by: string | null;
  created_at: string;
  // Joined
  author?: Profile;
}

export interface ChatMessage {
  id: string;
  course_id: string;
  sender_id: string;
  message: string;
  reply_to: string | null;
  created_at: string;
  // Joined
  sender?: Profile;
  reply_message?: ChatMessage;
}

export interface LessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  completed_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
  // Joined
  user?: Profile;
}

export interface RecordedLecture {
  id: string;
  course_id: string;
  title: string;
  youtube_url: string;
  duration_minutes: number;
  created_at: string;
  // Joined
  course?: Course;
}

// ============================================================
// Utility Types
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

// Form types for creating/editing
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
  price: number;
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
  instructions: string;
  max_marks: number;
  deadline: string;
}

export interface CreateQuizForm {
  course_id: string;
  module_id?: string;
  title: string;
  description: string;
  passing_percentage: number;
  time_limit_minutes?: number;
  questions: CreateQuestionForm[];
}

export interface CreateQuestionForm {
  question_text: string;
  options: string[];
  correct_option: number;
  marks: number;
}
