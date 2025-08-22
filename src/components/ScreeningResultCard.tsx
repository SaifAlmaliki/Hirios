import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';
import { ScreeningResult } from '@/hooks/useScreeningResults';
import ScreeningResultHeader from './ScreeningResultHeader';
import ScreeningResultActions from './ScreeningResultActions';
import ScreeningResultProgress from './ScreeningResultProgress';
import ScreeningResultAnalysis from './ScreeningResultAnalysis';

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
  const isExpanded = expandedRows.has(result.id);
  const isRequestingInterview = requestingInterview === result.id;
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }
    navigate(`/screening-results/${result.id}`);
  };

  return (
    <Card 
      className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-50"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-6">
        {/* Mobile-first responsive layout */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:justify-between lg:items-start lg:gap-6">
          <ScreeningResultHeader
            firstName={result.first_name}
            lastName={result.last_name}
            email={result.email}
            jobTitle={result.job?.title}
            createdAt={result.created_at}
            phone={result.phone}
            overallFit={result.overall_fit || 0}
          />

          <ScreeningResultActions
            resultId={result.id}
            applicationId={result.application_id}
            resumeUrl={result.resume_url}
            isRequestingInterview={isRequestingInterview}
            isVoiceScreeningRequested={result.voice_screening_requested || false}
            isExpanded={isExpanded}
            onRequestVoiceScreening={() => onRequestVoiceScreening(result)}
            onToggleExpansion={() => onToggleExpansion(result.id)}
            showViewDetails={false}
          />
        </div>

        <ScreeningResultProgress score={result.overall_fit || 0} />
      </CardHeader>

      <Collapsible open={isExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-6">
            <ScreeningResultAnalysis
              strengths={result.strengths}
              weaknesses={result.weaknesses}
              riskFactor={result.risk_factor}
              rewardFactor={result.reward_factor}
              justification={result.justification}
              interviewSummary={result.interview_summary}
              interviewCompletedAt={result.interview_completed_at}
              voiceScreeningRequested={result.voice_screening_requested}
              notes={result.notes}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ScreeningResultCard; 