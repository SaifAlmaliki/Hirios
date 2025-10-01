import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateInterviewSchedule } from '@/hooks/useInterviewScheduling';
import { Calendar as CalendarIcon, Clock, Users, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface InterviewSchedulingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  jobId: string;
  candidateName: string;
}

interface TimeRange {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
}

interface Participant {
  id: string;
  email: string;
  name: string;
  timezone: string;
}

const DURATION_OPTIONS = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

const InterviewSchedulingDialog: React.FC<InterviewSchedulingDialogProps> = ({
  isOpen,
  onClose,
  applicationId,
  jobId,
  candidateName,
}) => {
  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState('60');
  const [timezone, setTimezone] = useState('UTC');
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  // Time range form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  
  // Participant form state
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantName, setParticipantName] = useState('');

  const createScheduleMutation = useCreateInterviewSchedule();

  const handleAddTimeRange = () => {
    if (!selectedDate || !startTime || !endTime) return;

    const newRange: TimeRange = {
      id: Math.random().toString(),
      date: selectedDate,
      startTime,
      endTime,
    };

    setTimeRanges([...timeRanges, newRange]);
    setStartTime('09:00');
    setEndTime('17:00');
  };

  const handleRemoveTimeRange = (id: string) => {
    setTimeRanges(timeRanges.filter(r => r.id !== id));
  };

  const handleAddParticipant = () => {
    if (!participantEmail || !participantName) return;

    const newParticipant: Participant = {
      id: Math.random().toString(),
      email: participantEmail,
      name: participantName,
      timezone: timezone, // Use the timezone from Step 1
    };

    setParticipants([...participants, newParticipant]);
    setParticipantEmail('');
    setParticipantName('');
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const handleSubmit = async () => {
    const timeRangesData = timeRanges.map(range => {
      const [startHour, startMin] = range.startTime.split(':');
      const [endHour, endMin] = range.endTime.split(':');
      
      // Create dates in local time (which matches the recruiter's selection)
      const start = new Date(range.date);
      start.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
      
      const end = new Date(range.date);
      end.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
      
      console.log('📅 Time range created:', {
        date: range.date,
        startTime: range.startTime,
        endTime: range.endTime,
        startISO: start.toISOString(),
        endISO: end.toISOString(),
        localStart: start.toString(),
        localEnd: end.toString()
      });
      
      return { start, end };
    });

    await createScheduleMutation.mutateAsync({
      application_id: applicationId,
      job_id: jobId,
      interview_duration_minutes: parseInt(duration),
      timezone,
      time_ranges: timeRangesData,
      participants: participants.map(p => ({
        email: p.email,
        name: p.name,
        timezone: p.timezone,
      })),
    });

    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setDuration('60');
    setTimezone('UTC');
    setTimeRanges([]);
    setParticipants([]);
    setSelectedDate(new Date());
    setStartTime('09:00');
    setEndTime('17:00');
    setParticipantEmail('');
    setParticipantName('');
    onClose();
  };

  const canProceedToStep2 = duration && timezone;
  const canProceedToStep3 = timeRanges.length > 0;
  const canProceedToStep4 = participants.length > 0;
  const canSubmit = canProceedToStep4;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview for {candidateName}</DialogTitle>
          <DialogDescription>
            Step {step} of 4: {
              step === 1 ? 'Interview Configuration' :
              step === 2 ? 'Select Time Slots' :
              step === 3 ? 'Add Participants' :
              'Review & Send'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Interview Configuration */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Interview Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Your Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-900">
                  The system will automatically split your time ranges into {duration}-minute slots.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Select Time Slots */}
          {step === 2 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end-time">End Time</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>

                      <Button
                        onClick={handleAddTimeRange}
                        disabled={!selectedDate || !startTime || !endTime}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Range
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {timeRanges.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Time Ranges ({timeRanges.length})</Label>
                  <div className="space-y-2">
                    {timeRanges.map(range => (
                      <div
                        key={range.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {format(range.date, 'MMM dd, yyyy')} • {range.startTime} - {range.endTime}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTimeRange(range.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Add Participants */}
          {step === 3 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="participant-name">Participant Name</Label>
                    <Input
                      id="participant-name"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="participant-email">Email Address</Label>
                    <Input
                      id="participant-email"
                      type="email"
                      value={participantEmail}
                      onChange={(e) => setParticipantEmail(e.target.value)}
                      placeholder="john@company.com"
                    />
                  </div>

                  <Button
                    onClick={handleAddParticipant}
                    disabled={!participantEmail || !participantName}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Participant
                  </Button>
                </CardContent>
              </Card>

              {participants.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Participants ({participants.length})</Label>
                  <div className="space-y-2">
                    {participants.map(participant => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-gray-600">{participant.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveParticipant(participant.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    All participants will use timezone: {timezone}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Send */}
          {step === 4 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Interview Configuration</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span>Duration:</span>
                        <Badge variant="secondary">{duration} minutes</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Timezone:</span>
                        <Badge variant="secondary">{timezone}</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Time Ranges ({timeRanges.length})</h3>
                    <div className="space-y-1">
                      {timeRanges.map(range => (
                        <div key={range.id} className="text-sm text-gray-600">
                          • {format(range.date, 'MMM dd, yyyy')} • {range.startTime} - {range.endTime}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Participants ({participants.length})</h3>
                    <div className="space-y-1">
                      {participants.map(participant => (
                        <div key={participant.id} className="text-sm text-gray-600">
                          • {participant.name} ({participant.email})
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-4 bg-green-50 rounded-lg">
                    <Users className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-900">
                      <p className="font-medium">Ready to send!</p>
                      <p className="mt-1">
                        All participants will receive an email with a link to vote on their availability.
                        They will also be added as collaborators on this job.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
            >
              {step > 1 ? (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </>
              ) : (
                'Cancel'
              )}
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedToStep2) ||
                  (step === 2 && !canProceedToStep3) ||
                  (step === 3 && !canProceedToStep4)
                }
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || createScheduleMutation.isPending}
              >
                {createScheduleMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Invitations'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewSchedulingDialog;
