-- ── Migration 009 ────────────────────────────────────────────────────────────
-- Fix 1: Add DELETE policies for bt_customers
--   Without these, RLS silently blocks partner deletes (no error, 0 rows affected)
CREATE POLICY "bt: Partner deletes own customers" ON public.bt_customers
  FOR DELETE USING (partner_id = auth.uid());

CREATE POLICY "bt: Admins delete customers" ON public.bt_customers
  FOR DELETE USING (public.bt_is_admin());

-- ── Fix 2: Add cancellation_notice_months to bt_partner_profiles ─────────────
--   Missing from migration 008 but referenced in updatePartnerLicenseAction
ALTER TABLE public.bt_partner_profiles
  ADD COLUMN IF NOT EXISTS cancellation_notice_months integer NOT NULL DEFAULT 3;

-- ── Fix 3: Create bt_referral_notes table ────────────────────────────────────
--   Referenced throughout the code but was never created
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

-- Admin pages use createAdminClient (bypasses RLS), but define policy for completeness
CREATE POLICY "bt: Admins manage referral notes" ON public.bt_referral_notes
  FOR ALL USING (public.bt_is_admin());
