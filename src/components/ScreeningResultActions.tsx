import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Mic,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { VoiceInterviewService } from '@/services/voiceInterviewService';

interface ScreeningResultActionsProps {
  resultId: string;
  applicationId?: string;  // Add applicationId prop
  resumeUrl?: string;
  isRequestingInterview: boolean;
  isVoiceScreeningRequested: boolean;
  isExpanded: boolean;
  onRequestVoiceScreening: () => void;
  onToggleExpansion: () => void;
  showViewDetails?: boolean; // Optional prop to show/hide view details button
}

const ScreeningResultActions: React.FC<ScreeningResultActionsProps> = ({
  resultId,
  applicationId,  // Add to destructuring
  resumeUrl,
  isRequestingInterview,
  isVoiceScreeningRequested,
  isExpanded,
  onRequestVoiceScreening,
  onToggleExpansion,
  showViewDetails = true
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center gap-3 w-full lg:w-96 lg:justify-end">
      {/* Resume Button - Responsive width */}
      <div className="w-20 sm:w-24">
        {resumeUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(resumeUrl, '_blank')}
            className="flex items-center gap-2 border-green-300 text-green-600 hover:bg-green-50 text-xs sm:text-sm h-9 px-3 w-full"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden xs:inline">Resume</span>
            <span className="xs:hidden">CV</span>
          </Button>
        )}
      </div>
      
      {/* Voice Interview Button - Responsive width */}
      <div className="w-28 sm:w-32 lg:w-36">
        <Button
          variant="outline"
          size="sm"
          onClick={onRequestVoiceScreening}
          disabled={isRequestingInterview || isVoiceScreeningRequested}
          className={`flex items-center gap-2 text-xs sm:text-sm h-9 px-3 w-full ${
            isVoiceScreeningRequested 
              ? 'border-green-300 text-green-600 hover:bg-green-50' 
              : 'border-blue-300 text-blue-600 hover:bg-blue-50'
          }`}
        >
          {isRequestingInterview ? (
            <>
              <Mic className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Sending...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : isVoiceScreeningRequested ? (
            <>
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Interview Sent</span>
              <span className="sm:hidden">Sent</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span className="hidden xs:inline">Send Interview</span>
              <span className="xs:hidden">Send</span>
            </>
          )}
        </Button>
      </div>

      {/* Direct Interview Link - Responsive width */}
      <div className="w-20 sm:w-24 lg:w-28">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const link = VoiceInterviewService.generateInterviewLink(resultId, applicationId || '', true);
            VoiceInterviewService.copyInterviewLink(resultId, applicationId || '', true);
            toast({
              title: "Interview Link Copied",
              description: "Direct interview link copied to clipboard (auto-start enabled)",
            });
          }}
          className="flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50 text-xs sm:text-sm h-9 px-3 w-full"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden xs:inline">Copy Link</span>
          <span className="xs:hidden">Link</span>
        </Button>
      </div>

      {/* View Details Button - Only show if enabled */}
      {showViewDetails && (
        <div className="w-20 sm:w-24 lg:w-28">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/screening-results/${resultId}`)}
            className="flex items-center gap-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 text-xs sm:text-sm h-9 px-3 w-full"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden xs:inline">View</span>
            <span className="xs:hidden">View</span>
          </Button>
        </div>
      )}
      
      {/* Details Toggle - Responsive width */}
      <div className="w-16 sm:w-20 lg:w-24">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpansion}
          className="flex items-center gap-2 text-xs sm:text-sm h-9 px-3 w-full text-gray-600 hover:text-gray-900"
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
    </div>
  );
};

export default ScreeningResultActions; 