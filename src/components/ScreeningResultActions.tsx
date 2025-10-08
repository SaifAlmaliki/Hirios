import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { VoiceInterviewService } from '@/services/voiceInterviewService';
import { useUpdateFavoriteStatus, useRejectCandidate } from '@/hooks/useScreeningResults';
import { useDownloadResume } from '@/hooks/useDownload';
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
  RejectButton,
  ViewDetailsButton,
  DetailsToggleButton,
  ScheduleInterviewButton
} from '@/components/ui/screening-action-buttons';

interface ScreeningResultActionsProps {
  resultId: string;
  applicationId?: string;  // Add applicationId prop
  resumePoolId?: string;   // Add resumePoolId to fetch resume from resume_pool
  jobId?: string;          // Add jobId for interview scheduling
  isRequestingInterview: boolean;
  isVoiceScreeningRequested: boolean;
  isExpanded: boolean;
  onRequestVoiceScreening: () => void;
  onToggleExpansion: () => void;
  showViewDetails?: boolean; // Optional prop to show/hide view details button
  isFavorite?: boolean;      // Add favorite status
  isRejected?: boolean;      // Add rejected status
  candidateName?: string;    // Add candidate name for rejection
  candidateEmail?: string;   // Add candidate email for rejection
  jobTitle?: string;         // Add job title for rejection
  companyName?: string;      // Add company name for rejection
  onScheduleInterview?: () => void; // Add callback for schedule interview
}

const ScreeningResultActions: React.FC<ScreeningResultActionsProps> = ({
  resultId,
  applicationId,  // Add to destructuring
  resumePoolId,
  jobId,
  isRequestingInterview,
  isVoiceScreeningRequested,
  isExpanded,
  onRequestVoiceScreening,
  onToggleExpansion,
  showViewDetails = true,
  isFavorite = false,
  isRejected = false,
  candidateName = '',
  candidateEmail = '',
  jobTitle = '',
  companyName = '',
  onScheduleInterview
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [resumeData, setResumeData] = useState<{storage_path: string, original_filename: string} | null>(null);
  
  // Add mutation hooks
  const updateFavoriteMutation = useUpdateFavoriteStatus();
  const rejectCandidateMutation = useRejectCandidate();
  const downloadResumeMutation = useDownloadResume();

  // Fetch resume data from resume_pool
  React.useEffect(() => {
    const fetchResumeData = async () => {
      if (resumePoolId) {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase
          .from('resume_pool')
          .select('storage_path, original_filename')
          .eq('id', resumePoolId)
          .single();
        
        if (data?.storage_path) {
          setResumeData({
            storage_path: data.storage_path,
            original_filename: data.original_filename
          });
        }
      }
    };
    fetchResumeData();
  }, [resumePoolId]);

  const handleResumeDownload = async () => {
    if (resumeData) {
      downloadResumeMutation.mutate({
        storagePath: resumeData.storage_path,
        filename: resumeData.original_filename
      });
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


  const handleViewDetails = () => {
    navigate(`/screening-results/${resultId}`);
  };

  const handleRejectCandidate = () => {
    if (!candidateName || !candidateEmail || !jobTitle || !companyName) {
      toast({
        title: "Error",
        description: "Missing candidate information for rejection.",
        variant: "destructive",
      });
      return;
    }

    const [firstName, ...lastNameParts] = candidateName.split(' ');
    const lastName = lastNameParts.join(' ');

    rejectCandidateMutation.mutate({
      id: resultId,
      first_name: firstName,
      last_name: lastName,
      email: candidateEmail,
      job_title: jobTitle,
      company_name: companyName,
      application_id: applicationId,
      rejection_reason: 'Not a good fit for the position'
    });

    setShowRejectDialog(false);
  };

  return (
    <div className="w-full lg:w-96 lg:justify-end">
      {/* Button Grid - Responsive layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 items-center">
        {/* First Row */}
        <CVButton
          resumeUrl={resumeData?.storage_path}
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

        <RejectButton
          isRejected={isRejected}
          isPending={rejectCandidateMutation.isPending}
          onClick={() => setShowRejectDialog(true)}
        />
        
        {/* Third Row */}
        {onScheduleInterview && applicationId && jobId && (
          <ScheduleInterviewButton
            onClick={onScheduleInterview}
          />
        )}
        
        <DetailsToggleButton
          isExpanded={isExpanded}
          onClick={onToggleExpansion}
        />

        {/* Empty cells to maintain grid layout on larger screens */}
        <div className="hidden sm:block"></div>
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

      {/* Reject Candidate Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Candidate</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to reject this candidate and send them a rejection email. 
              This action will notify the candidate that they are not a good fit for the position.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectCandidate}>
              Reject Candidate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScreeningResultActions; 