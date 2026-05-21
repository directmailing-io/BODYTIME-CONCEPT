-- ── Migration 011 ────────────────────────────────────────────────────────────
-- Fix all issues discovered after Supabase migration:
--
-- 1. Make bt_contract_history.changed_by nullable
--    (migration 001 defined it NOT NULL; public order inserts with null)
-- 2. Add profile_complete + source columns to bt_customers
--    (referenced in createCustomerAction / createPublicOrderAction)
-- 3. Add customer DELETE RLS policies
--    (missing from migration 001; without them partner deletes silently fail)
-- 4. Create bt_steckbriefe storage bucket (idempotent)
-- 5. Fix bt_customers.partner_id FK: RESTRICT → CASCADE (idempotent)
-- 6. Fix bt_contract_history.changed_by FK: RESTRICT → SET NULL (idempotent)

-- ── 1. Make changed_by nullable ──────────────────────────────────────────────
ALTER TABLE public.bt_contract_history
  ALTER COLUMN changed_by DROP NOT NULL;

-- ── 2. Add missing columns to bt_customers ───────────────────────────────────
ALTER TABLE public.bt_customers
  ADD COLUMN IF NOT EXISTS profile_complete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source text;

-- ── 3. Customer DELETE RLS policies ─────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bt_customers'
      AND policyname = 'bt: Partner deletes own customers'
  ) THEN
    CREATE POLICY "bt: Partner deletes own customers" ON public.bt_customers
      FOR DELETE USING (partner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bt_customers'
      AND policyname = 'bt: Admins delete customers'
  ) THEN
    CREATE POLICY "bt: Admins delete customers" ON public.bt_customers
      FOR DELETE USING (public.bt_is_admin());
  END IF;
END;
$$;

-- ── 4. Storage bucket for steckbriefe ────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bt_steckbriefe',
  'bt_steckbriefe',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
      AND policyname = 'bt: Public steckbriefe images readable'
  ) THEN
    CREATE POLICY "bt: Public steckbriefe images readable"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'bt_steckbriefe');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
      AND policyname = 'bt: Partners upload own steckbrief image'
  ) THEN
    CREATE POLICY "bt: Partners upload own steckbrief image"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'bt_steckbriefe' AND auth.uid() IS NOT NULL
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
      AND policyname = 'bt: Partners update own steckbrief image'
  ) THEN
    CREATE POLICY "bt: Partners update own steckbrief image"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'bt_steckbriefe' AND auth.uid() IS NOT NULL
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
      AND policyname = 'bt: Partners delete own steckbrief image'
  ) THEN
    CREATE POLICY "bt: Partners delete own steckbrief image"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'bt_steckbriefe' AND auth.uid() IS NOT NULL
      );
  END IF;
END;
$$;

-- ── 5. Fix bt_customers.partner_id FK: RESTRICT → CASCADE ───────────────────
DO $$
DECLARE
  _constraint text;
BEGIN
  SELECT conname INTO _constraint
  FROM pg_constraint
  WHERE conrelid = 'public.bt_customers'::regclass
    AND contype = 'f'
    AND conname LIKE '%partner_id%';

  IF _constraint IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.bt_customers DROP CONSTRAINT ' || quote_ident(_constraint);
  END IF;
END;
$$;

ALTER TABLE public.bt_customers
  ADD CONSTRAINT bt_customers_partner_id_fkey
    FOREIGN KEY (partner_id) REFERENCES public.bt_profiles(id) ON DELETE CASCADE;

-- ── 6. Fix bt_contract_history.changed_by FK: RESTRICT → SET NULL ────────────
DO $$
DECLARE
  _constraint text;
BEGIN
  SELECT conname INTO _constraint
  FROM pg_constraint
  WHERE conrelid = 'public.bt_contract_history'::regclass
    AND contype = 'f'
    AND conname LIKE '%changed_by%';

  IF _constraint IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.bt_contract_history DROP CONSTRAINT ' || quote_ident(_constraint);
  END IF;
END;
$$;

ALTER TABLE public.bt_contract_history
  ADD CONSTRAINT bt_contract_history_changed_by_fkey
    FOREIGN KEY (changed_by) REFERENCES public.bt_profiles(id) ON DELETE SET NULL;

-- ── 7. Add cancellation_notice_months to bt_partner_profiles (migration 009) ─
ALTER TABLE public.bt_partner_profiles
  ADD COLUMN IF NOT EXISTS cancellation_notice_months integer NOT NULL DEFAULT 3;

-- ── 8. Create bt_referral_notes table (migration 009) ────────────────────────
CREATE TABLE IF NOT EXISTS public.bt_referral_notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid        NOT NULL REFERENCES public.bt_referrals(id) ON DELETE CASCADE,
  content     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bt_referral_notes_referral
  ON public.bt_referral_notes(referral_id, created_at DESC);

ALTER TABLE public.bt_referral_notes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bt_referral_notes'
      AND policyname = 'bt: Admins manage referral notes'
  ) THEN
    CREATE POLICY "bt: Admins manage referral notes" ON public.bt_referral_notes
      FOR ALL USING (public.bt_is_admin());
  END IF;
END;
$$;
