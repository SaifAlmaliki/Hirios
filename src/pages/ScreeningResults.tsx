import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Award, 
  ChevronDown, 
  ChevronUp, 
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
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useScreeningResults, useScreeningResultsStats, useAddNoteToScreeningResult, ScreeningResult } from '@/hooks/useScreeningResults';
import { useHasAIAccess } from '@/hooks/useSubscription';
import { VoiceInterviewService } from '@/services/voiceInterviewService';

const ScreeningResults = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const { toast } = useToast();
  
  // Data fetching
  const { data: screeningResults = [], isLoading, error } = useScreeningResults();
  const { data: stats } = useScreeningResultsStats();
  const { data: hasAIAccess } = useHasAIAccess();
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

  // Redirect if not company user
  React.useEffect(() => {
    if (!user || userType !== 'company') {
      navigate('/auth');
      return;
    }
  }, [user, userType, navigate]);

  // Helper functions (moved before conditional returns)
  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score > 70) return 'Excellent';
    if (score >= 40) return 'Good';
    return 'Poor';
  };

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
    
    addNoteMutation.mutate({
      id: selectedResult.id,
      notes: noteText
    }, {
      onSuccess: () => {
        setNoteDialogOpen(false);
        setSelectedResult(null);
        setNoteText('');
      }
    });
  };

  const handleRequestVoiceScreening = async (result: ScreeningResult) => {
    try {
      setRequestingInterview(result.id);
      
      const response = await voiceInterviewService.requestVoiceScreening(result.id);
      
      if (response.success) {
        toast({
          title: "Voice Screening Requested",
          description: `Voice screening interview has been requested for ${result.first_name} ${result.last_name}. They will receive an email with the interview link.`,
        });
      } else {
        throw new Error(response.error || 'Failed to request voice screening');
      }
    } catch (error) {
      toast({
        title: "Failed to Request Voice Screening",
        description: error instanceof Error ? error.message : "Unable to request voice screening. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequestingInterview(null);
    }
  };

  const handleExportPDF = () => {
    // Simple PDF export functionality
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Screening Results - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
            .stat { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .score-excellent { color: green; font-weight: bold; }
            .score-good { color: orange; font-weight: bold; }
            .score-poor { color: red; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AI Screening Results</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat">
              <h3>${stats?.total || 0}</h3>
              <p>Total Screened</p>
            </div>
            <div class="stat">
              <h3>${stats?.averageScore || 0}%</h3>
              <p>Average Score</p>
            </div>
            <div class="stat">
              <h3>${stats?.excellent || 0}</h3>
              <p>Excellent (>70%)</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Email</th>
                <th>Job Position</th>
                <th>Score</th>
                <th>Rating</th>
                <th>Date Screened</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAndSortedResults.map(result => `
                <tr>
                  <td>${result.first_name} ${result.last_name}</td>
                  <td>${result.email}</td>
                  <td>${result.job?.title || 'N/A'}</td>
                  <td class="score-${getScoreLabel(result.overall_fit || 0).toLowerCase()}">${result.overall_fit || 0}%</td>
                  <td>${getScoreLabel(result.overall_fit || 0)}</td>
                  <td>${new Date(result.created_at).toLocaleDateString()}</td>
                  <td>${result.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = screeningResults.filter(result => {
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

  // Show upgrade prompt for free users
  // TEMPORARILY DISABLED FOR DEBUGGING - Re-enable by changing false to hasAIAccess === false
  if (false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto bg-blue-600 p-3 rounded-full w-fit mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              AI Screening Dashboard
            </CardTitle>
            <CardDescription>
              Access detailed candidate screening results with AI insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 font-medium">Premium Feature Required</p>
              <p className="text-orange-700 text-sm mt-1">
                Upgrade to Premium to access AI screening results and candidate insights.
              </p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/subscription')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Upgrade to Premium
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/job-portal')}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }



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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Brain className="h-8 w-8 mr-3 text-blue-600" />
              AI Screening Results
            </h1>
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
            <Button
              onClick={() => navigate('/job-portal')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-blue-50 border-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Screened</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-xs text-gray-600">+{stats.recentCount} this week</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excellent Fits</CardTitle>
                <Award className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
                <p className="text-xs text-gray-600">{stats.total > 0 ? Math.round((stats.excellent / stats.total) * 100) : 0}% of total</p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Good Fits</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.good}</div>
                <p className="text-xs text-gray-600">{stats.total > 0 ? Math.round((stats.good / stats.total) * 100) : 0}% of total</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Brain className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.averageScore}%</div>
                <Progress value={stats.averageScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        )}

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
                  <Card key={result.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                              <User className="h-5 w-5 mr-2 text-blue-600" />
                              {result.first_name} {result.last_name}
                            </h3>
                            <Badge className={`${getScoreColor(result.overall_fit || 0)} border-0`}>
                              {result.overall_fit || 0}% - {getScoreLabel(result.overall_fit || 0)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              {result.email}
                            </div>
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-2" />
                              {result.job?.title || 'No job linked'}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(result.created_at).toLocaleDateString()}
                            </div>
                            {result.phone && (
                              <div className="flex items-center">
                                <Mic className="h-4 w-4 mr-2" />
                                {result.phone}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {result.resume_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(result.resume_url, '_blank')}
                              className="flex items-center gap-1 border-green-300 text-green-600 hover:bg-green-50"
                            >
                              <FileText className="h-4 w-4" />
                              Resume
                            </Button>
                          )}
                          
                          {/* Voice Agent Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestVoiceScreening(result)}
                            disabled={requestingInterview !== null || result.voice_screening_requested}
                            className={`flex items-center gap-1 ${
                              result.voice_screening_requested 
                                ? 'border-green-300 text-green-600 hover:bg-green-50' 
                                : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {requestingInterview === result.id ? (
                              <>
                                <Mic className="h-4 w-4 animate-spin" />
                                Requesting...
                              </>
                            ) : result.voice_screening_requested ? (
                              <>
                                <Mic className="h-4 w-4" />
                                Interview Requested
                              </>
                            ) : (
                              <>
                                <Mic className="h-4 w-4" />
                                Voice Agent
                              </>
                            )}
                          </Button>

                          {/* Development: Direct Interview Link */}
                          {process.env.NODE_ENV === 'development' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = VoiceInterviewService.generateInterviewLink(result.id, true);
                                VoiceInterviewService.copyInterviewLink(result.id, true);
                                toast({
                                  title: "Interview Link Copied",
                                  description: "Direct interview link copied to clipboard (auto-start enabled)",
                                });
                              }}
                              className="flex items-center gap-1 border-purple-300 text-purple-600 hover:bg-purple-50"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Copy Link
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(result.id)}
                            className="flex items-center gap-1"
                          >
                            {expandedRows.has(result.id) ? (
                              <>
                                Less <ChevronUp className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                Details <ChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar for Score */}
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Overall Fit Score</span>
                          <span>{result.overall_fit || 0}%</span>
                        </div>
                        <Progress 
                          value={result.overall_fit || 0} 
                          className="h-2"
                        />
                      </div>
                    </CardHeader>

                    <Collapsible open={expandedRows.has(result.id)}>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Strengths */}
                            {result.strengths && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-green-700 flex items-center">
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  Strengths
                                </h4>
                                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                  <p className="text-sm text-gray-700">{result.strengths}</p>
                                </div>
                              </div>
                            )}

                            {/* Weaknesses */}
                            {result.weaknesses && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-red-700">
                                  Areas for Development
                                </h4>
                                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                  <p className="text-sm text-gray-700">{result.weaknesses}</p>
                                </div>
                              </div>
                            )}

                            {/* Risk Factor */}
                            {result.risk_factor && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-orange-700">
                                  Risk Factors
                                </h4>
                                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                  <p className="text-sm text-gray-700">{result.risk_factor}</p>
                                </div>
                              </div>
                            )}

                            {/* Reward Factor */}
                            {result.reward_factor && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-blue-700">
                                  Potential Rewards
                                </h4>
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <p className="text-sm text-gray-700">{result.reward_factor}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Justification */}
                          {result.justification && (
                            <div className="mt-6 space-y-2">
                              <h4 className="font-semibold text-gray-900">
                                AI Analysis Justification
                              </h4>
                              <div className="bg-gray-50 p-4 rounded-lg border">
                                <p className="text-sm text-gray-700">{result.justification}</p>
                              </div>
                            </div>
                          )}

                          {/* Interview Summary */}
                          {result.interview_summary && (
                            <div className="mt-6 space-y-2">
                              <h4 className="font-semibold text-blue-700 flex items-center">
                                <Mic className="h-4 w-4 mr-2" />
                                Voice Interview Summary
                              </h4>
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-sm text-gray-700">{result.interview_summary}</p>
                                {result.interview_completed_at && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Completed: {new Date(result.interview_completed_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Voice Screening Status */}
                          {result.voice_screening_requested && !result.interview_summary && (
                            <div className="mt-6 space-y-2">
                              <h4 className="font-semibold text-orange-700 flex items-center">
                                <Mic className="h-4 w-4 mr-2" />
                                Voice Screening Status
                              </h4>
                              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <p className="text-sm text-gray-700">Voice screening interview has been requested. Candidate will receive an email with the interview link.</p>
                              </div>
                            </div>
                          )}

                          {/* Company Notes */}
                          {result.notes && (
                            <div className="mt-6 space-y-2">
                              <h4 className="font-semibold text-purple-700 flex items-center">
                                <StickyNote className="h-4 w-4 mr-2" />
                                Company Notes
                              </h4>
                              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <p className="text-sm text-gray-700">{result.notes}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
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
  );
};

export default ScreeningResults; 