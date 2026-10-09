-- ============================================================
-- Assignment submission uploads
--
-- The student assignments page could not actually hand a file in: the Submit
-- button only showed an alert saying an upload "would" happen.
--
-- The `submissions` bucket itself does exist on production, created outside of
-- these migrations — `_archive/004_storage.sql` fails on it with a duplicate
-- key, and never got as far as its policies. So this migration has to cope with
-- a bucket that is already there and may be configured wrong, not just create
-- one. (That archived file also calls an `is_instructor()` the schema does not
-- define, which is a second reason not to run it.)
--
-- Access model, mirroring `public.submissions`:
--   * A student writes and reads only under their own `auth.uid()` folder,
--     which is why `frontend/src/lib/submissions.ts` always builds object paths
--     as `<user id>/<assignment id>/<file>`.
--   * Staff read everything. `is_admin()` already covers instructors.
--   * Nobody deletes. A handed-in file stays put; a resubmission writes a new
--     object rather than overwriting the old one, so the history survives.
--
-- `submissions.file_url` holds the object path rather than a public URL, and
-- the app signs a short-lived download URL on demand — which works whether or
-- not the bucket is public, but assumes it is private. See the note below.
--
-- Note: `storage.objects` policies need table-owner rights — run this as the
-- `postgres` role (the Supabase SQL editor does).
-- ============================================================

-- 50 MB ceiling, enforced server-side. The per-assignment limit that students
-- actually see is `assignments.max_file_size` (25 MB by default), checked in
-- the browser before the upload starts.
--
-- No `allowed_mime_types`: the per-assignment rule is a list of extensions
-- (pbix, ipynb, sql …) that does not map cleanly onto MIME types, and a bucket
-- level list that disagreed with it would reject files the assignment allows.
insert into storage.buckets (id, name, public, file_size_limit)
values ('submissions', 'submissions', false, 52428800)
on conflict (id) do nothing;

-- The bucket already exists on production, so the insert above is usually a
-- no-op and these two settings are whatever it was created with. Both of them
-- reject uploads silently from the student's point of view, so reconcile them:
--
--   * a non-null `allowed_mime_types` would bounce the half of
--     `assignments.allowed_file_types` that has no clean MIME equivalent;
--   * a `file_size_limit` under the per-assignment ceiling would bounce files
--     the assignment itself says are fine.
--
-- Widening only — `greatest` leaves a larger existing limit alone.
update storage.buckets
   set allowed_mime_types = null,
       file_size_limit = greatest(coalesce(file_size_limit, 0), 52428800)
 where id = 'submissions'
   and (allowed_mime_types is not null or coalesce(file_size_limit, 0) < 52428800);

-- Deliberately NOT touched: `public`. Student submissions belong in a private
-- bucket, and the app signs its own download URLs either way, but flipping a
-- live bucket to private would break any existing direct link. Check it with
--   select public from storage.buckets where id = 'submissions';
-- and if it comes back true, decide that one explicitly.

drop policy if exists "Students upload own submissions" on storage.objects;
create policy "Students upload own submissions" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Students read own submissions" on storage.objects;
create policy "Students read own submissions" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Staff read all submissions" on storage.objects;
create policy "Staff read all submissions" on storage.objects
  for select to authenticated
  using (bucket_id = 'submissions' and public.is_admin());
