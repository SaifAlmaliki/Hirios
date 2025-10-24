import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PublicApplicationData {
  jobId: string;
  candidateName: string;
  resumeFile: File;
}

export const usePublicJobApplication = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ jobId, candidateName, resumeFile }: PublicApplicationData) => {
      // 1. Get job details to retrieve company_profile_id
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id, company_profile_id, title, company')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        throw new Error('Job not found');
      }

      // 2. Upload resume to Supabase Storage (using company_uploads bucket)
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${Date.now()}_${resumeFile.name}`;
      const filePath = `${job.company_profile_id}/resumes/pool/${fileName}`;

      console.log('📄 Uploading public application resume:', resumeFile.name);
      console.log('📁 File path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company_uploads')
        .upload(filePath, resumeFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error('Failed to upload resume');
      }

      console.log('✅ Resume uploaded for public application:', uploadData.path);

      // 3. Insert resume into resume_pool table
      const { data: resumeData, error: insertError } = await supabase
        .from('resume_pool')
        .insert({
          company_profile_id: job.company_profile_id,
          storage_path: filePath,
          original_filename: resumeFile.name,
          file_size: resumeFile.size,
          uploaded_by_user_id: null, // Explicitly set to null for anonymous users
          candidate_name: candidateName,
          upload_source: 'public_application',
          job_id: jobId
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        // Clean up uploaded file
        await supabase.storage.from('company_uploads').remove([filePath]);
        throw new Error('Failed to save resume data');
      }

      // 4. Convert resume to base64 for webhook
      const resumeBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(resumeFile);
      });

      // 5. Send webhook to n8n (same as resume pool)
      const webhookData = {
        resume_id: resumeData.id,
        resume_filename: resumeFile.name,
        resume_base64: resumeBase64,
        company_id: job.company_profile_id,
        uploaded_at: new Date().toISOString(),
        upload_source: 'public_application',
        uploaded_by_company: false,
        candidate_name: candidateName,
        job_id: jobId,
        job_title: job.title,
        company_name: job.company
      };

      console.log('📤 Public application webhook payload prepared:', {
        ...webhookData,
        resume_base64: '[BASE64_DATA]'
      });

      const webhookUrl = import.meta.env.VITE_WEBHOOK_RESUME_POOL_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData)
          });
          console.log('✅ Public application webhook delivered successfully');
        } catch (webhookError) {
          console.error('Webhook error:', webhookError);
          // Don't fail the whole process if webhook fails
        }
      } else {
        console.warn('⚠️ No webhook URL configured');
      }

      return resumeData;
    },
    onSuccess: () => {
      toast({
        title: "Application submitted successfully!",
        description: "Thank you for applying. We'll review your application soon.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Public application failed:', error);
      toast({
        title: "Application failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });
};
