-- Fix 1: bt_customers.partner_id: RESTRICT → CASCADE
-- So deleting a partner also deletes all their customers (and cascades further)
ALTER TABLE public.bt_customers
  DROP CONSTRAINT bt_customers_partner_id_fkey,
  ADD CONSTRAINT bt_customers_partner_id_fkey
    FOREIGN KEY (partner_id) REFERENCES public.bt_profiles(id) ON DELETE CASCADE;

-- Fix 2: bt_contract_history.changed_by: RESTRICT → SET NULL
-- Keep history but don't block partner deletion
ALTER TABLE public.bt_contract_history
  DROP CONSTRAINT bt_contract_history_changed_by_fkey,
  ADD CONSTRAINT bt_contract_history_changed_by_fkey
    FOREIGN KEY (changed_by) REFERENCES public.bt_profiles(id) ON DELETE SET NULL;

-- Fix 3: Add missing INSERT policy for bt_audit_logs
-- Without this, audit log inserts from server actions silently fail
CREATE POLICY "bt: Admins insert audit logs" ON public.bt_audit_logs
  FOR INSERT WITH CHECK (public.bt_is_admin());
