-- ============================================================
-- Record which admin granted a manual enrolment
--
-- Three students were enrolled by hand on 2026-10-10 and there was no way to
-- tell which of the five admin accounts did it. `enrollments` records
-- `source = 'manual'` but never the actor: both grant paths authenticate the
-- admin and then write the row through the service-role client, dropping the
-- identity on the floor. Supabase's own `auth.audit_log_entries` is empty on
-- this project, so there was no fallback trail either.
--
-- `granted_by` closes that. It stays null for Razorpay enrolments, which
-- already explain themselves through `razorpay_payment_id`, and null for every
-- row predating this column — including the three that prompted it.
--
-- on delete set null, not cascade: removing an admin's profile must never take
-- a student's enrolment down with it.
-- ============================================================

alter table public.enrollments
  add column if not exists granted_by uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'enrollments_granted_by_fkey'
       and conrelid = 'public.enrollments'::regclass
  ) then
    alter table public.enrollments
      add constraint enrollments_granted_by_fkey
      foreign key (granted_by) references public.profiles(id) on delete set null;
  end if;
end $$;

comment on column public.enrollments.granted_by is
  'Admin who created this enrolment by hand. Null for Razorpay checkouts and for rows created before 2026-10-11.';
