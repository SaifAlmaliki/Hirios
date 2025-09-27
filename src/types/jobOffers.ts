import { Database } from '@/integrations/supabase/types';

// Base types from database
export type JobOffer = Database['public']['Tables']['job_offers']['Row'];
export type JobOfferInsert = Database['public']['Tables']['job_offers']['Insert'];
export type JobOfferUpdate = Database['public']['Tables']['job_offers']['Update'];

// Using existing candidate_comments table for offer-related comments
export type JobOfferComment = Database['public']['Tables']['candidate_comments']['Row'];
export type JobOfferCommentInsert = Database['public']['Tables']['candidate_comments']['Insert'];

// Extended types with relationships
export interface JobOfferWithDetails extends JobOffer {
  resume_pool: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  job: {
    id: string;
    title: string;
    company: string;
    department: string;
  };
  company_profile: {
    id: string;
    company_name: string | null;
    address: string | null;
    phone: string | null;
    logo_url: string | null;
  };
  comments?: JobOfferComment[];
}

// Offer status types
export type OfferStatus = 
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'withdrawn';

// Comment types for offer-related comments (stored in comment text or as prefixes)
export type CommentType = 
  | 'general'
  | 'rejection_reason'
  | 'acceptance_note'
  | 'expiry_note';

// Form types for offer creation
export interface OfferFormData {
  salary_amount: number;
  salary_currency: string;
  bonus_amount?: number;
  bonus_description?: string;
  benefits: string;
  reports_to: string;
  insurance_details?: string;
  expiry_period_days: number;
  email_cc_addresses?: string[];
}

// PDF generation types
export interface OfferPDFData {
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  company_name: string;
  company_address?: string;
  company_phone?: string;
  salary_amount: number;
  salary_currency: string;
  bonus_amount?: number;
  bonus_description?: string;
  benefits: string;
  reports_to: string;
  insurance_details?: string;
  offer_date: string;
  expiry_date: string;
  offer_id: string;
}

// Email webhook types for n8n
export interface OfferEmailData {
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  company_name: string;
  salary_amount: number;
  salary_currency: string;
  bonus_amount?: number;
  bonus_description?: string;
  benefits: string;
  reports_to: string;
  insurance_details?: string;
  offer_date: string;
  expiry_date: string;
  offer_link: string;
  pdf_url: string;
  recruiter_email: string;
  cc_emails?: string[];
}

// Status badge configuration
export const OFFER_STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-700',
  },
  sent: {
    label: 'Sent',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-700',
  },
  accepted: {
    label: 'Accepted',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-700',
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-700',
  },
  expired: {
    label: 'Expired',
    variant: 'destructive' as const,
    className: 'bg-orange-100 text-orange-700',
  },
  withdrawn: {
    label: 'Withdrawn',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-700',
  },
} as const;

// Currency options
export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
] as const;

// Default expiry periods
export const EXPIRY_PERIOD_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 21, label: '21 days' },
  { value: 30, label: '30 days' },
] as const;
