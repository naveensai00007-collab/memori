import { Category, Status, LocationType, ReminderType } from '../../../shared/types';

export interface CategoryMeta {
  id: Category;
  label: string;
  description: string;
  iconName: string;
  suggestedSubcategories: string[];
  suggestedSensitiveFields: { key: string; label: string; placeholder: string }[];
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'identity',
    label: 'Identity & Legal',
    description: 'Government IDs, Passports, Birth Certificates, Citizenship',
    iconName: 'ShieldCheck',
    suggestedSubcategories: ['Aadhaar', 'Passport', 'PAN Card', 'Voter ID', 'Driving License', 'Birth Certificate', 'Marriage Certificate'],
    suggestedSensitiveFields: [
      { key: 'document_number', label: 'ID / Document Number', placeholder: 'e.g. AAAA1234B' },
      { key: 'issue_date', label: 'Issue Date', placeholder: 'YYYY-MM-DD' },
      { key: 'issuing_authority', label: 'Issuing Authority', placeholder: 'e.g. Government of India' },
    ],
  },
  {
    id: 'education',
    label: 'Education & Career',
    description: 'Degrees, Transcripts, Certifications, Employment Letters',
    iconName: 'GraduationCap',
    suggestedSubcategories: ['Degree Certificate', 'Marksheets', 'Professional Certification', 'Employment Contract', 'Relieving Letter', 'Resume/CV'],
    suggestedSensitiveFields: [
      { key: 'student_or_emp_id', label: 'Student / Employee ID', placeholder: 'e.g. EMP-94821' },
      { key: 'verification_code', label: 'Certificate Verification Code', placeholder: 'e.g. CERT-XYZ-123' },
    ],
  },
  {
    id: 'money',
    label: 'Finance & Insurance',
    description: 'Bank Accounts, Health/Term Policies, Tax Filings, Investments',
    iconName: 'Coins',
    suggestedSubcategories: ['Health Insurance', 'Life Insurance', 'Bank Account', 'Fixed Deposit', 'Mutual Funds', 'Income Tax Filing (ITR)', 'Credit Card'],
    suggestedSensitiveFields: [
      { key: 'account_or_policy_no', label: 'Policy / Account Number', placeholder: 'e.g. POL-982341-A' },
      { key: 'nominee', label: 'Nominee Name', placeholder: 'e.g. Spouse / Parent' },
      { key: 'emergency_helpline', label: 'TPA / Helpline Number', placeholder: 'e.g. 1800-XXX-XXXX' },
    ],
  },
  {
    id: 'digital',
    label: 'Digital Life & Accounts',
    description: 'Domain Registrations, Cloud Accounts, Subscriptions, 2FA Recovery',
    iconName: 'Laptop',
    suggestedSubcategories: ['Domain Name', 'Cloud Hosting', 'Email Account', 'Password Vault Backup', 'Apple ID / Google Account', 'Software License'],
    suggestedSensitiveFields: [
      { key: 'recovery_codes', label: '2FA Recovery Keys', placeholder: 'Encrypted backup tokens' },
      { key: 'primary_username', label: 'Primary Username/Email', placeholder: 'e.g. user@example.com' },
    ],
  },
  {
    id: 'assets',
    label: 'Physical Assets & Property',
    description: 'Vehicle Registration, House Deeds, Gold Records, Warranties',
    iconName: 'Key',
    suggestedSubcategories: ['Vehicle Registration (RC)', 'Vehicle Insurance', 'Property Deed', 'Rental Agreement', 'Appliance Warranty', 'Jewellery Invoice'],
    suggestedSensitiveFields: [
      { key: 'registration_or_deed_no', label: 'Registration / Deed Number', placeholder: 'e.g. KA-01-AB-1234' },
      { key: 'purchase_value', label: 'Purchase Value / Reference', placeholder: 'e.g. ₹50,000' },
    ],
  },
  {
    id: 'government',
    label: 'Government & Schemes',
    description: 'Pension, PF/UAN, Ration Card, Subsidies, Voter Slip',
    iconName: 'Landmark',
    suggestedSubcategories: ['EPFO / UAN', 'NPS (PRAN)', 'Ration Card', 'LPG Connection', 'Property Tax Receipt', 'Water/Electricity ID'],
    suggestedSensitiveFields: [
      { key: 'uan_or_scheme_id', label: 'Scheme / UAN / Consumer No.', placeholder: 'e.g. 100982345678' },
    ],
  },
  {
    id: 'other',
    label: 'Other & Miscellaneous',
    description: 'Medical Records, Pet Passports, Club Memberships, Custom Items',
    iconName: 'FolderArchive',
    suggestedSubcategories: ['Medical History', 'Vaccination Record', 'Pet Record', 'Club Membership', 'Warranty Card'],
    suggestedSensitiveFields: [
      { key: 'reference_number', label: 'Reference / Membership ID', placeholder: 'e.g. MEM-00921' },
    ],
  },
];

export const STATUSES: { id: Status; label: string; bg: string; text: string; description: string }[] = [
  {
    id: 'complete',
    label: 'Complete',
    bg: 'bg-status-complete',
    text: 'text-white',
    description: 'Document and details are fully located and verified.',
  },
  {
    id: 'missing',
    label: 'Missing',
    bg: 'bg-status-missing',
    text: 'text-white',
    description: 'You do not have this document or cannot locate it.',
  },
  {
    id: 'needs_attention',
    label: 'Needs Attention',
    bg: 'bg-status-attention',
    text: 'text-white',
    description: 'Expired, expiring soon, or requires renewal/action.',
  },
  {
    id: 'not_applicable',
    label: 'N/A',
    bg: 'bg-status-na',
    text: 'text-white',
    description: 'Not applicable to your current life situation.',
  },
];

export const LOCATION_TYPES: { id: LocationType; label: string; icon: string }[] = [
  { id: 'physical', label: 'Physical Storage', icon: 'Folder' },
  { id: 'digital', label: 'Local Device / USB', icon: 'HardDrive' },
  { id: 'cloud', label: 'Cloud Drive (Google/Dropbox)', icon: 'Cloud' },
  { id: 'other', label: 'Other Safe', icon: 'Lock' },
];

export const REMINDER_TYPES: { id: ReminderType; label: string }[] = [
  { id: 'expiry', label: 'Document Expiry Alert' },
  { id: 'renewal', label: 'Policy / Subscription Renewal' },
  { id: 'review', label: 'Periodic Life Review' },
  { id: 'custom', label: 'Custom Reminder' },
];
