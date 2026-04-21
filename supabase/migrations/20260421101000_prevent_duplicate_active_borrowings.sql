-- Prevent a user from borrowing the same book multiple times
-- while an active borrowing already exists.
--
-- First, clean up historical duplicates by keeping only the newest active
-- borrowing as "borrowed" and marking older duplicates as "returned".
WITH ranked_active AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, book_id
      ORDER BY borrowed_at DESC, id DESC
    ) AS rn
  FROM public.borrowings
  WHERE status = 'borrowed'
)
UPDATE public.borrowings b
SET
  status = 'returned',
  returned_at = COALESCE(b.returned_at, now())
FROM ranked_active r
WHERE b.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS borrowings_one_active_per_user_book_idx
ON public.borrowings (user_id, book_id)
WHERE status = 'borrowed';
