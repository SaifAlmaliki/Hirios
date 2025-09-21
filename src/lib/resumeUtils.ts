import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to handle resume downloads with unified storage path support
 * Handles both old and new storage path formats
 */
export const downloadResume = async (resumeUrl: string, filename?: string): Promise<void> => {
  try {
    // Extract file path from URL
    const url = new URL(resumeUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'company_uploads');
    
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      let filePath = pathParts.slice(bucketIndex + 1).join('/');
      
      // Handle old storage path formats and convert to new unified format
      if (filePath.startsWith('resume_pool/')) {
        // Convert: resume_pool/{companyId}/{fileName} -> {companyId}/resumes/pool/{fileName}
        const pathSegments = filePath.split('/');
        if (pathSegments.length >= 3) {
          const companyId = pathSegments[1];
          const fileName = pathSegments[2];
          filePath = `${companyId}/resumes/pool/${fileName}`;
        }
      } else if (filePath.includes('/')) {
        // Convert: {companyId}/{jobId}/{fileName} -> {companyId}/resumes/screening/{jobId}/{fileName}
        // This handles old screening results paths
        const pathSegments = filePath.split('/');
        if (pathSegments.length >= 3) {
          const companyId = pathSegments[0];
          const jobId = pathSegments[1];
          const fileName = pathSegments[2];
          filePath = `${companyId}/resumes/screening/${jobId}/${fileName}`;
        }
      }
      
      // Generate fresh signed URL
      const { data, error } = await supabase.storage
        .from('company_uploads')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error generating signed URL:', error);
        // Fallback to original URL
        window.open(resumeUrl, '_blank');
        return;
      }
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = filename || 'Resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback for other URL formats
      window.open(resumeUrl, '_blank');
    }
  } catch (error) {
    console.error('Error handling resume download:', error);
    // Fallback to original URL
    window.open(resumeUrl, '_blank');
  }
};
