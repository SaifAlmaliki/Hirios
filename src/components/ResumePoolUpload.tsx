import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUploadResumeToPool } from '@/hooks/useResumePool';

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

interface ResumePoolUploadProps {
  onUploadComplete?: () => void;
  isDialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

const ResumePoolUpload: React.FC<ResumePoolUploadProps> = ({ 
  onUploadComplete, 
  isDialogOpen: externalDialogOpen,
  onDialogOpenChange, 
  showTrigger = true 
}) => {
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const isDialogOpen = externalDialogOpen !== undefined ? externalDialogOpen : internalDialogOpen;
  const setIsDialogOpen = onDialogOpenChange || setInternalDialogOpen;
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const uploadResumeMutation = useUploadResumeToPool();

  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Auto-close dialog when all uploads are completed or failed
  useEffect(() => {
    if (uploadedFiles.length > 0 && uploadedFiles.every(f => f.status === 'completed' || f.status === 'failed')) {
      const completedCount = uploadedFiles.filter(f => f.status === 'completed').length;
      if (completedCount > 0) {
        onUploadComplete?.();
        setTimeout(() => {
          setIsDialogOpen(false);
          setUploadedFiles([]);
          setPendingFiles([]);
          setOverallProgress(0);
        }, 2000);
      }
    }
  }, [uploadedFiles, onUploadComplete, setIsDialogOpen]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      // Validate file type
      if (file.type !== 'application/pdf') {
        errors.push(`${file.name}: Only PDF files are allowed`);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size must be less than 5MB`);
        return;
      }

      // Check total file count
      if (pendingFiles.length + uploadedFiles.length + newFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed`);
        return;
      }

      newFiles.push(file);
    });

    if (errors.length > 0) {
      toast({
        title: "File validation errors",
        description: errors.join(', '),
        variant: "destructive",
      });
    }

    if (newFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...newFiles]);
    }
  }, [pendingFiles.length, uploadedFiles.length, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const processFile = async (file: File) => {
    const fileId = `file_${Date.now()}_${Math.random()}`;
    const uploadedFile: UploadedFile = {
      id: fileId,
      file,
      status: 'pending',
      progress: 0
    };

    setUploadedFiles(prev => [...prev, uploadedFile]);

    try {
      // Update status to uploading
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'uploading', progress: 10 } : f
      ));

      // Upload file
      await uploadResumeMutation.mutateAsync(file);

      // Update status to completed
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
      ));

    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'failed', 
          error: error.message || 'Upload failed' 
        } : f
      ));
    }
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    setOverallProgress(0);

    try {
      // Process files sequentially to avoid overwhelming the system
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        await processFile(file);
        
        // Update overall progress
        const progress = ((i + 1) / pendingFiles.length) * 100;
        setOverallProgress(progress);
      }

      // Clear pending files
      setPendingFiles([]);
    } catch (error) {
      console.error('Bulk upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'uploading':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const completedCount = uploadedFiles.filter(f => f.status === 'completed').length;
  const failedCount = uploadedFiles.filter(f => f.status === 'failed').length;
  const totalFiles = uploadedFiles.length;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Upload Resumes
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-600 text-xl font-semibold">
            Upload Resumes to Pool
          </DialogTitle>
          <DialogDescription>
            Upload resumes to your central resume pool for easy access and management.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Upload Resumes</label>
              <span className="text-sm text-gray-500">
                {pendingFiles.length + uploadedFiles.length}/{MAX_FILES} files (Max 5MB each)
              </span>
            </div>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop resumes here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse files
              </p>
              <Button
                type="button"
                variant="outline"
                className="bg-white hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Select Files
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Pending Files */}
          {pendingFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pending Upload ({pendingFiles.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePendingFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upload Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{Math.round(overallProgress)}%</span>
                  </div>
                  <Progress value={overallProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Upload Status ({completedCount} completed, {failedCount} failed)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2 flex-1">
                      {getStatusIcon(file.status)}
                      <span className="text-sm font-medium truncate">{file.file.name}</span>
                      <Badge className={getStatusColor(file.status)}>
                        {file.status}
                      </Badge>
                      {file.error && (
                        <span className="text-xs text-red-500 truncate">{file.error}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.status === 'uploading' || file.status === 'processing' ? (
                        <div className="w-16">
                          <Progress value={file.progress} className="w-full" />
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={pendingFiles.length === 0 || isUploading}
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
                  Upload {pendingFiles.length} Resume{pendingFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumePoolUpload;
