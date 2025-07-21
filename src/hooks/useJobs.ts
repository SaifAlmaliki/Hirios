
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StripeService } from '@/services/stripeService';

export interface Job {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  responsibilities: string;
  requirements?: string;
  benefits?: string;
  created_at: string;
  updated_at: string;
  company_profile_id: string;
}

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      console.log('Fetching jobs from database...');
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
      
      console.log('Jobs fetched successfully:', data);
      return data as Job[];
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const stripeService = StripeService.getInstance();

  return useMutation({
    mutationFn: async (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'company_profile_id'>) => {
      console.log('🚀 Starting job creation process with data:', jobData);
      
      // Step 1: Check user authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ User authentication failed:', userError);
        throw new Error('You must be logged in to post jobs. Please sign in and try again.');
      }

      console.log('✅ User authenticated:', user.id, user.email);

      // Step 2: Check if user can post more jobs
      const { canPost, reason } = await stripeService.canPostJob(user.id);
      if (!canPost) {
        console.error('❌ Job posting limit reached:', reason);
        throw new Error(reason || 'You have reached your job posting limit.');
      }

      console.log('✅ User can post job');

      // Step 3: Find company profile
      const { data: profile, error: profileError } = await supabase
        .from('company_profiles')
        .select('id, subscription_status, subscription_plan, company_name')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('🏢 Company profile query result:', { profile, profileError });

      if (profileError) {
        console.error('❌ Database error when fetching company profile:', profileError);
        throw new Error(`Database error: ${profileError.message}. Please try again or contact support.`);
      }

      if (!profile) {
        console.error('❌ No company profile found for user:', user.id);
        throw new Error('Company profile not found. Please complete your company setup first by clicking the "Setup" button.');
      }

      console.log('✅ Company profile found:', profile.company_name, profile.id);

      // Step 4: Create the job
      console.log('📝 Proceeding with job creation');

      const jobDataWithProfile = {
        ...jobData,
        company_profile_id: profile.id
      };

      console.log('📝 Creating job with data:', jobDataWithProfile);

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobDataWithProfile])
        .select()
        .single();

      if (error) {
        console.error('❌ Job creation failed:', error);
        
        // Provide specific error messages based on error type
        if (error.code === '42501') {
          throw new Error('Permission denied. Please make sure you have completed your company setup and try again.');
        } else if (error.code === '23505') {
          throw new Error('A job with this information already exists. Please modify your job details.');
        } else if (error.message.includes('row-level security')) {
          throw new Error('Security policy violation. Please contact support for assistance.');
        } else {
          throw new Error(`Failed to create job: ${error.message}`);
        }
      }

      console.log('✅ Job created successfully:', data);
      return data as Job;
    },
    onSuccess: (data) => {
      console.log('🎉 Job creation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      toast({
        title: "Job Posted Successfully! 🎉",
        description: `"${data.title}" has been added to the job portal.`,
      });
    },
    onError: (error) => {
      console.error('💥 Job creation failed with error:', error);
      toast({
        title: "Failed to Post Job",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ jobId, jobData }: { jobId: string; jobData: Partial<Omit<Job, 'id' | 'created_at' | 'updated_at' | 'company_profile_id'>> }) => {
      console.log('🔄 Starting job update process for job:', jobId, 'with data:', jobData);
      
      const { data, error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        console.error('❌ Job update failed:', error);
        throw new Error(`Failed to update job: ${error.message}`);
      }

      console.log('✅ Job updated successfully:', data);
      return data as Job;
    },
    onSuccess: (data) => {
      console.log('🎉 Job update successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      toast({
        title: "Job Updated Successfully! ✅",
        description: `"${data.title}" has been updated.`,
      });
    },
    onError: (error) => {
      console.error('💥 Job update failed with error:', error);
      toast({
        title: "Failed to Update Job",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (jobId: string) => {
      console.log('🗑️ Starting job deletion process for job:', jobId);
      
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('❌ Job deletion failed:', error);
        throw new Error(`Failed to delete job: ${error.message}`);
      }

      console.log('✅ Job deleted successfully');
      return jobId;
    },
    onSuccess: () => {
      console.log('🎉 Job deletion successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      toast({
        title: "Job Deleted Successfully! 🗑️",
        description: "The job posting has been removed from the portal.",
      });
    },
    onError: (error) => {
      console.error('💥 Job deletion failed with error:', error);
      toast({
        title: "Failed to Delete Job",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });
};
