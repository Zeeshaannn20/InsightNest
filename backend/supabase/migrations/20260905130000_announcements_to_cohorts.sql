-- ============================================================
-- Announcements: cohort targeting, working write access, and delivery
--
-- Three problems this fixes.
--
-- 1. There was no INSERT policy on announcements at all, so the admin page
--    could never actually post one — RLS refused every write.
--
-- 2. "Anyone can view announcements" used USING (true), so anyone at all
--    could read every announcement ever written, enrolled or not.
--
-- 3. Posting an announcement did nothing for the student. Nothing wrote to
--    notifications, so there was no way to be told. A trigger now fans the
--    announcement out to the students it targets, which keeps delivery
--    atomic with the post rather than depending on the client remembering.
-- ============================================================

-- Null cohort means "everyone on the course", the common case.
alter table public.announcements
  add column if not exists cohort_id uuid references public.cohorts(id) on delete cascade;

create index if not exists announcements_cohort_idx on public.announcements (cohort_id);
create index if not exists announcements_created_idx on public.announcements (created_at desc);

-- ---------- Read access ----------

-- Announcements are course communication, not public content.
drop policy if exists "Anyone can view announcements" on public.announcements;

-- Enrolled students see announcements for their course, narrowed to their
-- cohort when one is set. Staff see everything.
drop policy if exists "announcements_select_enrolled" on public.announcements;
create policy "announcements_select_enrolled"
  on public.announcements for select to authenticated
  using (
    is_admin()
    or exists (
      select 1 from public.enrollments e
      where e.student_id = auth.uid()
        and e.status = 'active'
        and (announcements.course_id is null or e.course_id = announcements.course_id)
        and (announcements.cohort_id is null or e.cohort_id = announcements.cohort_id)
    )
  );

-- ---------- Write access ----------

drop policy if exists "announcements_insert_staff" on public.announcements;
create policy "announcements_insert_staff"
  on public.announcements for insert to authenticated
  with check (is_admin());

drop policy if exists "announcements_update_staff" on public.announcements;
create policy "announcements_update_staff"
  on public.announcements for update to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "announcements_delete_staff" on public.announcements;
create policy "announcements_delete_staff"
  on public.announcements for delete to authenticated
  using (is_admin());

-- ---------- Delivery ----------

/*
 * SECURITY DEFINER because the notification rows belong to students, and
 * notifications only lets a user write their own. The function is not a
 * general-purpose insert: it derives its recipients entirely from the
 * announcement row, so it cannot be used to message an arbitrary person.
 */
create or replace function public.fan_out_announcement()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  insert into public.notifications (user_id, title, message, type, link, is_read)
  select distinct
         e.student_id,
         new.title,
         new.content,
         'announcement',
         '/dashboard/announcements',
         false
  from public.enrollments e
  where e.status = 'active'
    and (new.course_id is null or e.course_id = new.course_id)
    and (new.cohort_id is null or e.cohort_id = new.cohort_id);

  return new;
end;
$$;

drop trigger if exists announcements_fan_out on public.announcements;
create trigger announcements_fan_out
  after insert on public.announcements
  for each row execute function public.fan_out_announcement();
