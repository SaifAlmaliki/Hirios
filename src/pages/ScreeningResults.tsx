import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Users, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useScreeningResults, useScreeningResultsStats, useAddNoteToScreeningResult, ScreeningResult } from '@/hooks/useScreeningResults';
import { useHasAIAccess } from '@/hooks/useSubscription';
import { VoiceInterviewService } from '@/services/voiceInterviewService';

// Import modular components
import { StatsCard } from '@/components/StatsCard';
import { FiltersSection } from '@/components/FiltersSection';
import { ExportButtons } from '@/components/ExportButtons';
import { ResultCard } from '@/components/ResultCard';
import { NoteDialog } from '@/components/NoteDialog';
import { EmptyState } from '@/components/EmptyState';

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

  // Helper function for PDF export
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
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              <span className="truncate">AI Screening Results</span>
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Comprehensive candidate analysis and insights</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <ExportButtons
              data={filteredAndSortedResults}
              stats={stats}
              onPDFExport={handleExportPDF}
            />
            <Button
              onClick={() => navigate('/job-portal')}
              variant="outline"
              className="flex items-center gap-2 justify-center text-sm"
              size="sm"
            >
              <span className="hidden xs:inline">Back to Dashboard</span>
              <span className="xs:hidden">Dashboard</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <StatsCard
              title="Total Screened"
              value={stats.total}
              subtitle={`+${stats.recentCount} this week`}
              icon={Users}
              color="blue"
            />
            <StatsCard
              title="Excellent Fits"
              value={stats.excellent}
              subtitle={`${stats.total > 0 ? Math.round((stats.excellent / stats.total) * 100) : 0}% of total`}
              icon={Award}
              color="green"
            />
            <StatsCard
              title="Good Fits"
              value={stats.good}
              subtitle={`${stats.total > 0 ? Math.round((stats.good / stats.total) * 100) : 0}% of total`}
              icon={TrendingUp}
              color="yellow"
            />
            <StatsCard
              title="Average Score"
              value={`${stats.averageScore}%`}
              icon={Brain}
              color="purple"
              showProgress={true}
              progressValue={stats.averageScore}
            />
          </div>
        )}

        {/* Filters */}
        <FiltersSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          scoreFilter={scoreFilter}
          onScoreFilterChange={setScoreFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

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
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {filteredAndSortedResults.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    isExpanded={expandedRows.has(result.id)}
                    onToggleExpansion={() => toggleRowExpansion(result.id)}
                    onRequestVoiceScreening={() => handleRequestVoiceScreening(result)}
                    onAddNote={() => handleAddNote(result)}
                    onCopyInterviewLink={process.env.NODE_ENV === 'development' ? () => {
                      const link = VoiceInterviewService.generateInterviewLink(result.id, true);
                      VoiceInterviewService.copyInterviewLink(result.id, true);
                      toast({
                        title: "Interview Link Copied",
                        description: "Direct interview link copied to clipboard (auto-start enabled)",
                      });
                    } : undefined}
                    requestingInterview={requestingInterview === result.id}
                    isDevelopment={process.env.NODE_ENV === 'development'}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Note Dialog */}
        <NoteDialog
          open={noteDialogOpen}
          onOpenChange={setNoteDialogOpen}
          selectedResult={selectedResult}
          noteText={noteText}
          onNoteTextChange={setNoteText}
          onSave={handleSaveNote}
          isSaving={addNoteMutation.isPending}
        />
      </div>
    </div>
  );
};

export default ScreeningResults; 