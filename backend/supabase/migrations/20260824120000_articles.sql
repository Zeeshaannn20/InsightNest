-- ============================================================
-- Articles (blog)
--
-- A public writing surface, authored from the admin panel so publishing
-- never requires a deploy.
--
-- Access model:
--   * Anyone, signed in or not, may read an article whose status is
--     'published'. Drafts are invisible to everyone but staff.
--   * Only admins may write. is_admin() is the same SECURITY DEFINER
--     helper the rest of the schema uses.
-- ============================================================

create table if not exists public.articles (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null,
  title           text not null,
  excerpt         text,
  content         text not null default '',
  cover_image_url text,
  category        text,
  status          text not null default 'draft'
                    check (status in ('draft', 'published')),
  published_at    timestamptz,
  author_id       uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- The slug is the public URL, so it has to be unique and case-insensitive.
create unique index if not exists articles_slug_key
  on public.articles (lower(slug));

-- The list page reads published articles newest first.
create index if not exists articles_published_idx
  on public.articles (published_at desc)
  where status = 'published';

alter table public.articles enable row level security;

-- Public read, but only what has actually been published.
drop policy if exists "articles_select_published" on public.articles;
create policy "articles_select_published"
  on public.articles for select to anon, authenticated
  using (status = 'published');

-- Staff see everything, including drafts.
drop policy if exists "articles_select_staff" on public.articles;
create policy "articles_select_staff"
  on public.articles for select to authenticated
  using (is_admin());

drop policy if exists "articles_insert_staff" on public.articles;
create policy "articles_insert_staff"
  on public.articles for insert to authenticated
  with check (is_admin());

drop policy if exists "articles_update_staff" on public.articles;
create policy "articles_update_staff"
  on public.articles for update to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "articles_delete_staff" on public.articles;
create policy "articles_delete_staff"
  on public.articles for delete to authenticated
  using (is_admin());

-- Keep updated_at honest without the client having to remember.
create or replace function public.touch_articles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_touch_updated_at on public.articles;
create trigger articles_touch_updated_at
  before update on public.articles
  for each row execute function public.touch_articles_updated_at();
