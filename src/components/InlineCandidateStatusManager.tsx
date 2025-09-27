import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Plus, 
  History, 
  User, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit3,
  Gift,
  FileText
} from 'lucide-react';
import { 
  useCandidateStatus, 
  useCandidateComments, 
  useUpdateCandidateStatus, 
  useAddCandidateComment,
  CandidateStatus 
} from '@/hooks/useCandidateStatus';
import { useJobOffer } from '@/hooks/useJobOffers';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { JobOfferWizard } from '@/components/JobOfferWizard';
import { format } from 'date-fns';

interface InlineCandidateStatusManagerProps {
  resumePoolId: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  logoUrl?: string;
}

export const InlineCandidateStatusManager: React.FC<InlineCandidateStatusManagerProps> = ({
  resumePoolId,
  jobId,
  candidateName,
  candidateEmail,
  jobTitle,
  companyName,
  companyAddress,
  companyPhone,
  logoUrl
}) => {
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [showOfferWizard, setShowOfferWizard] = useState(false);

  // Fetch current status and comments
  const { data: currentStatus, isLoading: statusLoading } = useCandidateStatus(resumePoolId, jobId);
  const { data: comments, isLoading: commentsLoading } = useCandidateComments(resumePoolId, jobId);
  const { data: jobOffer } = useJobOffer(resumePoolId, jobId);

  // Mutations
  const updateStatusMutation = useUpdateCandidateStatus();
  const addCommentMutation = useAddCandidateComment();

  const handleStatusChange = (newStatus: CandidateStatus) => {
    updateStatusMutation.mutate({
      resumePoolId,
      jobId,
      status: newStatus,
    }, {
      onSuccess: () => {
        setIsEditingStatus(false);
      }
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addCommentMutation.mutate({
      resumePoolId,
      jobId,
      comment: newComment.trim(),
    }, {
      onSuccess: () => {
        setNewComment('');
      }
    });
  };

  const statusOptions: { value: CandidateStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'screened', label: 'Screened' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'first_interview', label: 'First Interview' },
    { value: 'second_interview', label: 'Second Interview' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'offer_sent', label: 'Offer Sent' },
    { value: 'withdrawn', label: 'Withdrawn' },
  ];

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Candidate Status Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Current Status</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingStatus(!isEditingStatus)}
              className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              {isEditingStatus ? 'Cancel' : 'Edit'}
            </Button>
          </div>
          
          {statusLoading ? (
            <div className="text-sm text-gray-500">Loading status...</div>
          ) : (
            <div className="flex items-center gap-3">
              {isEditingStatus ? (
                <Select
                  value={currentStatus?.status || 'pending'}
                  onValueChange={handleStatusChange}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <StatusBadge status={(currentStatus?.status as CandidateStatus) || 'pending'} />
              )}
              <span className="text-sm text-gray-500">
                {currentStatus ? `Updated ${format(new Date(currentStatus.updated_at), 'MMM dd, yyyy')}` : 'Not set'}
              </span>
              {updateStatusMutation.isPending && (
                <span className="text-sm text-blue-600">Updating...</span>
              )}
            </div>
          )}
        </div>

        {/* Job Offer Section */}
        {currentStatus?.status === 'accepted' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Job Offer
              </h4>
            </div>

            {jobOffer ? (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant={jobOffer.offer_status === 'sent' ? 'default' : 'secondary'}>
                    {jobOffer.offer_status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {jobOffer.offer_status === 'sent' 
                      ? `Sent ${format(new Date(jobOffer.sent_at!), 'MMM dd, yyyy')}`
                      : `Created ${format(new Date(jobOffer.created_at), 'MMM dd, yyyy')}`
                    }
                  </span>
                </div>
                <div className="text-xs text-gray-700">
                  <p><strong>Salary:</strong> {jobOffer.salary_currency} {jobOffer.salary_amount.toLocaleString()}</p>
                  {jobOffer.bonus_amount && (
                    <p><strong>Bonus:</strong> {jobOffer.salary_currency} {jobOffer.bonus_amount.toLocaleString()}</p>
                  )}
                  <p><strong>Expires:</strong> {format(new Date(jobOffer.expiry_date), 'MMM dd, yyyy')}</p>
                </div>
                {jobOffer.pdf_file_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(jobOffer.pdf_file_url, '_blank')}
                    className="flex items-center gap-2 text-xs"
                  >
                    <FileText className="h-3 w-3" />
                    View PDF
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  This candidate has been accepted. Create a job offer to proceed.
                </p>
                <Button
                  onClick={() => setShowOfferWizard(true)}
                  size="sm"
                  className="flex items-center gap-2 text-xs"
                >
                  <Gift className="h-3 w-3" />
                  Create Offer
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Comments Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
              {comments && comments.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {comments.length}
                </Badge>
              )}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 h-8 px-2"
            >
              {showComments ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show
                </>
              )}
            </Button>
          </div>

          {/* Add New Comment */}
          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment about this candidate..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || addCommentMutation.isPending}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
            </Button>
          </div>

          {/* Comments History */}
          {showComments && (
            <div className="space-y-3">
              {commentsLoading ? (
                <div className="text-sm text-gray-500">Loading comments...</div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto border-t pt-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-gray-200 pl-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <History className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4 border-t">
                  No comments yet. Add the first comment above.
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Job Offer Wizard */}
      {showOfferWizard && (
        <JobOfferWizard
          isOpen={showOfferWizard}
          onClose={() => setShowOfferWizard(false)}
          resumePoolId={resumePoolId}
          jobId={jobId}
          candidateName={candidateName}
          candidateEmail={candidateEmail}
          jobTitle={jobTitle || 'Position'}
          companyName={companyName || 'Company'}
          companyAddress={companyAddress}
          companyPhone={companyPhone}
          logoUrl={logoUrl}
        />
      )}
    </Card>
  );
};

export default InlineCandidateStatusManager;
