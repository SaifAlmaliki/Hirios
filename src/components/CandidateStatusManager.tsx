import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Plus, 
  History, 
  User, 
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  useCandidateStatus, 
  useCandidateComments, 
  useUpdateCandidateStatus, 
  useAddCandidateComment,
  CandidateStatus 
} from '@/hooks/useCandidateStatus';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { format } from 'date-fns';

interface CandidateStatusManagerProps {
  resumePoolId: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  trigger?: React.ReactNode;
}

export const CandidateStatusManager: React.FC<CandidateStatusManagerProps> = ({
  resumePoolId,
  jobId,
  candidateName,
  candidateEmail,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  // Fetch current status and comments
  const { data: currentStatus, isLoading: statusLoading } = useCandidateStatus(resumePoolId, jobId);
  const { data: comments, isLoading: commentsLoading } = useCandidateComments(resumePoolId, jobId);

  // Mutations
  const updateStatusMutation = useUpdateCandidateStatus();
  const addCommentMutation = useAddCandidateComment();

  const handleStatusChange = (newStatus: CandidateStatus) => {
    updateStatusMutation.mutate({
      resumePoolId,
      jobId,
      status: newStatus,
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

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <User className="h-4 w-4" />
      Manage Status
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Candidate Status Management
          </DialogTitle>
          <DialogDescription>
            Manage status and comments for {candidateName} ({candidateEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <div className="text-sm text-gray-500">Loading status...</div>
              ) : (
                <div className="flex items-center gap-3">
                  {currentStatus ? (
                    <StatusBadge status={currentStatus.status} />
                  ) : (
                    <Badge variant="secondary">No Status Set</Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {currentStatus ? `Updated ${format(new Date(currentStatus.updated_at), 'MMM dd, yyyy')}` : 'Not set'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Select
                  value={currentStatus?.status || 'pending'}
                  onValueChange={handleStatusChange}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger>
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
                {updateStatusMutation.isPending && (
                  <div className="text-sm text-blue-600">Updating status...</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                  {comments && comments.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {comments.length}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-1"
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
            </CardHeader>
            <CardContent>
              {/* Add New Comment */}
              <div className="space-y-3 mb-4">
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
                    <div className="space-y-3 max-h-60 overflow-y-auto">
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
                    <div className="text-sm text-gray-500 text-center py-4">
                      No comments yet. Add the first comment above.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateStatusManager;
