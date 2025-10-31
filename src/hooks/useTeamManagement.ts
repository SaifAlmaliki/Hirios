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
      if (!memberships || memberships.length === 0 || !memberships[0].company_profiles) return null;
      
      // If there are duplicates, warn but use the first one
      if (memberships.length > 1) {
        console.warn("Multiple company memberships found, using first one");
      }
      
      const membership = memberships[0];
      return {
        ...membership.company_profiles,
        role: membership.role,
        user_id: user.id, // Add user_id for comparison purposes
      };
    },
    enabled: !!user?.id,
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
      // Note: Email fetching from auth.users may require admin privileges
      // We'll set email as optional/unknown for now and can enhance later
      const membersWithEmails: TeamMember[] = await Promise.all(
        members.map(async (member) => {
          // Try to get email from a user lookup if possible
          // This is a simplified version - you may need to enhance based on your auth setup
          let email = "Unknown";
          
          // If we can access user metadata or have email stored elsewhere, use that
          // For now, we'll return with "Unknown" and can enhance this later
          
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

      console.log("[useTeamManagement] Fetching invitations for company:", currentProfile.id);

      const { data, error } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("company_profile_id", currentProfile.id)
        .eq("used", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[useTeamManagement] Error fetching invitations:", error);
        console.error("[useTeamManagement] Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        // Don't throw - return empty array on error to prevent blocking
        return [];
      }
      
      console.log("[useTeamManagement] Successfully fetched invitations:", data?.length || 0);
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

      // Get inviter name from current user
      const { data: userData } = await supabase.auth.getUser();
      const inviterName = userData.user?.user_metadata?.full_name || userData.user?.email || "Team Admin";

      const response = await supabase.functions.invoke("send-team-invitation", {
        body: {
          invitedEmail,
          companyProfileId: currentProfile.id,
          inviterName,
          companyName: currentProfile.company_name,
        },
      });

      if (response.error) throw response.error;
      return response.data;
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

  return {
    currentProfile,
    teamMembers,
    pendingInvitations,
    isLoading: isLoadingProfile || isLoadingMembers || isLoadingInvitations,
    isOwner: currentProfile?.role === "owner",
    sendInvitation: sendInvitationMutation.mutate,
    removeTeamMember: removeTeamMemberMutation.mutate,
    deleteInvitation: deleteInvitationMutation.mutate,
    isSendingInvitation: sendInvitationMutation.isPending,
    isRemovingMember: removeTeamMemberMutation.isPending,
    isDeletingInvitation: deleteInvitationMutation.isPending,
  };
};
