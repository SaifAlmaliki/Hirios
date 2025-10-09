
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CandidateStatus } from './useCandidateStatus';
import { sendRejectCandidateWebhook, RejectCandidateWebhookData } from '@/services/webhookService';

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
  is_rejected?: boolean;    // Add rejected status
  rejected_at?: string;     // Add rejection timestamp
  skills?: string[];        // Add skills array
  // Job details from join
  job?: {
    id: string;
    title: string;
    company: string;
    department: string;
  };
  // Resume pool ID from applications table
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
                .select('resume_pool_id')
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
              resume_pool_id: application?.resume_pool_id || null,
              status: candidateStatus || 'pending'
            };
            
            return processedResult;
          } catch (error) {
            console.warn('⚠️ Error fetching resume for:', result.email, 'application_id:', result.application_id);
            return {
              ...result,
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


export const useRejectCandidate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      first_name, 
      last_name, 
      email, 
      job_title, 
      company_name, 
      application_id,
      rejection_reason 
    }: { 
      id: string; 
      first_name: string;
      last_name: string;
      email: string;
      job_title: string;
      company_name: string;
      application_id?: string;
      rejection_reason?: string;
    }) => {
      // First, update the database to mark as rejected
      const { data: updatedResult, error: updateError } = await supabase
        .from('screening_results')
        .update({ 
          is_rejected: true,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating reject status:', updateError);
        throw updateError;
      }

      // Prepare webhook data
      const webhookData: RejectCandidateWebhookData = {
        candidate_name: `${first_name} ${last_name}`,
        candidate_email: email,
        job_title: job_title,
        company_name: company_name,
        rejection_reason: rejection_reason || 'Not a good fit for the position',
        rejected_at: new Date().toISOString(),
        screening_result_id: id,
        application_id: application_id
      };

      // Send webhook to n8n
      const webhookSuccess = await sendRejectCandidateWebhook(webhookData);
      
      if (!webhookSuccess) {
        console.warn('Webhook failed but database was updated');
        // Don't throw error here - database update succeeded
      }

      return updatedResult as ScreeningResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['screening_results'] });
      toast({
        title: "Candidate Rejected",
        description: `Rejection email sent to ${data.first_name} ${data.last_name}`,
      });
    },
    onError: (error) => {
      console.error('Failed to reject candidate:', error);
      toast({
        title: "Error",
        description: "Failed to reject candidate. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useBulkDeleteScreeningResults = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      screeningResults: Array<{
        id: string;
        resume_pool_id?: string;
        job_id?: string;
      }>
    ) => {
      console.log('🗑️ Starting bulk screening results deletion:', screeningResults.length, 'items');

      let successCount = 0;
      let errorCount = 0;

      for (const result of screeningResults) {
        try {
          // Step 1: Delete candidate comments for this screening result
          if (result.job_id && result.resume_pool_id) {
            console.log('🧹 Deleting candidate comments for:', result.id);
            await supabase
              .from('candidate_comments')
              .delete()
              .eq('resume_pool_id', result.resume_pool_id)
              .eq('job_id', result.job_id);

            // Step 2: Delete candidate status for this screening result
            console.log('🧹 Deleting candidate status for:', result.id);
            await supabase
              .from('candidate_status')
              .delete()
              .eq('resume_pool_id', result.resume_pool_id)
              .eq('job_id', result.job_id);
          }

          // Step 3: Delete the screening result itself
          console.log('🗑️ Deleting screening result:', result.id);
          const { error: deleteError } = await supabase
            .from('screening_results')
            .delete()
            .eq('id', result.id);

          if (deleteError) {
            console.error('❌ Failed to delete screening result:', result.id, deleteError);
            errorCount++;
          } else {
            console.log('✅ Screening result deleted successfully:', result.id);
            successCount++;
          }
        } catch (error) {
          console.error('❌ Error deleting screening result:', result.id, error);
          errorCount++;
        }
      }

      console.log(`✅ Bulk deletion complete: ${successCount} succeeded, ${errorCount} failed`);
      
      return { successCount, errorCount, total: screeningResults.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['screening_results'] });
      queryClient.invalidateQueries({ queryKey: ['candidate_status'] });
      queryClient.invalidateQueries({ queryKey: ['candidate_comments'] });
      
      if (result.errorCount === 0) {
        toast({
          title: "Screening Results Deleted",
          description: `Successfully deleted ${result.successCount} screening result${result.successCount !== 1 ? 's' : ''}.`,
        });
      } else if (result.successCount > 0) {
        toast({
          title: "Partial Success",
          description: `Deleted ${result.successCount} of ${result.total} screening results. ${result.errorCount} failed.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Deletion Failed",
          description: `Failed to delete screening results. Please try again.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Failed to delete screening results:', error);
      toast({
        title: "Error",
        description: "Failed to delete screening results. Please try again.",
        variant: "destructive",
      });
    },
  });
};