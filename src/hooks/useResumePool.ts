import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { sendResumePoolToWebhook, fileToBase64 } from '@/services/webhookService';

export type ResumePoolItem = {
  id: string;
  company_profile_id: string;
  original_filename: string;
  storage_path: string;
  file_size: number;
  uploaded_by_user_id: string;
  resume_text: string | null;
  created_at: string;
  updated_at: string;
};

export const useResumePool = () => {
  const { user } = useAuth();
  const { data: companyProfile } = useCompanyProfile();

  return useQuery({
    queryKey: ['resumePool', companyProfile?.id],
    queryFn: async () => {
      if (!companyProfile?.id) return [];

      const { data, error } = await supabase
        .from('resume_pool')
        .select('*')
        .eq('company_profile_id', companyProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching resume pool:', error);
        throw error;
      }

      return data as ResumePoolItem[];
    },
    enabled: !!companyProfile?.id,
  });
};

export const useUploadResumeToPool = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: companyProfile } = useCompanyProfile();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user || !companyProfile) {
        throw new Error('User or company profile not found');
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `resume_pool/${companyProfile.id}/${fileName}`;

      console.log('📄 Uploading resume to pool:', file.name);
      console.log('📁 File path:', filePath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company_uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ Resume uploaded to pool:', uploadData.path);
      
      // Get the signed URL for private bucket (valid for 1 hour)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('company_uploads')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (urlError) {
        console.error('❌ Error creating signed URL:', urlError);
        throw urlError;
      }

      // Create database record
      const { data: resumeData, error: dbError } = await supabase
        .from('resume_pool')
        .insert([{
          company_profile_id: companyProfile.id,
          original_filename: file.name,
          storage_path: filePath,
          file_size: file.size,
          uploaded_by_user_id: user.id,
          resume_text: null // Will be updated after AI processing
        }])
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database insert error:', dbError);
        throw dbError;
      }

                  // Send to webhook for AI processing
                  try {
                    const resumeBase64 = await fileToBase64(file);

                    const webhookSuccess = await sendResumePoolToWebhook({
                      resume_id: resumeData.id,
                      resume_base64: resumeBase64,
                      resume_filename: file.name,
                      company_id: companyProfile.id,
                      uploaded_at: new Date().toISOString(),
                      upload_source: 'resume_pool',
                      uploaded_by_company: true
                    });

                    if (!webhookSuccess) {
                      console.warn('⚠️ Webhook processing failed, but upload completed');
                    }
                  } catch (webhookError) {
                    console.warn('⚠️ Webhook processing failed:', webhookError);
                    // Don't fail the upload if webhook fails
                  }

      return resumeData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumePool'] });
      toast({
        title: "Resume uploaded successfully",
        description: "The resume has been added to your pool.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Resume upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteResumeFromPool = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ resumeId, storagePath }: { resumeId: string; storagePath: string }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('company_uploads')
        .remove([storagePath]);

      if (storageError) {
        console.warn('⚠️ Storage deletion failed:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('resume_pool')
        .delete()
        .eq('id', resumeId);

      if (dbError) {
        console.error('❌ Database deletion error:', dbError);
        throw dbError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumePool'] });
      toast({
        title: "Resume deleted successfully",
        description: "The resume has been removed from your pool.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Resume deletion failed:', error);
      toast({
        title: "Deletion failed",
        description: error.message || "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useBulkDeleteResumes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (resumes: { id: string; storagePath: string }[]) => {
      const storagePaths = resumes.map(r => r.storagePath);
      const resumeIds = resumes.map(r => r.id);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('company_uploads')
        .remove(storagePaths);

      if (storageError) {
        console.warn('⚠️ Bulk storage deletion failed:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('resume_pool')
        .delete()
        .in('id', resumeIds);

      if (dbError) {
        console.error('❌ Bulk database deletion error:', dbError);
        throw dbError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resumePool'] });
      toast({
        title: "Resumes deleted successfully",
        description: `${variables.length} resume(s) have been removed from your pool.`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Bulk resume deletion failed:', error);
      toast({
        title: "Deletion failed",
        description: error.message || "Failed to delete resumes. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDownloadResume = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ storagePath, filename }: { storagePath: string; filename: string }) => {
      // Generate fresh signed URL
      const { data, error } = await supabase.storage
        .from('company_uploads')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error generating signed URL:', error);
        throw error;
      }
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (error: any) => {
      console.error('❌ Resume download failed:', error);
      toast({
        title: "Download failed",
        description: error.message || "Failed to download resume. Please try again.",
        variant: "destructive",
      });
    },
  });
};
