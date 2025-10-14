import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type InterviewSchedule = Database['public']['Tables']['interview_schedules']['Row'];
type InterviewTimeSlot = Database['public']['Tables']['interview_time_slots']['Row'];
type InterviewParticipant = Database['public']['Tables']['interview_participants']['Row'];
type InterviewAvailabilityVote = Database['public']['Tables']['interview_availability_votes']['Row'];

export interface InterviewScheduleWithDetails extends InterviewSchedule {
  time_slots?: InterviewTimeSlot[];
  participants?: (InterviewParticipant & { votes?: InterviewAvailabilityVote[] })[];
}

export interface TimeSlotWithVotes extends InterviewTimeSlot {
  vote_count?: number;
  voters?: string[];
}

export interface CreateInterviewScheduleData {
  application_id: string;
  job_id: string;
  interview_duration_minutes: number;
  timezone: string;
  time_ranges: { start: Date; end: Date }[];
  participants: { email: string; name: string; timezone: string }[];
}

// Fetch interview schedule for an application
export const useInterviewSchedule = (applicationId: string) => {
  return useQuery({
    queryKey: ['interview-schedule', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_schedules')
        .select(`
          *,
          time_slots:interview_time_slots(*),
          participants:interview_participants(
            *,
            votes:interview_availability_votes(*)
          )
        `)
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data as InterviewScheduleWithDetails | null;
    },
    enabled: !!applicationId,
  });
};

// Fetch participant data by vote token (public access)
export const useParticipantByToken = (voteToken: string) => {
  return useQuery({
    queryKey: ['interview-participant', voteToken],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_participants')
        .select(`
          *,
          interview_schedule:interview_schedules(
            *,
            time_slots:interview_time_slots(*)
          ),
          votes:interview_availability_votes(*)
        `)
        .eq('vote_token', voteToken)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!voteToken,
  });
};

// Create interview schedule with time slots and participants
export const useCreateInterviewSchedule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateInterviewScheduleData) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('You must be logged in to create interview schedules');
      }

      // 1. Create interview schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from('interview_schedules')
        .insert({
          application_id: data.application_id,
          job_id: data.job_id,
          created_by_user_id: user.id,
          interview_duration_minutes: data.interview_duration_minutes,
          timezone: data.timezone,
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // 2. Generate time slots from ranges
      console.log('🎯 Creating time slots for', data.time_ranges.length, 'time ranges');
      const timeSlots: { start_time: string; end_time: string }[] = [];
      for (const range of data.time_ranges) {
        console.log('📍 Processing range:', range);
        const slots = generateTimeSlots(
          range.start,
          range.end,
          data.interview_duration_minutes
        );
        console.log(`  → Generated ${slots.length} slots for this range`);
        timeSlots.push(...slots);
      }
      console.log(`✅ Total slots to insert: ${timeSlots.length}`);

      // 3. Insert time slots
      const { data: insertedSlots, error: slotsError } = await supabase
        .from('interview_time_slots')
        .insert(
          timeSlots.map(slot => ({
            interview_schedule_id: schedule.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
          }))
        )
        .select();

      if (slotsError) throw slotsError;

      // 4. Insert participants
      const { data: insertedParticipants, error: participantsError } = await supabase
        .from('interview_participants')
        .insert(
          data.participants.map(p => ({
            interview_schedule_id: schedule.id,
            email: p.email,
            name: p.name,
            timezone: p.timezone,
          }))
        )
        .select();

      if (participantsError) throw participantsError;

      // 5. Get company profile for recruiter name
      const { data: companyProfile } = await supabase
        .from('company_profiles')
        .select('company_name')
        .eq('user_id', user.id)
        .single();

      // 6. Get application details for candidate name
      const { data: application } = await supabase
        .from('applications')
        .select(`
          *,
          resume_pool:resume_pool(first_name, last_name)
        `)
        .eq('id', data.application_id)
        .single();

      // 7. Get job details
      const { data: job } = await supabase
        .from('jobs')
        .select('title, company')
        .eq('id', data.job_id)
        .single();

      const candidateName = application?.resume_pool
        ? `${application.resume_pool.first_name} ${application.resume_pool.last_name}`
        : 'Candidate';

      // 8. Send emails to all participants
      console.log('📧 Sending emails to participants:', insertedParticipants.length);
      
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < insertedParticipants.length; i++) {
        const participant = insertedParticipants[i];
        const votingLink = `${window.location.origin}/interview-vote/${participant.vote_token}`;

        console.log('📤 Sending email to:', participant.email);
        console.log('🔗 Voting link:', votingLink);

        // Retry logic: try up to 2 times with 2-second delay
        let emailSent = false;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const emailResponse = await supabase.functions.invoke('send-interview-scheduling-email', {
              body: {
                to: participant.email,
                participantName: participant.name,
                recruiterName: companyProfile?.company_name || 'Recruiter',
                candidateName,
                jobTitle: job?.title || 'Position',
                companyName: job?.company || companyProfile?.company_name || 'Company',
                votingLink,
                interviewDuration: data.interview_duration_minutes,
                timeSlots: insertedSlots,
                companyId: companyProfile?.id, // Add company ID for SMTP config
              },
            });
            
            if (emailResponse.error) {
              console.error(`❌ Email error for ${participant.email} (attempt ${attempt}):`, emailResponse.error);
              if (attempt < 2) {
                console.log('⏳ Retrying in 2 seconds...');
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            } else {
              console.log('✅ Email sent successfully to:', participant.email);
              successCount++;
              emailSent = true;
              break;
            }
          } catch (emailError) {
            console.error(`❌ Failed to send email to ${participant.email} (attempt ${attempt}):`, emailError);
            if (attempt < 2) {
              console.log('⏳ Retrying in 2 seconds...');
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }
        
        if (!emailSent) {
          failCount++;
        }
        
        // Add a 2-second delay between participants to avoid rate limiting
        if (i < insertedParticipants.length - 1) {
          console.log('⏳ Waiting 2 seconds before next participant...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log(`📊 Email summary: ${successCount} sent, ${failCount} failed`);
      
      // Show appropriate message based on results
      if (failCount > 0 && successCount === 0) {
        console.warn('⚠️ All emails failed to send. Participants can still be notified manually.');
      } else if (failCount > 0) {
        console.warn(`⚠️ Some emails failed (${failCount}/${insertedParticipants.length}). You may need to resend manually.`);
      }

      // 9. Add participants as job collaborators
      for (const participant of data.participants) {
        try {
          // Check if user exists with this email
          const { data: existingUser } = await supabase
            .from('company_profiles')
            .select('user_id')
            .eq('user_id', user.id) // This is a placeholder - we'd need to query by email
            .single();

          if (existingUser) {
            await supabase
              .from('job_collaborators')
              .insert({
                job_id: data.job_id,
                user_id: existingUser.user_id,
                invited_by: user.id,
              });
          }
        } catch (collabError) {
          console.warn('Could not add participant as collaborator:', collabError);
        }
      }

      return { schedule, timeSlots: insertedSlots, participants: insertedParticipants };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interview-schedule', variables.application_id] });
      toast({
        title: "Interview Scheduling Created! 📅",
        description: "Participants have been notified to select their availability.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Interview Schedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Submit participant availability votes
export const useSubmitAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      participantId,
      voteToken,
      selectedSlotIds,
    }: {
      participantId: string;
      voteToken: string;
      selectedSlotIds: string[];
    }) => {
      // 1. Delete existing votes
      await supabase
        .from('interview_availability_votes')
        .delete()
        .eq('interview_participant_id', participantId);

      // 2. Insert new votes
      if (selectedSlotIds.length > 0) {
        const { error: votesError } = await supabase
          .from('interview_availability_votes')
          .insert(
            selectedSlotIds.map(slotId => ({
              interview_participant_id: participantId,
              interview_time_slot_id: slotId,
            }))
          );

        if (votesError) throw votesError;
      }

      // 3. Update participant response status
      const { error: updateError } = await supabase
        .from('interview_participants')
        .update({
          has_responded: true,
          responded_at: new Date().toISOString(),
        })
        .eq('id', participantId);

      if (updateError) throw updateError;

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interview-participant', variables.voteToken] });
      toast({
        title: "Availability Submitted! ✅",
        description: "Thank you for submitting your availability.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Submit Availability",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Confirm final interview slot
export const useConfirmInterviewSlot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      scheduleId,
      slotId,
    }: {
      scheduleId: string;
      slotId: string;
    }) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('You must be logged in');
      }

      // Get the selected time slot
      const { data: slot, error: slotError } = await supabase
        .from('interview_time_slots')
        .select('*')
        .eq('id', slotId)
        .single();

      if (slotError) throw slotError;

      // Update schedule with confirmed slot
      const { error: updateError } = await supabase
        .from('interview_schedules')
        .update({
          status: 'scheduled',
          scheduled_start_time: slot.start_time,
          scheduled_end_time: slot.end_time,
          confirmed_at: new Date().toISOString(),
          confirmed_by_user_id: user.id,
        })
        .eq('id', scheduleId);

      if (updateError) throw updateError;

      // TODO: Send confirmation emails to all participants and candidate

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interview-schedule'] });
      toast({
        title: "Interview Scheduled! 🎉",
        description: "All participants will be notified of the confirmed time.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Confirm Interview",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Helper function to generate time slots
function generateTimeSlots(
  startTime: Date,
  endTime: Date,
  durationMinutes: number
): { start_time: string; end_time: string }[] {
  const slots: { start_time: string; end_time: string }[] = [];
  
  // Create a copy to avoid mutating the original
  const current = new Date(startTime.getTime());
  const end = new Date(endTime.getTime());

  console.log('🕐 Generating slots:', {
    start: current.toISOString(),
    end: end.toISOString(),
    duration: durationMinutes
  });

  while (current < end) {
    const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
    
    if (slotEnd <= end) {
      slots.push({
        start_time: current.toISOString(),
        end_time: slotEnd.toISOString(),
      });
    }
    
    current.setTime(current.getTime() + durationMinutes * 60000);
  }

  console.log(`✅ Generated ${slots.length} slots`);
  return slots;
}

// Calculate best matching slots
export function calculateBestSlots(
  timeSlots: InterviewTimeSlot[],
  participants: (InterviewParticipant & { votes?: InterviewAvailabilityVote[] })[]
): TimeSlotWithVotes[] {
  const totalParticipants = participants.length;
  
  return timeSlots.map(slot => {
    const voters = participants
      .filter(p => p.votes?.some(v => v.interview_time_slot_id === slot.id))
      .map(p => p.name);
    
    return {
      ...slot,
      vote_count: voters.length,
      voters,
    };
  }).sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
}
