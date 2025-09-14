import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { VoiceInterviewService } from '@/services/voiceInterviewService';
import { useUpdateFavoriteStatus, useUpdateDismissStatus } from '@/hooks/useScreeningResults';
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
    try {
      // Extract file path from URL
      const url = new URL(resumeUrl!);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === 'company_uploads');
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        
        // Generate fresh signed URL
        const { data, error } = await supabase.storage
          .from('company_uploads')
          .createSignedUrl(filePath, 3600); // 1 hour expiry
        
        if (error) {
          console.error('Error generating signed URL:', error);
          window.open(resumeUrl, '_blank'); // Fallback to original URL
        } else {
          window.open(data.signedUrl, '_blank');
        }
      } else {
        window.open(resumeUrl, '_blank'); // Fallback for other URL formats
      }
    } catch (error) {
      console.error('Error handling resume download:', error);
      window.open(resumeUrl, '_blank'); // Fallback
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
    <div className="flex flex-wrap items-center gap-3 w-full lg:w-96 lg:justify-end">
      {/* CV Button */}
      <CVButton
        resumeUrl={resumeUrl}
        onDownload={handleResumeDownload}
      />
      
      {/* Invite Button */}
      <InviteButton
        isRequestingInterview={isRequestingInterview}
        isVoiceScreeningRequested={isVoiceScreeningRequested}
        onClick={() => setShowConfirmDialog(true)}
      />

      {/* Link Button */}
      <LinkButton
        onClick={handleLinkCopy}
      />

      {/* View Details Button - Only show if enabled */}
      {showViewDetails && (
        <ViewDetailsButton
          onClick={handleViewDetails}
        />
      )}

      {/* Favorite Button */}
      <FavoriteButton
        isFavorite={isFavorite}
        isPending={updateFavoriteMutation.isPending}
        onClick={handleFavoriteToggle}
      />

      {/* Dismiss Button */}
      <DismissButton
        isDismissed={isDismissed}
        isPending={updateDismissMutation.isPending}
        onClick={handleDismissToggle}
      />
      
      {/* Details Toggle */}
      <DetailsToggleButton
        isExpanded={isExpanded}
        onClick={onToggleExpansion}
      />

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