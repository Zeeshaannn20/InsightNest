-- ============================================================
-- Waitlist
--
-- The /api/enrollment/waitlist endpoint logged the address, slept 500ms and
-- reported success to a table that never existed, so every "notify me" signup
-- so far has been discarded. This creates the table it always assumed.
--
-- Access model:
--   * INSERT is open — this is a public lead-capture form on a marketing page.
--   * There is no SELECT policy for ordinary users, so nobody can read the list
--     back; an address can be added but never enumerated.
--   * Staff read and manage it through is_admin().
-- ============================================================

create table if not exists public.waitlist (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  course_slug  text,
  course_id    uuid references public.courses(id) on delete set null,
  status       text not null default 'pending'
                 check (status in ('pending', 'invited', 'converted', 'declined')),
  notes        text,
  created_at   timestamptz not null default now(),
  notified_at  timestamptz
);

-- One entry per address per course; a repeat signup refreshes rather than duplicates.
create unique index if not exists waitlist_email_course_key
  on public.waitlist (lower(email), coalesce(course_slug, ''));

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- Anyone may join. Nothing here allows reading the list back.
drop policy if exists "waitlist_insert_public" on public.waitlist;
create policy "waitlist_insert_public"
  on public.waitlist for insert to anon, authenticated
  with check (true);

drop policy if exists "waitlist_select_staff" on public.waitlist;
create policy "waitlist_select_staff"
  on public.waitlist for select to authenticated
  using (is_admin());

drop policy if exists "waitlist_update_staff" on public.waitlist;
create policy "waitlist_update_staff"
  on public.waitlist for update to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "waitlist_delete_staff" on public.waitlist;
create policy "waitlist_delete_staff"
  on public.waitlist for delete to authenticated
  using (is_admin());
