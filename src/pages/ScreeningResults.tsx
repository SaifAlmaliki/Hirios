import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useScreeningResults, ScreeningResult } from '@/hooks/useScreeningResults';
import { useCompanyJobs } from '@/hooks/useCompanyJobs';
import ScreeningResultCard from '@/components/ScreeningResultCard';
import Navbar from '@/components/Navbar';
import CompanyResumeUpload from '@/components/CompanyResumeUpload';
import ResumePoolSelector from '@/components/ResumePoolSelector';

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

  // Get specific job details if jobId is provided
  const currentJob = jobId ? companyJobs.find(job => job.id === jobId) : null;

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  
  // State for voice interviews
  const [requestingInterview, setRequestingInterview] = useState<string | null>(null);
  const [voiceInterviewService] = useState(() => VoiceInterviewService.getInstance());
  
  // State for upload dialogs
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isResumePoolDialogOpen, setIsResumePoolDialogOpen] = useState(false);

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
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Screening Results ({filteredAndSortedResults.length})
                </CardTitle>
                {jobId && currentJob && (
                  <div className="text-right space-y-2">
                    <p className="text-sm font-medium text-gray-900">{currentJob.title}</p>
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => setIsResumePoolDialogOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-8 text-sm"
                      >
                        <FileText className="h-4 w-4" />
                        From Pool
                      </Button>
                      <Button
                        onClick={() => setIsUploadDialogOpen(true)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-sm"
                      >
                        <FileText className="h-4 w-4" />
                        Upload New
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

        </div>
      </div>

      {/* Upload Resumes Dialog - only show for job-specific pages */}
      {jobId && currentJob && (
        <>
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
          <ResumePoolSelector
            jobId={jobId}
            job={currentJob}
            isDialogOpen={isResumePoolDialogOpen}
            onDialogOpenChange={setIsResumePoolDialogOpen}
            onSelectionComplete={() => {
              // Refresh screening results after selection
              window.location.reload();
            }}
          />
        </>
      )}
    </div>
  );
};

export default ScreeningResults;