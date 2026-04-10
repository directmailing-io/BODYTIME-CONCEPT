-- Migration 004: Split contact_address into contact_zip + contact_city
-- Run in Supabase SQL Editor

ALTER TABLE public.bt_steckbriefe
  ADD COLUMN IF NOT EXISTS contact_zip  text,
  ADD COLUMN IF NOT EXISTS contact_city text;

-- Migrate existing data if any (split on last space before city)
-- contact_address was stored as "Straße, PLZ Stadt" — just clear it since feature is new
-- If you want to keep old data, do a manual UPDATE before dropping

ALTER TABLE public.bt_steckbriefe
  DROP COLUMN IF EXISTS contact_address;
