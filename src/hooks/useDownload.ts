import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { DownloadService, DownloadOptions } from '@/services/downloadService';

/**
 * Reusable hook for downloading files from Supabase storage
 * Can be used for resumes, offers, or any other files
 */
export const useDownload = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (options: DownloadOptions) => {
      await DownloadService.downloadFile(options);
    },
    onError: (error: any) => {
      console.error('❌ Download failed:', error);
      toast({
        title: "Download failed",
        description: error.message || "Failed to download file. Please try again.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook specifically for downloading resumes
 */
export const useDownloadResume = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ storagePath, filename }: { storagePath: string; filename: string }) => {
      await DownloadService.downloadResume(storagePath, filename);
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

/**
 * Hook specifically for downloading job offers
 */
export const useDownloadOffer = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ storagePath, filename }: { storagePath: string; filename: string }) => {
      await DownloadService.downloadOffer(storagePath, filename);
    },
    onError: (error: any) => {
      console.error('❌ Offer download failed:', error);
      toast({
        title: "Download failed",
        description: error.message || "Failed to download offer. Please try again.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for generating view URLs (for opening files in new tab)
 */
export const useGenerateViewUrl = () => {
  return useMutation({
    mutationFn: async ({ 
      storagePath, 
      bucketName, 
      expiry 
    }: { 
      storagePath: string; 
      bucketName?: string; 
      expiry?: number;
    }) => {
      return await DownloadService.generateViewUrl(storagePath, bucketName, expiry);
    },
    onError: (error: any) => {
      console.error('❌ Failed to generate view URL:', error);
      throw error;
    },
  });
};
