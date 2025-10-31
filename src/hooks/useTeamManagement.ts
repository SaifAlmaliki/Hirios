import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { TeamInvitation, TeamMember } from "@/integrations/supabase/types/team";

export const useTeamManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current user's company membership with profile
  const { data: currentMembership, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["currentCompanyMembership", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Use .limit(1) instead of .maybeSingle() to handle potential duplicates gracefully
      const { data: memberships, error } = await supabase
        .from("company_members")
        .select("company_profile_id, role, company_profiles(*)")
        .eq("user_id", user.id)
        .limit(1);

      if (error) throw error;
      
      if (!memberships || memberships.length === 0 || !memberships[0].company_profiles) {
        return null;
      }
      
      // If there are duplicates, warn but use the first one
      if (memberships.length > 1) {
        console.warn("[useTeamManagement] Multiple company memberships found, using first one");
      }
      
      const membership = memberships[0];
      return {
        ...membership.company_profiles,
        role: membership.role,
        user_id: user.id, // Add user_id for comparison purposes
      };
    },
    enabled: !!user?.id,
    retry: 1,
  });
  
  const currentProfile = currentMembership;

  // Get all team members for the company
  const { data: teamMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["teamMembers", currentProfile?.id],
    queryFn: async () => {
      if (!currentProfile?.id) return [];

      // Get all company members for this company profile
      const { data: members, error: membersError } = await supabase
        .from("company_members")
        .select("user_id, role, created_at")
        .eq("company_profile_id", currentProfile.id);

      if (membersError) throw membersError;
      if (!members) return [];

      // Get user emails - we'll need to fetch from auth or use admin API
      // For now, we'll try to get emails from company_profiles.email if available
      // or fetch user data if RLS allows
      const memberIds = members.map(m => m.user_id);
      
      // Map members to team member format
      // Get company profile email for owner, and try to get emails for other members
      const membersWithEmails: TeamMember[] = await Promise.all(
        members.map(async (member) => {
          let email = "Unknown";
          
          // For owner, use the company profile email (which is the owner's email)
          if (member.role === "owner") {
            email = currentProfile.email || "Unknown";
          } else {
            // For other members, try to get email from auth.users via RPC
            // Or check if there's a way to get it from the invitation
            // For now, we'll try to use a database function or RPC call
            try {
              // Try to get email via RPC function if available
              // If not available, we could also check team_invitations for the invited_email
              const { data: invitationData } = await supabase
                .from("team_invitations")
                .select("invited_email")
                .eq("company_profile_id", currentProfile.id)
                .eq("used", true)
                .limit(1);
              
              // This is a fallback - if member signed up via invitation, we might not have their email easily
              // For members, we could enhance this by storing email in company_members or using a helper function
              if (invitationData && invitationData.length > 0) {
                email = invitationData[0].invited_email;
              }
            } catch (err) {
              // If we can't get the email, keep as "Unknown"
              console.warn(`Could not get email for member ${member.user_id}:`, err);
            }
          }
          
          return {
            id: member.user_id,
            user_id: member.user_id,
            company_name: currentProfile.company_name || "",
            company_profile_id: currentProfile.id,
            role: member.role as 'owner' | 'member',
            created_at: member.created_at,
            email: email,
          };
        })
      );

      return membersWithEmails;
    },
    enabled: !!currentProfile?.id,
  });

  // Get pending invitations - ONLY for owners
  const { data: pendingInvitations, isLoading: isLoadingInvitations } = useQuery({
    queryKey: ["pendingInvitations", currentProfile?.id],
    queryFn: async () => {
      // Double-check we have profile and user is owner
      if (!currentProfile?.id || currentProfile?.role !== "owner") {
        return [];
      }

      const { data, error } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("company_profile_id", currentProfile.id)
        .eq("used", false)
        .order("created_at", { ascending: false });

      if (error) {
        // Don't throw - return empty array on error to prevent blocking
        return [];
      }
      
      return (data || []) as TeamInvitation[];
    },
    // Only enable query when: profile loaded, profile has id, and user is owner
    enabled: !isLoadingProfile && !!currentProfile?.id && currentProfile?.role === "owner",
    retry: 1,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async (invitedEmail: string) => {
      if (!currentProfile?.id || !user?.email) {
        throw new Error("Missing required data");
      }

      // Check if SMTP is configured before attempting to send invitation
      if (!currentProfile.smtp_host || !currentProfile.smtp_user || !currentProfile.smtp_password) {
        throw new Error("SMTP not configured. Please configure email settings in Company Setup before sending invitations.");
      }

      // Get inviter name from current user
      const { data: userData } = await supabase.auth.getUser();
      const inviterName = userData.user?.user_metadata?.full_name || userData.user?.email || "Team Admin";

      try {
        const response = await supabase.functions.invoke("send-team-invitation", {
          body: {
            invitedEmail,
            companyProfileId: currentProfile.id,
            inviterName,
            companyName: currentProfile.company_name || "Your Company",
          },
        });

        // Handle errors from edge function
        if (response.error) {
          // Edge functions may return error with message in data or error object
          const errorMessage = response.data?.message || 
                               response.error.message || 
                               "Failed to send invitation";
          throw new Error(errorMessage);
        }
        
        // Check if response data indicates failure (even with 200 status)
        if (response.data && response.data.success === false) {
          throw new Error(response.data.message || "Failed to send invitation");
        }
        
        return response.data;
      } catch (error: any) {
        // Handle any unexpected errors
        if (error instanceof Error) {
          throw error;
        }
        // If it's a Supabase error, try to extract message
        const errorMessage = error?.message || 
                            error?.data?.message || 
                            "Failed to send invitation. Please check your email configuration in Company Setup.";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["pendingInvitations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });

  // Remove team member mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentProfile?.id) {
        throw new Error("Missing company profile");
      }

      // Delete the company membership for this user
      const { error } = await supabase
        .from("company_members")
        .delete()
        .eq("user_id", userId)
        .eq("company_profile_id", currentProfile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Team member removed successfully");
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove team member");
    },
  });

  // Delete invitation mutation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("team_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation deleted");
      queryClient.invalidateQueries({ queryKey: ["pendingInvitations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete invitation");
    },
  });

  const isOwner = currentProfile?.role === "owner";

  return {
    currentProfile,
    teamMembers,
    pendingInvitations,
    isLoading: isLoadingProfile || isLoadingMembers || isLoadingInvitations,
    isOwner,
    sendInvitation: sendInvitationMutation.mutate,
    removeTeamMember: removeTeamMemberMutation.mutate,
    deleteInvitation: deleteInvitationMutation.mutate,
    isSendingInvitation: sendInvitationMutation.isPending,
    isRemovingMember: removeTeamMemberMutation.isPending,
    isDeletingInvitation: deleteInvitationMutation.isPending,
  };
};
