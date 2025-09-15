
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



export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (inputData: Omit<Application, 'id' | 'created_at'> & { 
      job_title?: string; 
      company?: string;
      resume_file?: File;
      job_details?: Job;
    }) => {
      console.log('📝 Creating application for job:', inputData.job_title);
      
      // Store application in database with resume URL from Supabase storage
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          job_id: inputData.job_id,
          resume_url: inputData.resume_url || null,
          uploaded_by_user_id: inputData.uploaded_by_user_id || null,
          original_filename: inputData.original_filename || null
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating application:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create application: No data returned');
      }

      console.log('✅ Application created:', data.id);

      // Send to webhook after successful database insert
      try {
        let resume_base64: string | undefined;
        let resume_filename: string | undefined;

        // If there's a resume file, encode it for webhook
        if (inputData.resume_file) {
          console.log('📄 Encoding resume for webhook...');
          resume_base64 = await fileToBase64(inputData.resume_file);
          resume_filename = inputData.resume_file.name;
        }

        await sendResumeToWebhook({
          application_id: data.id,
          resume_base64: resume_base64!,
          resume_filename: resume_filename!,
          job_id: inputData.job_id,
          job_title: inputData.job_title || 'Unknown Position',
          company: inputData.company || 'Unknown Company',
          applied_at: data.created_at,
          upload_source: 'job_seeker',
          uploaded_by_company: false,
          job_details: {
            job_id: inputData.job_id,
            title: inputData.job_details?.title || inputData.job_title || 'Unknown Position',
            company: inputData.job_details?.company || inputData.company || 'Unknown Company',
            department: inputData.job_details?.department || 'Unknown Department',
            location: inputData.job_details?.location || 'Unknown Location',
            employment_type: inputData.job_details?.employment_type || 'Unknown',
            description: inputData.job_details?.description || 'No description available',
            responsibilities: inputData.job_details?.responsibilities || 'No responsibilities specified',
            requirements: inputData.job_details?.requirements,
            benefits: inputData.job_details?.benefits,
          }
        });
        console.log('📤 Webhook sent successfully');
      } catch (webhookError) {
        console.warn('⚠️ Webhook failed, but application was saved:', webhookError);
        // Don't throw here - we don't want to fail the application creation if webhook fails
      }

      return data as Application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Application Submitted!",
        description: "Your application and resume have been sent successfully.",
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
