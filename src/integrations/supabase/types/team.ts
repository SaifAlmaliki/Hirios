export interface TeamInvitation {
  id: string;
  company_profile_id: string;
  invited_email: string;
  invited_by: string;
  token: string;
  used: boolean;
  created_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  company_name: string;
  role: 'owner' | 'member';
  created_at: string;
  email?: string;
}

export interface CompanyProfileWithRole {
  id: string;
  user_id: string;
  company_name: string;
  company_description: string | null;
  company_website: string | null;
  company_size: string | null;
  industry: string | null;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  subscription_plan: string;
  role: 'owner' | 'member';
  created_at: string;
  updated_at: string;
}
