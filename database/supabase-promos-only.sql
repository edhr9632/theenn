-- Run in Supabase Dashboard → SQL Editor → New query → Run
-- (Use this only if you cannot run `npm run supabase:setup` from your PC.)

INSERT INTO site_promo_banners (id, eyebrow, title, subtitle, cta_label, cta_url, variant, enabled)
VALUES (
  'tv_schedule',
  'TV Schedule',
  'Knowledge Plus - Education News Network',
  'Hosted by Vibha Raj',
  'Watch our live discussion @3PM',
  'https://www.youtube.com/@EducationTodayNews',
  'tv_schedule',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  eyebrow = EXCLUDED.eyebrow,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  cta_label = EXCLUDED.cta_label,
  cta_url = EXCLUDED.cta_url,
  variant = EXCLUDED.variant,
  enabled = TRUE,
  updated_at = NOW();

INSERT INTO site_promo_banners (id, eyebrow, title, subtitle, cta_label, cta_url, variant, enabled)
VALUES (
  'partner_msa',
  'Partner - Advertisement',
  'Looking for school admission? Visit MSA',
  'My School Admission helps parents discover schools, compare options, and apply with ease.',
  'Visit MSA',
  'https://myschooladmission.com/',
  'partner',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  eyebrow = EXCLUDED.eyebrow,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  cta_label = EXCLUDED.cta_label,
  cta_url = EXCLUDED.cta_url,
  variant = EXCLUDED.variant,
  enabled = TRUE,
  updated_at = NOW();
