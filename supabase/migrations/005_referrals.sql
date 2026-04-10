-- ── bt_referrals ────────────────────────────────────────────────────────────
-- Stores partner referrals (Empfehlungen).
-- Partners can submit leads; admins track and update their status.

create table if not exists bt_referrals (
  id                uuid        primary key default gen_random_uuid(),
  partner_id        uuid        not null references bt_profiles(id) on delete cascade,
  first_name        text        not null,
  last_name         text        not null,
  phone             text        not null,
  email             text        not null,
  note              text,
  status            text        not null default 'eingegangen'
                                check (status in ('eingegangen','in_bearbeitung','gewonnen','kein_interesse')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Index for partner lookups and status filtering
create index if not exists bt_referrals_partner_id_idx on bt_referrals(partner_id);
create index if not exists bt_referrals_status_idx      on bt_referrals(status);
create index if not exists bt_referrals_created_at_idx  on bt_referrals(created_at desc);

-- RLS
alter table bt_referrals enable row level security;

-- Partners: read & insert own referrals only
create policy "partner_select_own_referrals"
  on bt_referrals for select
  using (partner_id = auth.uid());

create policy "partner_insert_referral"
  on bt_referrals for insert
  with check (partner_id = auth.uid());

-- Admins: full access (relies on service role / admin client)
-- (Admin pages use createAdminClient which bypasses RLS)
