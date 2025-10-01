import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useParticipantByToken, useSubmitAvailability } from '@/hooks/useInterviewScheduling';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const InterviewVote: React.FC = () => {
  const { voteToken } = useParams<{ voteToken: string }>();
  const { data: participantData, isLoading, error } = useParticipantByToken(voteToken || '');
  const submitAvailabilityMutation = useSubmitAvailability();
  
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (participantData?.votes) {
      const existingVotes = new Set(
        participantData.votes.map((v: any) => v.interview_time_slot_id)
      );
      setSelectedSlots(existingVotes);
      setHasSubmitted(participantData.has_responded);
    }
  }, [participantData]);

  const handleToggleSlot = (slotId: string) => {
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(slotId)) {
      newSelected.delete(slotId);
    } else {
      newSelected.add(slotId);
    }
    setSelectedSlots(newSelected);
  };

  const handleSubmit = async () => {
    if (!participantData) return;

    await submitAvailabilityMutation.mutateAsync({
      participantId: participantData.id,
      voteToken: voteToken || '',
      selectedSlotIds: Array.from(selectedSlots),
    });

    setHasSubmitted(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (error || !participantData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Link</CardTitle>
            <CardDescription>
              This interview scheduling link is invalid or has expired.
              Please contact the recruiter for a new link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const schedule = participantData.interview_schedule;
  const timeSlots = schedule?.time_slots || [];

  // Group slots by date
  const slotsByDate = timeSlots.reduce((acc: any, slot: any) => {
    const date = format(new Date(slot.start_time), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-center">Thank You!</CardTitle>
            <CardDescription className="text-center">
              Your availability has been submitted successfully.
              The recruiter will review all responses and confirm the final interview time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Selected Slots:</strong> {selectedSlots.size}</p>
              <p>You will receive an email once the interview time is confirmed.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              Interview Availability Request
            </CardTitle>
            <CardDescription>
              Please select all time slots when you are available for this interview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Participant</p>
                  <p className="text-sm text-gray-600">{participantData.name}</p>
                  <p className="text-xs text-gray-500">{participantData.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Interview Duration</p>
                  <p className="text-sm text-gray-600">
                    {schedule?.interview_duration_minutes} minutes
                  </p>
                  <p className="text-xs text-gray-500">Timezone: {participantData.timezone}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-900">
                <p className="font-medium">Instructions:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Select all time slots when you are available</li>
                  <li>You can select multiple slots</li>
                  <li>The system will find the best time that works for everyone</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <div className="space-y-4">
          {Object.entries(slotsByDate).map(([date, slots]: [string, any]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slots.map((slot: any) => {
                    const isSelected = selectedSlots.has(slot.id);
                    const startTime = new Date(slot.start_time);
                    const endTime = new Date(slot.end_time);

                    return (
                      <div
                        key={slot.id}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                          }
                        `}
                        onClick={() => handleToggleSlot(slot.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSlot(slot.id)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>Selected:</span>
                  <Badge variant="secondary">{selectedSlots.size} slots</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedSlots.size === 0
                    ? 'Please select at least one time slot'
                    : 'You can change your selection anytime before submitting'}
                </p>
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={selectedSlots.size === 0 || submitAvailabilityMutation.isPending}
                size="lg"
              >
                {submitAvailabilityMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Availability'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewVote;
