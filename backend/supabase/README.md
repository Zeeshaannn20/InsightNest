# Database

`migrations/20260822000000_baseline_schema.sql` is the **single source of truth**
for the `public` schema. It was generated from the live database (project
`gogusyvtzbdknxwrtrga`) and is already applied to production. Every statement is
guarded, so it is safe to re-run and it also rebuilds the schema from scratch.

`migrations/_archive/` holds the original `001`–`008` migrations. They had drifted
from production — 13 live tables were never created by any of them — and are kept
only as history. Do not run them.

To refresh the baseline after a schema change, regenerate it from the live
database rather than hand-editing.

## Canonical models

Three concepts were modelled twice. These are the winners; the others are legacy
and should not be written to by new code.

| Concept | Use | Not | Why |
| --- | --- | --- | --- |
| Lesson progress | `video_progress` | `lesson_progress` | Carries `last_position_sec` and `is_completed`, so it supports resume. `lesson_progress` is binary. Roll up into `enrollments.progress_pct` for dashboards. |
| Quiz results | `quiz_attempts` | `quiz_results` | Has `started_at`/`completed_at` and allows multiple rows, which is what `quizzes.max_attempts` implies. `quiz_results` is one row per student per quiz. |
| Live classes | `live_sessions` | `live_classes` | Already used by the admin scheduler and by `attendance`. `live_classes`/`live_class_attendance` are unused. |

Retiring the legacy tables is deliberately deferred until the features that read
them have moved over.

## Notes

- Owner columns are inconsistent: some tables use `student_id`, others `user_id`.
  This is baked into the data and the RLS policies, so it is left alone; the
  TypeScript layer in `frontend/src/lib/types/` reflects reality per table.
- `quiz_questions.correct_answer` sits in the same row as the question, so quiz
  grading must happen server-side and that column must never be selected in the
  browser.
- The policies in the baseline reproduce production as it stands today. Several
  are over-permissive — see the security phase of the project backlog.
