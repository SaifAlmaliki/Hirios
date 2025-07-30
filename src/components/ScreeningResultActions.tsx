import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Mic,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VoiceInterviewService } from '@/services/voiceInterviewService';

interface ScreeningResultActionsProps {
  resultId: string;
  resumeUrl?: string;
  isRequestingInterview: boolean;
  isVoiceScreeningRequested: boolean;
  isExpanded: boolean;
  onRequestVoiceScreening: () => void;
  onToggleExpansion: () => void;
}

const ScreeningResultActions: React.FC<ScreeningResultActionsProps> = ({
  resultId,
  resumeUrl,
  isRequestingInterview,
  isVoiceScreeningRequested,
  isExpanded,
  onRequestVoiceScreening,
  onToggleExpansion
}) => {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {resumeUrl && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(resumeUrl, '_blank')}
          className="flex items-center gap-2 border-green-300 text-green-600 hover:bg-green-50 text-xs sm:text-sm min-w-0 shrink-0 h-9 px-3"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden xs:inline">Resume</span>
          <span className="xs:hidden">CV</span>
        </Button>
      )}
      
      {/* Voice Agent Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRequestVoiceScreening}
        disabled={isRequestingInterview || isVoiceScreeningRequested}
        className={`flex items-center gap-2 text-xs sm:text-sm min-w-0 shrink-0 h-9 px-3 ${
          isVoiceScreeningRequested 
            ? 'border-green-300 text-green-600 hover:bg-green-50' 
            : 'border-blue-300 text-blue-600 hover:bg-blue-50'
        }`}
      >
        {isRequestingInterview ? (
          <>
            <Mic className="h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">Requesting...</span>
            <span className="sm:hidden">...</span>
          </>
        ) : isVoiceScreeningRequested ? (
          <>
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Interview Requested</span>
            <span className="sm:hidden">Requested</span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
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
          const link = VoiceInterviewService.generateInterviewLink(resultId, true);
          VoiceInterviewService.copyInterviewLink(resultId, true);
          toast({
            title: "Interview Link Copied",
            description: "Direct interview link copied to clipboard (auto-start enabled)",
          });
        }}
        className="flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50 text-xs sm:text-sm min-w-0 shrink-0 h-9 px-3"
      >
        <ExternalLink className="h-4 w-4" />
        <span className="hidden xs:inline">Copy Link</span>
        <span className="xs:hidden">Link</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleExpansion}
        className="flex items-center gap-2 text-xs sm:text-sm min-w-0 shrink-0 h-9 px-3 text-gray-600 hover:text-gray-900"
      >
        {isExpanded ? (
          <>
            <span className="hidden xs:inline">Less</span>
            <ChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            <span className="hidden xs:inline">Details</span>
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default ScreeningResultActions; 