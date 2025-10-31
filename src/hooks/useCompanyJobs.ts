
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Job } from './useJobs';

export const useCompanyJobs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['company-jobs', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('🏢 No user, skipping company jobs fetch');
        return [];
      }

      console.log('🏢 Fetching company jobs...');
      
      try {
        // Get user's company membership to find their company_profile_id
        const { data: membership, error: membershipError } = await supabase
          .from('company_members')
          .select('company_profile_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (membershipError) {
          console.warn('⚠️ Error fetching company membership:', membershipError.message);
          return [];
        }

        if (!membership) {
          console.warn('⚠️ No company membership found for user - user may need to complete company setup');
          return [];
        }

        // Fetch jobs for this company
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_profile_id', membership.company_profile_id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('❌ Error fetching company jobs:', error);
          return [];
        }
        
        console.log('✅ Company jobs loaded:', data?.length || 0, 'positions');
        return (data || []) as Job[];
      } catch (error) {
        console.error('❌ Unexpected error in useCompanyJobs:', error);
        return [];
      }
    },
    enabled: !!user,
    retry: 1, // Only retry once on failure
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};
