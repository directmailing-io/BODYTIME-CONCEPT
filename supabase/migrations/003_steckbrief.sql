-- ============================================================
-- Migration 003: Steckbrief (Partner Profile/Bio) Feature
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bt_steckbriefe (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id        uuid NOT NULL REFERENCES public.bt_profiles(id) ON DELETE CASCADE,

  -- Status: draft → pending → approved | rejected → pending (on edit)
  status            text NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason  text,

  -- Profile image
  image_url         text,

  -- Contact info (can differ from login email/phone)
  contact_first_name text,
  contact_last_name  text,
  contact_email      text,
  contact_phone      text,
  contact_address    text,

  -- Services / Leistungen as text array
  services          text[] NOT NULL DEFAULT '{}',

  -- Free text
  philosophy        text,

  -- Training modes: subset of {'online', 'offline'}
  training_modes    text[] NOT NULL DEFAULT '{}',

  -- Social media
  social_instagram  text,
  social_facebook   text,
  social_youtube    text,
  social_linkedin   text,
  social_tiktok     text,

  -- Timestamps
  submitted_at      timestamptz,
  reviewed_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  -- One bio per partner
  CONSTRAINT bt_steckbriefe_partner_unique UNIQUE (partner_id)
);

-- ── 2. Auto-update updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION bt_update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER bt_steckbriefe_updated_at
  BEFORE UPDATE ON public.bt_steckbriefe
  FOR EACH ROW EXECUTE FUNCTION bt_update_updated_at();

-- ── 3. Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS bt_steckbriefe_partner_idx ON public.bt_steckbriefe(partner_id);
CREATE INDEX IF NOT EXISTS bt_steckbriefe_status_idx  ON public.bt_steckbriefe(status);

-- ── 4. Row Level Security ─────────────────────────────────────
ALTER TABLE public.bt_steckbriefe ENABLE ROW LEVEL SECURITY;

-- Partners: full access to their own row
CREATE POLICY "partner_select_own_steckbrief" ON public.bt_steckbriefe
  FOR SELECT USING (auth.uid() = partner_id);

CREATE POLICY "partner_insert_own_steckbrief" ON public.bt_steckbriefe
  FOR INSERT WITH CHECK (auth.uid() = partner_id);

CREATE POLICY "partner_update_own_steckbrief" ON public.bt_steckbriefe
  FOR UPDATE USING (auth.uid() = partner_id)
  WITH CHECK (auth.uid() = partner_id);

CREATE POLICY "partner_delete_own_steckbrief" ON public.bt_steckbriefe
  FOR DELETE USING (auth.uid() = partner_id);

-- Admins: read all (writes via service role bypass RLS)
CREATE POLICY "admin_read_all_steckbriefe" ON public.bt_steckbriefe
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bt_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- ── 5. Storage Bucket ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bt_steckbriefe',
  'bt_steckbriefe',
  true,
  5242880,   -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for bt_steckbriefe bucket
CREATE POLICY "steckbrief_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'bt_steckbriefe');

CREATE POLICY "steckbrief_images_partner_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'bt_steckbriefe'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "steckbrief_images_partner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'bt_steckbriefe'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "steckbrief_images_partner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'bt_steckbriefe'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
