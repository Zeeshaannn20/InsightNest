-- ============================================================
-- Admin authoring access for course content
--
-- Why: the course builder cannot write anything today.
--   * `courses` has no INSERT policy at all, so no course can be created.
--   * writes to `courses`, `modules` and `lessons` are only allowed when
--     `courses.instructor_id = auth.uid()`, and every existing course has a
--     NULL instructor_id — so that condition can never be satisfied.
--
-- This grants admins full authoring rights over courses, modules and lessons.
-- Instructors keep their existing own-course policies, unchanged.
--
-- The admin check is written inline rather than using is_admin(), because
-- is_admin() also returns true for instructors, which would let any instructor
-- edit another instructor's course. This matches the existing inline pattern in
-- "Admins can manage enrollments".
-- ============================================================

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses"
  on public.courses for all to authenticated
  using (exists (select 1 from public.profiles
                  where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles
                       where id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can manage modules" on public.modules;
create policy "Admins can manage modules"
  on public.modules for all to authenticated
  using (exists (select 1 from public.profiles
                  where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles
                       where id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can manage lessons" on public.lessons;
create policy "Admins can manage lessons"
  on public.lessons for all to authenticated
  using (exists (select 1 from public.profiles
                  where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles
                       where id = auth.uid() and role = 'admin'));
