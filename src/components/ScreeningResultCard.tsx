import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { ScreeningResult } from '@/hooks/useScreeningResults';
import ScreeningResultHeader from './ScreeningResultHeader';
import ScreeningResultActions from './ScreeningResultActions';
import ScreeningResultAnalysis from './ScreeningResultAnalysis';
import InterviewSchedulingDialog from './InterviewSchedulingDialog';

interface ScreeningResultCardProps {
  result: ScreeningResult;
  requestingInterview: string | null;
  onRequestVoiceScreening: (result: ScreeningResult) => void;
  expandedRows: Set<string>;
  onToggleExpansion: (id: string) => void;
  isSelected?: boolean;
  onSelectionChange?: (id: string, selected: boolean) => void;
  showCheckbox?: boolean;
}

const ScreeningResultCard: React.FC<ScreeningResultCardProps> = ({
  result,
  requestingInterview,
  onRequestVoiceScreening,
  expandedRows,
  onToggleExpansion,
  isSelected = false,
  onSelectionChange,
  showCheckbox = false
}) => {
  const [showSchedulingDialog, setShowSchedulingDialog] = useState(false);
  const isExpanded = expandedRows.has(result.id);
  const isRequestingInterview = requestingInterview === result.id;
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]') || target.closest('[data-checkbox]')) {
      return;
    }
    navigate(`/screening-results/${result.id}`);
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(result.id, checked);
    }
  };

  return (
    <>
    <Card 
      className={`border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
        result.is_rejected 
          ? 'border-l-red-500 bg-gray-50 opacity-75 hover:bg-gray-100' 
          : result.is_favorite 
            ? 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
            : 'border-l-blue-500 hover:bg-gray-50'
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-6">
        {/* Mobile-first responsive layout */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:justify-between lg:items-start lg:gap-6">
          <div className="flex items-start gap-3 flex-1">
            {showCheckbox && onSelectionChange && (
              <div className="pt-1" data-checkbox onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleCheckboxChange}
                  aria-label={`Select ${result.first_name} ${result.last_name}`}
                />
              </div>
            )}
            <div className="flex-1">
              <ScreeningResultHeader
                firstName={result.first_name}
                lastName={result.last_name}
                email={result.email}
                jobTitle={result.job?.title}
                createdAt={result.created_at}
                phone={result.phone}
                homeAddress={result.home_address}
                overallFit={result.overall_fit || 0}
                skills={result.skills}
                status={result.status}
              />
            </div>
          </div>

          <ScreeningResultActions
            resultId={result.id}
            applicationId={result.application_id}
            resumePoolId={result.resume_pool_id}
            jobId={result.job_id}
            isRequestingInterview={isRequestingInterview}
            isVoiceScreeningRequested={result.voice_screening_requested || false}
            isExpanded={isExpanded}
            onRequestVoiceScreening={() => onRequestVoiceScreening(result)}
            onToggleExpansion={() => onToggleExpansion(result.id)}
            showViewDetails={false}
            isFavorite={result.is_favorite || false}
            isRejected={result.is_rejected || false}
            candidateName={`${result.first_name} ${result.last_name}`}
            candidateEmail={result.email}
            jobTitle={result.job?.title || ''}
            companyName={result.job?.company || ''}
            onScheduleInterview={() => setShowSchedulingDialog(true)}
          />
        </div>
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
              resultId={result.id}
              candidateName={`${result.first_name} ${result.last_name}`}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>

    {/* Interview Scheduling Dialog - Rendered outside Card to prevent click propagation */}
    {result.application_id && result.job_id && (
      <InterviewSchedulingDialog
        isOpen={showSchedulingDialog}
        onClose={() => setShowSchedulingDialog(false)}
        applicationId={result.application_id}
        jobId={result.job_id}
        candidateName={`${result.first_name} ${result.last_name}`}
      />
    )}
    </>
  );
};

export default ScreeningResultCard; 