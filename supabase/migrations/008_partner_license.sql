-- Add license tracking fields to bt_partner_profiles
ALTER TABLE public.bt_partner_profiles
  ADD COLUMN IF NOT EXISTS license_start date,
  ADD COLUMN IF NOT EXISTS license_duration_months integer NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS is_cancelled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancellation_date date;
