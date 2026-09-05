-- ============================================================
-- Cohorts (batches)
--
-- Every enrolment has so far gone into one undifferentiated pool, so there
-- is no way to tell the August intake from the September one, or to run a
-- session for just one batch.
--
-- Model: an enrolment belongs to at most one cohort. A student who enrols
-- twice (a second course, or a repeat) gets a second enrolment row, so this
-- stays a plain nullable FK rather than a join table.
--
-- Access model:
--   * Staff manage cohorts through is_admin(), as elsewhere in the schema.
--   * A student may read the cohort their own enrolment points at, so the
--     dashboard can show which batch they are in. Nothing more.
-- ============================================================

create table if not exists public.cohorts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  course_id   uuid references public.courses(id) on delete cascade,
  start_date  date,
  end_date    date,
  status      text not null default 'planned'
                check (status in ('planned', 'active', 'completed', 'archived')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists cohorts_course_idx on public.cohorts (course_id, start_date desc);

-- The link itself. ON DELETE SET NULL so removing a cohort never destroys an
-- enrolment — the student keeps course access, they just stop being batched.
alter table public.enrollments
  add column if not exists cohort_id uuid references public.cohorts(id) on delete set null;

create index if not exists enrollments_cohort_idx on public.enrollments (cohort_id);

alter table public.cohorts enable row level security;

-- Students see only the cohort their own enrolment belongs to.
drop policy if exists "cohorts_select_own" on public.cohorts;
create policy "cohorts_select_own"
  on public.cohorts for select to authenticated
  using (
    exists (
      select 1 from public.enrollments e
      where e.cohort_id = cohorts.id
        and e.student_id = auth.uid()
    )
  );

drop policy if exists "cohorts_select_staff" on public.cohorts;
create policy "cohorts_select_staff"
  on public.cohorts for select to authenticated
  using (is_admin());

drop policy if exists "cohorts_insert_staff" on public.cohorts;
create policy "cohorts_insert_staff"
  on public.cohorts for insert to authenticated
  with check (is_admin());

drop policy if exists "cohorts_update_staff" on public.cohorts;
create policy "cohorts_update_staff"
  on public.cohorts for update to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "cohorts_delete_staff" on public.cohorts;
create policy "cohorts_delete_staff"
  on public.cohorts for delete to authenticated
  using (is_admin());

create or replace function public.touch_cohorts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cohorts_touch_updated_at on public.cohorts;
create trigger cohorts_touch_updated_at
  before update on public.cohorts
  for each row execute function public.touch_cohorts_updated_at();
