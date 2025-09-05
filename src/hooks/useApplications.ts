
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendApplicationToWebhook, fileToBase64 } from '../services/webhookService';
import { Job } from './useJobs';


export interface Application {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  resume_url?: string;
  status: string;
  created_at: string;
  upload_source?: string;
  uploaded_by_company?: boolean;
  uploaded_by_user_id?: string;
  processing_status?: string;
  processing_error?: string;
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
    mutationFn: async (applicationData: Omit<Application, 'id' | 'created_at'> & { 
      job_title?: string; 
      company?: string;
      resume_file?: File;
      job_details?: Job;
    }) => {
      console.log('📝 Creating application for:', applicationData.full_name, '-', applicationData.job_title);
      
      // Store application in database with resume URL from Supabase storage
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
        console.error('❌ Error creating application:', error);
        throw error;
      }

      console.log('✅ Application created:', data.id);

      // Send to webhook after successful database insert
      try {
        let resume_base64: string | undefined;
        let resume_filename: string | undefined;

        // If there's a resume file, encode it for webhook
        if (applicationData.resume_file) {
          console.log('📄 Encoding resume for webhook...');
          resume_base64 = await fileToBase64(applicationData.resume_file);
          resume_filename = applicationData.resume_file.name;
        }

        await sendApplicationToWebhook({
          application_id: data.id,
          full_name: applicationData.full_name,
          email: applicationData.email,
          phone: applicationData.phone,
          resume_base64,
          resume_filename,
          job_id: applicationData.job_id,
          job_title: applicationData.job_title || 'Unknown Position',
          company: applicationData.company || 'Unknown Company',
          applied_at: data.created_at,
          upload_source: applicationData.upload_source || 'job_seeker',
          uploaded_by_company: applicationData.uploaded_by_company || false,
          job_details: {
            job_id: applicationData.job_id,
            title: applicationData.job_details?.title || applicationData.job_title || 'Unknown Position',
            company: applicationData.job_details?.company || applicationData.company || 'Unknown Company',
            department: applicationData.job_details?.department || 'Unknown Department',
            location: applicationData.job_details?.location || 'Unknown Location',
            employment_type: applicationData.job_details?.employment_type || 'Unknown',
            description: applicationData.job_details?.description || 'No description available',
            responsibilities: applicationData.job_details?.responsibilities || 'No responsibilities specified',
            requirements: applicationData.job_details?.requirements,
            benefits: applicationData.job_details?.benefits,
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
