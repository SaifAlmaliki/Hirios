import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { 
  User, 
  Mail, 
  Briefcase, 
  Calendar, 
  Mic, 
  FileText, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  StickyNote
} from 'lucide-react';
import { ScreeningResult } from '@/hooks/useScreeningResults';

interface ResultCardProps {
  result: ScreeningResult;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onRequestVoiceScreening: () => void;
  onAddNote: () => void;
  onCopyInterviewLink?: () => void;
  requestingInterview: boolean;
  isDevelopment?: boolean;
  className?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  isExpanded,
  onToggleExpansion,
  onRequestVoiceScreening,
  onAddNote,
  onCopyInterviewLink,
  requestingInterview,
  isDevelopment = false,
  className = ''
}) => {
  // Helper functions
  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreTextColor = (score: number) => {
    if (score > 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score > 70) return 'Excellent';
    if (score >= 40) return 'Good';
    return 'Poor';
  };

  return (
    <Card className={`border-l-4 border-l-blue-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="space-y-4">
          {/* Header with name and score */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center truncate">
                  <User className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                  <span className="truncate">{result.first_name} {result.last_name}</span>
                </h3>
                <Badge className={`${getScoreColor(result.overall_fit || 0)} border-0 flex-shrink-0 w-fit`}>
                  {result.overall_fit || 0}% - {getScoreLabel(result.overall_fit || 0)}
                </Badge>
              </div>
            </div>
            
            {/* Overall Fit Score - Desktop */}
            <div className="hidden lg:block text-right flex-shrink-0">
              <div className="text-sm text-gray-500 mb-1">Overall Fit Score</div>
              <div className={`text-2xl font-bold ${getScoreTextColor(result.overall_fit || 0)}`}>
                {result.overall_fit || 0}%
              </div>
            </div>
          </div>
          
          {/* Candidate Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-sm text-gray-600">
            <div className="flex items-center min-w-0">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate" title={result.email}>{result.email}</span>
            </div>
            <div className="flex items-center min-w-0">
              <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate" title={result.job?.title || 'No job linked'}>
                {result.job?.title || 'No job linked'}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{new Date(result.created_at).toLocaleDateString()}</span>
            </div>
            {result.phone && (
              <div className="flex items-center min-w-0">
                <Mic className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{result.phone}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="flex flex-wrap gap-2 flex-1">
              {result.resume_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(result.resume_url, '_blank')}
                  className="flex items-center gap-1 border-green-300 text-green-600 hover:bg-green-50 text-xs sm:text-sm"
                >
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Resume</span>
                </Button>
              )}
              
              {/* Voice Agent Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onRequestVoiceScreening}
                disabled={requestingInterview || result.voice_screening_requested}
                className={`flex items-center gap-1 text-xs sm:text-sm ${
                  result.voice_screening_requested 
                    ? 'border-green-300 text-green-600 hover:bg-green-50' 
                    : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {requestingInterview ? (
                  <>
                    <Mic className="h-4 w-4 animate-spin flex-shrink-0" />
                    <span className="hidden xs:inline">Requesting...</span>
                  </>
                ) : result.voice_screening_requested ? (
                  <>
                    <Mic className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden xs:inline">Interview Requested</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden xs:inline">Voice Agent</span>
                  </>
                )}
              </Button>

              {/* Development: Direct Interview Link */}
              {isDevelopment && onCopyInterviewLink && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopyInterviewLink}
                  className="flex items-center gap-1 border-purple-300 text-purple-600 hover:bg-purple-50 text-xs sm:text-sm"
                >
                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Copy Link</span>
                </Button>
              )}

              {/* Add Note Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onAddNote}
                className="flex items-center gap-1 border-orange-300 text-orange-600 hover:bg-orange-50 text-xs sm:text-sm"
              >
                <StickyNote className="h-4 w-4 flex-shrink-0" />
                <span className="hidden xs:inline">
                  {result.notes ? 'Edit Note' : 'Add Note'}
                </span>
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpansion}
              className="flex items-center gap-1 justify-center sm:justify-start text-xs sm:text-sm"
            >
              {isExpanded ? (
                <>
                  <span className="hidden xs:inline">Less</span>
                  <ChevronUp className="h-4 w-4 flex-shrink-0" />
                </>
              ) : (
                <>
                  <span className="hidden xs:inline">Details</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </>
              )}
            </Button>
          </div>
        </div>


      </CardHeader>

      <Collapsible open={isExpanded}>
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
  );
}; 