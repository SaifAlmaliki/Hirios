import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  FileText, 
  Calendar,
  HardDrive,
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useResumePool, ResumePoolItem } from '@/hooks/useResumePool';
import { useGlobalResumePoolStatusBadges } from '@/hooks/useCandidateStatus';
import { GlobalStatusBadge } from '@/components/ui/StatusBadge';
import { normalizeSkills } from '@/lib/skillsUtils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { sendResumeToWebhook, fileToBase64 } from '@/services/webhookService';

interface ResumePoolSelectorProps {
  jobId: string;
  job: any;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  onSelectionComplete: () => void;
}

interface ProcessingResume {
  id: string;
  resume: ResumePoolItem;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  applicationId?: string;
}

const ResumePoolSelector: React.FC<ResumePoolSelectorProps> = ({
  jobId,
  job,
  isDialogOpen,
  onDialogOpenChange,
  onSelectionComplete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
  const [processingResumes, setProcessingResumes] = useState<ProcessingResume[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: resumes = [], isLoading } = useResumePool();
  const { toast } = useToast();
  const { user } = useAuth();

  // Get global status badges for all resumes across all jobs
  const resumeIds = resumes.map(r => r.id);
  const { data: globalStatusBadges = {} } = useGlobalResumePoolStatusBadges(resumeIds);

  // Filter resumes based on search term
  const filteredResumes = useMemo(() => {
    if (!searchTerm) return resumes;
    
    const term = searchTerm.toLowerCase();
    return resumes.filter(resume => {
      const name = `${resume.first_name || ''} ${resume.last_name || ''}`.toLowerCase();
      const email = resume.email?.toLowerCase() || '';
      const filename = resume.original_filename?.toLowerCase() || '';
      const skills = resume.skills?.join(' ').toLowerCase() || '';
      
      return name.includes(term) || 
             email.includes(term) || 
             filename.includes(term) || 
             skills.includes(term);
    });
  }, [resumes, searchTerm]);

  const handleResumeSelect = (resumeId: string, checked: boolean) => {
    if (checked) {
      setSelectedResumes(prev => [...prev, resumeId]);
    } else {
      setSelectedResumes(prev => prev.filter(id => id !== resumeId));
    }
  };

  const handleSelectAll = () => {
    if (selectedResumes.length === filteredResumes.length) {
      setSelectedResumes([]);
    } else {
      setSelectedResumes(filteredResumes.map(r => r.id));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDisplayName = (resume: ResumePoolItem) => {
    if (resume.first_name && resume.last_name) {
      return `${resume.first_name} ${resume.last_name}`;
    }
    return resume.original_filename;
  };

  const processResumeFromPool = async (resume: ResumePoolItem): Promise<void> => {
    const processingId = resume.id;
    
    try {
      // Update status to processing
      setProcessingResumes(prev => prev.map(p => 
        p.id === processingId ? { ...p, status: 'processing', progress: 10 } : p
      ));

      // Get the resume file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('company_uploads')
        .download(resume.storage_path);

      if (downloadError || !fileData) {
        throw new Error('Failed to download resume file from storage');
      }

      // Convert blob to File object
      const file = new File([fileData], resume.original_filename, { type: 'application/pdf' });

      // Update progress
      setProcessingResumes(prev => prev.map(p => 
        p.id === processingId ? { ...p, progress: 30 } : p
      ));

      // Create application record
      const { data: application, error: appError } = await supabase
        .from('applications')
        .insert([{
          job_id: jobId,
          resume_url: resume.storage_path, // Use the storage path as URL
          uploaded_by_user_id: user?.id,
          original_filename: resume.original_filename,
          resume_text: resume.resume_text,
          resume_pool_id: resume.id // Link to the resume pool item
        }])
        .select()
        .single();

      if (appError) {
        throw new Error(`Failed to create application: ${appError.message}`);
      }

      if (!application) {
        throw new Error('Failed to create application: No data returned');
      }

      // Update progress
      setProcessingResumes(prev => prev.map(p => 
        p.id === processingId ? { ...p, progress: 50, applicationId: application.id } : p
      ));

      // Convert file to base64 for webhook
      const resumeBase64 = await fileToBase64(file);

      // Update progress
      setProcessingResumes(prev => prev.map(p => 
        p.id === processingId ? { ...p, progress: 70 } : p
      ));

      // Send to webhook for AI processing
      try {
        await sendResumeToWebhook({
          application_id: application.id,
          resume_base64: resumeBase64,
          resume_filename: resume.original_filename,
          job_id: jobId,
          job_title: job.title,
          company: job.company,
          applied_at: application.created_at,
          upload_source: 'resume_pool_selection',
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
        setProcessingResumes(prev => prev.map(p => 
          p.id === processingId ? { ...p, status: 'completed', progress: 100 } : p
        ));

      } catch (webhookError) {
        console.warn('⚠️ Webhook failed, but application was created successfully:', webhookError);
        
        // Update status to failed
        setProcessingResumes(prev => prev.map(p => 
          p.id === processingId ? { 
            ...p, 
            status: 'failed', 
            error: 'Webhook failed: AI processing failed but application was created.' 
          } : p
        ));
      }

    } catch (error) {
      console.error('❌ Resume processing failed:', error);
      setProcessingResumes(prev => prev.map(p => 
        p.id === processingId ? { 
          ...p, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } : p
      ));
    }
  };

  const handleProcessSelected = async () => {
    if (selectedResumes.length === 0) {
      toast({
        title: "No resumes selected",
        description: "Please select at least one resume to process.",
        variant: "destructive",
      });
      return;
    }

    const selectedResumeObjects = resumes.filter(r => selectedResumes.includes(r.id));
    
    // Initialize processing state
    setProcessingResumes(selectedResumeObjects.map(resume => ({
      id: resume.id,
      resume,
      status: 'pending' as const,
      progress: 0
    })));

    setIsProcessing(true);

    // Process resumes sequentially
    for (const resume of selectedResumeObjects) {
      await processResumeFromPool(resume);
    }

    setIsProcessing(false);
    
    const completedCount = processingResumes.filter(p => p.status === 'completed').length;
    const failedCount = processingResumes.filter(p => p.status === 'failed').length;

    if (completedCount > 0) {
      toast({
        title: "Processing completed",
        description: `${completedCount} resume(s) processed successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}.`,
      });
    }

    if (failedCount > 0) {
      toast({
        title: "Some processing failed",
        description: `${failedCount} resume(s) failed to process. Check the error details below.`,
        variant: "destructive",
      });
    }

    onSelectionComplete();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
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
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const resetSelection = () => {
    setSelectedResumes([]);
    setProcessingResumes([]);
    setSearchTerm('');
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isProcessing) {
      resetSelection();
    }
    onDialogOpenChange(open);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-900">Select Resumes from Pool</DialogTitle>
          <DialogDescription>
            Choose resumes from your resume pool to screen for the position: <strong>{job.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Selection Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, filename, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSelectAll}
                disabled={isProcessing}
              >
                {selectedResumes.length === filteredResumes.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                onClick={handleProcessSelected}
                disabled={isProcessing || selectedResumes.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Process {selectedResumes.length} Resume{selectedResumes.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Resume List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Resume Pool ({filteredResumes.length} resumes)
                {selectedResumes.length > 0 && (
                  <span className="text-blue-600 ml-2">
                    ({selectedResumes.length} selected)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Loading resumes...</p>
                </div>
              ) : filteredResumes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No resumes in your pool yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResumes.map((resume) => {
                    const isSelected = selectedResumes.includes(resume.id);
                    const processing = processingResumes.find(p => p.id === resume.id);
                    
                    return (
                      <div key={resume.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleResumeSelect(resume.id, checked as boolean)}
                              className="flex-shrink-0 mt-1"
                              disabled={isProcessing}
                            />
                            {processing ? getStatusIcon(processing.status) : <FileText className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />}
                            <div className="flex-1 min-w-0">
                              {/* Name/Title and Status */}
                              <div className="flex items-start gap-2 mb-2">
                                <p className="text-sm font-medium text-gray-900 flex-shrink-0">
                                  {getDisplayName(resume)}
                                </p>
                                <div className="flex-shrink-0">
                                  {globalStatusBadges[resume.id] ? (
                                    <GlobalStatusBadge 
                                      globalStatus={globalStatusBadges[resume.id]} 
                                      maxDisplay={2}
                                      className="text-xs"
                                    />
                                  ) : (
                                    <GlobalStatusBadge 
                                      globalStatus={{
                                        resume_pool_id: resume.id,
                                        statuses: [],
                                        highest_priority_status: 'pending'
                                      }} 
                                      maxDisplay={2}
                                      className="text-xs"
                                    />
                                  )}
                                </div>
                              </div>

                              {/* Contact Information */}
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
                                {resume.email && (
                                  <div className="flex items-center space-x-1">
                                    <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{resume.email}</span>
                                  </div>
                                )}
                                {resume.phone && (
                                  <div className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{resume.phone}</span>
                                  </div>
                                )}
                                {resume.home_address && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{resume.home_address}</span>
                                  </div>
                                )}
                              </div>

                              {/* Skills */}
                              {(() => {
                                const normalizedSkills = normalizeSkills(resume.skills);
                                return normalizedSkills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {normalizedSkills.map((skill, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                );
                              })()}

                              {/* Basic Info */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{format(new Date(resume.created_at), 'MMM dd, yyyy')}</span>
                                </span>
                                <span className="flex items-center">
                                  <HardDrive className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{formatFileSize(resume.file_size)}</span>
                                </span>
                                {resume.resume_text && (
                                  <Badge variant="secondary" className="text-xs w-fit">
                                    Text Extracted
                                  </Badge>
                                )}
                              </div>

                              {/* Processing Status */}
                              {processing && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between mb-1">
                                    {getStatusBadge(processing.status)}
                                    <span className="text-xs text-gray-500">{processing.progress}%</span>
                                  </div>
                                  {processing.error && (
                                    <p className="text-xs text-red-600 mt-1">{processing.error}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
      
    </Dialog>
  );
};

export default ResumePoolSelector;
