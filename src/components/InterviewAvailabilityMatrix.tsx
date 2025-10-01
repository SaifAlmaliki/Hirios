import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useInterviewSchedule, useConfirmInterviewSlot, calculateBestSlots } from '@/hooks/useInterviewScheduling';
import { Calendar, Clock, Users, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface InterviewAvailabilityMatrixProps {
  applicationId: string;
}

const InterviewAvailabilityMatrix: React.FC<InterviewAvailabilityMatrixProps> = ({
  applicationId,
}) => {
  const { data: schedule, isLoading } = useInterviewSchedule(applicationId);
  const confirmSlotMutation = useConfirmInterviewSlot();
  
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading schedule...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!schedule) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No interview schedule created yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeSlots = schedule.time_slots || [];
  const participants = schedule.participants || [];
  const totalParticipants = participants.length;
  const respondedParticipants = participants.filter(p => p.has_responded).length;
  const allResponded = respondedParticipants === totalParticipants;

  const slotsWithVotes = calculateBestSlots(timeSlots, participants);
  const perfectMatches = slotsWithVotes.filter(s => s.vote_count === totalParticipants);
  const bestMatch = slotsWithVotes[0];

  const handleConfirmSlot = async () => {
    if (!selectedSlotId) return;

    await confirmSlotMutation.mutateAsync({
      scheduleId: schedule.id,
      slotId: selectedSlotId,
    });

    setShowConfirmDialog(false);
    setSelectedSlotId(null);
  };

  // Group slots by date
  const slotsByDate = slotsWithVotes.reduce((acc: any, slot: any) => {
    const date = format(new Date(slot.start_time), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  if (schedule.status === 'scheduled') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <CardTitle>Interview Scheduled</CardTitle>
          </div>
          <CardDescription>
            The interview has been confirmed and all participants have been notified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="font-medium text-green-900">Confirmed Time:</p>
            <p className="text-lg text-green-800 mt-1">
              {format(new Date(schedule.scheduled_start_time!), 'EEEE, MMMM dd, yyyy')}
            </p>
            <p className="text-lg text-green-800">
              {format(new Date(schedule.scheduled_start_time!), 'h:mm a')} - {format(new Date(schedule.scheduled_end_time!), 'h:mm a')}
            </p>
            <p className="text-sm text-green-700 mt-2">
              Duration: {schedule.interview_duration_minutes} minutes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Interview Scheduling Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Participants</p>
              <p className="text-2xl font-bold">{totalParticipants}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Responded</p>
              <p className="text-2xl font-bold">
                {respondedParticipants}
                <span className="text-sm text-gray-500 ml-2">
                  / {totalParticipants}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Perfect Matches</p>
              <p className="text-2xl font-bold text-green-600">{perfectMatches.length}</p>
            </div>
          </div>

          {!allResponded && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-900">
                <p className="font-medium">Waiting for responses</p>
                <p className="mt-1">
                  {totalParticipants - respondedParticipants} participant(s) haven't submitted their availability yet.
                </p>
              </div>
            </div>
          )}

          {allResponded && perfectMatches.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-medium">Perfect match found!</p>
                <p className="mt-1">
                  {perfectMatches.length} time slot(s) work for all participants.
                </p>
              </div>
            </div>
          )}

          {allResponded && perfectMatches.length === 0 && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-900">
                <p className="font-medium">No perfect match</p>
                <p className="mt-1">
                  No time slot works for all participants. Best match: {bestMatch?.vote_count || 0} out of {totalParticipants} participants.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {participants.map(participant => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{participant.name}</p>
                  <p className="text-sm text-gray-600">{participant.email}</p>
                  <p className="text-xs text-gray-500">{participant.timezone}</p>
                </div>
                <Badge variant={participant.has_responded ? 'default' : 'secondary'}>
                  {participant.has_responded ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Responded
                    </>
                  ) : (
                    'Pending'
                  )}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Availability Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Time Slot Availability</CardTitle>
          <CardDescription>
            Click on a time slot to confirm it as the final interview time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(slotsByDate).map(([date, slots]: [string, any]) => (
              <div key={date}>
                <h3 className="font-semibold mb-3">
                  {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                </h3>
                <div className="space-y-2">
                  {slots.map((slot: any) => {
                    const isPerfectMatch = slot.vote_count === totalParticipants;
                    const isBestMatch = slot.id === bestMatch?.id;
                    const startTime = new Date(slot.start_time);
                    const endTime = new Date(slot.end_time);

                    return (
                      <div
                        key={slot.id}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${isPerfectMatch
                            ? 'border-green-500 bg-green-50 hover:bg-green-100'
                            : isBestMatch && allResponded
                            ? 'border-orange-500 bg-orange-50 hover:bg-orange-100'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                          }
                        `}
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          setShowConfirmDialog(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">
                                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                              </p>
                              <p className="text-sm text-gray-600">
                                {slot.vote_count} / {totalParticipants} participants available
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isPerfectMatch && (
                              <Badge className="bg-green-600">Perfect Match</Badge>
                            )}
                            {isBestMatch && !isPerfectMatch && allResponded && (
                              <Badge className="bg-orange-600">Best Match</Badge>
                            )}
                            <Badge variant="outline">
                              {Math.round((slot.vote_count / totalParticipants) * 100)}%
                            </Badge>
                          </div>
                        </div>

                        {slot.voters && slot.voters.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-600">
                              Available: {slot.voters.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Interview Time</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm this time slot? All participants and the candidate will be notified.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSlotId && (
            <div className="p-4 bg-blue-50 rounded-lg">
              {(() => {
                const slot = slotsWithVotes.find(s => s.id === selectedSlotId);
                if (!slot) return null;
                const startTime = new Date(slot.start_time);
                const endTime = new Date(slot.end_time);
                
                return (
                  <>
                    <p className="font-medium text-blue-900">Selected Time:</p>
                    <p className="text-lg text-blue-800 mt-1">
                      {format(startTime, 'EEEE, MMMM dd, yyyy')}
                    </p>
                    <p className="text-lg text-blue-800">
                      {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                      {slot.vote_count} / {totalParticipants} participants available
                    </p>
                  </>
                );
              })()}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSlot}
              disabled={confirmSlotMutation.isPending}
            >
              {confirmSlotMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm & Notify'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterviewAvailabilityMatrix;
