
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendApplicationToWebhook } from '../services/webhookService';

export interface Application {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  resume_url?: string;
  status: string;
  created_at: string;
}

export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      console.log('Fetching applications from database...');
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }
      
      console.log('Applications fetched successfully:', data);
      return data as Application[];
    },
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (applicationData: Omit<Application, 'id' | 'created_at'> & { job_title?: string; company?: string }) => {
      console.log('Creating application:', applicationData);
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          job_id: applicationData.job_id,
          full_name: applicationData.full_name,
          email: applicationData.email,
          phone: applicationData.phone,
          resume_url: applicationData.resume_url,
          status: applicationData.status
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating application:', error);
        throw error;
      }

      console.log('Application created successfully:', data);

      // Send to webhook after successful database insert
      try {
        await sendApplicationToWebhook({
          full_name: applicationData.full_name,
          email: applicationData.email,
          phone: applicationData.phone,
          resume_url: applicationData.resume_url,
          job_title: applicationData.job_title || 'Unknown Position',
          company: applicationData.company || 'Unknown Company',
          applied_at: data.created_at,
        });
      } catch (webhookError) {
        console.warn('Failed to send to webhook, but application was saved:', webhookError);
        // Don't throw here - we don't want to fail the application creation if webhook fails
      }

      return data as Application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Application Submitted!",
        description: "Your application has been sent successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to create application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });
};
