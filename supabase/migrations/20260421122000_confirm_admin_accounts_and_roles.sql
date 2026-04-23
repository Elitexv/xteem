-- Ensure target admin accounts are email-confirmed and have admin role.
-- This helps when login fails with "Invalid login credentials" due to unconfirmed email.

DO $$
BEGIN
  -- Confirm account email addresses if users already exist.
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE lower(email) IN ('paulelite515@gmail.com', 'paulelite606@gmail.com');

  -- Ensure admin roles are present for both accounts.
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::public.app_role
  FROM auth.users
  WHERE lower(email) IN ('paulelite515@gmail.com', 'paulelite606@gmail.com')
  ON CONFLICT (user_id, role) DO NOTHING;
END
$$;
