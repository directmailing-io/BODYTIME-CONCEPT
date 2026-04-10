-- ============================================================
-- BODYTIME concept – Initial Database Schema
-- All tables prefixed with bt_ to avoid conflicts
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. BT_PROFILES  (extends auth.users)
-- ============================================================
create table public.bt_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null check (role in ('admin', 'partner')),
  first_name   text not null,
  last_name    text not null,
  email        text not null,
  is_active    boolean not null default true,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- 2. BT_PARTNER_PROFILES  (business details for partner role)
-- ============================================================
create table public.bt_partner_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.bt_profiles(id) on delete cascade,
  company_name    text,
  address_street  text,
  address_zip     text,
  address_city    text,
  address_country text default 'Deutschland',
  phone           text,
  website         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id)
);

-- ============================================================
-- 3. BT_CUSTOMERS  (end customers owned by a partner)
-- ============================================================
create table public.bt_customers (
  id                     uuid primary key default gen_random_uuid(),
  partner_id             uuid not null references public.bt_profiles(id) on delete restrict,
  salutation             text check (salutation in ('Herr', 'Frau', 'Divers')),
  first_name             text not null,
  last_name              text not null,
  email                  text not null,
  phone                  text,
  birth_date             date,
  address_street         text,
  address_zip            text,
  address_city           text,

  -- Current active contract (always reflects the latest/active period)
  order_date             date not null,
  rental_duration_months integer not null check (rental_duration_months in (3, 6, 12, 24)),
  contract_end_date      date not null,

  ems_suit_type          text,
  size_top               text check (size_top in ('XS', 'S', 'M', 'L', 'XL')),
  size_pants             text check (size_pants in ('XS', 'S', 'M', 'L', 'XL')),
  notes                  text,
  is_active              boolean not null default true,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index idx_bt_customers_partner_id on public.bt_customers(partner_id);
create index idx_bt_customers_contract_end on public.bt_customers(contract_end_date) where is_active = true;

-- ============================================================
-- 4. BT_CONTRACT_HISTORY  (immutable append-only log)
-- ============================================================
create table public.bt_contract_history (
  id                     uuid primary key default gen_random_uuid(),
  customer_id            uuid not null references public.bt_customers(id) on delete cascade,
  order_date             date not null,
  rental_duration_months integer not null,
  contract_end_date      date not null,
  change_type            text not null check (change_type in ('initial', 'renewal', 'modification')),
  change_notes           text,
  changed_by             uuid not null references public.bt_profiles(id) on delete restrict,
  created_at             timestamptz not null default now()
);

create index idx_bt_contract_history_customer on public.bt_contract_history(customer_id, created_at desc);

-- ============================================================
-- 5. BT_CRM_NOTES  (partner-private timeline per customer)
-- ============================================================
create table public.bt_crm_notes (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.bt_customers(id) on delete cascade,
  partner_id  uuid not null references public.bt_profiles(id) on delete cascade,
  note        text not null,
  created_at  timestamptz not null default now()
);

create index idx_bt_crm_notes_customer on public.bt_crm_notes(customer_id, created_at desc);

-- ============================================================
-- 6. BT_DOCUMENTS  (admin-managed PDFs, videos, links)
-- ============================================================
create table public.bt_documents (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  category     text,
  type         text not null check (type in ('pdf', 'video', 'link')),
  file_url     text,
  video_url    text,
  is_published boolean not null default false,
  created_by   uuid not null references public.bt_profiles(id) on delete restrict,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_bt_documents_published on public.bt_documents(is_published, created_at desc);

-- ============================================================
-- 7. BT_REMINDER_LOGS  (idempotent reminder tracking)
-- ============================================================
create table public.bt_reminder_logs (
  id                 uuid primary key default gen_random_uuid(),
  customer_id        uuid not null references public.bt_customers(id) on delete cascade,
  partner_id         uuid not null references public.bt_profiles(id) on delete cascade,
  reminder_type      text not null default 'expiry_warning',
  contract_end_date  date not null,
  sent_at            timestamptz not null default now(),
  unique (customer_id, contract_end_date)
);

-- ============================================================
-- 8. BT_AUDIT_LOGS  (GDPR-relevant action trail)
-- ============================================================
create table public.bt_audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.bt_profiles(id) on delete set null,
  action      text not null,
  table_name  text not null,
  record_id   text,
  old_values  jsonb,
  new_values  jsonb,
  ip_address  text,
  created_at  timestamptz not null default now()
);

create index idx_bt_audit_logs_created on public.bt_audit_logs(created_at desc);
create index idx_bt_audit_logs_user on public.bt_audit_logs(user_id, created_at desc);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
create or replace function public.bt_handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_bt_profiles_updated_at
  before update on public.bt_profiles
  for each row execute procedure public.bt_handle_updated_at();

create trigger trg_bt_partner_profiles_updated_at
  before update on public.bt_partner_profiles
  for each row execute procedure public.bt_handle_updated_at();

create trigger trg_bt_customers_updated_at
  before update on public.bt_customers
  for each row execute procedure public.bt_handle_updated_at();

create trigger trg_bt_documents_updated_at
  before update on public.bt_documents
  for each row execute procedure public.bt_handle_updated_at();

-- ============================================================
-- TRIGGER: auto-create bt_profile on auth.users insert
-- ============================================================
create or replace function public.bt_handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.bt_profiles (id, role, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'partner'),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger trg_bt_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.bt_handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.bt_profiles enable row level security;
alter table public.bt_partner_profiles enable row level security;
alter table public.bt_customers enable row level security;
alter table public.bt_contract_history enable row level security;
alter table public.bt_crm_notes enable row level security;
alter table public.bt_documents enable row level security;
alter table public.bt_reminder_logs enable row level security;
alter table public.bt_audit_logs enable row level security;

-- ---- Helper functions ----
create or replace function public.bt_is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.bt_profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

-- ---- bt_profiles ----
create policy "bt: Users read own profile" on public.bt_profiles
  for select using (id = auth.uid());

create policy "bt: Admins read all profiles" on public.bt_profiles
  for select using (public.bt_is_admin());

create policy "bt: Admins update profiles" on public.bt_profiles
  for update using (public.bt_is_admin());

create policy "bt: Admins delete profiles" on public.bt_profiles
  for delete using (public.bt_is_admin());

create policy "bt: Users update own profile" on public.bt_profiles
  for update using (id = auth.uid());

create policy "bt: Service role insert profiles" on public.bt_profiles
  for insert with check (true);

-- ---- bt_partner_profiles ----
create policy "bt: Partner reads own partner_profile" on public.bt_partner_profiles
  for select using (user_id = auth.uid());

create policy "bt: Admins read all partner_profiles" on public.bt_partner_profiles
  for select using (public.bt_is_admin());

create policy "bt: Partner upserts own partner_profile" on public.bt_partner_profiles
  for all using (user_id = auth.uid());

create policy "bt: Admins manage all partner_profiles" on public.bt_partner_profiles
  for all using (public.bt_is_admin());

-- ---- bt_customers ----
create policy "bt: Partner sees own customers" on public.bt_customers
  for select using (partner_id = auth.uid());

create policy "bt: Partner inserts own customers" on public.bt_customers
  for insert with check (partner_id = auth.uid());

create policy "bt: Partner updates own customers" on public.bt_customers
  for update using (partner_id = auth.uid());

create policy "bt: Admins read all customers" on public.bt_customers
  for select using (public.bt_is_admin());

create policy "bt: Admins update customers" on public.bt_customers
  for update using (public.bt_is_admin());

-- ---- bt_contract_history ----
create policy "bt: Partner sees own contract history" on public.bt_contract_history
  for select using (
    exists (
      select 1 from public.bt_customers c
      where c.id = bt_contract_history.customer_id and c.partner_id = auth.uid()
    )
  );

create policy "bt: Partner inserts own contract history" on public.bt_contract_history
  for insert with check (
    exists (
      select 1 from public.bt_customers c
      where c.id = bt_contract_history.customer_id and c.partner_id = auth.uid()
    )
  );

create policy "bt: Admins read all contract history" on public.bt_contract_history
  for select using (public.bt_is_admin());

-- ---- bt_crm_notes ----
create policy "bt: Partner sees own notes" on public.bt_crm_notes
  for select using (partner_id = auth.uid());

create policy "bt: Partner manages own notes" on public.bt_crm_notes
  for all using (partner_id = auth.uid());

-- ---- bt_documents ----
create policy "bt: Published docs visible to active partners" on public.bt_documents
  for select using (
    is_published = true and (
      public.bt_is_admin() or
      exists (
        select 1 from public.bt_profiles
        where id = auth.uid() and role = 'partner' and is_active = true
      )
    )
  );

create policy "bt: Admins see all documents" on public.bt_documents
  for select using (public.bt_is_admin());

create policy "bt: Admins manage documents" on public.bt_documents
  for all using (public.bt_is_admin());

-- ---- bt_reminder_logs ----
create policy "bt: Partner sees own reminder logs" on public.bt_reminder_logs
  for select using (partner_id = auth.uid());

create policy "bt: Admins see all reminder logs" on public.bt_reminder_logs
  for select using (public.bt_is_admin());

-- ---- bt_audit_logs ----
create policy "bt: Admins read audit logs" on public.bt_audit_logs
  for select using (public.bt_is_admin());
