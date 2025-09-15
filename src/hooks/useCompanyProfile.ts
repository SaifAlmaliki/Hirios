import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CompanyProfile {
  id: string;
  user_id: string;
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
  created_at: string;
  updated_at: string;
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
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ Error fetching company profile:', error);
          return null;
        }

        if (!data) {
          console.warn('⚠️ No company profile found for user');
          return null;
        }
        
        console.log('✅ Company profile loaded:', data.company_name);
        return data as CompanyProfile;
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
