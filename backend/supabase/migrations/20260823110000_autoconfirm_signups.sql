-- ============================================================
-- Auto-confirm new signups
--
-- STOPGAP. The real fix is Supabase Dashboard → Authentication → Sign In /
-- Providers → Email → "Confirm email" OFF. That setting lives in GoTrue's
-- config, not in Postgres, so it cannot be changed from a migration.
--
-- This marks every new account as email-confirmed the moment it is created, so
-- nobody is ever locked out waiting for a link. With the dashboard toggle still
-- ON, Supabase will continue to SEND the confirmation email — this only makes
-- clicking it unnecessary. Turn the toggle off to stop the email itself.
--
-- Safe to leave in place after the toggle is switched off: GoTrue already sets
-- email_confirmed_at in that case, and this is a no-op when it is already set.
--
-- To undo: drop trigger on_auth_user_autoconfirm on auth.users;
-- ============================================================

create or replace function public.autoconfirm_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'auth', 'pg_temp'
as $function$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$function$;

drop trigger if exists on_auth_user_autoconfirm on auth.users;
create trigger on_auth_user_autoconfirm
  before insert on auth.users
  for each row execute function public.autoconfirm_new_user();
