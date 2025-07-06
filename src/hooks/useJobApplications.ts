
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Application } from './useApplications';

export const useJobApplications = (jobId: string) => {
  return useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      console.log('Fetching applications for job:', jobId);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching job applications:', error);
        throw error;
      }
      
      console.log('Job applications fetched successfully:', data);
      return data as Application[];
    },
    enabled: !!jobId,
  });
};
