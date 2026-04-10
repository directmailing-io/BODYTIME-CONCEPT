// ============================================================
// Global TypeScript types for BODYTIME concept
// ============================================================

export type UserRole = 'admin' | 'partner';

export type ProfileStatus = 'active' | 'inactive';

export interface Profile {
  id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerProfile {
  id: string;
  user_id: string;
  company_name: string | null;
  address_street: string | null;
  address_zip: string | null;
  address_city: string | null;
  address_country: string | null;
  phone: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

// Partner = profile + partner_profile merged (used in admin views)
export interface Partner extends Profile {
  partner_profile: PartnerProfile | null;
  customer_count?: number;
}

// ---- Customers ----

export type Salutation = 'Herr' | 'Frau' | 'Divers' | null;
export type RentalDuration = 3 | 6 | 12 | 24;
export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface Customer {
  id: string;
  partner_id: string;
  salutation: Salutation;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  birth_date: string | null;
  address_street: string | null;
  address_zip: string | null;
  address_city: string | null;
  order_date: string;
  rental_duration_months: RentalDuration;
  contract_end_date: string; // computed: order_date + rental_duration_months
  ems_suit_type: string | null;
  size_top: ClothingSize | null;
  size_pants: ClothingSize | null;
  notes: string | null;
  is_active: boolean;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Contract history ----

export type ContractChangeType = 'initial' | 'renewal' | 'modification';

export interface ContractHistory {
  id: string;
  customer_id: string;
  order_date: string;
  rental_duration_months: RentalDuration;
  contract_end_date: string;
  change_type: ContractChangeType;
  change_notes: string | null;
  changed_by: string; // profile id
  changed_by_name?: string;
  created_at: string;
}

// ---- CRM Notes ----

export interface CrmNote {
  id: string;
  customer_id: string;
  partner_id: string;
  note: string;
  created_at: string;
  author_name?: string;
}

// ---- Documents ----

export type DocumentType = 'pdf' | 'video' | 'link';

export interface Document {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  type: DocumentType;
  file_url: string | null;
  video_url: string | null;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ---- Audit Logs ----

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ---- Reminder Logs ----

export interface ReminderLog {
  id: string;
  customer_id: string;
  partner_id: string;
  reminder_type: 'expiry_warning';
  contract_end_date: string;
  sent_at: string;
}

// ---- Steckbrief ----

export type SteckbriefStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Steckbrief {
  id: string;
  partner_id: string;
  status: SteckbriefStatus;
  rejection_reason: string | null;
  image_url: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_zip: string | null;
  contact_city: string | null;
  services: string[];
  philosophy: string | null;
  training_modes: string[];
  social_instagram: string | null;
  social_facebook: string | null;
  social_youtube: string | null;
  social_linkedin: string | null;
  social_tiktok: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SteckbriefWithPartner extends Steckbrief {
  partner_first_name: string | null;
  partner_last_name: string | null;
  partner_email: string | null;
  partner_company: string | null;
}

// ---- UI helpers ----

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
