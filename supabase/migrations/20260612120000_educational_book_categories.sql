-- Align default and legacy book categories with educational sector taxonomy.

UPDATE public.books SET category = 'General Studies' WHERE category = 'General';
UPDATE public.books SET category = 'Languages & Literature' WHERE category = 'Fiction';
UPDATE public.books SET category = 'General Studies' WHERE category = 'Non-Fiction';
UPDATE public.books SET category = 'Science & Mathematics' WHERE category = 'Science';
UPDATE public.books SET category = 'Engineering & Technology' WHERE category = 'Technology';
UPDATE public.books SET category = 'Business & Economics' WHERE category = 'Business';
UPDATE public.books SET category = 'Humanities & Social Sciences' WHERE category IN ('History', 'Biography');
UPDATE public.books SET category = 'Education & Pedagogy' WHERE category IN ('Self-Help', 'Education');

ALTER TABLE public.books
  ALTER COLUMN category SET DEFAULT 'General Studies';
