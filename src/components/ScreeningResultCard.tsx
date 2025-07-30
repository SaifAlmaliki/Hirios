import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { useToast } from '@/hooks/use-toast';
import { ScreeningResult } from '@/hooks/useScreeningResults';
import { VoiceInterviewService } from '@/services/voiceInterviewService';

interface ScreeningResultCardProps {
  result: ScreeningResult;
  requestingInterview: string | null;
  onRequestVoiceScreening: (result: ScreeningResult) => void;
  expandedRows: Set<string>;
  onToggleExpansion: (id: string) => void;
}

const ScreeningResultCard: React.FC<ScreeningResultCardProps> = ({
  result,
  requestingInterview,
  onRequestVoiceScreening,
  expandedRows,
  onToggleExpansion
}) => {
  const { toast } = useToast();

  // Helper functions
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

  return (
    <Card className="border-l-4 border-l-blue-500">
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

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {result.resume_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(result.resume_url, '_blank')}
                className="flex items-center gap-1 border-green-300 text-green-600 hover:bg-green-50 text-xs sm:text-sm min-w-0 shrink-0"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Resume</span>
                <span className="xs:hidden">CV</span>
              </Button>
            )}
            
            {/* Voice Agent Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRequestVoiceScreening(result)}
              disabled={requestingInterview !== null || result.voice_screening_requested}
              className={`flex items-center gap-1 text-xs sm:text-sm min-w-0 shrink-0 ${
                result.voice_screening_requested 
                  ? 'border-green-300 text-green-600 hover:bg-green-50' 
                  : 'border-blue-300 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {requestingInterview === result.id ? (
                <>
                  <Mic className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="hidden sm:inline">Requesting...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : result.voice_screening_requested ? (
                <>
                  <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Interview Requested</span>
                  <span className="sm:hidden">Requested</span>
                </>
              ) : (
                <>
                  <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Voice Agent</span>
                  <span className="xs:hidden">Voice</span>
                </>
              )}
            </Button>

            {/* Direct Interview Link */}
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
              className="flex items-center gap-1 border-purple-300 text-purple-600 hover:bg-purple-50 text-xs sm:text-sm min-w-0 shrink-0"
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Copy Link</span>
              <span className="xs:hidden">Link</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpansion(result.id)}
              className="flex items-center gap-1 text-xs sm:text-sm min-w-0 shrink-0"
            >
              {expandedRows.has(result.id) ? (
                <>
                  <span className="hidden xs:inline">Less</span>
                  <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                </>
              ) : (
                <>
                  <span className="hidden xs:inline">Details</span>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
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
  );
};

export default ScreeningResultCard; 