import { z } from 'zod';

export const CategoryEnum = z.enum([
  'identity',
  'education',
  'money',
  'digital',
  'assets',
  'government',
  'other',
]);

export const StatusEnum = z.enum([
  'complete',
  'missing',
  'needs_attention',
  'not_applicable',
]);

export const LocationTypeEnum = z.enum([
  'physical',
  'digital',
  'cloud',
  'other',
]);

export const ReminderTypeEnum = z.enum([
  'expiry',
  'renewal',
  'review',
  'custom',
]);

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  master_password: z.string().min(8, 'Password must be at least 8 characters'),
  encryption_salt: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  master_password: z.string().min(1, 'Password is required'),
});

export const ItemCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  category: CategoryEnum,
  subcategory: z.string().max(100).nullable().optional(),
  status: StatusEnum.default('missing'),
  description: z.string().max(2000).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  tags: z.array(z.string()).default([]),
  physical_location: z.string().max(255).nullable().optional(),
  digital_copy_uri: z.string().max(1000).nullable().optional(),
  location_id: z.string().uuid().nullable().optional(),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  reminder_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  sensitive_data: z.string().nullable().optional(),
});

export const ItemUpdateSchema = ItemCreateSchema.partial().extend({
  version: z.number().int().optional(),
});

export const LocationCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: LocationTypeEnum,
  description: z.string().max(1000).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  uri_template: z.string().max(1000).nullable().optional(),
});

export const ReminderCreateSchema = z.object({
  item_id: z.string().uuid('Valid item ID required'),
  type: ReminderTypeEnum,
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
});

export const UserSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('light'),
  reminder_email: z.boolean().default(true),
  review_interval: z.number().int().min(1).max(90).default(30),
  last_review_prompt: z.string().optional(),
});
