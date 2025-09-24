
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CandidateStatus } from './useCandidateStatus';

export interface ScreeningResult {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  home_address?: string;
  strengths?: string;
  weaknesses?: string;
  risk_factor?: string;
  reward_factor?: string;
  overall_fit?: number;
  justification?: string;
  date: string;
  created_at: string;
  updated_at: string;
  job_id?: string;
  voice_screening_requested?: boolean;
  interview_summary?: string;
  interview_completed_at?: string;
  application_id?: string;  // Add application_id field
  is_favorite?: boolean;    // Add favorite status
  is_dismissed?: boolean;   // Add dismiss status
  skills?: string[];        // Add skills array
  // Job details from join
  job?: {
    id: string;
    title: string;
    company: string;
    department: string;
  };
  // Resume URL from applications table
  resume_url?: string;
  resume_text?: string;
  resume_pool_id?: string;
  // Status from candidate_status table
  status?: CandidateStatus;
}

export const useScreeningResults = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['screening_results', user?.id, 'company-filtered'],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user has AI access (premium subscription)
      // TEMPORARILY DISABLED FOR DEBUGGING
      const hasAccess = true; // Premium access temporarily enabled for all users
      if (!hasAccess) {
        throw new Error('AI screening is only available for Premium subscribers. Please upgrade your plan to access this feature.');
      }

      // Get company profile first
      const { data: profile, error: profileError } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Company profile not found');
      }

      // Fetch screening results with job information for this company
      // First get all job IDs for this company
      const { data: companyJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_profile_id', profile.id);

      if (jobsError) {
        console.error('❌ Error fetching company jobs:', jobsError);
        throw jobsError;
      }

      if (!companyJobs || companyJobs.length === 0) {
        console.log('✅ No jobs found for company, returning empty screening results');
        return [];
      }

      const jobIds = companyJobs.map(job => job.id);

      // Then fetch screening results for those jobs
      const { data, error } = await supabase
        .from('screening_results')
        .select(`
          *,
          job:jobs (
            id,
            title,
            company,
            department,
            company_profile_id
          )
        `)
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching screening results:', error);
        throw error;
      }
      
      
      // Fetch resume URLs for each candidate
      const resultsWithResumes = await Promise.all(
        (data || []).map(async (result: any) => {
          try {
            // Use application_id if available, otherwise fall back to email matching
            let application = null;
            let appError = null;

            if (result.application_id) {
              // Use application_id for direct lookup
              const { data: appData, error: appErr } = await supabase
                .from('applications')
                .select('resume_url, resume_text, resume_pool_id')
                .eq('id', result.application_id)
                .maybeSingle();
              
              application = appData;
              appError = appErr;
            } else {
              // No application_id available, cannot fetch resume
              console.warn('⚠️ No application_id available for screening result:', result.id);
              application = null;
              appError = new Error('No application_id available');
            }
            
            if (appError) {
              console.warn('⚠️ No resume found for:', result.email, 'application_id:', result.application_id);
            }
            
            // Fetch candidate status if we have resume_pool_id and job_id
            let candidateStatus = null;
            if (application?.resume_pool_id && result.job_id) {
              const { data: statusData } = await supabase
                .from('candidate_status')
                .select('status')
                .eq('resume_pool_id', application.resume_pool_id)
                .eq('job_id', result.job_id)
                .maybeSingle();
              
              candidateStatus = statusData?.status || 'pending';
            }

            const processedResult = {
              ...result,
              resume_url: application?.resume_url || null,
              resume_text: application?.resume_text || null,
              resume_pool_id: application?.resume_pool_id || null,
              status: candidateStatus || 'pending'
            };
            
            return processedResult;
          } catch (error) {
            console.warn('⚠️ Error fetching resume for:', result.email, 'application_id:', result.application_id);
            return {
              ...result,
              resume_url: null,
              resume_text: null,
              resume_pool_id: null,
              status: 'pending'
            };
          }
        })
      );
      
      console.log('✅ Company screening results loaded:', data?.length || 0, 'results');
      console.log('🏢 Company profile ID:', profile.id);
      console.log('📋 Company job IDs:', jobIds);
      return resultsWithResumes as ScreeningResult[];
    },
    enabled: !!user,
  });
};








export const useUpdateCallStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      call_status, 
      call_summary, 
      call_error_message 
    }: { 
      id: string; 
      call_status: 'initiated' | 'in_progress' | 'completed' | 'failed';
      call_summary?: string;
      call_error_message?: string;
    }) => {
      
      const updateData: any = { call_status };
      
      if (call_status === 'initiated') {
        updateData.call_initiated_at = new Date().toISOString();
      } else if (call_status === 'completed') {
        updateData.call_completed_at = new Date().toISOString();
        if (call_summary) updateData.call_summary = call_summary;
      } else if (call_status === 'failed' && call_error_message) {
        updateData.call_error_message = call_error_message;
      }

      const { data, error } = await supabase
        .from('screening_results')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating call status:', error);
        throw error;
      }

      return data as ScreeningResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screening_results'] });
    },
    onError: (error) => {
      console.error('Failed to update call status:', error);
      toast({
        title: "Error",
        description: "Failed to update call status. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateFavoriteStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { data, error } = await supabase
        .from('screening_results')
        .update({ 
          is_favorite, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating favorite status:', error);
        throw error;
      }

      return data as ScreeningResult;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['screening_results'] });
      toast({
        title: variables.is_favorite ? "Added to Favorites" : "Removed from Favorites",
        description: `Candidate ${variables.is_favorite ? 'added to' : 'removed from'} favorites.`,
      });
    },
    onError: (error) => {
      console.error('Failed to update favorite status:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateDismissStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_dismissed }: { id: string; is_dismissed: boolean }) => {
      const { data, error } = await supabase
        .from('screening_results')
        .update({ 
          is_dismissed, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating dismiss status:', error);
        throw error;
      }

      return data as ScreeningResult;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['screening_results'] });
      toast({
        title: variables.is_dismissed ? "Candidate Dismissed" : "Candidate Restored",
        description: `Candidate ${variables.is_dismissed ? 'dismissed' : 'restored'} successfully.`,
      });
    },
    onError: (error) => {
      console.error('Failed to update dismiss status:', error);
      toast({
        title: "Error",
        description: "Failed to update dismiss status. Please try again.",
        variant: "destructive",
      });
    },
  });
};
