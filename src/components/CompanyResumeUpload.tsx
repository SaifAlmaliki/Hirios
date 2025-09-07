import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompanyJobs } from '@/hooks/useCompanyJobs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { sendResumeToWebhook, fileToBase64 } from '@/services/webhookService';

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  applicationId?: string;
}

interface CompanyResumeUploadProps {
  onUploadComplete?: () => void;
}

const CompanyResumeUpload: React.FC<CompanyResumeUploadProps> = ({ onUploadComplete }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { data: jobs = [] } = useCompanyJobs();
  const { user } = useAuth();

  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Auto-close dialog when all uploads are completed or failed
  useEffect(() => {
    if (uploadedFiles.length > 0 && !isUploading) {
      const allProcessed = uploadedFiles.every(file => 
        file.status === 'completed' || file.status === 'failed'
      );
      
      if (allProcessed) {
        // Show notification that dialog will close
        toast({
          title: "Upload completed",
          description: "All resumes have been processed. Dialog will close automatically.",
        });
        
        // Small delay to allow user to see the final status
        const timer = setTimeout(() => {
          setIsDialogOpen(false);
          resetUpload();
        }, 2000); // 2 second delay
        
        return () => clearTimeout(timer);
      }
    }
  }, [uploadedFiles, isUploading, toast]);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    // Check total file count
    if (uploadedFiles.length + files.length > MAX_FILES) {
      toast({
        title: "Too many files",
        description: `Maximum ${MAX_FILES} files allowed. You have ${uploadedFiles.length} files and trying to add ${files.length} more.`,
        variant: "destructive",
      });
      return;
    }

    Array.from(files).forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        newFiles.push({
          id: `${Date.now()}-${index}`,
          file,
          status: 'pending',
          progress: 0,
        });
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Invalid files",
        description: errors.join(', '),
        variant: "destructive",
      });
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  }, [uploadedFiles.length, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFileToStorage = async (file: File, companyId: string, jobId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${companyId}/${jobId}/${fileName}`;

      console.log('📄 Uploading company resume:', file.name);
      console.log('📁 File path:', filePath);
      
      const { data, error } = await supabase.storage
        .from('company_uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Storage upload error:', error);
        throw error;
      }

      console.log('✅ Company resume uploaded:', data.path);
      
      // Get the signed URL for private bucket (valid for 1 hour)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('company_uploads')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (urlError) {
        console.error('❌ Error creating signed URL:', urlError);
        throw urlError;
      }

      console.log('🔗 Generated signed URL:', urlData.signedUrl);
      return urlData.signedUrl;
    } catch (error) {
      console.error('❌ Company resume upload failed:', error);
      return null;
    }
  };

  const processFile = async (uploadedFile: UploadedFile, companyId: string, jobId: string, job: any) => {
    const fileId = uploadedFile.id;
    
    try {
      // Update status to uploading
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'uploading', progress: 10 } : f
      ));

      // Upload to storage
      const resumeUrl = await uploadFileToStorage(uploadedFile.file, companyId, jobId);
      if (!resumeUrl) {
        throw new Error('Failed to upload file to storage');
      }

      // Update status to processing
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'processing', progress: 50 } : f
      ));

             // Create application record (type assertion needed until migration is applied)
       const { data: application, error: appError } = await supabase
         .from('applications')
         .insert([{
           job_id: jobId,
           resume_url: resumeUrl,
           uploaded_by_user_id: user?.id,
           original_filename: uploadedFile.file.name
         }] as any)
         .select()
         .single();

      if (appError) {
        throw new Error(`Failed to create application: ${appError.message}`);
      }

      if (!application) {
        throw new Error('Failed to create application: No data returned');
      }

      // Update status to processing
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'processing', progress: 70, applicationId: application.id } : f
      ));

      // Send to webhook for AI processing
      const resumeBase64 = await fileToBase64(uploadedFile.file);
      
             try {
         await sendResumeToWebhook({
           application_id: application.id,
           resume_base64: resumeBase64,
           resume_filename: uploadedFile.file.name,
           job_id: jobId,
           job_title: job.title,
           company: job.company,
           applied_at: application.created_at,
           upload_source: 'company_upload',
           uploaded_by_company: true,
           job_details: {
             job_id: jobId,
             title: job.title,
             company: job.company,
             department: job.department,
             location: job.location,
             employment_type: job.employment_type,
             description: job.description,
             responsibilities: job.responsibilities,
             requirements: job.requirements,
             benefits: job.benefits,
           }
         });

        // Update status to completed
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
        ));
             } catch (webhookError) {
         console.warn('⚠️ Webhook failed, but application was created successfully:', webhookError);
         
         // Update status to failed
         setUploadedFiles(prev => prev.map(f => 
           f.id === fileId ? { 
             ...f, 
             status: 'failed', 
             error: 'Webhook failed: CORS error. Resume uploaded but AI processing failed.' 
           } : f
         ));
       }

      console.log('✅ Company resume upload completed:', uploadedFile.file.name);

    } catch (error) {
      console.error('❌ Company resume processing failed:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } : f
      ));
    }
  };

  const handleUpload = async () => {
    if (!selectedJobId) {
      toast({
        title: "No job selected",
        description: "Please select a job to associate the resumes with.",
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one resume to upload.",
        variant: "destructive",
      });
      return;
    }

    const job = jobs.find(j => j.id === selectedJobId);
    if (!job) {
      toast({
        title: "Job not found",
        description: "The selected job could not be found.",
        variant: "destructive",
      });
      return;
    }

    // Get company profile ID
    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (!companyProfile) {
      toast({
        title: "Company profile not found",
        description: "Please complete your company setup first.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setOverallProgress(0);

    // Process files sequentially to avoid overwhelming the system
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      if (file.status === 'pending') {
        await processFile(file, companyProfile.id, selectedJobId, job);
        setOverallProgress(((i + 1) / uploadedFiles.length) * 100);
      }
    }

    setIsUploading(false);
    
    const completedCount = uploadedFiles.filter(f => f.status === 'completed').length;
    const failedCount = uploadedFiles.filter(f => f.status === 'failed').length;

    if (completedCount > 0) {
      toast({
        title: "Upload completed",
        description: `${completedCount} resume(s) uploaded successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}.`,
      });
    }

    if (failedCount > 0) {
      toast({
        title: "Some uploads failed",
        description: `${failedCount} resume(s) failed to upload. Check the error details below.`,
        variant: "destructive",
      });
    }

    onUploadComplete?.();
  };

  const resetUpload = () => {
    setUploadedFiles([]);
    setSelectedJobId('');
    setOverallProgress(0);
    setIsUploading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'uploading':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Uploading</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Upload className="h-4 w-4 mr-2" />
          Upload Resumes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-green-900">Upload Candidate Resumes</DialogTitle>
          <DialogDescription>
            Upload resumes received from LinkedIn, Indeed, or other platforms for AI analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Job Position *</label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose the job position for these resumes" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title} - {job.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Upload Resumes</label>
              <span className="text-xs text-gray-500">
                {uploadedFiles.length}/{MAX_FILES} files (Max 5MB each)
              </span>
            </div>

            {/* Drag & Drop Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag & drop resumes here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse files
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Selected Files</h4>
                {uploadedFiles.map((file) => (
                  <Card key={file.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {getStatusIcon(file.status)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{file.file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {file.error && (
                            <p className="text-xs text-red-600 mt-1">{file.error}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(file.status)}
                          {file.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              disabled={isUploading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <div className="mt-2">
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Overall Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetUpload();
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || uploadedFiles.length === 0 || !selectedJobId}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {uploadedFiles.length} Resume{uploadedFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyResumeUpload;
