
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
        throw new Error('User not authenticated');
      }

      console.log('🏢 Fetching company jobs...');
      
      // Get company profile first
      const { data: profile, error: profileError } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Error fetching company profile:', profileError);
        throw new Error('Company profile not found');
      }

      // Fetch jobs for this company
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_profile_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching company jobs:', error);
        throw error;
      }
      
      console.log('✅ Company jobs loaded:', data?.length || 0, 'positions');
      return data as Job[];
    },
    enabled: !!user,
  });
};
