
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendResumeToWebhook, fileToBase64 } from '../services/webhookService';
import { Job } from './useJobs';


export interface Application {
  id: string;
  job_id: string;
  resume_url?: string;
  created_at: string;
  uploaded_by_user_id?: string;
  original_filename?: string;
}

export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      console.log('📋 Fetching applications...');
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching applications:', error);
        throw error;
      }
      
      console.log('✅ Applications loaded:', data?.length || 0, 'submissions');
      return data as Application[];
    },
  });
};



