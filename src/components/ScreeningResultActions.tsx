import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { VoiceInterviewService } from '@/services/voiceInterviewService';
import { useUpdateFavoriteStatus, useUpdateDismissStatus } from '@/hooks/useScreeningResults';
import { downloadResume } from '@/lib/resumeUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CVButton,
  InviteButton,
  LinkButton,
  FavoriteButton,
  DismissButton,
  ViewDetailsButton,
  DetailsToggleButton
} from '@/components/ui/screening-action-buttons';

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
  isFavorite?: boolean;      // Add favorite status
  isDismissed?: boolean;     // Add dismiss status
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
  showViewDetails = true,
  isFavorite = false,
  isDismissed = false
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Add mutation hooks
  const updateFavoriteMutation = useUpdateFavoriteStatus();
  const updateDismissMutation = useUpdateDismissStatus();

  const handleResumeDownload = async () => {
    if (resumeUrl) {
      await downloadResume(resumeUrl);
    }
  };

  const handleLinkCopy = () => {
    const link = VoiceInterviewService.generateInterviewLink(resultId, applicationId || '', true);
    VoiceInterviewService.copyInterviewLink(resultId, applicationId || '', true);
    toast({
      title: "Interview Link Copied",
      description: "Direct interview link copied to clipboard (auto-start enabled)",
    });
  };

  const handleFavoriteToggle = () => {
    updateFavoriteMutation.mutate({ 
      id: resultId, 
      is_favorite: !isFavorite 
    });
  };

  const handleDismissToggle = () => {
    updateDismissMutation.mutate({ 
      id: resultId, 
      is_dismissed: !isDismissed 
    });
  };

  const handleViewDetails = () => {
    navigate(`/screening-results/${resultId}`);
  };

  return (
    <div className="w-full lg:w-96 lg:justify-end">
      {/* Button Grid - Two rows with 3 buttons each */}
      <div className="grid grid-cols-3 gap-3 items-center">
        {/* First Row */}
        <CVButton
          resumeUrl={resumeUrl}
          onDownload={handleResumeDownload}
        />
        
        <InviteButton
          isRequestingInterview={isRequestingInterview}
          isVoiceScreeningRequested={isVoiceScreeningRequested}
          onClick={() => setShowConfirmDialog(true)}
        />

        <LinkButton
          onClick={handleLinkCopy}
        />

        {/* Second Row */}
        {showViewDetails && (
          <ViewDetailsButton
            onClick={handleViewDetails}
          />
        )}

        <FavoriteButton
          isFavorite={isFavorite}
          isPending={updateFavoriteMutation.isPending}
          onClick={handleFavoriteToggle}
        />

        <DismissButton
          isDismissed={isDismissed}
          isPending={updateDismissMutation.isPending}
          onClick={handleDismissToggle}
        />
        
        {/* Details Toggle - Always in second row */}
        <DetailsToggleButton
          isExpanded={isExpanded}
          onClick={onToggleExpansion}
        />
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send AI Voice Interview Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to send an email to the candidate with a link for an AI voice interview. 
              The candidate will receive an email invitation to complete the voice interview process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onRequestVoiceScreening}>
              Send Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScreeningResultActions; 