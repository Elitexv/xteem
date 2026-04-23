-- Add category to books and backfill existing rows.
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS category TEXT;

UPDATE public.books
SET category = 'General'
WHERE category IS NULL OR btrim(category) = '';

ALTER TABLE public.books
ALTER COLUMN category SET DEFAULT 'General';

ALTER TABLE public.books
ALTER COLUMN category SET NOT NULL;
