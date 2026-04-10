-- ============================================================
-- Migration 002: Add bt_settings table and order_number field
-- ============================================================

-- Global settings table (key-value store for admin-managed config)
create table public.bt_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- RLS: only admins can read/write settings
alter table public.bt_settings enable row level security;

create policy "Admins can manage settings"
  on public.bt_settings for all
  using (
    exists (
      select 1 from public.bt_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Partners can read settings"
  on public.bt_settings for select
  using (
    exists (
      select 1 from public.bt_profiles
      where id = auth.uid() and role = 'partner' and is_active = true
    )
  );

-- Seed default voucher code
insert into public.bt_settings (key, value) values ('voucher_code', 'BODYCONCEPT1');

-- Add order_number column to bt_customers
alter table public.bt_customers add column order_number text;
