import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  FileText, 
  Calendar,
  User,
  HardDrive,
  MoreVertical,
  Eye,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import ResumePoolUpload from '@/components/ResumePoolUpload';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import ResumePoolChat from '@/components/ResumePoolChat';

const ResumePool = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<ResumePoolItem | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { data: resumes = [], isLoading, refetch } = useResumePool();
  const deleteResumeMutation = useDeleteResumeFromPool();
  const bulkDeleteMutation = useBulkDeleteResumes();
  const downloadResumeMutation = useDownloadResume();
  const { toast } = useToast();

  // Filter and sort resumes
  const filteredAndSortedResumes = useMemo(() => {
    let filtered = resumes.filter(resume =>
      resume.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resume.resume_text && resume.resume_text.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
        <Navbar title="Resume Pool" />
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
      <Navbar title="Resume Pool" />
      <div className="container mx-auto px-4 pt-32 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header - Removed title, description, and upload button */}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                    <p className="text-2xl font-bold text-gray-900">{resumes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <HardDrive className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Size</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatFileSize(calculateTotalSize())}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Latest Upload</p>
                    <p className="text-sm font-bold text-gray-900">
                      {resumes.length > 0 ? format(new Date(resumes[0].created_at), 'MMM dd, yyyy') : 'None'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search resumes by filename or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === 'name' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    variant={sortBy === 'size' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSort('size')}
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
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedResumes.length} resume{selectedResumes.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedResumes([])}
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
              <div className="flex items-center justify-between">
                <CardTitle>Resumes ({filteredAndSortedResumes.length})</CardTitle>
                {filteredAndSortedResumes.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-gray-600">Select All</span>
                  </div>
                )}
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
                  {!searchTerm && <ResumePoolUpload onUploadComplete={() => refetch()} />}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAndSortedResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                        <Checkbox
                          checked={selectedResumes.includes(resume.id)}
                          onCheckedChange={(checked) => handleSelectResume(resume.id, checked as boolean)}
                          className="flex-shrink-0"
                        />
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate pr-2">
                            {resume.original_filename}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs text-gray-500 mt-1">
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
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadResume(resume)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9 sm:p-2"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-9 sm:p-2">
                              <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownloadResume(resume)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteResume(resume)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
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

      {/* RAG Chat Interface */}
      <ResumePoolChat
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        resumePoolData={resumes}
      />
    </div>
  );
};

export default ResumePool;
