import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CompanyProfile {
  id: string;
  company_name: string;
  company_description?: string;
  company_website?: string;
  company_size?: string;
  industry?: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  subscription_plan?: string;
  jobs_posted_this_month?: number;
  last_job_count_reset?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyMembership {
  company_profile_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
}

export const useCompanyProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['company-profile', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('🏢 No user, skipping company profile fetch');
        return null;
      }

      console.log('🏢 Fetching company profile...');
      
      try {
        // Get user's company membership to find their company_profile_id
        // Use .limit(1) to handle duplicates (take first one)
        const { data: memberships, error: membershipError } = await supabase
          .from('company_members')
          .select('company_profile_id, role, company_profiles(*)')
          .eq('user_id', user.id)
          .limit(1);

        if (membershipError) {
          console.error('❌ Error fetching company membership:', membershipError);
          return null;
        }

        if (!memberships || memberships.length === 0 || !memberships[0].company_profiles) {
          console.warn('⚠️ No company profile found for user');
          return null;
        }

        // If there are duplicates, warn but use the first one
        if (memberships.length > 1) {
          console.warn('⚠️ Multiple company memberships found, using first one');
        }
        
        const profile = memberships[0].company_profiles as CompanyProfile;
        console.log('✅ Company profile loaded:', profile.company_name);
        return profile;
      } catch (error) {
        console.error('❌ Unexpected error in useCompanyProfile:', error);
        return null;
      }
    },
    enabled: !!user,
    retry: 1,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};
