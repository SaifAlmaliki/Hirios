
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
  salary?: string;
  description: string;
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

  return useMutation({
    mutationFn: async (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'company_profile_id'>) => {
      console.log('Creating job:', jobData);
      
      // First, get the current user's company profile
      const { data: profile, error: profileError } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching company profile:', profileError);
        throw new Error('Company profile not found. Please complete your company setup first.');
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert([{
          ...jobData,
          company_profile_id: profile.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating job:', error);
        throw error;
      }

      console.log('Job created successfully:', data);
      return data as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job Posted Successfully!",
        description: "Your job listing has been added to the portal.",
      });
    },
    onError: (error) => {
      console.error('Failed to create job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create job posting. Please try again.",
        variant: "destructive",
      });
    },
  });
};
