-- Partner pricing packages & payment tracking

-- Package templates per partner
CREATE TABLE IF NOT EXISTS bt_partner_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES bt_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Price items within a package template
CREATE TABLE IF NOT EXISTS bt_package_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES bt_partner_packages(id) ON DELETE CASCADE,
  name text NOT NULL,
  billing_type text NOT NULL CHECK (billing_type IN ('once', 'monthly')),
  amount numeric(10,2) NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0
);

-- Customer-specific price items (copied from package at assignment, editable per customer)
CREATE TABLE IF NOT EXISTS bt_customer_price_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES bt_customers(id) ON DELETE CASCADE,
  package_id uuid REFERENCES bt_partner_packages(id) ON DELETE SET NULL,
  package_name text,
  name text NOT NULL,
  billing_type text NOT NULL CHECK (billing_type IN ('once', 'monthly')),
  amount numeric(10,2) NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0
);

-- Payment schedule entries
CREATE TABLE IF NOT EXISTS bt_payment_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES bt_customers(id) ON DELETE CASCADE,
  due_date date NOT NULL,
  amount numeric(10,2) NOT NULL,
  description text NOT NULL,
  billing_type text NOT NULL CHECK (billing_type IN ('once', 'monthly')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  paid_at timestamptz,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bt_partner_packages_partner_id ON bt_partner_packages(partner_id);
CREATE INDEX IF NOT EXISTS idx_bt_package_items_package_id ON bt_package_items(package_id);
CREATE INDEX IF NOT EXISTS idx_bt_customer_price_items_customer_id ON bt_customer_price_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_bt_payment_entries_customer_id ON bt_payment_entries(customer_id);
CREATE INDEX IF NOT EXISTS idx_bt_payment_entries_due_date ON bt_payment_entries(due_date);
CREATE INDEX IF NOT EXISTS idx_bt_payment_entries_status ON bt_payment_entries(status);

-- RLS
ALTER TABLE bt_partner_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_customer_price_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_payment_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner_packages_own" ON bt_partner_packages FOR ALL USING (partner_id = auth.uid());
CREATE POLICY "partner_packages_admin" ON bt_partner_packages FOR ALL USING (
  EXISTS (SELECT 1 FROM bt_profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
);

CREATE POLICY "package_items_partner" ON bt_package_items FOR ALL USING (
  EXISTS (SELECT 1 FROM bt_partner_packages WHERE id = package_id AND partner_id = auth.uid())
);
CREATE POLICY "package_items_admin" ON bt_package_items FOR ALL USING (
  EXISTS (SELECT 1 FROM bt_profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
);

CREATE POLICY "customer_price_items_partner" ON bt_customer_price_items FOR ALL USING (
  EXISTS (SELECT 1 FROM bt_customers WHERE id = customer_id AND partner_id = auth.uid())
);
CREATE POLICY "customer_price_items_admin" ON bt_customer_price_items FOR ALL USING (
  EXISTS (SELECT 1 FROM bt_profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
);

CREATE POLICY "payment_entries_partner" ON bt_payment_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM bt_customers WHERE id = customer_id AND partner_id = auth.uid())
);
CREATE POLICY "payment_entries_admin" ON bt_payment_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM bt_profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
);
