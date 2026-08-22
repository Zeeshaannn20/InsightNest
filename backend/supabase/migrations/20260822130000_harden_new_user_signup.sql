-- ============================================================
-- Harden new-user profile creation
--
-- Why: handle_new_user() copied `role` and `is_active` out of
-- raw_user_meta_data, which is entirely client-supplied. Because the anon key
-- ships in the browser bundle, anyone could sign up with
--   options: { data: { role: 'admin', is_active: true } }
-- and land an admin profile. prevent_role_escalation() does not catch this —
-- it only fires on UPDATE, and this is an INSERT.
--
-- New users are now always created as an inactive student. Promotion happens
-- through the admin UI (an UPDATE, which prevent_role_escalation guards) or
-- through the backend's service-role grant-access flow.
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
    -- display name is safe to take from the client; role and status are not
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'New User'),
    new.email,
    'student',
    false
  );
  return new;
end;
$function$;
