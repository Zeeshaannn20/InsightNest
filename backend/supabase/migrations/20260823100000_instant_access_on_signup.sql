-- ============================================================
-- Instant access on signup
--
-- New accounts were created inactive, so every signup needed an admin to flip
-- is_active before the person could even sign in. Access to course content is
-- gated separately by `enrollments` (created by the Razorpay webhook or an
-- admin grant), so keeping accounts inactive added friction without adding
-- protection: an activated user with no enrollment still sees no course.
--
-- Signups are now active immediately. They can sign in and reach their
-- dashboard; course content still requires a paid or granted enrollment.
--
-- role is still forced to 'student' and never read from client-supplied
-- metadata — that protection stays exactly as it was.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  insert into public.profiles (id, full_name, email, role, is_active)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'New User'),
    new.email,
    'student',
    true
  );
  return new;
end;
$function$;
