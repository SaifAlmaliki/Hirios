import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobInvitation {
  id: string;
  job_id: string;
  invited_email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface JobCollaborator {
  id: string;
  job_id: string;
  user_id: string;
  invited_by: string;
  role: 'collaborator' | 'owner';
  created_at: string;
  updated_at: string;
  company_profiles?: {
    company_name: string;
  };
}

export const useJobInvitations = (jobId: string) => {
  return useQuery({
    queryKey: ['job-invitations', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_invitations')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as JobInvitation[];
    },
    enabled: !!jobId,
  });
};

export const useJobCollaborators = (jobId: string) => {
  return useQuery({
    queryKey: ['job-collaborators', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_collaborators')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get company details for each collaborator
      const collaboratorsWithDetails = await Promise.all(
        data.map(async (collaborator) => {
          const { data: companyData } = await supabase
            .from('company_profiles')
            .select('company_name')
            .eq('user_id', collaborator.user_id)
            .single();

          return {
            ...collaborator,
            company_profiles: companyData || { company_name: 'Unknown Company' }
          };
        })
      );

      return collaboratorsWithDetails as JobCollaborator[];
    },
    enabled: !!jobId,
  });
};

export const useInviteCollaborator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ jobId, email }: { jobId: string; email: string }) => {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('You must be logged in to invite collaborators');
      }

      // Check if user has permission to invite to this job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          company_profiles!inner (
            user_id
          )
        `)
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        throw new Error('Job not found');
      }

      if (job.company_profiles.user_id !== user.id) {
        throw new Error('You do not have permission to invite collaborators to this job');
      }

      // Check if invitation already exists
      const { data: existingInvitation } = await supabase
        .from('job_invitations')
        .select('id')
        .eq('job_id', jobId)
        .eq('invited_email', email)
        .eq('status', 'pending')
        .single();

      if (existingInvitation) {
        throw new Error('An invitation has already been sent to this email address');
      }

      // Check if user is already a collaborator
      const { data: existingCollaborator } = await supabase
        .from('job_collaborators')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', user.id)
        .single();

      if (existingCollaborator) {
        throw new Error('This user is already a collaborator on this job');
      }

      // Create invitation
      console.log('📝 Creating invitation with data:', {
        job_id: jobId,
        invited_email: email,
        invited_by: user.id,
      });

      const { data, error } = await supabase
        .from('job_invitations')
        .insert([{
          job_id: jobId,
          invited_email: email,
          invited_by: user.id,
        }])
        .select()
        .single();

      console.log('📊 Invitation creation result:', { data, error });

      if (error) {
        console.error('❌ Error creating invitation:', error);
        throw error;
      }

      // Send invitation email
      await sendInvitationEmail(data as JobInvitation);

      return data as JobInvitation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['job-invitations', data.job_id] });
      toast({
        title: "Invitation Sent! 📧",
        description: `Invitation sent to ${data.invited_email}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ jobId, userId }: { jobId: string; userId: string }) => {
      const { error } = await supabase
        .from('job_collaborators')
        .delete()
        .eq('job_id', jobId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['job-collaborators', jobId] });
      toast({
        title: "Collaborator Removed",
        description: "The collaborator has been removed from this job",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Remove Collaborator",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCancelInvitation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('job_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: (_, invitationId) => {
      queryClient.invalidateQueries({ queryKey: ['job-invitations'] });
      toast({
        title: "Invitation Cancelled",
        description: "The invitation has been cancelled",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Cancel Invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Helper function to send invitation email
const sendInvitationEmail = async (invitation: JobInvitation) => {
  try {
    // Get job details for the email
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        title,
        company,
        company_profile_id,
        company_profiles!inner (
          id,
          company_name
        )
      `)
      .eq('id', invitation.job_id)
      .single();

    if (jobError || !job) {
      console.error('Error fetching job details for email:', jobError);
      return;
    }

    // Get inviter details
    const { data: inviter, error: inviterError } = await supabase
      .from('company_profiles')
      .select('company_name')
      .eq('user_id', invitation.invited_by)
      .single();

    if (inviterError || !inviter) {
      console.error('Error fetching inviter details for email:', inviterError);
      return;
    }

    // Create invitation link
    const invitationLink = `${window.location.origin}/invite/${invitation.token}`;

    // Send email using Supabase Edge Function with SMTP
    console.log('🚀 Attempting to call Edge Function...');
    try {
      const emailResponse = await supabase.functions.invoke('send-invitation-email', {
        body: {
          to: invitation.invited_email,
          jobTitle: job.title,
          companyName: job.company_profiles.company_name,
          inviterCompany: inviter.company_name,
          invitationLink,
          expiresAt: invitation.expires_at,
          companyId: job.company_profile_id, // Add company ID for SMTP config
        },
      });

      console.log('📊 Edge Function Response:', emailResponse);

      if (emailResponse.error) {
        console.warn('⚠️ Failed to send email, but invitation was created:', emailResponse.error);
      } else {
        console.log('✅ Invitation email sent successfully');
      }
    } catch (emailError) {
      console.error('💥 Error calling Edge Function:', emailError);
      console.warn('⚠️ Email service unavailable, but invitation was created:', emailError);
    }

    // Log invitation details for debugging
    console.log('📧 Invitation Email Details:', {
      to: invitation.invited_email,
      jobTitle: job.title,
      companyName: job.company_profiles.company_name,
      inviterCompany: inviter.company_name,
      invitationLink,
      expiresAt: invitation.expires_at,
    });
  } catch (error) {
    console.error('Unexpected error sending invitation email:', error);
  }
};
