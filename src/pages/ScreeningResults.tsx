import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Filter, 
  Download, 
  StickyNote,
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
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useScreeningResults, useAddNoteToScreeningResult, ScreeningResult } from '@/hooks/useScreeningResults';
import { useCompanyJobs } from '@/hooks/useCompanyJobs';
import ScreeningResultCard from '@/components/ScreeningResultCard';
import Navbar from '@/components/Navbar';
import CompanyResumeUpload from '@/components/CompanyResumeUpload';

import { VoiceInterviewService } from '@/services/voiceInterviewService';

const ScreeningResults = () => {
  // ALL HOOKS MUST BE CALLED FIRST - NO CONDITIONAL HOOKS
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId?: string }>();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  
  // Data fetching
  const { data: screeningResults = [], isLoading, error } = useScreeningResults();
  const { data: companyJobs = [], isLoading: jobsLoading } = useCompanyJobs();
  const addNoteMutation = useAddNoteToScreeningResult();

  // Get specific job details if jobId is provided
  const currentJob = jobId ? companyJobs.find(job => job.id === jobId) : null;

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('all'); // all, favorites, dismissed
  
  // State for notes
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScreeningResult | null>(null);
  const [noteText, setNoteText] = useState('');
  
  // State for voice interviews
  const [requestingInterview, setRequestingInterview] = useState<string | null>(null);
  const [voiceInterviewService] = useState(() => VoiceInterviewService.getInstance());
  
  // State for upload dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

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

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'favorites' && result.is_favorite) ||
        (statusFilter === 'dismissed' && result.is_dismissed);

      return matchesSearch && matchesScore && matchesJob && matchesStatus;
    });

    // Sort results by score
    filtered.sort((a, b) => {
      const aValue = a.overall_fit || 0;
      const bValue = b.overall_fit || 0;

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [screeningResults, searchTerm, scoreFilter, sortOrder, selectedJobId, statusFilter, jobId]);

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

  const handleAddNote = (result: ScreeningResult) => {
    setSelectedResult(result);
    setNoteText(result.notes || '');
    setNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (!selectedResult) return;
    
    addNoteMutation.mutate(
      { id: selectedResult.id, notes: noteText },
      {
      onSuccess: () => {
        setNoteDialogOpen(false);
        setSelectedResult(null);
        setNoteText('');
        },
      }
    );
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




          {/* Combined Filters */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${jobId ? 'lg:grid-cols-3' : 'lg:grid-cols-5'}`}>
                {/* Job Title Filter - only show if not viewing specific job */}
                {!jobId && (
                  <div className="col-span-1 lg:col-span-2 space-y-2">
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

                {/* Sort Order - 20% of space (1/5 column) */}
                <div className="col-span-1 lg:col-span-1 space-y-2">
                  <Label htmlFor="sort-order">Sort Order</Label>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort order..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Highest First</SelectItem>
                      <SelectItem value="asc">Lowest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter - 20% of space (1/5 column) */}
                <div className="col-span-1 lg:col-span-1 space-y-2">
                  <Label htmlFor="status-filter">Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All candidates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Candidates</SelectItem>
                      <SelectItem value="favorites">Favorites Only</SelectItem>
                      <SelectItem value="dismissed">Dismissed Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Screening Results ({filteredAndSortedResults.length})
                </CardTitle>
                {jobId && currentJob && (
                  <div className="text-right space-y-2">
                    <p className="text-sm font-medium text-gray-900">{currentJob.title}</p>
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => setIsUploadDialogOpen(true)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-sm"
                      >
                        <FileText className="h-4 w-4" />
                        Upload Resumes
                      </Button>
                    </div>
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
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Note Dialog */}
          <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedResult?.notes ? 'Edit Note' : 'Add Note'}
                </DialogTitle>
                <DialogDescription>
                  Add your notes about {selectedResult?.first_name} {selectedResult?.last_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note-text">Note</Label>
                  <Textarea
                    id="note-text"
                    placeholder="Enter your notes about this candidate..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setNoteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveNote}
                    disabled={addNoteMutation.isPending}
                  >
                    {addNoteMutation.isPending ? 'Saving...' : 'Save Note'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Upload Resumes Dialog - only show for job-specific pages */}
      {jobId && (
        <CompanyResumeUpload 
          preselectedJobId={jobId}
          isDialogOpen={isUploadDialogOpen}
          onDialogOpenChange={setIsUploadDialogOpen}
          showTrigger={false}
          onUploadComplete={() => {
            // Refresh screening results after upload
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default ScreeningResults;