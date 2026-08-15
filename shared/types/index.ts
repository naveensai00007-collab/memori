// ==========================================
// MEMORI SHARED TYPE DEFINITIONS (Single Source of Truth)
// ==========================================

export type Category = 
  | 'identity' 
  | 'education' 
  | 'money' 
  | 'digital' 
  | 'assets' 
  | 'government' 
  | 'other';

export type Status = 
  | 'complete' 
  | 'missing' 
  | 'needs_attention' 
  | 'not_applicable';

export type LocationType = 
  | 'physical' 
  | 'digital' 
  | 'cloud' 
  | 'other';

export type ReminderType = 
  | 'expiry' 
  | 'renewal' 
  | 'review' 
  | 'custom';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  reminder_email: boolean;
  review_interval: number; // in days (e.g. 7, 14, 30)
  last_review_prompt?: string; // ISO date
}

export interface User {
  id: string;
  email: string;
  encryption_salt: string; // Base64 encoded 32-byte salt
  settings: UserSettings;
  created_at: string;
  updated_at: string;
  last_active_at?: string | null;
}

export interface SensitiveData {
  document_number?: string;
  account_number?: string;
  pin_or_code?: string;
  custom_secret?: string;
  [key: string]: string | undefined;
}

export interface Item {
  id: string;
  user_id: string;
  title: string;
  category: Category;
  subcategory?: string | null;
  status: Status;
  description?: string | null;
  notes?: string | null;
  tags: string[];
  // Location references
  physical_location?: string | null;
  digital_copy_uri?: string | null;
  location_id?: string | null;
  location?: Location | null;
  // Temporal metadata
  expiry_date?: string | null; // ISO Date YYYY-MM-DD
  reminder_date?: string | null; // ISO Date YYYY-MM-DD
  last_reviewed_at?: string | null;
  // Encrypted sensitive fields (stored as encrypted Base64 string payload on server)
  sensitive_data?: string | null; // Base64 encrypted payload on wire & in DB
  // Decrypted sensitive fields (only present in memory on client)
  decrypted_sensitive_data?: SensitiveData | null;
  // Concurrency & Metadata
  created_at: string;
  updated_at: string;
  version: number; // Lamport clock / optimistic lock
  // Offline sync tracking
  _pending?: boolean;
}

export interface Location {
  id: string;
  user_id: string;
  name: string;
  type: LocationType;
  description?: string | null;
  address?: string | null;
  uri_template?: string | null;
  created_at: string;
  updated_at: string;
  _pending?: boolean;
}

export interface Reminder {
  id: string;
  user_id: string;
  item_id: string;
  item?: Item;
  type: ReminderType;
  scheduled_date: string; // ISO Date YYYY-MM-DD
  triggered: boolean;
  acknowledged: boolean;
  sent_at?: string | null;
  created_at: string;
  updated_at: string;
  _pending?: boolean;
}

export interface SyncMetadata {
  user_id: string;
  last_sync_at: string;
  local_version: number;
  pending_operations: SyncOperation[];
}

export interface SyncOperation {
  id: string;
  entity: 'item' | 'location' | 'reminder';
  action: 'create' | 'update' | 'delete';
  data: any;
  version: number;
  timestamp: number;
}

export interface SyncPushPayload {
  operations: SyncOperation[];
}

export interface SyncConflict {
  id: string;
  entity: 'item' | 'location' | 'reminder';
  clientVersion: number;
  serverVersion: number;
  serverData: any;
}

export interface SyncPushResponse {
  accepted: string[];
  conflicts: SyncConflict[];
  serverVersion: number;
}

export interface SyncPullResponse {
  items: Item[];
  locations: Location[];
  reminders: Reminder[];
  serverVersion: number;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
}

// ==========================================
// API DTOs & Payloads
// ==========================================

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    encryption_salt: string;
    settings: UserSettings;
  };
  token: string;
  refresh_token?: string;
}

export interface ItemFilterParams {
  category?: Category;
  status?: Status;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ItemListResponse {
  items: Item[];
  total: number;
  limit: number;
  offset: number;
}

export interface LifeStats {
  total_items: number;
  complete_count: number;
  missing_count: number;
  needs_attention_count: number;
  not_applicable_count: number;
  completeness_percentage: number;
  category_breakdown: Record<Category, { total: number; complete: number; missing: number; needs_attention: number }>;
  upcoming_reminders: Reminder[];
}
