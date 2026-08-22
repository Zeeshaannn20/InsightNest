import type { SupabaseClient } from "@supabase/supabase-js";

/** A lesson counts as watched once this much of it has played. */
export const COMPLETION_RATIO = 0.9;

/**
 * Record where a viewer has reached in a lesson.
 * video_progress has UNIQUE (user_id, lesson_id), so this upserts in place.
 */
export async function saveVideoProgress(
  supabase: SupabaseClient,
  userId: string,
  lessonId: string,
  seconds: number,
  isCompleted: boolean
) {
  return supabase.from("video_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      last_position_sec: Math.max(0, Math.floor(seconds)),
      is_completed: isCompleted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );
}

/**
 * Denormalise "lessons watched" onto the enrollment so dashboards and course
 * cards can read one number instead of recounting every time.
 */
export async function syncCourseProgress(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  completedLessons: number,
  totalLessons: number
): Promise<number> {
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  await supabase
    .from("enrollments")
    .update({ progress_pct: pct, last_accessed: new Date().toISOString() })
    .eq("student_id", userId)
    .eq("course_id", courseId);

  return pct;
}
