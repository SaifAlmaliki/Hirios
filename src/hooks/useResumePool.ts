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

      // Upload file to storage with unified path structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${companyProfile.id}/resumes/pool/${fileName}`;

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

                  // Send to webhook for AI processing using simplified logic
                  try {
                    const resumeBase64 = await fileToBase64(file);

                    // Prepare simplified webhook data (same pattern as screening results)
                    const webhookData = {
                      resume_id: resumeData.id,
                      resume_filename: file.name,
                      resume_base64: resumeBase64,
                      company_id: companyProfile.id,
                      uploaded_at: new Date().toISOString(),
                      upload_source: 'resume_pool',
                      uploaded_by_company: true
                    };

                    console.log('📤 Webhook payload prepared:', webhookData);

                    // Send webhook to n8n using resume pool specific URL
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
                        console.log('✅ Resume pool webhook delivered successfully');
                      } catch (webhookError) {
                        console.error('Webhook error:', webhookError);
                        // Don't fail the whole process if webhook fails
                      }
                    } else {
                      console.warn('⚠️ No webhook URL configured');
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
      console.log('🗑️ Starting resume deletion process for:', resumeId);

      // Step 1: Delete vector chunks from documents table
      try {
        console.log('🧹 Cleaning up vector chunks...');
        const { error: vectorError } = await supabase
          .from('documents')
          .delete()
          .eq('metadata->>file_id', resumeId);

        if (vectorError) {
          console.error('❌ Vector cleanup failed:', vectorError);
          // Continue with other deletions even if vector cleanup fails
        } else {
          console.log('✅ Vector chunks cleaned up successfully');
        }
      } catch (error) {
        console.error('❌ Vector cleanup error:', error);
        // Continue with other deletions
      }

      // Step 2: Delete from storage
      const { error: storageError } = await supabase.storage
        .from('company_uploads')
        .remove([storagePath]);

      if (storageError) {
        console.warn('⚠️ Storage deletion failed:', storageError);
        // Continue with database deletion even if storage fails
      } else {
        console.log('✅ Storage file deleted successfully');
      }

      // Step 3: Delete from database
      const { error: dbError } = await supabase
        .from('resume_pool')
        .delete()
        .eq('id', resumeId);

      if (dbError) {
        console.error('❌ Database deletion error:', dbError);
        throw dbError;
      }

      console.log('✅ Resume deletion completed successfully');
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

      console.log('🗑️ Starting bulk resume deletion process for:', resumeIds.length, 'resumes');

      // Step 1: Delete vector chunks from documents table
      try {
        console.log('🧹 Cleaning up vector chunks for', resumeIds.length, 'resumes...');
        const { error: vectorError } = await supabase
          .from('documents')
          .delete()
          .in('metadata->>file_id', resumeIds);

        if (vectorError) {
          console.error('❌ Bulk vector cleanup failed:', vectorError);
          // Continue with other deletions even if vector cleanup fails
        } else {
          console.log('✅ Vector chunks cleaned up successfully for', resumeIds.length, 'resumes');
        }
      } catch (error) {
        console.error('❌ Bulk vector cleanup error:', error);
        // Continue with other deletions
      }

      // Step 2: Delete from storage
      const { error: storageError } = await supabase.storage
        .from('company_uploads')
        .remove(storagePaths);

      if (storageError) {
        console.warn('⚠️ Bulk storage deletion failed:', storageError);
        // Continue with database deletion even if storage fails
      } else {
        console.log('✅ Storage files deleted successfully for', storagePaths.length, 'files');
      }

      // Step 3: Delete from database
      const { error: dbError } = await supabase
        .from('resume_pool')
        .delete()
        .in('id', resumeIds);

      if (dbError) {
        console.error('❌ Bulk database deletion error:', dbError);
        throw dbError;
      }

      console.log('✅ Bulk resume deletion completed successfully for', resumeIds.length, 'resumes');
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
      // Handle both old and new storage path formats
      let filePath = storagePath;
      
      // If it's an old resume_pool path, convert to new format
      if (storagePath.startsWith('resume_pool/')) {
        // Extract company ID and filename from old path: resume_pool/{companyId}/{fileName}
        const pathParts = storagePath.split('/');
        if (pathParts.length >= 3) {
          const companyId = pathParts[1];
          const fileName = pathParts[2];
          filePath = `${companyId}/resumes/pool/${fileName}`;
        }
      }
      
      // Generate fresh signed URL
      const { data, error } = await supabase.storage
        .from('company_uploads')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
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
