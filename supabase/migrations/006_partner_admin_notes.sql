-- Add internal admin notes field to partner profiles
alter table public.bt_partner_profiles
  add column if not exists admin_notes text;
