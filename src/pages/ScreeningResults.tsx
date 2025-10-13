import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { useQueryClient } from '@tanstack/react-query';
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
import { 
  Filter, 
  Download, 
  Search,
  Calendar,
  Briefcase,
  Mail,
  User,
  Mic,
  MicOff,
  FileText,
  ExternalLink,
  Eye,
  Phone,
  MapPin,
  Star,
  Brain,
  Trash2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useScreeningResults, ScreeningResult, useBulkDeleteScreeningResults } from '@/hooks/useScreeningResults';
import { useCompanyJobs } from '@/hooks/useCompanyJobs';
import ScreeningResultCard from '@/components/ScreeningResultCard';
import Navbar from '@/components/Navbar';
import ResumePoolSelector from '@/components/ResumePoolSelector';
import ScreeningProgressBar from '@/components/ui/ScreeningProgressBar';

import { VoiceInterviewService } from '@/services/voiceInterviewService';

const ScreeningResults = () => {
  // ALL HOOKS MUST BE CALLED FIRST - NO CONDITIONAL HOOKS
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId?: string }>();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Data fetching
  const { data: screeningResults = [], isLoading, error, refetch } = useScreeningResults();
  const { data: companyJobs = [], isLoading: jobsLoading } = useCompanyJobs();

  // Get specific job details if jobId is provided
  const currentJob = jobId ? companyJobs.find(job => job.id === jobId) : null;

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // State for bulk selection and deletion
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // State for voice interviews
  const [requestingInterview, setRequestingInterview] = useState<string | null>(null);
  const [voiceInterviewService] = useState(() => VoiceInterviewService.getInstance());
  
  // State for upload dialogs
  const [isResumePoolDialogOpen, setIsResumePoolDialogOpen] = useState(false);

  // State for screening progress tracking
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [processingResumeCount, setProcessingResumeCount] = useState(0);

  // Bulk delete mutation
  const bulkDeleteMutation = useBulkDeleteScreeningResults();

  // Check if screening is in progress for this job (using localStorage)
  useEffect(() => {
    if (jobId) {
      const storageKey = `screening_progress_${jobId}`;
      const progressData = localStorage.getItem(storageKey);
      
      if (progressData) {
        try {
          const { timestamp, count } = JSON.parse(progressData);
          const elapsed = Date.now() - timestamp;
          const remainingTime = 60000 - elapsed; // 60 seconds in ms
          
          if (remainingTime > 0) {
            // Screening is still in progress
            setShowProgressBar(true);
            setProcessingResumeCount(count);
            
            // Set timeout to hide progress bar after remaining time
            const timeout = setTimeout(() => {
              setShowProgressBar(false);
              localStorage.removeItem(storageKey);
              // Immediately invalidate cache to refresh data
              queryClient.invalidateQueries({ queryKey: ['screening_results'] });
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
    }
  }, [jobId]);

  // Filter and sort results - must be before any conditional returns
  const filteredAndSortedResults = useMemo(() => {
    const filtered = screeningResults.filter(result => {
      const matchesSearch = 
        result.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (result.job?.title || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesScore = scoreFilter === 'all' || 
        (scoreFilter === 'excellent' && (result.overall_fit || 0) > 70) ||
        (scoreFilter === 'good' && (result.overall_fit || 0) >= 40 && (result.overall_fit || 0) <= 70) ||
        (scoreFilter === 'poor' && (result.overall_fit || 0) < 40);

      const matchesJob = jobId 
        ? result.job_id === jobId 
        : selectedJobId === 'all' || result.job_id === selectedJobId;

      return matchesSearch && matchesScore && matchesJob;
    });

    // Sort results by score (highest first by default)
    filtered.sort((a, b) => {
      const aValue = a.overall_fit || 0;
      const bValue = b.overall_fit || 0;
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

    return filtered;
  }, [screeningResults, searchTerm, scoreFilter, selectedJobId, jobId]);

  // Redirect if not company user - THIS MUST BE AFTER ALL HOOKS
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/');
      return;
    }
  }, [user, loading, navigate]);

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Security check: Only allow companies to access this page
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only available for company accounts.</p>
          <Button onClick={() => navigate('/')}>
            Go to Landing Page
          </Button>
        </div>
      </div>
    );
  }

  // Helper functions
  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };


  const handleRequestVoiceScreening = async (result: ScreeningResult) => {
    setRequestingInterview(result.id);
    
    try {
      await voiceInterviewService.requestVoiceScreening(result.id);
      
        toast({
        title: "Success",
        description: "Voice interview requested successfully!",
        });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request voice interview",
        variant: "destructive",
      });
    } finally {
      setRequestingInterview(null);
    }
  };

  const handleExportPDF = () => {
    // Implementation for PDF export
    toast({
      title: "Export",
      description: "PDF export feature coming soon!",
    });
  };

  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedResults((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredAndSortedResults.map(r => r.id));
      setSelectedResults(allIds);
    } else {
      setSelectedResults(new Set());
    }
  };

  const handleBulkDelete = () => {
    const resultsToDelete = filteredAndSortedResults
      .filter(r => selectedResults.has(r.id))
      .map(r => ({
        id: r.id,
        resume_pool_id: r.resume_pool_id,
        job_id: r.job_id
      }));

    bulkDeleteMutation.mutate(resultsToDelete, {
      onSuccess: () => {
        setSelectedResults(new Set());
        setShowDeleteDialog(false);
      }
    });
  };

  const isAllSelected = filteredAndSortedResults.length > 0 && 
    filteredAndSortedResults.every(r => selectedResults.has(r.id));
  const isSomeSelected = selectedResults.size > 0 && !isAllSelected;


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading screening results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-6">
            <p className="text-red-600 font-medium">Error loading screening results</p>
            <p className="text-gray-600 text-sm mt-2">{error.message}</p>
            <Button 
              onClick={() => navigate('/job-portal')}
              className="mt-4"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar title={jobId ? "Screening Results" : "AI Screening Results"} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pt-32">
        <div className="space-y-6">

          {/* Progress Bar - Show if screening is in progress */}
          {showProgressBar && jobId && (
            <ScreeningProgressBar 
              totalResumes={processingResumeCount}
              onComplete={() => {
                setShowProgressBar(false);
                localStorage.removeItem(`screening_progress_${jobId}`);
                // Immediately invalidate cache to refresh data
                queryClient.invalidateQueries({ queryKey: ['screening_results'] });
              }}
              durationSeconds={60}
            />
          )}

          {/* Combined Filters */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${jobId ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
                {/* Job Title Filter - only show if not viewing specific job */}
                {!jobId && (
                  <div className="col-span-1 lg:col-span-1 space-y-2">
                    <Label htmlFor="job-filter">Job Title</Label>
                    <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                      <SelectTrigger>
                        <SelectValue placeholder="All job titles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Job Titles</SelectItem>
                        {jobsLoading ? (
                          <SelectItem value="loading" disabled>Loading jobs...</SelectItem>
                        ) : companyJobs.length === 0 ? (
                          <SelectItem value="no-jobs" disabled>No jobs posted yet</SelectItem>
                        ) : (
                          companyJobs.map((job) => {
                            const resultCount = screeningResults.filter(result => result.job_id === job.id).length;
                            return (
                              <SelectItem key={job.id} value={job.id}>
                                {job.title} ({resultCount} results)
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Search Filter - 20% of space (1/5 column) */}
                <div className="col-span-1 lg:col-span-1 space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Name, email, job title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Score Filter - 20% of space (1/5 column) */}
                <div className="col-span-1 lg:col-span-1 space-y-2">
                  <Label htmlFor="score-filter">Score Filter</Label>
                  <Select value={scoreFilter} onValueChange={setScoreFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All scores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="excellent">Excellent (&gt;70%)</SelectItem>
                      <SelectItem value="good">Good (40-70%)</SelectItem>
                      <SelectItem value="poor">Poor (&lt;40%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all results"
                      className="data-[state=indeterminate]:bg-blue-600"
                      {...(isSomeSelected ? { 'data-state': 'indeterminate' as any } : {})}
                    />
                    <CardTitle className="text-lg">
                      Screening Results ({filteredAndSortedResults.length})
                      {selectedResults.size > 0 && (
                        <span className="ml-2 text-sm font-normal text-blue-600">
                          ({selectedResults.size} selected)
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedResults.size > 0 && (
                      <Button
                        onClick={() => setShowDeleteDialog(true)}
                        variant="destructive"
                        size="sm"
                        disabled={bulkDeleteMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete (${selectedResults.size})`}
                      </Button>
                    )}
                    {jobId && currentJob && (
                      <Button
                        onClick={() => setIsResumePoolDialogOpen(true)}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-8 text-sm w-auto"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="hidden xs:inline">From Pool</span>
                        <span className="xs:hidden">Pool</span>
                      </Button>
                    )}
                  </div>
                </div>
                {jobId && currentJob && (
                  <div className="text-sm font-medium text-gray-900 sm:hidden">
                    {currentJob.title}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredAndSortedResults.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {jobId 
                      ? `No screened resumes for ${currentJob?.title || 'this position'} yet.`
                      : 'No screening results found matching your criteria.'
                    }
                  </p>
                  {jobId && (
                    <p className="text-sm text-gray-500 mt-2">
                      Candidates will appear here once they apply and are screened for this position.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedResults.map((result) => (
                    <ScreeningResultCard
                      key={result.id}
                      result={result}
                      requestingInterview={requestingInterview}
                      onRequestVoiceScreening={handleRequestVoiceScreening}
                      expandedRows={expandedRows}
                      onToggleExpansion={toggleRowExpansion}
                      showCheckbox={true}
                      isSelected={selectedResults.has(result.id)}
                      onSelectionChange={handleSelectionChange}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Screening Results</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedResults.size} screening result{selectedResults.size !== 1 ? 's' : ''}? 
              This action cannot be undone. This will also remove any associated candidate status and comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upload Resumes Dialog - only show for job-specific pages */}
      {jobId && currentJob && (
        <ResumePoolSelector
          jobId={jobId}
          job={currentJob}
          isDialogOpen={isResumePoolDialogOpen}
          onDialogOpenChange={setIsResumePoolDialogOpen}
          onSelectionComplete={() => {
            // Immediately invalidate cache to refresh screening results
            queryClient.invalidateQueries({ queryKey: ['screening_results'] });
          }}
        />
      )}
    </div>
  );
};

export default ScreeningResults;