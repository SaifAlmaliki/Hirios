import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { processLogoImage, validateLogoFile, generateLogoPath } from '@/lib/imageUtils';
import { useToast } from '@/hooks/use-toast';

interface LogoUploadProps {
  currentLogoUrl?: string;
  onLogoUploaded: (logoUrl: string) => void;
  onLogoRemoved: () => void;
  disabled?: boolean;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  currentLogoUrl,
  onLogoUploaded,
  onLogoRemoved,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Update preview when currentLogoUrl prop changes (e.g., when loaded from database)
  useEffect(() => {
    setPreviewUrl(currentLogoUrl || null);
  }, [currentLogoUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Process image (resize/standardize)
      const processedBlob = await processLogoImage(file);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Generate file path
      const filePath = generateLogoPath(user.id, file.name);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, processedBlob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      // Update preview
      setPreviewUrl(publicUrl);
      
      // Notify parent component
      onLogoUploaded(publicUrl);

      toast({
        title: "Logo Uploaded Successfully",
        description: "Don't forget to click 'Save Company Information' to save your logo permanently.",
      });

    } catch (error: any) {
      console.error('Logo upload error:', error);
      setError(error.message || 'Failed to upload logo');
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    onLogoRemoved();
    toast({
      title: "Logo Removed",
      description: "Company logo has been removed.",
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="logo-upload">Company Logo</Label>
      
      {/* Current Logo Preview - Compact */}
      {previewUrl && (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
          <div className="w-12 h-12 border rounded overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
            <img 
              src={previewUrl} 
              alt="Company logo" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Current Logo</p>
            <p className="text-xs text-gray-500">Will appear in navbar</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveLogo}
            disabled={disabled}
            className="text-red-600 hover:text-red-700 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Section - Compact */}
      <div className="space-y-2">
        <Input
          ref={fileInputRef}
          id="logo-upload"
          type="file"
          accept="image/jpeg,image/png,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={disabled || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {previewUrl ? 'Replace Logo' : 'Upload Logo'}
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Help Text - Compact */}
        <div className="text-xs text-gray-500">
          <span>JPG, PNG, SVG • Max 1MB • Auto-resized for navbar</span>
        </div>
      </div>
    </div>
  );
};
