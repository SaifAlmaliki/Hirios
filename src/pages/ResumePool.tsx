import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Download, 
  Trash2, 
  FileText, 
  Calendar,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useResumePool, useDeleteResumeFromPool, useBulkDeleteResumes, useDownloadResume, ResumePoolItem } from '@/hooks/useResumePool';
import { useGlobalResumePoolStatusBadges } from '@/hooks/useCandidateStatus';
import ResumePoolUpload from '@/components/ResumePoolUpload';
import ResumeRow from '@/components/ResumeRow';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import ScreeningProgressBar from '@/components/ui/ScreeningProgressBar';

const ResumePool = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<ResumePoolItem | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [uploadedResumeCount, setUploadedResumeCount] = useState(0);
  const [progressDuration, setProgressDuration] = useState(30);

  const { data: resumes = [], isLoading, refetch } = useResumePool();
  const deleteResumeMutation = useDeleteResumeFromPool();
  const bulkDeleteMutation = useBulkDeleteResumes();
  const downloadResumeMutation = useDownloadResume();
  const { toast } = useToast();

  // Get global status badges for all resumes across all jobs
  const resumeIds = resumes.map(r => r.id);
  const { data: globalStatusBadges = {} } = useGlobalResumePoolStatusBadges(resumeIds);

  // Check if resume processing is in progress (using localStorage)
  useEffect(() => {
    const storageKey = 'resume_pool_upload_progress';
    const progressData = localStorage.getItem(storageKey);
    
    if (progressData) {
      try {
        const { timestamp, count, duration = 30000 } = JSON.parse(progressData);
        const elapsed = Date.now() - timestamp;
        const remainingTime = duration - elapsed;
        
        if (remainingTime > 0) {
          // Processing is still in progress
          setShowProgressBar(true);
          setUploadedResumeCount(count);
          setProgressDuration(Math.ceil(remainingTime / 1000)); // Convert to seconds
          
          // Set timeout to hide progress bar after remaining time
          const timeout = setTimeout(() => {
            setShowProgressBar(false);
            localStorage.removeItem(storageKey);
            // Refresh the page to show new results
            window.location.reload();
          }, remainingTime);
          
          return () => clearTimeout(timeout);
        } else {
          // Progress bar period has expired
          localStorage.removeItem(storageKey);
        }
      } catch (e) {
        console.error('Error parsing progress data:', e);
        localStorage.removeItem(storageKey);
      }
    }
  }, []);

  // Filter and sort resumes
  const filteredAndSortedResumes = useMemo(() => {
    const filtered = resumes.filter(resume => {
      const searchLower = searchTerm.toLowerCase();
      return (
        resume.original_filename.toLowerCase().includes(searchLower) ||
        (resume.resume_text && resume.resume_text.toLowerCase().includes(searchLower)) ||
        (resume.first_name && resume.first_name.toLowerCase().includes(searchLower)) ||
        (resume.last_name && resume.last_name.toLowerCase().includes(searchLower)) ||
        (resume.email && resume.email.toLowerCase().includes(searchLower)) ||
        (resume.phone && resume.phone.toLowerCase().includes(searchLower)) ||
        (resume.home_address && resume.home_address.toLowerCase().includes(searchLower)) ||
        (resume.skills && resume.skills.some(skill => skill.toLowerCase().includes(searchLower)))
      );
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.original_filename.localeCompare(b.original_filename);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'size':
          comparison = a.file_size - b.file_size;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [resumes, searchTerm, sortBy, sortOrder]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate total size from file_size field
  const calculateTotalSize = () => {
    return resumes.reduce((sum, r) => sum + (r.file_size || 0), 0);
  };

  const handleSelectResume = (resumeId: string, checked: boolean) => {
    if (checked) {
      setSelectedResumes(prev => [...prev, resumeId]);
    } else {
      setSelectedResumes(prev => prev.filter(id => id !== resumeId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResumes(filteredAndSortedResumes.map(r => r.id));
    } else {
      setSelectedResumes([]);
    }
  };

  const handleDeleteResume = (resume: ResumePoolItem) => {
    setResumeToDelete(resume);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteResume = async () => {
    if (!resumeToDelete) return;
    
    await deleteResumeMutation.mutateAsync({
      resumeId: resumeToDelete.id,
      storagePath: resumeToDelete.storage_path
    });
    
    setDeleteDialogOpen(false);
    setResumeToDelete(null);
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const resumesToDelete = filteredAndSortedResumes.filter(r => selectedResumes.includes(r.id));
    
    await bulkDeleteMutation.mutateAsync(
      resumesToDelete.map(r => ({ id: r.id, storagePath: r.storage_path }))
    );
    
    setBulkDeleteDialogOpen(false);
    setSelectedResumes([]);
  };

  const handleDownloadResume = (resume: ResumePoolItem) => {
    downloadResumeMutation.mutate({
      storagePath: resume.storage_path,
      filename: resume.original_filename
    });
  };

  const handleBulkDownload = () => {
    const selectedResumeData = filteredAndSortedResumes.filter(r => selectedResumes.includes(r.id));
    selectedResumeData.forEach(resume => {
      downloadResumeMutation.mutate({
        storagePath: resume.storage_path,
        filename: resume.original_filename
      });
    });
  };

  const handleSort = (field: 'name' | 'date' | 'size') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const allSelected = filteredAndSortedResumes.length > 0 && selectedResumes.length === filteredAndSortedResumes.length;
  const someSelected = selectedResumes.length > 0 && selectedResumes.length < filteredAndSortedResumes.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar title="Talent Pool" />
        <div className="flex items-center justify-center pt-40">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading resume pool...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar title="Talent Pool" />
        <div className="container mx-auto px-4 pt-32 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header - Removed title, description, and upload button */}

          {/* Progress Bar - Show if processing is in progress */}
          {showProgressBar && (
            <div className="mb-8">
              <ScreeningProgressBar 
                totalResumes={uploadedResumeCount}
                onComplete={() => {
                  setShowProgressBar(false);
                  localStorage.removeItem('resume_pool_upload_progress');
                  window.location.reload();
                }}
                durationSeconds={progressDuration}
                mode="extraction"
              />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                  <div className="ml-3 sm:ml-4 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Resumes</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{resumes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <HardDrive className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                  <div className="ml-3 sm:ml-4 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Size</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                      {formatFileSize(calculateTotalSize())}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                  <div className="ml-3 sm:ml-4 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Latest Upload</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {resumes.length > 0 ? format(new Date(resumes[0].created_at), 'MMM dd, yyyy') : 'None'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, email, skills, or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={sortBy === 'name' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="flex-shrink-0"
                  >
                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSort('date')}
                    className="flex-shrink-0"
                  >
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    variant={sortBy === 'size' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSort('size')}
                    className="flex-shrink-0"
                  >
                    Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedResumes.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedResumes.length} resume{selectedResumes.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDownload}
                        className="text-xs sm:text-sm"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Download All</span>
                        <span className="sm:hidden">Download</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Delete All</span>
                        <span className="sm:hidden">Delete</span>
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedResumes([])}
                    className="text-xs sm:text-sm self-start sm:self-auto"
                  >
                    Clear Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resume List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg sm:text-xl">Resumes ({filteredAndSortedResumes.length})</CardTitle>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {filteredAndSortedResumes.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={allSelected}
                        ref={(el) => {
                          if (el) (el as any).indeterminate = someSelected;
                        }}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm text-gray-600 whitespace-nowrap">Select All</span>
                    </div>
                  )}
                  <ResumePoolUpload onUploadComplete={() => refetch()} showTrigger={true} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAndSortedResumes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Upload your first resume to get started.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAndSortedResumes.map((resume) => (
                    <ResumeRow
                      key={resume.id}
                      resume={resume}
                      isSelected={selectedResumes.includes(resume.id)}
                      onSelect={handleSelectResume}
                      onDownload={handleDownloadResume}
                      onDelete={handleDeleteResume}
                      globalStatus={globalStatusBadges[resume.id]}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{resumeToDelete?.original_filename}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteResume}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Resumes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedResumes.length} resume{selectedResumes.length !== 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default ResumePool;
