
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';


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
      console.log('📋 Fetching jobs...');
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching jobs:', error);
        throw error;
      }
      
      console.log('✅ Jobs loaded:', data?.length || 0, 'positions');
      return data as Job[];
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();


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

      console.log('✅ User can post job');

      // Step 3: Find company profile
      const { data: profile, error: profileError } = await supabase
        .from('company_profiles')
        .select('id, company_name')
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
      
      // Step 1: Delete associated screening results first
      console.log('🧹 Cleaning up screening results for job:', jobId);
      const { error: screeningError, count: screeningCount } = await supabase
        .from('screening_results')
        .delete()
        .eq('job_id', jobId)
        .select('*');

      if (screeningError) {
        console.error('❌ Screening results cleanup failed:', screeningError);
        throw new Error(`Failed to delete associated screening results: ${screeningError.message}`);
      }

      console.log(`✅ Deleted ${screeningCount || 0} screening results for job:`, jobId);

      // Step 2: Delete associated applications and their storage files
      console.log('🧹 Cleaning up applications for job:', jobId);
      
      // First, get all applications to clean up their storage files
      const { data: applications, error: fetchAppsError } = await supabase
        .from('applications')
        .select('id, resume_url')
        .eq('job_id', jobId);

      if (fetchAppsError) {
        console.error('❌ Failed to fetch applications for cleanup:', fetchAppsError);
        throw new Error(`Failed to fetch applications for cleanup: ${fetchAppsError.message}`);
      }

      // Clean up storage files for each application
      if (applications && applications.length > 0) {
        console.log(`🧹 Cleaning up storage files for ${applications.length} applications`);
        
        for (const app of applications) {
          // Clean up storage file
          const storagePath = app.resume_url;
          if (storagePath) {
            try {
              const { error: storageError } = await supabase.storage
                .from('company_uploads')
                .remove([storagePath]);

              if (storageError) {
                console.warn('⚠️ Storage cleanup failed for application:', app.id, storageError);
              }
            } catch (error) {
              console.warn('⚠️ Storage cleanup error for application:', app.id, error);
            }
          }
        }
      }

      // Now delete the applications from database
      const { error: applicationsError, count: applicationsCount } = await supabase
        .from('applications')
        .delete()
        .eq('job_id', jobId)
        .select('*');

      if (applicationsError) {
        console.error('❌ Applications cleanup failed:', applicationsError);
        throw new Error(`Failed to delete associated applications: ${applicationsError.message}`);
      }

      console.log(`✅ Deleted ${applicationsCount || 0} applications and their storage files for job:`, jobId);

      // Step 3: Delete associated job collaborators
      console.log('🧹 Cleaning up job collaborators for job:', jobId);
      const { error: collaboratorsError, count: collaboratorsCount } = await supabase
        .from('job_collaborators')
        .delete()
        .eq('job_id', jobId)
        .select('*');

      if (collaboratorsError) {
        console.error('❌ Job collaborators cleanup failed:', collaboratorsError);
        throw new Error(`Failed to delete associated job collaborators: ${collaboratorsError.message}`);
      }

      console.log(`✅ Deleted ${collaboratorsCount || 0} job collaborators for job:`, jobId);

      // Step 4: Delete associated job invitations
      console.log('🧹 Cleaning up job invitations for job:', jobId);
      const { error: invitationsError, count: invitationsCount } = await supabase
        .from('job_invitations')
        .delete()
        .eq('job_id', jobId)
        .select('*');

      if (invitationsError) {
        console.error('❌ Job invitations cleanup failed:', invitationsError);
        throw new Error(`Failed to delete associated job invitations: ${invitationsError.message}`);
      }

      console.log(`✅ Deleted ${invitationsCount || 0} job invitations for job:`, jobId);

      // Step 5: Delete the job itself
      console.log('🗑️ Deleting job:', jobId);
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('❌ Job deletion failed:', error);
        throw new Error(`Failed to delete job: ${error.message}`);
      }

      console.log('✅ Job and all associated data deleted successfully');
      return jobId;
    },
    onSuccess: () => {
      console.log('🎉 Job deletion successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['screening_results'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-collaborators'] });
      queryClient.invalidateQueries({ queryKey: ['job-invitations'] });
      toast({
        title: "Job Deleted Successfully! 🗑️",
        description: "The job posting and all associated data have been removed.",
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
