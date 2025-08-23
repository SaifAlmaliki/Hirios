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
  Building2,
  ArrowLeft,
  Star,
  Menu,
  X,
  LogOut,
  Settings,
  Brain,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useScreeningResults, useAddNoteToScreeningResult, ScreeningResult } from '@/hooks/useScreeningResults';
import ScreeningResultCard from '@/components/ScreeningResultCard';

import { VoiceInterviewService } from '@/services/voiceInterviewService';

const ScreeningResults = () => {
  // ALL HOOKS MUST BE CALLED FIRST - NO CONDITIONAL HOOKS
  const navigate = useNavigate();
  const { user, userType, loading, signOut } = useAuth();
  const { toast } = useToast();
  
  // Data fetching
  const { data: screeningResults = [], isLoading, error } = useScreeningResults();
  const addNoteMutation = useAddNoteToScreeningResult();

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // State for notes
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScreeningResult | null>(null);
  const [noteText, setNoteText] = useState('');
  
  // State for voice interviews
  const [requestingInterview, setRequestingInterview] = useState<string | null>(null);
  const [voiceInterviewService] = useState(() => VoiceInterviewService.getInstance());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

      return matchesSearch && matchesScore;
    });

    // Sort results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'score':
          aValue = a.overall_fit || 0;
          bValue = b.overall_fit || 0;
          break;
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`;
          bValue = `${b.first_name} ${b.last_name}`;
          break;
        case 'date':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [screeningResults, searchTerm, scoreFilter, sortBy, sortOrder]);

  // Redirect if not company user - THIS MUST BE AFTER ALL HOOKS
  React.useEffect(() => {
    if (!loading && (!user || userType !== 'company')) {
      navigate('/auth');
      return;
    }
  }, [user, userType, loading, navigate]);

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
  if (!user || userType !== 'company') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only available for company accounts.</p>
          <Button onClick={() => navigate('/job-portal')}>
            Go to Job Portal
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

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCompanySetup = () => {
    navigate('/company-setup');
  };

  const handleScreeningResults = () => {
    navigate('/screening-results');
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
      {/* Header (reused from JobPortal) */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1
                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-700"
                onClick={() => navigate('/job-portal')}
              >
                Job Portal
              </h1>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* User Actions */}
              {user ? (
                <div className="flex items-center space-x-3 flex-wrap">
                  <span className="text-sm text-gray-600 hidden lg:inline">
                    {user.email} ({userType})
                  </span>

                  {userType === 'company' && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCompanySetup}>
                        <Settings className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Setup</span>
                      </Button>

                      <Button variant="outline" size="sm" onClick={handleScreeningResults}>
                        <Brain className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">AI Screening</span>
                        <span className="sm:hidden">AI</span>
                      </Button>
                    </>
                  )}

                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Sign Out</span>
                    <span className="sm:hidden">Out</span>
                  </Button>
                </div>
              ) : (
                <Button onClick={() => navigate('/auth')} size="sm">
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 space-y-4">
              {user && (
                <div className="space-y-3 px-4">
                  <div className="text-sm text-gray-600 text-center">
                    {user.email} ({userType})
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {userType === 'company' && (
                      <>
                        <Button variant="outline" size="sm" onClick={handleCompanySetup} className="w-full">
                          <Settings className="h-4 w-4 mr-1" />
                          Setup
                        </Button>

                        <Button variant="outline" size="sm" onClick={handleScreeningResults} className="w-full">
                          <Brain className="h-4 w-4 mr-1" />
                          AI Screening
                        </Button>
                      </>
                    )}

                    <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}

              {!user && (
                <div className="px-4">
                  <Button onClick={() => navigate('/auth')} size="sm" className="w-full">
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Screening Results</h1>
              <p className="text-gray-600 mt-1">Comprehensive candidate analysis and insights</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>




          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Candidates</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Name, email, or job title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score-filter">Filter by Score</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="sort-by">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date Screened</SelectItem>
                      <SelectItem value="score">Overall Fit Score</SelectItem>
                      <SelectItem value="name">Candidate Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort-order">Order</Label>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Order..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
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
              </div>
            </CardHeader>
            <CardContent>
              {filteredAndSortedResults.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No screening results found matching your criteria.</p>
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
    </div>
  );
};

export default ScreeningResults;