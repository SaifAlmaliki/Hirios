
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Job } from './useJobs';

export const useCompanyJobs = () => {
  const { userType } = useAuth();
  
  return useQuery({
    queryKey: ['company-jobs'],
    queryFn: async () => {
      console.log('Fetching company jobs from database...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get company profile
      const { data: profile, error: profileError } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching company profile:', profileError);
        return [];
      }

      // Get jobs for this company
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_profile_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching company jobs:', error);
        throw error;
      }
      
      console.log('Company jobs fetched successfully:', data);
      return data as Job[];
    },
    // Only enable the query if user is a company user
    enabled: userType === 'company',
  });
};
