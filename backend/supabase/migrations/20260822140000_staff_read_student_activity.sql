-- ============================================================
-- Let staff read student activity
--
-- Why: admins currently cannot see any of it. The only SELECT policies on
-- these tables are "own row" ones, so an admin sees zero rows — the live
-- database has 18 attendance records and /admin/attendance renders empty.
-- The student drill-down needs the same data.
--
-- Read-only. Students keep writing their own rows exactly as before, and
-- nothing here lets staff modify anything.
--
-- Uses is_admin(), matching the existing submissions_select_admin and
-- escalated_questions_select_admin policies. Note is_admin() covers
-- instructors as well as admins, which is the intent for teaching staff.
-- ============================================================

drop policy if exists "attendance_select_staff" on public.attendance;
create policy "attendance_select_staff"
  on public.attendance for select to authenticated
  using (is_admin());

drop policy if exists "video_progress_select_staff" on public.video_progress;
create policy "video_progress_select_staff"
  on public.video_progress for select to authenticated
  using (is_admin());

drop policy if exists "quiz_results_select_staff" on public.quiz_results;
create policy "quiz_results_select_staff"
  on public.quiz_results for select to authenticated
  using (is_admin());

drop policy if exists "quiz_attempts_select_staff" on public.quiz_attempts;
create policy "quiz_attempts_select_staff"
  on public.quiz_attempts for select to authenticated
  using (is_admin());
