import { supabase } from '@/integrations/supabase/client';

export interface DownloadOptions {
  storagePath: string;
  filename: string;
  bucketName?: string;
}

/**
 * Reusable service for downloading files from Supabase storage
 * Works with both resumes and offers using the same pattern
 */
export class DownloadService {
  private static readonly DEFAULT_BUCKET = 'company_uploads';
  private static readonly DEFAULT_EXPIRY = 3600; // 1 hour

  /**
   * Download a file from Supabase storage
   * @param options - Download configuration
   */
  static async downloadFile(options: DownloadOptions): Promise<void> {
    const { storagePath, filename, bucketName = this.DEFAULT_BUCKET } = options;

    console.log('📥 Starting file download:', {
      bucket: bucketName,
      path: storagePath,
      filename
    });

    try {
      // Generate fresh signed URL
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(storagePath, this.DEFAULT_EXPIRY);
      
      if (error) {
        console.error('❌ Error generating signed URL:', error);
        throw error;
      }

      console.log('✅ Signed URL generated successfully');
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ File download initiated:', filename);
    } catch (error) {
      console.error('❌ File download failed:', error);
      throw error;
    }
  }

  /**
   * Download a resume from the resume pool
   * @param storagePath - Path to the resume in storage
   * @param filename - Original filename for download
   */
  static async downloadResume(storagePath: string, filename: string): Promise<void> {
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

    return this.downloadFile({
      storagePath: filePath,
      filename,
      bucketName: this.DEFAULT_BUCKET
    });
  }

  /**
   * Download a job offer PDF
   * @param storagePath - Path to the offer PDF in storage
   * @param filename - Filename for download (e.g., "Job_Offer_John_Doe.pdf")
   */
  static async downloadOffer(storagePath: string, filename: string): Promise<void> {
    return this.downloadFile({
      storagePath,
      filename,
      bucketName: this.DEFAULT_BUCKET
    });
  }

  /**
   * Generate a signed URL for viewing a file (without downloading)
   * @param storagePath - Path to the file in storage
   * @param bucketName - Storage bucket name
   * @param expiry - URL expiry time in seconds
   */
  static async generateViewUrl(
    storagePath: string, 
    bucketName: string = this.DEFAULT_BUCKET,
    expiry: number = this.DEFAULT_EXPIRY
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(storagePath, expiry);
    
    if (error) {
      console.error('❌ Error generating view URL:', error);
      throw error;
    }

    return data.signedUrl;
  }
}
