-- ============================================================
-- November launch: rename the data analytics course and add
-- Product Management. Both sell at ₹2,999.
-- ============================================================

update public.courses
set title = 'Data Analytics with GenAI for Placement Bootcamp'
where slug = 'data-analyst';

insert into public.courses (title, description, slug, price_paise, currency, status, is_published, duration_weeks)
select
  'Product Management with Generative AI',
  'Product strategy, user research, UX, PRDs, Agile, product analytics and go-to-market in 8 modules, ending in a capstone.',
  'product-management', 299900, 'INR', 'open', true, null
where not exists (select 1 from public.courses where slug = 'product-management');
